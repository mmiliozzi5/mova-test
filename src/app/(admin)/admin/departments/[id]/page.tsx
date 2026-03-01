import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MINIMUM_SAMPLE_SIZE } from "@/lib/privacy";
import { AggregateChart } from "@/components/admin/AggregateChart";
import { ParticipationGauge } from "@/components/admin/ParticipationGauge";
import { PrivacyBlur } from "@/components/admin/PrivacyBlur";

async function DeptContent({ id }: { id: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ORG_ADMIN") {
    redirect("/dashboard");
  }

  const orgId = (session.user as any).organizationId as string;

  const dept = await prisma.department.findFirst({
    where: { id, organizationId: orgId },
  });
  if (!dept) notFound();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [dailyRows, totalEmployees, uniqueParticipants] = await Promise.all([
    prisma.$queryRaw<Array<{ date: string; avg_score: number; count: bigint }>>`
      SELECT
        TO_CHAR("loggedAt" AT TIME ZONE 'UTC', 'Mon DD') AS date,
        AVG(score) as avg_score,
        COUNT(*) as count
      FROM "MoodLog" ml
      JOIN "User" u ON ml."userId" = u.id
      WHERE u."departmentId" = ${id}
        AND ml."loggedAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("loggedAt" AT TIME ZONE 'UTC'), TO_CHAR("loggedAt" AT TIME ZONE 'UTC', 'Mon DD')
      ORDER BY DATE("loggedAt" AT TIME ZONE 'UTC') ASC
    `,
    prisma.user.count({ where: { departmentId: id, role: "EMPLOYEE" } }),
    prisma.moodLog.groupBy({
      by: ["userId"],
      where: { user: { departmentId: id }, loggedAt: { gte: thirtyDaysAgo } },
      _count: true,
    }),
  ]);

  const blurredDaily = dailyRows.map((r) => ({
    date: r.date,
    averageScore:
      Number(r.count) >= MINIMUM_SAMPLE_SIZE
        ? Number(Number(r.avg_score).toFixed(2))
        : null,
    participationCount: Number(r.count),
    isBlurred: Number(r.count) < MINIMUM_SAMPLE_SIZE,
  }));

  const totalParticipants = uniqueParticipants.length;
  const overallBlurred = totalParticipants < MINIMUM_SAMPLE_SIZE;

  const visibleDays = blurredDaily.filter((d) => !d.isBlurred);
  const avgScore =
    visibleDays.length > 0
      ? visibleDays.reduce((s, d) => s + (d.averageScore ?? 0), 0) / visibleDays.length
      : null;

  const participationRate =
    !overallBlurred && totalEmployees > 0
      ? Math.round((totalParticipants / totalEmployees) * 100)
      : null;

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-slate-400 hover:text-slate-600 transition-colors text-sm" aria-label="Back to overview">
          ← Overview
        </Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-2xl font-bold text-slate-800">{dept.name}</h1>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
        🔒 Groups with fewer than {MINIMUM_SAMPLE_SIZE} responses are hidden.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-slate-800">{totalEmployees}</p>
          <p className="text-sm text-slate-500 mt-1">Employees</p>
        </div>

        <div className="card text-center">
          <PrivacyBlur isBlurred={overallBlurred}>
            <p className="text-3xl font-bold text-blue-600">
              {avgScore !== null ? avgScore.toFixed(1) : "—"}
              <span className="text-base font-normal text-slate-400">/5</span>
            </p>
          </PrivacyBlur>
          <p className="text-sm text-slate-500 mt-1">Avg mood (30d)</p>
        </div>

        <div className="card text-center">
          <PrivacyBlur isBlurred={overallBlurred}>
            <p className="text-3xl font-bold text-emerald-600">
              {participationRate !== null ? `${participationRate}%` : "—"}
            </p>
          </PrivacyBlur>
          <p className="text-sm text-slate-500 mt-1">Participation rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AggregateChart
            data={blurredDaily}
            title={`${dept.name} — 30-Day Mood Trend`}
          />
        </div>
        <ParticipationGauge
          rate={participationRate}
          isBlurred={overallBlurred}
          label={`${dept.name} Participation`}
        />
      </div>
    </div>
  );
}

export default function DepartmentPage({ params }: { params: { id: string } }) {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl space-y-6 animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-24 bg-slate-100" />
            ))}
          </div>
          <div className="card h-56 bg-slate-100" />
        </div>
      }
    >
      <DeptContent id={params.id} />
    </Suspense>
  );
}
