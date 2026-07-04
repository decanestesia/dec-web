import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Algoritmo de referencia — DAS 2015: intubación difícil no anticipada (adulto)
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: planes, límites de intentos y dosis tomados de
// la guía de la Difficult Airway Society 2015. Cada dato lleva referencia.
// NO inventar dosis ni umbrales. Las dosis marcadas son obligatorias y exactas.
// Fuente primaria:
//  - Frerk C, Mitchell VS, McNarry AF, et al. Difficult Airway Society 2015
//    guidelines for management of unanticipated difficult intubation in adults.
//    Br J Anaesth 2015;115(6):827-848.
// ============================================================

export const metadata: Metadata = {
  title: "DAS 2015 — intubación difícil no anticipada · Algoritmo · DEC",
  description:
    "Algoritmo de la Difficult Airway Society 2015 (adulto) para intubación difícil no anticipada: Plan A (laringoscopia, máx 3+1 intentos), Plan B (dispositivo supraglótico 2ª gen), Plan C (mascarilla facial ± relajar, declarar CICO) y Plan D (cricotiroidotomía scalpel-bougie-tube). Declarar el fracaso, pedir ayuda, limitar intentos, capnografía. Frerk C, BJA 2015.",
  openGraph: {
    title: "DAS 2015 — intubación difícil no anticipada · Algoritmo · DEC",
    description:
      "Planes A–D de la Difficult Airway Society 2015 para vía aérea difícil no anticipada del adulto: laringoscopia, dispositivo supraglótico, mascarilla facial y cricotiroidotomía (scalpel-bougie-tube).",
    type: "article",
  },
};

// ------------------------------------------------------------
// Helpers de presentación (mismo lenguaje visual que guías/blog)
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

