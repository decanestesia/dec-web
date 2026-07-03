import type { Metadata } from "next";
import Link from "next/link";

// ============================================================
// Guía de referencia — Transfusión y hemoderivados
// Server Component (referencia estática, sin estado).
// EXACTITUD CLÍNICA: umbrales, volúmenes y ratios tomados de
// literatura aceptada (AABB, ASA, Miller, Stoelting, hemovigilancia).
// Cada dato lleva referencia. No inventar cifras.
// ============================================================

export const metadata: Metadata = {
  title: "Transfusión y hemoderivados — Guía clínica — DEC",
  description:
    "Referencia perioperatoria de transfusión: umbrales, volúmenes, velocidad, compatibilidad ABO/Rh, transfusión masiva 1:1:1, citrato/hipocalcemia y reacciones (TRALI, TACO, hemolítica, febril). AABB, ASA.",
  openGraph: {
    title: "Transfusión y hemoderivados — Guía clínica — DEC",
    description:
      "Umbrales, volúmenes, velocidad y compatibilidad de hemoderivados. Protocolo de transfusión masiva y reacciones transfusionales.",
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

type CalloutVariant = "info" | "warn" | "danger";

// ------------------------------------------------------------
// Colores de callout (mismo mapa que blog/[slug])
// ------------------------------------------------------------
const CALLOUT: Record<CalloutVariant, { border: string; icon: string }> = {
  info: { border: "var(--cyan)", icon: "ℹ" },
  warn: { border: "var(--amber)", icon: "⚠" },
  danger: { border: "var(--red)", icon: "⛔" },
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
      <table
        style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}
      >
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
        <div
          style={{
            color: "var(--text-1)",
            fontSize: "0.8rem",
            lineHeight: 1.65,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// Ficha de producto: panel con nombre + parámetros clave en info-grid
function ProductCard({
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
export default function TransfusionPage() {
  return (
    <div
      className="wrap"
      style={{ paddingTop: "1.75rem", paddingBottom: "3rem", maxWidth: 860 }}
    >
      {/* Migas */}
      <Link
        href="/farmacos"
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.7rem",
          textDecoration: "none",
        }}
      >
        ← /farmacos
      </Link>

      {/* Header estándar */}
      <div style={{ margin: "1rem 0 1.5rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./transfusion.sh
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2 }}>
          Transfusión y hemoderivados
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
          umbrales · volúmenes · velocidad · compatibilidad · transfusión masiva
          · reacciones
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {
              "// la sangre no es un fluido de reanimación: es un trasplante líquido"
            }
          </span>
        </p>
      </div>

      {/* Aviso de encuadre */}
      <Callout variant="info">
        Umbrales de guía para paciente <b>hemodinámicamente estable</b>. La
        transfusión es una decisión clínica, no un número de laboratorio: valora
        síntomas, velocidad del sangrado, reserva cardiopulmonar y contexto.
        Estrategia <b>restrictiva</b> (Hb 7–8 g/dL) no inferior a la liberal en
        la mayoría de pacientes hospitalizados y críticos.{" "}
        <span className="mono" style={{ fontSize: "0.68rem" }}>
          Carson JL, et al. JAMA 2016; AABB 2023.
        </span>
      </Callout>

      {/* ==================== UMBRALES ==================== */}
      <SectionHeader
        label="1 · Umbrales de transfusión (paciente estable)"
        note="// no transfundir por un número si el paciente no lo pide; no esperar al colapso si lo hace"
      />

      <DataTable
        table={{
          headers: ["Producto", "Umbral", "Contexto"],
          rows: [
            [
              "PRBC",
              "Hb < 7 g/dL",
              "General / crítico estable / hemorragia GI alta estable. Estrategia restrictiva.",
            ],
            [
              "PRBC",
              "Hb < 8 g/dL",
              "Cardiopatía preexistente, cirugía cardíaca/ortopédica, síntomas de anemia.",
            ],
            [
              "PRBC",
              "Hb 7–9 g/dL",
              "Zona de juicio clínico: transfundir según síntomas, sangrado activo, isquemia.",
            ],
            [
              "Plaquetas",
              "< 10 ×10⁹/L",
              "Profilaxis en paciente estable no sangrante (p. ej. hipoproliferativo/quimio).",
            ],
            [
              "Plaquetas",
              "< 20 ×10⁹/L",
              "Procedimiento menor / catéter central; sepsis con factores de riesgo de sangrado.",
            ],
            [
              "Plaquetas",
              "< 50 ×10⁹/L",
              "Sangrado activo, cirugía mayor, punción lumbar, neuroeje.",
            ],
            [
              "Plaquetas",
              "< 100 ×10⁹/L",
              "Neurocirugía / SNC, cirugía oftálmica del segmento posterior.",
            ],
            [
              "PFC (FFP)",
              "INR > 1.5–2.0",
              "Con sangrado o previo a procedimiento invasivo. No corregir INR ≤ 1.5.",
            ],
            [
              "Crioprecipitado",
              "Fibrinógeno < 1.5 g/L",
              "Con sangrado. En obstetricia y trauma umbral < 2.0 g/L.",
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
        Ref: AABB Clinical Practice Guidelines (Carson JL, et al. JAMA 2023;330:1892) ·
        ASA Practice Guidelines for Perioperative Blood Management, Anesthesiology
        2015;122:241 · Kaufman RM, et al. Ann Intern Med 2015 (plaquetas).
      </p>

      <Callout variant="warn">
        Los umbrales <b>no aplican</b> a hemorragia masiva/activa: ahí se
        transfunde por ratio y por clínica, no por cifras de laboratorio que
        siempre van por detrás del sangrado real.
      </Callout>

      {/* ==================== FICHAS POR PRODUCTO ==================== */}
      <SectionHeader
        label="2 · Fichas por hemoderivado"
        note="// volúmenes y rendimientos aproximados de unidad estándar de adulto; verifica con tu banco de sangre"
      />

      <ProductCard
        code="PRBC"
        name="Concentrado de hematíes"
        subtitle="Red blood cells / packed RBC · aumenta capacidad de transporte de O₂"
        rows={[
          ["Volumen / unidad", "≈ 250–350 mL (Hct ≈ 55–65%)"],
          ["Rinde", "≈ +1 g/dL Hb  ·  ≈ +3% Hct por unidad (adulto ~70 kg)"],
          ["Dosis pediátrica", "10–15 mL/kg → sube Hb ≈ 2–3 g/dL"],
          ["Velocidad", "Iniciar lento 15 min (≈ 2 mL/min); luego 2–4 mL/min"],
          ["Tiempo máx.", "Completar en < 4 h desde salida del banco"],
          ["Compatibilidad", "ABO + Rh; requiere pruebas cruzadas"],
          ["Fluido compatible", "Solo SSN 0.9% por la misma vía"],
          ["Filtro", "Estándar 170–260 µm obligatorio"],
        ]}
      />

      <ProductCard
        code="FFP"
        name="Plasma fresco congelado"
        subtitle="Fresh frozen plasma · aporta todos los factores de coagulación"
        rows={[
          ["Volumen / unidad", "≈ 200–250 mL"],
          ["Dosis", "10–15 mL/kg (≈ 3–4 U en adulto); reversión warfarina 5–8 mL/kg"],
          ["Rinde", "≈ +20–30% de factores tras dosis plena"],
          ["Velocidad", "≈ 200–300 mL/h; ajustar por volemia (riesgo TACO)"],
          ["Tiempo máx.", "Completar en < 4 h; usar en < 24 h de descongelado (2–6 °C)"],
          ["Compatibilidad", "ABO compatible (inverso a hematíes); Rh no requerido"],
          ["Fluido compatible", "Solo SSN 0.9%"],
        ]}
      />

      <ProductCard
        code="PLT"
        name="Plaquetas"
        subtitle="Aféresis o pool de buffy coat · hemostasia primaria"
        rows={[
          ["Volumen", "Aféresis ≈ 200–300 mL  ·  pool (5 U) ≈ 250–350 mL"],
          ["Rinde", "1 aféresis ó pool ≈ +30–50 ×10⁹/L (adulto)"],
          ["Dosis pediátrica", "5–10 mL/kg → sube ≈ +50 ×10⁹/L"],
          ["Velocidad", "≈ 150–300 mL/h; unidad en 30–60 min"],
          ["Tiempo máx.", "Completar en < 4 h"],
          ["Compatibilidad", "ABO preferente; Rh: dar Rh-neg a ♀ RhD-neg fértil"],
          ["Conservación", "20–24 °C en agitación — NO refrigerar"],
        ]}
      />

      <ProductCard
        code="CRYO"
        name="Crioprecipitado"
        subtitle="Concentrado de fibrinógeno, FVIII, FvW, FXIII, fibronectina"
        rows={[
          ["Volumen / unidad", "≈ 10–20 mL por unidad"],
          ["Contenido", "≈ 150–250 mg fibrinógeno + FVIII/FvW/FXIII por unidad"],
          ["Dosis típica", "1 U / 5–10 kg (pool de 10 U sube fibrinógeno ≈ 0.5–1 g/L)"],
          ["Indicación", "Hipofibrinogenemia < 1.5–2.0 g/L con sangrado"],
          ["Velocidad", "Rápida, según tolerancia; usar pronto tras descongelar"],
          ["Compatibilidad", "ABO preferente (bajo volumen plasmático); Rh no requerido"],
        ]}
      />

      <ProductCard
        code="WB"
        name="Sangre total"
        subtitle="Whole blood · leuco-reducida frío-almacenada (trauma / militar)"
        rows={[
          ["Volumen / unidad", "≈ 450–500 mL"],
          ["Uso", "Reanimación de hemorragia masiva (resurgimiento en trauma)"],
          ["Rinde", "Aporta hematíes + plasma + plaquetas en un solo producto"],
          ["Compatibilidad", "Grupo específico; O bajo-título como universal de emergencia"],
          ["Fluido compatible", "Solo SSN 0.9%"],
        ]}
      />

      <ProductCard
        code="FBG / PCC"
        name="Concentrados de factores"
        subtitle="Fibrinógeno concentrado · CCP (factores II, VII, IX, X)"
        rows={[
          ["Fibrinógeno conc.", "Dosis 25–50 mg/kg; alternativa a crio, dosis precisa"],
          ["PCC (4 factores)", "25–50 UI/kg según INR; reversión rápida de warfarina/AVK"],
          ["Ventaja", "Bajo volumen, sin descongelado, sin ajuste ABO"],
          ["Riesgo", "Trombótico (PCC); no reponen todos los factores del FFP"],
          ["Compatibilidad", "No requiere pruebas cruzadas ni ABO"],
        ]}
      />

      <p
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.58rem",
          margin: "0 0 1rem",
          opacity: 0.7,
        }}
      >
        Ref: Miller&apos;s Anesthesia 9.ª ed., cap. Blood Therapy ·
        Stoelting&apos;s Pharmacology &amp; Physiology in Anesthetic Practice ·
        AABB Technical Manual 20.ª ed. · Circular of Information (AABB/ARC/ABC).
      </p>

      {/* ==================== ADMINISTRACIÓN / COMPATIBILIDAD ==================== */}
      <SectionHeader
        label="3 · Administración, fluidos y fármacos"
        note="// una sola regla que casi nunca falla: por esa vía va la sangre y solo la sangre"
      />

      <Callout variant="danger">
        Clásicamente <b>solo SSN 0.9%</b> puede co-administrarse por la misma vía
        que los hemoderivados. <b>NO</b> soluciones con calcio (Lactato de Ringer,
        Plasma-Lyte con Ca²⁺): riesgo teórico de que el Ca²⁺ neutralice el citrato
        anticoagulante y forme coágulos en la línea. <b>NO</b> soluciones
        hipotónicas (D5W, agua): hemólisis osmótica. <b>NO</b> fármacos por la
        misma vía.
      </Callout>

      <DataTable
        table={{
          headers: ["Ítem", "Regla", "Motivo"],
          rows: [
            [
              "SSN 0.9%",
              "Compatible",
              "Isotónico, sin calcio; único fluido validado para diluir/purgar.",
            ],
            [
              "Ringer lactato",
              "Evitar por misma vía",
              "Ca²⁺ + citrato → riesgo teórico de coágulo (evidencia in vitro discutida, práctica conservadora).",
            ],
            [
              "D5W / hipotónicos",
              "Contraindicado",
              "Hemólisis osmótica de los hematíes.",
            ],
            [
              "Fármacos IV",
              "Nunca por la línea",
              "Incompatibilidades y dificultad para atribuir reacciones.",
            ],
            [
              "Filtro",
              "Obligatorio 170–260 µm",
              "Retiene microagregados y detritos.",
            ],
            [
              "Calentador",
              "Si flujo rápido / masiva / neonato",
              "Evita hipotermia; NUNCA calentar > 42 °C (hemólisis). Solo dispositivos aprobados.",
            ],
          ],
        }}
      />

      <Callout variant="info">
        <b>Calentamiento:</b> indicado en transfusión rápida (&gt; 50 mL/kg/h en
        adulto), transfusión masiva, exanguinotransfusión neonatal y pacientes
        con crioaglutininas. Usar calentadores de sangre aprobados; jamás
        microondas, baño de agua caliente ni radiador.
      </Callout>

      {/* ==================== COMPATIBILIDAD ABO/Rh ==================== */}
      <SectionHeader
        label="4 · Compatibilidad ABO / Rh"
        note="// el hematíe lleva antígeno; el plasma lleva anticuerpo — las reglas se invierten entre PRBC y FFP"
      />

      <DataTable
        table={{
          headers: ["Grupo receptor", "PRBC compatible", "FFP compatible"],
          rows: [
            ["O", "O", "O, A, B, AB"],
            ["A", "A, O", "A, AB"],
            ["B", "B, O", "B, AB"],
            ["AB", "AB, A, B, O", "AB"],
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
        Donante universal de hematíes: <b>O negativo</b> (emergencia / ♀ fértil) ·
        Donante universal de plasma: <b>AB</b> · Receptor universal: <b>AB Rh+</b>.
      </p>

      <Callout variant="warn">
        <b>Rh (D):</b> a mujeres RhD-negativas en edad fértil dar hematíes y
        plaquetas RhD-negativos siempre que sea posible (riesgo de
        aloinmunización y enfermedad hemolítica del recién nacido). En emergencia
        vital sin tipar: <b>O negativo</b> para hematíes.
      </Callout>

      {/* ==================== TRANSFUSIÓN MASIVA ==================== */}
      <SectionHeader
        label="5 · Protocolo de transfusión masiva (PTM)"
        note="// activa temprano; el retraso mata más que el ratio imperfecto"
      />

      <Callout variant="info">
        <b>Definición:</b> ≥ 10 U de PRBC en 24 h, ó ≥ 4 U en 1 h con sangrado
        continuo, ó reposición de &gt; 1 volemia en 24 h. Activar el PTM por
        clínica (score ABC, hemorragia no controlada), sin esperar el
        laboratorio.
      </Callout>

      <DataTable
        table={{
          headers: ["Parámetro", "Objetivo / valor"],
          rows: [
            ["Ratio empírico", "PRBC : FFP : Plaquetas ≈ 1 : 1 : 1"],
            [
              "Base",
              "PROPPR (Holcomb JA, et al. JAMA 2015): 1:1:1 vs 1:1:2 — más hemostasia a las 24 h con 1:1:1",
            ],
            ["Ácido tranexámico", "1 g IV en 10 min + 1 g en 8 h (CRASH-2 / MATTERs; < 3 h del trauma)"],
            ["Fibrinógeno objetivo", "> 1.5–2.0 g/L (crio o fibrinógeno concentrado)"],
            ["Calcio iónico", "> 1.0–1.1 mmol/L (reponer por citrato)"],
            ["Plaquetas objetivo", "> 50 ×10⁹/L (> 100 si SNC/oftálmico)"],
            ["pH / temperatura", "Corregir acidosis; mantener T > 35 °C"],
            ["Guía por punto de cuidado", "TEG / ROTEM para dirigir reposición cuando esté disponible"],
          ],
        }}
      />

      <Callout variant="danger">
        <b>Tríada letal:</b> hipotermia + acidosis + coagulopatía se
        retroalimentan. Prevenir con calentamiento activo, control de la
        hemorragia y reposición dirigida. El citrato de los productos agrava la
        hipocalcemia con cada unidad.
      </Callout>

      {/* ==================== CITRATO / HIPOCALCEMIA ==================== */}
      <SectionHeader
        label="6 · Citrato e hipocalcemia"
        note="// el citrato mantiene la bolsa líquida y, de paso, secuestra el calcio del paciente"
      />

      <DataTable
        table={{
          headers: ["Aspecto", "Detalle"],
          rows: [
            [
              "Mecanismo",
              "El citrato de la bolsa quela Ca²⁺ (y Mg²⁺) ionizado → hipocalcemia por dilución/quelación.",
            ],
            [
              "Riesgo alto",
              "Transfusión rápida/masiva, hepatopatía (metabolismo lento del citrato), neonato, plasmaféresis.",
            ],
            [
              "Clínica",
              "Parestesias, temblor, ↓ contractilidad, hipotensión, QT prolongado, arritmia.",
            ],
            [
              "Monitorizar",
              "Calcio iónico (no calcio total); vigilar ECG en masiva.",
            ],
            [
              "Tratar",
              "Cloruro cálcico o gluconato cálcico IV guiado por Ca²⁺ iónico (objetivo > 1.0–1.1 mmol/L).",
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
        Ref: Miller&apos;s Anesthesia — Metabolic complications of transfusion ·
        Sihler KC, Napolitano LM. Chest 2010 (complications of massive
        transfusion).
      </p>

      {/* ==================== REACCIONES ==================== */}
      <SectionHeader
        label="7 · Reacciones transfusionales"
        note="// ante cualquier reacción: DETENER, mantener vía con SSN, verificar identidad y notificar al banco"
      />

      <DataTable
        table={{
          headers: ["Reacción", "Rasgos clave", "Manejo inicial"],
          rows: [
            [
              "Hemolítica aguda",
              "Incompatibilidad ABO (error de identificación). Fiebre, dolor lumbar/IV, hipotensión, hemoglobinuria, CID.",
              "Detener YA. SSN, soporte hemodinámico, diuresis, avisar banco; puede ser fatal.",
            ],
            [
              "TRALI",
              "Distrés / edema pulmonar no cardiogénico < 6 h; hipoxemia, infiltrados bilaterales, PCWP normal.",
              "Detener. Soporte respiratorio (ventilación protectora). No diuréticos de rutina.",
            ],
            [
              "TACO",
              "Sobrecarga circulatoria: HTA, edema pulmonar cardiogénico, ↑ BNP, respuesta a diuréticos.",
              "Detener/ralentizar. Diuréticos, O₂, sentar al paciente. Prevenir con ritmo lento.",
            ],
            [
              "Febril no hemolítica",
              "↑ ≥ 1 °C, escalofríos, sin hemólisis (citocinas / anti-leucocitarios).",
              "Detener y descartar hemolítica/séptica; antipiréticos. Leucorreducción previene.",
            ],
            [
              "Alérgica / anafilaxia",
              "Urticaria (leve) → broncoespasmo/hipotensión (grave, déficit de IgA).",
              "Leve: antihistamínico y reanudar lento. Grave: detener, adrenalina, soporte.",
            ],
            [
              "Contaminación bacteriana",
              "Fiebre alta, rigidez, shock séptico (más en plaquetas a T ambiente).",
              "Detener, cultivos de bolsa y paciente, antibióticos, soporte.",
            ],
          ],
        }}
      />

      <Callout variant="warn">
        <b>Regla general ante reacción:</b> detener la transfusión, mantener la
        vía con SSN 0.9%, reevaluar constantes, verificar identidad
        paciente–unidad y notificar al banco de sangre / hemovigilancia. Diferenciar
        TRALI (edema no cardiogénico, no diuréticos) de TACO (sobrecarga,
        responde a diuréticos) es crítico.
      </Callout>

      <p
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.58rem",
          margin: "0 0 1.5rem",
          opacity: 0.7,
        }}
      >
        Ref: AABB Technical Manual 20.ª ed. · Sistemas nacionales de
        hemovigilancia (SHOT, UK; Hemovigilancia FDA) · ASA Practice Guidelines
        for Perioperative Blood Management, Anesthesiology 2015;122:241.
      </p>

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
        <li>Carson JL, et al. Red Blood Cell Transfusion: 2023 AABB International Guidelines. JAMA 2023;330(19):1892.</li>
        <li>Carson JL, et al. Clinical trials evaluating red blood cell transfusion thresholds. JAMA 2016;316:2025.</li>
        <li>Kaufman RM, et al. Platelet transfusion: AABB clinical practice guideline. Ann Intern Med 2015;162:205.</li>
        <li>ASA Task Force. Practice Guidelines for Perioperative Blood Management. Anesthesiology 2015;122:241.</li>
        <li>Holcomb JB, et al. (PROPPR). 1:1:1 vs 1:1:2 transfusion ratios in trauma. JAMA 2015;313:471.</li>
        <li>CRASH-2 Collaborators. Tranexamic acid in trauma. Lancet 2010;376:23.</li>
        <li>Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. — Blood Therapy &amp; Transfusion.</li>
        <li>AABB Technical Manual, 20.ª ed. · Circular of Information for Blood Components.</li>
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
          {"// umbrales y volúmenes de literatura aceptada (AABB · ASA · Miller)"}
          <br />
          {"// no sustituye juicio clínico, protocolo institucional ni monitorización"}
          <br />
          {"// verifica siempre identidad paciente-unidad: el error de identificación es el que mata"}
        </p>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <Link href="/farmacos" className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}>
            ← catálogo de fármacos
          </Link>
        </div>
      </footer>
    </div>
  );
}
