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

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-muted p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Organizations</h1>
        <button
          onClick={() => { setShowForm((v) => !v); setError(""); }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
        >
          + New Organization
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-card border rounded-lg p-6 mb-6 max-w-md space-y-4"
        >
          <h2 className="font-semibold">Create Organization</h2>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Name</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
              }}
              placeholder="Acme Corp"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Slug</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="acme-corp"
              required
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={create.isPending}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {create.isPending ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-md text-sm border hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {orgs?.length === 0 && !showForm && (
        <p className="text-muted-foreground text-sm">
          No organizations yet. Create one to get started.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {orgs?.map((org) => (
          <button
            key={org.id}
            onClick={() => select(org)}
            className="bg-card border rounded-lg p-6 text-left hover:border-primary transition-colors"
          >
            <p className="font-semibold text-lg">{org.name}</p>
            <p className="text-muted-foreground text-sm mt-1">{org.slug}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
