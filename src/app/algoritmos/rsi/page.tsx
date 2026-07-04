import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Algoritmo de vía aérea — SECUENCIA DE INTUBACIÓN RÁPIDA (RSI)
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: dosis, umbrales y pasos de literatura aceptada.
// Cada tabla/callout cita su fuente (Vancouver breve). NO inventar dosis.
// Fuentes primarias:
//  - Frerk C, et al. DAS 2015 guidelines for management of unanticipated
//    difficult intubation in adults. Br J Anaesth 2015;115(6):827-848.
//  - Apfelbaum JL, et al. ASA Practice Guidelines for Management of the
//    Difficult Airway 2022. Anesthesiology 2022;136(1):31-81.
//  - Higgs A, et al. Guidelines for management of tracheal intubation in
//    critically ill adults (DAS/ICS/FICM/RCoA). Br J Anaesth 2018;120(2):323-352.
//  - Miller's Anesthesia, 9.ª ed. — Airway Management.
//  - Stoelting's Pharmacology & Physiology in Anesthetic Practice.
//  - Nimmo AF, et al. AAGB guideline: peri-operative management of the
//    obese/RSI drugs. · Sørensen MK, et al. Rocuronium vs succinylcholine
//    RSI. Anesthesiology 2012;117:1210-1216 (sugammadex rescate).
//  - MHAUS — succinylcholine y hipertermia maligna.
// ============================================================

