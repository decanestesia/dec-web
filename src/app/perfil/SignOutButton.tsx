// src/app/perfil/SignOutButton.tsx
//
// Botón de cerrar sesión accesible desde /perfil. Reusa el flujo existente:
// POST a /auth/signout (route handler) → invalida la sesión → redirige a home.
// Mismo patrón que UserMenuClient.onSignOut.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function onSignOut() {
    setSigningOut(true);
    try {
      await fetch("/auth/signout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onSignOut}
      disabled={signingOut}
      className="profile-signout"
    >
      {signingOut ? "Cerrando…" : "Cerrar sesión"}
      <style jsx>{`
        .profile-signout {
          padding: 0.55rem 0.75rem;
          background: transparent;
          color: var(--red);
          border: 1px solid var(--border);
          font-size: 0.78rem;
          font-family: inherit;
          cursor: pointer;
          transition: border-color 0.15s, background 0.1s;
        }
        .profile-signout:hover:not(:disabled) {
          border-color: var(--red);
          background: var(--bg-0);
        }
        .profile-signout:disabled {
          cursor: wait;
          opacity: 0.6;
        }
      `}</style>
    </button>
  );
}
