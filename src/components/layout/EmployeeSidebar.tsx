"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/check-in", label: "Check-in", icon: "✅" },
  { href: "/chat", label: "AI Chat", icon: "💬" },
  { href: "/resources", label: "Resources", icon: "📚" },
];

export function EmployeeSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 flex flex-col z-10">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-bold text-slate-800 text-lg">MOVA</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              )}
              aria-current={active ? "page" : undefined}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors w-full"
          aria-label="Sign out"
        >
          <span className="text-lg leading-none">🚪</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
