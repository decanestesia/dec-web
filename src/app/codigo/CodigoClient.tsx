"use client";

// ============================================================
// MODO QUIRÓFANO / CÓDIGO AZUL — Client Component
//
// Pantalla glanceable para usar en la tablet junto a la máquina de
// anestesia durante una crisis. Prioriza LEGIBILIDAD y TAMAÑO: los
// números de dosis son grandes y de alto contraste para leerse a
// distancia. El PESO manda TODAS las dosis: se lee del paciente
// activo (usePatient) y se puede sobreescribir con presets rápidos
// o un input grande.
//
// EXACTITUD CLÍNICA: el set de fármacos y los valores (mg/kg, topes,
// vías, notas) clonan EmergencyDrugData.swift del DEC Watch App
// — literatura aceptada (ACLS/PALS AHA 2020, anafilaxia BJA/AAGBI,
// ASRA LAST, MHAUS). Los protocolos en pasos se clonan de las guías
// de DEC (paro-perioperatorio, anafilaxia, hipertermia-maligna,
// anestésicos-locales/LAST, rsi). Ningún valor inventado.
//
// Este componente NO escribe en PatientContext: solo LEE el peso
// activo. El override de peso vive en estado local de la pantalla.
// ============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePatient } from "@/lib/patient/PatientContext";
import ClinicalConsentGate from "@/components/ClinicalConsentGate";
import ProGateClient from "@/components/ProGateClient";
import { PRO_FEATURES } from "@/lib/gating";

// ------------------------------------------------------------
// Modelo de fármaco de emergencia (paridad con EmergencyDrug.swift)
// ------------------------------------------------------------
interface EmergencyDrug {
  name: string;
  indication: string;
  route: string;
  /** Dosis por kg (en `unit`). null si es dosis fija de adulto. */
  perKg: number | null;
  unit: string;
  /** Tope máximo por dosis (en `unit`). null si no aplica. */
  maxDose: number | null;
  /** Texto de dosis fija de adulto (cuando perKg es null o como referencia). */
  adultDose: string;
  note: string;
  /** Reconstitución / dilución cuando aplica (extra web, no bloquea). */
  recon?: string;
}

interface EmergencyCategory {
  title: string;
  /** Acento visual de la categoría. */
  accent: string;
  drugs: EmergencyDrug[];
}

