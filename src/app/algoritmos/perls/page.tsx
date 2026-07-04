import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Algoritmo de referencia — PeRLS (Perioperative Resuscitation
// and Life Support) · ASA 2025.
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: dosis, umbrales y objetivos tomados del
// documento PeRLS. Cada tabla/callout cita su fuente (Vancouver
// breve). NO inventar cifras.
// Fuente primaria:
//  - Moitra VK, McEvoy MD, Nunnally ME, et al. Perioperative
//    Resuscitation and Life Support (PeRLS). Anesthesiology
//    2025;143(6):1453-1483.
// ============================================================

export const metadata: Metadata = {
  title: "PeRLS — Resucitación perioperatoria (ASA 2025) · DEC",
  description:
    "Algoritmo PeRLS (Perioperative Resuscitation and Life Support, Anesthesiology 2025) para el paro cardíaco en quirófano: 13 recomendaciones clave, algoritmos de bradicardia y taquicardia con dosis exactas (atropina, adrenalina, adenosina, amiodarona, magnesio), causas reversibles perioperatorias (Hs y Ts + auto-PEEP y QT), manejo de anafilaxia, LAST, hipertermia maligna, espinal alta, arresto traumático y RCP en prono. Difiere del ACLS: paro presenciado, causa conocida y respuesta precoz enfocada en la causa.",
  openGraph: {
    title: "PeRLS — Resucitación perioperatoria (ASA 2025) · DEC",
    description:
      "13 recomendaciones clave, algoritmos de bradicardia y taquicardia, causas reversibles perioperatorias y manejo de anafilaxia/LAST/MH. Anesthesiology 2025.",
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

// ------------------------------------------------------------
// Página (Server Component — referencia estática)
// ------------------------------------------------------------
export default function PerlsPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat perls-resucitacion-perioperatoria.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          PeRLS — Resucitación perioperatoria (ASA 2025)
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          13 recomendaciones clave · bradicardia · taquicardia · Hs y Ts perioperatorios · anafilaxia · LAST · MH · prono
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// el único paro que ves venir en tiempo real: aquí la causa no es un misterio, es tu próximo movimiento"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">EMERGENCIA</span>
          <span className="tag tag-muted">PeRLS 2025</span>
          <span className="tag tag-muted">Anesthesiology</span>
          <span className="tag tag-muted">GRADE</span>
        </div>
      </header>

      <Callout variant="info">
        <b>Qué es PeRLS.</b> <b>Perioperative Resuscitation and Life Support</b> es un marco de la ASA
        (Anesthesiology 2025) para el paro cardíaco perioperatorio, que se distingue del ACLS estándar en
        tres rasgos: el paro es <b>presenciado</b>, la <b>causa suele conocerse</b> y la respuesta es{" "}
        <b>más precoz y enfocada en la causa</b>. Monitorización continua, testigos entrenados y acceso
        inmediato a fármacos permiten tratar el mecanismo (hipovolemia, anafilaxia, LAST, MH, espinal
        alta, embolia) antes de que el paro se establezca. Metodología <b>GRADE</b>.
      </Callout>
      <Src>Moitra VK, et al. Perioperative Resuscitation and Life Support (PeRLS). Anesthesiology 2025;143(6):1453-1483.</Src>

      {/* ========================================================= */}
      <Section n="01" title="13 recomendaciones clave">
        <P>
          Recomendaciones específicas del entorno perioperatorio, cuando el mecanismo del deterioro se
          conoce o se sospecha. No sustituyen al ACLS en el paro establecido sin causa reversible clara:
          lo complementan cuando la causa es tratable de inmediato.
        </P>
        <Table
          headers={["#", "Escenario", "Conducta / dosis"]}
          accentCol={2}
          rows={[
            [
              "1",
              "Sospecha de hipovolemia",
              "Fluidos guiados por variación de presión de pulso (PPV) si se sospecha hipovolemia, en lugar de bolos a ciegas.",
            ],
            [
              "2",
              "Ventilación durante el arresto",
              "Ventilar 10–12 resp/min. EVITAR la hiperventilación (↓ retorno venoso, ↓ perfusión coronaria).",
            ],
            [
              "3",
              "Bradicardia sintomática",
              "Atropina 0.5 mg IV (FC < 40, o < 50 con hipotensión).",
            ],
            [
              "4",
              "Bradicardia con arresto inminente",
              "Atropina 1.0 mg IV; repetir 1.0 mg cada 5 min.",
            ],
            [
              "5",
              "Arresto establecido",
              "NO usar atropina en el arresto establecido; seguir ACLS.",
            ],
            [
              "6",
              "Anafilaxia — inicio",
              "Adrenalina 50–100 mcg IV o 200–500 mcg IM.",
            ],
            [
              "7",
              "Anafilaxia — hipotensión persistente",
              "Escalar a 100–300 mcg IV si la hipotensión persiste 3–5 min.",
            ],
            [
              "8",
              "LAST — antídoto",
              "Emulsión lipídica 20% (recomendación fuerte).",
            ],
            [
              "9",
              "LAST — soporte cardiovascular",
              "Adrenalina inicial 10 mcg IV para hipotensión; 100–300 mcg IV para arresto (dosis bajas).",
            ],
            [
              "10",
              "Hipertermia maligna",
              "Dantroleno 2.5 mg/kg (repetir hasta revertir; retirar el desencadenante).",
            ],
            [
              "11",
              "Arresto traumático",
              "Hipotensión permisiva (PAM 50 mmHg o PAS 70 mmHg) hasta control del sangrado.",
            ],
            [
              "12",
              "Espinal alta / total",
              "Atropina 1 mg IV para bradicardia; adrenalina 100–200 mcg IV en bolo si arresto inminente.",
            ],
            [
              "13",
              "Arresto en decúbito PRONO",
              "Dar RCP en prono (no girar a supino salvo que sea imprescindible).",
            ],
          ]}
        />
        <Src>Moitra VK, et al. PeRLS. Anesthesiology 2025;143(6):1453-1483.</Src>
        <Callout variant="danger">
          <b>Atropina: el matiz que salva.</b> En bradicardia sintomática, atropina{" "}
          <b>0.5 mg IV</b>; en bradicardia con arresto inminente, <b>1.0 mg IV</b> repetible cada 5 min.
          Pero en el <b>arresto ya establecido NO se usa atropina</b> — se sigue el algoritmo ACLS. El
          error frecuente es dar atropina a un paciente en asistolia por reflejo.
        </Callout>
        <Callout variant="warn">
          <b>Adrenalina en dosis perioperatoria, no de paro.</b> En anafilaxia, LAST y espinal alta la
          adrenalina se titula en <b>microgramos IV</b> (10–300 mcg) según el escenario, no en el 1 mg
          del paro clásico. En LAST la dosis inicial es especialmente baja (<b>10 mcg IV</b>) para no
          empeorar la arritmia por toxicidad del anestésico local.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Algoritmo de bradicardia (Fig. 1)">
        <P>
          Ante bradicardia perioperatoria: <b>O₂ 100%</b> y descartar hipoxemia primero. Repasar el
          diferencial perioperatorio, apoyarse en <b>ecocardiografía (TTE/TEE)</b> y, si hay mala
          perfusión, escalar a RCP, cronotrópicos y marcapasos sin demora.
        </P>
        <Table
          headers={["Paso", "Acción"]}
          rows={[
            ["1 · Oxígeno", "FiO₂ 100%; descartar y corregir hipoxemia (causa perioperatoria más común de bradicardia)."],
            [
              "2 · Diferencial",
              "Hipervolemia / hipovolemia, anestesia profunda, auto-PEEP, isquemia, embolia (gaseosa / trombo / grasa), espinal alta, LAST, hiper/hipokalemia.",
            ],
            ["3 · Ecocardiografía", "TTE / TEE para valorar contractilidad, llenado, embolia y taponamiento."],
            [
              "4 · Criterios de RCP",
              "Iniciar RCP si ETCO₂ < 15 mmHg, hipotensión severa o FC < 30.",
            ],
          ]}
        />
        <P>
          Si hay <b>mala perfusión</b>, tratamiento farmacológico escalonado y marcapasos:
        </P>
        <Table
          headers={["Intervención", "Dosis", "Nota"]}
          accentCol={1}
          rows={[
            ["Atropina", "0.5–1.0 mg IV (máx. 3 mg)", "Primera línea en bradicardia con mala perfusión."],
            [
              "Adrenalina — bolo",
              "10–100 mcg IV",
              "Si atropina insuficiente; titular a respuesta.",
            ],
            [
              "Adrenalina — infusión",
              "0.05–0.10 mcg/kg/min",
              "Tras el bolo, si se necesita soporte sostenido.",
            ],
            [
              "Dopamina — infusión",
              "2–10 mcg/kg/min",
              "Alternativa a la infusión de adrenalina.",
            ],
            [
              "Marcapasos transcutáneo",
              "Sin demora",
              "En bloqueo AV de alto grado; no esperar a que fracasen los fármacos.",
            ],
          ]}
        />
        <Src>Moitra VK, et al. PeRLS (Fig. 1 — bradicardia perioperatoria). Anesthesiology 2025;143(6):1453-1483.</Src>
        <Callout variant="danger">
          <b>Iniciar RCP con perfusión aún presente pero crítica.</b> No esperar a la asistolia: con{" "}
          <b>ETCO₂ &lt; 15 mmHg</b>, hipotensión severa o <b>FC &lt; 30</b>, comenzar compresiones. En
          bloqueo AV de alto grado, el <b>marcapasos transcutáneo va sin demora</b>, en paralelo a la
          atropina/adrenalina.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Algoritmo de taquicardia (Fig. 2)">
        <P>
          Primera bifurcación: <b>estabilidad</b>. La taquicardia <b>inestable</b> (hipotensión,
          isquemia, shock, alteración del estado) va a <b>cardioversión sincronizada</b> inmediata. Si
          está estable, clasificar por anchura del QRS y regularidad.
        </P>
        <Callout variant="danger">
          <b>Inestable → cardioversión sincronizada</b> sin demora, independientemente del tipo de
          taquicardia. La farmacología es para la taquicardia <b>estable</b>.
        </Callout>
        <Table
          headers={["Tipo (estable)", "Tratamiento", "Dosis"]}
          accentCol={2}
          rows={[
            [
              "Estrecho regular",
              "Maniobras vagales + adenosina (alt. verapamilo)",
              "Adenosina 6 mg IV, luego 12 mg IV · Verapamilo 5–10 mg IV.",
            ],
            [
              "Ancho regular",
              "Amiodarona + cloruro de calcio, o lidocaína",
              "Amiodarona 150 mg en 10 min + cloruro de calcio 1 g · o lidocaína 1–1.5 mg/kg.",
            ],
            [
              "Polimórfica / torsades",
              "Sulfato de magnesio",
              "Sulfato de magnesio 2 g IV en 5 min.",
            ],
            [
              "FA / flutter",
              "Amiodarona o control de frecuencia",
              "Amiodarona 150 mg IV · o betabloqueante / calcioantagonista.",
            ],
          ]}
        />
        <Src>Moitra VK, et al. PeRLS (Fig. 2 — taquicardia perioperatoria). Anesthesiology 2025;143(6):1453-1483.</Src>
        <Callout variant="warn">
          <b>Torsades / QRS polimórfico:</b> <b>sulfato de magnesio 2 g IV en 5 min</b> es el
          tratamiento de elección; revisar y corregir QT y electrolitos (K⁺, Mg²⁺) y retirar los
          fármacos que prolonguen el QT. En el ancho regular, el <b>cloruro de calcio 1 g</b> acompaña a
          la amiodarona en el contexto perioperatorio.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Hs y Ts perioperatorios (causas reversibles)">
        <P>
          El paro perioperatorio casi siempre tiene una <b>causa reversible identificable</b>. PeRLS
          amplía las clásicas Hs y Ts con dos causas propias del quirófano: <b>auto-PEEP</b> y{" "}
          <b>prolongación del QT / fármacos</b>. Buscar y tratar la causa es el eje del algoritmo.
        </P>
        <Table
          headers={["Causa", "Pista perioperatoria", "Acción dirigida"]}
          rows={[
            ["Hipoxia", "Desaturación, vía aérea, desconexión, intubación esofágica", "FiO₂ 100%, confirmar vía aérea y ventilación."],
            ["Hipovolemia", "Sangrado, PPV alta, precarga baja en eco", "Fluidos guiados por PPV; control del sangrado."],
            ["H⁺ (acidosis)", "Gasometría, hipoperfusión prolongada", "Ventilación, perfusión, considerar bicarbonato según causa."],
            ["Hiper/Hipokalemia", "ECG (T picudas / U), rabdomiólisis, transfusión masiva", "Calcio, insulina-glucosa, β2 (hiper) / reposición (hipo)."],
            ["Hipotermia", "Cirugía prolongada, cavidad abierta, transfusión", "Recalentamiento activo."],
            ["Hipertermia maligna", "↑ETCO₂, rigidez, taquicardia, hipertermia, halogenado/succinilcolina", "Dantroleno 2.5 mg/kg; retirar desencadenante."],
            ["Neumotórax a tensión", "↑presión vía aérea, hipotensión, MV asimétrico, PVC alta", "Descompresión con aguja / toracostomía."],
            ["Taponamiento", "PVC alta, hipotensión, eco diagnóstica", "Pericardiocentesis / drenaje."],
            ["Trombosis (TEP / coronaria)", "↓ETCO₂ brusca, sobrecarga de VD en eco, cambios de ST", "Soporte, considerar trombólisis / PTCA de rescate."],
            ["Toxinas (LAST / anafilaxia)", "Temporalidad con anestésico local o fármaco", "LAST: emulsión lipídica 20% · anafilaxia: adrenalina."],
            ["Auto-PEEP", "Broncoespasmo/obstrucción, atrapamiento aéreo, hipotensión", "Desconectar del circuito, permitir espiración, ↓frecuencia."],
            ["QT / fármacos", "QT largo, torsades, polifarmacia proarrítmica", "Retirar fármaco, magnesio 2 g, corregir K⁺/Mg²⁺."],
          ]}
        />
        <Src>Moitra VK, et al. PeRLS (causas reversibles perioperatorias). Anesthesiology 2025;143(6):1453-1483.</Src>
        <Callout variant="ok">
          <b>Rescate cuando no hay ROSC.</b> Si no se recupera circulación espontánea pese a tratar la
          causa, PeRLS enfatiza el escalado a <b>ECMO (E-CPR)</b> y a <b>PTCA de rescate</b> en la
          trombosis coronaria. El paro presenciado con causa conocida es el escenario ideal para estas
          terapias de rescate: candidatos y decisión precoces.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Síndromes específicos — dosis de rescate">
        <P>
          Cuatro escenarios perioperatorios con antídoto o maniobra propios, donde actuar por el
          mecanismo revierte el cuadro más rápido que el ACLS genérico.
        </P>
        <Table
          headers={["Síndrome", "Intervención clave", "Dosis"]}
          accentCol={2}
          rows={[
            [
              "Anafilaxia",
              "Adrenalina titulada",
              "50–100 mcg IV o 200–500 mcg IM; escalar 100–300 mcg IV si persiste hipotensión 3–5 min.",
            ],
            [
              "LAST (toxicidad anestésico local)",
              "Emulsión lipídica 20% + adrenalina en dosis baja",
              "Emulsión lipídica 20% (recomendación fuerte); adrenalina 10 mcg IV (hipotensión) / 100–300 mcg IV (arresto).",
            ],
            [
              "Hipertermia maligna",
              "Dantroleno + retirar desencadenante",
              "Dantroleno 2.5 mg/kg IV (repetir hasta revertir); suspender halogenado / succinilcolina.",
            ],
            [
              "Espinal alta / total",
              "Atropina + adrenalina",
              "Atropina 1 mg IV para bradicardia; adrenalina 100–200 mcg IV en bolo si arresto inminente.",
            ],
            [
              "Arresto traumático",
              "Hipotensión permisiva hasta hemostasia",
              "Objetivo PAM 50 mmHg o PAS 70 mmHg hasta control del sangrado.",
            ],
            [
              "Arresto en prono",
              "RCP en prono",
              "Compresiones en prono; no girar a supino de rutina (retrasa la RCP).",
            ],
          ]}
        />
        <Src>Moitra VK, et al. PeRLS. Anesthesiology 2025;143(6):1453-1483.</Src>
        <Callout variant="danger">
          <b>LAST: la adrenalina va baja.</b> A diferencia del paro estándar, en la toxicidad sistémica
          por anestésico local la adrenalina se inicia en <b>10 mcg IV</b> para la hipotensión (100–300
          mcg IV solo en arresto): dosis altas empeoran la arritmia. El pilar es la{" "}
          <b>emulsión lipídica 20%</b> (recomendación fuerte).
        </Callout>
        <Callout variant="warn">
          <b>Prono: no pierdas tiempo girando.</b> En el arresto en decúbito prono, dar RCP{" "}
          <b>en prono</b> (compresiones sobre la columna dorsal, contrapresión esternal si es posible).
          Girar a supino solo si es imprescindible y sin retrasar las compresiones.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="PeRLS vs. ACLS estándar">
        <P>
          El valor de PeRLS está en aprovechar las tres ventajas del quirófano —paro presenciado, causa
          conocida, respuesta precoz— para <b>tratar el mecanismo</b> antes de que el paro se establezca.
        </P>
        <Table
          headers={["Rasgo", "ACLS estándar", "PeRLS perioperatorio"]}
          rows={[
            ["Presenciación", "A menudo no presenciado", "Presenciado y monitorizado en tiempo real."],
            ["Causa", "Frecuentemente desconocida", "Suele conocerse o sospecharse."],
            ["Respuesta", "Puede demorarse", "Más precoz, con testigos entrenados y fármacos a mano."],
            ["Enfoque", "Algoritmo genérico", "Dirigido a la causa (anafilaxia, LAST, MH, embolia, espinal alta)."],
            ["Atropina", "Uso según ritmo", "Sí en bradicardia sintomática; NO en arresto establecido."],
            ["Adrenalina", "1 mg IV en paro", "Titulada en mcg según el síndrome (10–300 mcg IV)."],
          ]}
        />
        <Src>Moitra VK, et al. PeRLS. Anesthesiology 2025;143(6):1453-1483.</Src>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Resumen de dosis clave">
        <Table
          headers={["Parámetro", "Dosis", "Escenario"]}
          accentCol={1}
          rows={[
            ["Ventilación en arresto", "10–12 resp/min (evitar hiperventilación)", "Durante el paro"],
            ["Atropina — bradicardia sintomática", "0.5 mg IV (FC < 40 o < 50 con hipotensión)", "Bradicardia"],
            ["Atropina — arresto inminente", "1.0 mg IV; repetir 1.0 mg c/5 min (máx. 3 mg)", "Bradicardia grave"],
            ["Adrenalina — bradicardia bolo", "10–100 mcg IV", "Bradicardia mala perfusión"],
            ["Adrenalina — infusión", "0.05–0.10 mcg/kg/min", "Bradicardia sostenida"],
            ["Dopamina — infusión", "2–10 mcg/kg/min", "Alternativa cronotrópica"],
            ["Adrenalina — anafilaxia", "50–100 mcg IV o 200–500 mcg IM; escalar 100–300 mcg IV", "Anafilaxia"],
            ["Emulsión lipídica", "Emulsión lipídica 20% (rec. fuerte)", "LAST"],
            ["Adrenalina — LAST", "10 mcg IV (hipotensión) / 100–300 mcg IV (arresto)", "LAST"],
            ["Dantroleno", "2.5 mg/kg IV", "Hipertermia maligna"],
            ["Espinal alta", "Atropina 1 mg IV · adrenalina 100–200 mcg IV", "Espinal alta / total"],
            ["Arresto traumático", "PAM 50 o PAS 70 mmHg (hipotensión permisiva)", "Trauma hasta hemostasia"],
            ["Adenosina — SVT", "6 mg IV, luego 12 mg IV", "Taquicardia estrecha regular"],
            ["Verapamilo — SVT (alt.)", "5–10 mg IV", "Taquicardia estrecha regular"],
            ["Amiodarona", "150 mg en 10 min (+ cloruro de calcio 1 g)", "Taquicardia ancha regular / FA"],
            ["Lidocaína", "1–1.5 mg/kg IV", "Taquicardia ancha regular"],
            ["Sulfato de magnesio", "2 g IV en 5 min", "Polimórfica / torsades"],
            ["Criterio de RCP", "ETCO₂ < 15 mmHg · hipotensión severa · FC < 30", "Bradicardia con mala perfusión"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Moitra VK, McEvoy MD, Nunnally ME, et al. Perioperative Resuscitation and Life Support (PeRLS). Anesthesiology 2025;143(6):1453-1483.</li>
          <li>Panchal AR, Bartos JA, Cabañas JG, et al. Part 3: Adult Basic and Advanced Life Support (AHA Guidelines for CPR and ECC). Circulation 2020;142(16_suppl_2):S366-S468.</li>
          <li>Neal JM, Barrington MJ, Fettiplace MR, et al. The Third American Society of Regional Anesthesia and Pain Medicine Practice Advisory on Local Anesthetic Systemic Toxicity (LAST). Reg Anesth Pain Med 2018;43(2):113-123.</li>
          <li>Riazi S, Kraeva N, Hopkins PM. Malignant Hyperthermia in the Post-Genomics Era. Anesthesiology 2018;128(1):168-180.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y algoritmos del documento PeRLS (Anesthesiology 2025;143:1453-83), metodología GRADE"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// atropina en bradicardia sí; en arresto establecido no: el reflejo también hay que reanimarlo"}
          <br />
          {"// adrenalina en mcg titulados por síndrome: en LAST empieza en 10 mcg, no en 1 mg"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
