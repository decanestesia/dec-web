// ============================================================
// Fluidoterapia perioperatoria — Server entry (SEO metadata)
// La calculadora es interactiva; la lógica vive en el Client
// Component colocado (FluidoterapiaClient). Aquí solo exportamos
// metadata para SEO y renderizamos el cliente.
// ============================================================

import type { Metadata } from "next";
import FluidoterapiaClient from "./FluidoterapiaClient";

export const metadata: Metadata = {
  title: "Fluidoterapia perioperatoria — 4-2-1, déficit, trauma y Parkland — DEC",
  description:
    "Calculadora de fluidoterapia perioperatoria: mantenimiento 4-2-1 (Holliday-Segar), déficit por ayuno con reposición horaria, pérdidas por trauma quirúrgico y reanimación por quemadura (fórmula de Parkland/Baxter). Salidas etiquetadas y citadas.",
  openGraph: {
    title: "Fluidoterapia perioperatoria — 4-2-1, déficit, trauma y Parkland",
    description:
      "Mantenimiento 4-2-1, déficit por ayuno, pérdidas por trauma quirúrgico y Parkland para quemados. Herramienta clínica DEC.",
    type: "website",
  },
};

export default function FluidoterapiaPage() {
  return <FluidoterapiaClient />;
}
