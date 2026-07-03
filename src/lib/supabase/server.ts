// src/lib/supabase/server.ts
//
// Cliente Supabase para usar en Server Components, Route Handlers y
// Server Actions. Maneja cookies de sesión via Next.js cookies().

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://smaazlgvonzcajjvbefk.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      "sb_publishable_eNHOromowckcjzkLk-204A_fIr5tFcF",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Llamado desde un Server Component sin posibilidad de setear cookies.
            // Esto es esperado y se ignora — el middleware refresca la sesión.
          }
        },
      },
    }
  );
}
