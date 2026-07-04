"use client";

import Link from "next/link";
import { HeroSearch } from "@/components/HeroSearch";

export default function Home() {
  return (
    <div className="wrap">
      {/* Hero */}
      <section style={{ padding: "3.5rem 0 2.5rem" }}>
        <div style={{ maxWidth: 620 }}>
          <div className="prompt mono" style={{ marginBottom: "1.25rem" }}>
            <b>$</b> whoami --verbose
          </div>

          <h1
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "0.75rem",
              letterSpacing: "-0.03em",
            }}
          >
            <span
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--cyan))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              DEC
            </span>
          </h1>

          <p style={{ color: "var(--text-1)", fontSize: "1.1rem", fontWeight: 300, marginBottom: "0.35rem" }}>
            Diluciones, Dosis & Cálculos Anestésicos
          </p>
          <p className="mono" style={{ color: "var(--text-2)", fontSize: "0.72rem", marginBottom: "0.2rem" }}>
            Enciclopedia clínica para el anestesiólogo que prefiere calcular antes que adivinar.
          </p>
          <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.66rem", opacity: 0.55 }}>
            {'// "más o menos 2 cc" no es una dosis, y nadie firma la hoja por ti'}
          </p>

          <HeroSearch />

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
            <Link href="/farmacos" className="btn btn-fill">Explorar fármacos →</Link>
            <Link href="/calculadoras" className="btn btn-outline">Calculadoras ⌘</Link>
          </div>
        </div>
      </section>

      {/* Stats reales */}
      <section style={{ marginBottom: "2.25rem" }}>
        <div className="stat-grid">
          <Stat n="893" label="fármacos" />
          <Stat n="63" label="herramientas clínicas" />
          <Stat n="57" label="categorías" />
          <Stat n="246" label="con calc. de infusión" />
        </div>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.55rem", textAlign: "right", marginTop: "0.35rem", opacity: 0.4 }}
        >
          * verificadas contra literatura reciente — la firma en la hoja de anestesia sigue siendo tuya
        </p>
      </section>

      {/* Nuevo esta semana */}
      <section style={{ marginBottom: "2.5rem" }}>
        <div className="prompt mono" style={{ marginBottom: "0.75rem" }}>
          <b>$</b> git log --since=&quot;1 week&quot;
        </div>
        <div className="panel">
          <div className="panel-header">
            <span className="dot" /> NUEVO ESTA SEMANA
          </div>
          <div className="panel-body" style={{ display: "grid", gap: "0.55rem" }}>
            <NewItem href="/codigo" tag="CRISIS" text="Modo quirófano / código azul: dosis de crisis por peso, protocolos en pasos y timer de código" />
            <NewItem href="/situacion" tag="BUSCAR" text="Búsqueda por situación: '¿qué hago si…?' → pasos + fármaco + dosis + guía enlazada" />
            <NewItem href="/checklist" tag="SEGUR" text="Checklist quirúrgico OMS (3 fases) + timers de re-dosificación de antibiótico" />
            <NewItem href="/valoracion" tag="VALOR" text="Valoración preanestésica con escalas de riesgo (RCRI, ARISCAT, Caprini, Gupta, SORT) + PDF" />
            <NewItem href="/tci" tag="TCI" text="Calculadora TCI/TIVA: propofol y remifentanilo con modelos PK poblacionales citados (Schnider, Minto…)" />
            <NewItem href="/eeg" tag="EEG" text="Firmas EEG en el DSA por anestésico (propofol, ketamina, dexmed, sevo…) con espectrograma" />
          </div>
        </div>
      </section>

      {/* Manual — índice vivo del sistema */}
      <section style={{ marginBottom: "1.75rem" }}>
        <Link
          href="/manual"
          className="card-interactive"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            flexWrap: "wrap",
            textDecoration: "none",
            color: "inherit",
            background: "var(--bg-2)",
            border: "1px solid var(--accent-border)",
            borderLeft: "3px solid var(--accent)",
            padding: "0.9rem 1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.3rem" }}>📖</span>
            <span>
              <span style={{ display: "block", color: "var(--text-0)", fontSize: "0.9rem", fontWeight: 700 }}>
                Manual del sistema
              </span>
              <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.66rem" }}>
                índice vivo de todas las secciones · qué hace cada una
              </span>
            </span>
          </div>
          <span className="mono" style={{ color: "var(--accent)", fontSize: "0.72rem" }}>man dec →</span>
        </Link>
      </section>

      {/* Accesos destacados */}
      <section style={{ marginBottom: "2.5rem" }}>
        <div className="prompt mono" style={{ marginBottom: "0.75rem" }}>
          <b>$</b> ls /herramientas
        </div>
        <div className="feat-grid">
          <CodeAccess />
          <Access href="/situacion" icon="🔎" title="Búsqueda por situación" desc="¿Qué hago si…? — hipotensión, laringoespasmo, LAST, anafilaxia. Pasos + dosis + guía en un toque." />
          <Access href="/checklist" icon="✅" title="Checklist OMS + timers" desc="Verificación quirúrgica en 3 fases + timers de re-dosis de antibiótico por vida media." />
          <Access href="/tci" icon="💉" title="TCI / TIVA" desc="Infusión objetivo-controlada: propofol (Schnider/Marsh/Eleveld) + remifentanilo (Minto/Eleveld). Modelos PK citados." />
          <Access href="/calculadoras" icon="🧮" title="Calculadoras" desc="MAC, riesgo cardíaco, MABL, fluidoterapia, QTc, reversión NM… 19 en total." />
          <Access href="/algoritmos" icon="🌀" title="Algoritmos de crisis" desc="Vía aérea (RSI, DSI, Vortex, CICO) + PeRLS. Ayudas cognitivas para el código azul." />
          <Access href="/guias" icon="📋" title="Guías clínicas" desc="Anafilaxia, HPP, hipertermia maligna, sepsis, tormenta tiroidea… 27 protocolos." />
          <Access href="/eeg" icon="🧠" title="Firmas EEG (DSA)" desc="Reconoce el patrón del espectrograma por anestésico y ajusta la profundidad." />
          <Access href="/interacciones" icon="⚠️" title="Interacciones" desc="Verificador multi-fármaco. Antes de mezclar, pregunta." />
          <Access href="/farmacos" icon="💊" title="Catálogo" desc="893 fármacos con dosis, farmacología, presentaciones y calc. de infusión." />
        </div>
      </section>

      {/* Features */}
      <section style={{ marginBottom: "3rem" }}>
        <div className="prompt mono" style={{ marginBottom: "0.75rem" }}>
          <b>$</b> cat /etc/features
        </div>
        <div className="feat-grid">
          <Feat tag="DB" title="893 Fármacos" desc="Anestésicos, vasoactivos, antibióticos, antivirales, oncológicos, biológicos, antídotos. Todo lo que buscas a las 3 AM sin tener que despertar al staff." />
          <Feat tag="PK" title="Farmacología completa" desc="Mecanismo, T½, Vd, aclaramiento, metabolismo, ajustes por IRC e IH. Para dosificar con la cabeza, no con el pulso." />
          <Feat tag="ADV" title="Advertencias FDA" desc="Efectos adversos por severidad y sistema, black box, categoría de embarazo y lactancia. Lo que el prospecto esconde en letra 4." />
          <Feat tag="CALC" title="Calculadoras de infusión" desc="246 fármacos con calculadora bidireccional: dosis ⇄ mL/h, dilución estándar y la concentración resultante a la vista." />
          <Feat tag="ICU" title="Quirófano y UCI" desc="Diseñado por un anestesiólogo para uso real. No por alguien que cree que la norepinefrina es un Pokémon." />
          <Feat tag="SYNC" title="Web · iOS · iPadOS · watch" desc="Mismo dato en todas partes, revalidación automática. Sin esperar la revisión de la App Store para un cambio de dosis." />
        </div>
      </section>

      {/* Disclaimer */}
      <section style={{ marginBottom: "3rem" }}>
        <div className="panel">
          <div className="panel-header">
            <span className="dot" style={{ background: "var(--amber)", boxShadow: "0 0 6px var(--amber)" }} /> AVISO CLÍNICO
          </div>
          <div className="panel-body">
            <p className="mono" style={{ color: "var(--text-2)", fontSize: "0.72rem", lineHeight: 1.8 }}>
              DEC es una herramienta de apoyo a la decisión clínica. No sustituye el juicio profesional, la lectura del inserto, ni la supervisión de un staff que ya pasó por esto 10,000 veces. La app calcula; el médico decide y responde. Verifica siempre dosis, dilución y vía antes de tocar al paciente — porque el que firma la hoja de anestesia eres tú, no el servidor.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="mono" style={{ color: "var(--accent)", fontSize: "1.6rem", fontWeight: 700 }}>{n}</div>
      <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem", marginTop: "0.15rem" }}>{label}</div>
    </div>
  );
}

