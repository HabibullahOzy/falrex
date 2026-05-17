"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Check, X, User, Store,
  Building2, Globe, MapPin, FileText,
  Phone, BadgeCheck, ChevronRight, ChevronLeft,
} from "lucide-react";
import { signInWithGoogle, registerUser, friendlyError } from "../../../../lib/authHelpers";
import styles from "../auth.module.css";

// ── Password strength ─────────────────────────────────────────────────────
function getStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { label: "", color: "transparent" },
    { label: "Weak", color: "#ef4444" },
    { label: "Fair", color: "#f97316" },
    { label: "Good", color: "#eab308" },
    { label: "Strong", color: "#22c55e" },
  ];
  return { score: s, ...map[s] };
}

const REQUIREMENTS = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const BUSINESS_TYPES = [
  "Manufacturer", "Wholesaler", "Trader / Reseller",
  "OEM / ODM Factory", "Exporter", "Importer", "Retailer", "Other",
];

const BUSINESS_CATEGORIES = [
  "Consumer Electronics", "Fashion & Apparel", "Beauty & Personal Care",
  "Home & Kitchen", "Sports & Outdoors", "Jewellery & Accessories",
  "Industrial & Machinery", "Health & Medical", "Toys & Hobbies",
  "Automotive", "Food & Beverage", "Other",
];

const COUNTRIES = [
  "Bangladesh (BD)", "China (CN)", "India (IN)", "United States (US)",
  "Germany (DE)", "United Kingdom (GB)", "Turkey (TR)", "Vietnam (VN)",
  "South Korea (KR)", "Japan (JP)", "Italy (IT)", "France (FR)", "Other",
];

type Role = "user" | "seller";
type Step = 1 | 2 | 3;   // Step 3 only for seller

// ── Input Component ────────────────────────────────────────────────────────
function Input({
  label, icon, type = "text", placeholder, value, onChange,
  required = false, hint,
}: {
  label: string; icon?: React.ReactNode;
  type?: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  required?: boolean; hint?: string;
}) {
  return (
    <div className={styles.field}>
      <label>{label}{required && <span style={{ color: "#e05a5a" }}> *</span>}</label>
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            color: "#4a4760", display: "flex",
          }}>
            {icon}
          </span>
        )}
        <input
          type={type} placeholder={placeholder} required={required}
          value={value} onChange={(e) => onChange(e.target.value)}
          style={{ paddingLeft: icon ? 38 : 14 }}
        />
      </div>
      {hint && <p style={{ fontSize: "0.72rem", color: "#4a4760", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

// ── Select Component ───────────────────────────────────────────────────────
function Select({
  label, icon, value, onChange, options, placeholder, required,
}: {
  label: string; icon?: React.ReactNode;
  value: string; onChange: (v: string) => void;
  options: string[]; placeholder: string; required?: boolean;
}) {
  return (
    <div className={styles.field}>
      <label>{label}{required && <span style={{ color: "#e05a5a" }}> *</span>}</label>
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            color: "#4a4760", display: "flex", pointerEvents: "none",
          }}>
            {icon}
          </span>
        )}
        <select
          value={value} required={required}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%", padding: "12px 14px",
            paddingTop: "12px",
            paddingRight: "14px",
            paddingBottom: "12px",
            paddingLeft: icon ? 38 : 14,
            // background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 12, color: value ? "#f0eeff" : "#3d3a52",
            fontSize: "0.9rem", outline: "none", appearance: "none",
            cursor: "pointer",
          }}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );
}

