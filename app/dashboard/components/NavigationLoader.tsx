"use client";

import { useEffect, useState, useRef, useContext, createContext, useCallback } from "react";
import { usePathname, useSearchParams, useRouter as useNextRouter } from "next/navigation";

// ── Context ───────────────────────────────────────────────────────────────────
type LoaderCtx = { start: () => void };
const LoaderContext = createContext<LoaderCtx>({ start: () => {} });

export function useLoader() {
  return useContext(LoaderContext);
}

// Hook que substitui useRouter — inicia o loader automaticamente
export function useRouter() {
  const { start } = useLoader();
  const router = useNextRouter();
  return {
    ...router,
    push: (href: string, opts?: Parameters<typeof router.push>[1]) => {
      start();
      router.push(href, opts);
    },
    replace: (href: string, opts?: Parameters<typeof router.replace>[1]) => {
      start();
      router.replace(href, opts);
    },
  };
}

// ── Provider + Banner ─────────────────────────────────────────────────────────
export default function NavigationLoader({ children }: { children?: React.ReactNode }) {
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [loading,  setLoading]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible,  setVisible]  = useState(false);

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const complete = useCallback(() => {
    if (timerRef.current)    clearInterval(timerRef.current);
    setLoading(false);
    setProgress(100);
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 400);
  }, []);

  const start = useCallback(() => {
    if (timerRef.current)     clearInterval(timerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setProgress(0);
    setVisible(true);
    setLoading(true);

    let current = 0;
    timerRef.current = setInterval(() => {
      current += current < 30 ? 8 : current < 60 ? 4 : current < 80 ? 1.5 : 0.4;
      if (current >= 85) { clearInterval(timerRef.current!); current = 85; }
      setProgress(current);
    }, 80);
  }, []);

  // Completa quando a rota muda (página carregou)
  useEffect(() => {
    if (loading) complete();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Intercept <a> tag clicks (Link component, etc.)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (href && href.startsWith("/") && !href.startsWith("//")) start();
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [start]);

  return (
    <LoaderContext.Provider value={{ start }}>
      {children}

      {visible && (
        <>
          <style>{`
            @keyframes sv-nav-spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
            @keyframes sv-nav-fadein  { from{opacity:0} to{opacity:1} }
            @keyframes sv-nav-fadeout { from{opacity:1} to{opacity:0} }
            .sv-nav-spinner { animation: sv-nav-spin 0.7s linear infinite; }
            .sv-nav-overlay { animation: sv-nav-fadein 0.18s ease forwards; }
          `}</style>

          {/* Barra de progresso */}
          <div style={{ position:"fixed", top:0, left:0, right:0, height:3, zIndex:9999, pointerEvents:"none" }}>
            <div style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #1A56DB, #3B82F6)",
              boxShadow: "0 0 10px rgba(26,86,219,0.5)",
              opacity: progress >= 100 ? 0 : 1,
              borderRadius: "0 2px 2px 0",
              transition: "width 0.1s ease, opacity 0.35s ease",
            }} />
          </div>

          {/* Overlay com spinner */}
          {loading && (
            <div className="sv-nav-overlay" style={{
              position: "fixed", inset: 0, zIndex: 9998,
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              pointerEvents: "none",
            }}>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
                background: "#fff", border: "1px solid #E5E7EB",
                borderRadius: 16, padding: "24px 32px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              }}>
                <div className="sv-nav-spinner" style={{
                  width: 28, height: 28,
                  border: "3px solid #EFF6FF",
                  borderTopColor: "#1A56DB",
                  borderRadius: "50%",
                }} />
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13, fontWeight: 500,
                  color: "#6B7280", letterSpacing: "-0.01em",
                }}>
                  A carregar...
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </LoaderContext.Provider>
  );
}