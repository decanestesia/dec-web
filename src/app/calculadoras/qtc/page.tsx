// ============================================================
// QTc y riesgo de torsades — Server entry (SEO metadata)
// La calculadora es interactiva → la lógica vive en el Client
// Component colocado (QtcClient). Aquí solo exportamos metadata
// para SEO y renderizamos el cliente.
// ============================================================

import type { Metadata } from "next";
import QtcClient from "./QtcClient";

export const metadata: Metadata = {
  title: "QTc y riesgo de torsades — corrección del QT (Bazett/Fridericia/Framingham) — DEC",
  description:
    "Calculadora del QT corregido por tres métodos (Bazett, Fridericia, Framingham) con categorización por sexo, umbral de alto riesgo de torsades (QTc >500 ms o ΔQTc >60 ms), fármacos perioperatorios que prolongan el QT y factores agravantes (hipoK/hipoMg/hipoCa).",
  openGraph: {
    title: "QTc y riesgo de torsades",
    description:
      "QTc por Bazett, Fridericia y Framingham. Umbrales por sexo, riesgo de torsades y fármacos anestésicos que prolongan el QT.",
    type: "website",
  },
};

export default function QtcPage() {
  return <QtcClient />;
}
