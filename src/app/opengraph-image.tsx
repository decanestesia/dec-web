// src/app/opengraph-image.tsx
//
// OG por defecto de decanestesia.com — generado con next/og (sin dependencias
// nuevas, sin imagen binaria que mantener). Sirve como preview de compartición
// para toda ruta que no defina su propio opengraph-image. Estética terminal/dark
// coherente con globals.css (--bg-0 #050608, --accent #10b981, --cyan #06b6d4).

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "DEC — Diluciones, Dosis & Cálculos Anestésicos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#050608",
          color: "#f0f2f5",
          padding: "80px",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", color: "#5a6472", fontSize: 30, marginBottom: 24 }}>
          $ dec --help
        </div>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ fontSize: 150, fontWeight: 800, letterSpacing: "-6px", color: "#f0f2f5" }}>
            DEC
          </span>
          <span style={{ fontSize: 150, fontWeight: 800, letterSpacing: "-6px", color: "#10b981", marginLeft: 24 }}>
            _
          </span>
        </div>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 300, color: "#c5cad4", marginTop: 8 }}>
          Diluciones, Dosis &amp; Cálculos Anestésicos
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#06b6d4", marginTop: 40 }}>
          fármacos · interacciones · calculadoras · guías · algoritmos
        </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 70,
            right: 80,
            fontSize: 26,
            color: "#5a6472",
          }}
        >
          decanestesia.com
        </div>
      </div>
    ),
    { ...size },
  );
}
