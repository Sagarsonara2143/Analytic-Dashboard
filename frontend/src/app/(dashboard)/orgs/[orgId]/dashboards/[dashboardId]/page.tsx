"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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

  if (!dashboard) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{dashboard.name}</h1>
          {dashboard.description && (
            <p className="text-muted-foreground text-sm mt-1">{dashboard.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {dashboard.auto_refresh_seconds && (
            <span className="text-xs text-muted-foreground">
              Auto-refreshing every {dashboard.auto_refresh_seconds}s
            </span>
          )}
          <button
            onClick={() => { setShowForm((v) => !v); setFormError(""); }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
          >
            {showForm ? "Cancel" : "+ Add Widget"}
          </button>
        </div>
      </div>

      {/* Add Widget Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-card border rounded-lg p-6 mb-6 max-w-lg space-y-4"
        >
          <h2 className="font-semibold text-sm">New Widget</h2>

          <div className="space-y-1">
            <label className="text-sm font-medium">Title</label>
            <input
              required
              className="w-full border rounded px-3 py-2 text-sm bg-background"
              placeholder="e.g. Weekly Page Views"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Widget Type</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm bg-background"
              value={form.widget_type}
              onChange={(e) => setForm({ ...form, widget_type: e.target.value as WidgetType })}
            >
              {WIDGET_TYPES.map((t) => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data</label>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  checked={form.useSample}
                  onChange={() => setForm({ ...form, useSample: true })}
                />
                Use sample data
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  checked={!form.useSample}
                  onChange={() => setForm({ ...form, useSample: false, customData: JSON.stringify(SAMPLE_DATA[form.widget_type], null, 2) })}
                />
                Custom JSON
              </label>
            </div>
            {!form.useSample && (
              <textarea
                rows={6}
                className="w-full border rounded px-3 py-2 text-xs font-mono bg-background"
                value={form.customData}
                onChange={(e) => setForm({ ...form, customData: e.target.value })}
              />
            )}
            {form.useSample && (
              <pre className="text-xs text-muted-foreground bg-muted rounded p-2 overflow-x-auto">
                {JSON.stringify(SAMPLE_DATA[form.widget_type], null, 2)}
              </pre>
            )}
          </div>

          {formError && <p className="text-destructive text-sm">{formError}</p>}

          <button
            type="submit"
            disabled={addWidget.isPending}
            className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {addWidget.isPending ? "Adding..." : "Add Widget"}
          </button>
        </form>
      )}

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {dashboard.widgets.map((widget) => (
          <div key={widget.id} className="relative group">
            <WidgetCard widget={widget} />
            <button
              onClick={() => deleteWidget.mutate(widget.id)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs border border-destructive text-destructive rounded px-2 py-0.5 bg-card hover:bg-destructive hover:text-destructive-foreground"
            >
              ✕
            </button>
          </div>
        ))}
        {dashboard.widgets.length === 0 && !showForm && (
          <p className="text-muted-foreground col-span-3">No widgets yet. Add one to get started.</p>
        )}
      </div>
    </div>
  );
}
