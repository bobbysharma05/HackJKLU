"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ handleSubmit calls POST /auth/login on your FastAPI backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Invalid email or password.");
      }

      // Store the token + user info from MongoDB response
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
              <span style={styles.avatarIcon}>⚕</span>
            </div>
            <h1 style={styles.heading}>Welcome back</h1>
            <p style={styles.subheading}>Sign in to your health dashboard</p>
          </div>

          {error && (
            <div style={styles.errorBanner}>
              <span style={styles.errorIcon}>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="email">Email address</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>✉</span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label} htmlFor="password">Password</label>
                <Link href="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
              </div>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={isLoading ? { ...styles.submitBtn, ...styles.submitBtnDisabled } : styles.submitBtn}
            >
              {isLoading ? <span style={styles.spinner} /> : "Sign In"}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>or continue with</span>
            <div style={styles.dividerLine} />
          </div>

          <div style={styles.socialRow}>
            <button style={styles.socialBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button style={styles.socialBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
              GitHub
            </button>
          </div>

          <p style={styles.footerText}>
            Don't have an account?{" "}
            <Link href="/signup" style={styles.footerLink}>Create one free</Link>
          </p>
        </div>

        <div style={styles.trustRow}>
          <span style={styles.trustBadge}>🔐 256-bit encryption</span>
          <span style={styles.trustBadge}>🏥 HIPAA compliant</span>
          <span style={styles.trustBadge}>⭐ 10K+ patients</span>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Nunito', sans-serif; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #f0faf8 inset !important;
          -webkit-text-fill-color: #0f4c45 !important;
        }
        @keyframes floatBlob {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(20px, -30px) scale(1.05); }
          66% { transform: translate(-15px, 20px) scale(0.95); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input:focus { outline: none; border-color: #0d9488 !important; box-shadow: 0 0 0 3px rgba(13,148,136,0.12) !important; }
        button:not([disabled]):hover { opacity: 0.9; transform: translateY(-1px); }
        button { transition: all 0.15s ease; cursor: pointer; }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #e6faf8 0%, #f0fdfb 50%, #e0f2fe 100%)", fontFamily: "'Nunito', sans-serif", position: "relative", overflow: "hidden" },
  blob1: { position: "absolute", top: "-120px", right: "-80px", width: 420, height: 420, background: "radial-gradient(circle, rgba(13,148,136,0.18) 0%, transparent 70%)", borderRadius: "50%", animation: "floatBlob 12s ease-in-out infinite", pointerEvents: "none" },
  blob2: { position: "absolute", bottom: "-100px", left: "-100px", width: 500, height: 500, background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)", borderRadius: "50%", animation: "floatBlob 16s ease-in-out infinite reverse", pointerEvents: "none" },
  blob3: { position: "absolute", top: "40%", left: "60%", width: 250, height: 250, background: "radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)", borderRadius: "50%", animation: "floatBlob 9s ease-in-out infinite", pointerEvents: "none" },
  nav: { position: "relative", zIndex: 10, padding: "20px 32px", display: "flex", alignItems: "center" },
  logo: { display: "flex", alignItems: "center", gap: 8, textDecoration: "none" },
  logoIcon: { fontSize: 22, filter: "drop-shadow(0 2px 4px rgba(13,148,136,0.4))" },
  logoText: { fontSize: 18, fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: "#0f766e", letterSpacing: "0.04em" },
  logoAI: { color: "#0d9488", marginLeft: 2 },
  main: { position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 16px 40px" },
  card: { background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(13,148,136,0.12)", borderRadius: 24, padding: "40px 40px 32px", width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(13,148,136,0.12), 0 4px 16px rgba(0,0,0,0.06)", animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards" },
  cardHeader: { textAlign: "center", marginBottom: 28 },
  avatarRing: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, background: "linear-gradient(135deg, #0d9488, #06b6d4)", borderRadius: "50%", marginBottom: 16, boxShadow: "0 8px 24px rgba(13,148,136,0.35)" },
  avatarIcon: { fontSize: 28, filter: "brightness(10)" },
  heading: { fontSize: 26, fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: "#0f4c45", marginBottom: 6 },
  subheading: { fontSize: 14, color: "#6b9e99", fontWeight: 500 },
  errorBanner: { background: "rgba(254,202,202,0.7)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#b91c1c", marginBottom: 16, display: "flex", gap: 8, alignItems: "center" },
  errorIcon: { fontSize: 14 },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 700, color: "#0f766e", letterSpacing: "0.01em" },
  labelRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  forgotLink: { fontSize: 12, color: "#0d9488", textDecoration: "none", fontWeight: 600 },
  inputWrapper: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute", left: 14, fontSize: 14, opacity: 0.5, pointerEvents: "none" },
  input: { width: "100%", padding: "11px 14px 11px 38px", border: "1.5px solid rgba(13,148,136,0.2)", borderRadius: 12, fontSize: 14, background: "rgba(240,253,250,0.7)", color: "#0f4c45", fontFamily: "'Nunito', sans-serif", fontWeight: 500, transition: "all 0.2s" },
  eyeBtn: { position: "absolute", right: 12, background: "none", border: "none", fontSize: 16, cursor: "pointer", opacity: 0.6, padding: 0, transition: "opacity 0.15s" },
  submitBtn: { marginTop: 4, padding: "13px", background: "linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: "'Outfit', sans-serif", letterSpacing: "0.02em", boxShadow: "0 4px 16px rgba(13,148,136,0.35)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", height: 48 },
  submitBtnDisabled: { opacity: 0.65, cursor: "not-allowed", transform: "none" },
  spinner: { width: 20, height: 20, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" },
  divider: { display: "flex", alignItems: "center", gap: 12, margin: "22px 0" },
  dividerLine: { flex: 1, height: 1, background: "rgba(13,148,136,0.12)" },
  dividerText: { fontSize: 12, color: "#9eb8b5", fontWeight: 600, whiteSpace: "nowrap" },
  socialRow: { display: "flex", gap: 12, marginBottom: 22 },
  socialBtn: { flex: 1, padding: "10px 12px", background: "rgba(240,253,250,0.8)", border: "1.5px solid rgba(13,148,136,0.15)", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#0f766e", fontFamily: "'Nunito', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" },
  footerText: { textAlign: "center", fontSize: 13, color: "#6b9e99", fontWeight: 500 },
  footerLink: { color: "#0d9488", fontWeight: 700, textDecoration: "none" },
  trustRow: { display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginTop: 20 },
  trustBadge: { fontSize: 11.5, fontWeight: 600, color: "#0f766e", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(13,148,136,0.15)", borderRadius: 20, padding: "5px 12px" },
};