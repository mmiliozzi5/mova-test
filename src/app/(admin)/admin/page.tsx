import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MINIMUM_SAMPLE_SIZE } from "@/lib/privacy";
import { AggregateChart } from "@/components/admin/AggregateChart";
import { ParticipationGauge } from "@/components/admin/ParticipationGauge";
import { PrivacyBlur } from "@/components/admin/PrivacyBlur";

async function AdminOverview() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ORG_ADMIN") {
    redirect("/dashboard");
  }

  const orgId = (session.user as any).organizationId as string;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [org, dailyRows, totalEmployees, uniqueParticipants, departments] =
    await Promise.all([
      prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } }),
      prisma.$queryRaw<Array<{ date: string; avg_score: number; count: bigint }>>`
        SELECT
          TO_CHAR("loggedAt" AT TIME ZONE 'UTC', 'Mon DD') AS date,
          AVG(score) as avg_score,
          COUNT(*) as count
        FROM "MoodLog" ml
        JOIN "User" u ON ml."userId" = u.id
        WHERE u."organizationId" = ${orgId}
          AND ml."loggedAt" >= ${thirtyDaysAgo}
        GROUP BY DATE("loggedAt" AT TIME ZONE 'UTC'), TO_CHAR("loggedAt" AT TIME ZONE 'UTC', 'Mon DD')
        ORDER BY DATE("loggedAt" AT TIME ZONE 'UTC') ASC
      `,
      prisma.user.count({ where: { organizationId: orgId, role: "EMPLOYEE" } }),
      prisma.moodLog.groupBy({
        by: ["userId"],
        where: { user: { organizationId: orgId }, loggedAt: { gte: thirtyDaysAgo } },
        _count: true,
      }),
      prisma.department.findMany({
        where: { organizationId: orgId },
        include: {
          users: {
            where: { role: "EMPLOYEE" },
            include: {
              moodLogs: {
                where: { loggedAt: { gte: thirtyDaysAgo } },
                select: { score: true },
              },
            },
          },
        },
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
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {org?.name ?? "Organization"} — Wellness Overview
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Aggregated, anonymized data. Individual responses are never shown.
        </p>
      </div>

      {/* Privacy notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
        🔒 <strong>Privacy protected:</strong> Groups with fewer than {MINIMUM_SAMPLE_SIZE} responses are hidden to prevent individual identification.
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-slate-800">{totalEmployees}</p>
          <p className="text-sm text-slate-500 mt-1">Total employees</p>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AggregateChart data={blurredDaily} />
        </div>
        <ParticipationGauge
          rate={participationRate}
          isBlurred={overallBlurred}
        />
      </div>

      {/* Departments */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Departments</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const empCount = dept.users.length;
            const deptLogs = dept.users.flatMap((u) => u.moodLogs);
            const uniqueDeptUsers = new Set(dept.users.filter((u) => u.moodLogs.length > 0).map((u) => u.id)).size;
            const deptBlurred = uniqueDeptUsers < MINIMUM_SAMPLE_SIZE;
            const deptAvg =
              !deptBlurred && deptLogs.length > 0
                ? (deptLogs.reduce((s, l) => s + l.score, 0) / deptLogs.length).toFixed(1)
                : null;
            const deptRate =
              !deptBlurred && empCount > 0
                ? Math.round((uniqueDeptUsers / empCount) * 100)
                : null;

            return (
              <Link
                key={dept.id}
                href={`/admin/departments/${dept.id}`}
                className="card hover:shadow-md transition-shadow cursor-pointer block"
                aria-label={`View ${dept.name} department metrics`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-800">{dept.name}</h3>
                  <span className="text-xs text-slate-400">{empCount} employees</span>
                </div>
                <div className="flex gap-4">
                  <div>
                    <PrivacyBlur isBlurred={deptBlurred}>
                      <p className="text-xl font-bold text-blue-600">
                        {deptAvg ?? "—"}
                      </p>
                    </PrivacyBlur>
                    <p className="text-xs text-slate-400 mt-0.5">avg mood</p>
                  </div>
                  <div>
                    <PrivacyBlur isBlurred={deptBlurred}>
                      <p className="text-xl font-bold text-emerald-600">
                        {deptRate !== null ? `${deptRate}%` : "—"}
                      </p>
                    </PrivacyBlur>
                    <p className="text-xs text-slate-400 mt-0.5">participation</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl space-y-6 animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-24 bg-slate-100" />
            ))}
          </div>
          <div className="card h-56 bg-slate-100" />
        </div>
      }
    >
      <AdminOverview />
    </Suspense>
  );
}
