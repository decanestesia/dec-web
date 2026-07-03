// ============================================================
// Hipertermia maligna — Server entry (SEO metadata)
// La guía incluye una mini-calculadora interactiva de dosis de
// dantroleno por peso, por lo que la lógica vive en el Client
// Component colocado (HipertermiaMalignaClient). Aquí sólo
// exportamos metadata para SEO y renderizamos el cliente.
// ============================================================

import type { Metadata } from "next";
import HipertermiaMalignaClient from "./HipertermiaMalignaClient";

export const metadata: Metadata = {
  title: "Hipertermia maligna — protocolo de emergencia — DEC",
  description:
    "Referencia de emergencia para hipertermia maligna perioperatoria: reconocimiento (hipercapnia inexplicada, rigidez, taquicardia, hipertermia tardía), manejo paso a paso, dosis de dantroleno por peso (2.5 mg/kg IV, repetible hasta ≥ 10 mg/kg), enfriamiento, hiperpotasemia, arritmias, acidosis y diuresis. Línea directa MHAUS. Fuentes: MHAUS, Miller.",
  openGraph: {
    title: "Hipertermia maligna — protocolo de emergencia",
    description:
      "Reconocimiento, manejo paso a paso y dosis de dantroleno por peso. Mini-calculadora de bolo/viales. MHAUS, Miller.",
    type: "article",
  },
};

export default function HipertermiaMalignaPage() {
  return <HipertermiaMalignaClient />;
}
