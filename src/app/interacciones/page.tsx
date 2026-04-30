"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  type Drug,
  type DrugCatalog,
  type DrugInteraction,
  type InteractionSeverity,
  INTERACTION_SEVERITY_COLOR,
  INTERACTION_SEVERITY_LABEL,
  searchDrugs,
  slugify,
  sortInteractions,
} from "@/lib/drugs";
import drugsData from "../../../public/drugs.json";

const catalog = drugsData as DrugCatalog;
const SUPABASE_URL = "https://smaazlgvonzcajjvbefk.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtYWF6bGd2b256Y2FqanZiZWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDIyOTUsImV4cCI6MjA5MjA3ODI5NX0.LVVuXue2FljP0mvINWV84NbFaLNbgoXr8Lbg8oiiMK4";

interface CheckResult {
  pair: [Drug, Drug];
  interactions: DrugInteraction[];
}

export default function InteraccionesPage() {
  const [selected, setSelected] = useState<Drug[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const [results, setResults] = useState<CheckResult[]>([]);
  const [loading, setLoading] = useState(false);

  const candidates = useMemo(() => {
    if (!searchQ.trim()) return [] as Drug[];
    const r = searchDrugs(catalog.drugs, searchQ);
    return r.slice(0, 10).filter((d) => !selected.find((s) => s.id === d.id));
  }, [searchQ, selected]);

  const addDrug = (drug: Drug) => {
    setSelected([...selected, drug]);
    setSearchQ("");
  };

  const removeDrug = (id: string) => {
    setSelected(selected.filter((d) => d.id !== id));
  };

  const clear = () => {
    setSelected([]);
    setResults([]);
    setSearchQ("");
  };

  // Auto-check whenever selection changes (with 2+)
  useEffect(() => {
    if (selected.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const pairs: Array<[Drug, Drug]> = [];
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        pairs.push([selected[i], selected[j]]);
      }
    }

    Promise.all(
      pairs.map(async ([a, b]) => {
        const url =
          `${SUPABASE_URL}/rest/v1/drug_interactions?` +
          `or=(and(drug_id.eq.${a.id},interacts_with_id.eq.${b.id}),` +
          `and(drug_id.eq.${b.id},interacts_with_id.eq.${a.id}))` +
          `&select=drug_id,interacts_with_id,interacts_with_name,severity,mechanism,clinical_effect,management`;
        try {
          const r = await fetch(url, {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
            },
          });
          if (!r.ok) return { pair: [a, b] as [Drug, Drug], interactions: [] };
          const items = (await r.json()) as DrugInteraction[];
          // Deduplicate (each interaction is stored bidirectionally)
          const seen = new Set<string>();
          const unique = items.filter((i) => {
            const key = `${i.severity}|${i.clinical_effect ?? ""}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          return { pair: [a, b] as [Drug, Drug], interactions: unique };
        } catch {
          return { pair: [a, b] as [Drug, Drug], interactions: [] };
        }
      })
    ).then((res) => {
      setResults(res);
      setLoading(false);
    });
  }, [selected]);

  const totalInteractions = results.reduce((s, r) => s + r.interactions.length, 0);
  const dangerCount = results.reduce(
    (s, r) =>
      s +
      r.interactions.filter(
        (i) => i.severity === "contraindicated" || i.severity === "major"
      ).length,
    0
  );

  return (
    <div
      className="wrap"
      style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 760 }}
    >
      <div style={{ marginBottom: "1.25rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./check-interactions.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
          Verificador de interacciones
        </h1>
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.65rem",
            marginTop: "0.25rem",
            lineHeight: 1.7,
          }}
        >
          Selecciona 2 o más fármacos y revisa si la combinación está en la
          base.
          <br />
          <span style={{ opacity: 0.6 }}>
            // detecta lo crítico — para todo lo demás, sigue el inserto
          </span>
        </p>
      </div>

      {/* Selected drugs */}
      {selected.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.4rem",
            marginBottom: "0.75rem",
            padding: "0.6rem",
            border: "1px solid var(--border)",
            background: "var(--bg-1)",
          }}
        >
          {selected.map((d) => (
            <span
              key={d.id}
              className="mono"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.25rem 0.5rem",
                fontSize: "0.65rem",
                background: "var(--accent)",
                color: "#000",
              }}
            >
              {d.name}
              <button
                type="button"
                onClick={() => removeDrug(d.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#000",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  lineHeight: 1,
                  padding: 0,
                }}
                aria-label={`Quitar ${d.name}`}
              >
                ×
              </button>
            </span>
          ))}
          {selected.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="mono"
              style={{
                marginLeft: "auto",
                padding: "0.25rem 0.5rem",
                fontSize: "0.6rem",
                background: "none",
                border: "1px solid var(--border)",
                color: "var(--text-3)",
                cursor: "pointer",
              }}
            >
              limpiar todo
            </button>
          )}
        </div>
      )}

      {/* Search */}
      <div className="search-box" style={{ marginBottom: "1rem" }}>
        <span className="search-icon mono">⌕</span>
        <input
          type="text"
          placeholder={
            selected.length === 0
              ? "agregar primer fármaco..."
              : "agregar otro fármaco..."
          }
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          autoFocus
        />
      </div>

      {/* Candidates dropdown */}
      {candidates.length > 0 && (
        <div
          style={{
            border: "1px solid var(--border)",
            background: "var(--bg-2)",
            marginBottom: "1rem",
            maxHeight: 300,
            overflowY: "auto",
          }}
        >
          {candidates.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => addDrug(d)}
              className="card-interactive"
              style={{
                display: "block",
                width: "100%",
                padding: "0.55rem 0.75rem",
                textAlign: "left",
                background: "none",
                border: "none",
                borderBottom: "1px solid var(--border)",
                cursor: "pointer",
                color: "inherit",
              }}
            >
              <div
                style={{
                  color: "var(--text-0)",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                }}
              >
                {d.name}
              </div>
              <div
                className="mono"
                style={{
                  color: "var(--text-3)",
                  fontSize: "0.6rem",
                  marginTop: "0.15rem",
                }}
              >
                {d.category_icon} {d.category}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* States */}
      {selected.length === 0 && (
        <EmptyState />
      )}

      {selected.length === 1 && (
        <div
          className="mono"
          style={{
            padding: "1.5rem",
            textAlign: "center",
            color: "var(--text-3)",
            fontSize: "0.7rem",
            border: "1px dashed var(--border)",
            background: "var(--bg-1)",
          }}
        >
          Selecciona al menos un fármaco más para verificar interacciones.
          <br />
          <span style={{ opacity: 0.5, fontSize: "0.6rem" }}>
            // un solo fármaco no interactúa consigo mismo (probablemente)
          </span>
        </div>
      )}

      {loading && selected.length >= 2 && (
        <div
          className="mono"
          style={{
            padding: "1rem",
            textAlign: "center",
            color: "var(--text-3)",
            fontSize: "0.7rem",
          }}
        >
          procesando...
        </div>
      )}

      {!loading && selected.length >= 2 && (
        <ResultsView
          results={results}
          totalInteractions={totalInteractions}
          dangerCount={dangerCount}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        padding: "2rem 1rem",
        textAlign: "center",
        background: "var(--bg-1)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="mono"
        style={{
          color: "var(--text-2)",
          fontSize: "0.7rem",
          lineHeight: 1.8,
          marginBottom: "1rem",
        }}
      >
        Útil para chequeos rápidos preoperatorios:
      </div>
      <ul
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.65rem",
          textAlign: "left",
          maxWidth: 380,
          margin: "0 auto",
          lineHeight: 1.9,
          listStyle: "none",
          padding: 0,
        }}
      >
        <li>
          ›{" "}
          <ExampleLink combo="Meperidina + Selegilina">
            paciente con Parkinson + dolor postoperatorio
          </ExampleLink>
        </li>
        <li>
          › <ExampleLink combo="Tramadol + Sertralina">paciente con depresión + analgesia</ExampleLink>
        </li>
        <li>
          ›{" "}
          <ExampleLink combo="Linezolid + Fentanilo">UCI con bacteriemia</ExampleLink>
        </li>
        <li>
          ›{" "}
          <ExampleLink combo="Sildenafilo + Nitroglicerina">SCA en paciente urológico</ExampleLink>
        </li>
        <li>
          › <ExampleLink combo="Amiodarona + Digoxina">FA en paciente con HFrEF</ExampleLink>
        </li>
      </ul>
      <p
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.55rem",
          marginTop: "1.5rem",
          opacity: 0.5,
        }}
      >
        // si ya sabes la respuesta, no necesitas la herramienta
      </p>
    </div>
  );
}

function ExampleLink({
  combo,
  children,
}: {
  combo: string;
  children: React.ReactNode;
}) {
  return (
    <span style={{ color: "var(--text-2)" }}>
      <span style={{ color: "var(--accent)" }}>{combo}</span> · {children}
    </span>
  );
}

function ResultsView({
  results,
  totalInteractions,
  dangerCount,
}: {
  results: CheckResult[];
  totalInteractions: number;
  dangerCount: number;
}) {
  const noInteractions = totalInteractions === 0;

  return (
    <div>
      {/* Summary banner */}
      <div
        className="panel"
        style={{
          marginBottom: "1rem",
          borderLeft: `3px solid ${
            dangerCount > 0
              ? "var(--red)"
              : noInteractions
                ? "var(--accent)"
                : "var(--amber)"
          }`,
        }}
      >
        <div
          className="panel-body"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div>
            <div
              className="mono"
              style={{
                color: "var(--text-3)",
                fontSize: "0.55rem",
                letterSpacing: "0.1em",
                marginBottom: "0.2rem",
              }}
            >
              RESULTADO
            </div>
            <div
              style={{
                color: "var(--text-0)",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              {noInteractions
                ? "Sin interacciones críticas registradas"
                : dangerCount > 0
                  ? `${dangerCount} interacción${dangerCount > 1 ? "es" : ""} crítica${dangerCount > 1 ? "s" : ""} detectada${dangerCount > 1 ? "s" : ""}`
                  : `${totalInteractions} interacción${totalInteractions > 1 ? "es" : ""} de bajo riesgo`}
            </div>
            {noInteractions && (
              <p
                className="mono"
                style={{
                  color: "var(--text-3)",
                  fontSize: "0.6rem",
                  marginTop: "0.3rem",
                  opacity: 0.7,
                }}
              >
                // ausencia de evidencia ≠ evidencia de ausencia
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pairs */}
      <div style={{ display: "grid", gap: "1rem" }}>
        {results.map(({ pair: [a, b], interactions }, idx) => (
          <PairResult key={idx} a={a} b={b} interactions={interactions} />
        ))}
      </div>

      <p
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.55rem",
          marginTop: "1.5rem",
          opacity: 0.55,
          textAlign: "center",
          lineHeight: 1.7,
        }}
      >
        // base de datos curada para anestesia · no exhaustiva<br />
        // si la combinación no aparece, no significa que sea segura<br />
        // los pacientes leen menos los insertos que los anestesiólogos
      </p>
    </div>
  );
}

function PairResult({
  a,
  b,
  interactions,
}: {
  a: Drug;
  b: Drug;
  interactions: DrugInteraction[];
}) {
  const sorted = sortInteractions(interactions);
  const worstSeverity = sorted[0]?.severity;
  const color = worstSeverity
    ? INTERACTION_SEVERITY_COLOR[worstSeverity]
    : "var(--text-3)";

  return (
    <div
      className="panel"
      style={{
        borderLeft: interactions.length > 0 ? `3px solid ${color}` : "1px solid var(--border)",
      }}
    >
      <div
        className="panel-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span className="dot" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
          <Link
            href={`/farmacos/${slugify(a.name)}`}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {a.name}
          </Link>
          <span style={{ color: "var(--text-3)", fontWeight: 400 }}>+</span>
          <Link
            href={`/farmacos/${slugify(b.name)}`}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {b.name}
          </Link>
        </span>
        {interactions.length === 0 && (
          <span
            className="mono"
            style={{
              fontSize: "0.55rem",
              color: "var(--text-3)",
              padding: "0.15rem 0.4rem",
              border: "1px solid var(--border)",
            }}
          >
            sin registro
          </span>
        )}
      </div>
      <div className="panel-body">
        {sorted.length === 0 ? (
          <p
            className="mono"
            style={{
              color: "var(--text-3)",
              fontSize: "0.65rem",
              fontStyle: "italic",
            }}
          >
            No hay interacción crítica registrada en la base.
          </p>
        ) : (
          <div style={{ display: "grid", gap: "0.6rem" }}>
            {sorted.map((it, i) => (
              <InteractionDetail key={i} interaction={it} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InteractionDetail({ interaction }: { interaction: DrugInteraction }) {
  const sev = interaction.severity as InteractionSeverity;
  const color = INTERACTION_SEVERITY_COLOR[sev];
  const label = INTERACTION_SEVERITY_LABEL[sev];

  return (
    <div>
      <div style={{ marginBottom: "0.4rem" }}>
        <span
          className="mono"
          style={{
            display: "inline-block",
            fontSize: "0.55rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color,
            border: `1px solid ${color}`,
            padding: "0.15rem 0.4rem",
          }}
        >
          {label}
        </span>
      </div>
      {interaction.clinical_effect && (
        <DetailBlock label="EFECTO" content={interaction.clinical_effect} />
      )}
      {interaction.mechanism && (
        <DetailBlock label="MECANISMO" content={interaction.mechanism} muted />
      )}
      {interaction.management && (
        <DetailBlock label="MANEJO" content={interaction.management} accent />
      )}
    </div>
  );
}

function DetailBlock({
  label,
  content,
  muted = false,
  accent = false,
}: {
  label: string;
  content: string;
  muted?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        marginTop: "0.4rem",
        paddingLeft: "0.6rem",
        borderLeft: accent
          ? "2px solid var(--accent)"
          : muted
            ? "2px solid var(--border)"
            : "2px solid var(--text-3)",
      }}
    >
      <div
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.55rem",
          letterSpacing: "0.1em",
          marginBottom: "0.2rem",
        }}
      >
        {label}
      </div>
      <p
        style={{
          color: muted ? "var(--text-2)" : "var(--text-1)",
          fontSize: "0.72rem",
          lineHeight: 1.6,
        }}
      >
        {content}
      </p>
    </div>
  );
}
