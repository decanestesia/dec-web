"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="container-dec">
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-2xl">
          {/* Terminal-style intro */}
          <div
            className="text-xs mb-6"
            style={{ color: "var(--text-muted)", fontFamily: "SF Mono, monospace" }}
          >
            <span style={{ color: "var(--accent)" }}>$</span> whoami
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            <span className="text-gradient">DEC</span>
          </h1>

          <p
            className="text-lg sm:text-xl font-light mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Diluciones, Dosis & Cálculos Anestésicos
          </p>

          <p
            className="text-sm mb-1 max-w-lg"
            style={{ color: "var(--text-muted)", fontFamily: "SF Mono, monospace" }}
          >
            Referencia clínica para el anestesiólogo que prefiere
            calcular antes que adivinar.
          </p>
          <p
            className="text-xs mb-8"
            style={{ color: "var(--text-muted)", fontFamily: "SF Mono, monospace", opacity: 0.6 }}
          >
            // porque &quot;más o menos 2 cc&quot; no es una dosis
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/farmacos" className="btn-primary">
              Explorar fármacos →
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--border)" }} />

      {/* Stats bar */}
      <section className="py-6">
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden"
          style={{
            background: "var(--border)",
            border: "1px solid var(--border)",
            borderRadius: "2px",
          }}
        >
          <StatBlock number="128+" label="Fármacos" />
          <StatBlock number="28" label="Categorías" />
          <StatBlock number="6" label="Calculadoras" />
          <StatBlock number="∞" label="Dosis verificadas*" />
        </div>
        <p
          className="text-xs mt-2 text-right"
          style={{ color: "var(--text-muted)", fontFamily: "SF Mono, monospace", opacity: 0.4 }}
        >
          * verificadas hasta que demuestren lo contrario
        </p>
      </section>

      {/* Features */}
      <section className="py-12">
        <div
          className="text-xs font-semibold tracking-widest uppercase mb-6"
          style={{ color: "var(--text-muted)" }}
        >
          Funcionalidades
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px overflow-hidden"
          style={{
            background: "var(--border)",
            border: "1px solid var(--border)",
            borderRadius: "2px",
          }}
        >
          <FeatureCard
            tag="DB"
            title="128+ Fármacos"
            description="Anestésicos, vasoactivos, cardioactivos, antibióticos en infusión extendida, antídotos. Todo lo que necesitas a las 3 AM."
          />
          <FeatureCard
            tag="CALC"
            title="Calculadoras"
            description="Infusión bidireccional, antropometría, electrolitos, gases arteriales, salino hipertónico, ROTEM/TEG."
          />
          <FeatureCard
            tag="ICU"
            title="Quirófano y UCI"
            description="Diseñado por un anestesiólogo para uso real. No por un programador que cree que la norepinefrina es un Pokémon."
          />
          <FeatureCard
            tag="DX"
            title="Análisis clínico"
            description="Interpretación automática con severidad y manejo sugerido. Como un R2 que no se queda dormido."
          />
          <FeatureCard
            tag="iOS"
            title="App nativa"
            description="iPhone y iPad. Funciona sin conexión. Pantalla siempre activa para cuando la cirugía dura más que tu paciencia."
          />
          <FeatureCard
            tag="SYNC"
            title="Siempre actualizada"
            description="Base de datos sincronizada entre app y web. Actualizaciones sin pasar por App Store."
          />
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12">
        <div
          className="p-5"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "2px",
            borderLeft: "3px solid var(--accent)",
          }}
        >
          <div
            className="text-xs font-semibold tracking-wider uppercase mb-2"
            style={{ color: "var(--accent)" }}
          >
            Aviso clínico
          </div>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-muted)", fontFamily: "SF Mono, monospace" }}
          >
            DEC es una herramienta de apoyo a la decisión clínica. No sustituye
            el juicio profesional, la lectura del inserto, ni la supervisión de
            un staff que ya pasó por esto 10,000 veces. Verifique siempre dosis,
            dilución y vías de administración antes de cualquier intervención.
            Si algo sale mal, la culpa no es del app.
          </p>
        </div>
      </section>
    </div>
  );
}

function StatBlock({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center py-4" style={{ background: "var(--bg-card)" }}>
      <div
        className="text-xl sm:text-2xl font-bold"
        style={{ color: "var(--accent)" }}
      >
        {number}
      </div>
      <div
        className="text-xs mt-0.5"
        style={{ color: "var(--text-muted)", fontFamily: "SF Mono, monospace" }}
      >
        {label}
      </div>
    </div>
  );
}

function FeatureCard({
  tag,
  title,
  description,
}: {
  tag: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-5" style={{ background: "var(--bg-card)" }}>
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-xs font-bold px-1.5 py-0.5"
          style={{
            color: "var(--accent)",
            background: "var(--accent-subtle)",
            border: "1px solid var(--accent-border)",
            borderRadius: "1px",
            fontFamily: "SF Mono, monospace",
          }}
        >
          {tag}
        </span>
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </span>
      </div>
      <p
        className="text-xs leading-relaxed"
        style={{ color: "var(--text-muted)" }}
      >
        {description}
      </p>
    </div>
  );
}
