import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — TORMENTA TIROIDEA (crisis tirotóxica)
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: escala de Burch-Wartofsky, dosis y secuencia
// de manejo tomadas de literatura aceptada (ATA/AACE, UpToDate,
// Stoelting). Cada dato lleva referencia (Vancouver breve).
// NO inventar dosis ni umbrales.
// Fuentes primarias:
//  - Ross DS, et al. 2016 American Thyroid Association Guidelines for
//    Diagnosis and Management of Hyperthyroidism and Other Causes of
//    Thyrotoxicosis. Thyroid 2016;26(10):1343-1421.
//  - Burch HB, Wartofsky L. Life-threatening thyrotoxicosis: thyroid
//    storm. Endocrinol Metab Clin North Am 1993;22(2):263-277.
//  - Stoelting's Anesthesia and Co-Existing Disease (endocrino).
// ============================================================

export const metadata: Metadata = {
  title: "Tormenta tiroidea — escala de Burch-Wartofsky y manejo · DEC",
  description:
    "Referencia de crisis tirotóxica (tormenta tiroidea): escala de Burch-Wartofsky para el diagnóstico y manejo escalonado — beta-bloqueo (propranolol 60-80 mg VO c/4h o esmolol IV), tionamida (propiltiouracilo 500-1000 mg carga luego 250 mg c/4h), yodo ≥1h después de la tionamida, hidrocortisona 100 mg IV c/8h y soporte. Guías ATA 2016.",
  openGraph: {
    title: "Tormenta tiroidea — Burch-Wartofsky y manejo escalonado · DEC",
    description:
      "Escala de Burch-Wartofsky y secuencia de tratamiento de la crisis tirotóxica: beta-bloqueo, tionamida, yodo (tras la tionamida), corticoide y soporte. ATA 2016.",
    type: "article",
  },
};

