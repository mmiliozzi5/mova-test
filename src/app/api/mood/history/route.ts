import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const logs = await prisma.moodLog.findMany({
    where: {
      userId,
      loggedAt: { gte: thirtyDaysAgo },
    },
    orderBy: { loggedAt: "asc" },
    select: { id: true, score: true, note: true, loggedAt: true },
  });

  return NextResponse.json(logs);
}
