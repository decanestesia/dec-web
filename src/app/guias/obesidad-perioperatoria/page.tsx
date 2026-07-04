import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — PACIENTE CON OBESIDAD MÓRBIDA PERIOPERATORIO
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: escalares de peso (PCI/PMagro/PIC/PAdj), dosis y
// umbrales tomados de guías de sociedad y literatura aceptada. Cada
// tabla/callout cita su fuente (Vancouver breve). NO inventar cifras.
// Fuentes primarias:
//  - Nightingale CE, Margarson MP, Shearer E, et al. (SOBA/AAGBI).
//    Peri-operative management of the obese surgical patient 2015.
//    Anaesthesia 2015;70(7):859-876.
//  - American Society of Anesthesiologists. Practice Guidelines for
//    the Perioperative Management of Patients with Obstructive Sleep
//    Apnea. Anesthesiology 2014;120(2):268-286.
//  - Chung F, Abdullah HR, Liao P. STOP-Bang Questionnaire. Chest
//    2016;149(3):631-638.
//  - Ingrande J, Lemmens HJM. Dose adjustment of anaesthetics in the
//    morbidly obese. Br J Anaesth 2010;105 Suppl 1:i16-i23.
//  - Miller's Anesthesia, 9.ª ed. — The Obese Patient.
// ============================================================

