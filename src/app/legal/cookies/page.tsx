// src/app/legal/cookies/page.tsx
//
// Política de Cookies de DEC. ePrivacy + GDPR compliant.

import { LegalShell, LegalSection, Callout } from "../_components/LegalShell";

export const metadata = {
  title: "Política de Cookies — DEC Anestesia",
  description:
    "Cómo DEC utiliza cookies y tecnologías de almacenamiento similares.",
};

const toc = [
  { id: "que-son", label: "1. Qué son las cookies" },
  { id: "que-usamos", label: "2. Qué cookies usamos" },
  { id: "esenciales", label: "3. Cookies esenciales" },
  { id: "preferencias", label: "4. Cookies de preferencias" },
  { id: "analytics", label: "5. Cookies de analytics" },
  { id: "publicidad", label: "6. Cookies de publicidad" },
  { id: "terceros", label: "7. Cookies de terceros" },
  { id: "duracion", label: "8. Duración" },
  { id: "gestionar", label: "9. Cómo gestionarlas" },
  { id: "cambios", label: "10. Cambios" },
];

export default function CookiesPage() {
  return (
    <LegalShell
      eyebrow="Documento legal"
      title="Política de Cookies"
      subtitle="Las cookies y tecnologías similares que utilizamos, qué hacen y cómo controlarlas."
      effectiveDate="12 de mayo de 2026"
      version="1.0"
      toc={toc}
      relatedPages={[
        { href: "/legal/privacidad", label: "Política de Privacidad" },
        { href: "/legal/terminos", label: "Términos y Condiciones" },
        { href: "/legal/aviso-medico", label: "Aviso Médico" },
      ]}
    >
      <Callout variant="info" label="Resumen no vinculante">
        DEC usa <strong>únicamente cookies esenciales</strong> para mantener tu
        sesión iniciada y recordar tus preferencias visuales (tema claro/oscuro).{" "}
        <strong>No usamos cookies de publicidad ni de rastreo cross-site.</strong>{" "}
        No se requiere banner de consentimiento porque solo usamos cookies
        técnicas estrictamente necesarias (exentas según Art. 5.3 de la
        Directiva ePrivacy y guidelines del EDPB).
      </Callout>

      <LegalSection id="que-son" number="1" title="Qué son las cookies">
        <p>
          Las cookies son pequeños archivos de texto que un sitio web puede
          almacenar en tu dispositivo (computadora, móvil, tableta) cuando lo
          visitas. Sirven para que el sitio funcione correctamente, recuerde
          tus preferencias o reconozca tu sesión.
        </p>
        <p>
          Tecnologías similares incluidas en esta política:
        </p>
        <ul>
          <li>
            <strong>localStorage / sessionStorage</strong>: almacenamiento en
            el navegador para preferencias del usuario.
          </li>
          <li>
            <strong>IndexedDB</strong>: base de datos local para datos del
            cliente (no usada actualmente por DEC web; sí por la app iOS para
            caché local).
          </li>
          <li>
            <strong>Web tokens</strong> (JWT): tokens de sesión almacenados en
            cookies seguras HttpOnly.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="que-usamos" number="2" title="Qué cookies usamos">
        <p>DEC utiliza las siguientes categorías de cookies:</p>
        <ul>
          <li>
            <strong>Esenciales</strong>: necesarias para que el servicio funcione.
          </li>
          <li>
            <strong>Preferencias</strong>: para recordar configuraciones que tú eliges.
          </li>
          <li>
            <strong>Analytics</strong>: <em>actualmente NO usadas</em>.
            Si en el futuro las implementamos, será con herramientas privacy-friendly
            sin cookies de rastreo personal (Plausible, Umami u similar).
          </li>
          <li>
            <strong>Publicidad</strong>: <em>actualmente NO usadas</em> en la
            web. La app iOS podría usar AdMob en el futuro para usuarios del
            plan Free; te notificaremos y solicitaremos consentimiento ATT
            cuando corresponda.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="esenciales" number="3" title="Cookies esenciales">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Propósito</th>
              <th>Duración</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>sb-access-token</code>
              </td>
              <td>Token de acceso de sesión (JWT)</td>
              <td>1 hora</td>
              <td>HttpOnly, Secure, SameSite=Lax</td>
            </tr>
            <tr>
              <td>
                <code>sb-refresh-token</code>
              </td>
              <td>Token de refresco de sesión</td>
              <td>7 días</td>
              <td>HttpOnly, Secure, SameSite=Lax</td>
            </tr>
            <tr>
              <td>
                <code>sb-auth-token</code>
              </td>
              <td>Estado consolidado de auth</td>
              <td>Sesión</td>
              <td>Secure, SameSite=Lax</td>
            </tr>
          </tbody>
        </table>
        <p>
          Estas cookies se establecen por Supabase Auth y son indispensables
          para que puedas iniciar sesión, navegar autenticado y mantener tu
          suscripción reconocida. Sin ellas no puedes usar funcionalidades que
          requieran cuenta.
        </p>
      </LegalSection>

      <LegalSection id="preferencias" number="4" title="Cookies de preferencias">
        <table>
          <thead>
            <tr>
              <th>Nombre / Clave</th>
              <th>Propósito</th>
              <th>Duración</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>dec-theme</code>
              </td>
              <td>Tema visual (claro / oscuro)</td>
              <td>1 año</td>
              <td>localStorage</td>
            </tr>
            <tr>
              <td>
                <code>dec-locale</code>
              </td>
              <td>Idioma de la interfaz (cuando se habilite)</td>
              <td>1 año</td>
              <td>localStorage</td>
            </tr>
          </tbody>
        </table>
        <p>
          Estas preferencias se guardan localmente en tu navegador. Puedes
          borrarlas desde la configuración de tu navegador sin afectar tu
          cuenta.
        </p>
      </LegalSection>

      <LegalSection id="analytics" number="5" title="Cookies de analytics">
        <p>
          Actualmente <strong>DEC NO utiliza cookies de analytics</strong>.
        </p>
        <p>
          En el futuro podríamos implementar herramientas privacy-friendly
          como Plausible Analytics o Umami, que <strong>no usan cookies
          personales ni rastrean usuarios individualmente</strong>, sino que
          generan métricas agregadas y anónimas (páginas más visitadas,
          referrers, etc.). Si lo hacemos, actualizaremos esta política y te
          informaremos antes de implementarlo.
        </p>
      </LegalSection>

      <LegalSection id="publicidad" number="6" title="Cookies de publicidad">
        <p>
          La web de DEC <strong>NO utiliza cookies de publicidad</strong>.
        </p>
        <p>
          En el futuro, los usuarios del tier Free podrían ver publicidad
          servida por Google AdSense (web) o Google AdMob (iOS). Cuando esto
          ocurra:
        </p>
        <ul>
          <li>
            Te lo notificaremos previamente y actualizaremos esta política.
          </li>
          <li>
            Implementaremos un banner de consentimiento conforme a ePrivacy
            (UE) y CCPA (California).
          </li>
          <li>
            En iOS aplicaremos App Tracking Transparency (ATT) y solo usaremos
            tracking si das consentimiento expreso.
          </li>
          <li>
            Los usuarios del tier Pro <strong>nunca verán publicidad</strong>{" "}
            ni serán objeto de cookies de rastreo publicitario por parte de DEC.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="terceros" number="7" title="Cookies de terceros">
        <p>
          Algunos servicios de terceros que integramos pueden establecer sus
          propias cookies cuando interactúas con ellos:
        </p>
        <ul>
          <li>
            <strong>Lemon Squeezy</strong> (en el momento de pago): cookies
            necesarias para procesar la transacción. Sujetas a la{" "}
            <a
              href="https://www.lemonsqueezy.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              política de privacidad de Lemon Squeezy
            </a>
            .
          </li>
          <li>
            <strong>Apple y Google</strong> (durante el flujo OAuth): cookies
            del proveedor de identidad para validar tu sesión. Sujetas a las
            políticas de Apple y Google.
          </li>
        </ul>
        <p>
          DEC no controla ni puede gestionar cookies establecidas por estos
          terceros. Consulta sus políticas directamente para más información.
        </p>
      </LegalSection>

      <LegalSection id="duracion" number="8" title="Duración de las cookies">
        <ul>
          <li>
            <strong>Cookies de sesión</strong>: se borran al cerrar el
            navegador.
          </li>
          <li>
            <strong>Cookies persistentes</strong>: permanecen hasta su fecha
            de expiración o hasta que las borres manualmente.
          </li>
        </ul>
        <p>
          La duración de cada cookie específica se indica en las tablas de las
          secciones 3 y 4.
        </p>
      </LegalSection>

      <LegalSection id="gestionar" number="9" title="Cómo gestionar las cookies">
        <h3>9.1. Desde tu navegador</h3>
        <p>
          Todos los navegadores permiten controlar, ver y eliminar cookies.
          Consulta la documentación de tu navegador:
        </p>
        <ul>
          <li>
            <a
              href="https://support.google.com/chrome/answer/95647"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Chrome
            </a>
          </li>
          <li>
            <a
              href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
              target="_blank"
              rel="noopener noreferrer"
            >
              Safari
            </a>
          </li>
          <li>
            <a
              href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias"
              target="_blank"
              rel="noopener noreferrer"
            >
              Firefox
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/help/4027947/microsoft-edge-delete-cookies"
              target="_blank"
              rel="noopener noreferrer"
            >
              Microsoft Edge
            </a>
          </li>
        </ul>

        <h3>9.2. Implicaciones de bloquear cookies</h3>
        <p>
          Si bloqueas las cookies esenciales de DEC, no podrás iniciar sesión
          ni mantener una sesión activa. La aplicación funcionará en modo
          público pero sin acceso a tu cuenta o suscripción.
        </p>

        <h3>9.3. Modo navegación privada</h3>
        <p>
          En modo privado/incógnito, las cookies se almacenan solo durante esa
          sesión y se borran al cerrar la ventana. Esto significa que tu
          sesión DEC en modo privado se cerrará al cerrar el navegador.
        </p>
      </LegalSection>

      <LegalSection id="cambios" number="10" title="Cambios en esta política">
        <p>
          Si modificamos las cookies que usamos (por ejemplo, al incorporar
          analytics o publicidad), actualizaremos esta política y te
          notificaremos previamente cuando sea legalmente exigible o cuando
          el cambio sea sustancial.
        </p>
      </LegalSection>

      <div className="legal-page-footer">
        <p>
          Para consultas relativas a cookies:{" "}
          <a href="mailto:privacidad@decanestesia.com">privacidad@decanestesia.com</a>
        </p>
        <p>
          // las cookies son fáciles de demonizar — pero sin las esenciales no hay sesión.<br />
          // el banner cookie spam de internet existe porque la mayoría de sitios trackea agresivamente.<br />
          // DEC se ahorra el banner porque se ahorra el tracking.
        </p>
      </div>
    </LegalShell>
  );
}
