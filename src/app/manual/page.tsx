import type { Metadata } from "next";
import { ManualClient } from "./ManualClient";

export const metadata: Metadata = {
  title: "Manual del sistema — índice vivo de DEC",
  description:
    "Manual e índice vivo de DEC: todas las secciones del sistema (crisis, fármacos, interacciones, calculadoras, TCI/TIVA, guías, algoritmos, valoración y EEG) con qué hace cada una, sus fuentes y plataformas. Se genera automáticamente del registro central.",
  robots: { index: true, follow: true },
};

export default function ManualPage() {
  return <ManualClient />;
}
