import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateStreak, getMoodEmoji, startOfToday } from "@/lib/utils";
import { MoodChart } from "@/components/mood/MoodChart";
import { StreakCounter } from "@/components/mood/StreakCounter";

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-64" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card h-24 bg-slate-100" />
        ))}
      </div>
      <div className="card h-56 bg-slate-100" />
    </div>
  );
}

async function DashboardContent() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const logs = await prisma.moodLog.findMany({
    where: { userId, loggedAt: { gte: thirtyDaysAgo } },
    orderBy: { loggedAt: "asc" },
    select: { id: true, score: true, note: true, loggedAt: true },
  });

  const today = startOfToday();
  const checkedInToday = logs.some(
    (l) => new Date(l.loggedAt) >= today
  );

  const streak = calculateStreak(logs.map((l) => ({ loggedAt: l.loggedAt })));

  const weeklyAvg =
    logs.length > 0
      ? (
          logs
            .slice(-7)
            .reduce((sum, l) => sum + l.score, 0) / Math.min(logs.slice(-7).length, 7)
        ).toFixed(1)
      : null;

  const todayLog = logs.find((l) => new Date(l.loggedAt) >= today);

  const serializedLogs = logs.map((l) => ({
    ...l,
    loggedAt: l.loggedAt.toISOString(),
  }));

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Hello, {session.user.name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {checkedInToday
            ? "You've already checked in today. Here's your wellness overview."
            : "Don't forget to check in today!"}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StreakCounter streak={streak} />

        <div className="card flex items-center gap-4">
          <div className="text-4xl">📅</div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{logs.length}</p>
            <p className="text-sm text-slate-500">check-ins this month</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="text-4xl">{weeklyAvg ? getMoodEmoji(Math.round(parseFloat(weeklyAvg))) : "🤷"}</div>
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {weeklyAvg ?? "—"}
            </p>
            <p className="text-sm text-slate-500">weekly avg mood</p>
          </div>
        </div>
      </div>

      {/* Today's mood */}
      {todayLog && (
        <div className="card border-l-4 border-blue-500">
          <p className="text-sm font-medium text-slate-500 mb-1">Today&apos;s mood</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getMoodEmoji(todayLog.score)}</span>
            <div>
              <p className="font-semibold text-slate-800">Score: {todayLog.score}/5</p>
              {todayLog.note && (
                <p className="text-sm text-slate-500 mt-0.5 italic">&ldquo;{todayLog.note}&rdquo;</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <MoodChart data={serializedLogs} />

      {/* Quick links */}
      {!checkedInToday && (
        <div className="card bg-blue-50 border-blue-100">
          <p className="text-sm font-medium text-blue-700 mb-3">Ready to check in?</p>
          <a href="/check-in" className="btn-primary inline-block" aria-label="Go to daily check-in">
            Daily check-in →
          </a>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
