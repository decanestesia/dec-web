import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Algoritmo de vía aérea — Enfoque Vortex (CICO)
// Server Component (referencia estática, sin estado).
// Ayuda cognitiva para crisis de vía aérea (Chrimes 2016).
// EXACTITUD CLÍNICA: estructura y umbrales de vortexapproach.org
// y guías de sociedad (DAS 2015, ASA 2022). No inventar cifras.
// ============================================================

export const metadata: Metadata = {
  title: "Enfoque Vortex (CICO) — Algoritmo de vía aérea — DEC",
  description:
    "Ayuda cognitiva Vortex para crisis de vía aérea: tres líneas de vida no jerárquicas (mascarilla facial, dispositivo supraglótico, tubo endotraqueal), máximo 3 intentos por línea, cinco optimizaciones, green zone y transición a CICO/eFONA. Chrimes 2016, DAS 2015, ASA 2022.",
  openGraph: {
    title: "Enfoque Vortex (CICO) — Algoritmo de vía aérea — DEC",
    description:
      "Tres líneas de vida no jerárquicas, cinco optimizaciones y transición a eFONA en el escenario No-Ventilable/No-Intubable (CICO).",
    type: "article",
  },
};

// ------------------------------------------------------------
// Tipos de datos de la guía
// ------------------------------------------------------------
type Cell = string;

interface RefTable {
  headers: string[];
  rows: Cell[][];
}

type CalloutVariant = "info" | "warn" | "danger" | "ok";

// ------------------------------------------------------------
// Colores de callout (mismo mapa que blog/[slug])
// ------------------------------------------------------------
const CALLOUT: Record<CalloutVariant, { border: string; icon: string }> = {
  info: { border: "var(--cyan)", icon: "ℹ" },
  warn: { border: "var(--amber)", icon: "⚠" },
  danger: { border: "var(--red)", icon: "⛔" },
  ok: { border: "var(--accent)", icon: "✓" },
};

// ------------------------------------------------------------
// Componentes de presentación
// ------------------------------------------------------------
function SectionHeader({ label, note }: { label: string; note?: string }) {
  return (
    <div style={{ margin: "2.5rem 0 1rem" }}>
      <h2
        className="mono"
        style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--accent)",
          margin: 0,
          paddingBottom: "0.4rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {label}
      </h2>
      {note ? (
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.58rem",
            marginTop: "0.4rem",
            opacity: 0.7,
          }}
        >
          {note}
        </p>
      ) : null}
    </div>
  );
}

