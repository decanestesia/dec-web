"use client";

// ============================================================
// QTc y riesgo de torsades — corrección del intervalo QT
//
// RR (s) = 60 / FC  (o intervalo RR medido directamente)
//   Bazett:      QTc = QT / √RR
//   Fridericia:  QTc = QT / RR^(1/3)
//   Framingham:  QTc = QT + 154 × (1 − RR)
//   (QT y QTc en ms; RR en segundos)
//
// UMBRALES (por sexo):
//   Normal:      ≤ 450 ms (♂) / ≤ 460 ms (♀)
//   Prolongado:  > 450 (♂) / > 470 (♀)
//   Alto riesgo de torsades: QTc > 500 ms  o  ΔQTc > 60 ms
//   (franja intermedia limítrofe entre normal y prolongado ♀: 461–470)
//
// FUENTES (Vancouver breve):
//  - Bazett HC. An analysis of the time-relations of electrocardiograms.
//    Heart. 1920;7:353-370.
//  - Fridericia LS. Die Systolendauer im Elektrokardiogramm bei normalen
//    Menschen und bei Herzkranken. Acta Med Scand. 1920;53:469-486.
//  - Sagie A, Larson MG, Goldberg RJ, Bengtson JR, Levy D. An improved
//    method for adjusting the QT interval for heart rate (the Framingham
//    Heart Study). Am J Cardiol. 1992;70(7):797-801.
//  - Rautaharju PM, Surawicz B, Gettes LS, et al. AHA/ACCF/HRS
//    Recommendations for the Standardization and Interpretation of the
//    Electrocardiogram: Part IV — the ST segment, T and U waves, and the
//    QT interval. J Am Coll Cardiol. 2009;53(11):982-991.
//  - Drew BJ, Ackerman MJ, Funk M, et al. Prevention of Torsade de Pointes
//    in Hospital Settings: AHA/ACCF Scientific Statement. Circulation.
//    2010;121(8):1047-1060.  (QTc >500 ms y ΔQTc >60 ms como umbrales)
//  - Staikou C, Stamelos M, Stavroulakis E. Perioperative management of
//    hereditary arrhythmogenic syndromes. Br J Anaesth. 2014;112(3):469-483.
//  - CredibleMeds / AZCERT — lista de fármacos que prolongan el QT.
//
// Umbrales y fórmulas de literatura aceptada. NO inventados.
// ============================================================

import { useMemo, useState } from "react";
import Link from "next/link";

// ------------------------------------------------------------
// Parsing — acepta coma o punto como separador decimal
// ------------------------------------------------------------
function parseNumber(text: string): number | null {
  const raw = text.trim();
  if (raw.length === 0) return null;
  const n = Number(raw.replace(",", "."));
  return Number.isNaN(n) ? null : n;
}

// ------------------------------------------------------------
// Modo de entrada de la frecuencia
// ------------------------------------------------------------
type RateMode = "hr" | "rr";

const RATE_MODE_LABEL: Record<RateMode, string> = {
  hr: "FC (lpm)",
  rr: "RR (s)",
};
const RATE_MODE_ORDER: RateMode[] = ["hr", "rr"];

type Sex = "male" | "female";

const SEX_LABEL: Record<Sex, string> = {
  male: "Hombre",
  female: "Mujer",
};
const SEX_ORDER: Sex[] = ["male", "female"];

// ------------------------------------------------------------
// Fórmulas de corrección (QT y QTc en ms, RR en s)
// ------------------------------------------------------------
function bazett(qtMs: number, rrS: number): number {
  return qtMs / Math.sqrt(rrS);
}
function fridericia(qtMs: number, rrS: number): number {
  return qtMs / Math.cbrt(rrS);
}
function framingham(qtMs: number, rrS: number): number {
  // Framingham devuelve en ms directamente (154 ms × (1 − RR))
  return qtMs + 154 * (1 - rrS);
}

// ------------------------------------------------------------
// Categorización por sexo (AHA/ACCF/HRS 2009, umbrales del enunciado)
//   ♂: normal ≤450, prolongado >450
//   ♀: normal ≤460, limítrofe 461–470, prolongado >470
//   Cualquier sexo: >500 → alto riesgo de torsades
// ------------------------------------------------------------
type Category = "normal" | "borderline" | "prolonged" | "highRisk";

interface CategoryInfo {
  category: Category;
  label: string;
  color: string;
}

