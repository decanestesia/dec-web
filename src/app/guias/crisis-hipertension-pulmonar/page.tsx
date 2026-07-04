import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — CRISIS DE HIPERTENSIÓN PULMONAR
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: dosis, umbrales y objetivos tomados de
// literatura aceptada. Cada tabla/callout cita su fuente
// (Vancouver breve). NO inventar dosis.
// Fuentes primarias:
//  - Humbert M, Kovacs G, Hoeper MM, et al. 2022 ESC/ERS
//    Guidelines for the diagnosis and treatment of pulmonary
//    hypertension. Eur Heart J 2022;43(38):3618-3731.
//  - Galiè N, et al. 2015 ESC/ERS Guidelines. Eur Heart J
//    2016;37(1):67-119.
//  - Price LC, Wort SJ, Finney SJ, et al. Pulmonary vascular
//    and right ventricular dysfunction in adult critical care.
//    Crit Care 2010;14(5):R169.
//  - Miller's Anesthesia, 9.ª ed. — Anesthesia for Patients
//    with Pulmonary Hypertension / Right Ventricular Failure.
//  - Pritts CD, Pearl RG. Anesthesia for patients with
//    pulmonary hypertension. Curr Opin Anaesthesiol
//    2010;23(3):411-416.
// ============================================================

