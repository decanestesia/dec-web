import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Drug,
  DrugCatalog,
  slugify,
  formatDoseRange,
  CATEGORY_ICONS,
  getDrugsInCategory,
} from "@/lib/drugs";
import drugsData from "../../../../public/drugs.json";

const catalog = drugsData as DrugCatalog;

export async function generateStaticParams() {
  return catalog.drugs.map((drug) => ({
    slug: slugify(drug.name),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const drug = catalog.drugs.find((d) => slugify(d.name) === slug);
  if (!drug) return { title: "No encontrado" };

  return {
    title: `${drug.name} — Dosis y dilución`,
    description: drug.description.slice(0, 155),
  };
}

export default async function DrugDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const drug = catalog.drugs.find((d) => slugify(d.name) === slug);
  if (!drug) notFound();

  const related = getDrugsInCategory(catalog.drugs, drug.category)
    .filter((d) => d.name !== drug.name)
    .slice(0, 6);

  return (
    <div className="container-dec py-8 max-w-3xl">
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-2 mb-8 text-xs flex-wrap"
        style={{ fontFamily: "SF Mono, monospace", color: "var(--text-muted)" }}
      >
        <Link href="/farmacos" style={{ color: "var(--accent)" }} className="no-underline">
          fármacos
        </Link>
        <span>/</span>
        <span>{drug.category.toLowerCase()}</span>
        <span>/</span>
        <span style={{ color: "var(--text-secondary)" }}>{drug.name.toLowerCase()}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl">{CATEGORY_ICONS[drug.category] || "💊"}</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
              {drug.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="badge badge-category">{drug.category}</span>
              <span className="badge badge-unit">{drug.typicalDoseUnit}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Description */}
      <Section title="Farmacología">
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {drug.description}
        </p>
      </Section>

      {/* Presentation */}
      <Section title="Presentación y Dilución">
        <div className="info-grid">
          <InfoRow label="Presentación" value={drug.ampulePresentation} />
          <InfoRow
            label="Cantidad"
            value={`${fmtNum(drug.ampuleAmount)} ${drug.ampuleUnit}`}
          />
          {drug.ampuleVolumeMl > 0 && (
            <InfoRow label="Vol. ampolla" value={`${fmtNum(drug.ampuleVolumeMl)} mL`} />
          )}
          <InfoRow label="Dilución estándar" value={`${fmtNum(drug.standardDilutionMl)} mL`} />
          <InfoRow label="Unidad típica" value={drug.typicalDoseUnit} accent />
          {drug.ampuleVolumeMl > 0 && drug.standardDilutionMl > 0 && (
            <InfoRow label="Concentración" value={calcConc(drug)} accent />
          )}
        </div>
      </Section>

      {/* Dose Ranges */}
      {drug.doseRanges.length > 0 && (
        <Section title="Rangos de Dosis">
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "2px",
              padding: "0.5rem 0.75rem",
            }}
          >
            {drug.doseRanges.map((range, i) => (
              <div key={i} className="dose-row">
                <span style={{ color: "var(--text-secondary)" }}>
                  {range.label}
                </span>
                <span
                  className="font-semibold"
                  style={{ color: "var(--accent)", fontFamily: "SF Mono, monospace" }}
                >
                  {formatDoseRange(range)}
                </span>
                {(range.min !== 0 || range.max !== 0) && (
                  <span className="badge badge-unit">{range.unit}</span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Calculator CTA */}
      <Section title="Calculadora">
        <div
          className="p-5 text-center"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "2px",
            borderLeft: "3px solid var(--accent)",
          }}
        >
          <p
            className="text-xs mb-1"
            style={{ color: "var(--text-secondary)", fontFamily: "SF Mono, monospace" }}
          >
            La calculadora de infusión completa está en la app DEC para iOS.
          </p>
          <p
            className="text-xs"
            style={{ color: "var(--text-muted)", fontFamily: "SF Mono, monospace", opacity: 0.6 }}
          >
            {"// próximamente en esta web — si sobrevivimos al deploy"}
          </p>
        </div>
      </Section>

      {/* Related drugs */}
      {related.length > 0 && (
        <Section title={`Otros ${drug.category.toLowerCase()}`}>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-px overflow-hidden"
            style={{
              background: "var(--border)",
              border: "1px solid var(--border)",
              borderRadius: "2px",
            }}
          >
            {related.map((d) => (
              <Link
                key={d.name}
                href={`/farmacos/${slugify(d.name)}`}
                className="related-drug-link block p-3 no-underline"
              >
                <div
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {d.name}
                </div>
                <div
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted)", fontFamily: "SF Mono, monospace" }}
                >
                  {d.ampulePresentation} · {d.typicalDoseUnit}
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Disclaimer */}
      <div
        className="p-4 mt-8"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "2px",
          borderLeft: "3px solid var(--text-muted)",
        }}
      >
        <p
          className="text-xs"
          style={{ color: "var(--text-muted)", fontFamily: "SF Mono, monospace" }}
        >
          {"⚕️ Información de referencia clínica. Verifique dosis, dilución y vía antes de administrar. Este contenido no sustituye el juicio profesional ni el sentido común."}
        </p>
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
    <section className="mb-8">
      <h2
        className="text-xs font-semibold tracking-widest uppercase mb-3 pb-2"
        style={{
          color: "var(--text-muted)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function InfoRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <span
        className="text-sm font-semibold"
        style={{
          color: accent ? "var(--accent)" : "var(--text-primary)",
          fontFamily: accent ? "SF Mono, monospace" : "inherit",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function fmtNum(n: number): string {
  if (n === Math.floor(n) && n < 100000) return n.toString();
  return n.toFixed(2);
}

function calcConc(drug: Drug): string {
  if (drug.ampuleUnit === "U") {
    return `${(drug.ampuleAmount / drug.standardDilutionMl).toFixed(2)} U/mL`;
  }
  const amountUg = drug.ampuleUnit === "mg" ? drug.ampuleAmount * 1000 : drug.ampuleAmount;
  const concUg = amountUg / drug.standardDilutionMl;
  if (concUg >= 1000) return `${(concUg / 1000).toFixed(2)} mg/mL`;
  return `${concUg.toFixed(2)} µg/mL`;
}