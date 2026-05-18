"use client";
import {
  useState, useEffect, useRef,
  useCallback, useMemo,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useChat }   from "../context/ChatContext";
import { useAuth }   from "../context/AuthContext";
import {
  Search, X, Send, Loader2,
  ChevronLeft, MoreVertical,
  Trash2, Smile, Reply,
  Check, CheckCheck, Circle,
  MessageSquare, Plus, Phone,
  Video, Info, Image,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Helpers ────────────────────────────────────────────────────────────────
function formatTime(d: string) {
  if (!d) return "";
  const date = new Date(d);
  const now  = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60000)    return "Just now";
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return date.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: true });
  if (diff < 604800000)return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][date.getDay()];
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function msgTime(d: string) {
  return new Date(d).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function getInitials(name: string) {
  return (name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const ROLE_COLOR: Record<string, string> = {
  superadmin: "bg-purple-600",
  admin:      "bg-blue-600",
  seller:     "bg-green-600",
  user:       "bg-gray-400",
};

const EMOJI_LIST = ["👍","❤️","😂","😮","😢","🔥","✅","👏"];

// ── Avatar ─────────────────────────────────────────────────────────────────
function Avatar({
  name, role, size = "md", online = false,
}: {
  name: string; role?: string;
  size?: "xs" | "sm" | "md" | "lg";
  online?: boolean;
}) {
  const sizeMap = {
    xs: "w-7 h-7 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };
  const color = ROLE_COLOR[role || "user"] || "bg-gray-400";

  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizeMap[size]} ${color} rounded-full flex items-center justify-center font-bold text-white`}>
        {getInitials(name)}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────
function MessageBubble({
  msg, isOwn, showAvatar, senderName,
  onDelete, onReply, onReact, currentUid,
}: {
  msg: any; isOwn: boolean; showAvatar: boolean; senderName: string;
  onDelete: () => void; onReply: () => void;
  onReact: (emoji: string) => void; currentUid: string;
}) {
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false); setEmojiOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Group reactions
  const reactionGroups = useMemo(() => {
    const map: Record<string, string[]> = {};
    (msg.reactions || []).forEach((r: any) => {
      if (!map[r.emoji]) map[r.emoji] = [];
      map[r.emoji].push(r.uid);
    });
    return map;
  }, [msg.reactions]);

  const myReaction = msg.reactions?.find((r: any) => r.uid === currentUid)?.emoji;

  if (msg.isDeleted) {
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} px-4 py-0.5`}>
        <p className="text-xs text-gray-400 italic bg-gray-100 px-3 py-1.5 rounded-full">
          🚫 Message deleted
        </p>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 px-4 py-0.5 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}>

      {/* Avatar */}
      {showAvatar ? (
        <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center
                          text-[10px] font-bold text-white ${ROLE_COLOR[msg.senderRole] || "bg-gray-400"}`}>
          {getInitials(senderName)}
        </div>
      ) : <div className="w-7 flex-shrink-0" />}

      {/* Content */}
      <div className={`relative max-w-[72%] sm:max-w-[60%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>

        {/* Sender name */}
        {showAvatar && !isOwn && (
          <span className="text-[10px] font-semibold text-gray-400 ml-1 mb-0.5 capitalize">
            {senderName} · {msg.senderRole}
          </span>
        )}

        {/* Reply preview */}
        {msg.replyTo?.messageId && (
          <div className={`text-[10px] text-gray-500 border-l-2 border-gray-300 pl-2 mb-1
                           bg-gray-50 rounded-r-lg px-2 py-1 max-w-full ${isOwn ? "border-purple-400" : ""}`}>
            <p className="font-semibold text-gray-600">{msg.replyTo.senderName}</p>
            <p className="line-clamp-1">{msg.replyTo.content}</p>
          </div>
        )}

        {/* Bubble */}
        <div className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                         break-words ${
          isOwn
            ? "bg-purple-600 text-white rounded-br-sm"
            : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
        }`}>
          {msg.content}

          {/* Actions on hover */}
          <div ref={menuRef}
            className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1
                         opacity-0 group-hover:opacity-100 transition-opacity ${
              isOwn ? "-left-20" : "-right-20"
            }`}>

            {/* Emoji */}
            <div className="relative">
              <button
                onClick={() => { setEmojiOpen(!emojiOpen); setMenuOpen(false); }}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200
                           flex items-center justify-center transition text-gray-500"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>
              {emojiOpen && (
                <div className={`absolute bottom-full mb-1 flex gap-1 bg-white border
                                 border-gray-200 rounded-2xl shadow-xl p-1.5 z-20 ${
                  isOwn ? "right-0" : "left-0"
                }`}>
                  {EMOJI_LIST.map((e) => (
                    <button key={e} onClick={() => { onReact(e); setEmojiOpen(false); }}
                      className={`text-base hover:scale-125 transition-transform p-0.5
                                  rounded-full ${myReaction === e ? "bg-purple-100" : ""}`}>
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reply */}
            <button onClick={() => { onReply(); setMenuOpen(false); }}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200
                         flex items-center justify-center transition text-gray-500">
              <Reply className="w-3.5 h-3.5" />
            </button>

            {/* More */}
            {isOwn && (
              <div className="relative">
                <button onClick={() => { setMenuOpen(!menuOpen); setEmojiOpen(false); }}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200
                             flex items-center justify-center transition text-gray-500">
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
                {menuOpen && (
                  <div className={`absolute bottom-full mb-1 bg-white border border-gray-200
                                   rounded-xl shadow-xl py-1 z-20 min-w-[120px] ${
                    isOwn ? "right-0" : "left-0"
                  }`}>
                    <button onClick={() => { onDelete(); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs
                                 text-red-600 hover:bg-red-50 transition">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reactions display */}
        {Object.keys(reactionGroups).length > 0 && (
          <div className={`flex gap-1 mt-1 flex-wrap ${isOwn ? "justify-end" : "justify-start"}`}>
            {Object.entries(reactionGroups).map(([emoji, uids]) => (
              <button
                key={emoji}
                onClick={() => onReact(emoji)}
                className={`text-[11px] px-1.5 py-0.5 rounded-full border flex items-center gap-0.5
                             transition ${myReaction === emoji
                  ? "bg-purple-100 border-purple-300"
                  : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                {emoji} <span className="text-gray-600 font-medium">{uids.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Timestamp + read status */}
        <div className={`flex items-center gap-1 mt-0.5 px-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-gray-400">{msgTime(msg.createdAt)}</span>
          {isOwn && !msg.isDeleted && (
            msg.isRead
              ? <CheckCheck className="w-3 h-3 text-blue-400" />
              : <Check      className="w-3 h-3 text-gray-300" />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Typing indicator ───────────────────────────────────────────────────────
function TypingIndicator({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  return (
    <div className="flex items-center gap-2 px-6 py-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
      <span className="text-xs text-gray-400">
        {names.join(", ")} {names.length === 1 ? "is" : "are"} typing…
      </span>
    </div>
  );
}

// ── Date separator ─────────────────────────────────────────────────────────
function DateSeparator({ date }: { date: string }) {
  const d = new Date(date);
  const now = new Date();
  const isToday     = d.toDateString() === now.toDateString();
  const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === d.toDateString();
  const label = isToday ? "Today"
    : isYesterday ? "Yesterday"
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

// ── Conversation item ──────────────────────────────────────────────────────
function ConvItem({
  conv, currentUid, isActive, onClick, onlineUsers,
}: {
  conv: any; currentUid: string; isActive: boolean;
  onClick: () => void; onlineUsers: string[];
}) {
  const other  = conv.participants?.find((p: any) => p.uid !== currentUid);
  const unread = conv.unreadCount?.[currentUid] || 0;
  const online = onlineUsers.includes(other?.uid || "");

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition
                  border-b border-gray-50 hover:bg-gray-50 ${
        isActive ? "bg-purple-50 border-l-[3px] border-l-purple-600" : ""
      }`}
    >
      <Avatar
        name={other?.name || "?"}
        role={other?.role}
        size="md"
        online={online}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={`text-sm truncate font-semibold ${isActive ? "text-purple-700" : "text-gray-800"}`}>
            {other?.name || "Unknown"}
          </p>
          <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
            {formatTime(conv.lastMessage?.createdAt)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-gray-500 truncate flex-1">
            {conv.lastMessage?.senderId === currentUid && (
              <span className="text-gray-400">You: </span>
            )}
            {conv.lastMessage?.content || "Start a conversation"}
          </p>
          {unread > 0 && (
            <span className="ml-2 flex-shrink-0 w-5 h-5 bg-purple-600 text-white
                             text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${
            other?.role === "admin"      ? "bg-blue-100 text-blue-600"   :
            other?.role === "superadmin" ? "bg-purple-100 text-purple-600":
            other?.role === "seller"     ? "bg-green-100 text-green-600" :
            "bg-gray-100 text-gray-500"
          }`}>
            {other?.role}
          </span>
          {online && <span className="text-[9px] text-green-600 font-medium">● Online</span>}
        </div>
      </div>
    </button>
  );
}

// ── New Chat Modal ─────────────────────────────────────────────────────────
function NewChatModal({
  onClose, onStartChat,
}: {
  onClose: () => void;
  onStartChat: (uid: string) => void;
}) {
  const [search,  setSearch]  = useState("");
  const [users,   setUsers]   = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res  = await fetch(
          `${API}/chat/users?search=${encodeURIComponent(search)}`,
          { credentials: "include" }
        );
        const json = await res.json();
        if (json.success) setUsers(json.data);
      } catch {}
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">New Conversation</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm
                         outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-6">No users found</p>
            ) : (
              users.map((u) => (
                <button key={u.uid} onClick={() => onStartChat(u.uid)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                             hover:bg-purple-50 transition text-left">
                  <Avatar name={u.name} role={u.role} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    ROLE_COLOR[u.role] ? `${ROLE_COLOR[u.role]} text-white` : "bg-gray-100 text-gray-500"
                  }`}>
                    {u.role}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN CHAT PAGE ─────────────────────────────────────────────────────────
export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    isConnected, onlineUsers, conversations, activeRoomId,
    activeConv, messages, typingUsers, unreadTotal,
    messagesLoading, convsLoading, hasMoreMessages, replyTo,
    joinRoom, leaveRoom, sendMessage, startTyping, stopTyping,
    deleteMessage, reactToMessage, loadMoreMessages,
    setReplyTo, clearNotifications, startChat,
  } = useChat();

  const router       = useRouter();
  const searchParams = useSearchParams();

  const [inputText,     setInputText]     = useState("");
  const [convSearch,    setConvSearch]     = useState("");
  const [mobileShowChat,setMobileShowChat] = useState(false);
  const [newChatOpen,   setNewChatOpen]    = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesTopRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);
  const typingTimer    = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef    = useRef(false);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Open chat from URL param ?room=
  useEffect(() => {
    const room = searchParams.get("room");
    if (room && !activeRoomId) {
      joinRoom(room);
      setMobileShowChat(true);
    }
  }, [searchParams]);

  // Other participant
  const otherParticipant = activeConv?.participants?.find(
    (p) => p.uid !== user?.uid
  );

  // Filtered conversations
  const filteredConvs = conversations.filter((c) => {
    if (!convSearch) return true;
    const other = c.participants?.find((p) => p.uid !== user?.uid);
    return (
      other?.name?.toLowerCase().includes(convSearch.toLowerCase()) ||
      other?.email?.toLowerCase().includes(convSearch.toLowerCase())
    );
  });

  // Typing handler with debounce
  const handleInput = (val: string) => {
    setInputText(val);
    if (!activeRoomId) return;

    if (!isTypingRef.current) {
      startTyping(activeRoomId);
      isTypingRef.current = true;
    }

    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      stopTyping(activeRoomId!);
      isTypingRef.current = false;
    }, 1500);
  };

  // Send message
  const handleSend = useCallback(() => {
    if (!inputText.trim() || !activeRoomId || !otherParticipant) return;
    sendMessage(otherParticipant.uid, inputText.trim(), {
      receiverName: otherParticipant.name,
      replyTo:      replyTo
        ? { messageId: replyTo._id, content: replyTo.content, senderName: replyTo.senderName }
        : null,
    });
    setInputText("");
    if (activeRoomId) { stopTyping(activeRoomId); isTypingRef.current = false; }
    inputRef.current?.focus();
  }, [inputText, activeRoomId, otherParticipant, sendMessage, replyTo, stopTyping]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Start new chat
  const handleStartChat = async (targetUid: string) => {
    setNewChatOpen(false);
    const roomId = await startChat(targetUid);
    if (roomId) { joinRoom(roomId); setMobileShowChat(true); }
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: any[] }[] = [];
    let lastDate = "";
    messages.forEach((msg) => {
      const d = new Date(msg.createdAt).toDateString();
      if (d !== lastDate) { groups.push({ date: msg.createdAt, messages: [] }); lastDate = d; }
      groups[groups.length - 1].messages.push(msg);
    });
    return groups;
  }, [messages]);

  const typingNames = Object.values(typingUsers);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push("/login?redirect=/chat");
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ════════════════════════════════════
          LEFT — Conversation list
      ════════════════════════════════════ */}
      <aside className={`
        flex flex-col bg-white border-r border-gray-100
        w-full sm:w-80 lg:w-[360px] flex-shrink-0
        ${mobileShowChat ? "hidden sm:flex" : "flex"}
      `}>

        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <h1 className="font-bold text-gray-800">Messages</h1>
              {unreadTotal > 0 && (
                <span className="w-5 h-5 bg-purple-600 text-white text-[10px] font-bold
                                 rounded-full flex items-center justify-center">
                  {unreadTotal}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {/* Connection status */}
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                isConnected ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
              }`}>
                <Circle className="w-2 h-2 fill-current" />
                {isConnected ? "Online" : "Offline"}
              </div>
              {/* New chat */}
              <button onClick={() => setNewChatOpen(true)}
                className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center
                           justify-center hover:bg-purple-700 transition">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-xl
                         outline-none focus:ring-2 focus:ring-purple-200 transition"
            />
            {convSearch && (
              <button onClick={() => setConvSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="space-y-1 p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="h-2.5 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
              <MessageSquare className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-sm font-semibold text-gray-500">
                {convSearch ? "No matching conversations" : "No conversations yet"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Click <span className="text-purple-600 font-semibold">+</span> to start a new chat
              </p>
            </div>
          ) : (
            filteredConvs.map((conv) => (
              <ConvItem
                key={conv.roomId}
                conv={conv}
                currentUid={user.uid}
                isActive={activeRoomId === conv.roomId}
                onClick={() => { joinRoom(conv.roomId); setMobileShowChat(true); }}
                onlineUsers={onlineUsers}
              />
            ))
          )}
        </div>

        {/* My info */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
          <Avatar name={user.fullName} role={user.role} size="sm" online />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate">{user.fullName}</p>
            <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full" />
        </div>
      </aside>

      {/* ════════════════════════════════════
          RIGHT — Chat window
      ════════════════════════════════════ */}
      <div className={`
        flex-1 flex flex-col overflow-hidden
        ${!mobileShowChat ? "hidden sm:flex" : "flex"}
      `}>

        {activeRoomId && otherParticipant ? (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-gray-100 px-4 py-3
                            flex items-center gap-3 shadow-sm flex-shrink-0">

              {/* Mobile back */}
              <button className="sm:hidden w-9 h-9 rounded-xl hover:bg-gray-100
                                  flex items-center justify-center transition"
                onClick={() => { setMobileShowChat(false); leaveRoom(activeRoomId); }}>
                <ChevronLeft className="w-5 h-5" />
              </button>

              <Avatar
                name={otherParticipant.name}
                role={otherParticipant.role}
                size="md"
                online={onlineUsers.includes(otherParticipant.uid)}
              />

              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm">{otherParticipant.name}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${
                    ROLE_COLOR[otherParticipant.role]
                      ? `${ROLE_COLOR[otherParticipant.role]} text-white`
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {otherParticipant.role}
                  </span>
                  <span className={`text-xs ${
                    onlineUsers.includes(otherParticipant.uid) ? "text-green-600" : "text-gray-400"
                  }`}>
                    {onlineUsers.includes(otherParticipant.uid) ? "● Online" : "○ Offline"}
                  </span>
                  {otherParticipant.email && (
                    <span className="text-[10px] text-gray-400 hidden sm:inline truncate">
                      {otherParticipant.email}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center
                                   justify-center transition text-gray-500">
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-3 space-y-0.5 bg-gray-50">

              {/* Load more */}
              {hasMoreMessages && (
                <div className="flex justify-center py-2">
                  <button onClick={loadMoreMessages}
                    disabled={messagesLoading}
                    className="text-xs text-purple-600 font-semibold bg-white border
                               border-gray-200 px-4 py-2 rounded-full hover:bg-purple-50 transition">
                    {messagesLoading ? "Loading..." : "Load older messages"}
                  </button>
                </div>
              )}

              {messagesLoading && messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center
                                  justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-600">No messages yet</p>
                  <p className="text-xs text-gray-400 mt-1">Say hi to {otherParticipant.name}! 👋</p>
                </div>
              ) : (
                groupedMessages.map((group) => (
                  <div key={group.date}>
                    <DateSeparator date={group.date} />
                    {group.messages.map((msg, idx) => {
                      const isOwn      = msg.senderId === user.uid;
                      const prevMsg    = group.messages[idx - 1];
                      const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
                      const senderName = isOwn
                        ? user.fullName
                        : otherParticipant.name;

                      return (
                        <MessageBubble
                          key={msg._id || idx}
                          msg={msg}
                          isOwn={isOwn}
                          showAvatar={showAvatar}
                          senderName={senderName}
                          currentUid={user.uid}
                          onDelete={() => deleteMessage(msg._id, activeRoomId)}
                          onReply={() => setReplyTo(msg)}
                          onReact={(emoji) => reactToMessage(msg._id, activeRoomId, emoji)}
                        />
                      );
                    })}
                  </div>
                ))
              )}

              {/* Typing */}
              <TypingIndicator names={typingNames} />

              <div ref={messagesEndRef} />
            </div>

            {/* Reply preview */}
            {replyTo && (
              <div className="px-4 py-2 bg-purple-50 border-t border-purple-100
                              flex items-start gap-3">
                <div className="flex-1 min-w-0 border-l-2 border-purple-400 pl-3">
                  <p className="text-xs font-bold text-purple-700">{replyTo.senderName}</p>
                  <p className="text-xs text-gray-600 line-clamp-1">{replyTo.content}</p>
                </div>
                <button onClick={() => setReplyTo(null)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input */}
            <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => { handleInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${otherParticipant.name}…`}
                    rows={1}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl
                               text-sm outline-none focus:ring-2 focus:ring-purple-200
                               focus:border-purple-300 transition resize-none
                               max-h-32 leading-relaxed"
                    style={{ height: "auto" }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="w-11 h-11 flex items-center justify-center rounded-2xl
                             bg-purple-600 hover:bg-purple-700 text-white transition
                             shadow-md shadow-purple-200 disabled:opacity-40
                             disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center bg-gray-50 px-4">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center
                            justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-700">Your Messages</h2>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">
              Select a conversation from the left or start a new one.
            </p>
            <button onClick={() => setNewChatOpen(true)}
              className="mt-4 flex items-center gap-2 px-6 py-3 bg-purple-600 text-white
                         rounded-xl font-bold text-sm hover:bg-purple-700 transition">
              <Plus className="w-4 h-4" /> Start New Chat
            </button>
            <div className={`mt-4 flex items-center gap-2 text-xs font-medium ${
              isConnected ? "text-green-600" : "text-red-500"
            }`}>
              <Circle className="w-2 h-2 fill-current" />
              {isConnected ? "Connected to chat server" : "Connecting…"}
            </div>
          </div>
        )}
      </div>

      {/* New chat modal */}
      {newChatOpen && (
        <NewChatModal
          onClose={() => setNewChatOpen(false)}
          onStartChat={handleStartChat}
        />
      )}
    </div>
  );
}