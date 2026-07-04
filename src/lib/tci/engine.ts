// ============================================================
// engine.ts — Motor de simulación TCI/TIVA (modelo mamilar 3 comp. + Ce)
//
// SEGURIDAD: este motor NO contiene parámetros farmacocinéticos. Solo
// implementa la matemática del modelo compartimental y el algoritmo de
// control por objetivo (target-controlled). Los coeficientes PK/Ke0
// (que son los que causan daño si están mal) viven aislados en models.ts,
// cada uno con su cita. El motor es agnóstico y verificable de forma
// independiente.
//
// Modelo: mamilar de 3 compartimentos con compartimento de sitio-efecto.
//   dx1/dt = I(t) - (k10 + k12 + k13)·x1 + k21·x2 + k31·x3
//   dx2/dt = k12·x1 - k21·x2
//   dx3/dt = k13·x1 - k31·x3
//   dCe/dt = ke0·(Cp - Ce)              [Cp = x1 / V1]
// donde x = masa (mg o µg) en cada compartimento, I(t) = tasa de entrada.
//
// Integración: Euler explícito con Δt pequeño (1 s por defecto). Con Δt≤5 s
// el error frente a la solución analítica es despreciable para el uso
// clínico (las constantes de tasa más rápidas son ~0.5-1 min⁻¹).
//
// Álgebra micro↔macro: idéntica a la calculadora de Cp del proyecto
// (Bailey JM, Shafer SL. IEEE Trans Biomed Eng 1991;38:522-5), reutilizada
// para el pico plasmático analítico usado por el algoritmo effect-site.
// ============================================================

// Parámetros micro-cinéticos de un modelo (contrato compartido con models.ts).
// V en litros; CL/Q en L/min.
export interface MicroParams {
  V1: number; // L — compartimento central
  V2: number; // L — periférico rápido
  V3: number; // L — periférico lento (0 si bicompartimental)
  CL: number; // L/min — aclaramiento de eliminación
  Q2: number; // L/min — aclaramiento intercompartimental rápido
  Q3: number; // L/min — aclaramiento intercompartimental lento (0 si 2 comp.)
  ke0: number; // min⁻¹ — constante de equilibrio plasma↔sitio efecto (0 = sin Ce)
}

// Constantes de tasa (min⁻¹) derivadas de los micro-parámetros.
export interface RateConstants {
  k10: number;
  k12: number;
  k21: number;
  k13: number;
  k31: number;
  ke0: number;
  V1: number; // L (necesario para convertir masa↔concentración)
}

export function microToRates(p: MicroParams): RateConstants {
  const k10 = p.CL / p.V1;
  const k12 = p.Q2 / p.V1;
  const k21 = p.V2 > 0 ? p.Q2 / p.V2 : 0;
  const k13 = p.V3 > 0 ? p.Q3 / p.V1 : 0;
  const k31 = p.V3 > 0 ? p.Q3 / p.V3 : 0;
  return { k10, k12, k21, k13, k31, ke0: p.ke0, V1: p.V1 };
}

// ------------------------------------------------------------
// Estado del sistema: masas en cada compartimento (unidad natural del
// fármaco: mg o µg) y concentración en el sitio efecto (misma unidad / L).
// ------------------------------------------------------------
export interface State {
  x1: number; // masa central
  x2: number; // masa periférico rápido
  x3: number; // masa periférico lento
  ce: number; // concentración sitio efecto (unidad/L)
}

export function zeroState(): State {
  return { x1: 0, x2: 0, x3: 0, ce: 0 };
}

// Un paso de Euler de duración dtMin (min) con tasa de infusión infRate
// (unidad de masa / min) entrando al compartimento central.
export function step(s: State, r: RateConstants, infRate: number, dtMin: number): State {
  const cp = r.V1 > 0 ? s.x1 / r.V1 : 0; // concentración plasmática actual
  const dx1 = infRate - (r.k10 + r.k12 + r.k13) * s.x1 + r.k21 * s.x2 + r.k31 * s.x3;
  const dx2 = r.k12 * s.x1 - r.k21 * s.x2;
  const dx3 = r.k13 * s.x1 - r.k31 * s.x3;
  const dce = r.ke0 * (cp - s.ce);
  return {
    x1: s.x1 + dx1 * dtMin,
    x2: s.x2 + dx2 * dtMin,
    x3: s.x3 + dx3 * dtMin,
    ce: s.ce + dce * dtMin,
  };
}

