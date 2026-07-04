import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — EMBOLIA GASEOSA VENOSA (VAE)
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: detección, maniobras y manejo tomados de
// literatura aceptada (Mirski, Miller, Stoelting). Cada tabla/
// callout cita su fuente (Vancouver breve). NO inventar cifras.
// Fuentes primarias:
//  - Mirski MA, Lele AV, Fitzsimmons L, Toung TJK. Diagnosis and
//    treatment of vascular air embolism. Anesthesiology
//    2007;106(1):164-177.
//  - Gropper MA, et al. Miller's Anesthesia, 9.ª ed. — Neurosurgical
//    Anesthesia / Venous Air Embolism (posición sentada).
//  - Gropper MA, et al. Stoelting's / Anesthesia and Co-Existing
//    Disease — embolia gaseosa.
//  - Durant TM, Long J, Oppenheimer MJ. Pulmonary (venous) air
//    embolism. Am Heart J 1947;33(3):269-281.
// ============================================================

export const metadata: Metadata = {
  title: "Embolia gaseosa venosa (VAE) — detección y manejo · DEC",
  description:
    "Referencia perioperatoria de embolia gaseosa venosa (VAE): situaciones de riesgo (neurocirugía sentado, laparoscopia, cesárea, cirugía de cuello), detección escalonada (TEE > Doppler precordial > caída de ETCO2 > hipotensión, mill-wheel murmur, hipoxia, arritmia), manejo inmediato (inundar el campo, comprimir yugulares, O2 100% y suspender N2O, posición de Durant, aspiración por catéter venoso central en unión cava-AD, soporte hemodinámico y RCP) y embolia paradójica por FOP.",
  openGraph: {
    title: "Embolia gaseosa venosa (VAE) — detección y manejo · DEC",
    description:
      "Riesgo, detección escalonada (TEE > Doppler > ETCO2), maniobras (inundar campo, O2 100%, posición de Durant, aspiración por CVC) y embolia paradójica. Mirski 2007, Miller.",
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
export default function EmboliaGaseosaVenosaPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat embolia-gaseosa-venosa.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Embolia gaseosa venosa (VAE)
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          riesgo · detección escalonada · inundar campo · O₂ 100% · posición de Durant · aspiración por CVC · FOP
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// el aire entra silencioso; la primera pista suele ser un número en el capnógrafo cayendo"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">EMERGENCIA</span>
          <span className="tag tag-muted">Mirski 2007</span>
          <span className="tag tag-muted">Miller</span>
          <span className="tag tag-muted">Durant</span>
        </div>
      </header>

      <Callout variant="danger">
        <b>Fisiopatología en una línea.</b> Aire que entra a la circulación venosa por un gradiente de
        presión (sitio quirúrgico <b>por encima del nivel del corazón</b> + vena abierta no colapsable)
        migra al VD y al lecho pulmonar: si el volumen es grande, forma un <b>tapón aéreo («air lock»)</b>{" "}
        en el tracto de salida del VD que impide la eyección → caída del gasto, hipoxia y colapso. El
        tratamiento de primera línea es <b>impedir más entrada de aire</b> y <b>evacuar el existente</b>,
        no esperar a que se reabsorba.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Situaciones de riesgo">
        <P>
          El riesgo aparece cuando coinciden un <b>campo quirúrgico por encima del corazón</b> (gradiente
          de presión subatmosférico en las venas) y <b>venas abiertas que no colapsan</b> (senos durales,
          venas emisarias del cráneo, diploe óseo, útero grávido). Reconocer el escenario de riesgo{" "}
          <b>antes</b> de la incisión permite montar la monitorización adecuada.
        </P>
        <Table
          headers={["Escenario", "Mecanismo", "Nota"]}
          rows={[
            [
              "Neurocirugía en posición sentada",
              "Cabeza muy por encima del corazón; senos durales y venas emisarias no colapsables.",
              "Escenario clásico de mayor riesgo; exige monitorización de alta sensibilidad.",
            ],
            [
              "Laparoscopia",
              "Insuflación de CO₂; embolia de gas por insuflación intravascular o lesión venosa.",
              "El CO₂ se reabsorbe rápido, pero un bolo grande igual causa colapso.",
            ],
            [
              "Cesárea / cirugía obstétrica",
              "Senos venosos uterinos abiertos, útero exteriorizado por encima del nivel cardíaco.",
              "VAE subclínica frecuente; sospechar ante desaturación/disnea intraoperatoria.",
            ],
            [
              "Cirugía de cuello y grandes vasos",
              "Venas del cuello (yugulares) abiertas por encima del corazón.",
              "Cirugía cervical, de columna cervical, tiroidea, disección de vasos.",
            ],
            [
              "Accesos venosos / catéteres centrales",
              "Entrada de aire por línea abierta o retirada de catéter central.",
              "Purgar líneas; posición y Valsalva al retirar CVC.",
            ],
          ]}
        />
        <Src>
          Mirski MA, et al. Anesthesiology 2007;106(1):164-177. · Gropper MA, et al. Miller&apos;s
          Anesthesia, 9.ª ed. (posición sentada, neuroanestesia).
        </Src>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Detección — de la más a la menos sensible">
        <P>
          Ningún monitor único basta: se combinan por <b>sensibilidad decreciente</b>. El{" "}
          <b>ecocardiograma transesofágico (TEE)</b> es el más sensible (detecta burbujas mínimas y
          embolia paradójica); el <b>Doppler precordial</b> es el más sensible <b>no invasivo</b>. La
          <b> caída brusca del ETCO₂</b> es el signo práctico más útil en la mayoría de quirófanos. Los
          signos clínicos tardíos (hipotensión, soplo, hipoxia, arritmia) implican ya una embolia de
          volumen significativo.
        </P>
        <Table
          headers={["Sensibilidad", "Monitor / signo", "Qué muestra"]}
          accentCol={1}
          rows={[
            [
              "★★★★★ (máxima)",
              "TEE (ecocardiografía transesofágica)",
              "Burbujas en cavidades derechas; detecta VAE mínima y el paso paradójico a cavidades izquierdas (FOP).",
            ],
            [
              "★★★★ (no invasivo más sensible)",
              "Doppler precordial",
              "Cambio del tono/«roaring» característico al pasar burbujas por el corazón derecho.",
            ],
            [
              "★★★",
              "Caída súbita del ETCO₂ (capnografía)",
              "El aire aumenta el espacio muerto → cae el CO₂ espirado; signo práctico más útil intra-op.",
            ],
            [
              "★★ (tardíos)",
              "Hipotensión · «mill-wheel murmur» · hipoxia (↓ SpO₂) · arritmias",
              "El soplo «en rueda de molino» y el colapso hemodinámico indican embolia ya voluminosa.",
            ],
          ]}
        />
        <Src>
          Mirski MA, et al. Anesthesiology 2007;106(1):164-177. · Gropper MA, et al. Miller&apos;s
          Anesthesia, 9.ª ed.
        </Src>
        <Callout variant="info">
          Otros hallazgos: <b>aumento de la PA pulmonar / PVC</b>, elevación del CO₂ al final de la
          espiración de <b>N₂</b> si se monitoriza gas espirado, y datos de sobrecarga aguda del VD en
          el TEE/ECG. El nitrógeno espirado (end-tidal N₂) puede subir antes que caiga el ETCO₂.
        </Callout>
        <Callout variant="warn">
          El <b>«mill-wheel murmur»</b> (soplo tosco, «en rueda de molino», audible incluso sin
          estetoscopio) y la caída de SpO₂ son signos <b>tardíos</b>: no esperar a ellos para actuar.
          Ante una caída inexplicada del ETCO₂ en un caso de riesgo, tratar como VAE de inmediato.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Manejo inmediato — secuencia">
        <P>
          Objetivos simultáneos: <b>frenar la entrada de aire</b>, <b>evacuar el aire ya embolizado</b> y{" "}
          <b>sostener la hemodinamia</b>. Comunicar al cirujano en voz alta es el primer gesto: el control
          de la fuente es tan «tratamiento» como el vasopresor.
        </P>
        <Table
          headers={["Paso", "Acción"]}
          rows={[
            ["1 · Avisar al cirujano", "Declarar «sospecha de embolia gaseosa»; el equipo quirúrgico actúa sobre la fuente de inmediato."],
            ["2 · Inundar / sellar el campo", "Inundar el campo quirúrgico con salino y aplicar cera ósea a los bordes óseos sangrantes para ocluir las venas abiertas."],
            ["3 · Comprimir yugulares", "Compresión bilateral de las venas yugulares (en cirugía de cabeza/cuello) para elevar la presión venosa cerebral y frenar la entrada de aire."],
            ["4 · O₂ 100% y suspender N₂O", "FiO₂ 100%; SUSPENDER el óxido nitroso de inmediato (difunde a la burbuja y la agranda)."],
            ["5 · Posición de Durant", "Decúbito lateral izquierdo + Trendelenburg: atrapa el aire en el ápex del VD y lo aleja del tracto de salida."],
            ["6 · Aspirar por catéter central", "Aspirar aire por un catéter venoso central con la punta en la unión cava superior–aurícula derecha."],
            ["7 · Soporte hemodinámico", "Fluidos IV, vasopresores/inotrópicos según necesidad; RCP si hay paro."],
            ["8 · Bajar el campo", "Si es posible, colocar el sitio quirúrgico al nivel/por debajo del corazón para anular el gradiente."],
          ]}
        />
        <Src>
          Mirski MA, et al. Anesthesiology 2007;106(1):164-177. · Durant TM, et al. Am Heart J
          1947;33(3):269-281. · Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed.
        </Src>
        <Callout variant="danger">
          <b>Suspender el N₂O es prioritario.</b> El óxido nitroso es ~34× más soluble que el nitrógeno:
          difunde hacia la burbuja de aire más rápido de lo que el N₂ sale, <b>aumentando el volumen y la
          presión</b> del émbolo. Ante cualquier sospecha de VAE, cortar el N₂O y pasar a FiO₂ 100%.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Posición de Durant y aspiración por catéter central">
        <P>
          La <b>posición de Durant</b> (decúbito lateral izquierdo con Trendelenburg) desplaza el aire
          hacia el ápex del ventrículo derecho, alejándolo del tracto de salida pulmonar y deshaciendo el
          «air lock» que impedía la eyección. En paralelo, un <b>catéter venoso central</b> con la punta
          bien posicionada permite <b>aspirar el aire</b> directamente del corazón derecho.
        </P>
        <Table
          headers={["Maniobra", "Detalle", "Objetivo"]}
          accentCol={1}
          rows={[
            [
              "Posición de Durant",
              "Decúbito lateral izquierdo + Trendelenburg",
              "Atrapar el aire en el ápex del VD y liberar el tracto de salida (deshacer el air lock).",
            ],
            [
              "Aspiración por CVC",
              "Punta del catéter en la unión vena cava superior–aurícula derecha",
              "Extraer el aire embolizado directamente del corazón derecho.",
            ],
            [
              "Comprimir yugulares",
              "Compresión venosa yugular bilateral (cabeza/cuello)",
              "Elevar la presión venosa y frenar el ingreso de más aire por el sitio quirúrgico.",
            ],
            [
              "Bajar el sitio quirúrgico",
              "Colocar el campo al nivel o por debajo del corazón",
              "Anular el gradiente de presión que succiona el aire.",
            ],
          ]}
        />
        <Src>
          Durant TM, Long J, Oppenheimer MJ. Am Heart J 1947;33(3):269-281. · Mirski MA, et al.
          Anesthesiology 2007;106(1):164-177.
        </Src>
        <Callout variant="info">
          <b>Posición óptima de la punta del CVC.</b> Para maximizar la aspiración de aire, la punta debe
          quedar en la <b>unión cava superior–aurícula derecha</b> (multiperforado idealmente). Un
          catéter mal posicionado aspira poco. En casos de alto riesgo (neurocirugía sentada) el CVC se
          coloca de forma <b>profiláctica</b>.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Embolia paradójica y foramen oval permeable (FOP)">
        <P>
          Si hay un <b>foramen oval permeable</b> (~25–30% de la población) u otro shunt derecha-izquierda,
          el aire puede pasar a la <b>circulación arterial</b>: embolia <b>paradójica</b>, con oclusión de
          arterias <b>coronarias o cerebrales</b> (ACV/isquemia miocárdica). La presión derecha elevada por
          la propia VAE favorece el paso a través del FOP.
        </P>
        <Callout variant="danger">
          La embolia paradójica convierte una VAE venosa en una <b>embolia arterial cerebral o coronaria</b>.
          Sospecharla ante déficit neurológico focal nuevo, cambios isquémicos en el ECG o colapso
          desproporcionado. El TEE es la herramienta que detecta el paso de burbujas a cavidades
          izquierdas.
        </Callout>
        <Callout variant="warn">
          Un <b>FOP conocido</b> es una consideración de peso al planificar la <b>posición sentada</b> en
          neurocirugía: eleva el riesgo de embolia paradójica catastrófica. Valorar cribado y posición
          alternativa según el caso.
        </Callout>
        <Src>Mirski MA, et al. Anesthesiology 2007;106(1):164-177. · Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed.</Src>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Prevención en el caso de riesgo">
        <P>
          La mejor VAE es la que no ocurre. En escenarios de alto riesgo (sobre todo posición sentada),
          la prevención y la monitorización preventiva reducen la gravedad del evento.
        </P>
        <Table
          headers={["Medida", "Detalle"]}
          rows={[
            ["Monitorización sensible", "Doppler precordial ± TEE + capnografía continua en casos de alto riesgo (posición sentada)."],
            ["CVC profiláctico", "Colocar el catéter central (punta en unión cava-AD) antes de iniciar, para aspirar aire si ocurre VAE."],
            ["Evitar / ser cauto con N₂O", "En cirugía de alto riesgo, evitar el óxido nitroso o estar listo para suspenderlo de inmediato."],
            ["Volemia y presión venosa", "Mantener volemia adecuada; evitar hipovolemia que aumenta el gradiente subatmosférico."],
            ["Optimizar la posición", "Minimizar la altura del campo sobre el corazón cuando sea quirúrgicamente posible."],
            ["Purgar líneas / retirada de CVC", "Purgar circuitos IV; retirar catéteres centrales con el paciente en decúbito/Trendelenburg y Valsalva, sellar el sitio."],
          ]}
        />
        <Src>
          Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. · Mirski MA, et al. Anesthesiology
          2007;106(1):164-177.
        </Src>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Resumen de puntos clave">
        <Table
          headers={["Parámetro", "Conducta", "Fuente"]}
          accentCol={1}
          rows={[
            ["Monitor más sensible", "TEE (ecocardiografía transesofágica)", "Mirski 2007"],
            ["Más sensible no invasivo", "Doppler precordial", "Mirski 2007"],
            ["Signo práctico intra-op", "Caída súbita del ETCO₂", "Mirski 2007 / Miller"],
            ["Signos tardíos", "Hipotensión · mill-wheel murmur · hipoxia · arritmia", "Mirski 2007"],
            ["Primer gesto", "Avisar al cirujano + inundar campo / cera ósea", "Miller"],
            ["Óxido nitroso", "SUSPENDER de inmediato + FiO₂ 100%", "Mirski 2007 / Miller"],
            ["Posición", "Durant: decúbito lateral izquierdo + Trendelenburg", "Durant 1947"],
            ["Aspiración de aire", "Por CVC con punta en unión cava-AD", "Mirski 2007"],
            ["Soporte", "Fluidos + vasopresores; RCP si paro", "Miller"],
            ["Embolia paradójica", "Considerar FOP → aire arterial (cerebral/coronario)", "Mirski 2007"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Mirski MA, Lele AV, Fitzsimmons L, Toung TJK. Diagnosis and treatment of vascular air embolism. Anesthesiology 2007;106(1):164-177.</li>
          <li>Durant TM, Long J, Oppenheimer MJ. Pulmonary (venous) air embolism. Am Heart J 1947;33(3):269-281.</li>
          <li>Gropper MA, Cohen NH, Eriksson LI, et al. Miller&apos;s Anesthesia, 9.ª ed. — Neurosurgical Anesthesia / Venous Air Embolism. Elsevier, 2020.</li>
          <li>Roth S, et al. Stoelting&apos;s Anesthesia and Co-Existing Disease — embolia gaseosa venosa y posición sentada.</li>
          <li>Muth CM, Shank ES. Gas embolism. N Engl J Med 2000;342(7):476-482.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// detección y maniobras de literatura aceptada (Mirski 2007 · Miller · Stoelting · Durant 1947)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// el N₂O no perdona: ante VAE se corta primero y se pregunta después"}
          <br />
          {"// si el ETCO₂ cae en un caso de riesgo, ya empezaste tarde: trata como embolia"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
