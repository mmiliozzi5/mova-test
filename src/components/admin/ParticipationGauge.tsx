"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { PrivacyBlur } from "./PrivacyBlur";

interface Props {
  rate: number | null;
  isBlurred: boolean;
  label?: string;
}

export function ParticipationGauge({ rate, isBlurred, label = "Participation" }: Props) {
  const displayRate = rate ?? 0;
  const data = [{ value: Math.min(displayRate, 100) }];

  const color =
    displayRate >= 70
      ? "#10b981"
      : displayRate >= 40
      ? "#fbbf24"
      : "#fb7185";

  return (
    <div className="card flex flex-col items-center gap-2">
      <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide self-start">
        {label}
      </h3>
      <PrivacyBlur isBlurred={isBlurred}>
        <div className="relative w-36 h-36">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              data={data}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                background={{ fill: "#f1f5f9" }}
                dataKey="value"
                cornerRadius={6}
                fill={color}
                angleAxisId={0}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-800">
              {rate !== null ? `${Math.round(rate)}%` : "—"}
            </span>
          </div>
        </div>
      </PrivacyBlur>
      <p className="text-sm text-slate-500">of employees this month</p>
    </div>
  );
}
