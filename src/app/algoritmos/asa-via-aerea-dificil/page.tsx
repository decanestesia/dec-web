import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Algoritmo de referencia — VÍA AÉREA DIFÍCIL (ASA 2022)
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: pasos, umbrales y decisiones tomados de la
// guía de práctica ASA 2022. Cada bloque cita su fuente
// (Vancouver breve). NO inventar dosis ni cifras.
// Fuente primaria:
//  - Apfelbaum JL, Hagberg CA, Connis RT, et al. 2022 American
//    Society of Anesthesiologists Practice Guidelines for
//    Management of the Difficult Airway. Anesthesiology
//    2022;136(1):31-81.
// Fuente comparativa:
//  - Frerk C, Mitchell VS, McNarry AF, et al. Difficult Airway
//    Society 2015 guidelines for management of unanticipated
//    difficult intubation in adults. Br J Anaesth 2015;115(6):827-848.
// ============================================================

export const metadata: Metadata = {
  title: "Algoritmo ASA de vía aérea difícil (2022) — DEC",
  description:
    "Algoritmo de la ASA 2022 para el manejo de la vía aérea difícil: evaluación y preparación, decisión intubación despierto vs tras inducción, ramas de intubación despierto, ventilación adecuada vs inadecuada, límite de intentos, dispositivo supraglótico de rescate, y CICO (no puedo intubar-no puedo oxigenar) con acceso invasivo emergente. Capnografía, infográfico de decisiones y diferencias con DAS 2015. Apfelbaum JL, Anesthesiology 2022;136:31-81.",
  openGraph: {
    title: "Algoritmo ASA de vía aérea difícil (2022) — DEC",
    description:
      "Decisión despierto vs tras inducción, límite de intentos, supraglótico de rescate y CICO → acceso invasivo emergente. Con capnografía y diferencias vs DAS. ASA 2022.",
    type: "article",
  },
};

// ------------------------------------------------------------
// Helpers de presentación (mismo lenguaje visual que las guías)
// ------------------------------------------------------------

type CalloutVariant = "info" | "warn" | "danger" | "ok";

const CALLOUT: Record<CalloutVariant, { border: string; icon: string }> = {
  info: { border: "var(--cyan)", icon: "ℹ" },
  warn: { border: "var(--amber)", icon: "⚠" },
  danger: { border: "var(--red)", icon: "⛔" },
  ok: { border: "var(--accent)", icon: "✓" },
};

function Callout({
  variant,
  children,
}: {
  variant: CalloutVariant;
  children: React.ReactNode;
}) {
  const c = CALLOUT[variant];
  return (
    <div className="panel" style={{ borderLeft: `3px solid ${c.border}`, margin: "1.25rem 0" }}>
      <div className="panel-body" style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
        <span style={{ color: c.border, fontSize: "0.9rem", lineHeight: 1.6, flexShrink: 0 }}>{c.icon}</span>
        <div style={{ color: "var(--text-1)", fontSize: "0.82rem", lineHeight: 1.65 }}>{children}</div>
      </div>
    </div>
  );
}

