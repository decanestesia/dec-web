import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — BLOQUEOS REGIONALES GUIADOS POR ECOGRAFÍA
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: volúmenes, planos y dosis máximas tomados de
// literatura aceptada (ASRA, NYSORA, Miller, Stoelting). Cada tabla/
// callout cita su fuente (Vancouver breve). NO inventar cifras.
// Fuentes primarias:
//  - Neal JM, Barrington MJ, Fettiplace MR, et al. The Third American
//    Society of Regional Anesthesia and Pain Medicine Practice Advisory
//    on Local Anesthetic Systemic Toxicity (LAST). Reg Anesth Pain Med
//    2018;43(2):113-123.
//  - Hadzic A (ed.). NYSORA — Hadzic's Textbook of Regional Anesthesia
//    and Acute Pain Management, 2.ª ed. McGraw-Hill, 2017.
//  - Gropper MA, et al. Miller's Anesthesia, 9.ª ed. — Peripheral Nerve
//    Blocks / Ultrasound-Guided Regional Anesthesia.
//  - Rosenberg PH, Veering BT, Urmey WF. Maximum recommended doses of
//    local anesthetics: a multifactorial concept. Reg Anesth Pain Med
//    2004;29(6):564-575.
// ============================================================

export const metadata: Metadata = {
  title: "Bloqueos regionales — referencia guiada por ecografía · DEC",
  description:
    "Referencia estructurada de bloqueos regionales guiados por ecografía: TAP (15-20 mL/lado), ESP erector espinae (20-30 mL), PECS I/II y serrato (10-20 mL), cuadrado lumbar, interescalénico (10-20 mL, ojo n. frénico), supraclavicular/infraclavicular/axilar, femoral y canal aductor (15-20 mL), ciático poplíteo, paravertebral. Dosis máximas de anestésico local (ropivacaína ~3 mg/kg, bupivacaína ~2 mg/kg, lidocaína 4.5/7 mg/kg), aspiración, dosis test, monitorización y kit de emulsión lipídica para LAST. Guías ASRA y NYSORA.",
  openGraph: {
    title: "Bloqueos regionales — referencia guiada por ecografía · DEC",
    description:
      "Indicación, plano y volumen típico por bloqueo (TAP, ESP, PECS, QL, interescalénico, supra/infraclavicular, axilar, femoral, canal aductor, ciático poplíteo, paravertebral) + dosis máximas de AL y manejo de LAST. ASRA / NYSORA.",
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
export default function BloqueosRegionalesPage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/guias" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /guias
      </Link>

      {/* Header estándar */}
      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> cat bloqueos-regionales.md
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Bloqueos regionales — referencia
        </h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.66rem", marginTop: "0.4rem", lineHeight: 1.7 }}
        >
          plano · indicación · volumen típico · dosis máxima de AL · aspiración · dosis test · lípidos para LAST
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// la aguja va donde ves la punta, no donde crees que está: sin punta en pantalla, no inyectes"}
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          <span className="tag tag-accent">REFERENCIA</span>
          <span className="tag tag-muted">ASRA</span>
          <span className="tag tag-muted">NYSORA</span>
          <span className="tag tag-muted">Miller</span>
        </div>
      </header>

      <Callout variant="danger">
        <b>Antes de cualquier bloqueo.</b> Monitorización estándar (ECG, SpO₂, PA), acceso venoso,
        material de reanimación y <b>emulsión lipídica al 20% disponible</b> en la sala. Calcular la{" "}
        <b>dosis máxima de anestésico local por peso</b> (ver §12) <b>antes</b> de cargar la jeringa,{" "}
        <b>aspirar</b> antes de cada alícuota, <b>fraccionar</b> la inyección (3–5 mL) con dosis test, y
        mantener comunicación verbal con el paciente. El volumen inyectado nunca debe superar la dosis
        máxima ponderal, aunque el rango del bloqueo lo permita.
      </Callout>
      <Src>Neal JM, et al. ASRA LAST Advisory. Reg Anesth Pain Med 2018;43(2):113-123.</Src>

      {/* ========================================================= */}
      <Section n="01" title="Cómo usar esta referencia">
        <P>
          Cada bloqueo se resume con su <b>indicación</b>, el <b>plano/punto</b> diana bajo ecografía y
          el <b>volumen típico</b> de anestésico local (rangos aceptados de la práctica). Los volúmenes
          son orientativos: la <b>dosis total de AL (mg) manda sobre el volumen</b> y se limita por el
          peso del paciente (§12). Todos son <b>bloqueos ecoguiados</b> con visualización de la punta de
          la aguja y de la difusión del anestésico en tiempo real.
        </P>
        <Callout variant="info">
          Los <b>bloqueos de plano interfascial</b> (TAP, ESP, PECS, serrato, cuadrado lumbar) son de{" "}
          <b>volumen</b>: el anestésico se disemina por un plano, por lo que requieren volúmenes
          mayores y AL más diluido. Los <b>bloqueos perineurales</b> (interescalénico, supraclavicular,
          femoral, ciático) son de <b>concentración/proximidad</b>: menor volumen, depósito
          circunferencial cuidando no inyectar intraneural.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="02" title="Pared abdominal — TAP y cuadrado lumbar">
        <P>
          Bloqueos de plano para <b>analgesia de pared abdominal</b> (somática); no cubren dolor
          visceral. El <b>TAP</b> (transversus abdominis plane) deposita AL entre el oblicuo interno y
          el transverso del abdomen. El <b>cuadrado lumbar (QL)</b> deposita más posterior/profundo,
          con difusión hacia el espacio paravertebral y mayor alcance y duración.
        </P>
        <Table
          headers={["Bloqueo", "Indicación", "Plano / punto", "Volumen típico"]}
          accentCol={3}
          rows={[
            [
              "TAP",
              "Analgesia somática de pared abdominal (cesárea, laparotomía, herniorrafia, apendicectomía).",
              "Entre oblicuo interno y transverso del abdomen (plano TAP), abordaje subcostal o lateral.",
              "15–20 mL por lado",
            ],
            [
              "Cuadrado lumbar (QL)",
              "Analgesia de pared abdominal más extensa y duradera (cirugía abdominal alta/baja, cadera).",
              "Plano adyacente al m. cuadrado lumbar (QL1 lateral, QL2 posterior, QL3 transmuscular/anterior).",
              "15–20 mL por lado (rango 15–30)",
            ],
          ]}
        />
        <Src>Hadzic A (NYSORA), 2.ª ed., 2017 (TAP/QL). · Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed.</Src>
        <Callout variant="warn">
          En bloqueos <b>bilaterales</b> (p. ej. TAP tras cesárea) se suma el AL de ambos lados: es fácil
          rozar o superar la dosis máxima ponderal. Reducir la concentración para no exceder los mg/kg
          (ver §12). El plano abdominal es muy vascularizado → riesgo de absorción sistémica y LAST.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="03" title="Erector espinae (ESP)">
        <P>
          El <b>ESP</b> (erector spinae plane) deposita AL en el plano entre el músculo erector de la
          columna y la apófisis transversa, con difusión al espacio paravertebral y epidural adyacente.
          Cubre <b>dermatomas torácicos o abdominales</b> según el nivel de punción. Bloqueo versátil y
          con margen de seguridad favorable por la distancia a la pleura y a estructuras vasculares
          mayores.
        </P>
        <Table
          headers={["Bloqueo", "Indicación", "Plano / punto", "Volumen típico"]}
          accentCol={3}
          rows={[
            [
              "ESP torácico",
              "Analgesia torácica: toracotomía/VATS, fracturas costales, cirugía de mama.",
              "Entre m. erector espinae y apófisis transversa (nivel T4–T6 para tórax/mama).",
              "20–30 mL por lado",
            ],
            [
              "ESP abdominal",
              "Analgesia abdominal: cirugía abdominal alta, nefrectomía, herniorrafia.",
              "Mismo plano a nivel torácico bajo/lumbar (T7–T10 para abdomen).",
              "20–30 mL por lado",
            ],
          ]}
        />
        <Src>Forero M, et al. Reg Anesth Pain Med 2016;41(5):621-627. · Hadzic A (NYSORA), 2.ª ed.</Src>
      </Section>

      {/* ========================================================= */}
      <Section n="04" title="Pared torácica — PECS I/II y serrato anterior">
        <P>
          Bloqueos de plano para <b>cirugía de mama y pared torácica</b>. <b>PECS I</b> bloquea los
          nervios pectorales (medial y lateral) entre pectoral mayor y menor. <b>PECS II</b> añade un
          depósito más lateral (entre pectoral menor y serrato) que cubre ramas intercostobraquiales y
          torácico largo. El <b>bloqueo del serrato anterior</b> cubre la pared torácica lateral.
        </P>
        <Table
          headers={["Bloqueo", "Indicación", "Plano / punto", "Volumen típico"]}
          accentCol={3}
          rows={[
            [
              "PECS I",
              "Cirugía de mama, expansores/prótesis, port-a-cath.",
              "Plano entre pectoral mayor y pectoral menor (a nivel 3.ª costilla).",
              "10 mL",
            ],
            [
              "PECS II",
              "Mastectomía con axila, cirugía de mama más extensa.",
              "PECS I + depósito entre pectoral menor y serrato anterior.",
              "PECS I 10 mL + 20 mL lateral (10–20 mL por plano)",
            ],
            [
              "Serrato anterior",
              "Pared torácica lateral: toracotomía, fracturas costales, mama.",
              "Plano superficial o profundo al m. serrato anterior (4.ª–5.ª costilla, línea axilar media).",
              "20 mL (10–20 mL)",
            ],
          ]}
        />
        <Src>
          Blanco R. Anaesthesia 2011;66(9):847-848 (PECS I). · Blanco R, et al. Anaesthesia
          2013;68(11):1107-1113 (PECS II / serrato). · Hadzic A (NYSORA), 2.ª ed.
        </Src>
      </Section>

      {/* ========================================================= */}
      <Section n="05" title="Miembro superior — interescalénico">
        <P>
          El <b>bloqueo interescalénico</b> aborda el plexo braquial a nivel de los troncos, en el surco
          entre los escalenos anterior y medio. Es el bloqueo de elección para <b>cirugía de hombro</b>{" "}
          y tercio proximal del húmero. Cubre mal el territorio cubital (C8–T1).
        </P>
        <Table
          headers={["Bloqueo", "Indicación", "Plano / punto", "Volumen típico"]}
          accentCol={3}
          rows={[
            [
              "Interescalénico",
              "Cirugía de hombro y húmero proximal; analgesia del hombro.",
              "Plexo braquial (troncos) en el surco interescalénico, a nivel C5–C6.",
              "10–20 mL",
            ],
          ]}
        />
        <Src>Hadzic A (NYSORA), 2.ª ed., 2017. · Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed.</Src>
        <Callout variant="warn">
          <b>Nervio frénico.</b> El interescalénico produce <b>bloqueo del frénico ipsilateral casi
          constante</b> (parálisis hemidiafragmática, caída de ~25–30% de la función pulmonar).{" "}
          <b>Evitar o usar con extrema cautela</b> en pacientes con reserva respiratoria comprometida
          (EPOC grave, patología contralateral). Reducir el volumen y depositar más caudal/lateral
          disminuye —pero no elimina— la afectación frénica.
        </Callout>
        <Callout variant="info">
          Otros efectos por proximidad: síndrome de <b>Horner</b> (ganglio estrellado), bloqueo del{" "}
          <b>laríngeo recurrente</b> (ronquera) y riesgo de inyección vascular (arteria vertebral) o
          neuraxial. Aspirar y fraccionar; punta de aguja siempre visible.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="06" title="Miembro superior — supraclavicular, infraclavicular, axilar">
        <P>
          Abordajes del plexo braquial para <b>cirugía de brazo, antebrazo y mano</b>. El{" "}
          <b>supraclavicular</b> («espinal del brazo») bloquea a nivel de troncos/divisiones con inicio
          rápido y cobertura amplia. El <b>infraclavicular</b> aborda los fascículos (cordones)
          alrededor de la arteria axilar. El <b>axilar</b> bloquea los nervios terminales en la axila,
          el más superficial y alejado de la pleura.
        </P>
        <Table
          headers={["Bloqueo", "Indicación", "Plano / punto", "Volumen típico"]}
          accentCol={3}
          rows={[
            [
              "Supraclavicular",
              "Cirugía de brazo/antebrazo/mano (todo el miembro salvo hombro).",
              "Troncos/divisiones lateral a la arteria subclavia, sobre la 1.ª costilla; «corner pocket».",
              "20 mL (15–25 mL)",
            ],
            [
              "Infraclavicular",
              "Cirugía de codo, antebrazo y mano; catéter continuo cómodo.",
              "Cordones alrededor de la arteria axilar, bajo la clavícula (proceso coracoides).",
              "20 mL (20–30 mL)",
            ],
            [
              "Axilar",
              "Cirugía de antebrazo y mano; abordaje más seguro respecto a pleura.",
              "Nervios mediano, cubital, radial + musculocutáneo (separado) en torno a la arteria axilar.",
              "20 mL (20–30 mL, repartido por nervio)",
            ],
          ]}
        />
        <Src>Hadzic A (NYSORA), 2.ª ed., 2017. · Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed.</Src>
        <Callout variant="warn">
          El <b>supraclavicular</b> tiene la pleura muy cerca → riesgo de <b>neumotórax</b>: mantener la
          punta visible y lateral a la subclavia. El <b>musculocutáneo</b> suele haber abandonado la
          vaina en el abordaje axilar: bloquearlo aparte (en el coracobraquial) para cubrir el antebrazo
          lateral.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="07" title="Miembro inferior — femoral y canal aductor">
        <P>
          Bloqueos para <b>cirugía de rodilla y muslo anterior</b>. El <b>femoral</b> cubre muslo
          anterior y rodilla (nervio femoral, lateral a la arteria femoral bajo el ligamento inguinal),
          pero produce <b>debilidad del cuádriceps</b>. El <b>canal aductor (safeno)</b> es
          predominantemente <b>sensitivo</b>, preserva mejor la fuerza del cuádriceps y favorece la
          deambulación precoz tras artroplastia de rodilla.
        </P>
        <Table
          headers={["Bloqueo", "Indicación", "Plano / punto", "Volumen típico"]}
          accentCol={3}
          rows={[
            [
              "Femoral",
              "Cirugía de rodilla, fémur y muslo anterior; fractura de cadera (analgesia).",
              "Nervio femoral lateral a la arteria femoral, bajo el ligamento inguinal.",
              "15–20 mL",
            ],
            [
              "Canal aductor (safeno)",
              "Analgesia de rodilla con preservación motora (ATR, artroscopia).",
              "Nervio safeno en el canal aductor (subsartorio), tercio medio del muslo, junto a la a. femoral.",
              "15–20 mL",
            ],
          ]}
        />
        <Src>Hadzic A (NYSORA), 2.ª ed., 2017. · Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed.</Src>
        <Callout variant="info">
          Para la rodilla suele combinarse el canal aductor con un <b>IPACK</b> (infiltración del plano
          entre poplítea y cápsula posterior) para cubrir el dolor posterior sin debilidad. La debilidad
          del cuádriceps del femoral aumenta el <b>riesgo de caídas</b>: prevenir en la deambulación.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="08" title="Miembro inferior — ciático (poplíteo)">
        <P>
          El <b>bloqueo ciático a nivel poplíteo</b> cubre <b>pie y tobillo</b> (todo salvo el territorio
          safeno medial). Se aborda el nervio ciático en la fosa poplítea, proximal a su bifurcación en
          tibial y peroneo común, buscando la difusión circunferencial dentro de la vaina paraneural.
        </P>
        <Table
          headers={["Bloqueo", "Indicación", "Plano / punto", "Volumen típico"]}
          accentCol={3}
          rows={[
            [
              "Ciático poplíteo",
              "Cirugía de pie y tobillo; analgesia del pie.",
              "Nervio ciático en la fosa poplítea, proximal a la bifurcación tibial/peroneo común.",
              "20–30 mL",
            ],
          ]}
        />
        <Src>Hadzic A (NYSORA), 2.ª ed., 2017. · Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed.</Src>
        <Callout variant="info">
          Para cubrir todo el pie/tobillo, <b>añadir el bloqueo del safeno</b> (canal aductor) que aporta
          la cara medial de la pierna y tobillo. Inyectar en el plano <b>paraneural</b> (no intraneural):
          la difusión circunferencial acelera el inicio y prolonga el bloqueo.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="09" title="Paravertebral">
        <P>
          El <b>bloqueo paravertebral (PVB)</b> deposita AL en el espacio paravertebral torácico, junto
          a los nervios espinales al emerger del foramen, produciendo bloqueo <b>sensitivo, motor y
          simpático unilateral segmentario</b>. Alternativa a la epidural torácica para toracotomía y
          cirugía de mama, con perfil hemodinámico más estable (bloqueo simpático unilateral).
        </P>
        <Table
          headers={["Bloqueo", "Indicación", "Plano / punto", "Volumen típico"]}
          accentCol={3}
          rows={[
            [
              "Paravertebral torácico",
              "Toracotomía, cirugía de mama, fracturas costales unilaterales, analgesia unilateral de tórax/abdomen.",
              "Espacio paravertebral (limitado por lig. costotransverso superior, pleura y cuerpo vertebral).",
              "15–20 mL en inyección única · 3–5 mL por nivel si multinivel",
            ],
          ]}
        />
        <Src>Hadzic A (NYSORA), 2.ª ed., 2017. · Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed.</Src>
        <Callout variant="warn">
          Riesgos por proximidad: <b>neumotórax</b> (pleura inmediatamente profunda), <b>punción
          vascular</b> y <b>diseminación epidural/neuraxial</b> con hipotensión y bloqueo bilateral.
          Ecoguía y control de la punta reducen —no anulan— estos riesgos. Absorción sistémica
          relevante: respetar la dosis máxima ponderal.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="10" title="Resumen — plano y volumen por bloqueo">
        <Table
          headers={["Bloqueo", "Territorio / uso", "Volumen típico"]}
          accentCol={2}
          rows={[
            ["TAP", "Pared abdominal (somático)", "15–20 mL por lado"],
            ["Cuadrado lumbar (QL)", "Pared abdominal extensa / cadera", "15–20 mL por lado"],
            ["Erector espinae (ESP)", "Tórax o abdomen según nivel", "20–30 mL por lado"],
            ["PECS I", "Mama / pectorales", "10 mL"],
            ["PECS II", "Mama con axila", "10–20 mL por plano"],
            ["Serrato anterior", "Pared torácica lateral", "10–20 mL"],
            ["Interescalénico", "Hombro (ojo n. frénico)", "10–20 mL"],
            ["Supraclavicular", "Brazo / antebrazo / mano", "15–25 mL"],
            ["Infraclavicular", "Codo / antebrazo / mano", "20–30 mL"],
            ["Axilar", "Antebrazo / mano", "20–30 mL"],
            ["Femoral", "Rodilla / muslo anterior", "15–20 mL"],
            ["Canal aductor (safeno)", "Rodilla (preserva motor)", "15–20 mL"],
            ["Ciático poplíteo", "Pie / tobillo", "20–30 mL"],
            ["Paravertebral torácico", "Tórax/abdomen unilateral", "15–20 mL (single-shot)"],
          ]}
        />
        <Callout variant="info">
          Los volúmenes son <b>orientativos</b> (rangos de práctica ASRA/NYSORA/Miller). El límite real
          lo impone la <b>dosis total de AL en mg/kg</b> (§12), sobre todo en bloqueos bilaterales o
          múltiples en la misma sesión.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="11" title="Seguridad — checklist antes de inyectar">
        <P>
          El estándar de seguridad ASRA para prevenir la toxicidad sistémica por anestésico local
          (LAST) y la lesión neurológica se resume en unos pocos hábitos innegociables, en <b>todo</b>{" "}
          bloqueo.
        </P>
        <Table
          headers={["Paso", "Acción"]}
          rows={[
            ["1 · Dosis máxima", "Calcular la dosis máxima de AL por peso ANTES de cargar (ver §12); no superarla aunque el rango del bloqueo lo permita."],
            ["2 · Monitorización", "ECG, SpO₂ y PA continuos; acceso venoso; paciente comunicativo (sedación ligera si procede)."],
            ["3 · Aspirar", "Aspiración antes de cada alícuota para detectar inyección intravascular."],
            ["4 · Dosis test / fraccionar", "Inyectar en alícuotas de 3–5 mL con pausa; vigilar signos de LAST y difusión ecográfica correcta."],
            ["5 · Ecoguía real", "Mantener la PUNTA de la aguja visible; sin punta en pantalla, no inyectar. Presión de inyección baja (evitar intraneural/intrafascicular)."],
            ["6 · Kit de rescate", "Emulsión lipídica al 20% + material de vía aérea/reanimación disponibles en la sala antes de empezar."],
          ]}
        />
        <Src>Neal JM, et al. ASRA LAST Advisory. Reg Anesth Pain Med 2018;43(2):113-123. · Hadzic A (NYSORA), 2.ª ed.</Src>
        <Callout variant="danger">
          <b>Dolor o parestesia intensa a la inyección, o resistencia alta</b> = posible inyección{" "}
          <b>intraneural</b>: detener de inmediato y recolocar. Nunca forzar contra alta presión.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="12" title="Dosis máxima de anestésico local por peso">
        <P>
          Las dosis máximas son <b>orientativas y multifactoriales</b>: dependen del sitio de inyección
          (vascularización), el uso de <b>epinefrina</b>, la edad y la comorbilidad hepática/cardíaca.
          Usar el <b>peso corporal magro/ideal</b> en el obeso y aplicar márgenes conservadores en el
          anciano y el hepatópata. En bloqueos <b>bilaterales o múltiples</b> se suma todo el AL
          administrado.
        </P>
        <Table
          headers={["Anestésico local", "Dosis máxima", "Nota"]}
          accentCol={1}
          rows={[
            ["Ropivacaína", "~3 mg/kg", "Menos cardiotóxica que bupivacaína; larga duración."],
            ["Bupivacaína / levobupivacaína", "~2 mg/kg", "La más cardiotóxica: el paro por bupivacaína es refractario — extremar la vigilancia."],
            ["Lidocaína — sin epinefrina", "4.5 mg/kg", "Inicio rápido, duración corta."],
            ["Lidocaína — con epinefrina", "7 mg/kg", "La epinefrina reduce absorción y prolonga; ojo en zonas de circulación terminal."],
          ]}
        />
        <Src>
          Rosenberg PH, et al. Maximum recommended doses of local anesthetics. Reg Anesth Pain Med
          2004;29(6):564-575. · Neal JM, et al. ASRA LAST 2018. · Gropper MA, et al. Miller&apos;s
          Anesthesia, 9.ª ed.
        </Src>
        <Callout variant="warn">
          <b>La bupivacaína es la más peligrosa.</b> Su cardiotoxicidad es de inicio brusco y el paro
          resultante es <b>resistente a la reanimación convencional</b>. Preferir ropivacaína o
          levobupivacaína cuando se manejan volúmenes altos, y respetar estrictamente los mg/kg.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="13" title="LAST — toxicidad sistémica por anestésico local">
        <P>
          La <b>LAST</b> (Local Anesthetic Systemic Toxicity) es la complicación temida de todo bloqueo.
          Los pródromos neurológicos (acúfenos, sabor metálico, parestesia peribucal, mareo, agitación,
          convulsiones) pueden faltar o pasar directamente a <b>colapso cardiovascular</b> (arritmias,
          bradicardia, asistolia). El pilar del tratamiento, junto al soporte vital, es la{" "}
          <b>emulsión lipídica al 20%</b>.
        </P>
        <Table
          headers={["Paso", "Acción (ASRA)"]}
          rows={[
            ["1 · Parar y pedir ayuda", "Detener la inyección; pedir ayuda y el kit de emulsión lipídica."],
            ["2 · Vía aérea / O₂", "O₂ 100%, ventilar; evitar hipoxia, hipercapnia y acidosis (potencian la toxicidad)."],
            ["3 · Controlar convulsiones", "Benzodiacepina (midazolam); evitar dosis altas de propofol si hay inestabilidad CV."],
            ["4 · Emulsión lipídica 20%", "Bolo 1.5 mL/kg (peso magro) en ~2–3 min, luego infusión 0.25 mL/kg/min. Repetir el bolo 1–2 veces si persiste el colapso y ↑ la infusión a 0.5 mL/kg/min."],
            ["5 · Soporte CV / RCP", "RCP si paro; adrenalina en dosis REDUCIDAS (≤ 1 mcg/kg); evitar vasopresina, bloqueadores de canales de Ca/β y anestésicos locales."],
            ["6 · Tras estabilizar", "Monitorización prolongada (≥ 4–6 h; más si hubo inestabilidad CV); considerar bypass cardiopulmonar si refractario."],
          ]}
        />
        <Src>Neal JM, et al. ASRA LAST Checklist / Advisory. Reg Anesth Pain Med 2018;43(2):113-123.</Src>
        <Callout variant="danger">
          <b>Emulsión lipídica: bolo 1.5 mL/kg + infusión 0.25 mL/kg/min.</b> Límite superior sugerido
          ~12 mL/kg. En el paro por LAST, la adrenalina se usa en <b>dosis bajas</b> (≤ 1 mcg/kg) y se{" "}
          <b>evita</b> vasopresina; la RCP puede requerir ser prolongada. Tener el kit y su dosis
          calculada por peso <b>antes</b> de cada bloqueo.
        </Callout>
      </Section>

      {/* ========================================================= */}
      <Section n="14" title="Referencias">
        <ol
          className="mono"
          style={{ color: "var(--text-2)", fontSize: "0.66rem", lineHeight: 1.85, paddingLeft: "1.4rem", margin: 0 }}
        >
          <li>Neal JM, Barrington MJ, Fettiplace MR, et al. The Third American Society of Regional Anesthesia and Pain Medicine Practice Advisory on Local Anesthetic Systemic Toxicity (LAST). Reg Anesth Pain Med 2018;43(2):113-123.</li>
          <li>Hadzic A (ed.). Hadzic&apos;s Textbook of Regional Anesthesia and Acute Pain Management (NYSORA), 2.ª ed. New York: McGraw-Hill; 2017.</li>
          <li>Gropper MA, Cohen NH, Eriksson LI, et al. Miller&apos;s Anesthesia, 9.ª ed. Philadelphia: Elsevier; 2020 — Peripheral Nerve Blocks / Ultrasound-Guided Regional Anesthesia.</li>
          <li>Rosenberg PH, Veering BT, Urmey WF. Maximum recommended doses of local anesthetics: a multifactorial concept. Reg Anesth Pain Med 2004;29(6):564-575.</li>
          <li>Forero M, Adhikary SD, Lopez H, et al. The Erector Spinae Plane Block: A Novel Analgesic Technique in Thoracic Neuropathic Pain. Reg Anesth Pain Med 2016;41(5):621-627.</li>
          <li>Blanco R. The &apos;pecs block&apos;: a novel technique for providing analgesia after breast surgery. Anaesthesia 2011;66(9):847-848.</li>
          <li>Blanco R, Fajardo M, Parras Maldonado T. Ultrasound description of Pecs II (modified Pecs I): a novel approach to breast surgery. Anaesthesia 2013;68(11):1107-1113.</li>
        </ol>
      </Section>

      {/* Disclaimer con humor negro seco */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.75, opacity: 0.7 }}
        >
          {"// volúmenes y dosis de literatura aceptada (ASRA · NYSORA · Miller · Stoelting)"}
          <br />
          {"// referencia educativa — no sustituye juicio clínico, ecoguía en tiempo real ni protocolo institucional"}
          <br />
          {"// el volumen del rango NO manda: manda la dosis en mg/kg — calcúlala antes de cargar la jeringa"}
          <br />
          {"// lípidos al 20% en la sala ANTES del bloqueo: el mejor momento para tenerlos no es cuando ya convulsiona"}
        </p>
        <Link href="/guias" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más guías
        </Link>
      </footer>
    </div>
  );
}
