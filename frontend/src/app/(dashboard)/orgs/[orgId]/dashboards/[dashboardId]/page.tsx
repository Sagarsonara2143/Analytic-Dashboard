"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import api from "@/lib/api-client";
import { useOrgWebSocket } from "@/lib/use-websocket";
import { WidgetCard } from "@/components/dashboard/widget-card";
import type { Dashboard } from "@/types";

export default function DashboardPage() {
  const { orgId, dashboardId } = useParams<{ orgId: string; dashboardId: string }>();

  const { data: dashboard, refetch } = useQuery<Dashboard>({
    queryKey: ["dashboard", dashboardId],
    queryFn: () => api.get(`/api/v1/orgs/${orgId}/dashboards/${dashboardId}`).then((r) => r.data),
  });

  // Auto-refresh
  useEffect(() => {
    if (!dashboard?.auto_refresh_seconds) return;
    const id = setInterval(refetch, dashboard.auto_refresh_seconds * 1000);
    return () => clearInterval(id);
  }, [dashboard?.auto_refresh_seconds, refetch]);

  // Real-time WebSocket updates
  useOrgWebSocket(orgId, (msg) => {
    if ((msg as { type?: string }).type === "dashboard_update") refetch();
  });

  if (!dashboard) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{dashboard.name}</h1>
          {dashboard.description && (
            <p className="text-muted-foreground text-sm mt-1">{dashboard.description}</p>
          )}
        </div>
        {dashboard.auto_refresh_seconds && (
          <span className="text-xs text-muted-foreground">
            Auto-refreshing every {dashboard.auto_refresh_seconds}s
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {dashboard.widgets.map((widget) => (
          <WidgetCard key={widget.id} widget={widget} />
        ))}
        {dashboard.widgets.length === 0 && (
          <p className="text-muted-foreground">No widgets yet. Add one to get started.</p>
        )}
      </div>
    </div>
  );
}