// ── Progress bar ───────────────────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < total - 1 ? 1 : 0 }}>
            <div style={{
              width: 50, height: 28, borderRadius: "50%",
              background: i < step
                ? "linear-gradient(135deg,#7149f5,#9b6bff)"
                : i === step - 1
                  ? "linear-gradient(135deg,#7149f5,#9b6bff)"
                  : "rgba(255,255,255,0.06)",
              border: i === step - 1
                ? "2px solid #9b6bff"
                : "2px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.7rem", fontWeight: 700,
              color: i < step ? "#fff" : "#4a4760",
              flexShrink: 0, transition: "all 0.3s",
              boxShadow: i === step - 1 ? "0 0 16px rgba(113,73,245,0.4)" : "none",
            }}>
              {i < step - 1 ? <Check size={12} /> : i + 1}
            </div>
            {i < total - 1 && (
              <div style={{
                flex: 1, height: 2, margin: "0 6px",
                background: i < step - 1
                  ? "linear-gradient(90deg,#7149f5,#9b6bff)"
                  : "rgba(255,255,255,0.06)",
                borderRadius: 2, transition: "background 0.3s",
              }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {["Account", "Security", "Business"].slice(0, total).map((l, i) => (
          <p key={l} style={{
            fontSize: "0.62rem", color: i === step - 1 ? "#9b6bff" : "#4a4760",
            fontWeight: i === step - 1 ? 600 : 400,
            textAlign: i === 0 ? "left" : i === total - 1 ? "right" : "center",
            flex: 1,
          }}>{l}</p>
        ))}
      </div>
    </div>
  );
}

// ── Data path display ──────────────────────────────────────────────────────
function DataPath({ role }: { role: Role }) {
  const paths = role === "seller" ? [
    {
      label: "MongoDB → users collection", icon: "🗄️",
      fields: "uid, email, firstName, lastName, phone, role: 'seller'"
    },
    {
      label: "sellerProfile (nested doc)", icon: "🏢",
      fields: "businessName, businessType, businessCategory, country, address, website, taxId"
    },
    {
      label: "Verification status", icon: "✅",
      fields: "sellerStatus: 'pending', isSellerVerified: false"
    },
    {
      label: "Firebase Auth", icon: "🔥",
      fields: "uid, email, displayName, emailVerified"
    },
    {
      label: "JWT Cookie (7 days)", icon: "🔑",
      fields: "uid, email, role, sellerStatus"
    },
  ] : [
    {
      label: "MongoDB → users collection", icon: "🗄️",
      fields: "uid, email, firstName, lastName, phone, role: 'user'"
    },
    {
      label: "Firebase Auth", icon: "🔥",
      fields: "uid, email, displayName, emailVerified"
    },
    {
      label: "JWT Cookie (7 days)", icon: "🔑",
      fields: "uid, email, role: 'user'"
    },
  ];

  return (
    <div style={{
      background: "rgba(113,73,245,0.06)",
      border: "1px solid rgba(113,73,245,0.15)",
      borderRadius: 12, padding: "12px 14px", marginBottom: 20,
    }}>
      <p style={{
        fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em",
        textTransform: "uppercase", color: "#6b5baa", marginBottom: 10,
      }}>
        📊 Data Storage Path
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {paths.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ fontSize: "0.75rem", flexShrink: 0, marginTop: 1 }}>{p.icon}</span>
            <div>
              <p style={{ fontSize: "0.72rem", color: "#8b7fc8", fontWeight: 600, margin: 0 }}>
                {p.label}
              </p>
              <p style={{ fontSize: "0.65rem", color: "#4a4760", margin: "2px 0 0", lineHeight: 1.4 }}>
                {p.fields}
              </p>
            </div>
            {i < paths.length - 1 && (
              <div style={{
                position: "absolute", left: 20,
                width: 1, height: 14,
                background: "rgba(113,73,245,0.2)",
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN SIGNUP PAGE ───────────────────────────────────────────────────────
export default function SignupPage() {
  const router = useRouter();

  // Role
  const [role, setRole] = useState<Role>("user");
  const totalSteps = role === "seller" ? 3 : 2;

  // Step
  const [step, setStep] = useState<Step>(1);

  // Step 1: Account info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2: Security
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Step 3: Seller info
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [taxId, setTaxId] = useState("");
  const [tradeLicense, setTradeLicense] = useState("");

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDataPath, setShowDataPath] = useState(false);

  const strength = getStrength(password);
  const clearError = () => setError("");

  // ── Role switch resets ────────────────────────────────────────────────
  const handleRoleSwitch = (r: Role) => {
    setRole(r);
    setStep(1);
    setError("");
  };

  // ── Google ────────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setLoading(true); clearError();
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (e: any) {
      setError(friendlyError(e.code) || e.message);
    } finally { setLoading(false); }
  };

  // ── Step 1 → 2 validation ─────────────────────────────────────────────
  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault(); clearError();
    if (!firstName.trim()) { setError("First name is required."); return; }
    if (!email.trim()) { setError("Email is required."); return; }
    setStep(2);
  };

  // ── Step 2 → 3 (seller) or submit (user) ─────────────────────────────
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault(); clearError();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (strength.score < 2) { setError("Please choose a stronger password."); return; }
    if (!agreed) { setError("Please agree to Terms of Service."); return; }

    if (role === "seller") { setStep(3); return; }

    // Submit for regular user
    await submitRegistration();
  };

  // ── Step 3: seller submit ─────────────────────────────────────────────
  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault(); clearError();
    if (!businessName.trim()) { setError("Business name is required."); return; }
    if (!businessType) { setError("Please select a business type."); return; }
    if (!country) { setError("Please select your country."); return; }
    await submitRegistration();
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const submitRegistration = async () => {
    setLoading(true);
    try {
      const payload: any = {
        email, password, firstName, lastName, phone, role,
      };

      if (role === "seller") {
        Object.assign(payload, {
          businessName, businessType, businessCategory,
          country, address, website, description,
          taxId, tradeLicense,
        });
      }

      const result = await registerUser(payload);
      console.log(result)

      if (role === "seller") {
        setSuccess("Seller account submitted! Our team will verify your details within 24-48 hours.");
        setTimeout(() => router.push("/dashboard/seller/pending"), 2000);
      } else {
        setSuccess("Account created! Redirecting...");
        setTimeout(() => router.push("/dashboard"), 1200);
      }
    } catch (e: any) {
      setError(friendlyError(e.code) || e.message);
    } finally { setLoading(false); }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.bgOrbs} aria-hidden>
        <span className={styles.orb1} />
        <span className={styles.orb2} />
        <span className={styles.orb3} />
      </div>

      <div className={styles.card} style={{ maxWidth: 480 }}>

        {/* Logo */}
        <div className={styles.logo}>⬡</div>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Join as a buyer or seller</p>

        {/* ── Role Toggle ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 10, marginBottom: 24,
        }}>
          {/* General User */}
          <button
            type="button"
            onClick={() => handleRoleSwitch("user")}
            style={{
              padding: "14px 10px",
              borderRadius: 14,
              border: role === "user"
                ? "2px solid rgba(113,73,245,0.6)"
                : "2px solid rgba(255,255,255,0.07)",
              background: role === "user"
                ? "rgba(113,73,245,0.12)"
                : "rgba(255,255,255,0.03)",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 8,
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: role === "user"
                ? "linear-gradient(135deg,#7149f5,#9b6bff)"
                : "rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}>
              <User size={18} color={role === "user" ? "#fff" : "#4a4760"} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{
                fontSize: "0.82rem", fontWeight: 600, margin: 0,
                color: role === "user" ? "#c4b5fd" : "#6b6880",
              }}>General User</p>
              <p style={{ fontSize: "0.68rem", color: "#4a4760", margin: "3px 0 0", lineHeight: 1.3 }}>
                Browse & buy products
              </p>
            </div>
            {role === "user" && (
              <div style={{
                position: "absolute", top: 8, right: 8,
                width: 18, height: 18, borderRadius: "50%",
                background: "#7149f5",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Check size={10} color="#fff" />
              </div>
            )}
          </button>

          {/* Seller */}
          <button
            type="button"
            onClick={() => handleRoleSwitch("seller")}
            style={{
              padding: "14px 10px", borderRadius: 14,
              border: role === "seller"
                ? "2px solid rgba(9,183,246,0.6)"
                : "2px solid rgba(255,255,255,0.07)",
              background: role === "seller"
                ? "rgba(9,183,246,0.08)"
                : "rgba(255,255,255,0.03)",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 8,
              position: "relative",
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: role === "seller"
                ? "linear-gradient(135deg,#09b7f6,#0ea5e9)"
                : "rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}>
              <Store size={18} color={role === "seller" ? "#fff" : "#4a4760"} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{
                fontSize: "0.82rem", fontWeight: 600, margin: 0,
                color: role === "seller" ? "#7dd3fc" : "#6b6880",
              }}>Seller / Supplier</p>
              <p style={{ fontSize: "0.68rem", color: "#4a4760", margin: "3px 0 0", lineHeight: 1.3 }}>
                List & sell products
              </p>
            </div>
            {role === "seller" && (
              <div style={{
                position: "absolute", top: 8, right: 8,
                width: 18, height: 18, borderRadius: "50%",
                background: "#09b7f6",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Check size={10} color="#fff" />
              </div>
            )}
            {/* Verification badge */}
            <div style={{
              position: "absolute", bottom: -8,
              background: "linear-gradient(135deg,#09b7f6,#0ea5e9)",
              borderRadius: 20, padding: "2px 8px",
              fontSize: "0.58rem", color: "#fff", fontWeight: 700,
              letterSpacing: "0.06em",
            }}>
              VERIFICATION REQUIRED
            </div>
          </button>
        </div>

        {/* ── Data path toggle ── */}
        <button
          type="button"
          onClick={() => setShowDataPath(!showDataPath)}
          style={{
            width: "100%", marginBottom: 16,
            background: "rgba(113,73,245,0.06)",
            border: "1px solid rgba(113,73,245,0.15)",
            borderRadius: 10, padding: "8px 14px",
            color: "#6b5baa", fontSize: "0.75rem",
            cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "space-between",
          }}
        >
          <span>📊 View data storage path</span>
          <ChevronRight size={14} style={{
            transform: showDataPath ? "rotate(90deg)" : "none",
            transition: "transform 0.2s",
          }} />
        </button>

        {showDataPath && <DataPath role={role} />}

        {/* ── Seller verification info ── */}
        {role === "seller" && (
          <div style={{
            background: "rgba(9,183,246,0.06)",
            border: "1px solid rgba(9,183,246,0.2)",
            borderRadius: 12, padding: "12px 14px", marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <BadgeCheck size={16} color="#09b7f6" />
              <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#7dd3fc", margin: 0 }}>
                Seller Verification Process
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                "Submit business information",
                "Admin reviews within 24-48 hours",
                "Receive email confirmation",
                "Start listing products",
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: "rgba(9,183,246,0.15)",
                    border: "1px solid rgba(9,183,246,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.6rem", color: "#09b7f6", fontWeight: 700, flexShrink: 0,
                  }}>{i + 1}</div>
                  <p style={{ fontSize: "0.75rem", color: "#6b89a0", margin: 0 }}>{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Google button (step 1 only) ── */}
        {step === 1 && (
          <>
            <button className={styles.googleBtn} onClick={handleGoogle} disabled={loading}>
              <GoogleIcon />
              Continue with Google
            </button>
            <div className={styles.divider}><span>or</span></div>
          </>
        )}

        {/* ── Progress bar ── */}
        <ProgressBar step={step} total={totalSteps} />

        {error && <div className={styles.errorBox}>{error}</div>}
        {success && <div className={styles.successBox}>✅ {success}</div>}

        {/* ════════════════════════════════════════
            STEP 1 — Account Information
        ════════════════════════════════════════ */}
        {step === 1 && (
          <form onSubmit={handleStep1} className={styles.form}>
            <div className={styles.nameRow}>
              <Input label="First name" placeholder="John"
                value={firstName} onChange={setFirstName} required
                icon={<User size={14} />} />
              <Input label="Last name" placeholder="Doe"
                value={lastName} onChange={setLastName}
                icon={<User size={14} />} />
            </div>

            <Input label="Email" type="email" placeholder="you@example.com"
              value={email} onChange={setEmail} required
              icon={<span style={{ fontSize: 14 }}>📧</span>} />

            <Input label="Phone (optional)" type="tel" placeholder="+8801XXXXXXXXX"
              value={phone} onChange={setPhone}
              icon={<Phone size={14} />}
              hint="Used for OTP verification" />

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              Continue <ChevronRight size={16} />
            </button>
          </form>
        )}

        {/* ════════════════════════════════════════
            STEP 2 — Security
        ════════════════════════════════════════ */}
        {step === 2 && (
          <form onSubmit={handleStep2} className={styles.form}>

            {/* Password */}
            <div className={styles.field}>
              <label>Password <span style={{ color: "#e05a5a" }}>*</span></label>
              <div className={styles.passwordField}>
                <input type={showPw ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {password && (
                <>
                  <div className={styles.strengthBar}>
                    <div className={styles.strengthFill}
                      style={{ width: `${(strength.score / 4) * 100}%`, background: strength.color }} />
                  </div>
                  <p className={styles.strengthLabel} style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
                    {REQUIREMENTS.map((r) => {
                      const ok = r.test(password);
                      return (
                        <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem" }}>
                          {ok ? <Check size={12} color="#22c55e" /> : <X size={12} color="#6b6880" />}
                          <span style={{ color: ok ? "#22c55e" : "#6b6880" }}>{r.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Confirm */}
            <div className={styles.field}>
              <label>Confirm password <span style={{ color: "#e05a5a" }}>*</span></label>
              <div className={styles.passwordField}>
                <input type={showCf ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                  style={{
                    borderColor: confirm && confirm !== password
                      ? "rgba(239,68,68,0.5)" : undefined,
                  }} />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowCf(!showCf)}>
                  {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirm && confirm !== password && (
                <p style={{ fontSize: "0.75rem", color: "#fca5a5", marginTop: 4 }}>
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Terms */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                style={{ width: 16, height: 16, marginTop: 2, accentColor: "#7149f5", flexShrink: 0 }} />
              <span style={{ fontSize: "0.8rem", color: "#6b6880", lineHeight: 1.5 }}>
                I agree to the{" "}
                <Link href="/terms" style={{ color: "#7149f5", textDecoration: "none" }}>Terms</Link>
                {" "}and{" "}
                <Link href="/privacy" style={{ color: "#7149f5", textDecoration: "none" }}>Privacy Policy</Link>
                {role === "seller" && (
                  <> and <Link href="/seller-agreement" style={{ color: "#09b7f6", textDecoration: "none" }}>
                    Seller Agreement
                  </Link></>
                )}
              </span>
            </label>

            {/* Navigation */}
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)", color: "#8b89a0",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                  fontSize: "0.85rem",
                }}>
                <ChevronLeft size={16} /> Back
              </button>
              <button type="submit" className={styles.submitBtn}
                disabled={loading || !agreed || password !== confirm}
                style={{ flex: 1 }}>
                {loading
                  ? <span className={styles.spinner} />
                  : role === "seller"
                    ? <>Next <ChevronRight size={16} /></>
                    : "Create Account"
                }
              </button>
            </div>
          </form>
        )}

        {/* ════════════════════════════════════════
            STEP 3 — Seller Business Info
        ════════════════════════════════════════ */}
        {step === 3 && role === "seller" && (
          <form onSubmit={handleStep3} className={styles.form}>

            <Input label="Business / Company Name" placeholder="e.g. Shafir Express LTD"
              value={businessName} onChange={setBusinessName} required
              icon={<Building2 size={14} />} />

            <Select label="Business Type" value={businessType} onChange={setBusinessType}
              options={BUSINESS_TYPES} placeholder="Select type" required
              icon={<Building2 size={14} />} />

            <Select label="Business Category" value={businessCategory} onChange={setBusinessCategory}
              options={BUSINESS_CATEGORIES} placeholder="Select category"
              icon={<span style={{ fontSize: 13 }}>📦</span>} />

            <Select label="Country / Region" value={country} onChange={setCountry}
              options={COUNTRIES} placeholder="Select country" required
              icon={<Globe size={14} />} />

            <Input label="Business Address" placeholder="Street, City, State"
              value={address} onChange={setAddress}
              icon={<MapPin size={14} />} />

            <Input label="Website (optional)" type="url" placeholder="https://yourbusiness.com"
              value={website} onChange={setWebsite}
              icon={<Globe size={14} />} />

            <Input label="Trade License / Registration No." placeholder="e.g. RJSC-2024-XXXXX"
              value={tradeLicense} onChange={setTradeLicense}
              icon={<FileText size={14} />}
              hint="Required for seller verification" />

            <Input label="Tax ID / VAT Number (optional)" placeholder="e.g. VAT-BD-XXXXXX"
              value={taxId} onChange={setTaxId}
              icon={<FileText size={14} />} />

            {/* Business description */}
            <div className={styles.field}>
              <label>Business Description (optional)</label>
              <textarea
                placeholder="Describe your business, products, and what you offer..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{
                  width: "100%", padding: "12px 14px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 12, color: "#f0eeff", fontSize: "0.9rem",
                  outline: "none", resize: "vertical", boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Verification note */}
            <div style={{
              background: "rgba(234,179,8,0.08)",
              border: "1px solid rgba(234,179,8,0.2)",
              borderRadius: 10, padding: "10px 14px",
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>⏳</span>
              <p style={{ fontSize: "0.75rem", color: "#a38700", margin: 0, lineHeight: 1.5 }}>
                Your seller account will be in <b>pending</b> status until our team
                verifies your business details (24-48 hours). You'll receive an
                email once approved.
              </p>
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button"
                onClick={() => setStep(2)}
                style={{
                  padding: "12px 16px", borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)", color: "#8b89a0",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                  fontSize: "0.85rem",
                }}>
                <ChevronLeft size={16} /> Back
              </button>
              <button type="submit" className={styles.submitBtn}
                disabled={loading} style={{ flex: 1 }}>
                {loading
                  ? <span className={styles.spinner} />
                  : <><Store size={16} /> Submit for Verification</>
                }
              </button>
            </div>
          </form>
        )}

        <p className={styles.switchLink}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path d="M44.5 20H24v8.5h11.8C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.8 20-21 0-1.4-.2-2.7-.5-4z" fill="#FFC107" />
      <path d="M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.6 0-14.2 4.3-17.7 10.7z" fill="#FF3D00" />
      <path d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.5C29.7 36.1 27 37 24 37c-5.7 0-10.6-3.1-11.7-8.4l-7 5.4C8.1 40.7 15.4 45 24 45z" fill="#4CAF50" />
      <path d="M44.5 20H24v8.5h11.8c-.5 2.7-2 5-4.3 6.6l6.6 5.5C41.6 37.3 45 31.2 45 24c0-1.4-.2-2.7-.5-4z" fill="#1976D2" />
    </svg>
  );
}