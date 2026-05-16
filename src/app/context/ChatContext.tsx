"use client";
import {
  createContext, useContext, useState,
  useEffect, useRef, useCallback, ReactNode,
} from "react";
import { getSocket, disconnectSocket } from "../../../lib/socket";
import { Socket } from "socket.io-client";
import Cookies from "js-cookie";

interface Message {
  _id:          string;
  roomId:       string;
  senderId:     string;
  senderName:   string;
  senderRole:   string;
  senderAvatar: string;
  receiverId:   string;
  receiverName: string;
  content:      string;
  type:         string;
  fileUrl:      string;
  isRead:       boolean;
  isDeleted:    boolean;
  createdAt:    string;
}

interface Conversation {
  _id:          string;
  roomId:       string;
  participants: { uid: string; name: string; role: string; avatar: string }[];
  lastMessage:  { content: string; senderId: string; createdAt: string; type: string };
  unreadCount:  Record<string, number>;
  updatedAt:    string;
}

interface Notification {
  roomId:  string;
  message: Message;
  from:    { uid: string; name: string; role: string };
}

interface ChatContextType {
  socket:            Socket | null;
  isConnected:       boolean;
  onlineUsers:       string[];
  conversations:     Conversation[];
  activeRoomId:      string | null;
  messages:          Message[];
  typingUsers:       Record<string, boolean>;
  notifications:     Notification[];
  unreadTotal:       number;
  messagesLoading:   boolean;
  // Methods
  joinRoom:         (roomId: string) => void;
  leaveRoom:        (roomId: string) => void;
  sendMessage:      (receiverId: string, content: string, receiverName?: string) => void;
  startTyping:      (roomId: string) => void;
  stopTyping:       (roomId: string) => void;
  markRead:         (roomId: string, senderId: string) => void;
  deleteMessage:    (messageId: string, roomId: string) => void;
  loadMessages:     (roomId: string) => Promise<void>;
  setActiveRoomId:  (id: string | null) => void;
  clearNotifications: () => void;
  refreshConversations: () => Promise<void>;
}

const ChatCtx = createContext<ChatContextType | null>(null);

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function ChatProvider({ children, currentUid }: { children: ReactNode; currentUid?: string }) {
  const [isConnected,     setIsConnected]     = useState(false);
  const [onlineUsers,     setOnlineUsers]     = useState<string[]>([]);
  const [conversations,   setConversations]   = useState<Conversation[]>([]);
  const [activeRoomId,    setActiveRoomId]    = useState<string | null>(null);
  const [messages,        setMessages]        = useState<Message[]>([]);
  const [typingUsers,     setTypingUsers]     = useState<Record<string, boolean>>({});
  const [notifications,   setNotifications]   = useState<Notification[]>([]);
  const [unreadTotal,     setUnreadTotal]     = useState(0);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const socketRef    = useRef<Socket | null>(null);
  const activeRoomRef = useRef<string | null>(null);

  // Keep ref in sync
  useEffect(() => { activeRoomRef.current = activeRoomId; }, [activeRoomId]);

  // ── Init socket ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUid) return;

    const s = getSocket();
    socketRef.current = s;

    s.on("connect",    () => { setIsConnected(true);  console.log("✅ Socket connected"); });
    s.on("disconnect", () => { setIsConnected(false); console.log("❌ Socket disconnected"); });

    s.on("users:online", (uids: string[]) => setOnlineUsers(uids));
    s.on("user:online",  ({ uid, online }: { uid: string; online: boolean }) => {
      setOnlineUsers((prev) =>
        online ? [...new Set([...prev, uid])] : prev.filter((u) => u !== uid)
      );
    });

    s.on("message:receive", (msg: Message) => {
      if (msg.roomId === activeRoomRef.current) {
        setMessages((prev) => {
          if (prev.find((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        // Auto mark as read if in room
        if (msg.senderId !== currentUid) {
          s.emit("messages:read", { roomId: msg.roomId, senderId: msg.senderId });
        }
      }
      // Update conversation list
      refreshConversations();
    });

    s.on("message:notification", (notif: Notification) => {
      if (notif.roomId !== activeRoomRef.current) {
        setNotifications((prev) => [notif, ...prev.slice(0, 9)]);
        setUnreadTotal((prev) => prev + 1);
      }
    });

    s.on("message:deleted", ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) => m._id === messageId
          ? { ...m, isDeleted: true, content: "This message was deleted" }
          : m
        )
      );
    });

    s.on("typing:start", ({ uid, roomId }: { uid: string; roomId: string }) => {
      if (roomId === activeRoomRef.current) {
        setTypingUsers((prev) => ({ ...prev, [uid]: true }));
      }
    });

    s.on("typing:stop", ({ uid }: { uid: string }) => {
      setTypingUsers((prev) => { const n = { ...prev }; delete n[uid]; return n; });
    });

    s.on("messages:read", ({ roomId }: { roomId: string }) => {
      if (roomId === activeRoomRef.current) {
        setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      }
    });

    // Load initial conversations
    refreshConversations();

    return () => {
      s.off("connect"); s.off("disconnect");
      s.off("users:online"); s.off("user:online");
      s.off("message:receive"); s.off("message:notification");
      s.off("message:deleted"); s.off("typing:start");
      s.off("typing:stop"); s.off("messages:read");
    };
  }, [currentUid]);

  const refreshConversations = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/chat/conversations`, { credentials: "include" });
      const json = await res.json();
      if (json.success) setConversations(json.data);
    } catch {}
  }, []);

  const loadMessages = useCallback(async (roomId: string) => {
    setMessagesLoading(true);
    try {
      const res  = await fetch(`${API}/chat/messages/${roomId}?limit=50`, { credentials: "include" });
      const json = await res.json();
      if (json.success) setMessages(json.data);
    } catch {} finally { setMessagesLoading(false); }
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    socketRef.current?.emit("room:join", { roomId });
    setActiveRoomId(roomId);
    loadMessages(roomId);
    // Reset unread
    setUnreadTotal((prev) => Math.max(0, prev - 1));
  }, [loadMessages]);

  const leaveRoom = useCallback((roomId: string) => {
    socketRef.current?.emit("room:leave", { roomId });
    setActiveRoomId(null);
    setMessages([]);
    setTypingUsers({});
  }, []);

  const sendMessage = useCallback((
    receiverId: string, content: string, receiverName = ""
  ) => {
    if (!content.trim()) return;
    socketRef.current?.emit("message:send", {
      receiverId, content, receiverName, type: "text",
    });
  }, []);

  const startTyping = useCallback((roomId: string) => {
    socketRef.current?.emit("typing:start", { roomId });
  }, []);

  const stopTyping = useCallback((roomId: string) => {
    socketRef.current?.emit("typing:stop", { roomId });
  }, []);

  const markRead = useCallback((roomId: string, senderId: string) => {
    socketRef.current?.emit("messages:read", { roomId, senderId });
  }, []);

  const deleteMessage = useCallback((messageId: string, roomId: string) => {
    socketRef.current?.emit("message:delete", { messageId, roomId });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]); setUnreadTotal(0);
  }, []);

  return (
    <ChatCtx.Provider value={{
      socket: socketRef.current, isConnected, onlineUsers,
      conversations, activeRoomId, messages, typingUsers,
      notifications, unreadTotal, messagesLoading,
      joinRoom, leaveRoom, sendMessage, startTyping, stopTyping,
      markRead, deleteMessage, loadMessages, setActiveRoomId,
      clearNotifications, refreshConversations,
    }}>
      {children}
    </ChatCtx.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error("useChat must be inside ChatProvider");
  return ctx;
}