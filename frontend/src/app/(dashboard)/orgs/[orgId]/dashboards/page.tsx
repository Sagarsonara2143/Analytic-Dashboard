"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api-client";
import type { Dashboard } from "@/types";

export default function DashboardsPage() {
  const { orgId } = useParams<{ orgId: string }>();

  const { data: dashboards, isLoading } = useQuery<Dashboard[]>({
    queryKey: ["dashboards", orgId],
    queryFn: () => api.get(`/api/v1/orgs/${orgId}/dashboards`).then((r) => r.data),
  });

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboards</h1>
        <Link
          href={`/orgs/${orgId}/dashboards/new`}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
        >
          + New Dashboard
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboards?.map((dash) => (
          <Link
            key={dash.id}
            href={`/orgs/${orgId}/dashboards/${dash.id}`}
            className="bg-card border rounded-lg p-6 hover:border-primary transition-colors"
          >
            <p className="font-semibold">{dash.name}</p>
            {dash.description && <p className="text-muted-foreground text-sm mt-1">{dash.description}</p>}
            <p className="text-xs text-muted-foreground mt-3">{dash.widgets.length} widgets</p>
          </Link>
        ))}
        {dashboards?.length === 0 && (
          <p className="text-muted-foreground col-span-3">No dashboards yet. Create one!</p>
        )}
      </div>
    </div>
  );
}
