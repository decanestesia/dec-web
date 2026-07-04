// ============================================================
// BÚSQUEDA POR SITUACIÓN — "¿qué hago si…?"
// Server entry (SEO). La búsqueda en vivo vive en SituacionClient.
//
// El contenido (pasos + dosis) resume guías/algoritmos/protocolos YA
// EXISTENTES del repo y enlaza a ellos; ninguna dosis inventada
// (ver src/lib/situaciones.ts, campo `fuente` de cada situación).
// ============================================================

import type { Metadata } from "next";
import SituacionClient from "./SituacionClient";

export const metadata: Metadata = {
  title: "Búsqueda por situación — ¿qué hago si…? · DEC",
  description:
    "Buscador de acción rápida para el quirófano: escribe la situación crítica (hipotensión, laringoespasmo, bradicardia, desaturación, broncoespasmo, anafilaxia, hemorragia, despertar intraoperatorio, hipertermia maligna, LAST, NVPO, delirio de emergencia) y obtén los pasos inmediatos, el fármaco de primera línea con su dosis y el enlace a la guía y a la ficha del fármaco. Dosis de literatura aceptada (AHA 2020, ASRA, MHAUS, AAGBI, SAMBA).",
  openGraph: {
    title: "Búsqueda por situación — ¿qué hago si…? · DEC",
    description:
      "Escribe la situación crítica del quirófano y obtén pasos inmediatos, fármaco de 1.ª línea con dosis y enlace a la guía completa. Dosis citadas, ninguna inventada.",
    type: "website",
  },
};

export default function SituacionPage() {
  return <SituacionClient />;
}
