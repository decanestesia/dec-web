import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — PARO CARDÍACO PERIOPERATORIO (ACLS en quirófano)
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: dosis, joules y ratios tomados de literatura
// aceptada (AHA 2020, guía de paro perioperatorio, ASA, ASRA, MHAUS).
// Cada dato lleva referencia (Vancouver breve). No inventar cifras.
// Fuentes primarias:
//  - Panchal AR, et al. 2020 AHA Guidelines for CPR and ECC.
//    Circulation 2020;142(16_suppl_2):S366-S468.
//  - Moitra VK, et al. Cardiac Arrest in the Operating Room:
//    Resuscitation and Management (Part 1/2). Anesth Analg
//    2018;126(3):876-900.
//  - Neal JM, et al. ASRA Checklist for Managing LAST — 2020 update.
//    Reg Anesth Pain Med 2021;46:81-82.
//  - MHAUS. Emergency Therapy for Malignant Hyperthermia (dantroleno).
//  - Truhlář A, et al. ERC Guidelines: Cardiac arrest in special
//    circumstances. Resuscitation 2015;95:148-201.
// ============================================================

export const metadata: Metadata = {
  title: "Paro cardíaco perioperatorio (ACLS en quirófano) — Guía clínica — DEC",
  description:
    "ACLS adaptado a quirófano: RCP de alta calidad, adrenalina 1 mg IV c/3-5 min, desfibrilación 200 J bifásico en FV/TVsp, amiodarona 300 mg luego 150 mg. Causas reversibles perioperatorias (H y T, anafilaxia, LAST con emulsión lipídica, hipertermia maligna, embolia, hemorragia, neumotórax a tensión, bloqueo neuroaxial alto). Dosis pediátricas por peso. AHA 2020.",
  openGraph: {
    title: "Paro cardíaco perioperatorio (ACLS en quirófano) — DEC",
    description:
      "Algoritmo de paro en quirófano: RCP de alta calidad, adrenalina, desfibrilación, amiodarona y causas reversibles perioperatorias (LAST, HM, anafilaxia, embolia, hemorragia). AHA 2020.",
    type: "article",
  },
};