export const metadata: Metadata = {
  title: "Crisis de hipertensión pulmonar — manejo perioperatorio · DEC",
  description:
    "Referencia perioperatoria de la crisis de hipertensión pulmonar: aumento agudo de la RVP con fallo del ventrículo derecho. Corregir desencadenantes (hipoxia, hipercapnia, acidosis, dolor, hipotermia, N2O), vasodilatadores pulmonares (óxido nítrico inhalado 20-40 ppm, prostaciclina inhalada epoprostenol/iloprost, milrinona), soporte del VD con inotrópicos (dobutamina, milrinona, adrenalina) y vasopresor sistémico que preserve la relación TA sistémica/pulmonar (noradrenalina, vasopresina). ECMO de rescate.",
  openGraph: {
    title: "Crisis de hipertensión pulmonar — manejo perioperatorio · DEC",
    description:
      "Corregir desencadenantes, vasodilatadores pulmonares (NO inhalado 20-40 ppm, prostaciclina, milrinona), soporte del VD y vasopresor sistémico (noradrenalina, vasopresina). ECMO de rescate.",
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
export default function CrisisHipertensionPulmonarPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat crisis-hipertension-pulmonar.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Crisis de hipertensión pulmonar
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          ↑ RVP aguda · fallo del VD · desencadenantes · vasodilatadores pulmonares · soporte del VD · vasopresor sistémico
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// el VD no perdona: cuando se dilata y falla, la espiral de la muerte ya arrancó"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">EMERGENCIA</span>
          <span className="tag tag-muted">ESC/ERS 2022</span>
          <span className="tag tag-muted">Miller</span>
          <span className="tag tag-muted">Price 2010</span>
        </div>
      </header>

      <Callout variant="danger">
        <b>La crisis de HTP es una espiral autoamplificada.</b> Un aumento agudo de la{" "}
        <b>resistencia vascular pulmonar (RVP)</b> sobrecarga el ventrículo derecho (VD), que se dilata
        y falla; el septo interventricular se desplaza a la izquierda, el llenado del VI cae, cae el
        gasto cardíaco y la <b>tensión arterial sistémica</b>, se compromete la <b>perfusión coronaria
        del VD</b> (que en la HTP depende de la TA sistólica sistémica) y la isquemia del VD empeora aún
        más su fallo. Objetivo terapéutico: <b>bajar la RVP</b> y, en paralelo, <b>sostener la TA
        sistémica</b> por encima de la pulmonar para preservar la perfusión coronaria del VD.
      </Callout>
      <Src>
        Price LC, et al. Crit Care 2010;14(5):R169. · Humbert M, et al. (ESC/ERS 2022). Eur Heart J
        2022;43(38):3618-3731.
      </Src>

      {/* ========================================================= */}
      <Section n="01" title="Fisiopatología — la espiral de la muerte del VD">
        <P>
          El VD es una cámara de pared fina adaptada a un lecho de baja resistencia; tolera mal el
          aumento agudo de poscarga. Cuando la RVP sube de golpe, el VD se distiende, aumenta su tensión
          parietal y su consumo de O₂, mientras que la caída del gasto y de la TA sistémica reducen su
          aporte coronario. La <b>interdependencia ventricular</b> (desplazamiento septal) compromete el
          llenado del VI. Sin interrumpir el círculo, el desenlace es el colapso.
        </P>
        <Table
          headers={["Eslabón", "Mecanismo", "Consecuencia"]}
          rows={[
            [
              "↑ RVP aguda",
              "Vasoconstricción pulmonar (hipoxia/acidosis), sobrecarga, embolia, N₂O.",
              "Aumento brusco de la poscarga del VD.",
            ],
            [
              "Sobrecarga del VD",
              "Dilatación, ↑ tensión parietal, ↑ demanda de O₂ miocárdica.",
              "Disfunción sistólica del VD, regurgitación tricuspídea.",
            ],
            [
              "Interdependencia",
              "Desplazamiento del septo hacia el VI (VD dilatado).",
              "↓ llenado y gasto del VI → ↓ TA sistémica.",
            ],
            [
              "Isquemia del VD",
              "↓ TA sistémica + ↑ presión de VD → ↓ gradiente de perfusión coronaria del VD.",
              "Empeora el fallo del VD → cierra la espiral.",
            ],
          ]}
        />
        <Src>
          Price LC, et al. Crit Care 2010;14(5):R169. · Pritts CD, Pearl RG. Curr Opin Anaesthesiol
          2010;23(3):411-416. · Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed.
        </Src>
        <Callout variant="info">
          A diferencia del VI, la perfusión coronaria del VD normalmente ocurre en <b>sístole y
          diástole</b>. En la HTP grave, con la presión del VD elevada, el flujo coronario del VD pasa a
          <b> depender de la TA sistólica sistémica</b>: por eso sostener la presión sistémica <i>es</i>{" "}
          proteger el miocardio del VD.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Desencadenantes — evitar y corregir">
        <P>
          La mayoría de las crisis intraoperatorias son <b>prevenibles</b>: nacen de factores que elevan
          la RVP y que el anestesiólogo controla. La primera línea de tratamiento —y de profilaxis— es
          eliminar el desencadenante. Todos ellos son vasoconstrictores pulmonares.
        </P>
        <Table
          headers={["Desencadenante", "Corrección", "Meta"]}
          accentCol={1}
          rows={[
            ["Hipoxia", "FiO₂ alta / 100%; reclutar; tratar la causa.", "SpO₂ / PaO₂ adecuadas (O₂ es vasodilatador pulmonar)."],
            ["Hipercapnia", "Aumentar ventilación minuto.", "Normocapnia o hipocapnia leve; evitar PaCO₂ alta."],
            ["Acidosis", "Ventilar; corregir causa metabólica; considerar bicarbonato.", "pH ≥ 7.35–7.40 (la acidosis eleva la RVP)."],
            ["Dolor / estímulo simpático", "Analgesia y profundidad anestésica adecuadas.", "Evitar picos simpáticos que suben la RVP."],
            ["Hipotermia", "Calentamiento activo; mantener normotermia.", "Normotermia (el frío eleva la RVP)."],
            ["N₂O (óxido nitroso)", "Evitarlo en HTP.", "Suprimir del plan anestésico (aumenta la RVP)."],
            ["Sobrecarga / hipovolemia", "Optimizar precarga: ni sobrecarga ni depleción.", "Euvolemia (ver §5)."],
            ["Taquicardia / arritmia", "Evitar y tratar; mantener ritmo sinusal.", "El VD depende de la contracción auricular y de tiempo de llenado."],
          ]}
        />
        <Src>
          Pritts CD, Pearl RG. Curr Opin Anaesthesiol 2010;23(3):411-416. · Price LC, et al. Crit Care
          2010;14(5):R169. · Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed.
        </Src>
        <Callout variant="warn">
          <b>Hipoxia, hipercapnia y acidosis</b> forman el triángulo clásico de vasoconstricción
          pulmonar: los tres se corrigen con <b>oxigenación y ventilación</b>. Ventilar para{" "}
          <b>normo/hipocapnia</b> y corregir la acidosis suele bajar la RVP más rápido que cualquier
          fármaco. Evitar tanto la atelectasia como la sobredistensión alveolar (PEEP alta), que también
          elevan la RVP.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Vasodilatadores pulmonares">
        <P>
          Reducir la RVP sin desplomar la TA sistémica exige <b>selectividad pulmonar</b>: los agentes
          inhalados (óxido nítrico, prostaciclina) dilatan el lecho pulmonar ventilado con mínimo efecto
          sistémico y mejoran además la relación ventilación/perfusión. Los IV (milrinona) reducen la
          RVP pero pueden bajar la TA sistémica.
        </P>
        <Table
          headers={["Agente", "Dosis", "Nota"]}
          accentCol={1}
          rows={[
            [
              "Óxido nítrico inhalado (iNO)",
              "20–40 ppm inhalado, titular",
              "1.ª línea inhalada: vasodilatador pulmonar selectivo; mejora V/Q. No suspender bruscamente (rebote).",
            ],
            [
              "Prostaciclina inhalada — epoprostenol",
              "Nebulización continua (típ. ~10–50 ng/kg/min)",
              "Selectiva pulmonar inhalada; alternativa/adjunto al iNO. Vida media muy corta.",
            ],
            [
              "Prostaciclina inhalada — iloprost",
              "2.5–5 µg inhalados por dosis, intermitente",
              "Análogo de prostaciclina; efecto más prolongado que el epoprostenol.",
            ],
            [
              "Milrinona",
              "Carga 50 µg/kg IV (opcional, con cautela) + infusión 0.25–0.75 µg/kg/min",
              "Inodilatador (inhibidor PDE-3): baja RVP y da inotropismo al VD; vigilar hipotensión sistémica.",
            ],
          ]}
        />
        <Src>
          Humbert M, et al. (ESC/ERS 2022). Eur Heart J 2022;43(38):3618-3731. · Price LC, et al. Crit
          Care 2010;14(5):R169. · Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed.
        </Src>
        <Callout variant="danger">
          <b>No suspender bruscamente el óxido nítrico inhalado.</b> La retirada abrupta produce{" "}
          <b>hipertensión pulmonar de rebote</b> potencialmente fatal. Retirar de forma gradual y
          titulada, típicamente con puente a un vasodilatador de acción más prolongada (prostaciclina
          inhalada, PDE-5, etc.) antes de retirarlo del todo.
        </Callout>
        <Callout variant="warn">
          Los vasodilatadores <b>sistémicos IV no selectivos</b> (nitroprusiato, nitroglicerina,
          bloqueantes de canales de calcio en dosis de crisis) bajan la TA sistémica más que la
          pulmonar y pueden <b>empeorar</b> la perfusión coronaria del VD y el V/Q: preferir la vía{" "}
          <b>inhalada</b> en la crisis aguda.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Soporte del ventrículo derecho">
        <P>
          El VD que falla necesita <b>inotropismo</b> y, sobre todo, que se le proteja la{" "}
          <b>perfusión coronaria</b> manteniendo la TA sistémica por encima de la pulmonar. La estrategia
          combina un <b>inotrópico</b> (que además baje o no suba la RVP) con un{" "}
          <b>vasopresor sistémico</b> que preserve la relación TA sistémica/pulmonar.
        </P>
        <Table
          headers={["Fármaco", "Dosis", "Rol"]}
          accentCol={1}
          rows={[
            [
              "Dobutamina",
              "2–10 µg/kg/min IV",
              "Inotrópico del VD que tiende a bajar la RVP; dosis altas (> 10) dan taquicardia/vasodilatación sistémica.",
            ],
            [
              "Milrinona",
              "0.25–0.75 µg/kg/min IV (± carga 50 µg/kg)",
              "Inodilatador: inotropismo del VD + ↓ RVP; añadir vasopresor si baja la TA sistémica.",
            ],
            [
              "Adrenalina",
              "0.01–0.1 µg/kg/min IV, titular",
              "Inotrópico potente para el VD en fallo grave / hipotensión; útil cuando se necesita inotropismo + soporte de TA.",
            ],
            [
              "Noradrenalina",
              "0.05–0.5 µg/kg/min IV, titular",
              "Vasopresor sistémico de elección: sube la TA sistémica (perfusión coronaria del VD) más que la pulmonar.",
            ],
            [
              "Vasopresina",
              "0.01–0.04 U/min IV (dosis baja)",
              "Vasopresor sistémico que a dosis baja sube la TA sistémica con vasoconstricción pulmonar mínima; ahorra catecolamina.",
            ],
          ]}
        />
        <Src>
          Price LC, et al. Crit Care 2010;14(5):R169. · Pritts CD, Pearl RG. Curr Opin Anaesthesiol
          2010;23(3):411-416. · Humbert M, et al. (ESC/ERS 2022). Eur Heart J 2022. · Gropper MA, et al.
          Miller&apos;s Anesthesia, 9.ª ed.
        </Src>
        <Callout variant="danger">
          <b>Preservar la relación TA sistémica / TA pulmonar.</b> El pilar del rescate del VD es
          mantener la <b>presión de perfusión coronaria</b>: elegir vasopresores que suban la TA
          sistémica <b>sin</b> subir en igual medida la RVP —<b>noradrenalina</b> y{" "}
          <b>vasopresina a dosis baja</b>—. Evitar la fenilefrina en dosis altas (α puro que puede
          elevar también la RVP) como estrategia principal.
        </Callout>
        <Callout variant="warn">
          <b>Evitar la taquicardia.</b> El VD isquémico y dilatado tolera mal las frecuencias altas:
          acortan el llenado y elevan la demanda de O₂. Mantener <b>ritmo sinusal</b> (la contracción
          auricular contribuye de forma crítica al llenado del VD) y tratar precozmente las arritmias.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Precarga y volemia del VD">
        <P>
          La precarga del VD es un equilibrio estrecho: <b>ni sobrecarga ni hipovolemia</b>. El VD
          hipovolémico no genera gasto; pero el VD ya dilatado y sobrecargado empeora con cada bolo,
          porque la distensión aumenta la tensión parietal, desplaza el septo y comprime el VI. Los
          bolos de fluido deben ser <b>pequeños y guiados por respuesta</b>.
        </P>
        <Table
          headers={["Situación", "Conducta"]}
          rows={[
            ["VD hipovolémico / precarga baja", "Bolos pequeños y titulados de cristaloide; reevaluar respuesta hemodinámica."],
            ["VD dilatado / sobrecargado", "Restringir fluidos; considerar diuresis/depleción cuidadosa; no dar más volumen a ciegas."],
            ["Guía", "Ecocardiografía / medidas dinámicas para decidir cada bolo; el objetivo es euvolemia funcional del VD."],
          ]}
        />
        <Src>
          Price LC, et al. Crit Care 2010;14(5):R169. · Humbert M, et al. (ESC/ERS 2022). Eur Heart J
          2022;43(38):3618-3731.
        </Src>
        <Callout variant="danger">
          <b>La sobrecarga de volumen puede matar al VD en fallo.</b> Ante hipotensión en la crisis de
          HTP, el reflejo de «dar líquidos» suele ser un error: el VD dilatado responde a más precarga
          con <b>más dilatación</b> y peor gasto. Guiar el volumen con ecocardiografía y priorizar
          inotrópico + vasopresor sobre fluidos indiscriminados.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Secuencia de manejo de la crisis">
        <P>
          Actuar en paralelo. El orden conceptual es: <b>corregir desencadenantes</b> →{" "}
          <b>bajar la RVP</b> (vasodilatador pulmonar) → <b>sostener el VD</b> (inotrópico + vasopresor
          sistémico) → <b>rescate</b> si refractario.
        </P>
        <Table
          headers={["Paso", "Acción"]}
          rows={[
            ["1 · Pedir ayuda", "Declarar la crisis; movilizar recursos, ecocardiografía y, si procede, equipo de ECMO."],
            ["2 · Oxigenar y ventilar", "FiO₂ 100%; ventilar a normo/hipocapnia; corregir acidosis; evitar PEEP excesiva y atelectasia."],
            ["3 · Retirar desencadenantes", "Suspender N₂O; profundizar analgesia/anestesia; corregir hipotermia; revisar precarga."],
            ["4 · Vasodilatador pulmonar", "Óxido nítrico inhalado 20–40 ppm y/o prostaciclina inhalada (epoprostenol/iloprost); milrinona IV."],
            ["5 · Soporte del VD", "Inotrópico (dobutamina, milrinona, adrenalina) + vasopresor sistémico (noradrenalina, vasopresina)."],
            ["6 · Optimizar precarga y ritmo", "Volemia titulada por ecocardiografía; mantener ritmo sinusal; evitar/tratar taquicardia."],
            ["7 · Rescate", "Si refractario: ECMO (habitualmente veno-arterial) como puente."],
          ]}
        />
        <Src>
          Price LC, et al. Crit Care 2010;14(5):R169. · Pritts CD, Pearl RG. Curr Opin Anaesthesiol
          2010;23(3):411-416. · Humbert M, et al. (ESC/ERS 2022). Eur Heart J 2022.
        </Src>
        <Callout variant="ok">
          <b>ECMO de rescate.</b> En la crisis refractaria a manejo médico máximo, el soporte con{" "}
          <b>ECMO (veno-arterial)</b> descarga el VD y sostiene la perfusión sistémica como{" "}
          <b>puente</b> a la recuperación, a terapia dirigida o a trasplante. Activar al equipo{" "}
          <b>antes</b> del colapso, no después.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Resumen de dosis clave">
        <Table
          headers={["Parámetro", "Dosis", "Fuente"]}
          accentCol={1}
          rows={[
            ["Óxido nítrico inhalado", "20–40 ppm, titular (retirar gradual)", "ESC/ERS · Miller"],
            ["Epoprostenol inhalado", "Nebulización continua (~10–50 ng/kg/min)", "ESC/ERS · Price"],
            ["Iloprost inhalado", "2.5–5 µg por dosis, intermitente", "ESC/ERS"],
            ["Milrinona", "0.25–0.75 µg/kg/min (± carga 50 µg/kg)", "Price · Miller"],
            ["Dobutamina", "2–10 µg/kg/min", "Price · Miller"],
            ["Adrenalina", "0.01–0.1 µg/kg/min", "Price · Miller"],
            ["Noradrenalina", "0.05–0.5 µg/kg/min (vasopresor de elección)", "Price · Miller"],
            ["Vasopresina", "0.01–0.04 U/min (dosis baja)", "Price · Miller"],
            ["Ventilación", "Normo/hipocapnia; FiO₂ alta; pH ≥ 7.35–7.40", "ESC/ERS · Miller"],
            ["Rescate", "ECMO veno-arterial", "ESC/ERS 2022"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Humbert M, Kovacs G, Hoeper MM, et al. 2022 ESC/ERS Guidelines for the diagnosis and treatment of pulmonary hypertension. Eur Heart J 2022;43(38):3618-3731.</li>
          <li>Galiè N, Humbert M, Vachiery JL, et al. 2015 ESC/ERS Guidelines for the diagnosis and treatment of pulmonary hypertension. Eur Heart J 2016;37(1):67-119.</li>
          <li>Price LC, Wort SJ, Finney SJ, et al. Pulmonary vascular and right ventricular dysfunction in adult critical care: current and emerging options for management. Crit Care 2010;14(5):R169.</li>
          <li>Pritts CD, Pearl RG. Anesthesia for patients with pulmonary hypertension. Curr Opin Anaesthesiol 2010;23(3):411-416.</li>
          <li>Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — Anesthesia for the Patient with Pulmonary Hypertension / Right Ventricular Failure.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y objetivos de literatura aceptada (ESC/ERS 2022 · Price 2010 · Pritts & Pearl · Miller)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// primero corrige el desencadenante: hipoxia/hipercapnia/acidosis se tratan con el ventilador"}
          <br />
          {"// ante hipotensión en HTP, dar líquidos a ciegas suele empeorar el VD: sostén la TA sistémica"}
          <br />
          {"// nunca cortes de golpe el óxido nítrico inhalado: el rebote también es una crisis"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
