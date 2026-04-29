"use client";

import { useEffect, useRef, useState } from "react";
import {
  type MolecularData,
  parseFormulaToTokens,
  interpretLogP,
  pubchemUrl,
} from "@/lib/drugs";

interface Props {
  drugName: string;
  molecular: MolecularData;
}

// SmilesDrawer typing — only the parts we touch
declare global {
  interface Window {
    SmilesDrawer?: {
      SvgDrawer: new (options: object) => {
        draw: (
          tree: object,
          target: SVGElement | string,
          theme?: string
        ) => void;
      };
      Drawer: new (options: object) => unknown;
      parse: (
        smiles: string,
        successCallback: (tree: object) => void,
        errorCallback?: (err: unknown) => void
      ) => void;
    };
  }
}

const SMILES_DRAWER_CDN =
  "https://unpkg.com/smiles-drawer@2.1.7/dist/smiles-drawer.min.js";

// Module-level cache to avoid re-injecting the script per drug page navigation
let scriptPromise: Promise<void> | null = null;

function loadSmilesDrawer(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.SmilesDrawer) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-smiles-drawer]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("script load error"))
      );
      return;
    }
    const s = document.createElement("script");
    s.src = SMILES_DRAWER_CDN;
    s.async = true;
    s.dataset.smilesDrawer = "true";
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("CDN load failed"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export function MolecularSection({ drugName, molecular }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drawState, setDrawState] = useState<"loading" | "ok" | "error">(
    "loading"
  );

  useEffect(() => {
    if (!molecular.smiles || !svgRef.current) return;

    let cancelled = false;
    const target = svgRef.current;

    // Pick theme from data-theme attribute, fallback to media query
    const htmlTheme = document.documentElement.getAttribute("data-theme");
    const isDark =
      htmlTheme === "dark" ||
      (htmlTheme !== "light" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    const theme = isDark ? "dark" : "light";

    loadSmilesDrawer()
      .then(() => {
        if (cancelled || !window.SmilesDrawer) return;
        try {
          // Clear previous content
          while (target.firstChild) target.removeChild(target.firstChild);
          // Use SvgDrawer (not Drawer — that's for canvas)
          const drawer = new window.SmilesDrawer.SvgDrawer({
            width: 320,
            height: 200,
            bondThickness: 1.0,
            bondLength: 18,
            shortBondLength: 0.85,
            bondSpacing: 4,
            atomVisualization: "default",
            isomeric: true,
            terminalCarbons: false,
            fontSizeLarge: 11,
            fontSizeSmall: 4,
            padding: 6,
            explicitHydrogens: false,
          });
          window.SmilesDrawer.parse(
            molecular.smiles!,
            (tree: object) => {
              if (cancelled) return;
              try {
                drawer.draw(tree, target, theme);
                setDrawState("ok");
              } catch (e) {
                console.error("[MolecularSection] draw error:", e);
                setDrawState("error");
              }
            },
            (err: unknown) => {
              console.error("[MolecularSection] parse error:", err);
              setDrawState("error");
            }
          );
        } catch (e) {
          console.error("[MolecularSection] init error:", e);
          setDrawState("error");
        }
      })
      .catch((e) => {
        console.error("[MolecularSection] script load error:", e);
        setDrawState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [molecular.smiles]);

  const formulaTokens = molecular.formula
    ? parseFormulaToTokens(molecular.formula)
    : null;
  const logpInterp =
    molecular.logp !== null ? interpretLogP(molecular.logp) : null;

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="dot" /> DATOS MOLECULARES
      </div>
      <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
        {/* Top row: 2D drawing + facts */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              molecular.smiles ? "auto 1fr" : "1fr",
            gap: "1rem",
            alignItems: "start",
          }}
        >
          {/* SVG drawing */}
          {molecular.smiles && (
            <div
              style={{
                background: "#fff",
                border: "1px solid var(--border)",
                padding: "0.4rem",
                width: 200,
                minHeight: 140,
                position: "relative",
                flexShrink: 0,
                borderRadius: 2,
              }}
              aria-label={`Estructura química 2D de ${drugName}`}
            >
              <svg
                ref={svgRef}
                viewBox="0 0 320 200"
                preserveAspectRatio="xMidYMid meet"
                width="100%"
                height="130"
                style={{ display: "block" }}
              />
              {drawState === "loading" && (
                <div
                  className="mono"
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#888",
                    fontSize: "0.55rem",
                    pointerEvents: "none",
                  }}
                >
                  rendering...
                </div>
              )}
              {drawState === "error" && (
                <div
                  className="mono"
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#888",
                    fontSize: "0.55rem",
                    pointerEvents: "none",
                  }}
                >
                  // sin render 2D
                </div>
              )}
            </div>
          )}

          {/* Key facts */}
          <div style={{ display: "grid", gap: "0.4rem", minWidth: 0 }}>
            {formulaTokens && (
              <KV label="Fórmula">
                <span
                  style={{
                    color: "var(--text-0)",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    fontFamily: "var(--font-mono, ui-monospace, monospace)",
                  }}
                >
                  {formulaTokens.map((t, i) =>
                    t.sub ? (
                      <sub
                        key={i}
                        style={{ fontSize: "0.7em", verticalAlign: "baseline" }}
                      >
                        {t.text}
                      </sub>
                    ) : (
                      <span key={i}>{t.text}</span>
                    )
                  )}
                </span>
              </KV>
            )}

            {molecular.molecular_weight !== null && (
              <KV label="Peso molecular">
                <span
                  className="mono"
                  style={{ color: "var(--text-0)", fontSize: "0.78rem" }}
                >
                  {molecular.molecular_weight.toFixed(2)} g/mol
                </span>
              </KV>
            )}

            {molecular.logp !== null && logpInterp && (
              <KV label="LogP">
                <div style={{ minWidth: 0 }}>
                  <span
                    className="mono"
                    style={{
                      color: "var(--text-0)",
                      fontSize: "0.78rem",
                      marginRight: "0.5rem",
                    }}
                  >
                    {molecular.logp.toFixed(2)}
                  </span>
                  <span
                    className="tag tag-accent"
                    style={{ fontSize: "0.55rem" }}
                  >
                    {logpInterp.label}
                  </span>
                  <div
                    className="mono"
                    style={{
                      color: "var(--text-3)",
                      fontSize: "0.6rem",
                      marginTop: "0.2rem",
                      lineHeight: 1.4,
                    }}
                  >
                    {logpInterp.description}
                  </div>
                </div>
              </KV>
            )}

            {molecular.pka !== null && (
              <KV label="pKa">
                <span
                  className="mono"
                  style={{ color: "var(--text-0)", fontSize: "0.78rem" }}
                >
                  {molecular.pka.toFixed(2)}
                  {molecular.pka_type && (
                    <span
                      style={{
                        color: "var(--text-3)",
                        marginLeft: "0.4rem",
                        fontSize: "0.7rem",
                      }}
                    >
                      ({molecular.pka_type})
                    </span>
                  )}
                </span>
              </KV>
            )}

            {molecular.protein_binding && (
              <KV label="Unión a proteínas">
                <span
                  className="mono"
                  style={{ color: "var(--text-0)", fontSize: "0.78rem" }}
                >
                  {molecular.protein_binding}
                </span>
              </KV>
            )}
          </div>
        </div>

        {/* Solubility */}
        {molecular.solubility && (
          <div
            style={{
              padding: "0.5rem 0.6rem",
              borderLeft: "2px solid var(--cyan, var(--accent))",
              background: "var(--bg-1)",
            }}
          >
            <div
              className="mono"
              style={{
                color: "var(--text-3)",
                fontSize: "0.55rem",
                letterSpacing: "0.08em",
                marginBottom: "0.2rem",
              }}
            >
              SOLUBILIDAD
            </div>
            <div
              style={{
                color: "var(--text-1)",
                fontSize: "0.78rem",
                lineHeight: 1.5,
              }}
            >
              {molecular.solubility}
            </div>
          </div>
        )}

        {/* Identifiers */}
        {(molecular.smiles || molecular.inchi_key) && (
          <details
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "0.5rem",
            }}
          >
            <summary
              className="mono"
              style={{
                cursor: "pointer",
                color: "var(--text-3)",
                fontSize: "0.6rem",
                letterSpacing: "0.08em",
                userSelect: "none",
              }}
            >
              IDENTIFICADORES QUÍMICOS
            </summary>
            <div
              style={{
                display: "grid",
                gap: "0.4rem",
                marginTop: "0.5rem",
                fontSize: "0.65rem",
              }}
            >
              {molecular.smiles && (
                <Identifier label="SMILES" value={molecular.smiles} />
              )}
              {molecular.inchi_key && (
                <Identifier label="InChI Key" value={molecular.inchi_key} />
              )}
              {molecular.inchi && (
                <Identifier label="InChI" value={molecular.inchi} />
              )}
            </div>
          </details>
        )}

        {/* PubChem link */}
        {molecular.inchi_key && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <a
              href={pubchemUrl(molecular.inchi_key)}
              target="_blank"
              rel="noopener noreferrer"
              className="mono"
              style={{
                fontSize: "0.6rem",
                color: "var(--accent)",
                textDecoration: "none",
                padding: "0.25rem 0.5rem",
                border: "1px solid var(--accent)",
                letterSpacing: "0.05em",
              }}
            >
              ver en pubchem ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function KV({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: "0.5rem",
        alignItems: "baseline",
      }}
    >
      <span
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.55rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          minWidth: 90,
        }}
      >
        {label}
      </span>
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}

function Identifier({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.55rem",
          letterSpacing: "0.08em",
          marginBottom: "0.15rem",
        }}
      >
        {label}
      </div>
      <code
        className="mono"
        style={{
          display: "block",
          color: "var(--text-1)",
          background: "var(--bg-1)",
          padding: "0.3rem 0.5rem",
          fontSize: "0.62rem",
          wordBreak: "break-all",
          border: "1px solid var(--border)",
        }}
      >
        {value}
      </code>
    </div>
  );
}
