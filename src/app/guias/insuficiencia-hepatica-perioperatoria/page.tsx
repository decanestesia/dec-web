import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — HEPATOPATÍA / CIRROSIS PERIOPERATORIA
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: puntajes, umbrales y dosis tomados de guías
// de sociedad y literatura aceptada. Cada tabla/callout cita su
// fuente (Vancouver breve). NO inventar dosis ni umbrales.
// Fuentes primarias:
//  - Pugh RNH, et al. Transection of the oesophagus for bleeding
//    oesophageal varices. Br J Surg 1973;60(8):646-649. (Child-Pugh)
//  - Kamath PS, Wiesner RH, Malinchoc M, et al. A model to predict
//    survival in patients with end-stage liver disease (MELD).
//    Hepatology 2001;33(2):464-470.
//  - Northup PG, Garcia-Pagan JC, Garcia-Tsao G, et al. Vascular
//    Liver Disorders, Portal Vein Thrombosis, and Procedural
//    Bleeding in Patients with Liver Disease (AASLD). Hepatology
//    2021;73(1):366-413.
//  - EASL Clinical Practice Guidelines for the management of patients
//    with decompensated cirrhosis. J Hepatol 2018;69(2):406-460.
//  - Gropper MA, et al. Miller's Anesthesia, 9.ª ed. — Anesthesia
//    for Patients with Liver Disease.
//  - Stoelting's Anesthesia and Co-Existing Disease — Liver Disease.
// ============================================================

