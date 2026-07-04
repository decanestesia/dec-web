// src/app/legal/privacidad/page.tsx
//
// Política de Privacidad de DEC Anestesia.
// Compliance: GDPR (EU), CCPA/CPRA (California), LFPDPPP (México), Ley 172-13 (RD),
// LGPD (Brasil), Apple App Privacy.

import { LegalShell, LegalSection, Callout } from "../_components/LegalShell";

export const metadata = {
  title: "Política de Privacidad — DEC Anestesia",
  description:
    "Cómo DEC recolecta, usa, comparte y protege tus datos personales.",
};

const toc = [
  { id: "responsable", label: "1. Responsable del tratamiento" },
  { id: "datos-recolectados", label: "2. Datos que recolectamos" },
  { id: "finalidades", label: "3. Finalidades del tratamiento" },
  { id: "base-legal", label: "4. Base legal" },
  { id: "compartir", label: "5. Con quién compartimos datos" },
  { id: "internacional", label: "6. Transferencias internacionales" },
  { id: "retencion", label: "7. Plazos de conservación" },
  { id: "seguridad", label: "8. Medidas de seguridad" },
  { id: "derechos", label: "9. Tus derechos" },
  { id: "ejercer", label: "10. Cómo ejercer tus derechos" },
  { id: "menores", label: "11. Menores de edad" },
  { id: "cookies", label: "12. Cookies y tecnologías similares" },
  { id: "gdpr", label: "13. Usuarios en la Unión Europea" },
  { id: "ccpa", label: "14. Usuarios en California" },
  { id: "lfpdppp", label: "15. Usuarios en México" },
  { id: "rd", label: "16. Usuarios en República Dominicana" },
  { id: "cambios", label: "17. Cambios en esta política" },
  { id: "contacto", label: "18. Contacto" },
];

