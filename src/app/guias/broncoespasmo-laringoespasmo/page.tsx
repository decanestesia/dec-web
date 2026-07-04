import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — BRONCOESPASMO Y LARINGOESPASMO
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: dosis, umbrales y pasos de literatura aceptada.
// Cada dato lleva referencia (Vancouver breve). NO inventar dosis.
// Fuentes primarias:
//  - Larson CP Jr. Laryngospasm—the best treatment. Anesthesiology
//    1998;89(5):1293-1294 (maniobra de Larson / laryngospasm notch).
//  - Difficult Airway Society (DAS). Frerk C, et al. 2015 guidelines
//    for management of unanticipated difficult intubation. Br J
//    Anaesth 2015;115(6):827-848.
//  - Gavel G, Walker RWM. Laryngospasm in anaesthesia. Contin Educ
//    Anaesth Crit Care Pain 2014;14(2):47-51.
//  - Dewachter P, et al. Perioperative bronchospasm. Anesthesiology
//    2011;114(5):1200-1210.
//  - Looseley A. Management of bronchospasm during general
//    anaesthesia. Update in Anaesthesia 2011;27:17-21.
//  - Miller's Anesthesia 9.ª ed. — Airway management / complications.
//  - Stoelting's Pharmacology & Physiology in Anesthetic Practice.
//  - GINA (Global Initiative for Asthma) 2023 — acute asthma.
// ============================================================

export const metadata: Metadata = {
  title: "Broncoespasmo y laringoespasmo — Guía clínica — DEC",
  description:
    "Manejo perioperatorio del laringoespasmo (profundizar anestesia, maniobra de Larson, presión positiva, succinilcolina) y del broncoespasmo (100% O₂, broncodilatadores, adrenalina IV, sulfato de magnesio, corticoides). Dosis exactas y algoritmo. Larson, DAS, GINA, Miller.",
  openGraph: {
    title: "Broncoespasmo y laringoespasmo — Guía clínica — DEC",
    description:
      "Algoritmo y dosis de rescate del laringoespasmo y el broncoespasmo perioperatorio. Maniobra de Larson, succinilcolina, adrenalina IV, magnesio y corticoides.",
    type: "article",
  },
};

// ------------------------------------------------------------
// Helpers de presentación (mismo lenguaje visual que las demás guías)
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

