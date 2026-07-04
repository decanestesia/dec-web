// ============================================================
// Reversión de bloqueo neuromuscular — Server entry (SEO metadata)
// La calculadora es interactiva; la lógica vive en el Client
// Component colocado (ReversionNMClient). Aquí solo exportamos
// metadata para SEO y renderizamos el cliente.
// ============================================================

import type { Metadata } from "next";
import ReversionNMClient from "./ReversionNMClient";

export const metadata: Metadata = {
  title: "Reversión de bloqueo neuromuscular — sugammadex / neostigmina — DEC",
  description:
    "Calculadora de reversión del bloqueo neuromuscular: elige reversor y dosis según profundidad (TOF/PTC). Sugammadex 2/4/16 mg/kg para aminoesteroideos (rocuronio/vecuronio); neostigmina 0.03–0.07 mg/kg (máx 5 mg) + anticolinérgico para bloqueo superficial-moderado.",
  openGraph: {
    title: "Reversión de bloqueo neuromuscular — sugammadex / neostigmina",
    description:
      "Reversor y dosis según profundidad del bloqueo (TOF/PTC). Sugammadex vs neostigmina, con volumen y anticolinérgico.",
    type: "website",
  },
};

export default function ReversionNMPage() {
  return <ReversionNMClient />;
}
