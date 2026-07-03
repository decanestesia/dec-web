// src/lib/supabase/client.ts
//
// Cliente Supabase para usar en Client Components ("use client").
// Lee el publishable key de las env vars públicas.

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
