// src/app/auth/error/page.tsx

import Link from "next/link";
import { AuthShell } from "../_components/AuthShell";

export const metadata = {
  title: "Error de autenticación — DEC",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>;
}) {
  const params = await searchParams;
  const description =
    params.error_description ??
    "Algo salió mal con el proceso de autenticación.";

  return (
    <AuthShell
      title="Error de autenticación"
      subtitle={description}
      footer={
        <>
          Si el error persiste, escríbenos a{" "}
          <a
            href="mailto:errores@decanestesia.com"
            style={{ color: "var(--text-2)" }}
          >
            errores@decanestesia.com
          </a>
          <br />
          // los errores también son data
        </>
      }
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <Link
          href="/auth/login"
          style={{
            padding: "0.7rem",
            background: "var(--accent)",
            color: "var(--bg-0)",
            textAlign: "center",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.82rem",
          }}
        >
          Volver a iniciar sesión
        </Link>
        <Link
          href="/"
          style={{
            padding: "0.7rem",
            background: "transparent",
            color: "var(--text-1)",
            textAlign: "center",
            textDecoration: "none",
            fontSize: "0.78rem",
            border: "1px solid var(--border)",
          }}
        >
          Ir al inicio
        </Link>
      </div>
    </AuthShell>
  );
}
