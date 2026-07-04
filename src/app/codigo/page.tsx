// ============================================================
// MODO QUIRÓFANO / CÓDIGO AZUL — pantalla de emergencia glanceable.
// Server entry (SEO metadata). Toda la interacción (peso, dosis
// calculadas por kg, protocolos, timer de código) vive en el
// Client Component colocado (CodigoClient), que lee el PESO del
// paciente activo vía usePatient().
//
// EXACTITUD CLÍNICA: el set y los valores de dosis clonan
// EmergencyDrugData.swift (DEC Watch App) — literatura aceptada
// (ACLS/PALS AHA 2020, guías de anafilaxia BJA/AAGBI, ASRA LAST,
// MHAUS). Ningún valor inventado.
// ============================================================

import type { Metadata } from "next";
import CodigoClient from "./CodigoClient";

export const metadata: Metadata = {
  title: "Modo Quirófano / Código Azul — dosis de crisis por peso · DEC",
  description:
    "Pantalla de emergencia para el quirófano: dosis de crisis escaladas por peso (paro/ACLS, vía aérea/RSI, anafilaxia, toxicidad/LAST/HM) calculadas al instante desde el peso del paciente, protocolos en pasos (LAST, anafilaxia, hipertermia maligna, paro perioperatorio, RSI) y timer de código con recordatorio de adrenalina a los 3 min. Dosis de literatura aceptada (AHA 2020, ASRA, MHAUS, BJA/AAGBI).",
  openGraph: {
    title: "Modo Quirófano / Código Azul — DEC",
    description:
      "Dosis de crisis por peso, protocolos en pasos y timer de código para leer a distancia en la tablet del quirófano. AHA 2020 · ASRA · MHAUS.",
    type: "website",
  },
};

export default function CodigoPage() {
  return <CodigoClient />;
}
