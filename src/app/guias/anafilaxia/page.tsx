import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — ANAFILAXIA PERIOPERATORIA
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: grados, dosis y tiempos tomados de guías de
// sociedad (BJA/AAGBI 2021, Ring & Messmer, WAO/EAACI). Cada dato
// lleva referencia (Vancouver breve). NO inventar dosis.
// Fuentes primarias:
//  - Harper NJN, et al. Anaesthesia, surgery, and life-threatening
//    allergic reactions: management and outcomes in the 6th National
//    Audit Project (NAP6). Br J Anaesth 2018;121(1):172-188.
//  - Kolawole H, et al. ANZAAG/ANZCA perioperative anaphylaxis
//    management guidelines. Anaesth Intensive Care 2017;45(2):151-158.
//  - Garvey LH, et al. AAGBI/BSACI guideline: suspected perioperative
//    allergic reactions. Br J Anaesth 2019 / Anaesthesia 2021.
//  - Ring J, Messmer K. Incidence and severity of anaphylactoid
//    reactions to colloid volume substitutes. Lancet 1977;1:466-469.
//  - Cardona V, et al. World Allergy Organization anaphylaxis
//    guidance 2020. World Allergy Organ J 2020;13(10):100472.
// ============================================================

export const metadata: Metadata = {
  title: "Anafilaxia perioperatoria — grados, adrenalina y manejo · DEC",
  description:
    "Referencia estructurada de anafilaxia perioperatoria: gravedad de Ring & Messmer (I-IV), adrenalina IV/IM titulada por grado, fluidos, adyuvantes (hidrocortisona, antihistamínicos, salbutamol, vasopresina, glucagón), triptasa seriada, causas frecuentes (BNM, látex, antibióticos, clorhexidina, azul de metileno) y derivación a alergología. Guías BJA/AAGBI 2021, NAP6.",
  openGraph: {
    title: "Anafilaxia perioperatoria — grados, adrenalina y manejo · DEC",
    description:
      "Grados Ring & Messmer, adrenalina titulada por grado, fluidos, adyuvantes, triptasa seriada y causas frecuentes. Guías BJA/AAGBI 2021.",
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
export default function AnafilaxiaPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat anafilaxia-perioperatoria.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Anafilaxia perioperatoria
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          grados Ring &amp; Messmer · adrenalina titulada · fluidos · adyuvantes · triptasa · causas · alergología
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// el paciente sedado no te cuenta que se está muriendo; lo dicen la SpO2, la capno y la TA"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">EMERGENCIA</span>
          <span className="tag tag-muted">BJA/AAGBI 2021</span>
          <span className="tag tag-muted">NAP6</span>
          <span className="tag tag-muted">Ring &amp; Messmer</span>
        </div>
      </header>

      <Callout variant="danger">
        <b>Reconocer es el paso limitante.</b> Bajo anestesia el paciente no refiere síntomas: sospecha
        anafilaxia ante <b>hipotensión inexplicada refractaria</b>, <b>broncoespasmo/aumento de presión
        en vía aérea</b>, <b>desaturación</b>, <b>colapso cardiovascular</b> o taquicardia; el eritema y
        el edema pueden faltar o estar ocultos por los campos. El tratamiento de primera línea es{" "}
        <b>ADRENALINA</b>, no antihistamínicos ni corticoides.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Gradación de gravedad (Ring & Messmer)">
        <P>
          La clasificación de Ring &amp; Messmer estratifica la reacción por gravedad clínica y guía la
          intensidad del tratamiento. El grado <b>determina la dosis inicial de adrenalina</b>. La
          progresión puede ser rápida: revalorar de forma continua y escalar el grado según respuesta.
        </P>
        <Table
          headers={["Grado", "Manifestaciones", "Conducta"]}
          accentCol={0}
          rows={[
            [
              "I",
              "Signos cutáneo-mucosos aislados: eritema, urticaria, ± angioedema. Sin compromiso vital.",
              "Detener desencadenante; observar. Adrenalina no sistemáticamente necesaria.",
            ],
            [
              "II",
              "Afectación multiorgánica moderada: hipotensión, taquicardia, tos, disnea, signos GI.",
              "Adrenalina IV bolo 10–20 mcg; fluidos; escalar si progresa.",
            ],
            [
              "III",
              "Compromiso vital mono/multiorgánico: colapso CV, taquicardia/bradicardia, arritmia, broncoespasmo grave.",
              "Adrenalina IV bolo 50–100 mcg; fluidos agresivos; considerar infusión.",
            ],
            [
              "IV",
              "Paro cardíaco o respiratorio.",
              "RCP + adrenalina dosis de paro 1 mg IV c/3–5 min (protocolo ACLS).",
            ],
          ]}
        />
        <Src>
          Ring J, Messmer K. Lancet 1977;1(8009):466-469. · Harper NJN, et al. (NAP6). Br J Anaesth
          2018;121(1):172-188. · Kolawole H, et al. (ANZAAG/ANZCA). Anaesth Intensive Care 2017;45(2):151-158.
        </Src>
        <Callout variant="info">
          El grado <b>V</b> (muerte) se incluye en algunas versiones. La ausencia de signos cutáneos{" "}
          <b>no descarta</b> anafilaxia: en NAP6 el colapso cardiovascular fue la manifestación más
          frecuente y el eritema/urticaria faltaba en una proporción relevante de casos.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Manejo inmediato — secuencia">
        <P>
          Actuar en paralelo, no en serie. Pedir ayuda temprano y declarar la emergencia en voz alta.
          La adrenalina y el volumen son las intervenciones que salvan la vida.
        </P>
        <Table
          headers={["Paso", "Acción"]}
          rows={[
            ["1 · Reconocer y pedir ayuda", "Declarar «sospecha de anafilaxia»; solicitar carro de paro y personal adicional."],
            ["2 · Detener el desencadenante", "Suspender todo fármaco/producto sospechoso en curso (BNM, antibiótico, coloide, clorhexidina, látex)."],
            ["3 · Vía aérea y O₂", "FiO₂ 100%; asegurar/mantener vía aérea; anticipar edema de vía aérea y broncoespasmo."],
            ["4 · Adrenalina", "IV titulada por grado (ver §3); IM 0.5 mg si no hay acceso IV o ante paro inminente."],
            ["5 · Fluidos", "Cristaloide 10–20 mL/kg en bolo rápido; repetir según respuesta."],
            ["6 · Posición", "Decúbito supino con piernas elevadas (evitar bipedestación/sedestación brusca)."],
            ["7 · Escalar", "Infusión de adrenalina si bolos repetidos; adyuvantes de 2.ª línea; considerar refractariedad."],
            ["8 · Triptasa", "Extraer muestras seriadas de triptasa (ver §5); no retrasar el tratamiento por ello."],
          ]}
        />
        <Src>
          Garvey LH, et al. AAGBI/BSACI guideline. Anaesthesia 2021. · Harper NJN, et al. (NAP6). Br J
          Anaesth 2018. · Cardona V, et al. (WAO). World Allergy Organ J 2020;13(10):100472.
        </Src>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Adrenalina — dosis titulada por grado">
        <P>
          La adrenalina IV se administra <b>titulada</b> por bolos pequeños en el paciente monitorizado
          con acceso venoso, ajustando a la respuesta. La vía IM es la alternativa si no hay acceso IV
          o ante paro inminente. Diluir para titular con seguridad (p. ej. 10 mcg/mL para bolos de 10–20 mcg).
        </P>
        <Table
          headers={["Situación", "Dosis de adrenalina", "Vía"]}
          accentCol={1}
          rows={[
            ["Grado II", "Bolo 10–20 mcg, repetir según respuesta", "IV titulada"],
            ["Grado III", "Bolo 50–100 mcg, repetir según respuesta", "IV titulada"],
            [
              "Grado III–IV / sin acceso IV",
              "100–1000 mcg IV según gravedad · 0.5–1 mg IM (adulto) si no hay acceso o paro inminente",
              "IV / IM",
            ],
            ["Paro cardíaco (grado IV)", "1 mg IV c/3–5 min (dosis de paro ACLS)", "IV"],
            [
              "Refractaria (bolos repetidos)",
              "Infusión 0.05–0.2 mcg/kg/min, titular a TA/perfusión",
              "IV en bomba",
            ],
          ]}
        />
        <Src>
          Garvey LH, et al. AAGBI/BSACI. Anaesthesia 2021. · Kolawole H, et al. (ANZAAG/ANZCA). Anaesth
          Intensive Care 2017;45(2):151-158. · Panel de reanimación / ACLS (dosis de paro).
        </Src>
        <Callout variant="danger">
          <b>Vía y dilución.</b> La adrenalina IV en bolo es de <b>microgramos titulados</b>, no de
          miligramos: el error de dilución (mg por mcg) causa crisis hipertensiva, arritmia e isquemia.
          La dosis IM del autoinyector/ampolla es <b>0.5 mg</b> (0.5 mL de 1 mg/mL) en cara
          anterolateral del muslo. Reservar el <b>1 mg IV</b> exclusivamente para el paro cardíaco.
        </Callout>
        <Callout variant="warn">
          Si tras varios bolos no hay respuesta, iniciar <b>infusión de adrenalina 0.05–0.2 mcg/kg/min</b>{" "}
          antes que seguir con bolos crecientes, y reevaluar el diagnóstico y la causa (dosis no
          administrada, foco persistente como látex o clorhexidina).
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Fluidos y adyuvantes de segunda línea">
        <P>
          El volumen es esencial: la vasodilatación y la fuga capilar producen hipovolemia relativa
          grave. Los adyuvantes (corticoides, antihistamínicos) <b>no son de primera línea</b> y{" "}
          <b>nunca sustituyen</b> a la adrenalina; se añaden una vez estabilizado o en paralelo.
        </P>
        <Table
          headers={["Intervención", "Dosis", "Rol"]}
          accentCol={1}
          rows={[
            [
              "Cristaloide IV",
              "10–20 mL/kg en bolo rápido; repetir según respuesta",
              "1.ª línea junto a adrenalina — corrige hipovolemia por vasodilatación/fuga.",
            ],
            [
              "Hidrocortisona",
              "200 mg IV",
              "Adyuvante — no de rescate; puede atenuar reacción bifásica.",
            ],
            [
              "Antihistamínico H1",
              "Difenhidramina 25–50 mg IV · o clorfenamina 10 mg IV",
              "Adyuvante — alivia síntomas cutáneos; sin efecto sobre el colapso CV.",
            ],
            [
              "Salbutamol",
              "Nebulizado 2.5–5 mg (o salbutamol IV en broncoespasmo grave)",
              "Broncoespasmo refractario a adrenalina.",
            ],
            [
              "Vasopresina",
              "Bolo 1–2 U IV, ± infusión, en shock refractario",
              "Vasoplejía refractaria a adrenalina.",
            ],
            [
              "Glucagón",
              "1–2 mg IV (repetible) en paciente betabloqueado refractario",
              "Rescate de hipotensión/broncoespasmo resistente por betabloqueo.",
            ],
          ]}
        />
        <Src>
          Garvey LH, et al. AAGBI/BSACI. Anaesthesia 2021. · Cardona V, et al. (WAO). World Allergy Organ
          J 2020;13(10):100472. · Kolawole H, et al. (ANZAAG/ANZCA). Anaesth Intensive Care 2017.
        </Src>
        <Callout variant="warn">
          En el paciente <b>betabloqueado</b> la adrenalina puede ser menos eficaz: añadir{" "}
          <b>glucagón 1–2 mg IV</b> (activa la adenilato-ciclasa por vía independiente del receptor
          β) y considerar <b>vasopresina</b>. Proteger la vía aérea: el glucagón induce náusea/vómito.
        </Callout>
        <Callout variant="info">
          <b>Reacción bifásica:</b> puede recurrir horas después (hasta ~72 h). Observación monitorizada
          prolongada tras la estabilización; ingreso en área de cuidados según gravedad y respuesta.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Triptasa sérica seriada (confirmación)">
        <P>
          La triptasa confirma la degranulación mastocitaria y respalda el diagnóstico retrospectivo.
          Se toman muestras <b>seriadas</b>: el patrón (pico transitorio que retorna al basal) tiene más
          valor que un valor aislado. <b>No retrasar el tratamiento</b> para extraerlas.
        </P>
        <Table
          headers={["Muestra", "Momento", "Objetivo"]}
          accentCol={1}
          rows={[
            ["1.ª (aguda)", "Lo antes posible tras iniciar el tratamiento (no retrasar reanimación)", "Captar el pico de triptasa."],
            ["2.ª", "1–2 h del inicio de la reacción", "Confirmar la elevación pico."],
            ["3.ª (basal)", "≥ 24 h después (o en seguimiento)", "Establecer el basal individual; el delta confirma la reacción."],
          ]}
        />
        <Src>
          Garvey LH, et al. AAGBI/BSACI. Anaesthesia 2021. · Harper NJN, et al. (NAP6). Br J Anaesth 2018.
          · Valent P, et al. Criterio de elevación de triptasa (1.2 × basal + 2 µg/L).
        </Src>
        <Callout variant="info">
          Se considera significativa una elevación aguda &gt; <b>(1.2 × triptasa basal) + 2 µg/L</b>.
          Anotar hora exacta de cada extracción y del evento; etiquetar tubos con la cronología. Una
          triptasa normal <b>no descarta</b> anafilaxia (no siempre se eleva).
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Causas frecuentes en anestesia">
        <P>
          El perfil de desencadenantes perioperatorios difiere del de la anafilaxia comunitaria. En
          NAP6 los <b>antibióticos</b> y los <b>bloqueantes neuromusculares</b> fueron las causas más
          frecuentes. Identificar y <b>retirar el agente</b> es parte del tratamiento.
        </P>
        <Table
          headers={["Categoría", "Ejemplos", "Nota"]}
          rows={[
            [
              "Bloqueantes neuromusculares",
              "Rocuronio, succinilcolina (suxametonio)",
              "Causa clásica; posible reactividad cruzada entre BNM; sensibilización previa posible.",
            ],
            [
              "Antibióticos",
              "Betalactámicos (profilaxis quirúrgica), teicoplanina",
              "Causa muy frecuente en NAP6; administrados justo en la inducción.",
            ],
            [
              "Clorhexidina",
              "Antisépticos de piel, lubricantes, catéteres impregnados",
              "Subreconocida; exposición mucosa/parenteral; sospechar por temporalidad.",
            ],
            [
              "Látex",
              "Guantes, sondas, torniquetes, tapones de viales",
              "Inicio a veces más tardío; ambiente látex-safe si sospecha.",
            ],
            [
              "Azul de metileno / colorantes",
              "Azul de metileno, azul patente/isosulfán (mapeo linfático)",
              "Reacciones en cirugía de mama/melanoma; interfiere además con la SpO₂.",
            ],
            [
              "Otros",
              "Coloides, protamina, hemoderivados, AINE, opioides (histamino-liberación)",
              "Considerar según cronología de la administración.",
            ],
          ]}
        />
        <Src>
          Harper NJN, et al. (NAP6). Br J Anaesth 2018;121(1):159-171 &amp; 172-188. · Garvey LH, et al.
          Anaesthesia 2021. · Mertes PM, et al. Epidemiología de la anafilaxia perioperatoria.
        </Src>
        <Callout variant="warn">
          El <b>azul de metileno</b> puede usarse como rescate en shock vasopléjico refractario, pero es
          a la vez un desencadenante potencial y <b>altera la lectura de SpO₂</b> (falsa desaturación
          transitoria). Considerar contexto y monitorización invasiva.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Después de la crisis y derivación">
        <P>
          Toda sospecha de anafilaxia perioperatoria requiere <b>documentación y derivación a
          alergología</b> para investigación (pruebas cutáneas/IgE específicas, típicamente ≥ 4–6
          semanas después) e identificación del agente, evitando futuras exposiciones.
        </P>
        <Table
          headers={["Acción", "Contenido"]}
          rows={[
            ["Documentar", "Cronología fármaco→síntoma, grado, dosis administradas, respuesta, resultados de triptasa."],
            ["Muestras", "Confirmar que las 3 triptasas se extrajeron y etiquetaron con hora."],
            ["Comunicar", "Informar al paciente/familia; registrar la alergia en la historia y en la pulsera/alertas."],
            ["Derivar", "Alergología: pruebas ≥ 4–6 semanas post-evento; identificar agente y alternativas seguras."],
            ["Seguridad futura", "Alertar a equipos de cirugías futuras; entorno látex-safe si aplica; plan de fármacos alternativos."],
          ]}
        />
        <Src>
          Garvey LH, et al. AAGBI/BSACI. Anaesthesia 2021. · Harper NJN, et al. (NAP6). Br J Anaesth 2018.
        </Src>
        <Callout variant="ok">
          No dar el caso por cerrado en quirófano: la anafilaxia perioperatoria sin estudio alergológico
          deja al paciente expuesto a una <b>reexposición potencialmente fatal</b>. La derivación es
          parte del estándar de cuidado.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Resumen de dosis clave">
        <Table
          headers={["Parámetro", "Dosis", "Fuente"]}
          accentCol={1}
          rows={[
            ["Adrenalina IV — grado II", "10–20 mcg bolo titulado", "AAGBI/ANZAAG"],
            ["Adrenalina IV — grado III", "50–100 mcg bolo titulado", "AAGBI/ANZAAG"],
            ["Adrenalina — sin acceso / paro inminente", "100–1000 mcg IV · 0.5–1 mg IM", "AAGBI 2021"],
            ["Adrenalina — paro cardíaco", "1 mg IV c/3–5 min", "ACLS"],
            ["Adrenalina — infusión", "0.05–0.2 mcg/kg/min", "AAGBI/ANZAAG"],
            ["Cristaloide", "10–20 mL/kg bolo rápido", "AAGBI/WAO"],
            ["Hidrocortisona", "200 mg IV", "AAGBI 2021"],
            ["Difenhidramina / clorfenamina", "25–50 mg IV / 10 mg IV", "WAO/AAGBI"],
            ["Glucagón (betabloqueado)", "1–2 mg IV", "AAGBI/WAO"],
            ["Triptasa seriada", "≈ 1–2 h y basal ≥ 24 h", "AAGBI/NAP6"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="09" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Harper NJN, Cook TM, Garcez T, et al. Anaesthesia, surgery, and life-threatening allergic reactions: management and outcomes in the 6th National Audit Project (NAP6). Br J Anaesth 2018;121(1):172-188.</li>
          <li>Harper NJN, Cook TM, Garcez T, et al. Epidemiology and clinical features of perioperative anaphylaxis (NAP6). Br J Anaesth 2018;121(1):159-171.</li>
          <li>Garvey LH, Dewachter P, Hepner DL, et al. (AAGBI/BSACI). Management of suspected perioperative allergic reactions. Anaesthesia 2021 / Br J Anaesth 2019;123(1):e50-e64.</li>
          <li>Kolawole H, Marshall SD, Crilly H, et al. Australian and New Zealand Anaesthetic Allergy Group / ANZCA perioperative anaphylaxis management guidelines. Anaesth Intensive Care 2017;45(2):151-158.</li>
          <li>Ring J, Messmer K. Incidence and severity of anaphylactoid reactions to colloid volume substitutes. Lancet 1977;1(8009):466-469.</li>
          <li>Cardona V, Ansotegui IJ, Ebisawa M, et al. World Allergy Organization anaphylaxis guidance 2020. World Allergy Organ J 2020;13(10):100472.</li>
          <li>Mertes PM, Volcheck GW, Garvey LH, et al. Epidemiology of perioperative anaphylaxis. Presse Med 2016;45(9):758-767.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y grados de literatura aceptada (BJA/AAGBI 2021 · NAP6 · Ring & Messmer · WAO)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// adrenalina en mcg titulados por vía IV: confundir mg con mcg también es una emergencia"}
          <br />
          {"// antihistamínico y corticoide NO son de primera línea: primero adrenalina, siempre"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
