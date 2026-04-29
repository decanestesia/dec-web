# DEC Web — Migración v16.1 (estilo terminal corregido)

## Cambios respecto a v16

**v16 rompió la interfaz** porque las páginas nuevas usaban Tailwind genérico
(`bg-foreground/5`, `border-foreground/10`, `container mx-auto`, `text-emerald-600`)
que no existen en este repo. El sistema visual real usa CSS variables custom
(`var(--text-0)`, `var(--accent)`, `var(--bg-2)`...) y clases utilitarias propias
(`.wrap`, `.panel`, `.cat-grid`, `.drug-grid`, `.btn-fill`, `.tag`, `.mono`,
`.search-box`, `.calc-input`, `.calc-result`, `.data-row`, `.scanline`...).

**v16.1** reescribe los 4 archivos de UI con el lenguaje visual correcto:

- `src/app/farmacos/page.tsx` → grid `.cat-grid`, `.drug-grid`, `.search-box`, `.tag`
- `src/app/farmacos/[slug]/page.tsx` → `.panel`, `.panel-header`, `.data-row`, `.info-grid`
- `src/app/farmacos/[slug]/InfusionCalculator.tsx` → `.panel.scanline`, `.calc-input`, `.calc-result`
- `src/app/calculadora/page.tsx` → `.search-box`, `.drug-grid`, `.btn`, `.btn-sm`

El resto se mantiene igual que v16:

- Snapshot de 493 fármacos en 56 categorías (`public/drugs.json`)
- Arquitectura híbrida: SSG + ISR cada 5 min con fetch a Supabase
- Calculadora integrada en cada ficha (125 fármacos), con tabs si hay múltiples indicaciones
- Sitemap con los 493 slugs

## Despliegue

### Si ya hiciste el push de v16

Sobrescribe los archivos con este bundle nuevo y haz un segundo commit:

```bash
cd ~/Documents/GitHub/dec-web
tar xzf ~/Downloads/dec-web-v16-1.tar.gz
```

En GitHub Desktop verás los archivos modificados. Commit y push:

- **Summary:** `fix(catálogo): restaura estilo terminal en páginas v16`

### Si NO hiciste push de v16 todavía

Aplica solo este bundle (incluye todo). Sobre tu repo limpio:

```bash
cd ~/Documents/GitHub/dec-web
tar xzf ~/Downloads/dec-web-v16-1.tar.gz
```

Commit:

- **Summary:** `feat(catálogo): migración v16 a Supabase, 493 fármacos, calculadora integrada`

## Verificación post-deploy

Cuando Vercel termine el build:

- [ ] `decanestesia.com` muestra "490+ fármacos" en stats (no 128+)
- [ ] `decanestesia.com/farmacos` muestra grid de 56 categorías con íconos y conteos
- [ ] Búsqueda "metformina" devuelve resultado con tag CALC si aplica
- [ ] `decanestesia.com/farmacos/metformina` muestra: panel de descripción, mecanismo, panel de farmacología (T½, biodisponibilidad, etc.), efectos adversos con badges de severidad por color, advertencias con border rojo/ámbar, embarazo categoría B, marcas Glucophage
- [ ] `decanestesia.com/farmacos/adrenalina` muestra calculadora con tabs (Bolo/Infusión)
- [ ] `decanestesia.com/calculadora` permite seleccionar y calcular en estilo panel + scanline