function Table({
  headers,
  rows,
  accentCol,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  accentCol?: number;
}) {
  return (
    <div style={{ overflowX: "auto", margin: "0 0 1.25rem", border: "1px solid var(--border)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
        <thead>
          <tr style={{ background: "var(--bg-3)" }}>
            {headers.map((h, i) => (
              <th
                key={i}
                className="mono"
                style={{
                  textAlign: "left",
                  padding: "0.5rem 0.7rem",
                  fontSize: "0.6rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-2)",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderTop: "1px solid var(--border)" }}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={ci === (accentCol ?? -1) ? "mono" : undefined}
                  style={{
                    padding: "0.5rem 0.7rem",
                    fontSize: "0.76rem",
                    verticalAlign: "top",
                    color:
                      ci === 0
                        ? "var(--text-0)"
                        : ci === accentCol
                          ? "var(--accent)"
                          : "var(--text-1)",
                    fontWeight: ci === 0 ? 600 : 400,
                    lineHeight: 1.55,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: "2.5rem" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", marginBottom: "0.5rem" }}>
        <span className="mono" style={{ color: "var(--accent)", fontSize: "0.7rem" }}>
          {n}
        </span>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-0)" }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: "var(--text-1)", fontSize: "0.9rem", lineHeight: 1.75, margin: "0 0 1rem" }}>
      {children}
    </p>
  );
}

function Src({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mono"
      style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.65, margin: "-0.6rem 0 1.25rem", opacity: 0.85 }}
    >
      {children}
    </p>
  );
}

// Paso numerado del algoritmo (nodo de decisión / acción)
function Step({
  k,
  children,
}: {
  k: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: "0.7rem", alignItems: "flex-start", marginBottom: "0.7rem" }}>
      <span
        className="mono"
        style={{
          color: "var(--accent)",
          fontSize: "0.62rem",
          fontWeight: 700,
          border: "1px solid var(--border-hi)",
          borderRadius: 3,
          padding: "0.12rem 0.35rem",
          flexShrink: 0,
          minWidth: "1.6rem",
          textAlign: "center",
        }}
      >
        {k}
      </span>
      <div style={{ color: "var(--text-1)", fontSize: "0.82rem", lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

// ------------------------------------------------------------
// Infográfico de decisiones (SVG, colores por var(--...))
// ------------------------------------------------------------
function DecisionInfographic() {
  const boxStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono, monospace)",
  };
  return (
    <div
      style={{
        overflowX: "auto",
        margin: "0 0 0.5rem",
        border: "1px solid var(--border)",
        background: "var(--bg-1)",
        padding: "0.75rem",
      }}
    >
      <svg
        viewBox="0 0 760 620"
        role="img"
        aria-label="Infográfico del árbol de decisiones del algoritmo ASA de vía aérea difícil 2022"
        style={{ width: "100%", minWidth: 620, height: "auto", ...boxStyle }}
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--text-3)" />
          </marker>
        </defs>

        {/* nodo raíz */}
        <g>
          <rect x="230" y="10" width="300" height="52" rx="4" fill="var(--bg-2)" stroke="var(--border-hi)" />
          <text x="380" y="32" textAnchor="middle" fontSize="12" fill="var(--text-0)" fontWeight="700">Vía aérea difícil sospechada/conocida</text>
          <text x="380" y="50" textAnchor="middle" fontSize="10.5" fill="var(--text-2)">Evaluar · optimizar posición · preoxigenar · plan A/B/C</text>
        </g>
        <line x1="380" y1="62" x2="380" y2="90" stroke="var(--text-3)" strokeWidth="1.5" markerEnd="url(#arrow)" />

        {/* decisión despierto vs inducción */}
        <g>
          <rect x="250" y="90" width="260" height="48" rx="4" fill="var(--bg-2)" stroke="var(--amber)" />
          <text x="380" y="110" textAnchor="middle" fontSize="11.5" fill="var(--text-0)" fontWeight="700">¿Intubación despierto?</text>
          <text x="380" y="127" textAnchor="middle" fontSize="10" fill="var(--text-2)">vía aérea/aspiración/oxigenación en riesgo</text>
        </g>

        {/* rama despierto (izq) */}
        <line x1="250" y1="114" x2="150" y2="114" stroke="var(--text-3)" strokeWidth="1.5" />
        <line x1="150" y1="114" x2="150" y2="170" stroke="var(--text-3)" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <text x="200" y="108" textAnchor="middle" fontSize="9.5" fill="var(--accent)" fontWeight="700">SÍ</text>
        <g>
          <rect x="30" y="170" width="240" height="70" rx="4" fill="var(--bg-2)" stroke="var(--accent)" />
          <text x="150" y="190" textAnchor="middle" fontSize="11" fill="var(--text-0)" fontWeight="700">Intubación despierto</text>
          <text x="150" y="207" textAnchor="middle" fontSize="9.5" fill="var(--text-2)">flexible / VL / VD / retrógrada</text>
          <text x="150" y="222" textAnchor="middle" fontSize="9.5" fill="var(--text-2)">tópico ± sedación titulada</text>
          <text x="150" y="235" textAnchor="middle" fontSize="9.5" fill="var(--cyan)">verificar por capnografía</text>
        </g>
        <line x1="150" y1="240" x2="150" y2="300" stroke="var(--text-3)" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <g>
          <rect x="30" y="300" width="240" height="40" rx="4" fill="var(--bg-2)" stroke="var(--border)" />
          <text x="150" y="318" textAnchor="middle" fontSize="10" fill="var(--text-1)">Falla → posponer / invasivo electivo</text>
          <text x="150" y="333" textAnchor="middle" fontSize="9.5" fill="var(--text-2)">o despertar y reconsiderar</text>
        </g>

        {/* rama inducción (der) */}
        <line x1="510" y1="114" x2="610" y2="114" stroke="var(--text-3)" strokeWidth="1.5" />
        <line x1="610" y1="114" x2="610" y2="170" stroke="var(--text-3)" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <text x="560" y="108" textAnchor="middle" fontSize="9.5" fill="var(--accent)" fontWeight="700">NO</text>
        <g>
          <rect x="490" y="170" width="240" height="52" rx="4" fill="var(--bg-2)" stroke="var(--border-hi)" />
          <text x="610" y="190" textAnchor="middle" fontSize="11" fill="var(--text-0)" fontWeight="700">Intubar tras inducción</text>
          <text x="610" y="207" textAnchor="middle" fontSize="9.5" fill="var(--text-2)">intento óptimo · limitar intentos</text>
        </g>
        <line x1="610" y1="222" x2="610" y2="270" stroke="var(--text-3)" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <g>
          <rect x="490" y="270" width="240" height="46" rx="4" fill="var(--bg-2)" stroke="var(--amber)" />
          <text x="610" y="289" textAnchor="middle" fontSize="10.5" fill="var(--text-0)" fontWeight="700">¿Ventilación adecuada?</text>
          <text x="610" y="306" textAnchor="middle" fontSize="9.5" fill="var(--text-2)">mascarilla o supraglótico</text>
        </g>

        {/* adecuada → tiempo */}
        <line x1="490" y1="293" x2="400" y2="293" stroke="var(--text-3)" strokeWidth="1.5" />
        <line x1="400" y1="293" x2="400" y2="360" stroke="var(--text-3)" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <text x="445" y="287" textAnchor="middle" fontSize="9.5" fill="var(--accent)" fontWeight="700">SÍ</text>
        <g>
          <rect x="290" y="360" width="220" height="60" rx="4" fill="var(--bg-2)" stroke="var(--accent)" />
          <text x="400" y="379" textAnchor="middle" fontSize="10.5" fill="var(--text-0)" fontWeight="700">Hay tiempo — vía no emergente</text>
          <text x="400" y="396" textAnchor="middle" fontSize="9.5" fill="var(--text-2)">alt: VL, flexible, SGA-conducto</text>
          <text x="400" y="411" textAnchor="middle" fontSize="9.5" fill="var(--text-2)">despertar si es posible</text>
        </g>

        {/* inadecuada → CICO */}
        <line x1="610" y1="316" x2="610" y2="380" stroke="var(--red)" strokeWidth="2" markerEnd="url(#arrow)" />
        <text x="640" y="352" textAnchor="middle" fontSize="9.5" fill="var(--red)" fontWeight="700">NO</text>
        <g>
          <rect x="490" y="380" width="240" height="52" rx="4" fill="var(--bg-2)" stroke="var(--red)" />
          <text x="610" y="400" textAnchor="middle" fontSize="11" fill="var(--red)" fontWeight="700">CICO · pedir ayuda</text>
          <text x="610" y="417" textAnchor="middle" fontSize="9.5" fill="var(--text-2)">no puedo intubar / no puedo oxigenar</text>
        </g>
        <line x1="610" y1="432" x2="610" y2="480" stroke="var(--red)" strokeWidth="2" markerEnd="url(#arrow)" />
        <g>
          <rect x="470" y="480" width="280" height="70" rx="4" fill="var(--bg-2)" stroke="var(--red)" />
          <text x="610" y="500" textAnchor="middle" fontSize="11" fill="var(--red)" fontWeight="700">Acceso invasivo emergente</text>
          <text x="610" y="517" textAnchor="middle" fontSize="9.5" fill="var(--text-1)">cricotiroidotomía (bisturí-bougie-tubo)</text>
          <text x="610" y="531" textAnchor="middle" fontSize="9.5" fill="var(--text-2)">o cánula · rígido · ECMO según contexto</text>
          <text x="610" y="545" textAnchor="middle" fontSize="9.5" fill="var(--cyan)">confirmar por capnografía</text>
        </g>

        {/* despertar retorno */}
        <line x1="290" y1="390" x2="150" y2="390" stroke="var(--text-3)" strokeWidth="1.2" strokeDasharray="4 3" />
        <text x="220" y="384" textAnchor="middle" fontSize="8.5" fill="var(--text-3)">despertar / reconsiderar</text>

        <text x="380" y="600" textAnchor="middle" fontSize="9" fill="var(--text-3)">Adaptado de Apfelbaum JL, et al. Anesthesiology 2022;136:31-81 (esquema simplificado)</text>
      </svg>
    </div>
  );
}

// ------------------------------------------------------------
// Página (Server Component — referencia estática)
// ------------------------------------------------------------
export default function ViaAereaDificilPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat asa-via-aerea-dificil-2022.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Algoritmo ASA de vía aérea difícil (2022)
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          evaluación · despierto vs inducción · límite de intentos · supraglótico de rescate · CICO · invasivo emergente
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// el plan no es tener un plan A: es tener el B y el C decididos antes de dormir al paciente"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">ALGORITMO</span>
          <span className="tag tag-muted">ASA 2022</span>
          <span className="tag tag-muted">Anesthesiology 136:31-81</span>
          <span className="tag tag-muted">CICO</span>
        </div>
      </header>

      <Callout variant="info">
        El algoritmo ASA 2022 reorganiza el manejo de la vía aérea difícil en{" "}
        <b>dos algoritmos separados</b> (adulto y pediátrico) y enfatiza tres decisiones tempranas:
        (1) intubar <b>despierto vs. tras inducción</b>, (2) mantener la <b>ventilación</b> (oxigenación)
        por encima de intubar, y (3) reconocer pronto la situación <b>&quot;no puedo intubar / no puedo
        oxigenar&quot; (CICO)</b> para pasar sin demora al acceso invasivo emergente. La oxigenación —no
        el tubo— es el objetivo.
      </Callout>

      {/* ========================================================= */}
      <Section n="00" title="Infográfico de decisiones">
        <DecisionInfographic />
        <Src>Adaptado de Apfelbaum JL, et al. Anesthesiology 2022;136:31-81. Esquema simplificado; ver texto completo para las flechas de reintento y despertar.</Src>
        <Callout variant="ok">
          Regla de lectura: <b>eje vertical = tiempo/urgencia</b>. A mayor descenso, menor margen. La
          rama roja (derecha–abajo) es irreversible sin acceso invasivo: no se &quot;espera a ver&quot;.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="01" title="Evaluación y preparación">
        <P>
          La guía ASA 2022 amplía la <b>evaluación previa</b> de la vía aérea (no un solo test) e insiste
          en <b>preparación</b> material y de equipo antes de cualquier maniobra. La decisión de la técnica
          depende del cruce de tres riesgos: dificultad de la <b>vía aérea</b>, riesgo de <b>aspiración</b>
          {" "}y capacidad de mantener <b>oxigenación</b>.
        </P>
        <Table
          headers={["Dominio", "Qué evaluar / preparar"]}
          rows={[
            ["Evaluación multifactorial", "Historia de vía aérea difícil, examen (apertura oral, Mallampati, distancia tiromentoniana, movilidad cervical, dentición, patología cervical/facial), y factores de ventilación con mascarilla difícil"],
            ["Predictores de riesgo", "Vía aérea difícil anticipada, riesgo de aspiración (estómago lleno, obstrucción, reflujo), y reserva de oxigenación limitada (obesidad, embarazo, crítico, pediátrico)"],
            ["Preoxigenación", "O₂ 100% hasta desnitrogenación; considerar O₂ apneico/HFNC y posición en rampa para prolongar el tiempo seguro de apnea"],
            ["Equipo listo y verificado", "Carro de vía aérea difícil, videolaringoscopio, broncoscopio flexible, dispositivos supraglóticos de 2.ª generación, bougie/estilete, set de cricotiroidotomía, capnografía"],
            ["Plan A/B/C y equipo humano", "Estrategia primaria y de rescate declaradas en voz alta; pedir ayuda temprano; roles asignados (líder, vía aérea, fármacos, invasivo)"],
          ]}
        />
        <Src>Apfelbaum JL, et al. Anesthesiology 2022;136:31-81 (evaluación, preparación y preoxigenación).</Src>
        <Callout variant="warn">
          Preparar el <b>acceso invasivo</b> (identificar y, si procede, marcar la membrana cricotiroidea)
          forma parte de la preparación en vía aérea difícil anticipada, <b>no</b> es una improvisación del
          momento del CICO.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Decisión: intubación despierto vs. tras inducción">
        <P>
          Es la <b>primera bifurcación</b> del algoritmo. Si el paciente combina vía aérea difícil con
          riesgo de aspiración, oxigenación comprometida o probable dificultad ventilatoria tras la
          inducción, la ASA favorece <b>asegurar la vía con el paciente despierto</b>, manteniendo
          ventilación espontánea y reflejos.
        </P>
        <Table
          headers={["Considerar despierto si…", "Considerar tras inducción si…"]}
          rows={[
            ["Intubación difícil anticipada", "Vía aérea sin predictores mayores de dificultad"],
            ["Ventilación (mascarilla/SGA) difícil anticipada", "Ventilación con mascarilla/SGA esperable como fácil"],
            ["Riesgo de aspiración significativo", "Bajo riesgo de aspiración"],
            ["Tolerancia limitada a la apnea (baja reserva de O₂)", "Buena reserva de oxigenación"],
            ["Anatomía/patología que puede impedir el rescate", "Rescate por mascarilla/SGA razonablemente asegurable"],
          ]}
        />
        <Src>Apfelbaum JL, et al. Anesthesiology 2022;136:31-81 (algoritmo del adulto, nodo despierto vs. tras inducción).</Src>
        <Callout variant="info">
          La decisión no es binaria de forma aislada: el algoritmo la resuelve pesando{" "}
          <b>vía aérea + aspiración + oxigenación</b> en conjunto. Ante duda con varios factores de riesgo,
          inclínate por la técnica despierto.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Ramas de intubación despierto">
        <P>
          Si se elige la vía despierto, se prepara con <b>anestesia tópica de la vía aérea</b> y{" "}
          <b>sedación titulada</b> que preserve ventilación espontánea y reflejos protectores. Se dispone de
          varias técnicas; la elección depende de anatomía, patología y experiencia.
        </P>
        <Step k="A">
          <b>Intubación despierto lograda:</b> confirmar posición endotraqueal por <b>capnografía</b> y
          proceder con la inducción/mantenimiento.
        </Step>
        <Step k="B">
          <b>Elegir técnica</b> según anatomía y destreza: broncoscopio flexible, videolaringoscopia,
          laringoscopia directa, estilete óptico/videoestilete, combinación de dispositivos, o vía retrógrada.
        </Step>
        <Step k="C">
          <b>Optimizar condiciones:</b> tópico adecuado (lidocaína), antisialagogo si procede,
          vasoconstrictor nasal en vía nasal, y sedación con objetivo de cooperación y respiración espontánea.
        </Step>
        <Step k="D">
          <b>Si la técnica despierto falla:</b> opciones — posponer/cancelar el caso, buscar acceso invasivo
          electivo (p. ej. traqueostomía), o considerar inducción solo si el rescate está asegurado. No
          persistir en intentos traumáticos.
        </Step>
        <Src>Apfelbaum JL, et al. Anesthesiology 2022;136:31-81 (opciones de intubación despierto y de fallo).</Src>
        <Callout variant="warn">
          La <b>sedación</b> para intubación despierto debe titularse: la sobredosis convierte una vía aérea
          espontánea en una apnea con vía aérea difícil no asegurada — exactamente lo que se pretendía evitar.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Tras inducción: ventilación adecuada vs. inadecuada">
        <P>
          Tras la inducción, si la intubación no se logra en el primer intento óptimo, el algoritmo se
          gobierna por una sola pregunta: <b>¿se mantiene una ventilación/oxigenación adecuada</b> (con
          mascarilla facial o dispositivo supraglótico)? La respuesta separa la vía <b>no emergente</b> de
          la <b>emergente</b>.
        </P>
        <Table
          headers={["Escenario", "Condición", "Conducta"]}
          accentCol={1}
          rows={[
            [
              "Ventilación adecuada",
              "SpO₂ mantenida",
              "Hay tiempo. Alternativas no emergentes: videolaringoscopia, broncoscopio flexible, SGA como conducto, cambio de hoja/estilete, otro operador. Considerar despertar al paciente.",
            ],
            [
              "Ventilación inadecuada",
              "SpO₂ en caída, sin ventilar",
              "Vía emergente. Pedir ayuda, optimizar mascarilla (2 manos, cánula, relajación), colocar SGA de rescate. Si persiste → declarar CICO.",
            ],
          ]}
        />
        <Src>Apfelbaum JL, et al. Anesthesiology 2022;136:31-81 (bifurcación ventilación adecuada/inadecuada tras inducción).</Src>
        <Callout variant="ok">
          Si la ventilación es adecuada, el tiempo está de tu lado: <b>limita intentos</b>, cambia de
          estrategia y considera <b>despertar</b>. Muchos desenlaces graves ocurren por insistir cuando ya
          se podía revertir.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Limitar intentos y dispositivo supraglótico de rescate">
        <P>
          Cada intento de laringoscopia consume tiempo, oxígeno y traumatiza tejidos (sangrado y edema que
          empeoran la vía aérea). La ASA insiste en <b>limitar el número de intentos</b> y en <b>optimizar</b>
          {" "}cada uno (posición, relajación, mejor operador y dispositivo disponible) en lugar de repetir el mismo intento.
        </P>
        <Table
          headers={["Principio", "Aplicación práctica"]}
          rows={[
            ["Intento óptimo, no repetido", "Cada intento debe cambiar algo (operador, dispositivo, hoja, posición, relajación) — no repetir la misma laringoscopia"],
            ["Techo de intentos", "ASA 2022: minimizar los intentos de intubación traqueal para no derivar en trauma y CICO (sin fijar una cifra). La cifra concreta ≤ 3 + 1 por operador más experto proviene de DAS 2015 (Plan A)"],
            ["SGA de rescate", "Dispositivo supraglótico (preferir 2.ª generación) como rescate ventilatorio y, si procede, como conducto para intubar"],
            ["Reoxigenar entre intentos", "Restablecer SpO₂ con ventilación óptima antes de reintentar; no encadenar intentos con paciente hipoxémico"],
          ]}
        />
        <Src>Apfelbaum JL, et al. Anesthesiology 2022;136:31-81 (limitar intentos; dispositivos supraglóticos de rescate).</Src>
        <Callout variant="danger">
          El <b>SGA de rescate</b> es una medida de oxigenación, no la meta final: si ventila, gana tiempo
          para intubar por él, despertar o planear invasivo. Si <b>no ventila con SGA bien colocado</b>, no
          insistir — se está entrando en CICO.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="CICO → acceso invasivo emergente">
        <P>
          Cuando <b>no se puede intubar y no se puede oxigenar</b> (fallan intubación, mascarilla y SGA), se
          declara <b>CICO</b> en voz alta y se procede <b>sin demora</b> al <b>acceso invasivo emergente</b>.
          Declararlo tarde es el error letal repetido en las revisiones de mortalidad de vía aérea.
        </P>
        <Table
          headers={["Opción invasiva", "Contexto / notas"]}
          rows={[
            ["Cricotiroidotomía quirúrgica (bisturí-bougie-tubo)", "Técnica de rescate de referencia en CICO del adulto; rápida y con equipo mínimo"],
            ["Cricotiroidotomía por cánula", "Alternativa con dispositivo de cánula + ventilación a chorro/dedicada; alto riesgo de barotrauma y falla si no es dedicada"],
            ["Broncoscopia/laringoscopia rígida", "En obstrucción de vía aérea alta seleccionada y con experto disponible (p. ej. cuerpo extraño, tumor)"],
            ["ECMO / bypass (ECMO veno-venoso, rescate)", "En contextos preplaneados de alto riesgo (p. ej. tumor de vía aérea crítica, quirófano con perfusión lista) — no una maniobra improvisada del CICO"],
          ]}
        />
        <Src>Apfelbaum JL, et al. Anesthesiology 2022;136:31-81 (acceso invasivo emergente y elección según contexto).</Src>
        <Callout variant="danger">
          En CICO del adulto sin experto de vía aérea rígida ni ECMO listos, el acceso de rescate es la{" "}
          <b>cricotiroidotomía</b>. El rígido y la ECMO exigen <b>preparación previa</b> y personal — se
          consideran cuando el contexto ya los tenía dispuestos, no se montan durante la desaturación.
        </Callout>
        <Callout variant="info">
          Tras un acceso invasivo o cualquier intubación: <b>confirmar siempre por capnografía</b> y planear
          el manejo posterior (traqueostomía definitiva, UCI, documentación y alerta al paciente).
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Capnografía — confirmación y monitorización">
        <P>
          La <b>capnografía</b> (EtCO₂) es el estándar para confirmar la posición del tubo y para detectar
          precozmente el deterioro. La ASA la incorpora de forma transversal: verificación tras cada
          intubación (despierto, tras inducción o invasiva) y vigilancia continua durante el manejo de la vía
          aérea difícil.
        </P>
        <Table
          headers={["Patrón de capnografía", "Interpretación", "Acción"]}
          rows={[
            ["Onda cuadrada sostenida (varios ciclos; ≈6 por convención práctica)", "Tubo en tráquea, ventilación efectiva", "Confirmado; fijar tubo, continuar"],
            ["Ausencia de onda / EtCO₂ plano", "Intubación esofágica o ausencia de flujo/gasto", "Retirar tubo si esofágica; verificar circuito, paro o SGA mal sellado"],
            ["Ondas pequeñas y decrecientes", "Ventilación marginal, fuga, o gasto cardíaco bajo", "Reevaluar sello/posición; descartar hipoperfusión/paro"],
            ["Ascenso de EtCO₂ con buena onda tras acceso invasivo", "Vía invasiva permeable y ventilando", "Confirmar, asegurar dispositivo, plan definitivo"],
          ]}
        />
        <Src>Apfelbaum JL, et al. Anesthesiology 2022;136:31-81. · ASA Standards for Basic Anesthetic Monitoring (capnografía continua).</Src>
        <Callout variant="danger">
          <b>Sin onda capnográfica sostenida = tubo no confirmado.</b> Ante la duda entre esófago y tráquea
          con paciente que se deteriora, la regla es <b>&quot;si dudas, sácalo&quot;</b> y reoxigena por otra
          vía. La detección de EtCO₂ es el árbitro objetivo por encima de la impresión visual.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Diferencias con el algoritmo DAS (2015)">
        <P>
          El algoritmo de la <b>Difficult Airway Society (DAS 2015)</b> comparte principios con la ASA
          (oxigenar antes que intubar, limitar intentos, declarar CICO), pero difiere en formato y énfasis.
          Ambos son válidos; conviene conocer las diferencias operativas.
        </P>
        <Table
          headers={["Aspecto", "ASA 2022", "DAS 2015"]}
          rows={[
            [
              "Estructura",
              "Diagrama de decisión ramificado (adulto y pediátrico separados); cubre anticipada y no anticipada",
              "Planes secuenciales A→B→C→D para la intubación difícil no anticipada del adulto",
            ],
            [
              "Escalones",
              "Nodos por ventilación adecuada/inadecuada y despierto/inducción",
              "Plan A (laringoscopia), Plan B (SGA), Plan C (mascarilla/despertar), Plan D (acceso frontal de cuello, FONA)",
            ],
            [
              "Límite de intentos",
              "Minimizar intentos; intento óptimo",
              "Máximo 3 + 1 (operador experto) en Plan A explícito",
            ],
            [
              "SGA de rescate",
              "SGA (preferir 2.ª generación) como rescate/conducto",
              "SGA 2.ª generación explícito en Plan B, hasta 3 intentos",
            ],
            [
              "CICO / acceso invasivo",
              "Acceso invasivo emergente: cricotiroidotomía; rígido/ECMO según contexto preplaneado",
              "Plan D = FONA por técnica de bisturí (scalpel-bougie-tube) como estándar",
            ],
            [
              "Ámbito",
              "Anestesia perioperatoria + extubación difícil (algoritmo propio)",
              "Foco en intubación difícil no anticipada; guía de extubación DAS aparte (2012)",
            ],
          ]}
        />
        <Src>
          Apfelbaum JL, et al. Anesthesiology 2022;136:31-81. · Frerk C, et al. (DAS). Br J Anaesth 2015;115(6):827-848.
        </Src>
        <Callout variant="info">
          Convergencia clínica clave: ambos priorizan <b>oxigenación</b>, <b>limitar intentos</b> y{" "}
          <b>cricotiroidotomía por bisturí</b> como rescate de CICO. La ASA es un mapa de decisiones amplio;
          la DAS, una secuencia de planes memorizable en crisis.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="09" title="Resumen operativo">
        <Table
          headers={["Punto", "Regla", "Fuente"]}
          accentCol={1}
          rows={[
            ["Objetivo primario", "Oxigenación, no el tubo", "ASA 2022"],
            ["1.ª decisión", "Despierto vs. tras inducción (vía aérea/aspiración/oxigenación)", "ASA 2022"],
            ["Tras inducción", "Ventilación adecuada → hay tiempo; inadecuada → emergente", "ASA 2022"],
            ["Intentos de intubación", "ASA 2022: minimizar y optimizar cada intento (sin cifra). Cifra ≤ 3 + 1 experto: DAS 2015", "ASA 2022 (minimizar) · DAS 2015 (3 + 1)"],
            ["Rescate ventilatorio", "SGA 2.ª generación (rescate y conducto)", "ASA 2022"],
            ["CICO", "Declarar pronto → acceso invasivo emergente", "ASA 2022"],
            ["Acceso invasivo de referencia", "Cricotiroidotomía por bisturí; rígido/ECMO según contexto", "ASA 2022 / DAS 2015"],
            ["Confirmación", "Capnografía sostenida = tubo confirmado", "ASA 2022"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="10" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Apfelbaum JL, Hagberg CA, Connis RT, et al. 2022 American Society of Anesthesiologists Practice Guidelines for Management of the Difficult Airway. Anesthesiology 2022;136(1):31-81.</li>
          <li>Frerk C, Mitchell VS, McNarry AF, et al. Difficult Airway Society 2015 guidelines for management of unanticipated difficult intubation in adults. Br J Anaesth 2015;115(6):827-848.</li>
          <li>Popat M, Mitchell V, Dravid R, et al. Difficult Airway Society Guidelines for the management of tracheal extubation. Anaesthesia 2012;67(3):318-340.</li>
          <li>American Society of Anesthesiologists. Standards for Basic Anesthetic Monitoring (capnografía continua durante ventilación).</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// árbol de decisiones y umbrales de guía de sociedad (ASA 2022; comparativa DAS 2015)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, entrenamiento en vía aérea ni protocolo institucional"}
          <br />
          {"// la cricotiroidotomía se ensaya en el maniquí, no se estrena en el CICO"}
          <br />
          {"// si no hay onda de capno, no hay tubo — por muy bonita que se viera la glotis"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
