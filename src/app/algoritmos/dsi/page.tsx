import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Algoritmo de vía aérea — INTUBACIÓN DE SECUENCIA DIFERIDA (DSI)
// Server Component (referencia estática, sin estado).
// Contenido clínico basado en literatura aceptada. Cada dosis, umbral
// y paso cita su fuente (Vancouver breve). NO inventar dosis.
// Fuentes primarias:
//  - Weingart SD, Trueger NS, Wong N, Scofi J, Singh N, Rudolph SS.
//    Delayed Sequence Intubation: A Prospective Observational Study.
//    Ann Emerg Med 2015;65(4):349-355.
//  - Weingart SD, Levitan RM. Preoxygenation and Prevention of
//    Desaturation During Emergency Airway Management.
//    Ann Emerg Med 2012;59(3):165-175.
//  - Merelman AH, Perlmutter MC, Strayer RJ. Alternatives to RSI and
//    Delayed Sequence Intubation. West J Emerg Med 2019;20(3):466-471.
//  - Miller's Anesthesia, 9.ª ed. — Airway Management / Ketamine.
//  - Stoelting's Pharmacology & Physiology in Anesthetic Practice — Ketamine.
// ============================================================

export const metadata: Metadata = {
  title: "Intubación de secuencia diferida (DSI) — Algoritmo — DEC",
  description:
    "Algoritmo de intubación de secuencia diferida (DSI, Weingart): ketamina 1–1.5 mg/kg IV como procedimiento de sedación para preoxigenar al paciente agitado que no tolera preoxigenación, luego parálisis e intubación. Indicaciones, dosis exactas, ventajas frente a RSI y precauciones. Ann Emerg Med 2015.",
  openGraph: {
    title: "Intubación de secuencia diferida (DSI) — Algoritmo — DEC",
    description:
      "Ketamina 1–1.5 mg/kg IV para preoxigenar al paciente agitado, luego parálisis e intubación. Indicaciones, dosis, ventajas vs RSI y precauciones (Weingart 2015).",
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

// Paso numerado del algoritmo (columna izquierda con índice)
function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="panel" style={{ margin: "0 0 0.85rem", borderLeft: "3px solid var(--accent)" }}>
      <div className="panel-body" style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
        <span
          className="mono"
          style={{
            color: "var(--accent)",
            fontSize: "1.1rem",
            fontWeight: 700,
            lineHeight: 1.3,
            flexShrink: 0,
            minWidth: "1.6rem",
          }}
        >
          {n}
        </span>
        <div>
          <div style={{ color: "var(--text-0)", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.3rem" }}>
            {title}
          </div>
          <div style={{ color: "var(--text-1)", fontSize: "0.82rem", lineHeight: 1.65 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Página (Server Component — referencia estática)
// ------------------------------------------------------------
export default function DSIPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/algoritmos" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /algoritmos
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat dsi.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Intubación de secuencia diferida (DSI)
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          delayed sequence intubation · ketamina disociativa · preoxigenar antes de paralizar
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// no es intubar más tarde: es preoxigenar primero al que no se dejaba preoxigenar"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">ALGORITMO</span>
          <span className="tag tag-muted">VÍA AÉREA</span>
          <span className="tag tag-muted">WEINGART 2015</span>
          <span className="tag tag-muted">ANN EMERG MED</span>
        </div>
      </header>

      <Callout variant="info">
        La DSI es, en palabras de Weingart, un <b>procedimiento de sedación</b> cuyo objetivo no es
        intubar de inmediato sino <b>preoxigenar</b> al paciente agitado o delirante que —por su
        estado— no tolera la mascarilla ni coopera con la preoxigenación. Se administra un sedante
        disociativo (ketamina) que <b>preserva la ventilación espontánea y los reflejos de la vía
        aérea</b>, se preoxigena de forma controlada durante ~3 minutos, y solo entonces se
        administra el relajante muscular y se intuba. Es, conceptualmente, una <b>RSI con la
        preoxigenación desacoplada y protegida de la agitación</b>.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Concepto y racional">
        <P>
          En la secuencia rápida de intubación (RSI) el sedante y el relajante se administran casi
          simultáneamente. Esto exige que la <b>preoxigenación</b> —el paso que crea el reservorio de
          O₂ que permite tolerar la apnea— ocurra <b>antes</b>, con el paciente despierto y
          cooperador. El problema clínico es el paciente <b>hipóxico, agitado o delirante</b> que se
          arranca la mascarilla, no tolera la CPAP/VNI y no coopera: no se le puede preoxigenar, de
          modo que se lo lleva a la apnea de la RSI ya <b>desaturado</b>, con muy poco margen antes
          de la hipoxemia crítica.
        </P>
        <P>
          La DSI rompe ese círculo: primero se administra una dosis disociativa de{" "}
          <b>ketamina</b>, que calma al paciente <b>sin abolir el impulso ventilatorio ni los
          reflejos protectores</b>. Con el paciente ahora tolerante, se aplican durante ~3 minutos
          los dispositivos de preoxigenación (mascarilla con reservorio a alto flujo, cánula nasal de
          alto flujo / HFNC, o VNI/CPAP). Alcanzada una FiO₂ y una desnitrogenación adecuadas, se
          administra el bloqueante neuromuscular y se procede a la intubación como en una RSI.
        </P>
        <Callout variant="ok">
          Idea central: <b>desacoplar</b> la preoxigenación de la parálisis. La ketamina compra la
          cooperación necesaria para preoxigenar bien, sin comprometer la ventilación espontánea que
          la RSI clásica sacrifica.
        </Callout>
        <Src>
          Weingart SD, et al. Ann Emerg Med 2015;65(4):349-355. · Weingart SD, Levitan RM. Ann Emerg
          Med 2012;59(3):165-175.
        </Src>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Indicaciones y contraindicaciones">
        <P>
          La DSI está dirigida al paciente que <b>necesita preoxigenación pero no la tolera</b> por
          su estado mental. La causa prototípica es la <b>hipoxia que produce delirio/agitación</b>{" "}
          (el propio hipóxico combativo), pero también aplica a la agitación por hipercapnia,
          intoxicación o encefalopatía que impide la preoxigenación cooperadora.
        </P>
        <Table
          headers={["Indicación (DSI apropiada)", "Contraindicación / precaución"]}
          rows={[
            [
              "Hipoxemia con delirio/agitación que impide la mascarilla o VNI",
              "Apnea o paro inminente → RSI/intubación inmediata, no DSI",
            ],
            [
              "Paciente no cooperador que se arranca los dispositivos de O₂",
              "Pérdida de reflejos protectores / vómito activo con riesgo de aspiración",
            ],
            [
              "Necesidad de desnitrogenar antes de la apnea de la RSI",
              "Indicación clara de vía aérea difícil que exige intubación despierto",
            ],
            [
              "Agitación que impide una preoxigenación ≥ 3 min efectiva",
              "Inestabilidad extrema donde el retraso de minutos no es asumible",
            ],
          ]}
        />
        <Src>Weingart SD, et al. Ann Emerg Med 2015;65(4):349-355 (cohorte de 62 pacientes, SpO₂ media 89.9% → 98.8%).</Src>
        <Callout variant="warn">
          La DSI <b>no</b> es para el paciente en apnea, con paro respiratorio inminente o que ya no
          protege su vía aérea: en esos casos se intuba de inmediato (RSI o vía aérea de rescate). El
          objetivo de la DSI es <b>ganar tiempo de oxigenación</b>, no perderlo.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Fármaco: ketamina (dosis obligatoria y exacta)">
        <P>
          El agente de elección para la DSI es la <b>ketamina</b>, por su perfil disociativo: sedación
          profunda que <b>mantiene la respiración espontánea, el tono de la vía aérea y los reflejos
          protectores</b>, además de propiedades broncodilatadoras y hemodinámicamente favorables. Se
          administra por vía IV en <b>bolo lento (empujar en ~15–30 s)</b> para evitar apnea o
          rigidez.
        </P>
        <div className="panel" style={{ margin: "0 0 1rem", borderLeft: "3px solid var(--accent)" }}>
          <div className="panel-body" style={{ display: "grid", gap: "0.5rem" }}>
            <div
              className="mono"
              style={{ color: "var(--accent)", fontSize: "1rem", fontWeight: 700, letterSpacing: "0.02em" }}
            >
              Ketamina 1–1.5 mg/kg IV (bolo lento)
            </div>
            <div className="mono" style={{ color: "var(--text-2)", fontSize: "0.72rem", lineHeight: 1.7 }}>
              Dosis disociativa · mantiene ventilación espontánea y reflejos
              <br />
              Ej.: paciente de 80 kg → 80–120 mg IV
            </div>
          </div>
        </div>
        <Table
          headers={["Parámetro", "Valor", "Nota"]}
          accentCol={1}
          rows={[
            ["Fármaco", "Ketamina", "Sedante disociativo (agonista NMDA no competitivo)"],
            ["Dosis DSI (Weingart)", "1–1.5 mg/kg IV", "Dosis disociativa completa; misma clase de dosis que la de inducción"],
            ["Vía / velocidad", "IV, bolo lento ~15–30 s", "El empuje rápido puede dar apnea transitoria o rigidez"],
            ["Redosificación", "≈ 0.5 mg/kg IV si reagitación", "Repetir a demanda para mantener la disociación durante la preoxigenación"],
            ["Efecto clave", "Preserva ventilación y reflejos", "Permite preoxigenar sin abolir el impulso respiratorio"],
          ]}
        />
        <Src>
          Weingart SD, et al. Ann Emerg Med 2015;65(4):349-355 (ketamina 1 mg/kg, redosis 0.5 mg/kg).
          · Miller&apos;s Anesthesia, 9.ª ed. — Ketamine. · Stoelting&apos;s Pharmacology &amp;
          Physiology in Anesthetic Practice — Ketamine.
        </Src>
        <Callout variant="danger">
          <b>La ketamina no es un pase libre para la apnea.</b> Aun a dosis disociativa puede producir
          apnea o hipoventilación transitorias, sobre todo con inyección rápida o combinada con otros
          depresores. Monitorización continua de SpO₂ y capnografía, y equipo de vía aérea listo desde
          antes del bolo: la DSI puede convertirse en RSI en cualquier momento.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Secuencia paso a paso">
        <Step n="1" title="Preparar como para una RSI">
          Monitor (SpO₂, ECG, TA, capnografía), acceso IV, aspiración, fármacos de inducción y
          bloqueante muscular cargados y rotulados, dispositivos de preoxigenación y el carro de vía
          aérea difícil a mano. El plan es preoxigenar, pero se prepara la intubación completa.
        </Step>
        <Step n="2" title="Ketamina 1–1.5 mg/kg IV en bolo lento">
          Administrar la ketamina a dosis disociativa (empujar en ~15–30 s). Esperar la disociación:
          el paciente deja de luchar contra los dispositivos pero <b>mantiene la respiración
          espontánea</b> y los reflejos de la vía aérea. Redosificar ≈ 0.5 mg/kg si se reagita.
        </Step>
        <Step n="3" title="Preoxigenar ~3 minutos">
          Aplicar de forma controlada el dispositivo de mayor rendimiento tolerado: mascarilla con
          reservorio a alto flujo (≥ 15 L/min o flush), <b>cánula nasal de alto flujo (HFNC)</b> o{" "}
          <b>VNI/CPAP</b> si hay shunt/atelectasia. Objetivo: SpO₂ ≥ 93–95% y desnitrogenación
          adecuada, idealmente con EtO₂ alto si se dispone.
        </Step>
        <Step n="4" title="Oxigenación apneica (si disponible)">
          Mantener cánula nasal a 15 L/min (o HFNC) <b>durante</b> la fase de apnea de la intubación
          para prolongar el tiempo seguro de apnea. Es un complemento estándar, no un sustituto de la
          preoxigenación previa.
        </Step>
        <Step n="5" title="Parálisis e intubación (convertir a RSI)">
          Alcanzada la preoxigenación objetivo, administrar el <b>bloqueante neuromuscular</b> a dosis
          de RSI e intubar. A partir de aquí la secuencia es idéntica a una RSI: dosis, laringoscopia
          y confirmación con capnografía.
        </Step>
        <Callout variant="info">
          Relajantes de RSI típicos (referencia): <b>rocuronio 1.2 mg/kg IV</b> o{" "}
          <b>succinilcolina 1–1.5 mg/kg IV</b>. Elegir según contexto y contraindicaciones (p. ej.
          evitar succinilcolina en hiperpotasemia, quemaduras/denervación subaguda, riesgo de
          hipertermia maligna).
          <br />
          <span className="mono" style={{ fontSize: "0.62rem", color: "var(--text-3)" }}>
            Miller&apos;s Anesthesia, 9.ª ed. — Neuromuscular Blocking Agents.
          </span>
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="DSI frente a RSI: ventajas y diferencias">
        <Table
          headers={["Aspecto", "RSI clásica", "DSI"]}
          rows={[
            ["Momento de preoxigenar", "Antes, con paciente cooperador", "Tras sedación disociativa, en el no cooperador"],
            ["Ventilación entre fármacos", "Se pierde (apnea inducida)", "Se conserva (ketamina disociativa)"],
            ["Reflejos de vía aérea", "Abolidos por el relajante", "Conservados durante la fase de sedación"],
            ["Paciente diana", "Cooperador y preoxigenable", "Agitado/delirante que no tolera preoxigenar"],
            ["SpO₂ al iniciar la apnea", "Riesgo de entrar ya desaturado", "Entra optimizado tras preoxigenar bien"],
            ["Secuencia final", "Sedante + relajante juntos", "Igual que RSI, pero tras preoxigenar bajo ketamina"],
          ]}
        />
        <Src>Weingart SD, et al. Ann Emerg Med 2015;65(4):349-355. · Merelman AH, et al. West J Emerg Med 2019;20(3):466-471.</Src>
        <Callout variant="ok">
          Ventaja principal demostrada: <b>mejora la saturación pre-intubación</b> en pacientes que
          de otro modo llegarían desaturados a la apnea. En la cohorte original la SpO₂ subió de{" "}
          <b>89.9% a 98.8%</b> de media tras la fase de DSI, reduciendo el riesgo de hipoxemia
          periintubación.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Precauciones y errores frecuentes">
        <Table
          headers={["Precaución", "Detalle"]}
          rows={[
            [
              "No es intubación diferida",
              "El objetivo es preoxigenar, no posponer una intubación necesaria. Si el paciente ya está en apnea o no protege la vía aérea, se intuba de inmediato.",
            ],
            [
              "Apnea/hipoventilación posible",
              "Aun a dosis disociativa la ketamina puede deprimir la ventilación (peor con bolo rápido o co-sedantes). Capnografía y equipo de vía aérea listos.",
            ],
            [
              "Riesgo de aspiración",
              "La sedación no abole del todo el riesgo; en vómito activo o estómago lleno de alto riesgo, valorar RSI directa.",
            ],
            [
              "Laringoespasmo / hipersalivación",
              "Efectos posibles de la ketamina; tener aspiración a mano. Considerar antisialagogo si hay secreciones abundantes.",
            ],
            [
              "Emergencia disociativa",
              "Fenómenos psicoperceptuales al despertar; poco relevante aquí porque se progresa a parálisis, pero relevante si se aborta el plan.",
            ],
            [
              "Presión intracraneal / hemodinámica",
              "La ketamina suele elevar TA/FC (útil en shock); usar con juicio en HTA grave no controlada o cardiopatía isquémica activa.",
            ],
          ]}
        />
        <Src>
          Miller&apos;s Anesthesia, 9.ª ed. — Ketamine. · Stoelting&apos;s Pharmacology &amp;
          Physiology in Anesthetic Practice. · Weingart SD, et al. Ann Emerg Med 2015.
        </Src>
        <Callout variant="warn">
          Toda DSI debe planificarse como una RSI que puede necesitar completarse en segundos.
          Preparar dosis y relajante <b>antes</b> del bolo de ketamina, no durante la preoxigenación.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Resumen de dosis clave">
        <Table
          headers={["Ítem", "Dosis / valor", "Fuente"]}
          accentCol={1}
          rows={[
            ["Ketamina (DSI)", "1–1.5 mg/kg IV, bolo lento", "Weingart 2015"],
            ["Ketamina redosis", "≈ 0.5 mg/kg IV si reagitación", "Weingart 2015"],
            ["Preoxigenación", "~3 min (mascarilla/HFNC/VNI)", "Weingart 2015 / 2012"],
            ["Objetivo SpO₂ pre-parálisis", "≥ 93–95% (idealmente ≥ 98%)", "Weingart-Levitan 2012"],
            ["Rocuronio (parálisis RSI)", "1.2 mg/kg IV", "Miller's Anesthesia 9.ª ed."],
            ["Succinilcolina (parálisis RSI)", "1–1.5 mg/kg IV", "Miller's Anesthesia 9.ª ed."],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Weingart SD, Trueger NS, Wong N, Scofi J, Singh N, Rudolph SS. Delayed Sequence Intubation: A Prospective Observational Study. Ann Emerg Med 2015;65(4):349-355.</li>
          <li>Weingart SD, Levitan RM. Preoxygenation and Prevention of Desaturation During Emergency Airway Management. Ann Emerg Med 2012;59(3):165-175.</li>
          <li>Merelman AH, Perlmutter MC, Strayer RJ. Alternatives to Rapid Sequence Intubation: Contemporary Airway Management with Ketamine. West J Emerg Med 2019;20(3):466-471.</li>
          <li>Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — Airway Management, Ketamine y Neuromuscular Blocking Agents.</li>
          <li>Flood P, Rathmell JP, Shafer S. Stoelting&apos;s Pharmacology &amp; Physiology in Anesthetic Practice — Ketamine.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y pasos de literatura aceptada (Weingart, Ann Emerg Med 2015/2012; Miller; Stoelting)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// la 'D' es de diferida, no de dormido: la ketamina calma, no ventila por él"}
          <br />
          {"// prepara la RSI antes del bolo; el paciente decide cuándo se convierte"}
        </p>
        <Link href="/algoritmos" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más algoritmos
        </Link>
      </footer>
    </div>
  );
}
