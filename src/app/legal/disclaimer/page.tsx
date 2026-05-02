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
  title: "Disclaimer médico | DEC Anestesia",
  description:
    "Información de referencia clínica. DEC no sustituye juicio profesional ni ficha técnica oficial.",
};

export default function DisclaimerPage() {
  return (
    <>
      <LegalHeader
        command="cat /legal/disclaimer.md"
        title="Disclaimer médico"
        subtitle="Lo que DEC es, lo que no es, y por qué la responsabilidad final siempre la tienes tú."
        comment="// si algo sale mal, la culpa no es del app"
      />

      {/* Banner de advertencia inicial */}
      <div
        className="panel"
        style={{
          borderLeft: "3px solid var(--red)",
          marginBottom: "2rem",
          background: "rgba(239,68,68,0.05)",
        }}
      >
        <div className="panel-body">
          <p
            className="mono"
            style={{
              color: "var(--red)",
              fontSize: "0.65rem",
              letterSpacing: "0.08em",
              marginBottom: "0.5rem",
            }}
          >
            ⚠ AVISO IMPORTANTE
          </p>
          <p
            style={{
              color: "var(--text-0)",
              fontSize: "0.9rem",
              lineHeight: 1.7,
              fontWeight: 500,
            }}
          >
            DEC es una herramienta de apoyo clínico dirigida exclusivamente a
            profesionales sanitarios cualificados. No sustituye el juicio
            clínico, la ficha técnica oficial del medicamento, ni la
            supervisión médica. Verifica siempre dosis, dilución, vía de
            administración y compatibilidad antes de cualquier intervención.
          </p>
        </div>
      </div>

      <LegalSection number="01" title="A quién va dirigido DEC">
        <P>
          DEC (Diluciones, Dosis & Cálculos Anestésicos) es una herramienta de
          referencia diseñada por y para anestesiólogos, residentes de
          anestesiología, intensivistas, urgenciólogos, enfermeros de
          quirófano/UCI y demás profesionales sanitarios cualificados que
          manejen fármacos perioperatorios.
        </P>
        <P>
          <strong>No está dirigido al público general.</strong> No es una
          herramienta de autodiagnóstico, autotratamiento, ni asesoría médica
          para pacientes. Si eres un paciente buscando información sobre tu
          medicación, habla con tu médico o farmacéutico.
        </P>
      </LegalSection>

      <LegalSection number="02" title="Naturaleza de la información">
        <P>
          La información disponible en DEC (catálogo de fármacos, dosis,
          diluciones, calculadoras, interacciones, datos farmacológicos,
          embarazo/lactancia, marcas comerciales, datos moleculares):
        </P>
        <UL>
          <LI>
            Es de carácter <strong>educativo y de referencia rápida</strong>.
          </LI>
          <LI>
            Se basa en literatura aceptada (Stoelting, Miller&apos;s
            Anesthesia, FDA, Lexicomp, UpToDate, PubChem, fichas técnicas
            oficiales) y curado clínico.
          </LI>
          <LI>
            <strong>
              No reemplaza la ficha técnica (prospecto, RCP, package insert)
              vigente del fabricante en tu país
            </strong>
            . Las fichas técnicas pueden cambiar y son la fuente legal de
            referencia.
          </LI>
          <LI>
            Puede contener errores, omisiones o información obsoleta a pesar
            de nuestros esfuerzos por mantenerla actualizada.
          </LI>
          <LI>
            No es exhaustiva. La ausencia de una interacción, contraindicación
            o efecto adverso en DEC{" "}
            <strong>no implica que no exista</strong>.
          </LI>
        </UL>
        <P
          style={{
            background: "var(--bg-1)",
            padding: "0.75rem",
            borderLeft: "2px solid var(--amber)",
            fontSize: "0.78rem",
            color: "var(--text-2)",
          }}
        >
          // ausencia de evidencia ≠ evidencia de ausencia. La medicina basada
          en evidencia tampoco está exenta de huecos en la base.
        </P>
      </LegalSection>

      <LegalSection number="03" title="Lo que DEC no hace">
        <P>DEC explícitamente NO:</P>
        <UL>
          <LI>
            Diagnostica enfermedades. No es un sistema de soporte de
            diagnóstico clínico (CDSS) certificado.
          </LI>
          <LI>
            Prescribe ni recomienda tratamientos individualizados. La
            indicación es decisión del clínico responsable del paciente.
          </LI>
          <LI>
            Sustituye la evaluación preanestésica, la historia clínica, la
            exploración física, ni los estudios complementarios.
          </LI>
          <LI>
            Garantiza compatibilidad con los protocolos institucionales de tu
            hospital. Tu institución tiene la última palabra.
          </LI>
          <LI>
            Es un dispositivo médico aprobado por la FDA, EMA, COFEPRIS, MHRA
            ni ningún otro regulador sanitario. No tiene marcado CE como
            dispositivo médico.
          </LI>
        </UL>
      </LegalSection>

      <LegalSection number="04" title="Las calculadoras y los cálculos">
        <P>
          Las calculadoras de DEC (infusión, antropometría, electrolitos,
          ROTEM/TEG, salino hipertónico, etc.) realizan cálculos matemáticos a
          partir de los valores que tú introduces. Por tanto:
        </P>
        <UL>
          <LI>
            <strong>Garbage in, garbage out:</strong> si introduces datos
            incorrectos (peso erróneo, unidades equivocadas, concentración
            mal medida), el resultado será matemáticamente correcto pero
            clínicamente peligroso.
          </LI>
          <LI>
            Verifica <strong>siempre</strong> la unidad antes de programar la
            bomba o jeringa. mcg/kg/min ≠ mg/kg/h.
          </LI>
          <LI>
            Comprueba al menos una vez de forma manual el resultado en
            pacientes pediátricos, neonatos, obesos mórbidos o con
            insuficiencia renal/hepática severa.
          </LI>
          <LI>
            La calculadora asume condiciones estándar y no contempla
            variabilidad farmacocinética individual, interacciones
            farmacodinámicas, ni respuesta clínica.
          </LI>
        </UL>
      </LegalSection>

      <LegalSection number="05" title="Interacciones farmacológicas">
        <P>
          La base de interacciones de DEC contiene aproximadamente{" "}
          <strong>150 interacciones críticas curadas para anestesia</strong>
          (síndrome serotoninérgico, prolongación QT, sangrado, depresión
          respiratoria, etc.). Es <strong>no exhaustiva por diseño</strong>:
          priorizamos interacciones de alto impacto perioperatorio sobre
          cobertura completa.
        </P>
        <P>
          Para listados exhaustivos de interacciones, consulta Lexicomp,
          Micromedex, UpToDate Interactions, o la ficha técnica del
          fabricante. La verificación final con un sistema institucional o un
          farmacólogo clínico es responsabilidad del prescriptor.
        </P>
      </LegalSection>

      <LegalSection number="06" title="Embarazo, lactancia y poblaciones especiales">
        <P>
          La información sobre uso en embarazo (categorías FDA antiguas) y
          lactancia es orientativa y simplificada. Para decisiones reales en
          pacientes embarazadas o lactantes, consulta:
        </P>
        <UL>
          <LI>LactMed (NIH) — consulta gratuita.</LI>
          <LI>Reprotox / Teratogen Information Service.</LI>
          <LI>Briggs&apos; Drugs in Pregnancy and Lactation.</LI>
          <LI>e-Lactancia.org (gratuito, en español).</LI>
        </UL>
        <P>
          Las categorías FDA antiguas (A/B/C/D/X) están descontinuadas desde
          2015 y reemplazadas por la regla narrativa PLLR. Las usamos por
          familiaridad clínica con la advertencia de que son una
          simplificación.
        </P>
      </LegalSection>

      <LegalSection number="07" title="Limitación de responsabilidad">
        <P>
          DEC y su autor (Dr. Jophiel Espaillat Caldentey, médico
          anestesiólogo) proporcionan esta herramienta &quot;tal cual&quot; (
          <em>as-is</em>), sin garantías expresas o implícitas de exactitud,
          actualización, idoneidad para un propósito específico, ni ausencia
          de errores.
        </P>
        <P>
          En la máxima medida permitida por la ley aplicable, ni el autor ni
          ningún colaborador de DEC serán responsables de:
        </P>
        <UL>
          <LI>
            Daños directos, indirectos, incidentales o consecuentes derivados
            del uso o imposibilidad de uso de DEC.
          </LI>
          <LI>
            Errores de cálculo, datos obsoletos, o información incorrecta en
            el catálogo.
          </LI>
          <LI>
            Decisiones clínicas tomadas total o parcialmente con base en la
            información proporcionada por DEC.
          </LI>
          <LI>
            Eventos adversos en pacientes derivados de la administración de
            fármacos.
          </LI>
        </UL>
        <P>
          La responsabilidad por la atención del paciente recae{" "}
          <strong>siempre</strong> en el profesional sanitario tratante.
        </P>
      </LegalSection>

      <LegalSection number="08" title="Reporte de errores y mejoras">
        <P>
          Si detectas un error en una dosis, dilución, interacción o cualquier
          otro dato, agradeceríamos enormemente que nos lo notifiques en{" "}
          <a
            href="mailto:errores@decanestesia.com"
            style={{ color: "var(--accent)" }}
          >
            errores@decanestesia.com
          </a>
          . Tu reporte beneficia a toda la comunidad. Por favor incluye:
        </P>
        <UL>
          <LI>Fármaco implicado.</LI>
          <LI>Campo o sección donde está el error.</LI>
          <LI>Valor correcto y la fuente bibliográfica.</LI>
        </UL>
      </LegalSection>

      <LegalSection number="09" title="Aceptación">
        <P>
          Al usar DEC, reconoces haber leído, entendido y aceptado este
          disclaimer. Si no estás de acuerdo, deja de usar la herramienta.
        </P>
        <P
          className="mono"
          style={{
            fontSize: "0.7rem",
            color: "var(--text-3)",
            opacity: 0.7,
          }}
        >
          // los pacientes leen menos los insertos que los anestesiólogos
          <br />
          // este disclaimer existe para que cuando algo salga mal — y a veces
          sale mal, así es la medicina — nadie venga a culpar a una app
        </P>
      </LegalSection>

      <LastUpdated date="mayo de 2026" />
      <ContactBox />
      <LegalCrossLinks current="disclaimer" />
    </>
  );
}
