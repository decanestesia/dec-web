// ============================================================
// Anestésicos locales — dosis máxima por peso (prevención LAST)
// Server entry (SEO metadata). La calculadora es interactiva,
// así que la lógica vive en el Client Component colocado
// (AnestesicosLocalesClient).
// ============================================================

import type { Metadata } from "next";
import AnestesicosLocalesClient from "./AnestesicosLocalesClient";

export const metadata: Metadata = {
  title:
    "Anestésicos locales — dosis máxima por peso (LAST) — DEC",
  description:
    "Calculadora de dosis máxima de anestésicos locales por peso para prevención de toxicidad sistémica (LAST): mg máximos y volumen (mL) por concentración. Lidocaína, bupivacaína, ropivacaína, mepivacaína, prilocaína — con y sin epinefrina. Reconocimiento de LAST y rescate con emulsión lipídica 20% (ASRA 2020).",
  openGraph: {
    title:
      "Anestésicos locales — dosis máxima por peso (prevención de LAST)",
    description:
      "mg máximos y volumen (mL) por concentración. Reconocimiento de LAST + emulsión lipídica 20% (ASRA 2020).",
    type: "website",
  },
};

export default function AnestesicosLocalesPage() {
  return <AnestesicosLocalesClient />;
}
