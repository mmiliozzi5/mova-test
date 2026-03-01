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

  const threads = await prisma.chatThread.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { content: true },
      },
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json(
    threads.map((t) => ({
      id: t.id,
      title: t.title,
      lastMessage: t.messages[0]?.content ?? null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      messageCount: t._count.messages,
    }))
  );
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const thread = await prisma.chatThread.create({
    data: { title: "New conversation", userId },
    select: { id: true, title: true, createdAt: true },
  });

  return NextResponse.json({
    ...thread,
    createdAt: thread.createdAt.toISOString(),
  });
}
