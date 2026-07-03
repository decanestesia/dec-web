// src/app/auth/reset/confirm/ConfirmResetForm.tsx

"use client";

import { useState, useTransition } from "react";
import { setNewPassword } from "../../_components/auth-actions";
import { Field } from "../../_components/EmailLoginForm";

export function ConfirmResetForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("password_confirm") ?? "");
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    startTransition(async () => {
      const result = await setNewPassword(formData);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <form
      action={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
    >
      <Field
        label="Nueva contraseña"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        disabled={isPending}
        hint="Mínimo 8 caracteres"
      />
      <Field
        label="Repetir contraseña"
        name="password_confirm"
        type="password"
        autoComplete="new-password"
        required
        disabled={isPending}
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
        {isPending ? "Guardando…" : "Guardar contraseña"}
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
        }
        .auth-submit-btn:hover:not(:disabled) {
          opacity: 0.9;
        }
      `}</style>
    </form>
  );
}
