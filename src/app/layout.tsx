import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "DEC — Diluciones, Dosis & Cálculos Anestésicos",
    template: "%s | DEC Anestesia",
  },
  description:
    "Referencia clínica de fármacos anestésicos, vasoactivos y de cuidados críticos. Dosis, diluciones, presentaciones y rangos terapéuticos.",
  keywords: [
    "anestesiología", "fármacos", "dosis", "diluciones", "cuidados críticos",
    "UCI", "infusión", "vasopresores", "opioides", "relajantes musculares",
  ],
  authors: [{ name: "Dr. Jophiel Espaillat C." }],
  openGraph: {
    title: "DEC — Diluciones, Dosis & Cálculos Anestésicos",
    description: "Referencia clínica de fármacos anestésicos y de cuidados críticos.",
    type: "website",
    locale: "es_LA",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
