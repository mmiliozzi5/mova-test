"use client";

import { useEffect, useRef } from "react";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { useChatStream } from "@/hooks/useChatStream";

interface ChatWindowProps {
  threadId: string;
  onMessageSent?: () => void;
}

export function ChatWindow({ threadId, onMessageSent }: ChatWindowProps) {
  const { messages, streaming, error, sendMessage, loadHistory } = useChatStream({
    threadId,
    onMessageSent,
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streaming && (
          <div className="text-center py-16 text-slate-400">
            <div className="text-5xl mb-4">💬</div>
            <p className="font-medium text-slate-500">Start a conversation with MOVA</p>
            <p className="text-sm mt-1">Share how you&apos;re feeling, or ask for wellness tips.</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isLastAssistant =
            i === messages.length - 1 && msg.role === "assistant";
          return (
            <ChatBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              streaming={isLastAssistant && streaming}
            />
          );
        })}

        {error && (
          <p className="text-center text-sm text-rose-500">{error}</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={streaming} />
    </div>
  );
}
