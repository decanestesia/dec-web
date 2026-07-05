// src/app/calculadora/layout.tsx
//
// /calculadora (calculadora de infusión) es Client Component. Este layout
// server-side aporta el SEO de la página.

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Calculadora de infusión",
  description:
    "Calculadora de infusión de fármacos: convierte entre dosis, ritmo (mL/h) y concentración según peso. Para vasoactivos, sedantes y analgésicos en perfusión continua.",
  openGraph: {
    title: "Calculadora de infusión | DEC Anestesia",
    description:
      "Convierte entre dosis, ritmo de infusión y concentración según peso del paciente.",
    url: "https://decanestesia.com/calculadora",
  },
};

export default function CalculadoraLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
