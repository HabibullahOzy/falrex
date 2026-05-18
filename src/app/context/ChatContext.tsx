"use client";
import {
  createContext, useContext, useState, useEffect,
  useRef, useCallback, ReactNode,
} from "react";
import { io, Socket }   from "socket.io-client";
import Cookies          from "js-cookie";
import { useAuth }      from "../context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Types ──────────────────────────────────────────────────────────────────
export interface ChatMessage {
  _id:          string;
  roomId:       string;
  senderId:     string;
  senderName:   string;
  senderRole:   string;
  senderAvatar: string;
  receiverId:   string;
  receiverName: string;
  content:      string;
  type:         "text" | "image" | "file" | "system";
  fileUrl:      string;
  fileName:     string;
  isRead:       boolean;
  isDeleted:    boolean;
  reactions:    { uid: string; emoji: string }[];
  replyTo:      { messageId: string; content: string; senderName: string } | null;
  createdAt:    string;
}

export interface Conversation {
  _id:          string;
  roomId:       string;
  participants: { uid: string; name: string; role: string; avatar: string; email: string }[];
  lastMessage:  { content: string; senderId: string; senderName: string; createdAt: string; type: string };
  unreadCount:  Record<string, number>;
  updatedAt:    string;
}

export interface ChatUser {
  uid:    string;
  name:   string;
  email:  string;
  role:   string;
  avatar: string;
}

interface Notification {
  roomId:  string;
  message: ChatMessage;
  from:    { uid: string; name: string; role: string };
}

interface ChatContextType {
  // State
  socket:           Socket | null;
  isConnected:      boolean;
  onlineUsers:      string[];
  conversations:    Conversation[];
  activeRoomId:     string | null;
  activeConv:       Conversation | null;
  messages:         ChatMessage[];
  typingUsers:      Record<string, string>; // uid → name
  notifications:    Notification[];
  unreadTotal:      number;
  messagesLoading:  boolean;
  convsLoading:     boolean;
  hasMoreMessages:  boolean;
  replyTo:          ChatMessage | null;

  // Actions
  joinRoom:          (roomId: string) => void;
  leaveRoom:         (roomId: string) => void;
  sendMessage:       (receiverId: string, content: string, opts?: SendOpts) => void;
  startTyping:       (roomId: string) => void;
  stopTyping:        (roomId: string) => void;
  markRead:          (roomId: string, senderId: string) => void;
  deleteMessage:     (messageId: string, roomId: string) => void;
  reactToMessage:    (messageId: string, roomId: string, emoji: string) => void;
  loadMoreMessages:  () => Promise<void>;
  setActiveRoomId:   (id: string | null) => void;
  setReplyTo:        (msg: ChatMessage | null) => void;
  clearNotifications:() => void;
  refreshConversations: () => Promise<void>;
  startChat:         (targetUid: string) => Promise<string | null>;
}

interface SendOpts {
  receiverName?: string;
  type?:         "text" | "image" | "file";
  fileUrl?:      string;
  fileName?:     string;
  replyTo?:      { messageId: string; content: string; senderName: string } | null;
}

