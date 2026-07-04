import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Algoritmo de vía aérea — Rapid Sequence Airway (RSA)
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: fármacos, dosis y umbrales de literatura aceptada.
// Cada tabla/callout cita su fuente (Vancouver breve). NO inventar dosis.
// Fuentes primarias:
//  - Braude D, Richards M. Rapid Sequence Airway (RSA) — a novel approach
//    to prehospital airway management. Prehosp Emerg Care 2007;11(2):250-252.
//  - Braude D, et al. Rapid Sequence Airway using the intubating laryngeal
//    mask airway in the prehospital setting. Prehosp Disaster Med 2009.
//  - Southerland WA, et al. Rapid Sequence Airway. StatPearls / rev. contemporánea.
//  - DAS (Difficult Airway Society). Frerk C, et al. Guidelines for
//    management of unanticipated difficult intubation. Br J Anaesth
//    2015;115(6):827-848 (rol del DSG 2.ª gen. como rescate/plan B).
//  - Cook TM, et al. NAP4 (4th National Audit Project). Br J Anaesth 2011.
//  - Miller's Anesthesia — Supraglottic airway devices.
// ============================================================

export const metadata: Metadata = {
  title: "Rapid Sequence Airway (RSA) — algoritmo de vía aérea · DEC",
  description:
    "Algoritmo de Rapid Sequence Airway (RSA): variante de la RSI donde se coloca un dispositivo supraglótico de 2.ª generación como vía aérea primaria planificada tras inducción y parálisis. Fármacos, dosis, indicaciones, ventajas frente a RSI y conversión a intubación a través del DSG. Braude, DAS 2015, NAP4.",
  openGraph: {
    title: "Rapid Sequence Airway (RSA) — algoritmo de vía aérea · DEC",
    description:
      "Variante de RSI con dispositivo supraglótico de 2.ª generación como vía aérea primaria planificada. Dosis, indicaciones, ventajas y conversión a intubación (Braude).",
    type: "article",
  },
};

