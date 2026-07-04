"use client";

import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { navCategories, navSections, type Category, type Section } from "@/lib/registry";

// El navbar se DERIVA del registro central (src/lib/registry.ts). Los items y su
// agrupación por categoría salen de SECTIONS/CATEGORIES: agregar una sección al
// registro la hace aparecer aquí sola. /manual va destacado aparte; /codigo
// conserva su acento rojo de urgencia.

const MANUAL_SLUG = "/manual";

export function Navbar({ userSlot }: { userSlot?: ReactNode }) {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false); // menú móvil
  const [openCat, setOpenCat] = useState<Category | null>(null); // dropdown desktop
  const [openMobileCat, setOpenMobileCat] = useState<Category | null>(null); // colapsable móvil
  const navRef = useRef<HTMLElement>(null);

  const isActive = (path: string, exact = false) =>
    exact ? pathname === path : pathname === path || pathname.startsWith(path + "/");

  // Categorías con secciones visibles (excluye /manual, que va aparte).
  const cats = navCategories().map((c) => ({
    ...c,
    sections: navSections(c.key).filter((s) => s.slug !== MANUAL_SLUG),
  })).filter((c) => c.sections.length > 0);

  const catActive = (sections: Section[]) => sections.some((s) => isActive(s.slug, s.slug === "/"));

  // Cerrar dropdown de desktop al hacer click fuera o cambiar de ruta.
  useEffect(() => {
    setOpenCat(null);
  }, [pathname]);

  useEffect(() => {
    if (openCat === null) return;
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenCat(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenCat(null);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openCat]);

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

        {/* ─── Desktop nav ─────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-0.5">
          {cats.map((c) => {
            const active = catActive(c.sections);
            const open = openCat === c.key;
            return (
              <div key={c.key} style={{ position: "relative" }}>
                <button
                  onClick={() => setOpenCat(open ? null : c.key)}
                  className={`nav-link ${active ? "nav-link-active" : ""}`}
                  aria-haspopup="true"
                  aria-expanded={open}
                  style={{
                    background: "none",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.2rem",
                    borderBottomColor: active || open ? "var(--accent)" : "transparent",
                    color: open ? "var(--accent)" : undefined,
                  }}
                >
                  {c.label}
                  <span style={{ fontSize: "0.55rem", opacity: 0.7 }}>{open ? "▴" : "▾"}</span>
                </button>

                {/* Dropdown */}
                {open && (
                  <div
                    className="fade-in"
                    role="menu"
                    style={{
                      position: "absolute",
                      top: "calc(100% + 1px)",
                      right: 0,
                      minWidth: 260,
                      background: "var(--bg-1)",
                      border: "1px solid var(--border-hi)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                      padding: "0.35rem",
                      zIndex: 60,
                    }}
                  >
                    <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", padding: "0.3rem 0.5rem 0.4rem", letterSpacing: "0.06em" }}>
                      {c.desc}
                    </div>
                    {c.sections.map((s) => {
                      const linkActive = isActive(s.slug, s.slug === "/");
                      return (
                        <Link
                          key={s.slug}
                          href={s.slug}
                          role="menuitem"
                          onClick={() => setOpenCat(null)}
                          className="card-interactive"
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.5rem",
                            padding: "0.45rem 0.5rem",
                            textDecoration: "none",
                            borderLeft: `2px solid ${linkActive ? (s.urgent ? "var(--red)" : "var(--accent)") : "transparent"}`,
                          }}
                        >
                          {s.icon && <span style={{ fontSize: "0.9rem", lineHeight: 1.3 }}>{s.icon}</span>}
                          <span style={{ minWidth: 0 }}>
                            <span
                              className="mono"
                              style={{
                                display: "block",
                                fontSize: "0.72rem",
                                fontWeight: 600,
                                color: s.urgent ? "var(--red)" : linkActive ? "var(--accent)" : "var(--text-1)",
                              }}
                            >
                              {s.navLabel}
                              {s.isNew && (
                                <span style={{ color: "var(--accent)", fontSize: "0.5rem", marginLeft: "0.35rem", letterSpacing: "0.05em" }}>
                                  new
                                </span>
                              )}
                            </span>
                            <span style={{ display: "block", color: "var(--text-3)", fontSize: "0.62rem", lineHeight: 1.4, marginTop: "0.1rem" }}>
                              {s.short}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Manual destacado */}
          <Link
            href={MANUAL_SLUG}
            className={`nav-link ${isActive(MANUAL_SLUG) ? "nav-link-active" : ""}`}
            style={{
              color: isActive(MANUAL_SLUG) ? "var(--accent)" : "var(--text-1)",
              fontWeight: 600,
              borderBottomColor: isActive(MANUAL_SLUG) ? "var(--accent)" : "transparent",
            }}
          >
            📖 manual
          </Link>

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

      {/* ─── Mobile menu ───────────────────────────────────────── */}
      {menuOpen && (
        <div
          className="md:hidden fade-in"
          style={{ borderTop: "1px solid var(--border)", background: "var(--bg-1)", padding: "0.5rem 0", maxHeight: "80vh", overflowY: "auto" }}
        >
          <div className="wrap flex flex-col gap-0.5">
            {/* Manual destacado arriba */}
            <Link
              href={MANUAL_SLUG}
              onClick={() => setMenuOpen(false)}
              className="mono"
              style={{
                color: isActive(MANUAL_SLUG) ? "var(--accent)" : "var(--text-0)",
                fontWeight: 700,
                fontSize: "0.78rem",
                padding: "0.5rem 0",
                textDecoration: "none",
                borderBottom: "1px solid var(--border)",
              }}
            >
              📖 manual del sistema
            </Link>

            {/* Categorías colapsables */}
            {cats.map((c) => {
              const expanded = openMobileCat === c.key;
              return (
                <div key={c.key} style={{ borderBottom: "1px solid var(--border)" }}>
                  <button
                    onClick={() => setOpenMobileCat(expanded ? null : c.key)}
                    className="mono"
                    aria-expanded={expanded}
                    style={{
                      width: "100%",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: catActive(c.sections) ? "var(--accent)" : "var(--text-2)",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      padding: "0.55rem 0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {c.label}
                    <span style={{ fontSize: "0.6rem", opacity: 0.7 }}>{expanded ? "▴" : "▾"}</span>
                  </button>

                  {expanded && (
                    <div style={{ paddingBottom: "0.4rem" }}>
                      {c.sections.map((s) => {
                        const linkActive = isActive(s.slug, s.slug === "/");
                        return (
                          <Link
                            key={s.slug}
                            href={s.slug}
                            onClick={() => setMenuOpen(false)}
                            className="mono"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              color: s.urgent ? "var(--red)" : linkActive ? "var(--accent)" : "var(--text-2)",
                              fontWeight: s.urgent ? 700 : 400,
                              fontSize: "0.72rem",
                              padding: "0.4rem 0 0.4rem 0.75rem",
                              textDecoration: "none",
                            }}
                          >
                            {s.icon && <span>{s.icon}</span>}
                            <span>→ {s.navLabel}</span>
                            {s.isNew && (
                              <span style={{ color: "var(--accent)", fontSize: "0.5rem" }}>new</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
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
                padding: "0.5rem 0",
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
