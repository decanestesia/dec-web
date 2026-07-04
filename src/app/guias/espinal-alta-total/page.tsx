import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — BLOQUEO ESPINAL ALTO / TOTAL
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: reconocimiento, dosis y secuencia de manejo
// tomados de literatura aceptada (Miller's Anesthesia, guías de
// neuroaxial). Cada tabla/callout cita su fuente (Vancouver breve).
// NO inventar dosis.
// Fuentes primarias:
//  - Gropper MA, et al. Miller's Anesthesia, 9.ª ed. — Spinal,
//    Epidural, and Caudal Anesthesia (complicaciones: bloqueo
//    espinal alto/total, colapso cardiovascular, apnea).
//  - Neal JM, et al. ASRA Practice Advisory on Local Anesthetic
//    Systemic Toxicity (soporte hemodinámico/vía aérea aplicable).
//  - Butterworth JF, et al. Morgan & Mikhail's Clinical
//    Anesthesiology, 6.ª ed. — Neuraxial Anesthesia.
// ============================================================

export const metadata: Metadata = {
  title: "Bloqueo espinal alto / total — reconocimiento y manejo · DEC",
  description:
    "Referencia perioperatoria del bloqueo espinal alto y total: reconocimiento (hipotensión, bradicardia, disnea, debilidad de MMSS, disfagia, apnea, pérdida de conciencia), manejo ABC con soporte de vía aérea e intubación si apnea, O2 100%, fluidos y vasopresores (efedrina, fenilefrina, adrenalina 10–100 mcg si severo), atropina 0.5–1 mg para bradicardia, posición, sedación/amnesia si intubado consciente y soporte hasta la regresión del bloqueo. Prevención (dosis, posición, barbotage). Miller's Anesthesia.",
  openGraph: {
    title: "Bloqueo espinal alto / total — reconocimiento y manejo · DEC",
    description:
      "Reconocimiento, ABC, vasopresores (efedrina, fenilefrina, adrenalina), atropina, posición y soporte hasta la regresión del bloqueo. Miller's Anesthesia.",
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
export default function EspinalAltaTotalPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat espinal-alta-total.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Bloqueo espinal alto / total
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          reconocimiento · ABC · vía aérea/apnea · vasopresores · atropina · posición · soporte hasta regresión
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// el anestésico sube; tú también, a asegurar la vía aérea antes de que deje de respirar"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">EMERGENCIA</span>
          <span className="tag tag-muted">Miller 9.ª ed.</span>
          <span className="tag tag-muted">Neuroaxial</span>
          <span className="tag tag-muted">Morgan &amp; Mikhail</span>
        </div>
      </header>

      <Callout variant="danger">
        <b>Es una emergencia de vía aérea y hemodinámica.</b> El bloqueo espinal alto/total ocurre
        cuando el anestésico neuroaxial (espinal o epidural) asciende demasiado, bloqueando fibras
        torácicas altas y cervicales. El manejo es <b>ABC inmediato</b>: soporte de la vía aérea y la
        ventilación (<b>intubar si apnea</b>), O₂ 100%, fluidos y vasopresores para la hipotensión, y{" "}
        <b>atropina</b> para la bradicardia. El tratamiento es de soporte hasta que el bloqueo regrese;
        no hay antídoto.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Qué es y por qué ocurre">
        <P>
          Un <b>bloqueo espinal alto</b> es una diseminación cefálica excesiva del anestésico local
          neuroaxial que alcanza dermatomas torácicos altos/cervicales; el <b>bloqueo espinal total</b>{" "}
          es la extensión al tronco encefálico, con apnea, pérdida de conciencia y colapso
          cardiovascular. Puede complicar tanto una anestesia espinal como una epidural (por dosis
          excesiva o por <b>inyección subaracnoidea inadvertida</b> de una dosis epidural).
        </P>
        <Table
          headers={["Factor", "Mecanismo"]}
          rows={[
            ["Dosis / volumen excesivo", "Masa de anestésico local mayor de la necesaria para el nivel deseado."],
            ["Inyección subaracnoidea inadvertida", "Dosis epidural (o de refuerzo) administrada al espacio subaracnoideo tras punción dural no reconocida."],
            ["Inyección subdural", "Diseminación amplia e impredecible de una dosis relativamente pequeña; inicio a veces tardío."],
            ["Posición / baricidad", "Interacción de baricidad de la solución, posición del paciente y barbotage tras la inyección."],
            ["Factores del paciente", "Baja estatura, obesidad, embarazo, aumento de presión intraabdominal (↓ volumen del LCR)."],
          ]}
        />
        <Src>
          Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — Spinal, Epidural, and Caudal Anesthesia. ·
          Butterworth JF, et al. Morgan &amp; Mikhail&apos;s Clinical Anesthesiology, 6.ª ed.
        </Src>
        <Callout variant="warn">
          Ante una epidural, una <b>dosis de prueba</b> y el <b>fraccionamiento de la dosis</b> reducen
          el riesgo de bloqueo total por inyección subaracnoidea o intravascular inadvertida. La
          diseminación <b>subdural</b> puede tener inicio más lento (10–20 min) y presentación atípica:
          sospecharla ante un bloqueo desproporcionadamente extenso para la dosis administrada.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Reconocimiento — signos por nivel ascendente">
        <P>
          El cuadro <b>progresa en sentido cefálico</b>: los síntomas escalan conforme el bloqueo sube.
          Reconocerlo temprano (disnea, debilidad de manos/brazos, dificultad para hablar o deglutir)
          permite asegurar la vía aérea <b>antes</b> de la apnea y el colapso.
        </P>
        <Table
          headers={["Nivel", "Manifestaciones"]}
          accentCol={0}
          rows={[
            [
              "Torácico (simpático)",
              "Hipotensión por vasodilatación/bloqueo simpático; náusea; posible bradicardia si supera T4 (fibras cardioaceleradoras T1–T4).",
            ],
            [
              "Torácico alto",
              "Disnea y sensación de opresión torácica (parálisis de músculos intercostales); tos débil; ansiedad.",
            ],
            [
              "Cervical (C6–C8 → C3–C5)",
              "Debilidad/hormigueo de manos y brazos (MMSS); voz débil; a nervio frénico (C3–C5): parálisis diafragmática → apnea.",
            ],
            [
              "Bulbar / espinal total",
              "Dificultad para hablar y deglutir; midriasis; apnea; pérdida de conciencia; colapso cardiovascular / bradicardia extrema o paro.",
            ],
          ]}
        />
        <Src>
          Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. · Butterworth JF, et al. Morgan &amp;
          Mikhail&apos;s Clinical Anesthesiology, 6.ª ed.
        </Src>
        <Callout variant="info">
          Pistas clínicas útiles: <b>debilidad de manos/brazos</b> (nivel cervical bajo), <b>disnea con
          incapacidad de hablar en frases</b>, <b>dificultad para deglutir</b> y <b>bradicardia</b> con
          hipotensión progresiva. La <b>midriasis</b> y la pérdida de conciencia indican extensión
          bulbar (bloqueo total).
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Manejo inmediato — ABC">
        <P>
          Actuar en paralelo: <b>vía aérea/ventilación</b>, <b>circulación</b> y <b>pedir ayuda</b>. El
          soporte es la clave; el bloqueo se resuelve solo con el tiempo. Suspender cualquier
          administración adicional de anestésico local (detener la infusión epidural).
        </P>
        <Table
          headers={["Paso", "Acción"]}
          rows={[
            ["1 · Pedir ayuda / detener AL", "Solicitar apoyo y carro de paro; suspender toda dosis/infusión de anestésico local en curso."],
            ["2 · A — Vía aérea", "O₂ 100%; asegurar la vía aérea; intubar (IOT con secuencia rápida) si hay apnea o incapacidad de proteger la vía aérea."],
            ["3 · B — Ventilación", "Ventilar con presión positiva ante hipoventilación por parálisis intercostal/diafragmática; capnografía."],
            ["4 · C — Circulación", "Fluidos IV en bolo + vasopresores para la hipotensión (ver §4); atropina para la bradicardia (ver §4)."],
            ["5 · Posición", "Ajustar posición según hemodinámica y nivel (ver §5); evitar Trendelenburg extremo si el bloqueo ya ascendió."],
            ["6 · Sedación / amnesia", "Si el paciente está consciente e intubado, sedar y garantizar amnesia hasta la recuperación."],
            ["7 · Soporte y monitorización", "Continuar soporte ventilatorio y hemodinámico hasta la regresión del bloqueo; vigilar en área monitorizada."],
          ]}
        />
        <Src>
          Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — manejo del bloqueo espinal alto/total. ·
          Butterworth JF, et al. Morgan &amp; Mikhail&apos;s, 6.ª ed.
        </Src>
        <Callout variant="danger">
          <b>La vía aérea es la prioridad.</b> La apnea del bloqueo total mata antes que la hipotensión.
          Ante disnea progresiva, debilidad de brazos o incapacidad de hablar, <b>no esperar</b> a la
          apnea establecida: preoxigenar e <b>intubar</b> de forma controlada. Si hay pérdida de
          conciencia y paro, iniciar RCP con protocolo ACLS (adrenalina dosis de paro 1 mg IV c/3–5 min).
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Soporte hemodinámico — dosis">
        <P>
          La hipotensión es por <b>bloqueo simpático</b> (vasodilatación ± bradicardia si supera T4, por
          bloqueo de las fibras cardioaceleradoras T1–T4). Tratar con <b>fluidos + vasopresor</b> y
          corregir la bradicardia con <b>atropina</b>. Escalar a <b>adrenalina</b> si la hipotensión o
          la bradicardia son severas o refractarias.
        </P>
        <Table
          headers={["Intervención", "Dosis", "Uso"]}
          accentCol={1}
          rows={[
            [
              "Cristaloide IV",
              "Bolo rápido (p. ej. 10–20 mL/kg), repetir según respuesta",
              "Corrige la hipovolemia relativa por vasodilatación simpática.",
            ],
            [
              "Efedrina",
              "5–10 mg IV en bolo, repetir según respuesta",
              "Vasopresor mixto (α/β); útil con hipotensión + bradicardia (aumenta FC).",
            ],
            [
              "Fenilefrina",
              "50–100 mcg IV en bolo, repetir; o infusión titulada",
              "α-agonista puro; hipotensión con FC conservada o taquicardia (puede acentuar bradicardia refleja).",
            ],
            [
              "Atropina",
              "0.5–1 mg IV",
              "Bradicardia por bloqueo simpático cardíaco (T1–T4); repetir según respuesta.",
            ],
            [
              "Adrenalina",
              "10–100 mcg IV en bolo si hipotensión/bradicardia severa",
              "Escalada ante colapso refractario; titular por respuesta. Dosis de paro 1 mg IV si RCP.",
            ],
          ]}
        />
        <Src>
          Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — soporte hemodinámico del bloqueo
          simpático alto. · Butterworth JF, et al. Morgan &amp; Mikhail&apos;s, 6.ª ed.
        </Src>
        <Callout variant="warn">
          <b>Bradicardia y paro por bloqueo alto.</b> Un bloqueo por encima de T4 abole las fibras
          cardioaceleradoras: la bradicardia puede ser <b>profunda y brusca</b> y progresar a asistolia.
          Tratar la bradicardia sintomática de forma <b>agresiva y temprana</b> con{" "}
          <b>atropina 0.5–1 mg IV</b> y no dudar en escalar a <b>adrenalina</b> (10–100 mcg IV) si no
          responde. La fenilefrina, como α puro, puede empeorar la bradicardia refleja.
        </Callout>
        <Callout variant="ok">
          <b>Elección del vasopresor.</b> Con hipotensión + bradicardia, la <b>efedrina 5–10 mg IV</b>{" "}
          (o adrenalina si severo) es preferible por su efecto cronotrópico. Con FC conservada, la{" "}
          <b>fenilefrina 50–100 mcg IV</b> es razonable. Reevaluar tras cada bolo y titular.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Posición y sedación">
        <P>
          La posición se ajusta a dos objetivos que pueden entrar en conflicto: <b>sostener la
          precarga/PA</b> y <b>no favorecer más ascenso</b> del anestésico. Una vez el paciente está
          consciente e intubado, garantizar <b>sedación y amnesia</b>.
        </P>
        <Table
          headers={["Aspecto", "Conducta"]}
          rows={[
            [
              "Trendelenburg",
              "El Trendelenburg extremo puede favorecer más ascenso cefálico si el bloqueo aún progresa: evitarlo una vez ha ascendido. Su papel es controvertido; individualizar.",
            ],
            [
              "Elevar la cabecera",
              "Elevar la cabecera para limitar el ascenso es de utilidad controvertida y puede comprometer la perfusión cerebral en hipotensión: no a costa de la PA.",
            ],
            [
              "Prioridad hemodinámica",
              "Si predomina la hipotensión, priorizar la precarga (piernas elevadas / decúbito) y los vasopresores sobre la posición.",
            ],
            [
              "Sedación / amnesia",
              "Si el paciente está consciente e intubado, administrar sedación y asegurar amnesia hasta que el bloqueo regrese.",
            ],
          ]}
        />
        <Src>
          Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. · Butterworth JF, et al. Morgan &amp;
          Mikhail&apos;s, 6.ª ed.
        </Src>
        <Callout variant="info">
          El manejo posicional es <b>controvertido</b> y secundario al ABC: ninguna maniobra de posición
          sustituye a asegurar la vía aérea, ventilar y sostener la hemodinámica. El bloqueo regresa por
          sí solo conforme el anestésico local se redistribuye y metaboliza.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Prevención">
        <P>
          La mejor gestión del bloqueo total es <b>no provocarlo</b>: dosis adecuada al objetivo, técnica
          cuidadosa en la epidural (dosis de prueba, fraccionamiento) y atención a la posición y la
          baricidad tras la inyección.
        </P>
        <Table
          headers={["Medida", "Detalle"]}
          rows={[
            [
              "Dosis apropiada",
              "Elegir la masa mínima de anestésico local para el nivel deseado; considerar factores del paciente (talla baja, obesidad, embarazo).",
            ],
            [
              "Dosis de prueba (epidural)",
              "Descartar catéter subaracnoideo/intravascular antes de la dosis completa.",
            ],
            [
              "Fraccionar la dosis",
              "Administrar la dosis epidural en alícuotas, reevaluando entre incrementos (evita el bloqueo total por inyección subaracnoidea no reconocida).",
            ],
            [
              "Posición",
              "Controlar la posición del paciente tras la inyección según baricidad de la solución para dirigir el nivel deseado.",
            ],
            [
              "Barbotage",
              "El barbotage (aspiración/reinyección repetida de LCR) aumenta la diseminación: usar con cautela — puede elevar el nivel de forma impredecible.",
            ],
          ]}
        />
        <Src>
          Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — prevención de la diseminación excesiva. ·
          Butterworth JF, et al. Morgan &amp; Mikhail&apos;s, 6.ª ed.
        </Src>
        <Callout variant="warn">
          El <b>barbotage</b> y las inyecciones rápidas o repetidas aumentan la mezcla con el LCR y la
          diseminación cefálica: son un factor de bloqueo más alto de lo previsto. Inyectar de forma
          controlada y reevaluar el nivel.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Resumen de dosis clave">
        <Table
          headers={["Parámetro", "Dosis", "Fuente"]}
          accentCol={1}
          rows={[
            ["O₂ / vía aérea", "FiO₂ 100%; intubar si apnea", "Miller"],
            ["Cristaloide", "Bolo rápido (10–20 mL/kg), repetir", "Miller"],
            ["Efedrina", "5–10 mg IV bolo, repetir", "Miller / Morgan"],
            ["Fenilefrina", "50–100 mcg IV bolo / infusión", "Miller / Morgan"],
            ["Atropina (bradicardia)", "0.5–1 mg IV", "Miller / Morgan"],
            ["Adrenalina (severo)", "10–100 mcg IV bolo, titular", "Miller"],
            ["Adrenalina (paro / ACLS)", "1 mg IV c/3–5 min", "ACLS"],
            ["Sedación / amnesia", "Si consciente e intubado", "Miller"],
            ["Soporte", "Hasta la regresión del bloqueo", "Miller"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Gropper MA, Cohen NH, Eriksson LI, et al. Miller&apos;s Anesthesia, 9.ª ed. Philadelphia: Elsevier; 2020 — Spinal, Epidural, and Caudal Anesthesia (complicaciones: bloqueo espinal alto/total, colapso cardiovascular, apnea).</li>
          <li>Butterworth JF, Mackey DC, Wasnick JD. Morgan &amp; Mikhail&apos;s Clinical Anesthesiology, 6.ª ed. New York: McGraw-Hill; 2018 — Spinal, Epidural, &amp; Caudal Blocks.</li>
          <li>Neal JM, Barrington MJ, Fettiplace MR, et al. The Third American Society of Regional Anesthesia and Pain Medicine Practice Advisory on Local Anesthetic Systemic Toxicity. Reg Anesth Pain Med 2018;43(2):113-123 (soporte de vía aérea/hemodinámico aplicable al colapso neuroaxial).</li>
          <li>Hocking G, Wildsmith JAW. Intrathecal drug spread. Br J Anaesth 2004;93(4):568-578 (factores de diseminación: baricidad, posición, barbotage).</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y manejo de literatura aceptada (Miller's Anesthesia 9.ª ed · Morgan & Mikhail 6.ª ed)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// no hay antídoto: es soporte de vía aérea y hemodinámica hasta que el bloqueo regrese"}
          <br />
          {"// si duda entre esperar o intubar ante disnea que asciende: ya tiene la respuesta"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
