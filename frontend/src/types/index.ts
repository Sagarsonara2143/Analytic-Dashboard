export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export type Role = "owner" | "admin" | "analyst" | "viewer";

export interface OrgMember {
  id: string;
  user_id: string;
  role: Role;
  created_at: string;
}

export type WidgetType = "line" | "bar" | "pie" | "kpi" | "table";

export interface Widget {
  id: string;
  title: string;
  widget_type: WidgetType;
  query: Record<string, unknown>;
  config: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
}

export interface Dashboard {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  share_token: string | null;
  auto_refresh_seconds: number | null;
  layout: Record<string, unknown>;
  created_at: string;
  widgets: Widget[];
}

export type AlertStatus = "active" | "triggered" | "muted" | "resolved";

export interface Alert {
  id: string;
  name: string;
  query: Record<string, unknown>;
  threshold: { operator: string; value: number };
  channels: string[];
  status: AlertStatus;
  check_interval_minutes: number;
  created_at: string;
}

export type ReportFrequency = "daily" | "weekly" | "monthly";
export type ReportFormat = "pdf" | "png";
export type ReportStatus = "pending" | "running" | "done" | "failed";

export interface Report {
  id: string;
  name: string;
  dashboard_id: string;
  frequency: ReportFrequency;
  format: ReportFormat;
  recipients: string[];
  next_run_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string | null;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
