import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer Médico",
  description: "Aviso legal y disclaimer médico de DEC Anestesia.",
};

export default function DisclaimerPage() {
  return (
    <div className="wrap-narrow" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div className="prompt mono" style={{ marginBottom: "1rem" }}><b>$</b> cat /legal/disclaimer</div>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "0.5rem" }}>Disclaimer Médico</h1>
      <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem", marginBottom: "2rem" }}>Última actualización: abril 2026</p>

      <div className="prose">
        <h2>Naturaleza de la información</h2>
        <p>DEC (Diluciones, Dosis & Cálculos Anestésicos) es una herramienta de <strong>apoyo a la decisión clínica</strong> destinada exclusivamente a profesionales de la salud con formación en anestesiología, cuidados críticos y áreas afines.</p>
        <p>La información contenida en esta aplicación y sitio web tiene carácter <strong>informativo y de referencia</strong>. No constituye consejo médico, diagnóstico ni recomendación terapéutica individualizada.</p>

        <h2>Responsabilidad profesional</h2>
        <p>El uso de DEC no sustituye en ningún caso:</p>
        <ul>
          <li>El juicio clínico del profesional de la salud.</li>
          <li>La lectura del inserto oficial del fabricante de cada fármaco.</li>
          <li>Los protocolos institucionales de su centro de trabajo.</li>
          <li>La supervisión de profesionales con mayor experiencia.</li>
          <li>La evaluación individualizada de cada paciente.</li>
        </ul>

        <h2>Limitaciones</h2>
        <p>Aunque se ha hecho un esfuerzo riguroso para garantizar la precisión de los datos, las dosis, presentaciones y disponibilidad de fármacos pueden variar según:</p>
        <ul>
          <li>País, región e institución.</li>
          <li>Fabricante y formulación específica.</li>
          <li>Actualizaciones en las guías clínicas.</li>
          <li>Características individuales del paciente.</li>
        </ul>
        <p><strong>Verifique siempre</strong> la concentración real de su preparación, dosis, vía de administración y compatibilidad antes de cualquier intervención farmacológica.</p>

        <h2>Exención de responsabilidad</h2>
        <p>El autor y desarrollador de DEC, Dr. Jophiel Espaillat C., no asume responsabilidad alguna por:</p>
        <ul>
          <li>Errores u omisiones en la información presentada.</li>
          <li>Daños directos o indirectos derivados del uso de la aplicación o sitio web.</li>
          <li>Decisiones clínicas tomadas con base en la información proporcionada.</li>
          <li>Resultados adversos en la atención al paciente.</li>
        </ul>

        <h2>Reporte de errores</h2>
        <p>Si identifica un error en una dosis, presentación o cualquier dato clínico, por favor repórtelo inmediatamente a <strong>contacto@decanestesia.com</strong>. La seguridad del paciente es prioridad.</p>
      </div>
    </div>
  );
}
