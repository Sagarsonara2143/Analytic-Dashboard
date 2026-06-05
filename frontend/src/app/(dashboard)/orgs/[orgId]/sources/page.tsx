"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import api from "@/lib/api-client";

interface DataSource {
  id: string;
  name: string;
  source_type: "rest" | "webhook" | "csv";
  config: Record<string, unknown>;
  created_at: string;
}

const SOURCE_ICONS: Record<DataSource["source_type"], string> = {
  rest: "🔗",
  webhook: "🪝",
  csv: "📊"
};

export default function DataSourcesPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const qc = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    source_type: "rest" as DataSource["source_type"],
    description: ""
  });

  const { data: sources, isLoading } = useQuery<DataSource[]>({
    queryKey: ["sources", orgId],
    queryFn: () => api.get(`/api/v1/orgs/${orgId}/sources`).then(r => r.data),
  });

  const createSource = useMutation({
    mutationFn: (data: typeof formData) =>
      api.post(`/api/v1/orgs/${orgId}/sources`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sources", orgId] });
      setFormData({ name: "", source_type: "rest", description: "" });
    }
  });

  const deleteSource = useMutation({
    mutationFn: (sourceId: string) => api.delete(`/api/v1/orgs/${orgId}/sources/${sourceId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sources", orgId] })
  });

  if (isLoading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading data sources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Data Sources</h1>
          <p className="text-muted-foreground">Connect and manage your data sources</p>
        </div>

        <div className="card-elevated p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-5">Create New Data Source</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Source name"
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <select
              className="input-field"
              value={formData.source_type}
              onChange={(e) => setFormData({ ...formData, source_type: e.target.value as any })}
            >
              <option value="rest">REST API</option>
              <option value="webhook">Webhook</option>
              <option value="csv">CSV Upload</option>
            </select>
            <input
              type="text"
              placeholder="Description (optional)"
              className="input-field"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <button
              onClick={() => createSource.mutate(formData)}
              disabled={!formData.name.trim() || createSource.isPending}
              className="btn-primary"
            >
              <Plus size={18} className="mr-2" />
              Create
            </button>
          </div>
        </div>

        {sources && sources.length > 0 ? (
          <div className="space-y-3">
            {sources.map((source) => (
              <div
                key={source.id}
                className="card-elevated p-5 flex items-center justify-between group hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{SOURCE_ICONS[source.source_type]}</div>
                  <div>
                    <p className="font-semibold text-foreground">{source.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                        {source.source_type}
                      </span>
                      <p className="text-xs text-muted-foreground">ID: {source.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteSource.mutate(source.id)}
                  className="p-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all"
                  title="Delete source"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-elevated p-12 text-center">
            <p className="text-muted-foreground mb-4">No data sources created yet.</p>
            <p className="text-sm text-muted-foreground">Create a data source above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}