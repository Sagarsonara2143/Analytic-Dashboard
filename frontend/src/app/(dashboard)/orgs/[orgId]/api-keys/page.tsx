"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import api from "@/lib/api-client";

interface ApiKey {
  id: string;
  name: string;
  key_preview: string;
  created_at: string;
}

export default function ApiKeysPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const qc = useQueryClient();
  const [newKeyName, setNewKeyName] = useState("");

  const { data: keys, isLoading } = useQuery<ApiKey[]>({
    queryKey: ["api-keys", orgId],
    queryFn: () => api.get(`/api/v1/orgs/${orgId}/api-keys`).then(r => r.data),
  });

  const createKey = useMutation({
    mutationFn: (name: string) => 
      api.post(`/api/v1/orgs/${orgId}/api-keys`, { name }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["api-keys", orgId] });
      setNewKeyName("");
    }
  });

  const deleteKey = useMutation({
    mutationFn: (keyId: string) => api.delete(`/api/v1/orgs/${orgId}/api-keys/${keyId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-keys", orgId] })
  });

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">API Keys</h1>
      
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">Create New API Key</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Key name"
            className="flex-1 border rounded px-3 py-2"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
          />
          <button
            onClick={() => createKey.mutate(newKeyName)}
            disabled={!newKeyName.trim() || createKey.isPending}
            className="bg-primary text-primary-foreground px-4 py-2 rounded font-medium disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {keys?.map((key) => (
          <div key={key.id} className="bg-card border rounded p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{key.name}</p>
              <p className="text-sm font-mono text-muted-foreground">{key.key_preview}</p>
              <p className="text-xs text-muted-foreground">Created {new Date(key.created_at).toLocaleDateString()}</p>
            </div>
            <button
              onClick={() => deleteKey.mutate(key.id)}
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