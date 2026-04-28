import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  loadCatalogSync,
  findDrugBySlug,
  fetchDrugDetail,
  slugify,
  sortAdverseEffects,
  sortWarnings,
} from "@/lib/drugs";
import { InfusionCalculator } from "./InfusionCalculator";

// Pre-render todas las páginas en build time (SSG)
export async function generateStaticParams() {
  const catalog = loadCatalogSync();
  return catalog.drugs.map((d) => ({ slug: slugify(d.name) }));
}

// Revalidación incremental cada 5 min para datos de Supabase
export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const catalog = loadCatalogSync();
  const drug = findDrugBySlug(catalog.drugs, slug);
  if (!drug) return { title: "Fármaco no encontrado" };
  return {
    title: drug.name,
    description: drug.description.slice(0, 160) || drug.mechanism_of_action,
    openGraph: {
      title: `${drug.name} | DEC Anestesia`,
      description: drug.description.slice(0, 200),
    },
  };
}

export default async function DrugPage({ params }: Props) {
  const { slug } = await params;
  const catalog = loadCatalogSync();
  const drug = findDrugBySlug(catalog.drugs, slug);
  if (!drug) notFound();

  // Fetch rich detail at request time
  const detail = await fetchDrugDetail(drug.id).catch(() => null);

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumbs */}
      <nav className="text-sm text-foreground/60 mb-4">
        <Link href="/farmacos" className="hover:text-emerald-600">
          Catálogo
        </Link>{" "}
        / <span>{drug.category}</span>
      </nav>

      {/* Header */}
      <header className="mb-6 pb-4 border-b border-foreground/10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold mb-1">{drug.name}</h1>
            {drug.generic_name && drug.generic_name !== drug.name && (
              <p className="text-foreground/60 italic">{drug.generic_name}</p>
            )}
          </div>
          <span className="px-3 py-1 rounded-full bg-foreground/5 border border-foreground/10 text-sm">
            {drug.category_icon} {drug.category}
          </span>
        </div>
      </header>

      {/* Description */}
      {drug.description && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Descripción clínica</h2>
          <p className="leading-relaxed">{drug.description}</p>
        </section>
      )}

      {/* Mechanism of action */}
      {drug.mechanism_of_action && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Mecanismo de acción</h2>
          <p className="leading-relaxed text-foreground/85">
            {drug.mechanism_of_action}
          </p>
        </section>
      )}

      {/* Infusion calculator (fusion calc + encyclopedia) */}
      {drug.infusion && drug.infusion.length > 0 && (
        <section className="mb-6 p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <span>🧮</span> Calculadora de infusión
          </h2>
          <InfusionCalculator drugName={drug.name} entries={drug.infusion} />
        </section>
      )}

      {/* Black box warnings (top, prominent) */}
      {detail && detail.warnings.some((w) => w.is_black_box) && (
        <section className="mb-6 p-4 rounded-lg border-2 border-red-600 bg-red-50 dark:bg-red-950/30">
          <h2 className="text-xl font-bold mb-2 text-red-700 dark:text-red-400 flex items-center gap-2">
            ⚠️ Advertencias de caja negra (FDA)
          </h2>
          <ul className="space-y-2">
            {detail.warnings
              .filter((w) => w.is_black_box)
              .map((w, i) => (
                <li key={i} className="text-sm leading-relaxed">
                  {w.description}
                </li>
              ))}
          </ul>
        </section>
      )}

      {/* Pharmacology */}
      {detail && detail.pharmacology.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Farmacología</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            {detail.pharmacology.map((p, i) => (
              <div key={i} className="border-l-2 border-emerald-500 pl-3 py-1">
                <dt className="text-sm font-semibold text-foreground/70">
                  {p.property}
                </dt>
                <dd className="text-sm">{p.value}</dd>
                {p.details && (
                  <dd className="text-xs text-foreground/60 mt-0.5">
                    {p.details}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Adverse effects */}
      {detail && detail.adverse_effects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Efectos adversos</h2>
          <ul className="space-y-1">
            {sortAdverseEffects(detail.adverse_effects).map((ae, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm py-1 border-b border-foreground/5 last:border-0"
              >
                <SeverityBadge severity={ae.severity} />
                <span className="flex-1">
                  {ae.effect}
                  {ae.organ_system && (
                    <span className="text-foreground/50 ml-2">
                      · {ae.organ_system}
                    </span>
                  )}
                  {ae.frequency && (
                    <span className="text-foreground/50 ml-2 italic">
                      ({ae.frequency})
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Warnings & contraindications */}
      {detail && detail.warnings.some((w) => !w.is_black_box) && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">
            Advertencias y contraindicaciones
          </h2>
          <ul className="space-y-2">
            {sortWarnings(detail.warnings)
              .filter((w) => !w.is_black_box)
              .map((w, i) => (
                <li
                  key={i}
                  className={`p-3 rounded text-sm ${
                    w.is_contraindication
                      ? "bg-red-500/10 border-l-4 border-red-500"
                      : "bg-amber-500/10 border-l-4 border-amber-500"
                  }`}
                >
                  <div className="font-medium text-xs uppercase tracking-wide mb-1 text-foreground/70">
                    {w.is_contraindication ? "Contraindicación" : "Advertencia"}
                  </div>
                  {w.description}
                </li>
              ))}
          </ul>
        </section>
      )}

      {/* Pregnancy & lactation */}
      {detail && detail.pregnancy && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Embarazo y lactancia</h2>
          <div className="p-4 rounded-lg bg-foreground/5">
            {detail.pregnancy.fda_old_category && (
              <div className="mb-2">
                <span className="font-semibold">Categoría FDA: </span>
                <span
                  className={`px-2 py-0.5 rounded text-sm font-bold ${
                    detail.pregnancy.fda_old_category === "X"
                      ? "bg-red-600 text-white"
                      : detail.pregnancy.fda_old_category === "D"
                        ? "bg-orange-500 text-white"
                        : detail.pregnancy.fda_old_category === "C"
                          ? "bg-amber-500 text-white"
                          : "bg-emerald-500 text-white"
                  }`}
                >
                  {detail.pregnancy.fda_old_category}
                </span>
              </div>
            )}
            {detail.pregnancy.fda_narrative && (
              <p className="text-sm leading-relaxed mb-2">
                {detail.pregnancy.fda_narrative}
              </p>
            )}
            {detail.pregnancy.lactation_notes && (
              <p className="text-sm">
                <strong>Lactancia:</strong> {detail.pregnancy.lactation_notes}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Brand names */}
      {detail && detail.brands.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Marcas comerciales</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {detail.brands.map((b, i) => (
              <li
                key={i}
                className="text-sm p-2 rounded bg-foreground/5 flex items-center justify-between"
              >
                <span className="font-medium">{b.brand_name}</span>
                <span className="text-xs text-foreground/60 text-right">
                  {b.manufacturer && <div>{b.manufacturer}</div>}
                  {b.country && <div>{b.country}</div>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Disclaimer */}
      <footer className="mt-8 p-4 rounded-lg bg-foreground/5 text-xs text-foreground/60 leading-relaxed">
        Información de referencia clínica. No sustituye el juicio del
        profesional ni la ficha técnica oficial. Verificar dosis y
        contraindicaciones antes de cualquier prescripción.{" "}
        <Link href="/legal/disclaimer" className="underline">
          Ver descargo completo
        </Link>
        .
      </footer>
    </article>
  );
}

function SeverityBadge({ severity }: { severity: string | null }) {
  const map: Record<string, { label: string; cls: string }> = {
    "life-threatening": {
      label: "L",
      cls: "bg-red-600 text-white",
    },
    severe: { label: "S", cls: "bg-orange-500 text-white" },
    moderate: { label: "M", cls: "bg-amber-500 text-white" },
    mild: { label: "l", cls: "bg-emerald-500 text-white" },
  };
  const sev = severity ? map[severity] : null;
  if (!sev)
    return (
      <span className="w-5 h-5 inline-block flex-shrink-0 rounded bg-foreground/20 text-white text-xs flex items-center justify-center font-bold">
        ?
      </span>
    );
  return (
    <span
      title={severity ?? ""}
      className={`w-5 h-5 inline-flex flex-shrink-0 rounded text-xs items-center justify-center font-bold ${sev.cls}`}
    >
      {sev.label}
    </span>
  );
}
