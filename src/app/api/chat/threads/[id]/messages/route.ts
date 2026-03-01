import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, buildSystemPrompt } from "@/lib/claude";

const messageSchema = z.object({ content: z.string().min(1).max(2000) });

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const thread = await prisma.chatThread.findFirst({
    where: { id: params.id, userId },
  });
  if (!thread) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { threadId: params.id },
    orderBy: { createdAt: "asc" },
    take: 50,
    select: { id: true, role: true, content: true, createdAt: true, threadId: true },
  });

  return NextResponse.json(
    messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  try {
    const thread = await prisma.chatThread.findFirst({
      where: { id: params.id, userId },
    });
    if (!thread) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { content } = messageSchema.parse(await req.json());

    const isFirstMessage =
      (await prisma.chatMessage.count({ where: { threadId: params.id } })) === 0;

    // Persist user message
    await prisma.chatMessage.create({
      data: { role: "user", content, userId, threadId: params.id },
    });

    // Fetch last 30 thread messages for Claude context
    const history = await prisma.chatMessage.findMany({
      where: { threadId: params.id },
      orderBy: { createdAt: "asc" },
      take: 30,
      select: { role: true, content: true },
    });

    const messages = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const systemPrompt = await buildSystemPrompt(userId, params.id);

    const stream = anthropic.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    let assistantContent = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              const text = chunk.delta.text;
              assistantContent += text;
              controller.enqueue(new TextEncoder().encode(text));
            }
          }

          // Persist complete assistant message
          await prisma.chatMessage.create({
            data: {
              role: "assistant",
              content: assistantContent,
              userId,
              threadId: params.id,
            },
          });

          // Update thread timestamp + auto-title on first message
          await prisma.chatThread.update({
            where: { id: params.id },
            data: {
              updatedAt: new Date(),
              ...(isFirstMessage ? { title: content.slice(0, 40).trim() } : {}),
            },
          });

          controller.close();
        } catch (err) {
          console.error("[thread chat stream]", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Validation error" },
        { status: 400 }
      );
    }
    console.error("[thread messages POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
