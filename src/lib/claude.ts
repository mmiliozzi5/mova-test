import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const SYSTEM_PROMPT = `You are MOVA's wellness companion — a compassionate, non-clinical AI assistant helping employees navigate workplace stress, emotions, and mental well-being.

Guidelines:
- Be warm, empathetic, and non-judgmental in all responses
- Keep responses concise (2–4 short paragraphs) and conversational
- You are NOT a therapist or medical professional — never diagnose or prescribe
- For any crisis signals (self-harm, suicidal thoughts, severe distress), always encourage the user to contact a mental health professional or crisis line immediately (e.g., 988 Suicide & Crisis Lifeline in the US)
- Focus on practical coping strategies, mindfulness, and gentle encouragement
- Respect privacy — do not ask for or store identifying personal information
- Encourage professional help when appropriate without being dismissive of the user's current concerns
- If the user mentions work-specific issues (burnout, difficult colleagues, promotions), offer supportive perspective without taking sides`;

export const BASE_SYSTEM_PROMPT = SYSTEM_PROMPT;

export async function buildSystemPrompt(userId: string, currentThreadId?: string): Promise<string> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [moodData, otherThreads] = await Promise.all([
    prisma.moodLog.findMany({
      where: { userId, loggedAt: { gte: sevenDaysAgo } },
      orderBy: { loggedAt: "desc" },
      take: 7,
      select: { score: true, loggedAt: true },
    }),
    prisma.chatThread.findMany({
      where: {
        userId,
        ...(currentThreadId ? { id: { not: currentThreadId } } : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        title: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true },
        },
      },
    }),
  ]);

  const sections: string[] = [];

  if (moodData.length > 0) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayLog = moodData.find((m) => new Date(m.loggedAt) >= todayStart);
    const avg = moodData.reduce((sum, m) => sum + m.score, 0) / moodData.length;
    let moodSection = "User mood context:";
    if (todayLog) moodSection += `\n- Today's mood: ${todayLog.score}/5`;
    moodSection += `\n- 7-day average: ${avg.toFixed(1)}/5`;
    sections.push(moodSection);
  }

  if (otherThreads.length > 0) {
    const threadLines = otherThreads.map((t) => {
      const preview = (t.messages[0]?.content ?? "").slice(0, 120).trim();
      return `- "${t.title}"${preview ? `: ${preview}` : ""}`;
    });
    sections.push(
      "Other recent conversations (for awareness only — do not reference unless the user brings them up):\n" +
        threadLines.join("\n")
    );
  }

  if (sections.length === 0) return BASE_SYSTEM_PROMPT;
  return BASE_SYSTEM_PROMPT + "\n\n" + sections.join("\n\n");
}
