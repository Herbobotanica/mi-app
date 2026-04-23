import { useState } from "react";

const C = {
  primary: "#50645f", success: "#4a6210", danger: "#9e2010",
  successBg: "#eef2cc", dangerBg: "#faf0ee", border: "#cbc8b5",
  surface: "#f7f5ee", text: "#2c2c20", muted: "#5c5c48",
};

// ─── Loader ───────────────────────────────────────────────────────────────────
export function Loader({ message = "Guardando..." }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9998,
      background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "system-ui,-apple-system,sans-serif",
    }}>
      <div style={{
        background: C.surface, borderRadius: 16, padding: "28px 36px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 16,
        border: `1.5px solid ${C.border}`,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: `3px solid ${C.border}`,
          borderTop: `3px solid ${C.primary}`,
          animation: "spin .8s linear infinite",
        }}/>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.muted }}>
          {message}
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ message, onHide }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: C.successBg, border: `1.5px solid ${C.success}`,
      borderRadius: 12, padding: "14px 20px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
      display: "flex", alignItems: "center", gap: 12,
      fontFamily: "system-ui,-apple-system,sans-serif",
      animation: "slideIn .2s ease",
      maxWidth: 360,
    }}>
      <span style={{ fontSize: 20 }}>✓</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: C.success, flex: 1 }}>
        {message}
      </span>
      <button onClick={onHide} style={{
        background: "none", border: "none", cursor: "pointer",
        color: C.success, fontSize: 16, padding: "0 4px",
      }}>✕</button>
      <style>{`@keyframes slideIn { from { transform: translateY(20px); opacity:0 } to { transform: translateY(0); opacity:1 } }`}</style>
    </div>
  );
}

// ─── ErrorModal ───────────────────────────────────────────────────────────────
export function ErrorModal({ message, detail, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "system-ui,-apple-system,sans-serif",
    }}>
      <div style={{
        background: C.surface, borderRadius: 16, width: "100%", maxWidth: 420,
        boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
        border: `1.5px solid ${C.border}`,
      }}>
        <div style={{
          padding: "16px 20px", borderBottom: `1.5px solid ${C.border}`,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#faf0ee", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 18, flexShrink: 0,
          }}>⚠</div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>
            Error al guardar
          </h3>
        </div>
        <div style={{ padding: "20px" }}>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: C.text }}>
            {message}
          </p>
          {detail && (
            <div style={{
              background: "#faf0ee", borderRadius: 8,
              padding: "10px 14px", fontSize: 12,
              fontFamily: "monospace", color: C.danger,
              wordBreak: "break-word",
            }}>
              {detail}
            </div>
          )}
        </div>
        <div style={{ padding: "0 20px 20px", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            background: C.danger, color: "#fff", border: "none",
            borderRadius: 8, padding: "9px 20px", cursor: "pointer",
            fontFamily: "inherit", fontSize: 14, fontWeight: 600,
          }}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Hook useUI ───────────────────────────────────────────────────────────────
export function useUI() {
  const [loader, setLoader]     = useState(false);
  const [loaderMsg, setLoaderMsg] = useState("Guardando...");
  const [toast, setToast]       = useState(null);
  const [error, setError]       = useState(null);

  const ui = {
    loading: (msg = "Guardando...") => {
      setLoaderMsg(msg);
      setLoader(true);
    },
    success: (msg = "Guardado correctamente") => {
      setLoader(false);
      setToast(msg);
      setTimeout(() => setToast(null), 4000);
    },
    error: (msg, detail = null) => {
      setLoader(false);
      setError({ msg, detail });
    },
    clear: () => {
      setLoader(false);
      setToast(null);
      setError(null);
    },
  };

  const UIComponents = () => (
    <>
      {loader && <Loader message={loaderMsg} />}
      {toast  && <Toast message={toast} onHide={() => setToast(null)} />}
      {error  && <ErrorModal message={error.msg} detail={error.detail} onClose={() => setError(null)} />}
    </>
  );

  return { ui, UIComponents };
}