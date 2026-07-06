import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — ARRITMIAS Y BLOQUEOS (perioperatorio + ACLS)
// Contenido clínico basado en literatura aceptada. Cada tabla/callout
// cita su fuente (Vancouver breve). NO inventar dosis ni energías.
// Fuentes primarias:
//  - Panchal AR, et al. Part 3: Adult Basic and Advanced Life Support:
//    2020 AHA Guidelines for CPR and ECC. Circulation 2020;142(16_suppl_2):S366-S468.
//  - Kusumoto FM, et al. 2018 ACC/AHA/HRS Guideline on Bradycardia and
//    Cardiac Conduction Delay. Circulation 2019;140(8):e382-e482.
//  - January CT, et al. 2019 AHA/ACC/HRS Focused Update — Atrial Fibrillation.
//    Circulation 2019;140(2):e125-e151.
//  - Neal JM, et al. ASRA Practice Advisory on Local Anesthetic Systemic
//    Toxicity: 2020 version. Reg Anesth Pain Med 2021;46(1):81-82.
//  - Gropper MA, et al. Miller's Anesthesia. 9.ª ed. Elsevier; 2020.
//  - Flood P, et al. Stoelting's Pharmacology & Physiology in Anesthetic
//    Practice. 6.ª ed. Wolters Kluwer; 2022.
// ============================================================

export const metadata: Metadata = {
  title: "Arritmias y bloqueos — perioperatorio y ACLS · DEC",
  description:
    "Referencia estructurada de arritmias y bloqueos: bradiarritmias y bloqueo AV (1.º, 2.º Mobitz I/II, 3.º), taquicardia de complejo estrecho (TSV, FA, flutter) y ancho (TV, torsades), ritmos de paro (FV/TV sin pulso, asistolia, AESP), cardioversión sincronizada y contexto anestésico (vagal, LAST, hiperkalemia, QT largo). ACLS 2020, ACC/AHA/HRS, ASRA.",
};

