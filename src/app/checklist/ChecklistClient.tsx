"use client";

// ============================================================
// CHECKLIST OMS + TIMERS DE RE-DOSIFICACIÓN — Client Component
//
// Dos herramientas en una ruta:
//   (1) Checklist quirúrgico de seguridad de la OMS (2009), 3 fases,
//       cada ítem marcable, progreso por fase, botón de reinicio.
//       Contenido oficial en src/lib/checklist.ts (WHO_PHASES).
//   (2) Timers de re-dosificación intraoperatoria: antibióticos por
//       vida media (intervalos ASHP/SCIP en src/lib/checklist.ts),
//       recordatorio de re-evaluación de TOF (relajante NM) y un
//       timer genérico configurable. Varios pueden correr a la vez;
//       cada uno avisa en rojo al vencer.
//
// EXACTITUD CLÍNICA: ningún valor inventado. Ítems del checklist =
// documento OMS 2009. Intervalos de ATB = tabla ASHP/IDSA/SIS/SHEA
// 2013 (re-dosis a ≈ 2 vidas medias). Fármacos de vida media larga
// NO se re-dosifican de rutina → se marcan como tales, sin fabricar
// un intervalo.
//
// El patrón de cronómetro (tick con setInterval a 250 ms + base
// acumulada en ref para sobrevivir a pausas) se reutiliza de
// CodigoClient.tsx (timer de código).
// ============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import {
  WHO_PHASES,
  WHO_SOURCE,
  ANTIBIOTICS,
  ANTIBIOTIC_SOURCE,
  type ChecklistPhase,
  type AntibioticRedose,
} from "@/lib/checklist";