export const metadata: Metadata = {
  title: "Hepatopatía / cirrosis perioperatoria — riesgo, coagulopatía y anestesia · DEC",
  description:
    "Referencia perioperatoria de hepatopatía y cirrosis: estratificación de riesgo por Child-Pugh y MELD, coagulopatía rebalanceada (el INR no predice el sangrado), trombocitopenia, hipoalbuminemia, encefalopatía, ascitis, síndrome hepatorrenal y varices. Manejo anestésico: evitar hepatotóxicos, ajustar por metabolismo reducido, menos benzodiacepinas y opioides de acción larga, cisatracurio por eliminación de Hofmann, coagulopatía guiada por viscoelástico y evitar la hipotensión que compromete la perfusión hepática.",
  openGraph: {
    title: "Hepatopatía / cirrosis perioperatoria — riesgo, coagulopatía y anestesia · DEC",
    description:
      "Riesgo por Child-Pugh y MELD, coagulopatía rebalanceada, manejo viscoelástico, fármacos de eliminación órgano-independiente (cisatracurio) y protección de la perfusión hepática.",
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
export default function HepatopatiaPerioperatoriaPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat hepatopatia-perioperatoria.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Hepatopatía / cirrosis perioperatoria
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          riesgo Child-Pugh &amp; MELD · coagulopatía rebalanceada · viscoelástico · fármacos órgano-independientes · perfusión hepática
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// el hígado enfermo perdona poco: metaboliza lento, sangra raro y no avisa"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">REFERENCIA</span>
          <span className="tag tag-muted">Child-Pugh</span>
          <span className="tag tag-muted">MELD</span>
          <span className="tag tag-muted">AASLD 2021</span>
          <span className="tag tag-muted">Miller</span>
        </div>
      </header>

      <Callout variant="danger">
        <b>La cirrosis multiplica el riesgo quirúrgico.</b> El paciente cirrótico afronta mayor
        mortalidad perioperatoria por descompensación (insuficiencia hepática, encefalopatía, sangrado,
        síndrome hepatorrenal, sepsis). Dos ejes gobiernan la conducta: <b>estratificar el riesgo</b>{" "}
        (Child-Pugh / MELD) y <b>proteger la función hepática residual</b> — sobre todo su{" "}
        <b>perfusión</b>. La cirugía electiva se pospone o cancela en Child C / MELD alto salvo que sea
        el único recurso frente a una amenaza mayor.
      </Callout>
      <Src>
        Northup PG, et al. (AASLD). Hepatology 2021;73(1):366-413. · Gropper MA, et al. Miller&apos;s
        Anesthesia, 9.ª ed.
      </Src>

      {/* ========================================================= */}
      <Section n="01" title="Estratificación de riesgo — Child-Pugh y MELD">
        <P>
          Dos herramientas complementarias estiman el riesgo. La <b>clasificación de Child-Pugh</b>{" "}
          (Child-Turcotte-Pugh) suma 5 variables (bilirrubina, albúmina, INR, ascitis, encefalopatía) en
          clases A/B/C. El <b>MELD</b> (bilirrubina, INR, creatinina; el MELD-Na añade sodio) es una
          escala continua validada para mortalidad y se correlaciona con el desenlace quirúrgico.
        </P>
        <Table
          headers={["Variable", "1 punto", "2 puntos", "3 puntos"]}
          rows={[
            ["Bilirrubina (mg/dL)", "< 2", "2–3", "> 3"],
            ["Albúmina (g/dL)", "> 3.5", "2.8–3.5", "< 2.8"],
            ["INR", "< 1.7", "1.7–2.3", "> 2.3"],
            ["Ascitis", "Ausente", "Leve / controlada", "Refractaria"],
            ["Encefalopatía", "Ausente", "Grado I–II", "Grado III–IV"],
          ]}
        />
        <Src>Pugh RNH, et al. Br J Surg 1973;60(8):646-649.</Src>
        <Table
          headers={["Clase Child-Pugh", "Puntos", "Riesgo quirúrgico"]}
          accentCol={0}
          rows={[
            ["A", "5–6", "Bajo — bien compensado; cirugía electiva generalmente tolerada."],
            ["B", "7–9", "Intermedio — optimizar; sopesar riesgo/beneficio; evitar cirugía mayor no esencial."],
            ["C", "10–15", "Alto — mortalidad perioperatoria muy elevada; solo cirugía imprescindible / vital."],
          ]}
        />
        <Src>Pugh RNH, et al. Br J Surg 1973;60(8):646-649. · Kamath PS, et al. (MELD). Hepatology 2001;33(2):464-470.</Src>
        <Callout variant="warn">
          <b>MELD como umbral operativo.</b> El riesgo perioperatorio sube de forma continua con el MELD.
          Como regla práctica ampliamente citada: <b>MELD &lt; 10</b> riesgo aceptable, <b>MELD 10–15</b>{" "}
          riesgo intermedio (optimizar), <b>MELD &gt; 15</b> riesgo alto — la cirugía mayor electiva se
          reconsidera y se busca alternativa o traslado a centro con hepatología/trasplante. Los
          calculadores específicos (VOCAL-Penn, Mayo) afinan la predicción.
        </Callout>
        <Callout variant="info">
          Child-Pugh y MELD estratifican; <b>no sustituyen</b> la valoración de la reserva funcional real,
          la urgencia, el tipo de cirugía (abdominal/cardíaca &gt; periférica) ni la presencia de
          hipertensión portal clínicamente significativa (varices, ascitis, esplenomegalia).
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Coagulopatía rebalanceada — el INR no predice el sangrado">
        <P>
          El cirrótico <b>no está autoanticoagulado</b>: la hemostasia está <b>rebalanceada</b>. El
          hígado enfermo produce menos factores procoagulantes <b>y</b> menos anticoagulantes naturales
          (proteína C/S, antitrombina), con niveles de factor VIII y von Willebrand a menudo altos. El
          equilibrio es frágil pero real, y puede inclinarse tanto al sangrado como a la{" "}
          <b>trombosis</b> (p. ej. trombosis portal).
        </P>
        <Callout variant="danger">
          <b>El INR NO refleja el riesgo hemorrágico</b> en la enfermedad hepática. Mide solo la vía
          procoagulante y ignora la caída paralela de anticoagulantes; un INR «elevado» <b>no</b> predice
          sangrado ni justifica corregirlo con plasma antes de un procedimiento. Transfundir plasma para
          «normalizar el INR» aporta volumen (empeora la hipertensión portal), no corrige la hemostasia
          real y expone a TRALI/TACO. <b>No transfundir por un número.</b>
        </Callout>
        <Src>
          Northup PG, et al. (AASLD). Hepatology 2021;73(1):366-413. · Lisman T, Porte RJ. Rebalanced
          hemostasis in liver disease. Blood 2010;116(6):878-885.
        </Src>
        <Table
          headers={["Alteración", "Detalle", "Implicación"]}
          rows={[
            [
              "Trombocitopenia",
              "Secuestro esplénico (hiperesplenismo) + ↓ trombopoyetina; a menudo 50–100 ×10⁹/L.",
              "Umbral de transfusión guiado por procedimiento/sangrado, no profiláctico universal.",
            ],
            [
              "Hipofibrinogenemia",
              "Síntesis reducida; disfibrinogenemia en cirrosis avanzada.",
              "Objetivo funcional > 100–150 mg/dL (o FIBTEM bajo) para sangrado activo.",
            ],
            [
              "INR / TP prolongado",
              "Refleja déficit procoagulante, NO el balance neto ni el riesgo de sangrado.",
              "No corregir de forma profiláctica; no usar como gatillo de plasma.",
            ],
            [
              "Estado protrombótico",
              "↓ anticoagulantes naturales, ↑ FVIII/vWF; riesgo de trombosis venosa/portal.",
              "Considerar profilaxis de ETV según riesgo; la coagulopatía no protege de la trombosis.",
            ],
          ]}
        />
        <Src>
          Northup PG, et al. (AASLD). Hepatology 2021;73(1):366-413. · Tripodi A, Mannucci PM. N Engl J
          Med 2011;365(2):147-156.
        </Src>
        <Callout variant="ok">
          <b>Transfundir por sangrado y viscoelástica, no por laboratorio estático.</b> Reservar
          plaquetas/fibrinógeno/plasma para <b>sangrado activo</b> o procedimientos de alto riesgo, y
          guiar la reposición por tromboelastografía (ver §3). Considerar además análogos de
          trombopoyetina (avatrombopag/lusutrombopag) para elevar plaquetas antes de procedimientos
          programados en trombocitopenia grave, evitando transfusión.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Manejo de la coagulopatía guiado por viscoelástico">
        <P>
          Las pruebas <b>viscoelásticas</b> (TEG / ROTEM) evalúan la hemostasia global en tiempo real —
          formación, fuerza y estabilidad del coágulo— y guían una reposición <b>dirigida por objetivo</b>{" "}
          que reduce transfusión innecesaria frente a los umbrales fijos de coagulación convencional.
          Son la herramienta de elección para la coagulopatía del hepatópata que sangra.
        </P>
        <Table
          headers={["Parámetro anómalo", "Componente deficitario", "Corrección dirigida"]}
          accentCol={2}
          rows={[
            [
              "R (TEG) / CT (ROTEM) prolongado",
              "Factores de coagulación",
              "Plasma / concentrado de complejo protrombínico (PCC) si sangrado activo.",
            ],
            [
              "MA (TEG) / MCF (ROTEM) bajo — FIBTEM bajo",
              "Fibrinógeno",
              "Concentrado de fibrinógeno o crioprecipitado; objetivo funcional > 100–150 mg/dL.",
            ],
            [
              "MA / MCF bajo con FIBTEM normal",
              "Plaquetas",
              "Concentrado de plaquetas si sangrado y recuento bajo (guiado por procedimiento).",
            ],
            [
              "LY30 / ML elevado (fibrinólisis)",
              "Hiperfibrinólisis",
              "Antifibrinolítico (ácido tranexámico) SOLO si hiperfibrinólisis demostrada y sangrado.",
            ],
          ]}
        />
        <Src>
          Northup PG, et al. (AASLD). Hepatology 2021;73(1):366-413. · De Pietri L, et al. Thrombelastography
          guided transfusion in cirrhosis. Hepatology 2016;63(2):566-573.
        </Src>
        <Callout variant="info">
          <b>Antifibrinolíticos con criterio.</b> El ácido tranexámico se reserva para{" "}
          <b>hiperfibrinólisis confirmada</b> con sangrado; no se administra de rutina profiláctica en el
          hepatópata (el balance rebalanceado incluye tanto hipo- como hiperfibrinólisis según el caso).
        </Callout>
        <Callout variant="warn">
          <b>PCC:</b> corrige el déficit de factores con poco volumen (ventaja frente al plasma en el
          cirrótico con hipertensión portal), pero <b>carece de anticoagulantes naturales</b> y puede
          empujar hacia la trombosis en un paciente ya protrombótico. Dosis conservadora, guiada por
          sangrado y viscoelástica, no por INR.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Manifestaciones sistémicas y su manejo perioperatorio">
        <P>
          La cirrosis descompensada afecta a casi todos los órganos. Cada síndrome tiene implicaciones
          anestésicas específicas que condicionan monitorización, fármacos y objetivos hemodinámicos.
        </P>
        <Table
          headers={["Síndrome", "Sustrato / clínica", "Implicación perioperatoria"]}
          rows={[
            [
              "Hipoalbuminemia",
              "↓ síntesis; ↓ presión oncótica; ↑ fracción libre de fármacos ligados a proteínas.",
              "Mayor efecto de fármacos altamente ligados (benzodiacepinas, algunos opioides); ajustar dosis; edema/ascitis.",
            ],
            [
              "Encefalopatía hepática",
              "Hiperamonemia; sensibilidad aumentada a sedantes; precipitada por hemorragia GI, sepsis, hipopotasemia, estreñimiento.",
              "Minimizar sedantes de acción larga; corregir precipitantes; lactulosa/rifaximina; cuidado con benzodiacepinas.",
            ],
            [
              "Ascitis",
              "Hipertensión portal + retención de sodio/agua; restricción diafragmática; riesgo de PBE.",
              "Puede requerir paracentesis; vigilar función renal e hipovolemia por diuréticos; profilaxis de PBE si indicada.",
            ],
            [
              "Síndrome hepatorrenal (SHR)",
              "Insuficiencia renal funcional por vasoconstricción renal en vasodilatación esplácnica.",
              "Evitar nefrotóxicos (AINE, contraste, aminoglucósidos) e hipovolemia; albúmina + vasoconstrictor (terlipresina/noradrenalina).",
            ],
            [
              "Varices esofagogástricas",
              "Hipertensión portal; riesgo de hemorragia masiva.",
              "Sonda NG/instrumentación esofágica con cautela; profilaxis con betabloqueo no selectivo según hepatología.",
            ],
            [
              "Circulación hiperdinámica",
              "Gasto cardíaco alto, RVS baja; miocardiopatía cirrótica (respuesta contráctil limitada al estrés).",
              "Hipotensión mal tolerada; respuesta inotrópica/cronotrópica atenuada; vigilar QT largo.",
            ],
            [
              "Síndrome hepatopulmonar",
              "Dilataciones vasculares intrapulmonares → hipoxemia (ortodeoxia).",
              "Puede necesitar FiO₂ elevada; hipoxemia que no responde como se espera al O₂.",
            ],
          ]}
        />
        <Src>
          EASL. J Hepatol 2018;69(2):406-460. · Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. ·
          Hines RL, Marschall KE. Stoelting&apos;s Anesthesia and Co-Existing Disease.
        </Src>
        <Callout variant="warn">
          <b>Síndrome hepatorrenal.</b> Es una insuficiencia renal <b>funcional</b> y potencialmente
          reversible: el pilar es <b>albúmina + vasoconstrictor esplácnico</b> (terlipresina donde esté
          disponible, o noradrenalina) y evitar todo insulto renal añadido. La hipovolemia perioperatoria
          y los nefrotóxicos pueden precipitarlo o agravarlo.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Farmacología anestésica — metabolismo reducido">
        <P>
          El aclaramiento hepático está disminuido y el volumen de distribución alterado (ascitis,
          hipoalbuminemia): muchos fármacos ven <b>prolongada su vida media</b> y aumentado su efecto. La
          regla es <b>titular a efecto</b>, reducir dosis, evitar acumulación y preferir agentes de{" "}
          <b>eliminación independiente del hígado</b>.
        </P>
        <Table
          headers={["Grupo", "Recomendación", "Detalle"]}
          rows={[
            [
              "Benzodiacepinas",
              "Minimizar / evitar de acción larga",
              "Aclaramiento reducido + sensibilidad cerebral aumentada → precipitan y prolongan encefalopatía. Preferir dosis mínima titulada.",
            ],
            [
              "Opioides de acción larga",
              "Evitar; usar de acción corta titulados",
              "Morfina y metabolitos se acumulan; preferir remifentanilo (esterasas plasmáticas, aclaramiento órgano-independiente).",
            ],
            [
              "Bloqueante neuromuscular",
              "Cisatracurio preferido",
              "Eliminación de Hofmann (degradación espontánea plasma-independiente de hígado/riñón) → duración predecible. Evitar dependientes de aclaramiento hepático.",
            ],
            [
              "Hipnótico de inducción",
              "Propofol titulado / dosis reducida",
              "Aclaramiento alto y órgano-independiente relativo; despertar poco prolongado, pero titular por circulación hiperdinámica e hipotensión.",
            ],
            [
              "Halogenados",
              "Sevoflurano / isoflurano; EVITAR halotano",
              "Halotano: hepatotoxicidad. Sevoflurano e isoflurano preservan mejor el flujo hepático que agentes que lo reducen.",
            ],
            [
              "Paracetamol",
              "Cautela / dosis reducida",
              "No absolutamente contraindicado en dosis terapéuticas reducidas, pero limitar; evitar sobredosis y uso crónico alto.",
            ],
          ]}
        />
        <Src>
          Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — Anesthesia for Patients with Liver
          Disease. · Hines RL, Marschall KE. Stoelting&apos;s Anesthesia and Co-Existing Disease.
        </Src>
        <Callout variant="ok">
          <b>Cisatracurio y remifentanilo: los caballos de batalla del hepatópata.</b> El{" "}
          <b>cisatracurio</b> se degrada por <b>eliminación de Hofmann</b> (proceso químico espontáneo,
          independiente de la función hepática y renal) → bloqueo neuromuscular de duración predecible sin
          acumulación. El <b>remifentanilo</b> lo hidrolizan esterasas plasmáticas inespecíficas, también
          órgano-independiente. Ambos evitan la acumulación que castiga al hígado enfermo.
        </Callout>
        <Callout variant="danger">
          <b>Hepatotóxicos: fuera.</b> Evitar el <b>halotano</b> (hepatitis por halotano) y minimizar
          todo fármaco de metabolismo hepático que pueda acumularse o dañar. Revisar la lista completa de
          medicación por potencial hepatotóxico y ajustar/suspender lo prescindible.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Perfusión hepática — evitar la hipotensión">
        <P>
          El hígado recibe flujo dual: <b>arteria hepática</b> (~25–30%) y <b>vena porta</b> (~70–75%). En
          la cirrosis, la autorregulación y la respuesta de rescate arterial hepática (buffer response)
          están <b>deterioradas</b>: el órgano depende de forma crítica de una presión de perfusión
          adecuada. La <b>hipotensión perioperatoria compromete directamente la perfusión hepática</b> y
          puede precipitar isquemia y descompensación.
        </P>
        <Callout variant="danger">
          <b>Proteger la presión de perfusión hepática.</b> Evitar la hipotensión sostenida: mantener PAM
          adecuada, normovolemia y evitar toda maniobra que reduzca el flujo hepático (hipovolemia,
          vasodilatación profunda, presión intraabdominal alta por neumoperitoneo/retractores, PEEP
          excesiva). En el cirrótico, un episodio hipotensor «rutinario» no es benigno para el hígado.
        </Callout>
        <Table
          headers={["Objetivo", "Conducta"]}
          rows={[
            [
              "Normotensión / PAM adecuada",
              "Corregir hipotensión pronto; vasopresor (noradrenalina) para preservar presión de perfusión sin sobrecargar volumen.",
            ],
            [
              "Euvolemia guiada",
              "Reponer con criterio dinámico; evitar tanto la hipovolemia (isquemia) como la sobrecarga (ascitis, congestión, hipertensión portal).",
            ],
            [
              "Presión intraabdominal",
              "Vigilar neumoperitoneo y retracción: la presión alta reduce el flujo portal; usar la mínima presión efectiva.",
            ],
            [
              "Ventilación",
              "PEEP moderada; presiones altas ↓ retorno venoso y flujo hepático. Ventilación protectora sin exceso de presión media.",
            ],
            [
              "Evitar nefrotóxicos / hipoperfusión renal",
              "El riñón y el hígado se hunden juntos (SHR): la hipotensión que daña el hígado también gatilla el SHR.",
            ],
          ]}
        />
        <Src>
          Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — flujo hepático y buffer response. · Hines
          RL, Marschall KE. Stoelting&apos;s Anesthesia and Co-Existing Disease.
        </Src>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Resumen de puntos y objetivos clave">
        <Table
          headers={["Parámetro", "Valor / conducta", "Fuente"]}
          accentCol={1}
          rows={[
            ["Riesgo bajo", "Child A · MELD < 10", "Child-Pugh / MELD"],
            ["Riesgo intermedio", "Child B · MELD 10–15 (optimizar)", "Child-Pugh / MELD"],
            ["Riesgo alto", "Child C · MELD > 15 (solo cirugía imprescindible)", "Child-Pugh / MELD"],
            ["INR en hepatopatía", "NO predice sangrado; no corregir de forma profiláctica", "AASLD 2021"],
            ["Coagulopatía activa", "Guiar por viscoelástico (TEG/ROTEM), no por umbrales fijos", "AASLD 2021"],
            ["Fibrinógeno objetivo (sangrado)", "> 100–150 mg/dL funcional (FIBTEM)", "AASLD 2021"],
            ["Antifibrinolítico (TXA)", "Solo si hiperfibrinólisis demostrada + sangrado", "AASLD 2021"],
            ["Bloqueante neuromuscular", "Cisatracurio (eliminación de Hofmann)", "Miller / Stoelting"],
            ["Opioide", "Remifentanilo (esterasas plasmáticas); evitar acción larga", "Miller / Stoelting"],
            ["Benzodiacepinas", "Minimizar / evitar (encefalopatía)", "Miller / Stoelting"],
            ["Halogenado", "Sevoflurano/isoflurano; EVITAR halotano", "Miller / Stoelting"],
            ["Perfusión hepática", "Evitar hipotensión; mantener PAM y euvolemia", "Miller / Stoelting"],
            ["Síndrome hepatorrenal", "Albúmina + vasoconstrictor; evitar nefrotóxicos", "EASL 2018"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Pugh RNH, Murray-Lyon IM, Dawson JL, et al. Transection of the oesophagus for bleeding oesophageal varices. Br J Surg 1973;60(8):646-649.</li>
          <li>Kamath PS, Wiesner RH, Malinchoc M, et al. A model to predict survival in patients with end-stage liver disease. Hepatology 2001;33(2):464-470.</li>
          <li>Northup PG, Garcia-Pagan JC, Garcia-Tsao G, et al. Vascular Liver Disorders, Portal Vein Thrombosis, and Procedural Bleeding in Patients with Liver Disease (AASLD Practice Guidance). Hepatology 2021;73(1):366-413.</li>
          <li>European Association for the Study of the Liver. EASL Clinical Practice Guidelines for the management of patients with decompensated cirrhosis. J Hepatol 2018;69(2):406-460.</li>
          <li>Lisman T, Porte RJ. Rebalanced hemostasis in patients with liver disease: evidence and clinical consequences. Blood 2010;116(6):878-885.</li>
          <li>Tripodi A, Mannucci PM. The coagulopathy of chronic liver disease. N Engl J Med 2011;365(2):147-156.</li>
          <li>De Pietri L, Bianchini M, Montalti R, et al. Thrombelastography-guided blood product use before invasive procedures in cirrhosis. Hepatology 2016;63(2):566-573.</li>
          <li>Gropper MA, Cohen NH, Eriksson LI, et al. Miller&apos;s Anesthesia, 9.ª ed. — Anesthesia for Patients with Liver Disease.</li>
          <li>Hines RL, Marschall KE. Stoelting&apos;s Anesthesia and Co-Existing Disease — Liver Disease.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// puntajes y dosis de literatura aceptada (Child-Pugh · MELD · AASLD 2021 · EASL · Miller · Stoelting)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, hepatología ni protocolo institucional"}
          <br />
          {"// el INR alto del cirrótico no es permiso para transfundir plasma: no corrijas un número"}
          <br />
          {"// hígado enfermo = perfusión sagrada: la hipotensión de rutina aquí no es rutina"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
