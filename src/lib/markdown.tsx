// src/lib/markdown.tsx
//
// Renderer de markdown ligero y self-contained para el blog de DEC.
// Sin dependencias: parsea el subconjunto de markdown que usa el editor
// (encabezados, negrita/itálica/inline-code, listas ol/ul, enlaces, imágenes,
// blockquote, bloques de código, párrafos) y devuelve elementos React con la
// estética terminal/dark de DEC — consistente con el render de bloques legacy.
//
// Se usa igual en el servidor (ficha del post, SSR) y en el cliente (vista
// previa en vivo del editor) → es una función pura sin imports server-only.
//
// Nota: no es CommonMark completo. Es deliberadamente pequeño y predecible;
// para contenido clínico eso es una virtud, no una carencia. // el markdown
// que no entiendo es markdown que no puedo romper

import React, { type ReactNode } from "react";

/* ─── Estilos compartidos con el render de bloques legacy ─────────── */
const COLOR = {
  text0: "var(--text-0)",
  text1: "var(--text-1)",
  text2: "var(--text-2)",
  text3: "var(--text-3)",
  accent: "var(--accent)",
  border: "var(--border)",
  bg2: "var(--bg-2)",
};

/* ══════════════════════════════════════════════════════════════════
   INLINE: negrita, itálica, code, enlaces, imágenes inline.
   Se procesa por tokens para no romper la anidación básica.
   ══════════════════════════════════════════════════════════════════ */

