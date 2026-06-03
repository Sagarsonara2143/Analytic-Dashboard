"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api-client";
import { useOrgStore } from "@/store/org-store";
import type { Organization } from "@/types";

export default function OrgsPage() {
  const router = useRouter();
  const setCurrentOrg = useOrgStore((s) => s.setCurrentOrg);

  const { data: orgs, isLoading } = useQuery<Organization[]>({
    queryKey: ["orgs"],
    queryFn: () => api.get("/api/v1/orgs").then((r) => r.data),
  });

  const select = (org: Organization) => {
    setCurrentOrg(org);
    router.push(`/orgs/${org.id}/dashboards`);
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-muted p-8">
      <h1 className="text-2xl font-bold mb-6">Your Organizations</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {orgs?.map((org) => (
          <button
            key={org.id}
            onClick={() => select(org)}
            className="bg-card border rounded-lg p-6 text-left hover:border-primary transition-colors"
          >
            <p className="font-semibold text-lg">{org.name}</p>
            <p className="text-muted-foreground text-sm mt-1">{org.slug}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
