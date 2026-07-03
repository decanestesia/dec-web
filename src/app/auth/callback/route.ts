// src/app/auth/callback/route.ts
//
// Handler de redirect OAuth. Intercambia el code por una sesión.
// Llamado por Google/Apple después del consent.

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { safeNext } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Sanea `next` a ruta interna: evita open redirect (@evil.com, //evil.com, absolutas).
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Detectar si estamos detrás de un proxy (Vercel forwarded host)
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    // Si hubo error en exchange, redirigir a página de error
    return NextResponse.redirect(
      `${origin}/auth/error?error=oauth_exchange&error_description=${encodeURIComponent(
        error.message
      )}`
    );
  }

  // Sin code: probablemente OAuth canceló o algo falló antes
  return NextResponse.redirect(
    `${origin}/auth/error?error=missing_code&error_description=No+se+recibi%C3%B3+c%C3%B3digo+de+autorizaci%C3%B3n`
  );
}
