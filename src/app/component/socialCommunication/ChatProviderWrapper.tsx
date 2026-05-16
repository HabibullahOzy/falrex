// components/ChatProviderWrapper.tsx
"use client";
import { ChatProvider } from "../../context/ChatContext";
import { useAuth } from "../../../../lib/useAuth";

export default function ChatProviderWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return <ChatProvider currentUid={user?.uid}>{children}</ChatProvider>;
}