import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — Delirium postoperatorio y agitación al despertar
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: dosis, escalas y umbrales tomados de guías
// de sociedad y literatura aceptada. Cada dato lleva referencia.
// No inventar cifras.
// Fuentes primarias:
//  - Aldecoa C, et al. European Society of Anaesthesiology (ESA, hoy ESAIC)
//    evidence-based and consensus-based guideline on postoperative
//    delirium. Eur J Anaesthesiol 2017;34(4):192-214.
//  - Ely EW, et al. CAM-ICU. JAMA 2001;286(21):2703-2710.
//  - Sikich N, Lerman J. PAED scale. Anesthesiology 2004;100(5):1138-1145.
//  - Devlin JW, et al. PADIS Guidelines. Crit Care Med 2018;46(9):e825-e873.
//  - Vlisides P, Avidan M. Postoperative delirium. Anesthesiology 2016;125(6):1229-1241.
// ============================================================

export const metadata: Metadata = {
  title: "Delirium postoperatorio y agitación al despertar — Guía clínica — DEC",
  description:
    "Referencia perioperatoria de delirium postoperatorio (CAM-ICU) y agitación al despertar / emergence delirium pediátrico (escala PAED): factores de riesgo, prevención (evitar benzodiacepinas y anticolinérgicos, profundidad guiada por EEG, ahorro de opioides, dexmedetomidina), manejo agudo y dosis de dexmedetomidina, haloperidol y propofol. Guía ESAIC 2017.",
  openGraph: {
    title: "Delirium postoperatorio y agitación al despertar — Guía clínica — DEC",
    description:
      "CAM-ICU, PAED, factores de riesgo, prevención y manejo agudo del delirium postoperatorio y la agitación al despertar. Dosis de dexmedetomidina y haloperidol. ESAIC 2017.",
    type: "article",
  },
};

// ------------------------------------------------------------
// Tipos de datos de la guía
// ------------------------------------------------------------
type Cell = string;

interface RefTable {
  headers: string[];
  rows: Cell[][];
}

type CalloutVariant = "info" | "warn" | "danger";

// ------------------------------------------------------------
// Colores de callout (mismo mapa que blog/[slug])
// ------------------------------------------------------------
const CALLOUT: Record<CalloutVariant, { border: string; icon: string }> = {
  info: { border: "var(--cyan)", icon: "ℹ" },
  warn: { border: "var(--amber)", icon: "⚠" },
  danger: { border: "var(--red)", icon: "⛔" },
};

// ------------------------------------------------------------
// Componentes de presentación
// ------------------------------------------------------------
function SectionHeader({ label, note }: { label: string; note?: string }) {
  return (
    <div style={{ margin: "2.5rem 0 1rem" }}>
      <h2
        className="mono"
        style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--accent)",
          margin: 0,
          paddingBottom: "0.4rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {label}
      </h2>
      {note ? (
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.58rem",
            marginTop: "0.4rem",
            opacity: 0.7,
          }}
        >
          {note}
        </p>
      ) : null}
    </div>
  );
}

