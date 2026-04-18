import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad de DEC Anestesia.",
};

export default function PrivacidadPage() {
  return (
    <div className="wrap-narrow" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div className="prompt mono" style={{ marginBottom: "1rem" }}><b>$</b> cat /legal/privacidad</div>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "0.5rem" }}>Política de Privacidad</h1>
      <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem", marginBottom: "2rem" }}>Última actualización: abril 2026</p>

      <div className="prose">
        <h2>Resumen</h2>
        <p>DEC no recopila, almacena ni transmite datos personales de sus usuarios. Así de simple.</p>

        <h2>Datos que NO recopilamos</h2>
        <ul>
          <li>Información personal (nombre, email, ubicación).</li>
          <li>Datos de pacientes ingresados en las calculadoras.</li>
          <li>Historial de búsquedas o uso.</li>
          <li>Datos biométricos o de dispositivo.</li>
        </ul>

        <h2>App iOS</h2>
        <p>La aplicación para iOS funciona completamente <strong>offline</strong>. Los datos ingresados en las calculadoras (peso, dosis, valores de laboratorio) se almacenan exclusivamente en la memoria del dispositivo durante la sesión y <strong>no se transmiten a ningún servidor</strong>.</p>
        <p>La única conexión a internet que realiza la app es para verificar si hay actualizaciones de la base de datos de fármacos, descargando un archivo JSON público desde nuestro servidor. Esta conexión no transmite ningún dato del usuario ni del dispositivo.</p>

        <h2>Sitio web</h2>
        <p>El sitio web decanestesia.com está alojado en Vercel. Vercel puede recopilar datos técnicos estándar (dirección IP, tipo de navegador) como parte de su servicio de hosting. Consulte la <strong>política de privacidad de Vercel</strong> para más detalles.</p>
        <p>No utilizamos cookies de seguimiento, analytics, ni servicios de terceros para rastrear el comportamiento del usuario.</p>

        <h2>Cookies</h2>
        <p>Utilizamos una única cookie local (<strong>localStorage</strong>) para recordar su preferencia de tema claro/oscuro. Esta información no se transmite a ningún servidor.</p>

        <h2>Cambios a esta política</h2>
        <p>Si en el futuro implementamos funcionalidades que requieran recopilación de datos (como cuentas de usuario), esta política será actualizada y se notificará a los usuarios.</p>

        <h2>Contacto</h2>
        <p>Para preguntas sobre privacidad: <strong>contacto@decanestesia.com</strong></p>
      </div>
    </div>
  );
}
