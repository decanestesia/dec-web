import type { Metadata, Viewport } from "next";
import "./globals.css";
import { UserMenu } from "@/components/UserMenu";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CommandPalette } from "@/components/CommandPalette";
import { PatientProvider } from "@/lib/patient/PatientContext";
import { PatientBar } from "@/components/PatientBar";

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
    "Enciclopedia clínica de fármacos anestésicos, vasoactivos y de cuidados críticos. 893 fármacos con farmacología, dosis, calculadoras de infusión, advertencias FDA, embarazo y marcas comerciales.",
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
      "Enciclopedia clínica de 893 fármacos anestésicos y de cuidados críticos: farmacología, dosis, calculadoras de infusión y análisis clínico.",
    type: "website",
    locale: "es_LA",
    siteName: "DEC Anestesia",
    url: "https://decanestesia.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "DEC Anestesia",
    description:
      "893 fármacos anestésicos con calculadoras de infusión y datos clínicos.",
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
          {/* Navbar recibe UserMenu como userSlot — UserMenu es server
              component (lee la sesión), Navbar es client component (theme toggle).
              Next.js permite pasar server components como props a client components. */}
          <PatientProvider>
            <Navbar userSlot={<UserMenu />} />
            <PatientBar />
            <main className="flex-1">{children}</main>
          </PatientProvider>
          <Footer />
          <CommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}
