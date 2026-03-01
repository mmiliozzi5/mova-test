"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from "recharts";
import { formatDate, getMoodColor, getMoodEmoji } from "@/lib/utils";

interface MoodEntry {
  loggedAt: string;
  score: number;
}

interface Props {
  data: MoodEntry[];
}

function CustomDot(props: any) {
  const { cx, cy, payload } = props;
  return (
    <Dot
      cx={cx}
      cy={cy}
      r={5}
      fill={getMoodColor(payload.score)}
      stroke="white"
      strokeWidth={2}
    />
  );
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-medium text-slate-700">{formatDate(d.loggedAt)}</p>
      <p className="text-slate-500">
        {getMoodEmoji(d.score)} {d.score}/5
      </p>
    </div>
  );
}

export function MoodChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="card flex items-center justify-center h-48 text-slate-400">
        <p className="text-sm">No mood data yet. Start checking in daily!</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    date: formatDate(d.loggedAt),
  }));

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
        30-Day Mood Trend
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
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
          <Line
            type="monotone"
            dataKey="score"
            stroke="#2563eb"
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={{ r: 7, fill: "#2563eb" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
