import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — Síndrome serotoninérgico y NMS
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: criterios, desencadenantes y dosis tomados de
// literatura aceptada. Cada tabla/callout cita su fuente (Vancouver
// breve). NO inventar dosis ni umbrales.
// Fuentes primarias:
//  - Boyer EW, Shannon M. The Serotonin Syndrome. N Engl J Med
//    2005;352(11):1112-1120.
//  - Dunkley EJC, et al. Hunter Serotonin Toxicity Criteria. QJM
//    2003;96(9):635-642.
//  - Strawn JR, et al. Neuroleptic Malignant Syndrome. Am J
//    Psychiatry 2007;164(6):870-876.
//  - Miller's Anesthesia · Stoelting's Pharmacology & Physiology
//    in Anesthetic Practice.
// ============================================================

export const metadata: Metadata = {
  title: "Síndrome serotoninérgico y NMS — Guía clínica — DEC",
  description:
    "Referencia perioperatoria: síndrome serotoninérgico (tríada, desencadenantes anestésicos, ciproheptadina) vs. síndrome neuroléptico maligno (dantroleno, bromocriptina). Tabla diferencial clonus vs. rigidez, inicio y reflejos. Boyer 2005, criterios de Hunter.",
  openGraph: {
    title: "Síndrome serotoninérgico y NMS — Guía clínica — DEC",
    description:
      "Diferenciación y manejo del síndrome serotoninérgico (ciproheptadina) y el síndrome neuroléptico maligno (dantroleno + bromocriptina) en el perioperatorio.",
    type: "article",
  },
};

