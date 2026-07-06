import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Soporte y contacto · DEC",
  description:
    "Ayuda, contacto y preguntas frecuentes de DEC (decanestesia.com): soporte técnico, cuenta, suscripción, privacidad y datos. Escríbenos a soporte@decanestesia.com.",
};

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: "2.25rem" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", marginBottom: "0.6rem" }}>
        <span className="mono" style={{ color: "var(--accent)", fontSize: "0.7rem" }}>
          {n}
        </span>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-0)" }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: "var(--text-1)", fontSize: "0.92rem", lineHeight: 1.75, margin: "0 0 1rem" }}>
      {children}
    </p>
  );
}

function ContactCard({
  email,
  label,
  desc,
}: {
  email: string;
  label: string;
  desc: string;
}) {
  return (
    <a
      href={`mailto:${email}`}
      className="panel"
      style={{
        display: "block",
        textDecoration: "none",
        borderLeft: "3px solid var(--accent)",
        margin: "0.6rem 0",
      }}
    >
      <div className="panel-body">
        <div className="mono" style={{ color: "var(--accent)", fontSize: "0.9rem", fontWeight: 600 }}>
          {email}
        </div>
        <div style={{ color: "var(--text-0)", fontSize: "0.85rem", fontWeight: 600, marginTop: "0.25rem" }}>
          {label}
        </div>
        <div style={{ color: "var(--text-2)", fontSize: "0.78rem", marginTop: "0.15rem" }}>{desc}</div>
      </div>
    </a>
  );
}

function Faq({ q, a }: { q: string; a: React.ReactNode }) {
  return (
    <details style={{ borderBottom: "1px solid var(--border)", padding: "0.75rem 0" }}>
      <summary
        style={{
          cursor: "pointer",
          color: "var(--text-0)",
          fontSize: "0.9rem",
          fontWeight: 600,
          listStyle: "none",
        }}
      >
        {q}
      </summary>
      <div style={{ color: "var(--text-1)", fontSize: "0.86rem", lineHeight: 1.7, marginTop: "0.6rem" }}>
        {a}
      </div>
    </details>
  );
}

export default function SoportePage() {
  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <Link href="/" className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}>
        ← inicio
      </Link>

      <header style={{ margin: "1rem 0 1.75rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./soporte.sh
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2, color: "var(--text-0)" }}>
          Soporte y contacto
        </h1>
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.68rem", marginTop: "0.4rem", lineHeight: 1.7 }}>
          ¿Dudas, un error, tu cuenta o tu suscripción? Estamos para ayudarte.
        </p>
      </header>

      <Section n="01" title="Escríbenos">
        <P>
          La forma más rápida de recibir ayuda es por correo. Respondemos normalmente en{" "}
          <b>1–2 días hábiles</b>. Cuéntanos qué pasó, en qué dispositivo (iPhone, iPad, Apple Watch o
          web) y, si es un error, qué estabas haciendo cuando ocurrió.
        </P>
        <ContactCard
          email="soporte@decanestesia.com"
          label="Soporte técnico"
          desc="Errores, problemas con la app, cuenta o suscripción."
        />
        <ContactCard
          email="hola@decanestesia.com"
          label="Consultas generales"
          desc="Preguntas, sugerencias y comentarios."
        />
        <ContactCard
          email="privacidad@decanestesia.com"
          label="Privacidad y datos"
          desc="Acceso, corrección o eliminación de tus datos."
        />
        <ContactCard
          email="legal@decanestesia.com"
          label="Legal"
          desc="Términos, licencias y asuntos legales."
        />
      </Section>

      <Section n="02" title="Preguntas frecuentes">
        <Faq
          q="¿Qué es DEC y para quién es?"
          a="DEC (Diluciones, Dosis & Cálculos anestésicos) es una herramienta de referencia y cálculo de apoyo para anestesiólogos y profesionales de anestesia. No sustituye el juicio clínico, la monitorización ni el protocolo institucional; la responsabilidad clínica final es del profesional."
        />
        <Faq
          q="¿Cómo recupero mi contraseña?"
          a={
            <>
              En la pantalla de inicio de sesión toca «¿Olvidaste tu contraseña?» y sigue el enlace que
              te llega por correo. Si no lo recibes, revisa spam o escríbenos a{" "}
              <a href="mailto:soporte@decanestesia.com" style={{ color: "var(--accent)" }}>
                soporte@decanestesia.com
              </a>
              .
            </>
          }
        />
        <Faq
          q="¿Qué pasa con mis datos de paciente?"
          a="Los datos de paciente que ingresas (peso, edad, etc.) se procesan y guardan únicamente en tu dispositivo. No se envían a nuestros servidores."
        />
        <Faq
          q="¿Cómo gestiono o cancelo mi suscripción?"
          a={
            <>
              Las suscripciones de la app se gestionan desde Apple: en tu iPhone, Ajustes ▸ tu nombre ▸
              Suscripciones ▸ DEC. Los reembolsos en iOS los gestiona Apple. Para cualquier otra duda,{" "}
              <a href="mailto:soporte@decanestesia.com" style={{ color: "var(--accent)" }}>
                escríbenos
              </a>
              .
            </>
          }
        />
        <Faq
          q="¿En qué dispositivos funciona?"
          a="iPhone, iPad y Apple Watch, además de la web en decanestesia.com."
        />
        <Faq
          q="Encontré un posible error clínico. ¿Qué hago?"
          a={
            <>
              Nos lo tomamos muy en serio. Escríbenos a{" "}
              <a href="mailto:errores@decanestesia.com" style={{ color: "var(--accent)" }}>
                errores@decanestesia.com
              </a>{" "}
              con el fármaco/cálculo y la fuente que consideres correcta, y lo revisamos con prioridad.
            </>
          }
        />
      </Section>

      <Section n="03" title="Legal y privacidad">
        <P>
          Consulta nuestros{" "}
          <Link href="/legal/terminos" style={{ color: "var(--accent)" }}>
            términos
          </Link>
          ,{" "}
          <Link href="/legal/privacidad" style={{ color: "var(--accent)" }}>
            política de privacidad
          </Link>
          ,{" "}
          <Link href="/legal/cookies" style={{ color: "var(--accent)" }}>
            cookies
          </Link>{" "}
          y el{" "}
          <Link href="/legal/aviso-medico" style={{ color: "var(--accent)" }}>
            aviso médico
          </Link>
          .
        </P>
      </Section>

      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem", lineHeight: 1.7, opacity: 0.75 }}>
          {"// DEC · decanestesia.com · soporte@decanestesia.com"}
          <br />
          {"// herramienta de apoyo para profesionales — la responsabilidad clínica final es del profesional"}
        </p>
      </footer>
    </div>
  );
}