function DataTable({ table }: { table: RefTable }) {
  return (
    <div
      style={{
        overflowX: "auto",
        margin: "0 0 1.25rem",
        border: "1px solid var(--border)",
      }}
    >
      <table
        style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}
      >
        <thead>
          <tr style={{ background: "var(--bg-3)" }}>
            {table.headers.map((h, i) => (
              <th
                key={i}
                className="mono"
                style={{
                  textAlign: "left",
                  padding: "0.5rem 0.7rem",
                  fontSize: "0.58rem",
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
          {table.rows.map((row, ri) => (
            <tr key={ri} style={{ borderTop: "1px solid var(--border)" }}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={ci === 0 ? "mono" : undefined}
                  style={{
                    padding: "0.5rem 0.7rem",
                    fontSize: ci === 0 ? "0.7rem" : "0.78rem",
                    verticalAlign: "top",
                    color: ci === 0 ? "var(--text-0)" : "var(--text-1)",
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
        <span style={{ color: c.border, fontSize: "0.9rem", flexShrink: 0 }}>
          {c.icon}
        </span>
        <div
          style={{
            color: "var(--text-1)",
            fontSize: "0.8rem",
            lineHeight: 1.65,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// Ficha de fármaco: panel con nombre + parámetros clave
function DrugCard({
  code,
  name,
  subtitle,
  rows,
}: {
  code: string;
  name: string;
  subtitle: string;
  rows: [string, string][];
}) {
  return (
    <div className="panel" style={{ marginBottom: "1rem" }}>
      <div className="panel-header">
        <span className="dot" /> {code} · {name}
      </div>
      <div className="panel-body" style={{ display: "grid", gap: "0.5rem" }}>
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.58rem",
            margin: "0 0 0.25rem",
            opacity: 0.75,
          }}
        >
          {subtitle}
        </p>
        {rows.map(([label, value], i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: "0.75rem",
              paddingBottom: "0.4rem",
              borderBottom:
                i === rows.length - 1 ? "none" : "1px solid var(--border)",
            }}
          >
            <span
              className="mono"
              style={{
                color: "var(--text-2)",
                fontSize: "0.62rem",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                flexShrink: 0,
                maxWidth: "42%",
              }}
            >
              {label}
            </span>
            <span
              style={{
                color: "var(--text-1)",
                fontSize: "0.78rem",
                textAlign: "right",
                lineHeight: 1.5,
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Página
// ------------------------------------------------------------
export default function DeliriumEmergenciaPage() {
  return (
    <div
      className="wrap"
      style={{ paddingTop: "1.75rem", paddingBottom: "3rem", maxWidth: 860 }}
    >
      {/* Migas */}
      <Link
        href="/guias"
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.7rem",
          textDecoration: "none",
        }}
      >
        ← /guias
      </Link>

      {/* Header estándar */}
      <div style={{ margin: "1rem 0 1.5rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat delirium-emergencia.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2 }}>
          Delirium postoperatorio y agitación al despertar
        </h1>
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.65rem",
            marginTop: "0.4rem",
            lineHeight: 1.7,
          }}
        >
          CAM-ICU · PAED · factores de riesgo · prevención · manejo agudo ·
          dexmedetomidina
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {
              "// el paciente que se arranca la vía no está 'inquieto': está diciendo algo"
            }
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">REFERENCIA</span>
          <span className="tag tag-muted">ESAIC 2017</span>
          <span className="tag tag-muted">CAM-ICU</span>
          <span className="tag tag-muted">PAED</span>
        </div>
      </div>

      {/* Aviso de encuadre */}
      <Callout variant="info">
        Son dos entidades distintas. El <b>delirium postoperatorio (DPO)</b> es un
        trastorno agudo y fluctuante de la atención y la cognición, típico de{" "}
        <b>adultos mayores</b>, que aparece en las primeras horas–días; se
        pesquisa con <b>CAM-ICU</b> o CAM. La <b>agitación al despertar</b>{" "}
        (<i>emergence delirium</i>) es un estado transitorio de agitación
        psicomotora durante la salida de la anestesia, característico del{" "}
        <b>niño</b> tras sevoflurano; se cuantifica con la escala <b>PAED</b>.
        Comparten manejo (descartar causas orgánicas primero) pero difieren en
        riesgo, curso y pronóstico.
      </Callout>

      {/* ==================== DEFINICIONES ==================== */}
      <SectionHeader
        label="1 · Delirium postop (adulto) vs agitación al despertar (niño)"
        note="// misma cara, distinto libro: uno predice mortalidad, el otro suele autolimitarse"
      />

      <DataTable
        table={{
          headers: ["Rasgo", "Delirium postop (DPO)", "Emergence delirium"],
          rows: [
            [
              "Población típica",
              "Adulto mayor (≥ 65 a), fragilidad, deterioro cognitivo previo.",
              "Pediátrico (2–7 a), preescolar; también adultos ansiosos.",
            ],
            [
              "Momento",
              "Postop inmediato hasta 5–7 días (a menudo día 1–3).",
              "En la emergencia / primeros 10–30 min tras extubar.",
            ],
            [
              "Cuadro",
              "Inatención fluctuante, pensamiento desorganizado, ± alteración de conciencia; hipo/hiper/mixto.",
              "Agitación, llanto inconsolable, no reconoce a los padres, desorientación no dirigible.",
            ],
            [
              "Herramienta",
              "CAM-ICU (intubado/UCI) o CAM / 4AT (planta).",
              "Escala PAED (≥ 10 sugiere emergence delirium).",
            ],
            [
              "Curso / pronóstico",
              "Asociado a mortalidad, estancia prolongada y deterioro cognitivo a largo plazo.",
              "Suele autolimitarse en < 30 min; riesgo de autolesión / retirada de vías durante el episodio.",
            ],
          ],
        }}
      />
      <p
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.58rem",
          margin: "-0.5rem 0 1rem",
          opacity: 0.7,
        }}
      >
        Ref: Aldecoa C, et al. ESAIC POD Guideline. Eur J Anaesthesiol
        2017;34:192-214 · Ely EW, et al. JAMA 2001;286:2703 (CAM-ICU) · Sikich N,
        Lerman J. Anesthesiology 2004;100:1138 (PAED).
      </p>

      {/* ==================== CAM-ICU ==================== */}
      <SectionHeader
        label="2 · Evaluación del DPO — CAM-ICU"
        note="// delirium = fallo agudo de atención; si no lo buscas activamente, el hipoactivo se te escapa"
      />

      <Callout variant="info">
        El <b>CAM-ICU</b> es positivo si están presentes las Características{" "}
        <b>1 y 2</b> más la <b>3 ó 4</b>. Requiere primero un nivel de conciencia
        evaluable (RASS ≥ −3; si RASS −4/−5 el paciente no es valorable). El{" "}
        <b>subtipo hipoactivo</b> es el más frecuente y el que más se pasa por
        alto en el adulto mayor.
      </Callout>

      <DataTable
        table={{
          headers: ["Característica", "Qué evalúa", "Positiva si"],
          rows: [
            [
              "1 · Inicio agudo / curso fluctuante",
              "Cambio agudo respecto al basal o fluctuación en 24 h.",
              "Presente.",
            ],
            [
              "2 · Inatención",
              "Test de letras (apretar en la 'A') o de dígitos.",
              "> 2 errores en 10 ítems.",
            ],
            [
              "3 · Nivel de conciencia alterado",
              "RASS distinto de 0 (cero).",
              "RASS ≠ 0 en el momento de la evaluación.",
            ],
            [
              "4 · Pensamiento desorganizado",
              "Preguntas sí/no y órdenes simples.",
              "> 1 error.",
            ],
          ],
        }}
      />
      <p
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.58rem",
          margin: "-0.5rem 0 1rem",
          opacity: 0.7,
        }}
      >
        Ref: Ely EW, et al. Delirium in mechanically ventilated patients
        (CAM-ICU). JAMA 2001;286(21):2703-2710 · Devlin JW, et al. PADIS
        Guidelines. Crit Care Med 2018;46:e825. La ESAIC recomienda cribado
        rutinario del DPO con una herramienta validada.
      </p>

      {/* ==================== PAED ==================== */}
      <SectionHeader
        label="3 · Agitación al despertar (pediátrico) — escala PAED"
        note="// no todo llanto es dolor, pero descarta dolor antes de llamarlo emergence delirium"
      />

      <Callout variant="info">
        La <b>Pediatric Anesthesia Emergence Delirium (PAED)</b> puntúa 5 ítems
        de 0 a 4 (rango total <b>0–20</b>). Umbral operativo habitual:{" "}
        <b>PAED ≥ 10</b> sugiere emergence delirium; puntos de corte ≥ 12 se usan
        para mayor especificidad. Los tres primeros ítems (contacto ocular,
        acciones con propósito, conciencia del entorno) son los que mejor
        discriminan del dolor.
      </Callout>

      <DataTable
        table={{
          headers: ["Ítem PAED", "Se puntúa (0–4)"],
          rows: [
            ["1 · Contacto ocular con el cuidador", "0 = mucho … 4 = nada (invertido)"],
            ["2 · Acciones con propósito", "0 = mucho … 4 = nada (invertido)"],
            ["3 · Consciente del entorno", "0 = mucho … 4 = nada (invertido)"],
            ["4 · Inquietud / intranquilidad", "0 = nada … 4 = extrema"],
            ["5 · Inconsolable", "0 = nada … 4 = extrema"],
          ],
        }}
      />
      <p
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.58rem",
          margin: "-0.5rem 0 1rem",
          opacity: 0.7,
        }}
      >
        Ref: Sikich N, Lerman J. Development and psychometric evaluation of the
        PAED scale. Anesthesiology 2004;100(5):1138-1145.
      </p>

      <Callout variant="warn">
        Antes de etiquetar <i>emergence delirium</i> en el niño, <b>descarta
        dolor</b> (la causa reversible más frecuente y confundible): un niño con
        dolor también llora inconsolable. Si hay dolor, analgésico primero, no
        sedante.
      </Callout>

      {/* ==================== FACTORES DE RIESGO ==================== */}
      <SectionHeader
        label="4 · Factores de riesgo"
        note="// la mayoría son modificables o al menos anticipables; identificarlos ES la prevención"
      />

      <DataTable
        table={{
          headers: ["Dominio", "Delirium postop (adulto)", "Emergence delirium (niño)"],
          rows: [
            [
              "Paciente",
              "Edad avanzada, deterioro cognitivo / demencia, fragilidad, depresión, déficit sensorial (visual/auditivo).",
              "Edad preescolar (2–7 a), temperamento ansioso, ansiedad preoperatoria de padre/hijo.",
            ],
            [
              "Fármacos",
              "Benzodiacepinas, anticolinérgicos, opioides a dosis altas, polifarmacia, deprivación (alcohol/BZD).",
              "Anestésicos volátiles insolubles (sevoflurano > desflurano); despertar muy rápido.",
            ],
            [
              "Basal / metabólico",
              "Deshidratación, alteraciones hidroelectrolíticas, anemia, comorbilidad (renal/hepática).",
              "Ayuno prolongado, hipoglucemia, disconfort.",
            ],
            [
              "Cirugía / entorno",
              "Cirugía mayor/urgente, cardíaca, cadera; dolor mal controlado, UCI, sueño interrumpido, sondas.",
              "ORL / oftálmica (adenoamigdalectomía, estrabismo), procedimientos cortos, despertar en entorno extraño.",
            ],
          ],
        }}
      />
      <p
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.58rem",
          margin: "-0.5rem 0 1rem",
          opacity: 0.7,
        }}
      >
        Ref: Aldecoa C, et al. ESAIC POD Guideline. Eur J Anaesthesiol
        2017;34:192-214 · Vlisides P, Avidan M. Anesthesiology 2016 · Dahmani S,
        et al. Br J Anaesth 2010;104:216 (metaanálisis emergence delirium
        pediátrico).
      </p>

      {/* ==================== PREVENCIÓN ==================== */}
      <SectionHeader
        label="5 · Prevención"
        note="// más barato y más efectivo que tratar: casi todo se juega antes de que empiece"
      />

      <Callout variant="danger">
        <b>Evitar benzodiacepinas y anticolinérgicos de acción central</b>{" "}
        (atropina, escopolamina) en el adulto mayor: son un factor de riesgo
        precipitante bien establecido de DPO. La ESAIC recomienda minimizar
        ambos y evitar la premedicación sistemática con benzodiacepinas.
      </Callout>

      <DataTable
        table={{
          headers: ["Medida", "Contenido", "Aplica a"],
          rows: [
            [
              "No benzodiacepinas / anticolinérgicos",
              "Evitar premedicación con BZD y anticolinérgicos centrales; revisar fármacos deliriógenos.",
              "Adulto mayor.",
            ],
            [
              "Profundidad guiada por EEG",
              "Monitor de profundidad (BIS/EEG procesado) para evitar anestesia excesivamente profunda; en ancianos reduce DPO.",
              "Adulto (esp. mayor).",
            ],
            [
              "Analgesia multimodal ahorradora de opioides",
              "Paracetamol, AINE, bloqueos regionales, dexametasona, lidocaína, ketamina a dosis baja; dolor controlado ↓ DPO.",
              "Ambos.",
            ],
            [
              "Dexmedetomidina",
              "Como sedante/coadyuvante (perfil no-BZD); reduce incidencia de DPO y de emergence delirium.",
              "Ambos.",
            ],
            [
              "Medidas no farmacológicas (bundle)",
              "Orientación, gafas/audífonos, movilización precoz, higiene del sueño, hidratación, evitar sondas innecesarias.",
              "Adulto (protocolo tipo HELP).",
            ],
            [
              "Optimizar la emergencia pediátrica",
              "Considerar propofol o dexmedetomidina; reunir al niño con los padres pronto; ambiente tranquilo.",
              "Niño.",
            ],
          ],
        }}
      />
      <p
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.58rem",
          margin: "-0.5rem 0 1rem",
          opacity: 0.7,
        }}
      >
        Ref: Aldecoa C, et al. ESAIC POD Guideline 2017 · Inouye SK, et al.
        (HELP) N Engl J Med 1999;340:669 · Su X, et al. Dexmedetomidina profiláctica
        y delirium postop. Lancet 2016;388:1893.
      </p>

      {/* ==================== MANEJO AGUDO ==================== */}
      <SectionHeader
        label="6 · Manejo agudo — primero descartar causas"
        note="// agitación al despertar = hipoxia hasta demostrar lo contrario; el sedante nunca es el paso 1"
      />

      <Callout variant="danger">
        Ante cualquier paciente agitado en recuperación, <b>descarta primero
        causas orgánicas reversibles</b> antes de sedar: la sedación sobre una
        hipoxia o una hipoglucemia puede ser letal.
      </Callout>

      <DataTable
        table={{
          headers: ["Causa a descartar", "Cómo", "Acción"],
          rows: [
            [
              "Hipoxia / hipercapnia",
              "SpO₂, capnografía, patrón respiratorio, vía aérea.",
              "O₂, permeabilizar vía aérea, ventilar; excluir obstrucción/curarización residual.",
            ],
            [
              "Dolor",
              "Evaluar signos de dolor; contexto quirúrgico.",
              "Analgesia (multimodal/opioide titulado); en niño, causa nº 1 confundible.",
            ],
            [
              "Globo vesical",
              "Palpación / ecografía vesical; sondaje.",
              "Descomprimir (sonda) — causa clásica y muy frecuente de agitación.",
            ],
            [
              "Hipoglucemia",
              "Glucemia capilar.",
              "Corregir glucosa; siempre medir en agitación inexplicada.",
            ],
            [
              "Otros metabólicos",
              "Na⁺, otros electrolitos, temperatura, deprivación.",
              "Corregir la alteración; revisar deprivación de alcohol/BZD.",
            ],
            [
              "No farmacológico",
              "Reorientar, ambiente calmado, presencia de familia; en niño, reunir con padres.",
              "Primera línea siempre; a menudo suficiente (esp. emergence delirium autolimitado).",
            ],
          ],
        }}
      />
      <p
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.58rem",
          margin: "-0.5rem 0 1rem",
          opacity: 0.7,
        }}
      >
        Ref: Aldecoa C, et al. ESAIC POD Guideline 2017 · Práctica de recuperación
        postanestésica (PACU) — descartar hipoxia/dolor/globo vesical antes de
        sedación farmacológica.
      </p>

      <Callout variant="warn">
        Solo tras descartar/tratar causas orgánicas y agotar medidas no
        farmacológicas se considera tratamiento farmacológico, y únicamente si
        hay <b>riesgo de daño</b> (autolesión, retirada de vías/tubo, imposibilidad
        de cuidado). No se usan fármacos para tratar el delirium <i>hipoactivo</i>.
      </Callout>

      {/* ==================== FÁRMACOS ==================== */}
      <SectionHeader
        label="7 · Fármacos en el episodio agudo"
        note="// dosis mínima eficaz, titulada; el objetivo es seguridad, no dejar al paciente inconsciente"
      />

      <DrugCard
        code="DEX"
        name="Dexmedetomidina"
        subtitle="Agonista α₂ selectivo · sedación sin depresión respiratoria significativa; también profilaxis"
        rows={[
          ["Perfusión (adulto)", "0.2–0.7 µg/kg/h IV, titular a efecto (rango hasta ~1.4)"],
          ["Bolo de carga (opcional)", "0.5–1 µg/kg IV en 10 min (vigilar bradicardia/hipotensión)"],
          ["Emergence delirium (niño)", "Rescate 0.5 µg/kg IV; profilaxis intraop ~0.3–0.5 µg/kg"],
          ["Ventaja", "No es benzodiacepina; ↓ incidencia de DPO y de emergence delirium"],
          ["Precaución", "Bradicardia e hipotensión; evitar carga rápida"],
        ]}
      />

      <DrugCard
        code="HALO"
        name="Haloperidol (dosis baja)"
        subtitle="Antipsicótico típico · para delirium hiperactivo con agitación peligrosa en el adulto"
        rows={[
          ["Dosis baja (adulto)", "0.5–1 mg IV/IM, repetible cada 15–30 min según respuesta"],
          ["Anciano", "Iniciar en el extremo bajo (0.25–0.5 mg); titular"],
          ["Indicación", "Agitación con riesgo de daño; NO para delirium hipoactivo"],
          ["Vigilar", "QTc (ECG), riesgo torsade; extrapiramidalismo"],
          ["Evidencia", "No previene ni acorta el delirium; solo control sintomático puntual"],
        ]}
      />

      <DrugCard
        code="PROP"
        name="Propofol"
        subtitle="Anestésico IV · útil para abortar la agitación pediátrica del despertar"
        rows={[
          ["Emergence delirium (niño)", "Bolo 0.5–1 mg/kg IV para abortar el episodio agudo"],
          ["Profilaxis (niño)", "~1 mg/kg IV al final de la cirugía tras sevoflurano"],
          ["Ventaja", "Rápido; reduce la agitación del despertar con volátiles"],
          ["Precaución", "Depresión respiratoria e hipotensión; requiere monitorización"],
        ]}
      />

      <p
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.58rem",
          margin: "0 0 1rem",
          opacity: 0.7,
        }}
      >
        Ref: Aldecoa C, et al. ESAIC POD Guideline. Eur J Anaesthesiol
        2017;34:192-214 · Devlin JW, et al. PADIS. Crit Care Med 2018;46:e825
        (haloperidol no previene delirium) · Dahmani S, et al. Br J Anaesth
        2010;104:216 (propofol/dexmedetomidina en emergence delirium) · Ficha
        técnica de dexmedetomidina.
      </p>

      <Callout variant="danger">
        <b>Haloperidol:</b> no acorta ni previene el delirium (PADIS/MIND-USA); es
        solo control sintomático de la agitación peligrosa. Contraindicado o de
        alto riesgo en Parkinson, demencia por cuerpos de Lewy y QTc prolongado.
        En estos, preferir dexmedetomidina.
      </Callout>

      {/* ==================== PEDIÁTRICO — SEVOFLURANO ==================== */}
      <SectionHeader
        label="8 · Foco pediátrico — sevoflurano como causa"
        note="// el despertar demasiado limpio y demasiado rápido tiene un precio: el niño se despierta en pánico"
      />

      <Callout variant="info">
        Los anestésicos volátiles insolubles, en especial el <b>sevoflurano</b>{" "}
        (y el desflurano), son la causa reconocida de emergence delirium
        pediátrico: producen un despertar rápido en un cerebro aún desorientado.
        La profilaxis con <b>dexmedetomidina</b> o <b>propofol</b> reduce su
        incidencia frente a mantener solo el volátil.
      </Callout>

      <DataTable
        table={{
          headers: ["Estrategia pediátrica", "Detalle"],
          rows: [
            [
              "Profilaxis con dexmedetomidina",
              "~0.3–0.5 µg/kg IV intraoperatorio; reduce emergence delirium tras sevoflurano.",
            ],
            [
              "Propofol al final",
              "~1 mg/kg IV al término; suaviza la transición del volátil al despertar.",
            ],
            [
              "Analgesia previa",
              "Bloqueo regional / analgésico eficaz: descartar dolor como gatillo.",
            ],
            [
              "Entorno",
              "Despertar tranquilo, reunir con los padres pronto, minimizar estímulos.",
            ],
            [
              "Rescate del episodio",
              "Dexmedetomidina 0.5 µg/kg IV o propofol 0.5–1 mg/kg IV; casi siempre autolimitado (< 30 min).",
            ],
          ],
        }}
      />
      <p
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.58rem",
          margin: "-0.5rem 0 1.5rem",
          opacity: 0.7,
        }}
      >
        Ref: Dahmani S, et al. Pharmacological prevention of sevoflurane- and
        desflurane-related emergence agitation in children: meta-analysis. Br J
        Anaesth 2010;104(2):216-223 · Sikich N, Lerman J. Anesthesiology
        2004;100:1138 (PAED).
      </p>

      {/* ==================== FUENTES ==================== */}
      <SectionHeader label="Fuentes" />
      <ul
        className="mono"
        style={{
          margin: "0 0 1.5rem",
          paddingLeft: "1.1rem",
          color: "var(--text-2)",
          fontSize: "0.66rem",
          lineHeight: 1.9,
        }}
      >
        <li>Aldecoa C, Bettelli G, Bilotta F, et al. European Society of Anaesthesiology (ESA, hoy ESAIC) evidence-based and consensus-based guideline on postoperative delirium. Eur J Anaesthesiol 2017;34(4):192-214.</li>
        <li>Ely EW, Inouye SK, Bernard GR, et al. Delirium in mechanically ventilated patients: validity and reliability of the CAM-ICU. JAMA 2001;286(21):2703-2710.</li>
        <li>Sikich N, Lerman J. Development and psychometric evaluation of the Pediatric Anesthesia Emergence Delirium (PAED) scale. Anesthesiology 2004;100(5):1138-1145.</li>
        <li>Devlin JW, Skrobik Y, Gélinas C, et al. Clinical Practice Guidelines for the Prevention and Management of Pain, Agitation/Sedation, Delirium, Immobility, and Sleep Disruption (PADIS). Crit Care Med 2018;46(9):e825-e873.</li>
        <li>Dahmani S, Stany I, Brasher C, et al. Pharmacological prevention of sevoflurane- and desflurane-related emergence agitation in children: meta-analysis. Br J Anaesth 2010;104(2):216-223.</li>
        <li>Su X, Meng ZT, Wu XH, et al. Dexmedetomidine for prevention of delirium in elderly patients after non-cardiac surgery. Lancet 2016;388(10054):1893-1902.</li>
        <li>Inouye SK, Bogardus ST, Charpentier PA, et al. A multicomponent intervention to prevent delirium in hospitalized older patients (HELP). N Engl J Med 1999;340(9):669-676.</li>
        <li>Vlisides P, Avidan M. Recent Advances in Preventing and Managing Postoperative Delirium. Anesthesiology 2016;125(6):1229-1241.</li>
      </ul>

      {/* Disclaimer con humor negro */}
      <footer
        style={{
          marginTop: "2rem",
          paddingTop: "1.25rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.58rem",
            lineHeight: 1.8,
            opacity: 0.65,
            textAlign: "center",
          }}
        >
          {"// dosis y escalas de literatura aceptada (ESAIC 2017 · CAM-ICU · PAED · PADIS)"}
          <br />
          {"// no sustituye juicio clínico, protocolo institucional ni monitorización"}
          <br />
          {"// antes de sedar al agitado: O₂, dolor, vejiga, glucosa — en ese orden"}
        </p>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <Link href="/guias" className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}>
            ← más guías
          </Link>
        </div>
      </footer>
    </div>
  );
}
