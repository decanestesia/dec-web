// src/app/farmacos/layout.tsx
//
// La página /farmacos es un Client Component (buscador con estado), así que no
// puede exportar `metadata`. Este layout server-side aporta el SEO del listado.
// Las fichas individuales (/farmacos/[slug]) tienen su propio generateMetadata.

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Catálogo de fármacos",
  description:
    "Base de datos clínica de fármacos anestésicos y de cuidados críticos: dosis, farmacología, presentaciones, marcas comerciales, advertencias FDA, embarazo e infusión. Navegable por categoría o buscador.",
  openGraph: {
    title: "Catálogo de fármacos | DEC Anestesia",
    description:
      "Fármacos anestésicos y de cuidados críticos con dosis, farmacología, presentaciones e infusión.",
    url: "https://decanestesia.com/farmacos",
  },
};

export default function FarmacosLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
