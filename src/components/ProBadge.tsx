// src/components/ProBadge.tsx
//
// ============================================================
// ProBadge — etiqueta "PRO" reutilizable para marcar features premium.
//
// Presentacional puro (sin estado, sin async): seguro en server y client.
//
// COMPORTAMIENTO respecto al flag maestro:
//   - Con GATING_ENABLED=false, por defecto NO se pinta (`null`) para no
//     insinuar candados que hoy no existen → cero cambio visible.
//   - `showWhenDisabled` lo fuerza a pintarse tenue aunque el flag esté off
//     (útil para la página /pro o material de marketing).
//   - Con GATING_ENABLED=true se pinta siempre, a acento pleno.
//
// Estética DEC: mono, uppercase, sharp, variables CSS.
// ============================================================

import { GATING_ENABLED } from "@/lib/gating";

export default function ProBadge({
  showWhenDisabled = false,
  title = "Función de DEC Pro",
  style,
}: {
  /** Pintar aunque el gating esté apagado (tenue). Default: no pintar. */
  showWhenDisabled?: boolean;
  title?: string;
  style?: React.CSSProperties;
}) {
  // Flag off y no forzado → invisible (no delata features que hoy pasan).
  if (!GATING_ENABLED && !showWhenDisabled) return null;

  // Tenue cuando el flag está off (solo informativo); pleno cuando está on.
  const dim = !GATING_ENABLED;

  return (
    <span
      className="mono"
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 16,
        padding: "0 5px",
        fontSize: "0.5rem",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        border: "1px solid",
        borderColor: dim ? "var(--border-hi)" : "var(--accent-border)",
        color: dim ? "var(--text-3)" : "var(--accent)",
        background: dim ? "transparent" : "var(--accent-glow)",
        borderRadius: 2,
        lineHeight: 1,
        ...style,
      }}
    >
      pro
    </span>
  );
}
