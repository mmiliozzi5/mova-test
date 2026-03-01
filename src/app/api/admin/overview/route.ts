import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MINIMUM_SAMPLE_SIZE } from "@/lib/privacy";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ORG_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orgId = (session.user as any).organizationId as string;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get aggregated daily data via raw SQL (Prisma can't GROUP BY DATE cleanly)
  const dailyRows = await prisma.$queryRaw<
    Array<{ date: string; avg_score: number; count: bigint }>
  >`
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
  `;

  const totalEmployees = await prisma.user.count({
    where: { organizationId: orgId, role: "EMPLOYEE" },
  });

  const uniqueParticipants = await prisma.moodLog.groupBy({
    by: ["userId"],
    where: {
      user: { organizationId: orgId },
      loggedAt: { gte: thirtyDaysAgo },
    },
    _count: true,
  });

  const departments = await prisma.department.findMany({
    where: { organizationId: orgId },
    include: {
      users: {
        where: { role: "EMPLOYEE" },
        select: { id: true },
      },
    },
  });

  const formattedDaily = dailyRows.map((r) => ({
    date: r.date,
    avg_score: Number(r.avg_score),
    count: Number(r.count),
  }));

  const blurredDaily = formattedDaily.map((r) => ({
    date: r.date,
    averageScore:
      r.count >= MINIMUM_SAMPLE_SIZE ? Number(r.avg_score.toFixed(2)) : null,
    participationCount: r.count,
    isBlurred: r.count < MINIMUM_SAMPLE_SIZE,
  }));

  const totalParticipants = uniqueParticipants.length;
  const overallBlurred = totalParticipants < MINIMUM_SAMPLE_SIZE;

  const visibleDays = blurredDaily.filter((d) => !d.isBlurred);
  const avgScore =
    visibleDays.length > 0
      ? visibleDays.reduce((s, d) => s + (d.averageScore ?? 0), 0) /
        visibleDays.length
      : null;

  return NextResponse.json({
    totalEmployees,
    participatingEmployees: totalParticipants,
    participationRate:
      !overallBlurred && totalEmployees > 0
        ? Math.round((totalParticipants / totalEmployees) * 100)
        : null,
    averageScore: overallBlurred ? null : Number((avgScore ?? 0).toFixed(2)),
    isBlurred: overallBlurred,
    dailyData: blurredDaily,
    departments: departments.map((d) => ({
      id: d.id,
      name: d.name,
      employeeCount: d.users.length,
    })),
  });
}
