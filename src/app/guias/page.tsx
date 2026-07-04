import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guías clínicas — DEC",
  description:
    "Guías de referencia perioperatoria: extubación y pruebas de retirada del ventilador, transfusión y hemoderivados.",
};

interface GuideCard {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
  tag: string;
}

const GUIDES: GuideCard[] = [
  { href: "/guias/extubacion", icon: "🫁", title: "Extubación y destete", subtitle: "Criterios, SBT, RSBI, prueba de fuga, predictores de reintubación", tag: "WEAN" },
  { href: "/guias/transfusion", icon: "🩸", title: "Transfusión y hemoderivados", subtitle: "Umbrales, dosis, velocidad, compatibilidad, transfusión masiva", tag: "TX" },
  { href: "/guias/hipertermia-maligna", icon: "🔥", title: "Hipertermia maligna", subtitle: "Reconocimiento, manejo paso a paso, dantroleno por peso, línea MHAUS", tag: "MH" },
  { href: "/guias/anafilaxia", icon: "🚨", title: "Anafilaxia perioperatoria", subtitle: "Grados, adrenalina titulada, fluidos, triptasa", tag: "ANAF" },
  { href: "/guias/broncoespasmo-laringoespasmo", icon: "🌬️", title: "Broncoespasmo y laringoespasmo", subtitle: "Larson, profundizar, salbutamol, adrenalina, Mg", tag: "BRONCO" },
  { href: "/guias/hemorragia-postparto", icon: "🩸", title: "Hemorragia postparto (HPP)", subtitle: "4 T, uterotónicos, TXA, transfusión masiva", tag: "HPP" },
  { href: "/guias/preeclampsia-eclampsia", icon: "🤰", title: "Preeclampsia y eclampsia", subtitle: "Sulfato de Mg, HTA severa, neuroaxial", tag: "PE" },
  { href: "/guias/embolia-liquido-amniotico", icon: "💧", title: "Embolia de líquido amniótico", subtitle: "Colapso + CID, soporte, A-OK, cesárea perimortem", tag: "ELA" },
  { href: "/guias/feocromocitoma-crisis-htn", icon: "📈", title: "Feocromocitoma y crisis HTA", subtitle: "Alfa antes de beta, fentolamina, manejo intraop", tag: "FEO" },
  { href: "/guias/tormenta-tiroidea", icon: "♨️", title: "Tormenta tiroidea", subtitle: "Burch-Wartofsky, PTU, yodo, betabloqueo, esteroide", tag: "TT" },
  { href: "/guias/insuficiencia-suprarrenal", icon: "🧫", title: "Insuf. suprarrenal / esteroide estrés", subtitle: "Hidrocortisona, dosis de estrés por cirugía", tag: "ADRENAL" },
  { href: "/guias/serotoninergico-nms", icon: "🌡️", title: "Serotoninérgico y NMS", subtitle: "Clonus vs rigidez, ciproheptadina, dantroleno", tag: "SS/NMS" },
  { href: "/guias/anticoagulantes-perioperatorio", icon: "💊", title: "Anticoagulantes y neuroaxial (ASRA)", subtitle: "Intervalos de suspensión, bridging, reinicio", tag: "ASRA" },
  { href: "/guias/nvpo-manejo", icon: "🤢", title: "NVPO: profilaxis y rescate", subtitle: "Multimodal, dosis, rescate por clase distinta", tag: "NVPO" },
  { href: "/guias/delirium-emergencia", icon: "😵", title: "Delirium y agitación al despertar", subtitle: "CAM-ICU, PAED, prevención, dexmedetomidina", tag: "DELIRIUM" },
  { href: "/guias/paro-perioperatorio", icon: "⚡", title: "Paro perioperatorio (ACLS)", subtitle: "Causas reversibles, LAST, dosis, cesárea perimortem", tag: "ACLS" },
  { href: "/guias/sepsis-perioperatoria", icon: "🦠", title: "Sepsis y shock séptico", subtitle: "Paquete 1ª hora, fluidos, noradrenalina, foco", tag: "SEPSIS" },
  { href: "/guias/espinal-alta-total", icon: "🧊", title: "Bloqueo espinal alto / total", subtitle: "Reconocer, soporte ventilatorio, vasopresores", tag: "ESPINAL" },
  { href: "/guias/embolia-gaseosa-venosa", icon: "🫧", title: "Embolia gaseosa venosa (VAE)", subtitle: "Detección, Durant, aspirar CVC, soporte", tag: "VAE" },
  { href: "/guias/disreflexia-autonomica", icon: "⚡", title: "Disreflexia autonómica", subtitle: "Lesión ≥T6, HTA paroxística, retirar estímulo", tag: "DA" },
  { href: "/guias/reaccion-protamina", icon: "🐟", title: "Reacción a la protamina", subtitle: "Tipos I-III, HTP catastrófica, soporte VD", tag: "PROTAMINA" },
  { href: "/guias/crisis-hipertension-pulmonar", icon: "🫁", title: "Crisis de hipertensión pulmonar", subtitle: "iNO, prostaciclina, soporte VD, noradrenalina", tag: "HTP" },
  { href: "/guias/status-epilepticus", icon: "🧠", title: "Status epilepticus perioperatorio", subtitle: "Benzo → levetiracetam/fosfenitoína → infusión", tag: "STATUS" },
  { href: "/guias/metahemoglobinemia", icon: "🔵", title: "Metahemoglobinemia", subtitle: "Cianosis refractaria, azul de metileno, G6PD", tag: "MetHb" },
  { href: "/guias/crisis-celulas-falciformes", icon: "🩸", title: "Crisis de células falciformes", subtitle: "Evitar hipoxia/frío/acidosis, transfusión, STA", tag: "SICKLE" },
  { href: "/guias/bloqueos-regionales", icon: "🎯", title: "Bloqueos regionales — referencia", subtitle: "TAP, ESP, PECS, nervios · volúmenes y dosis máx", tag: "REGIONAL" },
  { href: "/guias/sindrome-reperfusion-aortico", icon: "⏱️", title: "Reperfusión por desclampaje aórtico", subtitle: "Desclampaje gradual, precarga, vasopresores", tag: "AORTA" },
];

export default function GuiasPage() {
  return (
    <div className="wrap" style={{ paddingTop: "2rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}>
      <div className="prompt mono blink" style={{ marginBottom: "1rem" }}>
        <b>$</b> ls /guias
      </div>
      <header style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Guías clínicas</h1>
        <p style={{ color: "var(--text-2)", fontSize: "0.85rem" }}>
          Referencia perioperatoria y de cuidados críticos, con umbrales citados de literatura aceptada.
        </p>
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem", marginTop: "0.35rem", opacity: 0.6 }}>
          {"// las guías se leen antes, no durante el código azul"}
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
        {GUIDES.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="card-interactive"
            style={{ textDecoration: "none", color: "inherit", display: "block", background: "var(--bg-2)", border: "1px solid var(--border)", padding: "1rem" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.6rem" }}>{g.icon}</span>
              <span className="tag tag-accent mono">{g.tag}</span>
            </div>
            <h2 style={{ color: "var(--text-0)", fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.3rem" }}>{g.title}</h2>
            <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem", lineHeight: 1.5 }}>{g.subtitle}</p>
          </Link>
        ))}
      </div>

      <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", marginTop: "1.5rem", opacity: 0.5, lineHeight: 1.7 }}>
        {"// referencia educativa — no sustituye el juicio clínico, la monitorización ni los protocolos institucionales"}
      </p>
    </div>
  );
}
