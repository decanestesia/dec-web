// src/lib/supabase/middleware.ts
//
// Helper que refresca la sesión Supabase en cada request.
// Se llama desde middleware.ts en el root del proyecto.

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // El middleware corre en CADA request: si algo falla (env ausente, Supabase
  // caído), NUNCA debe tumbar el sitio → try/catch que degrada a next().
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://smaazlgvonzcajjvbefk.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        "sb_publishable_eNHOromowckcjzkLk-204A_fIr5tFcF",
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(
            cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>
          ) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // IMPORTANTE: NO llamar getUser() condicionalmente. SIEMPRE llamarlo.
    // Esto refresca el token JWT si está cerca de caducar.
    await supabase.auth.getUser();
  } catch {
    // Falla de sesión no debe romper la request; se sirve sin refrescar el token.
    return NextResponse.next({ request });
  }

  return supabaseResponse;
}
