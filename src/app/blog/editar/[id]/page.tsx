// src/app/blog/editar/[id]/page.tsx
//
// Edición de un post de Supabase existente. Mismo gate que /blog/nuevo.
// Carga la fila por id (incluye borradores, que la RLS de lectura pública no
// mostraría — aquí leemos como el autor autenticado, que sí puede verla).

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUser, canPublish } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { BlogPostRow } from "@/lib/blog-data";
import { BlogEditor, type EditorInitial } from "../../BlogEditor";
import { GateNotice } from "../../GateNotice";

export const metadata: Metadata = {
  title: "Editar post — DEC Blog",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarPostPage({ params }: Props) {
  const { id } = await params;

  const user = await getUser();
  if (!user) return <GateNotice loggedIn={false} />;

  const mayPublish = await canPublish();
  if (!mayPublish) return <GateNotice loggedIn={true} />;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();
  const row = data as BlogPostRow;

  const initial: EditorInitial = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    bodyMd: row.body_md ?? "",
    tags: row.tags ?? [],
    coverImage: row.cover_image ?? "",
    published: row.published,
  };

  return <BlogEditor initial={initial} />;
}