export const metadata: Metadata = {
  title: "Secuencia de intubación rápida (RSI) — algoritmo · DEC",
  description:
    "Algoritmo de RSI para anestesia y cuidados críticos: las 7 P (preparación, preoxigenación, pretratamiento, parálisis con inducción, posicionamiento, placement con capnografía, postintubación). Dosis exactas de inducción (propofol, etomidato, ketamina) y relajantes (succinilcolina, rocuronio), contraindicaciones de succinilcolina, rescate con sugammadex 16 mg/kg y RSI modificada. DAS 2015, ASA 2022, DAS-ICS 2018.",
  openGraph: {
    title: "Secuencia de intubación rápida (RSI) — algoritmo · DEC",
    description:
      "Las 7 P de la RSI, dosis de inducción y relajantes, contraindicaciones de succinilcolina y rescate con sugammadex. DAS 2015, ASA 2022.",
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

// Paso numerado de la secuencia (las 7 P)
function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="panel" style={{ marginBottom: "1rem" }}>
      <div className="panel-body" style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
        <span
          className="mono"
          style={{
            color: "var(--accent)",
            fontSize: "0.72rem",
            fontWeight: 700,
            border: "1px solid var(--border-hi)",
            borderRadius: 4,
            padding: "0.1rem 0.4rem",
            flexShrink: 0,
          }}
        >
          {n}
        </span>
        <div style={{ flex: 1 }}>
          <div
            className="mono"
            style={{
              color: "var(--text-0)",
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "0.35rem",
            }}
          >
            {title}
          </div>
          <div style={{ color: "var(--text-1)", fontSize: "0.82rem", lineHeight: 1.65 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Página (Server Component — referencia estática)
// ------------------------------------------------------------
export default function RSIPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat rsi.algo
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Secuencia de intubación rápida (RSI)
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          las 7 P · preoxigenación · inducción + parálisis · confirmación por capnografía · rescate
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// el plan A se decide antes de empujar el émbolo, no después de perder la vía aérea"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">ALGORITMO</span>
          <span className="tag tag-muted">DAS 2015</span>
          <span className="tag tag-muted">ASA 2022</span>
          <span className="tag tag-muted">DAS/ICS 2018</span>
        </div>
      </header>

      <Callout variant="info">
        La <b>RSI</b> busca minimizar el intervalo entre la pérdida de conciencia y la protección de
        la vía aérea con tubo con balón, en pacientes con <b>riesgo de aspiración</b> (estómago
        lleno, obstrucción intestinal, embarazo &gt; 2.º trimestre, ERGE grave, urgencia sin ayuno).
        Se induce y se paraliza casi simultáneamente, sin ventilación manual sostenida entre ambos, y
        se confirma la colocación por <b>capnografía</b>. Antes de inducir debe existir un plan
        A/B/C/D de vía aérea difícil y el equipo de rescate a mano.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Las 7 P de la RSI">
        <P>
          Nemotecnia operativa de la secuencia. El orden es cronológico salvo que Preoxigenación se
          mantiene durante todo el proceso hasta la intubación. Los tiempos de referencia asumen un
          adulto sin vía aérea difícil anticipada.
        </P>

        <Step n="1" title="P — Preparación">
          Plan A/B/C/D definido, monitorización (SpO₂, capnografía, ECG, PA), acceso IV permeable,
          aspiración (Yankauer) encendida y al alcance, dos laringoscopios/videolaringoscopio, tubos
          (número previsto + 0.5 menor), bougie/estilete, dispositivo supraglótico de rescate, kit de
          vía aérea quirúrgica (bisturí-bougie-tubo), fármacos rotulados y calculados por peso.
          Verificar aspirador, oxígeno y personal. Regla de las &quot;7 P&quot; y checklist previo.
        </Step>

        <Step n="2" title="P — Preoxigenación (desnitrogenización)">
          O₂ 100% con mascarilla ajustada durante <b>3 minutos</b> a volumen corriente,{" "}
          <b>u 8 respiraciones a capacidad vital</b> si el tiempo apremia. Objetivo: EtO₂ ≥ 0.85–0.9 /
          FeO₂ elevada. Considerar <b>oxigenación apneica</b> con cánula nasal a <b>15 L/min</b>{" "}
          mantenida durante la apnea, y posición en anti-Trendelenburg / rampa (obeso) para prolongar
          el tiempo de apnea segura. En el paciente crítico o hipoxémico, considerar CPAP/VNI o cánula
          de alto flujo para preoxigenar.
        </Step>

        <Step n="3" title="P — Pretratamiento">
          Optimización hemodinámica y de la fisiología antes de inducir: fluidos/vasopresor si
          hipotensión (evitar colapso post-inducción), analgesia con opioide de acción corta si se
          desea atenuar la respuesta simpática a la laringoscopia (p. ej. fentanilo 1–3 µg/kg, con
          cautela por hipotensión), y consideraciones específicas (broncodilatador en broncoespasmo).
          La lidocaína y el &quot;defasciculante&quot; de rutina <b>no</b> se recomiendan como paso
          fijo por evidencia débil.
        </Step>

        <Step n="4" title="P — Parálisis con inducción">
          Administrar el <b>inductor</b> seguido inmediatamente del <b>relajante muscular</b> a dosis
          plena, en bolo rápido y sin ventilación manual sostenida entre ambos (ver §2 y §3). Esperar
          el tiempo de inicio del relajante (succinilcolina ~45–60 s; rocuronio a dosis RSI ~60 s)
          antes de laringoscopiar. La dosis del relajante en RSI es <b>mayor</b> que en intubación
          electiva para acelerar y garantizar condiciones óptimas.
        </Step>

        <Step n="5" title="P — Posicionamiento / Protección">
          Posición de olfateo (o rampa en obeso). La <b>maniobra de Sellick</b> (presión cricoidea
          ~10 N despierto → ~30 N tras pérdida de conciencia) es <b>controvertida</b>: puede empeorar
          la visión laríngea y no hay evidencia sólida de que prevenga aspiración; liberar si dificulta
          la laringoscopia o la ventilación. Proteger la vía aérea: aspiración lista para vómito/regurgitación.
        </Step>

        <Step n="6" title="P — Placement con confirmación">
          Laringoscopia (directa o video), paso del tubo, inflado del balón.{" "}
          <b>Confirmación obligatoria por capnografía</b> (onda de EtCO₂ sostenida en varios ciclos) —
          es el estándar para descartar intubación esofágica. Complementar con auscultación,
          expansión torácica y empañamiento. Documentar profundidad del tubo.
        </Step>

        <Step n="7" title="P — Postintubación">
          Fijar tubo, ajustar ventilador, sedoanalgesia de mantenimiento, sonda gástrica para
          descomprimir estómago, radiografía/verificación de posición, control de PA (evitar
          hipotensión post-intubación) y reevaluación. Registrar el evento (grado de Cormack-Lehane,
          intentos, incidencias).
        </Step>

        <Src>
          Frerk C, et al. DAS 2015. Br J Anaesth 2015;115(6):827-848. · Higgs A, et al. DAS/ICS/FICM/RCoA.
          Br J Anaesth 2018;120(2):323-352. · Apfelbaum JL, et al. ASA Difficult Airway 2022. Anesthesiology
          2022;136:31-81. · Miller&apos;s Anesthesia 9.ª ed., Airway Management.
        </Src>

        <Callout variant="warn">
          <b>Oxigenación apneica</b> (NC 15 L/min) y la <b>preoxigenación óptima</b> son las que
          compran tiempo si el primer intento falla — no la prisa por laringoscopiar. Prioriza SpO₂:
          si cae &lt; 90–92%, oxigena con mascarilla o supraglótico antes de reintentar.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Fármacos de inducción (dosis exactas)">
        <P>
          Elegir el inductor por la <b>hemodinámica</b> y el contexto. Todas las dosis son IV en bolo.
          Ajustar a la baja (≈ 50%) en shock, ancianos e hipovolemia; la ketamina y el etomidato
          preservan mejor la presión arterial que el propofol.
        </P>
        <Table
          headers={["Inductor", "Dosis RSI", "Inicio / notas"]}
          accentCol={1}
          rows={[
            [
              "Propofol",
              "1.5–2.5 mg/kg",
              "Inicio ~30 s. Hipotensión y depresión miocárdica dosis-dependiente; reducir en inestable.",
            ],
            [
              "Etomidato",
              "0.2–0.3 mg/kg",
              "Estabilidad hemodinámica. Supresión suprarrenal transitoria; mioclonías. Útil en cardiópata inestable.",
            ],
            [
              "Ketamina",
              "1–2 mg/kg",
              "Broncodilatador, mantiene tono simpático (útil en shock/broncoespasmo). Precaución si depleción de catecolaminas.",
            ],
          ]}
        />
        <Src>
          Stoelting&apos;s Pharmacology &amp; Physiology in Anesthetic Practice. · Miller&apos;s Anesthesia
          9.ª ed. — Intravenous Anesthetics. · Higgs A, et al. Br J Anaesth 2018;120:323-352.
        </Src>
        <Callout variant="info">
          En el paciente crítico/hipotenso, muchas guías prefieren <b>ketamina</b> o <b>etomidato</b>{" "}
          sobre propofol para la RSI, por menor caída de PA. La dosis del inductor se reduce cuando se
          combina con opioide y en baja reserva hemodinámica.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Relajantes musculares (dosis exactas)">
        <P>
          El bloqueante neuromuscular se administra <b>inmediatamente</b> tras el inductor, a dosis de
          RSI (mayores que en intubación electiva) para lograr condiciones óptimas rápidas.
        </P>
        <Table
          headers={["Relajante", "Dosis RSI", "Inicio / duración"]}
          accentCol={1}
          rows={[
            [
              "Succinilcolina",
              "1–1.5 mg/kg",
              "Inicio ~45–60 s · duración ~5–10 min (más corta). Despolarizante; ver contraindicaciones (§4).",
            ],
            [
              "Rocuronio (RSI)",
              "1.2 mg/kg",
              "Inicio ~60 s a dosis RSI · duración larga (~45–70 min). No despolarizante; reversible con sugammadex.",
            ],
          ]}
        />
        <Src>
          Sørensen MK, et al. Rocuronium/sugammadex vs succinylcholine for RSI. Anesthesiology
          2012;117:1210-1216. · Tran DTT, et al. Rocuronium vs succinylcholine for RSI (Cochrane) 2015. ·
          Miller&apos;s Anesthesia 9.ª ed. — Neuromuscular Blocking Drugs.
        </Src>
        <Callout variant="warn">
          A dosis de RSI el <b>rocuronio 1.2 mg/kg</b> ofrece condiciones de intubación comparables a
          la succinilcolina a los ~60 s, pero su duración es <b>larga</b>: sin sugammadex disponible,
          un &quot;no puedo intubar, no puedo oxigenar&quot; deja al paciente paralizado durante casi
          una hora. La succinilcolina se revierte espontáneamente en pocos minutos.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Contraindicaciones de la succinilcolina">
        <P>
          La succinilcolina (despolarizante) provoca liberación de potasio y puede desencadenar
          hipertermia maligna. Está <b>contraindicada</b> ante riesgo de hiperkalemia grave o de HM.
        </P>
        <Table
          headers={["Situación", "Motivo / riesgo"]}
          rows={[
            [
              "Hiperkalemia preexistente",
              "K⁺ elevado de base → arritmia/paro por elevación adicional de potasio.",
            ],
            [
              "Quemaduras y denervación (> 48–72 h)",
              "Proliferación de receptores nicotínicos extrajuncionales → hiperkalemia masiva. El riesgo aparece pasadas ~48–72 h del insulto y persiste semanas-meses.",
            ],
            [
              "Lesión medular / ACV / desuso muscular",
              "Misma upregulation de receptores → respuesta hiperkalémica exagerada.",
            ],
            [
              "Enfermedad neuromuscular / distrofias",
              "Distrofia muscular (p. ej. Duchenne), miopatías → hiperkalemia, rabdomiólisis, paro; también riesgo de HM.",
            ],
            [
              "Hipertermia maligna (HM)",
              "Antecedente personal/familiar o susceptibilidad conocida → desencadenante de HM. Contraindicación absoluta.",
            ],
          ]}
        />
        <Src>
          MHAUS (Malignant Hyperthermia Association of the United States). · Martyn JAJ, Richtsfeld M.
          Succinylcholine-induced hyperkalemia. Anesthesiology 2006;104:158-169. · Miller&apos;s
          Anesthesia 9.ª ed. — Neuromuscular Blocking Drugs.
        </Src>
        <Callout variant="danger">
          Ante cualquiera de estas condiciones, usar <b>rocuronio 1.2 mg/kg</b> para la RSI. La
          succinilcolina también eleva transitoriamente K⁺ ~0.5 mEq/L incluso en sanos, produce
          fasciculaciones, bradicardia (sobre todo en niños y en dosis repetidas) y espasmo de
          maseteros; disponer de atropina y del protocolo de HM (dantroleno) si se usa.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Plan de rescate: reversión con sugammadex">
        <P>
          Si se usó <b>rocuronio</b> para la RSI y ocurre un escenario &quot;no puedo intubar / no
          puedo oxigenar&quot; o se necesita revertir de forma inmediata el bloqueo profundo, el
          sugammadex encapsula el rocuronio y revierte incluso el bloqueo intenso.
        </P>
        <Table
          headers={["Escenario", "Dosis de sugammadex", "Nota"]}
          accentCol={1}
          rows={[
            [
              "Rescate de bloqueo profundo tras dosis RSI de rocuronio",
              "16 mg/kg",
              "Reversión inmediata (~2–3 min) tras 3–5 min de una dosis de intubación de 1.2 mg/kg.",
            ],
            [
              "Bloqueo profundo (referencia)",
              "4 mg/kg",
              "Recuperación desde bloqueo profundo en reversión programada (no rescate de RSI).",
            ],
            [
              "Bloqueo moderado (referencia)",
              "2 mg/kg",
              "Reversión de rutina al reaparecer TOF.",
            ],
          ]}
        />
        <Src>
          Ficha técnica de sugammadex (Bridion, EMA/FDA). · Sørensen MK, et al. Anesthesiology
          2012;117:1210-1216. · Higgs A, et al. Br J Anaesth 2018;120:323-352 (DAS/ICS críticos).
        </Src>
        <Callout variant="danger">
          El sugammadex <b>revierte la parálisis, no restaura la respiración ni la vía aérea</b>: en un
          &quot;no puedo intubar, no puedo oxigenar&quot; la prioridad sigue siendo oxigenar (mascarilla,
          supraglótico, acceso quirúrgico frontal del cuello según el algoritmo DAS), no esperar la
          reversión. Revertir con rocuronio no siempre devuelve la ventilación espontánea a tiempo si
          la obstrucción es anatómica.
        </Callout>
        <Callout variant="warn">
          Tras 16 mg/kg de sugammadex, re-paralizar con un aminoesteroideo (rocuronio/vecuronio) puede
          ser ineficaz durante horas: planear con benzilisoquinolínicos (cisatracurio) o succinilcolina
          si se requiere relajación posterior.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="RSI modificada">
        <P>
          Variante de la RSI clásica cuando la apnea sin ventilación no es segura (alto riesgo de
          desaturación: obeso, crítico, pediátrico, reserva pulmonar baja). El principio: no dejar al
          paciente hipoxémico por dogma.
        </P>
        <Table
          headers={["Modificación", "En qué cambia respecto a la RSI clásica"]}
          rows={[
            [
              "Ventilación con mascarilla suave",
              "Se permiten ventilaciones a baja presión (≤ 12–15 cmH₂O, para no insuflar estómago) entre inducción e intubación, si hay riesgo de desaturación.",
            ],
            [
              "Presión cricoidea flexible",
              "Se libera si dificulta ventilación o laringoscopia (Sellick controvertida; ver §1-P5).",
            ],
            [
              "Titulación de fármacos",
              "Dosis del inductor reducidas en inestable; el relajante se mantiene a dosis plena para condiciones rápidas.",
            ],
            [
              "Oxigenación apneica siempre",
              "NC a 15 L/min de rutina en modificada para prolongar el tiempo de apnea segura.",
            ],
          ]}
        />
        <Src>
          Higgs A, et al. Br J Anaesth 2018;120:323-352. · Miller&apos;s Anesthesia 9.ª ed. — Airway
          Management. · Nimmo AF, et al. AAGBI/RCoA peri-operative guidance.
        </Src>
        <Callout variant="info">
          La RSI modificada es la norma de facto en cuidados críticos y en el paciente que desatura
          rápido: se privilegia mantener la oxigenación por encima de la ortodoxia de &quot;cero
          ventilación&quot; de la RSI clásica.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Resumen de dosis clave">
        <Table
          headers={["Fármaco", "Dosis (IV)", "Fuente"]}
          accentCol={1}
          rows={[
            ["Propofol (inducción)", "1.5–2.5 mg/kg", "Stoelting / Miller 9.ª ed."],
            ["Etomidato (inducción)", "0.2–0.3 mg/kg", "Stoelting / Miller 9.ª ed."],
            ["Ketamina (inducción)", "1–2 mg/kg", "Stoelting / Miller 9.ª ed."],
            ["Succinilcolina (RSI)", "1–1.5 mg/kg", "Miller 9.ª ed."],
            ["Rocuronio (RSI)", "1.2 mg/kg", "Sørensen 2012 / Cochrane 2015"],
            ["Sugammadex (rescate)", "16 mg/kg", "Ficha técnica Bridion / Sørensen 2012"],
            ["O₂ apneico (NC)", "15 L/min", "DAS/ICS 2018"],
            ["Preoxigenación", "3 min O₂ 100% u 8 resp. a CV", "DAS/ICS 2018 · Miller 9.ª ed."],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Frerk C, Mitchell VS, McNarry AF, et al. Difficult Airway Society 2015 guidelines for management of unanticipated difficult intubation in adults. Br J Anaesth 2015;115(6):827-848.</li>
          <li>Higgs A, McGrath BA, Goddard C, et al. Guidelines for the management of tracheal intubation in critically ill adults (DAS/ICS/FICM/RCoA). Br J Anaesth 2018;120(2):323-352.</li>
          <li>Apfelbaum JL, Hagberg CA, Connis RT, et al. 2022 American Society of Anesthesiologists Practice Guidelines for Management of the Difficult Airway. Anesthesiology 2022;136(1):31-81.</li>
          <li>Sørensen MK, Bretlau C, Gätke MR, et al. Rapid sequence induction and intubation with rocuronium-sugammadex compared with succinylcholine. Anesthesiology 2012;117(6):1210-1216.</li>
          <li>Tran DTT, Newton EK, Mount VAH, et al. Rocuronium versus succinylcholine for rapid sequence induction intubation. Cochrane Database Syst Rev 2015;(10):CD002788.</li>
          <li>Martyn JAJ, Richtsfeld M. Succinylcholine-induced hyperkalemia in acquired pathologic states. Anesthesiology 2006;104(1):158-169.</li>
          <li>Malignant Hyperthermia Association of the United States (MHAUS). Guidance on triggering agents.</li>
          <li>Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — Airway Management; Intravenous Anesthetics; Neuromuscular Blocking Drugs.</li>
          <li>Flood P, Rathmell JP, Shafer S. Stoelting&apos;s Pharmacology &amp; Physiology in Anesthetic Practice.</li>
          <li>Ficha técnica / prospecto de sugammadex (Bridion), EMA y FDA.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y pasos de literatura aceptada (DAS 2015 · ASA 2022 · DAS/ICS 2018 · Miller · Stoelting)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// preoxigenar bien es aburrido; explicar una intubación esofágica no confirmada, mucho menos"}
          <br />
          {"// la capnografía no opina: si no hay onda, no hay tubo en tráquea"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
