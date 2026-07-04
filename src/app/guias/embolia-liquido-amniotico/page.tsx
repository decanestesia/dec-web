import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — EMBOLIA DE LÍQUIDO AMNIÓTICO (AFE)
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: dosis, umbrales y pasos de literatura aceptada.
// Cada tabla/callout cita su fuente (Vancouver breve). No inventar cifras.
// Fuentes primarias:
//  - Society for Maternal-Fetal Medicine (SMFM); Pacheco LD, et al.
//    Amniotic fluid embolism: diagnosis and management. SMFM Clinical
//    Guideline No. 9. Am J Obstet Gynecol 2016;215(2):B16-B24.
//  - AFE Registry / AFE Foundation criteria (Clark SL, et al. Proposal of
//    diagnostic criteria for research studies. Am J Obstet Gynecol
//    2016;215(4):408-412).
//  - Copel/A-OK protocol — Rezai S, et al. atropine-ondansetron-ketorolac
//    ("A-OK"). Case Rep Obstet Gynecol 2017;2017:8458375.
//  - AHA. Cardiac Arrest in Pregnancy: Scientific Statement (Jeejeebhoy FM,
//    et al. Circulation 2015;132:1747-1773).
//  - Miller's Anesthesia, Chestnut's Obstetric Anesthesia (AFE chapter).
// ============================================================

export const metadata: Metadata = {
  title: "Embolia de líquido amniótico — diagnóstico y manejo · DEC",
  description:
    "Referencia perioperatoria de embolia de líquido amniótico (AFE): colapso cardiovascular, hipoxia y CID periparto. Diagnóstico clínico de exclusión, RCP con desplazamiento uterino izquierdo, cesárea perimortem < 5 min, soporte hemodinámico del fallo de VD, manejo de CID (transfusión masiva, fibrinógeno, TXA) y protocolo A-OK. SMFM, registro AFE, AHA.",
  openGraph: {
    title: "Embolia de líquido amniótico — diagnóstico y manejo · DEC",
    description:
      "Colapso CV + hipoxia + CID periparto: diagnóstico de exclusión y manejo de soporte. RCP, cesárea perimortem, fallo de VD, CID y protocolo A-OK. SMFM / AHA.",
    type: "article",
  },
};

