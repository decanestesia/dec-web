import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{
        marginTop: "4rem",
        paddingTop: "2rem",
        paddingBottom: "2rem",
        borderTop: "1px solid var(--border)",
        background: "var(--bg-1)",
      }}
    >
      <div
        className="wrap"
        style={{
          display: "flex",
          gap: "2rem",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        {/* Columna 1: marca */}
        <div style={{ minWidth: 200 }}>
          <div
            className="mono"
            style={{
              color: "var(--accent)",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              marginBottom: "0.4rem",
            }}
          >
            ▸ DEC
          </div>
          <p
            style={{
              fontSize: "0.7rem",
              color: "var(--text-3)",
              lineHeight: 1.6,
              marginBottom: "0.6rem",
            }}
          >
            Diluciones, Dosis & Cálculos Anestésicos.
            <br />
            Para anestesiólogos que prefieren calcular antes que adivinar.
          </p>
          <p
            className="mono"
            style={{
              fontSize: "0.6rem",
              color: "var(--text-3)",
              opacity: 0.6,
            }}
          >
            // © 2026 · Dr. Jophiel Espaillat Caldentey
          </p>
        </div>

        {/* Columna 2: producto */}
        <div>
          <FooterTitle>producto</FooterTitle>
          <FooterLink href="/farmacos">fármacos</FooterLink>
          <FooterLink href="/calculadora">calculadora</FooterLink>
          <FooterLink href="/interacciones">interacciones</FooterLink>
          <FooterLink href="/blog">blog</FooterLink>
        </div>

        {/* Columna 3: legales */}
        <div>
          <FooterTitle>legal</FooterTitle>
          <FooterLink href="/legal/disclaimer">disclaimer médico</FooterLink>
          <FooterLink href="/legal/privacidad">privacidad</FooterLink>
          <FooterLink href="/legal/terminos">términos</FooterLink>
        </div>

        {/* Columna 4: contacto */}
        <div>
          <FooterTitle>contacto</FooterTitle>
          <FooterLink href="mailto:hola@decanestesia.com" external>
            hola@decanestesia.com
          </FooterLink>
          <FooterLink href="mailto:errores@decanestesia.com" external>
            reportar error
          </FooterLink>
          <FooterLink href="/about">acerca de</FooterLink>
        </div>
      </div>

      {/* Línea final con humor negro */}
      <div
        className="wrap"
        style={{
          marginTop: "2rem",
          paddingTop: "1rem",
          borderTop: "1px solid var(--border)",
          textAlign: "center",
        }}
      >
        <p
          className="mono"
          style={{
            fontSize: "0.55rem",
            color: "var(--text-3)",
            opacity: 0.5,
            letterSpacing: "0.06em",
          }}
        >
          // herramienta de apoyo · no sustituye juicio profesional · si algo sale mal, la culpa no es del app
        </p>
      </div>
    </footer>
  );
}

function FooterTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4
      className="mono"
      style={{
        fontSize: "0.6rem",
        color: "var(--text-3)",
        letterSpacing: "0.1em",
        marginBottom: "0.5rem",
        textTransform: "uppercase",
      }}
    >
      {children}
    </h4>
  );
}

function FooterLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      style={{
        display: "block",
        fontSize: "0.7rem",
        color: "var(--text-2)",
        textDecoration: "none",
        marginBottom: "0.3rem",
        transition: "color 0.15s",
      }}
      className="footer-link"
    >
      {children}
    </Link>
  );
}
