// src/app/perfil/ProfileForm.tsx
//
// Formulario editable del perfil. "use client" — maneja estado local
// (rol → muestra/oculta año de residencia, año de nacimiento → edad calculada)
// y feedback de guardado. El UPDATE lo hace la server action `updateProfile`
// (RLS server-side); aquí solo recogemos el FormData y pintamos el resultado.

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/auth";
import { updateProfile } from "./profile-actions";

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "— Seleccionar —" },
  { value: "anesthesiologist", label: "Anestesiólogo/a" },
  { value: "resident", label: "Residente de anestesiología" },
  { value: "fellow", label: "Fellow" },
  { value: "crna", label: "Enfermero/a anestesista (CRNA)" },
  { value: "medical_student", label: "Estudiante de medicina" },
  { value: "other_hcp", label: "Otro profesional de salud" },
];

const SPECIALTY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "— Seleccionar —" },
  { value: "general", label: "General" },
  { value: "cardiovascular", label: "Cardiovascular" },
  { value: "pediatric", label: "Pediátrica" },
  { value: "obstetric", label: "Obstétrica" },
  { value: "regional_pain", label: "Regional / Dolor" },
  { value: "neuro", label: "Neuroanestesia" },
  { value: "critical_care", label: "Cuidados críticos" },
  { value: "other", label: "Otra" },
];

const LOCALE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "— Seleccionar —" },
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
];

