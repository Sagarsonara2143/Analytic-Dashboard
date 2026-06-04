"use client";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { LayoutDashboard, Bell, FileText, LogOut, Zap, Key, Database } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
    router.push("/login");
  };

  return (
    <aside className="w-56 min-h-screen bg-card border-r flex flex-col">
      <div className="p-5 border-b flex items-center gap-2">
        <Zap className="text-primary" size={20} />
        <span className="font-bold text-sm">Analytics</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {orgId && navItems(orgId).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname.startsWith(href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted w-full"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
