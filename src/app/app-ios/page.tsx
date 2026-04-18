import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "App iOS — DEC Anestesia",
  description: "Descarga DEC para iPhone y iPad. Calculadoras de infusión, 128+ fármacos, análisis de electrolitos, ROTEM/TEG y más.",
};

export default function AppIOSPage() {
  return (
    <div className="wrap" style={{ paddingTop: "2rem", paddingBottom: "3rem", maxWidth: 800, margin: "0 auto" }}>
      <div className="prompt mono" style={{ marginBottom: "1rem" }}><b>$</b> cat /app/ios</div>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "2rem 0 3rem" }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📱</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          DEC para <span style={{ color: "var(--accent)" }}>iOS</span>
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: "0.9rem", maxWidth: 480, margin: "0 auto 2rem" }}>
          Tu referencia clínica de bolsillo. 128+ fármacos, 6 calculadoras, análisis automático — todo sin internet.
        </p>
        <div className="panel" style={{ display: "inline-block", borderLeft: "3px solid var(--amber)" }}>
          <div className="panel-body">
            <p className="mono" style={{ color: "var(--amber)", fontSize: "0.7rem" }}>
              ⏳ Próximamente en el App Store
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ marginBottom: "2.5rem" }}>
        <div className="prompt mono" style={{ marginBottom: "0.75rem" }}><b>$</b> ls /app/features/</div>
        <div className="feat-grid stagger">
          <AppFeat icon="💊" title="128+ Fármacos" desc="Base de datos completa con dosis, presentaciones, diluciones y rangos terapéuticos." />
          <AppFeat icon="🧮" title="Calculadora bidireccional" desc="Dosis → velocidad y velocidad → dosis. 10 unidades de salida." />
          <AppFeat icon="🧬" title="Electrolitos y ABG" desc="Análisis automático de Na, K, Ca, Mg, P, gasometría y oximometría con severidad." />
          <AppFeat icon="🩸" title="ROTEM / TEG" desc="Interpretación de pruebas viscoelásticas con manejo sugerido." />
          <AppFeat icon="📐" title="Antropometría" desc="IMC, peso ideal, peso magro, TBV, ABW, PSP compartidos entre secciones." />
          <AppFeat icon="🧪" title="Salino hipertónico" desc="Calculadora de mezclas de NaCl con indicaciones clínicas." />
          <AppFeat icon="🔄" title="Actualización remota" desc="Base de datos sincronizada desde la nube. Sin actualizar la app." />
          <AppFeat icon="✈️" title="100% offline" desc="Funciona sin internet. Pantalla siempre activa durante procedimientos." />
          <AppFeat icon="🌙" title="Tema oscuro" desc="Diseñado para no cegar al anestesiólogo en quirófano a las 6 AM." />
        </div>
      </section>

      {/* Requirements */}
      <section>
        <div className="panel">
          <div className="panel-header">REQUISITOS</div>
          <div className="panel-body">
            <div className="data-row">
              <span className="data-label">Plataforma</span>
              <span className="mono" style={{ color: "var(--text-0)", fontSize: "0.8rem" }}>iOS 17.0+</span>
            </div>
            <div className="data-row">
              <span className="data-label">Dispositivos</span>
              <span className="mono" style={{ color: "var(--text-0)", fontSize: "0.8rem" }}>iPhone y iPad</span>
            </div>
            <div className="data-row">
              <span className="data-label">Tamaño</span>
              <span className="mono" style={{ color: "var(--text-0)", fontSize: "0.8rem" }}>~5 MB</span>
            </div>
            <div className="data-row">
              <span className="data-label">Precio</span>
              <span className="mono" style={{ color: "var(--accent)", fontSize: "0.8rem", fontWeight: 600 }}>Gratis</span>
            </div>
            <div className="data-row">
              <span className="data-label">Publicidad</span>
              <span className="mono" style={{ color: "var(--accent)", fontSize: "0.8rem", fontWeight: 600 }}>Ninguna. Nunca.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function AppFeat({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="fade-up" style={{ padding: "1rem" }}>
      <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>{icon}</div>
      <div style={{ color: "var(--text-0)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>{title}</div>
      <p style={{ color: "var(--text-2)", fontSize: "0.75rem", lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}
