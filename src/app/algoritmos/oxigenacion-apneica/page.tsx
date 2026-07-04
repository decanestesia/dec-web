import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Algoritmo de vía aérea — PREOXIGENACIÓN Y OXIGENACIÓN APNEICA
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: flujos, tiempos y objetivos tomados de
// literatura aceptada. Cada tabla/callout cita su fuente
// (Vancouver breve). NO inventar cifras.
// Fuentes primarias:
//  - Weingart SD, Levitan RM. Preoxygenation and prevention of
//    desaturation during emergency airway management.
//    Ann Emerg Med 2012;59(3):165-175.
//  - Patel A, Nouraei SAR. Transnasal Humidified Rapid-Insufflation
//    Ventilatory Exchange (THRIVE). Anaesthesia 2015;70(3):323-329.
//  - Frat JP, et al. (FLORALI). N Engl J Med 2015;372:2185-2196.
//  - Nimmagadda U, et al. Preoxygenation. Anesth Analg 2017;124:507-517.
//  - Difficult Airway Society (DAS) 2015 intubation guidelines.
// ============================================================

export const metadata: Metadata = {
  title: "Preoxigenación y oxigenación apneica — Algoritmo de vía aérea · DEC",
  description:
    "Referencia estructurada de preoxigenación y oxigenación apneica: O₂ 100% 3-5 min u 8 capacidades vitales, objetivo EtO₂ >0.85-0.9, posición en rampa, VNI/CPAP en obesos y críticos, oxigenación apneica (NODESAT) con cánula nasal 15 L/min o HFNC, THRIVE 30-70 L/min, factores que acortan el tiempo seguro de apnea y curvas de desaturación. Weingart & Levitan 2012, Patel & Nouraei 2015.",
  openGraph: {
    title: "Preoxigenación y oxigenación apneica — Algoritmo de vía aérea · DEC",
    description:
      "Preoxigenación (EtO₂ >0.85-0.9), oxigenación apneica (cánula nasal 15 L/min, HFNC, THRIVE 30-70 L/min) y factores que acortan la apnea segura.",
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
        <span style={{ color: c.border, fontSize: "0.9rem", lineHeight: 1.6 }}>{c.icon}</span>
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
export default function OxigenacionApneicaPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/algoritmos" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /algoritmos
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat preoxigenacion-apneica.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Preoxigenación y oxigenación apneica
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          desnitrogenación · EtO₂ &gt;0.85-0.9 · rampa · VNI/CPAP · NODESAT · cánula nasal 15 L/min · THRIVE 30-70 L/min
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// el mejor momento para llenar el tanque de reserva es antes de que el paciente deje de respirar"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">ALGORITMO</span>
          <span className="tag tag-muted">Weingart-Levitan 2012</span>
          <span className="tag tag-muted">THRIVE 2015</span>
          <span className="tag tag-muted">DAS 2015</span>
        </div>
      </header>

      <Callout variant="info">
        La preoxigenación y la oxigenación apneica son maniobras <b>distintas y complementarias</b>.{" "}
        La preoxigenación (antes de la apnea) <b>llena el reservorio pulmonar de O₂</b> desplazando el
        nitrógeno de la CRF. La oxigenación apneica (durante la apnea) <b>rellena ese reservorio</b>{" "}
        aprovechando el flujo neto de O₂ hacia el alvéolo, prolongando el tiempo seguro de apnea. La
        primera es obligatoria en toda inducción; la segunda es la red de seguridad cuando la
        laringoscopia se prolonga.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Fisiología: por qué se gana tiempo">
        <P>
          Con FiO₂ ambiental (0.21) la capacidad residual funcional (CRF) contiene poca reserva de O₂
          y la desaturación tras la apnea es rápida. Respirar <b>O₂ al 100%</b> desnitrogena la CRF y
          la convierte en un reservorio de oxígeno que sostiene la SpO₂ durante minutos de apnea. La{" "}
          <b>oxigenación apneica</b> funciona porque durante la apnea el O₂ se absorbe del alvéolo a la
          sangre (~250 mL/min) más rápido de lo que el CO₂ difunde al alvéolo (~10 mL/min): esto genera
          una presión subatmosférica que <b>arrastra O₂</b> desde la faringe hacia el alvéolo si hay
          una vía aérea permeable y una fuente de O₂ (cánula nasal, HFNC).
        </P>
        <Src>Weingart SD, Levitan RM. Ann Emerg Med 2012;59(3):165-175. · Nimmagadda U, et al. Anesth Analg 2017;124:507-517.</Src>
        <Callout variant="warn">
          El límite de la oxigenación apneica es el CO₂, no el O₂: la apnea prolongada mantiene la SpO₂
          pero la PaCO₂ sigue subiendo (~8-12 mmHg el primer minuto, luego ~3 mmHg/min), con acidosis
          respiratoria progresiva. Prolonga la seguridad de la <b>oxigenación</b>, no de la{" "}
          <b>ventilación</b>.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Preoxigenación — técnica y objetivo">
        <P>
          Objetivo: alcanzar la máxima desnitrogenación antes de inducir. Se administra{" "}
          <b>O₂ al 100% con sello hermético</b> de la mascarilla (una fuga anula la técnica: entra aire
          ambiental y la FiO₂ efectiva cae). Dos técnicas equivalentes en tiempo suficiente; la de
          capacidades vitales sirve cuando falta tiempo (urgencia, inducción de secuencia rápida).
        </P>
        <Table
          headers={["Técnica", "Cómo", "Cuándo"]}
          rows={[
            [
              "Respiración a volumen corriente",
              "O₂ 100%, sello hermético, 3-5 min de respiración normal",
              "Estándar electivo; la más fiable si hay tiempo",
            ],
            [
              "8 capacidades vitales / 60 s",
              "8 respiraciones máximas (capacidad vital) en ~60 s con flujo alto (≥ 10 L/min)",
              "Urgencia / secuencia rápida cuando el tiempo es limitado",
            ],
            [
              "4 capacidades vitales / 30 s",
              "4 respiraciones máximas en 30 s",
              "Menos eficaz — desatura antes; usar solo si no hay alternativa",
            ],
          ]}
        />
        <Src>
          Weingart SD, Levitan RM. Ann Emerg Med 2012;59(3):165-175. · Baraka AS, et al. Anesthesiology
          1999;91:612-616 (8 capacidades vitales/60 s ≈ 3 min de volumen corriente).
        </Src>
        <div
          className="panel"
          style={{ margin: "0 0 1rem", borderLeft: "3px solid var(--accent)" }}
        >
          <div className="panel-body" style={{ display: "grid", gap: "0.5rem" }}>
            <div
              className="mono"
              style={{ color: "var(--accent)", fontSize: "1rem", fontWeight: 700, letterSpacing: "0.02em" }}
            >
              Objetivo: EtO₂ &gt; 0.85-0.9
            </div>
            <div className="mono" style={{ color: "var(--text-2)", fontSize: "0.72rem", lineHeight: 1.7 }}>
              EtO₂ = fracción de O₂ espirada (end-tidal) · marca de desnitrogenación efectiva
              <br />
              La SpO₂ del 100% <b>no</b> equivale a preoxigenación completa: mide la sangre, no el
              reservorio alveolar. Verifica con <b>EtO₂</b> si el capnógrafo lo mide.
            </div>
          </div>
        </div>
        <Callout variant="danger">
          <b>Fuga de mascarilla = preoxigenación fallida.</b> Con sello imperfecto la FiO₂ real puede
          caer a 0.6-0.7 aunque el flujómetro marque 100%. Sella con las dos manos si hace falta,
          añade flujo alto, considera cánula nasal por debajo de la mascarilla y verifica con EtO₂. En
          barba, edéntulos o cara difícil, el sello es el punto que más falla.
        </Callout>
        <Callout variant="info">
          <b>Posición.</b> Preoxigena en <b>semisentado / anti-Trendelenburg 20-30°</b> o en{" "}
          <b>rampa</b> (alineando conducto auditivo externo con horquilla esternal, sobre todo en
          obesos): mejora la CRF, retrasa la desaturación y optimiza la laringoscopia posterior.
          <br />
          <span className="mono" style={{ fontSize: "0.62rem", color: "var(--text-3)" }}>
            Ramkumar V, et al. Anesth Analg 2011 (posición 25° prolonga apnea segura). · Weingart-Levitan 2012.
          </span>
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="VNI / CPAP en obesos y críticos">
        <P>
          En pacientes que no logran EtO₂ adecuada con mascarilla simple (obesidad, hipoxémico crítico,
          shunt, atelectasia) la preoxigenación con <b>presión positiva</b> (CPAP o VNI con PEEP)
          recluta alvéolos colapsados, mejora la CRF y eleva la PaO₂ pre-apnea. Es la técnica de
          elección cuando la desaturación previsible es rápida.
        </P>
        <Table
          headers={["Estrategia", "Ajuste orientativo", "Indicación"]}
          rows={[
            [
              "CPAP",
              "CPAP 5-10 cmH₂O, FiO₂ 1.0, 3-5 min",
              "Obeso, atelectasia; mantener durante la apnea si el dispositivo lo permite",
            ],
            [
              "VNI (BiPAP)",
              "PS + PEEP 5-10 cmH₂O, FiO₂ 1.0",
              "Crítico hipoxémico que no preoxigena con mascarilla",
            ],
            [
              "HFNC alto flujo",
              "30-60 L/min, FiO₂ 1.0",
              "Alternativa; único sistema que continúa como oxigenación apneica sin recambiar interfaz",
            ],
          ]}
        />
        <Src>
          Baillard C, et al. Am J Respir Crit Care Med 2006;174:171-177 (VNI en preoxigenación del
          crítico). · Frat JP, et al. Lancet Respir Med 2019 (HFNC vs VNI, FLORALI-2). · Weingart-Levitan 2012.
        </Src>
        <Callout variant="warn">
          La presión positiva puede insuflar aire al estómago y aumentar el riesgo de regurgitación en
          el paciente con estómago lleno. Balancea contra el beneficio de oxigenación; aplica presiones
          moderadas (CPAP/PEEP ≤ 10 cmH₂O) y considera aspiración gástrica previa cuando proceda.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Oxigenación apneica (NODESAT) — durante la apnea">
        <P>
          Tras la inducción y durante la laringoscopia, mantener una <b>fuente de O₂ nasal</b> con la
          vía aérea permeable rellena el reservorio y prolonga el tiempo seguro de apnea. Weingart y
          Levitan la denominaron <b>NO DESAT</b> (Nasal Oxygen During Efforts Securing A Tube). Es una
          maniobra de coste casi nulo con beneficio potencial alto.
        </P>
        <Table
          headers={["Modalidad", "Flujo", "Notas"]}
          accentCol={1}
          rows={[
            [
              "Cánula nasal estándar",
              "15 L/min",
              "Colocada bajo la mascarilla durante la preoxigenación y se deja puesta en la apnea",
            ],
            [
              "HFNC (cánula nasal alto flujo humidificada)",
              "30-70 L/min",
              "Humidifica y calienta; tolera flujos altos sin resecar la mucosa; permite THRIVE",
            ],
          ]}
        />
        <Src>
          Weingart SD, Levitan RM. Ann Emerg Med 2012;59(3):165-175 (NO DESAT). · Patel A, Nouraei SAR.
          Anaesthesia 2015;70(3):323-329 (THRIVE). · Ramachandran SK, et al. Anesth Analg 2010;110:1360 (cánula nasal 5 L/min prolonga apnea segura).
        </Src>
        <Callout variant="ok">
          <b>Requisito absoluto: vía aérea permeable.</b> El O₂ apneico solo fluye al alvéolo si la
          faringe está abierta. Mantén <b>maniobra de tracción mandibular / elevación del mentón</b> y
          posición óptima durante la apnea. Con vía aérea obstruida, la oxigenación apneica no funciona.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="THRIVE — oxigenación apneica de alto flujo">
        <P>
          <b>THRIVE</b> (Transnasal Humidified Rapid-Insufflation Ventilatory Exchange) usa HFNC a
          flujos muy altos durante la apnea. El flujo alto humidificado no solo oxigena: genera un
          cierto <b>lavado del espacio muerto y aclaramiento de CO₂</b> por flujo turbulento
          faríngeo, extendiendo el tiempo de apnea seguro mucho más allá de la cánula estándar. Patel
          y Nouraei describieron apneas de mediana ~14 min (rango 5-65 min) en vía aérea difícil manteniendo la
          saturación.
        </P>
        <div
          className="panel"
          style={{ margin: "0 0 1rem", borderLeft: "3px solid var(--accent)" }}
        >
          <div className="panel-body" style={{ display: "grid", gap: "0.5rem" }}>
            <div
              className="mono"
              style={{ color: "var(--accent)", fontSize: "1rem", fontWeight: 700, letterSpacing: "0.02em" }}
            >
              THRIVE: HFNC 30-70 L/min, FiO₂ 1.0
            </div>
            <div className="mono" style={{ color: "var(--text-2)", fontSize: "0.72rem", lineHeight: 1.7 }}>
              Preoxigenar y continuar en la apnea sin cambiar de interfaz · boca cerrada, mandíbula
              traccionada · vía aérea permeable obligatoria
            </div>
          </div>
        </div>
        <Src>Patel A, Nouraei SAR. Anaesthesia 2015;70(3):323-329.</Src>
        <Callout variant="info">
          Indicación típica: vía aérea difícil prevista, cirugía de vía aérea compartida (laringe,
          ENT), intubación despierto y laringoscopia que puede prolongarse. No sustituye la ventilación
          efectiva ni la vía aérea quirúrgica de rescate: <b>prolonga el margen, no lo hace infinito</b>.
        </Callout>
        <Callout variant="warn">
          THRIVE mitiga pero <b>no elimina</b> la hipercapnia progresiva. La PaCO₂ sigue subiendo (~1-2
          mmHg/min bajo THRIVE, menos que sin flujo pero acumulativa). En apneas muy prolongadas vigila
          la acidosis respiratoria y planifica reventilar.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Factores que acortan el tiempo seguro de apnea">
        <P>
          El tiempo desde la apnea hasta SpO₂ &lt; 90% varía enormemente según el paciente. Un adulto
          sano bien preoxigenado tolera ~6-8 min; los grupos de riesgo desaturan en <b>segundos a
          &lt; 3 min</b>. Anticipa estos factores para reforzar preoxigenación y oxigenación apneica.
        </P>
        <Table
          headers={["Factor", "Mecanismo", "Impacto"]}
          rows={[
            [
              "Obesidad",
              "↓ CRF (compresión), ↑ consumo de O₂, atelectasia y shunt",
              "Desaturación rápida; usar rampa + CPAP/PEEP + O₂ apneico",
            ],
            [
              "Embarazo (a término)",
              "↓ CRF (~20%), ↑ consumo de O₂ (~20%) por el feto",
              "Reserva mínima; preoxigenar siempre, desatura muy rápido",
            ],
            [
              "Paciente crítico",
              "Shunt, ocupación alveolar, alto gasto metabólico",
              "Alto riesgo; preferir VNI/HFNC para preoxigenar",
            ],
            [
              "Niño / lactante",
              "↑ consumo de O₂/kg, CRF proporcionalmente menor",
              "Desatura en segundos; oxigenación apneica útil y bien tolerada",
            ],
            [
              "Anemia grave / sepsis",
              "↓ contenido de O₂, ↑ demanda tisular",
              "Menor reserva funcional efectiva",
            ],
            [
              "Preoxigenación incompleta",
              "Fuga de sello, poco tiempo, EtO₂ baja",
              "Anula todo el margen; verificar EtO₂ antes de inducir",
            ],
          ]}
        />
        <Src>
          Weingart SD, Levitan RM. Ann Emerg Med 2012;59(3):165-175. · Benumof JL, et al. Anesthesiology
          1997;87:979-982 (curvas de desaturación en apnea). · Nimmagadda U, et al. Anesth Analg 2017.
        </Src>
        <Callout variant="danger">
          En obeso, embarazada, crítico y niño, la SpO₂ se mantiene en meseta y <b>cae de forma abrupta
          una vez inicia el descenso</b> (rodilla de la curva de disociación de la hemoglobina): del 90%
          al 70% en muy pocos segundos. No esperes al 90% para actuar — a esa cifra el margen ya casi
          se agotó.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Curvas de desaturación — tiempo a SpO₂ 90%">
        <P>
          Tiempos orientativos desde la apnea hasta SpO₂ 90% tras preoxigenación adecuada (sin
          oxigenación apneica). Son estimaciones de literatura, no garantías: el paciente real puede
          desaturar antes.
        </P>
        <Table
          headers={["Perfil", "Tiempo a SpO₂ 90%", "Refuerzo recomendado"]}
          accentCol={1}
          rows={[
            ["Adulto sano ~70 kg", "≈ 6-8 min", "Cánula nasal 15 L/min si laringoscopia difícil"],
            ["Adulto enfermo moderado", "≈ 3-5 min", "O₂ apneico + posición óptima"],
            ["Obeso mórbido", "≈ 2-3 min", "Rampa + CPAP/PEEP + O₂ apneico / THRIVE"],
            ["Embarazada a término", "≈ 2-3 min", "Preoxigenación estricta + O₂ apneico"],
            ["Niño 10 kg", "≈ 1-2 min", "O₂ apneico; equipo listo antes de inducir"],
            ["Neonato / crítico", "< 1 min", "Máxima preparación; HFNC/VNI"],
          ]}
        />
        <Src>Benumof JL, et al. Anesthesiology 1997;87:979-982. · Weingart-Levitan 2012 (aplicación clínica de las curvas).</Src>
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Secuencia práctica">
        <P>Flujo operativo para inducción con vía aérea potencialmente difícil o riesgo de desaturación:</P>
        <ol
          style={{ color: "var(--text-1)", fontSize: "0.86rem", lineHeight: 1.9, paddingLeft: "1.4rem", margin: "0 0 1.25rem" }}
        >
          <li><b>Posiciona</b> en rampa / semisentado 20-30° (alineación auditivo-esternal en obesos).</li>
          <li><b>Coloca la cánula nasal</b> (15 L/min) bajo la mascarilla o dispón HFNC.</li>
          <li><b>Preoxigena</b> con O₂ 100% y sello hermético: 3-5 min a volumen corriente u 8 capacidades vitales; añade CPAP/VNI si es obeso o crítico.</li>
          <li><b>Verifica EtO₂ &gt; 0.85-0.9</b> antes de inducir (si el monitor lo mide).</li>
          <li><b>Induce.</b> Al iniciar la apnea, deja la cánula nasal a 15 L/min (o HFNC 30-70 L/min / THRIVE).</li>
          <li><b>Mantén vía aérea permeable</b> (tracción mandibular) durante la laringoscopia.</li>
          <li><b>Vigila SpO₂</b>: si cae, detén, reventila con bolsa-mascarilla y reoxigena antes de reintentar.</li>
        </ol>
        <Callout variant="ok">
          El objetivo no es intubar rápido, es intubar con <b>margen de oxígeno</b>. Cada capa
          (posición + sello + EtO₂ + O₂ apneico) suma segundos que, en el grupo de riesgo, son la
          diferencia entre un intento tranquilo y un rescate.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="09" title="Resumen de parámetros clave">
        <Table
          headers={["Parámetro", "Valor", "Fuente"]}
          accentCol={1}
          rows={[
            ["Preoxigenación (volumen corriente)", "O₂ 100%, 3-5 min, sello hermético", "Weingart-Levitan 2012"],
            ["Preoxigenación rápida", "8 capacidades vitales / 60 s", "Baraka 1999"],
            ["Objetivo de desnitrogenación", "EtO₂ > 0.85-0.9", "Nimmagadda 2017"],
            ["Posición", "Rampa / semisentado 20-30°", "Ramkumar 2011"],
            ["Preoxigenación en obeso/crítico", "CPAP/VNI PEEP 5-10 cmH₂O, FiO₂ 1.0", "Baillard 2006"],
            ["Oxigenación apneica — cánula nasal", "15 L/min", "Weingart-Levitan 2012"],
            ["Oxigenación apneica — HFNC / THRIVE", "30-70 L/min, FiO₂ 1.0", "Patel-Nouraei 2015"],
            ["Requisito de O₂ apneico", "Vía aérea permeable", "Weingart-Levitan 2012"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="10" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Weingart SD, Levitan RM. Preoxygenation and prevention of desaturation during emergency airway management. Ann Emerg Med 2012;59(3):165-175.</li>
          <li>Patel A, Nouraei SAR. Transnasal Humidified Rapid-Insufflation Ventilatory Exchange (THRIVE): a physiological method of increasing apnoea time. Anaesthesia 2015;70(3):323-329.</li>
          <li>Nimmagadda U, Salem MR, Crystal GJ. Preoxygenation: Physiologic Basis, Benefits, and Potential Risks. Anesth Analg 2017;124(2):507-517.</li>
          <li>Baraka AS, et al. Preoxygenation: comparison of maximal breathing and tidal volume breathing techniques. Anesthesiology 1999;91(3):612-616.</li>
          <li>Baillard C, et al. Noninvasive ventilation improves preoxygenation before intubation of hypoxic patients. Am J Respir Crit Care Med 2006;174(2):171-177.</li>
          <li>Benumof JL, Dagg R, Benumof R. Critical hemoglobin desaturation will occur before return to an unparalyzed state following 1 mg/kg succinylcholine. Anesthesiology 1997;87(4):979-982.</li>
          <li>Ramkumar V, Umesh G, Philip FA. Preoxygenation with 20° head-up tilt provides longer duration of non-hypoxic apnea. Anesth Analg 2011.</li>
          <li>Frat JP, et al. High-flow oxygen through nasal cannula in acute hypoxemic respiratory failure (FLORALI). N Engl J Med 2015;372(23):2185-2196.</li>
          <li>Difficult Airway Society (DAS) 2015 guidelines for management of unanticipated difficult intubation in adults. Br J Anaesth 2015;115(6):827-848.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// flujos y tiempos de literatura aceptada (Weingart-Levitan 2012, Patel-Nouraei 2015, DAS 2015)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// la oxigenación apneica compra tiempo de O₂, no de CO₂: el reloj de la hipercapnia sigue corriendo"}
          <br />
          {"// EtO₂ no lo mide el optimismo del anestesiólogo: sella la mascarilla"}
        </p>
        <Link href="/algoritmos" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más algoritmos
        </Link>
      </footer>
    </div>
  );
}