// Escaneo lineal: en cada posición busca el marcador más cercano.
// Orden de precedencia: code (`) gana sobre todo (no se formatea dentro).
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let i = 0;
  let k = 0;
  let buf = "";

  const flush = () => {
    if (buf) {
      out.push(buf);
      buf = "";
    }
  };

  while (i < text.length) {
    const rest = text.slice(i);

    // Inline code: `...`
    const code = /^`([^`]+)`/.exec(rest);
    if (code) {
      flush();
      out.push(
        <code
          key={`${keyPrefix}-c${k++}`}
          className="mono"
          style={{
            background: COLOR.bg2,
            border: `1px solid ${COLOR.border}`,
            padding: "0.05rem 0.3rem",
            fontSize: "0.82em",
            color: COLOR.accent,
          }}
        >
          {code[1]}
        </code>
      );
      i += code[0].length;
      continue;
    }

    // Imagen inline: ![alt](src)
    const img = /^!\[([^\]]*)\]\(([^)\s]+)\)/.exec(rest);
    if (img) {
      flush();
      out.push(
        <img
          key={`${keyPrefix}-img${k++}`}
          src={img[2]}
          alt={img[1]}
          loading="lazy"
          style={{
            display: "inline-block",
            maxWidth: "100%",
            verticalAlign: "middle",
            border: `1px solid ${COLOR.border}`,
          }}
        />
      );
      i += img[0].length;
      continue;
    }

    // Enlace: [texto](href)
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)/.exec(rest);
    if (link) {
      flush();
      const href = link[2];
      const external = /^https?:\/\//.test(href);
      out.push(
        <a
          key={`${keyPrefix}-a${k++}`}
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          style={{ color: COLOR.accent, textDecoration: "underline" }}
        >
          {renderInline(link[1], `${keyPrefix}-a${k}`)}
        </a>
      );
      i += link[0].length;
      continue;
    }

    // Negrita: **...** o __...__
    const bold = /^(\*\*|__)(.+?)\1/.exec(rest);
    if (bold) {
      flush();
      out.push(
        <strong key={`${keyPrefix}-b${k++}`} style={{ color: COLOR.text0, fontWeight: 700 }}>
          {renderInline(bold[2], `${keyPrefix}-b${k}`)}
        </strong>
      );
      i += bold[0].length;
      continue;
    }

    // Itálica: *...* o _..._  (un solo marcador, no seguido de otro igual)
    const ital = /^(\*|_)([^*_]+?)\1/.exec(rest);
    if (ital) {
      flush();
      out.push(
        <em key={`${keyPrefix}-i${k++}`} style={{ fontStyle: "italic" }}>
          {renderInline(ital[2], `${keyPrefix}-i${k}`)}
        </em>
      );
      i += ital[0].length;
      continue;
    }

    // Carácter normal
    buf += text[i];
    i += 1;
  }

  flush();
  return out;
}

/* ══════════════════════════════════════════════════════════════════
   BLOQUES: se agrupan líneas y se emiten como elementos de bloque.
   ══════════════════════════════════════════════════════════════════ */

export function renderMarkdown(md: string): ReactNode {
  const src = (md ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = src.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Línea en blanco → separador, se ignora
    if (line.trim() === "") {
      i += 1;
      continue;
    }

    // Bloque de código cercado: ```lang ... ```
    const fence = /^```/.test(line);
    if (fence) {
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i])) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1; // salta el cierre ```
      blocks.push(
        <pre
          key={`blk${key++}`}
          className="mono"
          style={{
            background: COLOR.bg2,
            border: `1px solid ${COLOR.border}`,
            padding: "0.85rem 1rem",
            fontSize: "0.72rem",
            color: COLOR.accent,
            overflowX: "auto",
            margin: "0 0 1rem",
          }}
        >
          {codeLines.join("\n")}
        </pre>
      );
      continue;
    }

    // Encabezados: # .. ###### (mapeados a la escala del blog)
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const content = renderInline(heading[2].trim(), `h${key}`);
      const style: React.CSSProperties =
        level <= 1
          ? { fontSize: "1.45rem", fontWeight: 800, color: COLOR.text0, margin: "2rem 0 0.85rem", lineHeight: 1.25 }
          : level === 2
            ? { fontSize: "1.15rem", fontWeight: 700, color: COLOR.text0, margin: "2rem 0 0.75rem" }
            : { fontSize: "0.98rem", fontWeight: 700, color: COLOR.text0, margin: "1.5rem 0 0.6rem" };
      const Tag = (`h${Math.min(level + 1, 6)}` as unknown) as keyof React.JSX.IntrinsicElements;
      blocks.push(
        <Tag key={`blk${key++}`} style={style}>
          {content}
        </Tag>
      );
      i += 1;
      continue;
    }

    // Blockquote: líneas consecutivas que empiezan con >
    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push(
        <blockquote
          key={`blk${key++}`}
          className="mono"
          style={{
            borderLeft: `3px solid ${COLOR.accent}`,
            paddingLeft: "1rem",
            margin: "1.25rem 0",
            color: COLOR.text2,
            fontSize: "0.85rem",
            fontStyle: "italic",
          }}
        >
          {renderInline(quoteLines.join(" "), `q${key}`)}
        </blockquote>
      );
      continue;
    }

    // Lista ordenada: 1. / 2) etc.
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ""));
        i += 1;
      }
      blocks.push(
        <ol
          key={`blk${key++}`}
          style={{ margin: "0 0 1rem", paddingLeft: "1.3rem", color: COLOR.text1, fontSize: "0.88rem", lineHeight: 1.7 }}
        >
          {items.map((it, ix) => (
            <li key={ix} style={{ marginBottom: "0.4rem" }}>
              {renderInline(it, `ol${key}-${ix}`)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Lista no ordenada: -, *, +
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ""));
        i += 1;
      }
      blocks.push(
        <ul
          key={`blk${key++}`}
          style={{ margin: "0 0 1rem", paddingLeft: "1.1rem", color: COLOR.text1, fontSize: "0.88rem", lineHeight: 1.7 }}
        >
          {items.map((it, ix) => (
            <li key={ix} style={{ marginBottom: "0.4rem" }}>
              {renderInline(it, `ul${key}-${ix}`)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Regla horizontal: --- o *** en línea propia
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      blocks.push(
        <hr key={`blk${key++}`} style={{ border: "none", borderTop: `1px solid ${COLOR.border}`, margin: "1.75rem 0" }} />
      );
      i += 1;
      continue;
    }

    // Imagen en línea propia → figura centrada (como el bloque legacy image)
    const imgOnly = /^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/.exec(line.trim());
    if (imgOnly) {
      blocks.push(
        <figure key={`blk${key++}`} style={{ margin: "1.5rem 0" }}>
          <img
            src={imgOnly[2]}
            alt={imgOnly[1]}
            loading="lazy"
            style={{
              display: "block",
              width: "100%",
              maxWidth: 480,
              margin: "0 auto",
              border: `1px solid ${COLOR.border}`,
              background: COLOR.bg2,
            }}
          />
          {imgOnly[1] && (
            <figcaption
              className="mono"
              style={{ color: COLOR.text3, fontSize: "0.66rem", lineHeight: 1.55, textAlign: "center", marginTop: "0.6rem", opacity: 0.85 }}
            >
              {imgOnly[1]}
            </figcaption>
          )}
        </figure>
      );
      i += 1;
      continue;
    }

    // Párrafo: agrupa líneas consecutivas no vacías que no abren otro bloque
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,6})\s/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i]) &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^\s*([-*_])\1{2,}\s*$/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i += 1;
    }
    blocks.push(
      <p
        key={`blk${key++}`}
        style={{ color: COLOR.text1, fontSize: "0.9rem", lineHeight: 1.75, margin: "0 0 1rem" }}
      >
        {renderInline(paraLines.join(" "), `p${key}`)}
      </p>
    );
  }

  return <>{blocks}</>;
}
