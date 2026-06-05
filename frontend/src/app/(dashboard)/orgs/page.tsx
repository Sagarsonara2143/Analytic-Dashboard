"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api-client";
import { useOrgStore } from "@/store/org-store";
import type { Organization } from "@/types";

export default function OrgsPage() {
  const router = useRouter();
  const setCurrentOrg = useOrgStore((s) => s.setCurrentOrg);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");

  const { data: orgs, isLoading } = useQuery<Organization[]>({
    queryKey: ["orgs"],
    queryFn: () => api.get("/api/v1/orgs").then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: (body: { name: string; slug: string }) =>
      api.post("/api/v1/orgs", body).then((r) => r.data as Organization),
    onSuccess: (org) => {
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
      setCurrentOrg(org);
      router.push(`/orgs/${org.id}/dashboards`);
    },
    onError: (e: any) => {
      setError(e?.response?.data?.detail ?? "Failed to create organization");
    },
  });

  const select = (org: Organization) => {
    setCurrentOrg(org);
    router.push(`/orgs/${org.id}/dashboards`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    create.mutate({ name, slug });
  };

  if (isLoading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Your Organizations</h1>
            <p className="text-muted-foreground">Manage and access your analytics platforms</p>
          </div>
          <button
            onClick={() => { setShowForm((v) => !v); setError(""); }}
            className="btn-primary"
          >
            + New Organization
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="card-elevated p-6 mb-8 max-w-md space-y-5"
          >
            <h2 className="text-lg font-semibold text-foreground">Create Organization</h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Organization Name</label>
              <input
                className="input-field"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                }}
                placeholder="Acme Corporation"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">URL Slug</label>
              <input
                className="input-field"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="acme-corp"
                required
              />
            </div>
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={create.isPending}
                className="btn-primary flex-1"
              >
                {create.isPending ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {orgs?.length === 0 && !showForm && (
          <div className="card-elevated p-12 text-center">
            <p className="text-muted-foreground mb-4">No organizations yet. Create one to get started.</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Create Your First Organization
            </button>
          </div>
        )}

        {orgs && orgs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orgs.map((org) => (
              <button
                key={org.id}
                onClick={() => select(org)}
                className="card-elevated p-6 text-left group hover:shadow-lg transition-all duration-200"
              >
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  </svg>
                </div>
                <p className="font-semibold text-lg text-foreground">{org.name}</p>
                <p className="text-muted-foreground text-sm mt-1">{org.slug}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
