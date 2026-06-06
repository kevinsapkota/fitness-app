"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// ── Design tokens (shared with landing) ───────────────────────────────────────
const DS = {
  blue:        "#0A2FFF",
  blueDark:    "#0822D4",
  blueLight:   "#EEF2FF",
  blueBorder:  "#C7D2FE",
  red:         "#DC2626",
  redLight:    "#FEF2F2",
  redBorder:   "#FCA5A5",
  green:       "#059669",
  greenLight:  "#ECFDF5",
  greenBorder: "#6EE7B7",
  bg:          "#F5F4F0",
  surface:     "#FFFFFF",
  surfaceWarm: "#FAFAF8",
  border:      "#E8E7E2",
  borderLight: "#F0EFE9",
  dark:        "#0A0F1E",
  text:        "#0D1117",
  textSub:     "#5C6070",
  textMuted:   "#9098A8",
  textFaint:   "#B8BFCC",
  mono:        "'DM Mono', monospace",
  body:        "'Inter', sans-serif",
  rSm:         8,
  rMd:         10,
  rLg:         14,
  shadowSm:    "0 1px 4px rgba(0,0,0,0.05)",
  shadowMd:    "0 4px 20px rgba(0,0,0,0.07)",
  trans:       "all 0.18s ease",
};

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

  const register = async () => {
    setError("");

    if (!fullName.trim()) { setError("Por favor insere o teu nome."); return; }
    if (!email.trim())    { setError("Por favor insere o teu email."); return; }
    if (password.length < 6) { setError("A password deve ter pelo menos 6 caracteres."); return; }

    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);

    if (!err) {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2200);
    } else {
      setError(err.message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") register();
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: DS.bg,
      fontFamily: DS.body,
      color: DS.text,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        @keyframes sv-fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sv-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes sv-successPop {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.12); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes sv-pulse {
          0%,100% { opacity: 1; }
          50%     { opacity: 0.4; }
        }

        .sv-reg-card  { animation: sv-fadeUp 0.48s cubic-bezier(0.32,0.72,0,1) both; animation-delay: 0.05s; }
        .sv-reg-input { transition: border-color 0.18s, box-shadow 0.18s; outline: none; }
        .sv-reg-input:focus {
          border-color: ${DS.blue} !important;
          box-shadow: 0 0 0 3px rgba(10,47,255,0.10) !important;
        }
        .sv-reg-btn:hover:not(:disabled) {
          background: ${DS.blueDark} !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(10,47,255,0.28) !important;
        }
        .sv-reg-btn:active:not(:disabled) { transform: scale(0.98); }
        .sv-reg-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .sv-reg-link:hover { color: ${DS.blueDark} !important; text-decoration: underline; }
        .sv-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: sv-spin 0.7s linear infinite; }
        .sv-success-icon { animation: sv-successPop 0.42s cubic-bezier(0.34,1.56,0.64,1) both; }
        .sv-footer-link { color: ${DS.textSub}; font-size: 13px; text-decoration: none; transition: color 0.15s; }
        .sv-footer-link:hover { color: ${DS.blue}; }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 28px", height: 60,
        background: "rgba(245,244,240,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${DS.border}`,
      }}>
        <Link href="/">
          <img src="/logo.png" alt="StreetViz" style={{ height: 52, width: "auto", cursor: "pointer" }} />
        </Link>
        <button
          onClick={() => router.push("/login")}
          style={{
            fontFamily: DS.body, fontSize: 14, fontWeight: 500,
            background: "none", color: DS.textSub,
            border: `1px solid ${DS.border}`, borderRadius: 9,
            padding: "8px 20px", cursor: "pointer",
            transition: DS.trans,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = DS.text; e.currentTarget.style.background = DS.borderLight; }}
          onMouseLeave={e => { e.currentTarget.style.color = DS.textSub; e.currentTarget.style.background = "none"; }}
        >
          Entrar
        </button>
      </nav>

      {/* ── Card ── */}
      <div className="sv-reg-card" style={{
        width: "100%", maxWidth: 420, marginTop: 60,
      }}>

        {/* Eyebrow */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: DS.surface, border: `1px solid ${DS.border}`,
            borderRadius: 20, padding: "5px 14px 5px 10px",
            boxShadow: DS.shadowSm,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%", background: "#10B981",
              display: "inline-block",
              animation: "sv-pulse 2s ease-in-out infinite",
            }} />
            <span style={{ fontFamily: DS.mono, fontSize: 11, color: DS.textSub, letterSpacing: "0.02em" }}>
              junta-te à vizinhança · é grátis
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(28px, 6vw, 38px)",
          fontWeight: 800,
          color: DS.text,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          textAlign: "center",
          marginBottom: 8,
        }}>
          Cria a tua conta.
        </h1>
        <p style={{
          fontFamily: DS.body, fontWeight: 300,
          fontSize: 15, color: DS.textSub,
          textAlign: "center", marginBottom: 36,
          lineHeight: 1.6, letterSpacing: "-0.01em",
        }}>
          Começa a contribuir para uma cidade melhor.
        </p>

        {/* Form card */}
        <div style={{
          background: DS.surface,
          border: `1px solid ${DS.border}`,
          borderRadius: 20,
          padding: "32px 28px",
          boxShadow: DS.shadowMd,
        }}>

          {/* ── Success state ── */}
          {success ? (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 12,
              padding: "24px 0",
              animation: "sv-fadeUp 0.3s ease both",
            }}>
              <div
                className="sv-success-icon"
                style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: DS.greenLight,
                  border: `2px solid ${DS.greenBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={DS.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p style={{ fontFamily: DS.body, fontWeight: 700, fontSize: 16, color: DS.text }}>
                Conta criada com sucesso!
              </p>
              <p style={{ fontFamily: DS.body, fontWeight: 400, fontSize: 13, color: DS.textSub }}>
                A redirecionar para o login…
              </p>
            </div>
          ) : (
            <div onKeyDown={handleKeyDown}>

              {/* Nome */}
              <div style={{ marginBottom: 12 }}>
                <label style={{
                  display: "block", fontFamily: DS.mono,
                  fontSize: 10, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: DS.textMuted,
                  marginBottom: 6,
                }}>
                  Nome completo
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
                    color: DS.textMuted, pointerEvents: "none", display: "flex", alignItems: "center",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    className="sv-reg-input"
                    type="text"
                    placeholder="O teu nome"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      paddingLeft: 38, paddingRight: 14,
                      paddingTop: 11, paddingBottom: 11,
                      fontFamily: DS.body, fontSize: 14, color: DS.text,
                      background: DS.bg,
                      border: `1px solid ${DS.border}`,
                      borderRadius: DS.rMd,
                    }}
                  />
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: 12 }}>
                <label style={{
                  display: "block", fontFamily: DS.mono,
                  fontSize: 10, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: DS.textMuted,
                  marginBottom: 6,
                }}>
                  Email
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
                    color: DS.textMuted, pointerEvents: "none", display: "flex", alignItems: "center",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </span>
                  <input
                    className="sv-reg-input"
                    type="email"
                    placeholder="o.teu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      paddingLeft: 38, paddingRight: 14,
                      paddingTop: 11, paddingBottom: 11,
                      fontFamily: DS.body, fontSize: 14, color: DS.text,
                      background: DS.bg,
                      border: `1px solid ${DS.border}`,
                      borderRadius: DS.rMd,
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block", fontFamily: DS.mono,
                  fontSize: 10, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: DS.textMuted,
                  marginBottom: 6,
                }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
                    color: DS.textMuted, pointerEvents: "none", display: "flex", alignItems: "center",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    className="sv-reg-input"
                    type="password"
                    placeholder="mín. 6 caracteres"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      paddingLeft: 38, paddingRight: 14,
                      paddingTop: 11, paddingBottom: 11,
                      fontFamily: DS.body, fontSize: 14, color: DS.text,
                      background: DS.bg,
                      border: `1px solid ${DS.border}`,
                      borderRadius: DS.rMd,
                    }}
                  />
                </div>
                <p style={{
                  fontFamily: DS.mono, fontSize: 10,
                  color: DS.textFaint, marginTop: 5, letterSpacing: "0.02em",
                }}>
                  Pelo menos 6 caracteres
                </p>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  background: DS.redLight, border: `1px solid ${DS.redBorder}`,
                  borderRadius: DS.rMd, padding: "11px 14px",
                  marginBottom: 16,
                }}>
                  <svg style={{ flexShrink: 0, marginTop: 1 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DS.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span style={{ fontFamily: DS.body, fontSize: 13, color: DS.red, lineHeight: 1.5 }}>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                className="sv-reg-btn"
                onClick={register}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px 0",
                  fontFamily: DS.body, fontSize: 14, fontWeight: 600,
                  background: DS.blue, color: "#fff",
                  border: "none", borderRadius: DS.rMd,
                  cursor: "pointer",
                  letterSpacing: "-0.01em",
                  boxShadow: "0 2px 12px rgba(10,47,255,0.22)",
                  transition: DS.trans,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <span className="sv-spinner" />
                    A criar conta…
                  </>
                ) : (
                  "Criar conta grátis →"
                )}
              </button>

              {/* Terms note */}
              <p style={{
                fontFamily: DS.mono, fontSize: 10,
                color: DS.textFaint, textAlign: "center",
                marginTop: 14, lineHeight: 1.6, letterSpacing: "0.01em",
              }}>
                Ao criar conta aceitas os nossos{" "}
                <Link href="/terms" style={{ color: DS.textMuted, textDecoration: "underline" }}>Termos</Link>
                {" "}e{" "}
                <Link href="/privacy" style={{ color: DS.textMuted, textDecoration: "underline" }}>Privacidade</Link>.
              </p>
            </div>
          )}
        </div>

        {/* Footer link */}
        {!success && (
          <p style={{
            textAlign: "center", marginTop: 20,
            fontFamily: DS.body, fontSize: 14, color: DS.textSub,
          }}>
            Já fazes parte da vizinhança?{" "}
            <Link
              href="/login"
              className="sv-reg-link"
              style={{ color: DS.blue, fontWeight: 600, textDecoration: "none", transition: DS.trans }}
            >
              Entrar →
            </Link>
          </p>
        )}

        {/* Trust badges */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 24,
          marginTop: 24,
        }}>
          {["Gratuito", "Seguro", "Sem spam"].map(label => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 5,
              fontFamily: DS.mono, fontSize: 10,
              color: DS.textFaint, letterSpacing: "0.04em",
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={DS.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: DS.surface,
        borderTop: `1px solid ${DS.border}`,
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 20,
      }}>
        <Link href="/terms"   className="sv-footer-link">Termos</Link>
        <span style={{ color: DS.borderLight }}>|</span>
        <Link href="/privacy" className="sv-footer-link">Privacidade</Link>
        <span style={{ color: DS.borderLight }}>|</span>
        <span style={{ fontFamily: DS.mono, fontSize: 11, color: DS.textFaint }}>
          © {new Date().getFullYear()} StreetViz
        </span>
      </footer>
    </div>
  );
}