function categorize(qtcMs: number, sex: Sex): CategoryInfo {
  if (qtcMs > 500) {
    return {
      category: "highRisk",
      label: "QTc muy prolongado (alto riesgo de torsades)",
      color: "var(--red)",
    };
  }
  if (sex === "male") {
    if (qtcMs <= 450) {
      return { category: "normal", label: "Normal", color: "var(--accent)" };
    }
    return {
      category: "prolonged",
      label: "QTc prolongado",
      color: "var(--amber)",
    };
  }
  // female
  if (qtcMs <= 460) {
    return { category: "normal", label: "Normal", color: "var(--accent)" };
  }
  if (qtcMs <= 470) {
    return {
      category: "borderline",
      label: "Limítrofe",
      color: "var(--cyan)",
    };
  }
  return {
    category: "prolonged",
    label: "QTc prolongado",
    color: "var(--amber)",
  };
}

// ------------------------------------------------------------
// Riesgo global de torsades — combina QTc (Bazett) y ΔQTc.
//   QTc > 500 ms  →  alto riesgo
//   ΔQTc > 60 ms  →  alto riesgo (respecto al basal, con fármaco/intervención)
// (Drew et al. Circulation 2010)
// ------------------------------------------------------------
type TdpRisk = "high" | "elevated" | "low";

interface TdpInfo {
  risk: TdpRisk;
  headline: string;
  detail: string;
  color: string;
}

function torsadesRisk(
  qtcBazett: number,
  category: Category,
  deltaQtc: number | null
): TdpInfo {
  const byAbsolute = qtcBazett > 500;
  const byDelta = deltaQtc !== null && deltaQtc > 60;

  if (byAbsolute || byDelta) {
    const reasons: string[] = [];
    if (byAbsolute) reasons.push(`QTc ${qtcBazett.toFixed(0)} ms > 500 ms`);
    if (byDelta && deltaQtc !== null)
      reasons.push(`ΔQTc ${deltaQtc > 0 ? "+" : ""}${deltaQtc.toFixed(0)} ms > 60 ms`);
    return {
      risk: "high",
      headline: "Alto riesgo de torsades de pointes",
      detail: `${reasons.join(" · ")}. Retirar/evitar fármacos que prolongan el QT, corregir agresivamente K⁺/Mg²⁺/Ca²⁺, monitorización ECG continua y considerar consulta a cardiología. Mg²⁺ IV es el tratamiento de primera línea si aparece TdP.`,
      color: "var(--red)",
    };
  }

  if (category === "prolonged" || category === "borderline") {
    return {
      risk: "elevated",
      headline: "Riesgo aumentado — QTc prolongado/limítrofe",
      detail:
        "QTc por encima del rango normal para el sexo pero ≤ 500 ms y ΔQTc ≤ 60 ms. Minimizar fármacos QT-prolongadores, corregir electrolitos y vigilar el intervalo de forma seriada, sobre todo si se añaden agentes de riesgo.",
      color: "var(--amber)",
    };
  }

  return {
    risk: "low",
    headline: "Riesgo bajo de torsades",
    detail:
      "QTc dentro del rango normal para el sexo, ≤ 500 ms y sin aumento significativo (ΔQTc ≤ 60 ms). Mantener vigilancia si se administran fármacos que prolongan el QT o si el paciente desarrolla trastornos electrolíticos.",
    color: "var(--accent)",
  };
}

// ------------------------------------------------------------
// Fármacos anestésicos / perioperatorios que prolongan el QT
// (CredibleMeds/AZCERT; Staikou BJA 2014; guías de consenso)
// ------------------------------------------------------------
interface DrugRow {
  name: string;
  note: string;
}

const QT_DRUGS: DrugRow[] = [
  { name: "Ondansetrón", note: "antiemético 5-HT3; efecto dosis-dependiente, evitar >16 mg IV" },
  { name: "Droperidol", note: "butirofenona; recuadro de advertencia de la FDA por QT/TdP" },
  { name: "Haloperidol", note: "butirofenona; IV con mayor riesgo — monitorizar ECG" },
  { name: "Metadona", note: "opioide; bloqueo de hERG dosis-dependiente" },
  { name: "Sevoflurano", note: "volátil halogenado; prolonga el QTc — cautela en QT largo" },
  { name: "Sugammadex", note: "señal mínima/inconsistente de prolongación del QT; riesgo bajo" },
  { name: "Macrólidos", note: "eritromicina, claritromicina, azitromicina — evitar combinar" },
  { name: "Fluoroquinolonas", note: "levofloxacino, moxifloxacino (mayor); ciprofloxacino menor" },
];

