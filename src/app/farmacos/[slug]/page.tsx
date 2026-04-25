"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { DrugCatalog, Drug, slugify, formatDoseRange, CATEGORY_ICONS, getDrugsInCategory } from "@/lib/drugs";
import {
  fetchAllDrugs, fetchInfusionsByDrugId, fetchPharmacologyByDrugId,
  fetchAdverseEffectsByDrugId, fetchWarningsByDrugId, fetchPregnancyByDrugId,
  fetchBrandNamesByDrugId, fetchMolecularByDrugId, fetchDosingByDrugId,
  fetchCategoryMap, fetchCategories,
  DbDrug, DbInfusion, DbPharmacology, DbAdverseEffect, DbWarning,
  DbPregnancy, DbBrandName, DbMolecular, DbDosing, DbCategory
} from "@/lib/supabase";
import drugsData from "../../../../public/drugs.json";
import { useParams } from "next/navigation";

const catalog = drugsData as DrugCatalog;

export default function DrugDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Local drug (may not exist for new imports)
  const localDrug = catalog.drugs.find((d) => slugify(d.name) === slug);

  // Supabase data
  const [dbDrug, setDbDrug] = useState<DbDrug | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");
  const [pharmacology, setPharmacology] = useState<DbPharmacology[]>([]);
  const [adverseEffects, setAdverseEffects] = useState<DbAdverseEffect[]>([]);
  const [warnings, setWarnings] = useState<DbWarning[]>([]);
  const [pregnancy, setPregnancy] = useState<DbPregnancy | null>(null);
  const [brandNames, setBrandNames] = useState<DbBrandName[]>([]);
  const [molecular, setMolecular] = useState<DbMolecular | null>(null);
  const [dosing, setDosing] = useState<DbDosing[]>([]);
  const [infusions, setInfusions] = useState<DbInfusion[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadExtended() {
      try {
        const allDrugs = await fetchAllDrugs();
        const match = allDrugs.find((d) => slugify(d.name) === slug);
        if (!match && !localDrug) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        if (match) {
          setDbDrug(match);

          // Get category
          const [catMap, categories] = await Promise.all([
            fetchCategoryMap(),
            fetchCategories(),
          ]);
          const catLookup: Record<string, DbCategory> = {};
          categories.forEach((c) => { catLookup[c.id] = c; });
          const drugCat = catMap.find((m) => m.drug_id === match.id && m.is_primary);
          if (drugCat && catLookup[drugCat.category_id]) {
            setCategoryName(catLookup[drugCat.category_id].name);
          }

          const [pharm, ae, warn, preg, brands, mol, dos, inf] = await Promise.all([
            fetchPharmacologyByDrugId(match.id),
            fetchAdverseEffectsByDrugId(match.id),
            fetchWarningsByDrugId(match.id),
            fetchPregnancyByDrugId(match.id),
            fetchBrandNamesByDrugId(match.id),
            fetchMolecularByDrugId(match.id),
            fetchDosingByDrugId(match.id),
            fetchInfusionsByDrugId(match.id),
          ]);
          setPharmacology(pharm);
          setAdverseEffects(ae);
          setWarnings(warn);
          setPregnancy(preg);
          setBrandNames(brands);
          setMolecular(mol);
          setDosing(dos);
          setInfusions(inf);
        }
      } catch (e) {
        console.warn("Could not load extended data:", e);
      }
      setLoading(false);
    }
    loadExtended();
  }, [slug, localDrug]);

  if (notFound && !localDrug) {
    return (
      <div className="wrap" style={{ padding: "4rem 0", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", opacity: 0.2 }}>💀</div>
        <p style={{ color: "var(--text-1)", marginTop: "0.5rem" }}>Fármaco no encontrado</p>
        <Link href="/farmacos" className="btn btn-outline" style={{ marginTop: "1rem" }}>← Volver</Link>
      </div>
    );
  }

  // Determine display values: prefer Supabase, fallback to local
  const drugName = dbDrug?.name || localDrug?.name || slug;
  const category = categoryName || localDrug?.category || "";
  const description = dbDrug?.mechanism_of_action || dbDrug?.description || localDrug?.description || "";

  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 760, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <nav className="mono" style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.5rem", fontSize: "0.65rem", color: "var(--text-3)", flexWrap: "wrap" }}>
        <Link href="/farmacos" style={{ color: "var(--accent)", textDecoration: "none" }}>fármacos</Link>
        <span>/</span>
        {category && <><span>{category.toLowerCase()}</span><span>/</span></>}
        <span style={{ color: "var(--text-1)" }}>{drugName.toLowerCase()}</span>
      </nav>

      {/* Header */}
      <header style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.8rem" }}>{CATEGORY_ICONS[category] || "💊"}</span>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1.2 }}>{drugName}</h1>
            <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
              {category && <span className="tag tag-accent">{category}</span>}
              {localDrug && <span className="tag tag-muted mono">{localDrug.typicalDoseUnit}</span>}
              {dbDrug?.atc_code && <span className="tag tag-muted mono">ATC: {dbDrug.atc_code}</span>}
            </div>
          </div>
        </div>
      </header>

      {/* Description */}
      <Section title="FARMACOLOGÍA">
        <p style={{ color: "var(--text-1)", fontSize: "0.85rem", lineHeight: 1.7 }}>{description}</p>
        {dbDrug?.mechanism_of_action && dbDrug.description && dbDrug.mechanism_of_action !== dbDrug.description && (
          <p style={{ color: "var(--text-2)", fontSize: "0.8rem", lineHeight: 1.7, marginTop: "0.75rem" }}>{dbDrug.description}</p>
        )}
      </Section>

      {/* PK properties */}
      {pharmacology.length > 0 && (
        <Section title="FARMACOCINÉTICA / FARMACODINAMIA">
          <div className="panel"><div className="panel-body">
            {pharmacology.map((p) => (
              <div key={p.id} className="data-row">
                <span className="data-label">{p.property}</span>
                <span style={{ color: "var(--text-0)", fontSize: "0.8rem" }}>{p.value}</span>
              </div>
            ))}
          </div></div>
        </Section>
      )}

      {/* Presentation (local only) */}
      {localDrug && (
        <Section title="PRESENTACIÓN Y DILUCIÓN">
          <div className="info-grid">
            <KV k="Presentación" v={localDrug.ampulePresentation} />
            <KV k="Cantidad" v={`${fN(localDrug.ampuleAmount)} ${localDrug.ampuleUnit}`} />
            {localDrug.ampuleVolumeMl > 0 && <KV k="Vol. ampolla" v={`${fN(localDrug.ampuleVolumeMl)} mL`} />}
            <KV k="Dilución estándar" v={`${fN(localDrug.standardDilutionMl)} mL`} />
            <KV k="Unidad típica" v={localDrug.typicalDoseUnit} accent />
            {localDrug.ampuleVolumeMl > 0 && localDrug.standardDilutionMl > 0 && <KV k="Concentración" v={calcConc(localDrug)} accent />}
          </div>
        </Section>
      )}

      {/* Molecular */}
      {molecular && (
        <Section title="PROPIEDADES FISICOQUÍMICAS">
          <div className="info-grid">
            {molecular.formula && <KV k="Fórmula" v={molecular.formula} />}
            {molecular.molecular_weight && <KV k="Peso molecular" v={`${molecular.molecular_weight} g/mol`} />}
            {molecular.logp != null && <KV k="LogP" v={`${molecular.logp}`} />}
            {molecular.pka != null && <KV k="pKa" v={`${molecular.pka}`} />}
            {molecular.solubility && <KV k="Solubilidad" v={molecular.solubility} />}
            {molecular.physical_state && <KV k="Estado físico" v={molecular.physical_state} />}
          </div>
        </Section>
      )}

      {/* Dose Ranges (from local JSON) */}
      {localDrug && localDrug.doseRanges.length > 0 && (
        <Section title="RANGOS DE DOSIS (INFUSIÓN)">
          <div className="panel"><div className="panel-body">
            {localDrug.doseRanges.map((r, i) => (
              <div key={i} className="data-row">
                <span className="data-label">{r.label}</span>
                <span className="data-value mono" style={{ fontSize: "0.8rem" }}>{formatDoseRange(r)}</span>
              </div>
            ))}
          </div></div>
        </Section>
      )}

      {/* Extended dosing */}
      {dosing.length > 0 && (
        <Section title="POSOLOGÍA DETALLADA">
          <div className="panel"><div className="panel-body">
            {dosing.map((d) => (
              <div key={d.id} style={{ marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", gap: "0.35rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                  <span className="tag tag-accent">{d.population}</span>
                  {d.route && <span className="tag tag-muted">{d.route}</span>}
                </div>
                {d.indication && <p style={{ color: "var(--text-1)", fontSize: "0.8rem" }}>{d.indication}</p>}
                <div className="mono" style={{ color: "var(--accent)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                  {d.dose_min && d.dose_max ? `${d.dose_min} – ${d.dose_max} ${d.dose_unit || ""}` : "Ver notas"}
                  {d.frequency && <span style={{ color: "var(--text-2)" }}> · {d.frequency}</span>}
                </div>
                {d.notes && <p style={{ color: "var(--text-3)", fontSize: "0.7rem", marginTop: "0.2rem" }}>{d.notes}</p>}
              </div>
            ))}
          </div></div>
        </Section>
      )}

      {/* Adverse effects */}
      {adverseEffects.length > 0 && (
        <Section title="EFECTOS ADVERSOS">
          <div className="panel"><div className="panel-body">
            {adverseEffects.map((ae) => (
              <div key={ae.id} className="data-row">
                <div>
                  <span style={{ color: ae.is_black_box ? "var(--red, #ef4444)" : "var(--text-0)", fontSize: "0.8rem", fontWeight: ae.is_black_box ? 600 : 400 }}>
                    {ae.is_black_box && "⚠ "}{ae.effect}
                  </span>
                  {ae.organ_system && <span style={{ color: "var(--text-3)", fontSize: "0.65rem", marginLeft: "0.5rem" }}>{ae.organ_system}</span>}
                </div>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  {ae.frequency && <span className="tag tag-muted">{ae.frequency}</span>}
                  <span className="tag" style={{
                    color: ae.severity === "life-threatening" ? "var(--red, #ef4444)" : ae.severity === "severe" ? "#f97316" : "var(--text-2)",
                    borderColor: ae.severity === "life-threatening" ? "var(--red, #ef4444)" : ae.severity === "severe" ? "#f97316" : "var(--border-hi, var(--border))",
                    background: "var(--bg-3, var(--bg-2))"
                  }}>{ae.severity}</span>
                </div>
              </div>
            ))}
          </div></div>
        </Section>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Section title="ADVERTENCIAS Y CONTRAINDICACIONES">
          <div className="panel" style={{ borderLeft: "3px solid var(--red, #ef4444)" }}>
            <div className="panel-body">
              {warnings.map((w) => (
                <div key={w.id} style={{ marginBottom: "0.5rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.2rem" }}>
                    <span className="tag" style={{
                      color: w.is_black_box ? "#000" : w.is_contraindication ? "var(--red, #ef4444)" : "var(--amber, #f59e0b)",
                      background: w.is_black_box ? "var(--red, #ef4444)" : "transparent",
                      borderColor: w.is_contraindication ? "var(--red, #ef4444)" : "var(--amber, #f59e0b)"
                    }}>{w.type}</span>
                    {w.population && <span className="tag tag-muted">{w.population}</span>}
                  </div>
                  <p style={{ color: "var(--text-1)", fontSize: "0.8rem" }}>{w.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Pregnancy */}
      {pregnancy && (
        <Section title="EMBARAZO Y LACTANCIA">
          <div className="panel"><div className="panel-body">
            {pregnancy.fda_old_category && (
              <div className="data-row">
                <span className="data-label">Categoría FDA (antigua)</span>
                <span className="mono" style={{ color: "var(--amber, #f59e0b)", fontSize: "0.9rem", fontWeight: 700 }}>{pregnancy.fda_old_category}</span>
              </div>
            )}
            {pregnancy.fda_narrative && <p style={{ color: "var(--text-1)", fontSize: "0.8rem", marginTop: "0.5rem" }}>{pregnancy.fda_narrative}</p>}
            {pregnancy.lactation_safe != null && (
              <div className="data-row" style={{ marginTop: "0.5rem" }}>
                <span className="data-label">Lactancia</span>
                <span style={{ color: pregnancy.lactation_safe ? "var(--accent)" : "var(--red, #ef4444)", fontSize: "0.8rem", fontWeight: 600 }}>
                  {pregnancy.lactation_safe ? "Compatible" : "No recomendado"}
                </span>
              </div>
            )}
            {pregnancy.lactation_notes && <p style={{ color: "var(--text-2)", fontSize: "0.75rem", marginTop: "0.25rem" }}>{pregnancy.lactation_notes}</p>}
            {pregnancy.teratogenicity && <p style={{ color: "var(--text-2)", fontSize: "0.75rem", marginTop: "0.25rem" }}>Teratogenicidad: {pregnancy.teratogenicity}</p>}
          </div></div>
        </Section>
      )}

      {/* Brand names */}
      {brandNames.length > 0 && (
        <Section title="NOMBRES COMERCIALES">
          <div className="grid-panel" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
            {brandNames.map((b) => (
              <div key={b.id} style={{ padding: "0.5rem 0.65rem" }}>
                <div style={{ color: "var(--text-0)", fontSize: "0.8rem", fontWeight: 500 }}>{b.brand_name}</div>
                <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>
                  {b.manufacturer && `${b.manufacturer} · `}{b.country || "Global"}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Inline Calculator (local drugs only) */}
      {localDrug && (
        <Section title="CALCULADORA DE INFUSIÓN">
          <InlineCalc drug={localDrug} />
        </Section>
      )}

      {/* Loading */}
      {loading && (
        <div className="mono" style={{ textAlign: "center", color: "var(--text-3)", fontSize: "0.65rem", padding: "1rem" }}>
          cargando datos extendidos...
        </div>
      )}

      {/* Disclaimer */}
      <div className="panel" style={{ borderLeft: "3px solid var(--text-3)", marginTop: "2rem" }}>
        <div className="panel-body">
          <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem", lineHeight: 1.7 }}>
            {"⚕️ Información de referencia clínica. Verifique dosis, dilución y vía antes de administrar. No sustituye el juicio profesional."}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Inline Calculator ── */
function InlineCalc({ drug }: { drug: Drug }) {
  const [weight, setWeight] = useState("");
  const [dose, setDose] = useState("");
  const [doseUnit, setDoseUnit] = useState(drug.typicalDoseUnit);

  const concMcgMl = useMemo(() => {
    const amtMcg = drug.ampuleUnit === "mg" ? drug.ampuleAmount * 1000 : drug.ampuleUnit === "µg" ? drug.ampuleAmount : drug.ampuleAmount;
    return drug.standardDilutionMl > 0 ? amtMcg / drug.standardDilutionMl : 0;
  }, [drug]);

  const result = useMemo(() => {
    const w = parseFloat(weight) || 0;
    const d = parseFloat(dose) || 0;
    if (d <= 0 || concMcgMl <= 0) return null;
    let doseMcgMin = 0;
    const u = doseUnit.toLowerCase();
    if (u.includes("/kg/min")) { doseMcgMin = d * (w || 70); if (u.startsWith("mg")) doseMcgMin *= 1000; }
    else if (u.includes("/kg/h")) { doseMcgMin = (d * (w || 70)) / 60; if (u.startsWith("mg")) doseMcgMin *= 1000; }
    else if (u.includes("/min")) { doseMcgMin = d; if (u.startsWith("mg")) doseMcgMin *= 1000; }
    else if (u.includes("/h")) { doseMcgMin = d / 60; if (u.startsWith("mg")) doseMcgMin *= 1000; }
    else return null;
    const mlH = (doseMcgMin / concMcgMl) * 60;
    return { mlH: mlH.toFixed(1), mlMin: (doseMcgMin / concMcgMl).toFixed(2) };
  }, [weight, dose, doseUnit, concMcgMl]);

  const availableUnits = useMemo(() => {
    const units = new Set<string>();
    units.add(drug.typicalDoseUnit);
    drug.doseRanges.forEach((r) => units.add(r.unit));
    return Array.from(units).filter(Boolean);
  }, [drug]);

  return (
    <div className="panel scanline">
      <div className="panel-header"><span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 6px var(--accent)" }} /> INFUSION CALC</div>
      <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
        <div>
          <label className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", display: "block", marginBottom: "0.25rem" }}>PESO (kg)</label>
          <input type="number" className="calc-input mono" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <div>
            <label className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", display: "block", marginBottom: "0.25rem" }}>DOSIS</label>
            <input type="number" className="calc-input mono" placeholder="0.1" value={dose} onChange={(e) => setDose(e.target.value)} step="any" />
          </div>
          <div>
            <label className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", display: "block", marginBottom: "0.25rem" }}>UNIDAD</label>
            <select className="calc-select mono" value={doseUnit} onChange={(e) => setDoseUnit(e.target.value)}>
              {availableUnits.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", padding: "0.3rem 0", borderTop: "1px solid var(--border)" }}>
          {drug.ampulePresentation} en {fN(drug.standardDilutionMl)} mL → {concMcgMl.toFixed(2)} {drug.ampuleUnit === "U" ? "U" : "µg"}/mL
        </div>
        {result && (
          <div style={{ background: "var(--bg-1, var(--bg-2))", padding: "1rem", border: "1px solid var(--accent)", textAlign: "center" }}>
            <div className="calc-result">{result.mlH} mL/h</div>
            <div className="mono" style={{ color: "var(--text-2)", fontSize: "0.75rem", marginTop: "0.25rem" }}>= {result.mlMin} mL/min</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Helpers ── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "1.5rem" }}>
      <h2 style={{ fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.12em", color: "var(--text-3)", marginBottom: "0.6rem", paddingBottom: "0.35rem", borderBottom: "1px solid var(--border)" }}>{title}</h2>
      {children}
    </section>
  );
}

function KV({ k, v, accent = false }: { k: string; v: string; accent?: boolean }) {
  return (
    <div>
      <span style={{ color: "var(--text-3)", fontSize: "0.7rem" }}>{k}</span>
      <span className={accent ? "mono" : ""} style={{ color: accent ? "var(--accent)" : "var(--text-0)", fontSize: "0.8rem", fontWeight: 600 }}>{v}</span>
    </div>
  );
}

function fN(n: number): string {
  return n === Math.floor(n) && n < 100000 ? n.toString() : n.toFixed(2);
}

function calcConc(d: Drug): string {
  if (d.ampuleUnit === "U") return `${(d.ampuleAmount / d.standardDilutionMl).toFixed(2)} U/mL`;
  const mcg = d.ampuleUnit === "mg" ? d.ampuleAmount * 1000 : d.ampuleAmount;
  const c = mcg / d.standardDilutionMl;
  return c >= 1000 ? `${(c / 1000).toFixed(2)} mg/mL` : `${c.toFixed(2)} µg/mL`;
}
