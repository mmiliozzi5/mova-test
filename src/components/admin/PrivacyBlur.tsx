"use client";

interface Props {
  isBlurred: boolean;
  children: React.ReactNode;
}

export function PrivacyBlur({ isBlurred, children }: Props) {
  if (!isBlurred) return <>{children}</>;

  return (
    <div className="relative inline-block">
      <div className="blur-sm select-none pointer-events-none" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="bg-slate-800/80 text-white text-xs px-2 py-1 rounded-lg text-center leading-tight"
          role="status"
          aria-label="Data hidden to protect privacy"
        >
          🔒 &lt;5 responses
        </div>
      </div>
    </div>
  );
}
