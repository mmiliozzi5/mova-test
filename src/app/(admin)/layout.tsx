import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminNav } from "@/components/layout/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "ORG_ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminNav />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
