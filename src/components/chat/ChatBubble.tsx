import { cn } from "@/lib/utils";

interface Props {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export function ChatBubble({ role, content, streaming }: Props) {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium",
          isUser ? "bg-blue-600 text-white" : "bg-violet-100 text-violet-600"
        )}
        aria-hidden="true"
      >
        {isUser ? "U" : "M"}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-blue-600 text-white rounded-tr-sm"
            : "bg-violet-50 text-slate-800 border border-violet-100 rounded-tl-sm"
        )}
      >
        {content || (
          <span className="flex gap-1 items-center h-4">
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        )}
        {streaming && content && (
          <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 animate-pulse" />
        )}
      </div>
    </div>
  );
}
