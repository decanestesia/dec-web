"use client";

// ============================================================
// ClinicalConsentGate — gate de consentimiento (una vez) delante de
// las herramientas de mayor riesgo (/tci, /codigo, /valoracion).
//
// Recomendado por la auditoría legal: antes de usar infusión/BIS,
// dosis de crisis o datos de paciente, el usuario reconoce que (a) es
// profesional de salud, (b) leyó y acepta el Aviso Médico, y (c)
// entiende que DEC es apoyo y la responsabilidad clínica es del médico.
//
// COMPORTAMIENTO
//  - Overlay client-side (position: fixed). NO bloquea el contenido a
//    SSR/bots/SEO: la página se renderiza completa; el gate se monta
//    después de hidratar y sólo si no hay aceptación previa.
//  - Persistencia en localStorage: `dec.consent.clinical` = ISO date.
//    Una sola aceptación cubre las 3 herramientas.
//  - Botón/enlace "re-ver aviso" siempre disponible (pill discreto,
//    esquina inferior) para volver a mostrar el texto tras aceptar.
//
// Estética DEC: terminal/dark/sharp, mono lowercase, variables CSS.
// Sin humor: es contenido legal.
// ============================================================

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "dec.consent.clinical";

export default function ClinicalConsentGate() {
  // `mounted` evita mismatch de hidratación: en SSR y primer paint no
  // renderizamos nada del gate; tras montar leemos localStorage.
  const [mounted, setMounted] = useState(false);
  // `accepted === null` = aún no sabemos (pre-hidratación).
  const [accepted, setAccepted] = useState<boolean | null>(null);
  // Forzar re-apertura desde el pill "re-ver aviso" aunque ya se aceptó.
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setAccepted(Boolean(localStorage.getItem(CONSENT_KEY)));
    } catch {
      // Si localStorage falla (modo privado estricto), mostramos el gate
      // igual: preferimos pedir consentimiento a saltárnoslo.
      setAccepted(false);
    }
  }, []);

  // Bloquea el scroll del body mientras el overlay está visible.
  const overlayVisible = mounted && (accepted === false || reopened);
  useEffect(() => {
    if (!overlayVisible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [overlayVisible]);

  function accept() {
    try {
      localStorage.setItem(CONSENT_KEY, new Date().toISOString());
    } catch {
      /* si no persiste, al menos cerramos en esta sesión */
    }
    setAccepted(true);
    setReopened(false);
  }

  // Pre-hidratación: no renderizamos nada (contenido intacto para SSR/SEO).
  if (!mounted) return null;

  // Ya aceptó y no ha re-abierto: sólo el pill "re-ver aviso".
  if (accepted && !reopened) {
    return (
      <button
        type="button"
        onClick={() => setReopened(true)}
        className="mono"
        title="Volver a ver el aviso de consentimiento clínico"
        style={{
          position: "fixed",
          right: "0.75rem",
          bottom: "0.75rem",
          zIndex: 60,
          background: "var(--bg-1)",
          border: "1px solid var(--border)",
          color: "var(--text-3)",
          fontSize: "0.55rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          padding: "0.35rem 0.55rem",
          cursor: "pointer",
          lineHeight: 1,
          borderRadius: 2,
        }}
      >
        aviso ⚕
      </button>
    );
  }

  // Overlay de consentimiento.
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dec-consent-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.25rem",
        overflowY: "auto",
      }}
    >
      <div
        className="panel"
        style={{
          maxWidth: 520,
          width: "100%",
          background: "var(--bg-1)",
          border: "1px solid var(--border-hi)",
          borderTop: "3px solid var(--amber)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          maxHeight: "calc(100vh - 2.5rem)",
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "1.4rem 1.4rem 1.5rem" }}>
          <div
            className="prompt mono"
            style={{ marginBottom: "0.75rem", color: "var(--text-3)" }}
          >
            <b style={{ color: "var(--amber)" }}>⚕</b> consentimiento · uso clínico
          </div>

          <h2
            id="dec-consent-title"
            style={{
              fontSize: "1.15rem",
              fontWeight: 700,
              color: "var(--text-0)",
              margin: "0 0 0.9rem",
              lineHeight: 1.25,
            }}
          >
            Antes de continuar
          </h2>

          <p
            style={{
              color: "var(--text-1)",
              fontSize: "0.82rem",
              lineHeight: 1.65,
              margin: "0 0 0.9rem",
            }}
          >
            Esta herramienta es de apoyo a la decisión clínica. Al continuar,
            declaras y reconoces que:
          </p>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            {[
              "Eres profesional de la salud cualificado y actúas dentro de tu competencia.",
              <>
                Leíste y aceptas el{" "}
                <Link
                  href="/legal/aviso-medico"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)", textDecoration: "underline" }}
                >
                  Aviso Médico
                </Link>
                .
              </>,
              "Entiendes que DEC es una ayuda de cálculo y referencia: no sustituye tu juicio clínico, la monitorización ni la lectura del prospecto. La decisión y la responsabilidad final del paciente son tuyas.",
            ].map((item, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: "0.55rem",
                  alignItems: "flex-start",
                  color: "var(--text-1)",
                  fontSize: "0.8rem",
                  lineHeight: 1.6,
                }}
              >
                <span
                  className="mono"
                  style={{
                    color: "var(--accent)",
                    fontSize: "0.7rem",
                    marginTop: "0.15rem",
                    flexShrink: 0,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={accept}
            className="btn-fill mono"
            style={{
              width: "100%",
              padding: "0.7rem 1rem",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              cursor: "pointer",
              border: "none",
            }}
          >
            Acepto y continúo
          </button>

          <p
            className="mono"
            style={{
              color: "var(--text-3)",
              fontSize: "0.55rem",
              lineHeight: 1.6,
              margin: "0.85rem 0 0",
              textAlign: "center",
            }}
          >
            {/* la aceptación se guarda en este dispositivo (localStorage) */}
            se guarda en este dispositivo · no volverá a aparecer
          </p>
        </div>
      </div>
    </div>
  );
}
