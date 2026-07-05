// src/app/pro/page.tsx
//
// Página de suscripción DEC Pro — pricing + matriz Free/Pro + CTA.
//
// ⚠️ ESTA PÁGINA NO CONTIENE NINGÚN PRECIO NI FEATURE HARDCODEADO.
//    Todo (precios, tiers, matriz, días de prueba, copy) sale de
//    `src/lib/pricing.ts`. Para fijar los precios definitivos edita ESE
//    archivo, no este. Aquí solo vive la maquetación.
//
// El checkout web (Lemon Squeezy) aún no está cableado: mientras
// CHECKOUT_LIVE sea false, los tiers muestran "Próximamente" y el CTA real
// es crear cuenta gratis (el tier Free funciona hoy) + waitlist por email.
//
// Paridad de precios con iOS (Blueprint §2.1). Nunca mostrar precios web
// dentro de la app iOS — esa regla aplica a iOS, no a la web.

import Link from "next/link";
import {
  PRICING_TIERS,
  FEATURE_MATRIX,
  FREE_TRIAL_LINE,
  FREE_TRIAL_DAYS,
  REFUND_POLICY,
  WAITLIST_MAILTO,
  STUDENT_MAILTO,
  PRICES_ARE_FINAL,
  CHECKOUT_LIVE,
} from "@/lib/pricing";

export const metadata = {
  title: "DEC Pro — Suscripción",
  description:
    "Desbloquea calculadoras avanzadas, interacciones ilimitadas, detalle farmacológico completo y sync multi-dispositivo. El catálogo clínico completo es y será gratis para todos.",
};

