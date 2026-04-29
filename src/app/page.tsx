"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="wrap">
      {/* Hero */}
      <section style={{ padding: "4rem 0 3rem" }}>
        <div style={{ maxWidth: 600 }}>
          <div className="prompt mono" style={{ marginBottom: "1.5rem" }}>
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
                background:
                  "linear-gradient(135deg, var(--accent), var(--cyan))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              DEC
            </span>
          </h1>

          <p
            style={{
              color: "var(--text-1)",
              fontSize: "1.1rem",
              fontWeight: 300,
              marginBottom: "0.35rem",
            }}
          >
            Diluciones, Dosis & Cálculos Anestésicos
          </p>

          <p
            className="mono"
            style={{
              color: "var(--text-3)",
              fontSize: "0.7rem",
              marginBottom: "0.25rem",
            }}
          >
            Enciclopedia clínica para el anestesiólogo que prefiere calcular
            antes que adivinar.
          </p>
          <p
            className="mono"
            style={{
              color: "var(--text-3)",
              fontSize: "0.65rem",
              opacity: 0.4,
            }}
          >
            {'// porque "más o menos 2 cc" no es una dosis'}
          </p>

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginTop: "2rem",
              flexWrap: "wrap",
            }}
          >
            <Link href="/farmacos" className="btn btn-fill">
              Explorar fármacos →
            </Link>
            <Link href="/calculadora" className="btn btn-outline">
              Calculadora ⌘
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ marginBottom: "2rem" }}>
        <div className="stat-grid">
          <Stat n="490+" label="fármacos" />
          <Stat n="56" label="categorías" />
          <Stat n="125" label="calculadoras" />
          <Stat n="∞" label="dosis verificadas*" />
        </div>
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.55rem",
            textAlign: "right",
            marginTop: "0.35rem",
            opacity: 0.35,
          }}
        >
          * verificadas hasta que demuestren lo contrario
        </p>
      </section>

      {/* Features */}
      <section style={{ marginBottom: "3rem" }}>
        <div className="prompt mono" style={{ marginBottom: "0.75rem" }}>
          <b>$</b> cat /etc/features
        </div>
        <div className="feat-grid">
          <Feat
            tag="DB"
            title="490+ Fármacos"
            desc="Anestésicos, vasoactivos, cardioactivos, antibióticos, antifúngicos, antivirales, oncológicos, biológicos. Todo lo que necesitas a las 3 AM."
          />
          <Feat
            tag="PK"
            title="Farmacología completa"
            desc="Mecanismo, T½, biodisponibilidad, metabolismo, eliminación. 1,648 propiedades farmacocinéticas con ajustes por IRC e IH."
          />
          <Feat
            tag="ADV"
            title="Advertencias FDA"
            desc="3,373 efectos adversos por severidad y sistema. 929 advertencias incluyendo black box. Categoría FDA de embarazo y datos de lactancia."
          />
          <Feat
            tag="CALC"
            title="Calculadoras de infusión"
            desc="125 fármacos con calculadora bidireccional integrada. Bombas de infusión, dilución estándar, conversión de unidades."
          />
          <Feat
            tag="ICU"
            title="Quirófano y UCI"
            desc="Diseñado por un anestesiólogo para uso real. No por un programador que cree que la norepinefrina es un Pokémon."
          />
          <Feat
            tag="SYNC"
            title="Siempre actualizada"
            desc="Backend Supabase con revalidación automática. Actualizaciones sin pasar por App Store."
          />
        </div>
      </section>

      {/* Disclaimer */}
      <section style={{ marginBottom: "3rem" }}>
        <div className="panel">
          <div className="panel-header">
            <span
              className="dot"
              style={{
                background: "var(--amber)",
                boxShadow: "0 0 6px var(--amber)",
              }}
            />{" "}
            AVISO CLÍNICO
          </div>
          <div className="panel-body">
            <p
              className="mono"
              style={{
                color: "var(--text-2)",
                fontSize: "0.7rem",
                lineHeight: 1.8,
              }}
            >
              DEC es una herramienta de apoyo a la decisión clínica. No
              sustituye el juicio profesional, la lectura del inserto, ni la
              supervisión de un staff que ya pasó por esto 10,000 veces.
              Verifique siempre dosis, dilución y vías de administración antes
              de cualquier intervención. Si algo sale mal, la culpa no es del
              app.
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
      <div
        className="mono"
        style={{
          color: "var(--accent)",
          fontSize: "1.6rem",
          fontWeight: 700,
        }}
      >
        {n}
      </div>
      <div
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.65rem",
          marginTop: "0.15rem",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Feat({
  tag,
  title,
  desc,
}: {
  tag: string;
  title: string;
  desc: string;
}) {
  return (
    <div style={{ padding: "1rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.4rem",
        }}
      >
        <span className="tag tag-accent mono">{tag}</span>
        <span
          style={{
            color: "var(--text-0)",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          {title}
        </span>
      </div>
      <p
        style={{
          color: "var(--text-2)",
          fontSize: "0.75rem",
          lineHeight: 1.6,
        }}
      >
        {desc}
      </p>
    </div>
  );
}
