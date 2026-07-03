// ============================================================
// Índice ROX — Server entry (SEO metadata)
// La calculadora es interactiva, así que la lógica vive en el
// Client Component colocado (RoxClient). Aquí solo exportamos
// metadata para SEO y renderizamos el cliente.
// ============================================================

import type { Metadata } from "next";
import RoxClient from "./RoxClient";

export const metadata: Metadata = {
  title: "Índice ROX — predicción de fracaso de CNAF/HFNC — DEC",
  description:
    "Calculadora del índice ROX = (SpO2/FiO2)/FR para estratificar el riesgo de intubación en pacientes con cánula nasal de alto flujo. Umbrales a 2, 6 y 12 h (Roca et al. 2016, 2019).",
  openGraph: {
    title: "Índice ROX — predicción de fracaso de CNAF/HFNC",
    description:
      "ROX = (SpO2/FiO2)/FR. Estratifica riesgo de intubación en oxigenoterapia nasal de alto flujo.",
    type: "website",
  },
};

export default function RoxPage() {
  return <RoxClient />;
}
