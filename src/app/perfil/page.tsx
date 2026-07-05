// src/app/perfil/page.tsx
//
// Perfil / ajustes de cuenta. Server component: gatea la sesión, carga el
// profile del usuario (RLS: solo su fila) y su estado de cuenta (tier Pro +
// can_publish), y delega el form editable a <ProfileForm> (client).
//
// Gate: sin sesión → redirect a /auth/login?next=/perfil.

import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getUser,
  getProfile,
  getActiveTier,
  type SubscriptionTier,
} from "@/lib/auth";
import { ProfileForm } from "./ProfileForm";
import { SignOutButton } from "./SignOutButton";

export const metadata = {
  title: "Mi perfil — DEC",
  description: "Ajusta tu perfil profesional y las preferencias de tu cuenta DEC.",
};

// Datos frescos siempre (refleja cambios recién guardados).
export const dynamic = "force-dynamic";

const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: "Free",
  pro_monthly: "Pro Mensual",
  pro_annual: "Pro Anual",
  pro_lifetime: "Pro Lifetime",
  pro_student: "Pro Estudiante",
};

export default async function PerfilPage() {
  // Gate — sin sesión, a login conservando el destino.
  const user = await getUser();
  if (!user) redirect("/auth/login?next=/perfil");

  const profile = await getProfile();

  // Sesión válida pero sin fila en profiles (trigger no corrió / borrada).
  if (!profile) {
    return (
      <div className="wrap" style={{ padding: "3rem 0 4rem", maxWidth: 620 }}>
        <div className="prompt mono" style={{ marginBottom: "1rem" }}>
          <b>$</b> dec whoami
        </div>
        <p style={{ color: "var(--text-1)", fontSize: "0.9rem", lineHeight: 1.6 }}>
          Tu sesión está activa pero no encontramos tu perfil. Escribe a{" "}
          <a href="mailto:soporte@decanestesia.com" style={{ color: "var(--accent)" }}>
            soporte@decanestesia.com
          </a>{" "}
          y lo arreglamos.
        </p>
        <div style={{ marginTop: "1.5rem" }}>
          <SignOutButton />
        </div>
      </div>
    );
  }

  const tier = await getActiveTier();
  const isPro = tier !== "free";
  const canPublish = profile.can_publish === true;

  return (
    <div className="wrap" style={{ padding: "3rem 0 4rem", maxWidth: 620 }}>
      {/* Encabezado */}
      <header style={{ marginBottom: "2rem" }}>
        <div className="prompt mono" style={{ marginBottom: "0.75rem" }}>
          <b>$</b> dec whoami
        </div>
        <h1
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Mi perfil
        </h1>
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.68rem",
            marginTop: "0.5rem",
            opacity: 0.7,
          }}
        >
          {"// tus datos son tuyos — nada de esto es obligatorio salvo el nombre"}
        </p>
      </header>

      {/* Estado de cuenta — solo lectura */}
      <section
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.6rem",
          marginBottom: "2rem",
        }}
      >
        <StatusChip
          label="Plan"
          value={TIER_LABELS[tier]}
          accent={isPro}
        />
        <StatusChip
          label="Blog"
          value={canPublish ? "Puede publicar" : "Solo lectura"}
          accent={canPublish}
        />
        {!isPro && (
          <Link
            href="/pro"
            className="mono"
            style={{
              alignSelf: "center",
              fontSize: "0.7rem",
              color: "var(--accent)",
              textDecoration: "underline",
            }}
          >
            ⚡ Pasar a Pro
          </Link>
        )}
      </section>

      {/* Formulario editable */}
      <ProfileForm profile={profile} />

      {/* Cerrar sesión */}
      <div
        style={{
          marginTop: "2.5rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        <SignOutButton />
      </div>
    </div>
  );
}

function StatusChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.15rem",
        padding: "0.5rem 0.75rem",
        border: `1px solid ${accent ? "var(--accent-border)" : "var(--border)"}`,
        background: accent ? "var(--accent-glow)" : "var(--bg-1)",
        minWidth: 120,
      }}
    >
      <span
        className="mono"
        style={{
          fontSize: "0.56rem",
          letterSpacing: "0.1em",
          color: "var(--text-3)",
          fontWeight: 600,
        }}
      >
        {label.toUpperCase()}
      </span>
      <span
        style={{
          fontSize: "0.82rem",
          fontWeight: 600,
          color: accent ? "var(--accent)" : "var(--text-1)",
        }}
      >
        {value}
      </span>
    </div>
  );
}
