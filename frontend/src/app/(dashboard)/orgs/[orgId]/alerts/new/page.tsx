"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api-client";

export default function NewAlertPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    query: "{}",
    threshold: { operator: "gt", value: 100 },
    channels: ["email"],
    check_interval_minutes: 5
  });

  const createAlert = useMutation({
    mutationFn: (data: typeof formData) =>
      api.post(`/api/v1/orgs/${orgId}/alerts`, {
        ...data,
        query: JSON.parse(data.query)
      }).then(r => r.data),
    onSuccess: () => router.push(`/orgs/${orgId}/alerts`)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      createAlert.mutate(formData);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Create New Alert</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Alert Name</label>
          <input
            type="text"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Query (JSON)</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={3}
            value={formData.query}
            onChange={(e) => setFormData({ ...formData, query: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Operator</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formData.threshold.operator}
              onChange={(e) => setFormData({
                ...formData,
                threshold: { ...formData.threshold, operator: e.target.value }
              })}
            >
              <option value="gt">Greater than</option>
              <option value="lt">Less than</option>
              <option value="eq">Equal to</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Threshold Value</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={formData.threshold.value}
              onChange={(e) => setFormData({
                ...formData,
                threshold: { ...formData.threshold, value: Number(e.target.value) }
              })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Check Interval (minutes)</label>
          <input
            type="number"
            min="1"
            className="w-full border rounded px-3 py-2"
            value={formData.check_interval_minutes}
            onChange={(e) => setFormData({ ...formData, check_interval_minutes: Number(e.target.value) })}
          />
        </div>
        <button
          type="submit"
          disabled={createAlert.isPending}
          className="bg-primary text-primary-foreground px-4 py-2 rounded font-medium hover:opacity-90 disabled:opacity-50"
        >
          {createAlert.isPending ? "Creating..." : "Create Alert"}
        </button>
      </form>
    </div>
  );
}