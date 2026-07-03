// src/app/auth/_components/OAuthButtons.tsx
//
// Botones OAuth (Google + Apple). Click → redirige a provider.
// Apple es OBLIGATORIO en iOS según App Store guidelines.

"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

type Provider = "google" | "apple";

export function OAuthButtons({ next }: { next?: string }) {
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleOAuth(provider: Provider) {
    setError(null);
    setLoading(provider);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback${
      next ? `?next=${encodeURIComponent(next)}` : ""
    }`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    if (error) {
      setError(error.message);
      setLoading(null);
    }
    // Si éxito, el provider redirige al callback. No reseteamos loading.
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <button
        type="button"
        onClick={() => handleOAuth("apple")}
        disabled={loading !== null}
        className="auth-oauth-btn"
        style={{
          opacity: loading === "google" ? 0.4 : 1,
          cursor: loading ? "wait" : "pointer",
        }}
      >
        <AppleIcon />
        <span>{loading === "apple" ? "Conectando…" : "Continuar con Apple"}</span>
      </button>

      <button
        type="button"
        onClick={() => handleOAuth("google")}
        disabled={loading !== null}
        className="auth-oauth-btn"
        style={{
          opacity: loading === "apple" ? 0.4 : 1,
          cursor: loading ? "wait" : "pointer",
        }}
      >
        <GoogleIcon />
        <span>{loading === "google" ? "Conectando…" : "Continuar con Google"}</span>
      </button>

      {error && (
        <p
          className="mono"
          style={{
            fontSize: "0.7rem",
            color: "var(--red)",
            margin: "0.25rem 0 0",
          }}
        >
          {error}
        </p>
      )}

      <style jsx>{`
        .auth-oauth-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 0.65rem 0.75rem;
          background: var(--bg-0);
          color: var(--text-0);
          border: 1px solid var(--border);
          font-size: 0.82rem;
          font-weight: 500;
          font-family: inherit;
          transition: all 0.15s;
        }
        .auth-oauth-btn:hover:not(:disabled) {
          background: var(--bg-1);
          border-color: var(--text-3);
        }
        .auth-oauth-btn:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

// ─── SVG Icons ────────────────────────────────────────────────────

function AppleIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 384 512"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
