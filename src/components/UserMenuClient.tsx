// src/components/UserMenuClient.tsx
//
// Parte client del UserMenu — dropdown interactivo.

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile, SubscriptionTier } from "@/lib/auth";

const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: "Free",
  pro_monthly: "Pro Mensual",
  pro_annual: "Pro Anual",
  pro_lifetime: "Pro Lifetime",
  pro_student: "Pro Estudiante",
};

export function UserMenuClient({
  profile,
  tier,
  isAdmin = false,
}: {
  profile: Profile;
  tier: SubscriptionTier;
  isAdmin?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Cerrar al click fuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Cerrar con Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  async function onSignOut() {
    setSigningOut(true);
    try {
      await fetch("/auth/signout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

  const initial = (profile.display_name ?? profile.email ?? "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  const isPro = tier !== "free";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="user-menu-btn"
      >
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            width={28}
            height={28}
            style={{ borderRadius: "50%" }}
          />
        ) : (
          <span className="user-menu-initial">{initial}</span>
        )}
        <span
          className="mono"
          style={{
            fontSize: "0.62rem",
            color: isPro ? "var(--accent)" : "var(--text-3)",
            letterSpacing: "0.06em",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          {TIER_LABELS[tier]}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: "220px",
            background: "var(--bg-1)",
            border: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            zIndex: 100,
          }}
        >
          {/* Identidad */}
          <div
            style={{
              padding: "0.7rem 0.85rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: "0.82rem",
                color: "var(--text-0)",
                fontWeight: 600,
                marginBottom: "0.1rem",
              }}
            >
              {profile.display_name ?? "Sin nombre"}
            </div>
            <div
              className="mono"
              style={{
                fontSize: "0.66rem",
                color: "var(--text-3)",
                wordBreak: "break-all",
              }}
            >
              {profile.email}
            </div>
          </div>

          {/* Items */}
          <Link
            href="/perfil"
            onClick={() => setOpen(false)}
            className="user-menu-item"
          >
            Mi perfil
          </Link>
          {!isPro && (
            <Link
              href="/pro"
              onClick={() => setOpen(false)}
              className="user-menu-item user-menu-item-accent"
            >
              ⚡ Pasar a Pro
            </Link>
          )}
          {isPro && (
            <Link
              href="/account/billing"
              onClick={() => setOpen(false)}
              className="user-menu-item"
            >
              Facturación
            </Link>
          )}
          <Link
            href="/account/codes"
            onClick={() => setOpen(false)}
            className="user-menu-item"
          >
            Canjear código
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="user-menu-item user-menu-item-admin"
            >
              ⚙ Admin
            </Link>
          )}

          <button
            type="button"
            onClick={onSignOut}
            disabled={signingOut}
            className="user-menu-item user-menu-item-signout"
          >
            {signingOut ? "Cerrando…" : "Cerrar sesión"}
          </button>
        </div>
      )}

      <style jsx>{`
        .user-menu-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.3rem 0.55rem 0.3rem 0.3rem;
          background: transparent;
          color: var(--text-0);
          border: 1px solid var(--border);
          font-family: inherit;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .user-menu-btn:hover {
          border-color: var(--text-3);
        }
        .user-menu-initial {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: var(--accent);
          color: var(--bg-0);
          font-weight: 700;
          font-size: 0.85rem;
          border-radius: 50%;
        }
        :global(.user-menu-item) {
          display: block;
          padding: 0.55rem 0.85rem;
          color: var(--text-1);
          text-decoration: none;
          font-size: 0.78rem;
          background: transparent;
          border: none;
          font-family: inherit;
          text-align: left;
          cursor: pointer;
          transition: background 0.1s;
        }
        :global(.user-menu-item:hover) {
          background: var(--bg-0);
          color: var(--text-0);
        }
        :global(.user-menu-item-accent) {
          color: var(--accent);
          font-weight: 600;
        }
        :global(.user-menu-item-admin) {
          color: var(--text-2);
          border-top: 1px solid var(--border);
          font-family: "JetBrains Mono", monospace;
          font-size: 0.72rem;
          letter-spacing: 0.03em;
        }
        :global(.user-menu-item-signout) {
          color: var(--red);
          border-top: 1px solid var(--border);
        }
        :global(.user-menu-item-signout:hover) {
          background: var(--bg-0);
          color: var(--red);
        }
      `}</style>
    </div>
  );
}