const CURRENT_YEAR = new Date().getFullYear();

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<
    { kind: "ok" | "error"; msg: string } | null
  >(null);

  // Estado controlado solo para los campos con lógica derivada.
  const [role, setRole] = useState(profile.role ?? "");
  const [birthYear, setBirthYear] = useState(
    profile.birth_year != null ? String(profile.birth_year) : ""
  );

  const showTrainingYear = role === "resident" || role === "fellow";

  const parsedBirth = Number.parseInt(birthYear, 10);
  const age =
    !Number.isNaN(parsedBirth) &&
    parsedBirth >= 1900 &&
    parsedBirth <= CURRENT_YEAR
      ? CURRENT_YEAR - parsedBirth
      : null;

  function onSubmit(formData: FormData) {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.ok) {
        setFeedback({ kind: "ok", msg: "Cambios guardados." });
        router.refresh(); // refresca el server component (y el navbar).
      } else {
        setFeedback({ kind: "error", msg: result.error });
      }
    });
  }

  return (
    <form
      action={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <FieldText
        label="Nombre para mostrar"
        name="display_name"
        defaultValue={profile.display_name ?? ""}
        required
        disabled={isPending}
        maxLength={80}
      />

      {/* Email — solo lectura, viene de la sesión */}
      <Field label="Email" hint="Vinculado a tu inicio de sesión — no editable aquí.">
        <div className="profile-readonly mono">{profile.email ?? "—"}</div>
      </Field>

      <FieldSelect
        label="Rol profesional"
        name="role"
        value={role}
        onChange={setRole}
        options={ROLE_OPTIONS}
        disabled={isPending}
      />

      <FieldSelect
        label="Subespecialidad"
        name="specialty"
        defaultValue={profile.specialty ?? ""}
        options={SPECIALTY_OPTIONS}
        disabled={isPending}
      />

      {showTrainingYear && (
        <FieldText
          label="Año de residencia / fellow"
          name="training_year"
          type="number"
          defaultValue={
            profile.training_year != null ? String(profile.training_year) : ""
          }
          disabled={isPending}
          min={1}
          max={12}
          hint="Ej: 3 (tercer año)."
        />
      )}

      <FieldText
        label="Institución / hospital"
        name="institution"
        defaultValue={profile.institution ?? ""}
        disabled={isPending}
        maxLength={120}
      />

      <FieldText
        label="País"
        name="country_code"
        defaultValue={profile.country_code ?? ""}
        disabled={isPending}
        maxLength={56}
        hint="Ej: República Dominicana."
      />

      <FieldSelect
        label="Idioma"
        name="locale"
        defaultValue={profile.locale ?? ""}
        options={LOCALE_OPTIONS}
        disabled={isPending}
      />

      <FieldText
        label="Año de nacimiento"
        name="birth_year"
        type="number"
        value={birthYear}
        onChange={setBirthYear}
        disabled={isPending}
        min={1900}
        max={CURRENT_YEAR}
        adornment={
          age != null ? (
            <span className="profile-age mono">{age} años</span>
          ) : null
        }
      />

      {feedback && (
        <p
          className="mono"
          role="status"
          style={{
            fontSize: "0.72rem",
            margin: 0,
            color: feedback.kind === "ok" ? "var(--accent)" : "var(--red)",
          }}
        >
          {feedback.kind === "ok" ? "✓ " : "✗ "}
          {feedback.msg}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="profile-submit"
        style={{ opacity: isPending ? 0.55 : 1 }}
      >
        {isPending ? "Guardando…" : "Guardar cambios"}
      </button>

      <style jsx>{`
        .profile-submit {
          margin-top: 0.25rem;
          padding: 0.7rem 0.75rem;
          background: var(--accent);
          color: var(--bg-0);
          border: none;
          font-size: 0.82rem;
          font-weight: 600;
          font-family: inherit;
          letter-spacing: 0.02em;
          cursor: pointer;
          align-self: flex-start;
          transition: opacity 0.15s, transform 0.05s;
        }
        .profile-submit:hover:not(:disabled) {
          opacity: 0.9;
        }
        .profile-submit:active:not(:disabled) {
          transform: translateY(1px);
        }
        .profile-submit:disabled {
          cursor: wait;
        }
        :global(.profile-readonly) {
          padding: 0.5rem 0.6rem;
          background: var(--bg-0);
          color: var(--text-2);
          border: 1px solid var(--border);
          font-size: 0.82rem;
          word-break: break-all;
        }
        :global(.profile-age) {
          font-size: 0.68rem;
          color: var(--text-3);
          white-space: nowrap;
        }
      `}</style>
    </form>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <span className="profile-label mono">{label.toUpperCase()}</span>
      {children}
      {hint && <span className="profile-hint mono">{hint}</span>}
      <style jsx>{`
        :global(.profile-label) {
          font-size: 0.6rem;
          letter-spacing: 0.08em;
          color: var(--text-3);
          font-weight: 600;
        }
        :global(.profile-hint) {
          font-size: 0.62rem;
          color: var(--text-3);
          opacity: 0.75;
        }
      `}</style>
    </label>
  );
}

function FieldText({
  label,
  name,
  type = "text",
  defaultValue,
  value,
  onChange,
  required,
  disabled,
  hint,
  min,
  max,
  maxLength,
  adornment,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (v: string) => void;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  adornment?: React.ReactNode;
}) {
  const controlled = value !== undefined;
  return (
    <Field label={label} hint={hint}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <input
          name={name}
          type={type}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          maxLength={maxLength}
          className="profile-input"
          {...(controlled
            ? { value, onChange: (e) => onChange?.(e.target.value) }
            : { defaultValue })}
          style={{ flex: 1 }}
        />
        {adornment}
      </div>
      <style jsx>{`
        :global(.profile-input) {
          padding: 0.5rem 0.6rem;
          background: var(--bg-0);
          color: var(--text-0);
          border: 1px solid var(--border);
          font-size: 0.82rem;
          font-family: inherit;
          width: 100%;
          transition: border-color 0.15s;
        }
        :global(.profile-input:focus) {
          outline: none;
          border-color: var(--accent);
        }
        :global(.profile-input:disabled) {
          opacity: 0.5;
          cursor: wait;
        }
      `}</style>
    </Field>
  );
}

function FieldSelect({
  label,
  name,
  options,
  defaultValue,
  value,
  onChange,
  disabled,
  hint,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  value?: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  hint?: string;
}) {
  const controlled = value !== undefined;
  return (
    <Field label={label} hint={hint}>
      <select
        name={name}
        disabled={disabled}
        className="profile-input"
        {...(controlled
          ? { value, onChange: (e) => onChange?.(e.target.value) }
          : { defaultValue })}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <style jsx>{`
        :global(select.profile-input) {
          padding: 0.5rem 0.6rem;
          background: var(--bg-0);
          color: var(--text-0);
          border: 1px solid var(--border);
          font-size: 0.82rem;
          font-family: inherit;
          width: 100%;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        :global(select.profile-input:focus) {
          outline: none;
          border-color: var(--accent);
        }
        :global(select.profile-input:disabled) {
          opacity: 0.5;
          cursor: wait;
        }
      `}</style>
    </Field>
  );
}
