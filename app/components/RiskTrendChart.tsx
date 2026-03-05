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
    <div className="rounded-xl bg-white shadow-lg ring-1 ring-slate-200 px-4 py-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
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
   RiskTrendChart — 7-Day Trend (LineChart)
   ================================================================ */
export default function RiskTrendChart() {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              7-Day Regional Water Infrastructure Risk Trend
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Total field reports vs. AI-predicted critical incidents.
            </p>
          </div>
        </div>

        {/* Legend pills */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Total Reports
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Critical Incidents
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />

            <Line
              type="monotone"
              dataKey="totalReports"
              name="Total Reports"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
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
