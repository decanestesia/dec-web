// src/app/auth/_components/EmailResetForm.tsx
//
// Formulario "Olvidé mi contraseña" — solicita link por email.

"use client";

import { useState, useTransition } from "react";
import { requestPasswordReset } from "./auth-actions";
import { Field } from "./EmailLoginForm";

export function EmailResetForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await requestPasswordReset(formData);
      if (!result.ok) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  if (success) {
    return (
      <div
        style={{
          padding: "0.75rem 0.85rem",
          background: "var(--bg-0)",
          borderLeft: "2px solid var(--accent)",
        }}
      >
        <p
          className="mono"
          style={{
            fontSize: "0.6rem",
            letterSpacing: "0.08em",
            color: "var(--accent)",
            fontWeight: 600,
            marginBottom: "0.25rem",
          }}
        >
          ENVIADO
        </p>
        <p
          style={{
            fontSize: "0.78rem",
            color: "var(--text-1)",
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          Si el email existe, recibirás un link de recuperación en los
          próximos minutos. Revisa tu bandeja de entrada y la carpeta de spam.
        </p>
      </div>
    );
  }

  return (
    <form
      action={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
    >
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        disabled={isPending}
        hint="Te enviamos un link para restablecer la contraseña"
      />

      {error && (
        <p
          className="mono"
          style={{ fontSize: "0.7rem", color: "var(--red)" }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="auth-submit-btn"
        style={{ marginTop: "0.25rem", opacity: isPending ? 0.5 : 1 }}
      >
        {isPending ? "Enviando…" : "Enviar link de recuperación"}
      </button>

      <style jsx>{`
        .auth-submit-btn {
          padding: 0.7rem 0.75rem;
          background: var(--accent);
          color: var(--bg-0);
          border: none;
          font-size: 0.82rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .auth-submit-btn:hover:not(:disabled) {
          opacity: 0.9;
        }
      `}</style>
    </form>
  );
}
