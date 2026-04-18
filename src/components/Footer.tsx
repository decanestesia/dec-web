"use client";

import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-16"
      style={{
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="container-dec py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div
              className="text-xs font-bold tracking-widest mb-3"
              style={{ color: "var(--accent)" }}
            >
              ▸ DEC
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              Diluciones, Dosis & Cálculos Anestésicos.
              <br />
              Porque Google no debería ser tu consultor
              <br />
              de dosis a las 3 AM.
            </p>
          </div>

          {/* Links */}
          <div>
            <div
              className="text-xs font-semibold tracking-wider uppercase mb-3"
              style={{ color: "var(--text-secondary)" }}
            >
              Navegación
            </div>
            <div className="flex flex-col gap-1.5">
              <FooterLink href="/">Inicio</FooterLink>
              <FooterLink href="/farmacos">Catálogo de fármacos</FooterLink>
            </div>
          </div>

          {/* Legal */}
          <div>
            <div
              className="text-xs font-semibold tracking-wider uppercase mb-3"
              style={{ color: "var(--text-secondary)" }}
            >
              Disclaimer
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              Herramienta de apoyo a la decisión clínica.
              No sustituye el juicio profesional ni las ganas
              de leer el inserto del fármaco. Verifique siempre
              antes de administrar.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <span
            className="text-xs"
            style={{ color: "var(--text-muted)", fontFamily: "SF Mono, monospace" }}
          >
            © {year} Dr. Jophiel Espaillat C.
          </span>
          <span
            className="text-xs"
            style={{ color: "var(--text-muted)", fontFamily: "SF Mono, monospace" }}
          >
            &quot;Primum non nocere&quot; — pero primero calcula bien la dosis.
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-xs no-underline transition-colors"
      style={{ color: "var(--text-muted)", fontFamily: "SF Mono, monospace" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
    >
      → {children}
    </Link>
  );
}
