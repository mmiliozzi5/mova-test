import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, SYSTEM_PROMPT } from "@/lib/claude";

const chatSchema = z.object({
  content: z.string().min(1).max(2000),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const messages = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: 50,
    select: { id: true, role: true, content: true, createdAt: true },
  });

  return NextResponse.json(
    messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  try {
    const body = await req.json();
    const { content } = chatSchema.parse(body);

    // Persist user message
    await prisma.chatMessage.create({
      data: { role: "user", content, userId },
    });

    // Fetch last 30 messages for context
    const history = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 30,
      select: { role: true, content: true },
    });

    // Build message array for Claude
    const messages = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Stream Claude response
    const stream = anthropic.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
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

          // Persist complete assistant message after stream closes
          await prisma.chatMessage.create({
            data: { role: "assistant", content: assistantContent, userId },
          });

          controller.close();
        } catch (err) {
          console.error("[chat stream]", err);
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
      return NextResponse.json({ error: err.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }
    console.error("[chat POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
