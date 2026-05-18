// import {
//   auth, googleProvider,
//   signInWithPopup, signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   RecaptchaVerifier, signInWithPhoneNumber,
//   signOut,
// } from "./firebase";
// import Cookies from "js-cookie";

// const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// // ── Post Firebase token to your Express backend ────────────────────────────
// async function exchangeToken(firebaseToken: string) {
//   const res = await fetch(`${API}/auth/login`, {
//     method:      "POST",
//     headers:     { "Content-Type": "application/json" },
//     credentials: "include",    // ← send/receive cookies
//     body: JSON.stringify({ firebaseToken }),
//   });
//   // console.log(res)
//   if (!res.ok) {
//     const err = await res.json();
//     throw new Error(err.message || "Login failed");
//   }
//   const data = await res.json();
//   // Also store JWT in js-cookie for client-side reads
//   if (data.token) {
//     Cookies.set("auth_token", data.token, { expires: 7, sameSite: "strict" });
//   }
//   return data;
// }

// // ── Google ─────────────────────────────────────────────────────────────────
// export async function signInWithGoogle() {
//   const result        = await signInWithPopup(auth, googleProvider);
//   const firebaseToken = await result.user.getIdToken();
//   const data          = await exchangeToken(firebaseToken);
//   // console.log(result)
//   return { user: result.user, ...data };
// }

// // ── Email Sign In ──────────────────────────────────────────────────────────
// export async function signInWithEmail(email: string, password: string) {
//   const result        = await signInWithEmailAndPassword(auth, email, password);
//   // console.log(result)
//   const firebaseToken = await result.user.getIdToken();
//   // console.log(firebaseToken)
//   const data          = await exchangeToken(firebaseToken);
//   // console.log(data)
//   return { user: result.user, ...data };
// }

// // ── Register (user or seller) ──────────────────────────────────────────────
// export async function registerUser(payload: {
//   email: string;
//   password: string;
//   firstName: string;
//   lastName?: string;
//   phone?: string;
//   role: "user" | "seller";
//   businessName?: string;
//   businessType?: string;
//   businessCategory?: string;
//   country?: string;
//   address?: string;
//   website?: string;
//   description?: string;
//   taxId?: string;
//   tradeLicense?: string;
// }) {
//   const { email, password, ...rest } = payload;

//   // Step 1: Create in Firebase
//   const result        = await createUserWithEmailAndPassword(auth, email, password);
//   const firebaseToken = await result.user.getIdToken();

//   // Step 2: Register in your MongoDB via Express
//   const res = await fetch(`${API}/auth/register`, {
//     method:      "POST",
//     headers:     { "Content-Type": "application/json" },
//     credentials: "include",
//     body: JSON.stringify({ firebaseToken, email, authProvider: "email", ...rest }),
//   });
//   // console.log(res)

//   if (!res.ok) {
//     const err = await res.json();
//     throw new Error(err.message || "Registration failed");
//   }

//   const data = await res.json();
//   if (data.token) {
//     Cookies.set("auth_token", data.token, { expires: 7, sameSite: "strict" });
//   }

//   return { user: result.user, ...data };
// }

// // ── Phone OTP ──────────────────────────────────────────────────────────────
// let confirmationResult: any = null;

// export function setupRecaptcha(elementId: string) {
//   if (!(window as any).recaptchaVerifier) {
//     (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
//       size: "invisible",
//       callback: () => {},
//     });
//   }
//   return (window as any).recaptchaVerifier;
// }

// export async function sendOTP(phone: string) {
//   const appVerifier  = setupRecaptcha("recaptcha-container");
//   confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
//   return confirmationResult;
// }

// export async function verifyOTP(otpCode: string) {
//   if (!confirmationResult) throw new Error("Please send OTP first");
//   const result        = await confirmationResult.confirm(otpCode);
//   const firebaseToken = await result.user.getIdToken();
//   const data          = await exchangeToken(firebaseToken);
//   console.log("verifyotp result", result,"verifyotp firebasetoken", firebaseToken,"verifyotp data", data)
//   return { user: result.user, ...data };
// }

// // ── Logout ─────────────────────────────────────────────────────────────────
// export async function logout() {
//   await signOut(auth);
//   Cookies.remove("auth_token");
//   await fetch(`${API}/auth/logout`, {
//     method:      "POST",
//     credentials: "include",
//   });
// }

// // ── Get current user from backend ──────────────────────────────────────────
// export async function getMe() {
//   const res = await fetch(`${API}/auth/me`, {
//     credentials: "include",
//   });
//   if (!res.ok) return null;
//   const data = await res.json();
//   return data.user;
// }

// // ── Friendly errors ────────────────────────────────────────────────────────
// export function friendlyError(code: string): string {
//   const map: Record<string, string> = {
//     "auth/user-not-found":              "No account found with this email.",
//     "auth/wrong-password":              "Incorrect password.",
//     "auth/invalid-email":               "Invalid email address.",
//     "auth/email-already-in-use":        "Email already registered.",
//     "auth/weak-password":               "Password must be at least 6 characters.",
//     "auth/too-many-requests":           "Too many attempts. Try later.",
//     "auth/invalid-verification-code":   "Invalid OTP.",
//     "auth/phone-number-already-exists": "Phone already registered.",
//   };
//   return map[code] || "Something went wrong.";
// }

import {
  auth, googleProvider,
  signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  RecaptchaVerifier, signInWithPhoneNumber,
  signOut,
} from "./firebase";
import Cookies from "js-cookie";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

