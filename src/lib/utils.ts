import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateStreak(logs: { loggedAt: Date }[]): number {
  if (logs.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const logDates = logs
    .map((log) => {
      const d = new Date(log.loggedAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
    .filter((t, i, arr) => arr.indexOf(t) === i)
    .sort((a, b) => b - a);

  if (logDates.length === 0) return 0;

  const msPerDay = 86400000;
  const mostRecent = logDates[0];

  // Streak must include today or yesterday
  if (today.getTime() - mostRecent > msPerDay) return 0;

  let streak = 1;
  for (let i = 1; i < logDates.length; i++) {
    const diff = logDates[i - 1] - logDates[i];
    if (diff === msPerDay) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function getMoodColor(score: number): string {
  const colors: Record<number, string> = {
    1: "#fb7185", // rose-400
    2: "#fbbf24", // amber-400
    3: "#94a3b8", // slate-400
    4: "#34d399", // emerald-400
    5: "#059669", // emerald-600
  };
  return colors[score] ?? "#94a3b8";
}

export function getMoodEmoji(score: number): string {
  const emojis: Record<number, string> = {
    1: "😔",
    2: "😟",
    3: "😐",
    4: "🙂",
    5: "😄",
  };
  return emojis[score] ?? "😐";
}

export function getMoodLabel(score: number): string {
  const labels: Record<number, string> = {
    1: "Very Low",
    2: "Low",
    3: "Neutral",
    4: "Good",
    5: "Excellent",
  };
  return labels[score] ?? "Neutral";
}
