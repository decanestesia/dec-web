import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre el autor",
  description: "Conoce al creador de DEC Anestesia: Dr. Jophiel Espaillat, anestesiólogo y neuroanestesiólogo.",
};

export default function AboutPage() {
  return (
    <div className="wrap-narrow" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div className="prompt mono" style={{ marginBottom: "1rem" }}><b>$</b> cat /etc/about</div>

      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Sobre el autor</h1>
        <p style={{ color: "var(--text-2)", fontSize: "0.85rem" }}>
          La persona detrás de la app que te salva de googlear dosis a las 3 AM.
        </p>
      </header>

      {/* Bio */}
      <div className="panel" style={{ marginBottom: "2rem" }}>
        <div className="panel-header"><span className="dot" style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 6px var(--accent)" }} /> PERFIL</div>
        <div className="panel-body">
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.35rem" }}>Dr. Jophiel Espaillat Caldentey</h2>
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <span className="tag tag-accent">Anestesiólogo</span>
            <span className="tag tag-accent">Neuroanestesiólogo</span>
            <span className="tag tag-muted">iOS Developer</span>
          </div>
          <p style={{ color: "var(--text-1)", fontSize: "0.85rem", lineHeight: 1.8, marginBottom: "1rem" }}>
            Médico anestesiólogo con enfoque en neuroanestesiología, apasionado por la intersección entre la medicina clínica y la tecnología. DEC nació de una frustración real: la falta de herramientas rápidas, confiables y sin publicidad para calcular dosis e infusiones en el punto de atención.
          </p>
          <p style={{ color: "var(--text-1)", fontSize: "0.85rem", lineHeight: 1.8 }}>
            Cada fármaco en la base de datos ha sido revisado contra fuentes actualizadas. Cada calculadora ha sido validada contra los cálculos manuales que hacemos todos los días. DEC no es un proyecto de un programador que buscó datos en Google — es una herramienta construida por alguien que administra estos fármacos.
          </p>
        </div>
      </div>

      {/* Philosophy */}
      <div className="panel" style={{ marginBottom: "2rem" }}>
        <div className="panel-header">FILOSOFÍA</div>
        <div className="panel-body">
          <div className="prose">
            <h3>Por qué construí DEC</h3>
            <p>
              En el quirófano y la UCI no hay tiempo para buscar en PDFs, scrollear aplicaciones con ads, o preguntarle a Google cuántos microgramos tiene una ampolla de norepinefrina. Necesitas la respuesta en 5 segundos, no en 5 minutos.
            </p>
            <h3>Principios</h3>
            <ul>
              <li><strong>Sin publicidad.</strong> Nunca. Tu paciente no necesita que veas un ad de zapatos mientras calculas una dosis de vasopresina.</li>
              <li><strong>Offline first.</strong> La señal en el quirófano es impredecible. DEC funciona sin internet.</li>
              <li><strong>Datos verificables.</strong> Cada dosis tiene una fuente. Si encuentras un error, repórtalo.</li>
              <li><strong>Open data.</strong> La base de datos de fármacos es un JSON abierto que cualquier desarrollador puede consumir.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="panel" style={{ borderLeft: "3px solid var(--accent)" }}>
        <div className="panel-body">
          <p className="mono" style={{ color: "var(--text-2)", fontSize: "0.7rem", lineHeight: 1.7 }}>
            ¿Encontraste un error en una dosis? ¿Quieres sugerir un fármaco?
            <br />¿Tienes una idea para mejorar DEC?
          </p>
          <p className="mono" style={{ color: "var(--accent)", fontSize: "0.75rem", marginTop: "0.5rem" }}>
            → contacto@decanestesia.com
          </p>
        </div>
      </div>
    </div>
  );
}
