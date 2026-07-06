import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — EXTUBACIÓN
// Contenido clínico basado en literatura aceptada. Cada tabla/callout
// cita su fuente (Vancouver breve). NO inventar umbrales ni cifras.
// Fuentes primarias:
//  - Ouellette DR, et al. Liberation from Mechanical Ventilation in
//    Critically Ill Adults: An Official ATS/ACCP Clinical Practice
//    Guideline. Chest 2017;151(1):166-180.
//  - Schmidt GA, et al. ATS/ACCP Ventilator Liberation Guideline
//    (SBT technique). Am J Respir Crit Care Med 2017;195(1):115-119.
//  - Difficult Airway Society (DAS). Popat M, et al. Guidelines for
//    the management of tracheal extubation. Anaesthesia 2012;67:318-340.
//  - Yang KL, Tobin MJ. RSBI. N Engl J Med 1991;324(21):1445-1450.
//  - Boles JM, et al. Weaning. ESA/ERS Task Force. Eur Respir J 2007;29:1033-1056.
//  - Rothaar RC, Epstein SK. Extubation failure. Curr Opin Crit Care 2003.
//  - Girard TD, et al. ATS/ACCP guideline (SAT+SBT). Chest 2017.
//  - Hernández G, et al. HFNC post-extubation. JAMA 2016;315(13):1354-1361.
//  - Rochwerg B, et al. NIV post-extubation. Eur Respir J 2017;50:1602426.
// ============================================================

export const metadata: Metadata = {
  title: "Extubación — criterios, SBT, RSBI y cuff leak · DEC",
  description:
    "Referencia estructurada de extubación: criterios de destete, prueba de ventilación espontánea (SBT), índice de respiración rápida superficial (RSBI), prueba de fuga del balón, algoritmo de vía aérea de alto riesgo (DAS) y soporte post-extubación (VNI/HFNC). Guías ATS/ACCP 2017, DAS 2012, ESA/ERS.",
};

