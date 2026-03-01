"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DailyAggregate } from "@/lib/privacy";
import { MINIMUM_SAMPLE_SIZE } from "@/lib/privacy";

interface Props {
  data: DailyAggregate[];
  title?: string;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-medium text-slate-700">{label}</p>
      {d?.isBlurred ? (
        <p className="text-slate-400">
          &lt;{MINIMUM_SAMPLE_SIZE} responses (hidden)
        </p>
      ) : (
        <>
          <p className="text-blue-600">Avg: {payload[0]?.value?.toFixed(2)}/5</p>
          <p className="text-slate-500">{d?.participationCount} responses</p>
        </>
      )}
    </div>
  );
}

export function AggregateChart({ data, title = "30-Day Mood Trend (Aggregated)" }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    displayScore: d.isBlurred ? null : d.averageScore,
  }));

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
        {title}
      </h3>
      {data.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
          No data available yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="displayScore"
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#moodGradient)"
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
