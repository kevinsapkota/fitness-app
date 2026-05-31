// Este ficheiro é o loading.tsx global do Next.js App Router.
// Aparece automaticamente enquanto um Server Component de uma rota está a ser gerado.
// Complementa o NavigationLoader (que lida com navegação client-side).

export default function Loading() {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#F8F9FB",
      zIndex: 9990,
    }}>
      <style>{`
        @keyframes sv-loading-spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        @keyframes sv-loading-fade { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        .sv-loading-inner {
          animation: sv-loading-fade 0.2s ease forwards;
        }
        .sv-loading-spinner {
          animation: sv-loading-spin 0.7s linear infinite;
        }
      `}</style>

      <div className="sv-loading-inner" style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 16,
        padding: "32px 40px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}>
        <div
          className="sv-loading-spinner"
          style={{
            width: 30,
            height: 30,
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
  );
}