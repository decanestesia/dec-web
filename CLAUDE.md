# CLAUDE.md — dec-web (decanestesia.com)
**Actualizado: 3 julio 2026 · Sprint: PRODUCCIÓN (deadline domingo 5 julio)**
**Documento hermano: DEC-BLUEPRINT.md en ~/claude/DEC/ (fuente de verdad del producto)**

## CÓMO TRABAJAR CONMIGO (comportamiento requerido)
- Responde SIEMPRE en español (RD), conciso, técnico, sin preámbulos.
- Ejecuta directamente: edita archivos y corre comandos sin pedir permiso salvo: `git push` a main (deploy a producción — confirma antes), borrado de archivos no creados por ti, y cambios de schema en Supabase (muéstrame el SQL primero).
- Humor negro permitido SOLO en comentarios de código/UI/footers, NUNCA en contenido clínico.
- Cambios quirúrgicos: respeta el código existente, no reescribas lo que funciona.
- Tras cada tarea: `npx tsc --noEmit` y reporta en 1-2 líneas.

## QUÉ ES ESTE PROYECTO
Web de DEC (Diluciones, Dosis & Cálculos Anestésicos) — herramienta clínica para anestesiólogos del Dr. Jophiel Espaillat (RD). Next.js 16 (Turbopack), deploy automático a Vercel en cada push a main. Dominio: decanestesia.com (apex canónico, www→308, DNS Namecheap→Vercel).

## STACK Y CONVENCIONES
- Next.js 16.2.4 App Router (Turbopack), TypeScript estricto, React 19.
- **NO Tailwind para UI custom** — CSS variables + inline styles + styled-jsx. Tailwind solo utilidades de layout.
- Estética: terminal/dark/sharp, mono labels lowercase, NO gradientes pastel AI-genéricos.
- CSS de rutas específicas se importa desde el layout.tsx de la ruta (ej: `import "@/styles/legal.css"` en legal/layout.tsx), NO con @import en globals.css (falla con Turbopack).
- Fuentes de datos clínicos citadas (Vancouver): UpToDate, Stoelting, Miller, Trissel's, FDA. Nunca inventar dosis/nombres.

## INFRAESTRUCTURA
- Supabase: ref `smaazlgvonzcajjvbefk`, URL https://smaazlgvonzcajjvbefk.supabase.co, publishable key `sb_publishable_eNHOromowckcjzkLk-204A_fIr5tFcF` (está en el código).
- ⚠️ PLAN FREE: el proyecto SE PAUSA tras ~7 días de inactividad → web cae (SSR fetch muere). Ya pasó 2 veces. Mitigación (3 capas, HECHO 3-jul): keep-alive GitHub Action `.github/workflows/keep-alive.yml` (cron cada 2 días + dispatch) + fallback offline SSR en `src/lib/drugs.ts` + backups del snapshot. Supabase Pro ($25/mes) pendiente para launch con usuarios reales.
- MCP Supabase configurado en .mcp.json (solo lectura preferente; migraciones: mostrar SQL antes).
- Vercel: team `decanestesias-projects`, proyecto `dec-web` (prj_70ZH9ZhIvqOzuihnACb9ZDqbBGA6). Cada push a main = deploy a producción.
- Emails ProtonMail verificados: jophiel@, hola@, soporte@, legal@, privacidad@, errores@ decanestesia.com.

## ESTADO ACTUAL (qué está HECHO)
- Catálogo v16: 493 fármacos desde Supabase, fichas con dosing/administración/presentaciones/molecular (render 2D), 56 categorías.
- Interacciones: sección por fármaco + verificador /interacciones.
- Calculadora de infusión integrada.
- AUTH COMPLETO: email+password, Google OAuth, Apple OAuth (dominio verificado, Hide My Email operativo), recovery vía /auth/callback?next=/auth/reset/confirm. UserMenu en navbar.
- LEGAL COMPLETO: /legal/{terminos,privacidad,cookies,aviso-medico} con LegalShell + legal.css importado desde legal/layout.tsx. Footer con 4 links legales.
- Blog, about, PWA/SEO base.
- DB: 494 drugs, 60 categorías, 1659 pharmacology, 3383 adverse effects, 938 warnings, 491 pregnancy, 520 brands, 425 molecular, 230 interactions, 455 dosing, 203 administration, 556 presentations, 246 infusion. Schema auth v35-37 (profiles, subscription_tiers×5, user_subscriptions, comp_codes, discount_codes, RPCs: is_pro, get_active_tier, redeem_comp_code, validate_discount_code). catalog_metadata.version=38.