// Bloque de "plan" con letra grande y color por fase de escalada
function PlanBadge({ letter, color, label }: { letter: string; color: string; label: string }) {
  return (
    <div
      className="panel"
      style={{ borderLeft: `3px solid ${color}`, margin: "1.5rem 0 0.75rem" }}
    >
      <div
        className="panel-body"
        style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
      >
        <span
          className="mono"
          style={{ color, fontSize: "1.6rem", fontWeight: 800, lineHeight: 1, flexShrink: 0 }}
        >
          {letter}
        </span>
        <span
          className="mono"
          style={{
            color: "var(--text-0)",
            fontSize: "0.78rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontWeight: 700,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Página (Server Component — referencia estática)
// ------------------------------------------------------------
export default function DASIntubacionDificilPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat das-intubacion-dificil.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          DAS 2015 — intubación difícil no anticipada
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          adulto · plan A laringoscopia · plan B supraglótico · plan C mascarilla · plan D cricotiroidotomía
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// el algoritmo no es un adorno de la pared: es lo que declaras en voz alta cuando el plan A ya falló"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">ALGORITMO</span>
          <span className="tag tag-muted">DAS 2015</span>
          <span className="tag tag-muted">adulto</span>
          <span className="tag tag-muted">Frerk · BJA 2015</span>
        </div>
      </header>

      <Callout variant="info">
        Este es el algoritmo de la <b>Difficult Airway Society (DAS) 2015</b> para intubación difícil{" "}
        <b>no anticipada</b> en el adulto (no gestante). El objetivo global no es intubar a toda costa:
        es <b>mantener la oxigenación</b> mientras se escala de forma ordenada por los planes A→B→C→D.
        Cuatro principios cruzan todo el algoritmo: <b>pedir ayuda temprano</b>, <b>limitar el número de
        intentos</b>, <b>declarar el fracaso</b> de cada plan en voz alta, y <b>confirmar la vía aérea
        con capnografía</b>.
      </Callout>

      {/* ========================================================= */}
      <Section n="00" title="Principios que cruzan todo el algoritmo">
        <Table
          headers={["Principio", "Contenido"]}
          rows={[
            ["Pedir ayuda", "Llamar ayuda cualificada apenas se prevé o se declara dificultad; no esperar al deterioro. Verbalizar la transición de plan a todo el equipo."],
            ["Limitar intentos", "Cada intento traumatiza la vía aérea (edema, sangrado) y consume oxígeno. Contar los intentos en voz alta y respetar los límites de cada plan."],
            ["Declarar el fracaso", "Reconocer que un plan falló es la decisión clínica, no obcecarse. Pasar al siguiente plan es progreso, no derrota."],
            ["Oxigenación primero", "El fin es oxigenar, no completar la intubación. Entre intentos: reoxigenar con mascarilla; considerar oxígeno nasal de alto flujo/apneico."],
            ["Capnografía", "El trazado continuo de EtCO₂ es obligatorio para confirmar la posición traqueal en TODOS los planes (tubo, dispositivo supraglótico, cricotiroidotomía)."],
            ["Despertar", "Si la ventilación es adecuada y el caso lo permite, despertar al paciente es una opción legítima y con frecuencia la más segura."],
          ]}
        />
        <Src>Frerk C, et al. DAS 2015. Br J Anaesth 2015;115(6):827-848 (principios generales y bloque central del algoritmo).</Src>
        <Callout variant="warn">
          La ausencia de trazado de <b>capnografía</b> tras la inserción de cualquier dispositivo obliga a
          asumir <b>mala posición</b> hasta demostrar lo contrario. La confirmación no es opcional: el tubo/
          dispositivo mal colocado y no detectado es una causa evitable de muerte por vía aérea.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="01" title="Plan A — laringoscopia e intubación traqueal">
        <PlanBadge letter="A" color="var(--accent)" label="Laringoscopia / intubación · objetivo: intubar la tráquea" />
        <P>
          Inducción y bloqueo neuromuscular con laringoscopia directa o videolaringoscopia. La meta es
          intubar optimizando <b>cada</b> intento; no repetir el mismo intento fallido esperando otro
          resultado. Optimizaciones de primera línea: <b>videolaringoscopio</b>, <b>bougie</b>{" "}
          (introductor) y <b>manipulación laríngea externa</b> (maniobra bimanual / BURP).
        </P>
        <Table
          headers={["Elemento", "Contenido"]}
          rows={[
            ["Límite de intentos", "Máximo 3 intentos + 1 intento adicional por un operador más experto = 3 + 1"],
            ["Optimizar posición", "Alineación oreja-esternón (\"sniffing\"/rampa en obesos); elevar cabecera"],
            ["Optimizar visión", "Videolaringoscopio como opción precoz; manipulación laríngea externa (BURP)"],
            ["Optimizar paso del tubo", "Bougie/introductor; relajación neuromuscular adecuada y confirmada"],
            ["Presión cricoidea", "Relajar o retirar si dificulta la laringoscopia o la ventilación"],
            ["Entre intentos", "Reoxigenar con mascarilla facial; mantener oxigenación apneica si se dispone"],
            ["Confirmar", "Trazado continuo de capnografía (EtCO₂) tras la intubación"],
          ]}
          accentCol={-1}
        />
        <Src>Frerk C, et al. DAS 2015. Br J Anaesth 2015;115:827-848 (Plan A).</Src>
        <Callout variant="danger">
          <b>Límite duro:</b> máximo <b>3 intentos</b> de laringoscopia, más <b>1</b> intento final por un
          operador más experimentado (<b>3 + 1</b>). Superarlo aumenta el trauma, el edema y el riesgo de
          convertir una situación &quot;no intubable, sí ventilable&quot; en un <b>CICO</b>. Al agotar el
          Plan A: <b>declarar &quot;intubación fallida&quot;</b> y pasar al Plan B.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Plan B — mantener la oxigenación: dispositivo supraglótico">
        <PlanBadge letter="B" color="var(--cyan)" label="Dispositivo supraglótico 2ª generación · objetivo: oxigenar" />
        <P>
          Declarada la intubación fallida, el foco cambia de <b>intubar</b> a <b>oxigenar</b>. Se inserta
          un <b>dispositivo supraglótico (DSG) de 2ª generación</b> (con canal de drenaje gástrico y mejor
          sellado, p. ej. i-gel®, LMA ProSeal®/Supreme®), preferido sobre los de 1ª generación por sellado
          y protección relativa frente a aspiración.
        </P>
        <Table
          headers={["Elemento", "Contenido"]}
          rows={[
            ["Dispositivo", "Supraglótico de 2ª generación (canal gástrico; mejor sellado)"],
            ["Límite de intentos", "Máximo 3 intentos de inserción del DSG"],
            ["Objetivo", "Restaurar y mantener la oxigenación; ganar tiempo para decidir"],
            ["Confirmar", "Ventilación adecuada + trazado de capnografía (EtCO₂)"],
            ["Si oxigena (éxito)", "STOP y pensar. Opciones: despertar; intubar por el DSG (fibrobroncoscopio); traqueostomía electiva; o proceder si es imprescindible"],
            ["Si NO oxigena", "Declarar fallo del Plan B → pasar al Plan C"],
          ]}
          accentCol={-1}
        />
        <Src>Frerk C, et al. DAS 2015. Br J Anaesth 2015;115:827-848 (Plan B).</Src>
        <Callout variant="ok">
          <b>Si el DSG oxigena: PARE Y PIENSE.</b> Es un punto de decisión, no un pase automático a seguir.
          Las opciones son <b>despertar</b> al paciente, <b>intubar a través del DSG</b> guiado por
          fibrobroncoscopio, <b>traqueostomía</b> electiva, o proceder con el caso solo si es imprescindible
          e inaplazable. No se convierte a ciegas.
        </Callout>
        <Callout variant="danger">
          <b>Límite:</b> máximo <b>3 intentos</b> de inserción del dispositivo supraglótico. Si tras ello no
          se logra oxigenar: <b>declarar el fracaso del Plan B</b> y avanzar al Plan C sin insistir.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Plan C — ventilación con mascarilla facial (última oportunidad no invasiva)">
        <PlanBadge letter="C" color="var(--amber)" label="Mascarilla facial ± relajar · objetivo: oxigenar / declarar CICO" />
        <P>
          Fracasados los Planes A y B, se vuelve a la <b>ventilación con mascarilla facial</b> como último
          intento de oxigenación no invasiva. Se optimiza al máximo: cánula orofaríngea/nasofaríngea,
          técnica a dos personas y dos manos, retirar presión cricoidea.
        </P>
        <Table
          headers={["Elemento", "Contenido"]}
          rows={[
            ["Técnica", "Mascarilla a dos manos/dos personas; cánulas oro/nasofaríngeas; retirar presión cricoidea"],
            ["± Relajar", "Asegurar bloqueo neuromuscular completo: la parálisis puede facilitar la ventilación con mascarilla"],
            ["Si ventila (éxito)", "Oxigenar y DESPERTAR al paciente es la conducta recomendada"],
            ["Si NO ventila", "Situación \"no se puede intubar, no se puede oxigenar\" → DECLARAR CICO → Plan D"],
          ]}
          accentCol={-1}
        />
        <Src>Frerk C, et al. DAS 2015. Br J Anaesth 2015;115:827-848 (Plan C).</Src>
        <Callout variant="warn">
          <b>± Relajar:</b> ante mascarilla difícil, asegurar <b>bloqueo neuromuscular completo</b> antes de
          concluir que es imposible ventilar; la parálisis con frecuencia <b>mejora</b> la ventilación con
          mascarilla. Si se usó rocuronio, tener presente el <b>sugammadex</b>, pero revertir NO restaura por
          sí solo una vía aérea perdida ni debe retrasar el rescate quirúrgico.
        </Callout>
        <Callout variant="danger">
          Si con mascarilla facial optimizada y relajación completa <b>no se logra oxigenar</b>: se cumple la
          situación <b>&quot;no se puede intubar, no se puede oxigenar&quot; (CICO / CICV)</b>.{" "}
          <b>Declararlo en voz alta</b> a todo el equipo y pasar de inmediato al Plan D. Cada segundo de
          demora es hipoxia.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Plan D — CICO: cricotiroidotomía quirúrgica (scalpel-bougie-tube)">
        <PlanBadge letter="D" color="var(--red)" label="CICO · cricotiroidotomía quirúrgica · objetivo: acceso frontal del cuello" />
        <P>
          Ante <b>CICO</b> declarado, la respuesta es el <b>acceso frontal del cuello</b> mediante{" "}
          <b>cricotiroidotomía quirúrgica</b>. La técnica recomendada por DAS 2015 es la de{" "}
          <b>bisturí–bougie–tubo</b> (<i>scalpel-bougie-tube</i>), por su fiabilidad y rapidez frente a las
          técnicas de aguja/cánula estrecha.
        </P>
        <Table
          headers={["Paso", "Acción"]}
          rows={[
            ["0 · Declarar y posicionar", "Declarar CICO; extender el cuello; identificar la membrana cricotiroidea. Pedir set de vía aérea quirúrgica."],
            ["1 · Bisturí (Scalpel)", "Incisión transversal única en la membrana cricotiroidea (hoja n.º 10). Si la anatomía no es palpable: incisión vertical amplia en la línea media, seguida de disección roma con el dedo hasta identificar la membrana cricotiroidea."],
            ["2 · Girar la hoja", "Rotar la hoja del bisturí 90° con el borde cortante hacia caudal, para mantener abierto el estoma."],
            ["3 · Bougie", "Deslizar un bougie por el estoma hacia la tráquea (siguiendo el filo del bisturí como guía)."],
            ["4 · Tubo (Tube)", "Avanzar sobre el bougie un tubo endotraqueal de balón de calibre 6.0 mm DI; retirar el bougie."],
            ["5 · Inflar y confirmar", "Inflar el balón, ventilar y CONFIRMAR con capnografía. Fijar el tubo."],
          ]}
          accentCol={-1}
        />
        <Src>Frerk C, et al. DAS 2015. Br J Anaesth 2015;115:827-848 (Plan D; técnica scalpel-bougie-tube). Equipo mínimo: bisturí n.º 10, bougie, tubo 6.0 DI.</Src>
        <Callout variant="danger">
          <b>Set mínimo de rescate CICO (DAS 2015):</b> <b>bisturí n.º 10</b>, <b>bougie</b> y{" "}
          <b>tubo endotraqueal de 6.0 mm de diámetro interno</b> con balón. La técnica{" "}
          <b>scalpel-bougie-tube</b> es la de elección por su alta tasa de éxito. No cambiar de plan a mitad
          de camino: comprometerse con la cricotiroidotomía y ejecutarla.
        </Callout>
        <Callout variant="ok">
          Tras asegurar el acceso frontal del cuello y <b>confirmar por capnografía</b>: mantener oxigenación,
          convocar apoyo (cirugía/ORL), planificar la vía aérea definitiva y documentar. La cricotiroidotomía
          es una medida de rescate temporal, no el destino final.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Resumen de escalada y límites de intentos">
        <Table
          headers={["Plan", "Acción", "Límite / dispositivo", "Al fallar"]}
          accentCol={2}
          rows={[
            ["A", "Laringoscopia / intubación (VL, bougie, BURP)", "Máx. 3 + 1 intentos", "Declarar intubación fallida → B"],
            ["B", "Dispositivo supraglótico 2ª generación", "Máx. 3 intentos", "Declarar fallo → C"],
            ["C", "Ventilación con mascarilla facial ± relajar", "Optimizar; despertar si ventila", "No oxigena → declarar CICO → D"],
            ["D", "Cricotiroidotomía quirúrgica (scalpel-bougie-tube)", "Bisturí n.º 10 · bougie · tubo 6.0 DI", "Acceso frontal + capnografía"],
          ]}
        />
        <Callout variant="info">
          La transición entre planes se <b>verbaliza</b>: &quot;Plan A fallido, paso a Plan B&quot;. Ese
          anuncio no es formalismo — sincroniza al equipo, activa el pedido de ayuda y el set correcto, y
          rompe la fijación en una técnica que ya no funciona.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Frerk C, Mitchell VS, McNarry AF, Mendonca C, Bhagrath R, Patel A, O&apos;Sullivan EP, Woodall NM, Ahmad I; Difficult Airway Society intubation guidelines working group. Difficult Airway Society 2015 guidelines for management of unanticipated difficult intubation in adults. Br J Anaesth 2015;115(6):827-848.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// algoritmo y límites de la guía Difficult Airway Society 2015 (Frerk C, BJA 2015)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, entrenamiento práctico ni protocolo institucional"}
          <br />
          {"// el algoritmo se entrena en simulación ANTES de necesitarlo: leerlo por primera vez durante un CICO es tarde"}
          <br />
          {"// declarar el fracaso a tiempo salva más vías aéreas que cualquier laringoscopio"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