// ------------------------------------------------------------
// Datos — clonados 1:1 de EmergencyDrugData.swift (mismos valores)
// ------------------------------------------------------------
const CATEGORIES: EmergencyCategory[] = [
  {
    title: "Paro / ACLS",
    accent: "var(--red)",
    drugs: [
      { name: "Adrenalina (paro)", indication: "PCR", route: "IV/IO", perKg: 0.01, unit: "mg", maxDose: 1, adultDose: "1 mg c/3-5 min", note: "Peds 0.01 mg/kg (0.1 mL/kg 1:10 000), máx 1 mg. Adulto 1 mg.", recon: "1:10 000 = 100 mcg/mL → 0.1 mL/kg." },
      { name: "Amiodarona (paro)", indication: "FV/TVsp", route: "IV/IO", perKg: 5, unit: "mg", maxDose: 300, adultDose: "300 mg, luego 150 mg", note: "Peds 5 mg/kg. Adulto 300 mg, 2ª dosis 150 mg." },
      { name: "Atropina", indication: "Bradicardia", route: "IV", perKg: 0.02, unit: "mg", maxDose: 1, adultDose: "0.5-1 mg c/3-5 min", note: "Peds 0.02 mg/kg (mín 0.1, máx 0.5 mg/dosis). Adulto 0.5-1 mg." },
      { name: "Adenosina", indication: "TSV", route: "IV rápido", perKg: 0.1, unit: "mg", maxDose: 6, adultDose: "6 mg, luego 12 mg", note: "Peds 0.1 mg/kg (máx 6), 2ª 0.2 mg/kg (máx 12). Bolo + flush.", recon: "Empujar rápido seguido de bolo de suero salino." },
      { name: "Bicarbonato Na", indication: "Acidosis/hiperK", route: "IV", perKg: 1, unit: "mEq", maxDose: null, adultDose: "1 mEq/kg", note: "1 mEq/kg. No de rutina en PCR." },
      { name: "Calcio (cloruro)", indication: "HiperK/hipoCa", route: "IV central", perKg: 10, unit: "mg", maxDose: 1000, adultDose: "0.5-1 g", note: "CaCl₂ 10 mg/kg. Vía central preferida.", recon: "CaCl₂ 10% = 100 mg/mL. Vía central (esclerosante)." },
    ],
  },
  {
    title: "Vía aérea / RSI",
    accent: "var(--cyan)",
    drugs: [
      { name: "Propofol", indication: "Inducción", route: "IV", perKg: 2, unit: "mg", maxDose: null, adultDose: "1.5-2.5 mg/kg", note: "1.5-2.5 mg/kg. Menos en inestables/ancianos." },
      { name: "Ketamina", indication: "Inducción", route: "IV", perKg: 1.5, unit: "mg", maxDose: null, adultDose: "1-2 mg/kg", note: "1-2 mg/kg. Estable hemodinámicamente." },
      { name: "Etomidato", indication: "Inducción", route: "IV", perKg: 0.3, unit: "mg", maxDose: null, adultDose: "0.2-0.3 mg/kg", note: "0.2-0.3 mg/kg." },
      { name: "Succinilcolina", indication: "RSI", route: "IV", perKg: 1.5, unit: "mg", maxDose: null, adultDose: "1-1.5 mg/kg", note: "1-1.5 mg/kg IV (4 mg/kg IM). Evitar en hiperK/quemado/HM." },
      { name: "Rocuronio (RSI)", indication: "RSI", route: "IV", perKg: 1.2, unit: "mg", maxDose: null, adultDose: "1.2 mg/kg", note: "1.2 mg/kg para RSI. Reversible con sugammadex 16 mg/kg." },
      { name: "Sugammadex (rescate)", indication: "Revertir rocuronio", route: "IV", perKg: 16, unit: "mg", maxDose: null, adultDose: "16 mg/kg", note: "16 mg/kg para reversión inmediata post-RSI." },
    ],
  },
  {
    title: "Anafilaxia",
    accent: "var(--amber)",
    drugs: [
      { name: "Adrenalina IM", indication: "Anafilaxia", route: "IM", perKg: 0.01, unit: "mg", maxDose: 0.5, adultDose: "0.5 mg IM", note: "0.01 mg/kg IM (máx 0.5 mg), repetir c/5 min. Muslo lateral.", recon: "1 mg/mL (1:1000) IM en cara anterolateral del muslo." },
      { name: "Adrenalina IV bolo", indication: "Anafilaxia grave", route: "IV", perKg: 1, unit: "mcg", maxDose: 100, adultDose: "10-100 mcg titulado", note: "Titular 10-100 mcg IV bajo monitor. Infusión si refractaria.", recon: "Diluir a 10 mcg/mL para titular con seguridad." },
      { name: "Hidrocortisona", indication: "Anafilaxia", route: "IV", perKg: null, unit: "mg", maxDose: null, adultDose: "200 mg", note: "Adyuvante, no de 1ª línea. 200 mg IV." },
    ],
  },
  {
    title: "Toxicidad / crisis",
    accent: "var(--accent)",
    drugs: [
      { name: "Emulsión lipídica 20%", indication: "LAST", route: "IV", perKg: 1.5, unit: "mL", maxDose: null, adultDose: "1.5 mL/kg bolo", note: "Bolo 1.5 mL/kg, luego 0.25 mL/kg/min. Repetir bolo si asistolia.", recon: "Intralipid 20%. Infusión 0.25 mL/kg/min tras el bolo." },
      { name: "Dantroleno", indication: "Hipertermia maligna", route: "IV", perKg: 2.5, unit: "mg", maxDose: null, adultDose: "2.5 mg/kg", note: "2.5 mg/kg, repetir hasta 10 mg/kg. Llamar MHAUS.", recon: "Reconstituir cada vial con agua estéril; presentación clásica 20 mg + 60 mL." },
      { name: "Sulfato de Mg", indication: "Torsades/asma/PE", route: "IV", perKg: null, unit: "g", maxDose: null, adultDose: "2 g", note: "Torsades/asma 2 g. Preeclampsia carga 4-6 g." },
      { name: "Naloxona", indication: "Opioide", route: "IV", perKg: null, unit: "mg", maxDose: null, adultDose: "0.04-0.4 mg titulado", note: "Titular 0.04-0.4 mg IV. Peds 0.01 mg/kg." },
      { name: "Flumazenil", indication: "Benzodiacepina", route: "IV", perKg: null, unit: "mg", maxDose: null, adultDose: "0.2 mg", note: "0.2 mg, repetir. Cuidado convulsiones." },
      { name: "Dextrosa 50%", indication: "Hipoglucemia", route: "IV", perKg: null, unit: "mL", maxDose: null, adultDose: "25 g (50 mL D50)", note: "Adulto 25 g. Peds D25 2-4 mL/kg o D10 5 mL/kg." },
    ],
  },
];

// ------------------------------------------------------------
// Cálculo de dosis por peso (paridad con EmergencyDrug.computed)
// ------------------------------------------------------------
function trimNumber(v: number): string {
  return v === Math.round(v) ? String(Math.round(v)) : String(v);
}

/** Dosis calculada para un peso, con redondeo clínico razonable. */
function computedDose(drug: EmergencyDrug, weightKg: number): string {
  if (drug.perKg == null) return drug.adultDose;
  const raw = drug.perKg * weightKg;
  let d = raw;
  if (drug.maxDose != null) d = Math.min(d, drug.maxDose);
  let rounded: number;
  if (d < 1) rounded = Math.round(d * 100) / 100;
  else if (d < 10) rounded = Math.round(d * 10) / 10;
  else rounded = Math.round(d);
  const capped = drug.maxDose != null && raw >= drug.maxDose ? " (máx)" : "";
  return `${trimNumber(rounded)} ${drug.unit}${capped}`;
}

