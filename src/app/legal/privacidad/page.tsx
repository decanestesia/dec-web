import type { Metadata } from "next";
import {
  LegalHeader,
  LegalSection,
  P,
  UL,
  LI,
  LastUpdated,
  ContactBox,
  LegalCrossLinks,
} from "@/components/LegalComponents";

export const metadata: Metadata = {
  title: "Política de privacidad | DEC Anestesia",
  description:
    "Cómo DEC trata tus datos personales: qué recogemos, por qué, cuánto tiempo, y tus derechos.",
};

export default function PrivacidadPage() {
  return (
    <>
      <LegalHeader
        command="cat /legal/privacy.md | head -1000"
        title="Política de privacidad"
        subtitle="Qué datos recogemos, por qué, dónde viven, y cómo ejercer tus derechos."
        comment="// menos datos > más datos. Solo guardamos lo imprescindible."
      />

      <LegalSection number="01" title="Quiénes somos">
        <P>
          DEC (Diluciones, Dosis & Cálculos Anestésicos) es un proyecto
          desarrollado por el{" "}
          <strong>Dr. Jophiel Espaillat Caldentey</strong>, médico
          anestesiólogo, que actúa como responsable del tratamiento de los
          datos personales conforme a la legislación aplicable (LFPDPPP en
          México, RGPD en la Unión Europea, y normativas equivalentes en
          otras jurisdicciones).
        </P>
        <P>
          Sitio web: <code className="mono">decanestesia.com</code>
          <br />
          Contacto:{" "}
          <a
            href="mailto:privacidad@decanestesia.com"
            style={{ color: "var(--accent)" }}
          >
            privacidad@decanestesia.com
          </a>
        </P>
      </LegalSection>

      <LegalSection number="02" title="Qué datos recogemos">
        <P>DEC procesa la cantidad mínima de datos necesaria para funcionar.</P>

        <h3
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--text-0)",
            marginTop: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          a) Sin necesidad de cuenta (uso anónimo)
        </h3>
        <UL>
          <LI>
            <strong>Logs de servidor</strong> (Vercel): dirección IP,
            user-agent, URL solicitada, código de respuesta, fecha/hora.
            Retenidos hasta 30 días para detección de abuso y análisis de
            rendimiento.
          </LI>
          <LI>
            <strong>Datos de calculadoras</strong> (peso, edad, hematocrito,
            etc.): se procesan{" "}
            <strong>exclusivamente en tu navegador o dispositivo</strong>. No
            se envían a nuestros servidores. No los vemos.
          </LI>
          <LI>
            <strong>Cookies técnicas</strong> mínimas (preferencia de tema
            claro/oscuro). No usamos cookies publicitarias propias.
          </LI>
        </UL>

        <h3
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--text-0)",
            marginTop: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          b) Si decides crear una cuenta (opcional, futuro)
        </h3>
        <UL>
          <LI>Correo electrónico, contraseña hasheada (bcrypt/argon2).</LI>
          <LI>Nombre, especialidad y país (opcionales, declarativos).</LI>
          <LI>
            Preferencias guardadas (favoritos, calculadoras frecuentes).
          </LI>
        </UL>
        <P
          className="mono"
          style={{
            fontSize: "0.7rem",
            color: "var(--text-3)",
            opacity: 0.7,
          }}
        >
          // las cuentas aún no están activas; este apartado es transparencia
          anticipada para cuando lleguen
        </P>

        <h3
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--text-0)",
            marginTop: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          c) Lo que NUNCA recogemos
        </h3>
        <UL>
          <LI>
            <strong>Datos de tus pacientes.</strong> DEC nunca te pide ni
            almacena información identificable de pacientes. Si introduces
            datos en una calculadora, viven en tu dispositivo y mueren cuando
            cierras la app.
          </LI>
          <LI>Información de tarjetas de crédito (las gestiona el procesador de pagos cuando exista, no nosotros).</LI>
          <LI>Tu ubicación GPS exacta.</LI>
          <LI>Tu lista de contactos, fotos, mensajes ni archivos.</LI>
        </UL>
      </LegalSection>

      <LegalSection number="03" title="Por qué los recogemos (base legal)">
        <P>Procesamos datos sólo cuando hay una base legal válida:</P>
        <UL>
          <LI>
            <strong>Interés legítimo:</strong> logs de servidor, prevención
            de fraude/abuso, mejora del servicio.
          </LI>
          <LI>
            <strong>Ejecución de contrato:</strong> proporcionarte la
            herramienta cuando creas una cuenta o pagas una suscripción.
          </LI>
          <LI>
            <strong>Consentimiento:</strong> envío de comunicaciones (si
            aceptas explícitamente), uso de cookies no esenciales.
          </LI>
          <LI>
            <strong>Obligación legal:</strong> conservación de registros
            fiscales si hay transacciones, atención a requerimientos
            judiciales.
          </LI>
        </UL>
      </LegalSection>

      <LegalSection number="04" title="Dónde viven tus datos (encargados del tratamiento)">
        <P>DEC utiliza proveedores reputados, todos con compliance GDPR:</P>
        <UL>
          <LI>
            <strong>Vercel Inc.</strong> (EE.UU.) — hosting de la web.
            Cláusulas Contractuales Tipo (SCC) aplicables.
          </LI>
          <LI>
            <strong>Supabase Inc.</strong> (EE.UU., infraestructura AWS
            us-east) — base de datos del catálogo farmacológico. El catálogo
            es público y no contiene datos personales tuyos.
          </LI>
          <LI>
            <strong>Apple Inc.</strong> — distribución de la app iOS, sujeta
            a su propia política de privacidad.
          </LI>
          <LI>
            <strong>Google AdSense / AdMob</strong> (cuando se active,
            futuro) — para mostrar anuncios. Google puede usar cookies y
            aplicar su propia política. Más detalles abajo.
          </LI>
          <LI>
            <strong>Stripe / RevenueCat</strong> (cuando se active
            suscripciones, futuro) — procesamiento de pagos. Nunca vemos los
            datos de tu tarjeta.
          </LI>
        </UL>
        <P
          style={{
            background: "var(--bg-1)",
            padding: "0.75rem",
            borderLeft: "2px solid var(--cyan)",
            fontSize: "0.78rem",
            color: "var(--text-2)",
          }}
        >
          Algunos de estos proveedores están localizados fuera de tu país.
          Cuando esto ocurre, las transferencias internacionales se realizan
          bajo Cláusulas Contractuales Tipo (SCC) de la Comisión Europea o
          mecanismos equivalentes.
        </P>
      </LegalSection>

      <LegalSection number="05" title="Publicidad (Google AdSense / AdMob)">
        <P>
          DEC es un proyecto sostenido por publicidad y, en el futuro, por
          suscripciones opcionales. Cuando los anuncios estén activos:
        </P>
        <UL>
          <LI>
            Google y sus partners pueden usar cookies para servir anuncios
            personalizados según tus visitas previas a este y otros sitios.
          </LI>
          <LI>
            Puedes desactivar la personalización en{" "}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent)" }}
            >
              google.com/settings/ads
            </a>
            .
          </LI>
          <LI>
            Para residentes de la UE, mostramos un banner de consentimiento
            (CMP) que cumple con el TCF v2.2 e Iab Europe.
          </LI>
          <LI>
            <strong>No mostramos anuncios sobre páginas de fármacos
            específicas para evitar conflictos de interés.</strong> Los anuncios
            aparecen sólo en home, blog y secciones generales.
          </LI>
        </UL>
      </LegalSection>

      <LegalSection number="06" title="Cookies y almacenamiento local">
        <P>DEC usa los siguientes mecanismos de almacenamiento:</P>
        <UL>
          <LI>
            <strong>localStorage</strong> (navegador): preferencia de tema
            (claro/oscuro), favoritos sin cuenta. Permanece hasta que tú lo
            borres.
          </LI>
          <LI>
            <strong>Cookies técnicas</strong> de sesión: gestión de sesión
            cuando hay cuenta. Necesarias para login.
          </LI>
          <LI>
            <strong>Cookies analíticas</strong> (Vercel Analytics, Plausible
            o equivalente): conteo agregado de visitas, sin tracking
            individual. Si usamos un proveedor con tracking, te pediremos
            consentimiento.
          </LI>
          <LI>
            <strong>Cookies publicitarias</strong> (Google AdSense, futuro):
            requieren consentimiento explícito en jurisdicciones que lo
            exigen.
          </LI>
        </UL>
      </LegalSection>

      <LegalSection number="07" title="Tus derechos (ARCO+)">
        <P>
          Tienes derecho en todo momento a ejercer los siguientes derechos
          sobre tus datos personales:
        </P>
        <UL>
          <LI>
            <strong>Acceso:</strong> saber qué datos tenemos sobre ti.
          </LI>
          <LI>
            <strong>Rectificación:</strong> corregir datos inexactos.
          </LI>
          <LI>
            <strong>Cancelación / Supresión / &quot;derecho al olvido&quot;:</strong>{" "}
            eliminar tus datos. Tras eliminación, tus datos personales se
            borran en un máximo de 30 días, salvo cuando una obligación legal
            requiera conservarlos.
          </LI>
          <LI>
            <strong>Oposición:</strong> oponerte al tratamiento por motivos
            de tu situación particular.
          </LI>
          <LI>
            <strong>Limitación del tratamiento.</strong>
          </LI>
          <LI>
            <strong>Portabilidad:</strong> exportar tus datos en formato
            estructurado (JSON) para llevarlos a otro servicio.
          </LI>
          <LI>
            <strong>No estar sujeto a decisiones automatizadas</strong> con
            efectos jurídicos.
          </LI>
          <LI>
            <strong>Revocación del consentimiento</strong> en cualquier
            momento.
          </LI>
        </UL>
        <P>
          Para ejercer estos derechos, escríbenos a{" "}
          <a
            href="mailto:privacidad@decanestesia.com"
            style={{ color: "var(--accent)" }}
          >
            privacidad@decanestesia.com
          </a>{" "}
          desde la cuenta o correo asociado a la solicitud. Responderemos en
          un plazo máximo de 30 días naturales.
        </P>
      </LegalSection>

      <LegalSection number="08" title="Plazos de conservación">
        <UL>
          <LI>
            <strong>Logs de servidor:</strong> 30 días.
          </LI>
          <LI>
            <strong>Datos de cuenta activa:</strong> mientras la cuenta exista.
          </LI>
          <LI>
            <strong>Datos tras eliminación de cuenta:</strong> borrado en 30
            días, salvo retenciones legales (facturación: 5 años en México,
            10 años en España).
          </LI>
          <LI>
            <strong>Cookies:</strong> según tipo, entre la sesión actual y 13
            meses máximo.
          </LI>
        </UL>
      </LegalSection>

      <LegalSection number="09" title="Menores de edad">
        <P>
          DEC está dirigido a profesionales sanitarios cualificados. No
          recogemos datos de menores de 16 años de forma consciente. Si eres
          padre/madre y crees que tu hijo nos ha proporcionado datos,
          contáctanos para eliminarlos.
        </P>
      </LegalSection>

      <LegalSection number="10" title="Seguridad">
        <P>
          Aplicamos medidas técnicas y organizativas razonables para proteger
          tus datos:
        </P>
        <UL>
          <LI>HTTPS/TLS en todas las comunicaciones.</LI>
          <LI>Hash de contraseñas (cuando existan cuentas) con bcrypt o argon2.</LI>
          <LI>Acceso por roles a la base de datos del backend.</LI>
          <LI>Logs de auditoría de cambios en datos sensibles.</LI>
          <LI>
            Notificación de brechas de seguridad relevantes a la autoridad
            competente y a los afectados según marcos legales.
          </LI>
        </UL>
        <P
          className="mono"
          style={{
            fontSize: "0.7rem",
            color: "var(--text-3)",
            opacity: 0.7,
          }}
        >
          // ningún sistema es 100% seguro · ni nosotros, ni Apple, ni tu
          banco, ni nadie. Pero tomamos precauciones razonables.
        </P>
      </LegalSection>

      <LegalSection number="11" title="Reclamaciones ante autoridades">
        <P>
          Si consideras que el tratamiento de tus datos no se ajusta a la
          normativa aplicable, tienes derecho a presentar una reclamación ante
          la autoridad de control competente:
        </P>
        <UL>
          <LI>
            <strong>México:</strong> Instituto Nacional de Transparencia,
            Acceso a la Información y Protección de Datos Personales (INAI) —{" "}
            <a
              href="https://home.inai.org.mx"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent)" }}
            >
              inai.org.mx
            </a>
          </LI>
          <LI>
            <strong>España:</strong> Agencia Española de Protección de Datos
            (AEPD) —{" "}
            <a
              href="https://www.aepd.es"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent)" }}
            >
              aepd.es
            </a>
          </LI>
          <LI>
            <strong>Resto UE:</strong> autoridad de protección de datos de tu
            país.
          </LI>
        </UL>
      </LegalSection>

      <LegalSection number="12" title="Cambios a esta política">
        <P>
          Podemos actualizar esta política para reflejar cambios legales,
          técnicos u operativos. La fecha de última actualización aparece al
          final del documento. Cuando los cambios sean materiales,
          notificaremos en la home del sitio o por correo si tienes cuenta.
        </P>
      </LegalSection>

      <LastUpdated date="mayo de 2026" />
      <ContactBox />
      <LegalCrossLinks current="privacidad" />
    </>
  );
}
