// ============================================================
// Equianalgesia de opioides — Server entry (SEO metadata)
// La calculadora es interactiva; la lógica vive en el Client
// Component colocado (EquianalgesiaClient). Aquí sólo exportamos
// metadata para SEO y renderizamos el cliente.
// ============================================================

import type { Metadata } from "next";
import EquianalgesiaClient from "./EquianalgesiaClient";

export const metadata: Metadata = {
  title:
    "Equianalgesia de opioides — conversión de dosis — DEC",
  description:
    "Calculadora de conversión equianalgésica de opioides (morfina, hidromorfona, oxicodona, fentanilo, oxímorfona, codeína, tramadol). Ajuste por tolerancia cruzada incompleta y advertencias de metadona. Ratios de literatura aceptada (UpToDate, Faculty of Pain Medicine).",
  openGraph: {
    title: "Equianalgesia de opioides — conversión de dosis",
    description:
      "Convierte entre opioides y vías con ratios equianalgésicos y reducción por tolerancia cruzada incompleta. La metadona no es lineal.",
    type: "website",
  },
};

export default function OpioidesEquianalgesiaPage() {
  return <EquianalgesiaClient />;
}
