"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import api from "@/lib/api-client";
import type { Report } from "@/types";

export default function ReportsPage() {
  const { orgId } = useParams<{ orgId: string }>();

  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ["reports", orgId],
    queryFn: () => api.get(`/api/v1/orgs/${orgId}/reports`).then((r) => r.data),
  });

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Scheduled Reports</h1>
      <div className="space-y-3">
        {reports?.map((report) => (
          <div key={report.id} className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{report.name}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {report.frequency} · {report.format.toUpperCase()} · {report.recipients.length} recipients
                </p>
                {report.next_run_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Next run: {new Date(report.next_run_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        {reports?.length === 0 && <p className="text-muted-foreground">No reports scheduled.</p>}
      </div>
    </div>
  );
}
