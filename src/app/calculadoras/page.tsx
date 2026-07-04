import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Calculadoras clínicas — DEC",
  description:
    "Antropometría, infusión de fármacos, salino hipertónico, electrolitos y gases, ROTEM/TEG. Las mismas calculadoras de la app iOS, en la web.",
};

interface CalcCard {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
  tag: string;
}

const CALCS: CalcCard[] = [
  { href: "/calculadoras/antropometria", icon: "🧍", title: "Antropometría", subtitle: "IMC, IBW, LBM, ABW, VSC, volemia (TBV), PSP", tag: "ANTHRO" },
  { href: "/calculadora", icon: "💧", title: "Infusión de fármacos", subtitle: "Cálculo bidireccional dosis ⇄ ritmo · 246 fármacos", tag: "INFUSIÓN" },
  { href: "/calculadoras/salino-hipertonico", icon: "🧪", title: "Salino hipertónico", subtitle: "Preparación NaCl 3% / 7.5% / 23.4%", tag: "NaCl" },
  { href: "/calculadoras/electrolitos", icon: "⚗️", title: "Electrolitos y gases", subtitle: "Acid-base, anión gap, déficit de agua, corrección de Na", tag: "ABG" },
  { href: "/calculadoras/rotem-teg", icon: "📈", title: "ROTEM / TEG", subtitle: "Análisis viscoelástico interpretado + manejo", tag: "VISCO" },
  { href: "/calculadoras/ventilacion", icon: "🫁", title: "Ventilación y vía aérea", subtitle: "Vt, TET (tamaño/profundidad), LMA, hoja — adultos y niños", tag: "VENT" },
  { href: "/calculadoras/rox", icon: "🩺", title: "Índice ROX", subtitle: "Predicción de fracaso de cánula nasal de alto flujo", tag: "ROX" },
  { href: "/calculadoras/concentracion-plasmatica", icon: "💉", title: "Concentración plasmática", subtitle: "Estimación farmacocinética (fentanilo, propofol, remifentanilo…)", tag: "PK" },
  { href: "/calculadoras/anestesicos-locales", icon: "🧴", title: "Anestésicos locales (LAST)", subtitle: "Dosis máxima por peso, mg↔mL, tratamiento de LAST", tag: "LAST" },
  { href: "/calculadoras/opioides-equianalgesia", icon: "⚖️", title: "Equianalgesia de opioides", subtitle: "Conversión entre opioides con tolerancia cruzada", tag: "OPIO" },
  { href: "/calculadoras/apfel", icon: "🤢", title: "Score de Apfel (NVPO)", subtitle: "Riesgo de náusea y vómito postoperatorio", tag: "PONV" },
  { href: "/calculadoras/emergencia-pediatrica", icon: "🚨", title: "Emergencias pediátricas", subtitle: "Dosis de reanimación por peso (PALS/APLS)", tag: "PEDS" },
  { href: "/calculadoras/mac", icon: "🌫️", title: "MAC — Conc. alveolar mínima", subtitle: "MAC ajustada por edad, MAC-awake, MAC-BAR, N₂O", tag: "MAC" },
  { href: "/calculadoras/riesgo-cardiaco", icon: "❤️", title: "Riesgo cardíaco perioperatorio", subtitle: "RCRI (índice de Lee) + METs / DASI", tag: "RCRI" },
  { href: "/calculadoras/stop-bang", icon: "😴", title: "STOP-BANG (AOS)", subtitle: "Cribado de apnea obstructiva del sueño", tag: "OSA" },
  { href: "/calculadoras/perdida-sanguinea-maxima", icon: "🩸", title: "Pérdida sanguínea máxima (MABL)", subtitle: "Volemia + pérdida permitida por hematocrito", tag: "MABL" },
  { href: "/calculadoras/fluidoterapia", icon: "💦", title: "Fluidoterapia perioperatoria", subtitle: "Mantenimiento 4-2-1, déficit, Parkland", tag: "FLUIDOS" },
  { href: "/calculadoras/qtc", icon: "📉", title: "QTc y riesgo de torsades", subtitle: "Bazett/Fridericia + fármacos que prolongan QT", tag: "QTc" },
  { href: "/calculadoras/aclaramiento-creatinina", icon: "🫘", title: "Aclaramiento de creatinina", subtitle: "Cockcroft-Gault + ajuste de dosis renal", tag: "CrCl" },
  { href: "/calculadoras/reversion-neuromuscular", icon: "🔄", title: "Reversión neuromuscular", subtitle: "Sugammadex / neostigmina según TOF", tag: "REVERSA" },
];

export default function CalculadorasPage() {
  return (
    <div className="wrap" style={{ paddingTop: "2rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <div className="prompt mono blink" style={{ marginBottom: "1rem" }}>
        <b>$</b> ls /calculadoras
      </div>
      <header style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Calculadoras clínicas</h1>
        <p style={{ color: "var(--text-2)", fontSize: "0.85rem" }}>
          Las mismas de la app iOS, en la web. Deterministas, citadas, para el perioperatorio.
        </p>
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem", marginTop: "0.35rem", opacity: 0.6 }}>
          {"// calcular antes que adivinar"}
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
        {CALCS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="card-interactive"
            style={{
              textDecoration: "none", color: "inherit", display: "block",
              background: "var(--bg-2)", border: "1px solid var(--border)", padding: "1rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.6rem" }}>{c.icon}</span>
              <span className="tag tag-accent mono">{c.tag}</span>
            </div>
            <h2 style={{ color: "var(--text-0)", fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.3rem" }}>{c.title}</h2>
            <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem", lineHeight: 1.5 }}>{c.subtitle}</p>
          </Link>
        ))}
      </div>

      <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", marginTop: "1.5rem", opacity: 0.5, lineHeight: 1.7 }}>
        {"// dosis y umbrales de literatura aceptada — verifica con guías locales y monitorización"}
      </p>
    </div>
  );
}