// ------------------------------------------------------------
// Helpers de presentación (mismo lenguaje visual que otras guías)
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
export default function SerotoninergicoNmsPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat serotoninergico-nms.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Síndrome serotoninérgico y NMS
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          tríada · desencadenantes anestésicos · ciproheptadina · dantroleno + bromocriptina · diferencial clonus vs. rigidez
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// dos hipertermias que se parecen y se tratan al revés; confundirlas cuesta caro"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">REFERENCIA</span>
          <span className="tag tag-muted">Boyer 2005</span>
          <span className="tag tag-muted">Hunter 2003</span>
          <span className="tag tag-muted">Perioperatorio</span>
        </div>
      </header>

      <Callout variant="info">
        Dos emergencias hipertérmicas neuromusculares que comparten fiebre, alteración autonómica y
        alteración mental, pero difieren en <b>mecanismo</b>, <b>velocidad de inicio</b> y{" "}
        <b>signo neuromuscular dominante</b>. El síndrome serotoninérgico da <b>clonus e hiperreflexia</b>{" "}
        de inicio rápido (&lt; 24 h); el síndrome neuroléptico maligno (NMS) da <b>rigidez &quot;en tubo de
        plomo&quot; con reflejos disminuidos/ausentes</b> de inicio lento (días). El tratamiento
        farmacológico es distinto: no son intercambiables.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Síndrome serotoninérgico — tríada clínica">
        <P>
          Es una toxicidad por exceso de actividad serotoninérgica (predominio de estimulación de
          receptores 5-HT₂A). No es una reacción idiosincrásica sino un fenómeno{" "}
          <b>dosis-dependiente y predecible</b>: aparece al sumar agentes serotoninérgicos o subir
          dosis. La presentación clásica es una <b>tríada</b> de <b>inicio rápido (&lt; 24 h)</b>, a
          menudo en horas del agente desencadenante.
        </P>
        <Table
          headers={["Dominio de la tríada", "Manifestaciones"]}
          rows={[
            [
              "Cambios del estado mental",
              "Agitación, ansiedad, inquietud, delírium, confusión.",
            ],
            [
              "Hiperactividad autonómica",
              "Taquicardia, hipertermia, diaforesis, midriasis, hipertensión, ruidos intestinales aumentados, diarrea.",
            ],
            [
              "Anomalías neuromusculares",
              "Clonus (inducible, espontáneo u ocular), hiperreflexia, mioclonías, temblor, rigidez, hipertonía — predominio en extremidades inferiores.",
            ],
          ]}
        />
        <Src>Boyer EW, Shannon M. N Engl J Med 2005;352(11):1112-1120.</Src>
        <Callout variant="warn">
          El hallazgo <b>más específico</b> del síndrome serotoninérgico es el <b>clonus</b> (inducible,
          espontáneo u ocular) junto con la <b>hiperreflexia</b>, más marcados en miembros inferiores.
          En casos graves, la propia rigidez muscular puede enmascarar el clonus. El inicio rápido lo
          distingue del NMS.
        </Callout>
        <Callout variant="info">
          Los <b>criterios de toxicidad de Hunter</b> (más sensibles y específicos que los de Sternbach)
          diagnostican el síndrome ante exposición a un agente serotoninérgico más uno de: clonus
          espontáneo; clonus inducible + agitación o diaforesis; clonus ocular + agitación o diaforesis;
          temblor + hiperreflexia; o hipertonía + temperatura &gt; 38 °C + clonus ocular o inducible.
          <br />
          <span className="mono" style={{ fontSize: "0.62rem", color: "var(--text-3)" }}>
            Dunkley EJC, et al. QJM 2003;96(9):635-642.
          </span>
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Desencadenantes anestésicos y perioperatorios">
        <P>
          Muchos fármacos de uso anestésico tienen actividad serotoninérgica (opioides con inhibición
          de recaptación, azul de metileno como IMAO, antibióticos). El riesgo se dispara al{" "}
          <b>combinarlos con un ISRS/IRSN o un IMAO</b> que el paciente ya toma. La anamnesis
          farmacológica preoperatoria es la principal medida preventiva.
        </P>
        <Table
          headers={["Agente", "Rol serotoninérgico", "Nota clínica"]}
          accentCol={0}
          rows={[
            [
              "Meperidina",
              "Inhibe recaptación de serotonina",
              "Opioide de mayor riesgo. Evitar en pacientes con ISRS/IMAO.",
            ],
            [
              "Tramadol",
              "Inhibe recaptación de serotonina/NA + agonista opioide",
              "Riesgo también de convulsiones; evitar con serotoninérgicos.",
            ],
            [
              "Fentanilo",
              "Débil inhibición de recaptación de serotonina",
              "Casos descritos en combinación; vigilar con ISRS/IMAO.",
            ],
            [
              "Metadona",
              "Inhibe recaptación de serotonina",
              "Riesgo aditivo con otros serotoninérgicos.",
            ],
            [
              "Azul de metileno",
              "Potente inhibidor de la MAO (IMAO)",
              "Desencadenante frecuente en cirugía (paratiroides, vasoplejía) si hay ISRS/IRSN.",
            ],
            [
              "Linezolid",
              "Inhibidor reversible de la MAO",
              "Antibiótico; interacción con ISRS/IMAO.",
            ],
          ]}
        />
        <Src>Boyer EW, Shannon M. N Engl J Med 2005;352(11):1112-1120. · Stoelting&apos;s Pharmacology &amp; Physiology in Anesthetic Practice.</Src>
        <Callout variant="danger">
          El <b>azul de metileno</b> es un IMAO potente: administrado a un paciente en ISRS/IRSN puede
          precipitar síndrome serotoninérgico grave. Evaluar riesgo-beneficio y suspender/espaciar el
          serotoninérgico cuando sea posible antes de usarlo (p. ej. cirugía de paratiroides o
          vasoplejía refractaria).
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Manejo del síndrome serotoninérgico">
        <P>
          El tratamiento es fundamentalmente de <b>soporte</b> y <b>retirada del agente</b>; la mayoría
          de los casos leves resuelven en 24–72 h tras suspender el desencadenante. Los casos moderados
          se benefician de un antagonista 5-HT₂A (ciproheptadina) y los graves requieren cuidados
          intensivos con control agresivo de la hipertermia.
        </P>
        <Table
          headers={["Paso", "Intervención"]}
          rows={[
            [
              "1 · Retirar el agente",
              "Suspender de inmediato todos los fármacos serotoninérgicos (opioide implicado, ISRS/IRSN, azul de metileno, linezolid).",
            ],
            [
              "2 · Soporte",
              "Oxígeno, líquidos IV, monitorización cardíaca; corregir constantes y estabilizar hemodinámicamente.",
            ],
            [
              "3 · Sedación con benzodiacepinas",
              "Primera línea para agitación, temblor e hiperactividad autonómica; reducen tono y facilitan el control térmico.",
            ],
            [
              "4 · Control de la hipertermia",
              "Enfriamiento activo. En hipertermia grave (> 41.1 °C): sedación, parálisis (bloqueante NM no despolarizante) e intubación.",
            ],
            [
              "5 · Antídoto — ciproheptadina",
              "Antagonista 5-HT₂A. Dosis: 12 mg VO/SNG inicial, luego 2 mg cada 2 h mientras persistan los síntomas.",
            ],
          ]}
        />
        <Src>Boyer EW, Shannon M. N Engl J Med 2005;352(11):1112-1120.</Src>

        <div
          className="panel"
          style={{ margin: "0 0 1rem", borderLeft: "3px solid var(--accent)" }}
        >
          <div className="panel-body" style={{ display: "grid", gap: "0.5rem" }}>
            <div
              className="mono"
              style={{ color: "var(--accent)", fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.02em" }}
            >
              Ciproheptadina — 12 mg inicial → 2 mg c/2 h
            </div>
            <div className="mono" style={{ color: "var(--text-2)", fontSize: "0.72rem", lineHeight: 1.7 }}>
              Antagonista de 5-HT₂A (vía oral / sonda; no existe forma parenteral).
              <br />
              Continuar <b>2 mg cada 2 h</b> mientras persistan los síntomas serotoninérgicos
              (alternativa: <b>8 mg cada 6 h</b> de mantenimiento, Boyer 2005).
            </div>
          </div>
        </div>

        <Callout variant="danger">
          <b>Evitar succinilcolina</b> si hay rigidez marcada o rabdomiólisis: el riesgo de
          hiperpotasemia por liberación de potasio del músculo dañado puede precipitar paro cardíaco.
          Para relajación/intubación en la hipertermia grave, usar un <b>bloqueante neuromuscular no
          despolarizante</b> (p. ej. rocuronio). Evitar antipiréticos (la fiebre es de origen muscular,
          no hipotalámico) y agentes con actividad serotoninérgica adicional.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Síndrome neuroléptico maligno (NMS)">
        <P>
          El NMS es una reacción idiosincrásica al <b>bloqueo dopaminérgico</b> (antipsicóticos y otros
          antidopaminérgicos) o a la <b>retirada brusca de agonistas dopaminérgicos</b> (p. ej.
          levodopa en enfermedad de Parkinson). A diferencia del síndrome serotoninérgico, su{" "}
          <b>inicio es lento (días)</b>, típicamente 1–3 días, hasta 2 semanas.
        </P>
        <Table
          headers={["Rasgo", "NMS"]}
          rows={[
            [
              "Causa",
              "Antidopaminérgicos (antipsicóticos, metoclopramida, antieméticos) o retirada de agonista dopaminérgico.",
            ],
            [
              "Inicio",
              "Lento: días (1–3 días típico, hasta ~2 semanas).",
            ],
            [
              "Tono neuromuscular",
              'Rigidez difusa generalizada "en tubo de plomo" (lead-pipe rigidity).',
            ],
            [
              "Reflejos",
              "Hiporreflexia / reflejos normales — la hiperreflexia y el clonus están AUSENTES.",
            ],
            [
              "Estado mental",
              "Alteración de la conciencia, estupor, mutismo acinético.",
            ],
            [
              "Autonómico y laboratorio",
              "Hipertermia, inestabilidad autonómica; CK muy elevada, leucocitosis, riesgo de rabdomiólisis y fallo renal.",
            ],
          ]}
        />
        <Src>Strawn JR, et al. Am J Psychiatry 2007;164(6):870-876. · Boyer EW, Shannon M. N Engl J Med 2005.</Src>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Manejo del NMS">
        <P>
          Base del tratamiento: <b>retirar el antidopaminérgico</b> (o reinstaurar el agonista
          dopaminérgico retirado), <b>soporte intensivo</b> y control de la hipertermia. En casos
          moderados-graves se añade tratamiento farmacológico dirigido.
        </P>
        <Table
          headers={["Paso", "Intervención"]}
          rows={[
            [
              "1 · Retirar el agente",
              "Suspender el fármaco antidopaminérgico causal; reinstaurar el agonista dopaminérgico si la causa fue su retirada.",
            ],
            [
              "2 · Soporte intensivo",
              "Enfriamiento activo, hidratación IV agresiva (protección renal frente a rabdomiólisis), corrección hidroelectrolítica, monitorización.",
            ],
            [
              "3 · Dantroleno",
              "Relajante muscular de acción directa para la rigidez y la hipertermia grave (bloquea la liberación de Ca²⁺ del retículo sarcoplásmico).",
            ],
            [
              "4 · Bromocriptina",
              "Agonista dopaminérgico que revierte el bloqueo central causante del NMS.",
            ],
            [
              "5 · Benzodiacepinas",
              "Coadyuvantes para agitación; considerar TEC en casos refractarios.",
            ],
          ]}
        />
        <Src>Strawn JR, et al. Am J Psychiatry 2007;164(6):870-876.</Src>
        <Callout variant="info">
          El NMS y la <b>hipertermia maligna</b> anestésica comparten el uso de <b>dantroleno</b>, pero
          son entidades distintas: la hipertermia maligna es un trastorno farmacogenético del canal de
          rianodina desencadenado por anestésicos halogenados y succinilcolina (ver guía de hipertermia
          maligna / MHAUS). El NMS es antidopaminérgico y de curso más lento.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Tabla diferencial — clonus vs. rigidez">
        <P>
          El punto clínico que más ayuda en la cabecera del paciente: <b>velocidad de inicio</b>,{" "}
          <b>signo neuromuscular dominante</b> y <b>estado de los reflejos</b>. El síndrome
          serotoninérgico es rápido, hiperrefléxico y con clonus; el NMS es lento, rígido y sin clonus.
        </P>
        <Table
          headers={["Característica", "Síndrome serotoninérgico", "NMS"]}
          rows={[
            [
              "Desencadenante",
              "Serotoninérgicos (ISRS/IRSN, IMAO, meperidina, tramadol, azul de metileno, linezolid)",
              "Antidopaminérgicos o retirada de dopaminérgico",
            ],
            [
              "Inicio",
              "Rápido: < 24 h (habitualmente horas)",
              "Lento: días (1–3 días, hasta ~2 semanas)",
            ],
            [
              "Signo neuromuscular",
              "Clonus, mioclonías, temblor, hiperreflexia (predominio en piernas)",
              'Rigidez difusa "en tubo de plomo"',
            ],
            [
              "Reflejos",
              "Hiperreflexia (aumentados)",
              "Hiporreflexia / normales — sin clonus",
            ],
            [
              "Pupilas",
              "Midriasis",
              "Normales",
            ],
            [
              "Ruidos intestinales",
              "Aumentados (hiperperistaltismo, diarrea)",
              "Normales o disminuidos",
            ],
            [
              "Resolución",
              "Suele resolver en 24–72 h tras retirada",
              "Días a semanas",
            ],
            [
              "Antídoto",
              "Ciproheptadina 12 mg → 2 mg c/2 h",
              "Dantroleno + bromocriptina",
            ],
          ]}
        />
        <Src>Boyer EW, Shannon M. N Engl J Med 2005;352(11):1112-1120 (Table 3, comparación con NMS).</Src>
        <Callout variant="warn">
          La distinción no es académica: dar un <b>antipsicótico</b> (antidopaminérgico) para sedar a un
          paciente con síndrome serotoninérgico puede empeorarlo, y la ciproheptadina no trata el NMS.
          Ante la duda, la <b>historia farmacológica</b> (¿qué se añadió y cuándo?) y el <b>tempo</b>{" "}
          (horas vs. días) orientan mejor que cualquier signo aislado.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Resumen de dosis y umbrales clave">
        <Table
          headers={["Parámetro", "Valor", "Fuente"]}
          accentCol={1}
          rows={[
            ["Ciproheptadina (inicial)", "12 mg VO/SNG", "Boyer 2005"],
            ["Ciproheptadina (mantenimiento)", "2 mg cada 2 h mientras persistan síntomas (o 8 mg cada 6 h)", "Boyer 2005"],
            ["Inicio síndrome serotoninérgico", "< 24 h (horas)", "Boyer 2005"],
            ["Inicio NMS", "Días (1–3 d, hasta ~2 sem)", "Strawn 2007"],
            ["Sedación 1.ª línea (serotoninérgico)", "Benzodiacepinas", "Boyer 2005"],
            ["Hipertermia grave → intubar/paralizar", "T > 41.1 °C", "Boyer 2005"],
            ["Relajación en rigidez/rabdomiólisis", "Evitar succinilcolina; usar no despolarizante", "Boyer 2005"],
            ["NMS — farmacoterapia dirigida", "Dantroleno + bromocriptina", "Strawn 2007"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Boyer EW, Shannon M. The Serotonin Syndrome. N Engl J Med 2005;352(11):1112-1120.</li>
          <li>Dunkley EJC, Isbister GK, Sibbritt D, et al. The Hunter Serotonin Toxicity Criteria: simple and accurate diagnostic decision rules for serotonin toxicity. QJM 2003;96(9):635-642.</li>
          <li>Strawn JR, Keck PE, Caroff SN. Neuroleptic Malignant Syndrome. Am J Psychiatry 2007;164(6):870-876.</li>
          <li>Gropper MA, et al. Miller&apos;s Anesthesia — Anesthetic implications of concurrent diseases / drug interactions.</li>
          <li>Flood P, Rathmell JP, Shafer S. Stoelting&apos;s Pharmacology &amp; Physiology in Anesthetic Practice.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y criterios de literatura aceptada (Boyer 2005 · Hunter 2003 · Strawn 2007)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// clonus sube, rigidez baja los reflejos: si te equivocas de síndrome, te equivocas de antídoto"}
          <br />
          {"// la anamnesis farmacológica preoperatoria previene la mitad de estos casos"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
