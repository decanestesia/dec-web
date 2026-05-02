import Link from "next/link";

// ─── LegalHeader ─────────────────────────────────────────────────

export function LegalHeader({
  command,
  title,
  subtitle,
  comment,
}: {
  command: string;
  title: string;
  subtitle?: string;
  comment?: string;
}) {
  return (
    <header style={{ marginBottom: "1.5rem" }}>
      <div
        className="prompt mono blink"
        style={{ marginBottom: "0.5rem", fontSize: "0.7rem" }}
      >
        <b style={{ color: "var(--accent)" }}>$</b>{" "}
        <span style={{ color: "var(--text-2)" }}>{command}</span>
      </div>
      <h1 style={{ fontSize: "1.7rem", fontWeight: 700, lineHeight: 1.2 }}>
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            color: "var(--text-2)",
            fontSize: "0.95rem",
            marginTop: "0.4rem",
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>
      )}
      {comment && (
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.65rem",
            marginTop: "0.5rem",
            opacity: 0.7,
          }}
        >
          {comment}
        </p>
      )}
    </header>
  );
}

// ─── LegalSection ────────────────────────────────────────────────

export function LegalSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "2rem" }}>
      <h2
        style={{
          fontSize: "0.95rem",
          fontWeight: 600,
          color: "var(--text-0)",
          marginBottom: "0.6rem",
          paddingBottom: "0.4rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "baseline",
          gap: "0.5rem",
        }}
      >
        <span
          className="mono"
          style={{
            color: "var(--accent)",
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          {number}
        </span>
        <span>{title}</span>
      </h2>
      <div
        style={{
          fontSize: "0.85rem",
          lineHeight: 1.75,
          color: "var(--text-1)",
        }}
      >
        {children}
      </div>
    </section>
  );
}

// ─── Paragraph (sin estilos extra, mantener semántica) ─────────

export function P({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <p
      className={className}
      style={{ marginBottom: "0.75rem", ...style }}
    >
      {children}
    </p>
  );
}

// ─── List ────────────────────────────────────────────────────────

export function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul
      style={{
        marginLeft: "1.25rem",
        marginBottom: "0.75rem",
        listStyleType: "'›  '",
      }}
    >
      {children}
    </ul>
  );
}

export function LI({ children }: { children: React.ReactNode }) {
  return (
    <li
      style={{
        marginBottom: "0.4rem",
        paddingLeft: "0.25rem",
      }}
    >
      {children}
    </li>
  );
}

// ─── Last updated banner ─────────────────────────────────────────

export function LastUpdated({ date }: { date: string }) {
  return (
    <div
      className="mono"
      style={{
        marginTop: "2rem",
        marginBottom: "1.5rem",
        padding: "0.5rem 0.75rem",
        background: "var(--bg-1)",
        border: "1px solid var(--border)",
        fontSize: "0.6rem",
        color: "var(--text-3)",
        letterSpacing: "0.04em",
      }}
    >
      // última actualización: {date}
    </div>
  );
}

// ─── Contact box ─────────────────────────────────────────────────

export function ContactBox() {
  return (
    <div
      className="panel"
      style={{
        marginTop: "2rem",
        borderLeft: "3px solid var(--accent)",
      }}
    >
      <div className="panel-body">
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.6rem",
            letterSpacing: "0.08em",
            marginBottom: "0.4rem",
          }}
        >
          CONTACTO
        </p>
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--text-1)",
            lineHeight: 1.7,
          }}
        >
          Si tienes preguntas, dudas o quieres ejercer tus derechos sobre tus
          datos personales, escríbenos a{" "}
          <a
            href="mailto:legal@decanestesia.com"
            style={{ color: "var(--accent)" }}
          >
            legal@decanestesia.com
          </a>
          .
        </p>
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.6rem",
            marginTop: "0.4rem",
            opacity: 0.7,
          }}
        >
          // respondemos cuando podemos · esto es un proyecto independiente, no
          un equipo legal corporativo
        </p>
      </div>
    </div>
  );
}

// ─── Cross link a otras páginas legales ─────────────────────────

export function LegalCrossLinks({
  current,
}: {
  current: "disclaimer" | "privacidad" | "terminos";
}) {
  const items = [
    { slug: "disclaimer", label: "Disclaimer médico" },
    { slug: "privacidad", label: "Privacidad" },
    { slug: "terminos", label: "Términos" },
  ].filter((i) => i.slug !== current);

  return (
    <div
      style={{
        marginTop: "2rem",
        paddingTop: "1rem",
        borderTop: "1px solid var(--border)",
        display: "flex",
        gap: "0.75rem",
        flexWrap: "wrap",
      }}
    >
      <span
        className="mono"
        style={{ fontSize: "0.6rem", color: "var(--text-3)" }}
      >
        // ver también:
      </span>
      {items.map((i) => (
        <Link
          key={i.slug}
          href={`/legal/${i.slug}`}
          className="mono"
          style={{
            fontSize: "0.65rem",
            color: "var(--accent)",
            textDecoration: "none",
            borderBottom: "1px dashed var(--accent)",
            paddingBottom: "1px",
          }}
        >
          {i.label}
        </Link>
      ))}
    </div>
  );
}
