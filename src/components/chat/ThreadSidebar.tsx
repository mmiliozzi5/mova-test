"use client";

import { useRouter } from "next/navigation";
import { ChatThreadEntry } from "@/types";

interface ThreadSidebarProps {
  threads: ChatThreadEntry[];
  isLoading: boolean;
  selectedId: string | null;
  onMutate: () => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ThreadSidebar({
  threads,
  isLoading,
  selectedId,
  onMutate,
}: ThreadSidebarProps) {
  const router = useRouter();

  async function handleNewChat() {
    const res = await fetch("/api/chat/threads", { method: "POST" });
    if (res.ok) {
      const thread = await res.json();
      onMutate();
      router.push(`/chat?thread=${thread.id}`);
    }
  }

  async function handleDelete(e: React.MouseEvent, threadId: string) {
    e.stopPropagation();
    const res = await fetch(`/api/chat/threads/${threadId}`, { method: "DELETE" });
    if (res.ok) {
      onMutate();
      if (selectedId === threadId) {
        router.push("/chat");
      }
    }
  }

  return (
    <div className="w-64 flex-shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col h-full">
      <div className="p-4 border-b border-slate-200">
        <button
          onClick={handleNewChat}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="p-4 text-sm text-slate-400">Loading...</div>
        )}

        {!isLoading && threads.length === 0 && (
          <div className="p-4 text-sm text-slate-400">No conversations yet.</div>
        )}

        {threads.map((thread) => {
          const isActive = thread.id === selectedId;
          return (
            <div
              key={thread.id}
              onClick={() => router.push(`/chat?thread=${thread.id}`)}
              className={`group relative px-3 py-3 cursor-pointer border-b border-slate-100 hover:bg-slate-100 transition-colors ${
                isActive ? "bg-blue-50 border-l-2 border-l-blue-500" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium truncate ${
                      isActive ? "text-blue-700" : "text-slate-700"
                    }`}
                  >
                    {thread.title}
                  </p>
                  {thread.lastMessage && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {thread.lastMessage}
                    </p>
                  )}
                  <p className="text-xs text-slate-300 mt-0.5">
                    {formatDate(thread.updatedAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(e, thread.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all flex-shrink-0 p-1 rounded"
                  title="Delete conversation"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
