// src/app/admin/page.tsx
//
// Panel de administración — SOLO para el dueño (profiles.is_admin = true).
//
// Gate (server component): sin sesión o is_admin=false → "No autorizado".
// No revelamos que la ruta existe con datos; el gate corre antes de cargar
// nada. Las acciones (dar/revocar/cupones) son server actions que RE-verifican
// isAdmin() y llaman las RPC admin_* con el cliente de la SESIÓN (las RPC son
// SECURITY DEFINER y chequean is_admin internamente). Doble candado.

import Link from "next/link";
import { getUser, isAdmin } from "@/lib/auth";
import { listUsers } from "./admin-actions";
import { AdminDashboard } from "./AdminDashboard";

export const metadata = {
  title: "Admin — DEC",
  robots: { index: false, follow: false },
};

// Nunca cachear: es un panel de control con datos vivos.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getUser();
  const admin = user ? await isAdmin() : false;

  // Gate — cualquiera que no sea el dueño ve exactamente esto.
  if (!admin) {
    return (
      <div className="wrap" style={{ padding: "4rem 0 5rem", maxWidth: 620 }}>
        <div className="prompt mono" style={{ marginBottom: "1rem" }}>
          <b>$</b> dec admin --whoami
        </div>
        <h1
          style={{
            fontSize: "clamp(1.4rem, 4vw, 2rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            margin: "0 0 0.75rem",
          }}
        >
          No autorizado
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: "0.9rem", lineHeight: 1.6 }}>
          Esta zona es solo para administración. Si crees que es un error,
          escribe a{" "}
          <a href="mailto:soporte@decanestesia.com" style={{ color: "var(--accent)" }}>
            soporte@decanestesia.com
          </a>
          .
        </p>
        <p
          className="mono"
          style={{
            fontSize: "0.66rem",
            color: "var(--text-3)",
            marginTop: "1.5rem",
            opacity: 0.7,
          }}
        >
          {"// 403 — permiso denegado. nada que ver por aquí."}
        </p>
        <div style={{ marginTop: "1.5rem" }}>
          <Link
            href="/"
            className="mono"
            style={{ fontSize: "0.75rem", color: "var(--accent)" }}
          >
            ← volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Carga inicial de la tabla (server-side, ya gateado).
  const initial = await listUsers();
  const users = initial.ok ? (initial.data ?? []) : [];
  const loadError = initial.ok ? null : initial.error;

  return <AdminDashboard initialUsers={users} loadError={loadError} />;
}
