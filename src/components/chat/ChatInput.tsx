"use client";

import { useState, useRef, KeyboardEvent } from "react";

interface Props {
  onSend: (content: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  return (
    <div className="border-t border-slate-100 bg-white p-4">
      <div className="flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled}
          placeholder="Share what's on your mind… (Enter to send)"
          className="flex-1 input-field resize-none min-h-[44px] max-h-40 py-2.5"
          rows={1}
          maxLength={2000}
          aria-label="Type your message"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="btn-primary px-4 py-2.5 h-[44px] flex-shrink-0"
          aria-label="Send message"
        >
          {disabled ? "…" : "Send"}
        </button>
      </div>
      <p className="text-xs text-slate-400 mt-2">
        MOVA&apos;s AI is not a therapist. In a crisis, call <strong>988</strong> (US).
      </p>
    </div>
  );
}
