"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Role = "patient" | "doctor" | "";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>("");
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "",
    password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) { setError("Please select your role."); return; }
    setError("");
    setStep(2);
  };

  // ✅ handleSubmit calls POST /auth/signup on your FastAPI backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreed) { setError("Please accept the terms to continue."); return; }
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role,                     // "patient" or "doctor" — saved to MongoDB
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Signup failed. Please try again.");
      }

      // Auto-login after signup: store token + user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const strengthScore = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "#ef4444", "#f59e0b", "#0d9488", "#059669"];

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      <nav style={styles.nav}>
        <Link href="/" style={styles.logo}>
          <span style={styles.logoIcon}>⚕</span>
          <span style={styles.logoText}>SANJEEVANI<span style={styles.logoAI}>AI</span></span>
        </Link>
      </nav>

      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.avatarRing}>
              <span style={styles.avatarIcon}>{step === 1 ? "🏥" : "👤"}</span>
            </div>
            <h1 style={styles.heading}>
              {step === 1 ? "Join Sanjeevani AI" : "Your details"}
            </h1>
            <p style={styles.subheading}>
              {step === 1
                ? "Create your free account in seconds"
                : `Creating account as a ${role}`}
            </p>
          </div>

          <div style={styles.stepRow}>
            {[1, 2].map((s) => (
              <div key={s} style={styles.stepItem}>
                <div style={{
                  ...styles.stepDot,
                  background: s <= step ? "linear-gradient(135deg,#0d9488,#06b6d4)" : "rgba(13,148,136,0.12)",
                  color: s <= step ? "#fff" : "#9eb8b5",
                }}>
                  {s < step ? "✓" : s}
                </div>
                <span style={{ ...styles.stepLabel, color: s <= step ? "#0f766e" : "#9eb8b5" }}>
                  {s === 1 ? "Role" : "Info"}
                </span>
              </div>
            ))}
            <div style={styles.stepConnector}>
              <div style={{ ...styles.stepConnectorFill, width: step === 2 ? "100%" : "0%" }} />
            </div>
          </div>

          {error && (
            <div style={styles.errorBanner}>
              <span>⚠</span> {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleStep1} style={styles.form}>
              <p style={styles.roleLabel}>I am a…</p>
              <div style={styles.roleGrid}>
                {(["patient", "doctor"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    style={{ ...styles.roleCard, ...(role === r ? styles.roleCardActive : {}) }}
                  >
                    <span style={styles.roleEmoji}>{r === "patient" ? "🧑‍⚕️" : "👨‍⚕️"}</span>
                    <span style={styles.roleTitle}>{r === "patient" ? "Patient" : "Doctor"}</span>
                    <span style={styles.roleDesc}>
                      {r === "patient"
                        ? "Get AI health insights & symptom checks"
                        : "Manage patients & clinical workflows"}
                    </span>
                  </button>
                ))}
              </div>
              <button type="submit" style={styles.submitBtn}>Continue →</button>
              <p style={styles.footerText}>
                Already have an account?{" "}
                <Link href="/login" style={styles.footerLink}>Sign in</Link>
              </p>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} style={styles.form}>
              <Field label="Full name" icon="👤">
                <input type="text" required placeholder="Aman Kumar" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} style={styles.input} />
              </Field>
              <Field label="Email address" icon="✉">
                <input type="email" required placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} style={styles.input} />
              </Field>
              <Field label="Phone number" icon="📱">
                <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => update("phone", e.target.value)} style={styles.input} />
              </Field>
              <Field label="Password" icon="🔒">
                <>
                  <input
                    type={showPassword ? "text" : "password"}
                    required placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    style={{ ...styles.input, paddingRight: 40 }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    {showPassword ? "🙈" : "👁"}
                  </button>
                  {form.password && (
                    <div style={styles.strengthRow}>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} style={{ ...styles.strengthBar, background: i <= strengthScore ? strengthColors[strengthScore] : "rgba(13,148,136,0.1)" }} />
                      ))}
                      <span style={{ color: strengthColors[strengthScore], fontSize: 11, fontWeight: 700 }}>
                        {strengthLabels[strengthScore]}
                      </span>
                    </div>
                  )}
                </>
              </Field>
              <Field label="Confirm password" icon="✅">
                <input
                  type="password" required placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  style={{ ...styles.input, borderColor: form.confirmPassword && form.confirmPassword !== form.password ? "rgba(239,68,68,0.4)" : undefined }}
                />
              </Field>

              <label style={styles.termsRow}>
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={styles.checkbox} />
                <span style={styles.termsText}>
                  I agree to the{" "}
                  <Link href="/terms" style={styles.footerLink}>Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" style={styles.footerLink}>Privacy Policy</Link>
                </span>
              </label>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => { setStep(1); setError(""); }} style={styles.backBtn}>← Back</button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={isLoading ? { ...styles.submitBtn, ...styles.submitBtnDisabled, flex: 1 } : { ...styles.submitBtn, flex: 1 }}
                >
                  {isLoading ? <span style={styles.spinner} /> : "Create Account"}
                </button>
              </div>

              <p style={styles.footerText}>
                Already have an account?{" "}
                <Link href="/login" style={styles.footerLink}>Sign in</Link>
              </p>
            </form>
          )}
        </div>

        <div style={styles.trustRow}>
          <span style={styles.trustBadge}>🔐 256-bit encryption</span>
          <span style={styles.trustBadge}>🏥 HIPAA compliant</span>
          <span style={styles.trustBadge}>✨ Free forever</span>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Nunito', sans-serif; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #f0faf8 inset !important; -webkit-text-fill-color: #0f4c45 !important; }
        @keyframes floatBlob { 0%, 100% { transform: translate(0,0) scale(1); } 33% { transform: translate(20px,-30px) scale(1.05); } 66% { transform: translate(-15px,20px) scale(0.95); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        input:focus { outline: none; border-color: #0d9488 !important; box-shadow: 0 0 0 3px rgba(13,148,136,0.12) !important; }
        button:not([disabled]):active { transform: scale(0.98); }
      `}</style>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={styles.label}>{label}</label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <span style={styles.inputIcon}>{icon}</span>
        {children}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg,#e6faf8 0%,#f0fdfb 50%,#e0f2fe 100%)", fontFamily: "'Nunito', sans-serif", position: "relative", overflow: "hidden" },
  blob1: { position: "absolute", top: "-120px", right: "-80px", width: 420, height: 420, background: "radial-gradient(circle,rgba(13,148,136,0.18) 0%,transparent 70%)", borderRadius: "50%", animation: "floatBlob 12s ease-in-out infinite", pointerEvents: "none" },
  blob2: { position: "absolute", bottom: "-100px", left: "-100px", width: 500, height: 500, background: "radial-gradient(circle,rgba(6,182,212,0.15) 0%,transparent 70%)", borderRadius: "50%", animation: "floatBlob 16s ease-in-out infinite reverse", pointerEvents: "none" },
  blob3: { position: "absolute", top: "40%", left: "60%", width: 250, height: 250, background: "radial-gradient(circle,rgba(20,184,166,0.1) 0%,transparent 70%)", borderRadius: "50%", animation: "floatBlob 9s ease-in-out infinite", pointerEvents: "none" },
  nav: { position: "relative", zIndex: 10, padding: "20px 32px", display: "flex", alignItems: "center" },
  logo: { display: "flex", alignItems: "center", gap: 8, textDecoration: "none" },
  logoIcon: { fontSize: 22, filter: "drop-shadow(0 2px 4px rgba(13,148,136,0.4))" },
  logoText: { fontSize: 18, fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: "#0f766e", letterSpacing: "0.04em" },
  logoAI: { color: "#0d9488", marginLeft: 2 },
  main: { position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 16px 40px" },
  card: { background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(13,148,136,0.12)", borderRadius: 24, padding: "40px 40px 32px", width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(13,148,136,0.12),0 4px 16px rgba(0,0,0,0.06)", animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards" },
  cardHeader: { textAlign: "center", marginBottom: 24 },
  avatarRing: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, background: "linear-gradient(135deg,#0d9488,#06b6d4)", borderRadius: "50%", marginBottom: 14, boxShadow: "0 8px 24px rgba(13,148,136,0.35)", fontSize: 28 },
  avatarIcon: { fontSize: 28 },
  heading: { fontSize: 24, fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: "#0f4c45", marginBottom: 5 },
  subheading: { fontSize: 13.5, color: "#6b9e99", fontWeight: 500, textTransform: "capitalize" },
  stepRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 24, position: "relative" },
  stepItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 5, zIndex: 1, padding: "0 20px" },
  stepDot: { width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, fontFamily: "'Outfit', sans-serif", transition: "all 0.3s" },
  stepLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" },
  stepConnector: { position: "absolute", left: "50%", top: 16, transform: "translateX(-50%)", width: 60, height: 2, background: "rgba(13,148,136,0.12)", borderRadius: 2 },
  stepConnectorFill: { height: "100%", background: "linear-gradient(90deg,#0d9488,#06b6d4)", borderRadius: 2, transition: "width 0.4s ease" },
  errorBanner: { background: "rgba(254,202,202,0.7)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#b91c1c", marginBottom: 16, display: "flex", gap: 8, alignItems: "center" },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  roleLabel: { fontSize: 13, fontWeight: 700, color: "#0f766e" },
  roleGrid: { display: "flex", gap: 12 },
  roleCard: { flex: 1, padding: "16px 12px", border: "1.5px solid rgba(13,148,136,0.15)", borderRadius: 14, background: "rgba(240,253,250,0.7)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "all 0.2s", textAlign: "center" },
  roleCardActive: { border: "1.5px solid #0d9488", background: "rgba(13,148,136,0.07)", boxShadow: "0 0 0 3px rgba(13,148,136,0.12)", transform: "translateY(-2px)" },
  roleEmoji: { fontSize: 28 },
  roleTitle: { fontSize: 14, fontWeight: 800, color: "#0f766e", fontFamily: "'Outfit', sans-serif" },
  roleDesc: { fontSize: 11, color: "#6b9e99", fontWeight: 500, lineHeight: 1.4 },
  label: { fontSize: 13, fontWeight: 700, color: "#0f766e", letterSpacing: "0.01em" },
  inputIcon: { position: "absolute", left: 13, fontSize: 14, opacity: 0.5, pointerEvents: "none", zIndex: 1 },
  input: { width: "100%", padding: "10px 14px 10px 38px", border: "1.5px solid rgba(13,148,136,0.2)", borderRadius: 11, fontSize: 14, background: "rgba(240,253,250,0.7)", color: "#0f4c45", fontFamily: "'Nunito', sans-serif", fontWeight: 500, transition: "all 0.2s" },
  eyeBtn: { position: "absolute", right: 12, background: "none", border: "none", fontSize: 15, cursor: "pointer", opacity: 0.6, padding: 0 },
  strengthRow: { display: "flex", alignItems: "center", gap: 5, marginTop: 6 },
  strengthBar: { flex: 1, height: 4, borderRadius: 4, transition: "background 0.3s" },
  termsRow: { display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" },
  checkbox: { marginTop: 2, accentColor: "#0d9488", cursor: "pointer" },
  termsText: { fontSize: 12.5, color: "#6b9e99", fontWeight: 500, lineHeight: 1.5 },
  submitBtn: { padding: "13px", background: "linear-gradient(135deg,#0d9488 0%,#06b6d4 100%)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: "'Outfit', sans-serif", letterSpacing: "0.02em", boxShadow: "0 4px 16px rgba(13,148,136,0.35)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", height: 48 },
  submitBtnDisabled: { opacity: 0.65, cursor: "not-allowed" },
  backBtn: { padding: "13px 18px", background: "rgba(240,253,250,0.9)", border: "1.5px solid rgba(13,148,136,0.2)", borderRadius: 12, fontSize: 14, fontWeight: 700, color: "#0f766e", fontFamily: "'Nunito', sans-serif", cursor: "pointer", height: 48 },
  spinner: { width: 20, height: 20, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" },
  footerText: { textAlign: "center", fontSize: 13, color: "#6b9e99", fontWeight: 500 },
  footerLink: { color: "#0d9488", fontWeight: 700, textDecoration: "none" },
  trustRow: { display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginTop: 20 },
  trustBadge: { fontSize: 11.5, fontWeight: 600, color: "#0f766e", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(13,148,136,0.15)", borderRadius: 20, padding: "5px 12px" },
};