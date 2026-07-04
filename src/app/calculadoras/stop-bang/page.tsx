// ============================================================
// STOP-BANG — Server entry (SEO metadata)
// Cribado de apnea obstructiva del sueño (AOS). La lógica vive
// en el Client Component colocado (StopBangClient). Aquí solo
// exportamos metadata para SEO y renderizamos el cliente.
// ============================================================

import type { Metadata } from "next";
import StopBangClient from "./StopBangClient";

export const metadata: Metadata = {
  title: "STOP-BANG — cribado de apnea obstructiva del sueño — DEC",
  description:
    "Cuestionario STOP-BANG (8 ítems, 1 punto c/u) para estratificar el riesgo de apnea obstructiva del sueño (AOS). 0-2 bajo, 3-4 intermedio, 5-8 alto. Implicaciones perioperatorias: opioides, monitorización, CPAP (Chung F, Anesthesiology 2008).",
  openGraph: {
    title: "STOP-BANG — cribado de apnea obstructiva del sueño",
    description:
      "8 ítems sí/no. ≥3 sensible para AOS. Estratifica riesgo e implicaciones perioperatorias.",
    type: "website",
  },
};

export default function StopBangPage() {
  return <StopBangClient />;
}