// Paso numerado para algoritmos de rescate
function Steps({ items }: { items: React.ReactNode[] }) {
  return (
    <ol style={{ margin: "0 0 1.25rem", paddingLeft: 0, listStyle: "none", counterReset: "step" }}>
      {items.map((it, i) => (
        <li
          key={i}
          style={{
            display: "flex",
            gap: "0.7rem",
            alignItems: "flex-start",
            padding: "0.55rem 0",
            borderTop: i === 0 ? "none" : "1px solid var(--border)",
          }}
        >
          <span
            className="mono"
            style={{
              color: "var(--accent)",
              fontSize: "0.72rem",
              fontWeight: 700,
              flexShrink: 0,
              minWidth: "1.4rem",
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span style={{ color: "var(--text-1)", fontSize: "0.85rem", lineHeight: 1.65 }}>{it}</span>
        </li>
      ))}
    </ol>
  );
}

// ------------------------------------------------------------
// Página (Server Component — referencia estática)
// ------------------------------------------------------------
export default function BroncoespasmoLaringoespasmoPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat broncoespasmo-laringoespasmo.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Broncoespasmo y laringoespasmo
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          emergencias de vía aérea · profundizar · presión positiva · Larson · succinilcolina · adrenalina · magnesio
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// dos obstrucciones distintas: una es la puerta cerrada (glotis), la otra el pasillo estrecho (bronquio)"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">EMERGENCIA</span>
          <span className="tag tag-muted">Larson 1998</span>
          <span className="tag tag-muted">DAS 2015</span>
          <span className="tag tag-muted">GINA</span>
        </div>
      </header>

      <Callout variant="info">
        <b>No confundir el nivel de la obstrucción.</b> El <b>laringoespasmo</b> es cierre reflejo de las cuerdas
        vocales / glotis (obstrucción alta): estridor o silencio total, esfuerzo inspiratorio sin volumen, tiraje.
        El <b>broncoespasmo</b> es contracción del músculo liso de la vía aérea inferior: sibilancias, espiración
        prolongada, presiones pico altas, capnograma con pendiente ascendente. El tratamiento inicial de ambos empieza
        igual (100% O₂, profundizar) pero diverge después: relajante muscular vs. broncodilatador.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Reconocimiento diferencial">
        <Table
          headers={["Rasgo", "Laringoespasmo", "Broncoespasmo"]}
          rows={[
            ["Nivel", "Glotis / cuerdas vocales (vía aérea alta)", "Músculo liso bronquial (vía aérea baja)"],
            ["Sonido", "Estridor inspiratorio o silencio (cierre completo)", "Sibilancias espiratorias, espiración prolongada"],
            ["Ventilación", "Difícil/imposible insuflar; tórax no expande", "Insuflable con presión alta; atrapamiento aéreo"],
            ["Capnografía", "Curva ausente/aplanada si cierre completo", "Pendiente ascendente (aleta de tiburón), no meseta"],
            ["Presión vía aérea", "Alta por obstrucción supraglótica", "Pico alto con meseta baja (↑ resistencia)"],
            ["Gatillo típico", "Estímulo en plano superficial (secreciones, extubación, dolor)", "Manipulación vía aérea, alérgeno, asma/EPOC, histamino-liberadores"],
          ]}
        />
        <Src>
          Gavel G, Walker RWM. Contin Educ Anaesth Crit Care Pain 2014;14(2):47-51. · Dewachter P, et al.
          Anesthesiology 2011;114(5):1200-1210. · Miller&apos;s Anesthesia 9.ª ed.
        </Src>
        <Callout variant="warn">
          Ambos pueden coexistir y ambos causan hipoxemia y bradicardia (sobre todo en niños). La hipoxia sostenida
          por laringoespasmo puede desembocar en <b>edema pulmonar por presión negativa</b> tras la resolución.
          Vigilar SpO₂ y capnografía tras el evento.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Laringoespasmo — algoritmo de rescate">
        <P>
          El laringoespasmo suele desencadenarse por estímulo (secreciones, sangre, extubación, dolor, manipulación)
          en un <b>plano anestésico insuficiente</b>. La respuesta es escalonada: se sube un peldaño solo si el
          previo no rompe el espasmo en segundos. La mayoría cede con oxígeno, presión positiva y profundización;
          la succinilcolina se reserva para el que no rompe.
        </P>
        <Steps
          items={[
            <>
              <b>Pedir ayuda y retirar el estímulo.</b> Suspender manipulación/aspiración. FiO₂ <b>100%</b> y aspirar
              secreciones/sangre de la faringe con visión.
            </>,
            <>
              <b>Presión positiva continua con 100% O₂</b> mediante mascarilla facial bien sellada y bolsa
              (CPAP ≈ 10–20 cmH₂O), con cánula orofaríngea si ayuda al sellado. Sostener, no bombear con fuerza
              (bombeo brusco insufla el estómago y no vence la glotis cerrada).
            </>,
            <>
              <b>Maniobra de Larson:</b> presión firme bilateral en la <b>escotadura del laringoespasmo</b>
              (&quot;laryngospasm notch&quot;) — el punto delimitado por la rama/cóndilo mandibular por delante, la
              apófisis mastoides por detrás y la base del cráneo por arriba — empujando hacia dentro y en anterior (subluxación mandibular).
              Combina jaw-thrust doloroso + presión sobre el nervio.
            </>,
            <>
              <b>Profundizar la anestesia:</b> <b>propofol 0.5–1 mg/kg IV</b> en bolo. Rompe muchos laringoespasmos
              sin necesidad de relajante, abortando el reflejo por profundización.
            </>,
            <>
              <b>Succinilcolina si persiste:</b> <b>0.1–0.5 mg/kg IV</b> (dosis baja suele bastar para relajar la
              glotis). Si <b>no hay acceso venoso</b>: <b>4 mg/kg IM</b> (máx ~200 mg; inicio de acción ~1.5–2 min), típicamente deltoides o
              lengua/músculo. Acompañar de <b>atropina</b> si bradicardia (frecuente en niños e hipoxia).
            </>,
            <>
              <b>Asegurar la vía aérea / ventilar:</b> tras relajar, ventilar con 100% O₂; intubar si el contexto lo
              exige. Tratar la causa (secreciones, plano). Vigilar por edema pulmonar por presión negativa.
            </>,
          ]}
        />
        <Table
          headers={["Fármaco / maniobra", "Dosis exacta", "Nota"]}
          accentCol={1}
          rows={[
            ["Oxígeno", "FiO₂ 100%", "Base de todo el algoritmo"],
            ["Presión positiva", "CPAP ≈ 10–20 cmH₂O", "Mascarilla sellada + cánula orofaríngea"],
            ["Maniobra de Larson", "Presión bilateral en escotadura laríngea", "+ subluxación mandibular (jaw thrust)"],
            ["Propofol", "0.5–1 mg/kg IV", "Profundiza; primera línea farmacológica"],
            ["Succinilcolina IV", "0.1–0.5 mg/kg IV", "Dosis baja relaja la glotis"],
            ["Succinilcolina IM", "4 mg/kg IM (máx ~200 mg; inicio ~1.5–2 min)", "Si NO hay vía venosa"],
            ["Atropina", "0.01–0.02 mg/kg IV (niño); 0.5 mg IV (adulto)", "Si bradicardia; premedicar en niño"],
          ]}
        />
        <Src>
          Larson CP Jr. Anesthesiology 1998;89(5):1293-1294 (maniobra de Larson). · Gavel G, Walker RWM. Contin Educ
          Anaesth Crit Care Pain 2014;14(2):47-51. · Miller&apos;s Anesthesia 9.ª ed.; Stoelting&apos;s Pharmacology.
        </Src>
        <Callout variant="danger">
          En laringoespasmo con cierre completo y desaturación que no cede, <b>no demorar la succinilcolina</b>.
          La dosis baja (0.1–0.5 mg/kg IV) relaja la glotis lo suficiente para ventilar. La hipoxia con bradicardia
          progresiva en el niño puede llegar a paro; anticipar atropina y estar listo para reanimación.
        </Callout>
        <Callout variant="warn">
          Precauciones de la succinilcolina: contraindicada en riesgo de hiperpotasemia (quemados/denervación &gt; 24–48 h,
          enfermedad neuromuscular), historia de hipertermia maligna, y déficit de colinesterasa. Sopesar frente al
          riesgo vital del laringoespasmo no resuelto.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Broncoespasmo — algoritmo de rescate">
        <P>
          El broncoespasmo intraoperatorio se manifiesta como sibilancias, presiones pico altas, espiración
          prolongada, capnograma en pendiente ascendente y, si es grave, imposibilidad de ventilar con caída de
          ETCO₂ y SpO₂. Antes de escalar la farmacología, <b>descartar causas mecánicas</b> que imitan broncoespasmo.
        </P>
        <Steps
          items={[
            <>
              <b>100% O₂</b> y pedir ayuda. Confirmar que el problema es broncoespasmo y no una causa mecánica
              (ver §4): tubo acodado/endobronquial, obstrucción por secreciones o tapón mucoso, neumotórax, edema.
            </>,
            <>
              <b>Profundizar la anestesia.</b> El plano superficial perpetúa el broncoespasmo. Opciones:
              <b> propofol</b>, aumentar <b>sevoflurano</b> (broncodilatador volátil de elección) o
              <b> ketamina 0.5 mg/kg IV</b> (broncodilatadora, útil si hipotensión).
            </>,
            <>
              <b>Broncodilatador β₂ inhalado:</b> <b>salbutamol</b> por el tubo endotraqueal — MDI con
              espaciador/adaptador (varias inhalaciones, repetibles) o nebulizado en la rama inspiratoria. Es la
              piedra angular del tratamiento.
            </>,
            <>
              <b>Adrenalina IV si es grave / refractario:</b> <b>10–50 mcg IV</b> en bolo, titulado y repetible
              (broncoespasmo severo que no responde a inhalados, o si hay anafilaxia/colapso). Vigilar taquiarritmia.
            </>,
            <>
              <b>Sulfato de magnesio:</b> <b>2 g IV</b> (adulto) en 15–20 min. Broncodilatador coadyuvante en crisis grave.
            </>,
            <>
              <b>Corticoide:</b> <b>hidrocortisona 100–200 mg IV</b>. No actúa de inmediato, pero previene la recaída
              tardía y trata el componente inflamatorio.
            </>,
            <>
              <b>Aminofilina (2.ª línea):</b> considerar si refractario a lo anterior. Ventana terapéutica estrecha,
              riesgo de arritmia; no es de primera elección.
            </>,
          ]}
        />
        <Table
          headers={["Intervención", "Dosis exacta", "Línea / nota"]}
          accentCol={1}
          rows={[
            ["Oxígeno", "FiO₂ 100%", "Base"],
            ["Profundizar — propofol", "Bolo IV titulado", "Abole reflejo de vía aérea"],
            ["Profundizar — sevoflurano", "↑ CAM", "Volátil broncodilatador de elección"],
            ["Profundizar — ketamina", "0.5 mg/kg IV", "Broncodilatador; útil con hipotensión"],
            ["Salbutamol inhalado", "MDI/nebulizado por el tubo, repetible", "1.ª línea broncodilatadora"],
            ["Adrenalina IV", "10–50 mcg IV, titulada", "Broncoespasmo severo / refractario / anafilaxia"],
            ["Sulfato de magnesio", "2 g IV en 15–20 min", "Coadyuvante en crisis grave"],
            ["Hidrocortisona", "100–200 mg IV", "Antiinflamatorio; previene recaída (efecto no inmediato)"],
            ["Aminofilina", "2.ª línea", "Ventana estrecha; riesgo arrítmico"],
          ]}
        />
        <Src>
          Dewachter P, et al. Perioperative bronchospasm. Anesthesiology 2011;114(5):1200-1210. · Looseley A. Update
          in Anaesthesia 2011;27:17-21. · GINA 2023 (asma aguda). · Miller&apos;s Anesthesia 9.ª ed.
        </Src>
        <Callout variant="danger">
          Si el broncoespasmo se acompaña de <b>hipotensión, rash/urticaria o angioedema</b> tras un fármaco
          (relajantes, antibióticos, látex, coloides), tratar como <b>anafilaxia</b>: adrenalina es el fármaco de
          primera línea (IM 0.5 mg o IV titulada en bolos de 10–50 mcg bajo monitor), fluidos, retirar el desencadenante.
        </Callout>
        <Callout variant="warn">
          En broncoespasmo severo con atrapamiento aéreo: usar <b>Vt bajo, FR baja y espiración prolongada</b>
          (hipercapnia permisiva) para evitar auto-PEEP y barotrauma. Desconectar del circuito unos segundos si hay
          sospecha de auto-PEEP con colapso hemodinámico.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Descartar causas mecánicas (imitadores)">
        <P>
          Antes de escalar broncodilatadores, verificar que no hay una causa mecánica corregible que produce presiones
          altas e imposibilidad de ventilar y que <b>no responde a β₂</b>. Regla mnemotécnica: revisar el tubo, el
          circuito y el paciente.
        </P>
        <Table
          headers={["Causa", "Pista", "Acción"]}
          rows={[
            ["Tubo acodado / mordido", "Presión súbita alta, capnografía alterada", "Revisar tubo, colocar mordedor, reposicionar"],
            ["Intubación endobronquial", "Murmullo asimétrico, ↑ presión tras avanzar tubo", "Auscultar, retirar tubo unos cm"],
            ["Secreciones / tapón mucoso", "Ruidos, presión alta, mejora al aspirar", "Aspiración endotraqueal"],
            ["Neumotórax (a tensión)", "Hipotensión, ausencia unilateral, desviación traqueal", "Descompresión / drenaje inmediato"],
            ["Edema pulmonar / aspiración", "Estertores, hipoxemia, esputo", "Tratar la causa; soporte ventilatorio"],
            ["Circuito / válvula", "Fallo de ventilación no del paciente", "Ventilar con bolsa autoinflable independiente"],
          ]}
        />
        <Src>Dewachter P, et al. Anesthesiology 2011;114:1200. · Miller&apos;s Anesthesia 9.ª ed. — Airway complications.</Src>
        <Callout variant="ok">
          Prueba diagnóstica rápida: si desconectas del ventilador y <b>ventilas a mano</b> con bolsa autoinflable,
          diferencias un problema de máquina/circuito de uno del paciente, y &quot;sientes&quot; la resistencia real
          de la vía aérea del broncoespasmo verdadero.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Prevención y factores de riesgo">
        <P>
          El evento más fácil de tratar es el que no ocurre. La extubación y la manipulación de vía aérea en plano
          superficial son gatillos clásicos de ambos cuadros.
        </P>
        <Table
          headers={["Estrategia", "Detalle"]}
          rows={[
            ["Extubar en el momento correcto", "Despierto y con reflejos, o profundo y estable — nunca en plano intermedio superficial"],
            ["Plano adecuado en manipulación", "Profundizar antes de aspirar/instrumentar; lidocaína IV 1–1.5 mg/kg puede atenuar reflejos"],
            ["Optimizar el asmático/EPOC", "Broncodilatadores perioperatorios, valorar corticoide, cirugía diferida si crisis activa"],
            ["Evitar histamino-liberadores", "En atópicos/asmáticos: cautela con atracurio, morfina, tiopental"],
            ["Aspirar antes de despertar", "Retirar secreciones/sangre con el paciente aún profundo"],
            ["Anticipar en niños", "Mayor incidencia de laringoespasmo; premedicar bradicardia con atropina si procede"],
          ]}
        />
        <Src>
          Gavel G, Walker RWM. Contin Educ Anaesth Crit Care Pain 2014;14:47. · Looseley A. Update in Anaesthesia
          2011;27:17. · Frerk C, et al. (DAS 2015). Br J Anaesth 2015;115(6):827-848.
        </Src>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Resumen de dosis clave">
        <Table
          headers={["Escenario", "Fármaco / maniobra", "Dosis"]}
          accentCol={2}
          rows={[
            ["Laringoespasmo", "Propofol (profundizar)", "0.5–1 mg/kg IV"],
            ["Laringoespasmo", "Presión positiva 100% O₂", "CPAP ≈ 10–20 cmH₂O"],
            ["Laringoespasmo", "Maniobra de Larson", "Presión en escotadura laríngea + jaw thrust"],
            ["Laringoespasmo", "Succinilcolina IV", "0.1–0.5 mg/kg IV"],
            ["Laringoespasmo (sin vía)", "Succinilcolina IM", "4 mg/kg IM (máx ~200 mg; inicio ~1.5–2 min)"],
            ["Broncoespasmo", "Profundizar (propofol/sevo/ketamina)", "Ketamina 0.5 mg/kg IV"],
            ["Broncoespasmo", "Salbutamol inhalado por tubo", "MDI/nebulizado, repetible"],
            ["Broncoespasmo severo", "Adrenalina IV", "10–50 mcg IV titulada"],
            ["Broncoespasmo grave", "Sulfato de magnesio", "2 g IV en 15–20 min"],
            ["Broncoespasmo", "Hidrocortisona", "100–200 mg IV"],
            ["Broncoespasmo refractario", "Aminofilina (2.ª línea)", "—"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Larson CP Jr. Laryngospasm—the best treatment (laryngospasm notch / maniobra de Larson). Anesthesiology 1998;89(5):1293-1294.</li>
          <li>Gavel G, Walker RWM. Laryngospasm in anaesthesia. Contin Educ Anaesth Crit Care Pain 2014;14(2):47-51.</li>
          <li>Frerk C, Mitchell VS, McNarry AF, et al. Difficult Airway Society 2015 guidelines for management of unanticipated difficult intubation in adults. Br J Anaesth 2015;115(6):827-848.</li>
          <li>Dewachter P, Mouton-Faivre C, Emala CW, Beloucif S. Case scenario: bronchospasm during anesthetic induction. Anesthesiology 2011;114(5):1200-1210.</li>
          <li>Looseley A. Management of bronchospasm during general anaesthesia. Update in Anaesthesia 2011;27:17-21.</li>
          <li>Global Initiative for Asthma (GINA). Global Strategy for Asthma Management and Prevention, 2023 — Acute exacerbations.</li>
          <li>Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — Airway management and perioperative complications.</li>
          <li>Flood P, Rathmell JP, Shafer S. Stoelting&apos;s Pharmacology &amp; Physiology in Anesthetic Practice, 5.ª ed. (succinilcolina, β₂-agonistas).</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y maniobras de literatura aceptada (Larson 1998, DAS 2015, GINA, Miller, Stoelting)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// primero descarta el tubo acodado antes de nebulizar salbutamol al ventilador"}
          <br />
          {"// si la glotis no abre, la succinilcolina no espera a que la mires con dudas"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
