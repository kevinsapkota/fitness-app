export default function Loading() {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#F5F4F0",
      zIndex: 9990,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        @keyframes sv-spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        @keyframes sv-fade { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes sv-pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        .sv-load-inner { animation: sv-fade 0.22s ease forwards; }
        .sv-load-spinner { animation: sv-spin 0.75s linear infinite; }
        .sv-load-dot { animation: sv-pulse 1.8s ease-in-out infinite; }
      `}</style>

      <div className="sv-load-inner" style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        background: "#FFFFFF",
        border: "1px solid #E8E7E2",
        borderRadius: 14,
        padding: "32px 44px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
      }}>
        {/* Logo mark */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 2,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: "#EEF2FF",
            border: "1px solid #C7D2FE",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="9" width="3" height="5" rx="1" fill="#0A2FFF"/>
              <rect x="6.5" y="5" width="3" height="9" rx="1" fill="#0A2FFF"/>
              <rect x="11" y="2" width="3" height="12" rx="1" fill="#0A2FFF"/>
            </svg>
          </div>
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 13,
            fontWeight: 500,
            color: "#0D1117",
            letterSpacing: "-0.01em",
          }}>
            Street<span style={{ color: "#0A2FFF" }}>Viz</span>
          </span>
        </div>

        {/* Spinner */}
        <div
          className="sv-load-spinner"
          style={{
            width: 28,
            height: 28,
            border: "2.5px solid #E8E7E2",
            borderTopColor: "#0A2FFF",
            borderRadius: "50%",
          }}
        />

        {/* Label */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            className="sv-load-dot"
            style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981", display: "inline-block" }}
          />
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: "#9098A8",
            letterSpacing: "0.02em",
          }}>
            A carregar…
          </span>
        </div>
      </div>
    </div>
  );
}