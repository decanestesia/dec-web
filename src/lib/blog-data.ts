// src/lib/blog-data.ts
//
// Lectura HÍBRIDA del blog: mezcla los posts de Supabase (published) con los
// POSTS legacy del array tipado. Server-only (usa el cliente Supabase SSR).
//
// Contrato de merge:
//   1. Trae de Supabase solo published=true (RLS lo garantiza de todas formas).
//   2. Trae los POSTS legacy (bloques, siempre "publicados").
//   3. Dedup por slug → SUPABASE GANA si un slug colisiona (permite migrar un
//      post legacy a la DB sin duplicarlo ni perder el original hasta entonces).
//   4. Ordena por fecha descendente.
//
// Cada post se normaliza a `BlogEntry`, una unión discriminada por `source`:
//   - source: "supabase" → cuerpo en markdown (body_md), se renderiza con renderMarkdown.
//   - source: "legacy"   → cuerpo en bloques (Block[]), se renderiza con BlockView.
// Así la ficha decide el renderer sin perder ninguno de los dos formatos.

import { createClient } from "@/lib/supabase/server";
import { POSTS, type Block, type Post } from "@/lib/blog";

/* ─── Fila cruda de la tabla public.blog_posts ────────────────────── */
export interface BlogPostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_md: string | null;
  tags: string[] | null;
  author: string | null;
  author_id: string | null;
  cover_image: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/* ─── Modelo unificado que consume la UI ──────────────────────────── */
interface BlogEntryBase {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO — para orden y display
  tags: string[];
  author: string;
  readTime: string;
  coverImage?: string | null;
}

export type BlogEntry =
  | (BlogEntryBase & { source: "supabase"; id: string; bodyMd: string })
  | (BlogEntryBase & { source: "legacy"; body: Block[] });

/* ─── Utilidades ──────────────────────────────────────────────────── */

// Estimación de tiempo de lectura ~200 palabras/min a partir del markdown.
function estimateReadTime(md: string): string {
  const words = (md || "").trim().split(/\s+/).filter(Boolean).length;
  const min = Math.max(1, Math.round(words / 200));
  return `${min} min`;
}

function legacyToEntry(p: Post): BlogEntry {
  return {
    source: "legacy",
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    date: p.date,
    tags: p.tags,
    author: p.author,
    readTime: p.readTime,
    body: p.body,
  };
}

function rowToEntry(r: BlogPostRow): BlogEntry {
  const md = r.body_md ?? "";
  // Fecha para orden/display: published_at si existe, si no created_at.
  const date = (r.published_at ?? r.created_at ?? "").slice(0, 10);
  return {
    source: "supabase",
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? "",
    date,
    tags: r.tags ?? [],
    author: r.author ?? "Dr. Jophiel Espaillat",
    readTime: estimateReadTime(md),
    coverImage: r.cover_image,
    bodyMd: md,
  };
}

/* ─── Fetch de Supabase (published) — tolerante a fallos ──────────── */
async function fetchSupabasePosts(): Promise<BlogPostRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (error || !data) return [];
    return data as BlogPostRow[];
  } catch {
    // Si Supabase está caído/pausado, el blog sigue vivo con los legacy.
    // // el blog no se cae porque la base tomó una siesta
    return [];
  }
}

/* ─── API pública ─────────────────────────────────────────────────── */

/** Lista combinada (Supabase published + legacy), dedup por slug, orden desc. */
export async function getAllEntries(): Promise<BlogEntry[]> {
  const rows = await fetchSupabasePosts();
  const supEntries = rows.map(rowToEntry);
  const supSlugs = new Set(supEntries.map((e) => e.slug));

  // Legacy que NO colisiona con un slug de Supabase (Supabase gana).
  const legacyEntries = POSTS.filter((p) => !supSlugs.has(p.slug)).map(legacyToEntry);

  return [...supEntries, ...legacyEntries].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

/** Un post por slug, resolviendo la misma precedencia (Supabase gana). */
export async function getEntryBySlug(slug: string): Promise<BlogEntry | null> {
  const rows = await fetchSupabasePosts();
  const row = rows.find((r) => r.slug === slug);
  if (row) return rowToEntry(row);

  const legacy = POSTS.find((p) => p.slug === slug);
  return legacy ? legacyToEntry(legacy) : null;
}

/** Slugs para generateStaticParams (solo legacy — los de Supabase son dinámicos). */
export function legacySlugs(): string[] {
  return POSTS.map((p) => p.slug);
}
