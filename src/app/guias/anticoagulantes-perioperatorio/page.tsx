import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — ANTICOAGULANTES PERIOPERATORIOS y NEUROAXIAL
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: intervalos de suspensión/reinicio para bloqueo
// neuroaxial y retiro de catéter tomados de ASRA 4.ª ed. 2018.
// Cada intervalo/umbral lleva referencia (Vancouver breve). No inventar.
// Fuentes primarias:
//  - Horlocker TT, et al. Regional Anesthesia in the Patient Receiving
//    Antithrombotic or Thrombolytic Therapy. ASRA Evidence-Based
//    Guidelines (Fourth Edition). Reg Anesth Pain Med 2018;43(3):263-309.
//  - Douketis JD, et al. Perioperative Management of Antithrombotic
//    Therapy. CHEST Guideline. Chest 2022;162(5):e207-e243.
// ============================================================

export const metadata: Metadata = {
  title: "Anticoagulantes perioperatorios y neuroaxial (ASRA) — Guía clínica — DEC",
  description:
    "Referencia perioperatoria de anticoagulantes y antiagregantes: intervalos ASRA 2018 para bloqueo neuroaxial y retiro de catéter (HBPM, HNF, warfarina, rivaroxabán, apixabán, dabigatrán, fondaparinux, clopidogrel, ticagrelor, prasugrel, AAS), puente perioperatorio de warfarina por riesgo tromboembólico y reinicio postoperatorio. ASRA 4.ª ed. 2018.",
  openGraph: {
    title: "Anticoagulantes perioperatorios y neuroaxial (ASRA) — DEC",
    description:
      "Intervalos ASRA 2018 para neuroeje/retiro de catéter, bridging de warfarina y reinicio postoperatorio.",
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

// ------------------------------------------------------------
// Página (Server Component — referencia estática)
// ------------------------------------------------------------
export default function AnticoagulantesPerioperatorioPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./anticoagulantes-perioperatorio.sh
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Anticoagulantes perioperatorios y neuroaxial (ASRA)
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          intervalos de suspensión · bloqueo neuroaxial y retiro de catéter · puente (bridging) · reinicio postop
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// el hematoma epidural no avisa: se calcula el intervalo antes, no se lamenta después"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">REFERENCIA</span>
          <span className="tag tag-muted">ASRA 4.ª ed. 2018</span>
          <span className="tag tag-muted">CHEST 2022</span>
        </div>
      </header>

      <Callout variant="danger">
        El <b>hematoma neuroaxial</b> (epidural/espinal) es una complicación catastrófica y a menudo
        irreversible del bloqueo del neuroeje bajo antitrombóticos. Estos intervalos ASRA aplican por
        igual a la <b>punción/colocación</b> del bloqueo y al <b>retiro del catéter</b>: el catéter se
        retira en la misma ventana de anticoagulación mínima que se usa para puncionar, y la siguiente
        dosis se difiere tras retirarlo.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Marco general y principios ASRA">
        <P>
          Las guías ASRA 4.ª ed. (2018) definen, para cada fármaco antitrombótico, cuánto tiempo debe
          suspenderse <b>antes</b> de la técnica neuroaxial (o del retiro de catéter) y cuánto debe
          diferirse la <b>siguiente dosis</b> después. Los intervalos se basan en la vida media y en la
          farmacocinética del fármaco (dependiente de función renal en varios de ellos). El objetivo es
          realizar la maniobra con el efecto anticoagulante en su nadir.
        </P>
        <Table
          headers={["Principio", "Contenido"]}
          rows={[
            ["Antes de puncionar", "Suspender el fármaco el intervalo indicado; confirmar coagulación cuando aplique (INR, TP/TTPa, función renal)."],
            ["Retiro de catéter", "Se maneja como una segunda punción: retirar en ventana de mínimo efecto; documentar hora."],
            ["Después (reinicio)", "Diferir la siguiente dosis tras la punción o el retiro (ver columna 'después' de cada fármaco)."],
            ["Vigilancia neurológica", "Monitorizar déficit motor/sensitivo; ante sospecha de hematoma → RM urgente + descompresión < 8 h."],
          ]}
        />
        <Src>Horlocker TT, et al. Reg Anesth Pain Med 2018;43(3):263-309 (ASRA 4.ª ed.).</Src>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Intervalos ASRA — neuroaxial y retiro de catéter">
        <P>
          Tabla maestra de intervalos ASRA 2018. Salvo indicación contraria, el <b>intervalo &quot;antes&quot;</b>{" "}
          aplica tanto a la punción como al retiro del catéter, y el <b>&quot;después&quot;</b> es el tiempo mínimo
          para administrar la siguiente dosis tras la maniobra.
        </P>
        <Table
          headers={["Fármaco", "Suspender antes", "Reiniciar / siguiente dosis después"]}
          accentCol={1}
          rows={[
            [
              "HBPM profiláctica (enoxaparina dosis baja)",
              "12 h",
              "4 h tras la punción / retiro de catéter",
            ],
            [
              "HBPM terapéutica (dosis alta)",
              "24 h",
              "≥ 24 h para reinicio terapéutico (4 h solo aplica a dosis profiláctica); catéter contraindicado con HBPM terapéutica",
            ],
            [
              "HNF SC profiláctica (5000 U c/12 h)",
              "4–6 h (y TTPa/coagulación normal)",
              "1 h tras la punción",
            ],
            [
              "Warfarina (AVK)",
              "INR < 1.5",
              "Reanudar según procedimiento; retirar catéter con INR < 1.5",
            ],
            [
              "Rivaroxabán",
              "72 h (3 días)",
              "6 h tras la punción / retiro de catéter",
            ],
            [
              "Apixabán",
              "72 h (3 días)",
              "6 h tras la punción / retiro de catéter",
            ],
            [
              "Dabigatrán",
              "72–120 h según CrCl",
              "6 h tras la punción / retiro de catéter",
            ],
            [
              "Fondaparinux",
              "Evitar neuroaxial (usar técnica de aguja única, sin catéter)",
              "6–12 h si se usara; ASRA desaconseja con catéter",
            ],
            [
              "Clopidogrel",
              "5–7 días",
              "Reanudar tras la técnica si hemostasia adecuada",
            ],
            [
              "Ticagrelor",
              "5–7 días",
              "Reanudar tras la técnica si hemostasia adecuada",
            ],
            [
              "Prasugrel",
              "7–10 días",
              "Reanudar tras la técnica si hemostasia adecuada",
            ],
            [
              "AAS (aspirina) monoterapia",
              "No requiere suspensión para neuroaxial",
              "Sin restricción por AAS aislada",
            ],
          ]}
        />
        <Src>Horlocker TT, et al. Reg Anesth Pain Med 2018;43(3):263-309.</Src>
        <Callout variant="warn">
          Los intervalos de los inhibidores directos del factor Xa (rivaroxabán, apixabán) y del
          inhibidor directo de trombina (dabigatrán) asumen la ventana ASRA de{" "}
          <b>72 h (3 días)</b>; dabigatrán se prolonga a <b>72–120 h</b> según el aclaramiento de
          creatinina (eliminación ~80% renal). Con función renal reducida, extender el intervalo.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Heparinas (HBPM y HNF)">
        <P>
          Distinguir siempre dosis <b>profiláctica</b> de <b>terapéutica</b>: cambia el intervalo. La
          HBPM terapéutica y los catéteres neuroaxiales son una combinación de alto riesgo.
        </P>
        <Table
          headers={["Escenario", "Antes de punción/retiro", "Después"]}
          accentCol={1}
          rows={[
            ["HBPM profiláctica", "12 h", "4 h tras punción o retiro de catéter"],
            ["HBPM terapéutica", "24 h", "≥ 24 h para reinicio terapéutico (4 h solo aplica a dosis profiláctica); no dejar catéter con dosis terapéutica"],
            ["HNF SC profiláctica (dosis baja)", "4–6 h + coagulación normal", "1 h tras la punción"],
            ["HNF IV terapéutica", "4–6 h y TTPa normal", "1 h tras la punción; retirar catéter 4–6 h tras última dosis"],
          ]}
        />
        <Src>Horlocker TT, et al. Reg Anesth Pain Med 2018;43(3):263-309.</Src>
        <Callout variant="danger">
          No colocar ni retirar un catéter neuroaxial dentro de la <b>ventana pico</b> de la heparina.
          Con HBPM <b>terapéutica</b> (p. ej. enoxaparina 1 mg/kg c/12 h) el intervalo mínimo es{" "}
          <b>24 h</b>; con HBPM <b>profiláctica</b>, <b>12 h</b> antes y <b>4 h</b> después.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Anticoagulantes orales directos (ACOD)">
        <P>
          Para bloqueo neuroaxial, ASRA recomienda suspender rivaroxabán y apixabán <b>72 h (3 días)</b>{" "}
          antes, y dabigatrán <b>72–120 h</b> según CrCl. La siguiente dosis se difiere <b>6 h</b> tras la
          punción o el retiro del catéter.
        </P>
        <Table
          headers={["ACOD", "Diana", "Antes", "Después"]}
          accentCol={2}
          rows={[
            ["Rivaroxabán", "Xa directo", "72 h (3 días)", "6 h tras punción/retiro"],
            ["Apixabán", "Xa directo", "72 h (3 días)", "6 h tras punción/retiro"],
            ["Dabigatrán", "IIa (trombina) directo", "72–120 h según CrCl", "6 h tras punción/retiro"],
          ]}
        />
        <Src>Horlocker TT, et al. Reg Anesth Pain Med 2018;43(3):263-309.</Src>
        <Callout variant="warn">
          <b>Dabigatrán y función renal:</b> por su eliminación renal predominante, ASRA escala el
          intervalo de <b>72 h</b> (CrCl conservado) hasta <b>120 h</b> con aclaramiento reducido.
          Verificar CrCl antes de programar la técnica; en insuficiencia renal grave, extender.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Antiagregantes plaquetarios">
        <P>
          El AAS (aspirina) en monoterapia <b>no requiere suspensión</b> para el bloqueo neuroaxial. Los
          inhibidores de P2Y₁₂ sí requieren intervalos prolongados según su irreversibilidad y vida media
          del efecto plaquetario.
        </P>
        <Table
          headers={["Antiagregante", "Suspender antes", "Nota"]}
          accentCol={1}
          rows={[
            ["AAS (monoterapia)", "No suspender", "Sin restricción para neuroaxial (ASRA)"],
            ["Clopidogrel", "5–7 días", "Inhibidor P2Y₁₂ irreversible"],
            ["Ticagrelor", "5–7 días", "Inhibidor P2Y₁₂ reversible"],
            ["Prasugrel", "7–10 días", "Inhibidor P2Y₁₂ irreversible, efecto más potente/prolongado"],
          ]}
        />
        <Src>Horlocker TT, et al. Reg Anesth Pain Med 2018;43(3):263-309.</Src>
        <Callout variant="info">
          En <b>doble antiagregación (DAPT)</b> tras stent coronario, la decisión de suspender el P2Y₁₂
          para una técnica neuroaxial electiva debe balancearse contra el riesgo de trombosis del stent;
          coordinar con cardiología y, en general, mantener el AAS. Los tiempos anteriores son los de
          seguridad neuroaxial; no son un permiso para retirar el antiagregante sin evaluar el riesgo
          cardiovascular.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Warfarina: INR y neuroaxial">
        <P>
          La warfarina debe estar suficientemente revertida antes de la técnica neuroaxial y del retiro de
          catéter: el umbral ASRA es <b>INR &lt; 1.5</b>. Suele requerir suspender ~5 días antes (según INR
          basal), verificando el INR el día de la maniobra.
        </P>
        <Table
          headers={["Parámetro", "Umbral / conducta"]}
          rows={[
            ["INR para puncionar / retirar catéter", "< 1.5"],
            ["Suspensión típica previa", "≈ 5 días (individualizar según INR basal)"],
            ["Con catéter in situ y warfarina reiniciada", "Vigilar INR; retirar catéter con INR < 1.5"],
            ["Vigilancia post-retiro", "Evaluación neurológica seriada según protocolo"],
          ]}
        />
        <Src>Horlocker TT, et al. Reg Anesth Pain Med 2018;43(3):263-309.</Src>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Puente perioperatorio (bridging) de warfarina">
        <P>
          El <b>puente</b> con heparina (HBPM o HNF) durante la interrupción de la warfarina se decide por
          el <b>riesgo tromboembólico</b> del paciente, no por rutina. En riesgo bajo no se hace puente; en
          riesgo alto sí. El ensayo BRIDGE mostró que en fibrilación auricular de riesgo bajo–moderado,
          <b> no hacer puente</b> fue no inferior para tromboembolia y con menos sangrado.
        </P>
        <Table
          headers={["Riesgo tromboembólico", "Ejemplos", "Conducta de puente"]}
          accentCol={2}
          rows={[
            [
              "Alto",
              "Válvula mecánica mitral / aórtica antigua; FA con CHA₂DS₂-VASc alto o ACV reciente; TEV < 3 meses; trombofilia grave",
              "Puente recomendado (HBPM terapéutica o HNF)",
            ],
            [
              "Intermedio",
              "Válvula aórtica bileaflet con factores de riesgo; FA riesgo moderado; TEV 3–12 meses",
              "Individualizar según riesgo de sangrado del procedimiento",
            ],
            [
              "Bajo",
              "FA sin ACV previo y CHA₂DS₂-VASc bajo; TEV > 12 meses; válvula aórtica bileaflet sin FR",
              "No hacer puente (BRIDGE: no inferior, menos sangrado)",
            ],
          ]}
        />
        <Src>
          Douketis JD, et al. Perioperative Management of Antithrombotic Therapy. Chest 2022;162(5):e207-e243. ·
          Douketis JD, et al. (BRIDGE). N Engl J Med 2015;373:823-833.
        </Src>
        <Callout variant="info">
          Cuando se hace puente con <b>HBPM terapéutica</b>, administrar la última dosis <b>≈ 24 h</b> antes
          de la cirugía; con <b>HNF IV</b>, suspender <b>4–6 h</b> antes y confirmar TTPa normal. Estos son
          además los intervalos neuroaxiales de la HBPM/HNF terapéuticas (§03).
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Reinicio postoperatorio">
        <P>
          El reinicio del antitrombótico tras la cirugía balancea el riesgo de sangrado del sitio
          quirúrgico contra el riesgo trombótico. Con catéter neuroaxial in situ, respetar además el
          intervalo &quot;después&quot; de cada fármaco (§02) y coordinar la primera dosis con el retiro del
          catéter.
        </P>
        <Table
          headers={["Fármaco", "Reinicio orientativo postop", "Con catéter neuroaxial"]}
          rows={[
            ["HBPM profiláctica", "≈ 6–8 h si hemostasia adecuada", "≥ 4 h tras retiro de catéter"],
            ["HBPM terapéutica", "≈ 24 h (según riesgo de sangrado)", "No dejar catéter; reinicio terapéutico ≥ 24 h (4 h solo profiláctica)"],
            ["HNF profiláctica", "≈ 1 h tras técnica si hemostasia", "≥ 1 h tras punción/retiro"],
            ["Warfarina", "Misma noche / día 1 si hemostasia adecuada", "Retirar catéter con INR < 1.5"],
            ["ACOD (riva/apix/dabi)", "≈ 24–72 h según riesgo de sangrado y CrCl", "≥ 6 h tras retiro de catéter"],
            ["Clopidogrel / ticagrelor / prasugrel", "Tras hemostasia; considerar dosis de carga si urge", "Reanudar tras retiro con hemostasia adecuada"],
            ["AAS", "Reanudar temprano (o no interrumpir)", "Sin restricción por AAS aislada"],
          ]}
        />
        <Src>
          Horlocker TT, et al. Reg Anesth Pain Med 2018;43(3):263-309. ·
          Douketis JD, et al. Chest 2022;162(5):e207-e243.
        </Src>
        <Callout variant="warn">
          El reinicio de un anticoagulante de acción rápida (HBPM terapéutica, ACOD) es el momento de
          mayor riesgo si aún hay catéter: no administrar la primera dosis plena hasta haber retirado el
          catéter y respetado su intervalo &quot;después&quot;.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="09" title="Sospecha de hematoma neuroaxial">
        <P>
          Ante déficit motor/sensitivo nuevo o desproporcionado, dolor lumbar intenso o disfunción de
          esfínteres tras un bloqueo neuroaxial en un paciente anticoagulado, sospechar hematoma epidural
          hasta demostrar lo contrario. Es una emergencia neuroquirúrgica.
        </P>
        <Table
          headers={["Paso", "Acción"]}
          rows={[
            ["1", "Suspender cualquier infusión epidural y toda anticoagulación; evaluación neurológica inmediata."],
            ["2", "RM urgente de columna (TC si RM no disponible)."],
            ["3", "Interconsulta neuroquirúrgica emergente."],
            ["4", "Descompresión quirúrgica idealmente < 8 h del inicio del déficit para recuperación funcional."],
          ]}
        />
        <Src>Horlocker TT, et al. Reg Anesth Pain Med 2018;43(3):263-309.</Src>
        <Callout variant="danger">
          El pronóstico depende del <b>tiempo hasta la descompresión</b>: cada hora cuenta. No esperar a
          que el déficit &quot;defina&quot; — imagen y neurocirugía en paralelo.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="10" title="Resumen de intervalos clave (ASRA 2018)">
        <Table
          headers={["Fármaco", "Suspender antes", "Después"]}
          accentCol={1}
          rows={[
            ["HBPM profiláctica", "12 h", "4 h"],
            ["HBPM terapéutica", "24 h", "≥ 24 h reinicio (sin catéter)"],
            ["HNF SC profiláctica", "4–6 h", "1 h"],
            ["Warfarina", "INR < 1.5", "según procedimiento"],
            ["Rivaroxabán", "72 h (3 días)", "6 h"],
            ["Apixabán", "72 h (3 días)", "6 h"],
            ["Dabigatrán", "72–120 h (CrCl)", "6 h"],
            ["Fondaparinux", "Evitar (no catéter)", "—"],
            ["Clopidogrel", "5–7 días", "tras hemostasia"],
            ["Ticagrelor", "5–7 días", "tras hemostasia"],
            ["Prasugrel", "7–10 días", "tras hemostasia"],
            ["AAS", "No suspender", "sin restricción"],
          ]}
        />
        <Src>Horlocker TT, et al. Reg Anesth Pain Med 2018;43(3):263-309 (ASRA 4.ª ed.).</Src>
      </Section>

      {/* ========================================================= */}
      <Section n="11" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Horlocker TT, Vandermeuelen E, Kopp SL, et al. Regional Anesthesia in the Patient Receiving Antithrombotic or Thrombolytic Therapy: American Society of Regional Anesthesia and Pain Medicine Evidence-Based Guidelines (Fourth Edition). Reg Anesth Pain Med 2018;43(3):263-309.</li>
          <li>Douketis JD, Spyropoulos AC, Murad MH, et al. Perioperative Management of Antithrombotic Therapy: An American College of Chest Physicians Clinical Practice Guideline. Chest 2022;162(5):e207-e243.</li>
          <li>Douketis JD, Spyropoulos AC, Kaatz S, et al. Perioperative Bridging Anticoagulation in Patients with Atrial Fibrillation (BRIDGE). N Engl J Med 2015;373(9):823-833.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// intervalos y umbrales de guía de sociedad (ASRA 4.ª ed. 2018 · CHEST 2022)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, función renal actual ni protocolo institucional"}
          <br />
          {"// dosis terapéutica ≠ profiláctica: leer dos veces el intervalo antes de puncionar"}
          <br />
          {"// el catéter se retira con el mismo respeto con que se colocó — el hematoma no distingue"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
