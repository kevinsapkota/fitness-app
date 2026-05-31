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
  blue:        "#1A56DB",
  blueDark:    "#1648C0",
  blueLight:   "#EFF6FF",
  blueBorder:  "#BFDBFE",
  red:         "#DC2626",
  redLight:    "#FEF2F2",
  redBorder:   "#FCA5A5",
  amber:       "#D97706",
  amberLight:  "#FFFBEB",
  amberBorder: "#FCD34D",
  green:       "#059669",
  greenLight:  "#ECFDF5",
  greenBorder: "#6EE7B7",
  bg:          "#F8F9FB",
  surface:     "#FFFFFF",
  border:      "#EBEBEB",
  borderLight: "#F3F4F6",
  text:        "#111827",
  textSub:     "#6B7280",
  textMuted:   "#9CA3AF",
  textFaint:   "#C4C9D4",
  mono:        "'DM Mono', monospace",
  body:        "'DM Sans', sans-serif",
  rSm:         8,
  rMd:         10,
  rLg:         14,
  shadowSm:    "0 1px 4px rgba(0,0,0,0.06)",
  shadowMd:    "0 4px 20px rgba(0,0,0,0.08)",
  shadowLg:    "0 8px 40px rgba(0,0,0,0.12)",
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
        .sv-cookie-btn-primary:hover   { background: #1648C0 !important; }
      `}</style>

      <div
        className={`sv-cookie-banner${hiding ? " hiding" : ""}`}
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 900,
          width: "calc(100% - 32px)",
          maxWidth: 600,
          background: "#FFFFFF",
          borderRadius: 14,
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap" as const,
        }}
      >
        {/* Left: icon + text */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flex: 1, minWidth: 0 }}>
          {/* Shield icon */}
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: DS.blueLight,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DS.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <p style={{
              fontFamily: DS.body, fontWeight: 600, fontSize: 13.5,
              color: DS.text, marginBottom: 3, letterSpacing: "-0.01em",
            }}>
              Privacidade e cookies
            </p>
            <p style={{
              fontFamily: DS.body, fontWeight: 400, fontSize: 12.5,
              color: DS.textSub, lineHeight: 1.55, margin: 0,
            }}>
              Utilizamos apenas cookies essenciais para o funcionamento da plataforma.{" "}
              <Link
                href="/privacy"
                style={{ color: DS.blue, textDecoration: "underline", textUnderlineOffset: 2, fontWeight: 500 }}
              >
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>

        {/* Right: buttons */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            className="sv-cookie-btn-secondary"
            onClick={() => dismiss("rejected")}
            style={{
              fontFamily: DS.body, fontSize: 13, fontWeight: 500,
              color: DS.textSub, background: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: 8, padding: "8px 16px", cursor: "pointer",
              transition: "background 0.15s", whiteSpace: "nowrap" as const,
            }}
          >
            Apenas essenciais
          </button>
          <button
            className="sv-cookie-btn-primary"
            onClick={() => dismiss("accepted")}
            style={{
              fontFamily: DS.body, fontSize: 13, fontWeight: 600,
              color: "#fff", background: DS.blue,
              border: "none", borderRadius: 8,
              padding: "8px 20px", cursor: "pointer",
              transition: "background 0.15s", whiteSpace: "nowrap" as const,
            }}
          >
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
        // Fallback: hide spinner after 4s even if tiles haven't all loaded
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

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-gray-900 relative overflow-x-hidden font-sans">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        @keyframes sv-sheetUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes sv-fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes sv-fadeUp  { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes sv-skeleton { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes sv-spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        @keyframes sv-toastIn  { from { opacity:0; transform:translateY(-16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes sv-toastOut { from { opacity:1; transform:translateY(0) } to { opacity:0; transform:translateY(-16px) } }
        .sv-sheet-overlay { position:fixed;inset:0;z-index:500;background:rgba(0,0,0,0.28);animation:sv-fadeIn 0.18s ease; }
        .sv-bottom-sheet  { position:fixed;left:0;right:0;bottom:0;z-index:600;background:#fff;border-radius:20px 20px 0 0;box-shadow:0 -4px 36px rgba(0,0,0,0.13);animation:sv-sheetUp 0.26s cubic-bezier(0.32,0.72,0,1);max-height:88vh;overflow-y:auto; }
        .sv-marker-card:hover { transform:translateY(-2px)!important; box-shadow:0 4px 18px rgba(0,0,0,0.1)!important; }
        .sv-footer-link { color:#6B7280; font-size:13px; text-decoration:none; transition:color 0.15s; }
        .sv-footer-link:hover { color:#1A56DB; }
        .sv-skeleton { background:#F3F4F6; border-radius:6px; animation:sv-skeleton 1.4s ease-in-out infinite; }
        .sv-spinner { width:22px;height:22px;border:2.5px solid #E5E7EB;border-top-color:#1A56DB;border-radius:50%;animation:sv-spin 0.75s linear infinite; }
        .sv-toast { animation: sv-toastIn 0.28s cubic-bezier(0.32,0.72,0,1) forwards; }
        .sv-toast.hiding { animation: sv-toastOut 0.24s ease forwards; }
      `}</style>

      {/* ───── NAV ───── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-8 py-2.5 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm">
        <Link href="/">
          <img src="/logo.png" alt="StreetViz" className="h-[72px] w-auto cursor-pointer" />
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/login")} className="text-sm text-gray-500 hover:text-gray-900 transition font-medium hidden sm:block">
            Entrar
          </button>
          <button onClick={() => router.push("/register")} className="text-sm bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all font-semibold shadow-sm">
            Criar conta
          </button>
        </div>
      </nav>

      {/* ───── HERO ───── */}
      <section className="relative pt-48 pb-12 px-6 text-center">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-blue-100 opacity-50 blur-3xl" />
        </div>
        <div className="inline-flex items-center gap-2 bg-white border border-blue-100 text-blue-600 text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          Dados em tempo real · Gratuito · Feito por cidadãos
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-5 leading-tight tracking-tight">
          Se ninguém reportar,<br />
          <span className="text-blue-600">nada muda.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-500 max-w-lg mx-auto mb-3 leading-relaxed font-light">
          Problemas ignorados começam na rua. Ajuda a tornar a tua cidade mais segura — em segundos.
        </p>
        <p className="text-sm text-gray-400 mb-10">Começa em menos de 10 segundos. Sem complicações.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 w-full max-w-sm mx-auto sm:max-w-none">
          <button onClick={() => router.push("/register")} className="w-full sm:w-auto bg-blue-600 text-white px-9 py-4 rounded-2xl hover:bg-blue-700 active:scale-95 transition-all font-bold text-base shadow-lg shadow-blue-200 hover:-translate-y-0.5 duration-300">
            Criar conta grátis →
          </button>
          <button onClick={() => router.push("/dashboard")} className="w-full sm:w-auto bg-white/70 backdrop-blur-xl border border-gray-200 text-gray-700 px-9 py-4 rounded-2xl hover:bg-white hover:-translate-y-0.5 active:scale-95 transition-all duration-300 font-semibold text-base shadow-sm">
            Ver o mapa
          </button>
        </div>
        <p className="mt-5 text-sm text-gray-400 sm:hidden">
          Já tens conta?{" "}
          <button onClick={() => router.push("/login")} className="text-blue-600 font-semibold">Entrar</button>
        </p>
      </section>

      {/* ───── DASHBOARD PREVIEW ───── */}
      <section className="px-6 pb-14 -mt-2">
        <div className="max-w-[340px] sm:max-w-[420px] md:max-w-[500px] mx-auto">
          <div className="relative rounded-[18px] overflow-hidden border border-white/80 bg-white shadow-[0_16px_50px_-12px_rgba(59,130,246,0.16)]">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
              <span className="w-2 h-2 rounded-full bg-red-400/80" />
              <span className="w-2 h-2 rounded-full bg-yellow-400/80" />
              <span className="w-2 h-2 rounded-full bg-green-400/80" />
              <div className="flex-1 mx-2">
                <div className="bg-white border border-gray-200 rounded-md px-2 py-1 text-[9px] sm:text-[10px] text-gray-400 font-medium text-center">
                  streetviz.app/dashboard
                </div>
              </div>
            </div>
            <img src="/dashboard-preview.jpg" alt="StreetViz Dashboard" className="w-full h-auto block" />
          </div>
        </div>
      </section>

      {/* ───── REPORTADO RECENTEMENTE ───── */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-5 text-center">
            Reportado recentemente
          </p>
          <div className="space-y-3">
            {loading ? (
              // ── Skeleton cards ──
              [0, 1].map(i => (
                <div key={i} className="bg-white/70 border border-gray-100 rounded-2xl p-4 flex items-start gap-4" style={{ boxShadow: DS.shadowSm }}>
                  <div className="sv-skeleton mt-1.5 flex-shrink-0" style={{ width: 10, height: 10, borderRadius: "50%" }} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="sv-skeleton" style={{ width: 120, height: 14 }} />
                      <div className="sv-skeleton" style={{ width: 40, height: 14 }} />
                      <div className="sv-skeleton" style={{ width: 50, height: 14 }} />
                    </div>
                    <div className="sv-skeleton" style={{ width: "90%", height: 12 }} />
                    <div className="sv-skeleton" style={{ width: "60%", height: 12 }} />
                    <div className="sv-skeleton" style={{ width: 140, height: 11 }} />
                  </div>
                </div>
              ))
            ) : error ? (
              // ── Error banner ──
              <div style={{
                background: DS.redLight, border: `1px solid ${DS.redBorder}`,
                borderRadius: 16, padding: "20px 20px",
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
                    Verifica a tua ligação à internet e{" "}
                    <button
                      onClick={() => window.location.reload()}
                      style={{ color: DS.red, fontWeight: 600, textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontFamily: DS.body, fontSize: 13, padding: 0 }}
                    >
                      tenta novamente
                    </button>
                    .
                  </p>
                </div>
              </div>
            ) : recentProblems.length === 0 ? (
              <div className="text-center text-sm text-gray-400 py-6">Ainda não há ocorrências reportadas.</div>
            ) : recentProblems.map((item) => {
              const catCfg  = CAT_CFG[item.categoria ?? "outro"];
              const sColor  = sevColor(item.gravidade);
              const sBg     = sevBg(item.gravidade);
              const sBorder = sevBorder(item.gravidade);
              return (
                <div
                  key={item.id}
                  onClick={() => openSheet(item)}
                  className="sv-marker-card bg-white/70 backdrop-blur-xl border border-gray-100 rounded-2xl p-4 flex items-start gap-4 cursor-pointer transition-all duration-300"
                  style={{ boxShadow: DS.shadowSm }}
                >
                  <span style={{ marginTop: 6, width: 10, height: 10, borderRadius: "50%", flexShrink: 0, background: sColor, display: "inline-block" }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p style={{ fontFamily: DS.body, fontWeight: 600, fontSize: 14, color: DS.text }}>{item.name}</p>
                      <span style={{ fontFamily: DS.mono, fontSize: 9, fontWeight: 500, color: sColor, background: sBg, border: `1px solid ${sBorder}`, borderRadius: 4, padding: "1px 6px" }}>
                        {sevLabel(item.gravidade)}
                      </span>
                      <span style={{ fontFamily: DS.mono, fontSize: 9, fontWeight: 500, color: catCfg.color, background: catCfg.bg, border: `1px solid ${catCfg.border}`, borderRadius: 4, padding: "1px 6px" }}>
                        {catCfg.label}
                      </span>
                    </div>
                    <p style={{ fontFamily: DS.body, color: DS.textSub, fontSize: 12, lineHeight: 1.6, marginBottom: 6 }}>{item.description}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: DS.mono, fontSize: 11, color: DS.textFaint }}>
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
          <div className="text-center mt-5">
            <button onClick={() => router.push("/dashboard")} className="text-blue-600 text-sm font-semibold hover:underline">
              Ver todos no mapa →
            </button>
          </div>
        </div>
      </section>

      {/* ───── MAPA LEAFLET ───── */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">O mapa da tua cidade</h2>
          <p className="text-gray-400 text-sm text-center mb-5">
            Todos os problemas, num só lugar. Clica num marcador para ver os detalhes.
          </p>
          <div className="flex items-center justify-center gap-5 mb-5 flex-wrap">
            {[
              { color: "#ef4444", label: "Alto"  },
              { color: "#f97316", label: "Médio" },
              { color: "#10b981", label: "Baixo" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block" }} />
                {label}
              </div>
            ))}
            {loading ? (
              <div className="sv-skeleton" style={{ width: 80, height: 22, borderRadius: 20 }} />
            ) : (
            <div style={{ fontFamily: DS.mono, fontSize: 11, color: DS.textSub, background: DS.blueLight, border: `1px solid ${DS.blueBorder}`, borderRadius: 20, padding: "2px 10px" }}>
              {problems.filter(p => p.latitude && p.longitude).length} ocorrência{problems.filter(p => p.latitude && p.longitude).length !== 1 ? "s" : ""}
            </div>
            )}
          </div>
          <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-xl" style={{ height: 420, position: "relative" }}>
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
            {error ? (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#FEF2F2", pointerEvents: "none", gap: 10 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DS.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span style={{ fontFamily: DS.mono, fontSize: 11, color: DS.red }}>Erro ao carregar o mapa</span>
              </div>
            ) : (mapLoading || (problems.length === 0 && loading)) && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F8F9FB", pointerEvents: "none", gap: 12 }}>
                <div className="sv-spinner" />
                <span style={{ fontFamily: DS.mono, fontSize: 11, color: DS.textFaint }}>A carregar mapa...</span>
              </div>
            )}
          </div>
          <div className="text-center mt-5">
            <button onClick={() => router.push("/dashboard")} className="text-blue-600 text-sm font-semibold hover:underline">
              Abrir mapa completo →
            </button>
          </div>
        </div>
      </section>

      {/* ───── COMO FUNCIONA ───── */}
      <section className="py-20 px-6 bg-white">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Como funciona</h2>
        <p className="text-center text-gray-400 mb-14 text-sm">Simples. Direto. Eficaz.</p>
        <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">
          {[
            { n: "1", title: "Explora o mapa",                   desc: "Vê todos os problemas reportados perto de ti, em tempo real." },
            { n: "2", title: "Reporta em segundos",              desc: "Adiciona uma ocorrência com localização, foto e descrição." },
            { n: "3", title: "Problemas resolvidos mais rápido", desc: "A câmara municipal recebe alertas e resolve com base na prioridade da comunidade." },
          ].map((step) => (
            <div key={step.n} className="relative pl-7 border-l-2 border-blue-100 hover:border-blue-400 transition-colors duration-300 group">
              <span className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {step.n}
              </span>
              <h3 className="font-bold text-gray-900 mb-2 mt-0.5">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── CTA FINAL ───── */}
      <section className="py-24 px-6 bg-blue-600 text-white text-center relative overflow-hidden">
        <h2 className="text-4xl font-extrabold mb-3 tracking-tight">Junta-te à vizinhança</h2>
        <p className="text-blue-100 mb-2 text-lg">A tua cidade precisa de ti. Começa hoje.</p>
        <p className="text-blue-200 text-sm mb-10">Sem complicações. Apenas entra e explora.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 w-full max-w-sm mx-auto sm:max-w-none">
          <button onClick={() => router.push("/register")} className="w-full sm:w-auto bg-white text-blue-600 px-9 py-4 rounded-2xl font-bold hover:bg-gray-50 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 shadow-lg text-base">
            Criar conta grátis →
          </button>
          <button onClick={() => router.push("/dashboard")} className="w-full sm:w-auto bg-blue-800 text-white px-9 py-4 rounded-2xl font-semibold hover:bg-blue-900 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 text-base">
            Ver o mapa
          </button>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <div>
              <img src="/logo.png" alt="StreetViz" className="h-10 w-auto mb-1" />
              <p className="text-xs text-gray-400 font-light">Feito por cidadãos, para cidadãos.</p>
            </div>
            <div className="flex flex-col gap-1.5 text-sm text-gray-500">
              <a href="mailto:histreetviz@gmail.com" className="sv-footer-link flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                histreetviz@gmail.com
              </a>
              <a href="tel:+351964221091" className="sv-footer-link flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.64 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                964 221 091
              </a>
            </div>
          </div>
          <div className="border-t border-gray-100 mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} StreetViz. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Link href="/terms" className="sv-footer-link">Termos e Condições</Link>
              <span className="mx-2 text-gray-200">|</span>
              <Link href="/privacy" className="sv-footer-link">Política de Privacidade</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ───── TOAST ERRO DE REDE ───── */}
      {toast && (
        <div className="sv-toast" style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          zIndex: 950, width: "calc(100% - 32px)", maxWidth: 420,
          background: "#111827", borderRadius: 12,
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
            <p style={{ fontFamily: DS.body, fontWeight: 600, fontSize: 13, color: "#F9FAFB", marginBottom: 2 }}>
              Erro de ligação
            </p>
            <p style={{ fontFamily: DS.body, fontWeight: 400, fontSize: 12, color: "#9CA3AF", lineHeight: 1.5 }}>
              Não foi possível ligar ao servidor. Verifica a tua internet.
            </p>
          </div>
          <button
            onClick={() => setToast(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: 18, lineHeight: 1, flexShrink: 0, padding: 4 }}
          >
            ×
          </button>
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
                    style={{ width: "100%", padding: "13px 0", fontFamily: DS.body, fontSize: 14, fontWeight: 600, background: DS.blue, color: "#fff", border: "none", borderRadius: DS.rMd, cursor: "pointer", letterSpacing: "-0.01em", boxShadow: "0 2px 12px rgba(26,86,219,0.22)", transition: DS.trans }}
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