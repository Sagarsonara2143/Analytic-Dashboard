"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { FileText, Calendar, Mail } from "lucide-react";
import api from "@/lib/api-client";
import type { Report } from "@/types";

export default function ReportsPage() {
  const { orgId } = useParams<{ orgId: string }>();

  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ["reports", orgId],
    queryFn: () => api.get(`/api/v1/orgs/${orgId}/reports`).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Scheduled Reports</h1>
          <p className="text-muted-foreground">View and manage your automated reports</p>
        </div>

        {reports && reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="card-elevated p-6 group hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors flex-shrink-0">
                    <FileText className="text-primary" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg text-foreground">{report.name}</p>
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={16} />
                        <span className="capitalize">{report.frequency}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText size={16} />
                        <span className="font-medium">{report.format.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail size={16} />
                        <span>{report.recipients.length} recipient{report.recipients.length !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    {report.next_run_at && (
                      <p className="text-xs text-muted-foreground mt-3 bg-secondary/30 px-3 py-1.5 rounded w-fit">
                        Next run: {new Date(report.next_run_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-elevated p-12 text-center">
            <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-muted-foreground">No reports scheduled yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
