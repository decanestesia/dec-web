// ============================================================
// Valoración preanestésica — Server entry (SEO metadata)
// El formulario es interactivo (lee/escribe el paciente activo), así
// que la lógica vive en el Client Component colocado (ValoracionClient).
// Aquí solo exportamos metadata para SEO y renderizamos el cliente.
// ============================================================

import type { Metadata } from "next";
import ValoracionClient from "./ValoracionClient";

export const metadata: Metadata = {
  title: "Valoración preanestésica — hoja de riesgo perioperatorio — DEC",
  description:
    "Valoración preanestésica que auto-genera una hoja/reporte PDF con scores de riesgo (ASA, RCRI, STOP-BANG, Apfel, Cockcroft-Gault, MABL), comorbilidades, vía aérea y datos del paciente. Como una historia clínica sin escribirla.",
  openGraph: {
    title: "Valoración preanestésica — DEC",
    description:
      "Formulario que calcula ASA, RCRI, STOP-BANG, Apfel, CrCl y MABL en vivo y genera un PDF imprimible de valoración preanestésica.",
    type: "website",
  },
};

export default function ValoracionPage() {
  return <ValoracionClient />;
}
