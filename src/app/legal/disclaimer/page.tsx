// src/app/legal/disclaimer/page.tsx
//
// LEGADO: el disclaimer médico se consolidó en /legal/aviso-medico.
// Esta ruta se conserva únicamente como redirect 308 permanente para no
// romper SEO ni enlaces indexados. El contenido bueno que solo estaba aquí
// (no-dispositivo FDA/EMA/COFEPRIS/MHRA/CE, embarazo/lactancia) se portó a
// /legal/aviso-medico. NO borrar este archivo.

import { permanentRedirect } from "next/navigation";

export default function DisclaimerPage() {
  permanentRedirect("/legal/aviso-medico");
}
