"use client";

import Link from "next/link";

export function Footer() {
  const y = new Date().getFullYear();
  return (
    <footer style={{ background: "var(--bg-1)", borderTop: "1px solid var(--border)", marginTop: "4rem" }}>
      <div className="wrap" style={{ padding: "2rem 1.5rem" }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-6">
          <div>
            <div className="mono" style={{ color: "var(--accent)", fontSize: "0.7rem", fontWeight: 700, marginBottom: "0.5rem" }}>▸ DEC</div>
            <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem", lineHeight: 1.7 }}>
              Diluciones, Dosis & Cálculos Anestésicos.
              <br />Porque Google no debería ser tu
              <br />consultor de dosis a las 3 AM.
            </p>
          </div>
          <div>
            <div style={{ color: "var(--text-2)", fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>NAV</div>
            <div className="flex flex-col gap-1">
              <FLink href="/">Inicio</FLink>
              <FLink href="/farmacos">Fármacos</FLink>
              <FLink href="/calculadora">Calculadora</FLink>
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-2)", fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>LEGAL</div>
            <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.7 }}>
              Herramienta de apoyo clínico. No sustituye
              el juicio profesional ni las ganas de leer
              el inserto. Verifique antes de administrar.
            </p>
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>
            © {y} Dr. Jophiel Espaillat C.
          </span>
          <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", opacity: 0.5 }}>
            &quot;Primum non nocere&quot; — pero primero calcula bien la dosis.
          </span>
        </div>
      </div>
    </footer>
  );
}

function FLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem", textDecoration: "none" }}>
      → {children}
    </Link>
  );
}
