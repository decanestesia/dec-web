import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Algoritmo — VÍA AÉREA DIFÍCIL PEDIÁTRICA
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: fórmulas de tubo, profundidad, dosis y pasos
// tomados de guías de sociedad. Cada dato lleva referencia
// (Vancouver breve). NO inventar cifras.
// Fuentes primarias:
//  - Black AE, Flynn PER, Smith HL, et al. Development of a guideline
//    for the management of the unanticipated difficult airway in
//    paediatric practice. Paediatr Anaesth 2015;25(4):346-362.
//    (APA / DAS — Difficult Airway Society Paediatric — DAS-PIA)
//  - APAGBI (Association of Paediatric Anaesthetists of Great Britain
//    and Ireland) Paediatric Difficult Airway Guidelines.
//  - Cook TM, Woodall N, Frerk C. NAP4. Br J Anaesth 2011;106(5):617-631.
//  - Weiss M, Engelhardt T. Proposal for the management of the
//    unexpected difficult pediatric airway. Paediatr Anaesth 2010.
//  - Cote CJ, Lerman J, Anderson BJ. A Practice of Anesthesia for
//    Infants and Children, 6.ª ed.
//  - Gropper MA, et al. Miller's Anesthesia, 9.ª ed. — Pediatric Anesthesia.
// ============================================================

export const metadata: Metadata = {
  title: "Vía aérea difícil pediátrica — algoritmo APA/DAS-PIA · DEC",
  description:
    "Algoritmo de vía aérea difícil pediátrica: diferencias anatómicas del niño, plan A-B-C-D de intubación difícil no anticipada (APA/DAS-PIA), manejo de la VAD anticipada con ventilación espontánea, tamaño y profundidad del tubo (edad/4+4 sin balón, +3.5 con balón), oxigenación apneica y eFONA pediátrico con cánula. Guías APA/DAS-PIA 2015.",
  openGraph: {
    title: "Vía aérea difícil pediátrica — algoritmo APA/DAS-PIA · DEC",
    description:
      "Diferencias anatómicas, plan A-B-C-D, tamaño de tubo, oxigenación apneica y eFONA pediátrico. Guías APA/DAS-PIA.",
    type: "article",
  },
};

// ------------------------------------------------------------
// Helpers de presentación (mismo lenguaje visual que /guias)
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