// ------------------------------------------------------------
// Helpers de presentación (mismo lenguaje visual que las demás guías)
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
export default function EmboliaLiquidoAmnioticoPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat embolia-liquido-amniotico.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Embolia de líquido amniótico
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          colapso CV · hipoxia · CID periparto · diagnóstico de exclusión · RCP · cesárea perimortem · A-OK
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// no da tiempo a confirmar el diagnóstico; da tiempo a reanimar y sacar al bebé"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">EMERGENCIA</span>
          <span className="tag tag-muted">SMFM 2016</span>
          <span className="tag tag-muted">Registro AFE</span>
          <span className="tag tag-muted">AHA 2015</span>
        </div>
      </header>

      <Callout variant="danger">
        <b>Emergencia obstétrica catastrófica.</b> La AFE es un{" "}
        <b>diagnóstico clínico de exclusión</b>: no espere confirmación de laboratorio ni de imagen.
        La tríada es <b>colapso cardiovascular + hipoxia + coagulopatía (CID)</b> de aparición
        súbita durante el parto, la cesárea o el posparto inmediato (hasta ~30 min tras la
        expulsión de placenta). El manejo es de <b>soporte</b> y debe iniciarse en segundos.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Definición y presentación">
        <P>
          Síndrome raro (~1–2 por cada 40 000–80 000 partos) pero de altísima letalidad, causado
          por la entrada de líquido amniótico y elementos fetales a la circulación materna, que
          desencadena una respuesta <b>anafilactoide</b> con fallo de ventrículo derecho (VD),
          vasoespasmo pulmonar, colapso hemodinámico y una coagulopatía de consumo desproporcionada.
          El curso clásico es <b>bifásico</b>: colapso cardiorrespiratorio inicial → seguido (en quien
          sobrevive) de CID y hemorragia masiva.
        </P>
        <Table
          headers={["Fase", "Fisiopatología", "Clínica dominante"]}
          rows={[
            [
              "1 · Fallo VD / hipoxia",
              "Vasoconstricción pulmonar aguda → hipertensión pulmonar y sobrecarga/fallo del VD; hipoxemia grave.",
              "Disnea súbita, cianosis, hipotensión, paro; pérdida súbita de EtCO₂ y SpO₂.",
            ],
            [
              "2 · Fallo VI / shock",
              "Disfunción del VI (isquemia por hipoxia + desplazamiento septal), gasto bajo.",
              "Shock cardiogénico, edema pulmonar; en supervivientes de la fase 1.",
            ],
            [
              "3 · CID / hemorragia",
              "Coagulopatía de consumo fulminante (activación del factor tisular / hiperfibrinólisis).",
              "Sangrado en sitio quirúrgico, atonía, hemorragia difusa; puede dominar el cuadro.",
            ],
          ]}
        />
        <Src>
          Pacheco LD, et al. SMFM Clinical Guideline No. 9. Am J Obstet Gynecol 2016;215(2):B16-B24. ·
          Chestnut&apos;s Obstetric Anesthesia — Amniotic Fluid Embolism.
        </Src>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Criterios diagnósticos (registro AFE / exclusión)">
        <P>
          No existe prueba confirmatoria. Se han propuesto <b>criterios uniformes para investigación</b>
          {" "}(registro/fundación AFE, avalados por SMFM) que también orientan la sospecha clínica.
          Deben cumplirse <b>los cuatro</b>:
        </P>
        <Table
          headers={["#", "Criterio (registro AFE)"]}
          rows={[
            ["1", "Paro cardiorrespiratorio súbito, O hipotensión (PAS < 90 mmHg) + compromiso respiratorio (disnea, cianosis o SpO₂ < 90%)."],
            ["2", "Coagulopatía manifiesta (CID por criterios ISTH obstétricos) o hemorragia grave, en ausencia de otra causa."],
            ["3", "Inicio durante el trabajo de parto o dentro de los 30 min tras la expulsión de la placenta."],
            ["4", "Ausencia de fiebre (≥ 38 °C) durante el trabajo de parto (para excluir sepsis)."],
          ]}
        />
        <Src>
          Clark SL, et al. Proposed diagnostic criteria for research studies (AFE Registry). Am J
          Obstet Gynecol 2016;215(4):408-412. · SMFM 2016.
        </Src>
        <Callout variant="warn">
          Estos criterios son para <b>investigación/registro</b>. En la cama <b>no retrase</b> la
          reanimación por cumplirlos: son un diagnóstico de exclusión y el tratamiento es idéntico
          (soporte) mientras se descartan las causas alternativas.
        </Callout>
        <Callout variant="info">
          <b>Diferencial de colapso periparto:</b> tromboembolia pulmonar, embolia aérea, IAM /
          disección, anafilaxia (a fármacos), toxicidad por anestésico local (LAST), bloqueo espinal
          total, eclampsia, sepsis, hemorragia oculta, aspiración. La coexistencia de{" "}
          <b>CID temprana y desproporcionada</b> orienta a AFE.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Manejo inmediato — RCP de alta calidad">
        <P>
          El paro por AFE es un <b>paro en la embarazada</b>: se aplican las modificaciones AHA. La
          prioridad es RCP de alta calidad, oxigenación y, si no hay retorno de la circulación,{" "}
          <b>vaciar el útero</b> para permitir la reanimación materna.
        </P>
        <Table
          headers={["Paso", "Acción", "Detalle / dosis"]}
          accentCol={2}
          rows={[
            [
              "Activar",
              "Código de paro obstétrico; equipo multidisciplinar",
              "Obstetricia + anestesia + neonatología + banco de sangre; activar PTM temprano.",
            ],
            [
              "Compresiones",
              "RCP inmediata, manos altas en el esternón",
              "100–120/min, profundidad ≥ 5 cm; relación 30:2 o continua si vía aérea avanzada.",
            ],
            [
              "Desplazamiento uterino",
              "Desplazamiento uterino manual a la IZQUIERDA (DUI)",
              "Manual y continuo si útero ≥ ombligo (~≥ 20 sem); descomprime cava/aorta. Preferible a la inclinación lateral.",
            ],
            [
              "Vía aérea / O₂",
              "Intubación precoz, FiO₂ 1.0",
              "Vía aérea difícil en embarazada; capnografía. Ventilar sin hiperventilar.",
            ],
            [
              "Fármacos ACLS",
              "Adrenalina 1 mg IV cada 3–5 min; antiarrítmicos según ritmo",
              "Desfibrilar ritmos desfibrilables con energía estándar; no modificar dosis por el embarazo.",
            ],
            [
              "Cesárea perimortem",
              "Si no hay RCE en ~4 min → histerotomía de reanimación",
              "Objetivo: extracción fetal en < 5 min del paro (útero ≥ ~20 sem). Mejora hemodinámica materna.",
            ],
          ]}
        />
        <Src>
          Jeejeebhoy FM, et al. Cardiac Arrest in Pregnancy: AHA Scientific Statement. Circulation
          2015;132(18):1747-1773. · SMFM 2016.
        </Src>
        <Callout variant="danger">
          <b>Cesárea perimortem (histerotomía de reanimación):</b> decidir a los <b>~4 minutos</b> de
          paro sin RCE, con la meta de <b>extracción fetal antes de los 5 minutos</b>. Se realiza{" "}
          <b>in situ</b>, sin trasladar y sin esperar quirófano. Descomprime la aorto-cava, mejora el
          retorno venoso y el gasto materno — es una maniobra de reanimación <b>materna</b>, no solo
          fetal.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Soporte hemodinámico — proteger el ventrículo derecho">
        <P>
          Tras (o sin) el paro, el problema central de la fase temprana es el <b>fallo agudo del VD</b>
          {" "}por hipertensión pulmonar. La estrategia difiere del shock hemorrágico puro:{" "}
          <b>evitar la sobrecarga de fluidos</b>, que distiende el VD ya fallido y empeora el gasto.
          Guiar con ecocardiografía cuando esté disponible.
        </P>
        <Table
          headers={["Objetivo", "Agente", "Dosis / notas"]}
          accentCol={2}
          rows={[
            [
              "Presión de perfusión (vasopresor 1.ª línea)",
              "Noradrenalina",
              "0.05–0.5 µg/kg/min IV en infusión, titular a PAM ≥ 65 mmHg.",
            ],
            [
              "Vasopresor pulmonar-neutro",
              "Vasopresina",
              "Bolo 1–2 U IV o infusión ~0.01–0.04 U/min; sube la RVS sin aumentar la RVP.",
            ],
            [
              "Inotropía del VD",
              "Dobutamina",
              "2–20 µg/kg/min; mejora contractilidad del VD y gasto (vigilar hipotensión/taquicardia).",
            ],
            [
              "Inotropía / inodilatador alterno",
              "Milrinona",
              "0.25–0.75 µg/kg/min; inodilatador pulmonar (riesgo de hipotensión sistémica).",
            ],
            [
              "Reducir poscarga del VD",
              "Vasodilatador pulmonar inhalado",
              "Óxido nítrico inhalado 5–40 ppm o epoprostenol inhalado; baja la RVP sin hipotensión sistémica.",
            ],
            [
              "Fluidos",
              "Cristaloide con MUCHA cautela",
              "Solo si hipovolemia clara; bolos pequeños. La sobrecarga distiende el VD y mata.",
            ],
          ]}
        />
        <Src>
          Pacheco LD, et al. SMFM 2016 (soporte del VD, evitar sobrecarga). · Chestnut&apos;s
          Obstetric Anesthesia. · Miller&apos;s Anesthesia — obstetric emergencies.
        </Src>
        <Callout variant="warn">
          <b>Regla del VD:</b> presión (noradrenalina/vasopresina) + inotropía (dobutamina) +{" "}
          <b>reducción de la poscarga pulmonar</b> (NO inhalado / epoprostenol) &gt; volumen. Cada
          bolo de fluido de más en un VD dilatado desplaza el septum, comprime el VI y baja el gasto.
        </Callout>
        <Callout variant="info">
          Considerar <b>soporte mecánico (ECMO veno-arterial)</b> de forma precoz en el colapso
          refractario si el centro dispone de él: es puente de rescate mientras cede la hipertensión
          pulmonar.{" "}
          <span className="mono" style={{ fontSize: "0.62rem", color: "var(--text-3)" }}>
            SMFM 2016 (considerar ECMO/rescate).
          </span>
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Manejo de la CID — reposición agresiva">
        <P>
          La coagulopatía de la AFE es <b>fulminante y desproporcionada</b> al sangrado visible.
          Anticipar la hemorragia masiva: activar el <b>protocolo de transfusión masiva (PTM)</b> de
          entrada y reponer de forma dirigida (idealmente por ROTEM/TEG). El fibrinógeno cae precoz y
          profundamente en obstetricia.
        </P>
        <Table
          headers={["Componente", "Objetivo / dosis", "Notas"]}
          accentCol={1}
          rows={[
            [
              "Transfusión masiva (ratio)",
              "PRBC : PFC : Plaquetas ≈ 1 : 1 : 1",
              "Activar PTM temprano; no esperar el laboratorio (siempre va por detrás).",
            ],
            [
              "Fibrinógeno",
              "Mantener > 2.0 g/L (obstétrico)",
              "Fibrinógeno concentrado 25–50 mg/kg o crioprecipitado (pool 10 U sube ≈ 0.5–1 g/L).",
            ],
            [
              "Ácido tranexámico (TXA)",
              "1 g IV en 10 min; repetir 1 g si sangra a los 30 min",
              "WOMAN trial: reduce muerte por hemorragia obstétrica; darlo temprano.",
            ],
            [
              "Plaquetas",
              "Mantener > 50 ×10⁹/L con sangrado activo",
              "1 aféresis/pool sube ≈ +30–50 ×10⁹/L.",
            ],
            [
              "Calcio iónico",
              "Mantener > 1.0–1.1 mmol/L",
              "El citrato de los productos quela el Ca²⁺; reponer con calcio IV.",
            ],
            [
              "Atonía uterina",
              "Uterotónicos + medidas mecánicas",
              "Oxitocina, ergonovina, carboprost/misoprostol, balón, suturas; la atonía agrava la CID.",
            ],
          ]}
        />
        <Src>
          SMFM 2016. · WOMAN Trial Collaborators. Tranexamic acid for postpartum haemorrhage. Lancet
          2017;389:2105-2116. · RCOG/AABB — massive obstetric haemorrhage.
        </Src>
        <Callout variant="danger">
          <b>Triada letal (hipotermia + acidosis + coagulopatía)</b> como en trauma: mantener{" "}
          <b>T &gt; 35 °C</b>, corregir acidosis y calcio, y no diluir con cristaloide. En AFE el
          consumo de fibrinógeno domina — repóngalo agresivamente y guíese por ROTEM/TEG si lo tiene.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Protocolo A-OK (adyuvante propuesto)">
        <P>
          El <b>&quot;A-OK&quot;</b> es un protocolo farmacológico <b>adyuvante propuesto</b> (serie
          de casos, no ensayo controlado) dirigido a antagonizar los mediadores (serotonina,
          tromboxano) implicados en el vasoespasmo pulmonar de la AFE. <b>No sustituye</b> la
          reanimación de soporte; se añade a ella. La regla mnemotécnica: <b>A-O-K</b>.
        </P>
        <Table
          headers={["Letra", "Fármaco", "Dosis", "Racional"]}
          accentCol={2}
          rows={[
            [
              "A",
              "Atropina",
              "1 mg IV",
              "Bloquea el reflejo vagal / bradicardia; reduce el tono vagal pulmonar.",
            ],
            [
              "O",
              "Ondansetrón",
              "8 mg IV",
              "Antagonista 5-HT₃; antagoniza la serotonina implicada en el vasoespasmo pulmonar.",
            ],
            [
              "K",
              "Ketorolaco",
              "30 mg IV",
              "AINE; inhibe el tromboxano (vasoconstrictor/agregante) vía COX.",
            ],
          ]}
        />
        <Src>
          Rezai S, et al. Atropine, ondansetron, and ketorolac (&quot;A-OK&quot;) in amniotic fluid
          embolism. Case Rep Obstet Gynecol 2017;2017:8458375 (Copel/Rezai protocol).
        </Src>
        <Callout variant="warn">
          <b>Nivel de evidencia bajo</b> (reportes de caso). El A-OK es un <b>adyuvante</b>, no la
          base del tratamiento. Precaución con ketorolaco si CID/hemorragia establecida (antiagregante
          y nefrotóxico): individualizar. La <b>prioridad absoluta</b> sigue siendo RCP de calidad,
          oxigenación, soporte del VD y control de la CID.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Ecocardiografía y monitorización">
        <P>
          La <b>ecocardiografía</b> (transtorácica o transesofágica) es la herramienta de imagen más
          útil en el colapso agudo: dirige el soporte hemodinámico en tiempo real y ayuda a excluir
          otras causas (taponamiento, IAM, TEP masiva).
        </P>
        <Table
          headers={["Hallazgo eco", "Interpretación", "Conducta"]}
          rows={[
            ["VD dilatado, hipocinético", "Fallo agudo del VD por hipertensión pulmonar", "Vasopresor + inotrópico VD + reducir poscarga pulmonar; NO sobrecargar volumen"],
            ["Septum aplanado / \"D-shape\"", "Sobrecarga de presión del VD, compromiso del VI", "Confirma fisiología de fallo derecho; evitar fluidos"],
            ["McConnell (ápex VD conservado)", "Sugiere sobrecarga aguda de VD (también en TEP)", "Integrar con clínica; considerar TEP en el diferencial"],
            ["VI hiperdinámico y colapsado", "Hipovolemia / vasoplejia (fase tardía)", "Puede requerir volumen y vasopresor — reevaluar continuamente"],
          ]}
        />
        <Src>SMFM 2016 (ecocardiografía dirigida). · Chestnut&apos;s Obstetric Anesthesia.</Src>
        <Callout variant="info">
          Monitorización adicional: capnografía (la <b>caída súbita de EtCO₂</b> puede ser el primer
          signo), gasometría seriada, calcio iónico, fibrinógeno y ROTEM/TEG para dirigir la
          reposición, y línea arterial en cuanto sea posible sin retrasar la reanimación.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Resumen de dosis y umbrales clave">
        <Table
          headers={["Ítem", "Valor", "Fuente"]}
          accentCol={1}
          rows={[
            ["Cesárea perimortem", "Decidir a ~4 min de paro, feto fuera < 5 min", "AHA 2015"],
            ["Desplazamiento uterino", "Manual a la izquierda si útero ≥ ombligo", "AHA 2015"],
            ["Adrenalina (paro)", "1 mg IV c/3–5 min", "ACLS / AHA"],
            ["Noradrenalina", "0.05–0.5 µg/kg/min", "SMFM 2016"],
            ["Vasopresina", "1–2 U bolo / 0.01–0.04 U/min", "SMFM 2016"],
            ["Dobutamina (inotrópico VD)", "2–20 µg/kg/min", "SMFM 2016"],
            ["Transfusión masiva", "PRBC:PFC:PLT ≈ 1:1:1", "SMFM 2016 / RCOG"],
            ["Fibrinógeno objetivo", "> 2.0 g/L (obstétrico)", "SMFM 2016 / RCOG"],
            ["TXA", "1 g IV en 10 min (+1 g a 30 min)", "WOMAN 2017"],
            ["A-OK — Atropina", "1 mg IV", "Rezai 2017"],
            ["A-OK — Ondansetrón", "8 mg IV", "Rezai 2017"],
            ["A-OK — Ketorolaco", "30 mg IV", "Rezai 2017"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="09" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Pacheco LD, Saade G, Hankins GDV, Clark SL; Society for Maternal-Fetal Medicine. Amniotic fluid embolism: diagnosis and management. SMFM Clinical Guideline No. 9. Am J Obstet Gynecol 2016;215(2):B16-B24.</li>
          <li>Clark SL, Romero R, Dildy GA, et al. Proposed diagnostic criteria for the case definition of amniotic fluid embolism in research studies (AFE Registry / AFE Foundation). Am J Obstet Gynecol 2016;215(4):408-412.</li>
          <li>Jeejeebhoy FM, Zelop CM, Lipman S, et al. Cardiac Arrest in Pregnancy: A Scientific Statement From the American Heart Association. Circulation 2015;132(18):1747-1773.</li>
          <li>Rezai S, Hughes AC, Larsen TB, et al. Atropine, Ondansetron, and Ketorolac (&quot;A-OK&quot;): Novel Combination Therapy for Amniotic Fluid Embolism. Case Rep Obstet Gynecol 2017;2017:8458375.</li>
          <li>WOMAN Trial Collaborators. Effect of early tranexamic acid administration on mortality in women with post-partum haemorrhage (WOMAN): randomised, double-blind, placebo-controlled trial. Lancet 2017;389(10084):2105-2116.</li>
          <li>Chestnut DH, et al. Chestnut&apos;s Obstetric Anesthesia: Principles and Practice — Amniotic Fluid Embolism.</li>
          <li>Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — Obstetric emergencies.</li>
          <li>Royal College of Obstetricians and Gynaecologists (RCOG). Prevention and Management of Postpartum Haemorrhage. Green-top Guideline No. 52.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y umbrales de literatura aceptada (SMFM 2016 · registro AFE · AHA 2015 · WOMAN 2017)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// diagnóstico de exclusión: mientras dudas, reanima; el diagnóstico se confirma después (a veces en la autopsia)"}
          <br />
          {"// el reloj de la cesárea perimortem corre desde el paro, no desde que llegas al quirófano"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
