import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — FEOCROMOCITOMA Y CRISIS HIPERTENSIVA
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: dosis, umbrales y secuencias tomados de
// literatura aceptada. Cada tabla/callout cita su fuente
// (Vancouver breve). NO inventar dosis ni cifras.
// Fuentes primarias:
//  - Lenders JWM, et al. Pheochromocytoma and Paraganglioma:
//    An Endocrine Society Clinical Practice Guideline.
//    J Clin Endocrinol Metab 2014;99(6):1915-1942.
//  - Roizen MF, Fleisher LA. Anesthetic implications of
//    concurrent diseases (pheochromocytoma). Miller's Anesthesia.
//  - Stoelting RK, Hines RL. Endocrine disease — pheochromocytoma.
//    Stoelting's Anesthesia and Co-Existing Disease.
//  - Whelton PK, et al. 2017 ACC/AHA Hypertension Guideline
//    (hypertensive crisis). J Am Coll Cardiol 2018;71:e127-e248.
// ============================================================

export const metadata: Metadata = {
  title: "Feocromocitoma y crisis hipertensiva — Guía clínica — DEC",
  description:
    "Referencia perioperatoria del feocromocitoma: bloqueo alfa antes que beta (fenoxibenzamina/doxazosina 10-14 días), manejo intraop de crisis hipertensiva (fentolamina 1-5 mg IV, nitroprusiato, nicardipino, magnesio, esmolol), hipotensión tras ligar la vena e hipoglucemia. Metas y fármacos IV titulables en crisis HTA general. Endocrine Society 2014, ACC/AHA.",
  openGraph: {
    title: "Feocromocitoma y crisis hipertensiva — Guía clínica — DEC",
    description:
      "Bloqueo alfa antes que beta, manejo intraop de la crisis catecolaminérgica, hipotensión post-ligadura y crisis hipertensiva general.",
    type: "article",
  },
};

