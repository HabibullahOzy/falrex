"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import {
  signInWithGoogle, signInWithEmail,
  sendOTP, verifyOTP, friendlyError,
} from "../../../../lib/authHelpers";
import styles from "../auth.module.css";

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("from") || "/dashboard";

  const [tab,      setTab]      = useState<"email" | "phone">("email");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [phone,    setPhone]    = useState("");
  const [otp,      setOtp]      = useState(["", "", "", "", "", ""]);
  const [otpSent,  setOtpSent]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const clearError = () => setError("");

  // ── Google ──────────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setLoading(true); clearError();
    try {
      await signInWithGoogle();
      router.push(redirectTo);
    } catch (e: any) {
      setError(friendlyError(e.code) || e.message);
    } finally { setLoading(false); }
  };

  // ── Email login ──────────────────────────────────────────────────────────
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); clearError();
    try {
      await signInWithEmail(email, password);
      router.push(redirectTo);
    } catch (e: any) {
      setError(friendlyError(e.code));
    } finally { setLoading(false); }
  };

  // ── Phone: send OTP ──────────────────────────────────────────────────────
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); clearError();
    try {
      await sendOTP(phone);
      setOtpSent(true);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  // ── Phone: verify OTP ────────────────────────────────────────────────────
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); clearError();
    try {
      await verifyOTP(otp.join(""));
      router.push(redirectTo);
    } catch (e: any) {
      setError(friendlyError(e.code) || e.message);
    } finally { setLoading(false); }
  };

  // ── OTP input handling ───────────────────────────────────────────────────
  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };
  const handleOtpKey = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0)
      otpRefs.current[idx - 1]?.focus();
  };
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgOrbs} aria-hidden>
        <span className={styles.orb1} /><span className={styles.orb2} /><span className={styles.orb3} />
      </div>

      <div className={styles.card}>
        <div className={styles.logo}>⬡</div>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to your account</p>

        {/* Google */}
        <button className={styles.googleBtn} onClick={handleGoogle} disabled={loading}>
          <GoogleIcon />
          Continue with Google
        </button>

        <div className={styles.divider}><span>or</span></div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {(["email", "phone"] as const).map((t) => (
            <button key={t}
              className={`${styles.tabBtn} ${tab === t ? styles.tabActive : ""}`}
              onClick={() => { setTab(t); clearError(); setOtpSent(false); setOtp(["","","","","",""]); }}>
              {t === "email" ? "📧 Email" : "📱 Phone"}
            </button>
          ))}
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        {/* Email form */}
        {tab === "email" && (
          <form onSubmit={handleEmailLogin} className={styles.form}>
            <div className={styles.field}>
              <label>Email</label>
              <input type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label>Password</label>
              <div className={styles.passwordField}>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div style={{ textAlign: "right", marginTop: -8 }}>
              <Link href="/forgot-password"
                style={{ fontSize: "0.8rem", color: "#7149f5", textDecoration: "none" }}>
                Forgot password?
              </Link>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : "Sign In"}
            </button>
          </form>
        )}

        {/* Phone form */}
        {tab === "phone" && (
          <>
            {!otpSent ? (
              <form onSubmit={handleSendOTP} className={styles.form}>
                <div className={styles.field}>
                  <label>Phone Number</label>
                  <input type="tel" placeholder="+8801XXXXXXXXX"
                    value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className={styles.form}>
                <p className={styles.otpHint}>
                  6-digit code sent to <strong>{phone}</strong>
                </p>
                <div className={styles.otpRow} onPaste={handleOtpPaste}>
                  {otp.map((d, i) => (
                    <input key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      className={styles.otpInput}
                      type="text" inputMode="numeric" maxLength={1}
                      value={d}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      onKeyDown={(e) => handleOtpKey(e, i)}
                    />
                  ))}
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading || otp.join("").length < 6}>
                  {loading ? <span className={styles.spinner} /> : "Verify & Sign In"}
                </button>
                <button type="button" className={styles.textBtn}
                  onClick={() => { setOtpSent(false); setOtp(["","","","","",""]); }}>
                  ← Change number
                </button>
              </form>
            )}
          </>
        )}

        <p className={styles.switchLink}>
          Don't have an account? <Link href="/signup">Create one</Link>
        </p>
      </div>

      <div id="recaptcha-container" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path d="M44.5 20H24v8.5h11.8C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.8 20-21 0-1.4-.2-2.7-.5-4z" fill="#FFC107"/>
      <path d="M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.6 0-14.2 4.3-17.7 10.7z" fill="#FF3D00"/>
      <path d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.5C29.7 36.1 27 37 24 37c-5.7 0-10.6-3.1-11.7-8.4l-7 5.4C8.1 40.7 15.4 45 24 45z" fill="#4CAF50"/>
      <path d="M44.5 20H24v8.5h11.8c-.5 2.7-2 5-4.3 6.6l6.6 5.5C41.6 37.3 45 31.2 45 24c0-1.4-.2-2.7-.5-4z" fill="#1976D2"/>
    </svg>
  );
}