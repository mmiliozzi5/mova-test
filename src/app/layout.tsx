import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "MOVA — Mental Health for Teams",
  description:
    "MOVA helps organizations support employee mental health with daily mood tracking, AI wellness chat, and anonymized insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-800">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
