import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description: string;
  url?: string | null;
  type: string;
  tags: string[];
}

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  article: { label: "Article", color: "bg-blue-50 text-blue-700", icon: "📄" },
  video: { label: "Video", color: "bg-rose-50 text-rose-700", icon: "🎬" },
  tip: { label: "Tip", color: "bg-emerald-50 text-emerald-700", icon: "💡" },
};

export function ResourceCard({ title, description, url, type, tags }: Props) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.article;

  const Wrapper = url ? "a" : "div";
  const wrapperProps = url
    ? {
        href: url,
        target: "_blank" as const,
        rel: "noopener noreferrer",
        "aria-label": `${title} (opens in new tab)`,
      }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        "card flex flex-col gap-3 transition-shadow",
        url && "hover:shadow-md cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-800 leading-snug">{title}</h3>
        <span
          className={cn(
            "flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
            config.color
          )}
        >
          <span aria-hidden="true">{config.icon}</span>
          {config.label}
        </span>
      </div>

      <p className="text-sm text-slate-500 leading-relaxed flex-1">{description}</p>

      <div className="flex flex-wrap gap-1.5 mt-auto">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs"
          >
            {tag}
          </span>
        ))}
      </div>

      {url && (
        <span className="text-xs text-blue-600 font-medium mt-1">
          Read more →
        </span>
      )}
    </Wrapper>
  );
}
