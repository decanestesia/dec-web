import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Algoritmo de vía aérea — Intubación con paciente despierto (AFOI)
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: indicaciones, fármacos, dosis y umbrales
// tomados de literatura aceptada (DAS 2020, ASA DAA 2022, Miller,
// Stoelting, UpToDate). Cada dato lleva referencia (Vancouver breve).
// NO inventar dosis. Las dosis marcadas son obligatorias y exactas.
// ============================================================

export const metadata: Metadata = {
  title: "Intubación con paciente despierto (fibroóptica) — AFOI — DEC",
  description:
    "Algoritmo de intubación fibroóptica con paciente despierto (AFOI): indicaciones (vía aérea difícil anticipada, inestabilidad cervical, obstrucción, historia de VAD), preparación, antisialagogo (glicopirrolato 0.2 mg), sedación consciente titulada (dexmedetomidina, remifentanilo TCI, midazolam), anestesia tópica de vía aérea (lidocaína, dosis máx ~9 mg/kg; bloqueo del laríngeo superior y translaríngeo), técnica nasal/oral y confirmación. Guías DAS 2020.",
  openGraph: {
    title: "Intubación con paciente despierto (fibroóptica) — AFOI — DEC",
    description:
      "Indicaciones, preparación, antisialagogo, sedación consciente titulada, anestesia tópica de vía aérea y técnica fibroóptica. Guías DAS 2020.",
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

// Paso numerado del procedimiento
function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", margin: "0 0 0.85rem" }}>
      <span
        className="mono"
        style={{
          flexShrink: 0,
          width: "1.5rem",
          height: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid var(--border-hi)",
          color: "var(--accent)",
          fontSize: "0.7rem",
          fontWeight: 700,
        }}
      >
        {n}
      </span>
      <div style={{ color: "var(--text-1)", fontSize: "0.85rem", lineHeight: 1.65, paddingTop: "0.1rem" }}>
        {children}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Página (Server Component — referencia estática)
// ------------------------------------------------------------
export default function IntubacionDespiertoPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/algoritmos" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /algoritmos
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat intubacion-despierto.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Intubación con paciente despierto (fibroóptica)
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          AFOI · indicaciones · antisialagogo · sedación consciente · anestesia tópica · técnica FO · confirmación
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// el paciente respira, protege y colabora: no hay red de seguridad más barata que su propia glotis"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">ALGORITMO</span>
          <span className="tag tag-muted">DAS 2020</span>
          <span className="tag tag-muted">ASA DAA 2022</span>
          <span className="tag tag-muted">VÍA AÉREA</span>
        </div>
      </header>

      <Callout variant="info">
        La intubación fibroóptica con paciente despierto (<b>AFOI</b> — awake flexible optical
        intubation) mantiene la <b>ventilación espontánea, el tono de la vía aérea y los reflejos
        protectores</b> mientras se asegura la tráquea. Es la técnica de referencia ante vía aérea
        difícil <b>anticipada</b>: la anestesia general solo se induce{" "}
        <b>después de confirmar el tubo intratraqueal</b>. Requiere sedación mínima y consciente, y
        una anestesia tópica de la vía aérea meticulosa — la topicalización, no la sedación, es la
        que hace tolerable el procedimiento.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Indicaciones">
        <P>
          La AFOI se considera cuando se anticipa que la intubación y/o la ventilación con máscara
          tras la inducción serán difíciles o peligrosas, o cuando perder la ventilación espontánea
          es inaceptable. La decisión es un juicio de riesgo-beneficio: el objetivo es no quedar
          nunca en una situación &quot;no intubo, no oxigeno&quot; con el paciente ya apneico.
        </P>
        <Table
          headers={["Categoría", "Ejemplos"]}
          rows={[
            [
              "Vía aérea difícil anticipada",
              "Predictores de laringoscopia/ventilación difícil (Mallampati III–IV, apertura oral < 3 cm, distancia tiromentoniana < 6 cm, retrognatia, cuello corto/grueso, obesidad mórbida, SAOS)",
            ],
            [
              "Historia de VAD",
              "Intubación difícil o fallida documentada previamente; despertar tras intubación fallida bajo anestesia general",
            ],
            [
              "Inestabilidad / movilidad cervical limitada",
              "Fractura o inestabilidad de columna cervical, artritis reumatoide (subluxación atlantoaxial), espondilitis anquilosante, fijación/fusión cervical, halo",
            ],
            [
              "Obstrucción / patología de vía aérea",
              "Masa o tumor de vía aérea superior, estenosis, absceso, angioedema, radioterapia cervical previa, bocio con desviación traqueal",
            ],
            [
              "Riesgo de aspiración + vía aérea difícil",
              "Cuando además se prevé intubación difícil (mantener reflejos protectores hasta asegurar la vía)",
            ],
          ]}
        />
        <Src>
          Ahmad I, El-Boghdadly K, et al. DAS guidelines for awake tracheal intubation (ATI) in
          adults. Anaesthesia 2020;75(4):509-528. · Apfelbaum JL, et al. ASA Practice Guidelines for
          Management of the Difficult Airway. Anesthesiology 2022;136:31-81.
        </Src>
        <Callout variant="warn">
          La AFOI es <b>electiva y planificada</b>, no un rescate de emergencia. En obstrucción de
          vía aérea crítica o sangrado activo puede fallar (sangre y secreciones degradan la visión
          fibroóptica); tener siempre <b>plan B</b> definido (traqueostomía/cricotiroidotomía bajo
          anestesia local con el otorrino/cirujano disponible) antes de empezar.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Preparación (STOP: cuatro pilares DAS)">
        <P>
          Las guías DAS 2020 estructuran la técnica en cuatro pilares —{" "}
          <b>S</b>edación · <b>T</b>opicalización · <b>O</b>xigenación · <b>P</b>erformance
          (ejecución). La preparación previa asegura consentimiento, monitorización (ECG, SpO₂, TA,
          capnografía), acceso IV, aspiración, dos operadores cuando sea posible, y el equipo
          fibroóptico verificado (tubo cargado, antivaho, fuente de luz).
        </P>

        <Step n={1}>
          <b>Consentimiento y posición.</b> Explicar el procedimiento; posición sentada/semisentada
          (mejora tolerancia y permeabilidad, sobre todo en obstrucción y obesidad).
        </Step>
        <Step n={2}>
          <b>Monitorización + acceso IV + O₂.</b> Estándar ASA; oxígeno suplementario durante todo
          el procedimiento (ver §5).
        </Step>
        <Step n={3}>
          <b>Antisialagogo.</b> Un campo seco es prerrequisito para que la anestesia tópica funcione
          y la óptica no se empañe (ver §3).
        </Step>
        <Step n={4}>
          <b>Anestesia tópica de la vía aérea.</b> El paso que más determina el éxito y la
          tolerancia (ver §4). Dar tiempo a que actúe.
        </Step>
        <Step n={5}>
          <b>Sedación consciente titulada.</b> Opcional y mínima; objetivo paciente tranquilo,
          cooperador, que responde y respira (ver §6).
        </Step>
        <Step n={6}>
          <b>Fibroscopia, confirmación e inducción.</b> Solo tras confirmar el tubo intratraqueal se
          induce anestesia general (ver §7).
        </Step>

        <Src>Ahmad I, et al. DAS ATI guidelines. Anaesthesia 2020;75:509-528 (marco S-T-O-P).</Src>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Antisialagogo">
        <P>
          Las secreciones diluyen y arrastran el anestésico local (reduciendo su eficacia tópica) y
          empañan la lente del fibroscopio. Un antisialagogo administrado con antelación seca el
          campo. El <b>glicopirrolato</b> es el preferido: no atraviesa la barrera
          hematoencefálica (menos sedación/efectos centrales que la atropina) y produce
          antisialagogo potente.
        </P>
        <Table
          headers={["Fármaco", "Dosis", "Notas"]}
          accentCol={1}
          rows={[
            [
              "Glicopirrolato (preferido)",
              "0.2 mg IV",
              "Administrar ~15–30 min antes de topicalizar (idealmente IM/IV anticipado). No cruza BHE; antisialagogo potente. Precaución en taquiarritmia/cardiopatía isquémica.",
            ],
            [
              "Atropina (alternativa)",
              "0.4–0.6 mg IV",
              "Atraviesa BHE (posible sedación/confusión, taquicardia). Segunda línea.",
            ],
          ]}
        />
        <Src>
          Stoelting RK. Pharmacology &amp; Physiology in Anesthetic Practice — anticholinergics
          (glycopyrrolate). · Miller&apos;s Anesthesia — Awake intubation. · UpToDate: Flexible
          scope intubation techniques for the difficult airway in adults.
        </Src>
        <Callout variant="warn">
          Dosis fija clásica de glicopirrolato <b>0.2 mg IV</b>. Evitar en taquicardia significativa,
          isquemia miocárdica o glaucoma de ángulo cerrado. Da tiempo a que actúe: si se topicaliza
          sobre un campo húmedo, el bloqueo será deficiente.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Anestesia tópica de la vía aérea">
        <P>
          Es el determinante principal del confort y del éxito. Se anestesian de forma progresiva
          nariz/orofaringe, base de lengua/hipofaringe, y por debajo de las cuerdas (laringe y
          tráquea proximal). Puede combinarse aplicación tópica (atomizada, nebulizada, gargarismo,
          &quot;spray as you go&quot; por el canal del fibroscopio) con <b>bloqueos nerviosos</b>{" "}
          selectivos. La <b>lidocaína</b> es el anestésico local de elección por rápido inicio,
          margen y disponibilidad.
        </P>

        <Callout variant="danger">
          <b>Dosis máxima de lidocaína tópica en vía aérea ≈ 9 mg/kg</b> (peso corporal magro). La
          mucosa de la vía aérea absorbe rápido: sumar TODAS las fuentes (nebulizado + atomizado +
          gel + spray-as-you-go + bloqueos). Vigilar signos de toxicidad sistémica por anestésico
          local (LAST): mareo, acúfenos, sabor metálico, convulsiones, arritmia. Tener{" "}
          <b>emulsión lipídica 20%</b> disponible.
        </Callout>
        <Src>
          Ahmad I, et al. DAS ATI guidelines. Anaesthesia 2020;75:509-528 (máx. lidocaína ≈ 9 mg/kg
          en vía aérea). · Neal JM, et al. ASRA Checklist for LAST 2020. · Miller&apos;s Anesthesia.
        </Src>

        <Table
          headers={["Zona / técnica", "Agente y dosis", "Diana / notas"]}
          rows={[
            [
              "Nariz (vía nasal)",
              "Lidocaína 2% gel / cofenilcaína o lidocaína 5% + fenilefrina/oximetazolina",
              "Anestesia + vasoconstricción de mucosa nasal (reduce epistaxis). Elegir narina más permeable. La lidocaína del gel/spray nasal SUMA a la dosis total (≈9 mg/kg) — contabilizarla.",
            ],
            [
              "Orofaringe / base de lengua",
              "Lidocaína atomizada 4% (atomizador mucoso) o nebulizada 4% · o gargarismo/viscosa 2%",
              "Nebulización 4% (~4–6 mL) anestesia difusamente vía aérea superior antes de empezar. Lidocaína viscosa 2% para gargarismo/deglución.",
            ],
            [
              "Spray-as-you-go (SAYG)",
              "Lidocaína 1–2% en alícuotas por el canal de trabajo del fibroscopio",
              "Anestesia cuerdas y tráquea a la vista, justo antes de pasar. Contabilizar en la dosis total.",
            ],
            [
              "Bloqueo del n. laríngeo superior (rama interna)",
              "Lidocaína 1–2%, ~1–2 mL por lado",
              "Anestesia supraglotis/epiglotis hasta las cuerdas. Punto: bajo el asta mayor del hioides / membrana tirohioidea.",
            ],
            [
              "Bloqueo translaríngeo / transcricoideo (transtraqueal)",
              "Lidocaína 4%, ~2–4 mL a través de membrana cricotiroidea",
              "Anestesia infraglótica/tráquea; la tos dispersa el agente. Evitar si coagulopatía, anatomía no palpable o infección local.",
            ],
          ]}
        />
        <Src>
          Ahmad I, et al. DAS ATI guidelines. Anaesthesia 2020;75:509-528. · Miller&apos;s
          Anesthesia — Airway nerve blocks (superior laryngeal, transtracheal). · UpToDate: Airway
          topical anesthesia for awake intubation.
        </Src>
        <Callout variant="info">
          El <b>bloqueo transcricoideo/transtraqueal</b> es muy eficaz pero anestesia la tráquea
          (abole reflejos protectores infraglóticos) — sopesarlo si hay <b>alto riesgo de
          aspiración</b>. Muchos operadores logran topicalización adecuada solo con nebulizado +
          SAYG, evitando bloqueos invasivos.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Oxigenación durante el procedimiento">
        <P>
          Mantener oxígeno suplementario durante toda la AFOI reduce la desaturación y da margen. Las
          guías DAS 2020 recomiendan <b>oxigenación nasal de alto flujo o cánula nasal estándar</b>{" "}
          continuas durante el procedimiento, especialmente en la vía oral.
        </P>
        <Table
          headers={["Método", "Detalle"]}
          rows={[
            ["Cánula nasal estándar", "2–6 L/min; simple y eficaz, sobre todo en abordaje oral"],
            ["Oxigenación nasal de alto flujo (HFNO)", "Hasta ~70 L/min; prolonga el tiempo seguro de apnea y arrastra menos el tópico"],
            ["Insuflación por canal del fibroscopio", "O₂ por el canal de trabajo — cuidado: riesgo (raro) de barotrauma/insuflación gástrica; usar con juicio"],
          ]}
        />
        <Src>Ahmad I, et al. DAS ATI guidelines. Anaesthesia 2020;75:509-528 (pilar Oxigenación).</Src>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Sedación consciente titulada">
        <P>
          La sedación es <b>opcional y complementaria</b> — nunca sustituye a la topicalización. El
          objetivo es un paciente <b>tranquilo, cooperador, que mantiene ventilación espontánea y
          reflejos, y responde a la voz</b> (sedación mínima/consciente). El error clásico es
          sobre-sedar para compensar una anestesia tópica deficiente: convierte la vía aérea difícil
          despierta en una vía aérea difícil apneica. Titular siempre a efecto.
        </P>
        <Table
          headers={["Fármaco", "Dosis", "Ventaja / precaución"]}
          accentCol={1}
          rows={[
            [
              "Dexmedetomidina (preferida en muchos centros)",
              "Carga 1 mcg/kg IV en 10 min, luego infusión 0.3–0.7 mcg/kg/h",
              "Sedación cooperativa, escasa depresión respiratoria, cierto antisialagogo. Precaución: bradicardia e hipotensión (considerar omitir el bolo o reducirlo en cardiópatas). Titular.",
            ],
            [
              "Remifentanilo (TCI o infusión)",
              "TCI efecto-sitio ~0.5–2 ng/mL (iniciar en el extremo bajo y titular a ventilación espontánea) · alternativa infusión 0.05–0.1 mcg/kg/min",
              "Suprime tos y reflejo nauseoso; inicio/offset rápidos. Precaución: depresión respiratoria dosis-dependiente (concentraciones altas ~3 ng/mL pueden producir apnea en no-tolerantes), rigidez torácica con bolos. Titular a ventilación espontánea.",
            ],
            [
              "Midazolam (dosis baja, ± coadyuvante)",
              "0.5–2 mg IV titulado (ancianos: mínimo)",
              "Ansiólisis y amnesia. Precaución: sinergia depresora con opioides; sobredosis fácil. Tener flumazenilo disponible.",
            ],
          ]}
        />
        <Src>
          Ahmad I, et al. DAS ATI guidelines. Anaesthesia 2020;75:509-528. · UpToDate: Flexible
          scope intubation — sedation for awake intubation. · Miller&apos;s Anesthesia — Awake
          intubation (dexmedetomidine, remifentanil TCI).
        </Src>
        <Callout variant="danger">
          <b>Regla de oro:</b> nunca abolir la ventilación espontánea ni la capacidad de respuesta
          verbal. Un solo operador dedicado a la sedación, distinto del que maneja el fibroscopio.
          Antagonistas disponibles (<b>naloxona</b> para opioides de acción prolongada,{" "}
          <b>flumazenilo</b> para benzodiacepinas); con <b>remifentanilo</b> el offset rápido
          (~3–5 min) hace que la primera medida ante depresión respiratoria sea <b>suspender la
          infusión y ventilar</b>, no naloxona. Monitorización con capnografía continua.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Técnica fibroóptica, confirmación e inducción">
        <P>
          Con campo seco, vía aérea topicalizada y sedación mínima, se avanza el fibroscopio (con el
          tubo precargado) por la ruta elegida hasta la tráquea, se desliza el tubo sobre el
          fibroscopio, se <b>confirma</b> la posición y solo entonces se induce anestesia general.
        </P>

        <Table
          headers={["Ruta", "Consideraciones"]}
          rows={[
            [
              "Nasal",
              "Suele dar el ángulo más directo a la glotis; mejor tolerada; usar la narina más permeable con vasoconstrictor. Evitar en coagulopatía, fractura de base de cráneo o fístula LCR.",
            ],
            [
              "Oral",
              "Con cánula/guía intubadora oral (Ovassapian/Berman) que centra el fibroscopio y protege de mordida. Preferida si contraindicación nasal.",
            ],
          ]}
        />

        <Step n={1}>
          <b>Avance del fibroscopio.</b> Identificar epiglotis → cuerdas → anillos traqueales →
          carina. Aplicar SAYG sobre cuerdas/tráquea si aún reactivas.
        </Step>
        <Step n={2}>
          <b>Deslizar el tubo.</b> Sobre el fibroscopio hasta la tráquea; si engancha en el aritenoides
          derecho, retirar un poco y rotar 90° antihorario. Usar tubo de menor calibre y punta blanda
          si es difícil.
        </Step>
        <Step n={3}>
          <b>Confirmar posición intratraqueal.</b> Ver anillos traqueales y carina por el fibroscopio{" "}
          <b>+ capnografía sostenida</b> (la confirmación definitiva). Retirar el fibroscopio
          visualizando que la punta del tubo queda sobre la carina.
        </Step>
        <Step n={4}>
          <b>Inducir anestesia general.</b> Solo <b>después</b> de confirmar el tubo. Inflar
          neumotaponamiento, fijar, verificar de nuevo con capnografía y auscultación.
        </Step>

        <Callout variant="danger">
          <b>No inducir hasta confirmar.</b> La capnografía con curva sostenida es la prueba
          definitiva de posición intratraqueal — la visión endoscópica sola puede engañar. Si en
          cualquier momento se pierde la vía o el paciente se deteriora, el paciente aún respira
          espontáneamente: ese es exactamente el margen de seguridad que justifica la AFOI.
        </Callout>
        <Src>
          Ahmad I, et al. DAS ATI guidelines. Anaesthesia 2020;75:509-528 (confirmación + inducción
          solo tras verificar). · Apfelbaum JL, et al. ASA Difficult Airway Guidelines.
          Anesthesiology 2022;136:31-81.
        </Src>
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Resumen de dosis clave">
        <Table
          headers={["Fármaco / parámetro", "Dosis / valor", "Fuente"]}
          accentCol={1}
          rows={[
            ["Glicopirrolato (antisialagogo)", "0.2 mg IV", "Stoelting · Miller"],
            ["Lidocaína tópica vía aérea — MÁX", "≈ 9 mg/kg", "DAS 2020"],
            ["Dexmedetomidina — carga", "1 mcg/kg IV en 10 min", "DAS 2020 · UpToDate"],
            ["Dexmedetomidina — mantenimiento", "0.3–0.7 mcg/kg/h", "DAS 2020 · UpToDate"],
            ["Remifentanilo — TCI (efecto-sitio)", "~0.5–2 ng/mL, iniciar bajo y titular", "Miller · UpToDate"],
            ["Midazolam (coadyuvante, dosis baja)", "0.5–2 mg IV titulado", "UpToDate"],
            ["Bloqueo n. laríngeo superior", "Lidocaína 1–2%, 1–2 mL/lado", "Miller"],
            ["Bloqueo transcricoideo/translaríngeo", "Lidocaína 4%, 2–4 mL", "Miller"],
            ["Confirmación de posición", "Capnografía sostenida", "ASA 2022 · DAS 2020"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="09" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Ahmad I, El-Boghdadly K, Bhagrath R, et al. Difficult Airway Society guidelines for awake tracheal intubation (ATI) in adults. Anaesthesia 2020;75(4):509-528.</li>
          <li>Apfelbaum JL, Hagberg CA, Connis RT, et al. 2022 American Society of Anesthesiologists Practice Guidelines for Management of the Difficult Airway. Anesthesiology 2022;136(1):31-81.</li>
          <li>Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — Airway Management in the Adult (awake intubation; airway nerve blocks).</li>
          <li>Flockton E, Stoelting RK. Pharmacology &amp; Physiology in Anesthetic Practice — Anticholinergic drugs (glycopyrrolate); Local anesthetics (lidocaine).</li>
          <li>Neal JM, Barrington MJ, Fettiplace MR, et al. The Third American Society of Regional Anesthesia and Pain Medicine (ASRA) Practice Advisory on Local Anesthetic Systemic Toxicity. Reg Anesth Pain Med 2018;43(2):113-123. · ASRA LAST Checklist 2020.</li>
          <li>UpToDate. Flexible scope intubation techniques for the difficult airway in adults; Airway topical anesthesia; Sedation for awake intubation.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y umbrales de literatura aceptada (DAS 2020, ASA 2022, Miller, Stoelting, UpToDate)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// máx. lidocaína tópica ≈ 9 mg/kg: suma TODAS las fuentes; ten emulsión lipídica a mano"}
          <br />
          {"// la sedación asiste; la topicalización trabaja. Sedar de más apaga la única red que tenías"}
        </p>
        <Link href="/algoritmos" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más algoritmos
        </Link>
      </footer>
    </div>
  );
}
