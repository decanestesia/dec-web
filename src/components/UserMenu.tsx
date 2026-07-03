// src/components/UserMenu.tsx
//
// Header dropdown — muestra avatar/inicial, link a cuenta, signout.
// Server component que decide qué renderizar según haya sesión o no.

import Link from "next/link";
import { getProfile, getActiveTier } from "@/lib/auth";
import { UserMenuClient } from "./UserMenuClient";

export async function UserMenu() {
  const profile = await getProfile();

  // No hay sesión → CTA login
  if (!profile) {
    return (
      <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
        <Link
          href="/auth/login"
          style={{
            fontSize: "0.78rem",
            color: "var(--text-1)",
            textDecoration: "none",
            padding: "0.4rem 0.6rem",
          }}
        >
          Iniciar sesión
        </Link>
        <Link
          href="/auth/signup"
          style={{
            fontSize: "0.78rem",
            color: "var(--bg-0)",
            background: "var(--accent)",
            textDecoration: "none",
            padding: "0.4rem 0.7rem",
            fontWeight: 600,
          }}
        >
          Crear cuenta
        </Link>
      </div>
    );
  }

  // Hay sesión → dropdown
  const tier = await getActiveTier();
  return <UserMenuClient profile={profile} tier={tier} />;
}
