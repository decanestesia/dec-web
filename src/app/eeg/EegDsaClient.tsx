"use client";

// ============================================================
// Firmas EEG en el DSA (Density Spectral Array) por anestésico
//
// Explorador didáctico: para cada fármaco muestra un mini-
// espectrograma ILUSTRATIVO en SVG (x = tiempo, y = frecuencia
// 0–30 Hz, color = potencia), la descripción del patrón, las
// bandas dominantes y su uso clínico para monitorizar la
// profundidad anestésica.
//
// ⚠️ Los espectrogramas son ESQUEMÁTICOS/ilustrativos, generados
// por una función de potencia sintética que reproduce el patrón
// cualitativo descrito en la literatura. NO son registros reales
// ni deben leerse como magnitudes cuantitativas.
//
// FUENTES (Vancouver breve):
//  - Purdon PL, Sampson A, Pavone KJ, Brown EN. Clinical
//    electroencephalography for anesthesiologists: part I:
//    background and basic signatures. Anesthesiology.
//    2015;123(4):937-960.
//  - Akeju O, Brown EN. Neural oscillations demonstrate that
//    general anesthesia and sedative states are neurophysiologically
//    distinct from sleep. Curr Opin Neurobiol. 2017;44:178-185.
//  - Purdon PL, Pierce ET, Mukamel EA, et al. Electroencephalogram
//    signatures of loss and recovery of consciousness from propofol.
//    Proc Natl Acad Sci USA. 2013;110(12):E1142-1151.
//  - Akeju O, Pavone KJ, Westover MB, et al. A comparison of
//    propofol- and dexmedetomidine-induced electroencephalogram
//    dynamics using spectral and coherence analysis.
//    Anesthesiology. 2014;121(5):978-989.
//
// Constantes/umbrales cualitativos tal como los describe la
// literatura. NO inventados.
// ============================================================

import { useMemo, useState } from "react";
import Link from "next/link";

// ------------------------------------------------------------
// Bandas de frecuencia EEG estándar (Hz)
// ------------------------------------------------------------
type BandName = "delta" | "theta" | "alpha" | "beta" | "gamma";

interface Band {
  name: BandName;
  label: string;
  lo: number; // Hz
  hi: number; // Hz
}

// Rangos convencionales (Purdon et al. 2015):
// delta 0–4, theta 4–8, alpha 8–12(13), beta 13–25/30, gamma >25/30
const BANDS: Band[] = [
  { name: "delta", label: "δ delta", lo: 0, hi: 4 },
  { name: "theta", label: "θ theta", lo: 4, hi: 8 },
  { name: "alpha", label: "α alpha", lo: 8, hi: 12 },
  { name: "beta", label: "β beta", lo: 13, hi: 25 },
  { name: "gamma", label: "γ gamma", lo: 25, hi: 30 },
];

// ------------------------------------------------------------
// Modelo de potencia sintético para el espectrograma ilustrativo.
// Cada firma define una lista de "picos" gaussianos en frecuencia,
// con posible modulación temporal (para representar husos
// intermitentes o burst suppression). Devuelve potencia 0..1.
// ------------------------------------------------------------
interface SpectralPeak {
  fc: number; // frecuencia central (Hz)
  sigma: number; // ancho de banda (Hz)
  amp: number; // amplitud relativa 0..1
  // modulación temporal opcional: 0..1 según t (0..1 = duración)
  temporal?: (t: number) => number;
}

interface DrugSignature {
  key: string;
  name: string;
  short: string; // subtítulo mono
  accent: string; // color CSS var de acento de la firma
  peaks: SpectralPeak[];
  pattern: string; // descripción del patrón
  bands: string; // bandas dominantes (texto)
  depth: string; // uso clínico para profundidad
  bandChips: BandName[]; // bandas a resaltar en la leyenda
}

// Husos intermitentes (dexmedetomidina): potencia alfa/spindle
// que aparece y desaparece de forma periódica.
const spindleMod = (t: number): number => {
  // ~4 husos a lo largo de la ventana; suelo bajo entre husos
  const s = 0.5 + 0.5 * Math.sin(2 * Math.PI * 4 * t - Math.PI / 2);
  return 0.25 + 0.75 * Math.pow(s, 3);
};