// ------------------------------------------------------------
// Helpers de presentación (mismo lenguaje visual que blog/[slug])
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
export default function FeocromocitomaPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./feocromocitoma.sh
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Feocromocitoma y crisis hipertensiva
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          bloqueo alfa antes que beta · crisis catecolaminérgica intraop · hipotensión post-ligadura · crisis HTA general
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// un tumor que dispara adrenalina a demanda; el orden de los bloqueos no es opcional"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">REFERENCIA</span>
          <span className="tag tag-muted">Endocrine Society 2014</span>
          <span className="tag tag-muted">ACC/AHA</span>
          <span className="tag tag-muted">Miller · Stoelting</span>
        </div>
      </header>

      <Callout variant="danger">
        <b>Regla que define todo el caso:</b> el <b>bloqueo alfa va SIEMPRE primero</b> (10–14 días) y el{" "}
        <b>bloqueo beta solo después</b>, si hace falta. Iniciar un betabloqueante antes del alfa deja la
        vasoconstricción alfa sin oposición y precipita <b>crisis hipertensiva, edema pulmonar e insuficiencia
        cardíaca</b>. No hay excepción a este orden.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Preparación preoperatoria — bloqueo alfa PRIMERO">
        <P>
          La Endocrine Society recomienda bloqueo adrenérgico preoperatorio en todo feocromocitoma/paraganglioma
          funcionante, iniciando con un <b>alfa-bloqueante</b> al menos <b>10–14 días</b> antes de la cirugía, con
          el objetivo de normalizar la presión arterial y la frecuencia cardíaca, restaurar el volumen intravascular
          contraído por la vasoconstricción crónica y prevenir la crisis catecolaminérgica intraoperatoria.
        </P>
        <Table
          headers={["Fármaco", "Dosis inicial", "Titulación / dosis diana", "Notas"]}
          accentCol={1}
          rows={[
            [
              "Fenoxibenzamina",
              "10 mg VO c/12 h",
              "↑ 10–20 mg cada 2–3 días hasta control TA; típico 20–100 mg/día",
              "Alfa no selectivo, irreversible. Bloqueo prolongado → puede dar hipotensión post-resección más marcada.",
            ],
            [
              "Doxazosina",
              "1–2 mg VO/día",
              "↑ hasta 2–8 mg/día (hasta 16–32 mg/día en algunos casos)",
              "Alfa-1 selectivo, competitivo. Menos taquicardia refleja y menos hipotensión residual que fenoxibenzamina.",
            ],
            [
              "Prazosina / terazosina",
              "Prazosina 1 mg, terazosina 1–2 mg",
              "Titular a respuesta",
              "Alfa-1 selectivos alternativos; vida media corta (prazosina).",
            ],
          ]}
        />
        <Src>
          Lenders JWM, et al. Endocrine Society Clinical Practice Guideline. J Clin Endocrinol Metab
          2014;99(6):1915-1942. · Stoelting&apos;s Anesthesia and Co-Existing Disease — pheochromocytoma.
        </Src>
        <Callout variant="warn">
          <b>Metas de preparación (criterios de Roizen, orientativos):</b> TA en sedestación &lt; 130/80 mmHg;
          TA en bipedestación &gt; 90 mmHg sistólica (se busca cierta hipotensión ortostática que confirma el
          bloqueo); FC 60–70 lpm sentado; sin cambios ST-T nuevos y sin extrasistolia ventricular frecuente.
          Repleción de volumen y dieta con sal liberal la última semana (salvo contraindicación cardíaca).
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Bloqueo beta — solo DESPUÉS del alfa">
        <P>
          El betabloqueante se añade <b>únicamente tras un bloqueo alfa adecuado</b> (habitualmente 2–3 días antes
          de la cirugía) y solo si persiste <b>taquicardia o taquiarritmia</b> refleja. Nunca como primer fármaco.
        </P>
        <Table
          headers={["Paso", "Contenido", "Motivo"]}
          rows={[
            [
              "1 · Alfa establecido",
              "Confirmar ≥ 10–14 días de alfa-bloqueo con metas de TA/volumen cumplidas",
              "El lecho vascular ya no depende del tono alfa sin oposición",
            ],
            [
              "2 · Añadir beta",
              "Betabloqueante 2–3 días antes si FC alta o arritmia (p. ej. propranolol, atenolol, metoprolol)",
              "Controla la taquicardia refleja inducida por el alfa-bloqueo",
            ],
            [
              "3 · Nunca invertir",
              "NO iniciar beta antes de alfa bajo ninguna circunstancia",
              "Beta sin alfa → vasoconstricción α sin oposición → crisis HTA, edema pulmonar, IC",
            ],
          ]}
        />
        <Src>Lenders JWM, et al. J Clin Endocrinol Metab 2014;99:1915. · Miller&apos;s Anesthesia — endocrine.</Src>
        <Callout variant="danger">
          <b>Por qué el orden importa fisiológicamente:</b> la adrenalina estimula receptores α (vasoconstricción)
          y β₂ (vasodilatación). Si se bloquea β primero, se retira la vasodilatación β₂ y queda la
          vasoconstricción α desenfrenada → <b>hipertensión paradójica grave</b>. El alfa-bloqueo previo elimina
          ese riesgo.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Crisis hipertensiva INTRAOPERATORIA (manipulación tumoral)">
        <P>
          La manipulación del tumor, la inducción, la intubación y el neumoperitoneo pueden desencadenar
          descargas catecolaminérgicas con hipertensión súbita y grave. Se manejan con <b>vasodilatadores IV de
          acción corta y titulables</b>; la fentolamina (antagonista alfa) es el fármaco clásico de rescate.
          Comunicación continua con el cirujano para pausar la manipulación durante los picos.
        </P>
        <Table
          headers={["Fármaco", "Clase", "Dosis IV", "Notas"]}
          accentCol={2}
          rows={[
            [
              "Fentolamina",
              "Antagonista α no selectivo",
              "Bolo 1–5 mg IV; repetir según respuesta; puede seguirse de infusión",
              "Rescate clásico de la crisis por descarga adrenérgica. Inicio rápido, corta duración.",
            ],
            [
              "Nitroprusiato de sodio",
              "Vasodilatador (dador de NO)",
              "Infusión 0.3–2 µg/kg/min; máx 10 µg/kg/min (breve)",
              "Titulable, inicio y offset muy rápidos. Vigilar toxicidad por cianuro en dosis altas/prolongadas.",
            ],
            [
              "Nicardipino",
              "Antagonista del calcio (dihidropiridina)",
              "Infusión 5 mg/h; ↑ 2.5 mg/h cada 5–15 min; máx 15 mg/h",
              "Buen control arterial, poca taquicardia refleja. Alternativa de primera línea.",
            ],
            [
              "Sulfato de magnesio",
              "Inhibe liberación de catecolaminas / vasodilatador",
              "Bolo 2–4 g IV; luego infusión 1–2 g/h",
              "Útil como coadyuvante; estabiliza el miocardio y atenúa las descargas.",
            ],
            [
              "Esmolol",
              "Betabloqueante β₁ selectivo, ultracorto",
              "Bolo 0.5 mg/kg; infusión 50–200 µg/kg/min",
              "Para TAQUIARRITMIAS. Solo con alfa-bloqueo/vasodilatador ya activos; nunca β aislado.",
            ],
            [
              "Clevidipino",
              "Antagonista del calcio ultracorto",
              "Infusión 1–2 mg/h; duplicar cada 90 s; máx ~16 mg/h",
              "Alternativa a nicardipino donde esté disponible; vida media muy corta.",
            ],
          ]}
        />
        <Src>
          Lenders JWM, et al. J Clin Endocrinol Metab 2014;99:1915. · Miller&apos;s Anesthesia · Stoelting&apos;s
          Anesthesia and Co-Existing Disease — intraoperative management of pheochromocytoma.
        </Src>
        <Callout variant="danger">
          <b>Taquiarritmias:</b> tratar con <b>esmolol</b> (u otro betabloqueante) SOLO cuando ya hay
          alfa-bloqueo o vasodilatador en curso. Administrar un betabloqueante durante un pico de TA sin cobertura
          alfa reproduce el error del preop y agrava la crisis.
        </Callout>
        <Callout variant="info">
          Tener preparados en la bomba/jeringa <b>antes de la manipulación</b>: fentolamina, nitroprusiato o
          nicardipino, esmolol y magnesio. La crisis se anticipa, no se improvisa. Línea arterial y accesos de
          gran calibre obligatorios.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Tras ligar la vena — HIPOTENSIÓN y hipoglucemia">
        <P>
          Al ligar el drenaje venoso del tumor, la fuente de catecolaminas desaparece de golpe. Sobre un lecho
          vascular vasodilatado (bloqueo alfa residual) y a menudo hipovolémico, sobreviene <b>hipotensión brusca</b>.
          Primera línea: <b>fluidos</b> (reposición generosa de volumen). Si persiste, <b>noradrenalina</b> —
          reconociendo que su respuesta puede estar atenuada (down-regulation de receptores) y que hay riesgo de
          hipertensión de rebote; titular con cuidado.
        </P>
        <Table
          headers={["Problema post-ligadura", "Manejo", "Notas"]}
          rows={[
            [
              "Hipotensión",
              "1.º FLUIDOS (cristaloide/coloide, guiado por volemia); 2.º noradrenalina si refractaria",
              "Anticipar reduciendo/deteniendo vasodilatadores antes de la ligadura. Noradrenalina puede tener respuesta atenuada; ojo con rebote.",
            ],
            [
              "Hipoglucemia",
              "Vigilar glucemia seriada; corregir con dextrosa IV",
              "Al cesar la inhibición adrenérgica de la insulina, hay rebote de insulina → hipoglucemia. Fácil de enmascarar bajo anestesia.",
            ],
            [
              "Vasoplejía persistente",
              "Vasopresina como coadyuvante; continuar volumen",
              "Útil cuando la respuesta a catecolaminas está agotada.",
            ],
          ]}
        />
        <Src>
          Lenders JWM, et al. J Clin Endocrinol Metab 2014;99:1915. · Stoelting&apos;s / Miller&apos;s —
          post-ligation hypotension and rebound hypoglycemia.
        </Src>
        <Callout variant="warn">
          <b>Coordinación con el cirujano:</b> avisar del momento de la ligadura venosa para reducir vasodilatadores
          y precargar volumen justo antes. Mantener <b>monitorización glucémica</b> en el intra y postoperatorio
          inmediato: la hipoglucemia es frecuente y silenciosa bajo anestesia general.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Crisis hipertensiva general — metas y fármacos IV">
        <P>
          Fuera del contexto del feocromocitoma, una <b>emergencia hipertensiva</b> (TA muy elevada con daño agudo
          de órgano diana) exige descenso <b>controlado y gradual</b> con fármacos IV titulables. Bajar demasiado
          rápido puede provocar hipoperfusión cerebral, coronaria o renal.
        </P>
        <Table
          headers={["Escenario", "Meta de descenso"]}
          accentCol={1}
          rows={[
            [
              "Emergencia HTA (general)",
              "↓ ≤ 25% de la TAM en la 1.ª hora; luego a ~160/100–110 en 2–6 h; normalizar en 24–48 h",
            ],
            [
              "Disección aórtica",
              "Rápido: TAS ~100–120 mmHg y FC ~60 lpm en 20 min (β + vasodilatador)",
            ],
            [
              "ACV isquémico agudo",
              "Manejo conservador; umbrales específicos según trombólisis (no descender de rutina)",
            ],
            [
              "Feocromocitoma / catecolaminérgica",
              "Titular con vasodilatador/α (fentolamina, nicardipino, nitroprusiato); β solo con α previo",
            ],
          ]}
        />
        <Src>
          Whelton PK, et al. 2017 ACC/AHA Hypertension Guideline. J Am Coll Cardiol 2018;71:e127-e248. ·
          Lenders JWM, et al. J Clin Endocrinol Metab 2014;99:1915 (contexto catecolaminérgico).
        </Src>
        <Table
          headers={["Fármaco", "Clase", "Dosis IV titulable"]}
          accentCol={2}
          rows={[
            ["Nicardipino", "Antagonista del calcio", "5 mg/h; ↑ 2.5 mg/h c/5–15 min; máx 15 mg/h"],
            ["Clevidipino", "Antagonista del calcio ultracorto", "1–2 mg/h; duplicar c/90 s; máx ~16 mg/h"],
            ["Nitroprusiato", "Dador de NO", "0.3–2 µg/kg/min; máx 10 µg/kg/min (breve)"],
            ["Labetalol", "α/β bloqueante", "Bolo 10–20 mg; repetir/doblar c/10 min; o infusión 0.5–2 mg/min"],
            ["Esmolol", "β₁ ultracorto", "Bolo 0.5 mg/kg; infusión 50–200 µg/kg/min"],
            ["Fentolamina", "Antagonista α", "1–5 mg IV en bolo (exceso catecolaminérgico)"],
          ]}
        />
        <Src>Whelton PK, et al. J Am Coll Cardiol 2018;71:e127. · Miller&apos;s Anesthesia — hypertensive emergencies.</Src>
        <Callout variant="warn">
          En crisis HTA por <b>exceso de catecolaminas</b> (feocromocitoma, cocaína, retirada de clonidina),
          <b> evitar el betabloqueante como agente único</b>: reproduce la vasoconstricción α sin oposición. Usar
          primero α-bloqueo / vasodilatador; el labetalol (α+β) o el esmolol se añaden con esa cobertura.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Resumen de dosis clave">
        <Table
          headers={["Fármaco / paso", "Dosis / meta", "Fuente"]}
          accentCol={1}
          rows={[
            ["Fenoxibenzamina (preop)", "10 mg c/12 h, titular; 10–14 días previos", "Endocrine Soc 2014"],
            ["Doxazosina (preop)", "1–2 mg/día, titular a 2–8 (–16) mg/día", "Endocrine Soc 2014"],
            ["Orden de bloqueo", "ALFA primero (10–14 d) → beta después", "Endocrine Soc 2014"],
            ["Fentolamina (crisis)", "1–5 mg IV en bolo, repetir", "Endocrine Soc / Miller"],
            ["Nicardipino", "5 mg/h → máx 15 mg/h", "Miller / ACC-AHA"],
            ["Nitroprusiato", "0.3–2 µg/kg/min (máx 10)", "Miller"],
            ["Magnesio (coadyuv.)", "2–4 g IV bolo + 1–2 g/h", "Miller / Stoelting"],
            ["Esmolol (taquiarritmia)", "0.5 mg/kg bolo → 50–200 µg/kg/min", "Miller"],
            ["Post-ligadura hipoTA", "Fluidos 1.º → noradrenalina si refractaria", "Endocrine Soc / Stoelting"],
            ["Post-ligadura glucemia", "Vigilar; dextrosa IV si hipoglucemia", "Stoelting / Miller"],
            ["Emergencia HTA general", "↓ ≤ 25% TAM en 1.ª h", "ACC/AHA 2017"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Lenders JWM, Duh QY, Eisenhofer G, et al. Pheochromocytoma and Paraganglioma: An Endocrine Society Clinical Practice Guideline. J Clin Endocrinol Metab 2014;99(6):1915-1942.</li>
          <li>Roizen MF, Fleisher LA. Anesthetic implications of concurrent diseases — pheochromocytoma. En: Miller&apos;s Anesthesia.</li>
          <li>Hines RL, Marschall KE. Stoelting&apos;s Anesthesia and Co-Existing Disease — endocrine disease / pheochromocytoma.</li>
          <li>Whelton PK, Carey RM, Aronow WS, et al. 2017 ACC/AHA/AAPA/ABC/ACPM/AGS/APhA/ASH/ASPC/NMA/PCNA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults. J Am Coll Cardiol 2018;71(19):e127-e248.</li>
          <li>Roizen MF. Preoperative preparation criteria for pheochromocytoma resection (Roizen criteria).</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco (SOLO en el footer) */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y metas de literatura aceptada (Endocrine Society 2014, ACC/AHA 2017, Miller, Stoelting)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// alfa antes que beta: el único orden en el que el paciente sale del quirófano por su propio pie"}
          <br />
          {"// si inviertes los bloqueos, la crisis la firmas tú, no el tumor"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
