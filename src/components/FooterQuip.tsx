"use client";

// Línea de humor negro rotativa del footer. Gallows humour de quirófano,
// siempre reforzando que la decisión y la firma son del médico (nunca
// insinuando que la app dosifica por él). Random en cliente para evitar
// mismatch de hidratación.

import { useEffect, useState } from "react";

const QUIPS = [
  "herramienta de apoyo · no sustituye el juicio profesional · si algo sale mal, la culpa no es del app",
  "la app hace las cuentas; tú firmas la hoja · verifica antes de empujar el émbolo",
  "entre “más o menos 2 cc” y una mañana muy larga hay una calculadora",
  "la norepinefrina no es un Pokémon · dilúyela con respeto",
  "verifica la dosis dos veces · el paciente solo tiene un intento",
  "dosis precisas, decisiones tuyas · nosotros solo movemos los decimales",
  "si dudas de la dilución, no la cuelgues · pregunta al staff que ya pasó por esto 10,000 veces",
  "el prospecto lo redactó un abogado · la dosis la decides tú",
  "calcular no es adivinar · y el forense no acepta “creí que eran mcg”",
];

export function FooterQuip() {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(Math.floor(Math.random() * QUIPS.length));
  }, []);
  return (
    <p
      className="mono"
      style={{
        fontSize: "0.56rem",
        color: "var(--text-3)",
        opacity: 0.6,
        letterSpacing: "0.06em",
      }}
    >
      // {QUIPS[i]}
    </p>
  );
}
