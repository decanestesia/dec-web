// src/app/auth/_components/EmailLoginForm.tsx
//
// Formulario email + password con server action.

"use client";

import { useState, useTransition } from "react";
import { signInWithPassword } from "./auth-actions";

export function EmailLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signInWithPassword(formData);
      if (!result.ok) setError(result.error);
      // Si ok, signInWithPassword redirige internamente
    });
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
      />
      <Field
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        disabled={isPending}
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
        {isPending ? "Verificando…" : "Iniciar sesión"}
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
        .auth-submit-btn:focus-visible {
          outline: 2px solid var(--text-0);
          outline-offset: 2px;
        }
        .auth-submit-btn:disabled {
          cursor: wait;
        }
      `}</style>
    </form>
  );
}

// ─── Field component (reutilizable) ───────────────────────────────

export function Field({
  label,
  name,
  type = "text",
  autoComplete,
  required,
  disabled,
  defaultValue,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  hint?: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <span
        className="mono"
        style={{
          fontSize: "0.6rem",
          letterSpacing: "0.08em",
          color: "var(--text-3)",
          fontWeight: 600,
        }}
      >
        {label.toUpperCase()}
      </span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        defaultValue={defaultValue}
        className="auth-input"
      />
      {hint && (
        <span
          className="mono"
          style={{
            fontSize: "0.62rem",
            color: "var(--text-3)",
            opacity: 0.7,
            marginTop: "0.05rem",
          }}
        >
          {hint}
        </span>
      )}
      <style jsx>{`
        .auth-input {
          padding: 0.5rem 0.6rem;
          background: var(--bg-0);
          color: var(--text-0);
          border: 1px solid var(--border);
          font-size: 0.82rem;
          font-family: inherit;
          transition: border-color 0.15s;
        }
        .auth-input:focus {
          outline: none;
          border-color: var(--accent);
        }
        .auth-input:disabled {
          opacity: 0.5;
          cursor: wait;
        }
      `}</style>
    </label>
  );
}
