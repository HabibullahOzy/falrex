"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Loader2 } from "lucide-react";
import { useAuth } from "../../../../lib/useAuth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ChatButton({
  targetUid, targetName, targetRole = "seller",
}: {
  targetUid: string; targetName: string; targetRole?: string;
}) {
  const { user }  = useAuth();
  const router    = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChat = async () => {
    if (!user) { router.push("/login"); return; }
    // console.log(user)
    setLoading(true);
    try {
      const res  = await fetch(`${API}/chat/room`, {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetUid, targetName, targetRole }),
      });
      const json = await res.json();
      if (json.success) router.push(`/chattingsite`);
    } catch { }
    finally { setLoading(false); }
  };

  return (
    <button onClick={handleChat} disabled={loading}
      className="flex-1 flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold hover:bg-gray-50 disabled:opacity-50 transition">
      {loading
        ? <Loader2 className="w-4 h-4 animate-spin" />
        : <MessageSquare className="w-4 h-4" />
      }
      Chat Now
    </button>
  );
}