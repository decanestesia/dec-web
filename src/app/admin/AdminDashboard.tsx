// src/app/admin/AdminDashboard.tsx
//
// Parte client del panel de admin. Recibe la lista inicial de usuarios (ya
// cargada y gateada en el server component) y maneja la interacción:
// búsqueda en vivo, dar Pro, revocar y generar cupones. Cada mutación llama
// una server action (que RE-verifica isAdmin y usa la RPC con la sesión).

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  listUsers,
  grantSubscription,
  revokeSubscription,
  createCompCode,
  type AdminUserRow,
} from "./admin-actions";

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  pro_monthly: "Pro Mensual",
  pro_annual: "Pro Anual",
  pro_lifetime: "Pro Lifetime",
  pro_student: "Pro Estudiante",
};

const GRANT_TIER_OPTIONS = [
  { value: "pro_monthly", label: "Pro Mensual" },
  { value: "pro_annual", label: "Pro Anual" },
  { value: "pro_lifetime", label: "Pro Lifetime" },
  { value: "free", label: "Free (degradar)" },
];

const CODE_TIER_OPTIONS = [
  { value: "pro_monthly", label: "Pro Mensual" },
  { value: "pro_annual", label: "Pro Anual" },
  { value: "pro_lifetime", label: "Pro Lifetime" },
];