// Burst suppression (barbitúricos/tiopental a dosis altas, y a
// dosis profundas de otros): alternancia de brotes de actividad y
// periodos casi isoeléctricos.
const burstMod = (t: number): number => {
  const s = Math.sin(2 * Math.PI * 3 * t);
  return s > 0.2 ? 1 : 0.05;
};

// Barbitúrico: beta rápida INICIAL que decae, luego lentas.
const earlyFast = (t: number): number => Math.max(0, 1 - t * 1.8);
const lateSlow = (t: number): number => Math.min(1, 0.15 + t * 1.3);

// ------------------------------------------------------------
// Firmas EEG por anestésico (Purdon 2015; Akeju/Brown)
// ------------------------------------------------------------
const SIGNATURES: DrugSignature[] = [
  {
    key: "propofol",
    name: "Propofol",
    short: "alfa frontal coherente + lenta-delta",
    accent: "var(--accent)",
    peaks: [
      { fc: 1.5, sigma: 1.8, amp: 1.0 }, // lenta-delta de alto voltaje
      { fc: 10, sigma: 1.6, amp: 0.92 }, // alfa frontal (8–12 Hz)
    ],
    pattern:
      "Potencia alfa (8–12 Hz) frontal fuerte y coherente ('anteriorización' del alfa: se desplaza de occipital, en vigilia, a frontal bajo anestesia) combinada con ondas lentas-delta (0–4 Hz) de alto voltaje. A dosis más profundas aparece burst suppression (brotes intercalados con silencio isoeléctrico).",
    bands: "Dominan alfa (8–12 Hz) frontal y lenta-delta (0–4 Hz).",
    depth:
      "El alfa frontal coherente es el sello de plano quirúrgico adecuado con propofol. Su pérdida con aumento de la lenta-delta y aparición de burst suppression indica plano demasiado profundo (sobredosis relativa); su desaparición hacia frecuencias rápidas sugiere plano superficial / riesgo de despertar.",
    bandChips: ["delta", "alpha"],
  },
  {
    key: "halogenados",
    name: "Halogenados (sevo / iso / desflurano)",
    short: "alfa + delta con theta añadida",
    accent: "var(--cyan)",
    peaks: [
      { fc: 1.5, sigma: 2.0, amp: 1.0 }, // delta
      { fc: 6, sigma: 1.8, amp: 0.6 }, // theta añadida
      { fc: 10, sigma: 2.2, amp: 0.78 }, // alfa más difusa
    ],
    pattern:
      "Patrón alfa + delta similar al del propofol, pero con actividad theta (4–8 Hz) añadida y un alfa frontal más difuso (menos estrecho y coherente). A concentraciones equipotentes (~1 CAM) el DSA muestra bandas alfa y lenta bien visibles; a mayor concentración aparece burst suppression.",
    bands:
      "Alfa (8–12 Hz) + delta (0–4 Hz) con theta (4–8 Hz) añadida; alfa más difusa que con propofol.",
    depth:
      "El alfa/delta indica plano anestésico mantenido. La banda alfa se debilita en superficialización; el burst suppression a alta concentración señala plano excesivo. La theta añadida distingue el patrón halogenado del propofol puro.",
    bandChips: ["delta", "theta", "alpha"],
  },
  {
    key: "ketamina",
    name: "Ketamina",
    short: "gamma/beta alta — 'activación' paradójica",
    accent: "var(--red)",
    peaks: [
      { fc: 28, sigma: 3.0, amp: 1.0 }, // gamma (>25 Hz)
      { fc: 20, sigma: 4.0, amp: 0.7 }, // beta alta
      { fc: 3, sigma: 2.0, amp: 0.35 }, // algo de lenta de fondo
    ],
    pattern:
      "Potencia gamma/beta alta (>25 Hz) con pérdida del alfa lento característico de otros hipnóticos: aspecto de EEG 'activado' (paradójico), sin el patrón alfa-delta clásico. Puede coexistir con oscilaciones lentas-delta subyacentes.",
    bands: "Domina gamma/beta alta (>25 Hz); ausencia del alfa frontal lento.",
    depth:
      "Los índices de profundidad basados en supresión de frecuencias rápidas (p. ej. BIS) NO son fiables con ketamina: la activación gamma puede elevar el índice pese a anestesia adecuada. Interpretar la firma cualitativa, no un número aislado.",
    bandChips: ["beta", "gamma"],
  },
  {
    key: "dexmedetomidina",
    name: "Dexmedetomidina",
    short: "husos intermitentes + lentas (tipo NREM N2–N3)",
    accent: "var(--amber)",
    peaks: [
      { fc: 1.5, sigma: 2.0, amp: 0.9 }, // ondas lentas
      { fc: 12, sigma: 1.6, amp: 0.95, temporal: spindleMod }, // husos 9–15 Hz
    ],
    pattern:
      "Husos (spindles, 9–15 Hz) intermitentes superpuestos a ondas lentas-delta, muy parecido al sueño NREM N2–N3. NO produce el alfa frontal sostenido del propofol: la potencia en banda alfa/sigma aparece en ráfagas (husos), no de forma continua.",
    bands:
      "Husos intermitentes (9–15 Hz) + ondas lentas-delta (0–4 Hz); patrón tipo sueño NREM.",
    depth:
      "La sedación con dexmedetomidina es despertable y se asemeja al sueño fisiológico; el paciente puede reactivarse ante estímulo. La presencia de husos + lentas confirma sedación tipo N2–N3, pero no equivale a la inconsciencia profunda del alfa-delta continuo del propofol.",
    bandChips: ["delta", "alpha"],
  },
  {
    key: "oxido-nitroso",
    name: "Óxido nitroso (N₂O)",
    short: "lenta-delta de alto voltaje a alta concentración",
    accent: "var(--cyan)",
    peaks: [
      { fc: 1.2, sigma: 1.6, amp: 1.0 }, // lenta-delta de alto voltaje
    ],
    pattern:
      "A altas concentraciones (retirada de otros agentes) produce potencia lenta-delta de alto voltaje con descenso marcado de las frecuencias altas; no genera el patrón alfa típico de los hipnóticos GABAérgicos. Como coadyuvante a bajas concentraciones su firma es sutil.",
    bands:
      "Domina lenta-delta (0–4 Hz) de alto voltaje; caída de beta/gamma. Sin alfa frontal característico.",
    depth:
      "Su firma no encaja en los modelos alfa-delta; los monitores de profundidad pueden comportarse de forma atípica. Considerar el N₂O como coadyuvante y valorar la profundidad por el agente hipnótico principal.",
    bandChips: ["delta"],
  },
  {
    key: "opioides",
    name: "Opioides",
    short: "efecto EEG mínimo a dosis analgésicas",
    accent: "var(--text-2)",
    peaks: [
      { fc: 9, sigma: 3.0, amp: 0.35 }, // fondo de vigilia/analgesia
      { fc: 18, sigma: 4.0, amp: 0.25 },
      { fc: 2, sigma: 1.5, amp: 0.9, temporal: lateSlow }, // lentas solo a dosis muy altas
    ],
    pattern:
      "A dosis analgésicas el efecto sobre el EEG es mínimo: no producen una firma hipnótica propia. Solo a dosis MUY altas (p. ej. bolos elevados de opioide sintético) aparecen ondas lentas-delta de gran amplitud.",
    bands:
      "Sin banda dominante propia a dosis analgésicas; a dosis muy altas, lenta-delta (0–4 Hz).",
    depth:
      "Los opioides atenúan la respuesta a la nocicepción pero NO garantizan inconsciencia: no confiar en ellos para la profundidad hipnótica. Un EEG 'despierto' bajo opioide solo indica que falta el componente hipnótico.",
    bandChips: ["delta"],
  },
  {
    key: "benzodiacepinas",
    name: "Benzodiacepinas",
    short: "beta frontal aumentada",
    accent: "var(--red)",
    peaks: [
      { fc: 20, sigma: 4.5, amp: 1.0 }, // beta frontal (13–30 Hz)
      { fc: 3, sigma: 1.8, amp: 0.3 },
    ],
    pattern:
      "Aumento de la actividad beta frontal (13–30 Hz) — la clásica 'beta inducida por benzodiacepinas' —, reflejo de la potenciación GABA_A. A dosis sedantes predomina esa beta rápida sobre el fondo.",
    bands: "Domina beta frontal (13–30 Hz).",
    depth:
      "La beta aumentada marca sedación GABAérgica, no anestesia quirúrgica profunda por sí sola. Es un patrón de sedación/ansiolisis; profundizar el plano requiere el hipnótico principal.",
    bandChips: ["beta"],
  },
  {
    key: "barbituricos",
    name: "Barbitúricos (tiopental)",
    short: "beta rápida inicial → lentas → burst suppression",
    accent: "var(--amber)",
    peaks: [
      { fc: 20, sigma: 4.0, amp: 0.95, temporal: earlyFast }, // beta rápida inicial
      { fc: 2, sigma: 1.8, amp: 1.0, temporal: (t) => lateSlow(t) * burstMod(t) }, // lentas + burst suppression
    ],
    pattern:
      "Beta rápida al inicio (activación transitoria dosis-dependiente), seguida de ondas lentas conforme profundiza; a dosis altas aparece burst suppression (brotes intercalados con silencio isoeléctrico), base de la protección cerebral y del coma barbitúrico.",
    bands:
      "Beta (13–30 Hz) inicial → lenta-delta (0–4 Hz); burst suppression a dosis altas.",
    depth:
      "La progresión beta → lentas → burst suppression titula la profundidad. El burst suppression es objetivo terapéutico buscado en la protección cerebral / control de PIC (coma barbitúrico titulado por EEG), no un accidente.",
    bandChips: ["delta", "beta"],
  },
];

