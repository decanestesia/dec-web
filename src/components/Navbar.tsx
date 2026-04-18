"use client";

import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  return (
    <nav
      className="sticky top-0 z-50"
      style={{ background: "var(--bg-1)", borderBottom: "1px solid var(--border)" }}
    >
      <div className="wrap flex items-center justify-between h-11">
        <Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
          <span
            className="mono"
            style={{ color: "var(--accent)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em" }}
          >
            ▸ DEC
          </span>
          <span
            className="mono hidden sm:inline"
            style={{ color: "var(--text-3)", fontSize: "0.6rem" }}
          >
            α0.1
          </span>
          <span
            className="hidden sm:inline"
            style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 8px var(--accent)",
              display: "inline-block",
            }}
          />
        </Link>

        <div className="flex items-center gap-0.5">
          <Link href="/" className={`nav-link ${pathname === "/" ? "nav-link-active" : ""}`}>
            sys
          </Link>
          <Link href="/farmacos" className={`nav-link ${isActive("/farmacos") ? "nav-link-active" : ""}`}>
            db/farmacos
          </Link>
          <Link href="/calculadora" className={`nav-link ${isActive("/calculadora") ? "nav-link-active" : ""}`}>
            calc
          </Link>

          <div style={{ width: 1, height: 14, background: "var(--border-hi)", margin: "0 0.4rem" }} />

          <button
            onClick={toggle}
            className="mono"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-3)", fontSize: "0.6rem", padding: "0.3rem",
            }}
          >
            {theme === "dark" ? "◐ light" : "◑ dark"}
          </button>
        </div>
      </div>
    </nav>
  );
}
