import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "5rem 1.5rem", textAlign: "center" }}>
      <div style={{ fontSize: "4rem", opacity: 0.15, marginBottom: "1rem" }}>💀</div>
      <h1 style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "0.25rem" }}>404</h1>
      <p style={{ color: "var(--text-1)", fontSize: "0.9rem", marginBottom: "0.35rem" }}>Página no encontrada.</p>
      <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem", lineHeight: 1.7, marginBottom: "2rem" }}>
        {"// esta página, como tu paciente sin pulso, no responde."}
        <br />
        {"// pero a diferencia de él, esta no la puedes reanimar."}
      </p>
      <Link href="/" className="btn btn-fill">Volver al inicio →</Link>
    </div>
  );
}
