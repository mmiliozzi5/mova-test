"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ThreadSidebar } from "@/components/chat/ThreadSidebar";
import { ChatThreadEntry } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ChatPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedThreadId = searchParams.get("thread");

  const {
    data: threads = [],
    mutate,
    isLoading,
  } = useSWR<ChatThreadEntry[]>("/api/chat/threads", fetcher);

  useEffect(() => {
    if (isLoading) return;

    if (!selectedThreadId) {
      if (threads.length > 0) {
        router.replace(`/chat?thread=${threads[0].id}`);
      } else {
        // Auto-create first thread
        fetch("/api/chat/threads", { method: "POST" })
          .then((r) => r.json())
          .then((thread) => {
            mutate();
            router.replace(`/chat?thread=${thread.id}`);
          });
      }
    }
  }, [isLoading, selectedThreadId, threads, router, mutate]);

  return (
    <div className="flex h-screen -m-8 overflow-hidden">
      <ThreadSidebar
        threads={threads}
        isLoading={isLoading}
        selectedId={selectedThreadId}
        onMutate={mutate}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <h1 className="text-xl font-bold text-slate-800">AI Wellness Chat</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            A private space to process emotions and explore coping strategies.
          </p>
        </div>
        <div className="flex-1 overflow-hidden bg-white">
          {selectedThreadId ? (
            <ChatWindow
              key={selectedThreadId}
              threadId={selectedThreadId}
              onMessageSent={() => mutate()}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              Loading...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
