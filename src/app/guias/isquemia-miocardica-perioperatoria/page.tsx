import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — ISQUEMIA MIOCÁRDICA PERIOPERATORIA (MINS / IAM)
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: definiciones, umbrales y conducta tomados de la
// literatura aceptada (VISION, guías ESC 2022 / ACC-AHA, Cuarta
// Definición Universal de IAM). Cada tabla/callout cita su fuente
// (Vancouver breve). NO inventar cifras.
// Fuentes primarias:
//  - Devereaux PJ, et al. (VISION Study). Association between
//    postoperative troponin levels and 30-day mortality among patients
//    undergoing noncardiac surgery. JAMA 2012;307(21):2295-2304.
//  - Botto F, Devereaux PJ, et al. Myocardial Injury after Noncardiac
//    Surgery (MINS). Anesthesiology 2014;120(3):564-578.
//  - Halvorsen S, et al. 2022 ESC Guidelines on cardiovascular
//    assessment and management of patients undergoing non-cardiac
//    surgery. Eur Heart J 2022;43(39):3826-3924.
//  - Fleisher LA, et al. 2014 ACC/AHA Guideline on Perioperative
//    Cardiovascular Evaluation and Management of Patients Undergoing
//    Noncardiac Surgery. Circulation 2014;130(24):e278-e333.
//  - Thygesen K, et al. Fourth Universal Definition of Myocardial
//    Infarction (2018). Circulation 2018;138(20):e618-e651.
// ============================================================

