import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — DOLOR AGUDO POSTOPERATORIO (MULTIMODAL)
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: dosis y estrategias tomadas de PROSPECT,
// guías de dolor agudo (ASA/APS/ASRA) y literatura aceptada.
// Cada tabla/callout cita su fuente (Vancouver breve). NO inventar.
// Fuentes primarias:
//  - Chou R, Gordon DB, de Leon-Casasola OA, et al. Management of
//    Postoperative Pain (ASA/APS/ASRA Clinical Practice Guideline).
//    J Pain 2016;17(2):131-157.
//  - Joshi GP, Kehlet H (PROSPECT Working Group). Procedure-specific
//    pain management (PROSPECT). Anaesthesia / Br J Anaesth, varios.
//  - Beloeil H. Opioid-free anesthesia. Best Pract Res Clin
//    Anaesthesiol 2019;33(3):353-360.
//  - Ljungqvist O, Scott M, Fearon KC. Enhanced Recovery After
//    Surgery (ERAS): A Review. JAMA Surg 2017;152(3):292-298.
//  - Miller's Anesthesia, 9.ª ed. — Acute Postoperative Pain.
// ============================================================

export const metadata: Metadata = {
  title: "Dolor agudo postoperatorio (multimodal) — Guía clínica · DEC",
  description:
    "Referencia de analgesia multimodal ahorradora de opioides para dolor agudo postoperatorio: base con paracetamol 1 g c/6-8 h + AINE/COX-2, adyuvantes (dexametasona, ketamina 0.15-0.5 mg/kg bolo + 0.1-0.2 mg/kg/h, lidocaína IV 1-1.5 mg/kg bolo + 1-2 mg/kg/h, gabapentinoides selectivos, sulfato de magnesio, dexmedetomidina/clonidina), anestesia regional/bloqueos, opioides de rescate titulados, PCA, escalas y ERAS. Basado en PROSPECT y guía ASA/APS/ASRA 2016.",
  openGraph: {
    title: "Dolor agudo postoperatorio (multimodal) — Guía clínica · DEC",
    description:
      "Analgesia multimodal ahorradora de opioides: base paracetamol + AINE/COX-2, adyuvantes (ketamina, lidocaína IV, magnesio, alfa-2, gabapentinoides), regional, PCA y ERAS. PROSPECT · ASA/APS/ASRA.",
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
export default function DolorAgudoPostoperatorioPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat dolor-agudo-postoperatorio.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Dolor agudo postoperatorio (multimodal)
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          multimodal ahorradora de opioides · base + adyuvantes · regional/bloqueos · PCA · escalas · ERAS
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// el opioide no es una estrategia analgésica, es lo que queda cuando no montaste una"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">REFERENCIA</span>
          <span className="tag tag-muted">PROSPECT</span>
          <span className="tag tag-muted">ASA/APS/ASRA</span>
          <span className="tag tag-muted">ERAS</span>
        </div>
      </header>

      <Callout variant="info">
        <b>Principio.</b> La analgesia multimodal combina fármacos y técnicas de{" "}
        <b>mecanismos de acción distintos</b> para lograr sinergia, reducir la dosis de cada agente y{" "}
        <b>minimizar los opioides</b> (opioid-sparing) y sus efectos adversos. La base regular
        (paracetamol + AINE/COX-2 pautados, no a demanda) se complementa con adyuvantes seleccionados,
        anestesia regional/bloqueos y opioides <b>solo de rescate</b>, titulados. El objetivo es el
        control del dolor <b>funcional</b> (permitir respirar, toser, movilizar), no la EVA cero.
      </Callout>
      <Src>Chou R, et al. (ASA/APS/ASRA). J Pain 2016;17(2):131-157. · Joshi GP, Kehlet H. PROSPECT.</Src>

      {/* ========================================================= */}
      <Section n="01" title="Base analgésica — paracetamol + AINE/COX-2">
        <P>
          La columna vertebral del esquema es el <b>paracetamol pautado</b> combinado con un{" "}
          <b>AINE o inhibidor selectivo de COX-2</b> (salvo contraindicación). Ambos se administran de
          forma <b>regular y programada</b>, no a demanda, para mantener niveles analgésicos estables y
          reducir el consumo de opioides. Esta combinación es más eficaz que cualquiera de los dos por
          separado.
        </P>
        <Table
          headers={["Fármaco", "Dosis", "Nota"]}
          accentCol={1}
          rows={[
            [
              "Paracetamol",
              "1 g IV/VO c/6-8 h (máx. 4 g/día; ≤ 3 g/día si peso bajo, hepatopatía, alcohol)",
              "Base regular. Reducir en insuficiencia hepática y peso < 50 kg.",
            ],
            [
              "AINE no selectivo",
              "Ketorolaco 15-30 mg IV c/6 h (máx. 5 días) · ibuprofeno 400-600 mg c/6-8 h · diclofenaco",
              "Potente ahorrador de opioides. Vigilar sangrado, renal, GI.",
            ],
            [
              "COX-2 selectivo",
              "Celecoxib 200-400 mg · parecoxib 40 mg IV",
              "Menor riesgo de sangrado/GI; preferible si riesgo hemorrágico.",
            ],
          ]}
        />
        <Src>Chou R, et al. J Pain 2016;17(2):131-157. · PROSPECT (paracetamol + AINE/COX-2 como base).</Src>
        <Callout variant="warn">
          <b>Contraindicaciones de AINE/COX-2:</b> insuficiencia renal, hipovolemia/hipoperfusión,
          sangrado activo o riesgo hemorrágico alto, úlcera péptica, ciertas anastomosis GI (según
          cirujano), alergia, insuficiencia cardíaca descompensada. En estos casos mantener paracetamol
          y reforzar con adyuvantes y regional.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Adyuvantes sistémicos ahorradores de opioides">
        <P>
          Sobre la base se añaden <b>adyuvantes seleccionados</b> según el paciente y el procedimiento.
          No se usan todos a la vez: se eligen los que aportan a ese caso concreto (dolor de gran
          intensidad, componente neuropático, tolerancia a opioides, contraindicación de AINE). Las
          dosis siguientes son <b>perioperatorias</b>, con transición a la fase postoperatoria según
          protocolo.
        </P>
        <Table
          headers={["Adyuvante", "Dosis", "Rol / evidencia"]}
          accentCol={1}
          rows={[
            [
              "Dexametasona",
              "0.1-0.2 mg/kg IV (≈ 4-10 mg) dosis única perioperatoria",
              "Antiemético + analgésico ahorrador de opioides. Vigilar glucemia.",
            ],
            [
              "Ketamina (dosis baja)",
              "Bolo 0.15-0.5 mg/kg IV, infusión 0.1-0.2 mg/kg/h intra/postoperatoria",
              "Antagonista NMDA. Útil en dolor intenso, tolerantes a opioides, cirugía mayor.",
            ],
            [
              "Lidocaína IV perioperatoria",
              "Bolo 1-1.5 mg/kg IV, infusión 1-2 mg/kg/h",
              "Analgésico, antihiperalgésico, procinético. Sobre todo en cirugía abdominal.",
            ],
            [
              "Gabapentinoides (selectivos)",
              "Gabapentina 100-300 mg o pregabalina 75-150 mg VO preop, uso selectivo",
              "Componente neuropático / crónico. NO de rutina: sedación y depresión respiratoria.",
            ],
            [
              "Sulfato de magnesio",
              "Bolo 30-50 mg/kg IV, ± infusión 8-15 mg/kg/h",
              "Antagonista NMDA. Ahorro de opioides; vigilar bloqueo NM y bradicardia/hipotensión.",
            ],
            [
              "Alfa-2 (dexmedetomidina)",
              "Dexmedetomidina 0.2-0.7 µg/kg/h IV (± bolo 0.5-1 µg/kg lento)",
              "Analgesia, sedación cooperativa, ahorro de opioides. Vigilar bradicardia/hipotensión.",
            ],
            [
              "Alfa-2 (clonidina)",
              "1-2 µg/kg IV/neuroaxial (o VO), como adyuvante",
              "Alternativa alfa-2; prolonga bloqueos regionales como aditivo.",
            ],
          ]}
        />
        <Src>
          Chou R, et al. J Pain 2016;17(2):131-157. · Beloeil H. Best Pract Res Clin Anaesthesiol
          2019;33(3):353-360. · Weibel S, et al. (lidocaína IV) Cochrane 2018. · PROSPECT.
        </Src>
        <Callout variant="warn">
          <b>Gabapentinoides: uso selectivo, no rutinario.</b> La evidencia reciente (y la propia guía
          ASA/APS/ASRA matizada por metaanálisis posteriores) muestra beneficio analgésico marginal con{" "}
          <b>mayor sedación y depresión respiratoria</b>, especialmente combinados con opioides y en
          ancianos/apnea del sueño. Reservar para componente neuropático o dolor crónico preexistente.
        </Callout>
        <Callout variant="warn">
          <b>Lidocaína IV — seguridad.</b> Usar bomba, dosis por <b>peso ideal/ajustado</b>, monitorizar
          por toxicidad sistémica de anestésico local (LAST): acúfenos, sabor metálico, mareo,
          convulsiones, arritmia. <b>No combinar</b> con anestésico local de bloqueo/epidural sin
          contabilizar la dosis total. Precaución en hepatopatía, cardiopatía de conducción, epilepsia.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Anestesia regional y bloqueos">
        <P>
          La <b>anestesia regional</b> es el pilar más potente de la estrategia ahorradora de opioides y
          la base del enfoque <b>procedimiento-específico (PROSPECT)</b>: la mejor técnica depende de la
          cirugía. Incluye neuroaxial (epidural), bloqueos de nervio periférico y bloqueos de plano
          fascial (guiados por ecografía), en dosis única o con catéter para infusión continua.
        </P>
        <Table
          headers={["Técnica", "Ejemplos / indicación", "Nota"]}
          rows={[
            [
              "Neuroaxial (epidural)",
              "Analgesia epidural continua en cirugía torácica/abdominal mayor abierta",
              "Anestésico local ± opioide/adyuvante; vigilar hipotensión, bloqueo, anticoagulación (ASRA).",
            ],
            [
              "Bloqueo de nervio periférico",
              "Interescalénico (hombro), femoral/aductor (rodilla), ciático, etc.",
              "Dosis única o catéter perineural. Excelente ahorro de opioides en cirugía de extremidad.",
            ],
            [
              "Bloqueos de plano fascial",
              "TAP, recto anterior, ESP (erector spinae), PECS/serrato, cuadrado lumbar",
              "Guiados por ecografía; parte del abordaje PROSPECT en abdomen/tórax/mama.",
            ],
            [
              "Infiltración local",
              "Infiltración de la herida por el cirujano ± catéter de infiltración",
              "Sencilla, útil cuando no procede bloqueo mayor; complementa el esquema.",
            ],
          ]}
        />
        <Src>
          Joshi GP, Kehlet H. PROSPECT (procedimiento-específico). · Chou R, et al. J Pain 2016. · ASRA
          (anticoagulación y anestesia regional).
        </Src>
        <Callout variant="danger">
          <b>Anticoagulación y neuroaxial/bloqueos profundos.</b> Respetar los intervalos ASRA entre
          anticoagulantes/antiagregantes y la punción o retirada de catéter para evitar hematoma
          neuroaxial. Sumar siempre las dosis de anestésico local de todas las fuentes (bloqueo +
          lidocaína IV + infiltración) para no superar el umbral de <b>LAST</b>.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Opioides de rescate y PCA">
        <P>
          Con una base multimodal sólida, los opioides quedan como <b>rescate</b>, no como columna
          vertebral. Se administran <b>titulados</b> a la respuesta, con la mínima dosis eficaz, y se
          reevalúan de forma continua. La <b>PCA IV</b> (analgesia controlada por el paciente) mejora la
          titulación individual y la satisfacción en dolor moderado-intenso.
        </P>
        <Table
          headers={["Aspecto", "Detalle"]}
          rows={[
            [
              "Titulación de rescate",
              "Bolos pequeños repetidos titulados a EVA/función y sedación (p. ej. morfina 1-3 mg IV o equivalente), reevaluando entre dosis.",
            ],
            [
              "PCA IV",
              "Bolo a demanda con lockout, típicamente SIN infusión basal en naïve (menor riesgo de depresión respiratoria). Ej.: morfina bolo ~1 mg, lockout ~6-10 min.",
            ],
            [
              "Monitorización",
              "Escala de sedación + frecuencia respiratoria; la sobresedación precede a la depresión respiratoria. Precaución en apnea del sueño, obesidad, edad avanzada.",
            ],
            [
              "Vía y descenso",
              "Pasar a VO en cuanto tolere; retirar opioides pronto según el esquema multimodal. Evitar prescripción excesiva al alta.",
            ],
          ]}
        />
        <Src>Chou R, et al. (ASA/APS/ASRA). J Pain 2016;17(2):131-157. · Miller&apos;s Anesthesia, 9.ª ed.</Src>
        <Callout variant="danger">
          <b>PCA sin basal en el paciente naïve.</b> La infusión basal continua en pacientes sin
          tolerancia previa aumenta el riesgo de <b>depresión respiratoria</b> sin mejorar la analgesia.
          Vigilar sedación (no solo dolor) y sumar sedantes concomitantes (benzodiacepinas,
          gabapentinoides) que potencian la depresión respiratoria.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Evaluación del dolor — escalas">
        <P>
          Evaluar el dolor de forma <b>regular y estructurada</b>, en reposo y en movimiento (toser,
          movilizar), y <b>reevaluar tras cada intervención</b>. El objetivo es funcional: permitir la
          respiración profunda, la tos y la movilización precoz, no una EVA arbitraria de cero.
        </P>
        <Table
          headers={["Escala", "Uso"]}
          rows={[
            ["EVA / EVN (0-10)", "Autorreporte estándar en el paciente comunicativo; medir en reposo y en movimiento."],
            ["Escala verbal / caras", "Alternativa en dificultad con la numérica (ancianos, barrera idiomática)."],
            ["BPS / CPOT", "Escalas conductuales en el paciente no comunicativo/sedado/ventilado."],
            ["Función", "Capacidad de toser, respirar profundo y movilizarse: la meta terapéutica real."],
          ]}
        />
        <Src>Chou R, et al. (ASA/APS/ASRA). J Pain 2016;17(2):131-157.</Src>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Enhanced Recovery (ERAS) e integración">
        <P>
          La analgesia multimodal ahorradora de opioides es un <b>componente central de los protocolos
          ERAS</b>. El control eficaz del dolor con mínimos opioides reduce el íleo, las náuseas y la
          sedación, y habilita la <b>movilización precoz</b>, la nutrición oral temprana y la retirada
          de sondas/catéteres, acortando la estancia. La analgesia se planifica desde el preoperatorio
          (educación, base pautada, técnica regional) y no como reacción al dolor establecido.
        </P>
        <Table
          headers={["Fase", "Acción analgésica ERAS"]}
          rows={[
            ["Preoperatorio", "Educación y expectativas; iniciar base multimodal; planificar técnica regional/bloqueo."],
            ["Intraoperatorio", "Regional/bloqueo, adyuvantes (ketamina, lidocaína IV, magnesio, dexametasona), anestesia ahorradora de opioides."],
            ["Postoperatorio", "Base pautada (paracetamol + AINE/COX-2), opioide solo de rescate titulado, reevaluación regular, movilización precoz."],
          ]}
        />
        <Src>
          Ljungqvist O, Scott M, Fearon KC. ERAS. JAMA Surg 2017;152(3):292-298. · Beloeil H. Opioid-free
          anesthesia. Best Pract Res Clin Anaesthesiol 2019.
        </Src>
        <Callout variant="ok">
          <b>Planificar antes, no reaccionar después.</b> El dolor postoperatorio se previene: base
          pautada, técnica regional adecuada al procedimiento y adyuvantes elegidos por caso. Perseguir
          la función (respirar, toser, caminar) y limitar el opioide al rescate reduce complicaciones y
          acelera la recuperación.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Resumen de dosis clave">
        <Table
          headers={["Fármaco / técnica", "Dosis", "Fuente"]}
          accentCol={1}
          rows={[
            ["Paracetamol (base)", "1 g c/6-8 h (máx. 4 g/día)", "ASA/APS/ASRA · PROSPECT"],
            ["AINE (ketorolaco)", "15-30 mg IV c/6 h (máx. 5 días)", "ASA/APS/ASRA · PROSPECT"],
            ["COX-2 (celecoxib)", "200-400 mg VO", "PROSPECT"],
            ["Dexametasona", "0.1-0.2 mg/kg IV (≈ 4-10 mg) única", "ASA/APS/ASRA"],
            ["Ketamina — bolo", "0.15-0.5 mg/kg IV", "Guía dolor agudo"],
            ["Ketamina — infusión", "0.1-0.2 mg/kg/h", "Guía dolor agudo"],
            ["Lidocaína IV — bolo", "1-1.5 mg/kg IV", "Guía dolor agudo / Cochrane"],
            ["Lidocaína IV — infusión", "1-2 mg/kg/h", "Guía dolor agudo / Cochrane"],
            ["Sulfato de magnesio", "30-50 mg/kg bolo ± 8-15 mg/kg/h", "Guía dolor agudo"],
            ["Dexmedetomidina", "0.2-0.7 µg/kg/h (± bolo 0.5-1 µg/kg)", "Guía dolor agudo"],
            ["Clonidina", "1-2 µg/kg (adyuvante)", "Guía dolor agudo"],
            ["Gabapentinoides (selectivo)", "Gabapentina 100-300 mg / pregabalina 75-150 mg", "ASA/APS/ASRA (uso selectivo)"],
            ["Opioide de rescate", "Titulado a respuesta; PCA sin basal en naïve", "ASA/APS/ASRA"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Chou R, Gordon DB, de Leon-Casasola OA, et al. Management of Postoperative Pain: A Clinical Practice Guideline (ASA/APS/ASRA). J Pain 2016;17(2):131-157.</li>
          <li>Joshi GP, Kehlet H, PROSPECT Working Group. Procedure-specific pain management (PROSPECT): evidence-based, procedure-specific postoperative pain guidelines. Anaesthesia / Br J Anaesth, colección PROSPECT (prospect.esraeurope.org).</li>
          <li>Beloeil H. Opioid-free anesthesia. Best Pract Res Clin Anaesthesiol 2019;33(3):353-360.</li>
          <li>Weibel S, Jelting Y, Pace NL, et al. Continuous intravenous perioperative lidocaine infusion for postoperative pain and recovery in adults. Cochrane Database Syst Rev 2018;6:CD009642.</li>
          <li>Ljungqvist O, Scott M, Fearon KC. Enhanced Recovery After Surgery: A Review. JAMA Surg 2017;152(3):292-298.</li>
          <li>Horlocker TT, Vandermeulen E, Kopp SL, et al. Regional Anesthesia in the Patient Receiving Antithrombotic or Thrombolytic Therapy (ASRA, 4th ed.). Reg Anesth Pain Med 2018;43(3):263-309.</li>
          <li>Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — Acute Postoperative Pain.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y estrategias de literatura aceptada (PROSPECT · ASA/APS/ASRA 2016 · ERAS · Miller)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// multimodal = varios mecanismos a dosis baja; el opioide es rescate, no cimiento"}
          <br />
          {"// suma toda la dosis de anestésico local (bloqueo + lidocaína IV + infiltración): LAST no perdona"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
