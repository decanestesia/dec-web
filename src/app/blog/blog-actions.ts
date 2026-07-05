// src/app/blog/blog-actions.ts
//
// Server Actions del editor de blog. La RLS de blog_posts es la autoridad
// final (INSERT/UPDATE solo si profiles.can_publish = true); aquí re-chequeamos
// can_publish para dar un error legible en lugar de un fallo opaco de RLS.

"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser, canPublish } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { revalidatePath } from "next/cache";

export type SaveResult =
  | { ok: true; slug: string; id: string }
  | { ok: false; error: string };

export interface BlogDraft {
  id?: string; // presente = edición (upsert por id); ausente = alta
  slug: string;
  title: string;
  excerpt: string;
  bodyMd: string;
  tags: string[];
  coverImage: string;
  published: boolean;
}

export async function saveBlogPost(draft: BlogDraft): Promise<SaveResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Sesión no encontrada. Inicia sesión de nuevo." };

  const mayPublish = await canPublish();
  if (!mayPublish) {
    return { ok: false, error: "No tienes permiso para publicar (profiles.can_publish)." };
  }

  const title = draft.title.trim();
  const slug = slugify(draft.slug || draft.title);
  if (!title) return { ok: false, error: "El título es requerido." };
  if (!slug) return { ok: false, error: "El slug es requerido." };
  if (!draft.bodyMd.trim()) return { ok: false, error: "El cuerpo no puede estar vacío." };

  const supabase = await createClient();

  // author por defecto: display_name del perfil, si existe.
  const { data: prof } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();
  const author =
    (prof as { display_name: string | null } | null)?.display_name?.trim() ||
    "Dr. Jophiel Espaillat";

  const now = new Date().toISOString();

  // published_at: se fija al publicar; se preserva/limpia según el estado.
  // Para alta publicada → now. Para edición, si ya tenía fecha la conservamos
  // consultándola; si pasa a borrador, la dejamos null.
  let publishedAt: string | null = null;
  if (draft.published) {
    if (draft.id) {
      const { data: existing } = await supabase
        .from("blog_posts")
        .select("published_at")
        .eq("id", draft.id)
        .single();
      publishedAt =
        (existing as { published_at: string | null } | null)?.published_at ?? now;
    } else {
      publishedAt = now;
    }
  }

  const record = {
    ...(draft.id ? { id: draft.id } : {}),
    slug,
    title,
    excerpt: draft.excerpt.trim() || null,
    body_md: draft.bodyMd,
    tags: draft.tags.length ? draft.tags : null,
    author,
    author_id: user.id,
    cover_image: draft.coverImage.trim() || null,
    published: draft.published,
    published_at: publishedAt,
    updated_at: now,
  };

  // upsert por id en edición; insert en alta. onConflict slug evita choques
  // de slug duplicado devolviendo error legible.
  const query = draft.id
    ? supabase.from("blog_posts").update(record).eq("id", draft.id).select("id, slug").single()
    : supabase.from("blog_posts").insert(record).select("id, slug").single();

  const { data, error } = await query;

  if (error) {
    // Errores comunes: slug duplicado (unique), RLS (permiso).
    if (error.code === "23505") {
      return { ok: false, error: `El slug "${slug}" ya existe. Usa otro.` };
    }
    if (error.code === "42501" || /row-level security/i.test(error.message)) {
      return { ok: false, error: "Permiso denegado por RLS. ¿Tu cuenta tiene can_publish?" };
    }
    return { ok: false, error: error.message };
  }

  const saved = data as { id: string; slug: string };
  // Revalida lista y ficha para que el cambio se vea sin recargar duro.
  revalidatePath("/blog");
  revalidatePath(`/blog/${saved.slug}`);

  return { ok: true, slug: saved.slug, id: saved.id };
}