// ------------------------------------------------------------
// Helpers de presentación (mismo lenguaje visual que las guías DEC)
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
export default function RSAPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat rsa.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Rapid Sequence Airway (RSA)
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          inducción + parálisis → dispositivo supraglótico 2.ª gen. como vía aérea primaria planificada
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// la RSI que renuncia al tubo antes de perseguirlo: oxigenar primero, laringoscopiar después (o nunca)"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">ALGORITMO</span>
          <span className="tag tag-muted">Braude 2007</span>
          <span className="tag tag-muted">DAS 2015</span>
          <span className="tag tag-muted">NAP4</span>
        </div>
      </header>

      <Callout variant="info">
        <b>RSA</b> es una variante de la <b>RSI (rapid sequence intubation)</b> en la que, tras la
        misma inducción de secuencia rápida y parálisis, la vía aérea primaria <b>planificada</b> no
        es el tubo endotraqueal sino un <b>dispositivo supraglótico (DSG) de 2.ª generación</b>{" "}
        colocado de entrada. La secuencia farmacológica es idéntica a la RSI; lo que cambia es el{" "}
        <b>dispositivo objetivo</b>. Descrita por Braude para el medio prehospitalario, donde
        prioriza la oxigenación y el éxito al primer intento sobre el aislamiento inmediato de la vía.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Concepto: RSA vs. RSI">
        <P>
          En la <b>RSI clásica</b> se induce y paraliza al paciente para intubarlo: el objetivo es el
          tubo endotraqueal. En la <b>RSA</b> se realiza exactamente la misma pre-oxigenación,
          inducción y parálisis, pero se coloca un <b>DSG de 2.ª generación como vía aérea primaria
          planificada</b> — no como rescate improvisado. Es una <b>decisión anticipada</b>, no una
          claudicación tras una intubación fallida.
        </P>
        <Table
          headers={["Aspecto", "RSI", "RSA"]}
          rows={[
            ["Objetivo primario", "Tubo endotraqueal", "DSG de 2.ª generación"],
            ["Inducción + parálisis", "Sí (secuencia rápida)", "Sí — idéntica"],
            ["Fármacos", "Inductor + relajante", "Los mismos (§03)"],
            ["Instrumentación de laringe", "Laringoscopia obligada", "Ninguna de entrada"],
            ["Primer paso", "Intubar", "Oxigenar con DSG"],
            ["Aislamiento vía aérea", "Inmediato (balón traqueal)", "Parcial (mejora con DSG 2.ª gen.)"],
            ["Ruta a la intubación", "Directa", "Diferida, a través del DSG si procede (§06)"],
          ]}
        />
        <Src>
          Braude D, Richards M. Rapid Sequence Airway (RSA). Prehosp Emerg Care 2007;11(2):250-252. ·
          Southerland WA, et al. Rapid Sequence Airway (StatPearls).
        </Src>
        <Callout variant="ok">
          Idea clave de Braude: el paciente crítico se muere de <b>hipoxia</b>, no de falta de tubo.
          La RSA reordena las prioridades — <b>primero se garantiza oxigenación</b> con un dispositivo
          de alta tasa de éxito al primer intento, y la intubación pasa a ser un objetivo secundario y
          diferido.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Indicaciones">
        <P>
          La RSA se plantea cuando el aislamiento inmediato de la vía aérea es menos prioritario que la
          oxigenación rápida y fiable, o cuando la probabilidad de intubación al primer intento es
          baja por operador o por entorno.
        </P>
        <Table
          headers={["Escenario", "Justificación"]}
          rows={[
            [
              "Prehospitalario",
              "Entorno subóptimo (luz, posición, movimiento); la laringoscopia falla más y la oxigenación no puede esperar.",
            ],
            [
              "Primer intentador / operador con menos experiencia",
              "Mayor tasa de colocación exitosa del DSG al primer intento que de intubación (Braude).",
            ],
            [
              "Rescate planificado",
              "Vía aérea prevista difícil en la que el DSG de 2.ª gen. se elige de entrada como plan primario razonable.",
            ],
            [
              "Necesidad de oxigenación urgente",
              "Deterioro hipoxémico donde el tiempo hasta ventilar es la variable crítica.",
            ],
            [
              "Recursos / personal limitados",
              "Un solo operador; el DSG simplifica el procedimiento y libera manos.",
            ],
          ]}
        />
        <Src>
          Braude D, Richards M. Prehosp Emerg Care 2007;11(2):250-252. · Braude D, et al. Prehosp
          Disaster Med 2009 (ILMA en RSA).
        </Src>
        <Callout variant="warn">
          La RSA <b>no</b> es la vía por defecto en quirófano cuando la intubación estándar es segura
          y sencilla, ni sustituye al tubo endotraqueal cuando el aislamiento definitivo es
          imprescindible (véanse contraindicaciones, §05). Es una herramienta para el contexto
          adecuado, no una simplificación universal.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Fármacos y dosis (idénticos a la RSI)">
        <P>
          La farmacología de la RSA es la <b>misma que la de la RSI</b>: pre-oxigenación, un inductor
          de acción rápida y un relajante neuromuscular de inicio rápido, administrados en secuencia
          sin ventilación manual prolongada. La elección del inductor se guía por la hemodinámica del
          paciente.
        </P>
        <Table
          headers={["Fármaco", "Dosis IV", "Notas"]}
          accentCol={1}
          rows={[
            [
              "Etomidato",
              "0.3 mg/kg",
              "Inductor de elección en inestabilidad hemodinámica (neutro cardiovascular). Supresión suprarrenal transitoria.",
            ],
            [
              "Ketamina",
              "1–2 mg/kg",
              "Alternativa en shock/broncoespasmo; preserva impulso respiratorio y presión arterial.",
            ],
            [
              "Propofol",
              "1.5–2.5 mg/kg",
              "Útil en paciente estable; evitar en hipotensión (vasodilatación, depresión miocárdica).",
            ],
            [
              "Succinilcolina",
              "1–1.5 mg/kg",
              "Relajante de inicio más rápido; contraindicaciones clásicas (hiperpotasemia, quemados/denervados > 48–72 h, riesgo de hipertermia maligna).",
            ],
            [
              "Rocuronio",
              "1.0–1.2 mg/kg",
              "Alternativa no despolarizante para RSI/RSA a dosis alta; reversible con sugammadex 16 mg/kg.",
            ],
          ]}
        />
        <Src>
          Miller&apos;s Anesthesia — Rapid sequence induction. · Stoelting&apos;s Pharmacology &amp;
          Physiology in Anesthetic Practice. · Braude D. Prehosp Emerg Care 2007 (misma farmacología
          que RSI).
        </Src>
        <Callout variant="danger">
          <b>Succinilcolina:</b> contraindicada en hiperpotasemia, lesión por quemadura o denervación
          &gt; 48–72 h, distrofias musculares y antecedente/riesgo de hipertermia maligna. En esos
          casos usar <b>rocuronio 1.0–1.2 mg/kg</b>. Confirmar plan de rescate y disponibilidad de
          sugammadex antes de paralizar.
        </Callout>
        <Callout variant="info">
          La secuencia (pre-oxigenación → inductor → relajante → colocación del dispositivo sin
          ventilación manual de rutina) es la misma que en RSI. La <b>única diferencia</b> es que el
          dispositivo colocado tras la parálisis es el <b>DSG de 2.ª generación</b>, no el
          laringoscopio + tubo.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Procedimiento paso a paso">
        <P>
          El flujo replica la RSI hasta el momento de instrumentar la vía aérea, donde diverge hacia
          la colocación del DSG.
        </P>
        <Table
          headers={["Paso", "Acción"]}
          rows={[
            ["1 · Preparar", "Equipo, monitorización, capnografía, aspiración, DSG de 2.ª gen. tallado por peso; plan de rescate y de conversión a intubación definidos de antemano."],
            ["2 · Pre-oxigenar", "O₂ alto flujo hasta SpO₂ óptima (idealmente EtO₂ elevado); considerar O₂ apneico. Optimizar posición (rampa/olfateo)."],
            ["3 · Inducir + paralizar", "Inductor (§03) seguido inmediatamente de relajante de inicio rápido. Sin ventilación manual de rutina."],
            ["4 · Colocar el DSG", "Insertar el dispositivo supraglótico de 2.ª generación como vía aérea primaria planificada, en apnea, tras el inicio de la parálisis."],
            ["5 · Confirmar", "Capnografía en onda (gold standard), auscultación, expansión torácica, ausencia de fuga significativa; insuflar/ajustar sello."],
            ["6 · Asegurar y decidir", "Fijar el dispositivo, descomprimir estómago por el canal gástrico, y decidir si se mantiene el DSG o se convierte a intubación (§06)."],
          ]}
        />
        <Src>
          Braude D, Richards M. Prehosp Emerg Care 2007;11(2):250-252. · DAS. Frerk C, et al. Br J
          Anaesth 2015;115(6):827-848 (confirmación por capnografía).
        </Src>
        <Callout variant="warn">
          Preferir un <b>DSG de 2.ª generación</b> (con canal de drenaje gástrico y sello de mayor
          presión: p. ej. i-gel, LMA ProSeal/Supreme). Frente a los de 1.ª generación, reducen el
          riesgo de aspiración y toleran mayores presiones de ventilación, lo que importa
          especialmente en un paciente no ayunado del medio prehospitalario.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Ventajas y limitaciones">
        <P>
          La ventaja central descrita por Braude es la <b>mayor tasa de éxito de oxigenación al primer
          intento</b> frente a la intubación, sobre todo en manos menos expertas o en entornos
          hostiles. El precio es un aislamiento de la vía aérea incompleto respecto al tubo con balón.
        </P>
        <Table
          headers={["Ventajas", "Limitaciones / precauciones"]}
          rows={[
            ["Mayor éxito de oxigenación al primer intento", "Aislamiento de vía aérea incompleto vs. tubo con balón"],
            ["Menor tiempo hasta ventilar", "Riesgo residual de aspiración (menor con 2.ª gen., no nulo)"],
            ["No requiere laringoscopia ni visualización de la glotis", "Fuga con presiones de ventilación muy altas / mala distensibilidad"],
            ["Menos dependiente de la experiencia del operador", "Sello subóptimo por anatomía, secreciones o sangre"],
            ["Libera manos; factible con un solo operador", "No sustituye al tubo cuando el aislamiento definitivo es obligatorio"],
            ["Puente hacia la intubación diferida (§06)", "Contraindicado si no cabe el DSG (patología glótica/supraglótica, trismo, vía aérea muy distorsionada)"],
          ]}
        />
        <Src>
          Braude D, Richards M. Prehosp Emerg Care 2007;11(2):250-252. · Cook TM, et al. NAP4. Br J
          Anaesth 2011;106(5):617-631 (limitaciones y aspiración con DSG).
        </Src>
        <Callout variant="danger">
          <b>Contraindicaciones del DSG como vía aérea primaria:</b> obstrucción o patología
          glótica/supraglótica, trismo o apertura bucal insuficiente, distorsión anatómica marcada, y
          escenarios que exigen aislamiento traqueal inmediato con balón (p. ej. hemorragia glótica
          activa masiva). En estos casos, la vía aérea planificada es el <b>tubo</b>, no el DSG.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Conversión a intubación a través del DSG">
        <P>
          La RSA no cierra la puerta a la intubación: una vez oxigenado y estabilizado el paciente con
          el DSG, puede <b>convertirse a una vía aérea definitiva de forma controlada y diferida</b>,
          usando el propio dispositivo supraglótico como conducto — la misma lógica del plan B/C del
          algoritmo DAS 2015.
        </P>
        <Table
          headers={["Técnica de conversión", "Descripción"]}
          rows={[
            [
              "Intubación a través de DSG intubable",
              "Con un DSG diseñado como conducto (p. ej. ILMA/Fastrach o i-gel), pasar el tubo a ciegas o guiado.",
            ],
            [
              "Intubación guiada por fibroscopio",
              "Fibrobroncoscopio a través del DSG hasta la tráquea; pasar el tubo sobre el fibroscopio (técnica de elección cuando está disponible).",
            ],
            [
              "Técnica de Aintree / catéter guía",
              "Catéter intercambiador (Aintree) sobre fibroscopio a través del DSG; retirar el DSG y avanzar el tubo sobre el catéter.",
            ],
            [
              "Diferir / mantener el DSG",
              "Si el paciente está bien oxigenado y ventilado, mantener el DSG y transportar; convertir en un entorno controlado.",
            ],
          ]}
        />
        <Src>
          DAS. Frerk C, et al. Br J Anaesth 2015;115(6):827-848 (DSG de 2.ª gen. como plan B y
          conducto para intubación). · Braude D, et al. Prehosp Disaster Med 2009 (ILMA en RSA).
        </Src>
        <Callout variant="info">
          Confirmar siempre la intubación traqueal definitiva por <b>capnografía en onda</b> tras la
          conversión. Mientras el DSG mantenga oxigenación y ventilación adecuadas, no hay urgencia en
          convertir: la RSA ya cumplió su objetivo primario (oxigenar), y la intubación puede hacerse
          en las mejores condiciones posibles.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Resumen operativo">
        <Table
          headers={["Punto", "Contenido", "Fuente"]}
          accentCol={1}
          rows={[
            ["Qué es", "Variante de RSI con DSG 2.ª gen. como vía aérea primaria planificada", "Braude 2007"],
            ["Fármacos", "Iguales a RSI (etomidato/ketamina/propofol + succinilcolina/rocuronio)", "Miller / Stoelting"],
            ["Etomidato", "0.3 mg/kg", "Miller"],
            ["Ketamina", "1–2 mg/kg", "Miller"],
            ["Succinilcolina", "1–1.5 mg/kg", "Miller"],
            ["Rocuronio (RSI/RSA)", "1.0–1.2 mg/kg", "Miller"],
            ["Dispositivo", "DSG 2.ª gen. con canal gástrico (i-gel, ProSeal, Supreme, ILMA)", "DAS 2015"],
            ["Ventaja central", "Mayor éxito de oxigenación al primer intento", "Braude 2007"],
            ["Confirmación", "Capnografía en onda", "DAS 2015"],
            ["Conversión", "Intubación diferida a través del DSG (fibro/Aintree/ILMA)", "DAS 2015"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Braude D, Richards M. Rapid Sequence Airway (RSA) — a novel approach to prehospital airway management. Prehosp Emerg Care 2007;11(2):250-252.</li>
          <li>Braude D, Southard A, Bajema T, et al. Rapid sequence airway using the intubating laryngeal mask airway in the prehospital setting. Prehosp Disaster Med 2009.</li>
          <li>Southerland WA, et al. Rapid Sequence Airway. StatPearls (revisión contemporánea del concepto de Braude).</li>
          <li>Frerk C, Mitchell VS, McNarry AF, et al. Difficult Airway Society 2015 guidelines for management of unanticipated difficult intubation in adults. Br J Anaesth 2015;115(6):827-848.</li>
          <li>Cook TM, Woodall N, Frerk C. Major complications of airway management in the UK (NAP4). Br J Anaesth 2011;106(5):617-631.</li>
          <li>Gropper MA, et al. Miller&apos;s Anesthesia — Rapid sequence induction &amp; Supraglottic airway devices.</li>
          <li>Flood P, Rathmell JP, Urman RD. Stoelting&apos;s Pharmacology &amp; Physiology in Anesthetic Practice.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y algoritmo de literatura aceptada (Braude 2007, DAS 2015, NAP4, Miller/Stoelting)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, capnografía ni protocolo institucional"}
          <br />
          {"// el DSG oxigena; el tubo tranquiliza. la RSA elige lo primero cuando el reloj no negocia"}
          <br />
          {"// si el paciente no cabe en el DSG, el plan era otro desde el principio"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
