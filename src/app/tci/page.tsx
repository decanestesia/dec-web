import type { Metadata } from "next";
import TciClient from "./TciClient";
import { isProUser } from "@/lib/gating.server";

export const metadata: Metadata = {
  title: "Calculadora TCI / TIVA — infusión controlada por objetivo — DEC",
  description:
    "Calculadora TCI/TIVA con modelos farmacocinéticos poblacionales publicados (Schnider, Marsh, Eleveld para propofol; Minto y Eleveld para remifentanilo; Hannivoort dexmedetomidina; Kamp ketamina). Objetivo plasma o sitio-efecto, bolo de carga, velocidad de mantenimiento (mL/h y mg/kg/h) y tiempo estimado a despertar. No sustituye a una bomba TCI certificada ni a la monitorización.",
  openGraph: {
    title: "Calculadora TCI / TIVA — DEC",
    description:
      "Infusión controlada por objetivo (plasma / sitio-efecto) con modelos PK poblacionales citados: Schnider, Marsh, Minto, Eleveld, Hannivoort, Kamp. Bolo + mantenimiento + despertar estimado.",
    type: "website",
  },
};

export default async function Page() {
  // isPro se resuelve en el server (flag off → true, sin pegarle a la base)
  // y baja como prop al client, que lo pasa a ProGateClient.
  const isPro = await isProUser();
  return <TciClient isPro={isPro} />;
}
