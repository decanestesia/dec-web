import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  loadCatalogSync,
  findDrugBySlug,
  fetchDrugDetail,
  slugify,
  getDrugsInCategory,
  sortAdverseEffects,
  sortWarnings,
  hasMolecularData,
  SEVERITY_COLOR,
  type DrugDetail,
} from "@/lib/drugs";
import { InfusionCalculator } from "./InfusionCalculator";
import { MolecularSection } from "./MolecularSection";
import { InteractionsSection } from "./InteractionsSection";
import { DosingSection } from "./DosingSection";

export async function generateStaticParams() {
  const catalog = loadCatalogSync();
  return catalog.drugs.map((d) => ({ slug: slugify(d.name) }));
}

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const catalog = loadCatalogSync();
  const drug = findDrugBySlug(catalog.drugs, slug);
  if (!drug) return { title: "No encontrado" };
  return {
    title: drug.name,
    description: drug.description.slice(0, 160) || drug.mechanism_of_action,
    openGraph: {
      title: `${drug.name} | DEC Anestesia`,
      description: drug.description.slice(0, 200),
    },
  };
}

export default async function DrugDetailPage({ params }: Props) {
  const { slug } = await params;
  const catalog = loadCatalogSync();
  const drug = findDrugBySlug(catalog.drugs, slug);
  if (!drug) notFound();

  const detail: DrugDetail | null = await fetchDrugDetail(drug.id).catch(
    () => null
  );

  const related = getDrugsInCategory(catalog.drugs, drug.category)
    .filter((d) => d.id !== drug.id)
    .slice(0, 6);

  const blackBoxWarnings = detail?.warnings.filter((w) => w.is_black_box) ?? [];
  const otherWarnings = detail?.warnings.filter((w) => !w.is_black_box) ?? [];
  const showMolecular =
    detail?.molecular && hasMolecularData(detail.molecular);
  const showInteractions =
    detail?.interactions && detail.interactions.length > 0;
  const hasContraindicatedInteraction =
    detail?.interactions?.some((i) => i.severity === "contraindicated") ?? false;

  return (
    <div
      className="wrap"
      style={{
        paddingTop: "1.5rem",
        paddingBottom: "3rem",
        maxWidth: 760,
        margin: "0 auto",
      }}
    >
      {/* Breadcrumb */}
      <nav
        className="mono"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          marginBottom: "1.5rem",
          fontSize: "0.65rem",
          color: "var(--text-3)",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/farmacos"
          style={{ color: "var(--accent)", textDecoration: "none" }}
        >
          fármacos
        </Link>
        <span>/</span>
        <span>{drug.category.toLowerCase()}</span>
        <span>/</span>
        <span style={{ color: "var(--text-1)" }}>{drug.name.toLowerCase()}</span>
      </nav>

      {/* Header */}
      <header style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.8rem" }}>{drug.category_icon}</span>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1.2 }}>
              {drug.name}
            </h1>
            {drug.generic_name && drug.generic_name !== drug.name && (
              <p
                className="mono"
                style={{
                  color: "var(--text-3)",
                  fontSize: "0.65rem",
                  marginTop: "0.25rem",
                }}
              >
                {drug.generic_name}
              </p>
            )}
            <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
              <span className="tag tag-accent">{drug.category}</span>
              {drug.infusion && drug.infusion.length > 0 && (
                <span className="tag tag-accent mono">CALC</span>
              )}
              {showMolecular && (
                <span className="tag tag-accent mono">MOL</span>
              )}
              {showInteractions && (
                <span
                  className="tag mono"
                  style={{
                    color: hasContraindicatedInteraction ? "var(--red)" : "var(--amber)",
                    borderColor: hasContraindicatedInteraction ? "var(--red)" : "var(--amber)",
                    background: "transparent",
                  }}
                >
                  {hasContraindicatedInteraction ? "⚠ CI" : "INT"}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Black box warnings */}
      {blackBoxWarnings.length > 0 && (
        <div
          className="panel"
          style={{
            borderLeft: "3px solid var(--red)",
            marginBottom: "1.5rem",
            background: "rgba(239,68,68,0.05)",
          }}
        >
          <div className="panel-header">
            <span
              className="dot"
              style={{
                background: "var(--red)",
                boxShadow: "0 0 6px var(--red)",
              }}
            />
            ADVERTENCIA DE CAJA NEGRA — FDA
          </div>
          <div className="panel-body">
            {blackBoxWarnings.map((w, i) => (
              <p
                key={i}
                style={{
                  color: "var(--text-1)",
                  fontSize: "0.8rem",
                  lineHeight: 1.7,
                  marginBottom:
                    i < blackBoxWarnings.length - 1 ? "0.5rem" : 0,
                }}
              >
                {w.description}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {drug.description && (
        <Section title="DESCRIPCIÓN CLÍNICA">
          <p
            style={{
              color: "var(--text-1)",
              fontSize: "0.85rem",
              lineHeight: 1.7,
            }}
          >
            {drug.description}
          </p>
        </Section>
      )}

      {/* Mechanism */}
      {drug.mechanism_of_action && (
        <Section title="MECANISMO DE ACCIÓN">
          <p
            style={{
              color: "var(--text-1)",
              fontSize: "0.85rem",
              lineHeight: 1.7,
            }}
          >
            {drug.mechanism_of_action}
          </p>
        </Section>
      )}

      {/* Dosing — v18 */}
      <DosingSection entries={detail?.dosing ?? []} />

      {/* Infusion calculator */}
      {drug.infusion && drug.infusion.length > 0 && (
        <Section title="CALCULADORA DE INFUSIÓN">
          <InfusionCalculator
            drugName={drug.name}
            entries={drug.infusion}
          />
        </Section>
      )}

      {/* Molecular */}
      {showMolecular && detail?.molecular && (
        <Section title="ESTRUCTURA QUÍMICA">
          <MolecularSection
            drugName={drug.name}
            molecular={detail.molecular}
          />
        </Section>
      )}

      {/* Pharmacology */}
      {detail && detail.pharmacology.length > 0 && (
        <Section title="FARMACOLOGÍA">
          <div className="panel">
            <div className="panel-body" style={{ padding: 0 }}>
              {detail.pharmacology.map((p, i) => (
                <div
                  key={i}
                  className="data-row"
                  style={{
                    padding: "0.5rem 0.75rem",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    className="data-label"
                    style={{ flexShrink: 0, fontWeight: 500 }}
                  >
                    {p.property}
                  </span>
                  <span
                    style={{
                      color: "var(--text-0)",
                      fontSize: "0.78rem",
                      textAlign: "right",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {p.value}
                    {p.details && (
                      <div
                        className="mono"
                        style={{
                          color: "var(--text-3)",
                          fontSize: "0.65rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        {p.details}
                      </div>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* INTERACTIONS — NEW v16.3 */}
      {showInteractions && detail && (
        <Section
          title={
            hasContraindicatedInteraction
              ? "⚠ INTERACCIONES — INCLUYE CONTRAINDICADAS"
              : "INTERACCIONES FARMACOLÓGICAS"
          }
        >
          <InteractionsSection
            interactions={detail.interactions}
            drugName={drug.name}
          />
        </Section>
      )}

      {/* Adverse effects */}
      {detail && detail.adverse_effects.length > 0 && (
        <Section title="EFECTOS ADVERSOS">
          <div className="panel">
            <div className="panel-body" style={{ padding: 0 }}>
              {sortAdverseEffects(detail.adverse_effects).map((ae, i) => (
                <div
                  key={i}
                  style={{
                    padding: "0.5rem 0.75rem",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    className="mono"
                    title={ae.severity ?? ""}
                    style={{
                      flexShrink: 0,
                      fontSize: "0.55rem",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      padding: "0.15rem 0.35rem",
                      border: "1px solid",
                      borderColor: ae.severity
                        ? SEVERITY_COLOR[ae.severity]
                        : "var(--border-hi)",
                      color: ae.severity
                        ? SEVERITY_COLOR[ae.severity]
                        : "var(--text-3)",
                      minWidth: 60,
                      textAlign: "center",
                    }}
                  >
                    {(ae.severity ?? "?").slice(0, 4)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        color: "var(--text-0)",
                        fontSize: "0.78rem",
                        lineHeight: 1.4,
                      }}
                    >
                      {ae.effect}
                    </div>
                    <div
                      className="mono"
                      style={{
                        color: "var(--text-3)",
                        fontSize: "0.6rem",
                        marginTop: "0.15rem",
                      }}
                    >
                      {ae.organ_system && <span>{ae.organ_system}</span>}
                      {ae.organ_system && ae.frequency && <span> · </span>}
                      {ae.frequency && (
                        <span style={{ fontStyle: "italic" }}>
                          {ae.frequency}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Warnings & contraindications */}
      {otherWarnings.length > 0 && (
        <Section title="ADVERTENCIAS Y CONTRAINDICACIONES">
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {sortWarnings(otherWarnings).map((w, i) => (
              <div
                key={i}
                className="panel"
                style={{
                  borderLeft: `3px solid ${
                    w.is_contraindication ? "var(--red)" : "var(--amber)"
                  }`,
                }}
              >
                <div
                  style={{
                    padding: "0.5rem 0.75rem",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    className="tag mono"
                    style={{
                      flexShrink: 0,
                      color: w.is_contraindication
                        ? "var(--red)"
                        : "var(--amber)",
                      borderColor: w.is_contraindication
                        ? "var(--red)"
                        : "var(--amber)",
                      background: "transparent",
                    }}
                  >
                    {w.is_contraindication ? "CI" : "WARN"}
                  </span>
                  <p
                    style={{
                      color: "var(--text-1)",
                      fontSize: "0.78rem",
                      lineHeight: 1.6,
                      flex: 1,
                    }}
                  >
                    {w.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Pregnancy & lactation */}
      {detail && detail.pregnancy && (
        <Section title="EMBARAZO Y LACTANCIA">
          <div className="panel">
            <div
              className="panel-body"
              style={{ display: "grid", gap: "0.5rem" }}
            >
              {detail.pregnancy.fda_old_category && (
                <div className="data-row">
                  <span className="data-label">Categoría FDA</span>
                  <span
                    className="mono"
                    style={{
                      padding: "0.15rem 0.5rem",
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      color: "#000",
                      background: pregnancyColor(
                        detail.pregnancy.fda_old_category
                      ),
                    }}
                  >
                    {detail.pregnancy.fda_old_category}
                  </span>
                </div>
              )}
              {detail.pregnancy.fda_narrative && (
                <p
                  style={{
                    color: "var(--text-1)",
                    fontSize: "0.78rem",
                    lineHeight: 1.6,
                  }}
                >
                  {detail.pregnancy.fda_narrative}
                </p>
              )}
              {detail.pregnancy.lactation_notes && (
                <p
                  style={{
                    color: "var(--text-1)",
                    fontSize: "0.78rem",
                    lineHeight: 1.6,
                    paddingTop: "0.5rem",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <strong style={{ color: "var(--text-0)" }}>
                    Lactancia:{" "}
                  </strong>
                  {detail.pregnancy.lactation_notes}
                </p>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* Brand names */}
      {detail && detail.brands.length > 0 && (
        <Section title="MARCAS COMERCIALES">
          <div className="info-grid">
            {detail.brands.map((b, i) => (
              <div key={i}>
                <span
                  style={{
                    color: "var(--text-0)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  {b.brand_name}
                </span>
                <span
                  className="mono"
                  style={{ color: "var(--text-3)", fontSize: "0.6rem" }}
                >
                  {b.manufacturer}
                  {b.country && ` · ${b.country}`}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <Section title={`OTROS ${drug.category.toUpperCase()}`}>
          <div
            className="grid-panel"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            }}
          >
            {related.map((d) => (
              <Link
                key={d.id}
                href={`/farmacos/${slugify(d.name)}`}
                className="card-interactive"
                style={{
                  display: "block",
                  padding: "0.6rem",
                  textDecoration: "none",
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
                    marginTop: "0.2rem",
                  }}
                >
                  {d.infusion?.[0]?.ampule_presentation ||
                    d.infusion?.[0]?.dose_unit ||
                    "ver ficha"}
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Disclaimer */}
      <div
        className="panel"
        style={{ borderLeft: "3px solid var(--text-3)", marginTop: "2rem" }}
      >
        <div className="panel-body">
          <p
            className="mono"
            style={{
              color: "var(--text-3)",
              fontSize: "0.65rem",
              lineHeight: 1.7,
            }}
          >
            ⚕️ Información de referencia clínica. Verifique dosis, dilución y
            vía antes de administrar. No sustituye el juicio profesional ni la
            ficha técnica oficial.{" "}
            <Link
              href="/legal/disclaimer"
              style={{
                color: "var(--accent)",
                textDecoration: "underline",
              }}
            >
              Ver descargo
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "1.5rem" }}>
      <h2
        style={{
          fontSize: "0.6rem",
          fontWeight: 600,
          letterSpacing: "0.12em",
          color: "var(--text-3)",
          marginBottom: "0.6rem",
          paddingBottom: "0.35rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function pregnancyColor(cat: string): string {
  switch (cat.charAt(0)) {
    case "X":
      return "#ef4444";
    case "D":
      return "#f59e0b";
    case "C":
      return "#fbbf24";
    case "B":
      return "#10b981";
    case "A":
      return "#06b6d4";
    default:
      return "#7a8194";
  }
}
