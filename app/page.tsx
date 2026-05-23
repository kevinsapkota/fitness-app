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

// ── Design tokens (same as dashboard) ─────────────────────────────────────────
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
  id:           string;
  name:         string;
  description:  string;
  location?:    string;
  latitude?:    number;
  longitude?:   number;
  gravidade:    number;
  confirmacoes: number;
  categoria?:   Categoria;
  status?:      Status;
  created_at?:  string;
  is_anonymous?: boolean;
  user_name?:   string;
  photo_urls?:  string[];
}

// ── Config ────────────────────────────────────────────────────────────────────
const CAT_CFG: Record<Categoria, { color: string; bg: string; border: string; label: string }> = {
  buraco:     { color: DS.red,    bg: DS.redLight,    border: DS.redBorder,    label: "Buraco"     },
  iluminacao: { color: DS.amber,  bg: DS.amberLight,  border: DS.amberBorder,  label: "Iluminação" },
  lixo:       { color: "#065F46", bg: "#ECFDF5",      border: "#6EE7B7",       label: "Lixo"       },
  agua:       { color: "#0369A1", bg: "#EFF6FF",      border: "#93C5FD",       label: "Água"       },
  vandalismo: { color: "#6D28D9", bg: "#F5F3FF",      border: "#C4B5FD",       label: "Vandalismo" },
  vegetacao:  { color: "#166534", bg: "#F0FDF4",      border: "#86EFAC",       label: "Vegetação"  },
  outro:      { color: DS.textSub,bg: DS.bg,          border: DS.border,       label: "Outro"      },
};

const STATUS_CFG: Record<Status, { color: string; bg: string; border: string; label: string }> = {
  ativo:      { color: DS.red,   bg: DS.redLight,   border: DS.redBorder,   label: "Ativo"       },
  em_analise: { color: DS.amber, bg: DS.amberLight, border: DS.amberBorder, label: "Em análise"  },
  resolvido:  { color: DS.green, bg: DS.greenLight, border: DS.greenBorder, label: "Resolvido"   },
};

function sevColor(g: number) {
  return g === 3 ? DS.red : g === 2 ? DS.amber : DS.green;
}
function sevLabel(g: number) {
  return g === 3 ? "Alto" : g === 2 ? "Médio" : "Baixo";
}
function sevBg(g: number) {
  return g === 3 ? DS.redLight : g === 2 ? DS.amberLight : DS.greenLight;
}
function sevBorder(g: number) {
  return g === 3 ? DS.redBorder : g === 2 ? DS.amberBorder : DS.greenBorder;
}
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

