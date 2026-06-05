"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Bell, Trash2, Plus, Volume2 } from "lucide-react";
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

  const statusConfig: Record<string, { badge: string; icon: string }> = {
    active: { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200", icon: "🟢" },
    triggered: { badge: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200", icon: "🔴" },
    muted: { badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200", icon: "🔕" },
    resolved: { badge: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200", icon: "✓" },
  };

  if (isLoading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Alerts</h1>
            <p className="text-muted-foreground">Monitor and manage your alerts</p>
          </div>
          <Link
            href={`/orgs/${orgId}/alerts/new`}
            className="btn-primary"
          >
            <Plus size={18} className="mr-2" />
            New Alert
          </Link>
        </div>

        {alerts && alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const config = statusConfig[alert.status] || statusConfig.resolved;
              return (
                <div
                  key={alert.id}
                  className="card-elevated p-5 flex items-start justify-between group hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <Bell className="text-muted-foreground mt-1 flex-shrink-0" size={20} />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{alert.name}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${config.badge}`}>
                          {config.icon} {alert.status}
                        </span>
                        <span className="text-xs text-muted-foreground bg-secondary/30 px-2 py-1 rounded">
                          Every {alert.check_interval_minutes} min
                        </span>
                        {alert.channels && alert.channels.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {alert.channels.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => mute.mutate({ alertId: alert.id, minutes: 60 })}
                      className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                      title="Mute for 1 hour"
                    >
                      <Volume2 size={16} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => del.mutate(alert.id)}
                      className="p-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all"
                      title="Delete alert"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card-elevated p-12 text-center">
            <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-muted-foreground mb-4">No alerts configured yet.</p>
            <Link
              href={`/orgs/${orgId}/alerts/new`}
              className="btn-primary inline-block"
            >
              Create Your First Alert
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
