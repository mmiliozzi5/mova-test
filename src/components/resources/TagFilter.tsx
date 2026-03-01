"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const TAGS = [
  { value: "", label: "All" },
  { value: "burnout", label: "Burnout" },
  { value: "work-life-balance", label: "Work-Life Balance" },
  { value: "job-interviews", label: "Job Interviews" },
  { value: "asking-for-promotion", label: "Promotions" },
  { value: "anxiety", label: "Anxiety" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "communication", label: "Communication" },
  { value: "career", label: "Career" },
  { value: "wellness", label: "Wellness" },
];

export function TagFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("tag") ?? "";

  function setTag(tag: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (tag) {
      params.set("tag", tag);
    } else {
      params.delete("tag");
    }
    router.push(`/resources?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter resources by topic">
      {TAGS.map((tag) => (
        <button
          key={tag.value}
          onClick={() => setTag(tag.value)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
            active === tag.value
              ? "bg-blue-600 text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
          )}
          aria-pressed={active === tag.value}
          aria-label={`Filter by ${tag.label}`}
        >
          {tag.label}
        </button>
      ))}
    </div>
  );
}
