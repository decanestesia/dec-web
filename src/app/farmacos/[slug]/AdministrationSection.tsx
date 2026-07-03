import type { DrugPresentation, DrugAdministration } from "@/lib/drugs";

// ─── Component ───────────────────────────────────────────────────

export function AdministrationSection({
  presentations,
  administration,
}: {
  presentations: DrugPresentation[];
  administration: DrugAdministration | null;
}) {
  // No mostrar si no hay datos
  if (presentations.length === 0 && !administration) return null;

  return (
    <section style={{ marginTop: "2.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
          paddingBottom: "0.4rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h2
          className="mono"
          style={{
            fontSize: "0.7rem",
            color: "var(--text-3)",
            letterSpacing: "0.1em",
            fontWeight: 600,
          }}
        >
          PRESENTACIÓN Y ADMINISTRACIÓN
        </h2>
        <span
          className="mono"
          style={{
            fontSize: "0.55rem",
            color: "var(--text-3)",
            opacity: 0.6,
          }}
        >
          // verifica con farmacia local
        </span>
      </div>

      {presentations.length > 0 && (
        <PresentationsTable presentations={presentations} />
      )}

      {administration && <AdministrationDetails admin={administration} />}

      <div
        className="mono"
        style={{
          marginTop: "1rem",
          padding: "0.6rem 0.8rem",
          background: "var(--bg-1)",
          borderLeft: "2px solid var(--text-3)",
          fontSize: "0.65rem",
          color: "var(--text-3)",
          lineHeight: 1.7,
          opacity: 0.8,
        }}
      >
        // presentaciones de mercados MX/ES/EUA — la tuya puede diferir.
        <br />
        // datos de compatibilidad: Trissel&apos;s Handbook 22e + IV
        compatibility tables.
        <br />
        // siempre verificar etiqueta del fabricante antes de mezclar.
      </div>
    </section>
  );
}

// ─── Presentations table ─────────────────────────────────────────

function PresentationsTable({
  presentations,
}: {
  presentations: DrugPresentation[];
}) {
  // Group by route to show clean
  const byRoute = presentations.reduce<Record<string, DrugPresentation[]>>(
    (acc, p) => {
      const route = p.route || "—";
      if (!acc[route]) acc[route] = [];
      acc[route].push(p);
      return acc;
    },
    {}
  );

  const sortedRoutes = Object.keys(byRoute).sort();

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <h3
        className="mono"
        style={{
          fontSize: "0.62rem",
          color: "var(--accent)",
          letterSpacing: "0.1em",
          fontWeight: 600,
          marginBottom: "0.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "6px",
            height: "6px",
            background: "var(--accent)",
            boxShadow: "0 0 4px var(--accent)",
          }}
        />
        PRESENTACIONES — {presentations.length} formas
      </h3>

      {sortedRoutes.map((route) => (
        <div key={route} style={{ marginBottom: "0.75rem" }}>
          <div
            className="mono"
            style={{
              fontSize: "0.6rem",
              color: "var(--text-3)",
              letterSpacing: "0.06em",
              marginBottom: "0.3rem",
            }}
          >
            ▸ {route}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {byRoute[route]!.map((p, i) => (
              <PresentationRow key={i} presentation={p} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PresentationRow({ presentation }: { presentation: DrugPresentation }) {
  return (
    <div
      className="panel"
      style={{
        padding: "0.55rem 0.75rem",
        borderLeft: "2px solid var(--border)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          gap: "0.5rem 0.8rem",
          marginBottom: presentation.packaging ? "0.25rem" : 0,
        }}
      >
        <strong
          style={{
            fontSize: "0.82rem",
            color: "var(--text-0)",
            fontWeight: 600,
          }}
        >
          {presentation.form}
        </strong>
        <span
          className="mono"
          style={{
            fontSize: "0.78rem",
            color: "var(--accent)",
            fontWeight: 600,
          }}
        >
          {presentation.strength}
        </span>
        {presentation.volume && (
          <span
            className="mono"
            style={{
              fontSize: "0.7rem",
              color: "var(--text-2)",
              padding: "0.1rem 0.35rem",
              border: "1px solid var(--border)",
            }}
          >
            {presentation.volume}
          </span>
        )}
      </div>
      {presentation.packaging && (
        <p
          style={{
            fontSize: "0.7rem",
            color: "var(--text-3)",
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {presentation.packaging}
        </p>
      )}
    </div>
  );
}

// ─── Administration details ──────────────────────────────────────

function AdministrationDetails({ admin }: { admin: DrugAdministration }) {
  return (
    <div>
      <h3
        className="mono"
        style={{
          fontSize: "0.62rem",
          color: "var(--cyan)",
          letterSpacing: "0.1em",
          fontWeight: 600,
          marginBottom: "0.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "6px",
            height: "6px",
            background: "var(--cyan)",
            boxShadow: "0 0 4px var(--cyan)",
          }}
        />
        ADMINISTRACIÓN — {admin.route}
      </h3>

      {/* Flags row: filter, light, max rate */}
      <FlagsRow admin={admin} />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {admin.instructions && (
          <DetailBlock
            label="INSTRUCCIONES"
            text={admin.instructions}
            color="var(--accent)"
          />
        )}
        {admin.reconstitution && (
          <DetailBlock
            label="RECONSTITUCIÓN"
            text={admin.reconstitution}
            color="var(--cyan)"
          />
        )}
        {admin.dilution && (
          <DetailBlock label="DILUCIÓN" text={admin.dilution} color="var(--cyan)" />
        )}
        {admin.compatibility && (
          <DetailBlock
            label="COMPATIBILIDAD"
            text={admin.compatibility}
            color="var(--accent)"
          />
        )}
        {admin.incompatibility && (
          <DetailBlock
            label="INCOMPATIBILIDAD"
            text={admin.incompatibility}
            color="var(--red)"
          />
        )}
        {admin.stability && (
          <DetailBlock
            label="ESTABILIDAD"
            text={admin.stability}
            color="var(--amber)"
          />
        )}
        {admin.notes && (
          <DetailBlock
            label="NOTAS CLÍNICAS"
            text={admin.notes}
            color="var(--text-2)"
          />
        )}
      </div>
    </div>
  );
}

// ─── Flags row ───────────────────────────────────────────────────

function FlagsRow({ admin }: { admin: DrugAdministration }) {
  const flags: Array<{ label: string; color: string; icon: string }> = [];

  if (admin.filter_required) {
    flags.push({
      label: "FILTRO 0.22µm",
      color: "var(--cyan)",
      icon: "▣",
    });
  }
  if (admin.light_sensitive) {
    flags.push({
      label: "FOTOSENSIBLE",
      color: "var(--amber)",
      icon: "◐",
    });
  }
  if (admin.max_rate && admin.rate_unit) {
    flags.push({
      label: `MAX ${admin.max_rate} ${admin.rate_unit}`,
      color: "var(--red)",
      icon: "⏱",
    });
  }

  if (flags.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.4rem",
        marginBottom: "0.75rem",
      }}
    >
      {flags.map((f, i) => (
        <span
          key={i}
          className="mono"
          style={{
            fontSize: "0.62rem",
            letterSpacing: "0.06em",
            color: f.color,
            padding: "0.2rem 0.5rem",
            border: `1px solid ${f.color}`,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            fontWeight: 600,
          }}
        >
          <span style={{ fontSize: "0.7rem" }}>{f.icon}</span>
          {f.label}
        </span>
      ))}
    </div>
  );
}

// ─── Detail block ────────────────────────────────────────────────

function DetailBlock({
  label,
  text,
  color,
}: {
  label: string;
  text: string;
  color: string;
}) {
  return (
    <div
      className="panel"
      style={{
        padding: "0.55rem 0.75rem",
        borderLeft: `2px solid ${color}`,
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: "0.58rem",
          letterSpacing: "0.08em",
          color: "var(--text-3)",
          fontWeight: 600,
          marginBottom: "0.3rem",
        }}
      >
        {label}
      </div>
      <p
        style={{
          fontSize: "0.78rem",
          color: "var(--text-1)",
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}
