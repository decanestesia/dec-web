"use client";

// Command palette (⌘K / Ctrl+K) — navegación rápida por teclado a fármacos,
// calculadoras y páginas. Estética terminal. // el quirófano no espera clicks.

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { type DrugCatalog, searchDrugs, slugify } from "@/lib/drugs";
import drugsData from "../../public/drugs.json";

const catalog = drugsData as DrugCatalog;

interface Item {
  id: string;
  label: string;
  hint: string;
  href: string;
  group: "Calculadoras" | "Páginas" | "Fármacos";
}

const STATIC: Item[] = [
  { id: "c-anthro", label: "Antropometría", hint: "IMC · IBW · LBM · volemia", href: "/calculadoras/antropometria", group: "Calculadoras" },
  { id: "c-inf", label: "Infusión de fármacos", hint: "dosis ⇄ ritmo", href: "/calculadora", group: "Calculadoras" },
  { id: "c-nacl", label: "Salino hipertónico", hint: "NaCl 3% / 7.5% / 23.4%", href: "/calculadoras/salino-hipertonico", group: "Calculadoras" },
  { id: "c-abg", label: "Electrolitos y gases", hint: "acid-base · anión gap", href: "/calculadoras/electrolitos", group: "Calculadoras" },
  { id: "c-visco", label: "ROTEM / TEG", hint: "viscoelástico", href: "/calculadoras/rotem-teg", group: "Calculadoras" },
  { id: "c-vent", label: "Ventilación y vía aérea", hint: "Vt · TET · LMA", href: "/calculadoras/ventilacion", group: "Calculadoras" },
  { id: "c-rox", label: "Índice ROX", hint: "fracaso de CNAF", href: "/calculadoras/rox", group: "Calculadoras" },
  { id: "c-pk", label: "Concentración plasmática", hint: "farmacocinética", href: "/calculadoras/concentracion-plasmatica", group: "Calculadoras" },
  { id: "c-la", label: "Anestésicos locales (LAST)", hint: "dosis máx · mg↔mL", href: "/calculadoras/anestesicos-locales", group: "Calculadoras" },
  { id: "c-opio", label: "Equianalgesia de opioides", hint: "conversión", href: "/calculadoras/opioides-equianalgesia", group: "Calculadoras" },
  { id: "c-apfel", label: "Score de Apfel (NVPO)", hint: "riesgo náusea/vómito", href: "/calculadoras/apfel", group: "Calculadoras" },
  { id: "c-peds", label: "Emergencias pediátricas", hint: "dosis por peso", href: "/calculadoras/emergencia-pediatrica", group: "Calculadoras" },
  { id: "g-ext", label: "Guía: extubación y destete", hint: "SBT · RSBI · fuga", href: "/guias/extubacion", group: "Páginas" },
  { id: "g-tx", label: "Guía: transfusión", hint: "hemoderivados", href: "/guias/transfusion", group: "Páginas" },
  { id: "g-mh", label: "Guía: hipertermia maligna", hint: "dantroleno · MHAUS", href: "/guias/hipertermia-maligna", group: "Páginas" },
  { id: "p-far", label: "Catálogo de fármacos", hint: "494 fármacos", href: "/farmacos", group: "Páginas" },
  { id: "p-int", label: "Verificador de interacciones", hint: "multi-fármaco", href: "/interacciones", group: "Páginas" },
  { id: "p-pro", label: "DEC Pro", hint: "suscripción", href: "/pro", group: "Páginas" },
  { id: "p-blog", label: "Blog", hint: "artículos", href: "/blog", group: "Páginas" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle con ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      // enfocar tras el paint
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const query = q.trim();
    if (!query) return STATIC;
    const ql = query.toLowerCase();
    const statics = STATIC.filter(
      (i) => i.label.toLowerCase().includes(ql) || i.hint.toLowerCase().includes(ql)
    );
    const drugs: Item[] = searchDrugs(catalog.drugs, query)
      .slice(0, 8)
      .map((d) => ({
        id: `d-${d.id}`,
        label: d.name,
        hint: d.category,
        href: `/farmacos/${slugify(d.name)}`,
        group: "Fármacos" as const,
      }));
    return [...statics, ...drugs];
  }, [q]);

  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, items.length - 1)));
  }, [items.length]);

  const go = useCallback(
    (item: Item | undefined) => {
      if (!item) return;
      setOpen(false);
      router.push(item.href);
    },
    [router]
  );

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(items[active]);
    }
  };

  if (!open) return null;

  // Agrupar preservando orden
  const groups: Array<[Item["group"], Item[]]> = [];
  for (const it of items) {
    const last = groups[groups.length - 1];
    if (last && last[0] === it.group) last[1].push(it);
    else groups.push([it.group, [it]]);
  }
  let flatIndex = -1;

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onListKey}
        style={{
          width: "min(560px, 92vw)", background: "var(--bg-1)",
          border: "1px solid var(--border-hi)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          maxHeight: "70vh", display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 0.9rem", borderBottom: "1px solid var(--border)" }}>
          <span className="mono" style={{ color: "var(--accent)", fontSize: "0.8rem" }}>⌕</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
            placeholder="fármaco, calculadora o página..."
            className="mono"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text-0)", fontSize: "0.85rem" }}
          />
          <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", border: "1px solid var(--border)", padding: "0.1rem 0.3rem" }}>esc</span>
        </div>

        <div style={{ overflowY: "auto" }}>
          {items.length === 0 ? (
            <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", padding: "1.5rem", textAlign: "center" }}>
              {"// sin resultados"}
            </p>
          ) : (
            groups.map(([group, list]) => (
              <div key={group}>
                <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.5rem 0.9rem 0.25rem" }}>
                  {group}
                </div>
                {list.map((it) => {
                  flatIndex++;
                  const isActive = flatIndex === active;
                  const idx = flatIndex;
                  return (
                    <button
                      key={it.id}
                      onClick={() => go(it)}
                      onMouseEnter={() => setActive(idx)}
                      style={{
                        display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between",
                        gap: "0.5rem", padding: "0.55rem 0.9rem", border: "none", cursor: "pointer",
                        textAlign: "left", background: isActive ? "var(--bg-hover)" : "transparent",
                        color: "var(--text-0)", fontSize: "0.82rem",
                        borderLeft: `2px solid ${isActive ? "var(--accent)" : "transparent"}`,
                      }}
                    >
                      <span>{it.label}</span>
                      <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>{it.hint}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="mono" style={{ display: "flex", gap: "1rem", padding: "0.5rem 0.9rem", borderTop: "1px solid var(--border)", color: "var(--text-3)", fontSize: "0.55rem" }}>
          <span>↑↓ navegar</span><span>↵ ir</span><span>⌘K abrir</span>
        </div>
      </div>
    </div>
  );
}
