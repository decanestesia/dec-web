// src/app/blog/GateNotice.tsx
//
// Aviso "no autorizado" para el editor. Server component sin estado; lo
// muestran las páginas /blog/nuevo y /blog/editar cuando el usuario no tiene
// sesión o no tiene profiles.can_publish.

import Link from "next/link";

export function GateNotice({ loggedIn }: { loggedIn: boolean }) {
  return (
    <div className="wrap" style={{ paddingTop: "3rem", paddingBottom: "3rem", maxWidth: 560, margin: "0 auto" }}>
      <div className="prompt mono" style={{ marginBottom: "1rem" }}>
        <b>$</b> sudo tail -f /var/log/blog
      </div>
      <div className="panel" style={{ borderLeft: "3px solid var(--red)" }}>
        <div className="panel-body" style={{ padding: "1.25rem" }}>
          <h1 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-0)", marginBottom: "0.6rem" }}>
            No autorizado
          </h1>
          <p style={{ color: "var(--text-1)", fontSize: "0.85rem", lineHeight: 1.65, marginBottom: "1rem" }}>
            {loggedIn
              ? "Tu cuenta no tiene permiso de publicación (profiles.can_publish). Escribe a soporte si crees que debería tenerlo."
              : "Necesitas iniciar sesión con una cuenta autorizada para escribir en el blog."}
          </p>
          <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem", marginBottom: "1.25rem", opacity: 0.7 }}>
            {"// permission denied: el bisturí lo maneja quien tiene el permiso"}
          </p>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            {!loggedIn && (
              <Link href="/auth/login?next=/blog/nuevo" className="btn btn-fill btn-sm" style={{ textDecoration: "none" }}>
                Iniciar sesión
              </Link>
            )}
            <Link href="/blog" className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}>
              ← volver al blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
