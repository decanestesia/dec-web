import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — PACIENTE CON MARCAPASOS / DAI PERIOPERATORIO
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: conducta, umbrales y modos tomados del
// consenso HRS/ASA sobre dispositivos electrónicos cardiacos
// implantables (DECI/CIED) en el perioperatorio. Cada tabla/callout
// cita su fuente (Vancouver breve). NO inventar datos.
// Fuentes primarias:
//  - American Society of Anesthesiologists. Practice Advisory for the
//    Perioperative Management of Patients with Cardiac Implantable
//    Electronic Devices: Pacemakers and Implantable Cardioverter-
//    Defibrillators 2020. Anesthesiology 2020;132(2):225-252.
//  - Crossley GH, Poole JE, Rozner MA, et al. The Heart Rhythm
//    Society (HRS)/ASA Expert Consensus Statement on the Perioperative
//    Management of Patients with Implantable Defibrillators, Pacemakers
//    and Arrhythmia Monitors. Heart Rhythm 2011;8(7):1114-1154.
//  - Miller's Anesthesia, 9.ª ed. — Anesthesia for Patients with CIEDs.
// ============================================================

export const metadata: Metadata = {
  title: "Paciente con marcapasos / DAI perioperatorio — Guía clínica · DEC",
  description:
    "Referencia perioperatoria de dispositivos electrónicos cardiacos implantables (DECI): interrogación previa, identificación de dependencia de marcapasos, marcapasos vs DAI, interferencia electromagnética del electrobisturí (bipolar, ráfagas cortas, placa lejos), uso del imán (suspende choques del DAI mientras esté puesto, NO cambia el modo de estimulación; en marcapasos dependiente induce modo asíncrono VOO/DOO), reprogramación, monitor/desfibrilador externo y reinterrogación postoperatoria. Consenso HRS/ASA.",
  openGraph: {
    title: "Paciente con marcapasos / DAI perioperatorio — Guía clínica · DEC",
    description:
      "Interrogación previa, dependencia de marcapasos, MP vs DAI, interferencia del electrobisturí, uso del imán, reprogramación y reinterrogación postop. Consenso HRS/ASA.",
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
export default function MarcapasosDaiPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat paciente-marcapasos-dai.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Paciente con marcapasos / DAI perioperatorio
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          interrogación previa · dependencia · MP vs DAI · electrobisturí · imán · reprogramación · reinterrogación
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// el electrobisturí no distingue entre tejido y firmware: tú sí tienes que hacerlo"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">REFERENCIA</span>
          <span className="tag tag-muted">HRS/ASA 2011</span>
          <span className="tag tag-muted">ASA 2020</span>
          <span className="tag tag-muted">Miller</span>
        </div>
      </header>

      <Callout variant="info">
        <b>Dispositivos electrónicos cardiacos implantables (DECI / CIED).</b> Dos familias con manejo
        perioperatorio distinto: el <b>marcapasos (MP)</b>, cuya función es <b>estimular</b>, y el{" "}
        <b>desfibrilador automático implantable (DAI)</b>, que además <b>detecta y trata taquiarritmias</b>
        {" "}(y que casi siempre incorpora función de marcapasos). El riesgo perioperatorio central es la{" "}
        <b>interferencia electromagnética (IEM)</b>, dominada por el <b>electrobisturí</b>. La conducta
        depende de <b>tipo de dispositivo</b> y <b>dependencia de marcapasos</b>.
      </Callout>
      <Src>Crossley GH, et al. HRS/ASA Expert Consensus. Heart Rhythm 2011;8(7):1114-1154.</Src>

      {/* ========================================================= */}
      <Section n="01" title="Evaluación e interrogación preoperatoria">
        <P>
          Todo paciente con DECI debe tener una <b>interrogación preoperatoria</b> del dispositivo
          (idealmente en las últimas semanas; HRS/ASA sugiere ≤ 12 meses para MP y ≤ 6 meses para DAI, o
          más reciente si el procedimiento es de alto riesgo de IEM). El objetivo es responder cuatro
          preguntas: <b>qué es</b> (MP vs DAI, fabricante), <b>si el paciente es dependiente</b>,{" "}
          <b>estado de la batería/electrodos</b> y <b>cómo responderá al imán</b>.
        </P>
        <Table
          headers={["Dato a obtener", "Por qué importa"]}
          rows={[
            ["Tipo de dispositivo (MP vs DAI) y fabricante", "Determina la conducta: el DAI necesita desactivar terapias de choque; el MP no."],
            ["¿Dependiente de marcapasos?", "Si lo es, la IEM que inhiba la estimulación puede causar asistolia → necesita modo asíncrono."],
            ["Modo e indicación programados", "Guía la reprogramación y la interpretación del ritmo intraoperatorio."],
            ["Batería / longevidad de electrodos", "Un dispositivo a fin de vida útil no debe entrar a IEM sin resolverse antes."],
            ["Respuesta al imán del dispositivo concreto", "El comportamiento con imán varía por fabricante y programación; confirmarlo."],
            ["Última interrogación / telemetría", "Documenta funcionamiento basal para comparar postoperatorio."],
          ]}
        />
        <Src>
          Crossley GH, et al. HRS/ASA. Heart Rhythm 2011;8(7):1114-1154. · ASA Practice Advisory.
          Anesthesiology 2020;132(2):225-252.
        </Src>
        <Callout variant="warn">
          <b>Identificar la dependencia de marcapasos es prioritario.</b> Se considera dependiente al
          paciente sin ritmo de escape propio adecuado (p. ej. antecedente de ablación del nodo AV,
          bloqueo AV completo, o ausencia de ritmo intrínseco al programar por debajo de la frecuencia
          de estimulación). En el dependiente, cualquier <b>sobredetección de IEM que inhiba el MP</b>{" "}
          puede provocar <b>bradicardia grave o asistolia</b>.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Marcapasos (MP) vs DAI — diferencia clave">
        <P>
          El manejo perioperatorio se separa según qué hace el dispositivo. El error conceptual más
          peligroso es tratar a ambos igual: el DAI puede <b>malinterpretar la IEM como una
          taquiarritmia y descargar un choque inapropiado</b> en pleno acto quirúrgico, mientras que en
          el MP el riesgo es la <b>inhibición</b> de la estimulación.
        </P>
        <Table
          headers={["Función", "Marcapasos (MP)", "DAI"]}
          accentCol={0}
          rows={[
            ["Rol principal", "Estimular (evitar bradicardia)", "Detectar y tratar taquiarritmias (choque/ATP); casi siempre estimula también"],
            ["Riesgo por IEM", "Inhibición de la estimulación → bradicardia/asistolia si es dependiente", "Sobredetección → choque inapropiado + inhibición de estimulación si es dependiente"],
            ["Efecto del imán", "Estimulación asíncrona (VOO/DOO) a frecuencia fija del imán", "Suspende las terapias de choque mientras el imán esté puesto; NO cambia el modo de estimulación"],
            ["Antes de cirugía con IEM", "Considerar modo asíncrono si dependiente + IEM cercana", "Desactivar terapias de choque (imán o reprogramación)"],
          ]}
        />
        <Src>Crossley GH, et al. HRS/ASA. Heart Rhythm 2011;8(7):1114-1154.</Src>
        <Callout variant="danger">
          <b>No confundir las dos funciones del imán.</b> Sobre un <b>DAI</b>, el imán{" "}
          <b>suspende las terapias antitaquicardia</b> pero <b>NO modifica la estimulación</b>: un
          paciente con DAI que además es dependiente de marcapasos <b>seguirá inhibiéndose</b> con la
          IEM aunque el imán esté puesto. Sobre un <b>MP</b>, el imán <b>sí</b> lo pone en modo
          asíncrono. Por eso el DAI del paciente dependiente suele requerir <b>reprogramación</b>, no
          solo imán.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Interferencia electromagnética del electrobisturí">
        <P>
          El <b>electrobisturí (electrocauterio)</b> es la fuente de IEM más frecuente en quirófano. La
          medida más eficaz es <b>reducir la energía que alcanza el dispositivo y sus electrodos</b>. La
          IEM puede: (1) inhibir la estimulación del MP, (2) ser malinterpretada por el DAI como
          taquiarritmia (choque inapropiado), (3) causar reprogramación transitoria o daño.
        </P>
        <Table
          headers={["Medida", "Fundamento"]}
          accentCol={0}
          rows={[
            ["Preferir bisturí BIPOLAR", "La corriente se limita entre las dos puntas de la pinza; muy poca IEM alcanza el dispositivo."],
            ["Si es monopolar: ráfagas cortas", "Ráfagas breves e intermitentes (< ~5 s) con pausas evitan inhibición sostenida y dan tiempo al escape."],
            ["Placa (electrodo de retorno) LEJOS del generador", "Colocarla de modo que el vector corriente activa→placa NO cruce el generador ni los electrodos."],
            ["Menor potencia posible", "Reduce la energía radiada hacia el sistema del dispositivo."],
            ["Bisturí ≥ 15 cm del generador", "Alejar la punta activa del generador/electrodos disminuye la IEM captada."],
            ["Evitar 'coagulación' prolongada cerca del bolsillo", "El corte cerca del generador es la situación de mayor IEM; minimizarlo."],
          ]}
        />
        <Src>
          Crossley GH, et al. HRS/ASA. Heart Rhythm 2011;8(7):1114-1154. · ASA Practice Advisory.
          Anesthesiology 2020;132(2):225-252.
        </Src>
        <Callout variant="warn">
          <b>Regla del vector.</b> Con monopolar, situar la <b>placa de retorno</b> de forma que la
          línea imaginaria entre el punto de corte y la placa <b>no atraviese</b> el generador ni los
          electrodos intracardiacos. En cirugía por debajo del ombligo el riesgo de IEM sobre un
          dispositivo torácico es bajo; por encima del ombligo (tórax, cabeza-cuello, mama) el riesgo es
          alto y exige más precauciones.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="El imán — qué hace y qué NO hace">
        <P>
          El imán es la herramienta intraoperatoria de rescate, pero su efecto <b>depende del tipo de
          dispositivo</b>. Aplicar un imán sin saber si es MP o DAI es un error. Su efecto dura{" "}
          <b>solo mientras esté físicamente colocado</b> sobre el generador; al retirarlo, el
          dispositivo vuelve a su programación.
        </P>
        <Table
          headers={["Dispositivo", "Efecto del imán", "Qué NO hace"]}
          accentCol={1}
          rows={[
            [
              "DAI",
              "Suspende las terapias de choque/ATP mientras el imán esté puesto.",
              "NO cambia el modo ni la frecuencia de estimulación; el paciente dependiente sigue expuesto a inhibición por IEM.",
            ],
            [
              "Marcapasos (MP)",
              "Estimulación ASÍNCRONA (VOO / DOO) a la frecuencia fija del imán, insensible a la IEM.",
              "NO desactiva ninguna terapia antitaquicardia (el MP no las tiene).",
            ],
          ]}
        />
        <Src>Crossley GH, et al. HRS/ASA. Heart Rhythm 2011;8(7):1114-1154.</Src>
        <Callout variant="danger">
          <b>DAI + paciente dependiente de marcapasos.</b> El imán suspende los choques pero{" "}
          <b>no protege frente a la inhibición</b> de la estimulación por IEM. Esta combinación suele
          requerir <b>reprogramación</b> (desactivar terapias de choque <i>y</i> programar modo
          asíncrono), no solo un imán. Verificar de antemano cómo responde ese DAI concreto al imán:
          algunos pueden estar programados para <b>ignorarlo</b>.
        </Callout>
        <Callout variant="warn">
          El comportamiento con imán <b>varía por fabricante y por programación</b> (p. ej. respuesta al
          imán desactivada, o frecuencia del imán distinta según la batería). Confirmar en la
          interrogación previa. Tras retirar el imán, <b>reconfirmar</b> que el dispositivo recuperó su
          estado esperado.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Estrategia: imán vs reprogramación">
        <P>
          Dos vías para neutralizar la IEM antes de la cirugía con electrobisturí: colocar un{" "}
          <b>imán</b> intraoperatorio o <b>reprogramar</b> el dispositivo (con el equipo de
          electrofisiología / técnico). La elección depende del tipo de dispositivo, la dependencia y la
          accesibilidad del bolsillo durante la cirugía.
        </P>
        <Table
          headers={["Escenario", "Conducta recomendada"]}
          rows={[
            [
              "MP, NO dependiente, IEM baja",
              "A menudo basta con vigilancia; imán disponible. Ráfagas cortas de bisturí bipolar.",
            ],
            [
              "MP dependiente + IEM cercana/alta",
              "Modo asíncrono (VOO/DOO): con imán sobre el generador, o reprogramando a asíncrono si el bolsillo queda inaccesible en campo estéril.",
            ],
            [
              "DAI (cualquiera) con IEM significativa",
              "Desactivar terapias de choque: imán sobre el DAI (mientras esté puesto) o reprogramación previa. Monitor/desfibrilador externo listo.",
            ],
            [
              "DAI + dependiente de marcapasos",
              "Reprogramar: desactivar choques Y programar modo asíncrono. El imán solo suspende choques, no protege la estimulación.",
            ],
            [
              "Bolsillo del generador en el campo estéril",
              "El imán puede no sostenerse ni ser accesible → preferir reprogramación previa.",
            ],
          ]}
        />
        <Src>
          Crossley GH, et al. HRS/ASA. Heart Rhythm 2011;8(7):1114-1154. · ASA Practice Advisory.
          Anesthesiology 2020;132(2):225-252.
        </Src>
        <Callout variant="danger">
          <b>Desfibrilador/monitor externo SIEMPRE disponible.</b> Si se han <b>desactivado las terapias
          del DAI</b> (por imán o reprogramación), el paciente queda <b>sin protección antitaquicardia</b>:
          debe haber un <b>desfibrilador/marcapasos transcutáneo externo inmediatamente disponible</b>,
          con parches colocados si el acceso al tórax será difícil, y monitorización ECG continua durante
          todo el periodo de terapias desactivadas.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Intraoperatorio — monitorización">
        <P>
          La IEM puede corromper la lectura del ECG y del pletismógrafo. Monitorizar la{" "}
          <b>perfusión mecánica real</b>, no solo el trazado eléctrico, para detectar si el dispositivo
          está capturando y perfundiendo.
        </P>
        <Table
          headers={["Dominio", "Recomendación práctica"]}
          rows={[
            [
              "Monitor de pulso mecánico",
              "Pulsioximetría (onda pletismográfica) y/o línea arterial: confirman perfusión latido a latido pese a la IEM en el ECG.",
            ],
            [
              "ECG continuo",
              "Vigilar inhibición (pausas), fallo de captura o estimulación asíncrona esperada. La IEM del bisturí ensucia el trazado.",
            ],
            [
              "Desfibrilador externo",
              "Presente y encendido; parches de desfibrilación/marcapasos transcutáneo colocados en anteroposterior si el DAI está desactivado o el acceso al tórax es difícil.",
            ],
            [
              "Imán a mano",
              "Disponible físicamente en el quirófano; conocer de antemano la respuesta del dispositivo concreto.",
            ],
            [
              "Evitar factores proarrítmicos / IEM extra",
              "Cuidado con RM, radioterapia, ablación por radiofrecuencia, litotricia y estimulación nerviosa: fuentes de IEM adicionales a coordinar.",
            ],
          ]}
        />
        <Src>
          Crossley GH, et al. HRS/ASA. Heart Rhythm 2011;8(7):1114-1154. · Miller&apos;s Anesthesia, 9.ª ed.
        </Src>
        <Callout variant="warn">
          Vigilar la interacción con el <b>bisturí</b>: si el DAI <b>no</b> fue desactivado y detecta la
          IEM como FV, puede <b>descargar</b> durante la cirugía (choque inapropiado, con riesgo de
          arritmia real y de lesión al personal). Ante actividad inesperada del dispositivo, pausar el
          electrobisturí y aplicar el imán / plan predefinido.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Postoperatorio — reactivar y reinterrogar">
        <P>
          El dispositivo <b>no se da por resuelto al retirar el imán</b>. Toda desactivación o
          reprogramación debe <b>revertirse y confirmarse</b>. La IEM intraoperatoria puede haber
          alterado parámetros, agotado batería o dañado electrodos.
        </P>
        <Table
          headers={["Acción", "Detalle"]}
          rows={[
            ["Reactivar terapias del DAI", "Restaurar la detección/terapias de taquiarritmia (retirar imán o reprogramar de vuelta) antes de retirar la monitorización."],
            ["Restaurar el modo de estimulación", "Volver del modo asíncrono al modo programado original del MP/DAI."],
            ["Reinterrogar el dispositivo", "Interrogación postoperatoria para verificar función normal, umbrales, batería e integridad de electrodos, sobre todo si hubo IEM significativa."],
            ["Monitorización hasta reactivar", "Mantener ECG continuo y desfibrilador disponible hasta confirmar que el dispositivo recuperó su función plena."],
            ["Documentar", "Registrar interrogaciones, cambios de programación y hora de reactivación en la historia."],
          ]}
        />
        <Src>
          Crossley GH, et al. HRS/ASA. Heart Rhythm 2011;8(7):1114-1154. · ASA Practice Advisory.
          Anesthesiology 2020;132(2):225-252.
        </Src>
        <Callout variant="ok">
          <b>Cierre del bucle.</b> No trasladar al paciente a planta con las <b>terapias del DAI aún
          desactivadas</b> ni con el MP en asíncrono: reactivar, reinterrogar y confirmar función normal
          es parte del estándar de cuidado. La reinterrogación es especialmente obligada tras IEM
          significativa, RM, radioterapia o ablación.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Resumen de conducta clave">
        <Table
          headers={["Parámetro", "Conducta", "Fuente"]}
          accentCol={1}
          rows={[
            ["Antes de cirugía", "Interrogar dispositivo; definir tipo (MP/DAI) y dependencia", "HRS/ASA"],
            ["Electrobisturí", "Bipolar; si monopolar, ráfagas cortas y placa lejos del generador", "HRS/ASA · ASA 2020"],
            ["Imán sobre DAI", "Suspende terapias de choque mientras esté puesto; NO cambia estimulación", "HRS/ASA"],
            ["Imán sobre MP dependiente", "Estimulación asíncrona (VOO/DOO)", "HRS/ASA"],
            ["DAI + dependiente de MP", "Reprogramar: desactivar choques Y modo asíncrono", "HRS/ASA"],
            ["Terapias del DAI desactivadas", "Desfibrilador/marcapasos externo disponible + monitor continuo", "HRS/ASA · ASA 2020"],
            ["Postoperatorio", "Reactivar terapias, restaurar modo y reinterrogar", "HRS/ASA"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="09" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Crossley GH, Poole JE, Rozner MA, et al. The Heart Rhythm Society (HRS)/American Society of Anesthesiologists (ASA) Expert Consensus Statement on the Perioperative Management of Patients with Implantable Defibrillators, Pacemakers and Arrhythmia Monitors. Heart Rhythm 2011;8(7):1114-1154.</li>
          <li>American Society of Anesthesiologists Task Force. Practice Advisory for the Perioperative Management of Patients with Cardiac Implantable Electronic Devices: Pacemakers and Implantable Cardioverter-Defibrillators 2020. Anesthesiology 2020;132(2):225-252.</li>
          <li>Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — Anesthesia for Patients with Cardiac Implantable Electronic Devices.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// conducta de literatura aceptada (HRS/ASA 2011 · ASA Practice Advisory 2020 · Miller)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, protocolo institucional ni al electrofisiólogo"}
          <br />
          {"// el imán sobre el DAI suspende choques, NO toca la estimulación: no lo olvides con el bisturí encendido"}
          <br />
          {"// nadie sale de quirófano con el DAI apagado: reactivar y reinterrogar cierra el caso"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