## SPRINT PRODUCCIÓN — ESTADO
**Web resilience track HECHO (3 jul 2026):**
1. ✅ **Snapshot+backup**: `node scripts/generate-snapshot.mjs` → `public/drugs-full.json` (v38, 494 fármacos, detalle completo, ~1.8 MB) + `backups/backup-latest.json` + fechado (gitignored). Un solo archivo sirve web e iOS: `detail[drug_id]` son filas crudas que decodifican igual `DrugDetail` (web) y `DrugDetailBundle` (iOS). Re-correr antes de cada release.
2. ✅ **Keep-alive**: `.github/workflows/keep-alive.yml` — cron cada 2 días + dispatch manual, SELECT a `catalog_metadata`. Evita la pausa del free tier.
3. ✅ **Fallback offline SSR**: `fetchDrugDetail` en `src/lib/drugs.ts` hace try Supabase → catch → `drugs-full.json` local. La base ya cargaba de JSON local.
4. ✅ **Página /pro**: pricing §2.1 + matriz Free/Pro §3 + CTA (crear cuenta gratis + waitlist mailto; checkout Lemon Squeezy llega en D.5). Link `pro` en navbar.

**iOS HECHO (3 jul 2026, rama `feat/v19-offline-storekit-paywall`, BUILD SUCCEEDED):**
5. ✅ DrugDatabase v19 (snapshot embebido, detalle offline, throttle 24h) + StoreKit 2 (`StoreService`) + `PaywallView` + gating §3 (Electrolitos/ROTEM, HomeView + QuickNavMenu). Paquete `supabase-swift` cableado. Metadatos ASC en `Calculator/AppStore/metadata.md`. Falta: correr en device (sim local es iOS 18.5, app pide iOS 26). Gating "3/día" de interacciones → DECISIÓN: ilimitado en iOS v1 (el gating §3 core, calculadoras avanzadas, ya está; no degradar UX del quirófano).

**Seguridad — auditoría 3 jul (pendiente de aplicar):**
6. 🔴 **DB**: la anon key (pública) puede INSERT/UPDATE el catálogo clínico (policies `WITH CHECK true` + grants). El pipeline escribe con anon → fix coordinado: pipeline a service_role, luego revocar. SQL listo en `~/Documents/DEC-supabase-security.sql`. También: `create_discount_code` ejecutable por anon; search_path mutable. (Regla: mostrar SQL primero — no aplicado.)
7. ✅ **Web** (aplicado en rama): open redirect en `next` saneado (`safeNext`); verificador de interacciones ya no muestra "sin interacción" ante fallo de red (falso negativo clínico).

**Pendiente menor:**
8. (Si hay tiempo) Lighthouse + horizontal-scroll bug. Lint pre-existente (comentarios JSX en login/signup footers, setState-in-effect en /interacciones). Dead code `src/lib/supabase.ts` (footgun PostgREST, sin call sites → candidato a borrar).

## MODELO FREE/PRO (gating web futuro)
Catálogo completo gratis. Pro: interacciones ilimitadas (free: 3/día), detalle ampliado (farmacología completa/molecular/marcas — free ve resumen), calculadoras avanzadas, sin ads, sync. Verificar con is_pro() server-side.

## ERRORES CONOCIDOS / GOTCHAS
- @import de CSS en globals.css NO carga con este setup → importar desde layout de la ruta.
- Supabase REST cap 1000 filas/request → paginar con header Range.
- El repo es público en GitHub → no commitear secrets (la publishable key es pública por diseño, OK).
