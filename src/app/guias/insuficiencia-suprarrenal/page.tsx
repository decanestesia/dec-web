import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — INSUFICIENCIA SUPRARRENAL Y ESTEROIDES DE ESTRÉS
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: dosis, umbrales y esquemas tomados de literatura
// aceptada. Cada tabla/callout cita su fuente (Vancouver breve).
// NO inventar dosis ni cifras.
// Fuentes primarias:
//  - Woodcock T, Barker P, Daniel S, et al. Guidelines for the management
//    of glucocorticoids during the peri-operative period for patients with
//    adrenal insufficiency. AAGBI/Assoc of Anaesthetists. Anaesthesia
//    2020;75(5):654-663.
//  - Bornstein SR, et al. Diagnosis and Treatment of Primary Adrenal
//    Insufficiency: An Endocrine Society Clinical Practice Guideline.
//    J Clin Endocrinol Metab 2016;101(2):364-389.
//  - Rushworth RL, Torpy DJ, Falhammar H. Adrenal Crisis. N Engl J Med
//    2019;381(9):852-861.
//  - Liu MM, Reidy AB, Saatee S, Collard CD. Perioperative Steroid
//    Management. Anesthesiology 2017;127(1):166-172.
//  - Stoelting's Pharmacology & Physiology in Anesthetic Practice.
// ============================================================

export const metadata: Metadata = {
  title:
    "Insuficiencia suprarrenal y esteroides de estrés — Guía clínica · DEC",
  description:
    "Referencia perioperatoria de insuficiencia suprarrenal: manejo de la crisis addisoniana (hidrocortisona 100 mg IV bolo + 200 mg/24h), dosis de esteroides de estrés por magnitud quirúrgica, identificación de pacientes en riesgo por corticoides crónicos y equivalencias de glucocorticoides. Guías AAGBI 2020, Endocrine Society.",
  openGraph: {
    title:
      "Insuficiencia suprarrenal y esteroides de estrés — Guía clínica · DEC",
    description:
      "Crisis addisoniana, dosis de estrés perioperatorias por magnitud quirúrgica y pacientes en riesgo por corticoides crónicos. AAGBI 2020.",
    type: "article",
  },
};

// ------------------------------------------------------------
// Helpers de presentación (mismo lenguaje visual que guias/extubacion)
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
    <div
      className="panel"
      style={{ borderLeft: `3px solid ${c.border}`, margin: "1.25rem 0" }}
    >
      <div
        className="panel-body"
        style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}
      >
        <span style={{ color: c.border, fontSize: "0.9rem", lineHeight: 1.6 }}>
          {c.icon}
        </span>
        <div
          style={{ color: "var(--text-1)", fontSize: "0.82rem", lineHeight: 1.65 }}
        >
          {children}
        </div>
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
    <div
      style={{
        overflowX: "auto",
        margin: "0 0 1.25rem",
        border: "1px solid var(--border)",
      }}
    >
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
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "0.6rem",
          marginBottom: "0.5rem",
        }}
      >
        <span className="mono" style={{ color: "var(--accent)", fontSize: "0.7rem" }}>
          {n}
        </span>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-0)" }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        color: "var(--text-1)",
        fontSize: "0.9rem",
        lineHeight: 1.75,
        margin: "0 0 1rem",
      }}
    >
      {children}
    </p>
  );
}

function Src({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mono"
      style={{
        color: "var(--text-3)",
        fontSize: "0.6rem",
        lineHeight: 1.65,
        margin: "-0.6rem 0 1.25rem",
        opacity: 0.85,
      }}
    >
      {children}
    </p>
  );
}

