// src/app/auth/_components/EmailSignupForm.tsx
//
// Formulario de registro con email + password + display name.

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signUpWithPassword } from "./auth-actions";
import { Field } from "./EmailLoginForm";

export function EmailSignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signUpWithPassword(formData);
      if (!result.ok) {
        setError(result.error);
      } else if (result.redirect) {
        router.push(result.redirect);
      }
    });
  }

  return (
    <form
      action={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
    >
      <Field
        label="Nombre"
        name="display_name"
        type="text"
        autoComplete="name"
        disabled={isPending}
        hint="Cómo quieres que te llamemos"
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        disabled={isPending}
      />
      <Field
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        disabled={isPending}
        hint="Mínimo 8 caracteres"
      />

      {error && (
        <p
          className="mono"
          style={{
            fontSize: "0.7rem",
            color: "var(--red)",
            margin: "0.1rem 0 0",
          }}
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
        {isPending ? "Creando cuenta…" : "Crear cuenta"}
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
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.05s;
        }
        .auth-submit-btn:hover:not(:disabled) {
          opacity: 0.9;
        }
        .auth-submit-btn:active:not(:disabled) {
          transform: translateY(1px);
        }
      `}</style>
    </form>
  );
}
