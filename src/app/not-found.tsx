import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-dec py-20 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-4" style={{ opacity: 0.3 }}>💀</div>

        <h1
          className="text-4xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          404
        </h1>

        <p
          className="text-sm mb-1"
          style={{ color: "var(--text-secondary)" }}
        >
          Página no encontrada.
        </p>

        <p
          className="text-xs mb-8"
          style={{
            color: "var(--text-muted)",
            fontFamily: "SF Mono, monospace",
          }}
        >
          // esta página, como tu paciente sin pulso, no responde.
          <br />
          // pero a diferencia de él, esta no la puedes reanimar.
        </p>

        <Link href="/" className="btn-primary">
          Volver al inicio →
        </Link>
      </div>
    </div>
  );
}
