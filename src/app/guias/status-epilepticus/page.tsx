import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — STATUS EPILEPTICUS PERIOPERATORIO
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: dosis, umbrales y tiempos tomados de las
// guías de la Neurocritical Care Society (NCS) y literatura
// aceptada. Cada tabla/callout cita su fuente (Vancouver breve).
// NO inventar dosis.
// Fuentes primarias:
//  - Glauser T, Shinnar S, Gloss D, et al. Evidence-Based Guideline:
//    Treatment of Convulsive Status Epilepticus in Children and Adults.
//    American Epilepsy Society (AES). Epilepsy Curr 2016;16(1):48-61.
//  - Brophy GM, Bell R, Claassen J, et al. Guidelines for the
//    Evaluation and Management of Status Epilepticus. Neurocritical
//    Care Society (NCS). Neurocrit Care 2012;17(1):3-23.
//  - Trinka E, Cock H, Hesdorffer D, et al. A definition and
//    classification of status epilepticus (ILAE). Epilepsia
//    2015;56(10):1515-1523.
//  - Neal JM, et al. ASRA checklist for management of local
//    anesthetic systemic toxicity (LAST). Reg Anesth Pain Med 2018.
// ============================================================

export const metadata: Metadata = {
  title: "Status epilepticus perioperatorio — manejo por tiempos y dosis · DEC",
  description:
    "Referencia estructurada del status epilepticus perioperatorio según Neurocritical Care Society: definición (crisis > 5 min o recurrente sin recuperación), estabilización inicial (ABC, glucemia, causas), benzodiacepina de 1.ª línea (lorazepam 0.1 mg/kg IV, midazolam 0.2 mg/kg IM, diazepam 0.15-0.2 mg/kg), 2.ª línea (levetiracetam 60 mg/kg, fosfenitoína 20 mg PE/kg, valproato 40 mg/kg), status refractario (infusión de propofol/midazolam/pentobarbital + EEG) y causas perioperatorias (LAST, eclampsia, hipoglucemia, hiponatremia).",
  openGraph: {
    title: "Status epilepticus perioperatorio — manejo por tiempos y dosis · DEC",
    description:
      "Manejo por fases temporales: estabilización, benzodiacepina de 1.ª línea, antiepiléptico de 2.ª línea y status refractario. Causas perioperatorias (LAST, eclampsia, hipoglucemia). Guías NCS/AES.",
    type: "article",
  },
};

// ------------------------------------------------------------
// Helpers de presentación (mismo lenguaje visual que las otras guías)
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