// ── Role → dashboard home (mirrors middleware.ts) ─────────────────────────────
export const ROLE_HOME: Record<string, string> = {
  super_admin: "/dashboard/admin",
  admin:       "/dashboard/admin",
  seller:      "/dashboard/seller",
  user:        "/dashboard/user",
};

// ── Build headers: always send JWT in Authorization header ────────────────────
// Cookies work same-origin / when sameSite=none+Secure is set correctly.
// The Authorization header is the reliable fallback for cross-domain in dev
// AND the primary mechanism during the login response itself (cookie isn't
// readable by JS — it's httpOnly — but we can read the token from the body).
function makeHeaders(token?: string): HeadersInit {
  const h: HeadersInit = { "Content-Type": "application/json" };
  const t = token || Cookies.get("auth_token");
  if (t) h["Authorization"] = `Bearer ${t}`;
  return h;
}

// ── Exchange Firebase token for our JWT ───────────────────────────────────────
async function exchangeToken(firebaseToken: string) {
  const res = await fetch(`${API}/auth/login`, {
    method:      "POST",
    credentials: "include",
    headers:     { "Content-Type": "application/json" },
    body:        JSON.stringify({ firebaseToken }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Login failed" }));
    throw new Error(err.message || "Login failed");
  }

  const data = await res.json();

  // Store token in cookie for middleware (SSR reads it server-side)
  // and also for the Authorization header fallback in AuthContext
  if (data.token) {
    Cookies.set("auth_token", data.token, {
      expires:  7,
      sameSite: "None",   // cross-site (Vercel ↔ Railway)
      secure:   true,     // required with SameSite=None
    });
  }

  return data; // { success, token, user }
}

// ── Google sign-in ────────────────────────────────────────────────────────────
export async function signInWithGoogle() {
  const result        = await signInWithPopup(auth, googleProvider);
  const firebaseToken = await result.user.getIdToken();
  const data          = await exchangeToken(firebaseToken);
  return { firebaseUser: result.user, ...data };
}

// ── Email sign-in ─────────────────────────────────────────────────────────────
export async function signInWithEmail(email: string, password: string) {
  const result        = await signInWithEmailAndPassword(auth, email, password);
  const firebaseToken = await result.user.getIdToken();
  const data          = await exchangeToken(firebaseToken);
  return { firebaseUser: result.user, ...data };
}

// ── Register ──────────────────────────────────────────────────────────────────
export async function registerUser(payload: {
  email: string; password: string;
  firstName: string; lastName?: string; phone?: string;
  role: "user" | "seller";
  businessName?: string; businessType?: string; businessCategory?: string;
  country?: string; address?: string; website?: string; description?: string;
  taxId?: string; tradeLicense?: string;
}) {
  const { email, password, ...rest } = payload;

  const result        = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseToken = await result.user.getIdToken();

  const res = await fetch(`${API}/auth/register`, {
    method:      "POST",
    credentials: "include",
    headers:     { "Content-Type": "application/json" },
    body:        JSON.stringify({ firebaseToken, email, authProvider: "email", ...rest }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Registration failed" }));
    throw new Error(err.message || "Registration failed");
  }

  const data = await res.json();

  if (data.token) {
    Cookies.set("auth_token", data.token, {
      expires: 7, sameSite: "None", secure: true,
    });
  }

  return { firebaseUser: result.user, ...data };
}

// ── Phone OTP ─────────────────────────────────────────────────────────────────
let confirmationResult: any = null;

export function setupRecaptcha(elementId: string) {
  if (!(window as any).recaptchaVerifier) {
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
      size: "invisible",
      callback: () => {},
    });
  }
  return (window as any).recaptchaVerifier;
}

export async function sendOTP(phone: string) {
  const appVerifier  = setupRecaptcha("recaptcha-container");
  confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
  return confirmationResult;
}

export async function verifyOTP(otpCode: string) {
  if (!confirmationResult) throw new Error("Please send OTP first");
  const result        = await confirmationResult.confirm(otpCode);
  const firebaseToken = await result.user.getIdToken();
  const data          = await exchangeToken(firebaseToken);
  return { firebaseUser: result.user, ...data };
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function logout() {
  try {
    await fetch(`${API}/auth/logout`, {
      method:      "POST",
      credentials: "include",
      headers:     makeHeaders(),
    });
  } catch (_) { /* best effort */ }
  await signOut(auth);
  Cookies.remove("auth_token");
}

// ── Get current user ──────────────────────────────────────────────────────────
export async function getMe() {
  const res = await fetch(`${API}/auth/me`, {
    credentials: "include",
    headers:     makeHeaders(),
    cache:       "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user ?? null;
}

// ── Friendly Firebase error messages ─────────────────────────────────────────
export function friendlyError(code: string): string {
  const map: Record<string, string> = {
    "auth/user-not-found":              "No account found with this email.",
    "auth/wrong-password":              "Incorrect password.",
    "auth/invalid-email":               "Invalid email address.",
    "auth/email-already-in-use":        "Email already registered.",
    "auth/weak-password":               "Password must be at least 6 characters.",
    "auth/too-many-requests":           "Too many attempts. Try later.",
    "auth/invalid-verification-code":   "Invalid OTP.",
    "auth/phone-number-already-exists": "Phone already registered.",
    "auth/popup-closed-by-user":        "Sign-in popup was closed.",
    "auth/cancelled-popup-request":     "Another popup is already open.",
  };
  return map[code] || "";
}