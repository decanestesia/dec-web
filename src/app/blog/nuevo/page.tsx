// src/app/blog/nuevo/page.tsx
//
// Editor de post NUEVO. Gateado server-side: sesión + profiles.can_publish.
// Si no cumple, muestra GateNotice (con link a login). La RLS de blog_posts
// es la autoridad final en la escritura; esto es defensa en profundidad + UX.

import type { Metadata } from "next";
import { getUser, canPublish } from "@/lib/auth";
import { BlogEditor } from "../BlogEditor";
import { GateNotice } from "../GateNotice";

export const metadata: Metadata = {
  title: "Nuevo post — DEC Blog",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NuevoPostPage() {
  const user = await getUser();
  if (!user) return <GateNotice loggedIn={false} />;

  const mayPublish = await canPublish();
  if (!mayPublish) return <GateNotice loggedIn={true} />;

  return <BlogEditor />;
}