// ------------------------------------------------------------
// Helpers de presentación (mismo lenguaje visual que otras guías)
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
export default function ParoPerioperatorioPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./paro-perioperatorio.sh
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Paro cardíaco perioperatorio (ACLS en quirófano)
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          RCP de alta calidad · adrenalina · desfibrilación · amiodarona · causas reversibles perioperatorias
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// aquí el paro es presenciado, monitorizado y con la causa casi siempre a la vista: úsalo"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">ALGORITMO</span>
          <span className="tag tag-muted">AHA 2020</span>
          <span className="tag tag-muted">Anesth Analg 2018</span>
          <span className="tag tag-muted">ASRA · MHAUS</span>
        </div>
      </header>

      <Callout variant="danger">
        <b>El paro en quirófano NO es un paro cualquiera.</b> Es presenciado, con acceso IV, vía aérea
        controlada y monitorización continua; la causa suele ser conocida (fármaco, sangrado, maniobra,
        posición). El ACLS estándar es el esqueleto, pero la supervivencia depende de{" "}
        <b>identificar y tratar la causa perioperatoria específica</b> mientras corre la RCP. Piensa en
        voz alta y reparte roles.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Reconocimiento y primeros pasos">
        <P>
          En el paciente monitorizado el paro se reconoce por{" "}
          <b>pérdida de pulso / curva arterial, caída brusca del EtCO₂ y ausencia de flujo</b>. No
          esperes al ritmo del monitor para empezar: si no hay pulso, hay paro. Actúa en paralelo, no
          en serie.
        </P>
        <Table
          headers={["Paso inmediato", "Acción"]}
          rows={[
            ["Pedir ayuda", "Declarar PARO en voz alta · carro de paro + desfibrilador · asignar líder"],
            ["Comprimir", "RCP de alta calidad YA (ver §2) — no interrumpir para intubar si ya hay vía aérea"],
            ["Oxígeno", "FiO₂ 100%, cerrar agentes volátiles, verificar circuito y capnografía"],
            ["Avisar al cirujano", "Detener/controlar la causa quirúrgica (sangrado, compresión, insuflación, tracción)"],
            ["Ritmo", "Colocar palas/parches y analizar: desfibrilable (FV/TVsp) vs. no desfibrilable (AESP/asistolia)"],
            ["Acceso y fármacos", "Confirmar vía IV/IO permeable · preparar adrenalina · pensar causas reversibles (§6)"],
          ]}
        />
        <Src>
          Panchal AR, et al. 2020 AHA Guidelines. Circulation 2020;142(S2):S366-S468. · Moitra VK, et al.
          Cardiac Arrest in the OR. Anesth Analg 2018;126(3):876-900.
        </Src>
        <Callout variant="info">
          <b>EtCO₂ como brújula.</b> Un EtCO₂ &lt; 10 mmHg durante la RCP indica compresiones pobres o
          gasto muy bajo: optimiza técnica. Un <b>aumento brusco y sostenido del EtCO₂</b> (p. ej. a
          &gt; 35–40 mmHg) es señal precoz de retorno de circulación espontánea (RCE).
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="RCP de alta calidad">
        <P>
          El determinante número uno de supervivencia es la calidad de las compresiones y la{" "}
          <b>fracción de compresión torácica</b> (tiempo comprimiendo / tiempo total) alta. Minimiza
          cualquier pausa.
        </P>
        <Table
          headers={["Parámetro", "Objetivo", "Nota"]}
          accentCol={1}
          rows={[
            ["Frecuencia", "100–120 /min", "Ni más ni menos: > 120 reduce profundidad y llenado"],
            ["Profundidad (adulto)", "5–6 cm", "Al menos 5 cm, evitar > 6 cm"],
            ["Reexpansión", "Completa", "No apoyarse en el tórax entre compresiones"],
            ["Fracción de compresión", "> 60% (idealmente ≥ 80%)", "Minimizar pausas pre/post-descarga"],
            ["Relevo del compresor", "Cada 2 min", "Coincidir con el análisis del ritmo; evita fatiga"],
            ["Ventilación (vía aérea avanzada)", "≈ 10 /min (1 cada 6 s)", "Sin pausar compresiones; evitar hiperventilar"],
            ["Ventilación (sin vía avanzada)", "30:2", "Compresión:ventilación en adulto"],
          ]}
        />
        <Src>Panchal AR, et al. 2020 AHA Guidelines. Circulation 2020;142(S2):S366-S468.</Src>
        <Callout variant="warn">
          <b>No hiperventilar.</b> La hiperventilación aumenta la presión intratorácica, reduce el
          retorno venoso y empeora el gasto durante la RCP. Diez respiraciones por minuto son
          suficientes con vía aérea avanzada.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Adrenalina y fármacos del algoritmo">
        <P>
          La <b>adrenalina es el vasopresor del paro</b> en todos los ritmos. En ritmos{" "}
          <b>no desfibrilables</b> (AESP/asistolia) se administra lo antes posible; en{" "}
          <b>desfibrilables</b> (FV/TVsp) se da tras la segunda descarga, para no retrasar la
          desfibrilación que es la intervención definitiva.
        </P>
        <Table
          headers={["Fármaco", "Dosis (adulto)", "Cuándo / notas"]}
          accentCol={1}
          rows={[
            [
              "Adrenalina",
              "1 mg IV/IO cada 3–5 min",
              "Todos los ritmos. No desfibrilable: cuanto antes. Desfibrilable: tras 2.ª descarga.",
            ],
            [
              "Amiodarona",
              "300 mg IV/IO bolo → 150 mg IV/IO",
              "FV/TVsp refractaria a desfibrilación (típicamente tras 3.ª descarga). 2.ª dosis 150 mg.",
            ],
            [
              "Lidocaína (alternativa)",
              "1–1.5 mg/kg IV/IO → 0.5–0.75 mg/kg",
              "Alternativa a amiodarona en FV/TVsp refractaria si no se dispone de amiodarona.",
            ],
            [
              "Sulfato de magnesio",
              "1–2 g IV/IO en 10 min",
              "Solo en Torsades de pointes / QT largo / hipomagnesemia. No de rutina.",
            ],
          ]}
        />
        <Src>
          Panchal AR, et al. 2020 AHA Guidelines. Circulation 2020;142(S2):S366-S468 (adrenalina,
          amiodarona/lidocaína, magnesio en Torsades).
        </Src>
        <Callout variant="danger">
          <b>Adrenalina de paro = 1 mg (1000 µg) IV.</b> No confundir con la adrenalina en bolo de
          rescate hemodinámico (10–100 µg) ni con las diluciones de anafilaxia (§6). Verbaliza dosis y
          concentración antes de administrar.
        </Callout>
        <Callout variant="info">
          El <b>bicarbonato de sodio no es de rutina</b>. Reservarlo para causas específicas:
          hiperkalemia, acidosis metabólica grave preexistente, sobredosis de antidepresivos
          tricíclicos o toxicidad por bloqueadores de canales de sodio.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Desfibrilación (FV / TV sin pulso)">
        <P>
          En ritmos desfibrilables la <b>desfibrilación precoz</b> es la intervención que salva la
          vida. Reanuda las compresiones inmediatamente tras la descarga (no compruebes pulso ni
          ritmo hasta el siguiente ciclo de 2 min).
        </P>
        <Table
          headers={["Aspecto", "Valor / conducta"]}
          accentCol={1}
          rows={[
            ["Energía (bifásico)", "200 J (o el recomendado por el fabricante; escalar en descargas siguientes)"],
            ["Energía (monofásico)", "360 J (si solo se dispone de equipo monofásico)"],
            ["Secuencia", "1 descarga → RCP inmediata 2 min → analizar → descarga si persiste"],
            ["Adrenalina", "Tras la 2.ª descarga, luego cada 3–5 min"],
            ["Amiodarona", "300 mg tras la 3.ª descarga; 2.ª dosis 150 mg si sigue en FV/TVsp"],
            ["Ritmos NO desfibrilables", "AESP / asistolia → NO descargar; RCP + adrenalina + causas reversibles"],
          ]}
        />
        <Src>Panchal AR, et al. 2020 AHA Guidelines. Circulation 2020;142(S2):S366-S468.</Src>
        <Callout variant="warn">
          <b>Seguridad y contexto quirúrgico:</b> retirar la fuente de O₂ del campo antes de descargar
          (riesgo de ignición), avisar “fuera todos”, y en presencia de <b>marcapasos/DAI</b> colocar
          los parches ≥ 8 cm del generador. En posición prona con paro presenciado puede desfibrilarse
          con parches en posición antero-posterior mientras se organiza el decúbito supino.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Dosis pediátricas (por peso)">
        <P>
          En pediatría <b>todo se calcula por peso</b>. La RCP de alta calidad y la causa reversible
          siguen siendo el eje; en el niño el paro es más frecuentemente de origen{" "}
          <b>hipóxico/respiratorio</b>, así que la oxigenación y la ventilación son prioritarias.
        </P>
        <Table
          headers={["Intervención", "Dosis pediátrica", "Máximo / nota"]}
          accentCol={1}
          rows={[
            ["Adrenalina", "0.01 mg/kg IV/IO (0.1 mL/kg de 1:10 000) c/3–5 min", "Máx. 1 mg por dosis"],
            ["Desfibrilación (1.ª)", "2 J/kg", "Bifásico"],
            ["Desfibrilación (siguientes)", "4 J/kg", "Puede escalar hasta 10 J/kg o dosis de adulto"],
            ["Amiodarona", "5 mg/kg IV/IO bolo en FV/TVsp", "Repetible hasta 3 dosis (máx. 15 mg/kg); máx. 300 mg/dosis"],
            ["Lidocaína (alternativa)", "1 mg/kg IV/IO bolo", "Alternativa a amiodarona"],
            ["Compresiones", "≥ 1/3 del diámetro AP del tórax (≈ 4 cm lactante, 5 cm niño)", "100–120 /min"],
            ["Ventilación (vía avanzada)", "1 ventilación cada 2–3 s (20–30 /min)", "PALS 2020"],
          ]}
        />
        <Src>
          Topjian AA, et al. 2020 AHA Guidelines for Pediatric Basic and Advanced Life Support (PALS).
          Circulation 2020;142(S2):S469-S523.
        </Src>
        <Callout variant="info">
          <b>Adrenalina pediátrica:</b> 0.01 mg/kg equivale a <b>0.1 mL/kg de la dilución 1:10 000</b>{" "}
          (100 µg/mL). Comprueba la concentración de la ampolla disponible antes de calcular el volumen.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Causas reversibles perioperatorias (H y T + específicas)">
        <P>
          El diferencial del paro en quirófano va más allá de las 5 H y 5 T clásicas: el anestesiólogo
          tiene un catálogo de causas <b>propias del acto anestésico-quirúrgico</b> que se tratan de
          forma específica. Revisa la lista <b>en voz alta</b> mientras el equipo comprime.
        </P>

        <h3
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0.5rem 0 0.75rem" }}
        >
          Las 5 H y 5 T
        </h3>
        <Table
          headers={["H", "Tratamiento", "T", "Tratamiento"]}
          rows={[
            ["Hipoxia", "FiO₂ 100%, confirmar vía aérea/ventilación", "Tensión (neumotórax)", "Descompresión inmediata (§ abajo)"],
            ["Hipovolemia", "Volumen, control de hemorragia, sangre", "Taponamiento cardíaco", "Ecografía, pericardiocentesis/cirugía"],
            ["Hidrogeniones (acidosis)", "Ventilar, tratar causa, bicarbonato selectivo", "Toxinas", "LAST, anestésico, antídoto específico"],
            ["Hipo/hiperkalemia", "Hiper: Ca²⁺, insulina-glucosa, bicarbonato · Hipo: reponer KCl", "Trombosis pulmonar", "Sospecha alta → trombólisis/soporte"],
            ["Hipotermia", "Recalentar; RCP prolongada", "Trombosis coronaria", "Manejo de SCA; considerar reperfusión"],
          ]}
        />
        <Src>Panchal AR, et al. 2020 AHA Guidelines. Circulation 2020;142(S2). · Moitra VK, et al. Anesth Analg 2018;126:876.</Src>

        {/* --- Anafilaxia --- */}
        <h3
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", margin: "1.5rem 0 0.75rem" }}
        >
          Anafilaxia (grado IV — paro)
        </h3>
        <P>
          Causa frecuente: <b>bloqueadores neuromusculares, antibióticos (β-lactámicos), látex,
          clorhexidina, coloides</b>. En paro por anafilaxia se administra adrenalina de paro (1 mg
          IV) más reanimación con líquidos agresiva.
        </P>
        <Table
          headers={["Situación", "Adrenalina", "Adyuvantes"]}
          accentCol={1}
          rows={[
            ["Paro (grado IV)", "1 mg IV/IO c/3–5 min (algoritmo de paro)", "Cristaloide en bolo (p. ej. 20 mL/kg), FiO₂ 100%"],
            ["Colapso sin paro (grado III)", "20–50 µg IV en bolo, titular (o 0.5 mg IM)", "Infusión de adrenalina si refractario; retirar el alérgeno"],
            ["Refractaria a adrenalina", "Añadir vasopresina o infusión de noradrenalina", "Glucagón 1–2 mg IV si β-bloqueo previo"],
          ]}
        />
        <Src>
          Harper NJN, et al. Anaesthesia 2018 (AAGBI/NAP6 — anafilaxia perioperatoria). · Moitra VK, et al.
          Anesth Analg 2018;126:876.
        </Src>

        {/* --- LAST --- */}
        <h3
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", margin: "1.5rem 0 0.75rem" }}
        >
          LAST — toxicidad sistémica por anestésicos locales
        </h3>
        <P>
          Sospéchala ante colapso cardiovascular o convulsiones tras un bloqueo o infiltración con
          anestésico local. Además del ACLS, la clave es la <b>emulsión lipídica al 20%</b> precoz.
        </P>
        <div className="panel" style={{ margin: "0 0 1rem", borderLeft: "3px solid var(--red)" }}>
          <div className="panel-body" style={{ display: "grid", gap: "0.5rem" }}>
            <div className="mono" style={{ color: "var(--red)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Emulsión lipídica 20% (Intralipid) — protocolo ASRA
            </div>
            <div className="mono" style={{ color: "var(--text-1)", fontSize: "0.74rem", lineHeight: 1.85 }}>
              <b style={{ color: "var(--accent)" }}>Bolo:</b> 1.5 mL/kg de peso magro en 2–3 min (≈ 100 mL en adulto de 70 kg)
              <br />
              <b style={{ color: "var(--accent)" }}>Infusión:</b> 0.25 mL/kg/min
              <br />
              <b style={{ color: "var(--accent)" }}>Si persiste inestable:</b> repetir bolo 1–2 veces y/o duplicar la infusión a 0.5 mL/kg/min
              <br />
              <b style={{ color: "var(--accent)" }}>Continuar:</b> ≥ 10 min tras recuperar estabilidad · dosis acumulada máxima orientativa ≈ 12 mL/kg (ASRA)
            </div>
          </div>
        </div>
        <Table
          headers={["Aspecto del ACLS en LAST", "Modificación"]}
          rows={[
            ["Adrenalina", "Preferir dosis reducidas: bolos ≤ 1 µg/kg (la dosis alta empeora el pronóstico en LAST)"],
            ["Evitar", "Vasopresina, bloqueadores de canales de calcio, β-bloqueadores y anestésicos locales"],
            ["Arritmias", "Amiodarona para arritmias ventriculares (no lidocaína ni otros antiarrítmicos)"],
            ["Refractario", "Considerar bypass cardiopulmonar / ECMO precoz — avisar temprano"],
          ]}
        />
        <Src>
          Neal JM, et al. ASRA Checklist for Managing LAST — 2020 update. Reg Anesth Pain Med
          2021;46(1):81-82. · Neal JM, et al. Reg Anesth Pain Med 2018;43:113-123.
        </Src>

        {/* --- Hipertermia maligna --- */}
        <h3
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", margin: "1.5rem 0 0.75rem" }}
        >
          Hipertermia maligna (HM)
        </h3>
        <P>
          Desencadenada por <b>anestésicos halogenados y succinilcolina</b>. Signos precoces:{" "}
          <b>↑ EtCO₂ inexplicado, rigidez (masetero), taquicardia, hipertermia tardía, acidosis
          mixta</b>. El tratamiento específico es el <b>dantroleno</b>.
        </P>
        <Table
          headers={["Paso", "Acción"]}
          accentCol={1}
          rows={[
            ["Suspender gatillo", "Detener volátiles y succinilcolina; hiperventilar con O₂ 100% a alto flujo"],
            ["Dantroleno", "2.5 mg/kg IV en bolo, repetir c/5 min hasta control (frecuente > 10 mg/kg total)"],
            ["Enfriar", "Enfriamiento activo si T > 39 °C; suspender al llegar a ≈ 38 °C"],
            ["Corregir", "Acidosis (bicarbonato), hiperkalemia (Ca²⁺, insulina-glucosa), arritmias"],
            ["Línea MHAUS", "Llamar a la línea de emergencia de HM; UCI ≥ 24 h por riesgo de recrudescencia"],
          ]}
        />
        <Src>
          MHAUS. Emergency Therapy for Malignant Hyperthermia (dantroleno 2.5 mg/kg IV, repetir). ·
          Glahn KPE, et al. Br J Anaesth 2010;105:417-420 (guía EMHG).
        </Src>

        {/* --- Embolia --- */}
        <h3
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", margin: "1.5rem 0 0.75rem" }}
        >
          Embolia (gaseosa venosa y pulmonar)
        </h3>
        <Table
          headers={["Tipo", "Contexto / signo", "Manejo específico"]}
          rows={[
            [
              "Embolia gaseosa venosa",
              "Cirugía sentada/craneal, laparoscopia, campo por encima del corazón. ↓ EtCO₂ brusca, murmullo en rueda de molino.",
              "Inundar campo con SSN, cera ósea, comprimir venas, FiO₂ 100% (parar N₂O), decúbito lateral izq. (Durant), aspirar por catéter central si lo hay.",
            ],
            [
              "Embolia pulmonar (trombo)",
              "↓ EtCO₂ + hipoxemia + disfunción de VD (ecografía). AESP frecuente.",
              "RCP; considerar trombólisis en paro por TEP masiva confirmada/altamente probable; ECMO si disponible.",
            ],
          ]}
        />
        <Src>
          Mirski MA, et al. Anesthesiology 2007;106:164-177 (embolia gaseosa). · Truhlář A, et al.
          Resuscitation 2015;95:148-201 (circunstancias especiales).
        </Src>

        {/* --- Hemorragia --- */}
        <h3
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", margin: "1.5rem 0 0.75rem" }}
        >
          Hemorragia / hipovolemia
        </h3>
        <P>
          Causa perioperatoria más común de paro por hipovolemia. La RCP con corazón vacío es
          ineficaz: la prioridad es <b>control de la fuente + reposición</b>.
        </P>
        <Table
          headers={["Acción", "Detalle"]}
          rows={[
            ["Control quirúrgico", "Compresión/clampaje de la fuente; el cirujano detiene el sangrado YA"],
            ["Reposición masiva", "Activar protocolo de transfusión masiva, ratio ≈ 1:1:1 (ver guía de transfusión)"],
            ["Ácido tranexámico", "1 g IV en 10 min + 1 g en 8 h si hemorragia mayor traumática (< 3 h)"],
            ["Calcio", "Reponer por hipocalcemia inducida por citrato (Ca²⁺ iónico > 1.0–1.1 mmol/L)"],
            ["Evitar", "No perder tiempo en compresiones sobre volemia vacía sin reponer en paralelo"],
          ]}
        />
        <Src>Moitra VK, et al. Anesth Analg 2018;126:876-900. · CRASH-2 Collaborators. Lancet 2010;376:23-32.</Src>

        {/* --- Neumotórax a tensión --- */}
        <h3
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", margin: "1.5rem 0 0.75rem" }}
        >
          Neumotórax a tensión
        </h3>
        <P>
          Sospéchalo tras acceso venoso central, bloqueo supraclavicular/interescalénico, ventilación
          con presión positiva, barotrauma o trauma torácico. <b>Diagnóstico clínico</b> (hipotensión,
          ↑ presiones de vía aérea, hipoxemia, ausencia de murmullo, desviación traqueal): no esperes
          la radiografía.
        </P>
        <Callout variant="danger">
          <b>Descompresión inmediata con aguja</b> (2.º espacio intercostal línea medioclavicular, o
          4.º–5.º línea axilar anterior) seguida de <b>toracostomía / tubo torácico</b> definitivo. En
          paro con alta sospecha, la descompresión es parte de la reanimación, no un paso posterior.
        </Callout>
        <Src>Truhlář A, et al. Resuscitation 2015;95:148-201.</Src>

        {/* --- Bloqueo neuroaxial alto --- */}
        <h3
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", margin: "1.5rem 0 0.75rem" }}
        >
          Bloqueo neuroaxial alto / raquídeo total
        </h3>
        <P>
          Ascenso excesivo de un bloqueo espinal o epidural → <b>bradicardia extrema, hipotensión
          profunda, apnea y paro</b> por bloqueo simpático masivo y de nervios cardioaceleradores.
        </P>
        <Table
          headers={["Problema", "Manejo"]}
          rows={[
            ["Bradicardia / paro vagal", "Atropina 0.5–1 mg IV; adrenalina precoz si progresa a paro"],
            ["Hipotensión profunda", "Vasopresores (efedrina/fenilefrina/adrenalina) + líquidos; posición"],
            ["Apnea / bloqueo alto", "Asegurar vía aérea, ventilar, FiO₂ 100% hasta que revierta el bloqueo"],
            ["Soporte", "Mantener perfusión hasta metabolización del anestésico local (es reversible)"],
          ]}
        />
        <Src>Moitra VK, et al. Anesth Analg 2018;126:876-900 (paro perioperatorio, causas neuroaxiales).</Src>

        {/* --- Auto-PEEP --- */}
        <h3
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", margin: "1.5rem 0 0.75rem" }}
        >
          Auto-PEEP (atrapamiento aéreo dinámico)
        </h3>
        <P>
          En broncoespasmo grave, asma o EPOC ventilados con presión positiva, el aire se atrapa y la
          hiperinsuflación dinámica <b>comprime el retorno venoso</b> → hipotensión y AESP que imita
          hipovolemia o neumotórax.
        </P>
        <Callout variant="warn">
          <b>Maniobra diagnóstico-terapéutica:</b> desconectar el circuito del tubo y{" "}
          <b>permitir la espiración completa</b> (apnea breve) para descomprimir; si mejora la
          hemodinámica, era auto-PEEP. Luego ventilar con <b>frecuencia baja, tiempo espiratorio
          largo y menor volumen</b>, y tratar el broncoespasmo.
        </Callout>
        <Src>Truhlář A, et al. Resuscitation 2015;95:148-201. · Moitra VK, et al. Anesth Analg 2018;126:876.</Src>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Consideraciones específicas del quirófano">
        <Table
          headers={["Consideración", "Conducta"]}
          rows={[
            ["FiO₂ 100%", "Aumentar a FiO₂ 1.0 y cerrar agentes volátiles al declarar el paro"],
            ["Comunicación con el cirujano", "Avisar de inmediato: pausar/controlar la causa quirúrgica, inundar campo si aplica, prepararse para toracotomía o masaje cardíaco interno si abdomen/tórax abierto"],
            ["Anestesia TIVA/gases", "Suspender infusiones anestésicas; en TIVA parar propofol/remifentanilo"],
            ["Monitorización invasiva", "Aprovechar línea arterial (calidad de RCP) y catéter central (fármacos, aspirar aire) si están colocados"],
            ["Ecografía a pie de cama", "POCUS para taponamiento, VD dilatado (TEP), neumotórax, volemia — no interrumpir RCP > 10 s"],
          ]}
        />
        <Src>Moitra VK, et al. Cardiac Arrest in the OR. Anesth Analg 2018;126(3):876-900.</Src>

        <Callout variant="danger">
          <b>Embarazada — cesárea perimortem (histerotomía de reanimación).</b> En paro de la gestante
          con útero a nivel del ombligo o por encima (≈ ≥ 20 sem), iniciar RCP con{" "}
          <b>desplazamiento uterino manual a la izquierda</b> y, si no hay RCE, <b>extraer al feto en
          ≤ 4–5 min desde el paro</b> (objetivo: nacimiento hacia los 5 min). La descompresión aortocava
          mejora la reanimación materna; no es solo por el feto. Compresiones en la posición estándar
          del esternón.
        </Callout>
        <Src>
          Jeejeebhoy FM, et al. Cardiac Arrest in Pregnancy — AHA Scientific Statement. Circulation
          2015;132:1747-1773.
        </Src>
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Resumen de dosis y umbrales clave">
        <Table
          headers={["Intervención", "Valor", "Fuente"]}
          accentCol={1}
          rows={[
            ["Adrenalina (adulto)", "1 mg IV/IO c/3–5 min", "AHA 2020"],
            ["Amiodarona FV/TVsp", "300 mg → 150 mg IV/IO", "AHA 2020"],
            ["Desfibrilación (bifásico)", "200 J", "AHA 2020"],
            ["Compresiones", "100–120 /min · 5–6 cm · fracción > 60%", "AHA 2020"],
            ["Emulsión lipídica 20% (LAST)", "Bolo 1.5 mL/kg + infusión 0.25 mL/kg/min", "ASRA 2020"],
            ["Dantroleno (HM)", "2.5 mg/kg IV, repetir c/5 min", "MHAUS"],
            ["Adrenalina pediátrica", "0.01 mg/kg (0.1 mL/kg 1:10 000)", "PALS 2020"],
            ["Desfibrilación pediátrica", "2 J/kg → 4 J/kg", "PALS 2020"],
            ["Amiodarona pediátrica", "5 mg/kg IV/IO", "PALS 2020"],
            ["Cesárea perimortem", "Feto extraído ≤ 4–5 min del paro", "AHA 2015"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="09" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Panchal AR, Bartos JA, Cabañas JG, et al. Part 3: Adult Basic and Advanced Life Support — 2020 AHA Guidelines for CPR and ECC. Circulation 2020;142(16_suppl_2):S366-S468.</li>
          <li>Topjian AA, Raymond TT, Atkins D, et al. Part 4: Pediatric Basic and Advanced Life Support (PALS) — 2020 AHA Guidelines. Circulation 2020;142(16_suppl_2):S469-S523.</li>
          <li>Moitra VK, Einav S, Thies KC, et al. Cardiac Arrest in the Operating Room: Resuscitation and Management (Part 1). Anesth Analg 2018;126(3):876-888.</li>
          <li>McEvoy MD, Thies KC, Einav S, et al. Cardiac Arrest in the Operating Room (Part 2): Special Situations. Anesth Analg 2018;126(3):889-903.</li>
          <li>Neal JM, Neal EJ, Weinberg GL. ASRA Local Anesthetic Systemic Toxicity Checklist: 2020 Version. Reg Anesth Pain Med 2021;46(1):81-82.</li>
          <li>Neal JM, Barrington MJ, Fettiplace MR, et al. The Third ASRA Practice Advisory on LAST. Reg Anesth Pain Med 2018;43(2):113-123.</li>
          <li>Harper NJN, Cook TM, Garcez T, et al. Anaesthesia, surgery, and life-threatening allergic reactions (NAP6). Br J Anaesth 2018;121(1):159-171.</li>
          <li>Malignant Hyperthermia Association of the United States (MHAUS). Emergency Therapy for Malignant Hyperthermia. www.mhaus.org.</li>
          <li>Glahn KPE, Ellis FR, Halsall PJ, et al. Recognizing and managing a malignant hyperthermia crisis: EMHG guidelines. Br J Anaesth 2010;105(4):417-420.</li>
          <li>Mirski MA, Lele AV, Fitzsimmons L, Toung TJK. Diagnosis and treatment of vascular air embolism. Anesthesiology 2007;106(1):164-177.</li>
          <li>Truhlář A, Deakin CD, Soar J, et al. ERC Guidelines 2015: Cardiac arrest in special circumstances. Resuscitation 2015;95:148-201.</li>
          <li>Jeejeebhoy FM, Zelop CM, Lipman S, et al. Cardiac Arrest in Pregnancy: AHA Scientific Statement. Circulation 2015;132(18):1747-1773.</li>
          <li>CRASH-2 Collaborators. Effects of tranexamic acid on death and transfusion in trauma. Lancet 2010;376(9734):23-32.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y energías de literatura aceptada (AHA 2020, Anesth Analg 2018, ASRA, MHAUS)"}
          <br />
          {"// referencia educativa — no sustituye ACLS certificado, juicio clínico ni protocolo institucional"}
          <br />
          {"// en el quirófano el paro casi siempre tiene una causa con nombre: dila en voz alta y trátala"}
          <br />
          {"// el mejor desfibrilador es el que ya está enchufado antes de necesitarlo"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
