# DEC Web v16.2 — Datos moleculares

Añade la sección **"Estructura química"** a la página de detalle de cada fármaco con datos provenientes de PubChem.

## Lo que cambia

- **`src/lib/drugs.ts`** (modificado) — añade:
  - Interface `MolecularData`
  - Campo `molecular` en `DrugDetail`
  - Helpers `parseFormulaToTokens()`, `interpretLogP()`, `pubchemUrl()`, `hasMolecularData()`
  - Fetch paralelizado de `drug_molecular` en `fetchDrugDetail()`

- **`src/app/farmacos/[slug]/MolecularSection.tsx`** (nuevo) — componente cliente que renderiza:
  - Estructura 2D dibujada desde el SMILES con SmilesDrawer.js (cargado vía CDN)
  - Fórmula molecular con subscripts (C₈H₉NO₂)
  - Peso molecular en g/mol
  - LogP con interpretación cualitativa (Hidrofílico / Lipofílico / etc.)
  - pKa, unión a proteínas, solubilidad
  - InChI Key, InChI, SMILES en bloque colapsable
  - Link "Ver en PubChem" usando InChI Key

- **`src/app/farmacos/[slug]/page.tsx`** (modificado) — añade la sección entre la calculadora y farmacología, más el badge `MOL` en el header cuando hay datos.

## Cobertura

De los 493 fármacos publicados:
- **424 con datos moleculares** (86%) — todos muestran la nueva sección
- 69 sin datos (anticuerpos monoclonales, insulinas, soluciones de electrolitos, mezclas) — la sección no aparece

## Despliegue

```bash
cd ~/Documents/dec-web
tar xzf ~/Downloads/dec-web-v16-2.tar.gz
```

GitHub Desktop te mostrará 3 archivos:
- `src/lib/drugs.ts` — modificado
- `src/app/farmacos/[slug]/page.tsx` — modificado
- `src/app/farmacos/[slug]/MolecularSection.tsx` — nuevo

Commit:
- **Summary:** `feat(farmacos): añade sección de datos moleculares con render 2D`

Push → Vercel re-despliega en ~90 segundos.

## Verificación post-deploy

- `decanestesia.com/farmacos/metformina` → debe mostrar:
  - Badge `MOL` en el header junto a `CALC`
  - Sección "ESTRUCTURA QUÍMICA" con dibujo 2D, fórmula C₄H₁₁N₅, MW 129.16 g/mol, LogP -1.30 con tag "Hidrofílico"
  - Bloque colapsable "IDENTIFICADORES QUÍMICOS"
  - Botón "ver en pubchem ↗"
- `decanestesia.com/farmacos/propofol` → mismo formato, pero con LogP 3.79 "Lipofílico" + datos de solubilidad y unión a proteínas (datos extra ya estaban en DB)
- `decanestesia.com/farmacos/adalimumab` → NO debe mostrar la sección (anticuerpo, no tiene datos PubChem)

Si el dibujo 2D no aparece (sólo texto "rendering..."), revisa la consola del navegador. Es probable que tu CSP bloquee `cdn.jsdelivr.net` — en ese caso, házmelo saber y armamos una versión que copie SmilesDrawer al `public/` directamente.

## Detalles técnicos

- **SmilesDrawer.js** se carga desde `cdn.jsdelivr.net/npm/smiles-drawer@2.1.7` por el componente cliente. ~70 KB minified, cargado una sola vez por sesión.
- **Tema dark/light**: el dibujo respeta el theme actual del documento (vía `data-theme` o `prefers-color-scheme`).
- **ISR 5 min**: igual que el resto de la página de detalle, los datos moleculares se revalidan en background sin redeploy.
