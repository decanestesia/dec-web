// src/app/auth/_components/AuthShell.tsx
//
// Wrapper visual para todas las páginas de auth.
// Card centered en background dark con logo DEC.

import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background: "var(--bg-0)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        {/* Logo / Brand */}
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "var(--text-0)",
            display: "block",
            textAlign: "center",
          }}
        >
          <div
            className="mono"
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              color: "var(--text-3)",
              marginBottom: "0.25rem",
            }}
          >
            DEC
          </div>
          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--text-3)",
              opacity: 0.7,
            }}
          >
            Diluciones, Dosis &amp; Cálculos
          </div>
        </Link>

        {/* Card */}
        <div
          style={{
            background: "var(--bg-1)",
            border: "1px solid var(--border)",
            padding: "1.5rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <header style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <h1
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "var(--text-0)",
                margin: 0,
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-2)",
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {subtitle}
              </p>
            )}
          </header>

          {children}
        </div>

        {footer && (
          <div
            className="mono"
            style={{
              textAlign: "center",
              fontSize: "0.65rem",
              color: "var(--text-3)",
              opacity: 0.7,
              lineHeight: 1.6,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </main>
  );
}
