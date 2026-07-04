import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — SÍNDROME DE REPERFUSIÓN POR DESCLAMPAJE AÓRTICO
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: fisiopatología, umbrales y dosis tomados de
// literatura aceptada (Stoelting, Miller, Kaplan, UpToDate). Cada
// tabla/callout cita su fuente (Vancouver breve). NO inventar cifras.
// Fuentes primarias:
//  - Gropper MA, et al. Miller's Anesthesia, 9.ª ed. — Anesthesia for
//    Vascular Surgery / Aortic reconstruction; unclamping shock.
//  - Hines RL, Marschall KE. Stoelting's Anesthesia and Co-Existing
//    Disease, 8.ª ed. — Vascular disease / aortic cross-clamping.
//  - Kaplan JA, et al. Kaplan's Cardiac Anesthesia — thoracoabdominal
//    aortic surgery, cross-clamp/unclamp physiology, spinal protection.
//  - Gelman S. The pathophysiology of aortic cross-clamping and
//    unclamping. Anesthesiology 1995;82(4):1026-1060.
// ============================================================

export const metadata: Metadata = {
  title: "Síndrome de reperfusión por desclampaje aórtico — Guía clínica · DEC",
  description:
    "Referencia perioperatoria del síndrome de reperfusión (declamping shock) tras desclampaje aórtico: fisiopatología (vasodilatación por hipoxia/acidosis distal, lavado de K+/lactato/mediadores, hipovolemia relativa), manejo con desclampaje gradual coordinado con el cirujano, optimización de precarga previa, reducción de anestésicos/vasodilatadores, vasopresores listos (fenilefrina, noradrenalina), corrección de acidosis e hiperpotasemia (bicarbonato, calcio, insulina-glucosa), normotermia y vigilancia de isquemia miocárdica, renal y medular. Stoelting, Miller, Kaplan.",
  openGraph: {
    title: "Síndrome de reperfusión por desclampaje aórtico — Guía clínica · DEC",
    description:
      "Declamping shock: desclampaje gradual, precarga optimizada, vasopresores listos, corrección de acidosis/hiperK y vigilancia de isquemia miocárdica, renal y medular.",
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
export default function SindromeReperfusionAorticoPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat sindrome-reperfusion-aortico.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Síndrome de reperfusión por desclampaje aórtico
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          declamping shock · desclampaje gradual · precarga · vasopresores · acidosis/hiperK · isquemia medular
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// soltar la pinza es fácil; el que la suelta sin avisar y sin volumen es el que reanima después"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">EMERGENCIA</span>
          <span className="tag tag-muted">Stoelting</span>
          <span className="tag tag-muted">Miller</span>
          <span className="tag tag-muted">Kaplan</span>
        </div>
      </header>

      <Callout variant="danger">
        <b>El momento crítico es la liberación del clampaje.</b> Al retirar la pinza aórtica el
        territorio isquémico distal se reperfunde de golpe: <b>hipotensión brusca</b> por caída de la
        resistencia vascular sistémica, retorno de sangre fría, ácida e hiperpotasémica a la
        circulación central, y depresión miocárdica. Prevención &gt; rescate: <b>avisar al cirujano
        para un desclampaje GRADUAL</b>, optimizar la precarga <b>antes</b> y tener el vasopresor listo.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Fisiopatología del declamping shock">
        <P>
          La hipotensión de reperfusión es <b>multifactorial</b>. Durante el clampaje, los tejidos
          distales quedan isquémicos y acumulan metabolitos vasoactivos y ácidos; el lecho vascular
          distal se dilata al máximo. Al desclampar, la caída súbita de la resistencia vascular
          sistémica, el <b>secuestro venoso</b> en ese lecho dilatado y el <b>lavado</b> de
          metabolitos hacia la circulación central producen hipotensión, depresión miocárdica y
          arritmias.
        </P>
        <Table
          headers={["Mecanismo", "Causa", "Efecto hemodinámico"]}
          rows={[
            [
              "Vasodilatación distal",
              "Hipoxia/acidosis tisular durante el clampaje + acumulación de metabolitos vasodilatadores (adenosina, óxido nítrico, lactato).",
              "Caída brusca de la RVS al reperfundir.",
            ],
            [
              "Hipovolemia relativa / secuestro venoso",
              "Redistribución de volumen al lecho distal dilatado y de capacitancia aumentada.",
              "Descenso del retorno venoso y de la precarga central.",
            ],
            [
              "Lavado de metabolitos",
              "Retorno de sangre ácida, hiperpotasémica y fría, con mediadores (lactato, citocinas, radicales libres).",
              "Depresión miocárdica, acidosis central, hiperK, arritmias.",
            ],
            [
              "Depresión miocárdica",
              "Acidemia, hiperpotasemia y factores depresores del miocardio liberados desde el territorio reperfundido.",
              "Caída del gasto cardíaco y de la contractilidad.",
            ],
          ]}
        />
        <Src>
          Gelman S. The pathophysiology of aortic cross-clamping and unclamping. Anesthesiology
          1995;82(4):1026-1060. · Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed.
        </Src>
        <Callout variant="info">
          La magnitud del síndrome depende del <b>nivel del clampaje</b> (suprarrenal/supracelíaco &gt;
          infrarrenal), la <b>duración</b> de la isquemia y de la volemia en el momento de soltar. A
          mayor nivel y mayor tiempo de clampaje, mayor deuda metabólica reperfundida y peor la
          hipotensión.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Preparación ANTES de soltar la pinza">
        <P>
          El síndrome se <b>previene</b>, no solo se trata. La ventana de actuación empieza minutos
          antes del desclampaje: la clave es llegar al momento con el paciente <b>lleno</b>, con el
          plano anestésico <b>aligerado</b> y el vasopresor <b>preparado</b>.
        </P>
        <Table
          headers={["Paso", "Acción"]}
          rows={[
            ["1 · Comunicación con el cirujano", "Acordar desclampaje GRADUAL/parcial y avisar cada liberación. Es el punto de control número uno."],
            ["2 · Optimizar precarga ANTES", "Reponer volumen guiado (VPP/VVS, respuesta a bolo, PVC en contexto) para llegar euvolémico o ligeramente hipervolémico."],
            ["3 · Aligerar la anestesia", "Reducir el halogenado/propofol y suspender vasodilatadores (nitroglicerina, nitroprusiato) antes de soltar."],
            ["4 · Vasopresor listo", "Fenilefrina en bolos y/o noradrenalina en bomba preparados; no buscar la jeringa cuando ya cayó la TA."],
            ["5 · Corregir la basal metabólica", "Tratar acidosis e hiperpotasemia previas; tener bicarbonato y calcio a mano."],
            ["6 · Normotermia", "Calentar activamente: la hipotermia agrava la depresión miocárdica, la coagulopatía y la vasoplejía."],
            ["7 · Monitorización lista", "Línea arterial, capnografía, ECG (ST) y, según nivel, monitorización de perfusión medular/renal."],
          ]}
        />
        <Src>
          Hines RL, Marschall KE. Stoelting&apos;s Anesthesia and Co-Existing Disease, 8.ª ed. · Gropper
          MA, et al. Miller&apos;s Anesthesia, 9.ª ed. · Kaplan JA, et al. Kaplan&apos;s Cardiac Anesthesia.
        </Src>
        <Callout variant="ok">
          <b>Desclampaje gradual.</b> Que el cirujano libere la pinza de forma <b>lenta y por pasos</b>
          (o parcial, reclampando si la TA cae) da tiempo a que el retorno venoso y los vasopresores
          compensen. Un desclampaje comunicado y escalonado es la intervención que más previene el
          colapso.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Manejo agudo de la hipotensión de reperfusión">
        <P>
          Si al soltar la pinza cae la TA, la respuesta es en <b>paralelo</b>: pedir reclampaje si es
          grave, dar volumen, subir el vasopresor y corregir la acidosis/hiperK. Comunicar en voz alta
          la caída al cirujano.
        </P>
        <Table
          headers={["Paso", "Acción"]}
          rows={[
            ["1 · Avisar y reclampar si es grave", "Pedir al cirujano que reclampe (parcial o total) para recuperar TA y reperfundir por pasos."],
            ["2 · Volumen", "Bolo de cristaloide/coloide/hemoderivado para restaurar precarga; guiar por respuesta dinámica."],
            ["3 · Vasopresor", "Fenilefrina 50–200 mcg IV en bolo y/o noradrenalina en infusión para sostener la RVS y la PAM."],
            ["4 · Aligerar anestesia", "Reducir el agente y retirar cualquier vasodilatador aún en curso."],
            ["5 · Corregir acidosis/hiperK", "Bicarbonato según pH/déficit de base; calcio; insulina-glucosa si hiperpotasemia (ver §4)."],
            ["6 · Vigilar isquemia", "ECG (ST), gasto, lactato; anticipar isquemia miocárdica, renal y medular (ver §5)."],
          ]}
        />
        <Src>
          Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. · Gelman S. Anesthesiology
          1995;82(4):1026-1060. · Kaplan JA, et al. Kaplan&apos;s Cardiac Anesthesia.
        </Src>
        <Callout variant="warn">
          El <b>reclampaje transitorio</b> es una herramienta, no un fracaso: recupera la presión de
          perfusión coronaria y permite volver a soltar de forma escalonada mientras se repone volumen
          y sube el vasopresor. Coordinar siempre con el cirujano.
        </Callout>
        <Callout variant="info">
          <b>Vasopresor de rescate.</b> La <b>fenilefrina</b> (agonista α puro) sube rápido la RVS en
          bolos titulados; la <b>noradrenalina</b> en infusión sostiene la presión con soporte inótropo
          α/β. Son puente hasta que el volumen y la corrección metabólica estabilicen: no sustituyen a
          la reposición de precarga.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Corrección de acidosis e hiperpotasemia">
        <P>
          La sangre reperfundida es ácida e hiperpotasémica. La <b>hiperpotasemia</b> súbita puede
          precipitar arritmias y paro; tener listos <b>calcio</b> (estabiliza la membrana), medidas de
          <b> desplazamiento intracelular</b> (insulina-glucosa, bicarbonato) y, en la acidosis
          metabólica marcada, <b>bicarbonato</b> guiado por gasometría.
        </P>
        <Table
          headers={["Alteración", "Medida", "Dosis / uso"]}
          accentCol={2}
          rows={[
            [
              "Hiperpotasemia — estabilizar membrana",
              "Gluconato de calcio 10% (o cloruro de calcio)",
              "Gluconato Ca 10% 10–20 mL IV lento (o cloruro cálcico 10% 5–10 mL por vía central); repetir según ECG/K⁺.",
            ],
            [
              "Hiperpotasemia — desplazar K⁺ al interior",
              "Insulina regular + glucosa",
              "10 U de insulina regular IV con 25 g de glucosa (p. ej. 50 mL de dextrosa 50%); vigilar glucemia.",
            ],
            [
              "Hiperpotasemia / acidosis — desplazar y tamponar",
              "Bicarbonato de sodio",
              "Según déficit de base/pH; útil como coadyuvante en hiperK con acidosis. Guiar por gasometría, no a ciegas.",
            ],
            [
              "Acidosis metabólica marcada",
              "Bicarbonato de sodio + optimizar perfusión/ventilación",
              "Corregir la causa (perfusión, gasto, ventilación); bicarbonato titulado por pH/EB en acidemia grave.",
            ],
          ]}
        />
        <Src>
          Hines RL, Marschall KE. Stoelting&apos;s Anesthesia and Co-Existing Disease, 8.ª ed. · Gropper
          MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — electrolyte and acid-base management.
        </Src>
        <Callout variant="danger">
          El <b>calcio</b> no baja el potasio: solo <b>protege el miocardio</b> de la hiperK mientras
          actúan las medidas que desplazan/eliminan K⁺ (insulina-glucosa, bicarbonato, diuresis). Ante
          cambios en el ECG por hiperpotasemia, el calcio es la <b>primera</b> intervención.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Vigilancia de daño orgánico postdesclampaje">
        <P>
          La reperfusión pone a prueba tres territorios: el <b>corazón</b> (isquemia por hipotensión y
          demanda), el <b>riñón</b> (necrosis tubular por isquemia/reperfusión, sobre todo en clampaje
          suprarrenal) y la <b>médula espinal</b> (isquemia medular en cirugía toracoabdominal, según
          nivel). Vigilancia dirigida desde el mismo desclampaje.
        </P>
        <Table
          headers={["Órgano", "Riesgo", "Vigilancia / medida"]}
          rows={[
            [
              "Miocardio",
              "Isquemia por hipotensión, taquicardia, acidosis e hiperK; desequilibrio aporte/demanda.",
              "ECG con análisis del ST, ETE si disponible; mantener PAM y coronaria; tratar arritmias.",
            ],
            [
              "Riñón",
              "Lesión renal aguda por isquemia-reperfusión, mayor con clampaje supra-renal y clampaje prolongado.",
              "Diuresis, mantener volemia y PAM; evitar hipotensión sostenida; considerar protección renal según protocolo.",
            ],
            [
              "Médula espinal",
              "Isquemia medular / paraplejía en cirugía toracoabdominal, según nivel y colaterales (arteria de Adamkiewicz).",
              "Drenaje de LCR y presión de perfusión medular, PAM elevada objetivo, monitorización de potenciales evocados según protocolo.",
            ],
          ]}
        />
        <Src>
          Kaplan JA, et al. Kaplan&apos;s Cardiac Anesthesia — thoracoabdominal aortic surgery / spinal
          cord protection. · Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. · Gelman S.
          Anesthesiology 1995;82(4):1026-1060.
        </Src>
        <Callout variant="warn">
          En cirugía <b>toracoabdominal</b>, la <b>presión de perfusión medular</b> = PAM − presión del
          LCR: mantener PAM alta y drenar LCR aumenta la perfusión. La hipotensión de reperfusión no
          controlada es un factor de riesgo directo de <b>paraplejía</b>. El nivel del clampaje define
          qué órganos están en riesgo.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Resumen de conducta y dosis clave">
        <Table
          headers={["Parámetro", "Conducta / dosis", "Fuente"]}
          accentCol={1}
          rows={[
            ["Desclampaje", "GRADUAL/parcial, comunicado; reclampar si cae la TA", "Miller / Kaplan"],
            ["Precarga previa", "Optimizar volumen ANTES de soltar (guiado por respuesta)", "Stoelting / Miller"],
            ["Anestésicos/vasodilatadores", "Reducir agente y suspender NTG/nitroprusiato antes", "Stoelting"],
            ["Fenilefrina", "50–200 mcg IV en bolo, titular a TA", "Miller"],
            ["Noradrenalina", "Infusión titulada a PAM/perfusión", "Miller / Kaplan"],
            ["Calcio (hiperK)", "Gluconato Ca 10% 10–20 mL IV lento", "Stoelting / Miller"],
            ["Insulina-glucosa (hiperK)", "10 U insulina regular + 25 g glucosa IV", "Stoelting / Miller"],
            ["Bicarbonato", "Titulado por pH/déficit de base (no a ciegas)", "Miller"],
            ["Normotermia", "Calentamiento activo, evitar hipotermia", "Stoelting / Miller"],
            ["Perfusión medular (TAAA)", "PAM alta + drenaje de LCR (PAM − PLCR)", "Kaplan"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Gelman S. The pathophysiology of aortic cross-clamping and unclamping. Anesthesiology 1995;82(4):1026-1060.</li>
          <li>Gropper MA, Cohen NH, Eriksson LI, et al. Miller&apos;s Anesthesia, 9.ª ed. Filadelfia: Elsevier; 2020 — Anesthesia for Vascular Surgery; aortic cross-clamp/unclamp physiology.</li>
          <li>Hines RL, Marschall KE. Stoelting&apos;s Anesthesia and Co-Existing Disease, 8.ª ed. Filadelfia: Elsevier; 2022 — Vascular Disease / aortic surgery.</li>
          <li>Kaplan JA, Augoustides JGT, Manecke GR, et al. Kaplan&apos;s Cardiac Anesthesia, 7.ª ed. — Thoracoabdominal aortic surgery and spinal cord protection.</li>
          <li>UpToDate. Anesthesia for open abdominal aortic surgery / management of aortic cross-clamping and unclamping. Wolters Kluwer (acceso institucional).</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// fisiopatología y dosis de literatura aceptada (Stoelting · Miller · Kaplan · Gelman · UpToDate)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// el desclampaje se negocia con el cirujano ANTES, no se descubre cuando la TA ya está en el suelo"}
          <br />
          {"// llena el tanque, aligera el plano y ten el vasopresor en la mano antes de soltar la pinza"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