// ------------------------------------------------------------
// Factores agravantes (electrolitos y otros modificadores)
// ------------------------------------------------------------
interface Aggravator {
  label: string;
  note: string;
}

const AGGRAVATORS: Aggravator[] = [
  { label: "Hipopotasemia (↓K⁺)", note: "prolonga la repolarización; corregir a K⁺ > 4.0 mmol/L en riesgo" },
  { label: "Hipomagnesemia (↓Mg²⁺)", note: "Mg²⁺ es primera línea en TdP; mantener > 2.0 mg/dL" },
  { label: "Hipocalcemia (↓Ca²⁺)", note: "prolonga el segmento ST/QT; corregir el Ca²⁺ ionizado" },
];

// ------------------------------------------------------------
// Componente
// ------------------------------------------------------------
export default function QtcClient() {
  const [qtText, setQtText] = useState("");
  const [rateText, setRateText] = useState("");
  const [rateMode, setRateMode] = useState<RateMode>("hr");
  const [sex, setSex] = useState<Sex>("male");
  const [baselineText, setBaselineText] = useState(""); // QTc basal opcional (ms) para ΔQTc

  const qt = useMemo(() => parseNumber(qtText), [qtText]);
  const rateRaw = useMemo(() => parseNumber(rateText), [rateText]);
  const baselineQtc = useMemo(() => parseNumber(baselineText), [baselineText]);

  // RR en segundos a partir del modo elegido
  const rrS = useMemo(() => {
    if (rateRaw === null || rateRaw <= 0) return null;
    if (rateMode === "hr") return 60 / rateRaw; // RR = 60 / FC
    return rateRaw; // ya es RR en s
  }, [rateRaw, rateMode]);

  // Validación de rangos fisiológicos
  const qtValid = qt !== null && qt >= 200 && qt <= 800;
  const rrValid = rrS !== null && rrS >= 0.25 && rrS <= 3; // ~20–240 lpm

  const results = useMemo(() => {
    if (!qtValid || !rrValid || qt === null || rrS === null) return null;
    return {
      bazett: bazett(qt, rrS),
      fridericia: fridericia(qt, rrS),
      framingham: framingham(qt, rrS),
      rrS,
    };
  }, [qt, rrS, qtValid, rrValid]);

  // ΔQTc respecto al basal (usando Bazett como método principal)
  const deltaQtc = useMemo(() => {
    if (results === null || baselineQtc === null) return null;
    if (baselineQtc < 200 || baselineQtc > 800) return null;
    return results.bazett - baselineQtc;
  }, [results, baselineQtc]);

  const bazettCategory = useMemo(
    () => (results !== null ? categorize(results.bazett, sex) : null),
    [results, sex]
  );

  const tdp = useMemo(() => {
    if (results === null || bazettCategory === null) return null;
    return torsadesRisk(results.bazett, bazettCategory.category, deltaQtc);
  }, [results, bazettCategory, deltaQtc]);

  const derivedRate = useMemo(() => {
    if (rrS === null) return null;
    return { hr: 60 / rrS, rr: rrS };
  }, [rrS]);

  const clearAll = () => {
    setQtText("");
    setRateText("");
    setBaselineText("");
  };

  const labelStyle: React.CSSProperties = {
    color: "var(--text-3)",
    fontSize: "0.6rem",
    display: "block",
    marginBottom: "0.25rem",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  };

  // Métodos a mostrar (Bazett principal)
  const methodRows: { key: string; label: string; value: number | null; primary: boolean }[] =
    results !== null
      ? [
          { key: "bazett", label: "Bazett (QT/√RR)", value: results.bazett, primary: true },
          { key: "fridericia", label: "Fridericia (QT/RR^⅓)", value: results.fridericia, primary: false },
          { key: "framingham", label: "Framingham (QT+154×(1−RR))", value: results.framingham, primary: false },
        ]
      : [];

  return (
    <div
      className="wrap"
      style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}
    >
      {/* Header estándar */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./qtc.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>QTc y riesgo de torsades</h1>
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.65rem",
            marginTop: "0.25rem",
            lineHeight: 1.7,
          }}
        >
          corrección del QT (Bazett · Fridericia · Framingham) y estratificación de torsades
          <br />
          {/* humor negro — no aplica al contenido clínico */}
          <span style={{ opacity: 0.6 }}>
            {"// el QT largo no avisa: solo se presenta con la fibrilación ventricular"}
          </span>
        </p>
      </div>

      {/* ==================== PARÁMETROS ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> PARÁMETROS
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.85rem" }}>
          {/* Sexo (segmented) */}
          <div>
            <label className="mono" style={labelStyle}>
              Sexo (umbral de normalidad)
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1px",
                background: "var(--border)",
                border: "1px solid var(--border)",
              }}
            >
              {SEX_ORDER.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSex(s)}
                  className="mono"
                  style={{
                    padding: "0.5rem 0.25rem",
                    fontSize: "0.65rem",
                    cursor: "pointer",
                    border: "none",
                    background: s === sex ? "var(--accent)" : "var(--bg-1)",
                    color: s === sex ? "#000" : "var(--text-2)",
                    transition: "all 0.15s",
                  }}
                >
                  {SEX_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          {/* QT + frecuencia */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            {/* QT medido */}
            <div>
              <label className="mono" style={labelStyle}>
                QT medido (ms)
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="400"
                value={qtText}
                onChange={(e) => setQtText(e.target.value)}
                min={0}
                step="any"
              />
            </div>

            {/* Frecuencia (FC o RR) */}
            <div>
              <label className="mono" style={labelStyle}>
                {RATE_MODE_LABEL[rateMode]}
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder={rateMode === "hr" ? "75" : "0.80"}
                value={rateText}
                onChange={(e) => setRateText(e.target.value)}
                min={0}
                step="any"
              />
            </div>
          </div>

          {/* Toggle FC / RR */}
          <div>
            <label className="mono" style={labelStyle}>
              Modo de frecuencia
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1px",
                background: "var(--border)",
                border: "1px solid var(--border)",
              }}
            >
              {RATE_MODE_ORDER.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setRateMode(m)}
                  className="mono"
                  style={{
                    padding: "0.5rem 0.25rem",
                    fontSize: "0.65rem",
                    cursor: "pointer",
                    border: "none",
                    background: m === rateMode ? "var(--accent)" : "var(--bg-1)",
                    color: m === rateMode ? "#000" : "var(--text-2)",
                    transition: "all 0.15s",
                  }}
                >
                  {m === "hr" ? "Frecuencia cardíaca" : "Intervalo RR"}
                </button>
              ))}
            </div>
            <div
              className="mono"
              style={{ color: "var(--text-3)", fontSize: "0.55rem", lineHeight: 1.6, marginTop: "0.35rem" }}
            >
              {"// RR (s) = 60 / FC"}
              {derivedRate !== null ? (
                <>
                  <br />
                  {`// RR = ${derivedRate.rr.toFixed(3)} s  ·  FC = ${derivedRate.hr.toFixed(0)} lpm`}
                </>
              ) : null}
            </div>
          </div>

          {/* QTc basal opcional para ΔQTc */}
          <div>
            <label className="mono" style={labelStyle}>
              QTc basal (ms) — opcional, para ΔQTc
            </label>
            <input
              type="number"
              inputMode="decimal"
              className="calc-input mono"
              placeholder="440"
              value={baselineText}
              onChange={(e) => setBaselineText(e.target.value)}
              min={0}
              step="any"
            />
            <div
              className="mono"
              style={{ color: "var(--text-3)", fontSize: "0.55rem", lineHeight: 1.6, marginTop: "0.35rem" }}
            >
              {"// ΔQTc = QTc(Bazett) − QTc basal; ΔQTc > 60 ms marca alto riesgo"}
              {deltaQtc !== null ? (
                <>
                  <br />
                  {`// ΔQTc = ${deltaQtc > 0 ? "+" : ""}${deltaQtc.toFixed(0)} ms`}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== RESULTADO ==================== */}
      {results !== null && bazettCategory !== null && tdp !== null ? (
        <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
          <div className="panel-header">
            <span className="dot" /> RESULTADO
          </div>
          <div className="panel-body" style={{ display: "grid", gap: "0.85rem" }}>
            {/* QTc por método */}
            <div style={{ display: "grid", gap: "0.5rem" }}>
              {methodRows.map((row) => {
                const cat = row.value !== null ? categorize(row.value, sex) : null;
                return (
                  <div
                    key={row.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                      padding: "0.6rem 0.75rem",
                      border: `1px solid ${row.primary ? "var(--border-hi)" : "var(--border)"}`,
                      background: row.primary ? "var(--bg-3)" : "var(--bg-1)",
                    }}
                  >
                    <span
                      className="mono"
                      style={{
                        fontSize: "0.68rem",
                        color: row.primary ? "var(--text-0)" : "var(--text-2)",
                        fontWeight: row.primary ? 700 : 500,
                      }}
                    >
                      {row.label}
                      {row.primary ? (
                        <span
                          className="mono"
                          style={{
                            marginLeft: "0.4rem",
                            fontSize: "0.5rem",
                            padding: "0.05rem 0.3rem",
                            border: "1px solid var(--border-hi)",
                            color: "var(--text-3)",
                            borderRadius: "9999px",
                          }}
                        >
                          principal
                        </span>
                      ) : null}
                    </span>
                    <span
                      className="mono"
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: cat ? cat.color : "var(--text-0)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.value !== null ? `${row.value.toFixed(0)} ms` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Categoría (por Bazett + sexo) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>
                categoría ({SEX_LABEL[sex].toLowerCase()}, Bazett):
              </span>
              <span
                className="mono"
                style={{ color: bazettCategory.color, fontWeight: 700, fontSize: "0.8rem" }}
              >
                {bazettCategory.label}
              </span>
            </div>

            {/* Riesgo de torsades */}
            <div
              className="panel"
              style={{
                borderLeft: `3px solid ${tdp.color}`,
                background: "var(--bg-1)",
              }}
            >
              <div className="panel-body" style={{ display: "grid", gap: "0.3rem" }}>
                <span
                  className="mono"
                  style={{ color: tdp.color, fontWeight: 700, fontSize: "0.85rem" }}
                >
                  {tdp.headline}
                </span>
                <p
                  style={{
                    color: "var(--text-1)",
                    fontSize: "0.78rem",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {tdp.detail}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Hint si faltan / son inválidos los inputs */
        <div
          className="mono"
          style={{
            padding: "1.5rem",
            textAlign: "center",
            color: "var(--text-3)",
            fontSize: "0.7rem",
            border: "1px dashed var(--border)",
            background: "var(--bg-1)",
            marginBottom: "1rem",
            lineHeight: 1.7,
          }}
        >
          Ingresa QT medido (200–800 ms) y {rateMode === "hr" ? "FC (20–240 lpm)" : "RR (0.25–3 s)"} para calcular.
          <br />
          <span style={{ opacity: 0.5, fontSize: "0.6rem" }}>
            {"// datos fuera de rango fisiológico no computan"}
          </span>
        </div>
      )}

      {/* Limpiar */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button type="button" onClick={clearAll} className="btn btn-outline btn-sm">
          limpiar campos
        </button>
      </div>

      {/* ==================== REFERENCIA: umbrales por sexo ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> UMBRALES DE QTc (AHA/ACCF/HRS 2009)
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 460 }}>
              <thead>
                <tr style={{ background: "var(--bg-3)" }}>
                  {["Categoría", "Hombre", "Mujer"].map((h) => (
                    <th
                      key={h}
                      className="mono"
                      style={{
                        textAlign: "left",
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.6rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--text-2)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: "Normal", color: "var(--accent)", male: "≤ 450 ms", female: "≤ 460 ms" },
                  { cat: "Limítrofe", color: "var(--cyan)", male: "—", female: "461–470 ms" },
                  { cat: "Prolongado", color: "var(--amber)", male: "> 450 ms", female: "> 470 ms" },
                  { cat: "Alto riesgo de torsades", color: "var(--red)", male: "> 500 ms", female: "> 500 ms" },
                ].map((row) => (
                  <tr key={row.cat} style={{ borderTop: "1px solid var(--border)" }}>
                    <td
                      className="mono"
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.74rem",
                        color: row.color,
                        fontWeight: 700,
                      }}
                    >
                      {row.cat}
                    </td>
                    <td
                      className="mono"
                      style={{ padding: "0.5rem 0.7rem", fontSize: "0.74rem", color: "var(--text-1)", whiteSpace: "nowrap" }}
                    >
                      {row.male}
                    </td>
                    <td
                      className="mono"
                      style={{ padding: "0.5rem 0.7rem", fontSize: "0.74rem", color: "var(--text-1)", whiteSpace: "nowrap" }}
                    >
                      {row.female}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div
          className="mono"
          style={{
            padding: "0.6rem 0.75rem",
            borderTop: "1px solid var(--border)",
            color: "var(--text-3)",
            fontSize: "0.55rem",
            lineHeight: 1.6,
          }}
        >
          {"// además del valor absoluto: ΔQTc > 60 ms respecto al basal = alto riesgo (Drew 2010)"}
          <br />
          {"// Bazett sobrecorrige a FC altas e infracorrige a FC bajas; usa Fridericia si la FC es extrema"}
        </div>
      </div>

      {/* ==================== FÁRMACOS QT-PROLONGADORES ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> FÁRMACOS PERIOPERATORIOS QUE PROLONGAN EL QT
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.4rem" }}>
          {QT_DRUGS.map((d) => (
            <div
              key={d.name}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "0.6rem",
                padding: "0.4rem 0.15rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span
                style={{
                  color: "var(--text-0)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  minWidth: 130,
                  flexShrink: 0,
                }}
              >
                {d.name}
              </span>
              <span
                className="mono"
                style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.5 }}
              >
                {"// " + d.note}
              </span>
            </div>
          ))}
          <div
            className="mono"
            style={{ color: "var(--text-3)", fontSize: "0.55rem", lineHeight: 1.6, marginTop: "0.3rem" }}
          >
            {"// el riesgo es aditivo: combinar dos o más QT-prolongadores multiplica la probabilidad de TdP"}
          </div>
        </div>
      </div>

      {/* ==================== FACTORES AGRAVANTES ==================== */}
      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <div className="panel-header">
          <span className="dot" /> FACTORES AGRAVANTES (electrolitos)
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.4rem" }}>
          {AGGRAVATORS.map((a) => (
            <div
              key={a.label}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "0.6rem",
                padding: "0.4rem 0.15rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span
                style={{
                  color: "var(--amber)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  minWidth: 170,
                  flexShrink: 0,
                }}
              >
                {a.label}
              </span>
              <span
                className="mono"
                style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.5 }}
              >
                {"// " + a.note}
              </span>
            </div>
          ))}
          <div
            className="mono"
            style={{ color: "var(--text-3)", fontSize: "0.55rem", lineHeight: 1.6, marginTop: "0.3rem" }}
          >
            {"// otros: bradicardia, sexo femenino, cardiopatía estructural, QT largo congénito, hipotiroidismo"}
          </div>
        </div>
      </div>

      {/* ==================== FUENTES ==================== */}
      <div
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.6rem",
          lineHeight: 1.8,
          marginBottom: "1.25rem",
        }}
      >
        <div style={{ color: "var(--text-2)", marginBottom: "0.3rem" }}>Fuentes</div>
        Bazett HC. An analysis of the time-relations of electrocardiograms. Heart. 1920;7:353-370.
        <br />
        Fridericia LS. Die Systolendauer im Elektrokardiogramm bei normalen Menschen und bei
        Herzkranken. Acta Med Scand. 1920;53:469-486.
        <br />
        Sagie A, Larson MG, Goldberg RJ, Bengtson JR, Levy D. An improved method for adjusting the
        QT interval for heart rate (the Framingham Heart Study). Am J Cardiol. 1992;70(7):797-801.
        <br />
        Rautaharju PM, Surawicz B, Gettes LS, et al. AHA/ACCF/HRS Recommendations for the
        Standardization and Interpretation of the ECG: Part IV. J Am Coll Cardiol.
        2009;53(11):982-991.
        <br />
        Drew BJ, Ackerman MJ, Funk M, et al. Prevention of Torsade de Pointes in Hospital Settings:
        AHA/ACCF Scientific Statement. Circulation. 2010;121(8):1047-1060.
        <br />
        Staikou C, Stamelos M, Stavroulakis E. Perioperative management of hereditary arrhythmogenic
        syndromes. Br J Anaesth. 2014;112(3):469-483.
      </div>

      {/* Disclaimer con humor negro */}
      <p
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.55rem",
          opacity: 0.6,
          textAlign: "center",
          lineHeight: 1.7,
        }}
      >
        {"// QTc — fórmulas y umbrales de literatura aceptada, no reglas absolutas"}
        <br />
        {"// mide el QT manualmente en la derivación con mayor T; no confíes ciego en el monitor"}
        <br />
        {"// la torsades no negocia con el sesgo de anclaje del anestesiólogo"}
      </p>

      {/* Volver */}
      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <Link
          href="/calculadoras"
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}
        >
          ← /calculadoras
        </Link>
      </div>
    </div>
  );
}
