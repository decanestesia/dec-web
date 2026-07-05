import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntryBySlug, legacySlugs } from "@/lib/blog-data";
import { canPublish } from "@/lib/auth";
import { renderMarkdown } from "@/lib/markdown";
import { BlockView } from "../BlockView";

interface Props {
  params: Promise<{ slug: string }>;
}

// Los posts de Supabase son dinámicos; pre-generamos solo los legacy.
// La página es dinámica de todos modos (lee Supabase en cada request).
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return legacySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getEntryBySlug(slug);
  if (!post) return { title: "Artículo no encontrado — DEC" };
  return {
    title: `${post.title} — DEC Blog`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getEntryBySlug(slug);
  if (!post) notFound();

  const mayPublish = post.source === "supabase" ? await canPublish() : false;

  return (
    <div className="wrap" style={{ paddingTop: "2rem", paddingBottom: "3rem", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
        <Link href="/blog" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
          ← /blog
        </Link>
        {mayPublish && post.source === "supabase" && (
          <Link
            href={`/blog/editar/${post.id}`}
            className="mono"
            style={{ color: "var(--accent)", fontSize: "0.7rem", textDecoration: "none" }}
          >
            editar ✎
          </Link>
        )}
      </div>

      <header style={{ margin: "1rem 0 2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
          {post.tags.map((t) => (
            <span key={t} className="tag tag-accent">{t}</span>
          ))}
          <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>{post.date}</span>
          <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>· {post.readTime}</span>
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)", marginBottom: "0.5rem" }}>
          {post.title}
        </h1>
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.68rem" }}>por {post.author}</p>
      </header>

      {post.source === "supabase" && post.coverImage && (
        <figure style={{ margin: "0 0 2rem" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt={post.title}
            loading="lazy"
            style={{ display: "block", width: "100%", border: "1px solid var(--border)", background: "var(--bg-2)" }}
          />
        </figure>
      )}

      <article>
        {post.source === "legacy"
          ? post.body.map((block, i) => <BlockView key={i} block={block} />)
          : renderMarkdown(post.bodyMd)}
      </article>

      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem", lineHeight: 1.7, opacity: 0.7 }}>
          {"// contenido educativo — no sustituye el juicio clínico ni las guías institucionales"}
        </p>
        <Link href="/blog" className="btn btn-outline btn-sm" style={{ marginTop: "1rem", textDecoration: "none" }}>
          ← más artículos
        </Link>
      </footer>
    </div>
  );
}