// ------------------------------------------------------------
// Protocolos de crisis en pasos (clonados de las guías DEC)
// ------------------------------------------------------------
interface Protocol {
  id: string;
  title: string;
  accent: string;
  href: string; // guía/calc. de referencia ampliada
  steps: { label: string; detail: string }[];
  source: string;
}

const PROTOCOLS: Protocol[] = [
  {
    id: "last",
    title: "LAST — toxicidad por anestésico local",
    accent: "var(--accent)",
    href: "/calculadoras/anestesicos-locales",
    steps: [
      { label: "Detener la inyección", detail: "Parar el anestésico local YA. Pedir ayuda y el kit de emulsión lipídica. Declarar LAST en voz alta." },
      { label: "Vía aérea", detail: "O₂ 100%, ventilar. Prevenir/tratar hipoxia, hipercapnia y acidosis (empeoran la toxicidad)." },
      { label: "Convulsiones", detail: "Benzodiacepina (midazolam). Evitar dosis altas de propofol si hay inestabilidad CV." },
      { label: "Emulsión lipídica 20%", detail: "Bolo 1.5 mL/kg en 2-3 min → infusión 0.25 mL/kg/min. Repetir bolo 1-2 veces si sigue inestable; puede duplicarse a 0.5 mL/kg/min. Máx orientativo ≈ 12 mL/kg." },
      { label: "Si hay paro", detail: "ACLS con adrenalina en dosis reducidas (bolos ≤ 1 mcg/kg). Amiodarona para arritmias ventriculares. Evitar vasopresina, bloqueadores de Ca, β-bloqueadores y más anestésico local." },
      { label: "Refractario", detail: "Avisar temprano por bypass cardiopulmonar / ECMO. Continuar lípidos ≥ 10 min tras estabilizar." },
    ],
    source: "Neal JM, et al. ASRA LAST Checklist 2020. Reg Anesth Pain Med 2021;46:81-82.",
  },
  {
    id: "anafilaxia",
    title: "Anafilaxia perioperatoria",
    accent: "var(--amber)",
    href: "/guias/anafilaxia",
    steps: [
      { label: "Reconocer y pedir ayuda", detail: "Sospecha ante hipotensión inexplicada, broncoespasmo/↑presión de vía aérea, desaturación o colapso CV. Declarar «sospecha de anafilaxia»." },
      { label: "Detener el desencadenante", detail: "Suspender BNM, antibiótico, coloide, clorhexidina o látex sospechoso en curso." },
      { label: "Vía aérea y O₂", detail: "FiO₂ 100%; asegurar/mantener vía aérea; anticipar edema y broncoespasmo." },
      { label: "Adrenalina", detail: "IV titulada por grado: II 10-20 mcg, III 50-100 mcg, repetir. IM 0.5 mg (adulto) si no hay acceso IV o paro inminente. Paro (IV) 1 mg c/3-5 min." },
      { label: "Fluidos", detail: "Cristaloide 10-20 mL/kg en bolo rápido; repetir según respuesta. Piernas elevadas." },
      { label: "Escalar / adyuvantes", detail: "Infusión de adrenalina 0.05-0.2 mcg/kg/min si bolos repetidos. Hidrocortisona 200 mg, antihistamínico, salbutamol; glucagón 1-2 mg si β-bloqueo. Triptasa seriada." },
    ],
    source: "Garvey LH, et al. AAGBI/BSACI. Anaesthesia 2021 · NAP6.",
  },
  {
    id: "hm",
    title: "Hipertermia maligna",
    accent: "var(--red)",
    href: "/guias/hipertermia-maligna",
    steps: [
      { label: "Suspender el gatillo", detail: "Detener volátiles y succinilcolina. Hiperventilar con O₂ 100% a alto flujo. Pedir ayuda y el carro de HM." },
      { label: "Dantroleno", detail: "2.5 mg/kg IV en bolo, repetir c/5 min hasta control (frecuente > 10 mg/kg total). Reconstituir con agua estéril; movilizar personal para diluir viales." },
      { label: "Enfriar", detail: "Enfriamiento activo si T > 39 °C (líquidos fríos, superficie, lavados). Suspender al llegar a ≈ 38 °C para evitar hipotermia." },
      { label: "Corregir", detail: "Acidosis (bicarbonato), hiperkalemia (Ca²⁺, insulina-glucosa, salbutamol), arritmias (evitar bloqueadores de canales de Ca)." },
      { label: "Monitorizar y llamar", detail: "Diuresis (rabdomiólisis), CK, gases seriados. Llamar a la línea de emergencia de HM (MHAUS). UCI ≥ 24 h por riesgo de recrudescencia." },
    ],
    source: "MHAUS. Emergency Therapy for MH · Glahn KPE, et al. Br J Anaesth 2010;105:417-420.",
  },
  {
    id: "paro",
    title: "Paro perioperatorio (ACLS + Hs y Ts)",
    accent: "var(--red)",
    href: "/guias/paro-perioperatorio",
    steps: [
      { label: "Declarar paro y comprimir", detail: "Sin pulso = paro. RCP de alta calidad YA: 100-120/min, 5-6 cm, reexpansión completa, fracción de compresión > 60%. Relevo del compresor c/2 min." },
      { label: "O₂ 100% y avisar al cirujano", detail: "FiO₂ 1.0, cerrar volátiles, verificar circuito/capnografía. El cirujano detiene/controla la causa (sangrado, compresión, insuflación)." },
      { label: "Ritmo", detail: "Desfibrilable (FV/TVsp): descarga 200 J bifásico → RCP 2 min → repetir. No desfibrilable (AESP/asistolia): RCP + adrenalina precoz." },
      { label: "Fármacos", detail: "Adrenalina 1 mg IV c/3-5 min (no desfibrilable: cuanto antes; desfibrilable: tras 2ª descarga). Amiodarona 300 → 150 mg en FV/TVsp refractaria." },
      { label: "Hs", detail: "Hipoxia · Hipovolemia · Hidrogeniones (acidosis) · Hipo/hiperkalemia · Hipotermia." },
      { label: "Ts", detail: "Neumotórax a Tensión · Taponamiento · Toxinas (LAST/anestésico) · Trombosis pulmonar · Trombosis coronaria. + causas de quirófano: anafilaxia, HM, embolia gaseosa, hemorragia, bloqueo neuroaxial alto, auto-PEEP." },
    ],
    source: "Panchal AR, et al. 2020 AHA Guidelines · Moitra VK, et al. Anesth Analg 2018;126:876.",
  },
  {
    id: "rsi",
    title: "RSI — inducción de secuencia rápida",
    accent: "var(--cyan)",
    href: "/algoritmos/rsi",
    steps: [
      { label: "Preparar (7 P)", detail: "Preoxigenar, aspiración, monitor, 2 vías IV, plan A/B/C de vía aérea, fármacos rotulados, camilla/posición óptima. Verbaliza el plan de rescate." },
      { label: "Preoxigenar", detail: "O₂ 100% ≥ 3 min (o 8 respiraciones a capacidad vital). Considerar oxigenación apneica por cánula nasal 15 L/min." },
      { label: "Pretratamiento / optimizar", detail: "Optimizar hemodinamia antes de inducir (fluidos/vasopresor si shock — el push-dose de fenilefrina/adrenalina a mano)." },
      { label: "Inducción + parálisis", detail: "Hipnótico (propofol 1.5-2.5, ketamina 1-2 o etomidato 0.3 mg/kg) + relajante en rápida sucesión: succinilcolina 1-1.5 mg/kg o rocuronio 1.2 mg/kg." },
      { label: "Posicionar e intubar", detail: "Laringoscopia al lograr parálisis (≈ 45-60 s). Confirmar con capnografía (EtCO₂) + auscultación. Presión cricoidea según práctica local." },
      { label: "Postintubación", detail: "Fijar tubo, ajustar ventilador, sedoanalgesia. Rescate con sugammadex 16 mg/kg si falla la vía aérea tras rocuronio y el paciente lo permite." },
    ],
    source: "DEC · algoritmo RSI (secuencia rápida).",
  },
];