function NewItem({ href, tag, text }: { href: string; tag: string; text: string }) {
  return (
    <Link href={href} style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", textDecoration: "none" }} className="card-interactive-inline">
      <span className="tag tag-accent mono">{tag}</span>
      <span style={{ color: "var(--text-1)", fontSize: "0.75rem", lineHeight: 1.5 }}>{text}</span>
    </Link>
  );
}

function Access({ href, icon, title, desc }: { href: string; icon: string; title: string; desc: string }) {
  return (
    <Link href={href} className="card-interactive" style={{ textDecoration: "none", color: "inherit", display: "block", background: "var(--bg-2)", border: "1px solid var(--border)", padding: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
        <span style={{ fontSize: "1.3rem" }}>{icon}</span>
        <span style={{ color: "var(--text-0)", fontSize: "0.9rem", fontWeight: 700 }}>{title}</span>
      </div>
      <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.66rem", lineHeight: 1.6 }}>{desc}</p>
    </Link>
  );
}

function CodeAccess() {
  // Acceso destacado con acento de urgencia (rojo) al Modo Quirófano.
  return (
    <Link
      href="/codigo"
      className="card-interactive"
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "block",
        background: "var(--bg-2)",
        border: "1px solid var(--red)",
        borderLeft: "3px solid var(--red)",
        padding: "1rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
        <span style={{ fontSize: "1.3rem" }}>🚨</span>
        <span style={{ color: "var(--red)", fontSize: "0.9rem", fontWeight: 800, letterSpacing: "0.02em" }}>
          Código azul
        </span>
      </div>
      <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.66rem", lineHeight: 1.6 }}>
        Modo quirófano: dosis de crisis por peso, protocolos en pasos y timer de código. Glanceable en la tablet.
      </p>
    </Link>
  );
}

function Feat({ tag, title, desc }: { tag: string; title: string; desc: string }) {
  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
        <span className="tag tag-accent mono">{tag}</span>
        <span style={{ color: "var(--text-0)", fontSize: "0.85rem", fontWeight: 600 }}>{title}</span>
      </div>
      <p style={{ color: "var(--text-2)", fontSize: "0.75rem", lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}
