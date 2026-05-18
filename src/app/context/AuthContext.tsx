// // "use client";
// // import {
// //   createContext, useContext, useState,
// //   useEffect, useCallback, ReactNode,
// // } from "react";
// // import { auth } from "../../../lib/firebase";
// // import { onAuthStateChanged } from "firebase/auth";
// // import Cookies from "js-cookie";

// // // ── Types ──────────────────────────────────────────────────────────────────
// // export interface CurrentUser {
// //   uid:          string;
// //   email:        string;
// //   firstName:    string;
// //   lastName:     string;
// //   role:         "user" | "seller" | "admin" | "super_admin";
// //   status:       "active" | "banned" | "pending";
// //   avatar:       string;
// //   phone:        string;
// //   sellerStatus: "pending" | "approved" | "rejected" | null;
// //   sellerProfile: any;
// //   createdAt:    string;
// //   updatedAt:    string;
// //   // computed helpers
// //   fullName:     string;
// //   isAdmin:      boolean;
// //   isSuperAdmin: boolean;
// //   isSeller:     boolean;
// //   isUser:       boolean;
// //   isApprovedSeller: boolean;
// // }

// // interface AuthContextType {
// //   user:          CurrentUser | null;
// //   loading:       boolean;
// //   error:         string | null;
// //   isLoggedIn:    boolean;
// //   // Role helpers (quick access without checking user object)
// //   isAdmin:       boolean;
// //   isSuperAdmin:  boolean;
// //   isSeller:      boolean;
// //   isUser:        boolean;
// //   isApprovedSeller: boolean;
// //   // Methods
// //   refreshUser:   () => Promise<void>;
// //   logout:        () => Promise<void>;
// // }

// // const AuthCtx = createContext<AuthContextType | null>(null);
// // const API     = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// // // ── Build user object with helpers ────────────────────────────────────────
// // function buildUser(data: any): CurrentUser {
// //   return {
// //     ...data,
// //     fullName:         `${data.firstName} ${data.lastName || ""}`.trim(),
// //     isAdmin:          data.role === "admin",
// //     isSuperAdmin:     data.role === "super_admin",
// //     isSeller:         data.role === "seller",
// //     isUser:           data.role === "user",
// //     isApprovedSeller: data.role === "seller" && data.sellerStatus === "approved",
// //   };
// // }

// // export function AuthProvider({ children }: { children: ReactNode }) {
// //   const [user,    setUser]    = useState<CurrentUser | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error,   setError]   = useState<string | null>(null);

// //   // ── Fetch user from our API ──────────────────────────────────────────────
// //   const fetchUser = useCallback(async () => {
// //     try {
// //       const res  = await fetch(`${API}/auth/me`, {
// //         credentials: "include",
// //         cache:       "no-store",
// //       });

// //       if (res.status === 401) {
// //         setUser(null);
// //         Cookies.remove("auth_token");
// //         return;
// //       }

// //       const json = await res.json();
// //       if (json.success) {
// //         setUser(buildUser(json.data));
// //         setError(null);
// //       } else {
// //         setUser(null);
// //       }
// //     } catch (err) {
// //       setUser(null);
// //     }
// //   }, []);

// //   // ── Watch Firebase auth state ────────────────────────────────────────────
// //   useEffect(() => {
// //     const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
// //       if (firebaseUser) {
// //         // Firebase says logged in → fetch our user from DB
// //         await fetchUser();
// //       } else {
// //         // Firebase says logged out
// //         setUser(null);
// //         Cookies.remove("auth_token");
// //       }
// //       setLoading(false);
// //     });

// //     return () => unsub();
// //   }, [fetchUser]);

// //   // ── Refresh user data from server ────────────────────────────────────────
// //   const refreshUser = useCallback(async () => {
// //     await fetchUser();
// //   }, [fetchUser]);

// //   // ── Logout ────────────────────────────────────────────────────────────────
// //   const logout = useCallback(async () => {
// //     try {
// //       await fetch(`${API}/auth/logout`, {
// //         method:      "POST",
// //         credentials: "include",
// //       });
// //       await auth.signOut();
// //       setUser(null);
// //       Cookies.remove("auth_token");
// //     } catch (err) {
// //       console.error("Logout error:", err);
// //     }
// //   }, []);