// ------------------------------------------------------------
// Cálculo de potencia sintética en (frecuencia, tiempo)
// Suma de picos gaussianos, con modulación temporal opcional.
// Devuelve 0..~1.
// ------------------------------------------------------------
function powerAt(sig: DrugSignature, freqHz: number, tNorm: number): number {
  let p = 0;
  for (const peak of sig.peaks) {
    const mod = peak.temporal ? peak.temporal(tNorm) : 1;
    const d = (freqHz - peak.fc) / peak.sigma;
    p += peak.amp * mod * Math.exp(-0.5 * d * d);
  }
  return Math.min(1, p);
}

// ------------------------------------------------------------
// Mapa de color potencia→color (estilo DSA: azul→verde→amarillo→rojo)
// Interpolación simple sobre paradas discretas.
// ------------------------------------------------------------
const HEAT_STOPS: Array<{ t: number; rgb: [number, number, number] }> = [
  { t: 0.0, rgb: [5, 8, 14] }, // fondo oscuro (bg-0)
  { t: 0.2, rgb: [12, 30, 70] }, // azul profundo
  { t: 0.45, rgb: [16, 120, 130] }, // teal/cyan
  { t: 0.68, rgb: [16, 185, 129] }, // verde acento
  { t: 0.85, rgb: [245, 158, 11] }, // ámbar
  { t: 1.0, rgb: [239, 68, 68] }, // rojo (potencia máx)
];

