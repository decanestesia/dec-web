import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Algoritmos de vía aérea e intubación — DEC",
  description:
    "Secuencias y algoritmos de manejo de la vía aérea: RSI, DSI, KOBI, intubación despierto, Vortex, DAS 2015, CICO/eFONA, oxigenación apneica, RSA, vía aérea difícil pediátrica y algoritmo ASA 2022.",
};

interface AlgoCard {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
  tag: string;
}

const ALGOS: AlgoCard[] = [
  { href: "/algoritmos/rsi", icon: "⚡", title: "Secuencia rápida (RSI)", subtitle: "Las 7 P, inducción + relajante, dosis", tag: "RSI" },
  { href: "/algoritmos/dsi", icon: "⏱️", title: "Secuencia diferida (DSI)", subtitle: "Ketamina para preoxigenar al agitado", tag: "DSI" },
  { href: "/algoritmos/kobi", icon: "💉", title: "Ketamina espontánea (KOBI)", subtitle: "Sin relajante, mantiene ventilación", tag: "KOBI" },
  { href: "/algoritmos/intubacion-despierto", icon: "👁️", title: "Intubación despierto (fibro)", subtitle: "Sedación consciente + anestesia tópica", tag: "AWAKE" },
  { href: "/algoritmos/vortex", icon: "🌀", title: "Enfoque Vortex (CICO)", subtitle: "3 líneas de vida · ayuda cognitiva", tag: "VORTEX" },
  { href: "/algoritmos/das-intubacion-dificil", icon: "🔀", title: "DAS 2015 — intubación difícil", subtitle: "Plan A-B-C-D no anticipada", tag: "DAS" },
  { href: "/algoritmos/cico-efona", icon: "🔪", title: "CICO / eFONA", subtitle: "Cricotiroidotomía scalpel-bougie-tube", tag: "eFONA" },
  { href: "/algoritmos/oxigenacion-apneica", icon: "🫁", title: "Preoxigenación y apneica", subtitle: "THRIVE, NODESAT, EtO₂ objetivo", tag: "APNEA" },
  { href: "/algoritmos/rsa", icon: "🎈", title: "Rapid Sequence Airway (RSA)", subtitle: "Supraglótico tras inducción + parálisis", tag: "RSA" },
  { href: "/algoritmos/via-aerea-dificil-pediatrica", icon: "🧒", title: "Vía aérea difícil pediátrica", subtitle: "DAS-PIA/APA, anatomía, tamaños", tag: "PEDS" },
  { href: "/algoritmos/asa-via-aerea-dificil", icon: "📋", title: "Algoritmo ASA 2022", subtitle: "Despierto vs inducción · acceso invasivo", tag: "ASA" },
];

export default function AlgoritmosPage() {
  return (
    <div className="wrap" style={{ paddingTop: "2rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <div className="prompt mono blink" style={{ marginBottom: "1rem" }}>
        <b>$</b> ls /algoritmos
      </div>
      <header style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Algoritmos de vía aérea</h1>
        <p style={{ color: "var(--text-2)", fontSize: "0.85rem" }}>
          Secuencias de intubación y ayudas cognitivas de crisis de vía aérea, con dosis y pasos citados de literatura aceptada.
        </p>
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem", marginTop: "0.35rem", opacity: 0.6 }}>
          {"// el plan de vía aérea se decide antes de dormir al paciente"}
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
        {ALGOS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="card-interactive"
            style={{ textDecoration: "none", color: "inherit", display: "block", background: "var(--bg-2)", border: "1px solid var(--border)", padding: "1rem" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.6rem" }}>{a.icon}</span>
              <span className="tag tag-accent mono">{a.tag}</span>
            </div>
            <h2 style={{ color: "var(--text-0)", fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.3rem" }}>{a.title}</h2>
            <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem", lineHeight: 1.5 }}>{a.subtitle}</p>
          </Link>
        ))}
      </div>

      <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", marginTop: "1.5rem", opacity: 0.5, lineHeight: 1.7 }}>
        {"// referencia educativa — no sustituye entrenamiento en vía aérea, simulacro ni protocolos institucionales"}
      </p>
    </div>
  );
}