// //   const value: AuthContextType = {
// //     user,
// //     loading,
// //     error,
// //     isLoggedIn:       !!user,
// //     isAdmin:          user?.role === "admin",
// //     isSuperAdmin:     user?.role === "super_admin",
// //     isSeller:         user?.role === "seller",
// //     isUser:           user?.role === "user",
// //     isApprovedSeller: user?.role === "seller" && user?.sellerStatus === "approved",
// //     refreshUser,
// //     logout,
// //   };

// //   return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
// // }

// // // ── Hook ──────────────────────────────────────────────────────────────────
// // export function useAuth() {
// //   const ctx = useContext(AuthCtx);
// //   if (!ctx) throw new Error("useAuth must be inside AuthProvider");
// //   return ctx;
// // }




// "use client";
// import {
//   createContext, useContext, useState,
//   useEffect, useCallback, ReactNode,
// } from "react";
// import { auth } from "../../../lib/firebase";
// import { onAuthStateChanged } from "firebase/auth";
// import Cookies from "js-cookie";

// // ── Types ──────────────────────────────────────────────────────────────────
// export interface CurrentUser {
//   _id:          string;
//   uid:          string;
//   email:        string;
//   firstName:    string;
//   lastName:     string;
//   role:         "user" | "seller" | "admin" | "super_admin";
//   isActive:     boolean;
//   avatar:       string;
//   phone:        string;
//   sellerStatus: "none" | "pending" | "approved" | "rejected";
//   sellerProfile: any;
//   isSellerVerified: boolean;
//   isEmailVerified:  boolean;
//   createdAt:    string;
//   updatedAt:    string;
//   // computed helpers (added by buildUser)
//   fullName:         string;
//   isAdmin:          boolean;
//   isSuperAdmin:     boolean;
//   isSeller:         boolean;
//   isUser:           boolean;
//   isApprovedSeller: boolean;
// }

// interface AuthContextType {
//   user:             CurrentUser | null;
//   loading:          boolean;
//   error:            string | null;
//   isLoggedIn:       boolean;
//   isAdmin:          boolean;
//   isSuperAdmin:     boolean;
//   isSeller:         boolean;
//   isUser:           boolean;
//   isApprovedSeller: boolean;
//   refreshUser:      () => Promise<void>;
//   logout:           () => Promise<void>;
// }

// const AuthCtx = createContext<AuthContextType | null>(null);
// const API     = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// // ── Build user object with computed helpers ───────────────────────────────
// function buildUser(data: any): CurrentUser {
//   return {
//     ...data,
//     fullName:         `${data.firstName} ${data.lastName || ""}`.trim(),
//     isAdmin:          data.role === "admin",
//     isSuperAdmin:     data.role === "super_admin",
//     isSeller:         data.role === "seller",
//     isUser:           data.role === "user",
//     isApprovedSeller: data.role === "seller" && data.sellerStatus === "approved",
//   };
// }

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user,    setUser]    = useState<CurrentUser | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error,   setError]   = useState<string | null>(null);

//   // ── Fetch user from our API ──────────────────────────────────────────────
//   const fetchUser = useCallback(async () => {
//     try {
//       const res = await fetch(`${API}/auth/me`, {
//         credentials: "include",
//         cache:       "no-store",
//       });

//       if (res.status === 401 || res.status === 403) {
//         setUser(null);
//         Cookies.remove("auth_token");
//         return;
//       }

//       if (!res.ok) {
//         // Server error — don't wipe the user, just log
//         console.error("fetchUser: server error", res.status);
//         return;
//       }

//       const json = await res.json();

//       // API returns { success, user } (not { success, data })
//       if (json.success && json.user) {
//         setUser(buildUser(json.user));
//         setError(null);
//       } else {
//         setUser(null);
//       }
//     } catch (err) {
//       console.error("fetchUser: network error", err);
//       setUser(null);
//     }
//   }, []);

//   // ── Watch Firebase auth state ────────────────────────────────────────────
//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
//       if (firebaseUser) {
//         await fetchUser();
//       } else {
//         setUser(null);
//         Cookies.remove("auth_token");
//       }
//       setLoading(false);
//     });
//     return () => unsub();
//   }, [fetchUser]);

//   const refreshUser = useCallback(async () => {
//     await fetchUser();
//   }, [fetchUser]);

//   // ── Logout ────────────────────────────────────────────────────────────────
//   const logout = useCallback(async () => {
//     try {
//       await fetch(`${API}/auth/logout`, {
//         method:      "POST",
//         credentials: "include",
//       });
//       await auth.signOut();
//     } catch (err) {
//       console.error("Logout error:", err);
//     } finally {
//       setUser(null);
//       Cookies.remove("auth_token");
//     }
//   }, []);

