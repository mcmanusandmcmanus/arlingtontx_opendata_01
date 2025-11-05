"use client";

import { OffenseTrendPoint } from "@/types";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TrendChartsProps = {
  data: OffenseTrendPoint[];
};

export function TrendCharts({ data }: TrendChartsProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">
            Weekly Activity Signal
          </h2>
          <p className="text-sm text-slate-400">
            Rolling counts of court cases and code complaints help pinpoint
            surges that drive field workload.
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-4 shadow-xl">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="period"
              stroke="#94a3b8"
              tick={{ fontSize: 12 }}
              tickMargin={8}
            />
            <YAxis
              stroke="#94a3b8"
              tick={{ fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: "0.75rem",
                border: "1px solid rgba(255,255,255,0.05)",
                color: "#e2e8f0",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="case_count"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Court Cases"
            />
            <Line
              type="monotone"
              dataKey="complaint_count"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Code Complaints"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

