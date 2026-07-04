"use client";

// ============================================================
// MAC — Concentración alveolar mínima
// Ajuste por edad + coadministración de N₂O (aditividad).
//
// MODELO:
//  - MAC40 = MAC de referencia a 40 años, 37 °C, 1 atm.
//  - Ajuste por edad (Nickalls & Mapleson):
//      MAC(edad) = MAC40 × 10^(−0.00269 × (edad − 40))
//    (≈ −6 % por década respecto a la edad de 40 años)
//  - MAC-awake ≈ 0.34 × MAC (concentración a la que se recupera
//    la respuesta a la orden verbal en ~50 %).
//  - MAC-BAR ≈ 1.5 × MAC (bloquea la respuesta adrenérgica al
//    estímulo quirúrgico en ~50 %).
//  - Coadministración de N₂O: aditividad de MAC. Cada agente
//    aporta una fracción = concentración / MAC del agente. La
//    suma de fracciones para "1 MAC total" = 1. Si el N₂O aporta
//    fracción f_N2O, el volátil solo necesita cubrir (1 − f_N2O):
//      volátil objetivo (%) = MAC_volátil(edad) × (1 − f_N2O)
//
// FUENTES (Vancouver breve):
//  - Nickalls RWD, Mapleson WW. Age-related iso-MAC charts for
//    isoflurane, sevoflurane and desflurane in man.
//    Br J Anaesth. 2003;91(2):170-174.  (ecuación por edad)
//  - Eger EI 2nd. Age, minimum alveolar anesthetic concentration,
//    and minimum alveolar anesthetic concentration-awake.
//    Anesth Analg. 2001;93(4):947-953.  (MAC-awake ≈ 0.34 MAC)
//  - Miller's Anesthesia (referencia general de valores MAC40,
//    MAC-BAR ≈ 1.5 MAC y aditividad del N₂O).
//
// Valores y factores tal como los reporta la literatura. NO inventados.
// ============================================================

import { useMemo, useState } from "react";
import Link from "next/link";

// ------------------------------------------------------------
// Parsing — acepta coma o punto como separador decimal
// ------------------------------------------------------------
function parseNumber(text: string): number | null {
  const raw = text.trim();
  if (raw.length === 0) return null;
  const n = Number(raw.replace(",", "."));
  return Number.isNaN(n) ? null : n;
}

// ------------------------------------------------------------
// Agentes — MAC40 (a 40 años, 37 °C, 1 atm) en % vol.
// ------------------------------------------------------------
type AgentKey = "sevoflurano" | "isoflurano" | "desflurano" | "halotano";

interface AgentDef {
  key: AgentKey;
  label: string;
  mac40: number; // % vol a 40 años
}

const AGENTS: AgentDef[] = [
  { key: "sevoflurano", label: "Sevoflurano", mac40: 2.05 },
  { key: "isoflurano", label: "Isoflurano", mac40: 1.17 },
  { key: "desflurano", label: "Desflurano", mac40: 6.6 },
  { key: "halotano", label: "Halotano", mac40: 0.75 },
];

// MAC40 del N₂O (a 40 años). El N₂O no se usa como agente único
// aquí (su MAC > 100 % es inalcanzable a 1 atm), sino como
// coadyuvante cuya fracción de MAC se resta al volátil.
const N2O_MAC40 = 104;

// Factores derivados de la MAC ajustada por edad
const MAC_AWAKE_FACTOR = 0.34; // MAC-awake ≈ 0.34 × MAC (Eger 2001)
const MAC_BAR_FACTOR = 1.5; // MAC-BAR ≈ 1.5 × MAC (Miller)

// ------------------------------------------------------------
// Ajuste por edad (Nickalls & Mapleson, BJA 2003)
//   MAC(edad) = MAC40 × 10^(−0.00269 × (edad − 40))
// ------------------------------------------------------------
function macAtAge(mac40: number, ageYears: number): number {
  return mac40 * Math.pow(10, -0.00269 * (ageYears - 40));
}