function DataTable({ table }: { table: RefTable }) {
  return (
    <div
      style={{
        overflowX: "auto",
        margin: "0 0 1.25rem",
        border: "1px solid var(--border)",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
        <thead>
          <tr style={{ background: "var(--bg-3)" }}>
            {table.headers.map((h, i) => (
              <th
                key={i}
                className="mono"
                style={{
                  textAlign: "left",
                  padding: "0.5rem 0.7rem",
                  fontSize: "0.58rem",
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
          {table.rows.map((row, ri) => (
            <tr key={ri} style={{ borderTop: "1px solid var(--border)" }}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={ci === 0 ? "mono" : undefined}
                  style={{
                    padding: "0.5rem 0.7rem",
                    fontSize: ci === 0 ? "0.7rem" : "0.78rem",
                    verticalAlign: "top",
                    color: ci === 0 ? "var(--text-0)" : "var(--text-1)",
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

function Callout({
  variant,
  children,
}: {
  variant: CalloutVariant;
  children: React.ReactNode;
}) {
  const c = CALLOUT[variant];
  return (
    <div
      className="panel"
      style={{ borderLeft: `3px solid ${c.border}`, margin: "1.25rem 0" }}
    >
      <div
        className="panel-body"
        style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}
      >
        <span style={{ color: c.border, fontSize: "0.9rem", flexShrink: 0 }}>
          {c.icon}
        </span>
        <div style={{ color: "var(--text-1)", fontSize: "0.8rem", lineHeight: 1.65 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Ficha de línea de vida: panel con nombre + optimizaciones
function LifelineCard({
  code,
  name,
  subtitle,
  rows,
}: {
  code: string;
  name: string;
  subtitle: string;
  rows: [string, string][];
}) {
  return (
    <div className="panel" style={{ marginBottom: "1rem" }}>
      <div className="panel-header">
        <span className="dot" /> {code} · {name}
      </div>
      <div className="panel-body" style={{ display: "grid", gap: "0.5rem" }}>
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.58rem",
            margin: "0 0 0.25rem",
            opacity: 0.75,
          }}
        >
          {subtitle}
        </p>
        {rows.map(([label, value], i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: "0.75rem",
              paddingBottom: "0.4rem",
              borderBottom:
                i === rows.length - 1 ? "none" : "1px solid var(--border)",
            }}
          >
            <span
              className="mono"
              style={{
                color: "var(--text-2)",
                fontSize: "0.62rem",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                flexShrink: 0,
                maxWidth: "42%",
              }}
            >
              {label}
            </span>
            <span
              style={{
                color: "var(--text-1)",
                fontSize: "0.78rem",
                textAlign: "right",
                lineHeight: 1.5,
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Página
// ------------------------------------------------------------
export default function VortexPage() {
  return (
    <div
      className="wrap"
      style={{ paddingTop: "1.75rem", paddingBottom: "3rem", maxWidth: 860, margin: "0 auto" }}
    >
      {/* Migas */}
      <Link
        href="/guias"
        className="mono"
        style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}
      >
        ← /guias
      </Link>

      {/* Header estándar */}
      <div style={{ margin: "1rem 0 1.5rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat vortex-cico.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Enfoque Vortex (CICO)
        </h1>
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.65rem",
            marginTop: "0.4rem",
            lineHeight: 1.7,
          }}
        >
          ayuda cognitiva · tres líneas de vida · máx. 3 intentos · green zone · eFONA
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// el vórtice no tiene jerarquía; el reloj de la SpO₂ sí"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">ALGORITMO</span>
          <span className="tag tag-muted">Chrimes 2016</span>
          <span className="tag tag-muted">DAS 2015</span>
          <span className="tag tag-muted">ASA 2022</span>
        </div>
      </div>

      {/* Aviso de encuadre */}
      <Callout variant="info">
        El <b>Vortex</b> es una ayuda cognitiva de alto rendimiento para la crisis de vía
        aérea: una sola herramienta que sirve para cualquier escenario (electivo,
        despierto, urgente) y para cualquier operador. Su objetivo no es &quot;intubar&quot;
        sino <b>lograr oxigenación alveolar</b> por cualquiera de tres vías no
        jerárquicas. Cuando las tres fallan pese a optimización, se declara{" "}
        <b>CICO</b> y se ejecuta un acceso quirúrgico frontal del cuello (eFONA) sin
        más demora.{" "}
        <span className="mono" style={{ fontSize: "0.68rem" }}>
          Chrimes N. Br J Anaesth 2016;117(Suppl 1):i20-i27.
        </span>
      </Callout>

      {/* ==================== CONCEPTO ==================== */}
      <SectionHeader
        label="1 · El modelo del vórtice"
        note="// el objetivo es oxigenar, no ganar la discusión sobre qué dispositivo prefieres"
      />

      <p style={{ color: "var(--text-1)", fontSize: "0.9rem", lineHeight: 1.75, margin: "0 0 1rem" }}>
        Imagina un embudo. El <b>anillo exterior</b> (borde del vórtice) es la{" "}
        <b>green zone</b>: oxigenación alveolar lograda por al menos una línea de vida.
        Es una zona de seguridad relativa donde el tiempo se detiene: puedes pensar,
        pedir ayuda, planear y decidir el destino (despertar, intubación despierta,
        traqueostomía electiva, continuar). Cada intento fallido de una línea{" "}
        <b>espirala hacia el centro</b>. El <b>centro del vórtice</b> es el punto en que
        las tres líneas han fallado: <b>CICO</b> (Can&apos;t Intubate, Can&apos;t
        Oxygenate). Del centro solo sale un camino: <b>eFONA</b>.
      </p>

      <DataTable
        table={{
          headers: ["Zona", "Estado", "Conducta"],
          rows: [
            [
              "Green zone (borde)",
              "Oxigenación alveolar lograda (≥ 1 línea funciona).",
              "Detener la espiral. Pensar, pedir ayuda, optimizar, planear destino.",
            ],
            [
              "Espiral",
              "Intentos en curso; sin oxigenación estable todavía.",
              "Optimizar cada línea; máximo 3 intentos por línea antes de rotar.",
            ],
            [
              "Centro del vórtice",
              "Las tres líneas fallaron pese a optimización = CICO.",
              "Declarar CICO en voz alta → eFONA inmediato, sin nuevo intento.",
            ],
          ],
        }}
      />

      <Callout variant="ok">
        <b>Green zone = oxígeno, no dispositivo.</b> Estar en green zone significa que
        el paciente se oxigena por la vía que sea (mascarilla, SGA o tubo). No exige un
        tubo endotraqueal. Cualquier línea que mantenga la SpO₂ te compra tiempo para
        replanear con la cabeza fría.
      </Callout>

      {/* ==================== LÍNEAS DE VIDA ==================== */}
      <SectionHeader
        label="2 · Las tres líneas de vida (no jerárquicas)"
        note="// no hay orden fijo: usa la que tenga más probabilidad de oxigenar en TU contexto"
      />

      <Callout variant="info">
        Las tres líneas son <b>no jerárquicas</b>: no hay un orden obligatorio. Se
        elige según el escenario y la pericia. Lo obligatorio es el <b>límite</b>:
        máximo <b>3 intentos por línea</b>, y cada intento debe cambiar algo (una
        optimización), no repetir lo mismo esperando otro resultado.
      </Callout>

      <LifelineCard
        code="L1"
        name="Mascarilla facial"
        subtitle="Face mask · ventilación con bolsa-mascarilla, la más rápida de instaurar"
        rows={[
          ["Manipulación", "Cabeza/cuello (posición olfateo), subluxar mandíbula, sellado 2 manos"],
          ["Adyuvantes", "Cánula orofaríngea (Guedel) y/o nasofaríngea"],
          ["Tamaño / tipo", "Mascarilla del tamaño correcto; segundo operador para sellado"],
          ["Relajación", "Bloqueo neuromuscular pleno (la rigidez/laringoespasmo impide ventilar)"],
          ["Técnica", "PEEP, retirar presión cricoidea si dificulta, flujo/O₂ 100%"],
        ]}
      />

      <LifelineCard
        code="L2"
        name="Dispositivo supraglótico (SGA)"
        subtitle="Supraglottic airway · máscara laríngea / i-gel; rescate y conducto de intubación"
        rows={[
          ["Manipulación", "Reposicionar, reinsertar, ajustar profundidad; descomprimir estómago"],
          ["Adyuvantes", "SGA de 2.ª generación (canal gástrico); considerar guía"],
          ["Tamaño / tipo", "Cambiar tamaño (uno arriba/abajo) o modelo de SGA"],
          ["Relajación", "Bloqueo neuromuscular pleno para asiento y ventilación"],
          ["Técnica", "Verificar fuga/sellado, presión de inflado, alinear con capnografía"],
        ]}
      />

      <LifelineCard
        code="L3"
        name="Tubo endotraqueal"
        subtitle="Tracheal tube · laringoscopia directa o videolaringoscopia"
        rows={[
          ["Manipulación", "Manipulación laríngea externa (BURP), reposición de cabeza"],
          ["Adyuvantes", "Bougie / guía introductora; estilete; laringoscopia bimanual"],
          ["Tamaño / tipo", "Tubo más pequeño; videolaringoscopio (hoja estándar o angulada)"],
          ["Relajación", "Bloqueo neuromuscular pleno confirmado antes de reintentar"],
          ["Técnica", "Cambiar de operador/dispositivo, aspirar, optimizar ayudas"],
        ]}
      />

      <Callout variant="warn">
        <b>Máximo 3 intentos por línea</b> (regla genérica del Vortex). El límite{" "}
        <b>3 + 1</b> es exclusivo de la <b>línea del tubo</b> (intubación): DAS 2015
        permite 3 intentos del operador + 1 de un colega más experto; <b>no</b> aplica a
        mascarilla ni SGA. Cada intento en la laringe cuesta trauma, edema y sangre, y
        quema tiempo de reserva de O₂. Si una línea no oxigena tras optimizar,{" "}
        <b>rota</b> a otra línea, no insistas.
      </Callout>

      {/* ==================== CINCO OPTIMIZACIONES ==================== */}
      <SectionHeader
        label="3 · Las cinco optimizaciones (por línea)"
        note="// cada nuevo intento cambia una variable; repetir idéntico no es un intento, es una pérdida de tiempo"
      />

      <p style={{ color: "var(--text-1)", fontSize: "0.9rem", lineHeight: 1.75, margin: "0 0 1rem" }}>
        Dentro de cada línea, el Vortex fuerza a revisar cinco categorías de
        optimización antes de abandonarla. Son el checklist mental que convierte un
        intento repetido en un intento <b>distinto</b> y con más probabilidad de éxito.
      </p>

      <DataTable
        table={{
          headers: ["Optimización", "Qué revisar", "Común a las 3 líneas"],
          rows: [
            [
              "Manipulación",
              "Posición de cabeza/cuello, mandíbula, laringe (BURP/MLE), profundidad del dispositivo.",
              "Sí",
            ],
            [
              "Adyuvantes",
              "Cánulas oro/nasofaríngeas, bougie, guías, estilete, canal gástrico del SGA.",
              "Sí",
            ],
            [
              "Tamaño / tipo",
              "Cambiar tamaño o modelo (mascarilla, SGA, hoja, tubo, videolaringoscopio).",
              "Sí",
            ],
            [
              "Relajación",
              "Bloqueo neuromuscular pleno; descartar laringoespasmo/rigidez/tono.",
              "Sí",
            ],
            [
              "Técnica / operador",
              "Cambiar de operador o abordaje; O₂ 100%, aspiración, dos manos, capnografía.",
              "Sí",
            ],
          ],
        }}
      />

      <Callout variant="info">
        <b>Relajación muscular:</b> el bloqueo neuromuscular <b>pleno</b> optimiza las
        tres líneas y puede convertir un &quot;no ventilable&quot; en ventilable
        (laringoespasmo, rigidez). No abandones una línea de vida sin haber asegurado la
        parálisis. En crisis, considerar rocuronio a dosis alta (1.2 mg/kg) para
        condiciones rápidas y completas.
        <br />
        <span className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>
          Frerk C, et al. DAS 2015. Br J Anaesth 2015;115(6):827.
        </span>
      </Callout>

      {/* ==================== CICO / eFONA ==================== */}
      <SectionHeader
        label="4 · Centro del vórtice: CICO → eFONA"
        note="// declarar CICO no es rendirse: es el paso que salva. El único error irreversible es el retraso."
      />

      <Callout variant="danger">
        <b>CICO (Can&apos;t Intubate, Can&apos;t Oxygenate):</b> las tres líneas de
        vida han fallado pese a optimización. Es una emergencia de <b>hipoxia</b>, no de
        intubación. El único tratamiento es el <b>acceso quirúrgico frontal del cuello
        (eFONA — emergency Front Of Neck Access)</b>. <b>Declararlo en voz alta</b>
        moviliza al equipo y autoriza la transición. No hay un nuevo intento de vía
        aérea superior después de declarar CICO.
      </Callout>

      <p style={{ color: "var(--text-1)", fontSize: "0.9rem", lineHeight: 1.75, margin: "0 0 1rem" }}>
        La técnica recomendada por DAS 2015 para el adulto es la{" "}
        <b>cricotiroidotomía quirúrgica con bisturí (scalpel-bougie-tube)</b>: bisturí,
        bougie y tubo. Es la técnica más fiable y enseñable en el paciente que ya está
        anestesiado y no se oxigena.
      </p>

      <DataTable
        table={{
          headers: ["Paso", "Acción", "Detalle"],
          rows: [
            [
              "1 · Declarar",
              "Anunciar CICO en voz alta y pedir set de eFONA.",
              "Rol claro: quien tiene la mano más entrenada realiza el acceso.",
            ],
            [
              "2 · Preparar",
              "Bisturí n.º 10, bougie, tubo 6.0 con balón; O₂ 100%; extender cuello.",
              "Bloqueo neuromuscular pleno confirmado; laringoespasmo abolido.",
            ],
            [
              "3 · Localizar",
              "Palpar membrana cricotiroidea (laryngeal handshake).",
              "Si no palpable (cuello impalpable): incisión vertical de 8–10 cm y disección.",
            ],
            [
              "4 · Incidir",
              "Incisión transversa en la membrana cricotiroidea.",
              "Rotar hoja del bisturí 90°; mantener la vía abierta.",
            ],
            [
              "5 · Bougie + tubo",
              "Deslizar bougie a la tráquea; pasar tubo 6.0 sobre el bougie.",
              "Inflar balón, ventilar, confirmar con capnografía; fijar.",
            ],
          ],
        }}
      />
      <p
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.58rem",
          margin: "-0.5rem 0 1rem",
          opacity: 0.7,
        }}
      >
        Ref: Frerk C, et al. DAS guidelines for management of unanticipated difficult
        intubation in adults 2015. Br J Anaesth 2015;115(6):827-848 (técnica
        scalpel-bougie-tube). · vortexapproach.org (Chrimes N).
      </p>

      <Callout variant="warn">
        <b>La barrera es humana, no técnica.</b> La causa más frecuente de muerte por
        vía aérea no es la falta de destreza quirúrgica: es la demora en <b>declarar</b>{" "}
        CICO y comprometerse con el eFONA (fijación por task / negación / pérdida de
        conciencia situacional). El Vortex existe para romper ese bucle: tres líneas,
        tres intentos, luego el centro.
        <br />
        <span className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>
          Cook TM, et al. NAP4. Br J Anaesth 2011;106(5):617-631.
        </span>
      </Callout>

      {/* ==================== GREEN ZONE / REPLANEO ==================== */}
      <SectionHeader
        label="5 · Green zone: recuperar la oxigenación y replanear"
        note="// en cuanto oxigenes, deja de improvisar y empieza a decidir"
      />

      <p style={{ color: "var(--text-1)", fontSize: "0.9rem", lineHeight: 1.75, margin: "0 0 1rem" }}>
        En cuanto <b>cualquier</b> línea logre oxigenación alveolar, has salido de la
        espiral y estás en la <b>green zone</b>. Ahí el objetivo cambia de{" "}
        <b>rescatar</b> a <b>decidir</b>. No sigas escalando por inercia: estabiliza,
        optimiza y elige el destino con el equipo.
      </p>

      <DataTable
        table={{
          headers: ["Al entrar en green zone", "Acción"],
          rows: [
            ["Confirmar", "Capnografía y SpO₂ sostenidas; línea de vida estable."],
            ["Comunicar", "Anunciar 'estamos en green zone'; recuperar plan compartido."],
            ["Optimizar", "Preoxigenar, aspirar, corregir fisiología, pedir ayuda experta."],
            [
              "Decidir destino",
              "Despertar · intubación despierta/fibrobroncoscopio · SGA como conducto · traqueostomía electiva · postergar.",
            ],
          ],
        }}
      />

      <Callout variant="ok">
        <b>Regla de oro:</b> la green zone es el momento de detenerse y pensar, no de
        celebrar y seguir pinchando. Muchas catástrofes ocurren tras un éxito
        transitorio, al abandonar una línea que oxigenaba para perseguir un tubo que no
        era necesario.
      </Callout>

      {/* ==================== RESUMEN ==================== */}
      <SectionHeader
        label="6 · Resumen operativo"
        note="// lo que cabe en una tarjeta pegada al carro de vía aérea difícil"
      />

      <DataTable
        table={{
          headers: ["Concepto", "Valor / regla", "Fuente"],
          rows: [
            ["Líneas de vida", "3: mascarilla · SGA · tubo (no jerárquicas)", "Chrimes 2016"],
            ["Intentos por línea", "Máximo 3 (intubación: 3 + 1 experto)", "DAS 2015"],
            ["Optimizaciones", "5: manipulación · adyuvantes · tamaño/tipo · relajación · técnica", "Chrimes 2016"],
            ["Centro del vórtice", "CICO = 3 líneas fallidas → eFONA", "Chrimes 2016 / DAS 2015"],
            ["eFONA (adulto)", "Cricotiroidotomía scalpel-bougie-tube (tubo 6.0)", "DAS 2015"],
            ["Relajación en crisis", "Bloqueo NM pleno; rocuronio 1.2 mg/kg", "DAS 2015"],
            ["Green zone", "Oxigenación por cualquier línea → detener y replanear", "Chrimes 2016"],
          ],
        }}
      />

      {/* ==================== FUENTES ==================== */}
      <SectionHeader label="Fuentes" />
      <ul
        className="mono"
        style={{
          margin: "0 0 1.5rem",
          paddingLeft: "1.1rem",
          color: "var(--text-2)",
          fontSize: "0.66rem",
          lineHeight: 1.9,
        }}
      >
        <li>Chrimes N. The Vortex: a universal &apos;high-acuity implementation tool&apos; for emergency airway management. Br J Anaesth 2016;117(Suppl 1):i20-i27.</li>
        <li>vortexapproach.org — The Vortex Approach (Chrimes N). Recurso de la ayuda cognitiva y las tres líneas de vida.</li>
        <li>Frerk C, Mitchell VS, McNarry AF, et al. Difficult Airway Society 2015 guidelines for management of unanticipated difficult intubation in adults. Br J Anaesth 2015;115(6):827-848.</li>
        <li>Apfelbaum JL, et al. 2022 ASA Practice Guidelines for Management of the Difficult Airway. Anesthesiology 2022;136(1):31-81.</li>
        <li>Cook TM, Woodall N, Frerk C. Major complications of airway management in the UK (NAP4). Br J Anaesth 2011;106(5):617-631.</li>
      </ul>

      {/* Disclaimer con humor negro */}
      <footer
        style={{
          marginTop: "2rem",
          paddingTop: "1.25rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.58rem",
            lineHeight: 1.8,
            opacity: 0.65,
            textAlign: "center",
          }}
        >
          {"// estructura y umbrales de literatura aceptada (Chrimes 2016 · DAS 2015 · ASA 2022)"}
          <br />
          {"// ayuda cognitiva educativa — no sustituye entrenamiento, simulacro ni protocolo institucional"}
          <br />
          {"// el eFONA se aprende con las manos antes de necesitarlo, no leyendo esto a las 3am"}
        </p>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <Link href="/guias" className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}>
            ← más guías
          </Link>
        </div>
      </footer>
    </div>
  );
}
