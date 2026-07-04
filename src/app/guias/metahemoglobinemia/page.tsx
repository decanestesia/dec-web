import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — METAHEMOGLOBINEMIA PERIOPERATORIA
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: dosis, umbrales y objetivos tomados de
// literatura aceptada (UpToDate, Miller, Stoelting, FDA). Cada
// tabla/callout cita su fuente (Vancouver breve). NO inventar cifras.
// Fuentes primarias:
//  - Skold A, Cosco DL, Klein R. Methemoglobinemia: pathogenesis,
//    diagnosis, and management. South Med J 2011;104(11):757-761.
//  - Wright RO, Lewander WJ, Woolf AD. Methemoglobinemia: etiology,
//    pharmacology, and clinical management. Ann Emerg Med
//    1999;34(5):646-656.
//  - Cortazzo JA, Lichtman AD. Methemoglobinemia: a review and
//    recommendations for management. J Cardiothorac Vasc Anesth
//    2014;28(4):1055-1059.
//  - FDA Drug Safety Communication: benzocaine and methemoglobinemia.
//  - Gropper MA, et al. Miller's Anesthesia, 9.ª ed. (co-oximetría,
//    dishemoglobinemias y monitorización de SpO2).
// ============================================================

export const metadata: Metadata = {
  title: "Metahemoglobinemia perioperatoria — cianosis, azul de metileno y G6PD · DEC",
  description:
    "Referencia perioperatoria de metahemoglobinemia: hierro férrico (Fe3+) que no transporta O2, causas anestésicas (benzocaína, prilocaína, lidocaína, dapsona, nitratos, óxido nítrico), cianosis que no mejora con O2, SpO2 atrapada ~85%, sangre chocolate, gap de saturación y co-oximetría. Manejo con azul de metileno 1-2 mg/kg IV, contraindicación en déficit de G6PD y riesgo serotoninérgico por IMAO.",
  openGraph: {
    title: "Metahemoglobinemia perioperatoria — cianosis, azul de metileno y G6PD · DEC",
    description:
      "Causas anestésicas, cianosis refractaria a O2, SpO2 atrapada ~85%, co-oximetría y azul de metileno 1-2 mg/kg IV con las trampas de G6PD e IMAO.",
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
export default function MetahemoglobinemiaPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat metahemoglobinemia.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Metahemoglobinemia
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          Fe³⁺ no transporta O₂ · cianosis refractaria · SpO₂ atrapada ~85% · sangre chocolate · co-oximetría · azul de metileno
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// el pulsioxímetro te miente y se planta en 85%: no es la máquina, es la hemoglobina"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">EMERGENCIA</span>
          <span className="tag tag-muted">UpToDate</span>
          <span className="tag tag-muted">Miller</span>
          <span className="tag tag-muted">FDA</span>
        </div>
      </header>

      <Callout variant="danger">
        <b>El sello clínico:</b> <b>cianosis que NO mejora con O₂ al 100%</b>. La metahemoglobina es
        hemoglobina con hierro <b>férrico (Fe³⁺)</b> en lugar de ferroso (Fe²⁺): <b>no fija ni
        transporta O₂</b> y desplaza la curva de disociación a la izquierda, empeorando la entrega
        tisular. Sospéchala ante cianosis desproporcionada con PaO₂ normal, <b>SpO₂ que se «atasca»
        en torno a 85%</b> y sangre de color <b>chocolate/pardo</b>. Confirma con <b>co-oximetría</b>.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Fisiopatología — por qué el Fe³⁺ no lleva O₂">
        <P>
          En la hemoglobina normal el hierro del grupo hemo está en estado <b>ferroso (Fe²⁺)</b>, el
          único que une O₂ de forma reversible. Cuando el hierro se oxida a <b>férrico (Fe³⁺)</b> se
          forma <b>metahemoglobina (metaHb)</b>, incapaz de transportar O₂. Además, los grupos hemo
          oxidados desplazan la <b>curva de disociación de la oxihemoglobina a la izquierda</b>,
          reduciendo la cesión de O₂ en los tejidos: la hipoxia tisular es peor de lo que sugiere el
          porcentaje de metaHb.
        </P>
        <P>
          El organismo reduce continuamente la metaHb basal (&lt; 1–2%) sobre todo vía{" "}
          <b>citocromo b5 reductasa (NADH-dependiente)</b>. Existe una vía secundaria,{" "}
          <b>NADPH-metahemoglobina reductasa</b>, normalmente latente: es la que <b>activa el azul de
          metileno</b> para reducir el Fe³⁺ a Fe²⁺, y depende del NADPH generado por la <b>G6PD</b> —de
          ahí que el déficit de G6PD invalide el tratamiento.
        </P>
        <Src>
          Skold A, et al. South Med J 2011;104(11):757-761. · Wright RO, et al. Ann Emerg Med
          1999;34(5):646-656. · Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed.
        </Src>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Causas relevantes en anestesia">
        <P>
          La mayoría de las metahemoglobinemias perioperatorias son <b>adquiridas (tóxicas)</b>: un
          oxidante exógeno supera la capacidad reductora. Los <b>anestésicos locales tópicos</b> —sobre
          todo <b>benzocaína</b> y <b>prilocaína</b>— son la causa clásica en el quirófano, típicamente
          tras spray faríngeo para intubación despierta, endoscopia o ETE.
        </P>
        <Table
          headers={["Agente", "Contexto anestésico", "Nota"]}
          rows={[
            [
              "Benzocaína",
              "Spray tópico faríngeo (intubación despierta, endoscopia, ETE)",
              "Oxidante potente; alerta de la FDA. Una sola pulverización puede bastar.",
            ],
            [
              "Prilocaína",
              "Anestesia local/regional, EMLA (prilocaína + lidocaína)",
              "Metabolito o-toluidina es oxidante; riesgo dosis-dependiente y en lactantes.",
            ],
            [
              "Lidocaína",
              "Tópica/infiltrativa a dosis altas",
              "Causa menos frecuente que benzo/prilocaína, pero descrita.",
            ],
            [
              "Dapsona",
              "Fármaco del paciente (profilaxis PCP, dermatosis)",
              "Causa crónica frecuente; metaHb persistente, semivida larga.",
            ],
            [
              "Nitratos / nitritos",
              "Nitroglicerina, nitroprusiato, nitrito (antídoto de cianuro)",
              "Oxidantes; el nitrito se usa a propósito para generar metaHb en intoxicación por cianuro.",
            ],
            [
              "Óxido nítrico (iNO)",
              "Vasodilatador pulmonar inhalado",
              "Puede elevar la metaHb; monitorizar niveles con uso prolongado.",
            ],
          ]}
        />
        <Src>
          FDA Drug Safety Communication (benzocaína). · Wright RO, et al. Ann Emerg Med 1999;34(5):646-656.
          · Cortazzo JA, Lichtman AD. J Cardiothorac Vasc Anesth 2014;28(4):1055-1059.
        </Src>
        <Callout variant="warn">
          Existe una forma <b>congénita</b> (déficit de citocromo b5 reductasa, hemoglobina M): cursa
          con cianosis crónica bien tolerada y no requiere tratamiento urgente. En el perioperatorio,
          asume causa <b>tóxica</b> hasta demostrar lo contrario y <b>retira el oxidante</b>.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Clínica y el gap de saturación">
        <P>
          La gravedad se correlaciona aproximadamente con el <b>porcentaje de metaHb</b> (en paciente
          sin anemia ni comorbilidad; con anemia los síntomas aparecen antes). El hallazgo que
          delata el cuadro es la <b>discordancia SpO₂ vs. SaO₂</b> —el «gap de saturación»—.
        </P>
        <Table
          headers={["% metaHb", "Clínica típica", "Conducta"]}
          accentCol={0}
          rows={[
            ["< 1–2%", "Normal (metaHb fisiológica).", "Ninguna."],
            ["~3–15%", "Cianosis, coloración pardo-grisácea; a menudo asintomático.", "Retirar oxidante; O₂; observar."],
            ["~20–30%", "Cefalea, ansiedad, taquicardia, disnea, fatiga.", "Tratar si sintomático (ver §5)."],
            ["~30–50%", "Disnea marcada, confusión, letargo, acidosis.", "Azul de metileno indicado."],
            ["~50–70%", "Arritmias, depresión del SNC, acidosis grave, convulsiones, coma.", "Tratamiento urgente; soporte."],
            ["> 70%", "Potencialmente letal.", "Emergencia; considerar exanguinotransfusión."],
          ]}
        />
        <Src>
          Wright RO, et al. Ann Emerg Med 1999;34(5):646-656. · Skold A, et al. South Med J
          2011;104(11):757-761.
        </Src>
        <Callout variant="info">
          <b>Gap de saturación.</b> El pulsioxímetro convencional (2 longitudes de onda) interpreta la
          metaHb de forma que la lectura de <b>SpO₂ tiende a estancarse alrededor de 85%</b> con
          independencia de la PaO₂ real. La <b>gasometría</b> puede mostrar una <b>PaO₂ normal</b> (el
          O₂ disuelto no cambia) mientras la <b>SaO₂ medida por co-oximetría</b> está baja. Esa
          discordancia entre SpO₂ ~85% y una SaO₂ calculada de la PaO₂ es la pista diagnóstica.
        </Callout>
        <Callout variant="warn">
          Una gasometría que <b>calcula</b> la SaO₂ a partir de la PaO₂ puede informar una saturación
          <b> falsamente normal</b>: no descarta metahemoglobinemia. Solo la <b>co-oximetría</b> (que
          mide directamente las fracciones de hemoglobina) cuantifica la metaHb.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Diagnóstico — co-oximetría y sangre chocolate">
        <P>
          El diagnóstico se confirma cuantificando la fracción de metaHb por <b>co-oximetría</b>
          (gasometría con CO-oxímetro o pulsioxímetro multi-onda tipo Masimo con canal MetHb). Un
          signo de cabecera muy sugestivo: la sangre extraída es de color <b>chocolate/pardo oscuro</b>
          y <b>no vira a rojo al exponerla al aire/O₂</b> (a diferencia de la sangre venosa
          desaturada, que sí enrojece).
        </P>
        <Table
          headers={["Prueba", "Hallazgo en metaHb", "Utilidad"]}
          rows={[
            ["Co-oximetría", "Fracción de metaHb elevada (medida directa)", "Confirmación y cuantificación — prueba de referencia."],
            ["Gasometría (PaO₂)", "PaO₂ normal pese a cianosis", "Sugiere el gap; NO descarta si SaO₂ es calculada."],
            ["SpO₂ (pulsiox 2λ)", "Se «atasca» ~85%, no sube con O₂", "Pista clínica precoz; no cuantifica."],
            ["Aspecto de la sangre", "Chocolate/pardo, no enrojece al aire", "Signo de cabecera de alta sospecha."],
            ["Frotis / G6PD", "Cuerpos de Heinz; medir G6PD antes de azul de metileno", "Cribar déficit de G6PD (ver §5)."],
          ]}
        />
        <Src>
          Cortazzo JA, Lichtman AD. J Cardiothorac Vasc Anesth 2014;28(4):1055-1059. · Gropper MA, et al.
          Miller&apos;s Anesthesia, 9.ª ed. (co-oximetría y monitorización de SpO₂).
        </Src>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Manejo — retirar el agente, O₂ y azul de metileno">
        <P>
          El primer paso es <b>retirar el agente oxidante</b> y administrar <b>O₂ al 100%</b>. El
          antídoto es el <b>azul de metileno</b>, indicado en pacientes <b>sintomáticos</b> o con
          <b> metaHb &gt; 20–30%</b>. Actúa activando la vía NADPH-reductasa que reduce el Fe³⁺ a Fe²⁺.
        </P>
        <Table
          headers={["Paso", "Acción", "Dosis / detalle"]}
          accentCol={2}
          rows={[
            [
              "1 · Retirar oxidante",
              "Suspender benzocaína/prilocaína/dapsona/nitrato/iNO en curso",
              "Medida esencial; muchos casos leves mejoran solo con esto.",
            ],
            [
              "2 · Oxígeno",
              "FiO₂ 100%",
              "Maximiza el O₂ disuelto y la fracción de hemoglobina funcional disponible.",
            ],
            [
              "3 · Azul de metileno (1.ª dosis)",
              "Antídoto IV si metaHb > 20–30% o sintomático",
              "1–2 mg/kg IV lento en 5 min.",
            ],
            [
              "4 · Repetir si persiste",
              "Segunda dosis a los 30–60 min si no hay respuesta",
              "Repetir 1–2 mg/kg; dosis acumulada máx. ~7 mg/kg.",
            ],
            [
              "5 · Reevaluar / alternativas",
              "Si no responde: reconsiderar G6PD, dosis, foco persistente",
              "Ácido ascórbico, exanguinotransfusión u O₂ hiperbárico (ver §6).",
            ],
          ]}
        />
        <Src>
          Wright RO, et al. Ann Emerg Med 1999;34(5):646-656. · Skold A, et al. South Med J
          2011;104(11):757-761. · Cortazzo JA, Lichtman AD. J Cardiothorac Vasc Anesth 2014.
        </Src>
        <Callout variant="danger">
          <b>Dosis del azul de metileno:</b> <b>1–2 mg/kg IV en 5 minutos</b>; puede{" "}
          <b>repetirse a los 30–60 min</b> si persiste la clínica o la metaHb, hasta una{" "}
          <b>dosis acumulada máxima de ~7 mg/kg</b>. Paradójicamente, a <b>dosis excesivas</b> el
          propio azul de metileno es oxidante y puede <b>inducir</b> metahemoglobinemia y hemólisis:
          respeta el techo.
        </Callout>
        <Callout variant="warn">
          El azul de metileno es un <b>colorante intravascular</b>: hace caer la lectura de{" "}
          <b>SpO₂ de forma transitoria y artefactual</b> (interferencia óptica) durante minutos. No lo
          confundas con empeoramiento clínico; guíate por la <b>co-oximetría</b> y el estado del
          paciente.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Trampa 1 — déficit de G6PD (azul de metileno contraindicado)">
        <P>
          El azul de metileno necesita <b>NADPH</b>, generado por la <b>glucosa-6-fosfato
          deshidrogenasa (G6PD)</b>, para reducir la metaHb. En el <b>déficit de G6PD</b> el fármaco es
          <b> inefectivo</b> y, peor aún, actúa como oxidante precipitando <b>hemólisis grave</b>. Está
          <b> contraindicado</b> (o al menos desaconsejado) en estos pacientes.
        </P>
        <Table
          headers={["Situación", "Alternativa", "Detalle"]}
          accentCol={1}
          rows={[
            [
              "Déficit de G6PD conocido/sospechado",
              "Ácido ascórbico (vitamina C)",
              "Reductor alternativo; acción más lenta, útil en casos leves-moderados.",
            ],
            [
              "Metahemoglobinemia grave sin respuesta",
              "Exanguinotransfusión",
              "Retira metaHb y aporta hemoglobina funcional; en cuadros graves/refractarios.",
            ],
            [
              "Refractaria / soporte adicional",
              "Oxígeno hiperbárico (OHB)",
              "Aumenta el O₂ disuelto mientras se resuelve; adyuvante en casos graves.",
            ],
          ]}
        />
        <Src>
          Cortazzo JA, Lichtman AD. J Cardiothorac Vasc Anesth 2014;28(4):1055-1059. · Skold A, et al.
          South Med J 2011;104(11):757-761.
        </Src>
        <Callout variant="danger">
          <b>Regla de oro.</b> En déficit de G6PD, el azul de metileno <b>no funciona y puede matar por
          hemólisis</b>. Si el paciente pertenece a población de riesgo y el estado lo permite,
          considera el cribado; pero <b>no retrases</b> el tratamiento de una metahemoglobinemia que
          amenaza la vida por esperar el resultado —individualiza con las alternativas a mano.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Trampa 2 — el azul de metileno es un IMAO">
        <P>
          El <b>azul de metileno inhibe la monoaminooxidasa (es un IMAO potente)</b>. En un paciente
          que toma <b>serotoninérgicos</b> (ISRS, IRSN, IMAO, tramadol, meperidina, linezolid) puede
          precipitar un <b>síndrome serotoninérgico</b> —agitación, hipertermia, rigidez, clonus,
          inestabilidad autonómica—.
        </P>
        <Callout variant="warn">
          Antes de administrarlo, <b>revisa la medicación serotoninérgica</b>. No es una
          contraindicación absoluta ante una metahemoglobinemia grave, pero obliga a <b>vigilar
          síndrome serotoninérgico</b>, usar la <b>mínima dosis eficaz</b> y sopesar el riesgo/beneficio.
        </Callout>
        <Src>
          Cortazzo JA, Lichtman AD. J Cardiothorac Vasc Anesth 2014;28(4):1055-1059. · Ficha técnica /
          FDA (interacción azul de metileno–serotoninérgicos).
        </Src>
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Resumen de dosis y umbrales clave">
        <Table
          headers={["Parámetro", "Valor", "Fuente"]}
          accentCol={1}
          rows={[
            ["MetaHb basal normal", "< 1–2%", "UpToDate / fisiología"],
            ["Umbral de tratamiento", "Sintomático o metaHb > 20–30%", "Wright / Skold"],
            ["Azul de metileno — dosis", "1–2 mg/kg IV en 5 min", "Wright / Skold"],
            ["Azul de metileno — repetir", "Otra dosis a 30–60 min si persiste", "Wright / Cortazzo"],
            ["Azul de metileno — dosis máx.", "~7 mg/kg acumulada", "Cortazzo / Skold"],
            ["Contraindicación clave", "Déficit de G6PD (inefectivo + hemólisis)", "Cortazzo / Skold"],
            ["Alternativas si G6PD", "Ácido ascórbico · exanguinotransfusión · OHB", "Cortazzo"],
            ["Interacción farmacológica", "Azul de metileno = IMAO (riesgo serotoninérgico)", "Cortazzo / FDA"],
            ["Confirmación diagnóstica", "Co-oximetría (mide metaHb directa)", "Miller / Cortazzo"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="09" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Skold A, Cosco DL, Klein R. Methemoglobinemia: pathogenesis, diagnosis, and management. South Med J 2011;104(11):757-761.</li>
          <li>Wright RO, Lewander WJ, Woolf AD. Methemoglobinemia: etiology, pharmacology, and clinical management. Ann Emerg Med 1999;34(5):646-656.</li>
          <li>Cortazzo JA, Lichtman AD. Methemoglobinemia: a review and recommendations for management. J Cardiothorac Vasc Anesth 2014;28(4):1055-1059.</li>
          <li>U.S. Food and Drug Administration. Drug Safety Communication: FDA warns about serious health problems (methemoglobinemia) with benzocaine gels and liquids. 2018.</li>
          <li>Gropper MA, Cohen NH, Eriksson LI, et al. Miller&apos;s Anesthesia, 9.ª ed. Elsevier; 2020 — co-oximetría, dishemoglobinemias y monitorización de la SpO₂.</li>
          <li>Barash PG, Cullen BF, Stoelting RK, et al. Clinical Anesthesia, 8.ª ed. — anestésicos locales y metahemoglobinemia.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y umbrales de literatura aceptada (UpToDate · Miller · Stoelting · FDA)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// cianosis que no sube con O2 y SpO2 clavada en 85%: piensa metaHb, pide co-oximetría"}
          <br />
          {"// azul de metileno: mira la G6PD y los serotoninérgicos ANTES de empujarlo, no después"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
