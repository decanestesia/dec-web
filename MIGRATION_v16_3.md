# DEC Web v16.3 — Interacciones farmacológicas

Añade la sección **"Interacciones farmacológicas"** a la página de detalle de cada
fármaco y crea la nueva página **`/interacciones`** (verificador multi-fármaco).

## Lo que cambia

- **`src/lib/drugs.ts`** (modificado) — añade tipos `DrugInteraction`,
  `InteractionSeverity`, helpers `sortInteractions()`, mapas de color y label,
  fetch paralelizado de `drug_interactions` en `fetchDrugDetail()`,
  `fetchInteractionBetween(a, b)` para el checker.

- **`src/app/farmacos/[slug]/InteractionsSection.tsx`** (nuevo) — componente
  cliente con filtros por severidad (CI/major/mod/minor), expansión por click,
  links a la otra droga del par.

- **`src/app/farmacos/[slug]/page.tsx`** (modificado) — añade la sección entre
  Farmacología y Efectos Adversos. También añade badge `INT` (o `⚠ CI` si hay
  contraindicaciones) en el header junto a `CALC` y `MOL`.

- **`src/app/interacciones/page.tsx`** (nuevo) — verificador multi-fármaco:
  agrega N fármacos, calcula automáticamente todos los pares y muestra
  interacciones detectadas. Banner con código de color según severidad máxima.

- **`src/app/sitemap.ts`** (modificado) — añade `/interacciones`.

## Cobertura

- **152 interacciones bidireccionales** curadas críticas para anestesia
- **70 fármacos** con interacciones en su ficha
- 24 contraindicaciones absolutas + 98 mayores + 28 moderadas + 2 menores
- Top fármacos: Warfarina (11), Amiodarona (6), Linezolid (6), Aspirina (6),
  Meperidina/Selegilina/Azul de metileno (todas con contraindicaciones múltiples)

## ⚠ ACCIÓN MANUAL REQUERIDA: añadir link al navbar

Mi bundle no incluye `Navbar.tsx` porque vive en `src/components/Navbar.tsx`
y no quiero sobreescribir lo que ya tienes. Para que `/interacciones` sea
descubrible, edita tu Navbar y añade un link entre "Calculadora" y "Fármacos":

```tsx
<Link href="/interacciones">Interacciones</Link>
```

(O el formato que use tu Navbar — `<NavItem>` o lo que sea.)

## Despliegue

```bash
cd ~/Documents/dec-web
tar xzf ~/Downloads/dec-web-v16-3.tar.gz
```

GitHub Desktop te mostrará 4 archivos:
- `src/lib/drugs.ts` — modificado
- `src/app/sitemap.ts` — modificado
- `src/app/farmacos/[slug]/page.tsx` — modificado
- `src/app/farmacos/[slug]/InteractionsSection.tsx` — nuevo
- `src/app/interacciones/page.tsx` — nuevo

Edita también `src/components/Navbar.tsx` (o equivalente) para añadir el link.

Commit:
- **Summary:** `feat(interacciones): añade sección por fármaco + verificador /interacciones`

Push → Vercel re-despliega en ~90s.

## Verificación post-deploy

- `decanestesia.com/farmacos/meperidina-petidina` →
  - Header muestra badges `MOL` + `⚠ CI` (rojo)
  - Sección "⚠ INTERACCIONES — INCLUYE CONTRAINDICADAS" con 4 entradas
  - Filtros: contraindicadas (4), todas (4)
  - Click en "Selegilina" expande y muestra mecanismo + efecto + manejo

- `decanestesia.com/farmacos/warfarina` → 11 interacciones (mayoría major)

- `decanestesia.com/interacciones` →
  - Página vacía con 5 ejemplos clínicos sugeridos
  - Agrega "Meperidina (Petidina)" y "Selegilina" → banner rojo "1 contraindicación detectada"
  - Agrega "Tramadol", "Fluoxetina", "Linezolid" → varias mayores

- `decanestesia.com/farmacos/propofol` → sección de interacciones NO debería
  aparecer (Propofol no tiene interacciones registradas en Fase 1)

## Detalles UX con humor negro

- Footer de cada sección de interacciones:  
  `// no es una lista exhaustiva — el inserto siempre gana por puntos`
- Empty state de página /interacciones:  
  `// si ya sabes la respuesta, no necesitas la herramienta`
- Estado "1 fármaco":  
  `// un solo fármaco no interactúa consigo mismo (probablemente)`
- Resultado "sin interacciones":  
  `// ausencia de evidencia ≠ evidencia de ausencia`
- Footer general:  
  `// los pacientes leen menos los insertos que los anestesiólogos`