// ------------------------------------------------------------
// Presets rápidos de peso (kg) para cuando no hay paciente activo
// ------------------------------------------------------------
const WEIGHT_PRESETS = [10, 20, 30, 50, 70, 90];

// ------------------------------------------------------------
// Timer de código — recordatorio de adrenalina a los 3 min
// ------------------------------------------------------------
const EPI_INTERVAL_S = 180; // 3 minutos

function fmtClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ============================================================
// Componente
// ============================================================
export default function CodigoClient({ isPro = false }: { isPro?: boolean }) {
  const { active } = usePatient();
  const patientWeight = active.weightKg && active.weightKg > 0 ? active.weightKg : null;

  // Override local: si el usuario elige un preset o teclea, manda sobre el
  // paciente. null = usar el peso del paciente activo.
  const [overrideKg, setOverrideKg] = useState<number | null>(null);
  const [manualText, setManualText] = useState("");

  const effectiveWeight = overrideKg ?? patientWeight;

  // Detalle de fármaco (modal-lite en línea).
  const [openDrug, setOpenDrug] = useState<{ cat: number; idx: number } | null>(null);
  // Protocolo abierto (acordeón — uno a la vez).
  const [openProto, setOpenProto] = useState<string | null>(null);

  function selectPreset(kg: number) {
    setOverrideKg(kg);
    setManualText("");
  }
  function useActivePatient() {
    setOverrideKg(null);
    setManualText("");
  }
  function onManualChange(text: string) {
    setManualText(text);
    const n = Number(text.replace(",", "."));
    setOverrideKg(text.trim() !== "" && !Number.isNaN(n) && n > 0 ? n : null);
  }

  const selectedDrug =
    openDrug != null ? CATEGORIES[openDrug.cat].drugs[openDrug.idx] : null;

  return (
    <ProGateClient feature={PRO_FEATURES.CODE_BLUE} isPro={isPro}>
      <ClinicalConsentGate />
      <div style={{ paddingBottom: "3rem" }}>
      {/* Barra superior compacta */}
      <div
        className="wrap"
        style={{ paddingTop: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", flexWrap: "wrap" }}>
          <span
            className="mono"
            style={{ color: "var(--red)", fontSize: "0.9rem", fontWeight: 800, letterSpacing: "0.12em" }}
          >
            ● CÓDIGO AZUL
          </span>
          <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.66rem" }}>
            modo quirófano · dosis de crisis por peso
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          <span className="tag tag-muted">AHA 2020</span>
          <span className="tag tag-muted">ASRA</span>
          <span className="tag tag-muted">MHAUS</span>
          <span className="tag tag-muted">BJA/AAGBI</span>
        </div>
      </div>

      {/* Panel superior: peso + timer, sticky para tenerlos siempre a la vista */}
      <div
        style={{
          position: "sticky",
          top: 44, // altura del navbar (h-11)
          zIndex: 20,
          background: "var(--bg-0)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
        }}
      >
        <div
          className="wrap"
          style={{ padding: "0.75rem 1rem", display: "grid", gap: "0.75rem", gridTemplateColumns: "1fr", alignItems: "stretch" }}
        >
          <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "minmax(0,1fr) auto", alignItems: "stretch" }} className="codigo-topgrid">
            <WeightPanel
              patientWeight={patientWeight}
              effectiveWeight={effectiveWeight}
              usingOverride={overrideKg != null}
              manualText={manualText}
              onManualChange={onManualChange}
              onPreset={selectPreset}
              onUsePatient={useActivePatient}
              patientLabel={active.label}
            />
            <CodeTimer />
          </div>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: "1.25rem" }}>
        {effectiveWeight == null && (
          <div
            className="panel"
            style={{ borderLeft: "3px solid var(--amber)", margin: "0 0 1.25rem" }}
          >
            <div className="panel-body" style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
              <span style={{ color: "var(--amber)", fontSize: "0.95rem", flexShrink: 0 }}>⚠</span>
              <div style={{ color: "var(--text-1)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                Sin peso: elige un <b>preset</b> o teclea el peso arriba para calcular las dosis.
                Mientras tanto se muestra la <b>dosis de adulto / mg/kg</b> de referencia.
              </div>
            </div>
          </div>
        )}

        {/* ─── Dosis de emergencia por peso ─── */}
        <SectionTitle label="dosis de crisis" hint="toca una tarjeta para el detalle" />
        <div style={{ display: "grid", gap: "1.25rem" }}>
          {CATEGORIES.map((cat, ci) => (
            <div key={cat.title}>
              <div
                className="mono"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: cat.accent,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "0.5rem",
                }}
              >
                <span style={{ width: 8, height: 8, background: cat.accent, borderRadius: "50%", display: "inline-block" }} />
                {cat.title}
              </div>
              <div className="codigo-drug-grid">
                {cat.drugs.map((drug, di) => (
                  <DrugCard
                    key={drug.name}
                    drug={drug}
                    weightKg={effectiveWeight}
                    accent={cat.accent}
                    onOpen={() => setOpenDrug({ cat: ci, idx: di })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ─── Protocolos en pasos ─── */}
        <div style={{ marginTop: "2.5rem" }}>
          <SectionTitle label="protocolos de crisis" hint="pasos numerados · toca para expandir" />
          <div style={{ display: "grid", gap: "1px", background: "var(--border)", border: "1px solid var(--border)" }}>
            {PROTOCOLS.map((p) => (
              <ProtocolItem
                key={p.id}
                proto={p}
                open={openProto === p.id}
                onToggle={() => setOpenProto((cur) => (cur === p.id ? null : p.id))}
              />
            ))}
          </div>
        </div>

        {/* Disclaimer sobrio (sin humor negro — es una crisis) */}
        <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
          <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem", lineHeight: 1.8, opacity: 0.85 }}>
            Dosis de literatura aceptada (AHA 2020 · ASRA · MHAUS · BJA/AAGBI). Ayuda cognitiva de apoyo:
            no sustituye ACLS certificado, monitorización, juicio clínico ni el protocolo institucional.
            Verifica dosis, dilución y vía antes de administrar — el peso escala las dosis por kg y aplica
            los topes máximos, pero la responsabilidad de cada dosis es del clínico que la administra.
          </p>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <Link href="/guias/paro-perioperatorio" className="btn btn-outline btn-sm">paro perioperatorio →</Link>
            <Link href="/algoritmos" className="btn btn-outline btn-sm">algoritmos de crisis →</Link>
          </div>
        </footer>
      </div>

      {/* Detalle de fármaco (overlay) */}
      {selectedDrug && openDrug && (
        <DrugDetailOverlay
          drug={selectedDrug}
          weightKg={effectiveWeight}
          accent={CATEGORIES[openDrug.cat].accent}
          onClose={() => setOpenDrug(null)}
        />
      )}

      {/* Estilos locales (responsive grid + tamaños grandes) */}
      <style jsx>{`
        .codigo-drug-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 0.6rem;
        }
        .codigo-topgrid {
          grid-template-columns: minmax(0, 1fr) auto;
        }
        @media (max-width: 720px) {
          .codigo-topgrid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      </div>
    </ProGateClient>
  );
}

// ------------------------------------------------------------
// Título de sección
// ------------------------------------------------------------
function SectionTitle({ label, hint }: { label: string; hint: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", marginBottom: "0.9rem", flexWrap: "wrap" }}>
      <span className="mono" style={{ color: "var(--accent)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
        ▸ {label}
      </span>
      <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>
        {hint}
      </span>
    </div>
  );
}

// ------------------------------------------------------------
// Panel de peso
// ------------------------------------------------------------
function WeightPanel({
  patientWeight,
  effectiveWeight,
  usingOverride,
  manualText,
  onManualChange,
  onPreset,
  onUsePatient,
  patientLabel,
}: {
  patientWeight: number | null;
  effectiveWeight: number | null;
  usingOverride: boolean;
  manualText: string;
  onManualChange: (t: string) => void;
  onPreset: (kg: number) => void;
  onUsePatient: () => void;
  patientLabel: string;
}) {
  const sourceLabel = usingOverride
    ? "manual"
    : patientWeight != null
      ? `paciente · ${patientLabel}`
      : "sin peso";

  return (
    <div
      className="panel"
      style={{ background: "var(--bg-2)", display: "flex", flexDirection: "column", gap: "0.6rem", padding: "0.75rem 0.85rem" }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
          <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            peso
          </span>
          <span
            className="mono"
            style={{
              color: effectiveWeight != null ? "var(--accent)" : "var(--text-3)",
              fontSize: "2.2rem",
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {effectiveWeight != null ? trimNumber(Math.round(effectiveWeight * 10) / 10) : "—"}
          </span>
          <span className="mono" style={{ color: "var(--text-2)", fontSize: "0.9rem", fontWeight: 700 }}>
            kg
          </span>
        </div>
        <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.58rem" }}>
          fuente: {sourceLabel}
        </span>
      </div>

      {/* Presets rápidos + input */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
        {WEIGHT_PRESETS.map((kg) => {
          const activePreset = usingOverride && effectiveWeight === kg && manualText === "";
          return (
            <button
              key={kg}
              onClick={() => onPreset(kg)}
              className="mono"
              style={{
                minWidth: 44,
                minHeight: 40,
                padding: "0.4rem 0.6rem",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: "pointer",
                background: activePreset ? "var(--accent)" : "var(--bg-1)",
                color: activePreset ? "#000" : "var(--text-1)",
                border: `1px solid ${activePreset ? "var(--accent)" : "var(--border-hi)"}`,
              }}
            >
              {kg}
            </button>
          );
        })}
        <input
          inputMode="decimal"
          value={manualText}
          onChange={(e) => onManualChange(e.target.value)}
          placeholder="kg…"
          aria-label="Peso manual en kg"
          className="mono"
          style={{
            width: 80,
            minHeight: 40,
            background: "var(--bg-1)",
            border: "1px solid var(--border-hi)",
            color: "var(--text-0)",
            padding: "0.4rem 0.6rem",
            fontSize: "0.9rem",
            fontWeight: 700,
          }}
        />
        {usingOverride && patientWeight != null && (
          <button
            onClick={onUsePatient}
            className="mono"
            style={{
              minHeight: 40,
              padding: "0.4rem 0.6rem",
              fontSize: "0.62rem",
              cursor: "pointer",
              background: "transparent",
              color: "var(--cyan)",
              border: "1px solid var(--border-hi)",
            }}
          >
            ← usar paciente ({trimNumber(patientWeight)} kg)
          </button>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Timer de código
// ------------------------------------------------------------
function CodeTimer() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // segundos totales de código
  const [lastEpiAt, setLastEpiAt] = useState<number | null>(null); // elapsed s en la última adrenalina
  const [epiCount, setEpiCount] = useState(0);
  const startRef = useRef<number | null>(null);
  const baseRef = useRef(0);

  // Tick con requestAnimationFrame-lite (setInterval a 250 ms es suficiente).
  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now();
    const id = setInterval(() => {
      if (startRef.current != null) {
        const delta = Math.floor((Date.now() - startRef.current) / 1000);
        setElapsed(baseRef.current + delta);
      }
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  function toggle() {
    if (running) {
      // pausar: fija la base acumulada
      baseRef.current = elapsed;
      setRunning(false);
    } else {
      baseRef.current = elapsed;
      setRunning(true);
    }
  }
  function reset() {
    setRunning(false);
    setElapsed(0);
    setLastEpiAt(null);
    setEpiCount(0);
    baseRef.current = 0;
    startRef.current = null;
  }
  function markEpi() {
    setLastEpiAt(elapsed);
    setEpiCount((c) => c + 1);
    if (!running) {
      // marcar adrenalina inicia el reloj si estaba parado (arranca el código)
      baseRef.current = elapsed;
      setRunning(true);
    }
  }

  const sinceEpi = lastEpiAt != null ? elapsed - lastEpiAt : null;
  const epiDue = sinceEpi != null && sinceEpi >= EPI_INTERVAL_S;
  const epiRemaining = sinceEpi != null ? Math.max(0, EPI_INTERVAL_S - sinceEpi) : null;

  const epiColor = lastEpiAt == null ? "var(--text-3)" : epiDue ? "var(--red)" : "var(--accent)";

  return (
    <div
      className="panel"
      style={{
        background: "var(--bg-2)",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        padding: "0.75rem 0.85rem",
        minWidth: 210,
        borderLeft: epiDue ? "3px solid var(--red)" : "1px solid var(--border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.5rem" }}>
        <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          timer de código
        </span>
        <span className="mono" style={{ color: running ? "var(--accent)" : "var(--text-3)", fontSize: "0.58rem" }}>
          {running ? "● corriendo" : "‖ pausado"}
        </span>
      </div>

      <div
        className="mono"
        style={{
          fontSize: "2.4rem",
          fontWeight: 800,
          lineHeight: 1,
          color: "var(--text-0)",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.02em",
        }}
      >
        {fmtClock(elapsed)}
      </div>

      {/* Estado de adrenalina */}
      <div
        className="mono"
        style={{
          fontSize: "0.66rem",
          color: epiColor,
          fontWeight: epiDue ? 800 : 600,
          lineHeight: 1.4,
          minHeight: "2.4em",
        }}
      >
        {lastEpiAt == null ? (
          <span>adrenalina: no administrada</span>
        ) : epiDue ? (
          <span>⚠ ADRENALINA DEBIDA · {fmtClock(sinceEpi ?? 0)} desde la última (#{epiCount})</span>
        ) : (
          <span>
            adrenalina #{epiCount} · próxima en {fmtClock(epiRemaining ?? 0)}
          </span>
        )}
      </div>

      {/* Controles grandes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
        <button
          onClick={markEpi}
          className="mono"
          style={{
            gridColumn: "1 / -1",
            minHeight: 48,
            fontSize: "0.82rem",
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            cursor: "pointer",
            background: epiDue ? "var(--red)" : "var(--bg-3)",
            color: epiDue ? "#fff" : "var(--red)",
            border: `1px solid var(--red)`,
          }}
        >
          + adrenalina
        </button>
        <button
          onClick={toggle}
          className="mono"
          style={{
            minHeight: 40,
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            cursor: "pointer",
            background: "var(--bg-1)",
            color: "var(--text-1)",
            border: "1px solid var(--border-hi)",
          }}
        >
          {running ? "‖ pausa" : "▸ iniciar"}
        </button>
        <button
          onClick={reset}
          className="mono"
          style={{
            minHeight: 40,
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            cursor: "pointer",
            background: "var(--bg-1)",
            color: "var(--text-2)",
            border: "1px solid var(--border-hi)",
          }}
        >
          ↺ reset
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Tarjeta de fármaco (grande, dosis calculada al centro)
// ------------------------------------------------------------
function DrugCard({
  drug,
  weightKg,
  accent,
  onOpen,
}: {
  drug: EmergencyDrug;
  weightKg: number | null;
  accent: string;
  onOpen: () => void;
}) {
  const dose = weightKg != null ? computedDose(drug, weightKg) : (drug.perKg != null ? `${drug.perKg} ${drug.unit}/kg` : drug.adultDose);
  const isPerKg = drug.perKg != null;

  return (
    <button
      onClick={onOpen}
      className="card-interactive"
      style={{
        textAlign: "left",
        cursor: "pointer",
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderTop: `2px solid ${accent}`,
        padding: "0.7rem 0.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.35rem",
        minHeight: 120,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.4rem" }}>
        <span style={{ color: "var(--text-0)", fontSize: "0.92rem", fontWeight: 700, lineHeight: 1.15 }}>
          {drug.name}
        </span>
        <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", flexShrink: 0 }}>
          {drug.route}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem", flexWrap: "wrap" }}>
        <span
          className="mono"
          style={{
            color: weightKg != null || !isPerKg ? "var(--accent)" : "var(--text-2)",
            fontSize: "1.75rem",
            fontWeight: 800,
            lineHeight: 1.05,
            textShadow: weightKg != null ? "0 0 24px var(--accent-glow)" : "none",
          }}
        >
          {dose}
        </span>
      </div>

      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.4rem" }}>
        <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.58rem" }}>
          {drug.indication}
        </span>
        {isPerKg && (
          <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", opacity: 0.8 }}>
            {drug.perKg} {drug.unit}/kg{drug.maxDose != null ? ` · máx ${trimNumber(drug.maxDose)} ${drug.unit}` : ""}
          </span>
        )}
      </div>
    </button>
  );
}

// ------------------------------------------------------------
// Overlay de detalle de fármaco
// ------------------------------------------------------------
function DrugDetailOverlay({
  drug,
  weightKg,
  accent,
  onClose,
}: {
  drug: EmergencyDrug;
  weightKg: number | null;
  accent: string;
  onClose: () => void;
}) {
  // Cerrar con Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const dose = weightKg != null ? computedDose(drug, weightKg) : drug.adultDose;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de ${drug.name}`}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="panel fade-up"
        style={{
          background: "var(--bg-2)",
          borderTop: `3px solid ${accent}`,
          maxWidth: 520,
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <div className="panel-header" style={{ justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="dot" style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} />
            {drug.name}
          </span>
          <button
            onClick={onClose}
            className="mono"
            aria-label="Cerrar"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-2)", fontSize: "0.8rem", padding: "0.2rem 0.4rem" }}
          >
            [×]
          </button>
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.9rem" }}>
          {/* Dosis grande */}
          <div>
            <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.2rem" }}>
              dosis {weightKg != null ? `para ${trimNumber(weightKg)} kg` : "(adulto de referencia)"}
            </div>
            <div className="mono" style={{ color: "var(--accent)", fontSize: "2.4rem", fontWeight: 800, lineHeight: 1.05, textShadow: "0 0 30px var(--accent-glow)" }}>
              {dose}
            </div>
          </div>

          {/* Detalles en filas */}
          <div className="info-grid" style={{ gridTemplateColumns: "1fr" }}>
            <div>
              <span className="mono" style={{ color: "var(--text-2)", fontSize: "0.62rem", textTransform: "uppercase" }}>vía</span>
              <span style={{ color: "var(--text-0)", fontWeight: 600 }}>{drug.route}</span>
            </div>
            <div>
              <span className="mono" style={{ color: "var(--text-2)", fontSize: "0.62rem", textTransform: "uppercase" }}>indicación</span>
              <span style={{ color: "var(--text-0)", fontWeight: 600 }}>{drug.indication}</span>
            </div>
            {drug.perKg != null && (
              <div>
                <span className="mono" style={{ color: "var(--text-2)", fontSize: "0.62rem", textTransform: "uppercase" }}>por kg</span>
                <span style={{ color: "var(--text-0)", fontWeight: 600 }}>
                  {drug.perKg} {drug.unit}/kg{drug.maxDose != null ? ` · máx ${trimNumber(drug.maxDose)} ${drug.unit}` : ""}
                </span>
              </div>
            )}
            <div>
              <span className="mono" style={{ color: "var(--text-2)", fontSize: "0.62rem", textTransform: "uppercase" }}>adulto</span>
              <span style={{ color: "var(--text-0)", fontWeight: 600 }}>{drug.adultDose}</span>
            </div>
          </div>

          {/* Nota */}
          <div style={{ borderLeft: `3px solid ${accent}`, paddingLeft: "0.75rem" }}>
            <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
              nota
            </div>
            <p style={{ color: "var(--text-1)", fontSize: "0.82rem", lineHeight: 1.6 }}>{drug.note}</p>
          </div>

          {/* Reconstitución (si aplica) */}
          {drug.recon && (
            <div style={{ borderLeft: "3px solid var(--cyan)", paddingLeft: "0.75rem" }}>
              <div className="mono" style={{ color: "var(--cyan)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
                reconstitución / dilución
              </div>
              <p style={{ color: "var(--text-1)", fontSize: "0.82rem", lineHeight: 1.6 }}>{drug.recon}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Item de protocolo (acordeón, pasos numerados grandes)
// ------------------------------------------------------------
function ProtocolItem({
  proto,
  open,
  onToggle,
}: {
  proto: Protocol;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ background: "var(--bg-2)" }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="mono"
        style={{
          width: "100%",
          textAlign: "left",
          cursor: "pointer",
          background: "transparent",
          border: "none",
          borderLeft: `3px solid ${proto.accent}`,
          padding: "0.85rem 0.85rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.6rem",
        }}
      >
        <span style={{ color: "var(--text-0)", fontSize: "0.92rem", fontWeight: 700, letterSpacing: "0.01em" }}>
          {proto.title}
        </span>
        <span style={{ color: proto.accent, fontSize: "0.9rem", flexShrink: 0 }}>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="fade-in" style={{ padding: "0 0.85rem 1rem", display: "grid", gap: "0.55rem" }}>
          {proto.steps.map((s, i) => (
            <div
              key={i}
              style={{ display: "flex", gap: "0.65rem", alignItems: "flex-start", paddingTop: "0.55rem", borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
            >
              <span
                className="mono"
                style={{
                  flexShrink: 0,
                  width: 26,
                  height: 26,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: proto.accent,
                  color: "#000",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                }}
              >
                {i + 1}
              </span>
              <div>
                <div style={{ color: "var(--text-0)", fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.3, marginBottom: "0.15rem" }}>
                  {s.label}
                </div>
                <div style={{ color: "var(--text-1)", fontSize: "0.8rem", lineHeight: 1.55 }}>{s.detail}</div>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginTop: "0.4rem", flexWrap: "wrap" }}>
            <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.58rem", lineHeight: 1.5 }}>
              {proto.source}
            </span>
            <Link href={proto.href} className="mono" style={{ color: proto.accent, fontSize: "0.62rem", textDecoration: "none", whiteSpace: "nowrap" }}>
              ver guía completa →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
