"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export interface AuthUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "seller" | "admin" | "super_admin";
  sellerStatus: string;
}

export function useAuth() {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res  = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          { credentials: "include" }
        );
        if (!res.ok) { setUser(null); return; }
        const json = await res.json();
         console.log(json)
        setUser(json.user);
      } catch { setUser(null); }
      finally   { setLoading(false); }
    };
    fetchMe();
  }, []);

  return { user, loading };
}