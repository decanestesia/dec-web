// ============================================================
// Riesgo cardíaco perioperatorio (RCRI + METs) — Server entry (SEO)
// La calculadora es interactiva; la lógica vive en el Client
// Component colocado (RiesgoCardiacoClient). Aquí solo metadata
// para SEO y render del cliente.
// ============================================================

import type { Metadata } from "next";
import RiesgoCardiacoClient from "./RiesgoCardiacoClient";

export const metadata: Metadata = {
  title: "Riesgo cardíaco perioperatorio (RCRI + METs) — DEC",
  description:
    "Calculadora del Índice de Lee revisado (RCRI): 6 factores para estimar el riesgo de evento cardíaco mayor en cirugía no cardíaca, con evaluación de capacidad funcional en METs (umbral <4). Lee TH, Circulation 1999; ACC/AHA 2014.",
  openGraph: {
    title: "Riesgo cardíaco perioperatorio (RCRI + METs)",
    description:
      "RCRI (Índice de Lee revisado) + capacidad funcional en METs. Estratifica el riesgo cardíaco en cirugía no cardíaca.",
    type: "website",
  },
};

export default function RiesgoCardiacoPage() {
  return <RiesgoCardiacoClient />;
}
