"use client";

// ============================================================
// PatientContext — estado de paciente compartido entre calculadoras.
// El "paciente activo" (peso, talla, edad, sexo) vive aquí y cualquier
// calculadora puede leerlo/escribirlo. Persistencia local (localStorage);
// export/import JSON para que el dato dependa solo del dispositivo/nube del
// usuario (sin backend). Deriva IBW/ABW/LBM/BMI/BSA.
// ============================================================

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Sex = "male" | "female";
export type WeightType = "real" | "ideal" | "adjusted" | "lean";

export interface Patient {
  id: string;
  label: string; // alias/etiqueta o nombre (uso exclusivo del médico, local)
  mrn?: string; // nº de expediente opcional (local, del médico)
  weightKg: number | null;
  heightCm: number | null;
  ageYears: number | null;
  sex: Sex;
  notes?: string;
  updatedAt: number;
}

export interface DerivedWeights {
  real: number | null;
  ideal: number | null; // IBW Devine
  adjusted: number | null; // ABW = IBW + 0.4(real - IBW)
  lean: number | null; // LBM Boer
  bmi: number | null;
  bsa: number | null; // Mosteller
}

// ---- Fórmulas antropométricas (literatura aceptada) ----
export function idealBodyWeight(heightCm: number, sex: Sex): number {
  // Devine (métrico): 50 (♂) / 45.5 (♀) kg + 0.9 kg por cada cm sobre 152.4.
  const base = sex === "male" ? 50 : 45.5;
  return Math.max(0, base + 0.9 * (heightCm - 152.4));
}
export function leanBodyMass(weightKg: number, heightCm: number, sex: Sex): number {
  // Boer.
  return sex === "male"
    ? 0.407 * weightKg + 0.267 * heightCm - 19.2
    : 0.252 * weightKg + 0.473 * heightCm - 48.3;
}
export function adjustedBodyWeight(weightKg: number, ibw: number): number {
  // ABW = IBW + 0.4 (real - IBW); si el real < IBW se usa el real.
  return weightKg > ibw ? ibw + 0.4 * (weightKg - ibw) : weightKg;
}
export function bodyMassIndex(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}
export function bodySurfaceArea(weightKg: number, heightCm: number): number {
  // Mosteller.
  return Math.sqrt((heightCm * weightKg) / 3600);
}

export function deriveWeights(p: Patient): DerivedWeights {
  const w = p.weightKg;
  const h = p.heightCm;
  if (w == null || w <= 0) {
    return { real: w ?? null, ideal: null, adjusted: null, lean: null, bmi: null, bsa: null };
  }
  const ideal = h && h > 0 ? idealBodyWeight(h, p.sex) : null;
  return {
    real: w,
    ideal,
    adjusted: ideal != null ? adjustedBodyWeight(w, ideal) : null,
    lean: h && h > 0 ? leanBodyMass(w, h, p.sex) : null,
    bmi: h && h > 0 ? bodyMassIndex(w, h) : null,
    bsa: h && h > 0 ? bodySurfaceArea(w, h) : null,
  };
}

/** Devuelve el peso (kg) del tipo pedido, con fallback al real. */
export function weightOfType(p: Patient, type: WeightType): number | null {
  const d = deriveWeights(p);
  switch (type) {
    case "ideal": return d.ideal ?? d.real;
    case "adjusted": return d.adjusted ?? d.real;
    case "lean": return d.lean ?? d.real;
    default: return d.real;
  }
}

// ---- Contexto ----
interface PatientContextValue {
  active: Patient;
  setActive: (patch: Partial<Patient>) => void;
  derived: DerivedWeights;
  weightType: WeightType;
  setWeightType: (t: WeightType) => void;
  saved: Patient[];
  savePatient: () => void;
  loadPatient: (id: string) => void;
  deletePatient: (id: string) => void;
  newPatient: () => void;
  exportJSON: () => string;
  importJSON: (json: string) => boolean;
}

const emptyPatient = (): Patient => ({
  id: cryptoId(),
  label: "Paciente",
  weightKg: null,
  heightCm: null,
  ageYears: null,
  sex: "male",
  updatedAt: nowStamp(),
});

// Evita Date.now()/Math.random() directos en SSR: se resuelven en cliente.
function nowStamp(): number {
  return typeof performance !== "undefined" ? Math.floor(Date.now()) : 0;
}
function cryptoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "p" + Math.floor(Date.now()).toString(36);
}

const ACTIVE_KEY = "dec.patient.active";
const SAVED_KEY = "dec.patient.saved";
const WTYPE_KEY = "dec.patient.weightType";

const Ctx = createContext<PatientContextValue | null>(null);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [active, setActiveState] = useState<Patient>(emptyPatient);
  const [saved, setSaved] = useState<Patient[]>([]);
  const [weightType, setWeightTypeState] = useState<WeightType>("real");
  const [hydrated, setHydrated] = useState(false);

  // Hidratación desde localStorage (solo cliente).
  useEffect(() => {
    try {
      const a = localStorage.getItem(ACTIVE_KEY);
      if (a) setActiveState(JSON.parse(a));
      const s = localStorage.getItem(SAVED_KEY);
      if (s) setSaved(JSON.parse(s));
      const w = localStorage.getItem(WTYPE_KEY) as WeightType | null;
      if (w) setWeightTypeState(w);
    } catch {
      /* ignore corrupto */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(ACTIVE_KEY, JSON.stringify(active));
  }, [active, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }, [saved, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(WTYPE_KEY, weightType);
  }, [weightType, hydrated]);

  const setActive = (patch: Partial<Patient>) =>
    setActiveState((p) => ({ ...p, ...patch, updatedAt: nowStamp() }));
  const setWeightType = (t: WeightType) => setWeightTypeState(t);

  const savePatient = () =>
    setSaved((list) => {
      const snap = { ...active, updatedAt: nowStamp() };
      const i = list.findIndex((x) => x.id === snap.id);
      if (i >= 0) {
        const copy = [...list];
        copy[i] = snap;
        return copy;
      }
      return [snap, ...list];
    });
  const loadPatient = (id: string) => {
    const p = saved.find((x) => x.id === id);
    if (p) setActiveState({ ...p });
  };
  const deletePatient = (id: string) => setSaved((l) => l.filter((x) => x.id !== id));
  const newPatient = () => setActiveState(emptyPatient());

  const exportJSON = () => JSON.stringify({ active, saved, weightType }, null, 2);
  const importJSON = (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.active) setActiveState(data.active);
      if (Array.isArray(data.saved)) setSaved(data.saved);
      if (data.weightType) setWeightTypeState(data.weightType);
      return true;
    } catch {
      return false;
    }
  };

  const derived = useMemo(() => deriveWeights(active), [active]);

  const value: PatientContextValue = {
    active, setActive, derived, weightType, setWeightType,
    saved, savePatient, loadPatient, deletePatient, newPatient,
    exportJSON, importJSON,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePatient(): PatientContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePatient debe usarse dentro de <PatientProvider>");
  return ctx;
}

/** Hook de conveniencia: peso activo del tipo seleccionado (o el pasado). */
export function useActiveWeight(type?: WeightType): number | null {
  const { active, weightType } = usePatient();
  return weightOfType(active, type ?? weightType);
}
