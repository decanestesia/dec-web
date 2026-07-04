import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — SEPSIS Y SHOCK SÉPTICO PERIOPERATORIO
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: dosis, umbrales y objetivos tomados de la
// Surviving Sepsis Campaign 2021 y literatura aceptada. Cada
// tabla/callout cita su fuente (Vancouver breve). NO inventar cifras.
// Fuentes primarias:
//  - Evans L, Rhodes A, Alhazzani W, et al. Surviving Sepsis
//    Campaign: International Guidelines for Management of Sepsis and
//    Septic Shock 2021. Crit Care Med 2021;49(11):e1063-e1143.
//  - Singer M, et al. The Third International Consensus Definitions
//    for Sepsis and Septic Shock (Sepsis-3). JAMA 2016;315(8):801-810.
//  - Annane D, et al. Hydrocortisone plus Fludrocortisone (APROCCHSS).
//    N Engl J Med 2018;378:809-818.
//  - Miller's Anesthesia, 9.ª ed. — Anesthesia for the Septic Patient.
// ============================================================

export const metadata: Metadata = {
  title: "Sepsis y shock séptico perioperatorio — Guía clínica · DEC",
  description:
    "Referencia perioperatoria de sepsis y shock séptico según Surviving Sepsis Campaign 2021: paquete de la 1.ª hora (lactato, hemocultivos, antibiótico precoz), cristaloides 30 mL/kg, vasopresores para PAM ≥ 65 (noradrenalina, vasopresina 0.03 U/min, adrenalina), reevaluación dinámica de fluidos, control del foco, hidrocortisona 200 mg/día y manejo anestésico del paciente séptico.",
  openGraph: {
    title: "Sepsis y shock séptico perioperatorio — Guía clínica · DEC",
    description:
      "Paquete de la 1.ª hora, objetivos hemodinámicos, vasopresores, corticoides y manejo anestésico del paciente séptico. Surviving Sepsis Campaign 2021.",
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
export default function SepsisPerioperatoriaPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat sepsis-perioperatoria.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Sepsis y shock séptico perioperatorio
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          paquete de la 1.ª hora · objetivos PAM ≥ 65 · vasopresores · corticoides · control del foco · manejo anestésico
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// en sepsis el reloj es un vasopresor: cada hora de retraso pesa"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">REFERENCIA</span>
          <span className="tag tag-muted">SSC 2021</span>
          <span className="tag tag-muted">Sepsis-3</span>
          <span className="tag tag-muted">Miller</span>
        </div>
      </header>

      <Callout variant="info">
        <b>Definiciones (Sepsis-3).</b> <b>Sepsis</b> = disfunción orgánica potencialmente mortal por
        respuesta desregulada a la infección (↑ SOFA ≥ 2 puntos). <b>Shock séptico</b> = subgrupo con
        anomalías circulatorias y celulares/metabólicas profundas: necesidad de vasopresor para
        mantener PAM ≥ 65 mmHg <b>y</b> lactato &gt; 2 mmol/L pese a reanimación con volumen adecuada.
        La mortalidad hospitalaria del shock séptico supera el 40%.
      </Callout>
      <Src>Singer M, et al. Sepsis-3. JAMA 2016;315(8):801-810.</Src>

      {/* ========================================================= */}
      <Section n="01" title="Paquete de la 1.ª hora (Hour-1 Bundle)">
        <P>
          La Surviving Sepsis Campaign agrupa las intervenciones de reanimación inicial en un paquete
          que debe <b>iniciarse en la primera hora</b> desde el reconocimiento de la sepsis o shock
          séptico (tiempo cero = triaje en urgencias o, en el intraoperatorio, el momento de la
          sospecha clínica). No es un checklist secuencial: las medidas se ejecutan en paralelo.
        </P>
        <Table
          headers={["#", "Intervención", "Detalle"]}
          rows={[
            ["1", "Medir lactato", "Basal; repetir en 2–4 h si estaba elevado (> 2 mmol/L) para guiar la reanimación."],
            ["2", "Hemocultivos ANTES de antibióticos", "Al menos 2 sets, siempre que no retrase el antibiótico > 45 min."],
            ["3", "Antibiótico de amplio espectro", "IV precoz: idealmente en < 1 h en shock séptico y sepsis con shock probable."],
            ["4", "Cristaloides 30 mL/kg", "Si hipotensión o lactato ≥ 4 mmol/L. Iniciar en < 3 h; empezar de inmediato."],
            ["5", "Vasopresores", "Si la hipotensión persiste durante o tras el volumen, para PAM ≥ 65 mmHg."],
          ]}
        />
        <Src>Evans L, et al. Surviving Sepsis Campaign 2021. Crit Care Med 2021;49(11):e1063-e1143.</Src>
        <Callout variant="danger">
          <b>Antibiótico precoz.</b> En <b>shock séptico</b> (y sepsis con alta probabilidad de shock),
          administrar antimicrobiano de amplio espectro <b>en la primera hora</b>. Cada hora de retraso
          se asocia a mayor mortalidad. No demorar por conseguir todos los cultivos: extraer
          hemocultivos primero <b>solo si no retrasa</b> el antibiótico &gt; 45 min.
        </Callout>
        <Callout variant="warn">
          En sepsis <b>sin</b> shock y con probabilidad de infección incierta, la SSC 2021 permite una
          evaluación rápida (hasta 3 h) para decidir infección vs. no infección antes del antibiótico,
          buscando estrechar el uso empírico. La duda razonable no aplica al shock: ahí se trata ya.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Reanimación con fluidos">
        <P>
          Ante hipoperfusión inducida por sepsis, la SSC 2021 recomienda administrar al menos{" "}
          <b>30 mL/kg de cristaloide IV</b> en las primeras 3 horas (SSC 2021: recomendación débil,
          evidencia de baja certeza para la cifra exacta; se mantiene como umbral operativo). El
          cristaloide es el fluido de <b>primera línea</b>; se sugieren{" "}
          <b>cristaloides balanceados</b> (Ringer lactato, Plasma-Lyte) sobre suero salino 0.9% para
          reducir la carga de cloro.
        </P>
        <Table
          headers={["Parámetro", "Recomendación SSC 2021", "Nota"]}
          accentCol={1}
          rows={[
            ["Fluido de 1.ª línea", "Cristaloide", "Coloides sintéticos (almidones) contraindicados."],
            ["Tipo de cristaloide", "Balanceado > salino 0.9%", "Menos acidosis hiperclorémica y lesión renal."],
            ["Bolo inicial", "≥ 30 mL/kg en las 1.as 3 h", "Si hipotensión o lactato ≥ 4 mmol/L."],
            ["Albúmina", "Considerar si grandes volúmenes de cristaloide", "Sugerida como añadido, no de rutina."],
            ["Almidones (HES)", "NO usar", "Mayor lesión renal y mortalidad."],
          ]}
        />
        <Src>Evans L, et al. SSC 2021. Crit Care Med 2021;49(11):e1063-e1143. · SMART/SPLIT (balanceados).</Src>
        <Callout variant="warn">
          <b>Reevaluación dinámica, no estática.</b> Tras el bolo inicial, guiar la fluidoterapia con
          medidas <b>dinámicas</b> de respuesta a volumen —elevación pasiva de piernas, variación de
          presión de pulso (VPP) / volumen sistólico (VVS), respuesta del gasto a un bolo— en lugar de
          PVC o PAM aisladas. La SSC 2021 desaconseja usar PVC como objetivo único. Guiar la
          reanimación hacia el <b>aclaramiento / normalización del lactato</b> como criterio dinámico:
          remedir a las <b>2–4 h</b> y perseguir su descenso como meta terapéutica de perfusión, junto
          a una diuresis objetivo de <b>≥ 0.5 mL/kg/h</b>.
        </Callout>
        <Callout variant="danger">
          El 30 mL/kg es un <b>punto de partida</b>, no una meta que perseguir a ciegas. En
          cardiopatía, disfunción de VD o SDRA, sobre-reanimar empeora el desenlace. Tras la fase
          inicial, cada bolo adicional debe justificarse por respuesta demostrada a volumen.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Vasopresores y objetivo de PAM">
        <P>
          Si la hipotensión persiste durante o tras la reanimación con fluidos, iniciar vasopresor con
          objetivo de <b>PAM ≥ 65 mmHg</b>. La SSC 2021 recomienda <b>noradrenalina como agente de
          primera línea</b>. No sobre-objetivar la PAM: apuntar por encima de 65 mmHg no aporta
          beneficio y aumenta las arritmias.
        </P>
        <Table
          headers={["Línea", "Fármaco", "Dosis / uso"]}
          accentCol={2}
          rows={[
            [
              "1.ª línea",
              "Noradrenalina",
              "Iniciar en infusión (dosis orientativa de práctica ~0.05 µg/kg/min, no cifra de la SSC) y titular a PAM ≥ 65 mmHg. Agente vasopresor de elección.",
            ],
            [
              "Añadir 2.º",
              "Vasopresina",
              "Añadir 0.03 U/min IV (dosis fija, no titular al alza) cuando NA no logra la meta o para ahorrar catecolamina.",
            ],
            [
              "Añadir 3.º",
              "Adrenalina",
              "Añadir si PAM no se alcanza con NA + vasopresina (o en disfunción miocárdica).",
            ],
            [
              "Inotrópico",
              "Dobutamina",
              "Añadir (o adrenalina) si hipoperfusión persiste pese a volumen y PAM adecuada (disfunción miocárdica).",
            ],
          ]}
        />
        <Src>Evans L, et al. SSC 2021. Crit Care Med 2021;49(11):e1063-e1143.</Src>
        <Callout variant="info">
          <b>Objetivo de presión.</b> PAM inicial <b>≥ 65 mmHg</b>. Objetivos más altos (p. ej.
          80–85 mmHg) no mejoran la mortalidad global (ensayo SEPSISPAM) y aumentan la fibrilación
          auricular; individualizar solo en HTA crónica no controlada.
          <br />
          <span className="mono" style={{ fontSize: "0.62rem", color: "var(--text-3)" }}>
            Asfar P, et al. SEPSISPAM. N Engl J Med 2014;370:1583-1593.
          </span>
        </Callout>
        <Callout variant="ok">
          <b>Vía y arranque precoz.</b> La noradrenalina puede iniciarse por <b>vía periférica</b>{" "}
          (idealmente vena gruesa proximal, corto plazo) para no retrasar el soporte mientras se
          coloca acceso central. Iniciar el vasopresor <b>temprano</b>, incluso durante la reanimación
          con fluidos, si la PAM es muy baja, restaura la presión de perfusión antes.
        </Callout>
        <Callout variant="warn">
          <b>Dopamina: no.</b> La SSC 2021 recomienda <b>no usar dopamina</b> como vasopresor de
          primera línea (mayor riesgo de arritmias frente a noradrenalina). Tampoco fenilefrina de
          rutina salvo casos concretos (arritmia por NA, gasto alto con hipotensión).
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Corticoides en shock refractario">
        <P>
          En <b>shock séptico con requerimiento vasopresor persistente</b>, la SSC 2021 sugiere añadir
          <b> corticoides IV</b>. El régimen estándar es <b>hidrocortisona 200 mg/día</b>, típicamente
          50 mg IV cada 6 h o en infusión continua. El umbral operativo habitual: shock que persiste
          pese a fluidos y noradrenalina ≥ 0.25 µg/kg/min durante al menos 4 h.
        </P>
        <Table
          headers={["Aspecto", "Detalle"]}
          rows={[
            ["Indicación", "Shock séptico con vasopresor en curso pese a reanimación adecuada (shock refractario)."],
            ["Fármaco / dosis", "Hidrocortisona 200 mg/día IV — 50 mg c/6 h o infusión continua de 200 mg/24 h."],
            ["Umbral típico", "Noradrenalina ≥ 0.25 µg/kg/min (o equivalente) durante ≥ 4 h."],
            ["Retirada", "Suspender cuando ya no se precise vasopresor; no requiere descenso prolongado obligatorio."],
            ["Fludrocortisona", "Opcional (APROCCHSS usó 50 µg VO/día añadida); no imprescindible con hidrocortisona IV."],
          ]}
        />
        <Src>
          Evans L, et al. SSC 2021. Crit Care Med 2021;49(11):e1063-e1143. · Annane D, et al. APROCCHSS.
          N Engl J Med 2018;378:809-818. · Venkatesh B, et al. ADRENAL. N Engl J Med 2018;378:797-808.
        </Src>
        <Callout variant="warn">
          No se recomienda el <b>test de estimulación con ACTH</b> para decidir el uso de corticoides.
          El beneficio principal demostrado es la <b>reversión más rápida del shock</b>; el efecto
          sobre la mortalidad es discutido entre ensayos (APROCCHSS positivo, ADRENAL neutro en el
          primario). Vigilar hiperglucemia.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Control del foco infeccioso">
        <P>
          El antibiótico no sustituye al <b>control del foco</b>: drenaje de abscesos, desbridamiento
          de tejido necrótico, retirada de dispositivos/catéteres infectados, descompresión o
          resección del origen. La SSC 2021 recomienda identificar y controlar el foco{" "}
          <b>tan pronto como sea médica y logísticamente factible</b> —idealmente en las primeras 6–12 h—.
          Muchos de estos pacientes llegan al quirófano para el control del foco: es la indicación
          quirúrgica de la sepsis.
        </P>
        <Callout variant="danger">
          En focos quirúrgicos con deterioro rápido (fascitis necrosante, colangitis, isquemia
          mesentérica, peritonitis fecaloidea), el <b>control del foco es la reanimación</b>: retrasar
          la cirugía para «optimizar» al paciente puede ser fatal. Reanimar y operar suelen ir en
          paralelo, no en secuencia.
        </Callout>
        <Src>Evans L, et al. SSC 2021. Crit Care Med 2021;49(11):e1063-e1143.</Src>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Manejo anestésico del paciente séptico">
        <P>
          El séptico llega al quirófano vasodilatado, hipovolémico relativo, a menudo ya con
          vasopresor. La inducción es el momento de mayor riesgo: la pérdida del tono simpático y la
          vasodilatación del anestésico sobre un lecho ya depletado provoca <b>colapso hemodinámico</b>.
        </P>
        <Table
          headers={["Dominio", "Recomendación práctica"]}
          rows={[
            [
              "Antes de inducir",
              "Optimizar volemia, tener vasopresor en marcha o preparado (NA en bomba, bolos de fenilefrina/adrenalina listos), acceso adecuado, monitorización arterial invasiva si inestable.",
            ],
            [
              "Inducción",
              "Dosis reducidas y tituladas; el gasto cardíaco lento retrasa el efecto. Etomidato o ketamina preferibles a propofol por estabilidad; propofol con mucha cautela y dosis bajas.",
            ],
            [
              "Etomidato",
              "Dosis única aceptable si estabilidad prioritaria; controversia por supresión suprarrenal transitoria — evitar dosis repetidas/infusión.",
            ],
            [
              "Mantenimiento",
              "Titular halogenado/propofol al mínimo necesario; anticipar hipotensión; reponer pérdidas y vasopresor guiado por metas dinámicas.",
            ],
            [
              "Ventilación",
              "Estrategia protectora: Vt ≈ 6 mL/kg de peso ideal, presión meseta < 30 cmH₂O si SDRA asociado.",
            ],
            [
              "Objetivos intra-op",
              "Mantener PAM ≥ 65 mmHg, perfusión (diuresis, lactato), normotermia, normoglucemia (objetivo glucosa ≤ 180 mg/dL).",
            ],
          ]}
        />
        <Src>
          Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — Anesthesia for the Septic Patient. ·
          Evans L, et al. SSC 2021 (glucemia, ventilación protectora).
        </Src>
        <Callout variant="danger">
          <b>Inducción del séptico.</b> Reducir la dosis del hipnótico, administrarla lenta y tener el
          vasopresor <b>listo antes</b> de dormir al paciente. La combinación de vasodilatación
          farmacológica + hipovolemia + pérdida de tono simpático sobre un shock distributivo puede
          precipitar paro. Ketamina/etomidato aportan mayor estabilidad que propofol.
        </Callout>
        <Callout variant="info">
          <b>Control glucémico.</b> Iniciar insulina cuando la glucemia sea ≥ 180 mg/dL, con objetivo
          &lt; 180 mg/dL (rango típico 144–180). Evitar el control estricto (80–110) por riesgo de
          hipoglucemia (SSC 2021, tras NICE-SUGAR).
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Resumen de dosis y objetivos clave">
        <Table
          headers={["Parámetro", "Valor", "Fuente"]}
          accentCol={1}
          rows={[
            ["Cristaloide inicial", "≥ 30 mL/kg en las 1.as 3 h", "SSC 2021"],
            ["Objetivo de PAM", "≥ 65 mmHg", "SSC 2021 / SEPSISPAM"],
            ["Vasopresor 1.ª línea", "Noradrenalina", "SSC 2021"],
            ["Vasopresina (añadir)", "0.03 U/min IV (dosis fija)", "SSC 2021"],
            ["Adrenalina", "3.er agente (añadir a NA + vasopresina)", "SSC 2021"],
            ["Corticoide en shock refractario", "Hidrocortisona 200 mg/día IV", "SSC 2021 / APROCCHSS"],
            ["Umbral de corticoide", "NA ≥ 0.25 µg/kg/min ≥ 4 h", "SSC 2021"],
            ["Lactato para bolo de fluidos", "≥ 4 mmol/L (o hipotensión)", "SSC 2021"],
            ["Antibiótico en shock séptico", "< 1 h desde reconocimiento", "SSC 2021"],
            ["Objetivo de glucemia", "< 180 mg/dL", "SSC 2021"],
            ["Ventilación (SDRA)", "Vt ≈ 6 mL/kg PI · meseta < 30 cmH₂O", "SSC 2021 / ARDSNet"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Evans L, Rhodes A, Alhazzani W, et al. Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021. Crit Care Med 2021;49(11):e1063-e1143.</li>
          <li>Singer M, Deutschman CS, Seymour CW, et al. The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). JAMA 2016;315(8):801-810.</li>
          <li>Asfar P, Meziani F, Hamel JF, et al. High versus low blood-pressure target in patients with septic shock (SEPSISPAM). N Engl J Med 2014;370(17):1583-1593.</li>
          <li>Annane D, Renault A, Brun-Buisson C, et al. Hydrocortisone plus Fludrocortisone for Adults with Septic Shock (APROCCHSS). N Engl J Med 2018;378(9):809-818.</li>
          <li>Venkatesh B, Finfer S, Cohen J, et al. Adjunctive Glucocorticoid Therapy in Patients with Septic Shock (ADRENAL). N Engl J Med 2018;378(9):797-808.</li>
          <li>NICE-SUGAR Study Investigators. Intensive versus Conventional Glucose Control in Critically Ill Patients. N Engl J Med 2009;360(13):1283-1297.</li>
          <li>Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — Anesthesia for the Septic Patient.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y objetivos de literatura aceptada (Surviving Sepsis Campaign 2021, Sepsis-3, Miller)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, protocolo institucional ni monitorización"}
          <br />
          {"// el paquete de la 1.ª hora se ejecuta en paralelo, no en fila india"}
          <br />
          {"// si dudas si es shock, ya perdiste tiempo: reanima y busca el foco"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
