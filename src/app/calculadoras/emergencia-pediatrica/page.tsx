// ============================================================
// Emergencia pediátrica — Server entry (SEO metadata)
// La tarjeta de dosis es interactiva → la lógica vive en el
// Client Component colocado (EmergenciaPediatricaClient). Aquí
// sólo exportamos metadata para SEO y renderizamos el cliente.
// ============================================================

import type { Metadata } from "next";
import EmergenciaPediatricaClient from "./EmergenciaPediatricaClient";

export const metadata: Metadata = {
  title:
    "Tarjeta de emergencia pediátrica — dosis de reanimación por peso — DEC",
  description:
    "Calculadora de dosis pediátricas de EMERGENCIA por peso (kg): adrenalina RCP, atropina, amiodarona, adenosina, desfibrilación, cardioversión, bolo de fluidos, glucosa, TET, energías y dosis de inducción. Basada en PALS (AHA 2020) y APLS. Estimación de peso APLS si no hay báscula.",
  openGraph: {
    title: "Tarjeta de emergencia pediátrica — dosis de reanimación por peso",
    description:
      "Dosis de paro/emergencia pediátrica por peso: adrenalina, atropina, amiodarona, adenosina, desfibrilación, cardioversión, fluidos, glucosa, TET y energías. PALS 2020 / APLS.",
    type: "website",
  },
};

export default function EmergenciaPediatricaPage() {
  return <EmergenciaPediatricaClient />;
}
