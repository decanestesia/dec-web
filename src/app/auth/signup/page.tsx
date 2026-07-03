// src/app/auth/signup/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser, safeNext } from "@/lib/auth";
import { AuthShell } from "../_components/AuthShell";
import { OAuthButtons } from "../_components/OAuthButtons";
import { EmailSignupForm } from "../_components/EmailSignupForm";

export const metadata = {
  title: "Crear cuenta — DEC",
  description: "Regístrate en DEC",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  const user = await getUser();
  if (user) redirect(safeNext(params.next));

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Regístrate gratis. Sin tarjeta de crédito. Pasa a Pro cuando quieras."
      footer={
        <>
          Al registrarte aceptas nuestros{" "}
          <Link href="/legal/terminos" style={{ color: "var(--text-2)" }}>
            Términos
          </Link>{" "}
          y la{" "}
          <Link href="/legal/privacidad" style={{ color: "var(--text-2)" }}>
            Política de Privacidad
          </Link>
          .
          <br />
          {"// los leemos por ti — pero te conviene mirarlos"}
        </>
      }
    >
      <OAuthButtons next={params.next} />
      <Divider />
      <EmailSignupForm />

      <div
        style={{
          textAlign: "center",
          fontSize: "0.72rem",
          marginTop: "0.5rem",
        }}
      >
        ¿Ya tienes cuenta?{" "}
        <Link
          href={`/auth/login${params.next ? `?next=${encodeURIComponent(params.next)}` : ""}`}
          style={{ color: "var(--text-2)", textDecoration: "underline" }}
        >
          Inicia sesión
        </Link>
      </div>
    </AuthShell>
  );
}

function Divider() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        margin: "0.25rem 0",
      }}
    >
      <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      <span
        className="mono"
        style={{
          fontSize: "0.6rem",
          color: "var(--text-3)",
          letterSpacing: "0.1em",
        }}
      >
        O CON EMAIL
      </span>
      <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
    </div>
  );
}
