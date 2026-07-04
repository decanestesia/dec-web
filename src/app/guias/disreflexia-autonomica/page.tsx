import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — DISREFLEXIA AUTONÓMICA
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: umbrales, secuencia de manejo y fármacos
// tomados de literatura aceptada (CSCM/PVA guidelines, UpToDate,
// Miller, Barash). Cada tabla/callout cita su fuente (Vancouver
// breve). NO inventar dosis.
// Fuentes primarias:
//  - Consortium for Spinal Cord Medicine. Acute Management of
//    Autonomic Dysreflexia. 2nd ed. Paralyzed Veterans of America
//    (PVA); 2001 (reaffirmed).
//  - Krassioukov A, et al. A systematic review of the management of
//    autonomic dysreflexia after spinal cord injury. Arch Phys Med
//    Rehabil 2009;90(4):682-695.
//  - Gropper MA, et al. Miller's Anesthesia, 9.ª ed. — Anesthesia
//    for Patients with Spinal Cord Injury.
//  - Petsas A, Drake J. Perioperative autonomic dysreflexia. BJA
//    Education (Contin Educ Anaesth Crit Care Pain) 2014;14(3):137.
// ============================================================

export const metadata: Metadata = {
  title: "Disreflexia autonómica — reconocimiento y manejo perioperatorio · DEC",
  description:
    "Referencia perioperatoria de disreflexia autonómica en lesión medular ≥ T6: hipertensión paroxística severa con bradicardia refleja y cefalea, sudoración/rubor por encima de la lesión y palidez/piloerección por debajo. Manejo por pasos (sentar al paciente, retirar el estímulo nocivo, vaciar vejiga/recto, profundizar anestesia) y antihipertensivos rápidos y de acción corta (nitroprusiato, nitroglicerina, nifedipino, labetalol, hidralazina). Prevención con anestesia adecuada, regional preferida. Guías CSCM/PVA.",
  openGraph: {
    title: "Disreflexia autonómica — reconocimiento y manejo perioperatorio · DEC",
    description:
      "Lesión medular ≥ T6, hipertensión paroxística con bradicardia refleja, secuencia de manejo y antihipertensivos rápidos de acción corta. Guías CSCM/PVA.",
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
export default function DisreflexiaAutonomicaPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat disreflexia-autonomica.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Disreflexia autonómica
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          lesión medular ≥ T6 · HTA paroxística + bradicardia refleja · retirar el estímulo · antihipertensivo rápido y corto
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// una vejiga llena puede subir la TA a 300: el estímulo que no sientes es el que te mata"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">EMERGENCIA</span>
          <span className="tag tag-muted">CSCM/PVA</span>
          <span className="tag tag-muted">Krassioukov 2009</span>
          <span className="tag tag-muted">Miller</span>
        </div>
      </header>

      <Callout variant="danger">
        <b>Emergencia hipertensiva.</b> En lesión medular <b>en o por encima de T6</b>, un estímulo
        nocivo por debajo del nivel de lesión desencadena vasoconstricción refleja masiva no modulada
        → <b>hipertensión paroxística severa</b> con <b>bradicardia refleja</b> y cefalea pulsátil. El
        riesgo es <b>ACV hemorrágico, convulsión, encefalopatía, arritmia y edema agudo de pulmón</b>.
        La conducta es inmediata: <b>sentar al paciente</b>, <b>retirar el estímulo</b> y{" "}
        <b>bajar la TA</b> con un antihipertensivo de acción rápida y corta.
      </Callout>

      {/* ========================================================= */}
      <Section n="01" title="Fisiopatología y por qué T6">
        <P>
          Por debajo del nivel de lesión, un estímulo nocivo (distensión vesical o intestinal, tracción
          quirúrgica, úlcera, contracción uterina) genera descarga simpática espinal masiva a través
          de la cadena esplácnica. En la médula intacta, centros supraespinales inhibirían esa
          descarga; en la lesión medular esa señal inhibitoria <b>no cruza el nivel de lesión</b>, de
          modo que la vasoconstricción por debajo queda desenfrenada → <b>crisis hipertensiva</b>.
        </P>
        <P>
          El umbral de <b>T6</b> es funcional: el lecho esplácnico (gran reservorio vascular) recibe
          inervación simpática de <b>T5–L2</b>. Solo cuando la lesión queda por encima de la salida
          esplácnica queda suficiente masa vascular desconectada del control supraespinal para producir
          hipertensión sistémica. Por debajo de T6 el síndrome es raro y leve.
        </P>
        <Table
          headers={["Territorio", "Respuesta autonómica", "Signo clínico"]}
          rows={[
            [
              "Por debajo de la lesión",
              "Descarga simpática desenfrenada → vasoconstricción intensa",
              "Palidez, piloerección, frialdad, hipertensión.",
            ],
            [
              "Por encima de la lesión",
              "Reflejo parasimpático compensador (baroreceptores → vago)",
              "Rubor facial, sudoración profusa, congestión nasal, cefalea.",
            ],
            [
              "Corazón",
              "Bradicardia refleja vagal (respuesta a la HTA)",
              "Bradicardia (a veces taquicardia/arritmia); pulso lento con TA alta.",
            ],
          ]}
        />
        <Src>
          Consortium for Spinal Cord Medicine (PVA). Acute Management of Autonomic Dysreflexia. 2.ª ed;
          2001. · Krassioukov A, et al. Arch Phys Med Rehabil 2009;90(4):682-695.
        </Src>
        <Callout variant="info">
          La disautonomía puede aparecer desde semanas tras la lesión y persistir de por vida. La TA
          basal del lesionado medular alto es <b>baja</b> (90–110 mmHg sistólica): un ascenso de{" "}
          <b>20–40 mmHg sobre su basal</b> ya puede representar disreflexia, aunque la cifra parezca
          «normal» para un individuo sano.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Reconocimiento — clínica">
        <P>
          El cuadro es súbito y clásico. Bajo anestesia general el paciente no refiere cefalea: la HTA
          paroxística inexplicada y la bradicardia son la pista. La combinación{" "}
          <b>hipertensión + rubor/sudor por encima + palidez/piloerección por debajo</b> es
          patognomónica en el contexto de lesión medular alta.
        </P>
        <Table
          headers={["Dominio", "Manifestación"]}
          rows={[
            ["Cardiovascular", "Hipertensión paroxística severa (a menudo sistólica > 200 mmHg); bradicardia refleja; arritmias."],
            ["Cefálico", "Cefalea pulsátil intensa y brusca (síntoma cardinal en el paciente despierto)."],
            ["Por encima de la lesión", "Rubor facial, sudoración profusa, congestión nasal, visión borrosa, midriasis."],
            ["Por debajo de la lesión", "Palidez, piloerección (piel de gallina), frialdad, vasoconstricción cutánea."],
            ["Bajo anestesia general", "HTA y bradicardia inexplicadas; sudoración/rubor de la mitad superior; puede faltar la cefalea (paciente dormido)."],
          ]}
        />
        <Src>
          Consortium for Spinal Cord Medicine (PVA), 2001. · Petsas A, Drake J. BJA Educ
          2014;14(3):137-139. · Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed.
        </Src>
        <Callout variant="warn">
          <b>Disparadores más frecuentes (en orden).</b> <b>Vejiga:</b> distensión, sonda obstruida o
          acodada, retención — es la causa nº 1 (~75–85%). <b>Intestino:</b> impactación fecal,
          distensión rectal. <b>Cirugía / instrumentación:</b> incisión, tracción visceral, cistoscopia,
          RTU, dilatación anal, trabajo de parto. Piel: úlcera, uña encarnada, ropa/vendaje apretado.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Manejo inmediato — secuencia">
        <P>
          El manejo es escalonado y precede al fármaco: la mayoría de las crisis ceden al{" "}
          <b>eliminar el estímulo</b>. Actuar en segundos. Los pasos posturales y de retirada del
          estímulo se hacen <b>en paralelo</b> a preparar el antihipertensivo, no después.
        </P>
        <Table
          headers={["Paso", "Acción", "Racional"]}
          rows={[
            [
              "1 · Sentar",
              "Incorporar al paciente (sentado, cabecera elevada) y bajar las piernas.",
              "Ortostatismo terapéutico: aprovecha la disautonomía para bajar la TA de inmediato.",
            ],
            [
              "2 · Aflojar",
              "Retirar ropa/vendajes/medias/fajas compresivos; quitar todo lo constrictivo.",
              "Elimina un posible estímulo y facilita el descenso tensional.",
            ],
            [
              "3 · Vejiga",
              "Sondar si no hay sonda; si la hay, comprobar acodamiento/obstrucción, irrigar o recambiar. Vaciar la vejiga.",
              "La distensión vesical es la causa más frecuente; vaciarla resuelve la mayoría.",
            ],
            [
              "4 · Recto",
              "Si persiste tras vaciar vejiga: tacto rectal con anestésico local (lidocaína gel) y desimpactar con suavidad.",
              "La distensión/manipulación rectal es el segundo disparador; el gel evita agravar el reflejo.",
            ],
            [
              "5 · Fármaco",
              "Si la TA sigue alta pese a retirar el estímulo, antihipertensivo rápido y de acción corta (ver §4).",
              "Control mientras se busca/elimina el foco; evitar hipotensión de rebote.",
            ],
            [
              "6 · Monitorizar",
              "TA cada 2–5 min durante la crisis y ≥ 2 h tras resolverla; buscar el estímulo si recurre.",
              "La crisis recurre si el foco persiste; el rebote hipotensor es real.",
            ],
          ]}
        />
        <Src>Consortium for Spinal Cord Medicine (PVA). Acute Management of Autonomic Dysreflexia. 2.ª ed; 2001.</Src>
        <Callout variant="danger">
          <b>Sentar es el primer gesto y es terapéutico.</b> No acostar al paciente: la posición supina
          eleva aún más la TA. Incorporarlo aprovecha la caída ortostática que la propia disautonomía
          provoca. Es la maniobra más rápida y no espera al fármaco.
        </Callout>
        <Callout variant="warn">
          <b>Manipular la vejiga/el recto sin anestesia local puede empeorar la crisis.</b> El propio
          sondaje o tacto es un estímulo nocivo: usar <b>lidocaína gel</b> intrauretral/rectal y actuar
          con suavidad. Nunca presionar el abdomen para «exprimir» la vejiga (maniobra de Credé): agrava
          la descarga.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Antihipertensivos — rápidos y de acción corta">
        <P>
          Si la TA persiste elevada pese a retirar el estímulo, usar un agente de <b>inicio rápido y
          vida media corta</b>: la causa suele ser transitoria y, una vez eliminada, un fármaco de
          acción prolongada precipita <b>hipotensión de rebote</b> sobre un paciente con TA basal ya
          baja. Titular a la respuesta.
        </P>
        <Table
          headers={["Fármaco", "Dosis / vía", "Nota"]}
          accentCol={1}
          rows={[
            [
              "Nitroprusiato de sodio",
              "Infusión IV 0.25–0.5 µg/kg/min, titular al alza (rango 0.5–10 µg/kg/min)",
              "Inicio y offset en segundos; control fino en quirófano con línea arterial. Vigilar cianuro en uso prolongado.",
            ],
            [
              "Nitroglicerina",
              "Infusión IV 5 µg/min, titular · o pasta tópica al 2% (p. ej. 2.5 cm) sobre la piel por encima de la lesión",
              "Muy usada y de acción corta. CONTRAINDICADA si el paciente tomó inhibidor de PDE5 (sildenafil/tadalafil) en 24–48 h.",
            ],
            [
              "Nifedipino",
              "10 mg cápsula, morder y tragar (vía oral); repetible según respuesta",
              "Opción de referencia sin acceso IV. Evitar sublingual por absorción errática. Precaución en cardiopatía isquémica.",
            ],
            [
              "Labetalol",
              "Bolo IV 5–20 mg, repetible; α + β bloqueo",
              "Útil por su componente alfa; el beta puro puede empeorar la bradicardia refleja.",
            ],
            [
              "Hidralazina",
              "Bolo IV 5–10 mg, repetible c/20–30 min",
              "Vasodilatador directo; inicio algo más lento y puede dar taquicardia refleja.",
            ],
          ]}
        />
        <Src>
          Consortium for Spinal Cord Medicine (PVA), 2001. · Krassioukov A, et al. Arch Phys Med Rehabil
          2009;90(4):682-695. · Petsas A, Drake J. BJA Educ 2014;14(3):137-139.
        </Src>
        <Callout variant="warn">
          <b>Rebote hipotensor.</b> Una vez retirado el estímulo, la descarga simpática cesa de golpe:
          un antihipertensivo de acción larga deja al paciente en <b>hipotensión severa</b> sobre su
          basal ya baja. Preferir agentes titulables y de offset rápido; remonitorizar la TA ≥ 2 h.
        </Callout>
        <Callout variant="danger">
          <b>Nitratos + inhibidor de PDE5.</b> No administrar nitroglicerina ni nitroprusiato si el
          paciente usó <b>sildenafil/tadalafil/vardenafil</b> en las últimas 24–48 h (frecuente en esta
          población por disfunción eréctil): riesgo de hipotensión profunda refractaria. Usar otra
          clase (nifedipino, labetalol, hidralazina).
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Prevención perioperatoria y elección anestésica">
        <P>
          El objetivo intraoperatorio es <b>bloquear el arco reflejo</b>: cualquier cirugía por debajo
          del nivel de lesión (urológica, colorrectal, obstétrica, ortopédica de miembros inferiores),
          aunque el paciente «no sienta», <b>requiere anestesia</b>. La ausencia de dolor consciente{" "}
          <b>no</b> significa ausencia de estímulo aferente nocivo.
        </P>
        <Table
          headers={["Técnica", "Efecto sobre la disreflexia", "Comentario"]}
          rows={[
            [
              "Anestesia regional (raquídea)",
              "Bloqueo más completo del arco reflejo aferente",
              "Preferida cuando es factible; el bloqueo espinal interrumpe la señal nociva por debajo de la lesión.",
            ],
            [
              "Anestesia epidural",
              "Eficaz pero puede dar bloqueo irregular/en parches",
              "Alternativa regional; el nivel puede ser incompleto en el lesionado medular.",
            ],
            [
              "Anestesia general profunda",
              "Bloquea el reflejo si la profundidad es adecuada",
              "Válida; titular profundidad, no confiar en la ausencia de movimiento como signo de bloqueo suficiente.",
            ],
            [
              "Anestesia local / sin anestesia",
              "Insuficiente para procedimientos con estímulo visceral",
              "Riesgo alto de disreflexia; evitar la falsa seguridad de que «no siente».",
            ],
          ]}
        />
        <Src>
          Petsas A, Drake J. BJA Educ 2014;14(3):137-139. · Gropper MA, et al. Miller&apos;s Anesthesia,
          9.ª ed. — Anesthesia for Patients with Spinal Cord Injury. · Krassioukov A, et al. Arch Phys
          Med Rehabil 2009.
        </Src>
        <Callout variant="ok">
          <b>La anestesia adecuada es la mejor profilaxis.</b> Regional (raquídea) preferida cuando es
          factible por su bloqueo más completo del arco reflejo; si se opta por general, mantener{" "}
          <b>plano anestésico profundo</b>. Monitorización arterial invasiva en cirugía con estímulo
          previsible y antihipertensivo de acción corta preparado y a mano.
        </Callout>
        <Callout variant="info">
          <b>Antes de inducir:</b> vaciar la vejiga (sonda permeable), confirmar ausencia de impactación
          fecal, retirar constricciones. Muchas crisis intraoperatorias se previenen eliminando el
          disparador más común <b>antes</b> de empezar.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Resumen de dosis y umbrales clave">
        <Table
          headers={["Parámetro", "Valor", "Fuente"]}
          accentCol={1}
          rows={[
            ["Nivel de lesión de riesgo", "En o por encima de T6", "CSCM/PVA"],
            ["Umbral tensional de alarma", "↑ 20–40 mmHg sobre la basal del paciente", "CSCM/PVA"],
            ["1.er gesto", "Sentar al paciente + bajar piernas", "CSCM/PVA"],
            ["Causa nº 1 a descartar", "Distensión / obstrucción vesical", "CSCM/PVA"],
            ["Nitroprusiato de sodio", "IV 0.25–0.5 µg/kg/min, titular", "CSCM/PVA · Miller"],
            ["Nitroglicerina", "IV 5 µg/min titular · o pasta 2% tópica", "CSCM/PVA"],
            ["Nifedipino", "10 mg morder y tragar (VO)", "CSCM/PVA"],
            ["Labetalol", "5–20 mg IV bolo, repetible", "Krassioukov 2009"],
            ["Hidralazina", "5–10 mg IV bolo, repetible c/20–30 min", "Krassioukov 2009"],
            ["Anestesia de elección", "Regional (raquídea) preferida", "Miller · BJA Educ 2014"],
            ["Monitorización post-crisis", "TA ≥ 2 h por riesgo de rebote", "CSCM/PVA"],
          ]}
        />
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Consortium for Spinal Cord Medicine. Acute Management of Autonomic Dysreflexia: Individuals with Spinal Cord Injury Presenting to Health-Care Facilities. 2nd ed. Washington, DC: Paralyzed Veterans of America; 2001.</li>
          <li>Krassioukov A, Warburton DE, Teasell R, Eng JJ; SCIRE Research Team. A systematic review of the management of autonomic dysreflexia after spinal cord injury. Arch Phys Med Rehabil 2009;90(4):682-695.</li>
          <li>Petsas A, Drake J. Perioperative management for patients with a chronic spinal cord injury / autonomic dysreflexia. BJA Education (Contin Educ Anaesth Crit Care Pain) 2014;14(3):137-139.</li>
          <li>Gropper MA, Cohen NH, Eriksson LI, et al. Miller&apos;s Anesthesia, 9.ª ed. — Anesthesia for Patients with Spinal Cord Injury. Elsevier; 2020.</li>
          <li>Krassioukov A, Biering-Sørensen F, Donovan W, et al. International standards to document remaining autonomic function after spinal cord injury. J Spinal Cord Med 2012;35(4):201-210.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// umbrales y dosis de literatura aceptada (CSCM/PVA 2001 · Krassioukov 2009 · Miller · BJA Educ)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, monitorización ni protocolo institucional"}
          <br />
          {"// primero sienta, retira el estímulo y vacía la vejiga; el fármaco es el plan B, no el A"}
          <br />
          {"// TA basal 90 es normal en tu paciente: no esperes a 180 para llamarlo crisis"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
