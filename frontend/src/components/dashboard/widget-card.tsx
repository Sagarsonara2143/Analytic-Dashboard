"use client";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import type { Widget } from "@/types";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface Props { widget: Widget }

export function WidgetCard({ widget }: Props) {
  const data = (widget.config.data as Record<string, unknown>[]) ?? [];

  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="font-medium mb-3 text-sm">{widget.title}</h3>
      <ChartContent widget={widget} data={data} />
    </div>
  );
}

function ChartContent({ widget, data }: { widget: Widget; data: Record<string, unknown>[] }) {
  const xKey = (widget.config.xKey as string) ?? "name";
  const yKey = (widget.config.yKey as string) ?? "value";

  switch (widget.widget_type) {
    case "line":
      return (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey={yKey} stroke={COLORS[0]} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );

    case "bar":
      return (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey={yKey} fill={COLORS[0]} />
          </BarChart>
        </ResponsiveContainer>
      );

    case "pie":
      return (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={80}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );

    case "kpi": {
      const val = data[0]?.[yKey];
      return (
        <div className="flex items-center justify-center h-[120px]">
          <span className="text-4xl font-bold text-primary">{String(val ?? "—")}</span>
        </div>
      );
    }

    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                {data[0] && Object.keys(data[0]).map((k) => (
                  <th key={k} className="text-left py-1 px-2 font-medium text-muted-foreground">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  {Object.values(row).map((v, j) => (
                    <td key={j} className="py-1 px-2">{String(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return <p className="text-muted-foreground text-sm">Unsupported widget type</p>;
  }
}
