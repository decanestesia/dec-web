import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Algoritmo de vía aérea — KOBI (Ketamine-Only Breathing Intubation)
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: dosis y umbrales de literatura aceptada.
// Cada dosis/paso lleva referencia (Vancouver breve). NO inventar cifras.
// Fuentes primarias:
//  - Merelman AH, Perlmutter MC, Strayer RJ. Alternatives to
//    Rapid Sequence Intubation: Contemporary Airway Management with
//    Ketamine. West J Emerg Med 2019;20(3):466-471.
//  - Driver BE, Prekker ME, et al. (contexto DSI/ketamina, vía aérea
//    de urgencias). Ann Emerg Med / Acad Emerg Med.
//  - Weingart SD, Levitan RM. Preoxygenation and Prevention of
//    Desaturation During Emergency Airway Management. Ann Emerg Med
//    2012;59(3):165-175.
//  - Miller's Anesthesia (awake/spontaneous ventilation airway).
//  - Stoelting's Pharmacology (ketamina: disociación, drive respiratorio).
//  - Frerk C, et al. DAS 2015 guidelines for management of unanticipated
//    difficult intubation in adults. Br J Anaesth 2015;115(6):827-848.
// ============================================================

export const metadata: Metadata = {
  title:
    "KOBI — Intubación con ketamina en ventilación espontánea · Algoritmo · DEC",
  description:
    "Algoritmo KOBI (Ketamine-Only Breathing Intubation): intubación manteniendo ventilación espontánea con ketamina disociativa (1–2 mg/kg IV titulada), sin relajante, en vía aérea difícil o fisiológicamente inestable donde la apnea es peligrosa. Pasos, dosis exactas, comparación con AFOI y DSI, precauciones (laringoespasmo, secreciones, antisialagogo). Merelman/Driver, DAS 2015.",
  openGraph: {
    title: "KOBI — Intubación con ketamina en ventilación espontánea · DEC",
    description:
      "Ketamina disociativa titulada, ventilación espontánea preservada, laringoscopia/videolaringoscopia sin apnea. Comparación con AFOI y DSI. Precauciones y dosis exactas.",
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

// Paso numerado del algoritmo
function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="panel"
      style={{ marginBottom: "0.85rem", borderLeft: "3px solid var(--border-hi)" }}
    >
      <div className="panel-body" style={{ display: "flex", gap: "0.75rem" }}>
        <span
          className="mono"
          style={{
            color: "var(--accent)",
            fontSize: "0.9rem",
            fontWeight: 700,
            flexShrink: 0,
            minWidth: "1.4rem",
          }}
        >
          {String(n).padStart(2, "0")}
        </span>
        <div>
          <div
            style={{
              color: "var(--text-0)",
              fontSize: "0.85rem",
              fontWeight: 700,
              marginBottom: "0.3rem",
            }}
          >
            {title}
          </div>
          <div
            style={{ color: "var(--text-1)", fontSize: "0.8rem", lineHeight: 1.65 }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Página (Server Component — referencia estática)
// ------------------------------------------------------------
export default function KobiPage() {
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
          <b>$</b> cat kobi.md
        </div>
        <h1
          style={{
            fontSize: "1.7rem",
            fontWeight: 800,
            lineHeight: 1.2,
            color: "var(--text-0)",
          }}
        >
          Intubación con ketamina en ventilación espontánea (KOBI)
        </h1>
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.66rem",
            marginTop: "0.4rem",
            lineHeight: 1.7,
          }}
        >
          ketamine-only breathing intubation · ventilación espontánea · sin relajante
          · vía aérea difícil / fisiológicamente inestable
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// cuando la apnea no es una opción, dejas al paciente respirando y solo apagas la película"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">ALGORITMO</span>
          <span className="tag tag-muted">VÍA AÉREA</span>
          <span className="tag tag-muted">Merelman 2019</span>
          <span className="tag tag-muted">DAS 2015</span>
        </div>
      </header>

      <Callout variant="info">
        <b>KOBI</b> (Ketamine-Only Breathing Intubation) es una técnica de intubación
        que <b>preserva la ventilación espontánea</b>: se administra únicamente
        ketamina a dosis disociativa —<b>sin bloqueante neuromuscular</b>— para que el
        paciente siga respirando mientras se realiza la laringoscopia o
        videolaringoscopia. Su objetivo es evitar el periodo de apnea de la secuencia
        rápida (RSI) en pacientes en quienes la apnea es peligrosa: vía aérea difícil
        anatómica y, sobre todo, la vía aérea <b>fisiológicamente difícil</b>
        (hipoxemia refractaria, shock, acidosis grave) donde no hay reserva para
        desaturar.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Concepto y racional fisiológico">
        <P>
          En la RSI clásica se induce apnea (relajante + inductor) y se cuenta con la
          preoxigenación para tolerar la laringoscopia. Ese periodo de apnea es
          mortal cuando el paciente <b>no puede almacenar reserva de O₂</b>
          (shunt, hipoxemia refractaria) o cuando la caída de la ventilación
          descompensa una acidosis metabólica grave que dependía de la hiperventilación
          compensatoria. KOBI elimina la apnea: el paciente sigue respirando y su propio
          drive mantiene oxigenación y depuración de CO₂ mientras se instrumenta la vía
          aérea.
        </P>
        <P>
          La <b>ketamina</b> es el fármaco central porque a dosis disociativa produce
          un estado de anestesia con <b>preservación del drive respiratorio, del tono
          de vía aérea superior y de los reflejos protectores</b>, con estabilidad
          hemodinámica relativa (liberación simpática). Permite laringoscopia con el
          paciente inmóvil pero respirando.
        </P>
        <Callout variant="ok">
          Idea rectora: <b>disociar sin paralizar ni apneizar</b>. Se apaga la
          conciencia y la respuesta a la laringoscopia, pero se conserva el motor
          respiratorio. La ventilación espontánea es tu red de seguridad si la
          intubación falla o se prolonga.
        </Callout>
        <Src>
          Merelman AH, Perlmutter MC, Strayer RJ. West J Emerg Med 2019;20(3):466-471. ·
          Stoelting&apos;s Pharmacology &amp; Physiology in Anesthetic Practice (ketamina).
        </Src>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Indicaciones y contraindicaciones">
        <Table
          headers={["Indicaciones", "Contraindicaciones / cautela"]}
          rows={[
            [
              "Vía aérea fisiológicamente difícil: hipoxemia refractaria, shock, acidosis metabólica grave dependiente de hiperventilación",
              "Necesidad de vía aérea inmediata en apnea/paro (aquí va RSI o cricotirotomía, no KOBI)",
            ],
            [
              "Vía aérea anatómicamente difícil prevista donde interesa mantener respiración espontánea",
              "Estómago lleno con alto riesgo de aspiración activa (sopesar: KOBI conserva reflejos, pero no protege como un tubo)",
            ],
            [
              "Reserva de O₂ escasa (no tolera el periodo de apnea de la RSI)",
              "Alergia conocida a ketamina",
            ],
            [
              "Preferencia por preservar el drive como plan de rescate si falla la laringoscopia",
              "Laringoespasmo/secreciones abundantes no controlados (preparar antisialagogo y succión)",
            ],
          ]}
        />
        <Src>Merelman AH, et al. West J Emerg Med 2019;20(3):466-471.</Src>
        <Callout variant="warn">
          KOBI <b>no es</b> una técnica para la vía aérea del paciente en apnea o en
          paro: eso requiere manejo inmediato (RSI / rescate quirúrgico). KOBI es para
          quien <b>todavía respira</b> y en quien quieres que siga respirando durante la
          intubación.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Dosis de ketamina (obligatorias y exactas)">
        <P>
          La ketamina se administra a <b>dosis disociativa</b> por vía IV, titulada al
          efecto para alcanzar la disociación conservando la ventilación espontánea. La
          titulación por incrementos permite ajustar sin sobrepasar hacia la apnea.
        </P>
        <Table
          headers={["Parámetro", "Dosis", "Nota"]}
          accentCol={1}
          rows={[
            [
              "Dosis disociativa IV",
              "1–2 mg/kg IV",
              "Rango disociativo estándar; produce disociación con preservación del drive respiratorio",
            ],
            [
              "Titulación por incrementos",
              "Bolos de ≈ 0.5 mg/kg IV",
              "Repetir cada 1–2 min hasta disociación adecuada, vigilando ventilación",
            ],
            [
              "Vía intramuscular (sin acceso IV)",
              "4 mg/kg IM (hasta 5)",
              "Referencia disociativa IM 4 mg/kg (Merelman 2019); inicio más lento, reservar para cuando no hay acceso venoso",
            ],
            [
              "Mantenimiento (si se prolonga)",
              "Repetir 0.5–1 mg/kg IV según respuesta",
              "Redosificar para mantener disociación durante la instrumentación",
            ],
          ]}
        />
        <Src>
          Merelman AH, Perlmutter MC, Strayer RJ. West J Emerg Med 2019;20(3):466-471. ·
          Stoelting&apos;s Pharmacology &amp; Physiology in Anesthetic Practice.
        </Src>
        <Callout variant="info">
          <b>Titular, no empujar todo de golpe.</b> Administrar en incrementos y
          reevaluar la ventilación entre bolos protege el objetivo de la técnica:
          disociación sin apnea. Una dosis única muy rápida y alta puede inducir apnea
          transitoria y perder la ventaja de KOBI.
        </Callout>
        <Callout variant="warn">
          Dosis disociativas dan <b>nistagmo, sialorrea y, ocasionalmente, apnea
          transitoria</b> tras bolos rápidos. Preparar succión, antisialagogo y estar
          listo para ventilar con bolsa-mascarilla si aparece hipoventilación.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Secuencia de ejecución (pasos)">
        <Step n={1} title="Selección del paciente y decisión">
          Confirmar que es un candidato a KOBI: paciente que respira, con vía aérea
          difícil (anatómica o fisiológica) y en quien la apnea de la RSI es peligrosa.
          Descartar apnea/paro inminente. Definir plan de rescate (RSI de conversión,
          dispositivo supraglótico, cricotirotomía).
        </Step>
        <Step n={2} title="Preparación (SOAP-ME) y antisialagogo">
          Succión doble, oxígeno, equipo de vía aérea (videolaringoscopio preferente),
          fármacos, monitorización (SpO₂, capnografía, ECG, TA), personal y plan.
          Considerar <b>antisialagogo</b> (p. ej. glicopirrolato 0.2 mg IV o atropina)
          para reducir secreciones y el riesgo de laringoespasmo.
        </Step>
        <Step n={3} title="Preoxigenación con el paciente respirando">
          Optimizar la oxigenación de reserva y apneica: O₂ de alto flujo /
          mascarilla con reservorio, cánula nasal de apoyo, posición
          semisentada/rampa. Aprovechar que el paciente ventila para desnitrogenar.
        </Step>
        <Step n={4} title="Ketamina disociativa titulada">
          Administrar ketamina <b>1–2 mg/kg IV</b>, preferiblemente en incrementos de
          ≈ 0.5 mg/kg cada 1–2 min hasta lograr disociación, <b>sin</b> bloqueante
          neuromuscular. Vigilar que la ventilación espontánea se mantiene.
        </Step>
        <Step n={5} title="Laringoscopia / videolaringoscopia con el paciente respirando">
          Realizar la laringoscopia (videolaringoscopia preferente por mejor visión y
          menor manipulación) manteniendo al paciente en ventilación espontánea.
          Anestesia tópica de vía aérea opcional para atenuar reflejos y laringoespasmo.
        </Step>
        <Step n={6} title="Intubación y confirmación">
          Pasar el tubo aprovechando la movilidad de las cuerdas con la respiración.
          Confirmar posición con <b>capnografía</b> (onset de EtCO₂), auscultación y,
          si procede, ecografía. Fijar el tubo.
        </Step>
        <Step n={7} title="Post-intubación">
          Sedación/analgesia de mantenimiento; considerar bloqueante neuromuscular ya
          con la vía aérea asegurada si se requiere para ventilación mecánica.
          Reevaluar hemodinámica y ventilación.
        </Step>
        <Callout variant="danger">
          Si aparece <b>laringoespasmo</b> u obstrucción: presión positiva con
          bolsa-mascarilla y maniobra de Larson (presión en la escotadura de
          laringoespasmo), profundizar; si es refractario y hay hipoxemia progresiva,
          convertir a RSI con succinilcolina (1–1.5 mg/kg IV) o rescate según algoritmo.
        </Callout>
        <Src>
          Weingart SD, Levitan RM. Ann Emerg Med 2012;59(3):165-175 (preoxigenación). ·
          Frerk C, et al. DAS 2015. Br J Anaesth 2015;115(6):827-848.
        </Src>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="KOBI vs. AFOI vs. DSI">
        <P>
          KOBI comparte con la intubación con fibrobroncoscopio despierto (AFOI) y con
          la delayed sequence intubation (DSI) el principio de <b>no apneizar de entrada</b>,
          pero difiere en profundidad, herramienta y objetivo.
        </P>
        <Table
          headers={["Rasgo", "KOBI", "AFOI (fibro despierto)", "DSI"]}
          rows={[
            [
              "Estado del paciente",
              "Disociado con ketamina, respirando",
              "Despierto/coopera, sedación ligera, respirando",
              "Sedado con ketamina para preoxigenar; luego RSI",
            ],
            [
              "Fármaco clave",
              "Ketamina 1–2 mg/kg IV, sin relajante",
              "Sedación titulada + anestesia tópica de vía aérea",
              "Ketamina como sedante de procedimiento (preoxigenación)",
            ],
            [
              "Relajante neuromuscular",
              "No (se preserva el drive)",
              "No",
              "Sí, después (tras optimizar la oxigenación)",
            ],
            [
              "Herramienta",
              "Laringoscopia / videolaringoscopia directa",
              "Fibrobroncoscopio flexible",
              "Laringoscopia/VL tras la fase de preoxigenación",
            ],
            [
              "Objetivo principal",
              "Intubar sin apnea, con drive como red de seguridad",
              "Vía aérea difícil anatómica prevista, paciente colabora",
              "Ganar preoxigenación en el agitado/no cooperador",
            ],
            [
              "Apnea planificada",
              "No",
              "No",
              "Sí, breve, tras optimizar SpO₂",
            ],
          ]}
        />
        <Src>
          Merelman AH, et al. West J Emerg Med 2019;20(3):466-471 (alternativas a RSI:
          KOBI, DSI). · Weingart SD, et al. (DSI). Ann Emerg Med 2015;65(4):349-355.
        </Src>
        <Callout variant="info">
          Diferencia clave con <b>DSI</b>: en DSI la ketamina se usa para{" "}
          <b>preoxigenar</b> al paciente no cooperador y luego se procede a una RSI
          convencional (con apnea). En <b>KOBI</b> no hay fase de apnea planificada ni
          relajante: se intuba directamente con el paciente disociado y respirando.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Precauciones y complicaciones">
        <Table
          headers={["Riesgo", "Prevención / manejo"]}
          rows={[
            [
              "Laringoespasmo",
              "Antisialagogo previo, anestesia tópica de vía aérea, evitar estimular con planos superficiales; tratar con presión positiva, maniobra de Larson y profundizar. Succinilcolina si refractario.",
            ],
            [
              "Secreciones / sialorrea",
              "Glicopirrolato 0.2 mg IV (o atropina) como antisialagogo; succión preparada y en uso.",
            ],
            [
              "Apnea / hipoventilación transitoria",
              "Titular en incrementos; monitorizar con capnografía; ventilar con bolsa-mascarilla si aparece.",
            ],
            [
              "Emergencia disociativa",
              "Ambiente tranquilo; benzodiacepina si es preciso (mejor tras asegurar vía aérea).",
            ],
            [
              "Hipertensión / taquicardia",
              "Simpaticomimético por liberación de catecolaminas; suele ser bien tolerado, útil en shock.",
            ],
            [
              "Aspiración",
              "KOBI conserva reflejos pero no protege como un tubo; succión lista, considerar riesgo en estómago lleno.",
            ],
          ]}
        />
        <Src>
          Merelman AH, et al. West J Emerg Med 2019;20(3):466-471. ·
          Miller&apos;s Anesthesia (manejo de vía aérea con ventilación espontánea).
        </Src>
        <Callout variant="warn">
          El <b>antisialagogo</b> (glicopirrolato o atropina) y la <b>succión
          preparada</b> son parte estructural de KOBI, no un extra: las secreciones y
          el laringoespasmo son las dos complicaciones que más frecuentemente sabotean
          la técnica.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Resumen de dosis clave">
        <Table
          headers={["Fármaco / paso", "Dosis", "Fuente"]}
          accentCol={1}
          rows={[
            ["Ketamina disociativa IV", "1–2 mg/kg IV", "Merelman 2019"],
            ["Titulación por incrementos", "≈ 0.5 mg/kg IV cada 1–2 min", "Merelman 2019"],
            ["Ketamina IM (sin IV)", "4 mg/kg IM (hasta 5)", "Merelman 2019 / Stoelting"],
            ["Antisialagogo (glicopirrolato)", "0.2 mg IV", "Miller / práctica de vía aérea"],
            ["Succinilcolina (rescate a RSI)", "1–1.5 mg/kg IV", "DAS 2015 / Miller"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Referencias">
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
            Merelman AH, Perlmutter MC, Strayer RJ. Alternatives to Rapid Sequence
            Intubation: Contemporary Airway Management with Ketamine. West J Emerg Med
            2019;20(3):466-471.
          </li>
          <li>
            Weingart SD, Trueger NS, Wong N, et al. Delayed Sequence Intubation: A
            Prospective Observational Study. Ann Emerg Med 2015;65(4):349-355.
          </li>
          <li>
            Driver BE, Prekker ME, Klein LR, et al. Effect of Use of a Bougie vs
            Endotracheal Tube and Stylet on First-Attempt Intubation Success Among
            Patients With Difficult Airways Undergoing Emergency Intubation. JAMA
            2018;319(21):2179-2189. (contexto ketamina / vía aérea de urgencias).
          </li>
          <li>
            Weingart SD, Levitan RM. Preoxygenation and Prevention of Desaturation
            During Emergency Airway Management. Ann Emerg Med 2012;59(3):165-175.
          </li>
          <li>
            Frerk C, Mitchell VS, McNarry AF, et al. Difficult Airway Society 2015
            guidelines for management of unanticipated difficult intubation in adults.
            Br J Anaesth 2015;115(6):827-848.
          </li>
          <li>
            Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — Airway Management
            (ventilación espontánea / paciente despierto).
          </li>
          <li>
            Flood P, Rathmell JP, Shafer S. Stoelting&apos;s Pharmacology &amp;
            Physiology in Anesthetic Practice — Ketamine.
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
          {"// dosis y pasos de literatura aceptada (Merelman 2019 · DAS 2015 · Miller · Stoelting)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// KOBI conserva el drive: la ventilación espontánea es la red; ten siempre el plan B (RSI/quirúrgico) montado"}
          <br />
          {"// si el paciente deja de respirar, dejaste de hacer KOBI — actúa"}
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