// ------------------------------------------------------------
// Componente
// ------------------------------------------------------------
export default function MacClient() {
  const [agentKey, setAgentKey] = useState<AgentKey>("sevoflurano");
  const [ageText, setAgeText] = useState("");
  const [n2oText, setN2oText] = useState("");

  const agent = useMemo(
    () => AGENTS.find((a) => a.key === agentKey) ?? AGENTS[0],
    [agentKey]
  );

  const age = useMemo(() => parseNumber(ageText), [ageText]);
  const n2oRaw = useMemo(() => parseNumber(n2oText), [n2oText]);

  // Validación de rangos fisiológicos / de uso
  const ageValid = age !== null && age >= 0 && age <= 120;
  // N₂O opcional: 0–80 % (rango clínico habitual; se mantiene FiO₂ segura)
  const n2oValid = n2oRaw !== null && n2oRaw > 0 && n2oRaw <= 80;
  const n2oPct = n2oValid ? n2oRaw! : 0;

  // MAC del volátil ajustada por edad (1 MAC = 100 % del agente)
  const macAge = useMemo(
    () => (ageValid ? macAtAge(agent.mac40, age!) : null),
    [ageValid, agent, age]
  );

  // MAC del N₂O ajustada por edad (para calcular su fracción de MAC)
  const n2oMacAge = useMemo(
    () => (ageValid ? macAtAge(N2O_MAC40, age!) : null),
    [ageValid, age]
  );

  // Fracción de MAC aportada por el N₂O administrado (aditividad)
  const n2oFraction = useMemo(() => {
    if (n2oMacAge === null || n2oPct <= 0) return 0;
    return n2oPct / n2oMacAge; // p. ej. 60 % / ~104 % ≈ 0.58 MAC
  }, [n2oMacAge, n2oPct]);

  // MAC-awake y MAC-BAR sobre la MAC ajustada por edad (sin N₂O)
  const macAwake = useMemo(
    () => (macAge !== null ? macAge * MAC_AWAKE_FACTOR : null),
    [macAge]
  );
  const macBar = useMemo(
    () => (macAge !== null ? macAge * MAC_BAR_FACTOR : null),
    [macAge]
  );

  // % de volátil objetivo para alcanzar 1 MAC TOTAL cuando hay N₂O:
  //   volátil = MAC_volátil(edad) × (1 − f_N2O)   (acotado a ≥ 0)
  const volatileTarget = useMemo(() => {
    if (macAge === null) return null;
    const target = macAge * (1 - n2oFraction);
    return target < 0 ? 0 : target;
  }, [macAge, n2oFraction]);

  const clearAll = () => {
    setAgeText("");
    setN2oText("");
  };

  const labelStyle: React.CSSProperties = {
    color: "var(--text-3)",
    fontSize: "0.6rem",
    display: "block",
    marginBottom: "0.25rem",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  };

  const ready = macAge !== null;

  return (
    <div
      className="wrap"
      style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}
    >
      {/* Header estándar */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./mac.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
          MAC — concentración alveolar mínima
        </h1>
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.65rem",
            marginTop: "0.25rem",
            lineHeight: 1.7,
          }}
        >
          ajuste por edad (Nickalls &amp; Mapleson) + coadministración de N₂O
          <br />
          {/* humor negro — no aplica al contenido clínico */}
          <span style={{ opacity: 0.6 }}>
            {"// la MAC baja con la edad; el paciente añejo se sobredosifica solo"}
          </span>
        </p>
      </div>

      {/* ==================== PARÁMETROS ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> PARÁMETROS
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.85rem" }}>
          {/* Agente (segmented) */}
          <div>
            <label className="mono" style={labelStyle}>
              Agente volátil
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1px",
                background: "var(--border)",
                border: "1px solid var(--border)",
              }}
            >
              {AGENTS.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => setAgentKey(a.key)}
                  className="mono"
                  style={{
                    padding: "0.5rem 0.25rem",
                    fontSize: "0.62rem",
                    cursor: "pointer",
                    border: "none",
                    background:
                      a.key === agentKey ? "var(--accent)" : "var(--bg-1)",
                    color: a.key === agentKey ? "#000" : "var(--text-2)",
                    transition: "all 0.15s",
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
            <div
              className="mono"
              style={{
                color: "var(--text-3)",
                fontSize: "0.55rem",
                marginTop: "0.35rem",
              }}
            >
              {`// MAC40 de referencia (40 años, 37 °C, 1 atm) = ${agent.mac40.toFixed(2)} %`}
            </div>
          </div>

          {/* Edad + N₂O */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            {/* Edad */}
            <div>
              <label className="mono" style={labelStyle}>
                Edad (años)
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="55"
                value={ageText}
                onChange={(e) => setAgeText(e.target.value)}
                min={0}
                max={120}
                step="any"
              />
            </div>

            {/* N₂O opcional */}
            <div>
              <label className="mono" style={labelStyle}>
                N₂O (%) — opcional
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="60"
                value={n2oText}
                onChange={(e) => setN2oText(e.target.value)}
                min={0}
                max={80}
                step="any"
              />
            </div>
          </div>

          {/* Nota N₂O */}
          <div
            className="mono"
            style={{ color: "var(--text-3)", fontSize: "0.55rem", lineHeight: 1.6 }}
          >
            {"// N₂O opcional (0–80 %): aporta fracción de su propia MAC (aditividad)"}
            {n2oValid && n2oMacAge !== null ? (
              <>
                <br />
                {`// N₂O ${n2oPct.toFixed(0)} % ÷ MAC N₂O(edad) ${n2oMacAge.toFixed(0)} % ≈ ${n2oFraction.toFixed(2)} MAC`}
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* ==================== RESULTADO ==================== */}
      {ready && macAge !== null && macAwake !== null && macBar !== null ? (
        <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
          <div className="panel-header">
            <span className="dot" /> RESULTADO
          </div>
          <div className="panel-body" style={{ display: "grid", gap: "0.85rem" }}>
            {/* MAC ajustada grande */}
            <div style={{ textAlign: "center", padding: "0.5rem 0 0.25rem" }}>
              <div
                className="mono"
                style={{
                  color: "var(--text-3)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "0.25rem",
                }}
              >
                MAC ajustada por edad — {agent.label}
              </div>
              <div className="calc-result" style={{ color: "var(--accent)" }}>
                {macAge.toFixed(2)}
                <span
                  className="mono"
                  style={{ color: "var(--text-3)", fontSize: "1rem" }}
                >
                  {" "}
                  %
                </span>
              </div>
              <div
                className="mono"
                style={{
                  color: "var(--text-3)",
                  fontSize: "0.55rem",
                  marginTop: "0.3rem",
                }}
              >
                {`${agent.mac40.toFixed(2)} × 10^(−0.00269 × (${age} − 40)) = ${macAge.toFixed(2)} %`}
              </div>
            </div>

            {/* MAC-awake + MAC-BAR */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
              }}
            >
              {/* MAC-awake */}
              <div
                style={{
                  textAlign: "center",
                  padding: "0.5rem 0.25rem",
                  border: "1px solid var(--border)",
                  background: "var(--bg-1)",
                }}
              >
                <div
                  className="mono"
                  style={{
                    color: "var(--text-3)",
                    fontSize: "0.55rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: "0.25rem",
                  }}
                >
                  MAC-awake (0.34×)
                </div>
                <div className="calc-result" style={{ color: "var(--cyan)", fontSize: "1.6rem" }}>
                  {macAwake.toFixed(2)}
                  <span
                    className="mono"
                    style={{ color: "var(--text-3)", fontSize: "0.85rem" }}
                  >
                    {" "}
                    %
                  </span>
                </div>
              </div>

              {/* MAC-BAR */}
              <div
                style={{
                  textAlign: "center",
                  padding: "0.5rem 0.25rem",
                  border: "1px solid var(--border)",
                  background: "var(--bg-1)",
                }}
              >
                <div
                  className="mono"
                  style={{
                    color: "var(--text-3)",
                    fontSize: "0.55rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: "0.25rem",
                  }}
                >
                  MAC-BAR (1.5×)
                </div>
                <div className="calc-result" style={{ color: "var(--purple, #a855f7)", fontSize: "1.6rem" }}>
                  {macBar.toFixed(2)}
                  <span
                    className="mono"
                    style={{ color: "var(--text-3)", fontSize: "0.85rem" }}
                  >
                    {" "}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Volátil objetivo con N₂O (aditividad) */}
            {n2oValid && volatileTarget !== null ? (
              <div
                className="panel"
                style={{
                  borderLeft: "3px solid var(--amber)",
                  background: "var(--bg-1)",
                }}
              >
                <div
                  className="panel-body"
                  style={{ display: "grid", gap: "0.35rem" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      className="mono"
                      style={{
                        color: "var(--amber)",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      {agent.label} objetivo con N₂O: {volatileTarget.toFixed(2)} %
                    </span>
                    <span
                      className="mono"
                      style={{
                        fontSize: "0.55rem",
                        padding: "0.1rem 0.4rem",
                        background: "var(--bg-3)",
                        color: "var(--text-2)",
                        border: "1px solid var(--border-hi)",
                        borderRadius: "9999px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      1 MAC total
                    </span>
                  </div>
                  <p
                    style={{
                      color: "var(--text-1)",
                      fontSize: "0.76rem",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    Para 1 MAC total con N₂O al {n2oPct.toFixed(0)} % (≈{" "}
                    {n2oFraction.toFixed(2)} MAC), el volátil solo debe cubrir el
                    resto: {macAge.toFixed(2)} % × (1 − {n2oFraction.toFixed(2)}) ={" "}
                    <strong>{volatileTarget.toFixed(2)} %</strong> de {agent.label}.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        /* Hint si faltan / son inválidos los inputs */
        <div
          className="mono"
          style={{
            padding: "1.5rem",
            textAlign: "center",
            color: "var(--text-3)",
            fontSize: "0.7rem",
            border: "1px dashed var(--border)",
            background: "var(--bg-1)",
            marginBottom: "1rem",
            lineHeight: 1.7,
          }}
        >
          Selecciona agente e ingresa edad (0–120 años) para calcular la MAC.
          <br />
          <span style={{ opacity: 0.5, fontSize: "0.6rem" }}>
            {"// N₂O (0–80 %) es opcional; fuera de rango no computa"}
          </span>
        </div>
      )}

      {/* Limpiar */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          type="button"
          onClick={clearAll}
          className="btn btn-outline btn-sm"
        >
          limpiar campos
        </button>
      </div>

      {/* ==================== REFERENCIA: MAC40 por agente ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> MAC40 DE REFERENCIA (40 años, 37 °C, 1 atm)
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 420,
              }}
            >
              <thead>
                <tr style={{ background: "var(--bg-3)" }}>
                  {["Agente", "MAC40 (%)", "MAC-awake (0.34×)", "MAC-BAR (1.5×)"].map(
                    (h) => (
                      <th
                        key={h}
                        className="mono"
                        style={{
                          textAlign: "left",
                          padding: "0.5rem 0.7rem",
                          fontSize: "0.6rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "var(--text-2)",
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {AGENTS.map((a) => (
                  <tr
                    key={a.key}
                    style={{
                      borderTop: "1px solid var(--border)",
                      background:
                        a.key === agentKey ? "var(--accent-glow)" : "transparent",
                    }}
                  >
                    <td
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.76rem",
                        color: "var(--text-0)",
                        fontWeight: 600,
                      }}
                    >
                      {a.label}
                    </td>
                    <td
                      className="mono"
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.76rem",
                        color: "var(--accent)",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {a.mac40.toFixed(2)}
                    </td>
                    <td
                      className="mono"
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.76rem",
                        color: "var(--cyan)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {(a.mac40 * MAC_AWAKE_FACTOR).toFixed(2)}
                    </td>
                    <td
                      className="mono"
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.76rem",
                        color: "var(--purple, #a855f7)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {(a.mac40 * MAC_BAR_FACTOR).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {/* N₂O como fila informativa */}
                <tr style={{ borderTop: "1px solid var(--border)" }}>
                  <td
                    style={{
                      padding: "0.5rem 0.7rem",
                      fontSize: "0.76rem",
                      color: "var(--text-1)",
                      fontWeight: 600,
                    }}
                  >
                    N₂O <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>(coadyuvante)</span>
                  </td>
                  <td
                    className="mono"
                    style={{
                      padding: "0.5rem 0.7rem",
                      fontSize: "0.76rem",
                      color: "var(--text-2)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {N2O_MAC40}
                  </td>
                  <td
                    className="mono"
                    style={{ padding: "0.5rem 0.7rem", fontSize: "0.7rem", color: "var(--text-3)" }}
                    colSpan={2}
                  >
                    {"// MAC > 100 % → inalcanzable a 1 atm; se usa por aditividad"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div
          className="mono"
          style={{
            padding: "0.6rem 0.75rem",
            borderTop: "1px solid var(--border)",
            color: "var(--text-3)",
            fontSize: "0.55rem",
            lineHeight: 1.6,
          }}
        >
          {"// MAC-awake y MAC-BAR mostrados aquí a 40 años; ambos escalan con la MAC ajustada por edad"}
        </div>
      </div>

      {/* ==================== NOTAS CLÍNICAS ==================== */}
      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <div className="panel-header">
          <span className="dot" /> NOTAS
        </div>
        <div className="panel-body">
          <ul
            style={{
              margin: 0,
              paddingLeft: "1.1rem",
              color: "var(--text-1)",
              fontSize: "0.78rem",
              lineHeight: 1.7,
            }}
          >
            <li style={{ marginBottom: "0.4rem" }}>
              1 MAC previene el movimiento ante la incisión en ~50 % de los
              pacientes. La MAC desciende con la edad ~6 % por década respecto a la
              referencia de 40 años (Nickalls &amp; Mapleson).
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              <strong>MAC-awake</strong> (≈ 0.34 × MAC) aproxima la concentración de
              recuperación/pérdida de la respuesta a la orden verbal;{" "}
              <strong>MAC-BAR</strong> (≈ 1.5 × MAC) atenúa la respuesta adrenérgica
              al estímulo quirúrgico.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              La coadministración de N₂O es <strong>aditiva</strong>: cada agente
              aporta su fracción de MAC. El N₂O al 60–70 % aporta ~0.6–0.7 MAC y
              reduce proporcionalmente el volátil necesario.
            </li>
            <li style={{ marginBottom: "0" }}>
              La MAC efectiva también baja con opioides, benzodiacepinas,
              hipotermia, hiponatremia, embarazo y α₂-agonistas; sube con
              hipertermia, hipernatremia, cronismo alcohólico y simpaticomiméticos.
              Este cálculo <strong>no</strong> incorpora esos moduladores: titula
              siempre por el paciente y la monitorización.
            </li>
          </ul>
        </div>
      </div>

      {/* ==================== FUENTES ==================== */}
      <div
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.6rem",
          lineHeight: 1.8,
          marginBottom: "1.25rem",
        }}
      >
        <div style={{ color: "var(--text-2)", marginBottom: "0.3rem" }}>
          Fuentes
        </div>
        Nickalls RWD, Mapleson WW. Age-related iso-MAC charts for isoflurane,
        sevoflurane and desflurane in man. Br J Anaesth. 2003;91(2):170-174.
        <br />
        Eger EI 2nd. Age, minimum alveolar anesthetic concentration, and minimum
        alveolar anesthetic concentration-awake. Anesth Analg. 2001;93(4):947-953.
        <br />
        Gropper MA, et al. Miller&apos;s Anesthesia. 9.ª ed. Elsevier; 2020
        (valores MAC de referencia, MAC-BAR ≈ 1.5 MAC y aditividad del N₂O).
      </div>

      {/* Disclaimer con humor negro */}
      <p
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.55rem",
          opacity: 0.6,
          textAlign: "center",
          lineHeight: 1.7,
        }}
      >
        {"// MAC — estimación poblacional de literatura aceptada, no una dosis fija"}
        <br />
        {"// no incorpora opioides, temperatura ni otros moduladores; titula por el paciente"}
        <br />
        {"// el vaporizador obedece al número; el paciente obedece a la farmacología"}
      </p>

      {/* Volver */}
      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <Link
          href="/calculadoras"
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.7rem",
            textDecoration: "none",
          }}
        >
          ← /calculadoras
        </Link>
      </div>
    </div>
  );
}
