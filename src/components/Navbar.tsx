"use client";

import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navbar() {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

const links = [
  { href: "/", label: "sys", exact: true },
  { href: "/farmacos", label: "db/farmacos" },
  { href: "/interacciones", label: "interactions" },
  { href: "/calculadora", label: "calc" },
  { href: "/blog", label: "blog" },
  { href: "/about", label: "about" },
];

  return (
    <nav className="sticky top-0 z-50" style={{ background: "var(--bg-1)", borderBottom: "1px solid var(--border)" }}>
      <div className="wrap flex items-center justify-between h-11">
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="mono" style={{ color: "var(--accent)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em" }}>▸ DEC</span>
          <span className="mono hidden sm:inline" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>α0.1</span>
          <span className="hidden sm:inline glow-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-0.5">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`nav-link ${(l.exact ? pathname === l.href : isActive(l.href)) ? "nav-link-active" : ""}`}>
              {l.label}
            </Link>
          ))}
          <div style={{ width: 1, height: 14, background: "var(--border-hi)", margin: "0 0.4rem" }} />
          <button onClick={toggle} className="mono" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: "0.6rem", padding: "0.3rem" }}>
            {theme === "dark" ? "◐ light" : "◑ dark"}
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden mono"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-2)", fontSize: "0.7rem", padding: "0.3rem" }}
        >
          {menuOpen ? "[×]" : "[≡]"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden fade-in" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-1)", padding: "0.5rem 0" }}>
          <div className="wrap flex flex-col gap-0.5">
            {links.map((l) => (
              <Link
                key={l.href} href={l.href}
                onClick={() => setMenuOpen(false)}
                className="mono"
                style={{ color: (l.exact ? pathname === l.href : isActive(l.href)) ? "var(--accent)" : "var(--text-2)", fontSize: "0.75rem", padding: "0.5rem 0", textDecoration: "none", borderBottom: "1px solid var(--border)" }}
              >
                → {l.label}
              </Link>
            ))}
            <button onClick={() => { toggle(); setMenuOpen(false); }} className="mono" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: "0.65rem", padding: "0.5rem 0", textAlign: "left" }}>
              {theme === "dark" ? "◐ cambiar a light" : "◑ cambiar a dark"}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
