// src/app/legal/terminos/page.tsx
//
// Términos y Condiciones de DEC Anestesia.
// Compliance: RD primaria, USA, UE, México, Latam, Apple App Store, Lemon Squeezy.
// Tono: profesional, conservador, sin humor negro en cláusulas legales.

import { LegalShell, LegalSection, Callout } from "../_components/LegalShell";

export const metadata = {
  title: "Términos y Condiciones — DEC Anestesia",
  description:
    "Términos y condiciones de uso de DEC, plataforma clínica para profesionales de la anestesiología.",
};

const toc = [
  { id: "aceptacion", label: "1. Aceptación" },
  { id: "definiciones", label: "2. Definiciones" },
  { id: "elegibilidad", label: "3. Elegibilidad y registro" },
  { id: "servicio", label: "4. Descripción del servicio" },
  { id: "uso-permitido", label: "5. Uso permitido y prohibido" },
  { id: "suscripciones", label: "6. Suscripciones y pagos" },
  { id: "cancelacion", label: "7. Cancelación y reembolsos" },
  { id: "cupones", label: "8. Cupones y descuentos" },
  { id: "propiedad", label: "9. Propiedad intelectual" },
  { id: "disclaimer", label: "10. Aviso médico" },
  { id: "limitacion", label: "11. Limitación de responsabilidad" },
  { id: "indemnizacion", label: "12. Indemnización" },
  { id: "modificaciones", label: "13. Modificaciones" },
  { id: "terminacion", label: "14. Terminación" },
  { id: "jurisdiccion", label: "15. Ley aplicable y jurisdicción" },
  { id: "consumidores", label: "16. Derechos del consumidor" },
  { id: "contacto", label: "17. Contacto" },
];

