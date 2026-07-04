import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

// ============================================================
// Guía de referencia — HEMORRAGIA OBSTÉTRICA POSTPARTO (HPP)
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: dosis, umbrales y ratios de literatura aceptada
// (RCOG, WOMAN trial, WHO). Cada dato lleva referencia (Vancouver breve).
// NO inventar dosis ni nombres. Las dosis marcadas son obligatorias.
// Fuentes primarias:
//  - RCOG Green-top Guideline No. 52. Prevention and Management of
//    Postpartum Haemorrhage. BJOG 2017;124:e106-e149.
//  - WOMAN Trial Collaborators. Effect of early tranexamic acid on
//    death, hysterectomy in women with PPH. Lancet 2017;389:2105-2116.
//  - WHO Recommendations on prevention and treatment of PPH. 2012/2018.
// ============================================================

export const metadata: Metadata = {
  title: "Hemorragia obstétrica postparto (HPP) — Guía clínica · DEC",
  description:
    "Referencia perioperatoria de hemorragia postparto (HPP): definición y las 4 T (Tono, Trauma, Tejido, Trombina), uterotónicos con dosis exactas (oxitocina, ergometrina, carbetocina, misoprostol, carboprost), ácido tranexámico (WOMAN trial), protocolo de transfusión masiva 1:1:1, fibrinógeno/crioprecipitado y medidas quirúrgicas (Bakri, B-Lynch, embolización, histerectomía). RCOG 2017, WOMAN 2017.",
  openGraph: {
    title: "Hemorragia obstétrica postparto (HPP) — Guía clínica · DEC",
    description:
      "Las 4 T, uterotónicos con dosis exactas, ácido tranexámico, transfusión masiva 1:1:1 y medidas quirúrgicas en HPP. RCOG 2017, WOMAN 2017.",
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
  children: ReactNode;
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
  rows: ReactNode[][];
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
  children: ReactNode;
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

function P({ children }: { children: ReactNode }) {
  return (
    <p style={{ color: "var(--text-1)", fontSize: "0.9rem", lineHeight: 1.75, margin: "0 0 1rem" }}>
      {children}
    </p>
  );
}

function Src({ children }: { children: ReactNode }) {
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
export default function HemorragiaPostpartoPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat hemorragia-postparto.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Hemorragia obstétrica postparto (HPP)
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          4 T · uterotónicos · ácido tranexámico · transfusión masiva 1:1:1 · medidas quirúrgicas
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// el útero atónico no negocia: masaje, oxitocina y no soltar el reloj"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">REFERENCIA</span>
          <span className="tag tag-muted">RCOG 2017</span>
          <span className="tag tag-muted">WOMAN 2017</span>
          <span className="tag tag-muted">WHO</span>
        </div>
      </header>

      <Callout variant="danger">
        La HPP es una <b>emergencia con reloj</b>: la mayoría de muertes maternas por hemorragia son
        evitables y ocurren por reconocimiento tardío e infratransfusión. Ante sangrado postparto
        activo: pedir ayuda, dos vías gruesas, iniciar reanimación, buscar la causa por las <b>4 T</b>{" "}
        y escalar uterotónicos <b>en paralelo</b>, no en serie.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Definición y estratificación">
        <P>
          HPP primaria: pérdida de sangre <b>≥ 500 mL</b> en las primeras 24 h tras el parto vaginal, o{" "}
          <b>≥ 1000 mL</b> tras cesárea, o cualquier pérdida que produzca inestabilidad hemodinámica.
          HPP secundaria (tardía): sangrado anómalo desde las 24 h hasta las 12 semanas posparto.
        </P>
        <Table
          headers={["Categoría", "Pérdida estimada", "Conducta"]}
          accentCol={1}
          rows={[
            ["HPP menor", "500–1000 mL sin shock", "Vía IV, cristaloides, monitoreo, buscar causa (4 T)"],
            ["HPP mayor", "> 1000 mL o shock / sangrado continuo", "Activar protocolo, escalar uterotónicos, laboratorio, banco de sangre"],
            ["HPP masiva", "> 2000 mL o > 1 volemia / 24 h", "Activar protocolo de transfusión masiva; ratio 1:1:1; medidas quirúrgicas"],
          ]}
        />
        <Src>
          RCOG Green-top Guideline No. 52. BJOG 2017;124:e106-e149. · WHO Recommendations on the
          prevention and treatment of postpartum haemorrhage. 2012.
        </Src>
        <Callout variant="warn">
          La estimación <b>visual</b> subestima la pérdida real hasta en un 30–50%. Los signos vitales
          engañan: la gestante joven compensa y se descompensa de golpe. Pesar compresas/paños y usar
          bolsas colectoras graduadas mejora la estimación.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Etiología — las 4 T">
        <P>
          Toda HPP se explica por una o varias de las <b>4 T</b>. El <b>Tono</b> (atonía uterina) es la
          causa de ~70% de los casos y el primer objetivo terapéutico. Buscar las cuatro de forma
          sistemática mientras se reanima.
        </P>
        <Table
          headers={["T", "Mecanismo", "Frecuencia", "Acción dirigida"]}
          rows={[
            [
              "Tono",
              "Atonía uterina (útero blando, no contraído)",
              "≈ 70%",
              "Masaje uterino bimanual + uterotónicos escalonados; vaciar vejiga",
            ],
            [
              "Trauma",
              "Laceración de canal, desgarro, rotura o inversión uterina, hematoma",
              "≈ 20%",
              "Revisión del canal, reparar desgarros, reponer inversión",
            ],
            [
              "Tejido",
              "Retención de placenta / restos, placenta acreta",
              "≈ 10%",
              "Extracción manual / legrado; sospechar acretismo",
            ],
            [
              "Trombina",
              "Coagulopatía (congénita, adquirida, CID, dilucional)",
              "≈ 1%",
              "Corregir coagulopatía; TXA; hemoderivados guiados",
            ],
          ]}
        />
        <Src>RCOG Green-top No. 52, BJOG 2017. · WHO PPH Recommendations 2012/2018.</Src>
        <Callout variant="info">
          Regla de trabajo: si el útero está <b>bien contraído</b> pero sigue sangrando, la causa está
          en <b>Trauma</b> o <b>Tejido</b> — revisar el canal y descartar restos antes de escalar más
          uterotónicos.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Medidas iniciales (bundle de reanimación)">
        <P>
          Actuar simultáneamente en cuatro frentes: comunicación (pedir ayuda / activar protocolo),
          reanimación (vía, fluidos, oxígeno), monitoreo/laboratorio y control de la causa. No secuenciar.
        </P>
        <ol style={{ color: "var(--text-1)", fontSize: "0.86rem", lineHeight: 1.85, paddingLeft: "1.3rem", margin: "0 0 1rem" }}>
          <li><b>Pedir ayuda</b> y activar protocolo de HPP mayor / código hemorragia.</li>
          <li><b>Dos vías periféricas gruesas</b> (14–16 G); extraer muestras (hemograma, coagulación, fibrinógeno, grupo y pruebas cruzadas).</li>
          <li><b>Oxígeno</b>, posición, mantener normotermia (evitar la tríada letal).</li>
          <li><b>Cristaloides tibios</b> mientras llega la sangre; evitar sobrecarga que diluya la coagulación.</li>
          <li><b>Masaje uterino bimanual</b> y <b>vaciar la vejiga</b> (sonda) — la vejiga llena impide la contracción.</li>
          <li><b>Uterotónicos escalonados</b> (§04) + <b>ácido tranexámico 1 g IV</b> (§05) precoz.</li>
          <li><b>Revisión del canal</b> del parto y descartar restos placentarios.</li>
          <li>Monitoreo continuo; considerar catéter arterial y sonda vesical con diuresis horaria.</li>
        </ol>
        <Src>RCOG Green-top No. 52, BJOG 2017 (four-component approach). · WHO 2012.</Src>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Uterotónicos — dosis exactas">
        <P>
          Escalonar mientras persiste la atonía. Respetar contraindicaciones: <b>ergometrina</b> no en
          HTA/preeclampsia; <b>carboprost</b> no en asma. Cada dosis es exacta — no aproximar.
        </P>
        <Table
          headers={["Fármaco", "Dosis", "Vía / pauta", "Precaución clave"]}
          accentCol={1}
          rows={[
            [
              "Oxitocina",
              "5 UI IV lento + 40 UI / 500 mL en infusión",
              "Bolo IV lento; luego infusión de mantenimiento",
              "Bolo rápido → hipotensión y taquicardia; administrar lento",
            ],
            [
              "Ergometrina",
              "0.2–0.5 mg IM",
              "IM (o IV lento diluido en contextos seleccionados)",
              "CONTRAINDICADA en HTA / preeclampsia (vasoconstricción)",
            ],
            [
              "Carbetocina",
              "100 mcg IV",
              "Dosis única IV lenta",
              "Análogo de oxitocina de acción prolongada; misma precaución hemodinámica",
            ],
            [
              "Misoprostol",
              "800 mcg",
              "Sublingual o rectal",
              "Fiebre / escalofríos frecuentes; útil si no hay acceso IV o cadena de frío",
            ],
            [
              "Carboprost (PGF2α)",
              "250 mcg IM c/15–90 min según respuesta (mín. 15 min entre dosis; máx 2 mg = 8 dosis)",
              "IM (o intramiometrial por cirujano)",
              "CONTRAINDICADO en asma; broncoespasmo, hipertensión pulmonar",
            ],
          ]}
        />
        <Src>
          RCOG Green-top No. 52, BJOG 2017. · WHO Recommendations on uterotonics for the prevention of
          PPH. 2018. · Datos de producto (FDA / SmPC): carboprost, ergometrina, carbetocina.
        </Src>
        <Callout variant="danger">
          <b>Ergometrina 0.2–0.5 mg IM</b> está contraindicada en <b>hipertensión y preeclampsia</b>:
          provoca vasoconstricción y crisis hipertensiva. <b>Carboprost 250 mcg IM</b> está
          contraindicado en <b>asma</b> por broncoespasmo. Verificar antecedentes antes de administrar.
        </Callout>
        <Callout variant="warn">
          <b>Oxitocina:</b> el bolo IV en carga rápida causa vasodilatación, hipotensión y taquicardia
          refleja (relevante en la cardiópata o hipovolémica). Dar <b>5 UI IV lento</b> y continuar con
          <b> infusión 40 UI en 500 mL</b> de cristaloide. <b>Carboprost:</b> no superar <b>2 mg</b>{" "}
          (8 dosis de 250 mcg) en total.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Ácido tranexámico (WOMAN trial)">
        <P>
          Antifibrinolítico. Reduce la mortalidad por sangrado en HPP cuando se administra{" "}
          <b>precozmente</b> (idealmente dentro de las 3 h del inicio del sangrado). Beneficio menor si
          se retrasa. Administrar tan pronto se diagnostique la HPP, sin esperar al laboratorio.
        </P>
        <div className="panel" style={{ margin: "0 0 1rem", borderLeft: "3px solid var(--accent)" }}>
          <div className="panel-body" style={{ display: "grid", gap: "0.5rem" }}>
            <div className="mono" style={{ color: "var(--accent)", fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.02em" }}>
              TXA 1 g IV (en 10 min)
            </div>
            <div className="mono" style={{ color: "var(--text-2)", fontSize: "0.72rem", lineHeight: 1.7 }}>
              Repetir <b style={{ color: "var(--accent)" }}>1 g IV a los 30 min</b> si el sangrado
              persiste o reaparece dentro de las 24 h.
              <br />
              Administrar lo antes posible; el beneficio cae si se retrasa &gt; 3 h.
            </div>
          </div>
        </div>
        <Src>
          WOMAN Trial Collaborators. Lancet 2017;389(10084):2105-2116. · WHO Recommendation on TXA for
          the treatment of PPH. 2017.
        </Src>
        <Callout variant="info">
          El ensayo <b>WOMAN (2017)</b>, con &gt; 20.000 mujeres, demostró que el TXA precoz reduce la
          muerte por hemorragia sin aumentar eventos trombóticos. Es tratamiento complementario a los
          uterotónicos y a la reposición, no un sustituto del control de la causa.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Reposición y transfusión masiva">
        <P>
          En HPP masiva se transfunde por <b>clínica y ratio</b>, no por cifras de laboratorio que van
          por detrás del sangrado. Activar el protocolo de transfusión masiva de forma temprana y guiar
          la reposición con <b>monitoreo viscoelástico</b> (TEG / ROTEM) cuando esté disponible.
        </P>
        <Table
          headers={["Parámetro", "Objetivo / valor"]}
          rows={[
            ["Ratio empírico inicial", "PRBC : PFC : Plaquetas ≈ 1 : 1 : 1"],
            ["Ácido tranexámico", "1 g IV + 1 g a los 30 min (WOMAN 2017)"],
            [
              "Fibrinógeno",
              "Mantener > 2 g/L; reponer con crioprecipitado o fibrinógeno concentrado si < 2 g/L",
            ],
            ["Plaquetas", "Mantener > 50 ×10⁹/L (> 75 si sangrado persistente)"],
            ["Calcio iónico", "> 1.0–1.1 mmol/L (el citrato de los hemoderivados lo secuestra)"],
            ["Temperatura / pH", "Normotermia (> 35 °C); corregir acidosis"],
            ["Guía por punto de cuidado", "TEG / ROTEM para dirigir la reposición dirigida"],
          ]}
        />
        <Src>
          RCOG Green-top No. 52, BJOG 2017. · Collins P, et al. Management of coagulopathy associated
          with PPH: viscoelastic-guided therapy. · WOMAN Trial, Lancet 2017.
        </Src>
        <Callout variant="warn">
          En obstetricia el umbral de fibrinógeno es <b>más alto</b> que en el trauma general: el
          fibrinógeno cae precozmente en la HPP y un valor <b>&lt; 2 g/L</b> predice progresión a
          hemorragia grave. Reponer con <b>crioprecipitado</b> o <b>concentrado de fibrinógeno</b> sin
          esperar a que caiga más.
        </Callout>
        <Callout variant="danger">
          <b>Tríada letal:</b> hipotermia + acidosis + coagulopatía se retroalimentan. Calentar fluidos
          y hemoderivados, reponer calcio y no diluir la coagulación con exceso de cristaloides.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Medidas quirúrgicas y mecánicas (escalada)">
        <P>
          Si la HPP no cede con medidas médicas (uterotónicos + TXA + reposición), escalar sin demora a
          medidas mecánicas y quirúrgicas. El orden va de menos a más invasivo, pero la histerectomía no
          debe retrasarse cuando la vida está en riesgo.
        </P>
        <Table
          headers={["Medida", "Descripción", "Indicación"]}
          rows={[
            [
              "Taponamiento con balón (Bakri)",
              "Balón intrauterino que ejerce presión sobre el lecho placentario",
              "Atonía que no responde a fármacos; 1.ª línea mecánica",
            ],
            [
              "Sutura de compresión (B-Lynch)",
              "Sutura que comprime el útero de forma longitudinal",
              "Atonía en cesárea o laparotomía; útero exteriorizable",
            ],
            [
              "Embolización arterial",
              "Embolización de arterias uterinas por radiología intervencionista",
              "Paciente estable, disponibilidad de intervencionismo",
            ],
            [
              "Ligadura vascular",
              "Ligadura de arterias uterinas / hipogástricas (ilíacas internas)",
              "Sangrado persistente en laparotomía",
            ],
            [
              "Histerectomía",
              "Histerectomía obstétrica (subtotal o total)",
              "Fracaso de lo anterior o hemorragia incoercible; no demorar si peligra la vida",
            ],
          ]}
        />
        <Src>RCOG Green-top No. 52, BJOG 2017 (escalated surgical management). · WHO PPH 2012.</Src>
        <Callout variant="ok">
          <b>Regla de oro:</b> la histerectomía tardía cuesta vidas. Involucrar temprano al obstetra
          senior y considerarla cuando el balón y las suturas fallan, especialmente si hay acretismo o
          rotura uterina. Salvar el útero es secundario a salvar a la paciente.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Resumen de dosis y umbrales clave">
        <Table
          headers={["Ítem", "Dosis / umbral", "Fuente"]}
          accentCol={1}
          rows={[
            ["Oxitocina", "5 UI IV lento + 40 UI / 500 mL infusión", "RCOG 2017"],
            ["Ergometrina (no en HTA/PE)", "0.2–0.5 mg IM", "RCOG 2017"],
            ["Carbetocina", "100 mcg IV", "RCOG 2017 / WHO 2018"],
            ["Misoprostol", "800 mcg SL / rectal", "WHO 2018"],
            ["Carboprost (no en asma)", "250 mcg IM c/15–90 min · máx 2 mg", "RCOG 2017 / SmPC"],
            ["Ácido tranexámico", "1 g IV, repetir a 30 min", "WOMAN 2017"],
            ["Ratio transfusión masiva", "PRBC : PFC : PLT ≈ 1 : 1 : 1", "RCOG 2017"],
            ["Fibrinógeno objetivo", "> 2 g/L (crio si < 2 g/L)", "RCOG 2017"],
            ["Plaquetas objetivo", "> 50 ×10⁹/L", "RCOG 2017"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="09" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Mavrides E, Allard S, Chandraharan E, et al. Prevention and Management of Postpartum Haemorrhage (RCOG Green-top Guideline No. 52). BJOG 2017;124:e106-e149.</li>
          <li>WOMAN Trial Collaborators. Effect of early tranexamic acid administration on mortality, hysterectomy, and other morbidities in women with post-partum haemorrhage (WOMAN): an international, randomised, double-blind, placebo-controlled trial. Lancet 2017;389(10084):2105-2116.</li>
          <li>World Health Organization. WHO Recommendations for the Prevention and Treatment of Postpartum Haemorrhage. Geneva: WHO; 2012.</li>
          <li>World Health Organization. WHO Recommendations: Uterotonics for the Prevention of Postpartum Haemorrhage. Geneva: WHO; 2018.</li>
          <li>World Health Organization. WHO Recommendation on Tranexamic Acid for the Treatment of Postpartum Haemorrhage. Geneva: WHO; 2017.</li>
          <li>Collins PW, Lilley G, Bruynseels D, et al. Fibrin-based clot formation as an early and rapid biomarker for progression of postpartum haemorrhage. Blood 2014;124(11):1727-1736.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco (solo en el footer, nunca en contenido clínico) */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y umbrales de literatura aceptada (RCOG 2017, WOMAN 2017, WHO)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// en HPP el enemigo es el reloj: el retraso mata más que el ratio imperfecto"}
          <br />
          {"// si dudas entre salvar el útero y salvar a la paciente, ya sabes la respuesta"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
