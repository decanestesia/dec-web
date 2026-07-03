// ============================================================
// Score de Apfel — Server entry (SEO metadata)
// La calculadora es interactiva, así que la lógica vive en el
// Client Component colocado (ApfelClient). Aquí solo exportamos
// metadata para SEO y renderizamos el cliente.
// ============================================================

import type { Metadata } from "next";
import ApfelClient from "./ApfelClient";

export const metadata: Metadata = {
  title: "Score de Apfel — riesgo de NVPO (náusea y vómito postoperatorio) — DEC",
  description:
    "Calculadora del score simplificado de Apfel para estimar el riesgo de náusea y vómito postoperatorio (NVPO): sexo femenino, no fumador, antecedente de NVPO/cinetosis y opioides postoperatorios. Riesgo 0–4 puntos (~10–79 %) y estrategia de profilaxis (Apfel et al. Anesthesiology 1999).",
  openGraph: {
    title: "Score de Apfel — riesgo de NVPO",
    description:
      "4 factores, 0–4 puntos. Estima el riesgo de náusea y vómito postoperatorio y orienta la profilaxis antiemética.",
    type: "website",
  },
};

export default function ApfelPage() {
  return <ApfelClient />;
}
