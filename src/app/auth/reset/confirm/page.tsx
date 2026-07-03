// src/app/auth/reset/confirm/page.tsx
//
// Página a la que llega el usuario tras click en el link del email.
// El recovery token llega en el hash y Supabase auth lo procesa
// automáticamente — solo necesitamos el form para nueva contraseña.

import { AuthShell } from "../../_components/AuthShell";
import { ConfirmResetForm } from "./ConfirmResetForm";

export const metadata = {
  title: "Nueva contraseña — DEC",
};

export default function ConfirmResetPage() {
  return (
    <AuthShell
      title="Nueva contraseña"
      subtitle="Elige una contraseña que no olvides este mes."
    >
      <ConfirmResetForm />
    </AuthShell>
  );
}