function tierLabel(t: string | null): string {
  if (!t) return "—";
  return TIER_LABELS[t] ?? t;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-DO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type Feedback = { kind: "ok" | "error"; msg: string } | null;

export function AdminDashboard({
  initialUsers,
  loadError,
}: {
  initialUsers: AdminUserRow[];
  loadError: string | null;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserRow[]>(initialUsers);
  const [tableError, setTableError] = useState<string | null>(loadError);
  const [query, setQuery] = useState("");
  const [refreshing, startRefresh] = useTransition();

  async function refresh() {
    startRefresh(async () => {
      const res = await listUsers();
      if (res.ok) {
        setUsers(res.data ?? []);
        setTableError(null);
      } else {
        setTableError(res.error);
      }
      router.refresh();
    });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const hay = `${u.email ?? ""} ${u.display_name ?? ""} ${
        u.role ?? ""
      } ${u.active_tier ?? ""} ${u.sub_platform ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [users, query]);

  const proCount = useMemo(
    () => users.filter((u) => u.active_tier && u.active_tier !== "free").length,
    [users]
  );

  return (
    <div className="wrap admin-wrap" style={{ padding: "3rem 0 5rem" }}>
      {/* Encabezado */}
      <header style={{ marginBottom: "2rem" }}>
        <div className="prompt mono" style={{ marginBottom: "0.75rem" }}>
          <b>$</b> dec admin --console
        </div>
        <h1
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Panel de administración
        </h1>
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.68rem",
            marginTop: "0.5rem",
            opacity: 0.75,
          }}
        >
          {`// ${users.length} usuarios · ${proCount} pro · con gran poder viene mucho SQL`}
        </p>
      </header>

      {/* Acciones */}
      <div className="admin-actions-grid">
        <GrantCard onDone={refresh} />
        <RevokeCard onDone={refresh} />
        <CompCodeCard />
      </div>

      {/* Usuarios */}
      <section style={{ marginTop: "2.5rem" }}>
        <SectionTitle
          label="usuarios"
          extra={
            <button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              className="admin-refresh mono"
            >
              {refreshing ? "actualizando…" : "↻ refrescar"}
            </button>
          }
        />

        <div className="admin-search search-box" style={{ margin: "0.85rem 0" }}>
          <span className="search-icon">▸</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por email, nombre, rol, plan…"
            aria-label="Buscar usuarios"
          />
        </div>

        {tableError && (
          <p className="mono" style={{ color: "var(--red)", fontSize: "0.75rem" }}>
            ✗ {tableError}
          </p>
        )}

        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Plan activo</th>
                <th>Plataforma</th>
                <th>Vence</th>
                <th style={{ textAlign: "right" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-empty mono">
                    {query
                      ? "// sin coincidencias"
                      : "// no hay usuarios que mostrar"}
                  </td>
                </tr>
              ) : (
                filtered.map((u, i) => {
                  const isProRow = !!u.active_tier && u.active_tier !== "free";
                  return (
                    <tr key={u.email ?? i}>
                      <td className="mono admin-email">
                        {u.email ?? "—"}
                        {u.is_admin && (
                          <span className="admin-badge">admin</span>
                        )}
                      </td>
                      <td>{u.display_name ?? "—"}</td>
                      <td className="mono admin-dim">{u.role ?? "—"}</td>
                      <td>
                        <span
                          className="mono"
                          style={{
                            color: isProRow ? "var(--accent)" : "var(--text-3)",
                            fontWeight: 600,
                            fontSize: "0.7rem",
                          }}
                        >
                          {tierLabel(u.active_tier)}
                        </span>
                      </td>
                      <td className="mono admin-dim">{u.sub_platform ?? "—"}</td>
                      <td className="mono admin-dim">{fmtDate(u.sub_expires)}</td>
                      <td style={{ textAlign: "right" }}>
                        {isProRow && u.email && (
                          <RevokeInlineButton email={u.email} onDone={refresh} />
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <style jsx>{`
        .admin-wrap {
          max-width: 1080px;
        }
        .admin-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
        }
        .admin-refresh {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-2);
          font-size: 0.62rem;
          padding: 0.3rem 0.55rem;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .admin-refresh:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent);
        }
        .admin-refresh:disabled {
          cursor: wait;
          opacity: 0.6;
        }
        .admin-table-scroll {
          overflow-x: auto;
          border: 1px solid var(--border);
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.78rem;
          min-width: 780px;
        }
        .admin-table thead th {
          text-align: left;
          padding: 0.55rem 0.7rem;
          font-family: "JetBrains Mono", monospace;
          font-size: 0.58rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-3);
          font-weight: 600;
          background: var(--bg-1);
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        .admin-table tbody td {
          padding: 0.5rem 0.7rem;
          border-bottom: 1px solid var(--border);
          color: var(--text-1);
          vertical-align: middle;
        }
        .admin-table tbody tr:hover td {
          background: var(--bg-1);
        }
        :global(.admin-email) {
          font-size: 0.72rem;
          color: var(--text-0);
          word-break: break-all;
        }
        :global(.admin-dim) {
          color: var(--text-3);
          font-size: 0.72rem;
        }
        :global(.admin-badge) {
          display: inline-block;
          margin-left: 0.4rem;
          padding: 0.05rem 0.3rem;
          font-family: "JetBrains Mono", monospace;
          font-size: 0.52rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--accent);
          border: 1px solid var(--accent-border);
          background: var(--accent-glow);
          vertical-align: middle;
        }
        .admin-empty {
          text-align: center;
          color: var(--text-3);
          padding: 1.5rem 0.7rem;
          font-size: 0.72rem;
        }
      `}</style>
    </div>
  );
}

// ─── Sección: título con línea ────────────────────────────────────────
function SectionTitle({
  label,
  extra,
}: {
  label: string;
  extra?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
        borderBottom: "1px solid var(--border)",
        paddingBottom: "0.5rem",
      }}
    >
      <span
        className="mono"
        style={{
          fontSize: "0.62rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-2)",
          fontWeight: 600,
        }}
      >
        {label}
      </span>
      {extra}
    </div>
  );
}

// ─── Card contenedor ──────────────────────────────────────────────────
function ActionCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: "var(--bg-2)", padding: "1rem 1.1rem" }}>
      <div
        className="mono"
        style={{
          fontSize: "0.62rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-2)",
          fontWeight: 600,
          marginBottom: "0.15rem",
        }}
      >
        {title}
      </div>
      <p
        className="mono"
        style={{
          fontSize: "0.6rem",
          color: "var(--text-3)",
          opacity: 0.8,
          margin: "0 0 0.85rem",
          lineHeight: 1.5,
        }}
      >
        {hint}
      </p>
      {children}
    </div>
  );
}

function FeedbackLine({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return (
    <p
      className="mono"
      role="status"
      style={{
        fontSize: "0.68rem",
        margin: "0.6rem 0 0",
        lineHeight: 1.5,
        wordBreak: "break-word",
        color: feedback.kind === "ok" ? "var(--accent)" : "var(--red)",
      }}
    >
      {feedback.kind === "ok" ? "✓ " : "✗ "}
      {feedback.msg}
    </p>
  );
}

// ─── 2. Dar Pro ───────────────────────────────────────────────────────
function GrantCard({ onDone }: { onDone: () => void }) {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, start] = useTransition();

  function onSubmit(formData: FormData) {
    setFeedback(null);
    start(async () => {
      const res = await grantSubscription(formData);
      if (res.ok) {
        setFeedback({ kind: "ok", msg: "Suscripción aplicada." });
        onDone();
      } else {
        setFeedback({ kind: "error", msg: res.error });
      }
    });
  }

  return (
    <ActionCard
      title="Dar / cambiar plan"
      hint="Asigna un tier a una cuenta existente. Días vacío o 0 = indefinido."
    >
      <form action={onSubmit} className="admin-form">
        <input
          name="email"
          type="email"
          required
          placeholder="email@usuario.com"
          className="calc-input"
          disabled={pending}
        />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <select
            name="tier"
            className="calc-select"
            defaultValue="pro_monthly"
            disabled={pending}
            style={{ flex: 2 }}
          >
            {GRANT_TIER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <input
            name="days"
            type="number"
            min={0}
            placeholder="días"
            className="calc-input"
            disabled={pending}
            style={{ flex: 1, minWidth: 0 }}
            aria-label="Días de vigencia (vacío = indefinido)"
          />
        </div>
        <button type="submit" className="admin-submit" disabled={pending}>
          {pending ? "aplicando…" : "aplicar plan"}
        </button>
      </form>
      <FeedbackLine feedback={feedback} />
      <style jsx>{adminFormCss}</style>
    </ActionCard>
  );
}

// ─── 3. Revocar (por email) ───────────────────────────────────────────
function RevokeCard({ onDone }: { onDone: () => void }) {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, start] = useTransition();

  function onSubmit(formData: FormData) {
    setFeedback(null);
    start(async () => {
      const res = await revokeSubscription(formData);
      if (res.ok) {
        setFeedback({ kind: "ok", msg: "Revocado → free." });
        onDone();
      } else {
        setFeedback({ kind: "error", msg: res.error });
      }
    });
  }

  return (
    <ActionCard
      title="Revocar plan"
      hint="Baja una cuenta a free. Útil si un comp/regalo debe terminar."
    >
      <form action={onSubmit} className="admin-form">
        <input
          name="email"
          type="email"
          required
          placeholder="email@usuario.com"
          className="calc-input"
          disabled={pending}
        />
        <button type="submit" className="admin-submit admin-submit-danger" disabled={pending}>
          {pending ? "revocando…" : "revocar → free"}
        </button>
      </form>
      <FeedbackLine feedback={feedback} />
      <style jsx>{adminFormCss}</style>
    </ActionCard>
  );
}

// ─── 4. Generar cupón (offer code Apple) ──────────────────────────────
function CompCodeCard() {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  function onSubmit(formData: FormData) {
    setFeedback(null);
    setCode(null);
    setCopied(false);
    start(async () => {
      const res = await createCompCode(formData);
      if (res.ok && res.data) {
        setCode(res.data);
      } else {
        setFeedback({
          kind: "error",
          msg: res.ok ? "Respuesta vacía." : res.error,
        });
      }
    });
  }

  async function copy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard bloqueado — el usuario copia a mano
    }
  }

  return (
    <ActionCard
      title="Generar cupón"
      hint="Crea un código de canje. Días vacío o 0 = indefinido."
    >
      <form action={onSubmit} className="admin-form">
        <select
          name="tier"
          className="calc-select"
          defaultValue="pro_monthly"
          disabled={pending}
        >
          {CODE_TIER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          name="days"
          type="number"
          min={0}
          placeholder="días (vacío = indefinido)"
          className="calc-input"
          disabled={pending}
        />
        <input
          name="notes"
          type="text"
          maxLength={200}
          placeholder="notas (ej: regalo congreso SDA)"
          className="calc-input"
          disabled={pending}
        />
        <button type="submit" className="admin-submit" disabled={pending}>
          {pending ? "generando…" : "generar código"}
        </button>
      </form>

      {code && (
        <div className="admin-code-out">
          <code className="admin-code mono">{code}</code>
          <button type="button" onClick={copy} className="admin-copy mono">
            {copied ? "✓ copiado" : "copiar"}
          </button>
        </div>
      )}

      <p
        className="mono"
        style={{
          fontSize: "0.58rem",
          color: "var(--text-3)",
          opacity: 0.85,
          margin: "0.7rem 0 0",
          lineHeight: 1.55,
        }}
      >
        {
          "// el usuario lo canjea en la App Store (offer code). El cobro y la conversión a pago los maneja Apple, no DEC."
        }
      </p>

      <FeedbackLine feedback={feedback} />
      <style jsx>{`
        ${adminFormCss}
        .admin-code-out {
          display: flex;
          align-items: stretch;
          gap: 0.5rem;
          margin-top: 0.85rem;
        }
        .admin-code {
          flex: 1;
          min-width: 0;
          padding: 0.5rem 0.6rem;
          background: var(--bg-0);
          border: 1px solid var(--accent-border);
          color: var(--accent);
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          word-break: break-all;
          display: flex;
          align-items: center;
        }
        .admin-copy {
          padding: 0.5rem 0.7rem;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-2);
          font-size: 0.66rem;
          cursor: pointer;
          white-space: nowrap;
          transition: border-color 0.15s, color 0.15s;
        }
        .admin-copy:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
      `}</style>
    </ActionCard>
  );
}

// ─── Botón revocar inline en la fila de la tabla ──────────────────────
function RevokeInlineButton({
  email,
  onDone,
}: {
  email: string;
  onDone: () => void;
}) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);

  function onClick() {
    if (!confirm(`¿Revocar el plan de ${email} y bajarlo a free?`)) return;
    start(async () => {
      const fd = new FormData();
      fd.set("email", email);
      const res = await revokeSubscription(fd);
      if (res.ok) {
        setDone(true);
        onDone();
      } else {
        alert(res.error);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending || done}
      className="admin-inline-revoke mono"
    >
      {pending ? "…" : done ? "✓" : "revocar"}
      <style jsx>{`
        .admin-inline-revoke {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-3);
          font-size: 0.62rem;
          padding: 0.25rem 0.5rem;
          cursor: pointer;
          white-space: nowrap;
          transition: border-color 0.15s, color 0.15s;
        }
        .admin-inline-revoke:hover:not(:disabled) {
          border-color: var(--red);
          color: var(--red);
        }
        .admin-inline-revoke:disabled {
          cursor: default;
          opacity: 0.6;
        }
      `}</style>
    </button>
  );
}

// CSS compartido de los forms de las cards (se inyecta en cada styled-jsx).
const adminFormCss = `
  .admin-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .admin-submit {
    margin-top: 0.15rem;
    padding: 0.55rem 0.7rem;
    background: var(--accent);
    color: var(--bg-0);
    border: none;
    font-size: 0.72rem;
    font-weight: 700;
    font-family: "JetBrains Mono", monospace;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.05s;
  }
  .admin-submit:hover:not(:disabled) {
    opacity: 0.9;
  }
  .admin-submit:active:not(:disabled) {
    transform: translateY(1px);
  }
  .admin-submit:disabled {
    cursor: wait;
    opacity: 0.55;
  }
  .admin-submit-danger {
    background: transparent;
    color: var(--red);
    border: 1px solid var(--red);
  }
  .admin-submit-danger:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.08);
    opacity: 1;
  }
`;
