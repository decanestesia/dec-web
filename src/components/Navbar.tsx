"use client";

import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { primaryNavSections, secondaryNavSections, type Section } from "@/lib/registry";

// Navbar PLANO: lista de enlaces DIRECTOS (un clic = una sección), SIN dropdowns
// por categoría. Los items se derivan del registro central (src/lib/registry.ts)
// pero se renderizan planos. Las herramientas clínicas (primaryNavSections) van
// SIEMPRE visibles y directas; solo las secundarias (blog/about) caen en un
// overflow "···". /codigo conserva su acento rojo de urgencia. Las legales y
// /manual quedan fuera (hideFromNav) — las legales viven en el footer.

export function Navbar({ userSlot }: { userSlot?: ReactNode }) {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false); // menú móvil
  const [overflowOpen, setOverflowOpen] = useState(false); // overflow "···" desktop
  const navRef = useRef<HTMLElement>(null);

  const isActive = (path: string, exact = false) =>
    exact ? pathname === path : pathname === path || pathname.startsWith(path + "/");

  const primary = primaryNavSections(); // clínicas + producto → siempre directas
  const secondary = secondaryNavSections(); // blog/about → overflow

  // Cerrar overflow al cambiar de ruta.
  useEffect(() => {
    setOverflowOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!overflowOpen) return;
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOverflowOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOverflowOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [overflowOpen]);

  // Enlace directo del navbar desktop.
  const NavLink = ({ s }: { s: Section }) => {
    const active = isActive(s.slug, s.slug === "/");
    return (
      <Link
        href={s.slug}
        className={`nav-link ${active ? "nav-link-active" : ""}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          whiteSpace: "nowrap",
          color: s.urgent ? "var(--red)" : active ? "var(--accent)" : undefined,
          fontWeight: s.urgent ? 700 : undefined,
          borderBottomColor: active ? (s.urgent ? "var(--red)" : "var(--accent)") : "transparent",
        }}
      >
        {s.navLabel}
        {s.isNew && (
          <span style={{ color: "var(--accent)", fontSize: "0.5rem", letterSpacing: "0.05em" }}>
            new
          </span>
        )}
      </Link>
    );
  };

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50"
      style={{ background: "var(--bg-1)", borderBottom: "1px solid var(--border)" }}
    >
      <div className="wrap flex items-center justify-between h-11">
        {/* ─── Logo ────────────────────────────────────────────── */}
        <Link
          href="/"
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <span className="mono" style={{ color: "var(--accent)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em" }}>
            ▸ DEC
          </span>
          <span className="mono hidden sm:inline" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>
            α0.1
          </span>
          <span
            className="hidden sm:inline glow-pulse"
            style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }}
          />
        </Link>

        {/* ─── Desktop nav (plano) ─────────────────────────────── */}
        <div className="hidden md:flex items-center gap-0.5">
          {/* Enlaces clínicos + producto: SIEMPRE directos, nunca anidados */}
          {primary.map((s) => (
            <NavLink key={s.slug} s={s} />
          ))}

          {/* Overflow "···" solo para secundarios (blog/about) */}
          {secondary.length > 0 && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setOverflowOpen((o) => !o)}
                className={`nav-link ${secondary.some((s) => isActive(s.slug)) ? "nav-link-active" : ""}`}
                aria-haspopup="true"
                aria-expanded={overflowOpen}
                aria-label="Más secciones"
                style={{
                  background: "none",
                  cursor: "pointer",
                  color: overflowOpen ? "var(--accent)" : undefined,
                  borderBottomColor: overflowOpen ? "var(--accent)" : "transparent",
                }}
              >
                ···
              </button>

              {overflowOpen && (
                <div
                  className="fade-in"
                  role="menu"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 1px)",
                    right: 0,
                    minWidth: 160,
                    background: "var(--bg-1)",
                    border: "1px solid var(--border-hi)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    padding: "0.35rem",
                    zIndex: 60,
                  }}
                >
                  {secondary.map((s) => {
                    const active = isActive(s.slug);
                    return (
                      <Link
                        key={s.slug}
                        href={s.slug}
                        role="menuitem"
                        onClick={() => setOverflowOpen(false)}
                        className="card-interactive mono"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.45rem",
                          padding: "0.45rem 0.5rem",
                          textDecoration: "none",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: active ? "var(--accent)" : "var(--text-1)",
                          borderLeft: `2px solid ${active ? "var(--accent)" : "transparent"}`,
                        }}
                      >
                        {s.icon && <span style={{ fontSize: "0.85rem" }}>{s.icon}</span>}
                        {s.navLabel}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          <div style={{ width: 1, height: 14, background: "var(--border-hi)", margin: "0 0.4rem" }} />

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="mono"
            aria-label={`Cambiar a tema ${theme === "dark" ? "claro" : "oscuro"}`}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: "0.6rem", padding: "0.3rem" }}
          >
            {theme === "dark" ? "◐ light" : "◑ dark"}
          </button>

          {/* UserMenu */}
          {userSlot && (
            <>
              <div style={{ width: 1, height: 14, background: "var(--border-hi)", margin: "0 0.4rem" }} />
              <div style={{ display: "flex", alignItems: "center" }}>{userSlot}</div>
            </>
          )}
        </div>

        {/* ─── Mobile menu button ──────────────────────────────── */}
        <button
          className="md:hidden mono"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-2)", fontSize: "0.7rem", padding: "0.3rem" }}
        >
          {menuOpen ? "[×]" : "[≡]"}
        </button>
      </div>

      {/* ─── Mobile menu (plano) ───────────────────────────────── */}
      {menuOpen && (
        <div
          className="md:hidden fade-in"
          style={{ borderTop: "1px solid var(--border)", background: "var(--bg-1)", padding: "0.5rem 0", maxHeight: "80vh", overflowY: "auto" }}
        >
          <div className="wrap flex flex-col">
            {/* Lista plana de enlaces directos: clínicos + producto, luego secundarios */}
            {[...primary, ...secondary].map((s) => {
              const active = isActive(s.slug, s.slug === "/");
              return (
                <Link
                  key={s.slug}
                  href={s.slug}
                  onClick={() => setMenuOpen(false)}
                  className="mono"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: s.urgent ? "var(--red)" : active ? "var(--accent)" : "var(--text-2)",
                    fontWeight: s.urgent ? 700 : 400,
                    fontSize: "0.75rem",
                    padding: "0.55rem 0",
                    textDecoration: "none",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {s.icon && <span>{s.icon}</span>}
                  <span>{s.navLabel}</span>
                  {s.isNew && <span style={{ color: "var(--accent)", fontSize: "0.5rem" }}>new</span>}
                </Link>
              );
            })}

            {/* Theme toggle */}
            <button
              onClick={() => {
                toggle();
                setMenuOpen(false);
              }}
              className="mono"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-3)",
                fontSize: "0.65rem",
                padding: "0.55rem 0",
                textAlign: "left",
                borderBottom: userSlot ? "1px solid var(--border)" : "none",
              }}
            >
              {theme === "dark" ? "◐ cambiar a light" : "◑ cambiar a dark"}
            </button>

            {/* UserMenu */}
            {userSlot && <div style={{ padding: "0.5rem 0 0.25rem" }}>{userSlot}</div>}
          </div>
        </div>
      )}
    </nav>
  );
}
