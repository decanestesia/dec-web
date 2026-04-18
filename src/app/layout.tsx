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
  title: { default: "DEC — Diluciones, Dosis & Cálculos Anestésicos", template: "%s | DEC Anestesia" },
  description: "Referencia clínica de fármacos anestésicos, vasoactivos y de cuidados críticos. Dosis, diluciones, presentaciones, rangos terapéuticos y calculadoras de infusión.",
  keywords: ["anestesiología","fármacos","dosis","diluciones","cuidados críticos","UCI","infusión","vasopresores","opioides","calculadora","ROTEM","TEG"],
  authors: [{ name: "Dr. Jophiel Espaillat C." }],
  creator: "Dr. Jophiel Espaillat C.",
  metadataBase: new URL("https://decanestesia.com"),
  openGraph: {
    title: "DEC — Diluciones, Dosis & Cálculos Anestésicos",
    description: "Referencia clínica de fármacos anestésicos y de cuidados críticos. 128+ fármacos, calculadoras de infusión y análisis clínico.",
    type: "website",
    locale: "es_LA",
    siteName: "DEC Anestesia",
    url: "https://decanestesia.com",
  },
  twitter: { card: "summary_large_image", title: "DEC Anestesia", description: "128+ fármacos anestésicos con calculadoras de infusión" },
  manifest: "/manifest.json",
  robots: { index: true, follow: true },
  other: { "apple-mobile-web-app-capable": "yes", "apple-mobile-web-app-status-bar-style": "black-translucent" },
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