// ------------------------------------------------------------
// Página (Server Component — referencia estática)
// ------------------------------------------------------------
export default function StatusEpilepticusPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat status-epilepticus.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Status epilepticus perioperatorio
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          manejo por tiempos · benzodiacepina 1.ª línea · antiepiléptico 2.ª línea · refractario + EEG · causas perioperatorias
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// bajo relajante neuromuscular deja de convulsionar el músculo, no el cerebro: la crisis sigue en el EEG"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">EMERGENCIA</span>
          <span className="tag tag-muted">NCS 2012</span>
          <span className="tag tag-muted">AES 2016</span>
          <span className="tag tag-muted">ILAE</span>
        </div>
      </header>

      <Callout variant="danger">
        <b>El tiempo es cerebro.</b> Se define status epilepticus (SE) como una <b>crisis &gt; 5 min</b>{" "}
        de duración continua, o <b>crisis recurrentes sin recuperación de la consciencia</b> entre
        ellas. No esperar a que ceda «sola»: la benzodiacepina de 1.ª línea debe darse ya, y la
        2.ª línea prepararse en paralelo. La crisis prolongada se autoperpetúa (internalización de
        receptores GABA<sub>A</sub>) y se vuelve <b>refractaria</b> a las benzodiacepinas con cada
        minuto que pasa.
      </Callout>
      <Src>
        Trinka E, et al. (ILAE). Epilepsia 2015;56(10):1515-1523. · Brophy GM, et al. (NCS). Neurocrit
        Care 2012;17(1):3-23.
      </Src>

      {/* ========================================================= */}
      <Section n="01" title="Definición y línea de tiempo">
        <P>
          La definición operativa (ILAE) distingue dos tiempos: <b>t1</b> = momento a partir del cual
          la crisis se considera «anormalmente prolongada» y debe tratarse (<b>5 min</b> en la crisis
          tónico-clónica); <b>t2</b> = momento a partir del cual hay riesgo de daño neuronal a largo
          plazo (~30 min). El manejo se ordena por <b>fases temporales</b>, no por diagnóstico
          etiológico, que se persigue en paralelo.
        </P>
        <Table
          headers={["Fase", "Ventana", "Objetivo"]}
          accentCol={1}
          rows={[
            [
              "SE inicial / estabilización",
              "0–5 min",
              "ABC, O₂, monitor, glucemia; benzodiacepina de 1.ª línea.",
            ],
            [
              "SE establecido / 2.ª línea",
              "5–20 min (dar en 20–40 min)",
              "Antiepiléptico IV de 2.ª línea (levetiracetam / fosfenitoína / valproato).",
            ],
            [
              "SE refractario",
              "> 20–40 min (persiste tras 1.ª + 2.ª línea)",
              "Infusión anestésica (midazolam / propofol / pentobarbital) + EEG continuo, IOT/VM.",
            ],
            [
              "SE super-refractario",
              "> 24 h de infusión (o recae al retirarla)",
              "Optimizar infusión, buscar causa, terapias de 3.ª línea; UCI.",
            ],
          ]}
        />
        <Src>
          Trinka E, et al. (ILAE). Epilepsia 2015;56(10):1515-1523. · Glauser T, et al. (AES). Epilepsy
          Curr 2016;16(1):48-61. · Brophy GM, et al. (NCS). Neurocrit Care 2012.
        </Src>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="0–5 min · Estabilización inicial">
        <P>
          En paralelo al tratamiento farmacológico: asegurar vía aérea, oxigenar, monitorizar y buscar
          las causas <b>inmediatamente reversibles</b>. En el entorno perioperatorio la etiología es a
          menudo <b>tratable en el acto</b> (hipoglucemia, LAST, eclampsia, hiponatremia): descartarlas
          es parte del manejo de la crisis.
        </P>
        <Table
          headers={["Paso", "Acción"]}
          rows={[
            ["1 · Vía aérea y O₂", "Posición segura, aspirar, O₂ a alto flujo; preparar material de IOT (anticipar depresión respiratoria por benzodiacepinas)."],
            ["2 · Monitorizar", "SpO₂, ECG, TA, capnografía; acceso IV/IO; cronometrar la crisis."],
            ["3 · Glucemia capilar", "Descartar hipoglucemia YA. Si baja o no medible: dextrosa (adulto 50 mL de glucosa al 50%) + tiamina 100 mg IV si desnutrición/OH."],
            ["4 · Descartar causas reversibles", "Hipoglucemia · hiponatremia · LAST (anestésico local) · eclampsia · hipocalcemia · fármacos/abstinencia · hipoxia."],
            ["5 · Analítica", "Iones (Na, Ca, Mg), glucosa, función renal/hepática, tóxicos, niveles de antiepilépticos, gasometría."],
          ]}
        />
        <Src>
          Brophy GM, et al. (NCS). Neurocrit Care 2012;17(1):3-23. · Glauser T, et al. (AES). Epilepsy
          Curr 2016;16(1):48-61.
        </Src>
        <Callout variant="warn">
          <b>Descartar hipoglucemia antes de asumir «epilepsia».</b> Una glucemia capilar tarda
          segundos y la corrección revierte la crisis. En el paciente anestesiado la convulsión puede
          quedar <b>enmascarada por el bloqueo neuromuscular</b>: si el paciente está relajado, sospecha
          por taquicardia/HTA inexplicadas, hipertermia o midriasis, y confirma con EEG.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Benzodiacepina de 1.ª línea (0–5 min)">
        <P>
          La benzodiacepina es el tratamiento <b>de elección inicial</b> y el más infradosificado. La
          causa más frecuente de SE «refractario» es una <b>dosis insuficiente</b> de benzodiacepina.
          Elegir la vía según el acceso disponible: si hay IV, lorazepam; si no lo hay, midazolam IM.
        </P>
        <Table
          headers={["Fármaco", "Dosis", "Vía · notas"]}
          accentCol={1}
          rows={[
            [
              "Lorazepam",
              "0.1 mg/kg IV (máx 4 mg/dosis); repetir a los 5–10 min si persiste",
              "IV — 1.ª opción si hay acceso; ~2 mg/min.",
            ],
            [
              "Midazolam",
              "0.2 mg/kg IM (máx 10 mg) · o 0.2 mg/kg IV",
              "IM de elección sin acceso IV (RAMPART); también bucal/intranasal.",
            ],
            [
              "Diazepam",
              "0.15–0.2 mg/kg IV (máx 10 mg/dosis); repetir si persiste",
              "IV; alternativa rectal 0.2–0.5 mg/kg si no hay acceso.",
            ],
          ]}
        />
        <Src>
          Glauser T, et al. (AES). Epilepsy Curr 2016;16(1):48-61. · Silbergleit R, et al. (RAMPART).
          N Engl J Med 2012;366(7):591-600. · Brophy GM, et al. (NCS). Neurocrit Care 2012.
        </Src>
        <Callout variant="danger">
          <b>Dosis plena, no titulada a la baja.</b> El miedo a la depresión respiratoria lleva a
          infradosificar y a que la crisis persista. Dar la dosis completa por peso, tener la vía aérea
          preparada, y <b>repetir una vez</b> la benzodiacepina si a los 5–10 min sigue convulsionando
          antes de considerarla fallida. Una única dosis correcta es más segura que tres dosis pequeñas.
        </Callout>
        <Callout variant="info">
          Sin acceso IV/IO, el <b>midazolam 0.2 mg/kg IM</b> fue al menos tan eficaz como el lorazepam
          IV en el ensayo RAMPART y evita el retraso de canalizar. Vías alternativas: midazolam
          intranasal/bucal, diazepam rectal.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Antiepiléptico de 2.ª línea (20–40 min)">
        <P>
          Si la crisis persiste tras la benzodiacepina, administrar un <b>antiepiléptico IV de
          2.ª línea</b> sin demora (idealmente en los 20–40 min). El ensayo <b>ESETT</b> mostró
          eficacia <b>equivalente</b> entre levetiracetam, fosfenitoína y valproato (~ 45–47% de cese);
          la elección se guía por contraindicaciones, disponibilidad y perfil del paciente.
        </P>
        <Table
          headers={["Fármaco", "Dosis de carga", "Notas / precauciones"]}
          accentCol={1}
          rows={[
            [
              "Levetiracetam",
              "60 mg/kg IV (máx 4.5 g)",
              "Buen perfil de seguridad; sin interacciones ni monitor cardíaco; opción cómoda de 1.ª elección.",
            ],
            [
              "Fosfenitoína",
              "20 mg PE/kg IV (equivalentes de fenitoína)",
              "Vigilar hipotensión y arritmia (monitor ECG); dosificar en mg PE, no mg de fenitoína.",
            ],
            [
              "Ácido valproico",
              "40 mg/kg IV (máx ~3 g)",
              "Evitar en hepatopatía, embarazo y sospecha de trastorno mitocondrial; hiperamonemia.",
            ],
          ]}
        />
        <Src>
          Glauser T, et al. (AES). Epilepsy Curr 2016;16(1):48-61. · Kapur J, et al. (ESETT). N Engl J
          Med 2019;381(22):2103-2113. · Brophy GM, et al. (NCS). Neurocrit Care 2012.
        </Src>
        <Callout variant="warn">
          <b>Fosfenitoína en mg PE.</b> Se dosifica en <b>equivalentes de fenitoína (mg PE)</b> —20 mg
          PE/kg— no en mg de fármaco. Administrar con monitorización de ECG y TA por riesgo de
          hipotensión y bradiarritmia; velocidad máxima 150 mg PE/min.
        </Callout>
        <Callout variant="info">
          El <b>valproato</b> se evita en gestante (teratogenicidad), hepatopatía y sospecha de
          enfermedad mitocondrial. En esos contextos, levetiracetam o fosfenitoína son preferibles.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Status refractario · infusión anestésica + EEG">
        <P>
          Si el SE persiste tras la benzodiacepina y un antiepiléptico de 2.ª línea a dosis adecuada,
          es <b>refractario</b>: proceder a <b>intubación, ventilación mecánica e infusión anestésica
          continua</b> bajo <b>EEG continuo</b>, con objetivo de supresión de crisis o patrón de
          brote-supresión. El manejo pasa a la UCI.
        </P>
        <Table
          headers={["Agente", "Uso en SE refractario", "Precaución"]}
          accentCol={1}
          rows={[
            [
              "Midazolam",
              "Bolo + infusión titulada a supresión de crisis en EEG",
              "Taquifilaxia con uso prolongado; acumulación en insuficiencia renal/hepática.",
            ],
            [
              "Propofol",
              "Bolo + infusión titulada en EEG",
              "Hipotensión; riesgo de síndrome de infusión de propofol (PRIS) con dosis altas/prolongadas.",
            ],
            [
              "Pentobarbital / tiopental",
              "Infusión titulada a brote-supresión",
              "Hipotensión marcada (soporte vasopresor), íleo, inmunosupresión; despertar lento.",
            ],
          ]}
        />
        <Src>
          Brophy GM, et al. (NCS). Neurocrit Care 2012;17(1):3-23. · Glauser T, et al. (AES). Epilepsy
          Curr 2016.
        </Src>
        <Callout variant="danger">
          <b>EEG continuo obligado.</b> Bajo infusión anestésica —y con más razón si hay bloqueo
          neuromuscular— las convulsiones motoras desaparecen pero la actividad eléctrica puede
          continuar (SE <b>no convulsivo</b>). Sin EEG se tratan «a ciegas»: la ausencia de movimiento
          <b> no</b> significa que la crisis cesó. Titular la infusión a supresión electrográfica, no
          a la clínica visible.
        </Callout>
        <Callout variant="ok">
          Mantener el antiepiléptico de base (2.ª línea) mientras se administra la infusión, para poder
          <b> retirar el anestésico</b> sin recaída. La retirada se hace de forma gradual bajo EEG tras
          24–48 h de control.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Causas perioperatorias · tratamiento dirigido">
        <P>
          En el quirófano la convulsión suele tener una causa <b>específica y tratable</b>. Identificarla
          cambia el tratamiento: la benzodiacepina controla la crisis, pero el <b>antídoto/corrección
          de la causa</b> es lo que resuelve el cuadro. Buscarlas siempre en paralelo.
        </P>
        <Table
          headers={["Causa", "Pista", "Tratamiento dirigido"]}
          rows={[
            [
              "LAST (toxicidad por anestésico local)",
              "Tras bloqueo/infiltración; pródromos neurológicos → convulsión → colapso CV",
              "Emulsión lipídica al 20%: bolo 1.5 mL/kg (peso magro) + infusión 0.25 mL/kg/min; parar el AL; soporte ACLS modificado.",
            ],
            [
              "Eclampsia",
              "Gestante/puerpera con HTA + proteinuria; convulsión periparto",
              "Sulfato de magnesio: carga 4–6 g IV en 15–20 min + infusión 1–2 g/h; controlar TA; el parto es el tratamiento definitivo.",
            ],
            [
              "Hipoglucemia",
              "Glucemia capilar baja; diabético, sepsis, hepatopatía",
              "Dextrosa IV (adulto 50 mL glucosa 50%) + tiamina 100 mg IV si riesgo nutricional.",
            ],
            [
              "Hiponatremia",
              "Na muy bajo (p. ej. absorción de irrigación en RTU, SIADH)",
              "Salino hipertónico 3% (corrección controlada del Na; evitar corrección rápida por mielinólisis).",
            ],
            [
              "Fármacos / abstinencia",
              "Retirada de OH/benzodiacepinas, sobredosis, penicilinas a dosis altas",
              "Benzodiacepina; retirar/antagonizar el agente causal; tratar la abstinencia.",
            ],
          ]}
        />
        <Src>
          Neal JM, et al. (ASRA, LAST). Reg Anesth Pain Med 2018;43(2):150-153. · ACOG. Gestational
          hypertension and preeclampsia (eclampsia, MgSO₄). · Brophy GM, et al. (NCS). Neurocrit Care 2012.
        </Src>
        <Callout variant="danger">
          <b>LAST:</b> la convulsión precede al colapso cardiovascular. Iniciar <b>emulsión lipídica al
          20%</b> (bolo 1.5 mL/kg de peso magro, seguido de infusión 0.25 mL/kg/min), suspender el
          anestésico local y aplicar ACLS modificado (evitar dosis altas de adrenalina; no usar
          anestésicos locales, vasopresina ni bloqueantes de calcio). Controlar la crisis con
          benzodiacepina, no con propofol a dosis altas si hay inestabilidad hemodinámica.
        </Callout>
        <Callout variant="warn">
          <b>Eclampsia:</b> el fármaco de elección es el <b>sulfato de magnesio</b>, no las
          benzodiacepinas ni la fenitoína, que son inferiores para prevenir recurrencias (Collaborative
          Eclampsia Trial). Vigilar toxicidad por magnesio (arreflexia, depresión respiratoria):
          antídoto gluconato cálcico.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Resumen de dosis clave">
        <Table
          headers={["Parámetro", "Dosis", "Fuente"]}
          accentCol={1}
          rows={[
            ["Definición de SE", "Crisis > 5 min o recurrente sin recuperación", "ILAE 2015"],
            ["Lorazepam (1.ª línea)", "0.1 mg/kg IV (máx 4 mg/dosis), repetir", "AES 2016"],
            ["Midazolam (1.ª línea)", "0.2 mg/kg IM/IV", "AES / RAMPART"],
            ["Diazepam (1.ª línea)", "0.15–0.2 mg/kg IV", "AES 2016"],
            ["Levetiracetam (2.ª línea)", "60 mg/kg IV (máx 4.5 g)", "AES / ESETT"],
            ["Fosfenitoína (2.ª línea)", "20 mg PE/kg IV", "AES / ESETT"],
            ["Valproato (2.ª línea)", "40 mg/kg IV", "AES / ESETT"],
            ["Refractario", "Infusión midazolam / propofol / pentobarbital + EEG", "NCS 2012"],
            ["LAST", "Emulsión lipídica 20%: bolo 1.5 mL/kg + 0.25 mL/kg/min", "ASRA 2018"],
            ["Eclampsia", "MgSO₄ 4–6 g IV carga + 1–2 g/h", "ACOG"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Brophy GM, Bell R, Claassen J, et al. Guidelines for the Evaluation and Management of Status Epilepticus. Neurocritical Care Society. Neurocrit Care 2012;17(1):3-23.</li>
          <li>Glauser T, Shinnar S, Gloss D, et al. Evidence-Based Guideline: Treatment of Convulsive Status Epilepticus in Children and Adults. American Epilepsy Society. Epilepsy Curr 2016;16(1):48-61.</li>
          <li>Trinka E, Cock H, Hesdorffer D, et al. A definition and classification of status epilepticus — Report of the ILAE Task Force on Classification of Status Epilepticus. Epilepsia 2015;56(10):1515-1523.</li>
          <li>Silbergleit R, Durkalski V, Lowenstein D, et al. Intramuscular versus intravenous therapy for prehospital status epilepticus (RAMPART). N Engl J Med 2012;366(7):591-600.</li>
          <li>Kapur J, Elm J, Chamberlain JM, et al. Randomized Trial of Three Anticonvulsant Medications for Status Epilepticus (ESETT). N Engl J Med 2019;381(22):2103-2113.</li>
          <li>Neal JM, Barrington MJ, Fettiplace MR, et al. The Third American Society of Regional Anesthesia and Pain Medicine Practice Advisory on Local Anesthetic Systemic Toxicity. Reg Anesth Pain Med 2018;43(2):113-123.</li>
          <li>American College of Obstetricians and Gynecologists (ACOG). Gestational Hypertension and Preeclampsia. Practice Bulletin.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y tiempos de literatura aceptada (Neurocritical Care Society 2012 · AES 2016 · ILAE · ESETT · RAMPART)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, EEG ni protocolo institucional"}
          <br />
          {"// la benzodiacepina infradosificada es la causa nº1 de status 'refractario': da la dosis plena por peso"}
          <br />
          {"// sin EEG bajo relajante, la ausencia de convulsión visible no es ausencia de crisis"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
