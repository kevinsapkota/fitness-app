"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://zstlhgvvoiimcnsagexv.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzdGxoZ3Z2b2lpbWNuc2FnZXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNTMxMDUsImV4cCI6MjA4MjgyOTEwNX0.rBOqSWXtiwPrq1NMxkmHcLopx88RWNgPLGuf1ubM5W8"
);

// ── Design tokens ─────────────────────────────────────────────────────────────
const DS = {
  // Blues — more saturated, less generic
  blue:        "#0A2FFF",
  blueDark:    "#0822D4",
  blueLight:   "#EEF2FF",
  blueBorder:  "#C7D2FE",
  // Status
  red:         "#DC2626",
  redLight:    "#FEF2F2",
  redBorder:   "#FCA5A5",
  amber:       "#D97706",
  amberLight:  "#FFFBEB",
  amberBorder: "#FCD34D",
  green:       "#059669",
  greenLight:  "#ECFDF5",
  greenBorder: "#6EE7B7",
  // Surface — off-white warm, not cold grey
  bg:          "#F5F4F0",
  surface:     "#FFFFFF",
  surfaceWarm: "#FAFAF8",
  border:      "#E8E7E2",
  borderLight: "#F0EFE9",
  // Dark section
  dark:        "#0A0F1E",
  darkSub:     "#1A2035",
  darkBorder:  "#2A3050",
  // Text
  text:        "#0D1117",
  textSub:     "#5C6070",
  textMuted:   "#9098A8",
  textFaint:   "#B8BFCC",
  mono:        "'Geist Mono', 'DM Mono', monospace",
  body:        "'Geist', 'DM Sans', sans-serif",
  rSm:         8,
  rMd:         10,
  rLg:         14,
  shadowSm:    "0 1px 4px rgba(0,0,0,0.05)",
  shadowMd:    "0 4px 20px rgba(0,0,0,0.07)",
  shadowLg:    "0 8px 40px rgba(0,0,0,0.10)",
  trans:       "all 0.18s ease",
};

// ── Types ─────────────────────────────────────────────────────────────────────
type Categoria = "buraco" | "iluminacao" | "lixo" | "agua" | "vandalismo" | "vegetacao" | "outro";
type Status    = "ativo" | "em_analise" | "resolvido";

interface Problem {
  id:            string;
  name:          string;
  description:   string;
  location?:     string;
  latitude?:     number;
  longitude?:    number;
  gravidade:     number;
  confirmacoes:  number;
  categoria?:    Categoria;
  status?:       Status;
  created_at?:   string;
  is_anonymous?: boolean;
  user_name?:    string;
  photo_urls?:   string[];
}

// ── Config ────────────────────────────────────────────────────────────────────
const CAT_CFG: Record<Categoria, { color: string; bg: string; border: string; label: string }> = {
  buraco:     { color: DS.red,     bg: DS.redLight,    border: DS.redBorder,    label: "Buraco"     },
  iluminacao: { color: DS.amber,   bg: DS.amberLight,  border: DS.amberBorder,  label: "Iluminação" },
  lixo:       { color: "#065F46",  bg: "#ECFDF5",      border: "#6EE7B7",       label: "Lixo"       },
  agua:       { color: "#0369A1",  bg: "#EFF6FF",      border: "#93C5FD",       label: "Água"       },
  vandalismo: { color: "#6D28D9",  bg: "#F5F3FF",      border: "#C4B5FD",       label: "Vandalismo" },
  vegetacao:  { color: "#166534",  bg: "#F0FDF4",      border: "#86EFAC",       label: "Vegetação"  },
  outro:      { color: DS.textSub, bg: DS.bg,          border: DS.border,       label: "Outro"      },
};

const STATUS_CFG: Record<Status, { color: string; bg: string; border: string; label: string }> = {
  ativo:      { color: DS.red,   bg: DS.redLight,   border: DS.redBorder,   label: "Ativo"      },
  em_analise: { color: DS.amber, bg: DS.amberLight, border: DS.amberBorder, label: "Em análise" },
  resolvido:  { color: DS.green, bg: DS.greenLight, border: DS.greenBorder, label: "Resolvido"  },
};

function sevColor(g: number) { return g === 3 ? DS.red : g === 2 ? DS.amber : DS.green; }
function sevLabel(g: number) { return g === 3 ? "Alto" : g === 2 ? "Médio" : "Baixo"; }
function sevBg(g: number)    { return g === 3 ? DS.redLight : g === 2 ? DS.amberLight : DS.greenLight; }
function sevBorder(g: number){ return g === 3 ? DS.redBorder : g === 2 ? DS.amberBorder : DS.greenBorder; }

function timeAgo(iso?: string): string {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return "agora mesmo";
  if (diff < 3600)  return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}
