// middleware.ts (root del proyecto)
//
// Refresca la sesión de Supabase en cada request.
// Excluye assets estáticos y archivos .well-known.

import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización imágenes)
     * - favicon.ico
     * - .well-known (Apple domain verification, robots, etc.)
     * - imágenes (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
