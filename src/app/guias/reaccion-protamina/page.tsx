import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — REACCIÓN A LA PROTAMINA
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: dosis, clasificación (Horrow) y manejo tomados
// de literatura aceptada de anestesia cardíaca. Cada tabla/callout
// cita su fuente (Vancouver breve). NO inventar dosis.
// Fuentes primarias:
//  - Horrow JC. Protamine: a review of its toxicity. Anesth Analg
//    1985;64(3):348-361.
//  - Nybo M, Madsen JS. Serious anaphylactic reactions due to
//    protamine sulfate: a systematic literature review. Basic Clin
//    Pharmacol Toxicol 2008;103(2):192-196.
//  - Kimmel SE, et al. Risk factors for clinically important adverse
//    events after protamine administration in patients undergoing
//    cardiopulmonary bypass. J Am Coll Cardiol 1998;32(7):1916-1922.
//  - Welsby IJ, et al. The association of complications with protamine
//    administration. Anesthesiology 2005;102(2):308-314.
//  - Barash PG, et al. Clinical Anesthesia, 8.ª ed. — Cardiac Anesthesia.
//  - Kaplan JA. Kaplan's Cardiac Anesthesia. — Heparin reversal.
// ============================================================

export const metadata: Metadata = {
  title: "Reacción a la protamina — tipos, factores de riesgo y manejo · DEC",
  description:
    "Referencia perioperatoria de las reacciones a la protamina en reversión de heparina tras bypass cardiopulmonar: dosis 1 mg por 100 U de heparina, clasificación de Horrow (Tipo I hipotensión por infusión rápida, Tipo II anafiláctica/anafilactoide, Tipo III hipertensión pulmonar catastrófica), factores de riesgo (insulina NPH/protamina previa, alergia a pescado, vasectomía), manejo con adrenalina, soporte de VD (milrinona, óxido nítrico inhalado), reanudación de bypass, heparina de rebote y alternativas de reversión.",
  openGraph: {
    title: "Reacción a la protamina — tipos, factores de riesgo y manejo · DEC",
    description:
      "Clasificación de Horrow (I/II/III), factores de riesgo, manejo con adrenalina, soporte de VD (milrinona, óxido nítrico inhalado), reanudación de bypass, heparina de rebote y alternativas. Anestesia cardíaca.",
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
export default function ReaccionProtaminaPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat reaccion-protamina.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Reacción a la protamina
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          reversión de heparina · tipos I/II/III (Horrow) · factores de riesgo · adrenalina · soporte de VD · rebote
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// el fármaco que apaga la heparina también puede apagar el ventrículo derecho: dalo despacio"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">EMERGENCIA</span>
          <span className="tag tag-muted">Horrow 1985</span>
          <span className="tag tag-muted">Anestesia cardíaca</span>
          <span className="tag tag-muted">CEC</span>
        </div>
      </header>

      <Callout variant="danger">
        <b>La protamina no es un fármaco benigno.</b> Se administra en el momento de mayor
        vulnerabilidad —fin de bypass cardiopulmonar (CEC), corazón recién revascularizado—, y su
        reacción puede ir desde una <b>hipotensión transitoria por infusión rápida</b> hasta el{" "}
        <b>colapso por hipertensión pulmonar catastrófica con fallo de ventrículo derecho</b>. Ante
        deterioro súbito tras iniciar protamina: <b>detener la infusión</b> es el primer gesto.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Dosis y función de la protamina">
        <P>
          La protamina revierte la heparina no fraccionada formando un complejo iónico estable
          (proteína básica + heparina ácida) que anula su actividad anticoagulante. La dosis clásica
          de reversión es <b>1 mg de protamina por cada 100 U de heparina</b> a neutralizar, ajustada
          según la heparina circulante estimada (dosis total, tiempo transcurrido) o guiada por
          titulación (ACT, sistemas de dosis-respuesta de heparina).
        </P>
        <Table
          headers={["Parámetro", "Valor", "Nota"]}
          accentCol={1}
          rows={[
            [
              "Dosis de neutralización",
              "1 mg por 100 U de heparina",
              "Referida a la heparina activa a revertir; suele ajustarse a la baja por vida media de la heparina.",
            ],
            [
              "Velocidad de infusión",
              "Lenta: 10–15 min (≤ ~5 mg/min)",
              "La infusión rápida es la causa de la hipotensión Tipo I; darla despacio la previene.",
            ],
            [
              "Guía de dosis",
              "ACT / titulación heparina-protamina",
              "Evita el exceso: la protamina en sí es anticoagulante/antiplaquetaria a dosis altas.",
            ],
          ]}
        />
        <Src>
          Horrow JC. Anesth Analg 1985;64(3):348-361. · Barash PG, et al. Clinical Anesthesia, 8.ª ed.
          — Cardiac Anesthesia. · Kaplan JA. Kaplan&apos;s Cardiac Anesthesia (heparin reversal).
        </Src>
        <Callout variant="warn">
          <b>No sobredosificar.</b> El exceso de protamina no aporta reversión adicional y tiene efecto
          <b> anticoagulante propio</b> (disfunción plaquetaria, prolongación del ACT). Titular a la
          heparina residual real, no a la dosis total administrada horas antes.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Clasificación de reacciones (Horrow)">
        <P>
          La clasificación clásica de Horrow distingue <b>tres tipos</b> de reacción adversa a la
          protamina. El tipo determina el mecanismo, la gravedad y el manejo: desde detener la
          infusión y esperar (Tipo I) hasta el rescate hemodinámico del ventrículo derecho y la
          reanudación de bypass (Tipo III).
        </P>
        <Table
          headers={["Tipo", "Mecanismo / cuadro", "Conducta clave"]}
          accentCol={0}
          rows={[
            [
              "I",
              "Hipotensión sistémica por infusión rápida (vasodilatación transitoria). Sin broncoespasmo ni HTP.",
              "Detener/enlentecer la infusión; fluidos ± vasopresor breve. Reanudar más lento tras recuperar.",
            ],
            [
              "II",
              "Reacción anafiláctica (IgE) o anafilactoide: hipotensión, broncoespasmo, edema, eritema.",
              "Detener protamina; ADRENALINA, fluidos, vía aérea, adyuvantes (ver §4).",
            ],
            [
              "III",
              "Hipertensión pulmonar catastrófica: vasoconstricción pulmonar súbita, ↑ presión de AP, fallo agudo de VD, caída del gasto.",
              "Detener protamina; soporte de VD; considerar reanudar CEC (ver §5).",
            ],
          ]}
        />
        <Src>
          Horrow JC. Anesth Analg 1985;64(3):348-361. · Kaplan JA. Kaplan&apos;s Cardiac Anesthesia. ·
          Barash PG, et al. Clinical Anesthesia, 8.ª ed.
        </Src>
        <Callout variant="info">
          El <b>Tipo II</b> se subdivide clásicamente en IIa (anafiláctica verdadera, IgE mediada),
          IIb (anafilactoide inmediata) y IIc (edema pulmonar no cardiogénico tardío). El{" "}
          <b>Tipo III</b> es el más temido: la vasoconstricción pulmonar mediada por
          tromboxano/complemento produce fallo de VD agudo y puede ser mortal en minutos.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Factores de riesgo">
        <P>
          Ciertos antecedentes aumentan el riesgo de reacción, sobre todo del componente
          anafiláctico/anafilactoide (Tipo II). Identificarlos <b>antes</b> de administrar protamina
          permite anticipar el rescate y considerar administración de prueba lenta.
        </P>
        <Table
          headers={["Factor de riesgo", "Racional"]}
          rows={[
            [
              "Insulina NPH / protamina-zinc previa",
              "La insulina NPH contiene protamina; la exposición repetida sensibiliza (IgE/IgG anti-protamina).",
            ],
            [
              "Exposición previa a protamina",
              "Cirugía cardíaca o cateterismo previos con protamina → sensibilización a reexposición.",
            ],
            [
              "Alergia a pescado",
              "La protamina se obtiene del esperma de pescado (salmónidos); posible reactividad cruzada.",
            ],
            [
              "Vasectomía / infertilidad masculina",
              "La ruptura de la barrera hematotesticular puede generar anticuerpos anti-protamina/anti-esperma.",
            ],
            [
              "Alergia a fármacos / atopia",
              "Diátesis alérgica general asociada a mayor riesgo de reacción anafilactoide.",
            ],
          ]}
        />
        <Src>
          Nybo M, Madsen JS. Basic Clin Pharmacol Toxicol 2008;103(2):192-196. · Kimmel SE, et al. J Am
          Coll Cardiol 1998;32(7):1916-1922. · Weiss ME, et al. N Engl J Med 1989;320(14):886-892.
        </Src>
        <Callout variant="warn">
          En pacientes de riesgo, considerar una <b>dosis de prueba lenta</b> bajo monitorización
          estrecha y tener listo el rescate (adrenalina, vasopresor, capacidad de reanudar CEC) antes
          de dar la dosis completa. El riesgo no contraindica la reversión: se prepara para tratarla.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Manejo inicial — cualquier reacción">
        <P>
          El primer gesto ante cualquier deterioro tras iniciar protamina es{" "}
          <b>detener la infusión</b>. A partir de ahí, el manejo se guía por el cuadro: la hipotensión
          aislada por infusión rápida (Tipo I) puede resolverse solo con eso; la reacción anafiláctica
          (Tipo II) y la crisis pulmonar (Tipo III) requieren rescate activo.
        </P>
        <Table
          headers={["Paso", "Acción"]}
          rows={[
            ["1 · Detener protamina", "Suspender de inmediato la infusión; comunicar al equipo/cirujano."],
            ["2 · Vía aérea y O₂", "FiO₂ 100%; asegurar ventilación; anticipar broncoespasmo y edema."],
            ["3 · Adrenalina (Tipo II)", "IV titulada por bolos (10–100 mcg según gravedad); IM 0.5 mg si no hay acceso IV / paro inminente."],
            ["4 · Fluidos", "Cristaloide en bolo; el corazón recién salido de CEC tolera mal la hipovolemia."],
            ["5 · Vasopresores", "Noradrenalina / vasopresina para restaurar la PAM; fenilefrina como puente."],
            ["6 · Evaluar el tipo", "Vigilar presión de arteria pulmonar y VD (Tipo III) vs. broncoespasmo/eritema (Tipo II)."],
            ["7 · Rescate específico", "Tipo III → soporte de VD y considerar reanudar CEC (§5); Tipo II → adyuvantes."],
          ]}
        />
        <Src>
          Barash PG, et al. Clinical Anesthesia, 8.ª ed. · Kaplan JA. Kaplan&apos;s Cardiac Anesthesia.
          · Garvey LH, et al. AAGBI/BSACI (manejo de reacción alérgica perioperatoria). Anaesthesia 2021.
        </Src>
        <Callout variant="danger">
          <b>Adrenalina en la reacción anafiláctica (Tipo II):</b> es el fármaco de primera línea, no
          los antihistamínicos ni corticoides. IV <b>titulada en mcg</b> (bolos de 10–100 mcg según
          gravedad); reservar el <b>1 mg IV</b> para el paro. Adyuvantes de 2.ª línea: hidrocortisona
          200 mg IV, antihistamínico H1, salbutamol si broncoespasmo. (Ver guía de{" "}
          <Link href="/guias/anafilaxia" className="mono" style={{ color: "var(--cyan)" }}>
            anafilaxia perioperatoria
          </Link>
          .)
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Tipo III — soporte de VD y reanudación de bypass">
        <P>
          La reacción Tipo III es una <b>hipertensión pulmonar catastrófica</b>: vasoconstricción
          pulmonar súbita que dispara la presión de arteria pulmonar y precipita <b>fallo agudo de
          ventrículo derecho</b>, con caída del llenado izquierdo y del gasto cardíaco. El objetivo es
          descargar el VD: reducir la resistencia vascular pulmonar, sostener la contractilidad del VD,
          mantener la presión de perfusión coronaria y <b>evitar la sobrecarga de volumen</b> del VD
          fallante.
        </P>
        <Table
          headers={["Objetivo", "Intervención", "Nota"]}
          accentCol={1}
          rows={[
            [
              "Bajar la RVP",
              "Óxido nítrico inhalado (iNO)",
              "Vasodilatador pulmonar selectivo, sin hipotensión sistémica; de elección en la crisis de HTP.",
            ],
            [
              "Bajar la RVP (alt.)",
              "Prostaciclina inhalada (epoprostenol / iloprost)",
              "Alternativa/complemento al iNO cuando no se dispone de él.",
            ],
            [
              "Soporte inotrópico de VD",
              "Milrinona (inodilatador) ± adrenalina/dobutamina",
              "Milrinona mejora contractilidad y baja RVP; vigilar vasodilatación sistémica (asociar vasopresor).",
            ],
            [
              "Presión de perfusión del VD",
              "Noradrenalina / vasopresina",
              "Vasopresina eleva RVS sin aumentar tanto la RVP; sostiene la coronaria del VD sobrecargado.",
            ],
            [
              "Volemia",
              "Evitar sobrecarga del VD",
              "El VD dilatado y fallante empeora con más volumen; optimizar precarga, no maximizarla.",
            ],
            [
              "Rescate mecánico",
              "Reanudar CEC (bypass)",
              "Si el colapso no revierte: volver a bomba para sostener la circulación y ganar tiempo.",
            ],
          ]}
        />
        <Src>
          Kaplan JA. Kaplan&apos;s Cardiac Anesthesia. · Barash PG, et al. Clinical Anesthesia, 8.ª ed.
          · Lowenstein E, et al. Catastrophic pulmonary vasoconstriction associated with protamine
          reversal of heparin. Anesthesiology 1983;59(5):470-473.
        </Src>
        <Callout variant="danger">
          <b>Reanudar el bypass es una opción de rescate legítima.</b> Ante fallo de VD refractario por
          Tipo III, volver a CEC descarga el corazón, restaura la circulación y compra tiempo para que
          la vasoconstricción pulmonar ceda. Mantener acceso y cánulas disponibles hasta confirmar que
          la reversión fue bien tolerada.
        </Callout>
        <Callout variant="warn">
          <b>Cuidado con la milrinona y los inodilatadores:</b> bajan la RVP pero también la RVS y
          pueden agravar la hipotensión sistémica sobre un VD que ya no genera gasto. Asociar un
          <b> vasopresor</b> (noradrenalina/vasopresina) para preservar la presión de perfusión
          coronaria del VD.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Heparina de rebote">
        <P>
          Tras una reversión aparentemente exitosa puede reaparecer actividad de heparina —{" "}
          <b>heparina de rebote</b> — horas después: la heparina secuestrada en tejidos/endotelio se
          libera de nuevo a la circulación cuando la protamina (de vida media más corta) ya se ha
          eliminado, con reanudación del sangrado y prolongación del ACT/aPTT.
        </P>
        <Callout variant="info">
          <b>Sospechar rebote</b> ante sangrado difuso con ACT/aPTT prolongado en el postoperatorio
          precoz, una vez descartada causa quirúrgica y coagulopatía dilucional. Se trata con{" "}
          <b>dosis adicionales pequeñas de protamina</b> guiadas por titulación/ACT, no repitiendo la
          dosis completa a ciegas.
        </Callout>
        <Src>
          Barash PG, et al. Clinical Anesthesia, 8.ª ed. · Kaplan JA. Kaplan&apos;s Cardiac Anesthesia
          (heparin rebound).
        </Src>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Alternativas de reversión">
        <P>
          En pacientes con reacción grave conocida a la protamina, o cuando está contraindicada, se han
          descrito estrategias alternativas de manejo de la heparina residual. Ninguna sustituye a la
          protamina con la misma eficacia y disponibilidad; se valoran caso a caso con el equipo.
        </P>
        <Table
          headers={["Estrategia", "Comentario"]}
          rows={[
            [
              "Reversión parcial / mínima protamina",
              "Neutralizar solo lo imprescindible con la mínima dosis, aceptando anticoagulación residual controlada.",
            ],
            [
              "Esperar el aclaramiento de heparina",
              "Permitir el metabolismo natural de la heparina con soporte transfusional, sin antagonista.",
            ],
            [
              "Premedicación en reexposición",
              "En riesgo conocido: antihistamínicos/corticoides y administración de prueba lenta (profilaxis imperfecta).",
            ],
            [
              "Agentes alternativos (investigacional)",
              "Se han estudiado antagonistas distintos (p. ej. polímeros catiónicos, andexanet en contextos concretos); disponibilidad limitada.",
            ],
          ]}
        />
        <Src>
          Nybo M, Madsen JS. Basic Clin Pharmacol Toxicol 2008;103(2):192-196. · Kaplan JA.
          Kaplan&apos;s Cardiac Anesthesia. · Barash PG, et al. Clinical Anesthesia, 8.ª ed.
        </Src>
        <Callout variant="warn">
          Las alternativas a la protamina son <b>subóptimas y contextuales</b>: en la mayoría de los
          casos el manejo correcto de una reacción es <b>tratar la reacción</b> (detener, adrenalina,
          soporte de VD, reanudar CEC) más que renunciar a la reversión. Decisión conjunta con el
          cirujano y perfusionista.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Resumen de dosis y datos clave">
        <Table
          headers={["Parámetro", "Valor", "Fuente"]}
          accentCol={1}
          rows={[
            ["Dosis de reversión", "1 mg protamina / 100 U heparina", "Horrow / Kaplan"],
            ["Velocidad de infusión", "Lenta, en 10–15 min (≤ ~5 mg/min)", "Horrow / Barash"],
            ["Tipo I", "Hipotensión por infusión rápida", "Horrow 1985"],
            ["Tipo II", "Anafiláctica / anafilactoide", "Horrow 1985"],
            ["Tipo III", "HTP catastrófica + fallo de VD", "Horrow / Lowenstein"],
            ["Adrenalina (Tipo II)", "10–100 mcg IV titulada · 0.5 mg IM · 1 mg IV en paro", "AAGBI 2021"],
            ["Tipo III — bajar RVP", "iNO / prostaciclina inhalada", "Kaplan"],
            ["Tipo III — soporte VD", "Milrinona ± adrenalina; vasopresina para RVS", "Kaplan / Barash"],
            ["Tipo III — rescate", "Reanudar CEC (bypass)", "Kaplan / Lowenstein"],
            ["Heparina de rebote", "Dosis pequeñas adicionales de protamina guiadas por ACT", "Barash / Kaplan"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="09" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Horrow JC. Protamine: a review of its toxicity. Anesth Analg 1985;64(3):348-361.</li>
          <li>Lowenstein E, Johnston WE, Lappas DG, et al. Catastrophic pulmonary vasoconstriction associated with protamine reversal of heparin. Anesthesiology 1983;59(5):470-473.</li>
          <li>Weiss ME, Nyhan D, Peng ZK, et al. Association of protamine IgE and IgG antibodies with life-threatening reactions to intravenous protamine. N Engl J Med 1989;320(14):886-892.</li>
          <li>Kimmel SE, Sekeres MA, Berlin JA, et al. Risk factors for clinically important adverse events after protamine administration in patients undergoing cardiopulmonary bypass. J Am Coll Cardiol 1998;32(7):1916-1922.</li>
          <li>Welsby IJ, Newman MF, Phillips-Bute B, et al. The association of complications with protamine administration. Anesthesiology 2005;102(2):308-314.</li>
          <li>Nybo M, Madsen JS. Serious anaphylactic reactions due to protamine sulfate: a systematic literature review. Basic Clin Pharmacol Toxicol 2008;103(2):192-196.</li>
          <li>Barash PG, Cullen BF, Stoelting RK, et al. Clinical Anesthesia, 8.ª ed. — Cardiac Anesthesia / Heparin reversal.</li>
          <li>Kaplan JA. Kaplan&apos;s Cardiac Anesthesia — Heparin reversal and protamine reactions.</li>
          <li>Garvey LH, Dewachter P, Hepner DL, et al. (AAGBI/BSACI). Management of suspected perioperative allergic reactions. Anaesthesia 2021.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y clasificación de literatura aceptada (Horrow 1985 · Kaplan · Barash · NEJM)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// 1 mg por 100 U y en 10-15 min: la prisa es el mecanismo del Tipo I"}
          <br />
          {"// ante Tipo III no seas orgulloso: reanudar el bypass es una decisión valiente, no un fracaso"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