export function cpOf(s: State, r: RateConstants): number {
  return r.V1 > 0 ? s.x1 / r.V1 : 0;
}

// ------------------------------------------------------------
// Predicción del PICO de Ce tras un bolo (unit-disposition / effect-site).
// Para el algoritmo effect-site-target de Shafer & Gregg (Anesthesiology
// 1992) necesitamos: dado un bolo que lleva Cp a un valor, ¿cuánto sube Ce
// y cuándo alcanza su pico? Simulamos la respuesta libre (sin más infusión)
// desde el estado actual y buscamos el máximo de Ce en una ventana.
// Devuelve { peakCe, tPeakMin } de la respuesta libre partiendo de `s`.
// ------------------------------------------------------------
export function freePeakCe(
  s0: State,
  r: RateConstants,
  horizonMin = 10,
  dtMin = 1 / 60,
): { peakCe: number; tPeakMin: number } {
  let s = { ...s0 };
  let peakCe = s.ce;
  let tPeak = 0;
  const steps = Math.round(horizonMin / dtMin);
  for (let i = 1; i <= steps; i++) {
    s = step(s, r, 0, dtMin); // sin infusión: respuesta libre
    if (s.ce > peakCe) {
      peakCe = s.ce;
      tPeak = i * dtMin;
    }
  }
  return { peakCe, tPeakMin: tPeak };
}

// ------------------------------------------------------------
// SIMULACIÓN TCI: dado un objetivo (Cp o Ce) constante, calcula la
// secuencia de infusión que un TCI aplicaría y devuelve la trayectoria.
//
// Algoritmo (BET / Shafer-Gregg, discreto a paso Δt):
//   MODO PLASMA-TARGET:
//     En cada paso, si Cp < objetivo, administra un bolo para llevar Cp al
//     objetivo instantáneamente: bolo = (target·V1) − x1 (masa que falta en
//     el central). Luego mantiene con infusión que compensa la salida neta:
//     infMaintenance = target·V1·(k10 + k12 + k13) − k21·x2 − k31·x3
//     (masa que abandona el central por unidad de tiempo en el objetivo).
//     Ese es exactamente el esquema BET: Bolus + Elimination + Transfer.
//
//   MODO EFFECT-SITE-TARGET (Shafer & Gregg 1992):
//     Para alcanzar el objetivo de Ce lo más rápido sin sobrepasar, se
//     "sobredosifica" el plasma: se administra el bolo que hace que el PICO
//     de la respuesta libre de Ce iguale exactamente el objetivo. Mientras
//     Ce < objetivo se empuja Cp por encima; cuando Ce alcanza el objetivo
//     se conmuta a mantener Cp = objetivo (mismo BET que plasma-target).
//     El bolo de sobredisparo se busca por bisección sobre freePeakCe.
//
// La infusión se discretiza: en cada Δt aplicamos (bolo/Δt) + mantenimiento
// como una tasa constante durante ese Δt (una bomba real hace lo mismo con
// pasos de 1-10 s). Se respeta un tope de tasa de bomba opcional.
// ------------------------------------------------------------

export type TargetMode = "plasma" | "effect";

export interface SimConfig {
  target: number; // objetivo de Cp o Ce, en unidad/L (µg/mL o ng/mL según fármaco)
  mode: TargetMode;
  durationMin: number; // duración total a simular
  dtMin?: number; // paso de integración (default 1 s)
  maxInfRate?: number; // tope de tasa (unidad de masa/min), opcional (bomba)
}

