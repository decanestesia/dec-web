import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — PACIENTE RENAL / EN DIÁLISIS PERIOPERATORIO
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: umbrales, dosis y ajustes por ClCr tomados de
// literatura aceptada y fichas técnicas. Cada tabla/callout cita su
// fuente (Vancouver breve). NO inventar cifras.
// Fuentes primarias:
//  - KDIGO 2012/2024 CKD Evaluation and Management guidelines.
//  - Stoelting's Anesthesia and Co-Existing Disease, 8.ª ed. —
//    Renal disease; drug dosing in renal failure.
//  - Miller's Anesthesia, 9.ª ed. — Anesthesia for patients with
//    renal disease.
//  - UpToDate — Perioperative management of patients with ESKD /
//    Treatment and prevention of hyperkalemia in adults.
//  - Sugammadex (Bridion) FDA/EMA label — no recomendado si
//    ClCr < 30 mL/min.
//  - Enoxaparina FDA label — ajuste con ClCr < 30 mL/min.
// ============================================================

export const metadata: Metadata = {
  title: "Paciente renal / en diálisis perioperatorio — Guía clínica · DEC",
  description:
    "Referencia perioperatoria del paciente con ERC y en diálisis: timing de diálisis (día previo, evitar heparina intradiálisis inmediata, vigilar hipovolemia/hipoK post-diálisis), manejo de hiperkalemia (calcio, insulina+glucosa, bicarbonato, beta-agonista, diálisis), ajuste de fármacos por ClCr (HBPM, gabapentinoides, morfina/metabolitos, sugammadex si ClCr<30), protección de la fístula, anemia, acidosis y sobrecarga. KDIGO, Stoelting, Miller, UpToDate.",
  openGraph: {
    title: "Paciente renal / en diálisis perioperatorio — Guía clínica · DEC",
    description:
      "Timing de diálisis, hiperkalemia, ajuste de fármacos por ClCr, protección de la fístula, anemia, acidosis y sobrecarga. KDIGO, Stoelting, Miller.",
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
export default function PacienteRenalDialisisPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat paciente-renal-dialisis.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Paciente renal / en diálisis perioperatorio
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          timing de diálisis · hiperkalemia · ajuste por ClCr · protección de la fístula · anemia · acidosis · sobrecarga
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// el riñón no filtra tus fármacos; ese trabajo ahora es tuyo (o de la máquina)"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">REFERENCIA</span>
          <span className="tag tag-muted">KDIGO</span>
          <span className="tag tag-muted">Stoelting</span>
          <span className="tag tag-muted">Miller</span>
          <span className="tag tag-muted">UpToDate</span>
        </div>
      </header>

      <Callout variant="info">
        <b>El problema es multisistémico.</b> El paciente con enfermedad renal crónica (ERC) avanzada o
        en diálisis llega con <b>alteraciones electrolíticas y ácido-base</b> (hiperkalemia, acidosis
        metabólica), <b>sobrecarga o depleción de volumen</b> según su relación con la última sesión,{" "}
        <b>anemia y disfunción plaquetaria</b> urémica, y <b>farmacocinética alterada</b> (fármacos y
        metabolitos activos que ya no se eliminan). El manejo gira en torno a cuatro ejes:{" "}
        <b>optimizar el timing de la diálisis</b>, <b>controlar el potasio</b>, <b>ajustar cada
        fármaco por función renal</b> y <b>proteger el acceso vascular</b>.
      </Callout>
      <Src>
        Stoelting&apos;s Anesthesia and Co-Existing Disease, 8.ª ed. (Renal disease). · Miller&apos;s
        Anesthesia, 9.ª ed. · KDIGO 2024 CKD Guideline.
      </Src>

      {/* ========================================================= */}
      <Section n="01" title="Timing de la diálisis perioperatoria">
        <P>
          En el paciente en hemodiálisis crónica, programar la última sesión <b>idealmente el día
          previo</b> a la cirugía electiva: se busca corregir la hiperkalemia y la sobrecarga sin
          operar sobre un paciente recién dializado —hipovolémico, hipokalémico y aún anticoagulado por
          la heparina del circuito—. Dializar <b>inmediatamente antes</b> del quirófano añade
          inestabilidad hemodinámica y riesgo hemorrágico evitables.
        </P>
        <Table
          headers={["Momento", "Recomendación", "Riesgo a vigilar"]}
          accentCol={1}
          rows={[
            [
              "Día previo",
              "Sesión de diálisis ideal para cirugía electiva",
              "Permite corregir K⁺ y volumen y que la heparina del circuito se aclare antes de operar.",
            ],
            [
              "Inmediatamente pre-op (mismo día)",
              "Evitar salvo indicación urgente (K⁺ crítico, sobrecarga sintomática)",
              "Hipovolemia post-diálisis, hipotensión a la inducción, hipoK⁺, anticoagulación residual.",
            ],
            [
              "Heparina intradiálisis pre-op",
              "Evitar la heparinización sistémica en la sesión inmediata previa; usar diálisis sin heparina / lavados salinos",
              "Sangrado intraoperatorio por heparina residual.",
            ],
            [
              "Post-diálisis inmediato",
              "Vigilar peso seco, K⁺, hipovolemia relativa",
              "Hipotensión, hipoK⁺ (arritmias), hipomagnesemia; recheck de electrolitos antes de inducir.",
            ],
          ]}
        />
        <Src>
          Stoelting&apos;s Co-Existing Disease, 8.ª ed. (Renal). · Miller&apos;s Anesthesia, 9.ª ed. ·
          UpToDate — Perioperative management of patients with ESKD.
        </Src>
        <Callout variant="warn">
          <b>Post-diálisis inmediato = paciente frágil.</b> Tras una sesión reciente el paciente puede
          estar <b>hipovolémico</b> (por ultrafiltración agresiva hacia el peso seco), <b>hipokalémico</b>{" "}
          y con <b>desequilibrios electrolíticos</b> transitorios. Reevaluar K⁺, volemia y estado
          ácido-base antes de la inducción; no asumir «recién dializado = óptimo».
        </Callout>
        <Callout variant="danger">
          <b>Heparina intradiálisis inmediata pre-cirugía.</b> La heparina no fraccionada usada en el
          circuito de HD tiene vida media corta pero puede dejar anticoagulación residual. Ante cirugía
          inminente, <b>coordinar diálisis sin heparina</b> (o con lavados salinos / anticoagulación
          regional con citrato) para no llegar a quirófano anticoagulado.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Hiperkalemia — cuándo tratar y cómo">
        <P>
          La hiperkalemia es la amenaza vital más inmediata: puede causar arritmia y paro. <b>Tratar de
          urgencia</b> si el K⁺ es <b>&gt; 6.0–6.5 mmol/L</b> o ante <b>cualquier cambio ECG</b>
          {" "}atribuible (T picudas, ensanchamiento del QRS, aplanamiento/pérdida de P, patrón sinusoidal).
          La secuencia clásica: <b>estabilizar la membrana</b> (calcio) → <b>desplazar el K⁺ al
          intracelular</b> (insulina+glucosa, beta-agonista, ± bicarbonato) → <b>eliminarlo</b>{" "}
          (diálisis; resinas/diuréticos son más lentos).
        </P>
        <Table
          headers={["Intervención", "Dosis", "Mecanismo / inicio"]}
          accentCol={1}
          rows={[
            [
              "Gluconato de calcio 10%",
              "10 mL IV (1 g) en 2–3 min; repetir a los 5 min si persisten cambios ECG · o cloruro cálcico 10% 5–10 mL por vía central",
              "Estabiliza la membrana miocárdica (NO baja el K⁺). Inicio 1–3 min; dura ~30–60 min.",
            ],
            [
              "Insulina regular + glucosa",
              "10 U IV de insulina regular + 25 g de glucosa (50 mL de dextrosa al 50%); vigilar glucemia",
              "Desplaza K⁺ al intracelular. Inicio ~15 min; dura 4–6 h. Riesgo de hipoglucemia diferida.",
            ],
            [
              "Beta-agonista (salbutamol)",
              "Salbutamol nebulizado 10–20 mg (dosis alta, ≈ 4–8× la broncodilatadora)",
              "Desplaza K⁺ al intracelular; aditivo a la insulina. Inicio ~30 min. Taquicardia.",
            ],
            [
              "Bicarbonato sódico",
              "Considerar solo si acidosis metabólica; NO de primera línea como monoterapia",
              "Desplazamiento modesto de K⁺; útil en acidémico. Efecto limitado en el urémico.",
            ],
            [
              "Diálisis (HD)",
              "Tratamiento definitivo en ERC/diálisis",
              "Único que elimina K⁺ del cuerpo de forma fiable y rápida en el dializado.",
            ],
            [
              "Resinas / diuréticos",
              "Patiromer / zirconio-ciclosilicato (o poliestireno); diuréticos si diuresis residual",
              "Eliminación lenta; NO para la urgencia aguda. Rol en manejo subagudo.",
            ],
          ]}
        />
        <Src>
          UpToDate — Treatment and prevention of hyperkalemia in adults. · KDIGO. · Stoelting&apos;s
          Co-Existing Disease, 8.ª ed.
        </Src>
        <Callout variant="danger">
          <b>El calcio no baja el potasio.</b> Solo protege el corazón mientras las otras medidas actúan:
          <b> siempre acompañarlo</b> de insulina+glucosa (± beta-agonista) y, en el dializado, planear
          la <b>diálisis como tratamiento definitivo</b>. En hiperkalemia con cambios ECG, el calcio va{" "}
          <b>primero y sin esperar confirmación de laboratorio</b>.
        </Callout>
        <Callout variant="warn">
          <b>Succinilcolina: contraindicada relativa.</b> Eleva el K⁺ ~0.5 mmol/L en el paciente normal
          y puede precipitar hiperkalemia peligrosa en el urémico ya hiperkalémico. Evitarla si el K⁺
          está elevado; preferir un no-despolarizante (p. ej. rocuronio) para la inducción de secuencia
          rápida.
        </Callout>
        <Callout variant="info">
          Vigilar la <b>hipoglucemia diferida</b> tras insulina+glucosa (puede aparecer a las 1–3 h);
          controlar glucemias seriadas. En el paciente <b>hiperglucémico</b> puede administrarse la
          insulina sin la carga completa de glucosa, ajustando según glucemia.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Ajuste de fármacos por aclaramiento (ClCr)">
        <P>
          En ERC avanzada y diálisis, fármacos y <b>metabolitos activos</b> se acumulan al no
          eliminarse por vía renal. La regla: <b>evitar los de eliminación renal con margen estrecho</b>,
          <b> ajustar dosis/intervalo</b> según ClCr, y preferir agentes con metabolismo
          órgano-independiente. Los umbrales prácticos se anclan en <b>ClCr &lt; 30 mL/min</b> (y aún
          más en diálisis).
        </P>
        <Table
          headers={["Fármaco / clase", "Problema en ERC", "Conducta"]}
          rows={[
            [
              "HBPM (enoxaparina)",
              "Eliminación renal → acumulación y riesgo hemorrágico si ClCr < 30",
              "Ajustar dosis si ClCr < 30 mL/min (enoxaparina profiláctica 30 mg SC/24 h; terapéutica 1 mg/kg/24 h) o preferir HNF (monitorizable, no renal). Considerar anti-Xa.",
            ],
            [
              "Gabapentinoides (gabapentina / pregabalina)",
              "Eliminación 100% renal → sedación, mioclonías, depresión respiratoria acumulativa",
              "Reducir marcadamente la dosis según ClCr; en diálisis dosis muy bajas y post-HD. Evitar en el naïve perioperatorio.",
            ],
            [
              "Morfina",
              "Metabolito activo morfina-6-glucurónido se acumula → sedación y depresión respiratoria prolongada",
              "Evitar / minimizar. Preferir opioides sin metabolito renal activo (fentanilo, hidromorfona con cautela). Titular.",
            ],
            [
              "Meperidina (petidina)",
              "Normeperidina (metabolito) se acumula → convulsiones",
              "Evitar por completo en ERC.",
            ],
            [
              "Sugammadex",
              "Complejo sugammadex-rocuronio de eliminación renal; NO recomendado si ClCr < 30 mL/min",
              "No recomendado si ClCr < 30 mL/min (ficha técnica); no está establecido su uso en diálisis. Usar con cautela / alternativa de reversión.",
            ],
            [
              "AINE",
              "Nefrotóxicos; empeoran función renal residual, retención de Na⁺/K⁺",
              "Evitar, sobre todo si hay diuresis/función renal residual que preservar.",
            ],
            [
              "Metformina",
              "Riesgo de acidosis láctica",
              "Suspender periperatoriamente en ERC avanzada.",
            ],
          ]}
        />
        <Src>
          Enoxaparina (FDA label) — ajuste con ClCr &lt; 30 mL/min. · Sugammadex (Bridion) FDA/EMA label
          — no recomendado si ClCr &lt; 30 mL/min. · Stoelting&apos;s Co-Existing Disease, 8.ª ed. ·
          UpToDate.
        </Src>
        <Callout variant="danger">
          <b>Sugammadex si ClCr &lt; 30 mL/min: no recomendado.</b> El complejo sugammadex-rocuronio se
          elimina por vía renal; en insuficiencia renal grave no está establecida su seguridad y la
          ficha técnica <b>no lo recomienda</b>. En estos pacientes, valorar reversión alternativa
          (neostigmina + antimuscarínico) o dosificar el BNM para permitir recuperación espontánea con
          monitorización neuromuscular objetiva (TOF).
        </Callout>
        <Callout variant="warn">
          <b>Morfina y sus metabolitos.</b> La morfina-6-glucurónido, activa y de eliminación renal, se
          acumula y produce <b>depresión respiratoria diferida</b>. Evitar morfina y meperidina; el
          <b> cisatracurio</b> (eliminación de Hofmann, órgano-independiente) es un excelente relajante
          en ERC, y el <b>remifentanilo</b> (esterasas plasmáticas) un opioide de cinética predecible.
        </Callout>
        <Callout variant="info">
          Muchos fármacos <b>se dializan</b> (dosis suplementaria post-HD) y otros no; consultar cada
          agente. Regla general en diálisis: dosificar <b>después</b> de la sesión cuando el fármaco es
          dializable, para no perder la dosis en el circuito.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Protección del acceso vascular (fístula / injerto)">
        <P>
          La fístula o injerto arteriovenoso es la <b>línea de vida</b> del paciente en hemodiálisis:
          una trombosis por compresión o punción arruina meses de maduración y su acceso a la diálisis.
          El brazo del acceso es <b>zona vedada</b> para todo lo que comprima, puncione o mida presión.
        </P>
        <Table
          headers={["Regla", "Detalle"]}
          rows={[
            [
              "No vías en ese brazo",
              "No canalizar accesos venosos ni arteriales en el brazo de la fístula/injerto.",
            ],
            [
              "No manguito de TA",
              "No colocar el manguito de presión arterial ni torniquetes en ese brazo (la compresión repetida trombosa el acceso).",
            ],
            [
              "Acolchar y posicionar",
              "Proteger y acolchar el brazo; evitar compresión prolongada por posición o campos quirúrgicos.",
            ],
            [
              "Verificar el thrill",
              "Palpar/auscultar el frémito (thrill) antes y después de la cirugía; documentar la permeabilidad.",
            ],
            [
              "Señalizar",
              "Marcar el brazo y comunicar a todo el equipo: «brazo de fístula — no tocar».",
            ],
          ]}
        />
        <Src>Miller&apos;s Anesthesia, 9.ª ed. · Stoelting&apos;s Co-Existing Disease, 8.ª ed.</Src>
        <Callout variant="danger">
          <b>El brazo de la fístula es intocable.</b> Nada de vías, manguito de TA, torniquete ni
          punciones en ese lado. Una trombosis intraoperatoria por compresión condena al paciente a un
          acceso nuevo (catéter temporal, cirugía). Elegir el <b>brazo contralateral</b> y protegerlo
          activamente.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Anemia, acidosis y sobrecarga de volumen">
        <P>
          Tres comorbilidades casi universales en ERC avanzada condicionan el manejo intraoperatorio:
          la <b>anemia</b> (por déficit de eritropoyetina), la <b>acidosis metabólica</b> crónica y la
          tendencia a la <b>sobrecarga de volumen</b> entre sesiones. Cada una modifica objetivos y
          decisiones.
        </P>
        <Table
          headers={["Problema", "Implicación perioperatoria", "Conducta"]}
          rows={[
            [
              "Anemia (déficit de EPO)",
              "Menor reserva de transporte de O₂; disfunción plaquetaria urémica añade riesgo hemorrágico",
              "Conocer Hb basal; transfundir por umbral clínico/institucional, no de rutina. Desmopresina (DDAVP 0.3 µg/kg IV) mejora la hemostasia urémica si sangrado.",
            ],
            [
              "Acidosis metabólica",
              "Empeora hiperkalemia; altera unión proteica y efecto de fármacos",
              "Corregir en diálisis; ventilación adecuada; bicarbonato solo con criterio en acidosis grave.",
            ],
            [
              "Sobrecarga de volumen",
              "Edema pulmonar, HTA, insuficiencia cardíaca; peor si se dializa mal antes de operar",
              "Optimizar volemia con diálisis previa; fluidoterapia intraoperatoria conservadora y guiada; vigilar sobrecarga.",
            ],
            [
              "Disfunción plaquetaria urémica",
              "Sangrado pese a plaquetas normales en número",
              "Diálisis mejora la uremia; DDAVP y/o crioprecipitado si sangrado; considerar estrógenos en crónico.",
            ],
          ]}
        />
        <Src>
          Stoelting&apos;s Co-Existing Disease, 8.ª ed. · Miller&apos;s Anesthesia, 9.ª ed. · KDIGO
          anemia guideline. · UpToDate — Uremic platelet dysfunction.
        </Src>
        <Callout variant="warn">
          <b>Fluidos: ni de más ni de menos.</b> El paciente anúrico no elimina el exceso: sobre-cargar
          precipita edema pulmonar. Pero un paciente recién dializado puede estar hipovolémico y tolerar
          mal la inducción. Individualizar con la relación temporal a la última sesión y guiar por metas
          dinámicas.
        </Callout>
        <Callout variant="info">
          En el paciente <b>oligoanúrico</b>, la elección de fluido importa: preferir cristaloides
          balanceados, evitar cargas de potasio (Ringer contiene K⁺; en hiperkalémico grave puede
          preferirse otro cristaloide) y evitar grandes volúmenes de salino 0.9% por la acidosis
          hiperclorémica que suma a la acidosis basal.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Resumen de umbrales y dosis clave">
        <Table
          headers={["Parámetro", "Valor", "Fuente"]}
          accentCol={1}
          rows={[
            ["Diálisis electiva ideal", "El día previo a la cirugía", "Stoelting / Miller"],
            ["Tratar hiperkalemia si", "K⁺ > 6.0–6.5 o cambios ECG", "UpToDate / KDIGO"],
            ["Gluconato de calcio 10%", "10 mL IV (1 g) en 2–3 min, repetir a 5 min", "UpToDate"],
            ["Insulina + glucosa", "10 U insulina regular IV + 25 g glucosa", "UpToDate"],
            ["Salbutamol nebulizado", "10–20 mg (dosis alta)", "UpToDate"],
            ["Bicarbonato", "Solo si acidosis; no monoterapia", "UpToDate"],
            ["Enoxaparina si ClCr < 30", "Profiláctica 30 mg SC/24 h · terapéutica 1 mg/kg/24 h", "FDA label"],
            ["Sugammadex si ClCr < 30", "No recomendado", "FDA/EMA label"],
            ["Morfina / meperidina en ERC", "Evitar (metabolitos activos)", "Stoelting / UpToDate"],
            ["Relajante de elección en ERC", "Cisatracurio (Hofmann)", "Stoelting / Miller"],
            ["DDAVP (hemostasia urémica)", "0.3 µg/kg IV", "UpToDate"],
            ["Fístula / injerto", "Sin vía, TA ni torniquete en ese brazo", "Miller / Stoelting"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Kidney Disease: Improving Global Outcomes (KDIGO) CKD Work Group. KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease. Kidney Int 2024;105(4S):S117-S314.</li>
          <li>Hines RL, Jones SB, eds. Stoelting&apos;s Anesthesia and Co-Existing Disease. 8.ª ed. Elsevier; 2022 — Renal disease; drug dosing in renal failure.</li>
          <li>Gropper MA, et al. Miller&apos;s Anesthesia. 9.ª ed. Elsevier; 2020 — Anesthesia for patients with renal disease.</li>
          <li>UpToDate. Treatment and prevention of hyperkalemia in adults. Wolters Kluwer (actualizado 2024).</li>
          <li>UpToDate. Perioperative management of the patient with end-stage kidney disease. Wolters Kluwer (actualizado 2024).</li>
          <li>Enoxaparina (Lovenox), prescribing information. U.S. FDA — dosing adjustment in renal impairment (CrCl &lt; 30 mL/min).</li>
          <li>Sugammadex (Bridion), prescribing information. U.S. FDA / EMA SmPC — not recommended in severe renal impairment (CrCl &lt; 30 mL/min) or dialysis.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// umbrales y dosis de literatura aceptada (KDIGO · Stoelting · Miller · UpToDate · fichas FDA/EMA)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, protocolo institucional ni monitorización"}
          <br />
          {"// el calcio protege el corazón pero NO baja el potasio: acompáñalo siempre"}
          <br />
          {"// el brazo de la fístula no es para tu vía ni tu manguito: busca el otro lado"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