export default function TerminosPage() {
  return (
    <LegalShell
      eyebrow="Documento legal"
      title="Términos y Condiciones"
      subtitle="Contrato entre tú y DEC Anestesia. Léelos con la misma atención que dedicarías a una valoración preanestésica."
      effectiveDate="12 de mayo de 2026"
      version="1.0"
      toc={toc}
      relatedPages={[
        { href: "/legal/privacidad", label: "Política de Privacidad" },
        { href: "/legal/cookies", label: "Política de Cookies" },
        { href: "/legal/aviso-medico", label: "Aviso Médico" },
      ]}
    >
      <Callout variant="info" label="Resumen no vinculante">
        DEC es una herramienta clínica de referencia para profesionales de la
        anestesiología. Al registrarte, aceptas estos términos. DEC{" "}
        <strong>no reemplaza el criterio clínico</strong>. Las suscripciones
        web tienen reembolso de 14 días; las de lifetime, 30 días. En iOS los
        reembolsos los gestiona Apple. Tu jurisdicción primaria es{" "}
        <strong>República Dominicana</strong>, pero respetamos derechos
        imperativos del consumidor en tu país de residencia.
      </Callout>

      <LegalSection id="aceptacion" number="1" title="Aceptación de los términos">
        <p>
          Al crear una cuenta en DEC, descargar la aplicación móvil de DEC, o
          acceder a cualquiera de los servicios ofrecidos en{" "}
          <a href="https://decanestesia.com">decanestesia.com</a>, manifiestas
          que has leído, comprendido y aceptado estos Términos y Condiciones
          en su totalidad, así como nuestra{" "}
          <a href="/legal/privacidad">Política de Privacidad</a>, nuestra{" "}
          <a href="/legal/cookies">Política de Cookies</a> y nuestro{" "}
          <a href="/legal/aviso-medico">Aviso Médico</a>.
        </p>
        <p>
          Si no estás de acuerdo con cualquier parte de estos términos, no
          debes registrarte, suscribirte ni utilizar DEC.
        </p>
      </LegalSection>

      <LegalSection id="definiciones" number="2" title="Definiciones">
        <ul>
          <li>
            <strong>"DEC"</strong>, <strong>"nosotros"</strong>, <strong>"nuestro"</strong>:
            se refiere al servicio DEC (Diluciones, Dosis &amp; Cálculos Anestésicos)
            operado por el Dr. Jophiel Espaillat Caldentey desde la República Dominicana.
          </li>
          <li>
            <strong>"Usuario"</strong>, <strong>"tú"</strong>: persona física
            que crea una cuenta y/o utiliza DEC.
          </li>
          <li>
            <strong>"Servicios"</strong>: la aplicación web en{" "}
            <code>decanestesia.com</code>, la aplicación iOS, y cualquier
            funcionalidad asociada.
          </li>
          <li>
            <strong>"Contenido"</strong>: toda la información publicada en DEC
            (fichas farmacológicas, calculadoras, textos, imágenes, código).
          </li>
          <li>
            <strong>"Suscripción"</strong>: acceso pagado a funcionalidades
            premium ("Pro") de DEC.
          </li>
          <li>
            <strong>"Cupón"</strong>: código alfanumérico que otorga acceso
            gratuito o descuento.
          </li>
          <li>
            <strong>"Procesador de Pagos"</strong>: en web, Lemon Squeezy
            (actuando como Merchant of Record); en iOS, Apple Inc. a través
            de App Store y StoreKit.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="elegibilidad" number="3" title="Elegibilidad y registro">
        <h3>3.1. Audiencia</h3>
        <p>
          DEC está dirigido a <strong>profesionales de la salud</strong> con
          formación en farmacología clínica y manejo perioperatorio, incluyendo
          médicos especialistas, residentes y estudiantes de ciencias de la
          salud bajo supervisión académica.
        </p>

        <h3>3.2. Edad mínima</h3>
        <p>
          Para registrarte debes tener al menos <strong>16 años</strong> en la
          Unión Europea, o <strong>13 años</strong> en Estados Unidos y
          otras jurisdicciones, según corresponda a la normativa local de
          protección de menores (GDPR, COPPA). En todos los casos, si eres
          menor de edad debes contar con consentimiento de tu representante
          legal y supervisión académica si vas a utilizar contenido clínico.
        </p>

        <h3>3.3. Cuenta</h3>
        <p>
          Eres responsable de mantener la confidencialidad de tus credenciales
          de acceso. Notifícanos de inmediato cualquier acceso no autorizado a{" "}
          <a href="mailto:soporte@decanestesia.com">soporte@decanestesia.com</a>.
          Una cuenta es personal e intransferible.
        </p>

        <h3>3.4. Información veraz</h3>
        <p>
          Te comprometes a proporcionar información veraz al registrarte. DEC
          puede suspender cuentas con información falsa o suplantación de
          identidad.
        </p>
      </LegalSection>

      <LegalSection id="servicio" number="4" title="Descripción del servicio">
        <p>DEC ofrece:</p>
        <ul>
          <li>Catálogo consultable de fármacos con farmacología clínica.</li>
          <li>Calculadoras clínicas (infusión, dilución, dosis pediátrica, etc.).</li>
          <li>Verificador de interacciones farmacológicas.</li>
          <li>Información de marcas comerciales en diferentes mercados.</li>
          <li>Sincronización opcional entre dispositivos vía cuenta.</li>
          <li>Acceso a funcionalidades premium mediante suscripción Pro.</li>
        </ul>
        <p>
          DEC se ofrece <strong>"tal cual" ("AS IS")</strong> y{" "}
          <strong>"según disponibilidad" ("AS AVAILABLE")</strong>. Podemos
          modificar, suspender o discontinuar funcionalidades en cualquier
          momento, informando con razonable antelación cuando sea posible.
        </p>
      </LegalSection>

      <LegalSection id="uso-permitido" number="5" title="Uso permitido y prohibido">
        <h3>5.1. Uso permitido</h3>
        <p>
          Puedes utilizar DEC para fines profesionales y educativos en tu
          práctica clínica, dentro de los límites de tu licencia profesional
          y la legislación aplicable.
        </p>

        <h3>5.2. Conductas prohibidas</h3>
        <p>Está prohibido:</p>
        <ul>
          <li>Utilizar DEC para fines ilícitos o que infrinjan derechos de terceros.</li>
          <li>
            Realizar ingeniería inversa, descompilar, scrapear masivamente o
            extraer contenido de DEC con fines comerciales.
          </li>
          <li>
            Reproducir, redistribuir o reutilizar el contenido de DEC sin
            autorización escrita previa.
          </li>
          <li>
            Compartir credenciales de acceso o usar una cuenta para múltiples
            personas.
          </li>
          <li>
            Eludir mecanismos técnicos de protección, verificación de suscripción
            o limitaciones del servicio gratuito.
          </li>
          <li>
            Introducir malware, realizar ataques de denegación de servicio o
            comprometer la seguridad de DEC.
          </li>
          <li>
            Usar DEC para tomar decisiones clínicas en pacientes específicos
            sin verificación independiente. Ver{" "}
            <a href="/legal/aviso-medico">Aviso Médico</a>.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="suscripciones" number="6" title="Suscripciones y pagos">
        <h3>6.1. Tiers disponibles</h3>
        <p>DEC ofrece los siguientes niveles de acceso:</p>
        <table>
          <thead>
            <tr>
              <th>Tier</th>
              <th>Precio lanzamiento</th>
              <th>Periodicidad</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Free (con publicidad)</td>
              <td>USD 0</td>
              <td>Permanente</td>
            </tr>
            <tr>
              <td>Pro Mensual</td>
              <td>USD 2.99</td>
              <td>Renovación mensual</td>
            </tr>
            <tr>
              <td>Pro Anual</td>
              <td>USD 19.99</td>
              <td>Renovación anual</td>
            </tr>
            <tr>
              <td>Pro Lifetime</td>
              <td>USD 49.99</td>
              <td>Pago único</td>
            </tr>
            <tr>
              <td>Pro Estudiante</td>
              <td>USD 0 (vía cupón)</td>
              <td>Anual renovable mediante código</td>
            </tr>
          </tbody>
        </table>
        <p>
          Los precios pueden modificarse en el futuro. Los suscriptores con
          renovación automática serán notificados con al menos{" "}
          <strong>30 días de antelación</strong> antes de aplicar un cambio
          de precio.
        </p>

        <h3>6.2. Procesador de pagos web</h3>
        <p>
          Las suscripciones contratadas en{" "}
          <a href="https://decanestesia.com">decanestesia.com</a> son procesadas
          por <strong>Lemon Squeezy</strong> (entidad ahora parte de Stripe),
          que actúa como <strong>Merchant of Record (MoR)</strong>. Lemon Squeezy
          gestiona el cobro, los impuestos aplicables (IVA, sales tax, etc.) y
          la facturación. Tus datos de pago son procesados directamente por
          Lemon Squeezy bajo sus propios términos y política de privacidad.
        </p>

        <h3>6.3. Procesador de pagos iOS</h3>
        <p>
          Las suscripciones contratadas dentro de la aplicación iOS son
          procesadas por <strong>Apple Inc.</strong> mediante StoreKit y App
          Store. Apple aplica sus propias condiciones, impuestos y comisiones.
          La gestión de tu suscripción iOS (cancelación, reembolso, cambio de
          plan) se realiza desde la configuración de tu Apple ID:{" "}
          <code>Ajustes → [tu nombre] → Suscripciones</code>.
        </p>

        <h3>6.4. Renovación automática</h3>
        <p>
          Las suscripciones mensuales y anuales se renuevan automáticamente al
          final de cada período, cargando el precio vigente al método de pago
          registrado, salvo que canceles antes de que termine el período actual.
        </p>

        <h3>6.5. Periodo de prueba (trial)</h3>
        <p>
          DEC puede ofrecer un periodo de prueba gratuito de <strong>7 días</strong>{" "}
          al primer suscriptor en planes mensual y anual. El plan lifetime nunca
          incluye trial. Si no cancelas antes de finalizar el trial, se aplicará
          el cobro completo del periodo seleccionado.
        </p>

        <h3>6.6. Impuestos</h3>
        <p>
          Los precios mostrados pueden estar sujetos a impuestos según tu país
          de residencia. Cuando aplique, el procesador de pagos (Lemon Squeezy
          o Apple) calculará y cobrará los impuestos correspondientes (VAT
          europeo, IVA mexicano, sales tax estadounidense, etc.) y los remitirá
          a las autoridades fiscales pertinentes.
        </p>
      </LegalSection>

      <LegalSection id="cancelacion" number="7" title="Cancelación y reembolsos">
        <h3>7.1. Cancelación</h3>
        <p>
          Puedes cancelar tu suscripción en cualquier momento:
        </p>
        <ul>
          <li>
            <strong>Web</strong>: desde tu cuenta en{" "}
            <code>decanestesia.com/account/billing</code>, o desde el portal del
            cliente de Lemon Squeezy enlazado en el correo de confirmación.
          </li>
          <li>
            <strong>iOS</strong>: desde la configuración de tu Apple ID
            (Ajustes → [tu nombre] → Suscripciones).
          </li>
        </ul>
        <p>
          La cancelación detiene la renovación automática. Conservas el acceso
          a las funcionalidades Pro hasta el final del periodo ya pagado.
        </p>

        <h3>7.2. Reembolsos web</h3>
        <p>
          Para suscripciones contratadas en la web (procesadas por Lemon Squeezy):
        </p>
        <ul>
          <li>
            <strong>Suscripciones mensuales y anuales</strong>: reembolso
            completo dentro de <strong>14 días naturales</strong> desde la
            primera compra, sin necesidad de justificación.
          </li>
          <li>
            <strong>Suscripciones lifetime</strong>: reembolso completo dentro
            de <strong>30 días naturales</strong> desde la compra.
          </li>
          <li>
            Pasados estos plazos, las renovaciones automáticas no son
            reembolsables salvo error técnico atribuible a DEC.
          </li>
        </ul>
        <p>
          Solicita el reembolso enviando un email a{" "}
          <a href="mailto:soporte@decanestesia.com">soporte@decanestesia.com</a>{" "}
          con el correo de confirmación de tu compra. El reembolso se procesa
          en 5–10 días hábiles a través del método de pago original.
        </p>

        <h3>7.3. Reembolsos iOS</h3>
        <p>
          Las compras realizadas en la aplicación iOS son gestionadas
          exclusivamente por Apple. Para solicitar reembolso, acude a{" "}
          <a href="https://reportaproblem.apple.com" target="_blank" rel="noopener noreferrer">
            reportaproblem.apple.com
          </a>{" "}
          conforme a las políticas de Apple. DEC no puede emitir reembolsos
          de compras iOS directamente.
        </p>

        <h3>7.4. Derechos imperativos del consumidor</h3>
        <Callout variant="info" label="Consumidores en la UE">
          Si resides en la Unión Europea, conservas tu derecho de desistimiento
          de 14 días bajo la Directiva 2011/83/UE, salvo que hayas comenzado a
          utilizar contenido digital con tu consentimiento expreso, en cuyo
          caso renuncias al derecho de desistimiento conforme al art. 16(m) de
          la Directiva. Las políticas de reembolso voluntarias de DEC (14 y 30
          días) operan en paralelo y son compatibles con estos derechos.
        </Callout>
        <Callout variant="info" label="Consumidores en RD">
          En República Dominicana, conservas los derechos previstos en la Ley
          General de Protección de los Derechos del Consumidor o Usuario
          (Ley 358-05), incluyendo el derecho a información clara y a la
          devolución de productos defectuosos.
        </Callout>
      </LegalSection>

      <LegalSection id="cupones" number="8" title="Cupones y descuentos">
        <p>DEC opera tres tipos de códigos:</p>
        <ul>
          <li>
            <strong>Códigos de acceso gratis (comp codes) — Tipo 1 y 2</strong>:
            otorgan acceso completo a un tier Pro durante un periodo determinado
            (12 meses para estudiantes, lifetime para VIP). Son personales e
            intransferibles. La elegibilidad la determina exclusivamente el
            equipo DEC.
          </li>
          <li>
            <strong>Códigos de descuento (discount codes) — Tipo 3</strong>:
            reducen el precio de una suscripción comprable. Aplican a uno o
            varios tiers según se configure cada código.
          </li>
        </ul>
        <p>
          Todos los códigos tienen <strong>vigencia limitada</strong> (por
          defecto, 10 días desde la emisión salvo configuración explícita) y
          un número máximo de usos. Una vez canjeado, el código no puede ser
          revertido. DEC se reserva el derecho de invalidar códigos en caso
          de abuso, fraude o transferencia no autorizada.
        </p>
        <p>
          El acceso Pro Estudiante puede renovarse anualmente solicitándolo a{" "}
          <a href="mailto:soporte@decanestesia.com">soporte@decanestesia.com</a>{" "}
          mientras mantengas tu estatus de estudiante de ciencias de la salud.
        </p>
      </LegalSection>

      <LegalSection id="propiedad" number="9" title="Propiedad intelectual">
        <h3>9.1. Titularidad</h3>
        <p>
          Todo el contenido de DEC (textos originales, código, diseño, marca,
          base de datos compilada) es propiedad del Dr. Jophiel Espaillat
          Caldentey y/o sus licenciantes. Se protege bajo la legislación de
          propiedad intelectual aplicable, incluyendo la Ley 65-00 sobre
          Derecho de Autor de la República Dominicana y tratados internacionales
          (Berna, TRIPS, OMPI).
        </p>

        <h3>9.2. Licencia limitada al usuario</h3>
        <p>
          DEC te otorga una licencia <strong>limitada, personal, no exclusiva,
          intransferible y revocable</strong> para usar la aplicación y su
          contenido para tu práctica profesional individual. Esta licencia no
          implica transferencia de propiedad.
        </p>

        <h3>9.3. Contenido de terceros</h3>
        <p>
          DEC referencia y cita fuentes médicas de terceros (UpToDate, Stoelting,
          Miller, Trissel's Handbook, etiquetas FDA, ficha técnica de la EMA, etc.).
          Tales referencias son meramente educativas y no implican afiliación,
          patrocinio ni respaldo. Los derechos sobre dichas obras pertenecen
          a sus respectivos titulares. Los nombres comerciales de medicamentos
          son marcas de sus fabricantes.
        </p>

        <h3>9.4. Reportes de infracción (DMCA y equivalentes)</h3>
        <p>
          Si consideras que DEC contiene material que infringe tu propiedad
          intelectual, envía una notificación detallada (identificando la obra
          infringida, el contenido específico en DEC, tu identidad y una
          declaración de buena fe) a{" "}
          <a href="mailto:legal@decanestesia.com">legal@decanestesia.com</a>.
        </p>
      </LegalSection>

      <LegalSection id="disclaimer" number="10" title="Aviso médico">
        <Callout variant="medical" label="Cláusula esencial">
          DEC es una herramienta de referencia. <strong>NO reemplaza el
          criterio clínico</strong>. El uso de DEC para decisiones sobre
          pacientes reales requiere verificación independiente y es responsabilidad
          exclusiva del profesional usuario.
        </Callout>
        <p>
          Esta cláusula es un resumen. El{" "}
          <strong><a href="/legal/aviso-medico">Aviso Médico</a></strong>{" "}
          completo forma parte integral de estos Términos y debe leerse
          junto con ellos. En caso de conflicto, prevalece la versión más
          protectora del usuario consumidor cuando sea legalmente exigible.
        </p>
      </LegalSection>

      <LegalSection id="limitacion" number="11" title="Limitación de responsabilidad">
        <p>
          <strong>Hasta el máximo permitido por la ley aplicable</strong>, DEC,
          su creador, desarrolladores, empleados, contratistas y afiliados no
          serán responsables de:
        </p>
        <ul>
          <li>
            Daños directos, indirectos, incidentales, especiales, consecuentes
            o punitivos, incluyendo pero no limitándose a: lucro cesante, pérdida
            de datos, daño reputacional, sanciones disciplinarias o profesionales.
          </li>
          <li>
            Errores u omisiones en el contenido farmacológico, incluyendo dosis,
            interacciones, contraindicaciones, advertencias, datos de embarazo
            o lactancia.
          </li>
          <li>
            Decisiones clínicas adoptadas con base —total o parcial— en la
            información proporcionada por DEC.
          </li>
          <li>
            Interrupciones del servicio, pérdida de acceso temporal o permanente
            a la aplicación.
          </li>
          <li>
            Actos u omisiones de procesadores de pagos, proveedores de
            infraestructura (Supabase, Vercel) o terceros referenciados.
          </li>
        </ul>
        <p>
          La responsabilidad total acumulada de DEC frente al usuario, por
          cualquier reclamación, está limitada a la cantidad efectivamente
          pagada por el usuario a DEC en los <strong>12 meses previos</strong>{" "}
          al evento que originó la reclamación, o USD 50, lo que sea mayor.
        </p>
        <Callout variant="warning" label="Jurisdicciones que no admiten limitación total">
          Algunas jurisdicciones no permiten la exclusión completa de ciertos
          tipos de daños (negligencia grave, dolo, daños personales). En esos
          casos, las limitaciones anteriores aplicarán hasta el máximo permitido
          por la ley local, sin afectar derechos imperativos del usuario.
        </Callout>
      </LegalSection>

      <LegalSection id="indemnizacion" number="12" title="Indemnización">
        <p>
          Aceptas indemnizar y mantener indemne a DEC, su creador y colaboradores
          frente a cualquier reclamación, demanda, pérdida o gasto (incluyendo
          honorarios de abogados razonables) derivado de:
        </p>
        <ul>
          <li>Tu uso indebido de DEC.</li>
          <li>Tu violación de estos Términos.</li>
          <li>Tu violación de derechos de terceros.</li>
          <li>Tu violación de la legislación aplicable.</li>
          <li>
            Tu negligencia profesional o impericia en el ejercicio de la práctica
            médica.
          </li>
        </ul>
        <p>
          Esta obligación de indemnización sobrevive a la terminación de tu
          cuenta y a la cesación de uso de DEC.
        </p>
      </LegalSection>

      <LegalSection id="modificaciones" number="13" title="Modificaciones de los Términos">
        <p>
          DEC puede modificar estos Términos en cualquier momento. Los cambios
          materiales se comunicarán mediante:
        </p>
        <ul>
          <li>Email a la dirección registrada (con al menos 30 días de antelación cuando sea legalmente exigible).</li>
          <li>Notificación dentro de la aplicación.</li>
          <li>Aviso destacado en{" "}
            <a href="https://decanestesia.com">decanestesia.com</a>.
          </li>
        </ul>
        <p>
          El uso continuado de DEC tras la entrada en vigor de los nuevos términos
          constituye aceptación. Si no estás de acuerdo, debes cancelar tu suscripción
          y dejar de usar DEC antes de la fecha de vigencia.
        </p>
      </LegalSection>

      <LegalSection id="terminacion" number="14" title="Terminación">
        <h3>14.1. Por parte del usuario</h3>
        <p>
          Puedes terminar tu cuenta en cualquier momento desde la sección "Mi
          cuenta" o solicitándolo a{" "}
          <a href="mailto:soporte@decanestesia.com">soporte@decanestesia.com</a>.
          La cancelación de suscripciones se rige por la cláusula 7.
        </p>

        <h3>14.2. Por parte de DEC</h3>
        <p>
          DEC puede suspender o terminar tu cuenta con causa justificada, incluyendo:
        </p>
        <ul>
          <li>Violación de estos Términos.</li>
          <li>Uso fraudulento de cupones o métodos de pago.</li>
          <li>Conducta abusiva contra el equipo o la comunidad de DEC.</li>
          <li>Requerimiento legal de autoridad competente.</li>
          <li>Imposibilidad técnica o económica de seguir prestando el servicio.</li>
        </ul>
        <p>
          En caso de terminación por DEC sin causa, te reembolsaremos
          proporcionalmente el tiempo no utilizado de tu suscripción vigente.
        </p>

        <h3>14.3. Efectos de la terminación</h3>
        <p>
          Tras la terminación: pierdes acceso a las funcionalidades Pro y a tu
          historial personalizado (favoritos, ajustes). Los datos asociados se
          eliminan conforme a la{" "}
          <a href="/legal/privacidad">Política de Privacidad</a>. Las cláusulas
          de propiedad intelectual, limitación de responsabilidad,
          indemnización y jurisdicción sobreviven a la terminación.
        </p>
      </LegalSection>

      <LegalSection id="jurisdiccion" number="15" title="Ley aplicable y jurisdicción">
        <p>
          Estos Términos se rigen por las leyes de la <strong>República
          Dominicana</strong>, en particular:
        </p>
        <ul>
          <li>Constitución Política de la República Dominicana.</li>
          <li>Ley 53-07 sobre Crímenes y Delitos de Alta Tecnología.</li>
          <li>Ley 65-00 sobre Derecho de Autor.</li>
          <li>Ley 358-05 General de Protección de los Derechos del Consumidor o Usuario.</li>
          <li>Ley 172-13 sobre Protección Integral de los Datos Personales.</li>
        </ul>
        <p>
          Las controversias derivadas de estos Términos se someterán a los
          tribunales competentes de la ciudad de Santo Domingo, Distrito
          Nacional, República Dominicana, sin perjuicio de las normas
          imperativas que protejan al consumidor en su país de residencia
          habitual.
        </p>
        <Callout variant="info" label="Cláusula compromisoria">
          Antes de iniciar acción judicial, las partes intentarán resolver
          cualquier disputa de buena fe mediante negociación directa por un
          plazo no inferior a 30 días. Si no se alcanza acuerdo, podrán recurrir
          a mediación voluntaria o a los tribunales competentes.
        </Callout>
      </LegalSection>

      <LegalSection id="consumidores" number="16" title="Derechos del consumidor según jurisdicción">
        <p>
          Independientemente de la cláusula 15, respetamos los derechos
          imperativos del consumidor según tu jurisdicción de residencia:
        </p>

        <h4>Unión Europea y Reino Unido</h4>
        <p>
          Aplica la Directiva 2011/83/UE sobre derechos del consumidor, el
          Reglamento (UE) 2016/679 (GDPR) y la legislación nacional de
          transposición. Conservas el derecho de desistimiento de 14 días en
          los términos descritos en la cláusula 7.4.
        </p>

        <h4>Estados Unidos</h4>
        <p>
          Aplican las leyes federales y estatales pertinentes, incluyendo
          consumer protection acts estatales, la CCPA/CPRA en California, y
          equivalentes en otros estados. Para usuarios californianos, ver{" "}
          <a href="/legal/privacidad">Política de Privacidad</a>, sección "Do
          Not Sell My Personal Information".
        </p>

        <h4>México</h4>
        <p>
          Aplican la Ley Federal de Protección al Consumidor y la Ley Federal
          de Protección de Datos Personales en Posesión de los Particulares
          (LFPDPPP). Profeco es la autoridad competente para denuncias de
          consumo.
        </p>

        <h4>Otros países latinoamericanos</h4>
        <p>
          Aplica la legislación local de protección al consumidor y datos
          personales (LGPD en Brasil, Habeas Data en Colombia, etc.). DEC
          respeta los mínimos imperativos de cada jurisdicción.
        </p>
      </LegalSection>

      <LegalSection id="contacto" number="17" title="Contacto">
        <p>Para asuntos relativos a estos Términos:</p>
        <ul>
          <li>
            Soporte general:{" "}
            <a href="mailto:soporte@decanestesia.com">soporte@decanestesia.com</a>
          </li>
          <li>
            Asuntos legales:{" "}
            <a href="mailto:legal@decanestesia.com">legal@decanestesia.com</a>
          </li>
          <li>
            Privacidad y datos personales:{" "}
            <a href="mailto:privacidad@decanestesia.com">privacidad@decanestesia.com</a>
          </li>
          <li>
            Reporte de errores:{" "}
            <a href="mailto:errores@decanestesia.com">errores@decanestesia.com</a>
          </li>
        </ul>
        <p>
          <strong>Responsable</strong>: Dr. Jophiel Espaillat Caldentey,
          República Dominicana.
        </p>
      </LegalSection>

      <div className="legal-page-footer">
        <p>
          Estos Términos constituyen el acuerdo completo entre DEC y el usuario
          en relación con el uso del servicio. Si alguna cláusula resulta
          inválida o inexigible, las demás conservan plena vigencia.
        </p>
        <p>
          // los términos son aburridos, pero es lo que separa una app de un servicio.<br />
          // el mejor momento de revisar los términos es antes de cobrar dinero.<br />
          // el segundo mejor momento es antes de que te demanden.
        </p>
      </div>
    </LegalShell>
  );
}
