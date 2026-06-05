"use client";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from "recharts";
import type { Widget } from "@/types";

const COLORS = ["#0ea5e9", "#06b6d4", "#14b8a6", "#10b981", "#6366f1"];

interface Props { widget: Widget }

export function WidgetCard({ widget }: Props) {
  const data = (widget.config.data as Record<string, unknown>[]) ?? [];

  return (
    <div className="card-elevated p-5">
      <h3 className="font-semibold mb-4 text-base text-foreground">{widget.title}</h3>
      <ChartContent widget={widget} data={data} />
    </div>
  );
}

function ChartContent({ widget, data }: { widget: Widget; data: Record<string, unknown>[] }) {
  const xKey = (widget.config.xKey as string) ?? "name";
  const yKey = (widget.config.yKey as string) ?? "value";

  const tooltipConfig = {
    contentStyle: {
      backgroundColor: "hsl(var(--card))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "0.5rem",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
    cursor: { strokeDasharray: "3 3" },
  };

  switch (widget.widget_type) {
    case "line":
      return (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip {...tooltipConfig} />
            <Line type="monotone" dataKey={yKey} stroke={COLORS[0]} strokeWidth={2.5} dot={false} isAnimationActive />
          </LineChart>
        </ResponsiveContainer>
      );

    case "bar":
      return (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip {...tooltipConfig} />
            <Bar dataKey={yKey} fill={COLORS[0]} radius={[8, 8, 0, 0]} isAnimationActive />
          </BarChart>
        </ResponsiveContainer>
      );

    case "pie":
      return (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={data} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip {...tooltipConfig} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );

    case "kpi": {
      const val = data[0]?.[yKey];
      return (
        <div className="flex items-center justify-center h-[160px]">
          <div className="text-center">
            <span className="text-5xl font-bold text-primary">{String(val ?? "—")}</span>
            <p className="text-sm text-muted-foreground mt-2">{widget.title}</p>
          </div>
        </div>
      );
    }

    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                {data[0] && Object.keys(data[0]).map((k) => (
                  <th key={k} className="text-left py-3 px-4 font-semibold text-muted-foreground">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b border-border hover:bg-secondary/20 transition-colors">
                  {Object.values(row).map((v, j) => (
                    <td key={j} className="py-3 px-4 text-foreground">{String(v)}</td>
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
