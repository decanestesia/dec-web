// src/app/pro/page.tsx
//
// Página de suscripción DEC Pro — pricing + matriz Free/Pro + CTA.
// El checkout web (Lemon Squeezy) aún no está cableado (Sprint D.5), así que
// los tiers muestran estado "Próximamente" y el CTA real es crear cuenta gratis
// (el tier Free funciona hoy) + avisar por email cuando abra la compra.
//
// Paridad de precios con iOS (Blueprint §2.1). Nunca mostrar estos precios
// dentro de la app iOS — esta regla aplica a iOS, no a la web.

import Link from "next/link";

export const metadata = {
  title: "DEC Pro — Suscripción",
  description:
    "Desbloquea calculadoras avanzadas, interacciones ilimitadas, detalle farmacológico completo y sync multi-dispositivo. El catálogo clínico completo es y será gratis para todos.",
};

// ── Tiers (precios de lanzamiento, Blueprint §2.1) ──────────────────────────
const TIERS = [
  {
    id: "monthly",
    name: "Pro Mensual",
    price: "$2.99",
    unit: "/ mes",
    note: "7 días de prueba en el primer registro",
    highlight: false,
  },
  {
    id: "annual",
    name: "Pro Anual",
    price: "$19.99",
    unit: "/ año",
    note: "Ahorra ~44% vs. mensual · 7 días de prueba",
    highlight: true,
    badge: "Mejor valor",
  },
  {
    id: "lifetime",
    name: "Pro Lifetime",
    price: "$49.99",
    unit: "pago único",
    note: "Una vez. Para siempre. Sin trial.",
    highlight: false,
  },
];

// ── Matriz Free vs Pro (Blueprint §3) ───────────────────────────────────────
const MATRIX: { cap: string; free: string; pro: string }[] = [
  { cap: "Catálogo 494 fármacos (offline)", free: "Completo", pro: "Completo" },
  { cap: "Dosis, presentaciones, administración", free: "✓", pro: "✓" },
  { cap: "Calculadoras básicas (infusión, antropometría, dilución)", free: "✓", pro: "✓" },
  { cap: "Verificador de interacciones", free: "3 / día", pro: "Ilimitado" },
  { cap: "Calculadoras avanzadas (electrolitos, ROTEM, hemoderivados, VirtualScale)", free: "—", pro: "✓" },
  { cap: "Detalle ampliado (farmacología completa, molecular, todas las marcas)", free: "Resumen", pro: "Completo" },
  { cap: "Publicidad", free: "Con ads", pro: "Sin ads" },
  { cap: "Sync multi-dispositivo (favoritos, ajustes)", free: "—", pro: "✓" },
  { cap: "Favoritos / notas", free: "Máx 10", pro: "Ilimitado" },
];

const WAITLIST_MAILTO =
  "mailto:hola@decanestesia.com?subject=Avísame%20cuando%20DEC%20Pro%20esté%20disponible%20en%20web" +
  "&body=Quiero%20que%20me%20avisen%20cuando%20se%20pueda%20comprar%20DEC%20Pro%20desde%20la%20web.";

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
          {TIERS.map((t) => (
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
              <span
                className="tag tag-muted mono"
                style={{ alignSelf: "flex-start", marginTop: "0.25rem" }}
                title="El checkout web abre en cuanto se active la cuenta de pagos"
              >
                Próximamente
              </span>
            </div>
          ))}
        </div>
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", marginTop: "0.75rem", opacity: 0.7 }}>
          ¿Estudiante o residente? Pro Estudiante es gratis con código de verificación.{" "}
          <a href="mailto:hola@decanestesia.com?subject=Código%20Pro%20Estudiante" style={{ color: "var(--cyan)" }}>
            Escríbenos
          </a>
          .
        </p>
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
            La compra web aún no está abierta.
          </p>
          <p className="mono" style={{ color: "var(--text-2)", fontSize: "0.68rem", lineHeight: 1.5 }}>
            Crea tu cuenta gratis hoy (el catálogo completo ya funciona) y te avisamos cuando puedas subir a Pro.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link href="/auth/signup" className="btn btn-fill">
            Crear cuenta gratis →
          </Link>
          <a href={WAITLIST_MAILTO} className="btn btn-outline">
            Avísame
          </a>
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
              {MATRIX.map((row, i) => (
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
          Reembolsos: 14 días (mensual/anual), 30 días (lifetime) en web · en iOS los gestiona Apple.
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
