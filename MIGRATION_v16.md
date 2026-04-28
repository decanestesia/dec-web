# DEC Web — Migración v16 a Supabase (Phase 9)

## Cambios en este push

**Arquitectura híbrida snapshot + Supabase:**

- `public/drugs.json` regenerado: 493 fármacos, 56 categorías, 240 KB (vs 128 antes)
- `src/lib/drugs.ts` reescrito con nuevo schema y helpers de fetch a Supabase
- `src/app/farmacos/page.tsx` + `FarmacosClient.tsx`: listado por categorías + búsqueda
- `src/app/farmacos/[slug]/page.tsx`: ficha completa con SSG + ISR (revalida cada 5 min)
- `src/app/farmacos/[slug]/InfusionCalculator.tsx`: calculadora integrada por fármaco
- `src/app/calculadora/page.tsx`: reescrita para reutilizar `InfusionCalculator`
- `src/app/sitemap.ts`: incluye los 493 slugs
- `src/app/page.tsx`: stats actualizadas (490+, 56, 125)
- `src/app/layout.tsx`: meta description actualizada
- `scripts/regenerate-drugs-json.mjs`: script para regenerar el snapshot

**Datos servidos en runtime desde Supabase:**

En la página de detalle `/farmacos/[slug]`, además del snapshot estático, se hace fetch en runtime a:

- `drug_pharmacology` (1,648 propiedades farmacocinéticas)
- `drug_adverse_effects` (3,373 efectos adversos categorizados)
- `drug_warnings` (929 advertencias incluyendo black box)
- `drug_pregnancy` (490 entradas de embarazo/lactancia)
- `drug_brand_names` (517 marcas comerciales)

ISR cada 5 min: cuando actualices Supabase, las páginas se regeneran automáticamente sin redeploy.

## Despliegue

### Opción A: Aplicar este bundle sobre el repo local

```bash
cd /ruta/a/dec-web                        # tu repo local
tar xzf /ruta/a/dec-web-v16.tar.gz        # extrae el bundle
git add -A
git status                                # revisa archivos modificados
git commit -m "feat(catálogo): migración v16 a Supabase, 493 fármacos, calculadora integrada"
git push origin main
```

Vercel detectará el push y desplegará automáticamente.

### Opción B: Subir vía GitHub web

1. Descomprimir el tarball localmente.
2. Subir cada archivo modificado vía GitHub web → drag-and-drop sobre las carpetas correspondientes.
3. GitHub crea el commit; Vercel auto-deploya.

## Regeneración futura del snapshot

Cuando agregues más fármacos a Supabase y quieras refrescar el snapshot estático:

```bash
node scripts/regenerate-drugs-json.mjs
git add public/drugs.json
git commit -m "data: regenera snapshot drugs.json"
git push
```

(Nota: las páginas de detalle ya se actualizan solas vía ISR cada 5 min sin tocar el snapshot.)

## Verificación post-deploy

- [ ] `https://decanestesia.com/farmacos` carga las 56 categorías
- [ ] Buscar "metformina" devuelve resultado
- [ ] `https://decanestesia.com/farmacos/metformina` muestra farmacología, efectos adversos, advertencias, embarazo, marcas
- [ ] La calculadora aparece en `/farmacos/adrenalina` con tabs para indicaciones múltiples
- [ ] `https://decanestesia.com/calculadora` permite seleccionar fármaco y calcular
- [ ] `https://decanestesia.com/sitemap.xml` lista los 493 slugs
- [ ] Lighthouse score > 90 en mobile y desktop
