// src/app/blog/BlogEditor.tsx
//
// Editor de posts en el navegador. "use client": estado local + vista previa
// en vivo con el MISMO renderer de markdown que la ficha (renderMarkdown).
// La escritura va por saveBlogPost (server action) → upsert a blog_posts con
// RLS aplicada. El gating de acceso lo hace la página server que lo monta;
// aquí asumimos que el usuario ya pasó el gate.

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { renderMarkdown } from "@/lib/markdown";
import { slugify } from "@/lib/slug";
import { saveBlogPost, type BlogDraft } from "./blog-actions";

export interface EditorInitial {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  bodyMd: string;
  tags: string[];
  coverImage: string;
  published: boolean;
}

const EMPTY: EditorInitial = {
  slug: "",
  title: "",
  excerpt: "",
  bodyMd: "",
  tags: [],
  coverImage: "",
  published: false,
};

const PLACEHOLDER_BODY = `Escribe en **markdown**.

## Un encabezado

Un párrafo con _énfasis_, un [enlace](https://decanestesia.com) y \`código\` en línea.

- viñeta uno
- viñeta dos

1. paso uno
2. paso dos

> Una cita en tono terminal.

\`\`\`
un bloque de código
\`\`\`

![pie de imagen](https://ejemplo.com/imagen.png)`;

