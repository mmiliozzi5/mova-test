"use client";

import { useState, useCallback } from "react";
import { ChatMessageEntry } from "@/types";

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessageEntry[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {
      // silently fail on history load
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (streaming) return;

      setError("");

      // Optimistic user message
      const userMsg: ChatMessageEntry = {
        id: `temp-user-${Date.now()}`,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      // Optimistic assistant bubble
      const assistantMsg: ChatMessageEntry = {
        id: `temp-assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setStreaming(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });

        if (!res.ok || !res.body) {
          throw new Error("Stream failed");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.role === "assistant") {
              updated[lastIdx] = { ...updated[lastIdx], content: accumulated };
            }
            return updated;
          });
        }
      } catch {
        setError("Something went wrong. Please try again.");
        setMessages((prev) => prev.slice(0, -2)); // Remove optimistic messages
      } finally {
        setStreaming(false);
        // Reload to get persisted IDs
        await loadHistory();
      }
    },
    [streaming, loadHistory]
  );

  return { messages, streaming, error, sendMessage, loadHistory };
}
