import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MINIMUM_SAMPLE_SIZE } from "@/lib/privacy";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ORG_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orgId = (session.user as any).organizationId as string;
  const deptId = params.id;

  // Verify department belongs to org
  const dept = await prisma.department.findFirst({
    where: { id: deptId, organizationId: orgId },
  });
  if (!dept) {
    return NextResponse.json({ error: "Department not found" }, { status: 404 });
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyRows = await prisma.$queryRaw<
    Array<{ date: string; avg_score: number; count: bigint }>
  >`
    SELECT
      TO_CHAR("loggedAt" AT TIME ZONE 'UTC', 'Mon DD') AS date,
      AVG(score) as avg_score,
      COUNT(*) as count
    FROM "MoodLog" ml
    JOIN "User" u ON ml."userId" = u.id
    WHERE u."departmentId" = ${deptId}
      AND ml."loggedAt" >= ${thirtyDaysAgo}
    GROUP BY DATE("loggedAt" AT TIME ZONE 'UTC'), TO_CHAR("loggedAt" AT TIME ZONE 'UTC', 'Mon DD')
    ORDER BY DATE("loggedAt" AT TIME ZONE 'UTC') ASC
  `;

  const totalEmployees = await prisma.user.count({
    where: { departmentId: deptId, role: "EMPLOYEE" },
  });

  const uniqueParticipants = await prisma.moodLog.groupBy({
    by: ["userId"],
    where: {
      user: { departmentId: deptId },
      loggedAt: { gte: thirtyDaysAgo },
    },
    _count: true,
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
    department: { id: dept.id, name: dept.name },
    totalEmployees,
    participatingEmployees: totalParticipants,
    participationRate:
      !overallBlurred && totalEmployees > 0
        ? Math.round((totalParticipants / totalEmployees) * 100)
        : null,
    averageScore: overallBlurred ? null : Number((avgScore ?? 0).toFixed(2)),
    isBlurred: overallBlurred,
    dailyData: blurredDaily,
  });
}
