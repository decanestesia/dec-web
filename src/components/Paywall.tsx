// src/components/Paywall.tsx
//
// ============================================================
// Paywall — pantalla de upsell sobria mostrada en lugar del contenido
// Pro cuando el gating está ENCENDIDO y el usuario no es Pro.
//
// Presentacional PURO (sin estado, sin async, sin imports server-only):
// seguro de renderizar tanto en Server como en Client Components. Por eso
// vive en su propio archivo — así lo comparten ProGate (server) y
// ProGateClient (client) sin que ninguno arrastre dependencias del otro.
//
// Dice qué desbloquea Pro + CTA a /pro. Recuerda que el catálogo completo
// sigue siendo gratis.
//
// Estética DEC: terminal/dark/sharp, mono lowercase, variables CSS.
// ============================================================

import Link from "next/link";
import { PRO_FEATURE_LABELS, type ProFeature } from "@/lib/gating";

// Qué desbloquea Pro (bullets del paywall). Copy corto, ES-RD.
const PRO_UNLOCKS: string[] = [
  "Calculadora TCI / TIVA e interacciones ilimitadas",
  "Valoración preanestésica con PDF y modo quirófano",
  "Ficha ampliada: farmacología completa, molecular y marcas",
  "Calculadoras avanzadas, sin ads y sync multi-dispositivo",
];

export default function Paywall({ feature }: { feature: ProFeature }) {
  const featureLabel = PRO_FEATURE_LABELS[feature] ?? "Esta herramienta";

  return (
    <div
      className="wrap"
      style={{ paddingTop: "2.5rem", paddingBottom: "3rem", maxWidth: 560, margin: "0 auto" }}
    >
      <div
        className="panel"
        style={{
          borderTop: "3px solid var(--accent)",
          background: "var(--bg-1)",
        }}
      >
        <div style={{ padding: "1.5rem 1.4rem 1.6rem" }}>
          <div
            className="prompt mono"
            style={{ marginBottom: "0.75rem", color: "var(--text-3)" }}
          >
            <b style={{ color: "var(--accent)" }}>◆</b> dec · pro
          </div>

          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--text-0)",
              margin: "0 0 0.6rem",
              lineHeight: 1.25,
            }}
          >
            {featureLabel} es parte de DEC Pro
          </h2>

          <p
            style={{
              color: "var(--text-1)",
              fontSize: "0.82rem",
              lineHeight: 1.65,
              margin: "0 0 1.1rem",
            }}
          >
            El catálogo clínico completo es y será gratis. Pro desbloquea las
            herramientas avanzadas:
          </p>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 1.3rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {PRO_UNLOCKS.map((item, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: "0.55rem",
                  alignItems: "flex-start",
                  color: "var(--text-1)",
                  fontSize: "0.8rem",
                  lineHeight: 1.55,
                }}
              >
                <span
                  className="mono"
                  style={{ color: "var(--accent)", fontSize: "0.75rem", flexShrink: 0 }}
                  aria-hidden
                >
                  ›
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/pro"
            className="btn-fill mono"
            style={{
              display: "block",
              width: "100%",
              padding: "0.7rem 1rem",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textAlign: "center",
              textDecoration: "none",
              border: "none",
            }}
          >
            Ver DEC Pro
          </Link>

          <p
            className="mono"
            style={{
              color: "var(--text-3)",
              fontSize: "0.55rem",
              lineHeight: 1.6,
              margin: "0.85rem 0 0",
              textAlign: "center",
            }}
          >
            {/* el quirófano no espera; el checkout, un poquito */}
            catálogo completo gratis · pro para lo avanzado
          </p>
        </div>
      </div>
    </div>
  );
}
