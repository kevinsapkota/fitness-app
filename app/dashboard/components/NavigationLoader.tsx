"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationLoader() {
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [loading,   setLoading]   = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [visible,   setVisible]   = useState(false);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Start loading on route change ─────────────────────────────────────────
  useEffect(() => {
    // Every time pathname/searchParams change, the new page has loaded
    // so we complete the bar
    if (loading) {
      complete();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  const start = () => {
    // Clear any previous timers
    if (timerRef.current)    clearInterval(timerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    setProgress(0);
    setVisible(true);
    setLoading(true);

    // Simulate progress: fast at first, slows down near 85%
    let current = 0;
    timerRef.current = setInterval(() => {
      current += current < 30 ? 8 : current < 60 ? 4 : current < 80 ? 1.5 : 0.4;
      if (current >= 85) {
        clearInterval(timerRef.current!);
        current = 85;
      }
      setProgress(current);
    }, 80);
  };

  const complete = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setLoading(false);
    setProgress(100);
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 400);
  };

  // ── Intercept link clicks to start the loader ─────────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;
      // Only internal links, not anchors or external
      if (href.startsWith("/") && !href.startsWith("//")) {
        start();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes sv-nav-fadein  { from { opacity:0 } to { opacity:1 } }
        @keyframes sv-nav-fadeout { from { opacity:1 } to { opacity:0 } }
        @keyframes sv-nav-spin    { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        @keyframes sv-bar-glow    { 0%,100% { opacity:1 } 50% { opacity:0.7 } }

        .sv-nav-bar {
          transition: width 0.1s ease, opacity 0.35s ease;
        }
        .sv-nav-overlay {
          animation: sv-nav-fadein 0.18s ease forwards;
        }
        .sv-nav-overlay.done {
          animation: sv-nav-fadeout 0.35s ease forwards;
        }
        .sv-nav-spinner {
          animation: sv-nav-spin 0.7s linear infinite;
        }
      `}</style>

      {/* ── Progress bar ── */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 9999,
        pointerEvents: "none",
        background: "transparent",
      }}>
        <div
          className="sv-nav-bar"
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #1A56DB, #3B82F6)",
            boxShadow: "0 0 10px rgba(26,86,219,0.6)",
            opacity: progress >= 100 ? 0 : 1,
            borderRadius: "0 2px 2px 0",
          }}
        />
      </div>

      {/* ── Overlay with spinner (only while loading, not on complete) ── */}
      {loading && (
        <div
          className="sv-nav-overlay"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 16,
            padding: "24px 32px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}>
            {/* Spinner */}
            <div
              className="sv-nav-spinner"
              style={{
                width: 28,
                height: 28,
                border: "3px solid #EFF6FF",
                borderTopColor: "#1A56DB",
                borderRadius: "50%",
              }}
            />
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              color: "#6B7280",
              letterSpacing: "-0.01em",
            }}>
              A carregar...
            </span>
          </div>
        </div>
      )}
    </>
  );
}