export interface SamplePoint {
  tMin: number;
  cp: number; // unidad/L
  ce: number; // unidad/L
  infRate: number; // unidad de masa/min aplicada en ESE intervalo
  cumulativeDose: number; // masa total administrada hasta tMin (unidad natural)
}

export interface SimResult {
  samples: SamplePoint[]; // trayectoria (submuestreada ~cada 6 s o menos)
  initialBolus: number; // masa del bolo inicial (unidad natural)
  totalDose: number; // masa total al final (unidad natural)
  r: RateConstants;
}

// Masa que necesita ENTRAR al central este Δt para mantener Cp = target
// (esquema BET, componente E+T): compensa eliminación y transferencia neta.
function maintenanceInfRate(target: number, s: State, r: RateConstants): number {
  // Tasa de salida neta del central en el objetivo (masa/min):
  //   entra por retorno periférico: k21·x2 + k31·x3
  //   sale por eliminación+distribución: (k10+k12+k13)·x1
  // Para MANTENER x1 = target·V1 constante, infRate = d(salida neta):
  const x1Target = target * r.V1;
  const out = (r.k10 + r.k12 + r.k13) * x1Target;
  const back = r.k21 * s.x2 + r.k31 * s.x3;
  return Math.max(0, out - back);
}

// Bolo (masa) para llevar Cp instantáneamente a `target` desde el estado s.
function bolusToPlasma(target: number, s: State, r: RateConstants): number {
  const x1Target = target * r.V1;
  return Math.max(0, x1Target - s.x1);
}

// Encuentra por bisección el bolo que hace que el PICO de Ce (respuesta
// libre desde s) iguale `target`. Usado en effect-site targeting.
function bolusForEffectPeak(target: number, s: State, r: RateConstants): number {
  // Cota superior: el bolo que llevaría Cp a un múltiplo alto del objetivo.
  let lo = 0;
  let hi = target * r.V1 * 8 + 1; // masa; amplio, se acota por bisección
  // Si ya Ce ≥ target sin bolo, no hace falta bolo.
  const peakNow = freePeakCe(s, r).peakCe;
  if (peakNow >= target) return 0;
  for (let iter = 0; iter < 40; iter++) {
    const mid = (lo + hi) / 2;
    const trial: State = { ...s, x1: s.x1 + mid };
    const { peakCe } = freePeakCe(trial, r);
    if (peakCe < target) lo = mid;
    else hi = mid;
    if (hi - lo < 1e-6) break;
  }
  return (lo + hi) / 2;
}

export function simulate(p: MicroParams, cfg: SimConfig): SimResult {
  const r = microToRates(p);
  const dt = cfg.dtMin ?? 1 / 60; // 1 s
  const nSteps = Math.max(1, Math.round(cfg.durationMin / dt));
  const target = cfg.target;
  const hasKe0 = r.ke0 > 0;
  const effectMode = cfg.mode === "effect" && hasKe0;

  let s = zeroState();
  let cumulative = 0;
  let initialBolus = 0;

  // Submuestreo de salida: ~cada 6 s como máximo (mantiene el array manejable
  // aun con dt=1s y horizontes largos).
  const sampleEvery = Math.max(1, Math.round(0.1 / dt)); // ~6 s
  const samples: SamplePoint[] = [];

  // Estado del controlador effect-site: cuando Ce alcanza el objetivo, se
  // pasa a mantener Cp=target (deja de sobredisparar).
  let effectReached = false;

  for (let i = 0; i < nSteps; i++) {
    const tMin = i * dt;
    const cpNow = cpOf(s, r);

    // --- Decidir infusión / bolo para este Δt ---
    let bolus = 0; // masa administrada instantáneamente al inicio del Δt
    let infRate = 0; // masa/min durante el Δt

    if (effectMode && !effectReached) {
      // Empuja hacia el pico de Ce = target.
      if (s.ce < target - 1e-9) {
        bolus = bolusForEffectPeak(target, s, r);
      } else {
        effectReached = true;
      }
      if (s.ce >= target - 1e-9) effectReached = true;
    }

    if (!effectMode || effectReached) {
      // Mantener Cp = target (plasma-target, o effect tras alcanzar Ce).
      if (cpNow < target - 1e-9) {
        bolus = bolusToPlasma(target, s, r);
      }
      infRate = maintenanceInfRate(target, s, r);
    }

    // Aplicar tope de bomba al componente de infusión continua (el bolo se
    // administra como tal; una bomba TCI lo entrega a tasa máxima muy alta).
    if (cfg.maxInfRate != null && infRate > cfg.maxInfRate) {
      infRate = cfg.maxInfRate;
    }

    // Bolo: masa directa al central.
    if (bolus > 0) {
      s = { ...s, x1: s.x1 + bolus };
      cumulative += bolus;
      if (i === 0) initialBolus = bolus;
    }

    // Integrar el Δt con la infusión continua.
    s = step(s, r, infRate, dt);
    cumulative += infRate * dt;

    // Registrar muestra (tasa "efectiva" del intervalo incluye el bolo
    // prorrateado, para reporte de mL/h — ver capa de UI).
    if (i % sampleEvery === 0 || i === nSteps - 1) {
      const effRate = infRate + bolus / dt; // masa/min efectiva del intervalo
      samples.push({
        tMin,
        cp: cpOf(s, r),
        ce: s.ce,
        infRate: effRate,
        cumulativeDose: cumulative,
      });
    }
  }

  return {
    samples,
    initialBolus,
    totalDose: cumulative,
    r,
  };
}

