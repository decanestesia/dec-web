"use client";

// Buscador de fármacos destacado en la portada: filtra en vivo sobre
// /drugs.json y enlaza directo a la ficha. Client island.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/drugs";

interface DrugLite {
  name: string;
  generic_name?: string;
  category?: string;
}

export function HeroSearch() {
  const [drugs, setDrugs] = useState<DrugLite[]>([]);
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [hi, setHi] = useState(0);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/drugs.json")
      .then((r) => r.json())
      .then((d) => setDrugs(d.drugs || d))
      .catch(() => {});
  }, []);

  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return drugs
      .filter(
        (d) =>
          d.name.toLowerCase().includes(s) ||
          (d.generic_name || "").toLowerCase().includes(s),
      )
      .slice(0, 7);
  }, [q, drugs]);

  const go = (name: string) => router.push(`/farmacos/${slugify(name)}`);

  return (
    <div ref={boxRef} style={{ position: "relative", maxWidth: 480, marginTop: "1.75rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--bg-2)",
          border: `1px solid ${focused ? "var(--accent)" : "var(--border-hi)"}`,
          padding: "0.6rem 0.8rem",
          transition: "border-color 0.15s",
        }}
      >
        <span className="mono" style={{ color: "var(--accent)", fontSize: "0.9rem" }}>⌕</span>
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setHi(0); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, matches.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
            else if (e.key === "Enter" && matches[hi]) { go(matches[hi].name); }
          }}
          placeholder="buscar fármaco… (893 en la base)"
          className="mono"
          style={{ flex: 1, background: "none", border: "none", color: "var(--text-0)", fontSize: "0.85rem", outline: "none" }}
          aria-label="Buscar fármaco"
        />
        {q && (
          <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>
            {matches.length}
          </span>
        )}
      </div>
      {focused && matches.length > 0 && (
        <div
          style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            background: "var(--bg-2)", border: "1px solid var(--border-hi)", borderTop: "none",
            zIndex: 30, maxHeight: 320, overflowY: "auto",
          }}
        >
          {matches.map((d, i) => (
            <Link
              key={d.name}
              href={`/farmacos/${slugify(d.name)}`}
              onMouseEnter={() => setHi(i)}
              style={{
                display: "flex", alignItems: "baseline", gap: 6,
                padding: "0.5rem 0.8rem", textDecoration: "none",
                borderBottom: "1px solid var(--border)",
                background: i === hi ? "var(--bg-1)" : "transparent",
              }}
            >
              <span style={{ color: "var(--text-0)", fontSize: "0.82rem" }}>{d.name}</span>
              {d.category && (
                <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.58rem" }}>· {d.category}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
