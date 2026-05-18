// components/ChatProviderWrapper.tsx
"use client";
import React, { ReactNode } from "react";
import { ChatProvider } from "../../context/ChatContext";
// import { useAuth } from "../../../../lib/useAuth";
import { useAuth } from "@/app/context/AuthContext";

export default function ChatProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { user } = useAuth();
  // console.log(user?.uid)

  // currentUid={user?.uid}
  return <ChatProvider >{children}</ChatProvider>;
}