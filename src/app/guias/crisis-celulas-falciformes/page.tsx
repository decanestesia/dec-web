import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — CRISIS DE CÉLULAS FALCIFORMES PERIOPERATORIA
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: objetivos, umbrales y conductas tomados de
// guías de sociedad y literatura aceptada. Cada tabla/callout cita
// su fuente (Vancouver breve). NO inventar cifras.
// Fuentes primarias:
//  - Howard J, et al. (TAPS trial). The transfusion alternatives
//    preoperatively in sickle cell disease (TAPS): a randomised,
//    controlled, multicentre clinical trial. Lancet 2013;381:930-938.
//  - Chou ST, et al. American Society of Hematology 2020 guidelines
//    for sickle cell disease: transfusion support. Blood Adv
//    2020;4(2):327-355.
//  - National Heart, Lung, and Blood Institute (NHLBI). Evidence-Based
//    Management of Sickle Cell Disease: Expert Panel Report 2014.
//  - Vichinsky EP, et al. A comparison of conservative and aggressive
//    transfusion regimens in the perioperative management of sickle
//    cell disease (PSCSCTG). N Engl J Med 1995;333(4):206-213.
//  - Miller's Anesthesia / Stoelting — Hemoglobinopathies.
// ============================================================

export const metadata: Metadata = {
  title: "Crisis de células falciformes perioperatoria — Guía clínica · DEC",
  description:
    "Referencia perioperatoria de la enfermedad de células falciformes: prevención de la crisis vaso-oclusiva, secuestro y síndrome torácico agudo evitando los desencadenantes de la falciformación (hipoxia, hipotermia, acidosis, deshidratación, estasis, dolor). Objetivos de normotermia, normovolemia, oxigenación y analgesia; transfusión simple a Hb ~10 g/dL o recambio a HbS < 30% en cirugía mayor guiada por la evidencia TAPS; manejo del síndrome torácico agudo e hidroxiurea crónica.",
  openGraph: {
    title: "Crisis de células falciformes perioperatoria — Guía clínica · DEC",
    description:
      "Prevención de la crisis vaso-oclusiva, transfusión (simple Hb ~10 / recambio HbS < 30%), síndrome torácico agudo y objetivos perioperatorios. Evidencia TAPS / ASH 2020 / NHLBI.",
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
export default function CrisisCelulasFalciformesPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat crisis-celulas-falciformes.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Crisis de células falciformes perioperatoria
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          desencadenantes de falciformación · normotermia · oxigenación · transfusión (TAPS) · síndrome torácico agudo
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// el HbS falciforma cuando lo maltratas: frío, seco, hipóxico y con dolor. no seas ese anestesiólogo"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">REFERENCIA</span>
          <span className="tag tag-muted">TAPS 2013</span>
          <span className="tag tag-muted">ASH 2020</span>
          <span className="tag tag-muted">NHLBI 2014</span>
        </div>
      </header>

      <Callout variant="info">
        <b>Fisiopatología en una línea.</b> La hemoglobina S polimeriza al <b>desoxigenarse</b>,
        deformando el eritrocito (falciformación). Los hematíes rígidos ocluyen la microvasculatura →
        <b> crisis vaso-oclusiva (CVO)</b>, isquemia y dolor. La anestesia y la cirugía concentran casi
        todos los precipitantes conocidos, por lo que el manejo perioperatorio es en esencia{" "}
        <b>prevención de la polimerización</b>.
      </Callout>
      <Src>NHLBI Expert Panel Report 2014. · Miller&apos;s Anesthesia / Stoelting — Hemoglobinopathies.</Src>

      {/* ========================================================= */}
      <Section n="01" title="Desencadenantes de la falciformación (evitar TODOS)">
        <P>
          La falciformación se dispara cuando cae la saturación local de O₂ y cuando el entorno favorece
          la desoxigenación de la HbS. El objetivo perioperatorio es <b>eliminar cada desencadenante</b>:
          son controlables y su suma es lo que precipita la crisis. Regla mnemotécnica: los enemigos son
          hipoxia, hipotermia, acidosis, deshidratación, estasis y dolor/estrés.
        </P>
        <Table
          headers={["Desencadenante", "Mecanismo", "Prevención perioperatoria"]}
          rows={[
            [
              "Hipoxia",
              "Baja SaO₂ → desoxi-HbS → polimeriza y falciforma.",
              "FiO₂ suficiente; SpO₂ alta (objetivo ≥ 96–100%); preoxigenar; evitar hipoventilación/atelectasia.",
            ],
            [
              "Hipotermia",
              "Vasoconstricción y estasis; desplaza la curva; favorece la polimerización.",
              "Normotermia activa: manta de aire caliente, fluidos calientes, quirófano templado.",
            ],
            [
              "Acidosis",
              "Desplaza la curva de disociación a la derecha → más desoxi-HbS.",
              "Ventilación y perfusión adecuadas; evitar hipercapnia e hipoperfusión; corregir acidosis.",
            ],
            [
              "Deshidratación",
              "Hemoconcentración e ↑ viscosidad → más contacto/polimerización.",
              "Normovolemia: fluidos IV de mantenimiento; no dejar ayuno prolongado sin sueroterapia.",
            ],
            [
              "Estasis venosa",
              "Tiempo de tránsito lento → más desoxigenación en microcirculación.",
              "Evitar torniquetes prolongados; posición cuidadosa; movilización; profilaxis de estasis.",
            ],
            [
              "Dolor / estrés",
              "Descarga simpática → vasoconstricción y ↑ demanda de O₂.",
              "Analgesia multimodal eficaz; ansiólisis; control del dolor postoperatorio agresivo.",
            ],
          ]}
        />
        <Src>NHLBI Expert Panel Report 2014. · Chou ST, et al. (ASH 2020). Blood Adv 2020;4(2):327-355.</Src>
        <Callout variant="danger">
          Los desencadenantes son <b>aditivos y sinérgicos</b>: un paciente frío, seco e hipóxico
          falciforma mucho antes que uno con un solo insulto. La prevención no es opcional ni «cuando
          haya tiempo»: es el tratamiento. Ninguna transfusión rescata a un manejo que ignora la
          temperatura, la volemia y la oxigenación.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Objetivos perioperatorios (las 5 metas)">
        <P>
          Traducir la lista de desencadenantes a metas activas y monitorizadas durante toda la
          anestesia y el postoperatorio inmediato. Cada meta neutraliza uno o más precipitantes.
        </P>
        <Table
          headers={["Meta", "Objetivo operativo", "Por qué"]}
          accentCol={1}
          rows={[
            [
              "Oxigenación",
              "SpO₂ alta (≥ 96–100%); FiO₂ generosa; evitar desaturación",
              "Mantener oxi-HbS; impedir la desoxigenación que polimeriza.",
            ],
            [
              "Normotermia",
              "Temperatura central normal; calentamiento activo",
              "El frío causa vasoconstricción, estasis y falciformación.",
            ],
            [
              "Normovolemia",
              "Fluidos de mantenimiento IV; euvolemia (no sobrehidratar)",
              "Evita hemoconcentración; sobrecarga → riesgo de STA/edema.",
            ],
            [
              "Analgesia",
              "Multimodal; opioides titulados; regional cuando aplique",
              "Corta la descarga simpática y la vasoconstricción por dolor.",
            ],
            [
              "Evitar estasis",
              "Sin torniquetes prolongados; posición y movilización",
              "Reduce el tiempo de tránsito y la desoxigenación regional.",
            ],
          ]}
        />
        <Src>NHLBI Expert Panel Report 2014. · Miller&apos;s Anesthesia — Hemoglobinopathies.</Src>
        <Callout variant="warn">
          <b>Normovolemia, no sobrecarga.</b> El objetivo es evitar la deshidratación, no encharcar: la
          sobrehidratación agresiva aumenta el riesgo de <b>síndrome torácico agudo</b> y edema pulmonar.
          Fluidos de mantenimiento suficientes para mantener la euvolemia, ajustando a pérdidas y
          función cardiaca.
        </Callout>
        <Callout variant="warn">
          <b>Torniquete.</b> Genera hipoxia, acidosis y estasis distales: el entorno ideal para
          falciformar. Si es imprescindible, minimizar el tiempo, garantizar buena oxigenación y
          exanguinación previa, y sopesar el riesgo/beneficio. Evitar torniquetes prolongados.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Transfusión perioperatoria (evidencia TAPS)">
        <P>
          La transfusión reduce la proporción de HbS y previene complicaciones perioperatorias en
          cirugía de riesgo moderado-alto, pero <b>no está exenta de daño</b> (aloinmunización,
          hiperviscosidad, sobrecarga). El ensayo <b>TAPS</b> demostró que la transfusión preoperatoria
          reduce las complicaciones perioperatorias serias frente a no transfundir en genotipo HbSS/HbSβ⁰
          sometidos a cirugía de bajo-medio riesgo; se detuvo precozmente por beneficio. La estrategia se
          individualiza por genotipo, tipo de cirugía y Hb basal.
        </P>
        <Table
          headers={["Estrategia", "Objetivo", "Indicación típica"]}
          accentCol={1}
          rows={[
            [
              "Transfusión simple (top-up)",
              "Subir la Hb a ~10 g/dL",
              "Cirugía de bajo-medio riesgo en HbSS/HbSβ⁰ con Hb basal baja; enfoque preferido cuando basta corregir la anemia.",
            ],
            [
              "Recambio (exanguinotransfusión)",
              "HbS < 30% (sin superar Hb ~10 g/dL)",
              "Cirugía mayor / alto riesgo, o Hb basal ya alta donde una simple elevaría en exceso la viscosidad.",
            ],
            [
              "No transfundir",
              "—",
              "Cirugía menor / de muy bajo riesgo, o pacientes con genotipo de bajo riesgo (p. ej. HbSC leve) según valoración individual.",
            ],
          ]}
        />
        <Src>
          Howard J, et al. (TAPS). Lancet 2013;381(9870):930-938. · Chou ST, et al. (ASH 2020). Blood Adv
          2020;4(2):327-355. · Vichinsky EP, et al. (PSCSCTG). N Engl J Med 1995;333(4):206-213.
        </Src>
        <Callout variant="danger">
          <b>No sobre-transfundir.</b> Subir la Hb por encima de <b>~10 g/dL</b> aumenta la viscosidad y
          puede empeorar la vaso-oclusión: el objetivo de la simple es alcanzar ~10 g/dL, y el del
          recambio es bajar la <b>HbS &lt; 30%</b> sin superar esa Hb. El régimen conservador (simple a
          Hb 10) fue tan eficaz y más seguro que el agresivo en el estudio de Vichinsky (PSCSCTG).
        </Callout>
        <Callout variant="info">
          <b>Sangre para el falciforme.</b> Transfundir hematíes fenotipados/compatibilizados de forma
          extendida (al menos Rh —C, E— y Kell) para reducir la <b>aloinmunización</b>, leucorreducidos y
          preferiblemente HbS-negativos. Coordinar con el banco de sangre con antelación: el paciente
          falciforme suele estar aloinmunizado y el cruce puede demorar.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Síndrome torácico agudo (STA) — reconocer y tratar">
        <P>
          El <b>síndrome torácico agudo</b> es la principal causa de mortalidad perioperatoria en
          falciformes. Se define por un infiltrado pulmonar nuevo más síntomas respiratorios (fiebre,
          tos, dolor torácico, disnea, hipoxia). Puede desencadenarse por la propia cirugía, la
          anestesia, la sobrecarga hídrica o una CVO, y evoluciona rápido a insuficiencia respiratoria.
        </P>
        <Table
          headers={["Intervención", "Detalle", "Rol"]}
          accentCol={0}
          rows={[
            [
              "Oxígeno",
              "O₂ suplementario a SpO₂ alta; soporte ventilatorio si progresa",
              "Corrige la hipoxia y frena la falciformación pulmonar.",
            ],
            [
              "Analgesia",
              "Multimodal; suficiente para permitir inspiración profunda y espirometría incentivada",
              "El dolor limita la ventilación → atelectasia → más hipoxia.",
            ],
            [
              "Transfusión / recambio",
              "Simple si anemia; recambio si STA grave o hipoxemia progresiva",
              "Reduce HbS y mejora el intercambio gaseoso; pilar en STA grave.",
            ],
            [
              "Antibióticos",
              "Empíricos de amplio espectro que cubran atípicos (macrólido/cefalosporina)",
              "Difícil distinguir de neumonía; cubrir infección concomitante.",
            ],
            [
              "Broncodilatadores",
              "β2-agonistas inhalados si broncoespasmo / sibilancias",
              "Muchos falciformes tienen hiperreactividad bronquial.",
            ],
          ]}
        />
        <Src>
          NHLBI Expert Panel Report 2014. · Chou ST, et al. (ASH 2020). Blood Adv 2020;4(2):327-355. ·
          Vichinsky EP, et al. Causes and outcomes of the acute chest syndrome. N Engl J Med 2000;342:1855-1865.
        </Src>
        <Callout variant="danger">
          El STA puede aparecer <b>1–3 días después</b> de la cirugía, no solo intraoperatoriamente:
          vigilancia respiratoria estrecha en el postoperatorio, espirometría incentivada, movilización
          precoz y analgesia que <b>no deprima la ventilación</b>. Un descenso de la SpO₂ con infiltrado
          nuevo es STA hasta que se demuestre lo contrario.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Complicaciones agudas relacionadas y su manejo">
        <P>
          Además del STA, la CVO y el secuestro son las presentaciones agudas que el anestesiólogo debe
          anticipar y reconocer en el perioperatorio.
        </P>
        <Table
          headers={["Cuadro", "Presentación", "Conducta clave"]}
          rows={[
            [
              "Crisis vaso-oclusiva (CVO)",
              "Dolor isquémico agudo (huesos, tórax, abdomen); precipitada por los desencadenantes.",
              "Analgesia agresiva, hidratación, O₂, calor; buscar y corregir el precipitante.",
            ],
            [
              "Secuestro esplénico",
              "Caída brusca de Hb + esplenomegalia dolorosa + hipovolemia (sobre todo pediátrico).",
              "Reanimación con volumen y transfusión urgente; puede ser shock hipovolémico.",
            ],
            [
              "Síndrome torácico agudo",
              "Infiltrado nuevo + síntomas respiratorios + hipoxia (ver §4).",
              "O₂, analgesia, transfusión/recambio, antibióticos, broncodilatadores.",
            ],
          ]}
        />
        <Src>NHLBI Expert Panel Report 2014. · Chou ST, et al. (ASH 2020). Blood Adv 2020;4(2):327-355.</Src>
        <Callout variant="warn">
          <b>Secuestro esplénico</b> = emergencia hemodinámica: la Hb desploma porque el bazo atrapa
          sangre. Tratar como shock hipovolémico (volumen + transfusión), no como simple anemia. Más
          frecuente y grave en niños con bazo aún funcionante.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Terapia crónica: hidroxiurea y evaluación preoperatoria">
        <P>
          La <b>hidroxiurea (hidroxicarbamida)</b> es el tratamiento modificador de la enfermedad de
          referencia: aumenta la <b>hemoglobina fetal (HbF)</b>, que inhibe la polimerización de la HbS,
          reduciendo la frecuencia de CVO, STA y necesidad de transfusión. En general se{" "}
          <b>continúa en el perioperatorio</b> salvo indicación específica; consultar con hematología.
        </P>
        <Table
          headers={["Aspecto preoperatorio", "Detalle"]}
          rows={[
            ["Hidroxiurea", "Continuar la terapia crónica salvo contraindicación puntual; coordinar con hematología. Vigilar mielosupresión (hemograma)."],
            ["Coordinación", "Involucrar a hematología y al banco de sangre con antelación (fenotipo extendido, aloanticuerpos, plan transfusional)."],
            ["Basal", "Hemograma con reticulocitos, genotipo (HbSS/HbSβ⁰/HbSC), Hb basal, función renal/hepática, saturación basal, antecedente de STA/CVO."],
            ["Optimización", "Tratar infección, hipoxia o anemia agudas antes de cirugía electiva; asegurar hidratación y analgesia adecuadas periprocedimiento."],
            ["Postoperatorio", "Vigilancia respiratoria, espirometría incentivada, movilización precoz, hidratación, analgesia multimodal, control de temperatura."],
          ]}
        />
        <Src>
          Chou ST, et al. (ASH 2020). Blood Adv 2020;4(2):327-355. · NHLBI Expert Panel Report 2014. ·
          Ware RE, et al. Sickle cell disease. Lancet 2017;390:311-323.
        </Src>
        <Callout variant="info">
          La HbF de la hidroxiurea es protectora, pero <b>no sustituye</b> a las medidas perioperatorias:
          un paciente en hidroxiurea sigue falciformando si lo enfrías, deshidratas o dejas hipóxico. La
          farmacología crónica y el manejo intraoperatorio son complementarios, no intercambiables.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Resumen de objetivos y umbrales clave">
        <Table
          headers={["Parámetro", "Objetivo / umbral", "Fuente"]}
          accentCol={1}
          rows={[
            ["Oxigenación", "SpO₂ alta (≥ 96–100%); FiO₂ generosa", "NHLBI 2014"],
            ["Temperatura", "Normotermia (calentamiento activo)", "NHLBI 2014"],
            ["Volemia", "Normovolemia; fluidos de mantenimiento (no sobrecargar)", "NHLBI 2014"],
            ["Analgesia", "Multimodal; control agresivo del dolor", "NHLBI 2014"],
            ["Estasis", "Evitar torniquetes prolongados", "NHLBI 2014"],
            ["Transfusión simple", "Elevar Hb a ~10 g/dL", "TAPS / PSCSCTG"],
            ["Recambio (cirugía mayor)", "HbS < 30% (sin exceder Hb ~10 g/dL)", "ASH 2020 / PSCSCTG"],
            ["No sobre-transfundir", "No superar Hb ~10 g/dL (viscosidad)", "PSCSCTG"],
            ["STA — manejo", "O₂, analgesia, transfusión/recambio, ATB, broncodilatadores", "NHLBI 2014 / ASH 2020"],
            ["Terapia crónica", "Continuar hidroxiurea (↑ HbF)", "ASH 2020"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Howard J, Malfroy M, Llewelyn C, et al. The transfusion alternatives preoperatively in sickle cell disease (TAPS): a randomised, controlled, multicentre clinical trial. Lancet 2013;381(9870):930-938.</li>
          <li>Chou ST, Alsawas M, Fasano RM, et al. American Society of Hematology 2020 guidelines for sickle cell disease: transfusion support. Blood Adv 2020;4(2):327-355.</li>
          <li>National Heart, Lung, and Blood Institute. Evidence-Based Management of Sickle Cell Disease: Expert Panel Report 2014. Bethesda: NHLBI, 2014.</li>
          <li>Vichinsky EP, Haberkern CM, Neumayr L, et al. A comparison of conservative and aggressive transfusion regimens in the perioperative management of sickle cell disease (PSCSCTG). N Engl J Med 1995;333(4):206-213.</li>
          <li>Vichinsky EP, Neumayr LD, Earles AN, et al. Causes and outcomes of the acute chest syndrome in sickle cell disease. N Engl J Med 2000;342(25):1855-1865.</li>
          <li>Ware RE, de Montalembert M, Tshilolo L, Abboud MR. Sickle cell disease. Lancet 2017;390(10091):311-323.</li>
          <li>Gropper MA, et al. Miller&apos;s Anesthesia — Anesthesia for patients with hemoglobinopathies. · Stoelting — Hemoglobinopathies.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// objetivos y umbrales de literatura aceptada (TAPS 2013 · ASH 2020 · NHLBI 2014 · PSCSCTG)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, hematología ni protocolo institucional"}
          <br />
          {"// caliente, hidrate, oxigene y analgesie: el HbS solo falciforma cuando se lo permites"}
          <br />
          {"// transfundir de más también mata: ~10 g/dL es meta, no punto de partida"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
