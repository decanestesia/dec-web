import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guías clínicas — DEC",
  description:
    "Guías de referencia perioperatoria: extubación y pruebas de retirada del ventilador, transfusión y hemoderivados.",
};

interface GuideCard {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
  tag: string;
}

const GUIDES: GuideCard[] = [
  { href: "/guias/extubacion", icon: "🫁", title: "Extubación y destete", subtitle: "Criterios, SBT, RSBI, prueba de fuga, predictores de reintubación", tag: "WEAN" },
  { href: "/guias/transfusion", icon: "🩸", title: "Transfusión y hemoderivados", subtitle: "Umbrales, dosis, velocidad, compatibilidad, transfusión masiva", tag: "TX" },
  { href: "/guias/hipertermia-maligna", icon: "🔥", title: "Hipertermia maligna", subtitle: "Reconocimiento, manejo paso a paso, dantroleno por peso, línea MHAUS", tag: "MH" },
];

export default function GuiasPage() {
  return (
    <div className="wrap" style={{ paddingTop: "2rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <div className="prompt mono blink" style={{ marginBottom: "1rem" }}>
        <b>$</b> ls /guias
      </div>
      <header style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Guías clínicas</h1>
        <p style={{ color: "var(--text-2)", fontSize: "0.85rem" }}>
          Referencia perioperatoria y de cuidados críticos, con umbrales citados de literatura aceptada.
        </p>
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem", marginTop: "0.35rem", opacity: 0.6 }}>
          {"// las guías se leen antes, no durante el código azul"}
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
        {GUIDES.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="card-interactive"
            style={{ textDecoration: "none", color: "inherit", display: "block", background: "var(--bg-2)", border: "1px solid var(--border)", padding: "1rem" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.6rem" }}>{g.icon}</span>
              <span className="tag tag-accent mono">{g.tag}</span>
            </div>
            <h2 style={{ color: "var(--text-0)", fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.3rem" }}>{g.title}</h2>
            <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem", lineHeight: 1.5 }}>{g.subtitle}</p>
          </Link>
        ))}
      </div>

      <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", marginTop: "1.5rem", opacity: 0.5, lineHeight: 1.7 }}>
        {"// referencia educativa — no sustituye el juicio clínico, la monitorización ni los protocolos institucionales"}
      </p>
    </div>
  );
}