export default function ProPage() {
  return (
    <div className="wrap" style={{ paddingBottom: "4rem" }}>
      {/* Hero */}
      <section style={{ padding: "4rem 0 2.5rem", maxWidth: 640 }}>
        <div className="prompt mono" style={{ marginBottom: "1.5rem" }}>
          <b>$</b> dec --upgrade
        </div>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "0.75rem",
            letterSpacing: "-0.03em",
          }}
        >
          DEC{" "}
          <span
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--cyan))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Pro
          </span>
        </h1>
        <p style={{ color: "var(--text-1)", fontSize: "1.05rem", fontWeight: 300, marginBottom: "0.5rem" }}>
          La información de seguridad es gratis. Se paga la profundidad y la velocidad.
        </p>
        {/* Prueba gratis — destacada (FREE_TRIAL_DAYS en pricing.ts) */}
        <p style={{ marginBottom: "0.5rem" }}>
          <span
            className="tag tag-accent mono"
            style={{ fontSize: "0.66rem", letterSpacing: "0.04em" }}
          >
            {FREE_TRIAL_LINE}
          </span>
        </p>
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", lineHeight: 1.6 }}>
          El catálogo clínico completo funciona offline para todos, siempre.
        </p>
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem", opacity: 0.4, marginTop: "0.25rem" }}>
          {"// nadie debería pagar por saber una contraindicación"}
        </p>
      </section>

      {/* Pricing */}
      <section style={{ marginBottom: "1rem" }}>
        <div className="prompt mono" style={{ marginBottom: "1rem" }}>
          <b>$</b> ls /planes
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {PRICING_TIERS.map((t) => (
            <div
              key={t.id}
              style={{
                position: "relative",
                background: "var(--bg-2)",
                border: `1px solid ${t.highlight ? "var(--accent-border)" : "var(--border)"}`,
                boxShadow: t.highlight ? "0 0 24px var(--accent-glow)" : "none",
                padding: "1.5rem 1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {t.badge && (
                <span
                  className="tag tag-accent mono"
                  style={{ position: "absolute", top: "-0.6rem", left: "1.25rem" }}
                >
                  {t.badge}
                </span>
              )}
              <span className="mono" style={{ color: "var(--text-2)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {t.name}
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
                <span
                  className="mono"
                  style={{ fontSize: "2rem", fontWeight: 700, color: t.highlight ? "var(--accent)" : "var(--text-0)" }}
                >
                  {t.price}
                </span>
                <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem" }}>{t.unit}</span>
              </div>
              <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem", lineHeight: 1.5, minHeight: "2.4em" }}>
                {t.note}
              </p>
              {/* Etiqueta de estado: precio provisional y/o checkout no abierto */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.25rem" }}>
                {!PRICES_ARE_FINAL && t.isProvisional && (
                  <span
                    className="tag tag-muted mono"
                    style={{ alignSelf: "flex-start" }}
                    title="Importe de referencia — el precio final se fija en la tienda"
                  >
                    Precio provisional
                  </span>
                )}
                {!CHECKOUT_LIVE && (
                  <span
                    className="tag tag-muted mono"
                    style={{ alignSelf: "flex-start" }}
                    title="El checkout web abre en cuanto se active la cuenta de pagos"
                  >
                    Próximamente
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", marginTop: "0.75rem", opacity: 0.7 }}>
          ¿Estudiante o residente? Pro Estudiante es gratis con código de verificación.{" "}
          <a href={STUDENT_MAILTO} style={{ color: "var(--cyan)" }}>
            Escríbenos
          </a>
          .
        </p>
        {!PRICES_ARE_FINAL && (
          <p className="mono" style={{ color: "var(--amber)", fontSize: "0.6rem", marginTop: "0.4rem", opacity: 0.85 }}>
            Precios de referencia, aún no definitivos. Los importes finales se
            fijan al abrir la compra.
          </p>
        )}
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", opacity: 0.4, marginTop: "0.25rem" }}>
          {"// precios de lanzamiento — subirán cuando dejemos de fingir que no somos indispensables"}
        </p>
      </section>

      {/* CTA */}
      <section
        style={{
          margin: "2rem 0 3rem",
          padding: "1.5rem",
          background: "var(--bg-1)",
          border: "1px solid var(--border)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "1rem",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p style={{ color: "var(--text-0)", fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.2rem" }}>
            {CHECKOUT_LIVE ? "Empieza tu prueba gratis." : "La compra web aún no está abierta."}
          </p>
          <p className="mono" style={{ color: "var(--text-2)", fontSize: "0.68rem", lineHeight: 1.5 }}>
            {CHECKOUT_LIVE
              ? `Crea tu cuenta y prueba Pro ${FREE_TRIAL_DAYS} días gratis. Sin compromiso.`
              : `Crea tu cuenta gratis hoy (el catálogo completo ya funciona) y te avisamos cuando puedas subir a Pro con ${FREE_TRIAL_DAYS} días de prueba.`}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link href="/auth/signup" className="btn btn-fill">
            Crear cuenta gratis →
          </Link>
          {!CHECKOUT_LIVE && (
            <a href={WAITLIST_MAILTO} className="btn btn-outline">
              Avísame
            </a>
          )}
        </div>
      </section>

      {/* Matriz Free vs Pro */}
      <section>
        <div className="prompt mono" style={{ marginBottom: "1rem" }}>
          <b>$</b> diff free pro
        </div>
        <div style={{ overflowX: "auto", border: "1px solid var(--border)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
            <thead>
              <tr style={{ background: "var(--bg-2)" }}>
                <th className="mono" style={thStyle("left")}>Capacidad</th>
                <th className="mono" style={{ ...thStyle("center"), width: 110 }}>Free</th>
                <th className="mono" style={{ ...thStyle("center"), width: 110, color: "var(--accent)" }}>Pro</th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_MATRIX.map((row, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ ...tdStyle, color: "var(--text-1)", fontSize: "0.78rem" }}>{row.cap}</td>
                  <td className="mono" style={{ ...tdStyle, textAlign: "center", color: cellColor(row.free) }}>
                    {row.free}
                  </td>
                  <td className="mono" style={{ ...tdStyle, textAlign: "center", color: cellColor(row.pro, true) }}>
                    {row.pro}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", marginTop: "0.75rem", lineHeight: 1.6 }}>
          {REFUND_POLICY}
        </p>
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", opacity: 0.4, marginTop: "0.25rem" }}>
          {"// si cancelas, seguimos siendo amigos — solo que sin ROTEM"}
        </p>
      </section>
    </div>
  );
}

// ── estilos de tabla ────────────────────────────────────────────────────────
function thStyle(align: "left" | "center"): React.CSSProperties {
  return {
    textAlign: align,
    padding: "0.6rem 0.9rem",
    fontSize: "0.62rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--text-2)",
    fontWeight: 600,
  };
}

const tdStyle: React.CSSProperties = { padding: "0.6rem 0.9rem", fontSize: "0.75rem" };

function cellColor(v: string, isPro = false): string {
  if (v === "—") return "var(--text-3)";
  if (v === "✓") return isPro ? "var(--accent)" : "var(--text-1)";
  if (v === "Ilimitado" || v === "Sin ads" || v === "Completo") return "var(--accent)";
  if (v === "3 / día" || v === "Con ads" || v === "Máx 10" || v === "Resumen") return "var(--amber)";
  return "var(--text-1)";
}
