import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "DEC — Diluciones, Dosis & Cálculos Anestésicos",
    template: "%s | DEC Anestesia",
  },
  description:
    "Enciclopedia clínica de fármacos anestésicos, vasoactivos y de cuidados críticos. 490+ fármacos con farmacología, dosis, calculadoras de infusión, advertencias FDA, embarazo y marcas comerciales.",
  keywords: [
    "anestesiología",
    "fármacos",
    "dosis",
    "diluciones",
    "cuidados críticos",
    "UCI",
    "infusión",
    "vasopresores",
    "opioides",
    "calculadora",
    "ROTEM",
    "TEG",
    "farmacología clínica",
    "interacciones",
    "embarazo categoría FDA",
  ],
  authors: [{ name: "Dr. Jophiel Espaillat C." }],
  creator: "Dr. Jophiel Espaillat C.",
  metadataBase: new URL("https://decanestesia.com"),
  openGraph: {
    title: "DEC — Diluciones, Dosis & Cálculos Anestésicos",
    description:
      "Enciclopedia clínica de 490+ fármacos anestésicos y de cuidados críticos: farmacología, dosis, calculadoras de infusión y análisis clínico.",
    type: "website",
    locale: "es_LA",
    siteName: "DEC Anestesia",
    url: "https://decanestesia.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "DEC Anestesia",
    description:
      "490+ fármacos anestésicos con calculadoras de infusión y datos clínicos.",
  },
  manifest: "/manifest.json",
  robots: { index: true, follow: true },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
