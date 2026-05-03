import type { DosingEntry } from "@/lib/drugs";

// ─── Constants ───────────────────────────────────────────────────

const POPULATION_LABELS: Record<string, string> = {
  adult: "ADULTO",
  pediatric: "PEDIÁTRICO",
  neonate: "NEONATAL",
  elderly: "ANCIANO",
  renal_impairment: "INSUFICIENCIA RENAL",
  hepatic_impairment: "INSUFICIENCIA HEPÁTICA",
  obese: "OBESIDAD",
  critical_care: "UCI / CRÍTICO",
  pregnancy: "EMBARAZO",
};

const POPULATION_ORDER: Record<string, number> = {
  adult: 1,
  pediatric: 2,
  neonate: 3,
  elderly: 4,
  obese: 5,
  pregnancy: 6,
  critical_care: 7,
  renal_impairment: 8,
  hepatic_impairment: 9,
};

const POPULATION_COLORS: Record<string, string> = {
  adult: "var(--accent)",
  pediatric: "var(--cyan)",
  neonate: "var(--cyan)",
  elderly: "var(--amber)",
  renal_impairment: "var(--amber)",
  hepatic_impairment: "var(--amber)",
  obese: "var(--text-2)",
  critical_care: "var(--red)",
  pregnancy: "var(--purple, #a855f7)",
};

// ─── Helpers ─────────────────────────────────────────────────────

function formatNum(n: number | null): string {
  if (n == null) return "";
  if (Number.isInteger(n)) return String(n);
  if (Math.abs(n) < 1) return n.toFixed(2).replace(/\.?0+$/, "");
  return String(n);
}

function formatDose(d: DosingEntry): string {
  const unit = d.dose_unit ?? "";
  if (d.dose_min == null && d.dose_max == null) return "—";
  if (d.dose_min === d.dose_max && d.dose_min != null) {
    return `${formatNum(d.dose_min)} ${unit}`.trim();
  }
  if (d.dose_min == null) return `≤ ${formatNum(d.dose_max)} ${unit}`.trim();
  if (d.dose_max == null) return `≥ ${formatNum(d.dose_min)} ${unit}`.trim();
  return `${formatNum(d.dose_min)}–${formatNum(d.dose_max)} ${unit}`.trim();
}

function formatMaxDaily(d: DosingEntry): string | null {
  if (d.max_daily_dose == null) return null;
  return `máx ${formatNum(d.max_daily_dose)} ${d.max_daily_unit ?? ""}/día`.trim();
}

// ─── Main component ──────────────────────────────────────────────

export function DosingSection({ entries }: { entries: DosingEntry[] }) {
  if (entries.length === 0) return null;

  // Group by population
  const byPopulation = entries.reduce<Record<string, DosingEntry[]>>((acc, e) => {
    const key = e.population || "adult";
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  const sortedPops = Object.keys(byPopulation).sort(
    (a, b) => (POPULATION_ORDER[a] ?? 99) - (POPULATION_ORDER[b] ?? 99)
  );

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
          DOSIS CLÍNICAS — {entries.length} indicaci
          {entries.length === 1 ? "ón" : "ones"}
        </h2>
        <span
          className="mono"
          style={{
            fontSize: "0.55rem",
            color: "var(--text-3)",
            opacity: 0.6,
          }}
        >
          // verifica con ficha técnica
        </span>
      </div>

      {sortedPops.map((pop) => (
        <PopulationGroup key={pop} population={pop} entries={byPopulation[pop]!} />
      ))}

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
        // dosis aproximadas de literatura aceptada (Stoelting, Miller&apos;s,
        Lexicomp, fichas técnicas FDA/EMA).
        <br />
        // titular según respuesta clínica, comorbilidades y monitorización.
        <br />
        // poblaciones especiales no listadas → consultar ficha técnica.
      </div>
    </section>
  );
}

// ─── Population group ────────────────────────────────────────────

function PopulationGroup({
  population,
  entries,
}: {
  population: string;
  entries: DosingEntry[];
}) {
  const label = POPULATION_LABELS[population] ?? population.toUpperCase();
  const color = POPULATION_COLORS[population] ?? "var(--text-2)";

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div
        className="mono"
        style={{
          fontSize: "0.62rem",
          color,
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
            background: color,
            boxShadow: `0 0 4px ${color}`,
          }}
        />
        {label}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {entries.map((e, i) => (
          <DosingRow key={i} entry={e} color={color} />
        ))}
      </div>
    </div>
  );
}

function DosingRow({ entry, color }: { entry: DosingEntry; color: string }) {
  const dose = formatDose(entry);
  const maxDaily = formatMaxDaily(entry);

  return (
    <div
      className="panel"
      style={{
        borderLeft: `3px solid ${color}`,
        padding: "0.7rem 0.85rem",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          gap: "0.5rem",
          marginBottom: entry.notes ? "0.4rem" : 0,
        }}
      >
        {entry.indication && (
          <strong
            style={{
              fontSize: "0.85rem",
              color: "var(--text-0)",
              fontWeight: 600,
            }}
          >
            {entry.indication}
          </strong>
        )}

        <span
          className="mono"
          style={{
            fontSize: "0.65rem",
            color: "var(--text-3)",
            letterSpacing: "0.04em",
          }}
        >
          {entry.route && `${entry.route}`}
          {entry.frequency && entry.route && " · "}
          {entry.frequency}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          gap: "0.5rem 1rem",
          marginBottom: entry.notes ? "0.4rem" : 0,
        }}
      >
        <span
          className="mono"
          style={{
            fontSize: "0.95rem",
            color,
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}
        >
          {dose}
        </span>

        {maxDaily && (
          <span
            className="mono"
            style={{
              fontSize: "0.65rem",
              color: "var(--text-3)",
              padding: "0.15rem 0.4rem",
              border: "1px solid var(--border)",
              letterSpacing: "0.04em",
            }}
          >
            {maxDaily}
          </span>
        )}
      </div>

      {entry.notes && (
        <p
          style={{
            fontSize: "0.78rem",
            color: "var(--text-2)",
            lineHeight: 1.65,
            marginTop: "0.3rem",
          }}
        >
          {entry.notes}
        </p>
      )}
    </div>
  );
}
