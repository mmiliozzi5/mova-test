import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfToday } from "@/lib/utils";
import { MoodPicker } from "@/components/mood/MoodPicker";

async function CheckInContent() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;
  const today = startOfToday();

  const existing = await prisma.moodLog.findFirst({
    where: { userId, loggedAt: { gte: today } },
  });

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Daily Check-in</h1>
      <p className="text-slate-500 text-sm mb-6">
        Take a moment to reflect on how you&apos;re feeling. Your entries are private.
      </p>
      <MoodPicker alreadyCheckedIn={!!existing} />
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-6" />
          <div className="card h-64 bg-slate-100" />
        </div>
      }
    >
      <CheckInContent />
    </Suspense>
  );
}
