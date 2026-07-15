// src/app/perfil/DeleteAccountButton.tsx
//
// Botón "Eliminar mi cuenta" (zona de peligro) accesible desde /perfil.
// Paridad con iOS (App Review 5.1.1(v)). Doble barrera: confirm() nativo +
// server action `deleteAccount` que llama al RPC y cierra sesión.

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAccount } from "./profile-actions";

export function DeleteAccountButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    if (
      !confirm(
        "¿Eliminar tu cuenta de forma permanente? Se borrarán tu perfil, suscripciones y códigos. Esta acción NO se puede deshacer."
      )
    )
      return;
    setError(null);
    startTransition(async () => {
      const res = await deleteAccount();
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="profile-delete"
      >
        {pending ? "Eliminando…" : "Eliminar mi cuenta"}
      </button>
      {error && <p className="delete-error">{error}</p>}
      <style jsx>{`
        .profile-delete {
          padding: 0.55rem 0.75rem;
          background: transparent;
          color: var(--red);
          border: 1px solid var(--red);
          font-size: 0.78rem;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.1s, opacity 0.15s;
        }
        .profile-delete:hover:not(:disabled) {
          background: var(--red);
          color: var(--bg-0);
        }
        .profile-delete:disabled {
          cursor: wait;
          opacity: 0.6;
        }
        .delete-error {
          margin-top: 0.5rem;
          color: var(--red);
          font-size: 0.72rem;
          font-family: var(--font-mono, monospace);
        }
      `}</style>
    </div>
  );
}
