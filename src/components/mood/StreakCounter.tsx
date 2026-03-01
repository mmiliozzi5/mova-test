interface Props {
  streak: number;
}

export function StreakCounter({ streak }: Props) {
  return (
    <div className="card flex items-center gap-4">
      <div className="text-4xl">{streak > 0 ? "🔥" : "💤"}</div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{streak}</p>
        <p className="text-sm text-slate-500">
          {streak === 1 ? "day streak" : "day streak"}
          {streak >= 7 && " — Keep it up!"}
          {streak >= 30 && " — Amazing!"}
        </p>
      </div>
    </div>
  );
}
