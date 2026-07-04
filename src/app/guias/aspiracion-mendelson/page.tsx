import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — ASPIRACIÓN PULMONAR (SÍNDROME DE MENDELSON)
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: profilaxis, prevención y manejo agudo tomados
// de literatura aceptada (ASA fasting guidelines, Miller, Stoelting,
// UpToDate). Cada tabla/callout cita su fuente (Vancouver breve).
// NO inventar dosis ni nombres.
// Fuentes primarias:
//  - Mendelson CL. The aspiration of stomach contents into the lungs
//    during obstetric anesthesia. Am J Obstet Gynecol 1946;52:191-205.
//  - Practice Guidelines for Preoperative Fasting (ASA Task Force).
//    Anesthesiology 2017;126(3):376-393.
//  - Marik PE. Aspiration pneumonitis and aspiration pneumonia.
//    N Engl J Med 2001;344(9):665-671.
//  - Gropper MA, et al. Miller's Anesthesia, 9.ª ed. — Aspiration.
//  - Stoelting RK, Hillier SC. Pharmacology & Physiology in
//    Anesthetic Practice.
// ============================================================

export const metadata: Metadata = {
  title: "Aspiración pulmonar (síndrome de Mendelson) — prevención y manejo · DEC",
  description:
    "Referencia perioperatoria de broncoaspiración de contenido gástrico (síndrome de Mendelson): ayuno preoperatorio ASA, inducción de secuencia rápida en riesgo, presión cricoidea (controvertida), profilaxis farmacológica (citrato de sodio no particulado, antiH2/IBP, metoclopramida) y manejo agudo (posición lateral/Trendelenburg, aspirar orofaringe antes de ventilar, intubar y aspirar por el tubo, O2/PEEP). Sin lavado bronquial de rutina, antibióticos y esteroides no profilácticos. Vigilancia por SDRA.",
  openGraph: {
    title: "Aspiración pulmonar (síndrome de Mendelson) — prevención y manejo · DEC",
    description:
      "Ayuno ASA, RSI, presión cricoidea, profilaxis (citrato de sodio, antiH2/IBP, metoclopramida) y manejo agudo del aspirado gástrico. Miller · ASA · UpToDate.",
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
export default function AspiracionMendelsonPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat aspiracion-mendelson.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Aspiración pulmonar (síndrome de Mendelson)
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          ayuno · RSI · presión cricoidea · profilaxis · manejo agudo · vigilancia de SDRA
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// el estómago lleno no respeta tu plan anestésico; el pH < 2.5 tampoco"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">EMERGENCIA</span>
          <span className="tag tag-muted">ASA 2017</span>
          <span className="tag tag-muted">Miller</span>
          <span className="tag tag-muted">Mendelson 1946</span>
        </div>
      </header>

      <Callout variant="info">
        <b>Qué es.</b> El <b>síndrome de Mendelson</b> es la neumonitis química por{" "}
        <b>broncoaspiración de contenido gástrico</b> durante la anestesia. El daño alveolo-capilar es
        mayor cuando el aspirado es <b>ácido</b> (pH &lt; 2.5) y de <b>volumen elevado</b> (clásicamente
        &gt; 0.4 mL/kg, ~25 mL en el adulto). Distinguir <b>neumonitis por aspiración</b> (lesión química
        estéril, aguda) de <b>neumonía por aspiración</b> (infección bacteriana, más tardía): condicionan
        decisiones opuestas sobre antibióticos.
      </Callout>
      <Src>
        Mendelson CL. Am J Obstet Gynecol 1946;52:191-205. · Marik PE. N Engl J Med 2001;344(9):665-671.
      </Src>

      {/* ========================================================= */}
      <Section n="01" title="Factores de riesgo de aspiración">
        <P>
          La aspiración perioperatoria es infrecuente pero potencialmente mortal, y se concentra en
          pacientes con <b>estómago lleno</b>, <b>vaciamiento gástrico retardado</b> o{" "}
          <b>protección de vía aérea comprometida</b>. Identificar el riesgo <b>antes</b> de inducir
          determina la técnica (RSI, profilaxis, plan de vía aérea).
        </P>
        <Table
          headers={["Categoría", "Ejemplos"]}
          rows={[
            [
              "Estómago lleno / urgencia",
              "Cirugía de emergencia sin ayuno, trauma (el dolor/estrés detiene el vaciamiento), obstrucción intestinal, íleo, hemorragia digestiva.",
            ],
            [
              "Vaciamiento retardado",
              "Embarazo (2.º-3.er trimestre y parto), diabetes con gastroparesia, opioides, dolor, ansiedad, uremia.",
            ],
            [
              "Barrera antirreflujo alterada",
              "ERGE/hernia hiatal, obesidad, sonda nasogástrica, acalasia, cirugía esofagogástrica previa.",
            ],
            [
              "Protección de vía aérea reducida",
              "Nivel de conciencia deprimido, disfunción bulbar/neuromuscular, vía aérea difícil, sedación profunda sin aislamiento.",
            ],
          ]}
        />
        <Src>Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. · Practice Guidelines ASA. Anesthesiology 2017.</Src>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Prevención — ayuno preoperatorio (ASA)">
        <P>
          El <b>ayuno preoperatorio</b> es la primera línea de prevención en cirugía electiva. Los
          intervalos ASA aplican a pacientes <b>sanos sin factores de riesgo</b> de aspiración y no
          garantizan estómago vacío en emergencia, gastroparesia o embarazo.
        </P>
        <Table
          headers={["Ingesta", "Ayuno mínimo antes de anestesia"]}
          accentCol={1}
          rows={[
            ["Líquidos claros", "2 h"],
            ["Leche materna", "4 h"],
            ["Fórmula infantil / leche no humana", "6 h"],
            ["Comida ligera (tostada + líquido claro)", "6 h"],
            ["Comida completa (grasas, carne, fritos)", "8 h o más"],
          ]}
        />
        <Src>Practice Guidelines for Preoperative Fasting (ASA). Anesthesiology 2017;126(3):376-393.</Src>
        <Callout variant="warn">
          El ayuno <b>no vacía</b> el estómago del paciente de riesgo: en <b>emergencia, trauma, íleo,
          obstrucción, embarazo o gastroparesia</b> se asume estómago lleno independientemente de las
          horas transcurridas. En esos casos: <b>RSI + profilaxis</b>, no confiar en el reloj.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Inducción de secuencia rápida (RSI) y presión cricoidea">
        <P>
          En el paciente con riesgo de aspiración que no puede diferirse, la <b>inducción de secuencia
          rápida</b> minimiza el intervalo entre pérdida de conciencia y aislamiento de la vía aérea con
          tubo con balón. Preoxigenar bien, inducir e intubar rápido, y{" "}
          <b>evitar la ventilación con presión positiva con mascarilla</b> antes de asegurar el tubo
          (insufla el estómago y favorece la regurgitación).
        </P>
        <Table
          headers={["Elemento de la RSI", "Detalle práctico"]}
          rows={[
            ["Preoxigenación", "FiO₂ 100% hasta desnitrogenar (≈ 3 min o 8 respiraciones a capacidad vital); crea reserva para la apnea."],
            ["Posición", "Considerar anti-Trendelenburg (cabeza arriba) en electivo de riesgo para reducir reflujo; en trauma valorar según lesión."],
            ["Inductor + relajante", "Hipnótico de acción rápida + relajante de inicio veloz (succinilcolina 1–1.5 mg/kg o rocuronio 1.2 mg/kg) para intubar pronto."],
            ["Evitar ventilar a presión positiva", "No ventilar con mascarilla entre inducción e intubación salvo desaturación (RSI modificada con ventilación suave, < 20 cmH₂O)."],
            ["Intubar y confirmar", "Tubo con balón, inflar de inmediato, confirmar por capnografía antes de ventilar francamente."],
          ]}
        />
        <Src>Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. · Stoelting RK, Hillier SC.</Src>
        <Callout variant="warn">
          <b>Presión cricoidea (maniobra de Sellick): controvertida.</b> Aplicar 10 N con el paciente
          despierto y ~30 N tras la pérdida de conciencia sobre el cartílago cricoides busca ocluir el
          esófago. La evidencia de que <b>prevenga</b> la aspiración es débil y puede <b>empeorar la
          visión laríngea</b> y la ventilación. Si dificulta la intubación o la ventilación,{" "}
          <b>liberarla</b>. No sustituye al aislamiento rápido de la vía aérea.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Profilaxis farmacológica del riesgo alto">
        <P>
          En pacientes de alto riesgo puede añadirse profilaxis dirigida a <b>elevar el pH gástrico</b>,
          <b> reducir el volumen</b> y <b>acelerar el vaciamiento</b>. El objetivo fisiopatológico es
          minimizar el daño <b>si</b> hay aspiración (pH &gt; 2.5, volumen bajo). No sustituye a la RSI ni
          al ayuno.
        </P>
        <Table
          headers={["Clase", "Fármaco / dosis", "Efecto"]}
          accentCol={1}
          rows={[
            [
              "Antiácido no particulado",
              "Citrato de sodio 0.3 M, 30 mL VO, 15–30 min antes de la inducción",
              "Neutraliza de inmediato el ácido ya presente; eleva el pH. No particulado — el particulado daña el pulmón si se aspira.",
            ],
            [
              "Antagonista H2",
              "Ranitidina 50 mg IV (o 150 mg VO); famotidina 20 mg IV/VO",
              "Reduce secreción ácida y volumen; efecto en ~30–60 min. (Ranitidina retirada en muchos mercados — usar famotidina.)",
            ],
            [
              "Inhibidor de bomba de protones",
              "Omeprazol 40 mg VO/IV (o pantoprazol/esomeprazol equivalente)",
              "Suprime secreción ácida; ideal la noche previa + la mañana en electivo.",
            ],
            [
              "Procinético",
              "Metoclopramida 10 mg IV, 30–60 min antes",
              "Acelera el vaciamiento gástrico y aumenta el tono del esfínter esofágico inferior. Evitar en obstrucción intestinal.",
            ],
          ]}
        />
        <Src>
          Practice Guidelines ASA. Anesthesiology 2017. · Stoelting RK, Hillier SC. · Miller&apos;s
          Anesthesia, 9.ª ed.
        </Src>
        <Callout variant="danger">
          <b>El antiácido debe ser NO particulado.</b> Usar <b>citrato de sodio</b>, nunca hidróxido de
          aluminio/magnesio ni antiácidos particulados: si el particulado se aspira, produce por sí mismo
          una neumonitis grave. La <b>metoclopramida está contraindicada</b> en obstrucción intestinal o
          perforación.
        </Callout>
        <Callout variant="info">
          La ASA <b>no recomienda</b> el uso <b>rutinario</b> de estos fármacos en pacientes sin factores
          de riesgo. Reservar la profilaxis para el <b>riesgo elevado</b> (embarazo/parto, urgencia,
          obesidad mórbida, ERGE grave, gastroparesia, vía aérea difícil prevista).
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Manejo agudo — el paciente que aspira">
        <P>
          Ante regurgitación/aspiración presenciada o sospechada (contenido en orofaringe,
          desaturación, broncoespasmo, aumento de presión en vía aérea, sibilancias), actuar de
          inmediato. La prioridad es <b>limitar la contaminación adicional</b> y <b>oxigenar</b>.
        </P>
        <Table
          headers={["Paso", "Acción"]}
          rows={[
            ["1 · Posición", "Colocar en decúbito lateral y Trendelenburg (cabeza abajo): el contenido drena por gravedad fuera de la vía aérea en lugar de hacia los bronquios."],
            ["2 · Aspirar orofaringe PRIMERO", "Aspirar boca/faringe ANTES de ventilar a presión positiva — ventilar antes empuja el material distalmente hacia el pulmón."],
            ["3 · Asegurar la vía aérea", "Intubar con tubo con balón para aislar y proteger; inflar el balón."],
            ["4 · Aspirar por el tubo", "Aspirar por el tubo endotraqueal ANTES de ventilación a presión positiva; retirar material accesible de la vía aérea."],
            ["5 · Oxigenar y ventilar", "FiO₂ alta; añadir PEEP para reclutar y mejorar la oxigenación; ventilación protectora."],
            ["6 · Descomprimir estómago", "Sonda orogástrica/nasogástrica para vaciar el estómago y reducir nueva regurgitación."],
            ["7 · Decidir sobre la cirugía", "Según gravedad y urgencia: proceder, diferir o despertar; vigilar deterioro respiratorio."],
          ]}
        />
        <Src>Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. · Marik PE. N Engl J Med 2001;344(9):665-671.</Src>
        <Callout variant="danger">
          <b>Secuencia crítica.</b> <b>Aspirar la orofaringe ANTES de ventilar a presión positiva</b>, y
          tras intubar <b>aspirar por el tubo antes</b> de ventilar con fuerza: ventilar sobre material
          en la vía aérea lo impulsa a bronquios distales y agrava la lesión. Lateral + Trendelenburg
          (cabeza abajo) mientras se aspira.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Lo que NO se debe hacer (errores frecuentes)">
        <P>
          Buena parte del manejo del Mendelson es <b>evitar intervenciones sin evidencia</b> que no
          ayudan y pueden dañar. La neumonitis química inicial es <b>estéril</b>: tratarla como infección
          o como asma no procede.
        </P>
        <Table
          headers={["Intervención", "Conducta", "Motivo"]}
          accentCol={1}
          rows={[
            [
              "Lavado bronquial con salino",
              "NO de rutina",
              "El lavado con suero salino no mejora el desenlace y puede dispersar el material distalmente y empeorar la oxigenación. Aspiración dirigida, sí; lavado rutinario, no.",
            ],
            [
              "Broncoscopia",
              "Solo si material sólido/partículas",
              "Indicada para retirar partículas sólidas o atelectasia lobar por tapón; no para líquido/aspirado disperso.",
            ],
            [
              "Antibióticos",
              "NO profilácticos",
              "No dar de entrada: la neumonitis es química y estéril. Reservar para neumonía por aspiración establecida (fiebre/leucocitosis persistentes, infiltrado que no mejora a 48 h, cultivos).",
            ],
            [
              "Corticoesteroides",
              "NO indicados",
              "No mejoran el desenlace en la neumonitis por aspiración y pueden aumentar el riesgo infeccioso. No usar de rutina.",
            ],
          ]}
        />
        <Src>Marik PE. N Engl J Med 2001;344(9):665-671. · Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed.</Src>
        <Callout variant="warn">
          <b>Antibiótico: no de entrada.</b> Iniciar antibiótico solo ante <b>neumonía por aspiración
          establecida</b> —fiebre y leucocitosis persistentes a &gt; 48 h, infiltrado que progresa,
          datos microbiológicos—, no como profilaxis del aspirado ácido inicial. La exposición
          antibiótica innecesaria selecciona resistencias.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Vigilancia y evolución">
        <P>
          Tras la aspiración, el curso es variable: desde broncoespasmo/desaturación transitorios que se
          resuelven, hasta <b>lesión pulmonar aguda / SDRA</b>. Vigilar en área monitorizada: la lesión
          puede <b>empeorar en las primeras horas</b>.
        </P>
        <Table
          headers={["Dominio", "Vigilancia / conducta"]}
          rows={[
            ["Oxigenación", "SpO₂ y gases; soporte con O₂/PEEP; ventilación protectora si intubado (Vt ≈ 6 mL/kg peso ideal, meseta < 30 cmH₂O)."],
            ["Imagen", "Radiografía de tórax de base y evolutiva; los infiltrados pueden tardar horas en aparecer."],
            ["Progresión a SDRA", "Vigilar deterioro de la oxigenación e infiltrados bilaterales: puede evolucionar a SDRA en las primeras 24–48 h."],
            ["Destino", "Ingreso monitorizado / UCI según gravedad; no dar de alta precoz al paciente sintomático."],
            ["Sobreinfección", "Reevaluar a las 48 h: si aparece neumonía por aspiración establecida, entonces antibiótico dirigido."],
          ]}
        />
        <Src>Marik PE. N Engl J Med 2001;344(9):665-671. · Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed.</Src>
        <Callout variant="info">
          Un paciente asintomático con vía aérea limpia, radiografía normal y buena oxigenación tras un
          periodo de observación (típicamente ≥ 2 h) tiene bajo riesgo de deterioro tardío. Ante
          cualquier síntoma respiratorio, hipoxemia o infiltrado, <b>observación prolongada</b>.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Resumen de puntos y dosis clave">
        <Table
          headers={["Parámetro", "Valor / conducta", "Fuente"]}
          accentCol={1}
          rows={[
            ["Ayuno — líquidos claros", "2 h", "ASA 2017"],
            ["Ayuno — comida ligera", "6 h", "ASA 2017"],
            ["Ayuno — comida completa", "≥ 8 h", "ASA 2017"],
            ["Umbral clásico de daño", "pH < 2.5 y > 0.4 mL/kg (~25 mL)", "Mendelson / Miller"],
            ["Citrato de sodio 0.3 M", "30 mL VO, 15–30 min antes (no particulado)", "ASA / Stoelting"],
            ["Antagonista H2", "Famotidina 20 mg IV/VO (o ranitidina 50 mg IV)", "ASA / Stoelting"],
            ["IBP", "Omeprazol 40 mg VO/IV", "ASA / Stoelting"],
            ["Metoclopramida", "10 mg IV (evitar en obstrucción)", "ASA / Stoelting"],
            ["Succinilcolina (RSI)", "1–1.5 mg/kg IV", "Miller"],
            ["Rocuronio (RSI)", "1.2 mg/kg IV", "Miller"],
            ["Presión cricoidea", "10 N despierto → ~30 N dormido (controvertida)", "Miller"],
            ["Manejo agudo", "Lateral+Trendelenburg, aspirar orofaringe antes de ventilar, intubar, aspirar por tubo, O₂/PEEP", "Miller / Marik"],
            ["Lavado bronquial salino", "NO de rutina", "Marik / Miller"],
            ["Broncoscopia", "Solo si material sólido", "Marik / Miller"],
            ["Antibióticos", "NO profilácticos (solo neumonía establecida)", "Marik"],
            ["Esteroides", "NO indicados", "Marik"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="09" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Mendelson CL. The aspiration of stomach contents into the lungs during obstetric anesthesia. Am J Obstet Gynecol 1946;52(2):191-205.</li>
          <li>Practice Guidelines for Preoperative Fasting and the Use of Pharmacologic Agents to Reduce the Risk of Pulmonary Aspiration (ASA Task Force). Anesthesiology 2017;126(3):376-393.</li>
          <li>Marik PE. Aspiration pneumonitis and aspiration pneumonia. N Engl J Med 2001;344(9):665-671.</li>
          <li>Gropper MA, Cohen NH, Eriksson LI, et al. Miller&apos;s Anesthesia, 9.ª ed. Elsevier; 2020. — Pulmonary aspiration / airway management.</li>
          <li>Stoelting RK, Hillier SC. Pharmacology &amp; Physiology in Anesthetic Practice. 4.ª ed. — Antacids, H2 antagonists, prokinetics.</li>
          <li>Algie CM, Mahar RK, Tan HB, et al. Effectiveness and risks of cricoid pressure during rapid sequence induction. Cochrane Database Syst Rev 2015;(11):CD011656.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y conducta de literatura aceptada (ASA 2017 · Miller · Stoelting · Marik NEJM · Mendelson 1946)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// aspira la orofaringe ANTES de ventilar a presión positiva: ventilar antes es empujar la mierda al pulmón"}
          <br />
          {"// ni antibiótico de entrada ni esteroides ni lavado de rutina: la neumonitis química inicial es estéril"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
