"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import api from "@/lib/api-client";

interface DataSource {
  id: string;
  name: string;
  source_type: "rest" | "webhook" | "csv";
  config: Record<string, unknown>;
  created_at: string;
}

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

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Data Sources</h1>
      
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-4">Add Data Source</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Source name"
            className="border rounded px-3 py-2"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <select
            className="border rounded px-3 py-2"
            value={formData.source_type}
            onChange={(e) => setFormData({ ...formData, source_type: e.target.value as any })}
          >
            <option value="rest">REST API</option>
            <option value="webhook">Webhook</option>
            <option value="csv">CSV Upload</option>
          </select>
          <button
            onClick={() => createSource.mutate(formData)}
            disabled={!formData.name.trim() || createSource.isPending}
            className="bg-primary text-primary-foreground px-4 py-2 rounded font-medium disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sources?.map((source) => (
          <div key={source.id} className="bg-card border rounded p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{source.name}</p>
              <p className="text-sm text-muted-foreground capitalize">{source.source_type}</p>
              <p className="text-xs text-muted-foreground">ID: {source.id}</p>
            </div>
            <button
              onClick={() => deleteSource.mutate(source.id)}
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground px-3 py-1 rounded text-sm border"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}