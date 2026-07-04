// ============================================================
// CHECKLIST OMS + TIMERS DE RE-DOSIFICACIÓN — Server entry (SEO).
// La interacción (marcado del checklist, cronómetros de re-dosis)
// vive en el Client Component colocado (ChecklistClient).
//
// EXACTITUD CLÍNICA: el checklist reproduce la lista de verificación
// de la seguridad quirúrgica de la OMS (2009); los intervalos de
// re-dosis de antibióticos son valores de referencia ASHP/IDSA/SIS/
// SHEA 2013 (alineados con SCIP). Ningún valor inventado — los datos
// tipados viven en src/lib/checklist.ts.
// ============================================================

import type { Metadata } from "next";
import ChecklistClient from "./ChecklistClient";

export const metadata: Metadata = {
  title: "Checklist OMS + timers de re-dosificación · DEC",
  description:
    "Lista de verificación de la seguridad quirúrgica de la OMS (2009) interactiva en sus 3 fases (entrada/sign-in, pausa/time-out, salida/sign-out) con progreso por fase, más cronómetros de re-dosificación intraoperatoria: antibióticos profilácticos por vida media (cefazolina cada ~4 h, cefoxitina ~2 h, clindamicina ~6 h; vancomicina y metronidazol no requieren), recordatorio de reevaluación de TOF y un timer genérico. OMS/WHO 2009 · ASHP/SCIP.",
  openGraph: {
    title: "Checklist OMS + timers de re-dosificación — DEC",
    description:
      "Checklist quirúrgico de seguridad de la OMS (2009) en 3 fases y cronómetros de re-dosis de antibióticos profilácticos por vida media para el intraoperatorio. OMS/WHO 2009 · ASHP/SCIP.",
    type: "website",
  },
};

export default function ChecklistPage() {
  return <ChecklistClient />;
}
