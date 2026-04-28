"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  type Drug,
  type DrugCatalog,
  searchDrugs,
  slugify,
} from "@/lib/drugs";
import drugsData from "../../../public/drugs.json";
import { InfusionCalculator } from "@/app/farmacos/[slug]/InfusionCalculator";

const catalog = drugsData as DrugCatalog;

// Pre-filter: solo fármacos con datos de infusión (los que tienen calculadora)
const drugsWithCalc = catalog.drugs.filter(
  (d) => d.infusion && d.infusion.length > 0
);

export default function CalculadoraPage() {
  const [searchQ, setSearchQ] = useState("");
  const [selected, setSelected] = useState<Drug | null>(null);

  const filtered = useMemo(() => {
    if (!searchQ.trim()) return drugsWithCalc.slice(0, 30);
    const r = searchDrugs(drugsWithCalc, searchQ);
    return r.slice(0, 30);
  }, [searchQ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Calculadora de infusión</h1>
        <p className="text-foreground/70 text-sm">
          {drugsWithCalc.length} fármacos con calculadora bidireccional
          integrada. Selecciona un fármaco para calcular dosis ↔ flujo de bomba.
        </p>
      </header>

      {!selected ? (
        <>
          {/* Search */}
          <div className="mb-4">
            <input
              type="search"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Buscar fármaco con calculadora…"
              className="w-full px-4 py-3 rounded-lg border border-foreground/20 bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          {/* Drug list */}
          {filtered.length === 0 ? (
            <p className="text-center py-8 text-foreground/60">
              Sin resultados. ¿Buscaste un fármaco que no tiene calculadora? Ve
              a <Link href="/farmacos" className="underline">el catálogo</Link>{" "}
              completo.
            </p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filtered.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(d)}
                    className="w-full text-left p-3 rounded-lg border border-foreground/10 hover:border-emerald-500 hover:bg-emerald-500/5 transition"
                  >
                    <div className="font-medium">{d.name}</div>
                    <div className="text-xs text-foreground/60 mt-1">
                      {d.category_icon} {d.category} ·{" "}
                      {d.infusion?.length ?? 0} indicación
                      {(d.infusion?.length ?? 0) === 1 ? "" : "es"}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <div>
          {/* Header with selected drug */}
          <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold">{selected.name}</h2>
              <p className="text-sm text-foreground/60">
                {selected.category_icon} {selected.category}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-3 py-1 text-sm rounded border border-foreground/20 hover:bg-foreground/5"
              >
                ← Cambiar
              </button>
              <Link
                href={`/farmacos/${slugify(selected.name)}`}
                className="px-3 py-1 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Ver ficha completa →
              </Link>
            </div>
          </div>

          {/* Calculator */}
          {selected.infusion && (
            <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
              <InfusionCalculator
                drugName={selected.name}
                entries={selected.infusion}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
