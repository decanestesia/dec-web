// src/app/interacciones/layout.tsx
//
// /interacciones es Client Component (verificador con estado). Este layout
// server-side aporta el SEO de la sección.

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Interacciones farmacológicas",
  description:
    "Verificador de interacciones entre fármacos anestésicos y de cuidados críticos: severidad, mecanismo y manejo. Antes de mezclar, pregunta.",
  openGraph: {
    title: "Interacciones farmacológicas | DEC Anestesia",
    description:
      "Verificador multi-fármaco: interacciones por severidad, mecanismo y recomendación de manejo.",
    url: "https://decanestesia.com/interacciones",
  },
};

export default function InteraccionesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
