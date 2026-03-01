"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MOODS = [
  { score: 1, emoji: "😔", label: "Very Low", color: "hover:bg-rose-50 hover:border-rose-300 data-[selected=true]:bg-rose-50 data-[selected=true]:border-rose-400" },
  { score: 2, emoji: "😟", label: "Low", color: "hover:bg-amber-50 hover:border-amber-300 data-[selected=true]:bg-amber-50 data-[selected=true]:border-amber-400" },
  { score: 3, emoji: "😐", label: "Neutral", color: "hover:bg-slate-100 hover:border-slate-300 data-[selected=true]:bg-slate-100 data-[selected=true]:border-slate-400" },
  { score: 4, emoji: "🙂", label: "Good", color: "hover:bg-emerald-50 hover:border-emerald-300 data-[selected=true]:bg-emerald-50 data-[selected=true]:border-emerald-400" },
  { score: 5, emoji: "😄", label: "Excellent", color: "hover:bg-emerald-100 hover:border-emerald-400 data-[selected=true]:bg-emerald-100 data-[selected=true]:border-emerald-600" },
];

export function MoodPicker({ alreadyCheckedIn }: { alreadyCheckedIn: boolean }) {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: selected, note }),
    });

    setSubmitting(false);

    if (res.status === 409) {
      setError("You've already checked in today. Come back tomorrow!");
      return;
    }
    if (!res.ok) {
      setError("Something went wrong. Please try again.");
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  if (alreadyCheckedIn) {
    return (
      <div className="card text-center py-10">
        <div className="text-4xl mb-3">✅</div>
        <h2 className="text-lg font-semibold text-slate-800">You&apos;ve checked in today!</h2>
        <p className="text-slate-500 text-sm mt-1">Come back tomorrow to log your mood.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="card text-center py-10">
        <div className="text-4xl mb-3">🎉</div>
        <h2 className="text-lg font-semibold text-slate-800">Check-in recorded!</h2>
        <p className="text-slate-500 text-sm mt-1">
          Your mood has been logged. Your streak continues!
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-slate-800 mb-1">How are you feeling today?</h2>
      <p className="text-slate-500 text-sm mb-6">Select the emoji that best matches your mood right now.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between gap-3">
          {MOODS.map((mood) => (
            <button
              key={mood.score}
              type="button"
              data-selected={selected === mood.score}
              onClick={() => setSelected(mood.score)}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-transparent bg-slate-50 transition-all cursor-pointer ${mood.color}`}
              aria-label={`Mood: ${mood.label}`}
              aria-pressed={selected === mood.score}
            >
              <span className="text-3xl">{mood.emoji}</span>
              <span className="text-xs text-slate-500 font-medium">{mood.label}</span>
            </button>
          ))}
        </div>

        {selected && (
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-slate-700 mb-1">
              Add a note <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input-field resize-none h-24"
              placeholder="What's on your mind today?"
              maxLength={500}
              aria-label="Mood note"
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-rose-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={!selected || submitting}
          className="btn-primary w-full"
          aria-label="Submit mood check-in"
        >
          {submitting ? "Saving…" : "Save check-in"}
        </button>
      </form>
    </div>
  );
}
