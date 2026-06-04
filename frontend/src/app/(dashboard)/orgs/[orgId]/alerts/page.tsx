"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api-client";
import type { Alert } from "@/types";

export default function AlertsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const qc = useQueryClient();

  const { data: alerts, isLoading } = useQuery<Alert[]>({
    queryKey: ["alerts", orgId],
    queryFn: () => api.get(`/api/v1/orgs/${orgId}/alerts`).then((r) => r.data),
  });

  const mute = useMutation({
    mutationFn: ({ alertId, minutes }: { alertId: string; minutes: number }) =>
      api.post(`/api/v1/orgs/${orgId}/alerts/${alertId}/mute`, { minutes }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts", orgId] }),
  });

  const del = useMutation({
    mutationFn: (alertId: string) => api.delete(`/api/v1/orgs/${orgId}/alerts/${alertId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts", orgId] }),
  });

  const statusColor: Record<string, string> = {
    active: "text-green-600", triggered: "text-red-600",
    muted: "text-yellow-600", resolved: "text-muted-foreground",
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Alerts</h1>
        <Link
          href={`/orgs/${orgId}/alerts/new`}
          className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90"
        >
          + New Alert
        </Link>
      </div>
      <div className="space-y-3">
        {alerts?.map((alert) => (
          <div key={alert.id} className="bg-card border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{alert.name}</p>
              <p className={`text-sm ${statusColor[alert.status]}`}>{alert.status}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Every {alert.check_interval_minutes}m · {alert.channels.join(", ")}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => mute.mutate({ alertId: alert.id, minutes: 60 })}
                className="text-xs border rounded px-2 py-1 hover:bg-muted"
              >
                Mute 1h
              </button>
              <button
                onClick={() => del.mutate(alert.id)}
                className="text-xs border border-destructive text-destructive rounded px-2 py-1 hover:bg-destructive hover:text-destructive-foreground"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {alerts?.length === 0 && <p className="text-muted-foreground">No alerts configured.</p>}
      </div>
    </div>
  );
}