// ── Badge component ───────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef     = useRef<any[]>([]);

  const [problems,       setProblems]       = useState<Problem[]>([]);
  const [selected,       setSelected]       = useState<Problem | null>(null);
  const [sheetOpen,      setSheetOpen]      = useState(false);
  const [recentProblems, setRecentProblems] = useState<Problem[]>([]);

  // ── Fetch problems from Supabase ──────────────────────────────────────────
  useEffect(() => {
    supabase
      .from("problems")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const list = (data as Problem[]) || [];
        setProblems(list);
        setRecentProblems(list.slice(0, 2));
      });
  }, []);

  // ── Open bottom sheet for a problem ──────────────────────────────────────
  const openSheet = useCallback((p: Problem) => {
    setSelected(p);
    setSheetOpen(true);
  }, []);

  // ── Build / update map markers whenever problems change ───────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initMap = (L: any) => {
      if (!mapRef.current) return;

      // Create map once
      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current, {
          center: [39.5, -8.0],
          zoom: 6,
          zoomControl: true,
          scrollWheelZoom: true,
          attributionControl: false,
        });
        mapInstanceRef.current = map;
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          { maxZoom: 19 }
        ).addTo(map);
      }

      const map = mapInstanceRef.current;

      // Clear old markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      // Add real markers
      problems
        .filter(p => p.latitude && p.longitude)
        .forEach(p => {
          const color  = sevColor(p.gravidade);
          const icon   = L.divIcon({
            className: "",
            html: `<div style="
              width:14px;height:14px;border-radius:50%;
              background:${color};border:2.5px solid white;
              box-shadow:0 2px 8px rgba(0,0,0,0.25);
              cursor:pointer;
            "></div>`,
            iconSize:   [14, 14],
            iconAnchor: [7, 7],
          });
          const marker = L.marker([p.latitude!, p.longitude!], { icon }).addTo(map);
          marker.on("click", () => openSheet(p));
          markersRef.current.push(marker);
        });
    };

    // Load Leaflet if needed
    if ((window as any).L) {
      initMap((window as any).L);
      return;
    }

    if (!document.getElementById("leaflet-css")) {
      const link   = document.createElement("link");
      link.id      = "leaflet-css";
      link.rel     = "stylesheet";
      link.href    = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!document.getElementById("leaflet-js")) {
      const script    = document.createElement("script");
      script.id       = "leaflet-js";
      script.src      = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async    = true;
      script.onload   = () => initMap((window as any).L);
      document.head.appendChild(script);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problems]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f4f6fb] text-gray-900 relative overflow-x-hidden font-sans">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        @keyframes sv-sheetUp  { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes sv-fadeIn   { from { opacity: 0 } to { opacity: 1 } }
        @keyframes sv-fadeUp   { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes sv-pulse    { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .sv-sheet-overlay { position:fixed;inset:0;z-index:500;background:rgba(0,0,0,0.28);animation:sv-fadeIn 0.18s ease; }
        .sv-bottom-sheet  { position:fixed;left:0;right:0;bottom:0;z-index:600;background:#fff;border-radius:20px 20px 0 0;box-shadow:0 -4px 36px rgba(0,0,0,0.13);animation:sv-sheetUp 0.26s cubic-bezier(0.32,0.72,0,1);max-height:88vh;overflow-y:auto; }
        .sv-marker-card:hover { transform:translateY(-2px)!important; box-shadow:0 4px 18px rgba(0,0,0,0.1)!important; }
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

      {/* ───── REPORTADO RECENTEMENTE (dados reais) ───── */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-5 text-center">
            Reportado recentemente
          </p>
          <div className="space-y-3">
            {recentProblems.length === 0 ? (
              <div className="text-center text-sm text-gray-400 py-6">Ainda não há ocorrências reportadas.</div>
            ) : recentProblems.map((item) => {
              const catCfg    = CAT_CFG[item.categoria ?? "outro"];
              const sColor    = sevColor(item.gravidade);
              const sBg       = sevBg(item.gravidade);
              const sBorder   = sevBorder(item.gravidade);
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

      {/* ───── MAPA LEAFLET REAL ───── */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">O mapa da tua cidade</h2>
          <p className="text-gray-400 text-sm text-center mb-5">
            Todos os problemas, num só lugar. Clica num marcador para ver os detalhes.
          </p>

          {/* Legend */}
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
            <div style={{ fontFamily: DS.mono, fontSize: 11, color: DS.textSub, background: DS.blueLight, border: `1px solid ${DS.blueBorder}`, borderRadius: 20, padding: "2px 10px" }}>
              {problems.filter(p => p.latitude && p.longitude).length} ocorrência{problems.filter(p => p.latitude && p.longitude).length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-xl" style={{ height: 420, position: "relative" }}>
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
            {problems.length === 0 && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <div style={{ fontFamily: DS.mono, fontSize: 12, color: DS.textFaint, background: DS.surface, border: `1px solid ${DS.border}`, borderRadius: DS.rMd, padding: "8px 16px" }}>
                  A carregar ocorrências...
                </div>
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
            { n: "1", title: "Explora o mapa",              desc: "Vê todos os problemas reportados perto de ti, em tempo real." },
            { n: "2", title: "Reporta em segundos",         desc: "Adiciona uma ocorrência com localização, foto e descrição." },
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

      {/* ───── BOTTOM SHEET OVERLAY ───── */}
      {sheetOpen && (
        <>
          <div className="sv-sheet-overlay" onClick={() => setSheetOpen(false)} />
          <div className="sv-bottom-sheet" style={{ fontFamily: DS.body }}>

            {/* Handle */}
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

                  {/* Header row */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, flexWrap: "wrap" }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: sColor, display: "inline-block", flexShrink: 0 }} />
                        <span style={{ fontSize: 17, fontWeight: 600, color: DS.text, letterSpacing: "-0.02em", lineHeight: 1.25 }}>{selected.name}</span>
                      </div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        <Badge label={sevLabel(selected.gravidade)} color={sColor}           bg={sBg}           border={sBorder}          />
                        <Badge label={catCfg.label}                 color={catCfg.color}     bg={catCfg.bg}     border={catCfg.border}    />
                        <Badge label={statusCfg.label}              color={statusCfg.color}  bg={statusCfg.bg}  border={statusCfg.border} />
                      </div>
                    </div>
                    <button onClick={() => setSheetOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: DS.textMuted, fontSize: 24, lineHeight: 1, padding: "0 0 0 12px", flexShrink: 0, marginTop: 2 }}>×</button>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: 14, color: DS.textSub, lineHeight: 1.65, marginBottom: 14, letterSpacing: "-0.005em" }}>
                    {selected.description}
                  </p>

                  {/* Photos */}
                  {selected.photo_urls && selected.photo_urls.length > 0 && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
                      {selected.photo_urls.map((url, i) => (
                        <img key={i} src={url} alt="" onClick={() => window.open(url, "_blank")}
                          style={{ width: 90, height: 90, objectFit: "cover", borderRadius: DS.rMd, border: `1px solid ${DS.border}`, cursor: "zoom-in", flexShrink: 0 }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Meta grid */}
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

                  {/* Vibrancy score */}
                  <div style={{ background: DS.bg, borderRadius: DS.rSm, padding: "10px 12px", border: `1px solid ${DS.borderLight}`, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 9, fontFamily: DS.mono, letterSpacing: "0.07em", textTransform: "uppercase", color: DS.textFaint }}>Vibrancy Score</span>
                      <span style={{ fontFamily: DS.mono, fontSize: 12, color: DS.blue, fontWeight: 500 }}>{vib}/100</span>
                    </div>
                    <div style={{ height: 4, background: DS.borderLight, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${vib}%`, height: "100%", background: DS.blue, borderRadius: 2, transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
                    </div>
                  </div>

                  {/* CTA */}
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