// ------------------------------------------------------------
// Helpers de presentación (mismo lenguaje visual que blog/[slug])
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
export default function ExtubacionPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./extubacion.sh
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Extubación
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          criterios de destete · SBT · RSBI · cuff leak · alto riesgo (DAS) · soporte post-extubación
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// intubar es opcional; extubar es donde de verdad se demuestra el plan"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">REFERENCIA</span>
          <span className="tag tag-muted">ATS/ACCP 2017</span>
          <span className="tag tag-muted">DAS 2012</span>
          <span className="tag tag-muted">ESA/ERS</span>
        </div>
      </header>

      <Callout variant="info">
        La extubación se decide en dos preguntas separadas:{" "}
        <b>¿tolera respirar sin soporte?</b> (destete, evaluado con la SBT) y{" "}
        <b>¿tolera estar sin tubo?</b> (permeabilidad de vía aérea, protección, manejo de secreciones).
        Aprobar la SBT no garantiza lo segundo. Ambas deben responderse antes de retirar el tubo.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Criterios de extubación / destete">
        <P>
          Antes de una prueba de ventilación espontánea deben cumplirse condiciones mínimas
          (readiness-to-wean). No son un umbral rígido: son puertas que se abren para{" "}
          <b>intentar</b> la SBT. El destete se posterga si la causa de la insuficiencia
          respiratoria no está resuelta o en control.
        </P>
        <Table
          headers={["Dominio", "Criterio orientativo", "Umbral típico"]}
          accentCol={2}
          rows={[
            [
              "Oxigenación",
              "PaO₂/FiO₂ adecuada; FiO₂ y PEEP bajos",
              "PaO₂/FiO₂ ≥ 150–200 · FiO₂ ≤ 0.4–0.5 · PEEP ≤ 5–8 cmH₂O · SpO₂ ≥ 90%",
            ],
            [
              "Hemodinámica",
              "Sin isquemia activa; vasopresor mínimo o nulo",
              "FC ≤ 140 · TA estable sin/con vasopresor a dosis baja",
            ],
            [
              "Neurológico",
              "Nivel de conciencia y capacidad de proteger la vía aérea",
              "Despierto o fácilmente despertable · GCS ≥ 8 orientativo · tos al aspirar",
            ],
            [
              "Tos y secreciones",
              "Tos eficaz; carga de secreciones manejable",
              "Aspiración < c/2 h · pico de flujo tosido ≥ 60 L/min (si medible)",
            ],
            [
              "Ácido-base / ventilación",
              "Sin acidosis respiratoria descompensada",
              "pH ≥ 7.25 · fármaco causal resuelto/reversible",
            ],
            [
              "Causa resuelta",
              "El motivo de la intubación mejora o se resolvió",
              "Juicio clínico · no fiebre alta ni sepsis no controlada",
            ],
          ]}
        />
        <Src>
          Boles JM, et al. Eur Respir J 2007;29:1033-1056 (ESA/ERS Task Force). · Ouellette DR, et al.
          Chest 2017;151(1):166-180. · MacIntyre NR, et al. Chest 2001;120(6 Suppl):375S-395S.
        </Src>
        <Callout variant="warn">
          Los umbrales de oxigenación (PaO₂/FiO₂, PEEP, FiO₂) son <b>orientativos</b> y varían
          entre guías y contexto (postoperatorio vs. SDRA en resolución). Se usan para elegir a
          quién probar, no como decisión automática de extubar.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Prueba de ventilación espontánea (SBT)">
        <P>
          La SBT es la prueba de referencia para el destete: se reduce o retira el soporte y se
          observa la tolerancia. Las guías ATS/ACCP 2017 sugieren realizar el <b>primer intento con
          presión de soporte (PSV) baja</b> más que con tubo en T, por mayor tasa de éxito de
          extubación (recomendación condicional, evidencia de certeza moderada).
        </P>
        <Table
          headers={["Parámetro", "Tubo en T", "PSV (soporte de presión)"]}
          rows={[
            ["Soporte", "Ninguno (pieza en T + O₂)", "PS 5–8 cmH₂O · PEEP 0–5 cmH₂O"],
            ["Fisiología", "Más exigente (sin ayuda)", "Compensa resistencia del tubo"],
            ["Guía ATS/ACCP 2017", "Alternativa aceptable", "Preferido para el 1.er intento"],
            ["Duración", "30–120 min", "30–120 min"],
          ]}
        />
        <Src>
          Schmidt GA, et al. Am J Respir Crit Care Med 2017;195(1):115-119. · Subirà C, et al. JAMA
          2019;321(22):2175-2182 (PSV 30 min ≥ tubo en T 2 h).
        </Src>
        <P>
          <b>Duración.</b> Clásicamente 30 a 120 minutos. La evidencia actual sugiere que una SBT
          corta (30 min) con PSV es al menos tan buena como una prolongada con tubo en T. Prolongar
          a 120 min se reserva para pacientes de mayor riesgo (EPOC, cardiopatía, ventilación
          prolongada).
        </P>
        <Callout variant="danger">
          <b>Criterios de fallo de la SBT (abortar y reconectar):</b> FR &gt; 35 rpm sostenida ·
          SpO₂ &lt; 90% o PaO₂ &lt; 60 con FiO₂ ≥ 0.5 · FC &gt; 140 o cambio &gt; 20% · TA sistólica
          &gt; 180 o &lt; 90 mmHg · signos de trabajo respiratorio (uso de accesorios, paradoja
          abdominal, diaforesis) · agitación, ansiedad o deterioro del sensorio · arritmia nueva.
        </Callout>
        <Src>MacIntyre NR, et al. Chest 2001;120(6 Suppl):375S-395S. · Boles JM, et al. Eur Respir J 2007.</Src>
        <Callout variant="info">
          Combinar el <b>despertar diario (SAT)</b> con la SBT (protocolo &quot;wake up and
          breathe&quot;) reduce días de ventilación y mortalidad frente a la SBT aislada.
          <br />
          <span className="mono" style={{ fontSize: "0.62rem", color: "var(--text-3)" }}>
            Girard TD, et al. Lancet 2008;371:126-134.
          </span>
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Índice de respiración rápida superficial (RSBI)">
        <P>
          El RSBI (índice de Tobin) cuantifica el patrón respiratorio rápido y superficial que
          predice el fracaso del destete. Se mide idealmente durante una ventilación espontánea sin
          soporte (o soporte mínimo), tras ~1 minuto.
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
              RSBI = FR (rpm) / Vt (L)
            </div>
            <div className="mono" style={{ color: "var(--text-2)", fontSize: "0.72rem", lineHeight: 1.7 }}>
              Vt en <b>litros</b> · unidades del índice: rpm/L
              <br />
              Ej.: FR 24 rpm y Vt 0.30 L → RSBI = 24 / 0.30 = <b style={{ color: "var(--accent)" }}>80</b>
            </div>
          </div>
        </div>
        <Table
          headers={["RSBI (rpm/L)", "Interpretación", "Conducta"]}
          accentCol={0}
          rows={[
            ["< 105", "Predice éxito de destete (alto VPN)", "Favorece proceder a SBT/extubación"],
            ["≈ 100–105", "Zona umbral clásica de Yang-Tobin", "Interpretar con el resto del cuadro"],
            ["> 105", "Predice fracaso del destete", "Revalorar causa; no extubar solo por índice"],
          ]}
        />
        <Src>Yang KL, Tobin MJ. N Engl J Med 1991;324(21):1445-1450.</Src>
        <Callout variant="warn">
          El RSBI es una <b>ayuda, no un veredicto</b>. Su fortaleza es el valor predictivo
          negativo; como criterio aislado tiene rendimiento limitado y no debe indicar ni
          contraindicar extubación por sí solo. Se distorsiona si se mide con presión de soporte
          (infraestima el índice). Las guías ATS/ACCP <b>no</b> recomiendan usarlo como cribado
          único que retrase la SBT.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Prueba de fuga del balón (cuff leak test)">
        <P>
          Estima el riesgo de estridor / edema laríngeo post-extubación por obstrucción glótica.
          Con el paciente en volumen control, se compara el Vt inspirado con el espirado tras
          desinflar el balón (o se mide en varios ciclos y se promedia). Una fuga <b>pequeña</b>{" "}
          sugiere poco espacio alrededor del tubo → mayor riesgo de estridor.
        </P>
        <Table
          headers={["Medida", "Umbral de riesgo", "Notas"]}
          accentCol={1}
          rows={[
            [
              "Fuga absoluta",
              "< 110 mL",
              "Vt insp − Vt esp (media de los 3 valores más bajos de 6 ciclos)",
            ],
            [
              "Fuga relativa (%)",
              "< 10–15%",
              "(Vt insp − Vt esp) / Vt insp × 100",
            ],
          ]}
        />
        <Src>
          Miller RL, Cole RP. Chest 1996;110:1035-1040. · Ochoa ME, et al. Intensive Care Med
          2009;35:1171-1179 (metaanálisis). · Girard TD, et al. Chest 2017 (ATS/ACCP).
        </Src>
        <Callout variant="info">
          ATS/ACCP 2017 sugiere realizar la prueba de fuga solo en pacientes de{" "}
          <b>alto riesgo</b> de estridor (intubación traumática, &gt; 6 días de ventilación, tubo
          grande, mujer, reintubación previa). En quienes <b>fallan</b> la prueba pero se van a
          extubar, se sugiere <b>corticoides sistémicos ≥ 4 h antes</b> de la extubación
          (recomendación condicional).
        </Callout>
        <Callout variant="warn">
          Una prueba de fuga &quot;negativa&quot; (poca fuga) <b>no obliga</b> a posponer la
          extubación por sí sola: baja especificidad y falsos positivos frecuentes. Integrarla con
          el contexto clínico y disponer del carro de vía aérea difícil.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Extubación de alto riesgo y algoritmo (DAS 2012)">
        <P>
          La Difficult Airway Society estratifica la extubación en <b>bajo riesgo</b> (vía aérea
          normal, ayuno, sin factores de riesgo) y <b>alto riesgo</b> (vía aérea difícil conocida o
          que empeoró, obesidad/SAOS, riesgo de aspiración, edema, sangrado, acceso restringido,
          patología quirúrgica cervical). El principio central: extubar es una <b>maniobra
          electiva</b>, planificada, no un reflejo al final del caso.
        </P>
        <Table
          headers={["Paso DAS", "Contenido"]}
          rows={[
            ["1 · Planear", "Evaluar vía aérea y factores de riesgo generales; decidir bajo vs. alto riesgo"],
            ["2 · Preparar", "Optimizar paciente (despierto, hemodinámica, reversión NM confirmada con TOF ≥ 0.9), equipo, contexto y personal"],
            [
              "3 · Ejecutar",
              "Bajo riesgo: extubación despierto/despierta estándar. Alto riesgo: técnicas avanzadas — extubación despierto, catéter de intercambio (AEC), remifentanilo, o postergar/traqueostomía",
            ],
            ["4 · Cuidado post", "Recuperación, monitorización, personal y comunicación; plan de re-intubación disponible"],
          ]}
        />
        <Src>Popat M, et al. DAS Guidelines for management of tracheal extubation. Anaesthesia 2012;67:318-340.</Src>
        <Callout variant="danger">
          Confirmar reversión del bloqueo neuromuscular antes de extubar:{" "}
          <b>TOF ratio ≥ 0.9</b> por monitorización cuantitativa. La curarización residual es causa
          prevenible de obstrucción, hipoxemia y reintubación en el postoperatorio inmediato.
          <br />
          <span className="mono" style={{ fontSize: "0.62rem", color: "var(--text-3)" }}>
            Brull SJ, Kopman AF. Anesthesiology 2017;126:173-190. · Guías ESA de bloqueo neuromuscular 2023.
          </span>
        </Callout>
        <Callout variant="info">
          En vía aérea difícil de alto riesgo, un <b>catéter de intercambio de vía aérea (AEC)</b>{" "}
          dejado in situ permite reoxigenar y reintubar de forma guiada si falla la extubación. Es
          una de las recomendaciones específicas del algoritmo DAS de alto riesgo.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Predictores de reintubación / fracaso de extubación">
        <P>
          El fracaso de extubación (reintubación &lt; 48–72 h) se asocia a mayor mortalidad, estancia
          y traqueostomía. No es lo mismo que fallar la SBT: aquí el paciente pasó la prueba pero no
          tolera estar sin tubo. La tasa típica en UCI es ~10–20%.
        </P>
        <Table
          headers={["Categoría", "Predictores"]}
          rows={[
            ["Vía aérea / secreciones", "Tos débil (pico flujo tosido < 60 L/min), secreciones abundantes (aspiración frecuente), fuga de balón baja / estridor"],
            ["Neurológico", "GCS bajo / delírium, incapacidad de seguir órdenes, protección de vía aérea dudosa"],
            ["Respiratorio", "Balance de líquidos positivo, RSBI alto, edad avanzada, ventilación prolongada, EPOC"],
            ["Cardíaco", "Insuficiencia cardíaca, edema pulmonar por destete (weaning-induced pulmonary edema)"],
          ]}
        />
        <Src>
          Thille AW, et al. Am J Respir Crit Care Med 2011;183:1294-1302. · Rothaar RC, Epstein SK.
          Curr Opin Crit Care 2003;9:59-66. · Khamiees M, et al. Chest 2001;120:1262-1270.
        </Src>
        <Callout variant="info">
          Regla práctica &quot;de los tres&quot; para tolerar la extubación tras SBT exitosa:{" "}
          <b>tos eficaz</b>, <b>secreciones manejables</b> y <b>sensorio adecuado</b> para proteger
          la vía aérea. La suma de varios factores de riesgo pesa más que cualquiera aislado.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Soporte post-extubación (VNI / HFNC profilácticos)">
        <P>
          En pacientes seleccionados de alto riesgo, aplicar soporte no invasivo de forma{" "}
          <b>profiláctica</b> (inmediatamente tras extubar, no esperar al fracaso) reduce la
          reintubación. Usar VNI de <b>rescate</b> una vez ya instaurada la insuficiencia
          respiratoria postextubación puede retrasar la reintubación y empeorar el pronóstico.
        </P>
        <Table
          headers={["Estrategia", "Indicación", "Evidencia"]}
          rows={[
            [
              "VNI profiláctica",
              "Alto riesgo: EPOC, hipercapnia, insuficiencia cardíaca, obesidad",
              "Reduce reintubación en alto riesgo (ATS/ACCP 2017, recom. condicional)",
            ],
            [
              "HFNC (cánula alto flujo)",
              "Riesgo bajo–moderado; alternativa/complemento en alto riesgo",
              "No inferior o superior a VNI en algunos grupos (Hernández 2016)",
            ],
            [
              "HFNC + VNI alternante",
              "Muy alto riesgo (p.ej. obesidad + hipercapnia)",
              "Menor reintubación vs. HFNC solo (Thille HIGH-WEAN 2019)",
            ],
            [
              "VNI de rescate",
              "Insuficiencia respiratoria ya establecida post-extubación",
              "No recomendada de rutina — puede retrasar reintubación (Esteban 2004)",
            ],
          ]}
        />
        <Src>
          Ouellette DR, et al. Chest 2017;151:166-180. · Hernández G, et al. JAMA
          2016;315(13):1354-1361. · Rochwerg B, et al. Eur Respir J 2017;50:1602426. · Thille AW,
          et al. JAMA 2019;322(15):1465-1475. · Esteban A, et al. N Engl J Med 2004;350:2452-2460.
        </Src>
        <Callout variant="warn">
          El soporte profiláctico <b>no sustituye</b> una indicación de extubación bien tomada:
          extubar a un paciente que no debía extubarse y &quot;taparlo&quot; con VNI/HFNC solo
          retrasa el desenlace. La herramienta apoya a la decisión correcta, no la reemplaza.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Resumen de umbrales clave">
        <Table
          headers={["Parámetro", "Umbral", "Fuente"]}
          accentCol={1}
          rows={[
            ["RSBI (FR/Vt en L)", "< 105 predice éxito", "Yang-Tobin 1991"],
            ["PaO₂/FiO₂ para destete", "≥ 150–200", "ESA/ERS 2007"],
            ["PEEP / FiO₂", "≤ 5–8 cmH₂O / ≤ 0.4–0.5", "ATS/ACCP 2017"],
            ["Duración SBT", "30–120 min", "ATS/ACCP 2017"],
            ["SBT preferida (1.er intento)", "PSV 5–8 cmH₂O", "ATS/ACCP 2017"],
            ["Cuff leak absoluto", "< 110 mL = riesgo", "Miller-Cole 1996"],
            ["Cuff leak relativo", "< 10–15% = riesgo", "Ochoa 2009"],
            ["TOF pre-extubación", "≥ 0.9", "ESA / Brull-Kopman 2017"],
            ["pH mínimo", "≥ 7.25", "MacIntyre 2001"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="09" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Ouellette DR, et al. Liberation from Mechanical Ventilation in Critically Ill Adults: An Official ATS/ACCP Clinical Practice Guideline. Chest 2017;151(1):166-180.</li>
          <li>Schmidt GA, et al. Official ERS/ATS Clinical Practice Guidelines — SBT technique. Am J Respir Crit Care Med 2017;195(1):115-119.</li>
          <li>Popat M, Mitchell V, Dravid R, et al. DAS Guidelines for the management of tracheal extubation. Anaesthesia 2012;67(3):318-340.</li>
          <li>Yang KL, Tobin MJ. A prospective study of indexes predicting the outcome of trials of weaning from mechanical ventilation (RSBI). N Engl J Med 1991;324(21):1445-1450.</li>
          <li>Boles JM, Bion J, Connors A, et al. Weaning from mechanical ventilation. Eur Respir J 2007;29(5):1033-1056.</li>
          <li>MacIntyre NR, et al. Evidence-based guidelines for weaning and discontinuing ventilatory support. Chest 2001;120(6 Suppl):375S-395S.</li>
          <li>Subirà C, et al. Effect of Pressure Support vs T-Piece Ventilation Strategies (SBT). JAMA 2019;321(22):2175-2182.</li>
          <li>Girard TD, et al. Efficacy and safety of a paired sedation and ventilator weaning protocol (ABC trial). Lancet 2008;371:126-134.</li>
          <li>Miller RL, Cole RP. Association between reduced cuff leak volume and postextubation stridor. Chest 1996;110:1035-1040.</li>
          <li>Ochoa ME, et al. Cuff-leak test for the diagnosis of upper airway obstruction: meta-analysis. Intensive Care Med 2009;35:1171-1179.</li>
          <li>Thille AW, et al. Outcomes of extubation failure in medical ICU patients. Am J Respir Crit Care Med 2011;183(10):1294-1302.</li>
          <li>Khamiees M, et al. Predictors of extubation outcome in patients who successfully completed an SBT. Chest 2001;120(4):1262-1270.</li>
          <li>Hernández G, et al. High-Flow Nasal Cannula vs Conventional Oxygen Therapy post-extubation. JAMA 2016;315(13):1354-1361.</li>
          <li>Rochwerg B, et al. Official ERS/ATS clinical practice guidelines: NIV. Eur Respir J 2017;50:1602426.</li>
          <li>Thille AW, et al. Effect of Postextubation HFNC + NIV vs HFNC (HIGH-WEAN). JAMA 2019;322(15):1465-1475.</li>
          <li>Esteban A, et al. Noninvasive positive-pressure ventilation for respiratory failure after extubation. N Engl J Med 2004;350(24):2452-2460.</li>
          <li>Brull SJ, Kopman AF. Current Status of Neuromuscular Reversal and Monitoring. Anesthesiology 2017;126(1):173-190.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// umbrales y rangos de literatura aceptada (ATS/ACCP 2017, DAS 2012, ESA/ERS)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// pasar la SBT es un examen; extubar es aplicar lo aprendido con el carro de vía aérea a mano"}
          <br />
          {"// la responsabilidad clínica final es del profesional"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
