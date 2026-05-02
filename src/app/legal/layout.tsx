import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};

interface Props {
  children: React.ReactNode;
}

export default function LegalLayout({ children }: Props) {
  return (
    <div
      className="wrap"
      style={{
        paddingTop: "1.5rem",
        paddingBottom: "3rem",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      {/* Breadcrumb terminal style */}
      <nav
        className="mono"
        style={{
          fontSize: "0.65rem",
          color: "var(--text-3)",
          marginBottom: "1rem",
          display: "flex",
          gap: "0.4rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          style={{ color: "var(--accent)", textDecoration: "none" }}
        >
          /
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-1)" }}>legal</span>
      </nav>

      {/* Tabs entre las 3 páginas */}
      <div
        style={{
          display: "flex",
          gap: "0.4rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          paddingBottom: "0.75rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <LegalTab href="/legal/disclaimer" label="disclaimer médico" />
        <LegalTab href="/legal/privacidad" label="privacidad" />
        <LegalTab href="/legal/terminos" label="términos" />
      </div>

      {children}
    </div>
  );
}

function LegalTab({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mono"
      style={{
        padding: "0.3rem 0.6rem",
        fontSize: "0.65rem",
        color: "var(--text-2)",
        background: "var(--bg-1)",
        textDecoration: "none",
        border: "1px solid var(--border)",
        letterSpacing: "0.04em",
      }}
    >
      {label}
    </Link>
  );
}
