import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfToday } from "@/lib/utils";

const moodSchema = z.object({
  score: z.number().int().min(1).max(5),
  note: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  try {
    const body = await req.json();
    const { score, note } = moodSchema.parse(body);

    // Check for duplicate today
    const today = startOfToday();
    const existing = await prisma.moodLog.findFirst({
      where: {
        userId,
        loggedAt: { gte: today },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already checked in today" },
        { status: 409 }
      );
    }

    const log = await prisma.moodLog.create({
      data: { score, note, userId },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }
    console.error("[mood POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