// ------------------------------------------------------------
// Helpers de presentación (mismo lenguaje visual que /guias/extubacion)
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
export default function TormentaTiroideaPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat tormenta-tiroidea.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Tormenta tiroidea
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          crisis tirotóxica · Burch-Wartofsky · beta-bloqueo · tionamida · yodo · corticoide · soporte
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// emergencia endocrina: el diagnóstico es clínico y el reloj corre antes que el laboratorio"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">EMERGENCIA</span>
          <span className="tag tag-muted">ATA 2016</span>
          <span className="tag tag-muted">Burch-Wartofsky</span>
          <span className="tag tag-muted">endocrino</span>
        </div>
      </header>

      <Callout variant="danger">
        La tormenta tiroidea es una <b>emergencia endocrina con mortalidad 10–30%</b> aun tratada. El
        diagnóstico es <b>clínico</b> (no espera confirmación de laboratorio: TSH suprimida con T4/T3
        libres elevadas confirman tirotoxicosis pero no distinguen la crisis). Ante sospecha, iniciar
        tratamiento de inmediato en área monitorizada. En el perioperatorio suele desencadenarse por
        cirugía, estrés o tiroidectomía en paciente hipertiroideo no controlado.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Reconocimiento y desencadenantes">
        <P>
          La crisis se distingue de la tirotoxicosis simple por la <b>descompensación multisistémica</b>:
          termorregulación (hiperpirexia), cardiovascular (taquiarritmia, insuficiencia cardíaca),
          neurológico (agitación, delirio, convulsión, coma) y gastrointestinal-hepático (vómito,
          diarrea, ictericia). Buscar y tratar el <b>desencadenante</b> es parte del tratamiento.
        </P>
        <Table
          headers={["Sistema", "Manifestación", "Desencadenantes típicos"]}
          rows={[
            ["Termorregulador", "Fiebre alta (a menudo > 38.5–41 °C), diaforesis", "Cirugía, infección/sepsis"],
            ["Cardiovascular", "Taquicardia sinusal, FA, ICC, isquemia, colapso", "Tiroidectomía en no controlado"],
            ["SNC", "Agitación, delirio, psicosis, convulsión, coma", "Trauma, parto, cetoacidosis"],
            ["GI / hepático", "Náusea, vómito, diarrea, dolor abdominal, ictericia", "Contraste yodado, retiro de tionamida"],
          ]}
        />
        <Src>
          Ross DS, et al. ATA Guidelines. Thyroid 2016;26(10):1343-1421. · Burch HB, Wartofsky L.
          Endocrinol Metab Clin North Am 1993;22(2):263-277.
        </Src>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Escala de Burch-Wartofsky (BWPS)">
        <P>
          La escala de Burch-Wartofsky (Burch-Wartofsky Point Scale, BWPS) semicuantifica la
          probabilidad de tormenta tiroidea. Se suma el puntaje de cada dominio; el diagnóstico es{" "}
          <b>clínico</b> y la escala solo lo apoya. Un puntaje bajo <b>no</b> excluye la crisis si la
          impresión clínica es alta.
        </P>
        <Table
          headers={["Dominio", "Hallazgo", "Puntos"]}
          accentCol={2}
          rows={[
            ["Temperatura (°C)", "37.2–37.7 / 37.8–38.2 / 38.3–38.8 / 38.9–39.3 / 39.4–39.9 / ≥ 40", "5 / 10 / 15 / 20 / 25 / 30"],
            ["SNC", "Ausente / leve (agitación) / moderado (delirio, psicosis, letargo) / grave (convulsión, coma)", "0 / 10 / 20 / 30"],
            ["GI-hepático", "Ausente / moderado (diarrea, náusea/vómito, dolor abdominal) / grave (ictericia inexplicada)", "0 / 10 / 20"],
            ["Frecuencia cardíaca (lpm)", "90–109 / 110–119 / 120–129 / 130–139 / ≥ 140", "5 / 10 / 15 / 20 / 25"],
            ["Insuficiencia cardíaca", "Ausente / leve (edema) / moderada (crepitantes basales) / grave (edema pulmonar)", "0 / 5 / 10 / 15"],
            ["Fibrilación auricular", "Ausente / presente", "0 / 10"],
            ["Historia desencadenante", "Ausente / presente", "0 / 10"],
          ]}
        />
        <Src>Burch HB, Wartofsky L. Endocrinol Metab Clin North Am 1993;22(2):263-277.</Src>
        <Table
          headers={["Puntaje total (BWPS)", "Interpretación", "Conducta"]}
          accentCol={0}
          rows={[
            ["≥ 45", "Altamente sugestivo de tormenta tiroidea", "Tratar como crisis de inmediato"],
            ["25–44", "Inminente / sugestivo (impending storm)", "Tratamiento según juicio clínico"],
            ["< 25", "Poco probable", "No excluye; correlacionar con la clínica"],
          ]}
        />
        <Src>Burch HB, Wartofsky L. 1993. · Ross DS, et al. ATA 2016 (adopta la BWPS como apoyo).</Src>
        <Callout variant="warn">
          La escala es una <b>ayuda, no un veredicto</b>. Las guías ATA reconocen que no existe un
          criterio de laboratorio que defina la crisis; ante alta sospecha clínica se trata aunque el
          BWPS quede por debajo de 45.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Manejo escalonado — secuencia y dosis">
        <P>
          El tratamiento ataca en paralelo los cinco frentes: (1) frenar los efectos periféricos
          adrenérgicos, (2) bloquear la síntesis de hormona, (3) bloquear su liberación con yodo{" "}
          <b>después</b> de la tionamida, (4) cubrir la insuficiencia suprarrenal relativa y frenar la
          conversión T4→T3, y (5) soporte del sistema y del desencadenante. El <b>orden importa</b>: el
          yodo va siempre tras la tionamida.
        </P>

        <Table
          headers={["Paso", "Objetivo", "Fármaco y dosis"]}
          rows={[
            [
              "1 · Beta-bloqueo",
              "Control adrenérgico (FC, temblor, ansiedad)",
              "Propranolol 60–80 mg VO c/4h; o esmolol IV en infusión titulable si inestable/UCI",
            ],
            [
              "2 · Tionamida",
              "Bloquear síntesis hormonal; PTU además bloquea conversión T4→T3",
              "Propiltiouracilo (PTU) 500–1000 mg carga, luego 250 mg c/4h (preferido); alternativa metimazol",
            ],
            [
              "3 · Yodo (≥ 1 h DESPUÉS de la tionamida)",
              "Bloquear la liberación de hormona preformada y la organificación (efecto Wolff-Chaikoff = inhibición aguda de la síntesis por yoduro)",
              "Solución de Lugol o yoduro de potasio (SSKI) VO; iniciar ≥ 1 h tras la tionamida",
            ],
            [
              "4 · Corticoide",
              "Insuficiencia suprarrenal relativa + bloqueo conversión T4→T3",
              "Hidrocortisona 100 mg IV c/8h",
            ],
            [
              "5 · Soporte",
              "Estabilizar y tratar la causa",
              "Enfriamiento activo, reposición de fluidos, tratar el desencadenante (infección, etc.)",
            ],
          ]}
        />
        <Src>Ross DS, et al. ATA 2016. · Burch HB, Wartofsky L. 1993. · UpToDate — Thyroid storm.</Src>

        <Callout variant="danger">
          <b>Secuencia crítica del yodo:</b> administrar el yodo (Lugol / yoduro) <b>≥ 1 hora
          DESPUÉS</b> de la tionamida. Si se da yodo primero, aporta sustrato para <b>sintetizar más
          hormona</b> y puede agravar la crisis. La tionamida debe estar a bordo antes de bloquear la
          liberación.
        </Callout>

        <Callout variant="ok">
          <b>Por qué PTU es preferido en la crisis:</b> el propiltiouracilo, además de bloquear la
          síntesis, <b>inhibe la 5&apos;-desyodasa periférica</b> y frena la conversión de T4 a T3
          (la forma activa). Por eso se prefiere al metimazol en la fase aguda pese a su dosificación
          más frecuente.
        </Callout>

        <Callout variant="warn">
          <b>Beta-bloqueo con cautela</b> en insuficiencia cardíaca descompensada por la tirotoxicosis:
          titular (esmolol IV permite ajuste rápido y reversibilidad). El propranolol a dosis altas
          también reduce la conversión periférica T4→T3, ventaja adicional en la crisis.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Tabla de dosis (adulto)">
        <Table
          headers={["Fármaco", "Dosis", "Nota"]}
          accentCol={1}
          rows={[
            ["Propranolol", "60–80 mg VO c/4h", "Beta-bloqueo; reduce conversión T4→T3 a dosis alta"],
            ["Esmolol", "Infusión IV titulable", "Alternativa IV si inestable / UCI; efecto corto y ajustable"],
            ["Propiltiouracilo (PTU)", "500–1000 mg carga, luego 250 mg c/4h", "Preferido en crisis: bloquea síntesis + conversión T4→T3"],
            ["Metimazol", "Alternativa a PTU", "Menos frecuente en la fase aguda de la crisis"],
            ["Yodo (Lugol / SSKI)", "VO, ≥ 1 h DESPUÉS de la tionamida", "Bloquea liberación de hormona; nunca antes de la tionamida"],
            ["Hidrocortisona", "100 mg IV c/8h", "Insuficiencia suprarrenal relativa + bloqueo conversión"],
          ]}
        />
        <Src>Ross DS, et al. ATA 2016;26(10):1343-1421. · Burch HB, Wartofsky L. 1993.</Src>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Soporte y medidas asociadas">
        <P>
          El soporte sistémico corre en paralelo a la farmacoterapia dirigida: no es adyuvante
          opcional. Corregir la hipertermia, la depleción de volumen y el desencadenante mejora el
          pronóstico.
        </P>
        <Table
          headers={["Medida", "Objetivo / detalle"]}
          rows={[
            ["Enfriamiento activo", "Medios físicos (mantas, compresas); acetaminofén para la fiebre"],
            ["Fluidos IV", "Reponer pérdidas por fiebre/diaforesis/GI; vigilar función cardíaca"],
            ["Tratar el desencadenante", "Infección/sepsis, cetoacidosis, trauma, cirugía, parto, retiro de tionamida"],
            ["Monitorización", "Área monitorizada / UCI; ECG continuo, temperatura, diuresis"],
            ["Tromboprofilaxis / FA", "Considerar según riesgo si fibrilación auricular"],
          ]}
        />
        <Src>Ross DS, et al. ATA 2016. · UpToDate — Thyroid storm (supportive care).</Src>

        <Callout variant="danger">
          <b>EVITAR salicilatos (aspirina)</b> para la fiebre: desplazan la hormona tiroidea de sus
          proteínas transportadoras (TBG, albúmina) y <b>aumentan la fracción libre de T4/T3</b>,
          agravando la tirotoxicosis. Usar <b>acetaminofén</b> como antipirético.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Resumen operativo">
        <Table
          headers={["Punto clave", "Detalle", "Fuente"]}
          accentCol={1}
          rows={[
            ["Diagnóstico", "Clínico; BWPS ≥ 45 sugestivo, 25–44 inminente", "Burch-Wartofsky 1993"],
            ["Beta-bloqueo", "Propranolol 60–80 mg VO c/4h o esmolol IV", "ATA 2016"],
            ["Tionamida (preferida)", "PTU 500–1000 mg carga → 250 mg c/4h", "ATA 2016"],
            ["Yodo", "Lugol/SSKI ≥ 1 h DESPUÉS de la tionamida", "ATA 2016"],
            ["Corticoide", "Hidrocortisona 100 mg IV c/8h", "ATA 2016"],
            ["Antipirético", "Acetaminofén — NO salicilatos", "ATA 2016"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Ross DS, Burch HB, Cooper DS, et al. 2016 American Thyroid Association Guidelines for Diagnosis and Management of Hyperthyroidism and Other Causes of Thyrotoxicosis. Thyroid 2016;26(10):1343-1421.</li>
          <li>Burch HB, Wartofsky L. Life-threatening thyrotoxicosis: thyroid storm. Endocrinol Metab Clin North Am 1993;22(2):263-277.</li>
          <li>Hines RL, Marschall KE. Stoelting&apos;s Anesthesia and Co-Existing Disease — Endocrine Disease (thyroid storm).</li>
          <li>Ross DS. Thyroid storm. UpToDate (revisión temática) — diagnóstico y manejo.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y secuencia de literatura aceptada (ATA 2016, Burch-Wartofsky 1993)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// regla de oro: la tionamida primero, el yodo después — el orden no es un tecnicismo"}
          <br />
          {"// la aspirina aquí no baja la fiebre, sube el problema"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
