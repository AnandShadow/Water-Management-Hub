"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* ---------- 7-day mock data ---------- */
const data = [
  { day: "Feb 27", totalReports: 34, criticalPredicted: 6 },
  { day: "Feb 28", totalReports: 41, criticalPredicted: 9 },
  { day: "Mar 1",  totalReports: 52, criticalPredicted: 14 },
  { day: "Mar 2",  totalReports: 47, criticalPredicted: 11 },
  { day: "Mar 3",  totalReports: 63, criticalPredicted: 19 },
  { day: "Mar 4",  totalReports: 58, criticalPredicted: 22 },
  { day: "Mar 5",  totalReports: 71, criticalPredicted: 26 },
];

/* ---------- Custom tooltip ---------- */
function CustomTooltip({
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
    <div className="rounded-xl bg-white shadow-lg border border-gray-200 px-4 py-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1.5">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2" style={{ color: entry.color }}>
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="font-medium">{entry.name}:</span>
          <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ================================================================
   RiskTrendChart — 7-Day Regional Water Infrastructure Risk Trend
   ================================================================ */
export default function RiskTrendChart() {
  return (
    <section className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            7-Day Regional Water Infrastructure Risk Trend
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Tracking total field reports vs. AI-predicted critical incidents.
          </p>
        </div>

        {/* Legend badges */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Total Reports
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Critical Predicted
          </span>
        </div>
      </div>

      {/* Summary stat strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
          <p className="text-[0.65rem] uppercase tracking-wide text-blue-500 font-semibold">
            Avg Daily Reports
          </p>
          <p className="text-xl font-bold text-blue-700 mt-0.5">52.3</p>
        </div>
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-[0.65rem] uppercase tracking-wide text-red-500 font-semibold">
            Critical Incidents
          </p>
          <p className="text-xl font-bold text-red-700 mt-0.5">15.3</p>
        </div>
        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
          <p className="text-[0.65rem] uppercase tracking-wide text-amber-500 font-semibold">
            Critical Rate
          </p>
          <p className="text-xl font-bold text-amber-700 mt-0.5">29.2%</p>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              domain={[0, "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              height={0}
              wrapperStyle={{ display: "none" }}
            />

            {/* Total Reports — blue fill */}
            <Area
              type="monotone"
              dataKey="totalReports"
              name="Total Reports"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#gradBlue)"
              dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
            />

            {/* Critical Incidents — red/orange fill */}
            <Area
              type="monotone"
              dataKey="criticalPredicted"
              name="Critical Predicted"
              stroke="#ef4444"
              strokeWidth={2.5}
              fill="url(#gradRed)"
              dot={{ r: 4, fill: "#ef4444", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
