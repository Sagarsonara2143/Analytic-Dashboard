"use client";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { LayoutDashboard, Bell, FileText, LogOut, Zap, Key, Database } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = (orgId: string) => [
  { href: `/orgs/${orgId}/dashboards`, label: "Dashboards", icon: LayoutDashboard },
  { href: `/orgs/${orgId}/sources`, label: "Data Sources", icon: Database },
  { href: `/orgs/${orgId}/alerts`, label: "Alerts", icon: Bell },
  { href: `/orgs/${orgId}/reports`, label: "Reports", icon: FileText },
  { href: `/orgs/${orgId}/api-keys`, label: "API Keys", icon: Key },
];

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams<{ orgId?: string }>();
  const orgId = params?.orgId ?? "";
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    document.cookie = 'auth=; path=/; max-age=0';
    document.cookie = 'refresh=; path=/; max-age=0';
    router.push("/login");
  };

  return (
    <aside className="w-56 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border flex items-center gap-3 group">
        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
          <Zap className="text-primary" size={20} strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <span className="font-bold text-base block">Analytics</span>
          <span className="text-xs text-muted-foreground">Dashboard</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {orgId && navItems(orgId).map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 w-full transition-all duration-200"
        >
          <LogOut size={18} strokeWidth={2} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
