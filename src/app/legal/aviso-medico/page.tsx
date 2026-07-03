// src/app/legal/aviso-medico/page.tsx
//
// Disclaimer médico formal. Página independiente, referenciada desde ToS,
// onboarding, settings y disclaimers in-app.
//
// Tono: formal, conservador, sin humor negro en cláusulas. El humor negro
// solo está permitido en el footer.

import { LegalShell, LegalSection, Callout } from "../_components/LegalShell";

export const metadata = {
  title: "Aviso Médico — DEC Anestesia",
  description:
    "Aviso médico de DEC: herramienta de referencia, no reemplaza el criterio clínico.",
};

const toc = [
  { id: "proposito", label: "1. Propósito de DEC" },
  { id: "no-consejo", label: "2. No es consejo médico" },
  { id: "criterio", label: "3. Criterio clínico del usuario" },
  { id: "limitaciones", label: "4. Limitaciones de las dosis" },
  { id: "marcas", label: "5. Marcas y presentaciones locales" },
  { id: "emergencias", label: "6. Emergencias médicas" },
  { id: "reportar", label: "7. Reportar errores" },
  { id: "responsabilidad", label: "8. Responsabilidad final" },
];

export default function AvisoMedicoPage() {
  return (
    <LegalShell
      eyebrow="Documento médico-legal"
      title="Aviso Médico"
      subtitle="DEC (Diluciones, Dosis & Cálculos Anestésicos) es una herramienta de referencia clínica. Léelo con la misma atención que prestarías a un inserto farmacéutico."
      effectiveDate="12 de mayo de 2026"
      version="1.0"
      toc={toc}
      relatedPages={[
        { href: "/legal/terminos", label: "Términos y Condiciones" },
        { href: "/legal/privacidad", label: "Política de Privacidad" },
        { href: "/legal/cookies", label: "Política de Cookies" },
      ]}
    >
      <Callout variant="medical" label="Punto crítico">
        DEC es una herramienta de referencia para profesionales de la salud.{" "}
        <strong>No reemplaza el criterio clínico</strong>, la formación médica,
        ni la verificación independiente de cada decisión terapéutica. El uso
        de DEC es bajo tu exclusiva responsabilidad profesional.
      </Callout>

      <LegalSection id="proposito" number="1" title="Propósito de DEC">
        <p>
          DEC fue creado por un anestesiólogo en ejercicio para ofrecer acceso
          rápido a información farmacológica y cálculos clínicos relevantes en
          anestesiología, cuidados críticos y áreas relacionadas. Su propósito
          es servir como apoyo a la decisión clínica, no como sustituto de ella.
        </p>
        <p>DEC ofrece:</p>
        <ul>
          <li>Fichas farmacológicas (dosis, mecanismo, farmacocinética, advertencias).</li>
          <li>Datos de administración, dilución y compatibilidad.</li>
          <li>Calculadoras (infusión, dosis pediátrica, electrolitos, hemoterapia, etc.).</li>
          <li>Verificador de interacciones farmacológicas.</li>
          <li>Referencias a marcas comerciales en mercados latinoamericanos, mexicano, español, estadounidense y dominicano.</li>
        </ul>
        <p>
          DEC <strong>no realiza diagnósticos, no prescribe, no monitoriza pacientes</strong>{" "}
          ni reemplaza ninguna función clínica reservada al profesional habilitado.
        </p>
      </LegalSection>

      <LegalSection id="no-consejo" number="2" title="No constituye consejo médico">
        <p>
          La información contenida en DEC tiene fines{" "}
          <strong>exclusivamente educativos y de referencia</strong>. No constituye:
        </p>
        <ul>
          <li>Consejo médico para un paciente específico.</li>
          <li>Prescripción ni recomendación de tratamiento.</li>
          <li>Sustituto de la valoración clínica directa.</li>
          <li>Sustituto de las guías oficiales de tu institución, sociedad científica o autoridad sanitaria.</li>
          <li>Sustituto del inserto del fabricante de cada medicamento.</li>
        </ul>
        <p>
          DEC está dirigido a <strong>profesionales de la salud</strong> con
          formación adecuada en farmacología clínica y manejo perioperatorio.
          Si no eres profesional sanitario, no debes utilizar DEC para tomar
          decisiones sobre tu salud o la de terceros.
        </p>
      </LegalSection>

      <LegalSection id="criterio" number="3" title="Criterio clínico del usuario">
        <p>
          Toda decisión clínica derivada del uso de DEC es responsabilidad
          exclusiva del profesional usuario, quien debe:
        </p>
        <ul>
          <li>
            Considerar el contexto clínico completo del paciente: edad, peso,
            función renal y hepática, comorbilidades, alergias, medicación
            concomitante, embarazo, lactancia y otros factores relevantes.
          </li>
          <li>
            Verificar de forma independiente cada dosis, dilución, vía y
            velocidad de administración antes de aplicarla.
          </li>
          <li>
            Contrastar la información con el inserto del fabricante, guías
            clínicas vigentes y referencias primarias actualizadas.
          </li>
          <li>
            Documentar el razonamiento clínico en la historia del paciente,
            no en la app.
          </li>
          <li>
            Reconocer que las recomendaciones de dosis varían entre fuentes
            (UpToDate, Stoelting, Miller, Trissel's, fichas técnicas de la FDA,
            EMA, Cofepris, AEMPS, MSP RD) y que DEC no puede contemplar todos
            los escenarios clínicos posibles.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="limitaciones" number="4" title="Limitaciones de las dosis">
        <Callout variant="warning" label="Importante">
          Las dosis publicadas en DEC son <strong>aproximadas y representativas</strong> de
          literatura médica aceptada. No son prescripción para ningún paciente
          individual.
        </Callout>
        <p>Específicamente:</p>
        <ul>
          <li>
            Las dosis se basan en rangos publicados en literatura clínica
            estándar (UpToDate, Stoelting, Miller, Trissel's Handbook, etiquetas
            FDA y otras fuentes referenciadas en cada ficha).
          </li>
          <li>
            La <strong>titulación final</strong> debe ajustarse según la
            respuesta clínica, monitorización, comorbilidades y características
            individuales del paciente.
          </li>
          <li>
            Existen poblaciones especiales (pediátrica, geriátrica, obesidad
            mórbida, insuficiencia renal, insuficiencia hepática, embarazo,
            lactancia) donde las dosis pueden diferir significativamente y
            requieren consideraciones específicas no siempre detalladas en DEC.
          </li>
          <li>
            La información sobre interacciones farmacológicas, aunque revisada,
            no es exhaustiva. <strong>Ausencia de mención de una interacción en
            DEC no significa ausencia de interacción.</strong>
          </li>
          <li>
            Algunas dosis se expresan en rangos amplios porque la evidencia es
            heterogénea; el profesional debe seleccionar el valor apropiado
            según contexto.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="marcas" number="5" title="Marcas y presentaciones locales">
        <p>
          DEC documenta marcas comerciales de medicamentos en distintos mercados
          (principalmente México, España, Estados Unidos y República Dominicana).
          Sin embargo:
        </p>
        <ul>
          <li>
            Las presentaciones farmacéuticas varían por país, fabricante y lote.
          </li>
          <li>
            Las concentraciones, vehículos, conservantes y excipientes pueden
            diferir de los listados en DEC.
          </li>
          <li>
            La disponibilidad comercial cambia constantemente: medicamentos
            descontinuados, recalls, escasez nacional o cambios de fabricante
            no siempre se reflejan en DEC.
          </li>
        </ul>
        <p>
          <strong>Verifica siempre con la farmacia local y el etiquetado real
          del producto que tienes en tus manos</strong> antes de preparar y
          administrar cualquier medicamento.
        </p>
      </LegalSection>

      <LegalSection id="emergencias" number="6" title="Emergencias médicas">
        <Callout variant="medical" label="No es app de emergencias">
          DEC <strong>NO está diseñado para uso en emergencias médicas que
          requieran asistencia inmediata</strong>. En emergencias:
          <ul style={{ marginTop: "0.5rem", marginBottom: 0 }}>
            <li>República Dominicana: 911</li>
            <li>España: 112</li>
            <li>México: 911</li>
            <li>Estados Unidos: 911</li>
            <li>O contacta tu sistema de emergencias local.</li>
          </ul>
        </Callout>
        <p>
          DEC puede ser una referencia útil durante el manejo de emergencias
          por profesionales habilitados, pero nunca debe retrasar la atención
          inmediata ni reemplazar protocolos institucionales (ACLS, ATLS, PALS,
          NRP, manejo de paro, manejo de vía aérea difícil, manejo de hipertermia
          maligna, etc.).
        </p>
      </LegalSection>

      <LegalSection id="reportar" number="7" title="Reportar errores">
        <p>
          Si detectas información incorrecta, imprecisa o desactualizada en DEC,
          repórtala a{" "}
          <a href="mailto:errores@decanestesia.com">errores@decanestesia.com</a>.
          Incluye:
        </p>
        <ul>
          <li>Fármaco o sección donde está el error.</li>
          <li>Información incorrecta tal como aparece en DEC.</li>
          <li>Información correcta con su referencia (UpToDate, ficha técnica, paper, guía).</li>
          <li>Captura de pantalla si es posible.</li>
        </ul>
        <p>
          El equipo de DEC revisa los reportes y actualiza la base de datos
          periódicamente. Sin embargo, <strong>la responsabilidad de verificar
          la información antes de usarla recae en el profesional usuario</strong>,
          incluso después de reportar un error.
        </p>
      </LegalSection>

      <LegalSection id="responsabilidad" number="8" title="Responsabilidad final">
        <p>
          Al usar DEC, reconoces y aceptas que:
        </p>
        <ol>
          <li>
            Eres un profesional de la salud habilitado para prescribir,
            administrar o supervisar el uso de medicamentos en tu jurisdicción,
            o un estudiante de ciencias de la salud bajo supervisión adecuada.
          </li>
          <li>
            Comprendes que DEC es una herramienta de referencia y no un
            sustituto de tu juicio clínico, formación o experiencia.
          </li>
          <li>
            Asumes la responsabilidad final de cada decisión clínica que tomes,
            independientemente de la información consultada en DEC.
          </li>
          <li>
            DEC, su creador, desarrolladores y colaboradores{" "}
            <strong>no son responsables</strong> de daños directos, indirectos,
            incidentales o consecuentes derivados del uso o imposibilidad de
            uso de la aplicación, incluyendo pero no limitándose a errores
            de diagnóstico, prescripción, dilución, administración o monitorización.
          </li>
          <li>
            Esta limitación de responsabilidad aplica hasta el máximo permitido
            por la legislación de tu jurisdicción.
          </li>
        </ol>
        <p>
          Para los términos completos de uso, limitación de responsabilidad e
          indemnización, consulta los{" "}
          <a href="/legal/terminos">Términos y Condiciones</a>.
        </p>
      </LegalSection>

      {/* Footer con humor negro permitido */}
      <div className="legal-page-footer">
        <p>
          Este aviso se rige por las leyes de la República Dominicana, sin
          perjuicio de las normas imperativas aplicables en tu jurisdicción
          como profesional sanitario o consumidor.
        </p>
        <p>
          Contacto médico-legal:{" "}
          <a href="mailto:legal@decanestesia.com">legal@decanestesia.com</a>
        </p>
        <p>
          // DEC no reemplaza el criterio clínico — si lo hizo, busca otro proveedor.
          <br />
          // los pacientes leen menos los insertos que los anestesiólogos, pero los abogados los leen mucho.
          <br />
          // ausencia de evidencia ≠ evidencia de ausencia.
        </p>
      </div>
    </LegalShell>
  );
}
