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
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="container-dec flex items-center justify-between h-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span
            className="text-xs font-bold tracking-widest"
            style={{ color: "var(--accent)" }}
          >
            ▸ DEC
          </span>
          <span
            className="text-xs hidden sm:inline"
            style={{ color: "var(--text-muted)", fontFamily: "SF Mono, monospace" }}
          >
            α 0.1
          </span> 
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-0">
          <NavLink href="/" active={pathname === "/"}>
            inicio
          </NavLink>
          <NavLink href="/farmacos" active={isActive("/farmacos")}>
            fármacos
          </NavLink>

          {/* Separator */}
          <div
            className="w-px h-4 mx-2"
            style={{ background: "var(--border-light)" }}
          />

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="px-2 py-1 text-xs transition-colors"
            style={{
              color: "var(--text-muted)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: "SF Mono, monospace",
            }}
            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
          >
            {theme === "dark" ? "[light]" : "[dark]"}
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-3 py-1 text-xs no-underline transition-colors"
      style={{
        color: active ? "var(--accent)" : "var(--text-muted)",
        fontFamily: "SF Mono, monospace",
        borderBottom: active ? "1px solid var(--accent)" : "1px solid transparent",
      }}
    >
      {children}
    </Link>
  );
}
