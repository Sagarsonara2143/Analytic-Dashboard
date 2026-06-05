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

  if (isLoading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboards</h1>
            <p className="text-muted-foreground">Create and manage your analytics dashboards</p>
          </div>
          <Link
            href={`/orgs/${orgId}/dashboards/new`}
            className="btn-primary"
          >
            + New Dashboard
          </Link>
        </div>

        {dashboards && dashboards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboards.map((dash) => (
              <Link
                key={dash.id}
                href={`/orgs/${orgId}/dashboards/${dash.id}`}
                className="card-elevated p-6 group hover:shadow-lg transition-all duration-200"
              >
                <div className="mb-4">
                  <p className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                    {dash.name}
                  </p>
                  {dash.description && (
                    <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{dash.description}</p>
                  )}
                </div>
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {dash.widgets.length} widget{dash.widgets.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-primary font-medium text-xs">Open →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card-elevated p-12 text-center">
            <svg className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-muted-foreground mb-4">No dashboards yet. Create your first dashboard to get started.</p>
            <Link
              href={`/orgs/${orgId}/dashboards/new`}
              className="btn-primary inline-block"
            >
              Create Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
