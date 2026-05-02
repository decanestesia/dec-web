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
  title: "Términos y condiciones | DEC Anestesia",
  description:
    "Condiciones de uso de DEC: web y aplicación iOS. Suscripciones, propiedad intelectual y conducta esperada.",
};

export default function TerminosPage() {
  return (
    <>
      <LegalHeader
        command="cat /legal/terms.md"
        title="Términos y condiciones"
        subtitle="Condiciones de uso del sitio web decanestesia.com y la aplicación DEC para iOS."
        comment="// los leíste? perfecto. Eres minoría."
      />

      <LegalSection number="01" title="Aceptación">
        <P>
          Al acceder a DEC (sitio web <code className="mono">decanestesia.com</code>{" "}
          y aplicación iOS DEC), aceptas estos términos y condiciones. Si no
          estás de acuerdo, no uses el servicio.
        </P>
        <P>
          Estos términos se complementan con el{" "}
          <a href="/legal/disclaimer" style={{ color: "var(--accent)" }}>
            Disclaimer médico
          </a>{" "}
          y la{" "}
          <a href="/legal/privacidad" style={{ color: "var(--accent)" }}>
            Política de privacidad
          </a>
          , que forman parte integral del acuerdo.
        </P>
      </LegalSection>

      <LegalSection number="02" title="Definiciones">
        <UL>
          <LI>
            <strong>&quot;Servicio&quot;</strong>: el sitio web{" "}
            decanestesia.com, la aplicación iOS DEC, y todas las herramientas
            asociadas (calculadoras, catálogo de fármacos, verificador de
            interacciones, etc.).
          </LI>
          <LI>
            <strong>&quot;Usuario&quot;</strong>: tú, profesional sanitario
            cualificado que accede al Servicio.
          </LI>
          <LI>
            <strong>&quot;Autor&quot;</strong>: Dr. Jophiel Espaillat
            Caldentey, responsable del Servicio.
          </LI>
          <LI>
            <strong>&quot;Contenido&quot;</strong>: textos, dosis,
            interacciones, calculadoras, código, diseño y demás material
            disponible en el Servicio.
          </LI>
        </UL>
      </LegalSection>

      <LegalSection number="03" title="Quién puede usar DEC">
        <P>Para usar el Servicio:</P>
        <UL>
          <LI>
            Debes ser <strong>profesional sanitario cualificado</strong> (médico,
            enfermero, farmacéutico, residente, estudiante avanzado) o
            estudiante de carreras sanitarias bajo supervisión académica.
          </LI>
          <LI>Debes ser mayor de 18 años o tener la mayoría de edad legal en tu jurisdicción.</LI>
          <LI>
            Si eres paciente o no profesional sanitario, no debes usar la
            herramienta para tomar decisiones sobre tu propio tratamiento o
            el de terceros.
          </LI>
        </UL>
      </LegalSection>

      <LegalSection number="04" title="Uso permitido">
        <P>Puedes usar DEC para:</P>
        <UL>
          <LI>
            Consultar información farmacológica como apoyo en tu práctica
            clínica.
          </LI>
          <LI>Realizar cálculos de infusión, antropometría, electrolitos.</LI>
          <LI>Verificar interacciones farmacológicas críticas.</LI>
          <LI>
            Compartir enlaces a páginas de DEC con colegas (las URLs son
            públicas).
          </LI>
          <LI>
            Citar contenido de DEC en publicaciones académicas con
            atribución apropiada.
          </LI>
        </UL>
      </LegalSection>

      <LegalSection number="05" title="Uso prohibido">
        <P>No puedes:</P>
        <UL>
          <LI>
            Usar el Servicio para diagnosticar, prescribir o tratar
            pacientes <strong>sin formación clínica adecuada</strong>.
          </LI>
          <LI>
            Realizar scraping masivo, descarga automatizada o copia íntegra
            del catálogo para reutilización en otros productos.
          </LI>
          <LI>
            Acceder a la API de Supabase del proyecto fuera del contexto
            normal del Servicio (para uso institucional o académico,
            contáctanos).
          </LI>
          <LI>
            Aplicar ingeniería inversa, descompilar o desensamblar la
            aplicación iOS.
          </LI>
          <LI>
            Usar el Servicio para fines ilegales, fraudulentos, o que
            infrinjan derechos de terceros.
          </LI>
          <LI>
            Eliminar avisos de copyright, marcas comerciales, o atribuciones
            de autoría.
          </LI>
          <LI>
            Sobrecargar el servicio con peticiones excesivas (DDoS,
            scraping agresivo).
          </LI>
          <LI>
            Crear productos derivados que compitan directamente con DEC
            usando nuestro catálogo.
          </LI>
        </UL>
      </LegalSection>

      <LegalSection number="06" title="Cuentas y suscripciones (futuro)">
        <P>
          Actualmente DEC es de acceso libre y gratuito. En el futuro
          ofreceremos:
        </P>
        <UL>
          <LI>
            <strong>Tier gratuito:</strong> acceso al catálogo, calculadoras
            básicas, anuncios.
          </LI>
          <LI>
            <strong>Tier de pago (DEC Pro):</strong> sin anuncios,
            funcionalidades avanzadas (historial, exportación, sync entre
            dispositivos, futuras integraciones).
          </LI>
        </UL>
        <P>Cuando estén disponibles, los términos específicos serán:</P>
        <UL>
          <LI>
            Las suscripciones se gestionan por App Store (iOS) y/o Stripe
            (web). El cobro y la cancelación están sujetos a las políticas
            del procesador.
          </LI>
          <LI>
            Las renovaciones son automáticas salvo cancelación con al menos
            24h de antelación al final del periodo en App Store.
          </LI>
          <LI>
            Período de prueba gratuito (free trial) si aplica: si no
            cancelas antes del final, se cobrará automáticamente.
          </LI>
          <LI>
            Reembolsos: gestionados por Apple (iOS) según sus políticas.
            Para web, evaluamos caso por caso.
          </LI>
          <LI>
            Aumentos de precio: notificados con al menos 30 días de
            antelación.
          </LI>
        </UL>
      </LegalSection>

      <LegalSection number="07" title="Propiedad intelectual">
        <P>
          El código fuente, diseño, calculadoras, curado de interacciones y
          textos originales de DEC son propiedad del Autor. Algunos
          contenidos integran datos públicos:
        </P>
        <UL>
          <LI>
            Datos farmacológicos (PubChem, OpenFDA, FDA labels): información
            de dominio público.
          </LI>
          <LI>
            Marcas comerciales (Adrenalina, Coumadin, etc.): pertenecen a
            sus respectivos titulares; se citan únicamente con fines
            informativos.
          </LI>
          <LI>
            Bibliografía citada: pertenece a sus respectivos editores.
          </LI>
        </UL>
        <P>
          Salvo lo expresamente permitido en estos términos, no se
          concede ningún derecho de uso comercial sobre el contenido.
        </P>
      </LegalSection>

      <LegalSection number="08" title="Contenido proporcionado por usuarios (futuro)">
        <P>
          Si en el futuro habilitamos comentarios, foros, contribuciones de
          casos clínicos o reportes de errores:
        </P>
        <UL>
          <LI>
            Conservas la propiedad intelectual de tu contenido, pero nos
            otorgas licencia mundial, no exclusiva, libre de regalías para
            mostrarlo en el Servicio.
          </LI>
          <LI>
            Eres responsable de no incluir datos identificables de pacientes,
            material protegido por copyright ajeno, ni contenido difamatorio.
          </LI>
          <LI>
            Podemos moderar, editar o eliminar contenido sin previo aviso.
          </LI>
        </UL>
      </LegalSection>

      <LegalSection number="09" title="Disponibilidad del servicio">
        <P>
          DEC se proporciona &quot;tal cual&quot; sin garantías de
          disponibilidad continua. Podemos:
        </P>
        <UL>
          <LI>
            Realizar mantenimientos programados o de emergencia que afecten
            la disponibilidad.
          </LI>
          <LI>Modificar, añadir o eliminar funcionalidades.</LI>
          <LI>Suspender el servicio temporal o definitivamente.</LI>
        </UL>
        <P>
          No nos responsabilizamos por pérdidas derivadas de
          indisponibilidad. Si tu práctica clínica depende críticamente de
          una herramienta, ten siempre alternativas (Lexicomp,
          calculadoras estándar, fichas técnicas en papel).
        </P>
        <P
          className="mono"
          style={{
            fontSize: "0.7rem",
            color: "var(--text-3)",
            opacity: 0.7,
          }}
        >
          // ningún servicio en línea es 100% disponible · ni nosotros, ni
          Google, ni tu hospital
        </P>
      </LegalSection>

      <LegalSection number="10" title="Limitación de responsabilidad">
        <P>
          En la máxima medida permitida por la ley, ni el Autor ni los
          colaboradores de DEC serán responsables de:
        </P>
        <UL>
          <LI>
            Daños indirectos, incidentales, punitivos, especiales o
            consecuentes.
          </LI>
          <LI>
            Pérdida de beneficios, datos, oportunidades o reputación.
          </LI>
          <LI>
            Eventos adversos en pacientes derivados del uso del Servicio.
          </LI>
          <LI>
            Errores u omisiones en datos farmacológicos, dosis o
            interacciones.
          </LI>
          <LI>
            Indisponibilidad, fallos técnicos o pérdida de cuenta.
          </LI>
        </UL>
        <P>
          Para detalles específicos sobre responsabilidad clínica, consulta
          el{" "}
          <a href="/legal/disclaimer" style={{ color: "var(--accent)" }}>
            Disclaimer médico
          </a>
          .
        </P>
        <P>
          Si la legislación aplicable no permite estas limitaciones, la
          responsabilidad total queda limitada al monto pagado por ti al
          Servicio en los 12 meses anteriores al evento, o 50 USD si no has
          pagado nada.
        </P>
      </LegalSection>

      <LegalSection number="11" title="Indemnización">
        <P>
          Aceptas indemnizar al Autor frente a reclamaciones de terceros
          derivadas de:
        </P>
        <UL>
          <LI>Tu incumplimiento de estos términos.</LI>
          <LI>
            El uso del Servicio fuera de su propósito declarado (apoyo a
            profesionales sanitarios).
          </LI>
          <LI>
            Decisiones clínicas tomadas con base parcial o total en
            información del Servicio.
          </LI>
        </UL>
      </LegalSection>

      <LegalSection number="12" title="Terminación">
        <P>
          Podemos suspender o terminar tu acceso al Servicio si infringes
          estos términos, sin perjuicio de otros derechos. Tras la
          terminación:
        </P>
        <UL>
          <LI>
            Tu acceso a funcionalidades de pago se interrumpe (sin reembolso
            del periodo restante en caso de terminación por incumplimiento).
          </LI>
          <LI>
            Tus datos personales se gestionan según la{" "}
            <a href="/legal/privacidad" style={{ color: "var(--accent)" }}>
              Política de privacidad
            </a>
            .
          </LI>
          <LI>
            Las disposiciones de IP, limitación de responsabilidad e
            indemnización sobreviven a la terminación.
          </LI>
        </UL>
      </LegalSection>

      <LegalSection number="13" title="Modificaciones a los términos">
        <P>
          Podemos modificar estos términos. Cuando los cambios sean
          materiales (por ejemplo, cambios en suscripciones, jurisdicción,
          o limitación de responsabilidad), notificaremos:
        </P>
        <UL>
          <LI>
            Banner visible en home del sitio durante al menos 14 días.
          </LI>
          <LI>Email a usuarios con cuenta (si existen).</LI>
          <LI>
            Versión actualizada con fecha de revisión al final de la página.
          </LI>
        </UL>
        <P>
          Si continúas usando el Servicio tras la entrada en vigor de los
          cambios, se considera que los aceptas. Si no estás de acuerdo, deja
          de usar el Servicio.
        </P>
      </LegalSection>

      <LegalSection number="14" title="Ley aplicable y jurisdicción">
        <P>
          Estos términos se rigen por las leyes de México y la Ciudad de
          México. Cualquier controversia se someterá a los tribunales
          competentes de la Ciudad de México, salvo lo que la ley imperativa
          de tu país de residencia establezca para consumidores.
        </P>
        <P>
          Para usuarios en la Unión Europea, las disposiciones de protección
          al consumidor del Reglamento (UE) 1215/2012 y normativa equivalente
          aplican como régimen mínimo.
        </P>
      </LegalSection>

      <LegalSection number="15" title="Disposiciones generales">
        <UL>
          <LI>
            <strong>Independencia de cláusulas:</strong> si alguna cláusula
            es declarada inválida, las demás permanecen en vigor.
          </LI>
          <LI>
            <strong>Acuerdo completo:</strong> estos términos, junto con el
            Disclaimer y Privacidad, constituyen el acuerdo completo entre
            las partes.
          </LI>
          <LI>
            <strong>Renuncia:</strong> el no ejercicio de un derecho no
            constituye renuncia al mismo.
          </LI>
          <LI>
            <strong>Cesión:</strong> tú no puedes ceder estos términos sin
            consentimiento escrito. El Autor sí puede cederlos en caso de
            cambio de titularidad del proyecto, notificándotelo.
          </LI>
        </UL>
      </LegalSection>

      <LegalSection number="16" title="Contacto">
        <P>
          Para cualquier consulta sobre estos términos:
          <br />
          <a
            href="mailto:legal@decanestesia.com"
            style={{ color: "var(--accent)" }}
          >
            legal@decanestesia.com
          </a>
        </P>
      </LegalSection>

      <LastUpdated date="mayo de 2026" />
      <ContactBox />
      <LegalCrossLinks current="terminos" />
    </>
  );
}
