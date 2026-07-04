// ============================================================
// Aclaramiento de creatinina (Cockcroft-Gault) — Server entry (SEO)
// La calculadora es interactiva; la lógica vive en el Client
// Component colocado (CrClClient). Aquí solo exportamos metadata.
// ============================================================

import type { Metadata } from "next";
import CrClClient from "./CrClClient";

export const metadata: Metadata = {
  title: "Aclaramiento de creatinina (Cockcroft-Gault) — DEC",
  description:
    "Calculadora de aclaramiento de creatinina por Cockcroft-Gault: CrCl = (140 − edad) × peso × (0.85 si mujer) / (72 × Cr). Estadio KDIGO e implicaciones de ajuste de dosis renal (gabapentina, morfina, HBPM, sugammadex). Cockcroft & Gault, Nephron 1976.",
  openGraph: {
    title: "Aclaramiento de creatinina (Cockcroft-Gault)",
    description:
      "CrCl por Cockcroft-Gault con estadio KDIGO e implicaciones perioperatorias de ajuste renal de dosis.",
    type: "website",
  },
};

export default function AclaramientoCreatininaPage() {
  return <CrClClient />;
}
