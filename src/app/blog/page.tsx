import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artículos sobre anestesiología, farmacología clínica y tecnología médica.",
};

// Future: these will come from MDX files or a CMS
const posts = [
  {
    slug: "bienvenida",
    title: "Bienvenidos a DEC",
    excerpt: "Por qué decidí construir una herramienta de cálculo de dosis desde cero, y por qué las alternativas existentes no me convencían.",
    date: "2026-04-18",
    tags: ["DEC", "Anuncio"],
    readTime: "3 min",
  },
  {
    slug: "json-vs-core-data",
    title: "Por qué elegí JSON sobre Core Data para una base de datos de fármacos",
    excerpt: "La decisión arquitectónica detrás de la base de datos de DEC: cuándo una base de datos relacional es overkill y cuándo un archivo plano es exactamente lo que necesitas.",
    date: "2026-04-18",
    tags: ["Desarrollo", "iOS"],
    readTime: "5 min",
  },
  {
    slug: "vasopresores-infusion",
    title: "Guía rápida: Vasopresores en infusión continua",
    excerpt: "Norepinefrina, vasopresina, fenilefrina y epinefrina — diluciones estándar, rangos de dosis y perlas clínicas para el manejo hemodinámico.",
    date: "2026-04-18",
    tags: ["Farmacología", "UCI"],
    readTime: "8 min",
  },
];

export default function BlogPage() {
  return (
    <div className="wrap" style={{ paddingTop: "2rem", paddingBottom: "3rem", maxWidth: 800, margin: "0 auto" }}>
      <div className="prompt mono blink" style={{ marginBottom: "1rem" }}><b>$</b> tail -f /var/log/blog</div>

      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Blog</h1>
        <p style={{ color: "var(--text-2)", fontSize: "0.85rem" }}>
          Artículos sobre anestesiología, farmacología clínica y las decisiones detrás de DEC.
        </p>
      </header>

      {/* Coming soon notice */}
      <div className="panel" style={{ borderLeft: "3px solid var(--accent)", marginBottom: "2rem" }}>
        <div className="panel-body">
          <p className="mono" style={{ color: "var(--text-2)", fontSize: "0.7rem", lineHeight: 1.7 }}>
            El blog está en construcción. Los artículos mostrados abajo son un preview de lo que viene.
            <br /><span style={{ color: "var(--text-3)", opacity: 0.5 }}>// escribir artículos médicos toma más tiempo que intubar un Mallampati IV</span>
          </p>
        </div>
      </div>

      {/* Post list */}
      <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {posts.map((post) => (
          <article key={post.slug} className="blog-card fade-up">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              {post.tags.map((tag) => (
                <span key={tag} className="tag tag-accent">{tag}</span>
              ))}
              <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>{post.date}</span>
              <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>· {post.readTime}</span>
            </div>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.4rem", color: "var(--text-0)" }}>{post.title}</h2>
            <p style={{ color: "var(--text-2)", fontSize: "0.8rem", lineHeight: 1.6 }}>{post.excerpt}</p>
            <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem", marginTop: "0.75rem", opacity: 0.5 }}>
              // artículo completo próximamente
            </div>
          </article>
        ))}
      </div>

      {/* Subscribe teaser */}
      <div className="panel" style={{ marginTop: "2rem", textAlign: "center" }}>
        <div className="panel-header">NOTIFICACIONES</div>
        <div className="panel-body" style={{ padding: "1.5rem" }}>
          <p style={{ color: "var(--text-2)", fontSize: "0.8rem", marginBottom: "0.35rem" }}>
            ¿Quieres saber cuando publiquemos un artículo nuevo?
          </p>
          <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem" }}>
            // sistema de suscripción próximamente — por ahora, revisa de vez en cuando
          </p>
        </div>
      </div>
    </div>
  );
}