//   const value: AuthContextType = {
//     user,
//     loading,
//     error,
//     isLoggedIn:       !!user,
//     isAdmin:          user?.role === "admin",
//     isSuperAdmin:     user?.role === "super_admin",
//     isSeller:         user?.role === "seller",
//     isUser:           user?.role === "user",
//     isApprovedSeller: user?.role === "seller" && user?.sellerStatus === "approved",
//     refreshUser,
//     logout,
//   };

//   return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
// }

// export function useAuth() {
//   const ctx = useContext(AuthCtx);
//   if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
//   return ctx;
// }


"use client";
import {
  createContext, useContext, useState,
  useEffect, useCallback, ReactNode,
} from "react";
import { auth } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Cookies from "js-cookie";

// ── Types ──────────────────────────────────────────────────────────────────
export interface CurrentUser {
  _id:              string;
  uid:              string;
  email:            string;
  firstName:        string;
  lastName:         string;
  role:             "user" | "seller" | "admin" | "super_admin";
  isActive:         boolean;
  avatar:           string;
  phone:            string;
  sellerStatus:     "none" | "pending" | "approved" | "rejected";
  sellerProfile:    any;
  isSellerVerified: boolean;
  isEmailVerified:  boolean;
  createdAt:        string;
  updatedAt:        string;
  // computed helpers
  fullName:         string;
  isAdmin:          boolean;
  isSuperAdmin:     boolean;
  isSeller:         boolean;
  isUser:           boolean;
  isApprovedSeller: boolean;
}

interface AuthContextType {
  user:             CurrentUser | null;
  loading:          boolean;
  error:            string | null;
  isLoggedIn:       boolean;
  isAdmin:          boolean;
  isSuperAdmin:     boolean;
  isSeller:         boolean;
  isUser:           boolean;
  isApprovedSeller: boolean;
  refreshUser:      () => Promise<void>;
  logout:           () => Promise<void>;
}

const AuthCtx = createContext<AuthContextType | null>(null);

// Strip trailing slash so API + "/auth/me" never becomes "//auth/me"
const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

function buildUser(data: any): CurrentUser {
  return {
    ...data,
    fullName:         `${data.firstName} ${data.lastName || ""}`.trim(),
    isAdmin:          data.role === "admin",
    isSuperAdmin:     data.role === "super_admin",
    isSeller:         data.role === "seller",
    isUser:           data.role === "user",
    isApprovedSeller: data.role === "seller" && data.sellerStatus === "approved",
  };
}

// Send JWT both as cookie AND Authorization header.
// The header is the cross-origin fallback for dev (Railway backend <-> localhost)
// where sameSite cookie rules may block the cookie.
function authHeaders(): HeadersInit {
  const token = Cookies.get("auth_token");
  const h: HeadersInit = {};
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    // Skip fetch entirely if we have no token — avoids pointless CORS errors
    const token = Cookies.get("auth_token");
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const res = await fetch(`${API}/auth/me`, {
        credentials: "include",
        cache:       "no-store",
        headers:     authHeaders(),
      });

      if (res.status === 401 || res.status === 403) {
        setUser(null);
        Cookies.remove("auth_token");
        return;
      }

      if (!res.ok) {
        console.warn(`fetchUser: server ${res.status}`);
        return; // transient error — keep existing user state
      }

      const json = await res.json();
      if (json.success && json.user) {
        setUser(buildUser(json.user));
        setError(null);
      } else {
        setUser(null);
        Cookies.remove("auth_token");
      }
    } catch (err: any) {
      // Network/CORS failure — log but don't wipe user
      console.warn("fetchUser network error:", err?.message ?? err);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchUser();
      } else {
        setUser(null);
        Cookies.remove("auth_token");
      }
      setLoading(false);
    });
    return () => unsub();
  }, [fetchUser]);

  const refreshUser = useCallback(() => fetchUser(), [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method:      "POST",
        credentials: "include",
        headers:     authHeaders(),
      });
      await auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      Cookies.remove("auth_token");
    }
  }, []);

  const value: AuthContextType = {
    user, loading, error,
    isLoggedIn:       !!user,
    isAdmin:          user?.role === "admin",
    isSuperAdmin:     user?.role === "super_admin",
    isSeller:         user?.role === "seller",
    isUser:           user?.role === "user",
    isApprovedSeller: user?.role === "seller" && user?.sellerStatus === "approved",
    refreshUser,
    logout,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
}