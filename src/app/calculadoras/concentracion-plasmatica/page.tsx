import type { Metadata } from "next";
import ConcentracionPlasmaticaClient from "./Client";

export const metadata: Metadata = {
  title: "Estimador de concentración plasmática — DEC",
  description:
    "Estimación farmacocinética poblacional de la concentración plasmática (Cp) tras bolo IV o infusión para fentanilo, propofol, remifentanilo y midazolam. Modelo bicompartimental. No es un TCI.",
  openGraph: {
    title: "Estimador de concentración plasmática — DEC",
    description:
      "Estimación PK poblacional de Cp tras bolo IV o infusión. Parámetros de Shafer, Marsh, Minto. No sustituye monitorización.",
    type: "website",
  },
};

export default function Page() {
  return <ConcentracionPlasmaticaClient />;
}