function heatColor(p: number): string {
  const v = Math.max(0, Math.min(1, p));
  for (let i = 1; i < HEAT_STOPS.length; i++) {
    const a = HEAT_STOPS[i - 1];
    const b = HEAT_STOPS[i];
    if (v <= b.t) {
      const f = (v - a.t) / (b.t - a.t || 1);
      const r = Math.round(a.rgb[0] + (b.rgb[0] - a.rgb[0]) * f);
      const g = Math.round(a.rgb[1] + (b.rgb[1] - a.rgb[1]) * f);
      const bl = Math.round(a.rgb[2] + (b.rgb[2] - a.rgb[2]) * f);
      return `rgb(${r},${g},${bl})`;
    }
  }
  const last = HEAT_STOPS[HEAT_STOPS.length - 1].rgb;
  return `rgb(${last[0]},${last[1]},${last[2]})`;
}

// ------------------------------------------------------------
// Geometría del espectrograma SVG
// ------------------------------------------------------------
const SVG_W = 620;
const SVG_H = 260;
const PAD_L = 42; // eje Y (frecuencia)
const PAD_B = 26; // eje X (tiempo)
const PAD_T = 10;
const PAD_R = 10;
const PLOT_W = SVG_W - PAD_L - PAD_R;
const PLOT_H = SVG_H - PAD_T - PAD_B;

const N_COLS = 46; // columnas temporales
const N_ROWS = 30; // filas de frecuencia (1 Hz c/u, 0–30 Hz)
const FREQ_MAX = 30;

interface Cell {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
}