// ------------------------------------------------------------
// Tiempo estimado a "despertar": partiendo del estado final de una
// simulación, se detiene toda infusión y se cuenta cuánto tarda Ce (o Cp si
// no hay ke0) en descender por debajo de un umbral de despertar dado.
// Devuelve minutos, o null si no desciende dentro del horizonte.
// ------------------------------------------------------------
export function timeToThreshold(
  finalState: State,
  r: RateConstants,
  threshold: number,
  useCe: boolean,
  horizonMin = 120,
  dtMin = 1 / 60,
): number | null {
  let s = { ...finalState };
  const steps = Math.round(horizonMin / dtMin);
  const startVal = useCe && r.ke0 > 0 ? s.ce : cpOf(s, r);
  if (startVal <= threshold) return 0;
  for (let i = 1; i <= steps; i++) {
    s = step(s, r, 0, dtMin);
    const val = useCe && r.ke0 > 0 ? s.ce : cpOf(s, r);
    if (val <= threshold) return i * dtMin;
  }
  return null;
}

// Reconstruye el estado final replicando la simulación (útil porque
// SimResult solo guarda muestras submuestreadas). Devuelve el State exacto
// al final del horizonte simulado.
export function finalStateOf(p: MicroParams, cfg: SimConfig): State {
  const r = microToRates(p);
  const dt = cfg.dtMin ?? 1 / 60;
  const nSteps = Math.max(1, Math.round(cfg.durationMin / dt));
  const target = cfg.target;
  const hasKe0 = r.ke0 > 0;
  const effectMode = cfg.mode === "effect" && hasKe0;
  let s = zeroState();
  let effectReached = false;
  for (let i = 0; i < nSteps; i++) {
    const cpNow = cpOf(s, r);
    let bolus = 0;
    let infRate = 0;
    if (effectMode && !effectReached) {
      if (s.ce < target - 1e-9) bolus = bolusForEffectPeak(target, s, r);
      else effectReached = true;
      if (s.ce >= target - 1e-9) effectReached = true;
    }
    if (!effectMode || effectReached) {
      if (cpNow < target - 1e-9) bolus = bolusToPlasma(target, s, r);
      infRate = maintenanceInfRate(target, s, r);
    }
    if (cfg.maxInfRate != null && infRate > cfg.maxInfRate) infRate = cfg.maxInfRate;
    if (bolus > 0) s = { ...s, x1: s.x1 + bolus };
    s = step(s, r, infRate, dt);
  }
  return s;
}
