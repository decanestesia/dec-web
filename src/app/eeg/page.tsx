// ============================================================
// Firmas EEG en el DSA — Server entry (SEO metadata)
// El explorador es interactivo (selector de fármaco + espectro-
// grama SVG), así que la lógica vive en el Client Component
// colocado (EegDsaClient). Aquí solo exportamos metadata SEO.
// ============================================================

import type { Metadata } from "next";
import EegDsaClient from "./EegDsaClient";

export const metadata: Metadata = {
  title: "Firmas EEG en el DSA — anestésicos — DEC",
  description:
    "Explorador de las firmas del EEG procesado / Density Spectral Array (espectrograma) por anestésico: propofol, halogenados, ketamina, dexmedetomidina, óxido nitroso, opioides, benzodiacepinas y barbitúricos. Patrones, bandas dominantes y uso para monitorizar profundidad anestésica (Purdon et al. Anesthesiology 2015).",
  openGraph: {
    title: "Firmas EEG en el DSA — anestésicos",
    description:
      "Espectrograma característico por anestésico (alfa frontal, husos, gamma, burst suppression) para lectura de profundidad anestésica.",
    type: "website",
  },
};

export default function EegPage() {
  return <EegDsaClient />;
}