// ------------------------------------------------------------
// Helpers de presentación (mismo lenguaje visual que otras guías)
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
        <span style={{ color: c.border, fontSize: "0.9rem", lineHeight: 1.6 }}>{c.icon}</span>
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
export default function ArritmiasPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./arritmias.sh
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Arritmias y bloqueos
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          bradi · bloqueo AV · TSV · FA · flutter · TV · torsades · paro · cardioversión · anestésico
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// toda taquicardia de complejo ancho es TV hasta que se demuestre lo contrario"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">REFERENCIA</span>
          <span className="tag tag-muted">ACLS 2020</span>
          <span className="tag tag-muted">ACC/AHA/HRS</span>
          <span className="tag tag-muted">ASRA</span>
        </div>
      </header>

      <Callout variant="danger">
        <b>La pregunta que ordena todo: ¿estable o inestable?</b> Inestabilidad = hipotensión,
        alteración aguda del estado mental, signos de shock, dolor torácico isquémico o insuficiencia
        cardíaca aguda <b>atribuibles a la arritmia</b>. Inestable + taquicardia → cardioversión
        sincronizada. Inestable + bradicardia → atropina → marcapasos/cronotrópicos. Sin pulso →
        algoritmo de paro.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Bradiarritmias y bloqueo AV">
        <P>
          En quirófano la bradicardia suele ser vagal (laringoscopia, tracción peritoneal/ocular,
          neumoperitoneo) o farmacológica (opioides, dexmedetomidina, betabloqueo). Lo que decide la
          conducta es el <b>nivel del bloqueo</b> y la <b>estabilidad</b>.
        </P>
        <Table
          headers={["Ritmo", "ECG", "Conducta"]}
          accentCol={2}
          rows={[
            ["Bradicardia sinusal", "P sinusal normal, FC < 60, cada P conduce", "Si estable: observar, retirar estímulo. Inestable: algoritmo bradicardia"],
            ["BAV 1.er grado", "PR > 200 ms constante, toda P conduce", "Casi siempre benigno; no requiere tratamiento. Vigilar progresión"],
            ["BAV 2.º Mobitz I (Wenckebach)", "PR se alarga hasta que una P no conduce; ciclo se repite", "Nodal, suele benigno. Tratar solo si sintomático → atropina"],
            ["BAV 2.º Mobitz II", "PR constante con P bloqueadas súbitas, sin alargamiento previo", "Infranodal, alto riesgo de progresar. Marcapasos; NO fiar de atropina"],
            ["BAV 3.º (completo)", "Disociación AV total; escape estrecho ~40-60 o ancho < 40", "Marcapasos transcutáneo ya; cronotrópicos; transvenoso/definitivo"],
          ]}
        />
        <Src>Kusumoto FM, et al. 2018 ACC/AHA/HRS Bradycardia Guideline. Circulation 2019;140(8):e382-e482.</Src>

        <Callout variant="warn">
          <b>Mobitz II y bloqueo completo suelen ser infranodales</b> (His-Purkinje): la atropina
          puede <b>no servir o empeorar</b> (acelera la aurícula sin conducir). No dependas de ella —
          prepara marcapasos.
        </Callout>

        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-0)", margin: "1.5rem 0 0.5rem" }}>
          Algoritmo bradicardia inestable (ACLS 2020)
        </h3>
        <Table
          headers={["Paso", "Intervención", "Dosis"]}
          accentCol={2}
          rows={[
            ["1", "Atropina IV en bolo", "1 mg c/3-5 min, máx 3 mg"],
            ["2a", "Marcapasos transcutáneo", "Preferente en Mobitz II / bloqueo completo"],
            ["2b", "Dopamina en infusión", "5-20 mcg/kg/min"],
            ["2c", "Epinefrina en infusión", "2-10 mcg/min"],
            ["3", "Marcapasos transvenoso / EF", "Si no responde"],
          ]}
        />
        <Src>Panchal AR, et al. 2020 AHA ACLS. Circulation 2020;142(16_suppl_2):S366-S468.</Src>
        <Callout variant="info">
          <b>Bradicardia vagal intraop:</b> retira el estímulo primero. <b>Glicopirrolato 0.2-0.4 mg IV</b>{" "}
          (menos taquicardia/SNC) o <b>atropina 0.4-1 mg IV</b>. Si es por remifentanilo, baja o detén la infusión.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Taquicardia de complejo estrecho (< 120 ms)">
        <P>
          Distingue primero la <b>taquicardia sinusal</b> (una respuesta, no una arritmia primaria:
          trata la causa) de las taquicardias que sí requieren intervención sobre el ritmo.
        </P>
        <Table
          headers={["Ritmo", "ECG", "Manejo (estable)"]}
          accentCol={2}
          rows={[
            ["Taquicardia sinusal", "P sinusal, > 100, cada P conduce", "Tratar la causa (dolor, plano ligero, hipovolemia, fiebre/HM, hipercapnia). NO cardiovertir"],
            ["TSV paroxística (AVNRT/AVRT)", "Regular, estrecho, ~150-250; P no visibles o retrógradas", "Vagales → adenosina 6 mg → 12 mg IV push; alt. diltiazem/betabloqueante"],
            ["Fibrilación auricular", "Irregularmente irregular, sin P organizadas", "Control de frecuencia (diltiazem/betabloqueante); anticoagular según duración y CHA₂DS₂-VASc"],
            ["Flutter auricular", "Ondas F en dientes de sierra (~300), conducción 2:1 → FC ~150", "Control de frecuencia como FA; ablación curativa"],
          ]}
        />
        <Src>Panchal 2020; January CT, et al. 2019 AF Focused Update. Circulation 2019;140(2):e125-e151.</Src>

        <Callout variant="info">
          <b>Adenosina:</b> 6 mg IV push rápido + flush; si no revierte en 1-2 min → 12 mg (puede
          repetir 12 mg). Avisa al paciente (disnea/opresión transitoria). Precaución en asma, corazón
          trasplantado (dosis reducida). <b>Diltiazem:</b> 0.25 mg/kg IV en 2 min, luego infusión.
        </Callout>

        <Callout variant="danger">
          <b>WPW + FA:</b> NO uses bloqueadores del nodo AV (adenosina, verapamilo, diltiazem,
          digoxina, betabloqueantes) — pueden acelerar la conducción por la vía accesoria y degenerar
          en FV. Usa <b>procainamida</b> o <b>cardioversión</b>.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Taquicardia de complejo ancho (≥ 120 ms)">
        <Callout variant="danger">
          <b>Toda taquicardia de complejo ancho es TV hasta que se demuestre lo contrario.</b> Ante la
          duda, trátala como TV: es lo más seguro.
        </Callout>
        <Table
          headers={["Ritmo", "ECG", "Manejo"]}
          accentCol={2}
          rows={[
            ["TV monomorfa (con pulso)", "Ancho, regular, uniforme; disociación AV / capturas apoyan TV", "Estable: amiodarona 150 mg IV en 10 min (repetir si recurre; infusión 1 mg/min ×6 h → 0.5 mg/min). Inestable: cardioversión sincronizada 100 J"],
            ["TV polimorfa / Torsades", "QRS que gira alrededor de la línea de base; asociada a QT largo", "Magnesio 1-2 g IV en 15 min; corregir K/Mg/Ca; retirar fármacos QT. Sin pulso → desfibrilar (NO sincronizada)"],
            ["TV/TSV con aberrancia", "Ancho pero de origen supraventricular", "Si claramente SV con aberrancia conocida → como TSV; si hay duda → como TV"],
          ]}
        />
        <Src>Panchal AR, et al. 2020 AHA ACLS. Circulation 2020;142(16_suppl_2):S366-S468.</Src>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Ritmos de paro (sin pulso) — ACLS">
        <Callout variant="ok">
          <b>RCP de alta calidad:</b> 100-120 compresiones/min, profundidad 5-6 cm, retroceso torácico
          completo, minimizar interrupciones, 30:2 sin vía aérea avanzada. Cambiar compresor c/2 min.
        </Callout>
        <Table
          headers={["Categoría", "Ritmos", "Manejo"]}
          accentCol={2}
          rows={[
            [
              "Desfibrilables",
              "FV / TV sin pulso",
              "Desfibrilar (bifásico 120-200 J) → RCP 2 min · Epinefrina 1 mg IV/IO c/3-5 min · Amiodarona 300 mg → 150 mg (alt. lidocaína 1-1.5 mg/kg → 0.5-0.75)",
            ],
            [
              "No desfibrilables",
              "Asistolia / AESP",
              "NO desfibrilar · RCP continua · Epinefrina 1 mg IV/IO c/3-5 min lo antes posible · buscar causas reversibles",
            ],
          ]}
        />
        <Src>Panchal AR, et al. 2020 AHA ACLS. Circulation 2020;142(16_suppl_2):S366-S468.</Src>

        <Callout variant="warn">
          <b>Causas reversibles (H y T).</b>{" "}
          <b>H:</b> Hipovolemia · Hipoxia · Hidrogeniones (acidosis) · Hipo/Hiperkalemia · Hipotermia.{" "}
          <b>T:</b> neumotórax a Tensión · Taponamiento · Tóxicos · Trombosis pulmonar (TEP) ·
          Trombosis coronaria (IAM).
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Cardioversión sincronizada — energías (bifásico)">
        <Table
          headers={["Ritmo", "Energía inicial", "Nota"]}
          accentCol={1}
          rows={[
            ["Estrecho regular (TSV, flutter)", "50-100 J", "Escalar si falla"],
            ["Estrecho irregular (FA)", "120-200 J", "—"],
            ["Ancho regular (TV monomorfa con pulso)", "100 J", "Escalar si falla"],
            ["Ancho irregular (TV polimorfa)", "NO sincronizar", "Desfibrilar (dosis de desfibrilación)"],
          ]}
        />
        <Src>Panchal AR, et al. 2020 AHA ACLS. Circulation 2020;142(16_suppl_2):S366-S468.</Src>
        <Callout variant="info">
          Pulsa <b>sync</b> en las de complejo con pulso y <b>seda</b> si el paciente está consciente.
          En la TV polimorfa el sincronizador no engancha → desfibrila.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Contexto anestésico">
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-0)", margin: "0.5rem 0" }}>
          Bradicardia vagal aguda
        </h3>
        <P>
          Gatillos: tracción peritoneal/mesentérica, reflejo oculocardíaco, laringoscopia,
          neumoperitoneo, presión sobre seno carotídeo. <b>Retira el estímulo</b> primero; atropina
          0.4-1 mg IV o glicopirrolato 0.2-0.4 mg IV; si progresa → algoritmo bradicardia.
        </P>

        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-0)", margin: "1.25rem 0 0.5rem" }}>
          Arritmia por LAST (toxicidad por anestésico local)
        </h3>
        <Callout variant="danger">
          Sospecha ante convulsión o colapso CV/arritmias (bradi, bloqueo, TV, asistolia) tras dosis de
          AL (bupivacaína, la más cardiotóxica). <b>Emulsión lipídica 20%</b>: bolo <b>1.5 mL/kg (peso
          magro) en 2-3 min</b> → infusión <b>0.25 mL/kg/min</b> (repetir bolo 1-2× si persiste; puede
          subir a 0.5 mL/kg/min; límite ~12 mL/kg). <b>Reduce epinefrina a &lt; 1 mcg/kg.</b> Evita
          vasopresina, bloqueadores de canal de Ca, betabloqueantes y más anestésico local.
        </Callout>
        <Src>Neal JM, et al. ASRA Practice Advisory on LAST: 2020. Reg Anesth Pain Med 2021;46(1):81-82.</Src>

        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-0)", margin: "1.25rem 0 0.5rem" }}>
          Hiperkalemia
        </h3>
        <P>
          ECG progresivo: T picudas → PR largo/P aplanada → QRS ancho → onda sinusoidal → paro.
        </P>
        <Table
          headers={["Objetivo", "Intervención", "Dosis"]}
          accentCol={2}
          rows={[
            ["Estabilizar membrana", "Gluconato de calcio 10% (o cloruro por vía central)", "10-30 mL IV; efecto en minutos, repetir según ECG"],
            ["Redistribuir", "Insulina regular + dextrosa · salbutamol · bicarbonato si acidosis", "Insulina 10 U IV + dextrosa 25 g"],
            ["Eliminar", "Diuréticos · resinas · diálisis", "Diálisis = definitivo"],
          ]}
        />
        <Src>Gropper MA, et al. Miller&apos;s Anesthesia. 9.ª ed. Elsevier; 2020.</Src>

        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-0)", margin: "1.25rem 0 0.5rem" }}>
          QT prolongado / prevención de torsades
        </h3>
        <P>
          Fármacos que prolongan QT frecuentes en quirófano: droperidol, ondansetrón, haloperidol,
          metadona, azitromicina, antipsicóticos. Identifica y suspende el agente; <b>corrige K, Mg y
          Ca</b>; evita combinaciones; monitoriza QTc. Si aparece torsades → magnesio (ver §03).
        </P>
        <Src>Stoelting&apos;s Pharmacology &amp; Physiology in Anesthetic Practice, 6.ª ed.; Miller&apos;s 9.ª ed.</Src>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Referencias">
        <ol
          style={{
            color: "var(--text-2)",
            fontSize: "0.72rem",
            lineHeight: 1.7,
            paddingLeft: "1.2rem",
            margin: 0,
          }}
        >
          <li>Panchal AR, Bartos JA, Cabañas JG, et al. Part 3: Adult Basic and Advanced Life Support: 2020 AHA Guidelines for CPR and ECC. Circulation 2020;142(16_suppl_2):S366-S468.</li>
          <li>Kusumoto FM, Schoenfeld MH, Barrett C, et al. 2018 ACC/AHA/HRS Guideline on the Evaluation and Management of Patients With Bradycardia and Cardiac Conduction Delay. Circulation 2019;140(8):e382-e482.</li>
          <li>January CT, Wann LS, Calkins H, et al. 2019 AHA/ACC/HRS Focused Update of the 2014 Guideline for the Management of Patients With Atrial Fibrillation. Circulation 2019;140(2):e125-e151.</li>
          <li>Neal JM, Neal EJ, Weinberg GL. ASRA Local Anesthetic Systemic Toxicity checklist: 2020 version. Reg Anesth Pain Med 2021;46(1):81-82.</li>
          <li>Gropper MA, Cohen NH, Eriksson LI, et al. Miller&apos;s Anesthesia. 9.ª ed. Elsevier; 2020.</li>
          <li>Flood P, Rathmell JP, Urman RD. Stoelting&apos;s Pharmacology &amp; Physiology in Anesthetic Practice. 6.ª ed. Wolters Kluwer; 2022.</li>
        </ol>
      </Section>

      {/* Disclaimer (tono serio, sin humor clínico) */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y energías de literatura aceptada (ACLS 2020, ACC/AHA/HRS, ASRA)"}
          <br />
          {"// referencia educativa — no sustituye el algoritmo ACLS, la monitorización ni el juicio clínico"}
          <br />
          {"// verifica dosis y energías según tu protocolo institucional"}
          <br />
          {"// la responsabilidad clínica final es del profesional"}
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <Link href="/guias" className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}>
            ← más guías
          </Link>
          <Link href="/codigo" className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}>
            código azul →
          </Link>
        </div>
      </footer>
    </div>
  );
}
