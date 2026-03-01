import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl -mt-4 -ml-4">
      <div className="px-8 pt-8 pb-4 border-b border-slate-100 bg-slate-50">
        <h1 className="text-2xl font-bold text-slate-800">AI Wellness Chat</h1>
        <p className="text-slate-500 text-sm mt-1">
          A private space to process emotions and explore coping strategies.
        </p>
      </div>
      <div className="flex-1 overflow-hidden bg-white">
        <ChatWindow />
      </div>
    </div>
  );
}
