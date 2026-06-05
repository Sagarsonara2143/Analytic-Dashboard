"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Trash2, Plus, Copy, Check } from "lucide-react";
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading API keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">API Keys</h1>
          <p className="text-muted-foreground">Manage API keys for programmatic access</p>
        </div>

        <div className="card-elevated p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Create New API Key</h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter a name for this key"
              className="input-field flex-1"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
            <button
              onClick={() => createKey.mutate(newKeyName)}
              disabled={!newKeyName.trim() || createKey.isPending}
              className="btn-primary"
            >
              <Plus size={18} className="mr-2" />
              Create
            </button>
          </div>
        </div>

        {keys && keys.length > 0 ? (
          <div className="space-y-3">
            {keys.map((key) => (
              <div
                key={key.id}
                className="card-elevated p-5 flex items-center justify-between group hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{key.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="text-xs font-mono bg-secondary/50 px-2.5 py-1.5 rounded text-muted-foreground flex-1">
                      {key.key_preview}
                    </code>
                    <button
                      onClick={() => handleCopy(key.key_preview, key.id)}
                      className="p-1.5 rounded hover:bg-secondary transition-colors"
                      title="Copy key"
                    >
                      {copiedId === key.id ? (
                        <Check size={16} className="text-primary" />
                      ) : (
                        <Copy size={16} className="text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Created {new Date(key.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteKey.mutate(key.id)}
                  className="ml-4 p-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all"
                  title="Delete key"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-elevated p-12 text-center">
            <svg className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <p className="text-muted-foreground mb-4">No API keys created yet.</p>
            <p className="text-sm text-muted-foreground">Create your first API key above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}