export const metadata: Metadata = {
  title: "Paciente con obesidad mórbida perioperatorio — Guía clínica · DEC",
  description:
    "Referencia perioperatoria del paciente con obesidad mórbida: vía aérea difícil (posición en rampa, preoxigenación con CPAP, desaturación rápida), dosificación anestésica por escalar de peso (propofol inducción por peso magro y mantenimiento por peso ajustado, succinilcolina por peso real, rocuronio por peso ideal/magro, opioides por peso magro), cribado de AOS con STOP-Bang y CPAP peri, ventilación protectora, profilaxis de TEV, posicionamiento y farmacocinética alterada. Guías SOBA/AAGBI 2015 y ASA AOS.",
  openGraph: {
    title: "Paciente con obesidad mórbida perioperatorio — Guía clínica · DEC",
    description:
      "Vía aérea en rampa, dosificación por escalar de peso, STOP-Bang y CPAP, ventilación protectora, profilaxis de TEV y farmacocinética alterada. Guías SOBA/AAGBI 2015 y ASA AOS.",
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
export default function ObesidadPerioperatoriaPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat obesidad-perioperatoria.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Paciente con obesidad mórbida perioperatorio
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          vía aérea en rampa · dosis por escalar de peso · STOP-Bang / CPAP · ventilación protectora · TEV · farmacocinética
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// la reserva de O2 se agota en segundos; la ventana de apnea segura es un lujo que aquí no tienes"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">REFERENCIA</span>
          <span className="tag tag-muted">SOBA/AAGBI 2015</span>
          <span className="tag tag-muted">ASA AOS</span>
          <span className="tag tag-muted">STOP-Bang</span>
          <span className="tag tag-muted">Miller</span>
        </div>
      </header>

      <Callout variant="info">
        <b>Definiciones y escalares de peso.</b> Obesidad = IMC ≥ 30 kg/m²; obesidad{" "}
        <b>mórbida</b> = IMC ≥ 40 (o ≥ 35 con comorbilidad). La dosificación NO se hace por{" "}
        <b>peso corporal total</b> (PCT) de forma indiscriminada: se usa el escalar apropiado a cada
        fármaco. <b>Peso corporal ideal (PCI)</b> — Devine: hombre 50 + 0.9×(cm−152); mujer 45.5 +
        0.9×(cm−152). <b>Peso magro (PMagro / lean body weight)</b> ≈ masa libre de grasa (fórmula de
        Janmahasatian). <b>Peso ajustado (PAdj)</b> = PCI + 0.4×(PCT − PCI). Elegir mal el escalar es
        sobredosificar (por PCT) o infradosificar (por PCI).
      </Callout>
      <Src>Ingrande J, Lemmens HJM. Br J Anaesth 2010;105 Suppl 1:i16-i23. · Nightingale CE, et al. (SOBA/AAGBI). Anaesthesia 2015;70(7):859-876.</Src>

      {/* ========================================================= */}
      <Section n="01" title="Vía aérea — el problema que mata primero">
        <P>
          La obesidad mórbida combina <b>dificultad de ventilación con mascarilla</b>, mayor tasa de
          <b> intubación difícil</b> y, sobre todo, <b>desaturación rápida</b>: la capacidad residual
          funcional (CRF) reducida y el consumo de O₂ aumentado acortan drásticamente la apnea segura.
          La preparación de la vía aérea no es opcional: es el eje del plan anestésico.
        </P>
        <Table
          headers={["Medida", "Detalle", "Objetivo"]}
          rows={[
            [
              "Posición en rampa (HELP)",
              "Elevar cabeza/torso hasta alinear el conducto auditivo externo con la horquilla esternal (ramp / head-elevated laryngoscopy position); usar cuñas o rampa de sábanas.",
              "Mejora la laringoscopia y la mecánica ventilatoria; retrasa la desaturación.",
            ],
            [
              "Preoxigenación con CPAP/PEEP",
              "Preoxigenar con FiO₂ 100% ≥ 3 min con CPAP 10 cmH₂O (o PEEP) en semi-sentado 25°; considerar oxigenación apneica con cánula nasal de alto flujo durante la laringoscopia.",
              "Maximiza el reservorio de O₂ y la CRF antes de la apnea.",
            ],
            [
              "Anticipar VAD",
              "Plan A/B/C explícito, videolaringoscopio de primera elección, dispositivo supraglótico de rescate y kit de vía aérea quirúrgica accesibles; segundo operador.",
              "El fallo de intubación en el obeso deja poco margen antes de la hipoxemia.",
            ],
            [
              "Riesgo de aspiración",
              "Valorar RSI/inducción de secuencia rápida modificada si reflujo/hernia hiatal; el vaciamiento gástrico está preservado en el obeso en ayuno, pero el volumen residual puede ser mayor.",
              "Proteger la vía aérea sin prolongar la apnea.",
            ],
          ]}
        />
        <Src>
          Nightingale CE, et al. (SOBA/AAGBI). Anaesthesia 2015;70(7):859-876. · Frerk C, et al. (DAS)
          intubación difícil 2015. Br J Anaesth 2015;115(6):827-848.
        </Src>
        <Callout variant="danger">
          <b>Desaturación rápida.</b> En el paciente con obesidad mórbida la SpO₂ cae en segundos, no
          en minutos: la CRF baja, el shunt y el alto consumo de O₂ eliminan la reserva. Preoxigenar en{" "}
          <b>rampa + CPAP + semi-sentado</b> y tener el rescate de vía aérea preparado{" "}
          <b>antes</b> de inducir. No se improvisa la vía aérea difícil sobre un pulmón que ya está
          desaturando.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Dosificación por escalar de peso">
        <P>
          Regla operativa: los fármacos <b>hidrofílicos</b> y los relajantes se dosifican por pesos
          bajos (PCI/PMagro) porque su volumen de distribución no crece proporcionalmente con la grasa;
          la <b>succinilcolina</b> es la excepción (se dosifica por PCT por la pseudocolinesterasa y el
          volumen de líquido extracelular aumentados). Los anestésicos <b>lipofílicos</b> requieren más
          matiz: bolo de inducción por peso bajo, pero acumulación con dosis repetidas/infusión.
        </P>
        <Table
          headers={["Fármaco", "Escalar de peso", "Nota"]}
          accentCol={1}
          rows={[
            [
              "Propofol — inducción",
              "Peso magro (PMagro / LBW)",
              "El bolo por PCT sobredosifica y causa colapso hemodinámico. Titular al efecto.",
            ],
            [
              "Propofol — mantenimiento (TIVA)",
              "Peso ajustado (PAdj)",
              "El aclaramiento en infusión escala mejor con PAdj que con PMagro; titular con BIS.",
            ],
            [
              "Succinilcolina",
              "Peso corporal total (PCT / real)",
              "Excepción: dosis 1–1.5 mg/kg por PCT (↑ actividad de pseudocolinesterasa y ↑ volumen extracelular).",
            ],
            [
              "Rocuronio (y BNM no despolarizantes)",
              "Peso ideal / magro (PCI / PMagro)",
              "Dosificar por PCT prolonga marcadamente el bloqueo. Monitorizar TOF siempre.",
            ],
            [
              "Opioides (fentanilo, remifentanilo, morfina)",
              "Peso magro (PMagro / LBW)",
              "Remifentanilo por PMagro; opioides por PCT amplifican la depresión respiratoria postoperatoria.",
            ],
            [
              "Anestésicos volátiles",
              "Titular al efecto (CAM)",
              "Preferir agentes de baja solubilidad (desflurano/sevoflurano) por despertar más rápido.",
            ],
          ]}
        />
        <Src>
          Ingrande J, Lemmens HJM. Br J Anaesth 2010;105 Suppl 1:i16-i23. · Nightingale CE, et al.
          (SOBA/AAGBI). Anaesthesia 2015;70(7):859-876. · Miller&apos;s Anesthesia, 9.ª ed.
        </Src>
        <Callout variant="warn">
          <b>Succinilcolina = excepción por peso real.</b> Es el único caso donde se usa el{" "}
          <b>peso corporal total</b>: la pseudocolinesterasa y el volumen de líquido extracelular
          aumentan con la masa, y dosificar por peso bajo produce condiciones de intubación subóptimas.
          Dosis <b>1–1.5 mg/kg por PCT</b>. El resto de relajantes NO despolarizantes van por PCI/PMagro.
        </Callout>
        <Callout variant="danger">
          <b>Opioides por peso magro, no por peso real.</b> Dosificar opioides por PCT en el paciente con
          obesidad mórbida y AOS multiplica el riesgo de <b>depresión respiratoria y apnea
          postoperatoria</b>. Preferir estrategia <b>opioid-sparing</b> (analgesia multimodal,
          regional, dexmedetomidina, AINE/paracetamol) y titular al efecto.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Apnea obstructiva del sueño (AOS) — cribado y CPAP">
        <P>
          La AOS es muy prevalente y a menudo no diagnosticada en obesidad mórbida, y es un{" "}
          <b>predictor independiente</b> de complicaciones respiratorias perioperatorias. El cribado con{" "}
          <b>STOP-Bang</b> estratifica el riesgo de forma rápida. Los pacientes con CPAP domiciliaria
          deben <b>traer y usar su equipo</b> en el perioperatorio.
        </P>
        <Table
          headers={["STOP-Bang", "Ítem", "Punto (1 si sí)"]}
          accentCol={2}
          rows={[
            ["S", "Snoring — ronquido fuerte", "1"],
            ["T", "Tiredness — cansancio/somnolencia diurna", "1"],
            ["O", "Observed — apneas observadas", "1"],
            ["P", "Pressure — HTA (tratada o no)", "1"],
            ["B", "BMI — IMC > 35 kg/m²", "1"],
            ["A", "Age — edad > 50 años", "1"],
            ["N", "Neck — circunferencia cuello > 40 cm", "1"],
            ["G", "Gender — sexo masculino", "1"],
          ]}
        />
        <Src>Chung F, Abdullah HR, Liao P. STOP-Bang. Chest 2016;149(3):631-638.</Src>
        <Table
          headers={["Puntuación STOP-Bang", "Riesgo de AOS", "Conducta"]}
          accentCol={0}
          rows={[
            ["0–2", "Bajo", "Manejo estándar; vigilancia respiratoria rutinaria."],
            ["3–4", "Intermedio", "Precaución con opioides/sedantes; monitorización postoperatoria reforzada."],
            ["5–8", "Alto", "Alta sospecha de AOS moderada-grave: minimizar opioides, CPAP peri, monitorización prolongada de SpO₂/capnografía."],
          ]}
        />
        <Src>
          Chung F, et al. Chest 2016;149(3):631-638. · American Society of Anesthesiologists. Practice
          Guidelines for Perioperative Management of Patients with OSA. Anesthesiology 2014;120(2):268-286.
        </Src>
        <Callout variant="warn">
          <b>CPAP perioperatoria.</b> Continuar la CPAP domiciliaria hasta el traslado a quirófano y
          reinstaurarla precozmente en recuperación (incluida la reanudación postextubación) reduce
          eventos de desaturación. El paciente <b>trae su equipo y sus parámetros</b>. Evitar
          benzodiacepinas/sedación profunda no vigilada; monitorización con oximetría continua ±
          capnografía en la sala.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Ventilación protectora intraoperatoria">
        <P>
          La obesidad reduce la CRF y la distensibilidad, favorece las atelectasias y el shunt. La
          estrategia ventilatoria protectora se dosifica por <b>peso corporal ideal</b> (el pulmón no
          crece con la grasa), con PEEP y maniobras de reclutamiento para contrarrestar el colapso
          alveolar.
        </P>
        <Table
          headers={["Parámetro", "Ajuste", "Nota"]}
          accentCol={1}
          rows={[
            [
              "Volumen tidal (Vt)",
              "6–8 mL/kg de PESO IDEAL",
              "Nunca por PCT: dosificar por peso real hiperinsufla y lesiona el pulmón.",
            ],
            [
              "PEEP",
              "Aplicar PEEP (típico 5–10 cmH₂O, individualizar)",
              "Contrarresta atelectasias; combinar con reclutamiento tras la intubación.",
            ],
            [
              "Maniobras de reclutamiento",
              "Reclutar tras intubación y según desreclutamiento",
              "Reabren alveolos colapsados; seguir de PEEP para mantener apertura.",
            ],
            [
              "Presión meseta",
              "< 30 cmH₂O",
              "Vigilar; la presión de conducción (driving pressure) baja se asocia a mejor desenlace.",
            ],
            [
              "Posición",
              "Anti-Trendelenburg / semi-sentado cuando sea posible",
              "Descarga el peso abdominal del diafragma y mejora la CRF.",
            ],
          ]}
        />
        <Src>
          Nightingale CE, et al. (SOBA/AAGBI). Anaesthesia 2015;70(7):859-876. · Miller&apos;s
          Anesthesia, 9.ª ed. — The Obese Patient.
        </Src>
        <Callout variant="info">
          Prevenir atelectasias es más eficaz que tratarlas: preoxigenar con CPAP, reclutar tras
          intubar, mantener PEEP y extubar semi-sentado. La posición anti-Trendelenburg alivia la
          presión abdominal sobre el diafragma y mejora la mecánica.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Profilaxis de tromboembolismo venoso (TEV)">
        <P>
          La obesidad es un factor de riesgo protrombótico independiente; sumada a cirugía e
          inmovilidad, eleva el riesgo de TVP/TEP. La profilaxis combina medidas mecánicas y
          farmacológicas, con <b>ajuste de dosis</b> de la heparina de bajo peso molecular (HBPM) al
          peso, y <b>movilización precoz</b> como pilar.
        </P>
        <Table
          headers={["Medida", "Detalle", "Nota"]}
          rows={[
            [
              "Mecánica",
              "Compresión neumática intermitente y/o medias de compresión graduada intraoperatorias y hasta la movilización.",
              "Iniciar en quirófano; especialmente útil mientras la farmacológica no está en régimen pleno.",
            ],
            [
              "Farmacológica (HBPM)",
              "HBPM a dosis profiláctica ajustada al peso/riesgo; en obesidad mórbida considerar dosis mayores o guiadas por anti-Xa según protocolo.",
              "La dosis fija estándar puede infradosificar; individualizar con protocolo institucional.",
            ],
            [
              "Movilización precoz",
              "Deambulación tan pronto como sea seguro.",
              "Pilar de la prevención; reduce estasis venosa.",
            ],
            [
              "Neuroeje y HBPM",
              "Respetar intervalos de seguridad entre HBPM y punción/retirada de catéter neuroaxial.",
              "El ajuste al alza de HBPM obliga a recalcular los tiempos de seguridad (guías ASRA/ESAIC).",
            ],
          ]}
        />
        <Src>
          Nightingale CE, et al. (SOBA/AAGBI). Anaesthesia 2015;70(7):859-876. · Guías de tromboprofilaxis
          en cirugía (ajuste de HBPM al peso).
        </Src>
        <Callout variant="warn">
          La <b>dosis profiláctica fija</b> de HBPM puede quedar corta en obesidad mórbida: valorar
          ajuste al peso o monitorización de anti-Xa según el protocolo local. Cualquier aumento de
          dosis obliga a revisar los <b>intervalos de seguridad</b> frente a técnicas neuroaxiales.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Posicionamiento y logística de quirófano">
        <P>
          El paciente con obesidad mórbida requiere <b>planificación física</b>: capacidad de la mesa,
          transferencia segura, protección de puntos de presión y prevención de lesiones nerviosas y
          rabdomiólisis por presión, con especial atención a la rampa mantenida durante la inducción y
          la extubación.
        </P>
        <Table
          headers={["Aspecto", "Recomendación práctica"]}
          rows={[
            [
              "Mesa y equipo",
              "Confirmar capacidad de peso de la mesa quirúrgica, extensores, brazaletes de tensión de tamaño adecuado y equipo de transferencia (tabla deslizante, elevador).",
            ],
            [
              "Protección de presión",
              "Acolchar puntos de apoyo; el peso sobre tejidos aumenta el riesgo de úlceras, neuropraxia y rabdomiólisis (vigilar CK/mioglobina en cirugías largas).",
            ],
            [
              "Posición para inducción/extubación",
              "Mantener rampa/semi-sentado en inducción y extubar sentado o semi-sentado y despierto, con el paciente capaz de proteger su vía aérea.",
            ],
            [
              "Accesos",
              "El acceso venoso y arterial puede ser difícil: considerar ecoguía precozmente; presión no invasiva poco fiable si el brazalete no ajusta → valorar línea arterial.",
            ],
          ]}
        />
        <Src>Nightingale CE, et al. (SOBA/AAGBI). Anaesthesia 2015;70(7):859-876.</Src>
        <Callout variant="ok">
          Extubar <b>despierto, semi-sentado y con la CPAP a mano</b>. La reinstauración precoz de la
          presión positiva y una posición que descargue el diafragma son la mejor prevención de la
          obstrucción y la hipoxemia postextubación.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Farmacocinética alterada">
        <P>
          La obesidad modifica cada compartimento farmacocinético: aumenta el volumen de distribución de
          los fármacos <b>lipofílicos</b>, incrementa gasto cardíaco y volumen sanguíneo, altera el
          aclaramiento hepático/renal y prolonga la vida media de contexto sensible de los agentes que
          se acumulan en grasa. De ahí la lógica de los escalares de peso de §2.
        </P>
        <Table
          headers={["Parámetro FC", "Efecto en obesidad", "Implicación"]}
          rows={[
            [
              "Volumen de distribución (Vd)",
              "↑ para lipofílicos (se reparten en grasa); menos cambio para hidrofílicos.",
              "Bolo por peso bajo; cuidado con acumulación en infusión/dosis repetidas.",
            ],
            [
              "Gasto cardíaco / volemia",
              "↑ absolutos.",
              "Circulación del fármaco alterada; titular al efecto, no a una cifra fija.",
            ],
            [
              "Aclaramiento",
              "Variable: puede ↑ (mayor flujo hepático/renal) o ↓ (esteatosis, ERC).",
              "Vida media de contexto prolongada de agentes lipofílicos acumulados.",
            ],
            [
              "Unión a proteínas",
              "Cambios en albúmina/α1-glicoproteína ácida.",
              "Fracción libre alterada de algunos fármacos.",
            ],
          ]}
        />
        <Src>
          Ingrande J, Lemmens HJM. Br J Anaesth 2010;105 Suppl 1:i16-i23. · Miller&apos;s Anesthesia,
          9.ª ed. — The Obese Patient.
        </Src>
        <Callout variant="info">
          Preferir fármacos de <b>despertar rápido y baja acumulación</b>: remifentanilo (por PMagro),
          agentes volátiles de baja solubilidad (desflurano/sevoflurano) y relajantes con reversión
          fiable (sugammadex para rocuronio, con monitorización TOF y reversión completa antes de
          extubar).
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Resumen de dosis y escalares clave">
        <Table
          headers={["Parámetro", "Escalar / valor", "Fuente"]}
          accentCol={1}
          rows={[
            ["Propofol — inducción", "Peso magro (PMagro)", "Ingrande/Lemmens"],
            ["Propofol — mantenimiento (TIVA)", "Peso ajustado (PAdj)", "Ingrande/Lemmens"],
            ["Succinilcolina", "1–1.5 mg/kg por PESO REAL (PCT)", "Ingrande/Lemmens"],
            ["Rocuronio / BNM no despolarizantes", "Peso ideal / magro (PCI / PMagro)", "SOBA 2015"],
            ["Opioides (fentanilo/remifentanilo/morfina)", "Peso magro (PMagro)", "Ingrande/Lemmens"],
            ["Preoxigenación", "FiO₂ 100% + CPAP 10 cmH₂O, semi-sentado 25°, en rampa", "SOBA 2015"],
            ["Vt intraoperatorio", "6–8 mL/kg de PESO IDEAL + PEEP", "SOBA 2015"],
            ["Presión meseta", "< 30 cmH₂O", "SOBA 2015"],
            ["Cribado de AOS", "STOP-Bang (≥ 3 riesgo intermedio, ≥ 5 alto)", "Chung 2016"],
            ["CPAP", "Continuar peri y reinstaurar postextubación", "ASA AOS 2014"],
            ["TEV", "Mecánica + HBPM ajustada al peso + movilización precoz", "SOBA 2015"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="09" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Nightingale CE, Margarson MP, Shearer E, et al. Peri-operative management of the obese surgical patient 2015 (SOBA/AAGBI). Anaesthesia 2015;70(7):859-876.</li>
          <li>American Society of Anesthesiologists Task Force. Practice Guidelines for the Perioperative Management of Patients with Obstructive Sleep Apnea. Anesthesiology 2014;120(2):268-286.</li>
          <li>Chung F, Abdullah HR, Liao P. STOP-Bang Questionnaire: A Practical Approach to Screen for Obstructive Sleep Apnea. Chest 2016;149(3):631-638.</li>
          <li>Ingrande J, Lemmens HJM. Dose adjustment of anaesthetics in the morbidly obese. Br J Anaesth 2010;105 Suppl 1:i16-i23.</li>
          <li>Frerk C, Mitchell VS, McNarry AF, et al. Difficult Airway Society 2015 guidelines for management of unanticipated difficult intubation in adults. Br J Anaesth 2015;115(6):827-848.</li>
          <li>Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — The Obese Patient.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// escalares y dosis de literatura aceptada (SOBA/AAGBI 2015 · ASA AOS · STOP-Bang · Ingrande/Lemmens · Miller)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// el escalar de peso importa: succinilcolina por peso real, casi todo lo demás por peso bajo"}
          <br />
          {"// preoxigena en rampa como si la apnea segura no existiera, porque casi no existe"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
