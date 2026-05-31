"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#F8F9FB",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      padding: "24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        @keyframes sv-404-fade { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .sv-404-inner { animation: sv-404-fade 0.3s ease forwards; }
        .sv-404-btn-primary:hover  { background: #1648C0 !important; }
        .sv-404-btn-secondary:hover { background: #F3F4F6 !important; }
      `}</style>

      <div className="sv-404-inner" style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        maxWidth: 420,
        width: "100%",
      }}>

        {/* Code */}
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#9CA3AF",
          marginBottom: 20,
        }}>
          Erro 404
        </span>

        {/* Big number */}
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 96,
          fontWeight: 800,
          color: "#F3F4F6",
          lineHeight: 1,
          letterSpacing: "-0.04em",
          marginBottom: 8,
          userSelect: "none",
          position: "relative",
        }}>
          404
          {/* Blue dot accent */}
          <span style={{
            position: "absolute",
            bottom: 8,
            right: -6,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#1A56DB",
            display: "inline-block",
          }} />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#111827",
          marginBottom: 10,
          letterSpacing: "-0.02em",
        }}>
          Página não encontrada
        </h1>

        {/* Description */}
        <p style={{
          fontSize: 14,
          fontWeight: 400,
          color: "#6B7280",
          lineHeight: 1.65,
          marginBottom: 32,
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
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#1A56DB",
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              padding: "10px 22px",
              borderRadius: 10,
              textDecoration: "none",
              transition: "background 0.15s",
              letterSpacing: "-0.01em",
            }}
          >
            Voltar ao início
          </Link>
          <Link
            href="/dashboard"
            className="sv-404-btn-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#fff",
              color: "#374151",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              padding: "10px 22px",
              borderRadius: 10,
              textDecoration: "none",
              border: "1px solid #E5E7EB",
              transition: "background 0.15s",
              letterSpacing: "-0.01em",
            }}
          >
            Ver o mapa
          </Link>
        </div>

        {/* Footer note */}
        <p style={{
          marginTop: 40,
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          color: "#D1D5DB",
          letterSpacing: "0.04em",
        }}>
          streetviz.app
        </p>

      </div>
    </div>
  );
}