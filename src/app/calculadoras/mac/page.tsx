// ============================================================
// MAC — Concentración alveolar mínima — Server entry (SEO)
// La calculadora es interactiva; la lógica vive en el Client
// Component colocado (MacClient). Aquí solo exportamos metadata
// para SEO y renderizamos el cliente.
// ============================================================

import type { Metadata } from "next";
import MacClient from "./MacClient";

export const metadata: Metadata = {
  title: "MAC — concentración alveolar mínima, ajustada por edad y N₂O — DEC",
  description:
    "Calculadora de MAC de agentes volátiles (sevoflurano, isoflurano, desflurano, halotano) ajustada por edad (Nickalls & Mapleson, BJA 2003) y coadministración de N₂O. Deriva MAC-awake y MAC-BAR.",
  openGraph: {
    title: "MAC — concentración alveolar mínima ajustada por edad y N₂O",
    description:
      "MAC(edad) = MAC40 × 10^(−0.00269 × (edad − 40)). Ajuste por edad, aditividad del N₂O, MAC-awake y MAC-BAR.",
    type: "website",
  },
};

export default function MacPage() {
  return <MacClient />;
}