// ------------------------------------------------------------
// Página (Server Component — referencia estática)
// ------------------------------------------------------------
export default function InsuficienciaSuprarrenalPage() {
  return (
    <div
      className="wrap"
      style={{
        paddingTop: "1.5rem",
        paddingBottom: "3rem",
        maxWidth: 820,
        margin: "0 auto",
      }}
    >
      <Link
        href="/guias"
        className="mono"
        style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}
      >
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat insuficiencia-suprarrenal.md
        </div>
        <h1
          style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}
        >
          Insuficiencia suprarrenal y esteroides de estrés
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          crisis addisoniana · dosis de estrés perioperatorias · pacientes en riesgo · equivalencias
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// la suprarrenal exhausta no avisa: colapsa a mitad del caso y sin diagnóstico"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">REFERENCIA</span>
          <span className="tag tag-muted">AAGBI 2020</span>
          <span className="tag tag-muted">Endocrine Society 2016</span>
        </div>
      </header>

      <Callout variant="info">
        Dos escenarios distintos con manejo distinto:{" "}
        <b>(1) crisis addisoniana</b> — emergencia con hidrocortisona a dosis plena y reanimación
        con fluidos; y <b>(2) profilaxis perioperatoria de esteroides de estrés</b> — suplemento
        dosificado por la magnitud quirúrgica en el paciente en riesgo. Ante la duda en un paciente
        inestable con posible supresión del eje, se trata la crisis: el esteroide no daña y su
        omisión puede ser fatal.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Crisis addisoniana (crisis suprarrenal aguda)">
        <P>
          Emergencia que amenaza la vida por déficit agudo de cortisol. Sospéchala ante{" "}
          <b>hipotensión / shock que no responde a fluidos ni vasopresores</b> en un paciente en
          riesgo (corticoides crónicos, Addison, hipofisario), a menudo con hiponatremia,
          hiperpotasemia, hipoglucemia, náusea/vómito, dolor abdominal y fiebre. El tratamiento{" "}
          <b>no debe esperar</b> a la confirmación de laboratorio.
        </P>
        <Table
          headers={["Paso", "Intervención", "Dosis / detalle"]}
          accentCol={2}
          rows={[
            [
              "1 · Hidrocortisona",
              "Bolo IV inmediato, luego mantenimiento",
              "100 mg IV en bolo → después 200 mg/24 h (infusión continua o 50 mg IV c/6 h)",
            ],
            [
              "2 · Fluidos",
              "Reanimación con cristaloide + dextrosa",
              "Salino 0.9% 1 L rápido; añadir dextrosa (p. ej. glucosado) para corregir hipoglucemia",
            ],
            [
              "3 · Hipoglucemia",
              "Corregir con glucosa IV",
              "Dextrosa IV según glucemia (p. ej. 25 g); vigilar glucemia seriada",
            ],
            [
              "4 · Hiperpotasemia",
              "Tratar según severidad / ECG",
              "Protección miocárdica y desplazamiento de K⁺; la hidrocortisona y el volumen ayudan",
            ],
            [
              "5 · Causa desencadenante",
              "Buscar y tratar el gatillo",
              "Infección/sepsis, cirugía, IAM, omisión del esteroide, deshidratación",
            ],
          ]}
        />
        <Src>
          Rushworth RL, Torpy DJ, Falhammar H. Adrenal Crisis. N Engl J Med 2019;381(9):852-861. ·
          Bornstein SR, et al. Endocrine Society. J Clin Endocrinol Metab 2016;101(2):364-389.
        </Src>
        <Callout variant="danger">
          <b>Hidrocortisona 100 mg IV en bolo</b> es la primera medida. Mantenimiento{" "}
          <b>200 mg/24 h</b> por infusión continua (preferida) o <b>50 mg IV cada 6 h</b>. A dosis
          de estrés (≥ 200 mg/día de hidrocortisona) el efecto mineralocorticoide es suficiente: no
          se necesita fludrocortisona añadida en la fase aguda.
        </Callout>
        <Callout variant="warn">
          En la crisis, la hidrocortisona parenteral es de elección por su acción gluco- y
          mineralocorticoide. Si solo dispones de dexametasona, sirve como puente (no interfiere con
          el test de cortisol posterior) pero <b>carece de efecto mineralocorticoide</b>: prioriza
          hidrocortisona en cuanto esté disponible.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Esteroides de estrés perioperatorios por magnitud quirúrgica">
        <P>
          En el paciente con supresión del eje hipotálamo-hipófiso-suprarrenal, la respuesta de
          cortisol a la cirugía puede ser insuficiente. La suplementación se dosifica según la{" "}
          <b>magnitud del estrés quirúrgico</b>, sumada a la dosis habitual de corticoide del
          paciente (que <b>no debe suspenderse</b>).
        </P>
        <Table
          headers={["Magnitud quirúrgica", "Ejemplos", "Suplemento de hidrocortisona"]}
          accentCol={2}
          rows={[
            [
              "Menor",
              "Cirugía superficial, hernia, procedimientos con anestesia local, endoscopia breve",
              "Dosis habitual del paciente, o añadir ≈ 25 mg de hidrocortisona en la inducción",
            ],
            [
              "Moderada",
              "Cirugía abierta abdominal baja, ortopédica, vascular periférica",
              "50–75 mg/24 h (dosis habitual + hidrocortisona), 1–2 días con descenso rápido",
            ],
            [
              "Mayor",
              "Cirugía cardíaca, torácica, esofágica, hepatobiliar mayor, sepsis quirúrgica",
              "100–150 mg/24 h por 2–3 días, con descenso rápido a la dosis habitual",
            ],
          ]}
        />
        <Src>
          Woodcock T, et al. AAGBI/Assoc of Anaesthetists. Anaesthesia 2020;75(5):654-663. · Liu MM,
          et al. Perioperative Steroid Management. Anesthesiology 2017;127(1):166-172.
        </Src>
        <Callout variant="ok">
          Regla operativa: <b>continúa siempre la dosis habitual</b> del paciente el día de la
          cirugía y <b>añade</b> el suplemento según magnitud. Tras cirugía mayor, desciende
          rápido: 100–150 mg/24 h por 2–3 días y luego volver a la dosis de base. No hace falta un
          descenso escalonado prolongado si la dosis de base se reanuda.
        </Callout>
        <Callout variant="warn">
          En la cirugía menor muchos pacientes solo necesitan su dosis habitual. Sobredosificar de
          rutina expone a hiperglucemia, mala cicatrización e infección sin beneficio demostrado.
          Ajusta a la magnitud real del procedimiento.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Identificar al paciente en riesgo de supresión del eje">
        <P>
          El riesgo de insuficiencia suprarrenal perioperatoria depende de la dosis, la duración y
          la vía del corticoide. El punto clave para el anestesiólogo:{" "}
          <b>corticoides crónicos equivalentes a &gt; 5 mg/día de prednisona durante &gt; 3 semanas</b>{" "}
          deben considerarse con eje potencialmente suprimido y requieren cobertura perioperatoria.
        </P>
        <Table
          headers={["Categoría", "Exposición a corticoide", "Conducta"]}
          accentCol={0}
          rows={[
            [
              "Alto riesgo",
              "> 5 mg/día de prednisona (o equivalente) durante > 3 semanas; Addison / panhipopituitarismo; dosis altas recientes",
              "Asumir eje suprimido → dar esteroides de estrés según magnitud (§02)",
            ],
            [
              "Riesgo intermedio",
              "Dosis intermedias o cursos repetidos; corticoide inhalado/tópico de alta potencia y dosis altas",
              "Individualizar; ante duda, cubrir. Considerar test si hay tiempo electivo",
            ],
            [
              "Bajo riesgo",
              "< 5 mg/día de prednisona, cualquier duración; cursos < 3 semanas; corticoide puntual",
              "Eje típicamente intacto → dosis habitual, sin suplemento de estrés",
            ],
          ]}
        />
        <Src>
          Woodcock T, et al. Anaesthesia 2020;75(5):654-663. · Liu MM, et al. Anesthesiology
          2017;127(1):166-172.
        </Src>
        <Callout variant="info">
          Señales de alarma en la valoración preanestésica: facies cushingoide, corticoide crónico
          por asma/EPOC/reumatológico/trasplante, hipotensión ortostática inexplicada,
          hiperpigmentación (Addison) e hiponatremia. Documenta la dosis, la duración y la última
          toma.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Equivalencias de glucocorticoides">
        <P>
          Convertir a un patrón común facilita evaluar la exposición acumulada y elegir el
          suplemento. Las equivalencias son aproximadas y la potencia mineralocorticoide es un dato
          aparte (relevante en la crisis).
        </P>
        <Table
          headers={["Glucocorticoide", "Dosis equipotente (glucocorticoide)", "Potencia mineralocorticoide"]}
          accentCol={1}
          rows={[
            ["Hidrocortisona (cortisol)", "20 mg", "Sí (referencia = 1)"],
            ["Prednisona / prednisolona", "5 mg", "Baja"],
            ["Metilprednisolona", "4 mg", "Mínima"],
            ["Dexametasona", "0.75 mg", "Nula"],
            ["Cortisona", "25 mg", "Sí"],
          ]}
        />
        <Src>
          Stoelting&apos;s Pharmacology &amp; Physiology in Anesthetic Practice — Corticosteroids. ·
          Liu MM, et al. Anesthesiology 2017;127(1):166-172.
        </Src>
        <Callout variant="warn">
          La <b>dexametasona no tiene efecto mineralocorticoide</b>: útil como antiemético o cuando
          se quiere preservar el eje diagnóstico, pero no reemplaza a la hidrocortisona en la crisis
          suprarrenal, donde se necesita también el componente mineralocorticoide.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Resumen de dosis clave">
        <Table
          headers={["Escenario", "Dosis", "Fuente"]}
          accentCol={1}
          rows={[
            ["Crisis · bolo inicial", "Hidrocortisona 100 mg IV", "N Engl J Med 2019"],
            ["Crisis · mantenimiento", "200 mg/24 h (infusión) o 50 mg IV c/6 h", "Endocrine Society 2016"],
            ["Cirugía menor", "Dosis habitual, o +25 mg hidrocortisona", "AAGBI 2020"],
            ["Cirugía moderada", "50–75 mg/24 h, 1–2 días", "AAGBI 2020"],
            ["Cirugía mayor", "100–150 mg/24 h × 2–3 días, descenso rápido", "AAGBI 2020"],
            ["Umbral de riesgo", "> 5 mg/día prednisona por > 3 semanas", "AAGBI 2020"],
            ["Equivalencia hidrocortisona", "20 mg = 5 mg prednisona = 0.75 mg dexametasona", "Stoelting"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Referencias">
        <ol
          className="mono"
          style={{
            color: "var(--text-2)",
            fontSize: "0.66rem",
            lineHeight: 1.85,
            paddingLeft: "1.4rem",
            margin: 0,
          }}
        >
          <li>
            Woodcock T, Barker P, Daniel S, et al. Guidelines for the management of glucocorticoids
            during the peri-operative period for patients with adrenal insufficiency. Association of
            Anaesthetists (AAGBI). Anaesthesia 2020;75(5):654-663.
          </li>
          <li>
            Bornstein SR, Allolio B, Arlt W, et al. Diagnosis and Treatment of Primary Adrenal
            Insufficiency: An Endocrine Society Clinical Practice Guideline. J Clin Endocrinol Metab
            2016;101(2):364-389.
          </li>
          <li>
            Rushworth RL, Torpy DJ, Falhammar H. Adrenal Crisis. N Engl J Med 2019;381(9):852-861.
          </li>
          <li>
            Liu MM, Reidy AB, Saatee S, Collard CD. Perioperative Steroid Management: Approaches
            Based on Current Evidence. Anesthesiology 2017;127(1):166-172.
          </li>
          <li>
            Flood P, Rathmell JP, Shafer S. Stoelting&apos;s Pharmacology &amp; Physiology in
            Anesthetic Practice — Corticosteroids (equivalencias y potencias).
          </li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer
        style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}
      >
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y umbrales de literatura aceptada (AAGBI 2020 · Endocrine Society 2016 · Stoelting)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// ante shock refractario en paciente corticoideo: 100 mg de hidrocortisona antes que otro litro de fluido"}
          <br />
          {"// si dudas entre cubrir o no cubrir, el esteroide se perdona; la crisis omitida no"}
        </p>
        <Link
          href="/guias"
          className="btn btn-outline btn-sm"
          style={{ marginTop: "1rem", textDecoration: "none" }}
        >
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