// ------------------------------------------------------------
// Utilidad de reloj mm:ss (idéntica a la del timer de código)
// ------------------------------------------------------------
function fmtClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// ============================================================
// Componente raíz
// ============================================================
export default function ChecklistClient() {
  return (
    <div style={{ paddingBottom: "3rem" }}>
      {/* Barra superior */}
      <div
        className="wrap"
        style={{
          paddingTop: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", flexWrap: "wrap" }}>
          <span
            className="mono"
            style={{ color: "var(--accent)", fontSize: "0.9rem", fontWeight: 800, letterSpacing: "0.12em" }}
          >
            ✓ CHECKLIST OMS
          </span>
          <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.66rem" }}>
            seguridad quirúrgica · timers de re-dosificación
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          <span className="tag tag-muted">OMS/WHO 2009</span>
          <span className="tag tag-muted">ASHP/SCIP</span>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: "1.25rem" }}>
        {/* ─── (1) Checklist OMS ─── */}
        <ChecklistSection />

        {/* ─── (2) Timers de re-dosificación ─── */}
        <div style={{ marginTop: "2.75rem" }}>
          <RedoseSection />
        </div>

        {/* Disclaimer sobrio */}
        <footer style={{ marginTop: "2.75rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
          <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem", lineHeight: 1.8, opacity: 0.85 }}>
            Herramienta de apoyo. El checklist reproduce la lista de verificación de la seguridad quirúrgica de la
            OMS (2009) y no sustituye la implementación institucional ni la formación del equipo. Los intervalos de
            re-dosificación son valores de referencia para adultos con función renal normal (ASHP/IDSA/SIS/SHEA
            2013); la re-dosis también procede ante pérdida hemática importante o alteración de la farmacocinética.
            Verifica dosis, intervalo y vía según el protocolo local — la responsabilidad clínica es del equipo
            tratante.
          </p>
        </footer>
      </div>
    </div>
  );
}

// ============================================================
// (1) SECCIÓN CHECKLIST OMS
// ============================================================
function ChecklistSection() {
  // Estado marcado: set de ids de ítems marcados.
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const allItemIds = useMemo(
    () => WHO_PHASES.flatMap((p) => p.items.map((i) => i.id)),
    [],
  );
  const totalDone = useMemo(
    () => allItemIds.filter((id) => checked.has(id)).length,
    [allItemIds, checked],
  );

  function toggleItem(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function resetAll() {
    setChecked(new Set());
  }

  return (
    <section>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "0.6rem",
          marginBottom: "0.9rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", flexWrap: "wrap" }}>
          <span
            className="mono"
            style={{ color: "var(--accent)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}
          >
            ▸ lista de verificación de seguridad quirúrgica
          </span>
          <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>
            {totalDone}/{allItemIds.length} ítems
          </span>
        </div>
        <button
          onClick={resetAll}
          className="mono"
          style={{
            padding: "0.35rem 0.7rem",
            fontSize: "0.62rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            cursor: "pointer",
            background: "var(--bg-1)",
            color: "var(--text-2)",
            border: "1px solid var(--border-hi)",
          }}
        >
          ↺ reiniciar todo
        </button>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {WHO_PHASES.map((phase) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            checked={checked}
            onToggle={toggleItem}
          />
        ))}
      </div>

      {/* Cita OMS */}
      <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.58rem", lineHeight: 1.6, marginTop: "1rem" }}>
        {WHO_SOURCE}
      </p>
    </section>
  );
}

// ------------------------------------------------------------
// Tarjeta de fase (con progreso y sus ítems)
// ------------------------------------------------------------
function PhaseCard({
  phase,
  checked,
  onToggle,
}: {
  phase: ChecklistPhase;
  checked: Set<string>;
  onToggle: (id: string) => void;
}) {
  const done = phase.items.filter((i) => checked.has(i.id)).length;
  const total = phase.items.length;
  const complete = done === total;
  const pct = Math.round((done / total) * 100);
  const accent = complete ? "var(--accent)" : "var(--cyan)";

  return (
    <div
      className="panel"
      style={{
        background: "var(--bg-2)",
        borderTop: `2px solid ${accent}`,
        overflow: "hidden",
      }}
    >
      {/* Cabecera de fase */}
      <div style={{ padding: "0.75rem 0.85rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.6rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.55rem", flexWrap: "wrap" }}>
            <span style={{ color: "var(--text-0)", fontSize: "1.05rem", fontWeight: 800, lineHeight: 1.1 }}>
              {phase.title}
            </span>
            <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", textTransform: "lowercase" }}>
              {phase.englishTerm.toLowerCase()}
            </span>
          </div>
          <span
            className="mono"
            style={{
              color: complete ? "var(--accent)" : "var(--text-2)",
              fontSize: "0.66rem",
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {done}/{total}
          </span>
        </div>
        <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", marginTop: "0.25rem" }}>
          {phase.timing} · {phase.team.toLowerCase()}
        </div>
        {/* Barra de progreso */}
        <div
          style={{
            marginTop: "0.5rem",
            height: 4,
            background: "var(--bg-0)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: accent,
              transition: "width 0.2s ease",
            }}
          />
        </div>
      </div>

      {/* Ítems */}
      <div style={{ display: "grid" }}>
        {phase.items.map((item, idx) => {
          const isChecked = checked.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              aria-pressed={isChecked}
              className="card-interactive"
              style={{
                textAlign: "left",
                cursor: "pointer",
                background: isChecked ? "var(--accent-glow)" : "var(--bg-2)",
                border: "none",
                borderTop: idx === 0 ? "none" : "1px solid var(--border)",
                padding: "0.7rem 0.85rem",
                display: "flex",
                gap: "0.65rem",
                alignItems: "flex-start",
              }}
            >
              {/* Checkbox */}
              <span
                aria-hidden
                style={{
                  flexShrink: 0,
                  width: 20,
                  height: 20,
                  marginTop: "0.05rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1.5px solid ${isChecked ? "var(--accent)" : "var(--border-hi)"}`,
                  background: isChecked ? "var(--accent)" : "transparent",
                  color: "#000",
                  fontSize: "0.75rem",
                  fontWeight: 900,
                }}
              >
                {isChecked ? "✓" : ""}
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                <span
                  style={{
                    color: isChecked ? "var(--text-2)" : "var(--text-0)",
                    fontSize: "0.84rem",
                    fontWeight: 500,
                    lineHeight: 1.4,
                    textDecorationLine: isChecked ? "line-through" : "none",
                  }}
                >
                  {item.label}
                </span>
                {item.hint && (
                  <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem", lineHeight: 1.4 }}>
                    {item.hint}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// (2) SECCIÓN TIMERS DE RE-DOSIFICACIÓN
// ============================================================

// Modelo de un timer activo en pantalla.
interface ActiveTimer {
  /** id único de la instancia. */
  key: string;
  /** Etiqueta a mostrar (ej. "Cefazolina", "TOF", "Genérico"). */
  label: string;
  /** Sublabel opcional (intervalo/nota). */
  sublabel: string;
  /** Duración objetivo en segundos; al vencer se avisa en rojo. */
  targetSec: number;
}

let timerSeq = 0;
function nextKey(prefix: string): string {
  timerSeq += 1;
  return `${prefix}-${timerSeq}`;
}

function RedoseSection() {
  const [timers, setTimers] = useState<ActiveTimer[]>([]);

  // Selección de antibiótico y timer genérico.
  const [selectedAbx, setSelectedAbx] = useState<string>(ANTIBIOTICS[0]?.id ?? "");
  const [genericMin, setGenericMin] = useState<string>("30");
  const [genericLabel, setGenericLabel] = useState<string>("");

  const selectedAbxData: AntibioticRedose | undefined = useMemo(
    () => ANTIBIOTICS.find((a) => a.id === selectedAbx),
    [selectedAbx],
  );

  function addAbxTimer() {
    const abx = selectedAbxData;
    if (!abx) return;
    const intervalMin = abx.intervalMin;
    if (intervalMin == null) return; // sin re-dosis de rutina → no se crea timer
    setTimers((prev) => [
      ...prev,
      {
        key: nextKey("abx"),
        label: abx.name,
        sublabel: `re-dosis ${abx.intervalLabel} · t½ ${abx.halfLife}`,
        targetSec: intervalMin * 60,
      },
    ]);
  }

  function addTofTimer() {
    setTimers((prev) => [
      ...prev,
      {
        key: nextKey("tof"),
        label: "Relajante NM — reevaluar TOF",
        sublabel: "recordatorio genérico · no calcula dosis",
        targetSec: 20 * 60, // recordatorio a 20 min; sin cálculo de dosis
      },
    ]);
  }

  function addGenericTimer() {
    const min = Number(genericMin.replace(",", "."));
    if (!Number.isFinite(min) || min <= 0) return;
    setTimers((prev) => [
      ...prev,
      {
        key: nextKey("gen"),
        label: genericLabel.trim() !== "" ? genericLabel.trim() : "Timer genérico",
        sublabel: `objetivo ${min} min`,
        targetSec: Math.round(min * 60),
      },
    ]);
    setGenericLabel("");
  }

  function removeTimer(key: string) {
    setTimers((prev) => prev.filter((t) => t.key !== key));
  }

  const abxHasInterval = selectedAbxData?.intervalMin != null;

  return (
    <section>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", marginBottom: "0.9rem", flexWrap: "wrap" }}>
        <span
          className="mono"
          style={{ color: "var(--accent)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}
        >
          ▸ timers de re-dosificación intraoperatoria
        </span>
        <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>
          varios a la vez · aviso rojo al vencer
        </span>
      </div>

      {/* Panel de arranque de timers */}
      <div
        className="panel"
        style={{ background: "var(--bg-2)", padding: "0.85rem", display: "grid", gap: "1rem", marginBottom: "1.25rem" }}
      >
        {/* Antibiótico */}
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <span className="mono" style={{ color: "var(--text-2)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            antibiótico profiláctico
          </span>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "stretch" }}>
            <select
              value={selectedAbx}
              onChange={(e) => setSelectedAbx(e.target.value)}
              aria-label="Antibiótico profiláctico"
              className="mono"
              style={{
                flex: "1 1 200px",
                minHeight: 42,
                background: "var(--bg-1)",
                border: "1px solid var(--border-hi)",
                color: "var(--text-0)",
                padding: "0.4rem 0.6rem",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}
            >
              {ANTIBIOTICS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.intervalLabel}
                </option>
              ))}
            </select>
            <button
              onClick={addAbxTimer}
              disabled={!abxHasInterval}
              className="mono"
              style={{
                minHeight: 42,
                padding: "0.4rem 1rem",
                fontSize: "0.72rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                cursor: abxHasInterval ? "pointer" : "not-allowed",
                background: abxHasInterval ? "var(--accent)" : "var(--bg-1)",
                color: abxHasInterval ? "#000" : "var(--text-3)",
                border: `1px solid ${abxHasInterval ? "var(--accent)" : "var(--border-hi)"}`,
                opacity: abxHasInterval ? 1 : 0.7,
              }}
            >
              ▸ iniciar timer
            </button>
          </div>
          {/* Nota del ATB seleccionado */}
          {selectedAbxData && (
            <div
              className="mono"
              style={{
                fontSize: "0.62rem",
                lineHeight: 1.5,
                color: abxHasInterval ? "var(--text-3)" : "var(--amber)",
                borderLeft: `2px solid ${abxHasInterval ? "var(--border-hi)" : "var(--amber)"}`,
                paddingLeft: "0.55rem",
              }}
            >
              t½ {selectedAbxData.halfLife} · {selectedAbxData.note}
            </div>
          )}
        </div>

        {/* Relajante NM + genérico */}
        <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "1fr", borderTop: "1px solid var(--border)", paddingTop: "0.85rem" }} className="redose-extra-grid">
          {/* Relajante NM */}
          <div style={{ display: "grid", gap: "0.5rem" }}>
            <span className="mono" style={{ color: "var(--text-2)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              relajante neuromuscular
            </span>
            <button
              onClick={addTofTimer}
              className="mono"
              style={{
                minHeight: 42,
                padding: "0.4rem 1rem",
                fontSize: "0.72rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                cursor: "pointer",
                background: "var(--bg-3)",
                color: "var(--cyan)",
                border: "1px solid var(--cyan)",
              }}
            >
              ▸ recordatorio reevaluar TOF
            </button>
            <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.5 }}>
              recordatorio genérico de monitorización — no calcula dosis de relajante.
            </span>
          </div>

          {/* Genérico configurable */}
          <div style={{ display: "grid", gap: "0.5rem" }}>
            <span className="mono" style={{ color: "var(--text-2)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              timer genérico
            </span>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "stretch" }}>
              <input
                value={genericLabel}
                onChange={(e) => setGenericLabel(e.target.value)}
                placeholder="etiqueta…"
                aria-label="Etiqueta del timer genérico"
                className="mono"
                style={{
                  flex: "1 1 120px",
                  minHeight: 42,
                  background: "var(--bg-1)",
                  border: "1px solid var(--border-hi)",
                  color: "var(--text-0)",
                  padding: "0.4rem 0.6rem",
                  fontSize: "0.78rem",
                }}
              />
              <input
                inputMode="numeric"
                value={genericMin}
                onChange={(e) => setGenericMin(e.target.value)}
                placeholder="min"
                aria-label="Minutos del timer genérico"
                className="mono"
                style={{
                  width: 70,
                  minHeight: 42,
                  background: "var(--bg-1)",
                  border: "1px solid var(--border-hi)",
                  color: "var(--text-0)",
                  padding: "0.4rem 0.6rem",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                }}
              />
              <button
                onClick={addGenericTimer}
                className="mono"
                style={{
                  minHeight: 42,
                  padding: "0.4rem 0.9rem",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  background: "var(--bg-1)",
                  color: "var(--text-1)",
                  border: "1px solid var(--border-hi)",
                }}
              >
                + añadir
              </button>
            </div>
            <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.5 }}>
              cuenta ascendente hasta el objetivo en minutos; avisa al vencer.
            </span>
          </div>
        </div>
      </div>

      {/* Timers activos */}
      {timers.length === 0 ? (
        <div
          className="panel"
          style={{ background: "var(--bg-2)", padding: "1.5rem 1rem", textAlign: "center" }}
        >
          <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.72rem" }}>
            sin timers activos — arranca uno arriba
          </span>
        </div>
      ) : (
        <div className="redose-timer-grid">
          {timers.map((t) => (
            <RedoseTimer key={t.key} timer={t} onRemove={() => removeTimer(t.key)} />
          ))}
        </div>
      )}

      {/* Cita ATB */}
      <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.58rem", lineHeight: 1.6, marginTop: "1rem" }}>
        {ANTIBIOTIC_SOURCE}
      </p>

      <style jsx>{`
        .redose-timer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 0.75rem;
        }
        .redose-extra-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) {
          .redose-extra-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </section>
  );
}

// ------------------------------------------------------------
// Tarjeta de un timer activo (cuenta ascendente hasta el objetivo)
// Patrón de tick reutilizado de CodeTimer (CodigoClient).
// ------------------------------------------------------------
function RedoseTimer({ timer, onRemove }: { timer: ActiveTimer; onRemove: () => void }) {
  const [running, setRunning] = useState(true); // arranca corriendo al crearse
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  const baseRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now();
    const id = setInterval(() => {
      if (startRef.current != null) {
        const delta = Math.floor((Date.now() - startRef.current) / 1000);
        setElapsed(baseRef.current + delta);
      }
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  function toggle() {
    if (running) {
      baseRef.current = elapsed;
      setRunning(false);
    } else {
      baseRef.current = elapsed;
      setRunning(true);
    }
  }
  function reset() {
    setRunning(false);
    setElapsed(0);
    baseRef.current = 0;
    startRef.current = null;
  }

  const remaining = timer.targetSec - elapsed;
  const due = remaining <= 0;
  const clockColor = due ? "var(--red)" : "var(--text-0)";

  return (
    <div
      className="panel"
      style={{
        background: "var(--bg-2)",
        padding: "0.75rem 0.8rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        borderLeft: due ? "3px solid var(--red)" : "1px solid var(--border)",
        boxShadow: due ? "0 0 0 1px var(--red) inset" : "none",
      }}
    >
      {/* Cabecera */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem", minWidth: 0 }}>
          <span style={{ color: "var(--text-0)", fontSize: "0.82rem", fontWeight: 700, lineHeight: 1.2 }}>
            {timer.label}
          </span>
          <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.58rem", lineHeight: 1.3 }}>
            {timer.sublabel}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="mono"
          aria-label={`Quitar timer ${timer.label}`}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: "0.75rem", padding: "0.1rem 0.3rem", flexShrink: 0 }}
        >
          [×]
        </button>
      </div>

      {/* Reloj grande */}
      <div
        className="mono"
        style={{
          fontSize: "2.4rem",
          fontWeight: 800,
          lineHeight: 1,
          color: clockColor,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.02em",
          textShadow: due ? "0 0 24px rgba(239,68,68,0.35)" : "none",
        }}
      >
        {fmtClock(elapsed)}
      </div>

      {/* Estado / objetivo */}
      <div
        className="mono"
        style={{
          fontSize: "0.64rem",
          fontWeight: due ? 800 : 600,
          lineHeight: 1.4,
          color: due ? "var(--red)" : running ? "var(--accent)" : "var(--text-3)",
          minHeight: "1.4em",
        }}
      >
        {due ? (
          <span>⚠ RE-DOSIS DEBIDA · objetivo {fmtClock(timer.targetSec)}</span>
        ) : (
          <span>
            {running ? "● " : "‖ "}
            restan {fmtClock(remaining)} · objetivo {fmtClock(timer.targetSec)}
          </span>
        )}
      </div>

      {/* Controles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
        <button
          onClick={toggle}
          className="mono"
          style={{
            minHeight: 38,
            fontSize: "0.68rem",
            fontWeight: 700,
            textTransform: "uppercase",
            cursor: "pointer",
            background: "var(--bg-1)",
            color: "var(--text-1)",
            border: "1px solid var(--border-hi)",
          }}
        >
          {running ? "‖ pausa" : "▸ seguir"}
        </button>
        <button
          onClick={reset}
          className="mono"
          style={{
            minHeight: 38,
            fontSize: "0.68rem",
            fontWeight: 700,
            textTransform: "uppercase",
            cursor: "pointer",
            background: "var(--bg-1)",
            color: "var(--text-2)",
            border: "1px solid var(--border-hi)",
          }}
        >
          ↺ reset
        </button>
      </div>
    </div>
  );
}
