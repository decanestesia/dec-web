// ============================================================
// Pérdida sanguínea máxima permitida (MABL) — Server entry (SEO)
// La calculadora es interactiva; la lógica vive en el Client
// Component colocado (MablClient). Aquí solo metadata + render.
// ============================================================

import type { Metadata } from "next";
import MablClient from "./MablClient";

export const metadata: Metadata = {
  title: "Pérdida sanguínea máxima permitida (MABL) — DEC",
  description:
    "Calculadora de MABL = VSE × (Hct inicial − Hct mínimo) / Hct inicial. Estima el volumen sanguíneo (VSE) por peso y población, la pérdida sanguínea máxima permitida y la necesidad transfusional (Gross JB, Anesthesiology 1983).",
  openGraph: {
    title: "Pérdida sanguínea máxima permitida (MABL)",
    description:
      "MABL = VSE × (Hct inicial − Hct mínimo) / Hct inicial. VSE por peso y población; estima necesidad transfusional.",
    type: "website",
  },
};

export default function MablPage() {
  return <MablClient />;
}
