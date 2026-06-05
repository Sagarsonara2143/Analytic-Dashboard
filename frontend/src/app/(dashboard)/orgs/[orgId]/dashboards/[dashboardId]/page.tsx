"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import api from "@/lib/api-client";
import { useOrgWebSocket } from "@/lib/use-websocket";
import { WidgetCard } from "@/components/dashboard/widget-card";
import type { Dashboard, WidgetType } from "@/types";

const WIDGET_TYPES: WidgetType[] = ["line", "bar", "pie", "kpi", "table"];

const SAMPLE_DATA: Record<WidgetType, object> = {
  line: {
    data: [
      { name: "Mon", value: 30 }, { name: "Tue", value: 55 },
      { name: "Wed", value: 40 }, { name: "Thu", value: 80 }, { name: "Fri", value: 60 },
    ],
    xKey: "name", yKey: "value",
  },
  bar: {
    data: [
      { name: "Jan", value: 120 }, { name: "Feb", value: 98 },
      { name: "Mar", value: 150 }, { name: "Apr", value: 200 },
    ],
    xKey: "name", yKey: "value",
  },
  pie: {
    data: [
      { name: "Chrome", value: 60 }, { name: "Firefox", value: 25 }, { name: "Safari", value: 15 },
    ],
    xKey: "name", yKey: "value",
  },
  kpi: { data: [{ value: 4821 }], yKey: "value" },
  table: {
    data: [
      { metric: "page_views", count: 1024, delta: "+12%" },
      { metric: "sessions", count: 380, delta: "+5%" },
      { metric: "bounces", count: 95, delta: "-3%" },
    ],
  },
};

const DEFAULT_FORM = {
  title: "",
  widget_type: "line" as WidgetType,
  useSample: true,
  customData: "",
};

export default function DashboardPage() {
  const { orgId, dashboardId } = useParams<{ orgId: string; dashboardId: string }>();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [formError, setFormError] = useState("");

  const { data: dashboard, refetch } = useQuery<Dashboard>({
    queryKey: ["dashboard", dashboardId],
    queryFn: () => api.get(`/api/v1/orgs/${orgId}/dashboards/${dashboardId}`).then((r) => r.data),
  });

  useEffect(() => {
    if (!dashboard?.auto_refresh_seconds) return;
    const id = setInterval(refetch, dashboard.auto_refresh_seconds * 1000);
    return () => clearInterval(id);
  }, [dashboard?.auto_refresh_seconds, refetch]);

  useOrgWebSocket(orgId, (msg) => {
    if ((msg as { type?: string }).type === "dashboard_update") refetch();
  });

  const addWidget = useMutation({
    mutationFn: (body: object) =>
      api.post(`/api/v1/orgs/${orgId}/dashboards/${dashboardId}/widgets`, body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard", dashboardId] });
      setShowForm(false);
      setForm(DEFAULT_FORM);
      setFormError("");
    },
    onError: (e: any) => setFormError(e?.response?.data?.detail ?? "Failed to add widget"),
  });

  const deleteWidget = useMutation({
    mutationFn: (widgetId: string) =>
      api.delete(`/api/v1/orgs/${orgId}/dashboards/${dashboardId}/widgets/${widgetId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard", dashboardId] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setFormError("");

    let config: object;
    if (form.useSample) {
      config = SAMPLE_DATA[form.widget_type];
    } else {
      try {
        config = JSON.parse(form.customData);
      } catch {
        setFormError("Invalid JSON in config");
        return;
      }
    }

    addWidget.mutate({
      title: form.title,
      widget_type: form.widget_type,
      query: {},
      config,
      position: { x: 0, y: 0, w: 1, h: 1 },
    });
  };

  if (!dashboard) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{dashboard.name}</h1>
            {dashboard.description && (
              <p className="text-muted-foreground">{dashboard.description}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {dashboard.auto_refresh_seconds && (
              <div className="px-3 py-2 rounded-lg bg-secondary/30 border border-border">
                <span className="text-xs font-medium text-muted-foreground">
                  🔄 Refreshing every {dashboard.auto_refresh_seconds}s
                </span>
              </div>
            )}
            <button
              onClick={() => { setShowForm((v) => !v); setFormError(""); }}
              className={showForm ? "btn-secondary" : "btn-primary"}
            >
              <Plus size={18} className="mr-2" />
              {showForm ? "Cancel" : "Add Widget"}
            </button>
          </div>
        </div>

        {/* Add Widget Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="card-elevated p-6 mb-8 max-w-2xl space-y-6"
          >
            <h2 className="text-lg font-semibold text-foreground">Create New Widget</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Widget Title *</label>
                <input
                  required
                  className="input-field"
                  placeholder="e.g. Weekly Page Views"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Widget Type *</label>
                <select
                  className="input-field"
                  value={form.widget_type}
                  onChange={(e) => setForm({ ...form, widget_type: e.target.value as WidgetType })}
                >
                  {WIDGET_TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Data Source</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={form.useSample}
                    onChange={() => setForm({ ...form, useSample: true })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Use Sample Data</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!form.useSample}
                    onChange={() => setForm({ ...form, useSample: false, customData: JSON.stringify(SAMPLE_DATA[form.widget_type], null, 2) })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Custom JSON</span>
                </label>
              </div>
              {!form.useSample && (
                <textarea
                  rows={8}
                  className="input-field mt-3 font-mono text-xs"
                  value={form.customData}
                  onChange={(e) => setForm({ ...form, customData: e.target.value })}
                  placeholder='{"data": [...]}'
                />
              )}
              {form.useSample && (
                <pre className="text-xs text-muted-foreground bg-secondary/30 rounded-lg p-3 overflow-x-auto border border-border mt-3">
                  {JSON.stringify(SAMPLE_DATA[form.widget_type], null, 2)}
                </pre>
              )}
            </div>

            {formError && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-destructive text-sm">{formError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={addWidget.isPending}
              className="btn-primary"
            >
              {addWidget.isPending ? "Adding..." : "Create Widget"}
            </button>
          </form>
        )}

        {/* Widget Grid */}
        {dashboard.widgets.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {dashboard.widgets.map((widget) => (
              <div key={widget.id} className="relative group">
                <WidgetCard widget={widget} />
                <button
                  onClick={() => deleteWidget.mutate(widget.id)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 text-destructive"
                  title="Delete widget"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : !showForm && (
          <div className="card-elevated p-12 text-center">
            <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0V7a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-muted-foreground mb-4">No widgets added yet. Create your first widget to visualize data.</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-block"
            >
              Add Your First Widget
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
