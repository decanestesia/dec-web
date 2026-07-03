import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, allPosts, type Block } from "@/lib/blog";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return allPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Artículo no encontrado — DEC" };
  return {
    title: `${post.title} — DEC Blog`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
  };
}

const CALLOUT: Record<string, { border: string; icon: string }> = {
  info: { border: "var(--cyan)", icon: "ℹ" },
  warn: { border: "var(--amber)", icon: "⚠" },
  danger: { border: "var(--red)", icon: "⛔" },
};

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return (
        <p style={{ color: "var(--text-1)", fontSize: "0.9rem", lineHeight: 1.75, margin: "0 0 1rem" }}>
          {block.text}
        </p>
      );
    case "h2":
      return (
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-0)", margin: "2rem 0 0.75rem" }}>
          {block.text}
        </h2>
      );
    case "ul":
      return (
        <ul style={{ margin: "0 0 1rem", paddingLeft: "1.1rem", color: "var(--text-1)", fontSize: "0.88rem", lineHeight: 1.7 }}>
          {block.items.map((it, i) => (
            <li key={i} style={{ marginBottom: "0.4rem" }}>{it}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol style={{ margin: "0 0 1rem", paddingLeft: "1.3rem", color: "var(--text-1)", fontSize: "0.88rem", lineHeight: 1.7 }}>
          {block.items.map((it, i) => (
            <li key={i} style={{ marginBottom: "0.4rem" }}>{it}</li>
          ))}
        </ol>
      );
    case "callout": {
      const c = CALLOUT[block.variant];
      return (
        <div className="panel" style={{ borderLeft: `3px solid ${c.border}`, margin: "1.25rem 0" }}>
          <div className="panel-body" style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
            <span style={{ color: c.border, fontSize: "0.9rem" }}>{c.icon}</span>
            <p style={{ color: "var(--text-1)", fontSize: "0.82rem", lineHeight: 1.65, margin: 0 }}>{block.text}</p>
          </div>
        </div>
      );
    }
    case "code":
      return (
        <pre
          className="mono"
          style={{
            background: "var(--bg-2)", border: "1px solid var(--border)", padding: "0.85rem 1rem",
            fontSize: "0.72rem", color: "var(--accent)", overflowX: "auto", margin: "0 0 1rem",
          }}
        >
          {block.text}
        </pre>
      );
    case "quote":
      return (
        <blockquote
          className="mono"
          style={{
            borderLeft: "3px solid var(--accent)", paddingLeft: "1rem", margin: "1.25rem 0",
            color: "var(--text-2)", fontSize: "0.85rem", fontStyle: "italic",
          }}
        >
          {block.text}
        </blockquote>
      );
    case "table":
      return (
        <div style={{ overflowX: "auto", margin: "0 0 1.25rem", border: "1px solid var(--border)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 440 }}>
            <thead>
              <tr style={{ background: "var(--bg-2)" }}>
                {block.headers.map((h, i) => (
                  <th key={i} className="mono" style={{ textAlign: "left", padding: "0.5rem 0.7rem", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-2)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} style={{ borderTop: "1px solid var(--border)" }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: "0.5rem 0.7rem", fontSize: "0.76rem", color: ci === 0 ? "var(--text-0)" : "var(--text-1)", fontWeight: ci === 0 ? 600 : 400 }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <div className="wrap" style={{ paddingTop: "2rem", paddingBottom: "3rem", maxWidth: 720, margin: "0 auto" }}>
      <Link href="/blog" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← /blog
      </Link>

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

      <article>
        {post.body.map((block, i) => (
          <BlockView key={i} block={block} />
        ))}
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
