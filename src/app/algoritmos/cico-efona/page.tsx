import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Algoritmo de vía aérea — CICO / eFONA (cricotiroidotomía)
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: técnica, calibres y pasos tomados de guías de
// sociedad. Cada tabla/callout cita su fuente (Vancouver breve).
// NO inventar dosis, calibres ni pasos.
// Fuentes primarias:
//  - Frerk C, Mitchell VS, McNarry AF, et al. Difficult Airway Society
//    2015 guidelines for management of unanticipated difficult
//    intubation in adults. Br J Anaesth 2015;115(6):827-848.
//  - Apfelbaum JL, et al. 2022 ASA Practice Guidelines for Management
//    of the Difficult Airway. Anesthesiology 2022;136(1):31-81.
//  - Black AE, Flynn PER, Smith HL, et al. Development of a guideline for
//    the management of the unanticipated difficult airway in paediatric
//    practice. Paediatr Anaesth 2015;25(4):346-362.
// ============================================================

export const metadata: Metadata = {
  title: "CICO / eFONA — cricotiroidotomía · Algoritmo de vía aérea · DEC",
  description:
    "Algoritmo Can't Intubate Can't Oxygenate (CICO) y acceso frontal del cuello de emergencia (eFONA): cricotiroidotomía quirúrgica bisturí-bougie-tubo (DAS 2015), membrana cricotiroidea, laryngeal handshake, técnica según palpabilidad, cánula vs quirúrgica, manejo pediátrico y cuidado post-CICO. Guías DAS 2015 y ASA 2022.",
  openGraph: {
    title: "CICO / eFONA — cricotiroidotomía · DEC",
    description:
      "Acceso frontal del cuello de emergencia: cricotiroidotomía scalpel-bougie-tube (DAS 2015), técnica según palpabilidad de la membrana, cánula vs quirúrgica, pediátrico y post-CICO.",
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

// Paso numerado grande para la secuencia scalpel-bougie-tube
function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="panel"
      style={{ marginBottom: "0.85rem", borderLeft: "3px solid var(--accent)" }}
    >
      <div className="panel-body" style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
        <span
          className="mono"
          style={{
            color: "var(--accent)",
            fontSize: "1rem",
            fontWeight: 700,
            flexShrink: 0,
            minWidth: "1.4rem",
          }}
        >
          {n}
        </span>
        <div>
          <div style={{ color: "var(--text-0)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>
            {title}
          </div>
          <div style={{ color: "var(--text-1)", fontSize: "0.8rem", lineHeight: 1.65 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Página (Server Component — referencia estática)
// ------------------------------------------------------------
export default function CicoEfonaPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/farmacos" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /farmacos
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat cico-efona.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          CICO / eFONA — cricotiroidotomía
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          can&apos;t intubate can&apos;t oxygenate · acceso frontal del cuello de emergencia · scalpel-bougie-tube
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// el plan D no se improvisa: se declara en voz alta, se ejecuta y no se abandona"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">ALGORITMO</span>
          <span className="tag tag-muted">DAS 2015</span>
          <span className="tag tag-muted">ASA 2022</span>
          <span className="tag tag-muted">EMERGENCIA</span>
        </div>
      </header>

      <Callout variant="danger">
        <b>CICO = emergencia vital.</b> Cuando fracasan intubación, mascarilla facial y dispositivo
        supraglótico, y el paciente no se puede oxigenar, la conducta es{" "}
        <b>acceso frontal del cuello (FONA) inmediato</b> — no un intento más de laringoscopia. El
        retraso en declarar el CICO y pasar al cuello es la causa evitable de daño hipóxico y muerte.
        Declara &quot;esto es un CICO&quot; en voz alta y actúa.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Definición y disparador (¿cuándo hago FONA?)">
        <P>
          <b>CICO</b> (Can&apos;t Intubate, Can&apos;t Oxygenate) es la vía sin salida del algoritmo
          de vía aérea difícil no anticipada: han fallado la intubación traqueal, la ventilación con
          mascarilla facial y el dispositivo supraglótico, y persiste hipoxemia. Es el{" "}
          <b>Plan D</b> del algoritmo DAS 2015. La respuesta es <b>eFONA</b> (emergency Front Of
          Neck Access): abrir la vía aérea por delante del cuello a través de la membrana
          cricotiroidea.
        </P>
        <Table
          headers={["Plan (DAS 2015)", "Contenido", "Salida"]}
          rows={[
            ["A · Intubación", "Laringoscopia / videolaringoscopia; máx. 3 (+1 experto) intentos", "Éxito → seguir · Fallo → Plan B"],
            ["B · SGA", "Dispositivo supraglótico de 2.ª generación; máx. 3 intentos", "Oxigena → parar y pensar · Fallo → Plan C"],
            ["C · Mascarilla facial", "Ventilación con máscara ± cánulas, 2 personas, relajación plena", "Oxigena → despertar · Fallo → Plan D"],
            ["D · eFONA", "Declarar CICO → acceso frontal del cuello inmediato", "Cricotiroidotomía scalpel-bougie-tube"],
          ]}
        />
        <Src>Frerk C, et al. DAS 2015. Br J Anaesth 2015;115(6):827-848.</Src>
        <Callout variant="warn">
          El disparador del CICO es la <b>oxigenación fallida</b>, no la intubación fallida. &quot;No
          intubo pero oxigeno&quot; NO es un CICO: se puede despertar o buscar plan alterno. &quot;No
          intubo y no oxigeno&quot; (SpO₂ en caída pese a máscara + SGA con relajación completa) SÍ
          lo es → cuello ya.
        </Callout>
        <Callout variant="info">
          Antes de cortar, <b>asegura relajación neuromuscular completa</b> (dosis plena de
          bloqueante): un laringoespasmo o esfuerzo del paciente puede simular un CICO y la relajación
          plena a veces reabre la vía. Pero no retrases el FONA esperando: si ya está relajado y no
          oxigena, corta.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Técnica de elección: cricotiroidotomía quirúrgica (scalpel-bougie-tube)">
        <P>
          La DAS 2015 recomienda como técnica de elección la{" "}
          <b>cricotiroidotomía quirúrgica bisturí-bougie-tubo</b> por su fiabilidad y por usar
          material simple, siempre disponible y de dominio universal. Equipo mínimo:{" "}
          <b>bisturí con hoja nº 10</b> (hoja ancha), <b>bougie</b> (guía elástica) y{" "}
          <b>tubo endotraqueal con balón de 6.0 mm DI</b>.
        </P>
        <Table
          headers={["Material", "Especificación", "Función"]}
          accentCol={1}
          rows={[
            ["Bisturí", "Hoja nº 10 (mango ancho)", "Incisión de piel y de la membrana cricotiroidea"],
            ["Bougie", "Guía elástica (bougie de intubación)", "Guiar el tubo a la tráquea a través del estoma"],
            ["Tubo", "TET con balón, 6.0 mm DI", "Vía aérea definitiva con balón para ventilar/proteger"],
          ]}
        />
        <Src>Frerk C, et al. DAS 2015. Br J Anaesth 2015;115(6):827-848 (scalpel-bougie-tube, hoja nº 10, tubo 6.0).</Src>

        <div style={{ marginTop: "1.25rem" }}>
          <Step n="1" title="Identificar la membrana cricotiroidea — laryngeal handshake">
            Palpa la laringe con el pulgar e índice de una mano (&quot;apretón laríngeo&quot;/laryngeal
            handshake): estabiliza y desliza para localizar hueso hioides, cartílago tiroides y
            cartílago cricoides. La <b>membrana cricotiroidea</b> es la depresión blanda entre el
            borde inferior del tiroides y el cricoides. Mantén la mano no dominante sujetando la
            laringe en todo momento.
          </Step>
          <Step n="2" title="Incisión">
            Con la laringe estabilizada, incide con el bisturí nº 10 sobre la membrana. La técnica de
            la incisión depende de si <b>palpas o no</b> la membrana (ver paso 3).
          </Step>
          <Step n="3" title="Técnica según palpabilidad">
            <b>Membrana palpable:</b> incisión <b>transversa</b> única a través de piel y membrana en
            un solo gesto. <b>Membrana NO palpable</b> (cuello grueso, obeso, anatomía distorsionada):
            incisión <b>vertical de 8–10 cm</b> en la línea media, luego disección roma con los dedos
            para exponer la laringe, palpar la membrana y practicar la incisión <b>horizontal</b>{" "}
            sobre ella.
          </Step>
          <Step n="4" title="Bougie">
            Gira el bisturí 90° para mantener abierto el estoma (o inserta el mango/dedo). Desliza el{" "}
            <b>bougie</b> a través de la membrana hacia la tráquea, dirigido caudalmente. Sensación de
            &quot;clicks&quot; traqueales o tope confirman posición traqueal.
          </Step>
          <Step n="5" title="Tubo">
            Pasa el <b>tubo con balón 6.0 mm DI</b> sobre el bougie (técnica de Seldinger con guía
            sólida) hasta la tráquea. Retira el bougie. Infla el balón.
          </Step>
          <Step n="6" title="Confirmar — capnografía">
            Ventila y <b>confirma con capnografía (EtCO₂)</b>: es el estándar de confirmación.
            Asegura el tubo, ausculta y continúa oxigenando. Trazado de CO₂ sostenido = vía aérea en
            tráquea.
          </Step>
        </div>

        <Callout variant="danger">
          <b>No abandonar la técnica a mitad.</b> Una vez declarado el CICO, la secuencia
          scalpel-bougie-tube se completa. Cambiar de técnica o de operador a medio camino pierde el
          plano quirúrgico y el tiempo del que no dispone el paciente.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Cánula vs. quirúrgica">
        <P>
          Existen dos abordajes del FONA: la técnica de <b>cánula</b> (aguja/catéter transtraqueal
          con oxigenación a chorro o dispositivo de baja presión) y la <b>quirúrgica</b> (bisturí). La
          DAS 2015 pasó a recomendar la <b>quirúrgica como técnica de elección en el adulto</b> por
          las altas tasas de fallo y de complicaciones (barotrauma) de las técnicas de cánula en
          manos no expertas y con material improvisado.
        </P>
        <Table
          headers={["Aspecto", "Cánula (aguja/catéter)", "Quirúrgica (bisturí)"]}
          rows={[
            ["Acceso", "Catéter transtraqueal a través de la membrana", "Incisión con bisturí nº 10 + bougie + tubo 6.0"],
            ["Oxigenación", "Requiere fuente de alta presión / jet dedicada", "Ventilación convencional por el tubo con balón"],
            ["Fiabilidad (adulto)", "Menor; alta tasa de fallo y de mal posicionamiento", "Mayor; técnica de elección DAS 2015 en adulto"],
            ["Riesgo principal", "Barotrauma / enfisema si no hay salida espiratoria", "Sangrado, vía falsa; menor riesgo de barotrauma"],
            ["Vía definitiva", "Puente temporal; suele requerir conversión", "Vía aérea definitiva (tubo con balón)"],
          ]}
        />
        <Src>Frerk C, et al. DAS 2015. Br J Anaesth 2015;115(6):827-848. · Apfelbaum JL, et al. ASA 2022. Anesthesiology 2022;136(1):31-81.</Src>
        <Callout variant="warn">
          Con técnica de <b>cánula</b>, la oxigenación a chorro exige una <b>vía espiratoria
          permeable</b> (glotis o segunda cánula). Si la vía superior está totalmente obstruida, el
          gas entra y no sale → <b>barotrauma, neumotórax y enfisema masivo</b>. Es una de las
          razones del cambio a técnica quirúrgica.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Pediátrico (< 8–10 años)">
        <P>
          En niños pequeños la laringe es alta, blanda y la membrana cricotiroidea es{" "}
          <b>muy pequeña o no identificable</b>, y el cartílago cricoides es la parte más estrecha de
          la vía aérea. Por ello la cricotiroidotomía quirúrgica del adulto <b>no</b> se traslada
          directamente. En el niño (orientativamente <b>&lt; 8–10 años</b>) el abordaje de rescate
          preferente es la <b>cánula/aguja con oxigenación</b>, no la incisión quirúrgica de entrada.
        </P>
        <Table
          headers={["Aspecto", "Conducta pediátrica"]}
          rows={[
            ["Técnica primaria", "Cánula/aguja transtraqueal (cricotiroidotomía por punción) + oxigenación"],
            ["Oxigenación", "Fuente de baja presión regulada; alto riesgo de barotrauma con jet → extrema precaución"],
            ["Anatomía", "Membrana cricotiroidea diminuta/ausente; cricoides = zona más estrecha; laringe anterior y alta"],
            ["Vía espiratoria", "Debe existir salida espiratoria (glotis) para evitar atrapamiento aéreo / barotrauma"],
            ["Definitivo", "Puente hacia vía aérea definitiva por operador experto (ORL / traqueostomía)"],
          ]}
        />
        <Src>Black AE, et al. APAGBI Paediatric Difficult Airway Guidelines. Paediatr Anaesth 2015;25(4):346-362.</Src>
        <Callout variant="warn">
          El umbral de edad (<b>&lt; 8–10 años</b>) es orientativo: prima el tamaño y la anatomía
          palpable del cuello, no la fecha de nacimiento. En adolescentes con anatomía de adulto y
          membrana palpable puede aplicarse la técnica quirúrgica. Ante la duda en el niño pequeño,
          <b>cánula + oxigenación</b> y llamada urgente a operador experto.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Cuidado post-CICO">
        <P>
          Restaurada la oxigenación, el episodio no termina: una vía aérea de emergencia por el cuello
          es inestable, puede estar mal posicionada y no protege necesariamente contra aspiración a
          largo plazo. El manejo post-CICO es tan importante como el rescate.
        </P>
        <Table
          headers={["Dominio", "Acción"]}
          rows={[
            ["Confirmar y fijar", "EtCO₂ continuo, auscultación, fijación segura del tubo; evitar decanulación accidental"],
            ["Vía definitiva", "Revisar/convertir a vía aérea definitiva por experto (ORL/cirugía): traqueostomía formal o intubación guiada"],
            ["Imagen / lesiones", "Descartar vía falsa, enfisema, neumotórax, sangrado; radiografía/valoración según cuadro"],
            ["Documentar", "Registro del evento de vía aérea difícil; alerta al paciente y ficha (carta/brazalete de vía aérea difícil)"],
            ["Comunicar / notificar", "Informar al paciente y equipo; considerar registro nacional de vía aérea difícil; debrief del equipo"],
            ["Cuidados generales", "UCI/monitorización, analgesia/sedación, control de complicaciones (infección, estenosis tardía)"],
          ]}
        />
        <Src>Frerk C, et al. DAS 2015. Br J Anaesth 2015;115(6):827-848. · Apfelbaum JL, et al. ASA 2022. Anesthesiology 2022;136(1):31-81.</Src>
        <Callout variant="ok">
          <b>Debrief obligatorio.</b> Todo CICO es un evento crítico: documenta, avisa al paciente,
          emite alerta de vía aérea difícil y haz debriefing del equipo. El siguiente anestesiólogo
          que reciba a ese paciente necesita saberlo antes de inducir.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Resumen operativo">
        <Table
          headers={["Ítem", "Valor", "Fuente"]}
          accentCol={1}
          rows={[
            ["Disparador CICO", "Fallo de intubación + máscara + SGA con hipoxemia", "DAS 2015"],
            ["Técnica de elección (adulto)", "Cricotiroidotomía quirúrgica scalpel-bougie-tube", "DAS 2015"],
            ["Hoja de bisturí", "Nº 10 (ancha)", "DAS 2015"],
            ["Guía", "Bougie", "DAS 2015"],
            ["Tubo", "TET con balón, 6.0 mm DI", "DAS 2015"],
            ["Membrana palpable", "Incisión transversa única", "DAS 2015"],
            ["Membrana no palpable", "Incisión vertical 8–10 cm → horizontal sobre membrana", "DAS 2015"],
            ["Confirmación", "Capnografía (EtCO₂)", "DAS 2015 / ASA 2022"],
            ["Localización", "Laryngeal handshake (apretón laríngeo)", "DAS 2015"],
            ["Pediátrico (< 8–10 a)", "Cánula/aguja + oxigenación (no quirúrgica de entrada)", "APAGBI 2015"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Frerk C, Mitchell VS, McNarry AF, Mendonca C, Bhagrath R, Patel A, et al. Difficult Airway Society 2015 guidelines for management of unanticipated difficult intubation in adults. Br J Anaesth 2015;115(6):827-848.</li>
          <li>Apfelbaum JL, Hagberg CA, Connis RT, et al. 2022 American Society of Anesthesiologists Practice Guidelines for Management of the Difficult Airway. Anesthesiology 2022;136(1):31-81.</li>
          <li>Black AE, Flynn PER, Smith HL, Thomas ML, Wilkinson KA; APAGBI. Development of a guideline for the management of the unanticipated difficult airway in paediatric practice. Paediatr Anaesth 2015;25(4):346-362.</li>
          <li>Duggan LV, Ballantyne Scott B, Law JA, et al. Transtracheal jet ventilation in the &apos;can&apos;t intubate can&apos;t oxygenate&apos; emergency: a systematic review. Br J Anaesth 2016;117(Suppl 1):i28-i38.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// técnica y calibres de literatura aceptada (DAS 2015, ASA 2022, APAGBI 2015)"}
          <br />
          {"// referencia educativa — no sustituye entrenamiento práctico, juicio clínico ni protocolo institucional"}
          <br />
          {"// el CICO no se lee, se entrena: el día que lo declares no habrá tiempo de abrir esta página"}
          <br />
          {"// dudar entre cortar y no cortar cuando ya no oxigena es la única decisión que aquí mata"}
        </p>
        <Link href="/farmacos" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← catálogo de fármacos
        </Link>
      </footer>
    </div>
  );
}