// Bloque de fórmula destacado (borde de acento)
function Formula({
  expr,
  detail,
}: {
  expr: string;
  detail: React.ReactNode;
}) {
  return (
    <div className="panel" style={{ margin: "0 0 1rem", borderLeft: "3px solid var(--accent)" }}>
      <div className="panel-body" style={{ display: "grid", gap: "0.5rem" }}>
        <div
          className="mono"
          style={{ color: "var(--accent)", fontSize: "1rem", fontWeight: 700, letterSpacing: "0.02em" }}
        >
          {expr}
        </div>
        <div className="mono" style={{ color: "var(--text-2)", fontSize: "0.72rem", lineHeight: 1.7 }}>
          {detail}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Página (Server Component — referencia estática)
// ------------------------------------------------------------
export default function ViaAereaDificilPediatricaPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/algoritmos" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /algoritmos
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat via-aerea-dificil-pediatrica.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Vía aérea difícil pediátrica
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          anatomía del niño · plan A-B-C-D (APA/DAS-PIA) · VAD anticipada · tamaño y profundidad de tubo · oxigenación apneica · eFONA
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// el niño no es un adulto pequeño; desatura antes de que termines la frase"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">ALGORITMO</span>
          <span className="tag tag-muted">APA/DAS-PIA 2015</span>
          <span className="tag tag-muted">APAGBI</span>
          <span className="tag tag-muted">NAP4</span>
        </div>
      </header>

      <Callout variant="info">
        Dos escenarios distintos, dos abordajes: la <b>VAD anticipada</b> (síndrome, malformación,
        vía aérea difícil conocida) se maneja de forma electiva{" "}
        <b>manteniendo ventilación espontánea</b>; la <b>VAD no anticipada</b> (intubación difícil
        inesperada tras inducción) se maneja con el algoritmo secuencial <b>Plan A → B → C → D</b>{" "}
        de la APA/DAS-PIA. El eje común pediátrico: la <b>desaturación es rápida</b> — prioriza
        oxigenar sobre intubar.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Diferencias anatómicas y fisiológicas del niño">
        <P>
          La dificultad de vía aérea pediátrica nace de la anatomía del lactante y del preescolar,
          que cambia progresivamente hasta parecerse a la del adulto hacia los <b>8–10 años</b>.
          Estas diferencias condicionan la posición, el tamaño del tubo y, sobre todo, el margen de
          tiempo disponible.
        </P>
        <Table
          headers={["Rasgo", "Particularidad del niño", "Implicación práctica"]}
          rows={[
            [
              "Occipucio",
              "Occipucio grande y prominente (lactante)",
              "Flexiona el cuello en decúbito → posición de olfateo con rollo bajo los hombros, NO bajo la cabeza",
            ],
            [
              "Lengua",
              "Lengua relativamente grande respecto a la cavidad oral",
              "Mayor obstrucción y desplazamiento; más difícil crear espacio en laringoscopia",
            ],
            [
              "Laringe",
              "Laringe más anterior y cefálica (C3–C4 en lactante vs C5–C6 adulto)",
              "Visión glótica más difícil; a veces mejor con laringoscopio recto (Miller)",
            ],
            [
              "Epiglotis",
              "Larga, estrecha, en forma de Ω y angulada",
              "Difícil de levantar con pala curva; hoja recta la calza directamente",
            ],
            [
              "Punto más estrecho",
              "Cartílago cricoides en el niño pequeño (< 8 años); glotis en el mayor/adulto",
              "Un tubo que pasa la glotis puede no pasar el cricoides → usar tubo con balón de baja presión",
            ],
            [
              "Reserva de O₂",
              "Menor CRF, mayor consumo de O₂ (6–8 mL/kg/min vs ~3 en adulto)",
              "Desaturación muy rápida en apnea → preoxigenación y oxigenación apneica críticas",
            ],
          ]}
        />
        <Src>
          Black AE, et al. (APA/DAS-PIA). Paediatr Anaesth 2015;25(4):346-362. · Cote CJ, Lerman J,
          Anderson BJ. A Practice of Anesthesia for Infants and Children, 6.ª ed. · Miller&apos;s
          Anesthesia, 9.ª ed., cap. Pediatric Anesthesia.
        </Src>
        <Callout variant="warn">
          La noción clásica del cricoides como punto más estrecho es <b>funcional</b> (forma
          elíptica del anillo), no necesariamente el diámetro menor absoluto en imagen. La regla
          clínica se mantiene: si el tubo pasa la glotis pero encuentra resistencia, <b>no forzar</b>{" "}
          — bajar 0.5 mm de calibre para evitar edema y estenosis subglótica.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Tamaño y profundidad del tubo endotraqueal">
        <P>
          Fórmulas de referencia para el niño <b>&gt; 1–2 años</b> (fuera de este rango usar tablas
          por peso/edad y material del carro). Preparar siempre <b>tres tubos</b>: el calculado, uno
          0.5 mm mayor y uno 0.5 mm menor. El tubo <b>con balón</b> (microcuff, baja presión) es hoy
          estándar en la mayoría de indicaciones pediátricas.
        </P>
        <Formula
          expr="DI (sin balón) = edad/4 + 4"
          detail={
            <>
              DI = diámetro interno en mm · válida para niño &gt; 2 años
              <br />
              Ej.: 4 años → 4/4 + 4 = <b style={{ color: "var(--accent)" }}>5.0 mm</b>
            </>
          }
        />
        <Formula
          expr="DI (con balón) = edad/4 + 3.5"
          detail={
            <>
              medio milímetro menos para dejar sitio al balón de baja presión
              <br />
              Ej.: 4 años → 4/4 + 3.5 = <b style={{ color: "var(--accent)" }}>4.5 mm con balón</b>
            </>
          }
        />
        <Formula
          expr="Profundidad (labio) ≈ DI × 3"
          detail={
            <>
              profundidad a la comisura labial en cm ≈ diámetro interno × 3
              <br />
              Ej.: tubo 4.0 → 4.0 × 3 = <b style={{ color: "var(--accent)" }}>12 cm</b> · confirmar con
              auscultación y capnografía
            </>
          }
        />
        <Table
          headers={["Edad", "DI sin balón (mm)", "DI con balón (mm)", "Profundidad ≈ (cm)"]}
          accentCol={2}
          rows={[
            ["Prematuro", "2.5–3.0", "—", "6–8"],
            ["RN a término", "3.0–3.5", "3.0", "9–10"],
            ["6–12 meses", "3.5–4.0", "3.5", "10–11"],
            ["2 años", "4.5 (edad/4+4)", "4.0", "12–13"],
            ["4 años", "5.0", "4.5", "15"],
            ["6 años", "5.5", "5.0", "16–17"],
            ["8 años", "6.0", "5.5", "18"],
          ]}
        />
        <Src>
          Black AE, et al. (APA/DAS-PIA) 2015. · Cole&apos;s formula (DI = edad/4 + 4). · Khine HH,
          et al. Anesthesiology 1997 (tubos con balón en niños). · Cote CJ, Lerman J. A Practice of
          Anesthesia for Infants and Children, 6.ª ed.
        </Src>
        <Callout variant="info">
          Con tubo <b>con balón</b>: inflar a la mínima presión que selle, vigilar presión del balón
          (&lt; 20 cmH₂O) y disponer de manómetro; el balón permite ventilar con menor fuga y menos
          recambios de tubo, reduciendo el trauma repetido de la vía aérea.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="VAD anticipada — mantener ventilación espontánea">
        <P>
          Ante vía aérea difícil <b>conocida o predecible</b> (síndromes craneofaciales — Pierre
          Robin, Treacher Collins, Goldenhar—, micrognatia, macroglosia, masas, estenosis, cirugía o
          radioterapia previas), el principio rector es <b>no abolir la ventilación espontánea</b>{" "}
          hasta asegurar la vía aérea. Se prefiere una técnica que preserve el impulso respiratorio
          y permita despertar al niño si la instrumentación falla.
        </P>
        <ol style={{ color: "var(--text-1)", fontSize: "0.86rem", lineHeight: 1.7, paddingLeft: "1.3rem", margin: "0 0 1rem" }}>
          <li>Plan multidisciplinar y equipo experto disponible (ORL, videolaringoscopio, fibrobroncoscopio, carro de VAD pediátrico).</li>
          <li>Inducción inhalatoria (sevoflurano) o IV titulada <b>manteniendo respiración espontánea</b>; evitar relajante neuromuscular hasta confirmar que se puede ventilar/intubar.</li>
          <li>Optimizar la vía aérea: cánula orofaríngea/nasofaríngea, CPAP, oxígeno de alto flujo.</li>
          <li>Instrumentar bajo plano anestésico profundo con ventilación espontánea: videolaringoscopia o fibrobroncoscopia flexible (a través de mascarilla laríngea si procede).</li>
          <li>Confirmar tubo con capnografía; solo entonces considerar relajante si se requiere.</li>
        </ol>
        <Src>
          Black AE, et al. (APA/DAS-PIA) 2015;25:346-362. · APAGBI Paediatric Difficult Airway
          Guidelines. · Weiss M, Engelhardt T. Paediatr Anaesth 2010.
        </Src>
        <Callout variant="danger">
          En VAD anticipada, <b>no administrar bloqueante neuromuscular ni abolir la ventilación
          espontánea</b> hasta comprobar que el niño puede ser ventilado con mascarilla o que la vía
          está asegurada. Perder la ventilación espontánea en un niño que no se puede ventilar ni
          intubar precipita el escenario &quot;CICO&quot; con muy poco margen de tiempo.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="VAD no anticipada — Plan A-B-C-D (APA/DAS-PIA)">
        <P>
          Algoritmo de <b>intubación difícil no anticipada</b> en el niño tras inducción. Es
          secuencial: cada plan tiene un número <b>limitado</b> de intentos; declarar el fracaso y
          pasar al siguiente plan es la conducta correcta, no la persistencia. El objetivo global de
          todo el algoritmo es <b>oxigenar</b>, no intubar a toda costa.
        </P>
        <Table
          headers={["Plan", "Objetivo", "Acciones clave"]}
          rows={[
            [
              "A · Laringoscopia / intubación",
              "Intubar traqueal",
              "Optimizar: posición, pala adecuada (recta en lactante), maniobra laríngea externa, videolaringoscopio, bougie. Máx. 3 + 1 intentos (el último por el más experto). Mantener oxigenación entre intentos.",
            ],
            [
              "B · Ventilación con mascarilla facial",
              "Oxigenar con MF",
              "Cánula oro/nasofaríngea, técnica a dos manos y dos operadores, profundizar anestesia o relajar si la rigidez impide ventilar. Declarar fracaso si no se logra oxigenar.",
            ],
            [
              "C · Dispositivo supraglótico (SGA)",
              "Oxigenar / rescate de vía",
              "Mascarilla laríngea de tamaño por peso; máx. 3 intentos. Puede servir de conducto para fibrobroncoscopia. Si oxigena → estabilizar y replantear (despertar / vía definitiva).",
            ],
            [
              "D · CICO → eFONA",
              "Acceso frontal de emergencia",
              "\"Can't intubate, can't oxygenate\": pedir ayuda, avisar quirófano/ORL y proceder al acceso frontal de cuello (eFONA) pediátrico. Ver sección 06.",
            ],
          ]}
        />
        <Src>
          Black AE, Flynn PER, Smith HL, et al. Development of a guideline for the management of the
          unanticipated difficult airway in paediatric practice. Paediatr Anaesth
          2015;25(4):346-362 (APA/DAS-PIA). · Cook TM, et al. NAP4. Br J Anaesth 2011;106:617-631.
        </Src>
        <Callout variant="warn">
          <b>Llamar por ayuda de forma temprana</b> es parte del Plan A, no del D. Entre intento e
          intento, <b>reoxigenar</b> hasta recuperar la SpO₂; cada laringoscopia adicional en un niño
          que desatura consume la reserva que se necesita para el rescate. Limitar el número de
          intentos previene el edema y la vía aérea &quot;quemada&quot;.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Oxigenación apneica pediátrica">
        <P>
          El niño desatura en segundos por su baja CRF y alto consumo de O₂. La{" "}
          <b>preoxigenación</b> completa y la <b>oxigenación apneica</b> (aporte de O₂ durante la
          apnea de la laringoscopia) prolongan de forma clínicamente útil el tiempo hasta la
          desaturación y son especialmente valiosas en la vía aérea difícil pediátrica.
        </P>
        <Table
          headers={["Medida", "Cómo", "Objetivo"]}
          accentCol={1}
          rows={[
            [
              "Preoxigenación",
              "O₂ 100% con mascarilla ajustada 3 min o hasta EtO₂ alta; posición óptima",
              "Desnitrogenar y llenar la CRF antes de la apnea",
            ],
            [
              "Oxigenación apneica (cánula nasal estándar)",
              "Cánula nasal a bajo flujo durante el intento: 2 L/min (lactante) hasta ~0.2 L/kg/min",
              "Aportar O₂ traqueal por flujo pasivo y prolongar la apnea segura",
            ],
            [
              "THRIVE / alto flujo nasal humidificado",
              "Cánula nasal de alto flujo humidificado y calentado, 1–2 L/kg/min",
              "Oxigenación apneica de alto flujo; alarga la apnea segura frente al bajo flujo",
            ],
            [
              "Posición",
              "Olfateo con rollo bajo hombros en lactante; cabecera algo elevada",
              "Optimizar mecánica y visión glótica",
            ],
          ]}
        />
        <Src>
          Humphreys S, et al. Apnoeic oxygenation in children (THRIVE). Br J Anaesth
          2017;118(2):232-238. · Black AE, et al. (APA/DAS-PIA) 2015. · Miller&apos;s Anesthesia,
          9.ª ed.
        </Src>
        <Callout variant="info">
          La oxigenación apneica <b>compra tiempo</b>, no elimina la apnea: no sustituye a la
          ventilación. Su valor es dar segundos extra para lograr la intubación o para reoxigenar
          antes del siguiente intento en un niño con reserva mínima.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="eFONA pediátrico — acceso frontal de emergencia (CICO)">
        <P>
          El escenario <b>CICO</b> (&quot;can&apos;t intubate, can&apos;t oxygenate&quot;) en el
          niño es raro y tiempo-dependiente. En pediatría la técnica recomendada por la APA/DAS-PIA
          es la <b>cánula</b> (punción cricotiroidea con cánula) más que la cricotirotomía quirúrgica
          con bisturí del adulto, por la fragilidad y el pequeño tamaño de la vía aérea infantil. El
          acto es una decisión declarada por el equipo, no un titubeo.
        </P>
        <ol style={{ color: "var(--text-1)", fontSize: "0.86rem", lineHeight: 1.7, paddingLeft: "1.3rem", margin: "0 0 1rem" }}>
          <li>Declarar CICO en voz alta, pedir ayuda experta (ORL) y el set de vía aérea de emergencia; asignar roles.</li>
          <li>Extender el cuello, identificar la membrana cricotiroidea, estabilizar la laringe.</li>
          <li>Punción con <b>cánula sobre aguja</b> a través de la membrana cricotiroidea; aspirar aire para confirmar posición intraluminal.</li>
          <li>Oxigenar por la cánula con un <b>sistema de baja presión y liberación de flujo</b> (p. ej. dispositivo dedicado tipo Rapid-O₂ / sistema de jet de baja presión regulado); vigilar la <b>espiración</b> para evitar barotrauma.</li>
          <li>Plan definitivo diferido: vía aérea quirúrgica formal por ORL / traqueostomía una vez oxigenado.</li>
        </ol>
        <Src>
          Black AE, et al. (APA/DAS-PIA). Paediatr Anaesth 2015;25(4):346-362 (técnica de cánula en
          eFONA pediátrico). · APAGBI Paediatric Difficult Airway Guidelines. · Cook TM, et al. NAP4.
          Br J Anaesth 2011.
        </Src>
        <Callout variant="danger">
          En el niño pequeño, la <b>jet ventilation de alta presión</b> sin vía de salida garantizada
          causa barotrauma (neumotórax, enfisema) con facilidad. Usar sistemas de <b>flujo
          controlado / baja presión</b> y asegurar la espiración; en cuanto se recupere oxigenación,
          convertir a vía aérea definitiva. La cánula es un puente, no el destino.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Resumen de cifras y fórmulas clave">
        <Table
          headers={["Parámetro", "Valor", "Fuente"]}
          accentCol={1}
          rows={[
            ["Tubo sin balón (DI, mm)", "edad/4 + 4", "APA/DAS-PIA · Cole"],
            ["Tubo con balón (DI, mm)", "edad/4 + 3.5", "APA/DAS-PIA · Khine 1997"],
            ["Profundidad al labio (cm)", "DI × 3", "APA/DAS-PIA"],
            ["Presión del balón", "< 20 cmH₂O", "APA/DAS-PIA"],
            ["Punto más estrecho (< 8 años)", "Cartílago cricoides (funcional)", "Cote / Miller"],
            ["Consumo de O₂ del lactante", "6–8 mL/kg/min", "Miller's Anesthesia"],
            ["Laringe del lactante", "Nivel C3–C4 (anterior/cefálica)", "Cote / Miller"],
            ["Intentos de laringoscopia (Plan A)", "Máx. 3 + 1 por el más experto", "APA/DAS-PIA"],
            ["eFONA pediátrico", "Cánula cricotiroidea (no bisturí de rutina)", "APA/DAS-PIA"],
          ]}
        />
        <Callout variant="ok">
          Regla mental pediátrica: <b>oxigenar &gt; intubar</b>. Tres tubos preparados, ayuda
          temprana, intentos limitados, ventilación espontánea preservada en la VAD anticipada y un
          plan de rescate (SGA → eFONA con cánula) declarado antes de inducir.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Black AE, Flynn PER, Smith HL, Thomas ML, Wilkinson KA; APA/DAS. Development of a guideline for the management of the unanticipated difficult airway in paediatric practice. Paediatr Anaesth 2015;25(4):346-362.</li>
          <li>Association of Paediatric Anaesthetists of Great Britain and Ireland (APAGBI). Paediatric Difficult Airway Guidelines (unanticipated / anticipated / CICO).</li>
          <li>Cook TM, Woodall N, Frerk C; Fourth National Audit Project (NAP4). Major complications of airway management in the UK. Br J Anaesth 2011;106(5):617-631.</li>
          <li>Weiss M, Engelhardt T. Proposal for the management of the unexpected difficult pediatric airway. Paediatr Anaesth 2010;20(5):454-464.</li>
          <li>Humphreys S, Lee-Archer P, Reyne G, et al. Transnasal humidified rapid-insufflation ventilatory exchange (THRIVE) in children: apnoeic oxygenation. Br J Anaesth 2017;118(2):232-238.</li>
          <li>Khine HH, Corddry DH, Kettrick RG, et al. Comparison of cuffed and uncuffed endotracheal tubes in young children. Anesthesiology 1997;86(3):627-631.</li>
          <li>Coté CJ, Lerman J, Anderson BJ. A Practice of Anesthesia for Infants and Children, 6.ª ed. Elsevier; cap. Pediatric Airway.</li>
          <li>Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — Pediatric Anesthesia / Airway Management.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// fórmulas y pasos de literatura de sociedad (APA/DAS-PIA 2015, APAGBI, NAP4)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// prepara tres tubos y pide ayuda antes; el niño no espera a que improvises"}
          <br />
          {"// si dudas entre oxigenar e intubar: oxigena"}
        </p>
        <Link href="/algoritmos" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más algoritmos
        </Link>
      </footer>
    </div>
  );
}
