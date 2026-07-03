// src/app/auth/reset/page.tsx

import Link from "next/link";
import { AuthShell } from "../_components/AuthShell";
import { EmailResetForm } from "../_components/EmailResetForm";

export const metadata = {
  title: "Recuperar contraseña — DEC",
};

export default function ResetPage() {
  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Te enviamos un link al email registrado. El link caduca en 1 hora — más vida útil que algunos vasopresores."
      footer={
        <Link
          href="/auth/login"
          style={{ color: "var(--text-2)", textDecoration: "underline" }}
        >
          ← Volver a iniciar sesión
        </Link>
      }
    >
      <EmailResetForm />
    </AuthShell>
  );
}
