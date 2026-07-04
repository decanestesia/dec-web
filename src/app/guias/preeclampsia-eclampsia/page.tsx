import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — PREECLAMPSIA Y ECLAMPSIA
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: criterios, dosis y umbrales de literatura
// aceptada (ACOG, RCOG). Cada dato lleva referencia (Vancouver
// breve). NO inventar dosis. Las dosis de sulfato de magnesio y
// antihipertensivos son las de guía y deben respetarse.
// Fuentes primarias:
//  - ACOG. Gestational Hypertension and Preeclampsia. Practice
//    Bulletin No. 222. Obstet Gynecol 2020;135(6):e237-e260.
//  - ACOG Committee Opinion No. 767: Emergent Therapy for
//    Acute-Onset, Severe Hypertension During Pregnancy and the
//    Postpartum Period. Obstet Gynecol 2019;133(2):e174-e180.
//  - RCOG / NICE NG133. Hypertension in pregnancy: diagnosis and
//    management. 2019 (act. 2023).
//  - Magpie Trial Collaborative Group. Lancet 2002;359:1877-1890.
//  - Chestnut's Obstetric Anesthesia, 6.ª ed. — Hypertensive Disorders.
// ============================================================

export const metadata: Metadata = {
  title: "Preeclampsia y eclampsia — Guía clínica — DEC",
  description:
    "Referencia perioperatoria de preeclampsia y eclampsia: criterios de severidad, sulfato de magnesio (carga 4-6 g, mantenimiento 1-2 g/h, toxicidad y gluconato de calcio), control de HTA severa (labetalol, hidralazina, nifedipino) y manejo anestésico (neuroaxial vs. general, plaquetas, respuesta a la laringoscopia). ACOG, RCOG.",
  openGraph: {
    title: "Preeclampsia y eclampsia — Guía clínica — DEC",
    description:
      "Criterios de severidad, sulfato de magnesio, control de HTA severa y manejo anestésico de la preeclampsia/eclampsia. ACOG, RCOG.",
    type: "article",
  },
};

