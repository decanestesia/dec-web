// src/app/auth/login/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser, safeNext } from "@/lib/auth";
import { AuthShell } from "../_components/AuthShell";
import { OAuthButtons } from "../_components/OAuthButtons";
import { EmailLoginForm } from "../_components/EmailLoginForm";

export const metadata = {
  title: "Iniciar sesión — DEC",
  description: "Accede a tu cuenta de DEC",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; registered?: string }>;
}) {
  const params = await searchParams;

  // Si ya hay sesión, redirigir (next saneado: solo rutas internas).
  const user = await getUser();
  if (user) redirect(safeNext(params.next));

  return (
    <AuthShell
      title="Bienvenido de vuelta"
      subtitle="Accede para usar tus calculadoras, sincronizar entre dispositivos y disfrutar tu suscripción."
      footer={
        <>
          ¿Problemas? Escribe a <a href="mailto:soporte@decanestesia.com" style={{ color: "var(--text-2)" }}>soporte@decanestesia.com</a>
          <br />
          {"// se nos olvidan las contraseñas a todos"}
        </>
      }
    >
      {params.registered && (
        <div
          style={{
            padding: "0.6rem 0.7rem",
            background: "var(--bg-0)",
            borderLeft: "2px solid var(--accent)",
            marginBottom: "0.25rem",
          }}
        >
          <p
            className="mono"
            style={{
              fontSize: "0.7rem",
              color: "var(--text-1)",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Cuenta creada. Ahora inicia sesión.
          </p>
        </div>
      )}

      <OAuthButtons next={params.next} />

      <Divider />

      <EmailLoginForm />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.72rem",
          marginTop: "0.5rem",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <Link
          href="/auth/reset"
          style={{ color: "var(--text-2)", textDecoration: "underline" }}
        >
          Olvidé mi contraseña
        </Link>
        <Link
          href={`/auth/signup${params.next ? `?next=${encodeURIComponent(params.next)}` : ""}`}
          style={{ color: "var(--text-2)", textDecoration: "underline" }}
        >
          Crear cuenta nueva
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
