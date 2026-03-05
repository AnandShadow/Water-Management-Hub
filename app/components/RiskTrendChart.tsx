"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3 } from "lucide-react";

/* ---------- 7-day mock data ---------- */
const data = [
  { day: "Feb 27", totalReports: 34, critical: 6  },
  { day: "Feb 28", totalReports: 41, critical: 9  },
  { day: "Mar 1",  totalReports: 52, critical: 14 },
  { day: "Mar 2",  totalReports: 47, critical: 11 },
  { day: "Mar 3",  totalReports: 63, critical: 19 },
  { day: "Mar 4",  totalReports: 58, critical: 22 },
  { day: "Mar 5",  totalReports: 71, critical: 26 },
];

/* ---------- Custom Tooltip ---------- */
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white/90 backdrop-blur-xl shadow-lg ring-1 ring-white/40 px-4 py-3 text-xs">
      <p className="font-bold text-zinc-700 mb-1.5">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2" style={{ color: entry.color }}>
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="font-medium">{entry.name}:</span>
          <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ================================================================
   RiskTrendChart — 7-Day Trend (LineChart · glassmorphism)
   ================================================================ */
export default function RiskTrendChart() {
  return (
    <section className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-2xl p-6 sm:p-7 hover:shadow-[0_12px_40px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-indigo-100 text-indigo-600">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight text-zinc-800 uppercase">
              7-Day Risk Trend
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Total reports vs. AI-predicted critical incidents
            </p>
          </div>
        </div>

        {/* Legend pills */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-indigo-500" /> Total Reports
          </span>
          <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> Critical
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" strokeOpacity={0.5} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#a1a1aa", fontWeight: 500 }}
              axisLine={{ stroke: "#e4e4e7" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#a1a1aa", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />

            <Line
              type="monotone"
              dataKey="totalReports"
              name="Total Reports"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
            />
            <Line
              type="monotone"
              dataKey="critical"
              name="Critical Incidents"
              stroke="#f43f5e"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#f43f5e", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
