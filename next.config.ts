import type { NextConfig } from "next";

// ── Cabeceras de seguridad ───────────────────────────────────────────────────
// Se aplican a TODAS las rutas. Las "duras" van en enforce (no rompen nada).
// La CSP va en Report-Only: registra violaciones sin bloquear, para poder
// afinarla contra OAuth (Google/Apple), Supabase y los inline-styles/styled-jsx
// antes de promoverla a enforce. El clickjacking ya está cubierto por
// X-Frame-Options: DENY, así que Report-Only aquí no deja hueco real.
//
// // el candado no sirve si dejas la llave puesta
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://*.supabase.com wss://*.supabase.co https://accounts.google.com https://appleid.apple.com",
  "frame-src 'self' https://accounts.google.com https://appleid.apple.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://accounts.google.com https://appleid.apple.com",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
];

const nextConfig: NextConfig = {
  // Enable static export for hosting anywhere
  // output: "export",  // Uncomment this when deploying to static hosting
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
