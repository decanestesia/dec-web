import type { Metadata } from "next";
import Link from "next/link";
import { allPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artículos sobre anestesiología, farmacología clínica y las decisiones detrás de DEC.",
};

export default function BlogPage() {
  const posts = allPosts();
  return (
    <div className="wrap" style={{ paddingTop: "2rem", paddingBottom: "3rem", maxWidth: 800, margin: "0 auto" }}>
      <div className="prompt mono blink" style={{ marginBottom: "1rem" }}>
        <b>$</b> tail -f /var/log/blog
      </div>

      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Blog</h1>
        <p style={{ color: "var(--text-2)", fontSize: "0.85rem" }}>
          Anestesiología, farmacología clínica y las decisiones detrás de DEC.
        </p>
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem", marginTop: "0.35rem", opacity: 0.6 }}>
          {"// escribir artículos médicos toma más tiempo que intubar un Mallampati IV"}
        </p>
      </header>

      <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="blog-card fade-up card-interactive"
            style={{ textDecoration: "none", display: "block" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              {post.tags.map((tag) => (
                <span key={tag} className="tag tag-accent">{tag}</span>
              ))}
              <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>{post.date}</span>
              <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>· {post.readTime}</span>
            </div>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.4rem", color: "var(--text-0)" }}>
              {post.title}
            </h2>
            <p style={{ color: "var(--text-2)", fontSize: "0.8rem", lineHeight: 1.6 }}>{post.excerpt}</p>
            <div className="mono" style={{ color: "var(--accent)", fontSize: "0.65rem", marginTop: "0.75rem" }}>
              leer →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
