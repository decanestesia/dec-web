import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de Uso",
  description: "Términos y condiciones de uso de DEC Anestesia.",
};

export default function TerminosPage() {
  return (
    <div className="wrap-narrow" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div className="prompt mono" style={{ marginBottom: "1rem" }}><b>$</b> cat /legal/terminos</div>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "0.5rem" }}>Términos de Uso</h1>
      <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem", marginBottom: "2rem" }}>Última actualización: abril 2026</p>

      <div className="prose">
        <h2>Aceptación</h2>
        <p>Al acceder y utilizar DEC (la aplicación móvil y el sitio web decanestesia.com), usted acepta estos términos de uso en su totalidad. Si no está de acuerdo, no utilice el servicio.</p>

        <h2>Uso permitido</h2>
        <p>DEC está destinado exclusivamente a:</p>
        <ul>
          <li>Profesionales de la salud con formación en anestesiología, cuidados críticos o áreas afines.</li>
          <li>Estudiantes de medicina y residentes bajo supervisión.</li>
          <li>Uso como herramienta de referencia y apoyo a la decisión clínica.</li>
        </ul>

        <h2>Uso prohibido</h2>
        <ul>
          <li>Uso por personas sin formación médica para automedicación.</li>
          <li>Uso como única fuente de información para decisiones clínicas.</li>
          <li>Redistribución o reventa del contenido sin autorización.</li>
          <li>Modificación de la base de datos para fines engañosos.</li>
        </ul>

        <h2>Propiedad intelectual</h2>
        <p>El código fuente, diseño, base de datos de fármacos y contenido de DEC son propiedad del Dr. Jophiel Espaillat C. La base de datos de fármacos se distribuye como datos abiertos para consumo, no para redistribución comercial.</p>

        <h2>Disponibilidad del servicio</h2>
        <p>DEC se ofrece &quot;tal cual&quot; sin garantías de disponibilidad continua. Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto del servicio sin previo aviso.</p>

        <h2>Limitación de responsabilidad</h2>
        <p>Consulte nuestro <strong>Disclaimer Médico</strong> para la exención de responsabilidad completa relacionada con el uso clínico de la información proporcionada.</p>

        <h2>Ley aplicable</h2>
        <p>Estos términos se rigen por las leyes aplicables en la jurisdicción del autor.</p>

        <h2>Contacto</h2>
        <p>Para consultas legales: <strong>contacto@decanestesia.com</strong></p>
      </div>
    </div>
  );
}
