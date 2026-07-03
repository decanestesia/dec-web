// src/app/legal/_components/LegalShell.tsx
//
// Wrapper visual común para las 4 páginas legales.
// Header + TOC sidebar + content + cross-links.

import Link from "next/link";
import type { ReactNode } from "react";

export interface TOCItem {
  id: string;
  label: string;
}

export function LegalShell({
  eyebrow,
  title,
  subtitle,
  effectiveDate,
  version,
  toc,
  children,
  relatedPages,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  effectiveDate: string;
  version: string;
  toc: TOCItem[];
  children: ReactNode;
  relatedPages: { href: string; label: string }[];
}) {
  return (
    <div className="legal-layout">
      {/* Header */}
      <header className="legal-header">
        <span className="legal-header-eyebrow">{eyebrow}</span>
        <h1 className="legal-header-title">{title}</h1>
        <p className="legal-header-subtitle">{subtitle}</p>
        <div className="legal-header-meta">
          <span>
            <strong>Vigencia:</strong> {effectiveDate}
          </span>
          <span>
            <strong>Versión:</strong> {version}
          </span>
          <span>
            <strong>Jurisdicción primaria:</strong> República Dominicana
          </span>
        </div>
      </header>

      <div className="legal-container">
        {/* TOC sidebar */}
        <aside className="legal-toc" aria-label="Tabla de contenidos">
          <p className="legal-toc-label">Contenidos</p>
          <ul className="legal-toc-list">
            {toc.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="legal-toc-link">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <main className="legal-content">
          {children}

          {/* Related legal pages */}
          <div className="legal-related">
            <p className="legal-related-label">Documentos relacionados</p>
            <ul className="legal-related-list">
              {relatedPages.map((p) => (
                <li key={p.href}>
                  <Link href={p.href}>{p.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Helper: Section component with proper anchor ─────────────

export function LegalSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id}>
      <h2>
        <span className="section-number">§ {number}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

// ─── Helper: Callout (medical, warning, info, default) ────────

export function Callout({
  variant = "default",
  label,
  children,
}: {
  variant?: "default" | "medical" | "warning" | "info";
  label?: string;
  children: ReactNode;
}) {
  const className =
    variant === "default"
      ? "legal-callout"
      : `legal-callout legal-callout-${variant}`;

  return (
    <div className={className} role="note">
      {label && <span className="legal-callout-label">{label}</span>}
      {children}
    </div>
  );
}