export const metadata: Metadata = {
  title: "Isquemia miocárdica perioperatoria (MINS/IAM) — Guía clínica · DEC",
  description:
    "Referencia perioperatoria de lesión miocárdica tras cirugía no cardiaca (MINS) e infarto perioperatorio (mayoría tipo 2, por desequilibrio aporte/demanda): detección con troponina seriada en alto riesgo y ECG, optimización aporte/demanda (anemia, taquicardia, hipotensión, hipoxemia, dolor), oxígeno, betabloqueo si taquicárdico y no hipotenso, antiagregación y estatina, evitar la suspensión abrupta de betabloqueantes/estatinas e implicar a cardiología. Guías ESC 2022, ACC/AHA, estudio VISION.",
  openGraph: {
    title: "Isquemia miocárdica perioperatoria (MINS/IAM) — Guía clínica · DEC",
    description:
      "MINS e IAM perioperatorio (tipo 2), troponina seriada, ECG, optimización aporte/demanda, betabloqueo, antiagregación, estatina y cardiología. VISION · ESC 2022 · ACC/AHA.",
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
export default function IsquemiaMiocardicaPerioperatoriaPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat isquemia-miocardica-perioperatoria.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Isquemia miocárdica perioperatoria (MINS/IAM)
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          MINS · IAM tipo 2 (aporte/demanda) · troponina seriada · ECG · aporte/demanda · betabloqueo · cardiología
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// el infarto perioperatorio suele ser silente: la troponina habla cuando el paciente no puede"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">REFERENCIA</span>
          <span className="tag tag-muted">VISION</span>
          <span className="tag tag-muted">ESC 2022</span>
          <span className="tag tag-muted">ACC/AHA</span>
        </div>
      </header>

      <Callout variant="info">
        <b>Definiciones.</b> <b>MINS</b> (lesión miocárdica tras cirugía no cardiaca) = elevación de
        troponina de origen isquémico en los primeros <b>30 días</b> tras cirugía no cardiaca, con o sin
        síntomas ni cambios en el ECG, no explicada por causa no isquémica (sepsis, TEP, FA, insuficiencia
        renal). El <b>IAM perioperatorio</b> es el subgrupo que además cumple criterio de infarto (isquemia
        + necrosis); la <b>mayoría es tipo 2</b>, por desequilibrio entre <b>aporte y demanda</b> de oxígeno
        miocárdico, no por rotura de placa aterotrombótica (tipo 1). El MINS es un predictor independiente
        de mortalidad a 30 días y frecuentemente <b>silente</b>.
      </Callout>
      <Src>
        Botto F, Devereaux PJ, et al. MINS. Anesthesiology 2014;120(3):564-578. · Devereaux PJ, et al.
        (VISION). JAMA 2012;307(21):2295-2304. · Thygesen K, et al. 4.ª Definición Universal de IAM.
        Circulation 2018;138(20):e618-e651.
      </Src>

      {/* ========================================================= */}
      <Section n="01" title="MINS vs. IAM tipo 1 vs. tipo 2">
        <P>
          Distinguir el <b>mecanismo</b> orienta el tratamiento. El <b>tipo 1</b> es aterotrombótico
          (rotura/erosión de placa con trombo) y puede requerir estrategia invasiva. El <b>tipo 2</b>,
          predominante en el perioperatorio, resulta del <b>desequilibrio aporte/demanda</b> (taquicardia,
          hipotensión, anemia, hipoxemia, dolor, hipertensión) sobre un lecho coronario a menudo ya
          enfermo: el tratamiento es <b>corregir el desequilibrio</b>. El MINS engloba ambos más la
          elevación aislada de troponina isquémica que no cumple criterio formal de infarto.
        </P>
        <Table
          headers={["Entidad", "Mecanismo", "Enfoque"]}
          accentCol={0}
          rows={[
            [
              "MINS",
              "Lesión miocárdica isquémica ≤ 30 días post-cirugía; puede no cumplir criterio de IAM; a menudo silente.",
              "Detectar (troponina), buscar y corregir el gatillo, tratamiento médico, cardiología.",
            ],
            [
              "IAM tipo 1",
              "Aterotrombótico: rotura/erosión de placa con trombo agudo.",
              "Antiagregación/anticoagulación; valorar estrategia invasiva con cardiología (riesgo hemorrágico post-op).",
            ],
            [
              "IAM tipo 2",
              "Desequilibrio aporte/demanda de O₂ (taquicardia, hipotensión, anemia, hipoxemia, dolor).",
              "Corregir el desequilibrio es el tratamiento; soporte médico; cardiología.",
            ],
          ]}
        />
        <Src>
          Thygesen K, et al. 4.ª Definición Universal de IAM. Circulation 2018;138(20):e618-e651. ·
          Halvorsen S, et al. ESC 2022. Eur Heart J 2022;43(39):3826-3924.
        </Src>
        <Callout variant="warn">
          El IAM perioperatorio con frecuencia <b>no da dolor torácico</b> (analgesia, sedación,
          distracción quirúrgica): más del 60–90% de los eventos son <b>asintomáticos</b> o atípicos. No
          esperar la clínica clásica: la vigilancia se basa en <b>troponina seriada</b> y ECG en el
          paciente de riesgo.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Detección: troponina seriada y ECG">
        <P>
          En pacientes de <b>alto riesgo</b> (≥ 65 años, o 45–64 con enfermedad cardiovascular
          establecida, o RCRI elevado) sometidos a cirugía no cardiaca mayor, la ESC 2022 y la evidencia
          de VISION apoyan medir <b>troponina de alta sensibilidad seriada</b>: basal preoperatoria y a las
          <b> 24 h y 48 h</b> postoperatorias, para detectar el MINS silente. El <b>ECG</b> se obtiene ante
          elevación de troponina, síntomas o inestabilidad.
        </P>
        <Table
          headers={["Momento", "Prueba", "Objetivo"]}
          accentCol={1}
          rows={[
            ["Preoperatorio", "Troponina hs basal (en alto riesgo) + ECG", "Establecer el basal y detectar delta postoperatorio."],
            ["Postop 24 h", "Troponina hs", "Captar la elevación isquémica precoz (la mayoría del MINS aparece pronto)."],
            ["Postop 48 h", "Troponina hs", "Ampliar la ventana de detección del evento silente."],
            ["Ante ↑ troponina / síntomas / inestabilidad", "ECG 12 derivaciones (± seriado)", "Buscar isquemia (ST/T, nuevo bloqueo), tipificar el evento."],
          ]}
        />
        <Src>
          Halvorsen S, et al. ESC 2022. Eur Heart J 2022;43(39):3826-3924. · Devereaux PJ, et al. (VISION).
          JAMA 2012;307(21):2295-2304. · Botto F, et al. Anesthesiology 2014;120(3):564-578.
        </Src>
        <Callout variant="info">
          <b>El delta importa.</b> Un valor de troponina aislado sin basal es difícil de interpretar
          (comorbilidad, disfunción renal). Un <b>ascenso/descenso dinámico</b> respecto al basal, con
          contexto isquémico y sin causa alternativa (sepsis, TEP, FA rápida, IRC), sostiene el
          diagnóstico de MINS. Documentar hora de cada extracción.
        </Callout>
        <Callout variant="warn">
          El cribado de troponina <b>solo aporta valor si conlleva una acción</b>: activar la evaluación,
          buscar y corregir el gatillo, iniciar tratamiento médico e implicar a cardiología. Detectar sin
          actuar no cambia el desenlace.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Manejo: optimizar aporte/demanda de O₂">
        <P>
          Como la mayoría es <b>tipo 2</b>, el pilar del tratamiento es <b>restaurar el equilibrio
          aporte/demanda</b>: aumentar el aporte (corregir anemia e hipoxemia, mantener presión de
          perfusión coronaria) y reducir la demanda (controlar taquicardia, hipertensión, dolor,
          agitación). Buscar y tratar el gatillo específico de cada paciente.
        </P>
        <Table
          headers={["Determinante", "Problema", "Corrección"]}
          accentCol={0}
          rows={[
            ["Anemia", "↓ aporte de O₂ (↓ contenido arterial).", "Tratar la causa; transfundir según umbral (típico Hb ~7–8 g/dL, individualizar en cardiopatía)."],
            ["Taquicardia", "↑ demanda + ↓ tiempo diastólico de perfusión coronaria.", "Analgesia, volumen si hipovolemia, tratar la causa; betabloqueo si taquicárdico y NO hipotenso (§4)."],
            ["Hipotensión", "↓ presión de perfusión coronaria.", "Volumen si hipovolemia, vasopresor para PAM adecuada; tratar la causa (sangrado, sepsis)."],
            ["Hipoxemia", "↓ aporte de O₂.", "Oxígeno suplementario; optimizar ventilación/analgesia; tratar la causa pulmonar."],
            ["Dolor / estrés adrenérgico", "↑ demanda (taquicardia, HTA).", "Analgesia adecuada, controlar HTA y agitación."],
          ]}
        />
        <Src>
          Halvorsen S, et al. ESC 2022. Eur Heart J 2022;43(39):3826-3924. · Fleisher LA, et al. ACC/AHA
          2014. Circulation 2014;130(24):e278-e333.
        </Src>
        <Callout variant="ok">
          <b>Oxígeno.</b> Administrar O₂ suplementario ante hipoxemia (objetivo de SpO₂ ~≥ 90–94%). Evitar
          la hiperoxia innecesaria: el O₂ trata la hipoxemia, no sustituye la corrección del resto de
          determinantes (anemia, taquicardia, hipotensión, dolor).
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Betabloqueo y demás tratamiento médico">
        <P>
          Ante isquemia por <b>taquicardia en paciente NO hipotenso</b>, el betabloqueo reduce la demanda
          (frecuencia y contractilidad) y prolonga la perfusión coronaria diastólica. Junto a él, valorar
          <b> antiagregación</b> y <b>estatina</b> según el balance riesgo isquémico / hemorrágico, siempre
          coordinado con cardiología.
        </P>
        <Table
          headers={["Intervención", "Uso / dosis", "Nota"]}
          accentCol={1}
          rows={[
            [
              "Betabloqueante",
              "Solo si taquicárdico y NO hipotenso; titular a FC objetivo evitando hipotensión/bradicardia.",
              "Reduce demanda; NO iniciar dosis altas de forma abrupta el día de la cirugía (POISE: ↓ IAM pero ↑ ictus y mortalidad).",
            ],
            [
              "Antiagregación",
              "Considerar AAS ± segundo agente según mecanismo (más en tipo 1) y riesgo hemorrágico post-op.",
              "Decisión individualizada con cardiología; sopesar sangrado quirúrgico reciente.",
            ],
            [
              "Estatina",
              "Considerar/continuar estatina de alta intensidad.",
              "Efecto estabilizador de placa; asociada a menor mortalidad en MINS.",
            ],
            [
              "Anticoagulación",
              "Valorar según mecanismo y riesgo hemorrágico (p. ej. tipo 1); no rutinaria en tipo 2.",
              "Balance isquemia/sangrado con cardiología.",
            ],
            [
              "Cardiología",
              "Interconsulta precoz ante MINS/IAM.",
              "Define tipificación, estrategia (médica vs. invasiva) y seguimiento.",
            ],
          ]}
        />
        <Src>
          Halvorsen S, et al. ESC 2022. Eur Heart J 2022;43(39):3826-3924. · Devereaux PJ, et al. (POISE).
          Lancet 2008;371(9627):1839-1847. · Fleisher LA, et al. ACC/AHA 2014. Circulation 2014;130(24):e278-e333.
        </Src>
        <Callout variant="danger">
          <b>Betabloqueo con juicio.</b> El betabloqueo es útil para frenar la taquicardia isquémica, pero
          <b> nunca</b> en el paciente hipotenso: agravaría la hipoperfusión coronaria. El ensayo{" "}
          <b>POISE</b> mostró que iniciar metoprolol a dosis altas justo antes de la cirugía reduce el IAM
          pero aumenta la <b>mortalidad global y el ictus</b> (por hipotensión y bradicardia). Titular con
          cautela, con presión y frecuencia bajo control.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="No suspender de forma abrupta betabloqueantes ni estatinas">
        <P>
          En el paciente que <b>ya tomaba</b> betabloqueante o estatina de forma crónica, la retirada
          brusca perioperatoria es dañina: el <b>rebote betabloqueador</b> (taquicardia, HTA, isquemia,
          arritmia) y la pérdida del efecto pleiotrópico/estabilizador de placa de la estatina se asocian a
          más eventos cardíacos. La conducta es <b>continuarlos</b> durante todo el perioperatorio.
        </P>
        <Table
          headers={["Fármaco crónico", "Conducta perioperatoria", "Riesgo de suspenderlo"]}
          accentCol={1}
          rows={[
            ["Betabloqueante", "Continuar (no suspender de forma abrupta); ajustar si bradicardia/hipotensión, sin retirar bruscamente.", "Taquicardia/HTA de rebote, isquemia, arritmia."],
            ["Estatina", "Continuar durante todo el perioperatorio (reiniciar precozmente si se pausó).", "Pérdida de estabilización de placa; más eventos y mortalidad."],
          ]}
        />
        <Src>
          Halvorsen S, et al. ESC 2022. Eur Heart J 2022;43(39):3826-3924. · Fleisher LA, et al. ACC/AHA
          2014. Circulation 2014;130(24):e278-e333.
        </Src>
        <Callout variant="warn">
          Distinguir <b>continuar</b> el fármaco crónico (recomendado) de <b>iniciar</b> uno nuevo a dosis
          altas en el momento de la cirugía (peligroso, POISE). El betabloqueante de novo se titula con días
          de antelación; el crónico simplemente <b>no se suspende</b>.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Resumen de conducta clave">
        <Table
          headers={["Parámetro", "Conducta", "Fuente"]}
          accentCol={1}
          rows={[
            ["Cribado en alto riesgo", "Troponina hs basal + 24 h + 48 h; ECG si ↑/síntomas", "ESC 2022 / VISION"],
            ["Mecanismo predominante", "IAM tipo 2 (desequilibrio aporte/demanda)", "4.ª Def. Universal"],
            ["Pilar del manejo", "Corregir aporte/demanda (anemia, taquicardia, hipotensión, hipoxemia, dolor)", "ESC 2022 / ACC-AHA"],
            ["Oxígeno", "Suplementario ante hipoxemia (SpO₂ ~≥ 90–94%)", "ACC-AHA"],
            ["Betabloqueo", "Solo si taquicárdico y NO hipotenso; titular", "ESC 2022 / POISE"],
            ["Antiagregación / estatina", "Considerar según mecanismo y riesgo hemorrágico", "ESC 2022"],
            ["Betabloqueante/estatina crónicos", "NO suspender de forma abrupta", "ESC 2022 / ACC-AHA"],
            ["Betabloqueo de novo día de cirugía", "Evitar dosis altas abruptas (↑ ictus/mortalidad)", "POISE"],
            ["Cardiología", "Interconsulta precoz para tipificar y decidir estrategia", "ESC 2022"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Devereaux PJ, Chan MTV, Alonso-Coello P, et al. (VISION Study Investigators). Association between postoperative troponin levels and 30-day mortality among patients undergoing noncardiac surgery. JAMA 2012;307(21):2295-2304.</li>
          <li>Botto F, Alonso-Coello P, Chan MTV, et al. Myocardial injury after noncardiac surgery (MINS): a large, international, prospective cohort study establishing diagnostic criteria, characteristics, predictors, and 30-day outcomes. Anesthesiology 2014;120(3):564-578.</li>
          <li>Halvorsen S, Mehilli J, Cassese S, et al. 2022 ESC Guidelines on cardiovascular assessment and management of patients undergoing non-cardiac surgery. Eur Heart J 2022;43(39):3826-3924.</li>
          <li>Fleisher LA, Fleischmann KE, Auerbach AD, et al. 2014 ACC/AHA Guideline on Perioperative Cardiovascular Evaluation and Management of Patients Undergoing Noncardiac Surgery. Circulation 2014;130(24):e278-e333.</li>
          <li>Thygesen K, Alpert JS, Jaffe AS, et al. Fourth Universal Definition of Myocardial Infarction (2018). Circulation 2018;138(20):e618-e651.</li>
          <li>Devereaux PJ, Yang H, Yusuf S, et al. (POISE Study Group). Effects of extended-release metoprolol succinate in patients undergoing non-cardiac surgery (POISE trial). Lancet 2008;371(9627):1839-1847.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// definiciones y conducta de literatura aceptada (VISION · ESC 2022 · ACC/AHA · 4.ª Def. Universal de IAM)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// la mayoría del infarto perioperatorio es tipo 2: corrige aporte/demanda antes de buscar el catéter"}
          <br />
          {"// betabloqueante crónico se continúa; iniciarlo a dosis altas el día de la cirugía mata (POISE)"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