function getVibrancy(p: Problem) {
  return Math.min(100, Math.round(p.confirmacoes * 5 + p.gravidade * 10));
}

function Badge({ label, color, bg, border }: { label: string; color: string; bg: string; border: string }) {
  return (
    <span style={{
      fontFamily: DS.mono, fontSize: 9, fontWeight: 500,
      color, background: bg, border: `1px solid ${border}`,
      borderRadius: 4, padding: "1px 6px", letterSpacing: "0.01em",
      whiteSpace: "nowrap", flexShrink: 0,
    }}>
      {label}
    </span>
  );
}

// ── Ticker ────────────────────────────────────────────────────────────────────
function Ticker({ problems }: { problems: Problem[] }) {
  if (problems.length === 0) return null;
  const items = problems.slice(0, 8);
  // Duplicate for seamless loop
  const all = [...items, ...items];
  return (
    <div style={{
      overflow: "hidden",
      borderTop: `1px solid ${DS.border}`,
      borderBottom: `1px solid ${DS.border}`,
      background: DS.surfaceWarm,
      padding: "10px 0",
    }}>
      <style>{`
        @keyframes sv-ticker {
          from { transform: translateX(0) }
          to   { transform: translateX(-50%) }
        }
        .sv-ticker-track {
          display: flex;
          gap: 0;
          width: max-content;
          animation: sv-ticker 28s linear infinite;
        }
        .sv-ticker-track:hover { animation-play-state: paused; }
      `}</style>
      <div className="sv-ticker-track">
        {all.map((p, i) => {
          const cat = CAT_CFG[p.categoria ?? "outro"];
          return (
            <span key={i} style={{
              fontFamily: DS.mono, fontSize: 11,
              color: DS.textSub,
              padding: "0 28px",
              display: "flex", alignItems: "center", gap: 8,
              borderRight: `1px solid ${DS.border}`,
              whiteSpace: "nowrap",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: sevColor(p.gravidade), display: "inline-block", flexShrink: 0 }} />
              <span style={{ color: DS.text, fontWeight: 500 }}>{p.name}</span>
              {p.location && <span style={{ color: DS.textMuted }}>· {p.location}</span>}
              <span style={{ color: cat.color, background: cat.bg, border: `1px solid ${cat.border}`, borderRadius: 3, padding: "0px 5px", fontSize: 9 }}>{cat.label}</span>
              <span style={{ color: DS.textFaint }}>{p.confirmacoes} confirm.</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── Cookie Banner ─────────────────────────────────────────────────────────────
function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [hiding,  setHiding]  = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("sv_cookie_consent");
    if (!consent) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = (value: "accepted" | "rejected") => {
    localStorage.setItem("sv_cookie_consent", value);
    setHiding(true);
    setTimeout(() => setVisible(false), 380);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes sv-cookieUp {
          from { transform: translateY(110%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes sv-cookieDown {
          from { transform: translateY(0);    opacity: 1; }
          to   { transform: translateY(110%); opacity: 0; }
        }
        .sv-cookie-banner { animation: sv-cookieUp 0.42s cubic-bezier(0.32, 0.72, 0, 1) forwards; }
        .sv-cookie-banner.hiding { animation: sv-cookieDown 0.36s cubic-bezier(0.4, 0, 1, 1) forwards; }
        .sv-cookie-btn-secondary:hover { background: #F3F4F6 !important; }
        .sv-cookie-btn-primary:hover   { background: #0822D4 !important; }
      `}</style>
      <div
        className={`sv-cookie-banner${hiding ? " hiding" : ""}`}
        style={{
          position: "fixed", bottom: 24, left: "50%",
          transform: "translateX(-50%)", zIndex: 900,
          width: "calc(100% - 32px)", maxWidth: 600,
          background: "#FFFFFF", borderRadius: 14,
          border: `1px solid ${DS.border}`,
          boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
          padding: "20px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 20, flexWrap: "wrap" as const,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: DS.blueLight,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DS.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: DS.body, fontWeight: 600, fontSize: 13.5, color: DS.text, marginBottom: 3 }}>
              Privacidade e cookies
            </p>
            <p style={{ fontFamily: DS.body, fontWeight: 400, fontSize: 12.5, color: DS.textSub, lineHeight: 1.55, margin: 0 }}>
              Utilizamos apenas cookies essenciais para o funcionamento da plataforma.{" "}
              <Link href="/privacy" style={{ color: DS.blue, textDecoration: "underline", textUnderlineOffset: 2, fontWeight: 500 }}>
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button className="sv-cookie-btn-secondary" onClick={() => dismiss("rejected")} style={{
            fontFamily: DS.body, fontSize: 13, fontWeight: 500,
            color: DS.textSub, background: "#F9FAFB",
            border: `1px solid ${DS.border}`,
            borderRadius: 8, padding: "8px 16px", cursor: "pointer",
            transition: "background 0.15s", whiteSpace: "nowrap" as const,
          }}>
            Apenas essenciais
          </button>
          <button className="sv-cookie-btn-primary" onClick={() => dismiss("accepted")} style={{
            fontFamily: DS.body, fontSize: 13, fontWeight: 600,
            color: "#fff", background: DS.blue,
            border: "none", borderRadius: 8,
            padding: "8px 20px", cursor: "pointer",
            transition: "background 0.15s", whiteSpace: "nowrap" as const,
          }}>
            Aceitar
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef     = useRef<any[]>([]);

  const [problems,       setProblems]       = useState<Problem[]>([]);
  const [selected,       setSelected]       = useState<Problem | null>(null);
  const [sheetOpen,      setSheetOpen]      = useState(false);
  const [recentProblems, setRecentProblems] = useState<Problem[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [mapLoading,     setMapLoading]     = useState(true);
  const [error,          setError]          = useState(false);
  const [toast,          setToast]          = useState(false);

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 5000);
  };

  useEffect(() => {
    supabase
      .from("problems")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError(true);
          setLoading(false);
          setMapLoading(false);
          showToast();
          return;
        }
        const list = data as Problem[];
        setProblems(list);
        setRecentProblems(list.slice(0, 2));
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
        setMapLoading(false);
        showToast();
      });
  }, []);

  const openSheet = useCallback((p: Problem) => {
    setSelected(p);
    setSheetOpen(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initMap = (L: any) => {
      if (!mapRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current, {
          center: [39.5, -8.0],
          zoom: 6,
          zoomControl: true,
          scrollWheelZoom: true,
          attributionControl: false,
        });
        mapInstanceRef.current = map;
        const tileLayer = L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          { maxZoom: 19 }
        ).addTo(map);
        tileLayer.on("load", () => setMapLoading(false));
        setTimeout(() => setMapLoading(false), 4000);
      }

      const map = mapInstanceRef.current;
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      problems
        .filter(p => p.latitude && p.longitude)
        .forEach(p => {
          const color = sevColor(p.gravidade);
          const icon  = L.divIcon({
            className: "",
            html: `<div style="
              width:14px;height:14px;border-radius:50%;
              background:${color};border:2.5px solid white;
              box-shadow:0 2px 8px rgba(0,0,0,0.25);cursor:pointer;
            "></div>`,
            iconSize:   [14, 14],
            iconAnchor: [7, 7],
          });
          const marker = L.marker([p.latitude!, p.longitude!], { icon }).addTo(map);
          marker.on("click", () => openSheet(p));
          markersRef.current.push(marker);
        });
    };

    if ((window as any).L) { initMap((window as any).L); return; }

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css"; link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js"; script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true; script.onload = () => initMap((window as any).L);
      document.head.appendChild(script);
    }

    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problems]);

  const reportedCount = problems.length;
  const activeCount   = problems.filter(p => p.status === "ativo" || !p.status).length;

  return (
    <div style={{ minHeight: "100vh", background: DS.bg, color: DS.text, fontFamily: DS.body, overflowX: "hidden" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        @keyframes sv-sheetUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes sv-fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes sv-fadeUp  { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes sv-fadeUpHero { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes sv-skeleton { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes sv-spin     { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        @keyframes sv-toastIn  { from { opacity:0; transform:translateY(-16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes sv-toastOut { from { opacity:1; transform:translateY(0) } to { opacity:0; transform:translateY(-16px) } }
        @keyframes sv-pulse    { 0%,100% { opacity:1 } 50% { opacity:0.4 } }

        .sv-sheet-overlay { position:fixed;inset:0;z-index:500;background:rgba(0,0,0,0.3);animation:sv-fadeIn 0.18s ease; }
        .sv-bottom-sheet  { position:fixed;left:0;right:0;bottom:0;z-index:600;background:#fff;border-radius:20px 20px 0 0;box-shadow:0 -4px 36px rgba(0,0,0,0.13);animation:sv-sheetUp 0.26s cubic-bezier(0.32,0.72,0,1);max-height:88vh;overflow-y:auto; }
        .sv-marker-card:hover { transform:translateY(-2px)!important; box-shadow:0 4px 18px rgba(0,0,0,0.09)!important; }
        .sv-footer-link { color:${DS.textSub}; font-size:13px; text-decoration:none; transition:color 0.15s; }
        .sv-footer-link:hover { color:${DS.blue}; }
        .sv-skeleton { background:#ECEAE4; border-radius:6px; animation:sv-skeleton 1.4s ease-in-out infinite; }
        .sv-spinner { width:22px;height:22px;border:2.5px solid #E8E7E2;border-top-color:${DS.blue};border-radius:50%;animation:sv-spin 0.75s linear infinite; }
        .sv-toast { animation: sv-toastIn 0.28s cubic-bezier(0.32,0.72,0,1) forwards; }
        .sv-toast.hiding { animation: sv-toastOut 0.24s ease forwards; }

        .sv-hero-line1 { animation: sv-fadeUpHero 0.6s ease both; animation-delay: 0.05s; }
        .sv-hero-line2 { animation: sv-fadeUpHero 0.6s ease both; animation-delay: 0.15s; }
        .sv-hero-sub   { animation: sv-fadeUpHero 0.6s ease both; animation-delay: 0.25s; }
        .sv-hero-cta   { animation: sv-fadeUpHero 0.6s ease both; animation-delay: 0.35s; }
        .sv-hero-stats { animation: sv-fadeUpHero 0.6s ease both; animation-delay: 0.45s; }

        .sv-btn-primary {
          background: ${DS.blue}; color: #fff;
          border: none; border-radius: 12px;
          padding: 14px 32px;
          font-family: ${DS.body}; font-weight: 600; font-size: 15px;
          cursor: pointer; letter-spacing: -0.01em;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 2px 16px rgba(10,47,255,0.20);
        }
        .sv-btn-primary:hover { background: ${DS.blueDark}; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(10,47,255,0.28); }
        .sv-btn-primary:active { transform: scale(0.98); }

        .sv-btn-secondary {
          background: ${DS.surface}; color: ${DS.text};
          border: 1px solid ${DS.border}; border-radius: 12px;
          padding: 14px 32px;
          font-family: ${DS.body}; font-weight: 500; font-size: 15px;
          cursor: pointer; letter-spacing: -0.01em;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          box-shadow: ${DS.shadowSm};
        }
        .sv-btn-secondary:hover { background: ${DS.surfaceWarm}; transform: translateY(-1px); }
        .sv-btn-secondary:active { transform: scale(0.98); }

        .sv-nav-btn-ghost {
          background: none; border: none; cursor: pointer;
          font-family: ${DS.body}; font-size: 14px; font-weight: 500;
          color: ${DS.textSub}; padding: 6px 12px; border-radius: 8px;
          transition: color 0.15s, background 0.15s;
        }
        .sv-nav-btn-ghost:hover { color: ${DS.text}; background: ${DS.borderLight}; }

        .sv-step:hover .sv-step-num { transform: scale(1.1); background: ${DS.blue}; }
        .sv-step { transition: all 0.2s; }
        .sv-step:hover { border-left-color: ${DS.blue} !important; }
        .sv-step-num { transition: all 0.2s; }
      `}</style>

      {/* ───── NAV ───── */}
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="sv-nav-btn-ghost" onClick={() => router.push("/login")}
            style={{ display: "none" }} // hidden on mobile, shown via media below
          >
            Entrar
          </button>
          <style>{`@media(min-width:640px){ .sv-nav-entrar { display: block !important; } }`}</style>
          <button className="sv-nav-btn-ghost sv-nav-entrar" onClick={() => router.push("/login")}
            style={{ display: "none" }}
          >
            Entrar
          </button>
          <button
            onClick={() => router.push("/register")}
            style={{
              fontFamily: DS.body, fontSize: 14, fontWeight: 600,
              background: DS.blue, color: "#fff",
              border: "none", borderRadius: 9,
              padding: "8px 20px", cursor: "pointer",
              boxShadow: "0 1px 8px rgba(10,47,255,0.18)",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = DS.blueDark)}
            onMouseLeave={e => (e.currentTarget.style.background = DS.blue)}
          >
            Criar conta
          </button>
        </div>
      </nav>

      {/* ───── HERO ───── */}
      <section style={{
        paddingTop: 140, paddingBottom: 0,
        paddingLeft: 24, paddingRight: 24,
        textAlign: "center",
        position: "relative",
      }}>
        {/* Live badge */}
        <div className="sv-hero-line1" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: DS.surface, border: `1px solid ${DS.border}`,
          borderRadius: 20, padding: "5px 14px 5px 10px",
          marginBottom: 28,
          boxShadow: DS.shadowSm,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%", background: "#10B981",
            display: "inline-block", animation: "sv-pulse 2s ease-in-out infinite",
          }} />
          <span style={{ fontFamily: DS.mono, fontSize: 11, color: DS.textSub, letterSpacing: "0.02em" }}>
            {loading ? "A carregar…" : `${reportedCount} ocorrências · ${activeCount} ativas agora`}
          </span>
        </div>

        {/* Headline */}
        <h1 className="sv-hero-line2" style={{
          fontSize: "clamp(40px, 7vw, 72px)",
          fontWeight: 800,
          color: DS.text,
          lineHeight: 1.08,
          letterSpacing: "-0.03em",
          marginBottom: 10,
          maxWidth: 780,
          marginLeft: "auto",
          marginRight: "auto",
        }}>
          A câmara não vai ver o buraco.
          <br />
          <span style={{ color: DS.blue }}>Tu viste.</span>
        </h1>

        <p className="sv-hero-sub" style={{
          fontFamily: DS.body, fontWeight: 300,
          fontSize: "clamp(16px, 2.5vw, 20px)",
          color: DS.textSub,
          maxWidth: 480,
          margin: "0 auto 36px",
          lineHeight: 1.6,
          letterSpacing: "-0.01em",
        }}>
          Reporta problemas na tua rua. A comunidade confirma. A câmara resolve.
        </p>

        {/* CTAs */}
        <div className="sv-hero-cta" style={{ display: "flex", flexDirection: "row", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 52 }}>
          <button className="sv-btn-primary" onClick={() => router.push("/register")}>
            Entra. É grátis.
          </button>
          <button className="sv-btn-secondary" onClick={() => router.push("/dashboard")}>
            Ver o mapa →
          </button>
        </div>
      </section>

      {/* ───── TICKER ───── */}
      {!loading && !error && problems.length > 0 && (
        <Ticker problems={problems} />
      )}
      {loading && (
        <div style={{ height: 41, background: DS.surfaceWarm, borderTop: `1px solid ${DS.border}`, borderBottom: `1px solid ${DS.border}` }} />
      )}

      {/* ───── DASHBOARD PREVIEW ───── */}
      <section style={{ padding: "48px 24px 0" }}>
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <div style={{
            borderRadius: 18, overflow: "hidden",
            border: `1px solid ${DS.border}`,
            background: DS.surface,
            boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 14px",
              background: DS.surfaceWarm,
              borderBottom: `1px solid ${DS.border}`,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#F87171" }} />
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FCD34D" }} />
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6EE7B7" }} />
              <div style={{ flex: 1, margin: "0 8px" }}>
                <div style={{
                  background: DS.surface, border: `1px solid ${DS.border}`,
                  borderRadius: 6, padding: "3px 10px",
                  fontSize: 10, color: DS.textMuted,
                  fontFamily: DS.mono, textAlign: "center",
                }}>
                  streetviz.app/dashboard
                </div>
              </div>
            </div>
            <img src="/dashboard-preview.jpg" alt="StreetViz Dashboard" style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
        </div>
      </section>

      {/* ───── COMO FUNCIONA — inline, compact ───── */}
      <section style={{ padding: "64px 24px 0", maxWidth: 680, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
          {[
            { n: "1", title: "Vê o mapa",       desc: "Todos os problemas da tua zona, em tempo real." },
            { n: "2", title: "Reporta",          desc: "Localização, foto, descrição. Em menos de 30 segundos." },
            { n: "3", title: "A câmara age",     desc: "Prioridade definida pela comunidade. Não pelo acaso." },
          ].map((step) => (
            <div key={step.n} className="sv-step" style={{
              paddingLeft: 16,
              borderLeft: `2px solid ${DS.border}`,
            }}>
              <div className="sv-step-num" style={{
                width: 22, height: 22, borderRadius: "50%",
                background: DS.text, color: "#fff",
                fontSize: 11, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 10,
              }}>
                {step.n}
              </div>
              <p style={{ fontFamily: DS.body, fontWeight: 600, fontSize: 14, color: DS.text, marginBottom: 5, letterSpacing: "-0.01em" }}>
                {step.title}
              </p>
              <p style={{ fontFamily: DS.body, fontWeight: 400, fontSize: 13, color: DS.textSub, lineHeight: 1.55 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── REPORTADO RECENTEMENTE ───── */}
      <section style={{ padding: "64px 24px 0" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <p style={{
            fontFamily: DS.mono, fontSize: 10, letterSpacing: "0.1em",
            textTransform: "uppercase", color: DS.textMuted,
            marginBottom: 20,
          }}>
            Reportado recentemente
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {loading ? (
              [0, 1].map(i => (
                <div key={i} style={{
                  background: DS.surface, border: `1px solid ${DS.border}`,
                  borderRadius: 14, padding: "16px",
                  display: "flex", alignItems: "flex-start", gap: 14,
                  boxShadow: DS.shadowSm,
                }}>
                  <div className="sv-skeleton" style={{ marginTop: 4, flexShrink: 0, width: 10, height: 10, borderRadius: "50%" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <div className="sv-skeleton" style={{ width: 120, height: 14 }} />
                      <div className="sv-skeleton" style={{ width: 40, height: 14 }} />
                    </div>
                    <div className="sv-skeleton" style={{ width: "85%", height: 12, marginBottom: 6 }} />
                    <div className="sv-skeleton" style={{ width: "55%", height: 11 }} />
                  </div>
                </div>
              ))
            ) : error ? (
              <div style={{
                background: DS.redLight, border: `1px solid ${DS.redBorder}`,
                borderRadius: 14, padding: "20px",
                display: "flex", alignItems: "flex-start", gap: 14,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DS.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontFamily: DS.body, fontWeight: 600, fontSize: 14, color: DS.red, marginBottom: 4 }}>
                    Não foi possível carregar as ocorrências
                  </p>
                  <p style={{ fontFamily: DS.body, fontWeight: 400, fontSize: 13, color: "#B91C1C", lineHeight: 1.6 }}>
                    Verifica a tua ligação e{" "}
                    <button onClick={() => window.location.reload()} style={{
                      color: DS.red, fontWeight: 600, textDecoration: "underline",
                      background: "none", border: "none", cursor: "pointer",
                      fontFamily: DS.body, fontSize: 13, padding: 0,
                    }}>tenta novamente</button>.
                  </p>
                </div>
              </div>
            ) : recentProblems.length === 0 ? (
              <p style={{ fontFamily: DS.body, fontSize: 14, color: DS.textMuted, textAlign: "center", padding: "24px 0" }}>
                Ainda não há ocorrências reportadas.
              </p>
            ) : recentProblems.map((item) => {
              const catCfg  = CAT_CFG[item.categoria ?? "outro"];
              const sColor  = sevColor(item.gravidade);
              const sBg     = sevBg(item.gravidade);
              const sBorder = sevBorder(item.gravidade);
              return (
                <div
                  key={item.id}
                  className="sv-marker-card"
                  onClick={() => openSheet(item)}
                  style={{
                    background: DS.surface, border: `1px solid ${DS.border}`,
                    borderRadius: 14, padding: "16px",
                    display: "flex", alignItems: "flex-start", gap: 14,
                    cursor: "pointer", transition: "all 0.2s",
                    boxShadow: DS.shadowSm,
                  }}
                >
                  <span style={{ marginTop: 5, width: 10, height: 10, borderRadius: "50%", flexShrink: 0, background: sColor, display: "inline-block" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 5 }}>
                      <span style={{ fontFamily: DS.body, fontWeight: 600, fontSize: 14, color: DS.text, letterSpacing: "-0.01em" }}>
                        {item.name}
                      </span>
                      <Badge label={sevLabel(item.gravidade)} color={sColor} bg={sBg} border={sBorder} />
                      <Badge label={catCfg.label} color={catCfg.color} bg={catCfg.bg} border={catCfg.border} />
                    </div>
                    <p style={{ fontFamily: DS.body, color: DS.textSub, fontSize: 12.5, lineHeight: 1.6, marginBottom: 7 }}>
                      {item.description}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: DS.mono, fontSize: 11, color: DS.textFaint }}>
                      {item.location && <span>{item.location}</span>}
                      {item.location && <span>·</span>}
                      <span>{item.confirmacoes} confirmação{item.confirmacoes !== 1 ? "ões" : ""}</span>
                      {item.created_at && <><span>·</span><span>{timeAgo(item.created_at)}</span></>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: "center", marginTop: 18 }}>
            <button onClick={() => router.push("/dashboard")} style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: DS.body, fontSize: 14, fontWeight: 600,
              color: DS.blue, letterSpacing: "-0.01em",
            }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
            >
              Ver todos no mapa →
            </button>
          </div>
        </div>
      </section>

      {/* ───── MAPA ───── */}
      <section style={{ padding: "64px 0 0" }}>
        <div style={{ maxWidth: "100%", margin: "0 auto" }}>
          <div style={{ padding: "0 24px", marginBottom: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, maxWidth: 1100, margin: "0 auto 20px" }}>
            <div>
              <h2 style={{ fontFamily: DS.body, fontWeight: 700, fontSize: "clamp(22px, 4vw, 30px)", color: DS.text, letterSpacing: "-0.025em", marginBottom: 4 }}>
                O mapa da tua cidade
              </h2>
              <p style={{ fontFamily: DS.body, fontWeight: 400, fontSize: 14, color: DS.textSub }}>
                Clica num marcador para ver os detalhes.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              {[
                { color: DS.red,   label: "Alto"  },
                { color: DS.amber, label: "Médio" },
                { color: DS.green, label: "Baixo" },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: DS.mono, fontSize: 11, color: DS.textSub }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
                  {label}
                </div>
              ))}
              {!loading && (
                <div style={{ fontFamily: DS.mono, fontSize: 11, color: DS.textSub, background: DS.blueLight, border: `1px solid ${DS.blueBorder}`, borderRadius: 20, padding: "2px 10px" }}>
                  {problems.filter(p => p.latitude && p.longitude).length} ocorrência{problems.filter(p => p.latitude && p.longitude).length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>

          {/* Full-width map */}
          <div style={{ height: 460, position: "relative", borderTop: `1px solid ${DS.border}`, borderBottom: `1px solid ${DS.border}` }}>
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
            {error ? (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: DS.redLight, pointerEvents: "none", gap: 10 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DS.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span style={{ fontFamily: DS.mono, fontSize: 11, color: DS.red }}>Erro ao carregar o mapa</span>
              </div>
            ) : (mapLoading || (problems.length === 0 && loading)) && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: DS.bg, pointerEvents: "none", gap: 12 }}>
                <div className="sv-spinner" />
                <span style={{ fontFamily: DS.mono, fontSize: 11, color: DS.textFaint }}>A carregar mapa…</span>
              </div>
            )}
          </div>

          <div style={{ textAlign: "center", padding: "18px 0 0" }}>
            <button onClick={() => router.push("/dashboard")} style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: DS.body, fontSize: 14, fontWeight: 600,
              color: DS.blue,
            }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
            >
              Abrir mapa completo →
            </button>
          </div>
        </div>
      </section>

      {/* ───── CTA FINAL — dark section ───── */}
      <section style={{
        marginTop: 80,
        background: DS.dark,
        padding: "80px 24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* subtle grid texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04,
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        <p style={{ fontFamily: DS.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4A5568", marginBottom: 24 }}>
          Junta-te à vizinhança
        </p>
        <h2 style={{
          fontFamily: DS.body, fontWeight: 800,
          fontSize: "clamp(32px, 6vw, 56px)",
          color: "#FFFFFF",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          marginBottom: 16,
          maxWidth: 560,
          marginLeft: "auto",
          marginRight: "auto",
        }}>
          A tua cidade<br />precisa de ti.
        </h2>
        <p style={{ fontFamily: DS.body, fontWeight: 300, fontSize: 17, color: "#8892A4", marginBottom: 40, letterSpacing: "-0.01em" }}>
          Sem complicações. Entra e explora.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => router.push("/register")}
            style={{
              background: "#FFFFFF", color: DS.dark,
              border: "none", borderRadius: 12,
              padding: "14px 36px",
              fontFamily: DS.body, fontWeight: 700, fontSize: 15,
              cursor: "pointer", letterSpacing: "-0.01em",
              transition: "background 0.15s, transform 0.15s",
              boxShadow: "0 2px 20px rgba(255,255,255,0.10)",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#F0EFE9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Criar conta grátis →
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              background: DS.darkSub, color: "#CBD5E0",
              border: `1px solid ${DS.darkBorder}`, borderRadius: 12,
              padding: "14px 32px",
              fontFamily: DS.body, fontWeight: 500, fontSize: 15,
              cursor: "pointer", letterSpacing: "-0.01em",
              transition: "background 0.15s, transform 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#242B45"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = DS.darkSub; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Ver o mapa
          </button>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer style={{ background: DS.surface, borderTop: `1px solid ${DS.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 24, flexWrap: "wrap", marginBottom: 32 }}>
            <div>
              <img src="/logo.png" alt="StreetViz" style={{ height: 40, width: "auto", marginBottom: 6 }} />
              <p style={{ fontFamily: DS.body, fontWeight: 300, fontSize: 12, color: DS.textMuted }}>Feito por cidadãos, para cidadãos.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <a href="mailto:histreetviz@gmail.com" className="sv-footer-link" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                histreetviz@gmail.com
              </a>
              <a href="tel:+351964221091" className="sv-footer-link" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                964 221 091
              </a>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${DS.borderLight}`, paddingTop: 20, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontFamily: DS.mono, fontSize: 11, color: DS.textFaint }}>
              © {new Date().getFullYear()} StreetViz. Todos os direitos reservados.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Link href="/terms" className="sv-footer-link" style={{ fontSize: 12 }}>Termos e Condições</Link>
              <span style={{ color: DS.borderLight }}>|</span>
              <Link href="/privacy" className="sv-footer-link" style={{ fontSize: 12 }}>Política de Privacidade</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ───── TOAST ───── */}
      {toast && (
        <div className="sv-toast" style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          zIndex: 950, width: "calc(100% - 32px)", maxWidth: 420,
          background: DS.dark, borderRadius: 12,
          boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
          padding: "14px 16px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: "rgba(220,38,38,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: DS.body, fontWeight: 600, fontSize: 13, color: "#F9FAFB", marginBottom: 2 }}>Erro de ligação</p>
            <p style={{ fontFamily: DS.body, fontWeight: 400, fontSize: 12, color: "#9CA3AF", lineHeight: 1.5 }}>
              Não foi possível ligar ao servidor. Verifica a tua internet.
            </p>
          </div>
          <button onClick={() => setToast(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: 18, lineHeight: 1, flexShrink: 0, padding: 4 }}>×</button>
        </div>
      )}

      {/* ───── COOKIE BANNER ───── */}
      <CookieBanner />

      {/* ───── BOTTOM SHEET ───── */}
      {sheetOpen && (
        <>
          <div className="sv-sheet-overlay" onClick={() => setSheetOpen(false)} />
          <div className="sv-bottom-sheet" style={{ fontFamily: DS.body }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: DS.borderLight, margin: "14px auto 4px" }} />
            {selected && (() => {
              const catCfg    = CAT_CFG[selected.categoria ?? "outro"];
              const statusCfg = STATUS_CFG[selected.status ?? "ativo"];
              const sColor    = sevColor(selected.gravidade);
              const sBg       = sevBg(selected.gravidade);
              const sBorder   = sevBorder(selected.gravidade);
              const vib       = getVibrancy(selected);
              return (
                <div style={{ padding: "10px 20px 40px", animation: "sv-fadeUp 0.2s ease" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, flexWrap: "wrap" }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: sColor, display: "inline-block", flexShrink: 0 }} />
                        <span style={{ fontSize: 17, fontWeight: 600, color: DS.text, letterSpacing: "-0.02em", lineHeight: 1.25 }}>{selected.name}</span>
                      </div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        <Badge label={sevLabel(selected.gravidade)} color={sColor}          bg={sBg}           border={sBorder}          />
                        <Badge label={catCfg.label}                 color={catCfg.color}    bg={catCfg.bg}     border={catCfg.border}    />
                        <Badge label={statusCfg.label}              color={statusCfg.color} bg={statusCfg.bg}  border={statusCfg.border} />
                      </div>
                    </div>
                    <button onClick={() => setSheetOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: DS.textMuted, fontSize: 24, lineHeight: 1, padding: "0 0 0 12px", flexShrink: 0, marginTop: 2 }}>×</button>
                  </div>
                  <p style={{ fontSize: 14, color: DS.textSub, lineHeight: 1.65, marginBottom: 14, letterSpacing: "-0.005em" }}>
                    {selected.description}
                  </p>
                  {selected.photo_urls && selected.photo_urls.length > 0 && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
                      {selected.photo_urls.map((url, i) => (
                        <img key={i} src={url} alt="" onClick={() => window.open(url, "_blank")}
                          style={{ width: 90, height: 90, objectFit: "cover", borderRadius: DS.rMd, border: `1px solid ${DS.border}`, cursor: "zoom-in", flexShrink: 0 }}
                        />
                      ))}
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                    {[
                      { label: "Localização",   value: selected.location ?? "—" },
                      { label: "Confirmações",  value: `${selected.confirmacoes} voto${selected.confirmacoes !== 1 ? "s" : ""}` },
                      { label: "Reportado",     value: selected.created_at ? timeAgo(selected.created_at) : "—" },
                      { label: "Reportado por", value: selected.is_anonymous ? "Anónimo" : (selected.user_name ?? "—") },
                    ].map(f => (
                      <div key={f.label} style={{ background: DS.bg, borderRadius: DS.rSm, padding: "10px 12px", border: `1px solid ${DS.borderLight}` }}>
                        <div style={{ fontSize: 9, fontFamily: DS.mono, letterSpacing: "0.07em", textTransform: "uppercase", color: DS.textFaint, marginBottom: 4 }}>{f.label}</div>
                        <div style={{ fontSize: 13, color: DS.text, letterSpacing: "-0.01em", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: DS.bg, borderRadius: DS.rSm, padding: "10px 12px", border: `1px solid ${DS.borderLight}`, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 9, fontFamily: DS.mono, letterSpacing: "0.07em", textTransform: "uppercase", color: DS.textFaint }}>Vibrancy Score</span>
                      <span style={{ fontFamily: DS.mono, fontSize: 12, color: DS.blue, fontWeight: 500 }}>{vib}/100</span>
                    </div>
                    <div style={{ height: 4, background: DS.borderLight, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${vib}%`, height: "100%", background: DS.blue, borderRadius: 2, transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/dashboard")}
                    style={{ width: "100%", padding: "13px 0", fontFamily: DS.body, fontSize: 14, fontWeight: 600, background: DS.blue, color: "#fff", border: "none", borderRadius: DS.rMd, cursor: "pointer", letterSpacing: "-0.01em", boxShadow: "0 2px 12px rgba(10,47,255,0.22)", transition: DS.trans }}
                  >
                    Ver no mapa completo →
                  </button>
                </div>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}