export default function PrivacidadPage() {
  return (
    <LegalShell
      eyebrow="Documento legal"
      title="Política de Privacidad"
      subtitle="Cómo recolectamos, usamos, compartimos y protegemos tus datos personales. Cumple GDPR, CCPA, LFPDPPP y Ley 172-13 RD."
      effectiveDate="12 de mayo de 2026"
      version="1.0"
      toc={toc}
      relatedPages={[
        { href: "/legal/terminos", label: "Términos y Condiciones" },
        { href: "/legal/cookies", label: "Política de Cookies" },
        { href: "/legal/aviso-medico", label: "Aviso Médico" },
      ]}
    >
      <Callout variant="info" label="Resumen no vinculante">
        DEC recolecta los datos mínimos necesarios para funcionar: email,
        nombre opcional, identificador interno y estado de suscripción.{" "}
        <strong>No vendemos tus datos a terceros</strong>. Compartimos datos
        únicamente con proveedores que ejecutan servicios esenciales (Supabase,
        Lemon Squeezy, Apple, Google). Tienes derecho a acceder, rectificar y
        eliminar tu información en cualquier momento escribiendo a{" "}
        <a href="mailto:privacidad@decanestesia.com">privacidad@decanestesia.com</a>.
      </Callout>

      <LegalSection id="responsable" number="1" title="Responsable del tratamiento">
        <p>
          El responsable del tratamiento de tus datos personales es:
        </p>
        <ul>
          <li>
            <strong>Nombre</strong>: Dr. Jophiel Espaillat Caldentey
          </li>
          <li>
            <strong>Operación</strong>: DEC (Diluciones, Dosis &amp; Cálculos Anestésicos)
          </li>
          <li>
            <strong>Jurisdicción</strong>: República Dominicana
          </li>
          <li>
            <strong>Contacto de privacidad</strong>:{" "}
            <a href="mailto:privacidad@decanestesia.com">privacidad@decanestesia.com</a>
          </li>
        </ul>
        <p>
          DEC no cuenta con un Delegado de Protección de Datos (DPO) designado
          formalmente, dado que su tratamiento de datos no alcanza los umbrales
          que lo exigen bajo GDPR (Art. 37). Para asuntos de privacidad, el
          punto de contacto único es la dirección indicada.
        </p>
      </LegalSection>

      <LegalSection id="datos-recolectados" number="2" title="Datos que recolectamos">
        <h3>2.1. Datos que tú nos proporcionas</h3>
        <table>
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Datos</th>
              <th>Momento de recolección</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Identidad</td>
              <td>Email, nombre (opcional)</td>
              <td>Al registrarte</td>
            </tr>
            <tr>
              <td>Credenciales</td>
              <td>Contraseña (hasheada, nunca almacenada en texto plano)</td>
              <td>Al crear cuenta con email/password</td>
            </tr>
            <tr>
              <td>Cuenta OAuth</td>
              <td>Identificador de proveedor (Google, Apple), email, nombre y foto si los compartes</td>
              <td>Al usar Sign in with Google / Apple</td>
            </tr>
            <tr>
              <td>Preferencias</td>
              <td>Tema (claro/oscuro), idioma, país declarado</td>
              <td>Durante el uso</td>
            </tr>
            <tr>
              <td>Comunicaciones</td>
              <td>Contenido de correos enviados a nuestros buzones</td>
              <td>Cuando nos contactas</td>
            </tr>
            <tr>
              <td>Datos de paciente (local)</td>
              <td>Etiqueta/nombre, expediente, edad, peso, alergias, medicación, comorbilidades</td>
              <td>Al usar Valoración/calculadoras — no sale del dispositivo</td>
            </tr>
          </tbody>
        </table>

        <h3>2.2. Datos derivados del uso</h3>
        <table>
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Datos</th>
              <th>Propósito</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Identificador interno</td>
              <td>UUID generado por Supabase</td>
              <td>Identificar tu sesión</td>
            </tr>
            <tr>
              <td>Suscripción</td>
              <td>Tier activo, fechas, estado, IDs de transacción de Lemon Squeezy y Apple</td>
              <td>Gestionar acceso Pro</td>
            </tr>
            <tr>
              <td>Sesiones</td>
              <td>Tokens JWT temporales (almacenados en cookies seguras)</td>
              <td>Mantener tu sesión iniciada</td>
            </tr>
            <tr>
              <td>Diagnóstico técnico (cuando aplique)</td>
              <td>Reportes de fallos anonimizados</td>
              <td>Mejorar estabilidad de la app</td>
            </tr>
            <tr>
              <td>Uso agregado (cuando aplique)</td>
              <td>Eventos sin identificador personal (qué fármaco más visto, qué calculadora más usada)</td>
              <td>Mejorar el producto</td>
            </tr>
          </tbody>
        </table>

        <h3>2.3. Datos que NO recolectamos</h3>
        <p>DEC <strong>no recolecta</strong>:</p>
        <ul>
          <li>
            <strong>Datos de pacientes que introduces en las herramientas
            clínicas</strong> (incluida la Valoración preanestésica, las
            calculadoras y el modo quirófano): etiqueta o nombre, número de
            expediente, edad, peso, talla, sexo, alergias, medicación,
            comorbilidades, diagnósticos y resultados de escalas de riesgo.{" "}
            <strong>DEC no recibe, transmite ni almacena estos datos en sus
            servidores.</strong> Se guardan únicamente en el almacenamiento
            local (localStorage) del navegador de tu dispositivo y permanecen
            bajo tu control exclusivo.
          </li>
          <li>Tu ubicación GPS precisa.</li>
          <li>Tu agenda, contactos o historial de navegación.</li>
          <li>Acceso a tu cámara, micrófono o sensores del dispositivo.</li>
          <li>Datos sensibles tipo "categorías especiales" del GDPR (salud, orientación sexual, religión, etc.) salvo el email/nombre que tú voluntariamente proporciones.</li>
          <li>Tu IDFA (Apple Identifier for Advertisers) salvo que actives publicidad personalizada y otorgues consentimiento ATT (no aplica hoy; aplicará si en el futuro incorporamos publicidad).</li>
        </ul>

        {/* [REVISIÓN DE ABOGADO] rol data-controller/processor bajo GDPR Art.4/28, Ley 172-13, LFPDPPP — validar con abogado de protección de datos */}
        <Callout variant="medical" label="Datos de pacientes: tú eres el responsable del tratamiento">
          DEC no es un sistema de historia clínica ni un encargado del
          tratamiento de los datos de tus pacientes. Cuando introduces datos
          identificables de un paciente en DEC (por ejemplo, en la Valoración
          preanestésica), actúas como responsable del tratamiento de esos datos
          frente a tu paciente y frente a las autoridades sanitarias y de
          protección de datos de tu jurisdicción. A ti te corresponde: (a)
          contar con base legal o consentimiento para tratarlos, (b) cumplir tu
          deber de secreto profesional y la normativa sanitaria y de protección
          de datos aplicable, y (c) custodiar el dispositivo. DEC no puede
          acceder a estos datos, no los ve, no los respalda ni puede recuperarlos
          si los pierdes.
        </Callout>

        <h3>2.4. Exportación de datos de paciente</h3>
        <p>
          Las funciones de exportar (JSON), importar y generar PDF de la hoja de
          valoración mueven los datos del paciente fuera del almacenamiento local
          del navegador hacia el archivo o impresión que tú elijas. A partir de
          ese momento, la custodia, cifrado, transmisión y borrado de ese archivo
          son de tu exclusiva responsabilidad. Recomendamos no enviar hojas de
          valoración con datos identificables por canales no cifrados y
          anonimizar (usar la etiqueta en lugar del nombre) siempre que sea
          posible.
        </p>
      </LegalSection>

      <LegalSection id="finalidades" number="3" title="Finalidades del tratamiento">
        <p>Tratamos tus datos personales para:</p>
        <ol>
          <li>
            <strong>Prestación del servicio</strong>: crear y mantener tu
            cuenta, autenticarte, sincronizar entre dispositivos.
          </li>
          <li>
            <strong>Procesamiento de pagos</strong>: gestionar suscripciones,
            renovaciones, reembolsos. El procesamiento financiero se realiza
            a través de Lemon Squeezy (web) y Apple (iOS).
          </li>
          <li>
            <strong>Soporte al cliente</strong>: responder consultas, reportes
            de errores y solicitudes de privacidad.
          </li>
          <li>
            <strong>Comunicaciones transaccionales</strong>: confirmaciones de
            registro, restablecimiento de contraseña, cambios en suscripción,
            actualizaciones legales relevantes.
          </li>
          <li>
            <strong>Seguridad y prevención de fraude</strong>: detectar uso
            indebido, ataques, abuso de cupones.
          </li>
          <li>
            <strong>Cumplimiento legal</strong>: responder requerimientos de
            autoridades competentes cuando corresponda.
          </li>
          <li>
            <strong>Mejora del producto</strong>: análisis agregado y anónimo
            (en el futuro, mediante herramientas privacy-friendly como Plausible
            o Umami; te lo notificaremos antes de implementarlo).
          </li>
        </ol>
      </LegalSection>

      <LegalSection id="base-legal" number="4" title="Base legal del tratamiento">
        <p>
          Bajo el GDPR (Reglamento UE 2016/679), las bases legales aplicables son:
        </p>
        <ul>
          <li>
            <strong>Ejecución de un contrato</strong> (Art. 6.1.b GDPR): para
            crear tu cuenta, prestar el servicio y procesar pagos.
          </li>
          <li>
            <strong>Interés legítimo</strong> (Art. 6.1.f GDPR): para seguridad,
            prevención de fraude y análisis agregado.
          </li>
          <li>
            <strong>Obligación legal</strong> (Art. 6.1.c GDPR): para cumplir
            requerimientos fiscales, contables o judiciales.
          </li>
          <li>
            <strong>Consentimiento</strong> (Art. 6.1.a GDPR): cuando se requiera
            explícitamente (por ejemplo, futura publicidad personalizada o
            comunicaciones de marketing).
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="compartir" number="5" title="Con quién compartimos datos">
        <p>
          DEC <strong>no vende</strong> tus datos personales a terceros.
          Compartimos información únicamente con proveedores que prestan
          servicios esenciales (encargados del tratamiento bajo GDPR Art. 28),
          quienes están contractualmente obligados a tratar tus datos solo
          según nuestras instrucciones y con medidas de seguridad adecuadas:
        </p>
        <table>
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Servicio</th>
              <th>Datos compartidos</th>
              <th>Ubicación</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Supabase</td>
              <td>Base de datos, autenticación, almacenamiento</td>
              <td>Todos los datos de cuenta</td>
              <td>EE.UU. (East US)</td>
            </tr>
            <tr>
              <td>Vercel</td>
              <td>Hosting web</td>
              <td>Direcciones IP, logs de acceso</td>
              <td>Red global (CDN)</td>
            </tr>
            <tr>
              <td>Lemon Squeezy (Merchant of Record)</td>
              <td>Procesamiento de pagos web</td>
              <td>Email, nombre, datos de tarjeta (procesados por LS, no recibidos por DEC)</td>
              <td>EE.UU., UE</td>
            </tr>
            <tr>
              <td>Apple Inc.</td>
              <td>Sign in with Apple, App Store, StoreKit</td>
              <td>Email (real o relay), identificador Apple</td>
              <td>EE.UU.</td>
            </tr>
            <tr>
              <td>Google LLC</td>
              <td>Sign in with Google</td>
              <td>Email, nombre, foto si los compartes</td>
              <td>EE.UU., red global</td>
            </tr>
            <tr>
              <td>ProtonMail</td>
              <td>Correo electrónico transaccional y de soporte</td>
              <td>Contenido de emails enviados/recibidos</td>
              <td>Suiza</td>
            </tr>
            <tr>
              <td>Namecheap</td>
              <td>Gestión de dominio</td>
              <td>Datos públicos de registro</td>
              <td>EE.UU.</td>
            </tr>
          </tbody>
        </table>
        <p>
          Además, podríamos divulgar datos cuando exista una{" "}
          <strong>obligación legal</strong> (orden judicial, requerimiento de
          autoridad competente), siempre que la solicitud sea formal, motivada
          y proporcional.
        </p>
      </LegalSection>

      <LegalSection id="internacional" number="6" title="Transferencias internacionales de datos">
        <p>
          DEC opera desde la República Dominicana pero utiliza proveedores
          ubicados principalmente en Estados Unidos y la Unión Europea. Cuando
          transferimos datos personales fuera de tu jurisdicción, lo hacemos con
          garantías adecuadas conforme a la normativa aplicable:
        </p>
        <ul>
          <li>
            <strong>Para usuarios en la UE/EEE</strong>: utilizamos
            <em>Standard Contractual Clauses (SCCs)</em> de la Comisión Europea,
            o medidas equivalentes para los proveedores con sede en EE.UU.
          </li>
          <li>
            <strong>Para usuarios en México</strong>: aplicamos las disposiciones
            de la LFPDPPP relativas a transferencias internacionales (Cap. V).
          </li>
          <li>
            <strong>Para usuarios en RD</strong>: la Ley 172-13 admite
            transferencias internacionales con garantías adecuadas, las
            cuales se gestionan contractualmente con cada proveedor.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="retencion" number="7" title="Plazos de conservación">
        <table>
          <thead>
            <tr>
              <th>Dato</th>
              <th>Plazo de conservación</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cuenta activa (perfil, email, suscripción)</td>
              <td>Mientras la cuenta esté activa</td>
            </tr>
            <tr>
              <td>Cuenta inactiva (sin actividad)</td>
              <td>Hasta 24 meses desde la última actividad; después se anonimiza</td>
            </tr>
            <tr>
              <td>Cuenta eliminada por el usuario</td>
              <td>Borrado dentro de 30 días, salvo obligación legal de conservar</td>
            </tr>
            <tr>
              <td>Datos fiscales y de facturación</td>
              <td>Hasta 10 años, según legislación contable RD/UE/EE.UU.</td>
            </tr>
            <tr>
              <td>Logs técnicos y de seguridad</td>
              <td>90 días</td>
            </tr>
            <tr>
              <td>Comunicaciones con soporte</td>
              <td>3 años desde el último contacto</td>
            </tr>
            <tr>
              <td>Datos relacionados con disputas o litigios</td>
              <td>Hasta resolución firme + plazo de prescripción aplicable</td>
            </tr>
          </tbody>
        </table>
      </LegalSection>

      <LegalSection id="seguridad" number="8" title="Medidas de seguridad">
        <p>Aplicamos medidas técnicas y organizativas razonables, incluyendo:</p>
        <ul>
          <li>Cifrado en tránsito (TLS 1.3) para todas las comunicaciones.</li>
          <li>Cifrado en reposo de la base de datos (gestionado por Supabase).</li>
          <li>Contraseñas almacenadas con hashing bcrypt/argon2.</li>
          <li>
            Acceso restringido a la base de datos mediante Row-Level Security
            (RLS), de forma que cada usuario solo accede a sus propios datos.
          </li>
          <li>Tokens de sesión con expiración corta y refresh automático.</li>
          <li>Tokens JWT firmados criptográficamente.</li>
          <li>
            Acceso administrativo limitado al equipo de DEC con autenticación
            de dos factores (2FA).
          </li>
          <li>Backups automáticos diarios cifrados, retenidos 30 días.</li>
          <li>
            Monitorización de seguridad mediante los servicios nativos de
            Supabase, Vercel y los proveedores de pagos.
          </li>
        </ul>
        <p>
          A pesar de estas medidas, ningún sistema es 100% impenetrable. En
          caso de incidente de seguridad que afecte tus datos personales, te
          notificaremos sin demora indebida conforme a los plazos exigidos por
          la legislación aplicable (72 horas bajo GDPR, plazo razonable bajo
          LFPDPPP y Ley 172-13).
        </p>
      </LegalSection>

      <LegalSection id="derechos" number="9" title="Tus derechos">
        <p>
          Independientemente de tu jurisdicción, DEC reconoce los siguientes
          derechos sobre tus datos personales:
        </p>
        <ul>
          <li>
            <strong>Acceso</strong>: saber qué datos tuyos tratamos.
          </li>
          <li>
            <strong>Rectificación</strong>: corregir datos inexactos.
          </li>
          <li>
            <strong>Supresión / Cancelación</strong>: solicitar el borrado de
            tu cuenta y datos asociados ("derecho al olvido").
          </li>
          <li>
            <strong>Oposición</strong>: oponerte a tratamientos basados en
            interés legítimo.
          </li>
          <li>
            <strong>Limitación</strong>: pedir que suspendamos el tratamiento
            mientras resolvemos una disputa.
          </li>
          <li>
            <strong>Portabilidad</strong>: recibir tus datos en formato
            estructurado y legible (JSON).
          </li>
          <li>
            <strong>Revocación del consentimiento</strong>: cuando el
            tratamiento se base en consentimiento, puedes retirarlo en cualquier
            momento.
          </li>
          <li>
            <strong>No ser objeto de decisiones automatizadas</strong>: DEC no
            toma decisiones significativas automatizadas sobre ti (no usamos
            perfilado automatizado con efectos jurídicos).
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="ejercer" number="10" title="Cómo ejercer tus derechos">
        <p>Para ejercer cualquiera de los derechos anteriores:</p>
        <ol>
          <li>
            Envía un email a{" "}
            <a href="mailto:privacidad@decanestesia.com">privacidad@decanestesia.com</a>{" "}
            desde la dirección registrada en tu cuenta DEC.
          </li>
          <li>
            Indica qué derecho deseas ejercer y los detalles relevantes.
          </li>
          <li>
            Podemos requerir verificación adicional de identidad si la solicitud
            llega desde una dirección no registrada o presenta indicios de
            suplantación.
          </li>
        </ol>
        <p>
          Responderemos dentro de los plazos legales aplicables (1 mes bajo
          GDPR, prorrogable a 3 meses por complejidad; 20 días hábiles bajo
          LFPDPPP; plazos similares bajo Ley 172-13 RD).
        </p>
        <p>
          Si consideras que no atendemos correctamente tu solicitud, puedes
          presentar reclamación ante:
        </p>
        <ul>
          <li>
            <strong>UE/EEE</strong>: autoridad de protección de datos de tu
            país (AEPD en España, CNIL en Francia, BfDI en Alemania, etc.).
          </li>
          <li>
            <strong>México</strong>: INAI (Instituto Nacional de Transparencia,
            Acceso a la Información y Protección de Datos Personales).
          </li>
          <li>
            <strong>República Dominicana</strong>: Instituto Dominicano de las
            Telecomunicaciones (INDOTEL) en lo relativo a comunicaciones
            electrónicas, y autoridades judiciales para protección de datos
            personales.
          </li>
          <li>
            <strong>EE.UU.</strong>: Federal Trade Commission (FTC) o
            attorneys general estatales según corresponda.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="menores" number="11" title="Menores de edad">
        <p>
          DEC está dirigido a profesionales de la salud mayores de edad. No
          obstante, reconocemos que estudiantes de medicina o ciencias de la
          salud pueden ser menores en algunas jurisdicciones:
        </p>
        <ul>
          <li>
            <strong>UE/EEE</strong>: edad mínima 16 años para procesar datos
            personales sin consentimiento parental (puede ser menor según el
            país).
          </li>
          <li>
            <strong>EE.UU.</strong>: cumplimos con COPPA; no recolectamos
            datos de menores de 13 años conscientemente.
          </li>
          <li>
            <strong>RD, México, Latam</strong>: aplicamos los mínimos
            legales locales.
          </li>
        </ul>
        <p>
          Si descubrimos que hemos recolectado datos de un menor sin las
          autorizaciones requeridas, los eliminaremos de forma inmediata.
          Padres o tutores que sospechen este caso pueden contactarnos en{" "}
          <a href="mailto:privacidad@decanestesia.com">privacidad@decanestesia.com</a>.
        </p>
      </LegalSection>

      <LegalSection id="cookies" number="12" title="Cookies y tecnologías similares">
        <p>
          DEC utiliza cookies esenciales para mantener tu sesión iniciada y
          recordar tus preferencias. No usamos cookies de publicidad ni de
          rastreo cross-site. Para detalles, consulta nuestra{" "}
          <a href="/legal/cookies">Política de Cookies</a>.
        </p>
      </LegalSection>

      <LegalSection id="gdpr" number="13" title="Usuarios en la Unión Europea (GDPR)">
        <p>
          Si resides en la Unión Europea, el Espacio Económico Europeo, Suiza
          o el Reino Unido, gozas de los derechos previstos en el Reglamento
          General de Protección de Datos (Reglamento UE 2016/679), incluyendo:
        </p>
        <ul>
          <li>Derechos de acceso, rectificación, supresión, oposición, limitación, portabilidad (Arts. 15-21).</li>
          <li>Derecho a presentar reclamación ante la autoridad de control de tu país (Art. 77).</li>
          <li>Derecho a indemnización por daños materiales o inmateriales (Art. 82).</li>
        </ul>
        <p>
          Las bases legales del tratamiento se detallan en la cláusula 4. DEC
          no realiza decisiones automatizadas con efectos jurídicos significativos
          en los términos del Art. 22 GDPR.
        </p>
      </LegalSection>

      <LegalSection id="ccpa" number="14" title="Usuarios en California (CCPA/CPRA)">
        <p>
          Si resides en California, tienes derechos bajo la California Consumer
          Privacy Act (CCPA) y la California Privacy Rights Act (CPRA), incluyendo:
        </p>
        <ul>
          <li>Derecho a saber qué información personal recolectamos.</li>
          <li>Derecho a eliminar tu información personal.</li>
          <li>Derecho a rectificar información inexacta.</li>
          <li>Derecho a limitar el uso de información sensible.</li>
          <li>Derecho a no ser discriminado por ejercer tus derechos.</li>
        </ul>
        <h4>Do Not Sell or Share My Personal Information</h4>
        <p>
          <strong>DEC no vende ni "comparte" (en el sentido de la CPRA) tu
          información personal con terceros para publicidad comportamental
          cross-context</strong>. Por tanto, no necesitas activar opción de
          opt-out. Si en el futuro esto cambia, te notificaremos previamente y
          habilitaremos la opción correspondiente en una página dedicada.
        </p>
      </LegalSection>

      <LegalSection id="lfpdppp" number="15" title="Usuarios en México (LFPDPPP)">
        <p>
          Este apartado constituye el <strong>Aviso de Privacidad simplificado</strong>{" "}
          conforme a la Ley Federal de Protección de Datos Personales en
          Posesión de los Particulares (LFPDPPP):
        </p>
        <ul>
          <li>
            <strong>Responsable</strong>: Dr. Jophiel Espaillat Caldentey,
            República Dominicana.
          </li>
          <li>
            <strong>Datos tratados</strong>: identificación, contacto, datos
            de cuenta y suscripción (ver cláusula 2).
          </li>
          <li>
            <strong>Finalidades primarias</strong>: prestación del servicio,
            procesamiento de pagos, soporte (ver cláusula 3).
          </li>
          <li>
            <strong>Finalidades secundarias</strong>: análisis agregado para
            mejora del producto. Puedes oponerte sin afectar la prestación
            del servicio escribiendo a{" "}
            <a href="mailto:privacidad@decanestesia.com">privacidad@decanestesia.com</a>.
          </li>
          <li>
            <strong>Transferencias</strong>: a proveedores extranjeros listados
            en la cláusula 5, bajo cláusulas contractuales adecuadas.
          </li>
          <li>
            <strong>Derechos ARCO</strong> (Acceso, Rectificación, Cancelación, Oposición):
            ejercibles mediante{" "}
            <a href="mailto:privacidad@decanestesia.com">privacidad@decanestesia.com</a>.
          </li>
          <li>
            <strong>Autoridad de control</strong>: INAI ({" "}
            <a href="https://home.inai.org.mx" target="_blank" rel="noopener noreferrer">inai.org.mx</a>).
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="rd" number="16" title="Usuarios en República Dominicana (Ley 172-13)">
        <p>
          Para usuarios en RD, esta política observa la Ley 172-13 sobre
          Protección Integral de los Datos Personales:
        </p>
        <ul>
          <li>
            Te informamos de forma clara qué datos recolectamos, con qué
            finalidades y a quién los transferimos (ver cláusulas 2, 3 y 5).
          </li>
          <li>
            Garantizamos los derechos de acceso, rectificación, oposición y
            supresión.
          </li>
          <li>
            Aplicamos medidas técnicas y organizativas razonables para proteger
            la información (cláusula 8).
          </li>
          <li>
            Para reclamaciones, puedes acudir a los tribunales competentes de
            la República Dominicana.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="cambios" number="17" title="Cambios en esta política">
        <p>
          Podemos actualizar esta Política de Privacidad para reflejar cambios
          legales, técnicos o de servicio. Los cambios sustanciales se
          comunicarán mediante:
        </p>
        <ul>
          <li>Email a la dirección registrada (con al menos 30 días de antelación cuando sea legalmente exigible).</li>
          <li>Notificación destacada en la aplicación.</li>
          <li>Actualización de la fecha de "Vigencia" en la cabecera de este documento.</li>
        </ul>
      </LegalSection>

      <LegalSection id="contacto" number="18" title="Contacto">
        <p>
          Para cualquier consulta o solicitud relativa a la privacidad y
          protección de tus datos:
        </p>
        <ul>
          <li>
            Privacidad y protección de datos:{" "}
            <a href="mailto:privacidad@decanestesia.com">privacidad@decanestesia.com</a>
          </li>
          <li>
            Soporte general:{" "}
            <a href="mailto:soporte@decanestesia.com">soporte@decanestesia.com</a>
          </li>
          <li>
            Asuntos legales:{" "}
            <a href="mailto:legal@decanestesia.com">legal@decanestesia.com</a>
          </li>
        </ul>
      </LegalSection>

      <div className="legal-page-footer">
        <p>
          DEC se compromete con la privacidad por diseño y por defecto. Tratamos
          la mínima cantidad de datos necesaria para prestar un servicio útil y
          seguro.
        </p>
        <p>
          // no vendemos tus datos; vendemos una herramienta clínica útil.<br />
          // el modelo de negocio basado en publicidad de datos sensibles es exactamente lo que evitamos.<br />
          // privacidad por diseño no es marketing: es economía honesta.
        </p>
      </div>
    </LegalShell>
  );
}