const ChatCtx = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useAuth();

  const [socket,          setSocket]          = useState<Socket | null>(null);
  const [isConnected,     setIsConnected]     = useState(false);
  const [onlineUsers,     setOnlineUsers]     = useState<string[]>([]);
  const [conversations,   setConversations]   = useState<Conversation[]>([]);
  const [activeRoomId,    setActiveRoomId]    = useState<string | null>(null);
  const [messages,        setMessages]        = useState<ChatMessage[]>([]);
  const [typingUsers,     setTypingUsers]     = useState<Record<string, string>>({});
  const [notifications,   setNotifications]   = useState<Notification[]>([]);
  const [unreadTotal,     setUnreadTotal]     = useState(0);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [convsLoading,    setConvsLoading]    = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [messagePage,     setMessagePage]     = useState(1);
  const [replyTo,         setReplyTo]         = useState<ChatMessage | null>(null);

  const activeRoomRef = useRef<string | null>(null);
  const socketRef     = useRef<Socket | null>(null);

  useEffect(() => { activeRoomRef.current = activeRoomId; }, [activeRoomId]);

  // ── Derived ───────────────────────────────────────────────────────────
  const activeConv = conversations.find((c) => c.roomId === activeRoomId) || null;

  // ── Init socket ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const token = Cookies.get("auth_token");
    if (!token) return;

    const s = io(API, {
      auth:            { token },
      withCredentials: true,
      transports:      ["websocket", "polling"],
      reconnection:    true,
      reconnectionDelay:    1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = s;
    setSocket(s);

    s.on("connect",    () => { setIsConnected(true);  console.log("✅ Chat connected"); });
    s.on("disconnect", () => { setIsConnected(false); console.log("❌ Chat disconnected"); });

    s.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
      setIsConnected(false);
    });

    s.on("users:online", (uids: string[]) => setOnlineUsers(uids));

    s.on("user:status", ({ uid, online }: { uid: string; online: boolean }) => {
      setOnlineUsers((prev) =>
        online ? [...new Set([...prev, uid])] : prev.filter((u) => u !== uid)
      );
    });

    s.on("message:receive", (msg: ChatMessage) => {
      if (msg.roomId === activeRoomRef.current) {
        setMessages((prev) => {
          if (prev.find((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        // Auto-mark read if currently viewing
        if (msg.senderId !== user.uid) {
          s.emit("messages:read", { roomId: msg.roomId, senderId: msg.senderId });
        }
      }
      // Update conversations
      setConversations((prev) =>
        prev
          .map((c) =>
            c.roomId === msg.roomId
              ? {
                  ...c,
                  lastMessage: {
                    content:    msg.content,
                    senderId:   msg.senderId,
                    senderName: msg.senderName,
                    createdAt:  msg.createdAt,
                    type:       msg.type,
                  },
                  updatedAt: msg.createdAt,
                }
              : c
          )
          .sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
      );
    });

    s.on("message:notification", (notif: Notification) => {
      if (notif.roomId !== activeRoomRef.current) {
        setNotifications((prev) => [notif, ...prev.slice(0, 9)]);
        setUnreadTotal((prev) => prev + 1);
      }
    });

    s.on("message:deleted", ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, content: "This message was deleted." }
            : m
        )
      );
    });

    s.on("message:reacted", ({ messageId, reactions }: any) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))
      );
    });

    s.on("typing:start", ({ uid, name, roomId }: any) => {
      if (roomId === activeRoomRef.current && uid !== user.uid) {
        setTypingUsers((prev) => ({ ...prev, [uid]: name }));
      }
    });

    s.on("typing:stop", ({ uid }: any) => {
      setTypingUsers((prev) => { const n = { ...prev }; delete n[uid]; return n; });
    });

    s.on("messages:read", ({ roomId }: { roomId: string }) => {
      if (roomId === activeRoomRef.current) {
        setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      }
    });

    loadConversations();

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [isLoggedIn, user?.uid]);

  // ── Load conversations ─────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    setConvsLoading(true);
    try {
      const res  = await fetch(`${API}/chat/conversations`, { credentials: "include" });
      const json = await res.json();
      if (json.success) setConversations(json.data);
    } catch {} finally { setConvsLoading(false); }
  }, []);

  const refreshConversations = loadConversations;

  // ── Load messages ──────────────────────────────────────────────────────
  const loadMessages = useCallback(async (roomId: string, page = 1) => {
    setMessagesLoading(true);
    try {
      const res  = await fetch(
        `${API}/chat/messages/${roomId}?page=${page}&limit=30`,
        { credentials: "include" }
      );
      const json = await res.json();
      if (json.success) {
        if (page === 1) {
          setMessages(json.data);
        } else {
          setMessages((prev) => [...json.data, ...prev]);
        }
        setHasMoreMessages(json.page < json.pages);
        setMessagePage(page);
      }
    } catch {} finally { setMessagesLoading(false); }
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (!activeRoomId || !hasMoreMessages) return;
    await loadMessages(activeRoomId, messagePage + 1);
  }, [activeRoomId, hasMoreMessages, messagePage, loadMessages]);

  // ── Join room ──────────────────────────────────────────────────────────
  const joinRoom = useCallback((roomId: string) => {
    if (activeRoomId && activeRoomId !== roomId) {
      socketRef.current?.emit("room:leave", { roomId: activeRoomId });
    }
    socketRef.current?.emit("room:join", { roomId });
    setActiveRoomId(roomId);
    setMessages([]);
    setTypingUsers({});
    setMessagePage(1);
    loadMessages(roomId, 1);

    // Update unread
    setConversations((prev) =>
      prev.map((c) =>
        c.roomId === roomId
          ? { ...c, unreadCount: { ...c.unreadCount, [user?.uid || ""]: 0 } }
          : c
      )
    );
    setUnreadTotal((prev) => Math.max(0, prev - 1));
  }, [activeRoomId, loadMessages, user?.uid]);

  const leaveRoom = useCallback((roomId: string) => {
    socketRef.current?.emit("room:leave", { roomId });
    setActiveRoomId(null);
    setMessages([]);
    setTypingUsers({});
  }, []);

  // ── Send message ───────────────────────────────────────────────────────
  const sendMessage = useCallback((
    receiverId: string,
    content:    string,
    opts:       SendOpts = {}
  ) => {
    if (!content.trim() || !socketRef.current) return;
    socketRef.current.emit("message:send", {
      receiverId,
      content,
      type:         opts.type        || "text",
      fileUrl:      opts.fileUrl     || "",
      fileName:     opts.fileName    || "",
      receiverName: opts.receiverName|| "",
      replyTo:      opts.replyTo     || null,
    });
    setReplyTo(null);
  }, []);

  // ── Typing ─────────────────────────────────────────────────────────────
  const startTyping = useCallback((roomId: string) => {
    socketRef.current?.emit("typing:start", { roomId });
  }, []);

  const stopTyping = useCallback((roomId: string) => {
    socketRef.current?.emit("typing:stop", { roomId });
  }, []);

  // ── Read ───────────────────────────────────────────────────────────────
  const markRead = useCallback((roomId: string, senderId: string) => {
    socketRef.current?.emit("messages:read", { roomId, senderId });
  }, []);

  // ── Delete ─────────────────────────────────────────────────────────────
  const deleteMessage = useCallback((messageId: string, roomId: string) => {
    socketRef.current?.emit("message:delete", { messageId, roomId });
  }, []);

  // ── React ──────────────────────────────────────────────────────────────
  const reactToMessage = useCallback((messageId: string, roomId: string, emoji: string) => {
    socketRef.current?.emit("message:react", { messageId, roomId, emoji });
  }, []);

  // ── Start new chat ─────────────────────────────────────────────────────
  const startChat = useCallback(async (targetUid: string): Promise<string | null> => {
    try {
      const res  = await fetch(`${API}/chat/room`, {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetUid }),
      });
      const json = await res.json();
      if (json.success) {
        await loadConversations();
        return json.data.roomId;
      }
      return null;
    } catch { return null; }
  }, [loadConversations]);

  return (
    <ChatCtx.Provider value={{
      socket, isConnected, onlineUsers,
      conversations, activeRoomId, activeConv,
      messages, typingUsers, notifications,
      unreadTotal, messagesLoading, convsLoading,
      hasMoreMessages, replyTo,
      joinRoom, leaveRoom, sendMessage,
      startTyping, stopTyping, markRead,
      deleteMessage, reactToMessage,
      loadMoreMessages, setActiveRoomId, setReplyTo,
      clearNotifications: () => { setNotifications([]); setUnreadTotal(0); },
      refreshConversations,
      startChat,
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