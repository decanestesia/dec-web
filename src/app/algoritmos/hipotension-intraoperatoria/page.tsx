import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Algoritmo — HIPOTENSIÓN INTRAOPERATORIA
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: definiciones, dosis y umbrales tomados de
// literatura aceptada (Miller, Stoelting, POISE-2/INPRESS, guías
// de manejo hemodinámico perioperatorio). Cada tabla/callout cita
// su fuente (Vancouver breve). NO inventar dosis.
// Fuentes primarias:
//  - Gropper MA, et al. Miller's Anesthesia, 9.ª ed. — Cardiovascular
//    Monitoring; Perioperative Hemodynamics.
//  - Pardo MC, Miller RD. Basics of Anesthesia (Stoelting), 8.ª ed.
//  - Futier E, et al. Effect of Individualized vs Standard Blood
//    Pressure Management (INPRESS). JAMA 2017;318(14):1346-1357.
//  - Sessler DI, et al. Perioperative Quality Initiative (POQI)
//    consensus on intraoperative blood pressure. Br J Anaesth
//    2019;122(5):563-574.
//  - Vincent JL, et al. Perioperative use of vasopressors and
//    inotropes / POCUS hemodinámico perioperatorio.
// ============================================================

export const metadata: Metadata = {
  title: "Hipotensión intraoperatoria (algoritmo) — diferencial y vasopresores · DEC",
  description:
    "Algoritmo de abordaje de la hipotensión intraoperatoria: definición (PAM < 65 mmHg o caída > 20% del basal), diferencial rápido por precarga/contractilidad/poscarga/FC (hipovolemia/hemorragia, anestésico profundo, vasoplejia por sepsis/anafilaxia/IECA, causas obstructivas —neumotórax, TEP, taponamiento, auto-PEEP, embolia gaseosa—, cardiogénica, bloqueo neuroaxial alto, mecánica), acciones (bajar anestésico, fluidos, fenilefrina, efedrina, noradrenalina) y POCUS/monitor de gasto cardíaco. Miller, Stoelting, INPRESS, POQI.",
  openGraph: {
    title: "Hipotensión intraoperatoria (algoritmo) — diferencial y vasopresores · DEC",
    description:
      "Definición, diferencial por precarga/contractilidad/poscarga/FC, vasopresores (fenilefrina, efedrina, noradrenalina) y POCUS. Miller, Stoelting, INPRESS.",
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
export default function HipotensionIntraoperatoriaPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat hipotension-intraoperatoria.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Hipotensión intraoperatoria (algoritmo)
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          definir · diferencial por precarga / contractilidad / poscarga / FC · acción · POCUS · gasto cardíaco
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// la TA baja no es un diagnóstico, es una pregunta: ¿qué eslabón del gasto se rompió?"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">ALGORITMO</span>
          <span className="tag tag-muted">Miller</span>
          <span className="tag tag-muted">Stoelting</span>
          <span className="tag tag-muted">INPRESS / POQI</span>
        </div>
      </header>

      <Callout variant="danger">
        <b>Trata en paralelo, diagnostica a la vez.</b> Ante hipotensión intraoperatoria: confirma que
        no es artefacto (transductor, manguito, línea arterial), <b>reduce el anestésico</b>, da un{" "}
        <b>bolo de fluido</b> y ten un <b>vasopresor listo</b> mientras razonas la causa por el eje
        precarga / contractilidad / poscarga / frecuencia. No persigas la cifra sin buscar la causa:
        una PAM baja mantenida se asocia a lesión miocárdica y renal.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Definir la hipotensión">
        <P>
          No hay umbral universal, pero los más usados en la práctica y la literatura de resultados son
          una <b>PAM &lt; 65 mmHg</b> o una <b>caída &gt; 20% respecto al basal preoperatorio</b>. La
          asociación entre exposición a PAM baja y lesión miocárdica/renal aumenta bajo esos umbrales y
          con la duración acumulada: cuanto más baja y más tiempo, mayor riesgo.
        </P>
        <Table
          headers={["Umbral", "Definición operativa", "Nota"]}
          accentCol={0}
          rows={[
            [
              "PAM < 65 mmHg",
              "Presión arterial media absoluta por debajo de 65 mmHg.",
              "Umbral asociado a lesión miocárdica/renal; el riesgo escala con la duración.",
            ],
            [
              "Caída > 20% del basal",
              "Descenso relativo de PAM/PAS > 20% respecto al basal preoperatorio del paciente.",
              "Individualiza en HTA crónica; el basal propio importa más que un número fijo.",
            ],
            [
              "PAM < 55–50 mmHg",
              "Umbrales más bajos con daño de órgano más rápido y consistente.",
              "Corregir con urgencia; evitar toda exposición prolongada.",
            ],
          ]}
        />
        <Src>
          Sessler DI, et al. (POQI). Br J Anaesth 2019;122(5):563-574. · Salmasi V, et al.
          Anesthesiology 2017;126(1):47-65. · Futier E, et al. (INPRESS). JAMA 2017;318(14):1346-1357.
        </Src>
        <Callout variant="info">
          <b>Individualizar el objetivo.</b> En INPRESS, mantener la PAS a ±10% del basal del paciente
          (frente a un objetivo fijo) redujo la disfunción orgánica postoperatoria. En el hipertenso
          crónico la autorregulación está desplazada: su «65» puede ser demasiado bajo.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Diferencial rápido — el eje del gasto cardíaco">
        <P>
          PA = GC × RVS, y GC = VS × FC, con VS dependiente de <b>precarga</b>, <b>contractilidad</b> y{" "}
          <b>poscarga/pared</b>. Toda hipotensión intraoperatoria cae en uno (o varios) de estos
          eslabones. Recorrerlos de forma ordenada convierte un «está hipotenso» en un diagnóstico
          accionable en segundos.
        </P>
        <Table
          headers={["Eje roto", "Mecanismo", "Causas intraoperatorias típicas"]}
          accentCol={0}
          rows={[
            [
              "Precarga ↓",
              "Retorno venoso / volumen insuficiente.",
              "Hipovolemia, hemorragia, ayuno/diuresis, pérdidas al tercer espacio.",
            ],
            [
              "Poscarga ↓ (vasoplejia)",
              "Caída de RVS / vasodilatación.",
              "Anestésico profundo, sepsis, anafilaxia, IECA/ARA-II, reperfusión, protamina.",
            ],
            [
              "Contractilidad ↓ (cardiogénica)",
              "Fallo de bomba.",
              "Isquemia/IAM, arritmia, miocardiopatía, sobredosis de anestésico/β-bloqueo.",
            ],
            [
              "Obstructiva",
              "Bloqueo mecánico del llenado o la eyección.",
              "Neumotórax a tensión, TEP, taponamiento, auto-PEEP, embolia gaseosa.",
            ],
            [
              "Frecuencia (FC)",
              "Bradi o taqui extremas reducen el GC.",
              "Bradicardia vagal/β-bloqueo/neuroaxial alto; taquiarritmia sin llenado.",
            ],
            [
              "Mecánica / posición",
              "Interferencia física con el retorno.",
              "Compresión de cava (gravídica, retractores, laparoscopia), posición, PEEP alta.",
            ],
          ]}
        />
        <Src>
          Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. · Pardo MC, Miller RD. Basics of
          Anesthesia (Stoelting), 8.ª ed. — Cardiovascular physiology &amp; monitoring.
        </Src>
        <Callout variant="warn">
          <b>El anestésico profundo es la causa más frecuente y la más fácil de tratar.</b> Antes de
          escalar, mira el vaporizador / la bomba de propofol: sobredosis relativa = vasodilatación +
          depresión miocárdica. Reducir la profundidad suele resolverlo (vigilando no despertar al
          paciente).
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Causas por categoría — pistas y confirmación">
        <P>
          Cada categoría tiene un patrón reconocible al lado del monitor. Cruzar la hipotensión con FC,
          capnografía, presión de vía aérea, ECG y el contexto quirúrgico estrecha el diferencial antes
          de tocar la sonda de ecografía.
        </P>
        <Table
          headers={["Categoría", "Pistas junto al monitor", "Confirmación / acción dirigida"]}
          rows={[
            [
              "Hipovolemia / hemorragia",
              "Taquicardia, VVS/VPP alta, campo sangrante, respuesta a piernas elevadas.",
              "Bolo de cristaloide/hemoderivado; POCUS: VCI colapsable, VI hiperdinámico «kissing».",
            ],
            [
              "Anestésico profundo",
              "Vaporizador/propofol altos, BIS bajo, vasodilatación, ± bradicardia.",
              "Bajar profundidad anestésica; vasopresor puente si es preciso.",
            ],
            [
              "Vasoplejia (sepsis/anafilaxia/IECA)",
              "RVS baja con GC normal/alto; anafilaxia: broncoespasmo, ↑ presión vía aérea, eritema.",
              "Noradrenalina; tratar la causa (adrenalina en anafilaxia; ver guías).",
            ],
            [
              "Neumotórax a tensión",
              "↑ presión de vía aérea, hipoxemia, ↓ murmullo, desviación traqueal, tras VVC/bloqueo.",
              "POCUS: ausencia de deslizamiento pleural; descompresión inmediata.",
            ],
            [
              "TEP / embolia gaseosa",
              "Caída brusca de EtCO₂, hipoxemia, VD dilatado; gas: cirugía sentada/laparoscopia.",
              "POCUS: dilatación de VD, D-sign; soporte, inundar campo (gas), decúbito lateral izq.",
            ],
            [
              "Taponamiento",
              "Pulso paradójico, ingurgitación yugular, ruidos apagados, cirugía cardíaca/trauma.",
              "POCUS/ETE: derrame + colapso diastólico; pericardiocentesis/reapertura.",
            ],
            [
              "Auto-PEEP",
              "Broncoespasmo/asma, TET, hipotensión al conectar el ventilador; flujo no vuelve a 0.",
              "Desconectar del circuito, espiración manual; bajar FR / prolongar espiración.",
            ],
            [
              "Cardiogénica (isquemia/arritmia)",
              "Cambios ST/T, hipocinesia nueva, ritmo anómalo, ↓ EtCO₂ con GC bajo.",
              "ECG 12 der.; tratar arritmia (ver ACLS); inotrópico/vasopresor según patrón.",
            ],
            [
              "Bloqueo neuroaxial alto",
              "Hipotensión + bradicardia tras espinal/epidural; nivel sensitivo ascendente, disnea.",
              "Efedrina/atropina, fluidos, Trendelenburg; asegurar vía aérea si nivel muy alto.",
            ],
            [
              "Mecánica / compresión de cava",
              "Hipotensión posicional; gestante supina, retractor, neumoperitoneo, PEEP alta.",
              "Desplazamiento uterino izquierdo / reposición; liberar compresión; bajar insuflación.",
            ],
          ]}
        />
        <Src>
          Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — Cardiovascular emergencies. · Pardo MC,
          Miller RD. Basics of Anesthesia, 8.ª ed. · POCUS perioperatorio (RUSH/FoCUS).
        </Src>
        <Callout variant="danger">
          <b>No olvides las causas obstructivas: matan rápido y no responden a fluidos ni presores.</b>{" "}
          Neumotórax a tensión, taponamiento, TEP masivo, auto-PEEP y embolia gaseosa exigen{" "}
          <b>tratamiento mecánico específico</b> (descompresión, drenaje, desconexión del ventilador).
          Una hipotensión que no responde al abordaje habitual obliga a descartarlas con POCUS ya.
        </Callout>
        <Callout variant="warn">
          <b>Auto-PEEP:</b> la maniobra diagnóstica y terapéutica es <b>desconectar el TET del
          circuito</b> unos segundos —si la presión cae y la TA sube, era atrapamiento aéreo—. Después,
          reducir la frecuencia respiratoria y prolongar el tiempo espiratorio.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Acción — bajar anestésico, fluidos, vasopresor, causa">
        <P>
          Cuatro movimientos en paralelo: <b>reducir el anestésico</b>, <b>optimizar el volumen</b>,{" "}
          <b>dar el vasopresor adecuado a la FC</b> y <b>tratar la causa específica</b>. La elección del
          vasopresor se guía por la frecuencia cardíaca: fenilefrina si taquicárdico, efedrina si
          bradicárdico, y noradrenalina como caballo de batalla en vasoplejia o hipotensión sostenida.
        </P>
        <Table
          headers={["Acción", "Cómo", "Cuándo"]}
          rows={[
            [
              "1 · Bajar anestésico",
              "Reducir vaporizador / propofol; verificar sobredosis relativa (BIS bajo).",
              "Casi siempre primero — causa frecuente y reversible en segundos.",
            ],
            [
              "2 · Fluidos",
              "Bolo de cristaloide balanceado 250–500 mL (≈ 4–7 mL/kg); repetir según respuesta dinámica.",
              "Precarga baja / respondedor a volumen (VVS-VPP alta, VCI colapsable).",
            ],
            [
              "3 · Vasopresor",
              "Elegir por FC (ver tabla §5): fenilefrina, efedrina o noradrenalina.",
              "Puente inmediato y para vasoplejia o hipotensión que no cede con fluidos.",
            ],
            [
              "4 · Tratar la causa",
              "Control de hemorragia, descompresión/drenaje, antiarrítmico, adrenalina en anafilaxia, etc.",
              "En cuanto el diferencial la identifique; las obstructivas, ya.",
            ],
          ]}
        />
        <Src>
          Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. · Pardo MC, Miller RD. Basics of
          Anesthesia, 8.ª ed. — Sympathomimetics &amp; fluid therapy.
        </Src>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Vasopresores — dosis y selección por FC">
        <P>
          En el paciente monitorizado, los vasopresores se dan en <b>bolos titulados</b> o en{" "}
          <b>infusión</b>. La regla práctica: <b>fenilefrina</b> (α₁ puro, ↑ RVS con bradicardia refleja)
          si el paciente está <b>taquicárdico</b>; <b>efedrina</b> (α + β indirecto) si está{" "}
          <b>bradicárdico</b> o normocárdico; y <b>noradrenalina</b> como vasopresor de elección en
          vasoplejia (sepsis) o hipotensión sostenida que exige infusión.
        </P>
        <Table
          headers={["Fármaco", "Dosis", "Perfil / cuándo elegir"]}
          accentCol={1}
          rows={[
            [
              "Fenilefrina",
              "Bolo 50–100 mcg IV (repetir); infusión 0.1–0.5 mcg/kg/min",
              "α₁ puro; ↑ RVS con bradicardia refleja. Elegir si TAQUICÁRDICO o precisa solo poscarga.",
            ],
            [
              "Efedrina",
              "Bolo 5–10 mg IV (repetir; máx. práctico ~50 mg por taquifilaxia)",
              "α + β (indirecto), ↑ FC y contractilidad. Elegir si BRADICÁRDICO / neuroaxial / obstétrica.",
            ],
            [
              "Noradrenalina",
              "Infusión ~0.05 mcg/kg/min, titular a PAM ≥ 65; bolos diluidos 4–8 mcg posibles",
              "Vasopresor de elección en vasoplejia/sepsis y en hipotensión sostenida. Vía central preferible; periférica corta aceptable para no retrasar.",
            ],
            [
              "Adrenalina",
              "Anafilaxia: ver guía (bolos mcg IV titulados); paro: 1 mg IV",
              "Vasoplejia/anafilaxia refractaria, disfunción de bomba, paro. Ver guía de anafilaxia.",
            ],
            [
              "Vasopresina",
              "Bolo 1–2 U IV; infusión 0.01–0.04 U/min",
              "Vasoplejia refractaria a catecolaminas (post-CEC, IECA, sepsis, anafilaxia).",
            ],
          ]}
        />
        <Src>
          Pardo MC, Miller RD. Basics of Anesthesia (Stoelting), 8.ª ed. — Sympathomimetic drugs. ·
          Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. · Evans L, et al. SSC 2021 (noradrenalina
          1.ª línea en shock séptico).
        </Src>
        <Callout variant="info">
          <b>Regla mnemotécnica de FC.</b> Taquicárdico → <b>fenilefrina</b> (baja la FC por reflejo);
          bradicárdico → <b>efedrina</b> (sube la FC). Para hipotensión que no cede con bolos, pasa a{" "}
          <b>noradrenalina en infusión</b> en vez de encadenar bolos crecientes.
        </Callout>
        <Callout variant="warn">
          <b>Obstétrica:</b> en la hipotensión por raquianestesia para cesárea, la fenilefrina en
          infusión/bolos es hoy el vasopresor de elección (mejor equilibrio ácido-base fetal que
          efedrina); usar efedrina si hay bradicardia materna asociada.
          <br />
          <span className="mono" style={{ fontSize: "0.62rem", color: "var(--text-3)" }}>
            Kinsella SM, et al. Consenso internacional sobre vasopresores en cesárea. Anaesthesia
            2018;73(1):71-92.
          </span>
        </Callout>
        <Callout variant="danger">
          <b>Dilución de la noradrenalina y adrenalina en bolo:</b> son de <b>microgramos titulados</b>,
          no de miligramos. Confundir la dilución (mg por mcg) causa crisis hipertensiva, arritmia e
          isquemia. Reservar el <b>1 mg IV</b> de adrenalina exclusivamente para el paro cardíaco.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="POCUS y monitor de gasto cardíaco">
        <P>
          Cuando el diferencial no se cierra con la clínica o la hipotensión es refractaria, la{" "}
          <b>ecografía a pie de cama (POCUS/FoCUS/ETE)</b> y los <b>monitores de gasto cardíaco</b>{" "}
          convierten la sospecha en diagnóstico: distinguen hipovolemia de vasoplejia, de fallo de
          bomba y de obstrucción en minutos.
        </P>
        <Table
          headers={["Herramienta", "Qué muestra", "Uso en el diferencial"]}
          rows={[
            [
              "FoCUS / ecocardio",
              "Contractilidad de VI, tamaño/función de VD, derrame pericárdico, VI «kissing».",
              "VI hiperdinámico y vacío → hipovolemia; VD dilatado → TEP/obstructiva; derrame → taponamiento.",
            ],
            [
              "VCI (subxifoidea)",
              "Diámetro y colapsabilidad de la vena cava inferior.",
              "VCI pequeña/colapsable → respondedor a volumen; distendida → sospecha obstructiva/VD.",
            ],
            [
              "POCUS pulmonar",
              "Deslizamiento pleural, líneas B, derrame.",
              "Ausencia de deslizamiento → neumotórax; congestión → sobrecarga.",
            ],
            [
              "Monitor de GC / VVS-VPP",
              "Gasto cardíaco, volumen sistólico, variación de presión/volumen de pulso.",
              "VVS/VPP > 12–13% → probable respondedor a volumen; RVS baja con GC alto → vasoplejia.",
            ],
            [
              "Línea arterial",
              "Onda de presión latido a latido, base para VVP/VPP y gasometría.",
              "Confirma la cifra (vs artefacto) y aporta las variables dinámicas.",
            ],
          ]}
        />
        <Src>
          Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — Hemodynamic monitoring &amp;
          echocardiography. · POCUS perioperatorio (RUSH/FoCUS); análisis de la onda de pulso (VVS/VPP).
        </Src>
        <Callout variant="ok">
          <b>La ecografía cierra el algoritmo.</b> Un vistazo FoCUS + VCI + pulmón responde las cuatro
          preguntas clave —¿está lleno? ¿la bomba tira? ¿hay obstrucción? ¿está vasodilatado?— y dirige
          el tratamiento sin adivinar. Ante hipotensión refractaria, coger la sonda es parte del
          manejo, no un lujo.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Resumen de dosis y umbrales clave">
        <Table
          headers={["Parámetro", "Valor", "Fuente"]}
          accentCol={1}
          rows={[
            ["Definición — PAM absoluta", "< 65 mmHg", "POQI / Salmasi"],
            ["Definición — caída relativa", "> 20% del basal", "POQI / INPRESS"],
            ["Objetivo intraoperatorio", "PAM ≥ 65 (individualizar; ±10% basal en INPRESS)", "POQI / INPRESS"],
            ["Bolo de cristaloide", "250–500 mL (≈ 4–7 mL/kg), repetir por respuesta", "Miller / Stoelting"],
            ["Fenilefrina (taquicárdico)", "50–100 mcg bolo · 0.1–0.5 mcg/kg/min", "Stoelting"],
            ["Efedrina (bradicárdico)", "5–10 mg bolo IV", "Stoelting"],
            ["Noradrenalina (vasoplejia/sostenida)", "~0.05 mcg/kg/min, titular a PAM ≥ 65", "Miller / SSC 2021"],
            ["Vasopresina (refractaria)", "1–2 U bolo · 0.01–0.04 U/min", "Miller"],
            ["VVS/VPP respondedor a volumen", "> 12–13%", "Miller"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Gropper MA, Cohen NH, Eriksson LI, et al. Miller&apos;s Anesthesia. 9.ª ed. Philadelphia: Elsevier; 2020. — Cardiovascular Monitoring; Perioperative Hemodynamics.</li>
          <li>Pardo MC, Miller RD. Basics of Anesthesia (Stoelting). 8.ª ed. Philadelphia: Elsevier; 2023. — Cardiovascular physiology; Sympathomimetic drugs.</li>
          <li>Futier E, Lefrant JY, Guinot PG, et al. Effect of Individualized vs Standard Blood Pressure Management Strategies on Postoperative Organ Dysfunction (INPRESS). JAMA 2017;318(14):1346-1357.</li>
          <li>Sessler DI, Bloomstone JA, Aronson S, et al. Perioperative Quality Initiative consensus statement on intraoperative blood pressure, risk and outcomes for elective surgery. Br J Anaesth 2019;122(5):563-574.</li>
          <li>Salmasi V, Maheshwari K, Yang D, et al. Relationship between Intraoperative Hypotension and Myocardial and Acute Kidney Injury after Noncardiac Surgery. Anesthesiology 2017;126(1):47-65.</li>
          <li>Kinsella SM, Carvalho B, Dyer RA, et al. International consensus statement on the management of hypotension with vasopressors during caesarean section under spinal anaesthesia. Anaesthesia 2018;73(1):71-92.</li>
          <li>Evans L, Rhodes A, Alhazzani W, et al. Surviving Sepsis Campaign 2021. Crit Care Med 2021;49(11):e1063-e1143. — Noradrenalina de 1.ª línea.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// dosis y umbrales de literatura aceptada (Miller · Stoelting · INPRESS · POQI · SSC 2021)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// taquicárdico → fenilefrina; bradicárdico → efedrina; vasoplejia/sostenida → noradrenalina"}
          <br />
          {"// si no responde a fluidos ni presores, sospecha causa obstructiva y coge la sonda ya"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
