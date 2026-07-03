// src/app/legal/layout.tsx
//
// Layout para todas las páginas /legal/*.
// Importa el CSS legal directamente aquí — más confiable que @import en globals.css.

import "@/styles/legal.css"; // ← KEY: import directo en lugar de @import

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

export default function LegalLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
