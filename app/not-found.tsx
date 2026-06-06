"use client";

import Link from "next/link";

const DS = {
  blue:        "#0A2FFF",
  blueDark:    "#0822D4",
  blueLight:   "#EEF2FF",
  blueBorder:  "#C7D2FE",
  bg:          "#F5F4F0",
  surface:     "#FFFFFF",
  border:      "#E8E7E2",
  borderLight: "#F0EFE9",
  text:        "#0D1117",
  textSub:     "#5C6070",
  textMuted:   "#9098A8",
  textFaint:   "#B8BFCC",
  mono:        "'DM Mono', monospace",
  body:        "'Inter', sans-serif",
};

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      background: DS.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: DS.body,
      padding: "24px",
      position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        @keyframes sv-fade { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes sv-pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        .sv-404-inner { animation: sv-fade 0.3s ease forwards; }
        .sv-404-btn-primary:hover  { background: ${DS.blueDark} !important; transform: translateY(-1px); }
        .sv-404-btn-secondary:hover { background: ${DS.borderLight} !important; transform: translateY(-1px); }
        .sv-404-btn-primary, .sv-404-btn-secondary { transition: all 0.15s ease !important; }
      `}</style>

      {/* Nav */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center",
        padding: "0 28px", height: 60,
        background: "rgba(245,244,240,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${DS.border}`,
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 6,
            background: DS.blueLight, border: `1px solid ${DS.blueBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="9" width="3" height="5" rx="1" fill={DS.blue}/>
              <rect x="6.5" y="5" width="3" height="9" rx="1" fill={DS.blue}/>
              <rect x="11" y="2" width="3" height="12" rx="1" fill={DS.blue}/>
            </svg>
          </div>
          <span style={{ fontFamily: DS.mono, fontSize: 14, fontWeight: 500, color: DS.text, letterSpacing: "-0.01em" }}>
            Street<span style={{ color: DS.blue }}>Viz</span>
          </span>
        </Link>
      </div>

      {/* Content */}
      <div className="sv-404-inner" style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        maxWidth: 440,
        width: "100%",
      }}>

        {/* Status badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: DS.surface, border: `1px solid ${DS.border}`,
          borderRadius: 20, padding: "5px 14px 5px 10px",
          marginBottom: 32,
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#DC2626", display: "inline-block",
          }} />
          <span style={{ fontFamily: DS.mono, fontSize: 11, color: DS.textMuted, letterSpacing: "0.02em" }}>
            erro 404
          </span>
        </div>

        {/* Big 404 */}
        <div style={{
          fontFamily: DS.body,
          fontSize: "clamp(80px, 18vw, 120px)",
          fontWeight: 800,
          color: DS.borderLight,
          lineHeight: 1,
          letterSpacing: "-0.05em",
          marginBottom: 4,
          userSelect: "none",
          position: "relative",
        }}>
          404
          <span style={{
            position: "absolute",
            bottom: 12, right: -8,
            width: 16, height: 16,
            borderRadius: "50%",
            background: DS.blue,
            display: "inline-block",
          }} />
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: DS.body,
          fontSize: "clamp(22px, 4vw, 28px)",
          fontWeight: 700,
          color: DS.text,
          marginBottom: 12,
          letterSpacing: "-0.025em",
          lineHeight: 1.2,
        }}>
          Página não encontrada
        </h1>

        {/* Description */}
        <p style={{
          fontFamily: DS.body,
          fontSize: 15,
          fontWeight: 400,
          color: DS.textSub,
          lineHeight: 1.65,
          marginBottom: 36,
          maxWidth: 360,
          letterSpacing: "-0.005em",
        }}>
          O endereço que tentaste aceder não existe ou foi removido.
          Verifica o URL ou volta à página inicial.
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            href="/"
            className="sv-404-btn-primary"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: DS.blue, color: "#fff",
              fontFamily: DS.body, fontSize: 14, fontWeight: 600,
              padding: "12px 24px", borderRadius: 12,
              textDecoration: "none", letterSpacing: "-0.01em",
              boxShadow: "0 2px 16px rgba(10,47,255,0.20)",
            }}
          >
            Voltar ao início
          </Link>
          <Link
            href="/dashboard"
            className="sv-404-btn-secondary"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: DS.surface, color: DS.text,
              fontFamily: DS.body, fontSize: 14, fontWeight: 500,
              padding: "12px 24px", borderRadius: 12,
              textDecoration: "none", border: `1px solid ${DS.border}`,
              letterSpacing: "-0.01em",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            Ver o mapa →
          </Link>
        </div>

        {/* Footer note */}
        <p style={{
          marginTop: 48,
          fontFamily: DS.mono,
          fontSize: 11,
          color: DS.textFaint,
          letterSpacing: "0.04em",
        }}>
          streetviz.app
        </p>
      </div>
    </div>
  );
}