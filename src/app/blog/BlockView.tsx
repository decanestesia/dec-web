// src/app/blog/BlockView.tsx
//
// Render de los bloques tipados de los posts LEGACY (src/lib/blog.ts).
// Extraído de [slug]/page.tsx para poder compartirlo. Los posts de Supabase
// usan markdown (renderMarkdown); estos usan bloques — ambos coexisten.

import type { Block } from "@/lib/blog";

const CALLOUT: Record<string, { border: string; icon: string }> = {
  info: { border: "var(--cyan)", icon: "ℹ" },
  warn: { border: "var(--amber)", icon: "⚠" },
  danger: { border: "var(--red)", icon: "⛔" },
};

export function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return (
        <p style={{ color: "var(--text-1)", fontSize: "0.9rem", lineHeight: 1.75, margin: "0 0 1rem" }}>
          {block.text}
        </p>
      );
    case "h2":
      return (
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-0)", margin: "2rem 0 0.75rem" }}>
          {block.text}
        </h2>
      );
    case "ul":
      return (
        <ul style={{ margin: "0 0 1rem", paddingLeft: "1.1rem", color: "var(--text-1)", fontSize: "0.88rem", lineHeight: 1.7 }}>
          {block.items.map((it, i) => (
            <li key={i} style={{ marginBottom: "0.4rem" }}>{it}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol style={{ margin: "0 0 1rem", paddingLeft: "1.3rem", color: "var(--text-1)", fontSize: "0.88rem", lineHeight: 1.7 }}>
          {block.items.map((it, i) => (
            <li key={i} style={{ marginBottom: "0.4rem" }}>{it}</li>
          ))}
        </ol>
      );
    case "callout": {
      const c = CALLOUT[block.variant];
      return (
        <div className="panel" style={{ borderLeft: `3px solid ${c.border}`, margin: "1.25rem 0" }}>
          <div className="panel-body" style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
            <span style={{ color: c.border, fontSize: "0.9rem" }}>{c.icon}</span>
            <p style={{ color: "var(--text-1)", fontSize: "0.82rem", lineHeight: 1.65, margin: 0 }}>{block.text}</p>
          </div>
        </div>
      );
    }
    case "code":
      return (
        <pre
          className="mono"
          style={{
            background: "var(--bg-2)", border: "1px solid var(--border)", padding: "0.85rem 1rem",
            fontSize: "0.72rem", color: "var(--accent)", overflowX: "auto", margin: "0 0 1rem",
          }}
        >
          {block.text}
        </pre>
      );
    case "quote":
      return (
        <blockquote
          className="mono"
          style={{
            borderLeft: "3px solid var(--accent)", paddingLeft: "1rem", margin: "1.25rem 0",
            color: "var(--text-2)", fontSize: "0.85rem", fontStyle: "italic",
          }}
        >
          {block.text}
        </blockquote>
      );
    case "image":
      return (
        <figure style={{ margin: "1.5rem 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            style={{
              display: "block", width: "100%", maxWidth: 420, margin: "0 auto",
              border: "1px solid var(--border)", background: "var(--bg-2)",
            }}
          />
          {block.caption && (
            <figcaption
              className="mono"
              style={{ color: "var(--text-3)", fontSize: "0.66rem", lineHeight: 1.55, textAlign: "center", marginTop: "0.6rem", opacity: 0.85 }}
            >
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "table":
      return (
        <div style={{ overflowX: "auto", margin: "0 0 1.25rem", border: "1px solid var(--border)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 440 }}>
            <thead>
              <tr style={{ background: "var(--bg-2)" }}>
                {block.headers.map((h, i) => (
                  <th key={i} className="mono" style={{ textAlign: "left", padding: "0.5rem 0.7rem", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-2)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} style={{ borderTop: "1px solid var(--border)" }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: "0.5rem 0.7rem", fontSize: "0.76rem", color: ci === 0 ? "var(--text-0)" : "var(--text-1)", fontWeight: ci === 0 ? 600 : 400 }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}
