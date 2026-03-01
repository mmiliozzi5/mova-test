import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({ title: z.string().min(1).max(100) });

async function getOwnedThread(threadId: string, userId: string) {
  return prisma.chatThread.findFirst({ where: { id: threadId, userId } });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const thread = await getOwnedThread(params.id, userId);
  if (!thread) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.chatThread.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const thread = await getOwnedThread(params.id, userId);
  if (!thread) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const { title } = patchSchema.parse(await req.json());
    const updated = await prisma.chatThread.update({
      where: { id: params.id },
      data: { title },
      select: { id: true, title: true },
    });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Validation error" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
