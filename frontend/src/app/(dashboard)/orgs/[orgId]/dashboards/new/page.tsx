"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api-client";

export default function NewDashboardPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", description: "" });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      api.post(`/api/v1/orgs/${orgId}/dashboards`, data).then((r) => r.data),
    onSuccess: (dashboard) => {
      router.push(`/orgs/${orgId}/dashboards/${dashboard.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Create New Dashboard</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            required
            className="w-full border rounded-md px-3 py-2"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full border rounded-md px-3 py-2"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90 disabled:opacity-50"
        >
          {createMutation.isPending ? "Creating..." : "Create Dashboard"}
        </button>
      </form>
    </div>
  );
}