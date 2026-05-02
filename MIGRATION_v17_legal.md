# DEC Web v17 — Páginas legales

Crea las 3 páginas legales necesarias para Apple App Store, AdSense y compliance
GDPR/LFPDPPP:

- `/legal/disclaimer` — Disclaimer médico (la más crítica para Apple Review)
- `/legal/privacidad` — Política de privacidad GDPR/LFPDPPP compliant
- `/legal/terminos` — Términos y condiciones

Más un footer global con links a las 3 desde toda la web.

## Archivos del bundle

```
src/
├── app/legal/
│   ├── layout.tsx                    ★ NUEVO — layout compartido con tabs
│   ├── disclaimer/page.tsx           ★ NUEVO
│   ├── privacidad/page.tsx           ★ NUEVO
│   └── terminos/page.tsx             ★ NUEVO
└── components/
    ├── LegalComponents.tsx           ★ NUEVO — header, secciones, etc.
    └── Footer.tsx                    ★ NUEVO — footer global con links
```

## Aplicar el bundle

```bash
cd ~/Documents/dec-web
tar xzf ~/Downloads/dec-web-v17-legal.tar.gz
```

GitHub Desktop te mostrará 6 archivos nuevos. **Antes de hacer commit**, hay
una integración manual mínima que hacer:

### Integración del Footer global

El bundle incluye `src/components/Footer.tsx` pero NO modifica tu
`src/app/layout.tsx` raíz. Tienes que añadir el footer manualmente para que
aparezca en toda la web.

Edita `src/app/layout.tsx`:

```tsx
import { Footer } from "@/components/Footer";   // ← añade este import

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        {children}
        <Footer />                                {/* ← añade esta línea */}
      </body>
    </html>
  );
}
```

(El nombre exacto del componente principal puede variar; busca dónde está
`<Navbar />` o `{children}` y añade `<Footer />` después.)

### Sitemap

Las 3 nuevas URLs ya están en el sitemap si aplicaste v16.3 antes (ahí ya
incluí `/legal/privacidad`, `/legal/terminos`, `/legal/disclaimer`). Si no,
revisa que tu `src/app/sitemap.ts` las tenga listadas.

## Commit

Una vez integrado el footer:

- **Summary:** `feat(legal): añade páginas de privacidad, términos y disclaimer médico`

Push → Vercel.

## Verificación post-deploy

- `decanestesia.com/legal/disclaimer` → debe abrir con banner rojo de aviso,
  9 secciones numeradas.
- `decanestesia.com/legal/privacidad` → 12 secciones, GDPR/LFPDPPP completo.
- `decanestesia.com/legal/terminos` → 16 secciones, términos completos.
- Footer con 4 columnas debe aparecer al final de cualquier página.
- Las 3 páginas deben tener tabs en la cabecera para navegar entre ellas.
- En las fichas de fármacos, el disclaimer pequeño que ya existe linkea a
  `/legal/disclaimer` correctamente.

## Direcciones de email mencionadas

He usado estos emails en los textos legales. **Necesitas que existan o
redirigir a una bandeja real**:

- `legal@decanestesia.com` (consultas legales generales)
- `privacidad@decanestesia.com` (ejercicio de derechos ARCO)
- `errores@decanestesia.com` (reporte de errores en datos)
- `hola@decanestesia.com` (contacto general)

Recomendación: configura los 4 como aliases que redirigen a tu correo
personal (en Namecheap o Cloudflare Email Routing es gratis). Esto evita
tener 4 buzones distintos y permite separar contextos.

## Apple Review — checklist

Apple revisa con lupa apps médicas. Para que pasen tu app DEC iOS sin
problemas:

- [x] Disclaimer médico visible y accesible desde la app
- [x] Política de privacidad accesible desde la app y en la página de la
      App Store
- [x] Términos accesibles
- [ ] **App Privacy Manifest** (Privacy Manifest: PrivacyInfo.xcprivacy en
      Xcode) — requerido por Apple desde mayo 2024. Genéralo en Xcode con
      TargetSettings → Capabilities → Privacy.
- [ ] **App Store Connect → App Privacy** — declarar qué datos recoge la
      app (en nuestro caso: ninguno identificable, solo logs de servidor).
- [ ] Disclaimer en la descripción del app store: "Esta aplicación es una
      herramienta de apoyo a profesionales sanitarios. No sustituye juicio
      clínico ni ficha técnica oficial."

## Humor negro mantenido

Mantenido en cada página, sin saturar:

- Disclaimer: `// si algo sale mal, la culpa no es del app`,
  `// los pacientes leen menos los insertos que los anestesiólogos`,
  `// ausencia de evidencia ≠ evidencia de ausencia`
- Privacidad: `// menos datos > más datos. Solo guardamos lo imprescindible.`,
  `// ningún sistema es 100% seguro · ni nosotros, ni Apple, ni tu banco`
- Términos: `// los leíste? perfecto. Eres minoría.`,
  `// ningún servicio en línea es 100% disponible`
- Footer: `// herramienta de apoyo · no sustituye juicio profesional · si algo sale mal, la culpa no es del app`

## Pendientes para iOS

Para que Apple Review pase sin fricción, además del bundle:

1. **Settings/About en la app** debe linkear a `decanestesia.com/legal/*`
   (los 3 enlaces externos).
2. **Disclaimer breve al primer arranque** o en SettingsView, con botón
   "He leído y acepto" persistido en UserDefaults.

¿Quieres que prepare un patch iOS para añadir estos enlaces en SettingsView/AboutView?