export function BlogEditor({ initial }: { initial?: EditorInitial }) {
  const router = useRouter();
  const start = initial ?? EMPTY;

  const [title, setTitle] = useState(start.title);
  const [slug, setSlug] = useState(start.slug);
  // Si el slug arranca vacío (post nuevo), se auto-genera del título hasta que
  // el usuario lo edite a mano.
  const [slugTouched, setSlugTouched] = useState(Boolean(start.slug));
  const [excerpt, setExcerpt] = useState(start.excerpt);
  const [tagsRaw, setTagsRaw] = useState(start.tags.join(", "));
  const [coverImage, setCoverImage] = useState(start.coverImage);
  const [bodyMd, setBodyMd] = useState(start.bodyMd);
  const [published, setPublished] = useState(start.published);

  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const effectiveSlug = slugTouched ? slug : slugify(title);
  const preview = useMemo(() => renderMarkdown(bodyMd || PLACEHOLDER_BODY), [bodyMd]);

  function onTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function onSave() {
    setError(null);
    setOkMsg(null);
    const draft: BlogDraft = {
      id: start.id,
      slug: effectiveSlug,
      title,
      excerpt,
      bodyMd,
      tags: tagsRaw.split(",").map((t) => t.trim()).filter(Boolean),
      coverImage,
      published,
    };
    startTransition(async () => {
      const res = await saveBlogPost(draft);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOkMsg(published ? "Publicado." : "Guardado como borrador.");
      // Si se publicó, lleva a la ficha; si es borrador, queda en el editor
      // pero pasa a modo edición (por id) para futuras guardadas.
      if (published) {
        router.push(`/blog/${res.slug}`);
      } else if (!start.id) {
        router.replace(`/blog/editar/${res.id}`);
      }
    });
  }

  return (
    <div className="wrap" style={{ paddingTop: "2rem", paddingBottom: "3rem", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div className="prompt mono" style={{ margin: 0 }}>
          <b>$</b> {start.id ? "vim" : "nano"} /var/log/blog/{effectiveSlug || "nuevo-post"}.md
        </div>
        <Link href="/blog" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
          ← /blog
        </Link>
      </div>

      <div className="editor-grid">
        {/* ── Columna: formulario ────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          <FieldLabel label="Título">
            <input className="ed-input" value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Título del artículo" />
          </FieldLabel>

          <FieldLabel label="Slug" hint="se auto-genera del título · editable">
            <input
              className="ed-input mono"
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="mi-articulo"
            />
          </FieldLabel>

          <FieldLabel label="Excerpt" hint="resumen para la lista">
            <textarea className="ed-input" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Una o dos frases que resuman el post." />
          </FieldLabel>

          <FieldLabel label="Tags" hint="separados por coma">
            <input className="ed-input" value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} placeholder="Farmacología, Emergencias" />
          </FieldLabel>

          <FieldLabel label="Cover image" hint="URL opcional">
            <input className="ed-input mono" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://…/portada.png" />
          </FieldLabel>

          <FieldLabel label="Cuerpo (markdown)">
            <textarea
              className="ed-input mono ed-body"
              rows={18}
              value={bodyMd}
              onChange={(e) => setBodyMd(e.target.value)}
              placeholder={PLACEHOLDER_BODY}
              spellCheck={false}
            />
          </FieldLabel>

          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            <span className="mono" style={{ fontSize: "0.72rem", color: published ? "var(--accent)" : "var(--text-2)" }}>
              {published ? "PUBLICADO — visible en /blog" : "BORRADOR — no visible al público"}
            </span>
          </label>

          {error && (
            <p className="mono" style={{ fontSize: "0.72rem", color: "var(--red)", margin: 0 }}>{error}</p>
          )}
          {okMsg && (
            <p className="mono" style={{ fontSize: "0.72rem", color: "var(--accent)", margin: 0 }}>{okMsg}</p>
          )}

          <button className="ed-save" onClick={onSave} disabled={isPending}>
            {isPending ? "Guardando…" : published ? "Publicar" : "Guardar borrador"}
          </button>
        </div>

        {/* ── Columna: vista previa en vivo ──────────────────────── */}
        <div>
          <div className="mono" style={{ fontSize: "0.6rem", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: "0.5rem", textTransform: "uppercase" }}>
            vista previa
          </div>
          <div className="ed-preview">
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)", marginBottom: "0.5rem" }}>
              {title || "Título del artículo"}
            </h1>
            {excerpt && (
              <p style={{ color: "var(--text-2)", fontSize: "0.82rem", lineHeight: 1.6, marginBottom: "1rem" }}>{excerpt}</p>
            )}
            {coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverImage} alt="" style={{ display: "block", width: "100%", border: "1px solid var(--border)", marginBottom: "1.25rem", background: "var(--bg-2)" }} />
            )}
            <article>{preview}</article>
          </div>
        </div>
      </div>

      <style jsx>{`
        .editor-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 860px) {
          .editor-grid { grid-template-columns: 1fr; }
        }
        .ed-preview {
          border: 1px solid var(--border);
          background: var(--bg-1);
          padding: 1.25rem;
          position: sticky;
          top: 1rem;
          max-height: calc(100vh - 2rem);
          overflow-y: auto;
        }
      `}</style>
      <style jsx global>{`
        .ed-input {
          width: 100%;
          padding: 0.5rem 0.6rem;
          background: var(--bg-0);
          color: var(--text-0);
          border: 1px solid var(--border);
          font-size: 0.82rem;
          font-family: inherit;
          transition: border-color 0.15s;
          resize: vertical;
        }
        .ed-input:focus { outline: none; border-color: var(--accent); }
        .ed-body { min-height: 320px; line-height: 1.6; font-size: 0.78rem; }
        .ed-save {
          padding: 0.7rem 0.75rem;
          background: var(--accent);
          color: var(--bg-0);
          border: none;
          font-size: 0.82rem;
          font-weight: 600;
          font-family: inherit;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .ed-save:hover:not(:disabled) { opacity: 0.9; }
        .ed-save:disabled { opacity: 0.5; cursor: wait; }
      `}</style>
    </div>
  );
}

function FieldLabel({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <span className="mono" style={{ fontSize: "0.6rem", letterSpacing: "0.08em", color: "var(--text-3)", fontWeight: 600 }}>
        {label.toUpperCase()}
        {hint && <span style={{ opacity: 0.6, marginLeft: "0.4rem", textTransform: "none" }}>{hint}</span>}
      </span>
      {children}
    </label>
  );
}
