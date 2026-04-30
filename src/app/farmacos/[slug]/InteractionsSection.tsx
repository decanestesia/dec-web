"use client";

import { useState } from "react";
import {
  type DrugInteraction,
  type InteractionSeverity,
  INTERACTION_SEVERITY_COLOR,
  INTERACTION_SEVERITY_LABEL,
  sortInteractions,
  slugify,
} from "@/lib/drugs";
import Link from "next/link";

interface Props {
  interactions: DrugInteraction[];
  drugName: string;
}

export function InteractionsSection({ interactions, drugName }: Props) {
  const [filter, setFilter] = useState<"all" | InteractionSeverity>("all");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  if (!interactions || interactions.length === 0) return null;

  const sorted = sortInteractions(interactions);
  const filtered =
    filter === "all" ? sorted : sorted.filter((i) => i.severity === filter);

  const counts = {
    contraindicated: sorted.filter((i) => i.severity === "contraindicated")
      .length,
    major: sorted.filter((i) => i.severity === "major").length,
    moderate: sorted.filter((i) => i.severity === "moderate").length,
    minor: sorted.filter((i) => i.severity === "minor").length,
  };

  const toggle = (idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div>
      {/* Filter chips */}
      <div
        style={{
          display: "flex",
          gap: "0.35rem",
          flexWrap: "wrap",
          marginBottom: "0.75rem",
        }}
      >
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label={`todas (${sorted.length})`}
        />
        {counts.contraindicated > 0 && (
          <FilterChip
            active={filter === "contraindicated"}
            onClick={() => setFilter("contraindicated")}
            label={`✕ NO (${counts.contraindicated})`}
            color="var(--red)"
          />
        )}
        {counts.major > 0 && (
          <FilterChip
            active={filter === "major"}
            onClick={() => setFilter("major")}
            label={`⚠ mayor (${counts.major})`}
            color="var(--amber)"
          />
        )}
        {counts.moderate > 0 && (
          <FilterChip
            active={filter === "moderate"}
            onClick={() => setFilter("moderate")}
            label={`● mod (${counts.moderate})`}
            color="var(--cyan, var(--accent))"
          />
        )}
        {counts.minor > 0 && (
          <FilterChip
            active={filter === "minor"}
            onClick={() => setFilter("minor")}
            label={`○ min (${counts.minor})`}
            color="var(--text-3)"
          />
        )}
      </div>

      {/* Interaction list */}
      <div style={{ display: "grid", gap: "0.4rem" }}>
        {filtered.map((it, idx) => (
          <InteractionRow
            key={idx}
            interaction={it}
            isExpanded={expanded.has(idx)}
            onToggle={() => toggle(idx)}
          />
        ))}
      </div>

      {/* Footer note with subtle dark humor */}
      <p
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.55rem",
          marginTop: "0.75rem",
          opacity: 0.6,
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        // {drugName} · interacciones críticas curadas para anestesia<br />
        // no es una lista exhaustiva — el inserto siempre gana por puntos
      </p>
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
  color,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  color?: string;
}) {
  const c = color || "var(--accent)";
  return (
    <button
      type="button"
      onClick={onClick}
      className="mono"
      style={{
        padding: "0.25rem 0.55rem",
        fontSize: "0.6rem",
        letterSpacing: "0.05em",
        background: active ? c : "var(--bg-1)",
        color: active ? "#000" : "var(--text-2)",
        border: "1px solid",
        borderColor: active ? c : "var(--border)",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

function InteractionRow({
  interaction,
  isExpanded,
  onToggle,
}: {
  interaction: DrugInteraction;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const sev = interaction.severity;
  const color = INTERACTION_SEVERITY_COLOR[sev];
  const label = INTERACTION_SEVERITY_LABEL[sev];

  return (
    <div
      className="panel"
      style={{
        borderLeft: `3px solid ${color}`,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: "0.55rem 0.75rem",
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          color: "inherit",
        }}
        aria-expanded={isExpanded}
      >
        <span
          className="mono"
          style={{
            flexShrink: 0,
            fontSize: "0.55rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color,
            border: `1px solid ${color}`,
            padding: "0.15rem 0.4rem",
            minWidth: 92,
            textAlign: "center",
          }}
        >
          {label}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: "var(--text-0)",
              fontSize: "0.85rem",
              fontWeight: 600,
              lineHeight: 1.3,
            }}
          >
            {interaction.interacts_with_id ? (
              <Link
                href={`/farmacos/${slugify(interaction.interacts_with_name)}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  color: "inherit",
                  textDecoration: "none",
                  borderBottom: "1px dashed var(--border)",
                }}
              >
                {interaction.interacts_with_name}
              </Link>
            ) : (
              interaction.interacts_with_name
            )}
          </div>
          {interaction.clinical_effect && !isExpanded && (
            <div
              style={{
                color: "var(--text-2)",
                fontSize: "0.7rem",
                marginTop: "0.2rem",
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical" as const,
                overflow: "hidden",
              }}
            >
              {interaction.clinical_effect}
            </div>
          )}
        </div>

        <span
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.7rem",
            flexShrink: 0,
            transform: isExpanded ? "rotate(90deg)" : "none",
            transition: "transform 0.15s",
          }}
          aria-hidden="true"
        >
          ›
        </span>
      </button>

      {isExpanded && (
        <div
          style={{
            padding: "0 0.75rem 0.7rem",
            display: "grid",
            gap: "0.6rem",
          }}
        >
          {interaction.mechanism && (
            <Block label="MECANISMO" content={interaction.mechanism} />
          )}
          {interaction.clinical_effect && (
            <Block
              label="EFECTO CLÍNICO"
              content={interaction.clinical_effect}
              accent
            />
          )}
          {interaction.management && (
            <Block
              label="MANEJO ANESTÉSICO"
              content={interaction.management}
              accent
            />
          )}
        </div>
      )}
    </div>
  );
}

function Block({
  label,
  content,
  accent = false,
}: {
  label: string;
  content: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        borderLeft: accent ? "2px solid var(--accent)" : "2px solid var(--border)",
        paddingLeft: "0.6rem",
      }}
    >
      <div
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.55rem",
          letterSpacing: "0.1em",
          marginBottom: "0.25rem",
        }}
      >
        {label}
      </div>
      <p
        style={{
          color: "var(--text-1)",
          fontSize: "0.75rem",
          lineHeight: 1.6,
        }}
      >
        {content}
      </p>
    </div>
  );
}