// ------------------------------------------------------------
// Helpers de presentación (mismo lenguaje visual que /guias)
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
export default function PreeclampsiaEclampsiaPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat preeclampsia-eclampsia.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Preeclampsia y eclampsia
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          criterios de severidad · sulfato de magnesio · toxicidad · HTA severa · manejo anestésico
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// la única cura definitiva es el parto; todo lo demás es ganar tiempo con seguridad"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">REFERENCIA</span>
          <span className="tag tag-muted">ACOG 2020</span>
          <span className="tag tag-muted">ACOG 767</span>
          <span className="tag tag-muted">RCOG / NICE</span>
        </div>
      </header>

      <Callout variant="info">
        La preeclampsia es un síndrome multisistémico de la gestación (≥ 20 sem) definido por{" "}
        <b>hipertensión de novo</b> más <b>proteinuria</b> o <b>disfunción de órgano diana</b>. La{" "}
        <b>eclampsia</b> es la aparición de convulsiones tónico-clónicas generalizadas no atribuibles
        a otra causa. Dos ejes de tratamiento son independientes y simultáneos:{" "}
        <b>sulfato de magnesio</b> (profilaxis/tratamiento de convulsiones) y{" "}
        <b>antihipertensivos</b> (control de la HTA severa). Ninguno sustituye al otro, y el{" "}
        tratamiento definitivo es el <b>parto</b>.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Criterios diagnósticos y de severidad">
        <P>
          Diagnóstico de preeclampsia: <b>HTA</b> (≥ 140/90 mmHg en dos tomas separadas ≥ 4 h, tras
          la semana 20 en mujer previamente normotensa) más <b>proteinuria</b>. En ausencia de
          proteinuria, el diagnóstico se mantiene si hay <b>signos de afectación de órgano diana</b>{" "}
          (la proteinuria ya no es imprescindible para diagnosticar). La distinción clave es entre
          preeclampsia <b>sin</b> y <b>con criterios de severidad</b>, porque marca conducta,
          umbral de parto e indicación de sulfato de magnesio.
        </P>
        <Table
          headers={["Criterio de severidad", "Umbral / definición"]}
          rows={[
            [
              "Presión arterial",
              "PAS ≥ 160 mmHg y/o PAD ≥ 110 mmHg (en dos tomas separadas, salvo urgencia)",
            ],
            [
              "Trombocitopenia",
              "Plaquetas < 100 000 /µL (100 ×10⁹/L)",
            ],
            [
              "Función hepática",
              "Transaminasas ≥ 2× el límite superior normal y/o dolor epigástrico/hipocondrio derecho intenso",
            ],
            [
              "Función renal",
              "Creatinina sérica > 1.1 mg/dL o el doble de la basal (sin otra nefropatía)",
            ],
            [
              "Edema pulmonar",
              "Edema agudo de pulmón de novo",
            ],
            [
              "Síntomas neurológicos",
              "Cefalea intensa persistente refractaria, alteraciones visuales (escotomas, fotopsias), hiperreflexia con clonus",
            ],
          ]}
        />
        <Src>
          ACOG Practice Bulletin No. 222. Gestational Hypertension and Preeclampsia. Obstet Gynecol
          2020;135(6):e237-e260. · NICE NG133, 2019.
        </Src>
        <Callout variant="warn">
          La proteinuria <b>no</b> es criterio de severidad ni predice el pronóstico por su magnitud:
          la cuantía de proteinuria no debe usarse para decidir el momento del parto. Cualquiera de
          los criterios de la tabla convierte el cuadro en <b>preeclampsia con criterios de
          severidad</b> y obliga a sulfato de magnesio y valoración del parto.
        </Callout>
        <Callout variant="danger">
          <b>Síndrome HELLP</b> (Hemólisis, Enzimas hepáticas elevadas, Plaquetas bajas) y{" "}
          <b>eclampsia</b> son formas graves. La eclampsia puede ocurrir sin HTA severa previa y
          hasta el puerperio; la mayoría de los casos son anteparto/intraparto, pero un porcentaje
          significativo es posparto (a menudo &gt; 48 h). Alta sospecha ante convulsión en gestante o
          puérpera.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Sulfato de magnesio — prevención y tratamiento de convulsiones">
        <P>
          El sulfato de magnesio (MgSO₄) es el fármaco de <b>elección</b> para prevenir la eclampsia
          en preeclampsia con criterios de severidad y para tratar/prevenir la recurrencia de
          convulsiones en la eclampsia. Es superior a fenitoína y a diazepam. <b>No</b> es un
          antihipertensivo: no controla la presión arterial.
        </P>
        <div className="panel" style={{ margin: "0 0 1rem", borderLeft: "3px solid var(--accent)" }}>
          <div className="panel-body" style={{ display: "grid", gap: "0.6rem" }}>
            <div className="mono" style={{ color: "var(--accent)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Esquema estándar IV
            </div>
            <div className="mono" style={{ color: "var(--text-1)", fontSize: "0.82rem", lineHeight: 1.9 }}>
              <b style={{ color: "var(--accent)" }}>Carga:</b> 4–6 g IV en 15–20 min
              <br />
              <b style={{ color: "var(--accent)" }}>Mantenimiento:</b> 1–2 g/h IV en infusión continua
              <br />
              <b style={{ color: "var(--accent)" }}>Convulsión recurrente:</b> bolo de 2–4 g IV
              <br />
              <span style={{ color: "var(--text-2)", fontSize: "0.72rem" }}>
                Duración habitual: mantener durante el parto y ≥ 24 h posparto (o ≥ 24 h tras la última
                convulsión).
              </span>
            </div>
          </div>
        </div>
        <Src>
          ACOG Practice Bulletin No. 222, Obstet Gynecol 2020. · Magpie Trial Collaborative Group.
          Lancet 2002;359:1877-1890. · Altman D, et al. (Magpie). · Duley L, et al. Cochrane.
        </Src>
        <Table
          headers={["Parámetro", "Valor", "Nota"]}
          accentCol={1}
          rows={[
            ["Dosis de carga", "4–6 g IV en 15–20 min", "Diluir; no administrar en bolo rápido"],
            ["Mantenimiento", "1–2 g/h IV continua", "Ajustar según diuresis y niveles"],
            ["Convulsión recurrente", "Bolo 2–4 g IV", "Sobre el mantenimiento; lento"],
            ["Vía alternativa (sin acceso IV)", "IM 10 g inicial (5 g/nalga) + 5 g/4 h", "Régimen Pritchard; más dolorosa"],
            ["Rango terapéutico", "4–7 mEq/L (≈ 4.8–8.4 mg/dL)", "Vigilar clínica, no solo el nivel"],
          ]}
        />
        <Src>
          ACOG PB 222, 2020. · Régimen IM de Pritchard (alternativa cuando no hay bomba/acceso IV).
        </Src>
        <Callout variant="warn">
          En <b>insuficiencia renal</b> (oliguria, creatinina elevada) el magnesio se acumula: se{" "}
          <b>mantiene la dosis de carga</b> pero se <b>reduce o suspende el mantenimiento</b> y se
          monitorizan niveles séricos con más frecuencia. La toxicidad depende del nivel sérico, y
          el riñón es la única vía de eliminación.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Monitorización y toxicidad del magnesio">
        <P>
          La ventana terapéutica del magnesio es estrecha. La vigilancia es <b>clínica</b> (reflejos
          osteotendinosos, frecuencia respiratoria, diuresis) y, cuando esté disponible, con{" "}
          <b>niveles séricos</b>. La abolición del reflejo rotuliano es el <b>primer signo</b> de
          toxicidad y precede a la depresión respiratoria.
        </P>
        <Table
          headers={["Nivel sérico (mEq/L)", "Efecto", "Conducta"]}
          accentCol={0}
          rows={[
            ["4–7", "Rango terapéutico anticonvulsivante", "Mantener infusión; vigilancia continua"],
            ["8–10", "Pérdida del reflejo rotuliano", "Suspender infusión; reevaluar"],
            ["10–12", "Depresión / paro respiratorio", "Suspender YA; O₂, soporte; gluconato de calcio"],
            ["> 12–15", "Alteración de la conducción, paro cardíaco", "RCP; gluconato de calcio; soporte avanzado"],
          ]}
        />
        <Src>
          Equivalencias orientativas (1 mmol = 2 mEq = 2.4 mg/dL). ACOG PB 222, 2020. · Chestnut&apos;s
          Obstetric Anesthesia, 6.ª ed.
        </Src>
        <Callout variant="danger">
          <b>Antídoto de la toxicidad por magnesio: gluconato de calcio 1 g IV</b> (10 mL de solución
          al 10%) administrado <b>lento</b> (≈ 3–5 min). Suspender de inmediato la infusión de
          magnesio, asegurar vía aérea y ventilación, y dar soporte. Repetir según respuesta.
        </Callout>
        <Callout variant="warn">
          Antes de continuar cada tramo de infusión, verificar los <b>tres centinelas</b>:{" "}
          <b>reflejo rotuliano presente</b>, <b>FR ≥ 12 rpm</b> y <b>diuresis ≥ 100 mL/4 h</b> (≥ 25
          mL/h). Si falla alguno, suspender y reevaluar antes de reanudar. Tener el gluconato de
          calcio preparado a pie de cama siempre que corra magnesio.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Control de la HTA severa (≥ 160/110)">
        <P>
          La HTA severa aguda (PAS ≥ 160 y/o PAD ≥ 110 mmHg sostenida ≥ 15 min) es una{" "}
          <b>emergencia</b>: el objetivo es prevenir el ictus (hemorrágico), la principal causa de
          muerte materna en preeclampsia. Iniciar antihipertensivo de acción rápida{" "}
          <b>idealmente en 30–60 min</b>. La meta no es normalizar la presión, sino un rango{" "}
          <b>seguro (≈ 140–150 / 90–100 mmHg)</b>, evitando descensos bruscos que comprometan la
          perfusión uteroplacentaria.
        </P>
        <Table
          headers={["Fármaco", "Dosis inicial", "Repetición / escalado"]}
          accentCol={1}
          rows={[
            [
              "Labetalol IV",
              "20 mg IV lento",
              "Escalar 40 → 80 mg cada 10 min (máx. acumulado ≈ 300 mg); luego infusión 1–2 mg/min",
            ],
            [
              "Hidralazina IV",
              "5–10 mg IV",
              "Repetir 10 mg cada 20 min según respuesta (máx. ≈ 20 mg IV acumulado)",
            ],
            [
              "Nifedipino VO",
              "10 mg VO (liberación inmediata)",
              "Repetir 10–20 mg cada 20–30 min según respuesta (máx. ≈ 50 mg)",
            ],
          ]}
        />
        <Src>
          ACOG Committee Opinion No. 767. Emergent Therapy for Acute-Onset, Severe Hypertension.
          Obstet Gynecol 2019;133(2):e174-e180. · ACOG PB 222, 2020. · NICE NG133.
        </Src>
        <Callout variant="warn">
          <b>Labetalol:</b> evitar/usar con cautela en asma, bloqueo AV, bradicardia e insuficiencia
          cardíaca descompensada (α/β-bloqueo). <b>Hidralazina:</b> más hipotensión materna
          impredecible y cefalea/taquicardia refleja. <b>Nifedipino VO:</b> no usar la vía
          sublingual (descensos bruscos); precaución con el uso concomitante de sulfato de magnesio
          por potencial sinergia (bloqueo neuromuscular e hipotensión), aunque la combinación se usa
          en la práctica con monitorización.
        </Callout>
        <Callout variant="info">
          Los tres agentes son de <b>primera línea</b> y equivalentes en eficacia; la elección
          depende de disponibilidad, vía (IV vs. VO) y comorbilidad. Tras estabilizar, continuar con
          antihipertensivo de mantenimiento (p. ej. labetalol oral, nifedipino de acción prolongada o
          metildopa) y reevaluar el momento del parto.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Manejo de la convulsión eclámptica">
        <P>
          La convulsión eclámptica suele ser autolimitada. La prioridad no es &quot;cortar&quot; la
          crisis con más sedantes, sino <b>proteger a la madre</b>, dar magnesio y, una vez
          estabilizada, planificar el parto. El feto casi siempre se recupera con la reanimación
          materna (&quot;reanimar a la madre reanima al feto&quot;).
        </P>
        <Table
          headers={["Paso", "Acción"]}
          rows={[
            ["1 · Vía aérea y seguridad", "Decúbito lateral izquierdo, proteger de traumatismos, aspirar secreciones, O₂ suplementario, no forzar objetos en la boca"],
            ["2 · Sulfato de magnesio", "Carga 4–6 g IV en 15–20 min si no lo recibía; si ya lo recibía y recurre: bolo 2–4 g IV"],
            ["3 · Control de HTA severa", "Labetalol / hidralazina / nifedipino según §04 si PA ≥ 160/110"],
            ["4 · Monitorización", "SpO₂, ECG, PA, diuresis; reflejos y FR bajo magnesio; monitorización fetal"],
            ["5 · Refractariedad", "Si convulsiones persisten pese al magnesio: considerar benzodiacepina (p. ej. diazepam/lorazepam) o levetiracetam y descartar otra causa (imagen)"],
            ["6 · Parto", "Estabilizar primero, luego proceder al parto — el tratamiento definitivo"],
          ]}
        />
        <Src>
          ACOG PB 222, 2020. · RCOG / NICE NG133. · Chestnut&apos;s Obstetric Anesthesia, 6.ª ed.
        </Src>
        <Callout variant="danger">
          Una convulsión no es indicación de <b>cesárea inmediata</b> por sí sola. Primero estabilizar
          a la madre (vía aérea, magnesio, control de PA) y valorar el estado fetal; la vía y el
          momento del parto se deciden tras la estabilización, no durante la crisis.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Manejo anestésico">
        <P>
          El <b>neuroaxial</b> (epidural, espinal o combinada) es la técnica <b>preferida</b> para la
          analgesia del parto y la cesárea en preeclampsia, incluso con criterios de severidad,
          siempre que no haya coagulopatía ni trombocitopenia significativa. Mejora el control
          tensional, evita la respuesta hipertensiva a la laringoscopia y evita el manejo de una vía
          aérea potencialmente difícil por el edema.
        </P>
        <Table
          headers={["Aspecto", "Recomendación"]}
          rows={[
            [
              "Umbral de plaquetas para neuroaxial",
              "Generalmente seguro con plaquetas > 70 000–80 000 /µL y recuento estable, sin coagulopatía ni antiagregación/anticoagulación",
            ],
            [
              "Coagulación",
              "Descartar coagulopatía (HELLP, CID); valorar plaquetas y tendencia, no un único valor",
            ],
            [
              "Técnica preferida",
              "Neuroaxial (epidural/espinal/CSE) para parto y cesárea si no hay contraindicación",
            ],
            [
              "Sobrecarga de volumen",
              "Precaución: riesgo de edema pulmonar; evitar precarga agresiva de fluidos",
            ],
            [
              "Anestesia general",
              "Reservada a coagulopatía, trombocitopenia < umbral, eclampsia no controlada o urgencia sin tiempo para neuroaxial",
            ],
          ]}
        />
        <Src>
          ACOG PB 222, 2020. · Chestnut&apos;s Obstetric Anesthesia, 6.ª ed. — Hypertensive Disorders.
          · SOAP consensus / práctica obstétrica aceptada (umbral plaquetario 70–80 ×10⁹/L).
        </Src>
        <Callout variant="danger">
          <b>Respuesta hipertensiva a la laringoscopia.</b> Si se requiere anestesia general, la
          laringoscopia y la intubación provocan picos hipertensivos que pueden desencadenar{" "}
          <b>hemorragia intracraneal</b> y edema pulmonar. Atenuar el reflejo con opioide de acción
          corta (p. ej. remifentanilo o fentanilo), y/o labetalol IV, antes de la inducción. Prever{" "}
          <b>vía aérea difícil</b> por edema de la vía aérea (usar tubo de menor calibre) y considerar
          la reaparición del pico tensional en la <b>extubación</b>.
        </Callout>
        <Callout variant="warn">
          <b>Interacción con el sulfato de magnesio:</b> el magnesio <b>potencia y prolonga</b> el
          bloqueo neuromuscular (despolarizante y no despolarizante). Reducir/titular las dosis de
          relajante, monitorizar con TOF y confirmar la reversión antes de extubar. El magnesio
          también atenúa la respuesta hipertensiva y puede aumentar la sensibilidad a hipotensores.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Resumen de dosis y umbrales clave">
        <Table
          headers={["Parámetro", "Valor", "Fuente"]}
          accentCol={1}
          rows={[
            ["MgSO₄ carga", "4–6 g IV en 15–20 min", "ACOG PB 222"],
            ["MgSO₄ mantenimiento", "1–2 g/h IV", "ACOG PB 222"],
            ["MgSO₄ convulsión recurrente", "Bolo 2–4 g IV", "ACOG PB 222"],
            ["Rango terapéutico Mg", "4–7 mEq/L", "ACOG PB 222"],
            ["Antídoto toxicidad Mg", "Gluconato de calcio 1 g IV lento", "ACOG PB 222"],
            ["HTA severa: umbral de tratar", "≥ 160/110 mmHg", "ACOG CO 767"],
            ["Labetalol IV", "20 mg → 40 → 80 mg c/10 min", "ACOG CO 767"],
            ["Hidralazina IV", "5–10 mg IV, repetir c/20 min", "ACOG CO 767"],
            ["Nifedipino VO", "10 mg VO, repetir c/20–30 min", "ACOG CO 767"],
            ["Plaquetas para neuroaxial", "> 70 000–80 000 /µL, estable", "Chestnut / SOAP"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>American College of Obstetricians and Gynecologists. Gestational Hypertension and Preeclampsia. ACOG Practice Bulletin No. 222. Obstet Gynecol 2020;135(6):e237-e260.</li>
          <li>ACOG Committee Opinion No. 767. Emergent Therapy for Acute-Onset, Severe Hypertension During Pregnancy and the Postpartum Period. Obstet Gynecol 2019;133(2):e174-e180.</li>
          <li>National Institute for Health and Care Excellence (RCOG/NICE). Hypertension in pregnancy: diagnosis and management. NICE Guideline NG133, 2019.</li>
          <li>Magpie Trial Collaborative Group. Do women with pre-eclampsia, and their babies, benefit from magnesium sulphate? Lancet 2002;359(9321):1877-1890.</li>
          <li>Duley L, Gülmezoglu AM, Henderson-Smart DJ, Chou D. Magnesium sulphate and other anticonvulsants for women with pre-eclampsia. Cochrane Database Syst Rev 2010;(11):CD000025.</li>
          <li>Chestnut DH, et al. Chestnut&apos;s Obstetric Anesthesia: Principles and Practice, 6.ª ed. — Hypertensive Disorders.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y umbrales de literatura aceptada (ACOG PB 222 2020, ACOG CO 767 2019, RCOG/NICE)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// el magnesio previene la convulsión; no baja la presión — son dos ejes distintos"}
          <br />
          {"// gluconato de calcio siempre preparado a pie de cama mientras corra magnesio"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
