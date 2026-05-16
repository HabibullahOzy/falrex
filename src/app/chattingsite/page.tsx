"use client";
import {
  useState, useEffect, useRef, useCallback,
} from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../../../lib/useAuth";
import {
  Send, Search, X, MessageSquare, Circle,
  Trash2, ChevronLeft, MoreVertical,
  Loader2, Check, CheckCheck,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────
function formatTime(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000)   return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000)return d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: true });
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function formatMessageTime(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function getInitials(name: string) {
  return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
}

const ROLE_COLOR: Record<string, string> = {
  seller: "bg-blue-500",
  admin:  "bg-purple-500",
  user:   "bg-gray-400",
};

// ── Online dot ─────────────────────────────────────────────────────────────
function OnlineDot({ uid, onlineUsers }: { uid: string; onlineUsers: string[] }) {
  const isOnline = onlineUsers.includes(uid);
  return (
    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
      isOnline ? "bg-green-500" : "bg-gray-300"
    }`} />
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────
function Avatar({
  name, role, size = "md", uid, onlineUsers, showStatus = false,
}: {
  name: string; role?: string; size?: "sm" | "md" | "lg";
  uid?: string; onlineUsers?: string[]; showStatus?: boolean;
}) {
  const sz  = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-12 h-12 text-base" : "w-10 h-10 text-sm";
  const col = ROLE_COLOR[role || "user"] || "bg-gray-400";

  return (
    <div className={`relative flex-shrink-0 ${sz} rounded-full ${col} flex items-center justify-center font-bold text-white`}>
      {getInitials(name)}
      {showStatus && uid && onlineUsers && (
        <OnlineDot uid={uid} onlineUsers={onlineUsers} />
      )}
    </div>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────
function MessageBubble({
  msg, isOwn, onDelete, showAvatar, senderName,
}: {
  msg: any; isOwn: boolean; onDelete: (id: string) => void;
  showAvatar: boolean; senderName: string;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={`flex items-end gap-2 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}>

      {/* Avatar */}
      {showAvatar ? (
        <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${
          ROLE_COLOR[msg.senderRole] || "bg-gray-400"
        }`}>
          {getInitials(senderName)}
        </div>
      ) : (
        <div className="w-7 flex-shrink-0" />
      )}

      {/* Bubble */}
      <div className={`relative max-w-[70%] sm:max-w-[55%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {showAvatar && !isOwn && (
          <span className="text-[10px] text-gray-400 mb-1 ml-1">{senderName}</span>
        )}

        <div className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
          msg.isDeleted
            ? "bg-gray-100 text-gray-400 italic"
            : isOwn
              ? "bg-purple-600 text-white rounded-br-sm"
              : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
        }`}>
          {msg.content}

          {/* Delete menu */}
          {isOwn && !msg.isDeleted && (
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="absolute -left-7 top-1 opacity-0 group-hover:opacity-100 transition
                         w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
            >
              <MoreVertical className="w-3 h-3 text-gray-600" />
            </button>
          )}

          {showMenu && (
            <div className="absolute left-0 -top-8 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
              <button
                onClick={() => { onDelete(msg._id); setShowMenu(false); }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 whitespace-nowrap"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Time + read status */}
        <div className={`flex items-center gap-1 mt-0.5 px-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-gray-400">{formatMessageTime(msg.createdAt)}</span>
          {isOwn && !msg.isDeleted && (
            msg.isRead
              ? <CheckCheck className="w-3 h-3 text-blue-500" />
              : <Check className="w-3 h-3 text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Typing indicator ───────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i}
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-400">typing...</span>
    </div>
  );
}

// ── Conversation item ──────────────────────────────────────────────────────
function ConversationItem({
  conv, currentUid, isActive, onClick, onlineUsers,
}: {
  conv: any; currentUid: string; isActive: boolean;
  onClick: () => void; onlineUsers: string[];
}) {
  const other = conv.participants?.find((p: any) => p.uid !== currentUid);
  const unread = conv.unreadCount?.[currentUid] || 0;
  const isOnline = onlineUsers.includes(other?.uid || "");

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 transition text-left border-b border-gray-50 ${
        isActive ? "bg-purple-50 border-l-4 border-l-purple-600" : "hover:bg-gray-50"
      }`}
    >
      <div className="relative flex-shrink-0">
        <Avatar name={other?.name || "?"} role={other?.role} uid={other?.uid}
          onlineUsers={onlineUsers} showStatus />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm truncate font-semibold ${isActive ? "text-purple-700" : "text-gray-800"}`}>
            {other?.name || "Unknown"}
          </p>
          <span className="text-[10px] text-gray-400 flex-shrink-0">
            {formatTime(conv.lastMessage?.createdAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs text-gray-500 truncate flex-1">
            {conv.lastMessage?.senderId === currentUid ? "You: " : ""}
            {conv.lastMessage?.content || "Start a conversation"}
          </p>
          {unread > 0 && (
            <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
            other?.role === "seller" ? "bg-blue-100 text-blue-600" :
            other?.role === "admin"  ? "bg-purple-100 text-purple-600" :
            "bg-gray-100 text-gray-500"
          }`}>
            {other?.role}
          </span>
          {isOnline && (
            <span className="text-[9px] text-green-600 font-medium">● Online</span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── MAIN CHAT PAGE ─────────────────────────────────────────────────────────
export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    isConnected, onlineUsers, conversations, activeRoomId,
    messages, typingUsers, unreadTotal, messagesLoading,
    joinRoom, leaveRoom, sendMessage, startTyping, stopTyping,
    markRead, deleteMessage, setActiveRoomId, refreshConversations,
  } = useChat();

  const [inputText,      setInputText]      = useState("");
  const [searchQuery,    setSearchQuery]     = useState("");
  const [activeConv,     setActiveConv]      = useState<any>(null);
  const [mobileShowChat, setMobileShowChat]  = useState(false);

  const messagesEndRef  = useRef<HTMLDivElement>(null);
  const inputRef        = useRef<HTMLInputElement>(null);
  const typingTimerRef  = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Find active conversation details
  useEffect(() => {
    if (activeRoomId) {
      const conv = conversations.find((c) => c.roomId === activeRoomId);
      setActiveConv(conv);
    }
  }, [activeRoomId, conversations]);

  const otherParticipant = activeConv?.participants?.find(
    (p: any) => p.uid !== user?.uid
  );

  // Filtered conversations
  const filteredConvs = conversations.filter((c) => {
    const other = c.participants?.find((p: any) => p.uid !== user?.uid);
    return other?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Select a conversation
  const handleSelectConv = useCallback((conv: any) => {
    if (activeRoomId && activeRoomId !== conv.roomId) {
      leaveRoom(activeRoomId);
    }
    joinRoom(conv.roomId);
    setActiveConv(conv);
    setMobileShowChat(true);
    inputRef.current?.focus();
  }, [activeRoomId, joinRoom, leaveRoom]);

  // Send message
  const handleSend = useCallback(() => {
    if (!inputText.trim() || !activeRoomId || !otherParticipant) return;
    sendMessage(otherParticipant.uid, inputText.trim(), otherParticipant.name);
    setInputText("");
    stopTyping(activeRoomId);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    inputRef.current?.focus();
  }, [inputText, activeRoomId, otherParticipant, sendMessage, stopTyping]);

  // Typing handler
  const handleInputChange = (val: string) => {
    setInputText(val);
    if (!activeRoomId) return;
    startTyping(activeRoomId);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => stopTyping(activeRoomId), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const isTyping = Object.keys(typingUsers).some((uid) =>
    uid !== user?.uid && typingUsers[uid]
  );

  if (authLoading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="flex items-center justify-center h-screen text-center">
      <div>
        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="font-semibold text-gray-600">Sign in to chat</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ════════════════════════════════════
          LEFT SIDEBAR — Conversations
      ════════════════════════════════════ */}
      <aside className={`
        flex flex-col bg-white border-r border-gray-100 shadow-sm
        w-full sm:w-80 lg:w-96 flex-shrink-0
        ${mobileShowChat ? "hidden sm:flex" : "flex"}
      `}>

        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <h1 className="font-bold text-gray-800">Messages</h1>
              {unreadTotal > 0 && (
                <span className="w-5 h-5 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadTotal}
                </span>
              )}
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-medium ${
              isConnected ? "text-green-600" : "text-red-500"
            }`}>
              <Circle className={`w-2 h-2 fill-current`} />
              {isConnected ? "Online" : "Connecting..."}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10 text-gray-400">
              <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="text-xs mt-1">Start chatting with a seller or buyer</p>
            </div>
          ) : (
            filteredConvs.map((conv) => (
              <ConversationItem
                key={conv._id || conv.roomId}
                conv={conv}
                currentUid={user.uid}
                isActive={activeRoomId === conv.roomId}
                onClick={() => handleSelectConv(conv)}
                onlineUsers={onlineUsers}
              />
            ))
          )}
        </div>

        {/* Bottom: current user info */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <Avatar name={`${user.firstName} ${user.lastName || ""}`} role={user.role} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-gray-400">{user.role}</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full" title="Online" />
          </div>
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
            <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm flex-shrink-0">
              {/* Mobile back */}
              <button className="sm:hidden w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                onClick={() => { setMobileShowChat(false); leaveRoom(activeRoomId); }}>
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>

              <div className="relative flex-shrink-0">
                <Avatar
                  name={otherParticipant.name}
                  role={otherParticipant.role}
                  size="md"
                  uid={otherParticipant.uid}
                  onlineUsers={onlineUsers}
                  showStatus
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm">{otherParticipant.name}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    otherParticipant.role === "seller" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    {otherParticipant.role}
                  </span>
                  <span className={`text-xs ${
                    onlineUsers.includes(otherParticipant.uid) ? "text-green-600" : "text-gray-400"
                  }`}>
                    {onlineUsers.includes(otherParticipant.uid) ? "● Online" : "○ Offline"}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-50">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                  <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="text-xs mt-1">Say hello! 👋</p>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => {
                    const isOwn        = msg.senderId === user.uid;
                    const prevMsg      = messages[idx - 1];
                    const showAvatar   = !prevMsg || prevMsg.senderId !== msg.senderId;
                    const senderName   = isOwn
                      ? `${user.firstName} ${user.lastName || ""}`
                      : otherParticipant.name;

                    return (
                      <MessageBubble
                        key={msg._id || idx}
                        msg={msg}
                        isOwn={isOwn}
                        onDelete={(id) => deleteMessage(id, activeRoomId)}
                        showAvatar={showAvatar}
                        senderName={senderName}
                      />
                    );
                  })}

                  {/* Typing indicator */}
                  {isTyping && <TypingIndicator />}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${otherParticipant.name}...`}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition pr-12"
                  />
                  {inputText && (
                    <button onClick={() => setInputText("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="w-11 h-11 flex items-center justify-center rounded-2xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-40 disabled:cursor-default transition shadow-md hover:shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                Press Enter to send · Room: <span className="font-mono">{activeRoomId?.slice(0, 20)}...</span>
              </p>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 bg-gray-50">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-purple-300" />
            </div>
            <h2 className="text-lg font-bold text-gray-600">Select a conversation</h2>
            <p className="text-sm mt-1 max-w-xs">
              Choose a conversation from the left to start messaging
            </p>
            <div className={`mt-4 flex items-center gap-2 text-sm font-medium ${
              isConnected ? "text-green-600" : "text-red-500"
            }`}>
              <Circle className="w-2.5 h-2.5 fill-current" />
              {isConnected ? "Connected to chat server" : "Connecting..."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}