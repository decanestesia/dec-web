import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — NVPO (náusea y vómito postoperatorios)
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: score de Apfel, estrategia multimodal y dosis
// tomadas de la guía de consenso SAMBA (Gan TJ, et al. 2020) y
// literatura aceptada. Cada dato lleva referencia. No inventar dosis.
// Fuentes primarias:
//  - Gan TJ, Belani KG, Bergese S, et al. Fourth Consensus
//    Guidelines for the Management of Postoperative Nausea and
//    Vomiting. Anesth Analg 2020;131(2):411-448 (SAMBA).
//  - Apfel CC, et al. A simplified risk score for predicting PONV.
//    Anesthesiology 1999;91(3):693-700.
//  - Apfel CC, et al. A factorial trial of six interventions for
//    PONV (IMPACT). N Engl J Med 2004;350(24):2441-2451.
// ============================================================

export const metadata: Metadata = {
  title: "NVPO: profilaxis y rescate — Guía clínica — DEC",
  description:
    "Manejo de náusea y vómito postoperatorios (NVPO): score de Apfel, estrategia multimodal según número de factores de riesgo, dosis profilácticas (ondansetrón, dexametasona, droperidol, haloperidol, aprepitant, escopolamina) y rescate con clase distinta. Consenso SAMBA (Gan 2020).",
  openGraph: {
    title: "NVPO: profilaxis y rescate — Guía clínica — DEC",
    description:
      "Score de Apfel, profilaxis multimodal por número de factores de riesgo, dosis exactas y rescate con clase farmacológica distinta. SAMBA 2020.",
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
export default function NvpoManejoPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat nvpo-manejo.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          NVPO: profilaxis y rescate
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          score de Apfel · profilaxis multimodal · dosis · rescate · técnicas anestésicas
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// la cirugía salió perfecta; el paciente solo recordará que vomitó en recuperación"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">REFERENCIA</span>
          <span className="tag tag-muted">SAMBA 2020</span>
          <span className="tag tag-muted">Apfel 1999</span>
        </div>
      </header>

      <Callout variant="info">
        La estrategia moderna es <b>multimodal y proporcional al riesgo</b>: estimar el riesgo con el
        score de Apfel, reducir el riesgo basal (anestesia con menos factores emetogénicos) y sumar
        antieméticos de <b>clases farmacológicas distintas</b> según el número de factores. En
        pacientes de riesgo moderado-alto la guía SAMBA 2020 recomienda dar profilaxis con{" "}
        <b>≥ 2 fármacos de mecanismos diferentes</b> de rutina.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Score de Apfel (riesgo de NVPO en adulto)">
        <P>
          El score simplificado de Apfel estima el riesgo de NVPO en las primeras 24 h con{" "}
          <b>cuatro factores</b>, cada uno suma 1 punto. Es la herramienta de estratificación
          recomendada por SAMBA para el adulto. El riesgo sube de forma casi lineal con el número
          de factores presentes.
        </P>
        <Table
          headers={["Factor de riesgo", "Puntos"]}
          accentCol={1}
          rows={[
            ["Sexo femenino", "1"],
            ["No fumador", "1"],
            ["Antecedente de NVPO o cinetosis (mareo por movimiento)", "1"],
            ["Uso previsto de opioides postoperatorios", "1"],
          ]}
        />
        <Src>Apfel CC, et al. Anesthesiology 1999;91(3):693-700. · Gan TJ, et al. Anesth Analg 2020;131:411-448.</Src>
        <Table
          headers={["Puntos", "Riesgo aprox. de NVPO a 24 h", "Categoría"]}
          accentCol={1}
          rows={[
            ["0", "≈ 10%", "Bajo"],
            ["1", "≈ 20%", "Bajo"],
            ["2", "≈ 40%", "Moderado"],
            ["3", "≈ 60%", "Alto"],
            ["4", "≈ 80%", "Muy alto"],
          ]}
        />
        <Src>Apfel CC, et al. Anesthesiology 1999;91(3):693-700 (probabilidades del modelo simplificado).</Src>
        <Callout variant="warn">
          El score es una <b>ayuda</b>, no un veredicto. Otros factores emetogénicos independientes:
          cirugía (laparoscópica, ginecológica, colecistectomía, bariátrica, estrabismo), anestesia
          general con volátiles/N₂O, dosis alta de opioides y duración anestésica. Úsalo para{" "}
          <b>decidir cuántas clases</b> de antieméticos añadir, no como cifra rígida.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Estrategia multimodal por número de factores">
        <P>
          SAMBA 2020 abandonó el umbral estricto y recomienda un enfoque <b>liberal y multimodal</b>:
          reducir siempre el riesgo basal y sumar antieméticos profilácticos de clases distintas
          escalando con el riesgo. En pacientes con 1-2 factores ya se recomienda profilaxis con 1-2
          fármacos; con ≥ 3 factores, ≥ 2 fármacos más medidas de reducción de riesgo basal.
        </P>
        <Table
          headers={["Factores (Apfel)", "Riesgo", "Conducta profiláctica"]}
          rows={[
            [
              "0-1",
              "Bajo",
              "Reducir riesgo basal. Considerar 1 antiemético (p. ej. dexametasona u ondansetrón); muchos centros ya dan profilaxis a todos.",
            ],
            [
              "2",
              "Moderado",
              "Reducir riesgo basal + 2 antieméticos de clases distintas (típico: dexametasona al inicio + ondansetrón al final).",
            ],
            [
              "3",
              "Alto",
              "Reducir riesgo basal + 2-3 antieméticos de clases distintas. Considerar TIVA con propofol.",
            ],
            [
              "≥ 4",
              "Muy alto",
              "TIVA con propofol + 2-3 antieméticos de clases distintas; considerar aprepitant y medidas no farmacológicas (P6).",
            ],
          ]}
        />
        <Src>Gan TJ, et al. Anesth Analg 2020;131:411-448 (algoritmo multimodal SAMBA).</Src>
        <Callout variant="info">
          <b>Reducción del riesgo basal</b> (base de todo el algoritmo): anestesia regional cuando sea
          posible · TIVA con propofol · evitar N₂O y volátiles · minimizar opioides (analgesia
          multimodal) · hidratación adecuada · manejar la ansiedad. Sumar fármacos sobre un riesgo
          basal alto rinde menos que bajar ese riesgo de entrada.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Fármacos y dosis profilácticas">
        <P>
          Antieméticos profilácticos de primera línea con su dosis y momento óptimo de
          administración. La clave del multimodal es <b>combinar clases (mecanismos) distintos</b>:
          no sirve doblar el mismo receptor.
        </P>
        <Table
          headers={["Fármaco", "Clase / diana", "Dosis profiláctica (adulto)", "Momento"]}
          accentCol={2}
          rows={[
            [
              "Ondansetrón",
              "Antagonista 5-HT₃",
              "4 mg IV",
              "Al final de la cirugía",
            ],
            [
              "Dexametasona",
              "Corticoide",
              "4-8 mg IV",
              "Al inicio / tras inducción",
            ],
            [
              "Droperidol",
              "Antagonista D₂ (butirofenona)",
              "0.625-1.25 mg IV",
              "Al final de la cirugía",
            ],
            [
              "Haloperidol",
              "Antagonista D₂ (butirofenona)",
              "0.5-1 mg IV/IM",
              "Inducción o final",
            ],
            [
              "Aprepitant",
              "Antagonista NK-1",
              "40 mg VO",
              "1-3 h antes de la inducción",
            ],
            [
              "Escopolamina",
              "Anticolinérgico (parche transdérmico)",
              "Parche transdérmico",
              "Noche previa o ≥ 2-4 h antes",
            ],
            [
              "Metoclopramida",
              "Antagonista D₂ (procinético)",
              "10 mg IV (evidencia débil a esta dosis)",
              "Al final de la cirugía",
            ],
          ]}
        />
        <Src>Gan TJ, et al. Anesth Analg 2020;131:411-448 (dosis y momento de administración recomendados).</Src>
        <Callout variant="warn">
          <b>Combinar mecanismos, no repetir.</b> Ondansetrón (5-HT₃) + dexametasona (corticoide) es
          la dupla de base más usada. Añadir droperidol/haloperidol (D₂) o aprepitant (NK-1) como
          tercer mecanismo en alto riesgo. Dos antagonistas D₂ juntos (p. ej. droperidol +
          haloperidol o + metoclopramida) suman efectos adversos sin ganar eficacia proporcional.
        </Callout>
        <Callout variant="danger">
          <b>Prolongación del QT y riesgo D₂:</b> droperidol y haloperidol prolongan el QT
          (droperidol lleva <i>black box</i> de la FDA a dosis altas; las dosis antieméticas
          0.625-1.25 mg son bajas y bien toleradas). Vigilar QT, evitar en QT largo conocido y en
          combinación con otros fármacos que prolonguen el QT o antagonistas D₂ (síntomas
          extrapiramidales). El ondansetrón también prolonga el QT de forma dosis-dependiente.
        </Callout>
        <Callout variant="info">
          <b>Metoclopramida</b> es un antiemético <b>débil</b> a la dosis clásica de 10 mg y no se
          recomienda como profilaxis de rutina en SAMBA 2020. La <b>dexametasona</b> se da al inicio
          porque su efecto antiemético tarda en instaurarse; el <b>ondansetrón</b> se da al final
          por su vida media relativamente corta, para cubrir el postoperatorio inmediato.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Rescate del NVPO establecido">
        <P>
          Ante NVPO ya instaurado en recuperación, la regla central de SAMBA es{" "}
          <b>usar un antiemético de una clase farmacológica DISTINTA a la usada en profilaxis</b>.
          Repetir la misma clase (o el mismo fármaco) dentro de las primeras 6 h aporta poco: el
          receptor ya está ocupado.
        </P>
        <Table
          headers={["Situación", "Rescate recomendado"]}
          rows={[
            [
              "Profilaxis con ondansetrón (5-HT₃)",
              "Elegir OTRA clase: droperidol/haloperidol (D₂), o dexametasona si no se dio.",
            ],
            [
              "Profilaxis con dexametasona (corticoide)",
              "Añadir un 5-HT₃ (ondansetrón 1 mg) o un D₂.",
            ],
            [
              "Sin profilaxis previa",
              "Iniciar con ondansetrón 1 mg IV (dosis de tratamiento) como primera línea 5-HT₃.",
            ],
            [
              "NVPO recurrente a pesar de rescate",
              "Rotar de nuevo a otra clase distinta; considerar aprepitant, propofol subhipnótico o P6.",
            ],
          ]}
        />
        <Src>Gan TJ, et al. Anesth Analg 2020;131:411-448 (principio de rescate por clase distinta).</Src>
        <Callout variant="ok">
          <b>Dosis de rescate del ondansetrón: 1 mg IV.</b> La dosis eficaz para tratar el NVPO ya
          establecido es menor que la profiláctica (4 mg). Si ya se administró ondansetrón profiláctico,
          no volver a darlo dentro de las primeras ~6 h: cambiar de clase.
        </Callout>
        <Callout variant="warn">
          <b>Repetir la misma clase antes de 6 h no funciona.</b> Si el paciente recibió profilaxis
          con ondansetrón y vomita a la hora, dar otro ondansetrón rinde poco: escoge un antagonista
          D₂ (droperidol/haloperidol) u otra clase disponible.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Técnicas anestésicas y medidas no farmacológicas">
        <P>
          Antes y además de los fármacos, la elección anestésica modifica el riesgo. Estas medidas
          son la base del algoritmo multimodal y su efecto se suma al de los antieméticos.
        </P>
        <Table
          headers={["Medida", "Efecto sobre NVPO"]}
          rows={[
            [
              "TIVA con propofol",
              "Reduce el NVPO frente a mantenimiento con volátiles (propofol tiene efecto antiemético intrínseco).",
            ],
            [
              "Evitar N₂O",
              "El óxido nitroso es emetogénico; retirarlo reduce el NVPO.",
            ],
            [
              "Evitar / minimizar volátiles",
              "Los anestésicos halogenados son la principal causa de NVPO temprano; su efecto es dosis-dependiente.",
            ],
            [
              "Minimizar opioides",
              "Analgesia multimodal (AINEs, paracetamol, regional, dexametasona, sulfato de magnesio) para reducir opioides emetógenos.",
            ],
            [
              "Hidratación adecuada",
              "La reposición de líquidos (evitar la hipovolemia) reduce el NVPO.",
            ],
            [
              "Estimulación P6 (pericardio 6)",
              "La acupresión/estimulación del punto P6 en la muñeca reduce el NVPO; equivalente a un antiemético como componente multimodal.",
            ],
          ]}
        />
        <Src>Gan TJ, et al. Anesth Analg 2020;131:411-448. · Apfel CC, et al. N Engl J Med 2004;350:2441-2451 (IMPACT).</Src>
        <Callout variant="info">
          En el ensayo factorial IMPACT (Apfel 2004) cada intervención (ondansetrón, dexametasona,
          droperidol, propofol, evitar N₂O) reducía el riesgo de NVPO de forma{" "}
          <b>aproximadamente independiente y aditiva</b> (~26% de reducción relativa cada una). De ahí
          la lógica de <b>sumar</b> medidas de mecanismo distinto en el paciente de alto riesgo.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Resumen de dosis clave">
        <Table
          headers={["Fármaco", "Dosis", "Uso"]}
          accentCol={1}
          rows={[
            ["Ondansetrón (profilaxis)", "4 mg IV al final", "5-HT₃ · primera línea"],
            ["Ondansetrón (rescate)", "1 mg IV", "Dosis de tratamiento < profiláctica"],
            ["Dexametasona", "4-8 mg IV al inicio", "Corticoide · dupla de base"],
            ["Droperidol", "0.625-1.25 mg IV", "D₂ · vigilar QT"],
            ["Haloperidol", "0.5-1 mg IV/IM", "D₂ · vigilar QT"],
            ["Aprepitant", "40 mg VO antes de inducción", "NK-1 · muy alto riesgo"],
            ["Escopolamina", "Parche transdérmico", "Anticolinérgico · ≥ 2-4 h antes"],
            ["Metoclopramida", "10 mg IV (débil)", "D₂ · no de rutina"],
          ]}
        />
        <Src>Gan TJ, et al. Anesth Analg 2020;131(2):411-448 (SAMBA Fourth Consensus Guidelines).</Src>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Gan TJ, Belani KG, Bergese S, et al. Fourth Consensus Guidelines for the Management of Postoperative Nausea and Vomiting. Anesth Analg 2020;131(2):411-448.</li>
          <li>Apfel CC, Läärä E, Koivuranta M, et al. A simplified risk score for predicting postoperative nausea and vomiting. Anesthesiology 1999;91(3):693-700.</li>
          <li>Apfel CC, Korttila K, Abdalla M, et al. A factorial trial of six interventions for the prevention of postoperative nausea and vomiting (IMPACT). N Engl J Med 2004;350(24):2441-2451.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y umbrales de literatura aceptada (SAMBA · Gan 2020 · Apfel 1999/2004)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// profilaxis = clases distintas sumadas; rescate = clase distinta a la profilaxis"}
          <br />
          {"// el paciente perdona el dolor antes que el vómito — profilaxa como si te fuera la encuesta"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
