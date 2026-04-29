# Hotfix v16.2.1 — corrección de render 2D

## Causa del problema

El componente `MolecularSection` v16.2 usaba `SmilesDrawer.Drawer`, que es la
clase para `<canvas>`. SmilesDrawer tiene una clase aparte `SvgDrawer` para
elementos `<svg>`. Llamar `.draw()` sobre un `<svg>` con la clase de canvas
falla silenciosamente y muestra "sin render 2D".

## Cambios

- Usa `SmilesDrawer.SvgDrawer` (correcto para SVG)
- CDN cambiado a `unpkg.com` (más estable, menos bloqueado por adblockers)
- Parámetros de la librería corregidos (bondLength en pixels, no fracciones)
- Cache módulo del script para evitar re-inyección
- Logs de errores a `console.error` para diagnóstico

## Aplicar

```bash
cd ~/Documents/dec-web
tar xzf ~/Downloads/dec-web-v16-2-1.tar.gz
```

Sobrescribe solo `src/app/farmacos/[slug]/MolecularSection.tsx`.

GitHub Desktop te mostrará 1 archivo modificado. Commit:

- **Summary:** `fix(farmacos): usa SvgDrawer en lugar de Drawer para render 2D`

Push → Vercel re-despliega.

## Verificación

`Cmd + Shift + R` en `decanestesia.com/farmacos/metformina`. Debes ver la
estructura 2D dibujada en el cuadro blanco.

Si después de esto sigue saliendo "sin render 2D":

1. Abre DevTools (Cmd + Option + I) → pestaña Console
2. Recarga la página
3. Mándame los errores en rojo que aparezcan

Las posibles causas restantes serían:
- CSP del proyecto bloqueando `unpkg.com` (poco común)
- AdBlocker / uBlock bloqueando CDN (probar en ventana incógnito)
- SMILES inválido en algún fármaco específico (el componente ya captura este caso)