function buildCells(sig: DrugSignature): Cell[] {
  const cells: Cell[] = [];
  const cw = PLOT_W / N_COLS;
  const ch = PLOT_H / N_ROWS;
  for (let c = 0; c < N_COLS; c++) {
    const tNorm = c / (N_COLS - 1); // 0..1 (tiempo)
    for (let r = 0; r < N_ROWS; r++) {
      // fila 0 = 0–1 Hz (abajo); fila N_ROWS-1 = 29–30 Hz (arriba)
      const freqHz = r + 0.5;
      const p = powerAt(sig, freqHz, tNorm);
      const x = PAD_L + c * cw;
      // y invertido: frecuencias altas arriba
      const y = PAD_T + (N_ROWS - 1 - r) * ch;
      cells.push({
        x,
        y,
        w: cw + 0.6, // ligero solape para evitar líneas finas
        h: ch + 0.6,
        fill: heatColor(p),
      });
    }
  }
  return cells;
}

// posiciones Y de las marcas de frecuencia
const FREQ_TICKS = [0, 4, 8, 12, 20, 30];
function freqToY(hz: number): number {
  return PAD_T + (1 - hz / FREQ_MAX) * PLOT_H;
}

// ------------------------------------------------------------
// Componente
// ------------------------------------------------------------
export default function EegDsaClient() {
  const [activeKey, setActiveKey] = useState<string>(SIGNATURES[0].key);

  const sig = useMemo(
    () => SIGNATURES.find((s) => s.key === activeKey) ?? SIGNATURES[0],
    [activeKey]
  );

  const cells = useMemo(() => buildCells(sig), [sig]);

  const bandChipSet = useMemo(() => new Set(sig.bandChips), [sig]);

  const labelStyle: React.CSSProperties = {
    color: "var(--text-3)",
    fontSize: "0.6rem",
    display: "block",
    marginBottom: "0.25rem",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  };

  return (
    <div
      className="wrap"
      style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}
    >
      {/* Header estándar */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./eeg-dsa.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
          Firmas EEG en el DSA
        </h1>
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.65rem",
            marginTop: "0.25rem",
            lineHeight: 1.7,
          }}
        >
          EEG procesado / Density Spectral Array (espectrograma) por anestésico
          <br />
          {/* humor negro — no aplica al contenido clínico */}
          <span style={{ opacity: 0.6 }}>
            {"// el cerebro dibuja su plano anestésico; solo hay que saber leerlo"}
          </span>
        </p>
      </div>

      {/* ==================== SELECTOR DE FÁRMACO ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> ANESTÉSICO
        </div>
        <div className="panel-body">
          <label className="mono" style={labelStyle}>
            Selecciona el fármaco
          </label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1px",
              background: "var(--border)",
              border: "1px solid var(--border)",
            }}
          >
            {SIGNATURES.map((s) => {
              const active = s.key === activeKey;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActiveKey(s.key)}
                  aria-pressed={active}
                  className="mono"
                  style={{
                    flex: "1 1 auto",
                    padding: "0.5rem 0.6rem",
                    fontSize: "0.62rem",
                    cursor: "pointer",
                    border: "none",
                    background: active ? "var(--accent)" : "var(--bg-1)",
                    color: active ? "#000" : "var(--text-2)",
                    fontWeight: active ? 700 : 500,
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                  }}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================== ESPECTROGRAMA ==================== */}
      <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> ESPECTROGRAMA (DSA) — {sig.name}
        </div>
        <div className="panel-body">
          <div style={{ overflowX: "auto" }}>
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              width="100%"
              style={{
                display: "block",
                minWidth: 360,
                background: "var(--bg-0)",
                border: "1px solid var(--border)",
              }}
              role="img"
              aria-label={`Espectrograma ilustrativo de ${sig.name}: ${sig.bands}`}
            >
              {/* celdas de potencia */}
              {cells.map((cell, i) => (
                <rect
                  key={i}
                  x={cell.x}
                  y={cell.y}
                  width={cell.w}
                  height={cell.h}
                  fill={cell.fill}
                  shapeRendering="crispEdges"
                />
              ))}

              {/* marco del área de plot */}
              <rect
                x={PAD_L}
                y={PAD_T}
                width={PLOT_W}
                height={PLOT_H}
                fill="none"
                stroke="var(--border-hi)"
                strokeWidth={1}
              />

              {/* Eje Y: marcas de frecuencia */}
              {FREQ_TICKS.map((hz) => {
                const y = freqToY(hz);
                return (
                  <g key={hz}>
                    <line
                      x1={PAD_L - 4}
                      y1={y}
                      x2={PAD_L}
                      y2={y}
                      stroke="var(--text-3)"
                      strokeWidth={1}
                    />
                    <text
                      x={PAD_L - 7}
                      y={y + 3}
                      textAnchor="end"
                      fontSize={9}
                      fontFamily="monospace"
                      fill="var(--text-3)"
                    >
                      {hz}
                    </text>
                  </g>
                );
              })}
              {/* Etiqueta eje Y */}
              <text
                x={12}
                y={PAD_T + PLOT_H / 2}
                fontSize={9}
                fontFamily="monospace"
                fill="var(--text-2)"
                textAnchor="middle"
                transform={`rotate(-90 12 ${PAD_T + PLOT_H / 2})`}
              >
                frecuencia (Hz)
              </text>

              {/* Eje X: tiempo (esquemático) */}
              <text
                x={PAD_L + PLOT_W / 2}
                y={SVG_H - 6}
                fontSize={9}
                fontFamily="monospace"
                fill="var(--text-2)"
                textAnchor="middle"
              >
                tiempo →
              </text>
            </svg>
          </div>

          {/* Escala de color potencia */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "0.6rem",
            }}
          >
            <span
              className="mono"
              style={{ color: "var(--text-3)", fontSize: "0.55rem" }}
            >
              potencia −
            </span>
            <div
              style={{
                flex: 1,
                height: "8px",
                background:
                  "linear-gradient(to right," +
                  "rgb(5,8,14),rgb(12,30,70),rgb(16,120,130)," +
                  "rgb(16,185,129),rgb(245,158,11),rgb(239,68,68))",
                border: "1px solid var(--border)",
              }}
            />
            <span
              className="mono"
              style={{ color: "var(--text-3)", fontSize: "0.55rem" }}
            >
              + potencia
            </span>
          </div>

          {/* Nota ilustrativa */}
          <div
            className="mono"
            style={{
              color: "var(--text-3)",
              fontSize: "0.55rem",
              lineHeight: 1.6,
              marginTop: "0.5rem",
            }}
          >
            {"// espectrograma ESQUEMÁTICO/ilustrativo, no un registro real"}
            <br />
            {"// reproduce el patrón cualitativo descrito en la literatura"}
          </div>
        </div>
      </div>

      {/* ==================== BANDAS DOMINANTES (chips) ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> BANDAS DE FRECUENCIA
        </div>
        <div className="panel-body">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.4rem",
              marginBottom: "0.6rem",
            }}
          >
            {BANDS.map((b) => {
              const on = bandChipSet.has(b.name);
              return (
                <span
                  key={b.name}
                  className="tag mono"
                  style={{
                    borderColor: on ? "var(--accent-border)" : "var(--border-hi)",
                    background: on ? "var(--accent-glow)" : "var(--bg-3)",
                    color: on ? "var(--accent)" : "var(--text-3)",
                    textTransform: "none",
                    fontWeight: on ? 700 : 500,
                    opacity: on ? 1 : 0.7,
                  }}
                >
                  {b.label} · {b.lo}
                  {"–"}
                  {b.hi} Hz
                </span>
              );
            })}
          </div>
          <p
            style={{
              color: "var(--text-1)",
              fontSize: "0.78rem",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            <strong style={{ color: "var(--text-0)" }}>Dominantes: </strong>
            {sig.bands}
          </p>
        </div>
      </div>

      {/* ==================== PATRÓN + USO CLÍNICO ==================== */}
      <div
        className="panel"
        style={{
          marginBottom: "1rem",
          borderLeft: `3px solid ${sig.accent}`,
        }}
      >
        <div className="panel-header">
          <span className="dot" /> PATRÓN Y PROFUNDIDAD — {sig.name}
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.85rem" }}>
          <div>
            <div
              className="mono"
              style={{
                color: "var(--text-3)",
                fontSize: "0.58rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.3rem",
              }}
            >
              Descripción del patrón
            </div>
            <p
              style={{
                color: "var(--text-1)",
                fontSize: "0.82rem",
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              {sig.pattern}
            </p>
          </div>

          <div>
            <div
              className="mono"
              style={{
                color: "var(--text-3)",
                fontSize: "0.58rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.3rem",
              }}
            >
              Uso clínico para profundidad
            </div>
            <p
              style={{
                color: "var(--text-1)",
                fontSize: "0.82rem",
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              {sig.depth}
            </p>
          </div>
        </div>
      </div>

      {/* ==================== BURST SUPPRESSION ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> NOTA — BURST SUPPRESSION
        </div>
        <div className="panel-body">
          <p
            style={{
              color: "var(--text-1)",
              fontSize: "0.8rem",
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            El <strong style={{ color: "var(--text-0)" }}>burst suppression</strong>{" "}
            es un patrón de alternancia entre brotes de actividad EEG y periodos
            casi isoeléctricos (silencio). En el DSA se ve como columnas verticales
            de potencia intercaladas con columnas oscuras. Aparece con anestesia
            excesivamente profunda (sobredosis relativa) —donde suele ser{" "}
            <strong style={{ color: "var(--amber)" }}>indeseado</strong>, ligado en
            algunos estudios a delirio postoperatorio— y como{" "}
            <strong style={{ color: "var(--accent)" }}>objetivo terapéutico
            buscado</strong> en la protección cerebral / control de hipertensión
            intracraneal (coma barbitúrico titulado por EEG). La{" "}
            <em>burst suppression ratio</em> cuantifica la fracción de tiempo en
            supresión.
          </p>
        </div>
      </div>

      {/* ==================== LIMITACIONES / EDAD ==================== */}
      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <div className="panel-header">
          <span className="dot" /> LIMITACIONES
        </div>
        <div className="panel-body">
          <ul
            style={{
              margin: 0,
              paddingLeft: "1.1rem",
              color: "var(--text-1)",
              fontSize: "0.8rem",
              lineHeight: 1.7,
            }}
          >
            <li style={{ marginBottom: "0.4rem" }}>
              <strong>Edad — ancianos:</strong> la potencia alfa disminuye con la
              edad; los mayores muestran menos alfa frontal y mayor tendencia al
              burst suppression a igual dosis. Un alfa débil no siempre indica plano
              superficial en el anciano.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              <strong>Edad — niños:</strong> el EEG madura con la edad; los lactantes
              y neonatos tienen firmas distintas y potencias/bandas dependientes del
              desarrollo. Los patrones del adulto no se extrapolan directamente.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              Ketamina, óxido nitroso y, en parte, la dexmedetomidina generan firmas
              que <strong>no encajan</strong> en los modelos alfa-delta clásicos;
              los índices numéricos de profundidad (BIS y similares) pueden ser
              engañosos con estos agentes.
            </li>
            <li style={{ marginBottom: "0" }}>
              Los espectrogramas de esta página son{" "}
              <strong>esquemáticos/ilustrativos</strong>: enseñan el patrón
              cualitativo, no sustituyen la lectura del monitor real ni la clínica.
            </li>
          </ul>
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
        <div style={{ color: "var(--text-2)", marginBottom: "0.3rem" }}>
          Fuentes
        </div>
        Purdon PL, Sampson A, Pavone KJ, Brown EN. Clinical electroencephalography
        for anesthesiologists: part I: background and basic signatures.
        Anesthesiology. 2015;123(4):937-960.
        <br />
        Akeju O, Brown EN. Neural oscillations demonstrate that general anesthesia
        and sedative states are neurophysiologically distinct from sleep. Curr Opin
        Neurobiol. 2017;44:178-185.
        <br />
        Purdon PL, Pierce ET, Mukamel EA, et al. Electroencephalogram signatures of
        loss and recovery of consciousness from propofol. Proc Natl Acad Sci USA.
        2013;110(12):E1142-1151.
        <br />
        Akeju O, Pavone KJ, Westover MB, et al. A comparison of propofol- and
        dexmedetomidine-induced electroencephalogram dynamics using spectral and
        coherence analysis. Anesthesiology. 2014;121(5):978-989.
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
        {"// firmas EEG cualitativas de literatura aceptada, no reglas absolutas"}
        <br />
        {"// espectrogramas ilustrativos — no sustituyen al monitor real ni a la clínica"}
        <br />
        {"// el paciente despierto no lee el espectrograma; tú sí deberías"}
      </p>

      {/* Volver */}
      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <Link
          href="/calculadoras"
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.7rem",
            textDecoration: "none",
          }}
        >
          ← /calculadoras
        </Link>
      </div>
    </div>
  );
}
