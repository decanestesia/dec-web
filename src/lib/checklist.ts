// ============================================================
// DATOS CLÍNICOS — /checklist
//
// (1) Checklist quirúrgico de seguridad de la OMS (WHO Surgical
//     Safety Checklist, 2009) en sus 3 fases. Contenido oficial
//     estandarizado, traducido a español (RD). No editorializado:
//     reproduce los ítems del checklist de 1 página de la OMS.
//     Fuente: World Health Organization. WHO Surgical Safety
//     Checklist (1st ed., 2009). Ginebra: WHO Guidelines for Safe
//     Surgery 2009. Traducción funcional al español.
//
// (2) Intervalos de re-dosificación intraoperatoria de antibióticos
//     profilácticos por vida media. Valores ESTABLECIDOS (no
//     inventados) — citados a las guías ASHP/IDSA/SIS/SHEA de
//     profilaxis antimicrobiana quirúrgica (2013) y a los principios
//     de re-dosis del SCIP. Se re-dosifica a intervalos de ≈ 2 vidas
//     medias desde la dosis preoperatoria. Fármacos SIN re-dosis
//     intraoperatoria de rutina (vida media larga) se marcan como
//     tales — no se inventa un intervalo cuando no existe.
//     Fuente: Bratzler DW, et al. Clinical practice guidelines for
//     antimicrobial prophylaxis in surgery. Am J Health-Syst Pharm
//     2013;70:195-283 (ASHP/IDSA/SIS/SHEA). Tabla de intervalos de
//     re-dosificación. Alineado con SCIP.
// ============================================================

// ------------------------------------------------------------
// (1) Checklist OMS — modelo
// ------------------------------------------------------------
export interface ChecklistItem {
  /** id estable para el estado marcado (persistente por render). */
  id: string;
  /** Texto del ítem, fiel al checklist OMS. */
  label: string;
  /** Aclaración corta opcional (subtexto). */
  hint?: string;
}

export interface ChecklistPhase {
  id: string;
  /** Nombre de fase en español (RD). */
  title: string;
  /** Término OMS en inglés, como referencia. */
  englishTerm: string;
  /** Momento del acto quirúrgico. */
  timing: string;
  /** Quién lidera la fase (según la OMS). */
  team: string;
  items: ChecklistItem[];
}

// Checklist OMS 2009 — 3 fases. Texto fiel al documento oficial.
export const WHO_PHASES: ChecklistPhase[] = [
  {
    id: "sign-in",
    title: "Entrada",
    englishTerm: "Sign In",
    timing: "Antes de la inducción anestésica",
    team: "Enfermería + anestesiólogo",
    items: [
      {
        id: "in-1",
        label: "El paciente ha confirmado su identidad, el sitio quirúrgico, el procedimiento y su consentimiento",
      },
      {
        id: "in-2",
        label: "El sitio quirúrgico está marcado / no procede",
      },
      {
        id: "in-3",
        label: "Se ha completado la comprobación del equipo y la medicación de anestesia",
      },
      {
        id: "in-4",
        label: "El pulsioxímetro está colocado en el paciente y funciona",
      },
      {
        id: "in-5",
        label: "¿El paciente tiene alergias conocidas?",
        hint: "Sí / No",
      },
      {
        id: "in-6",
        label: "¿Vía aérea difícil o riesgo de aspiración?",
        hint: "No · Sí, y hay equipo/ayuda disponible",
      },
      {
        id: "in-7",
        label: "¿Riesgo de pérdida de sangre > 500 mL (7 mL/kg en niños)?",
        hint: "No · Sí, y hay 2 vías/accesos centrales y líquidos planificados",
      },
    ],
  },
  {
    id: "time-out",
    title: "Pausa quirúrgica",
    englishTerm: "Time Out",
    timing: "Antes de la incisión cutánea",
    team: "Todo el equipo (cirugía, anestesia, enfermería)",
    items: [
      {
        id: "out-1",
        label: "Todos los miembros del equipo se han presentado por su nombre y función",
      },
      {
        id: "out-2",
        label: "Cirujano, anestesiólogo y enfermería confirman en voz alta: paciente, sitio y procedimiento",
      },
      {
        id: "out-3",
        label: "Previsión de eventos críticos — CIRUJANO: pasos críticos o inesperados, duración, pérdida de sangre prevista",
      },
      {
        id: "out-4",
        label: "Previsión de eventos críticos — ANESTESIA: ¿hay algún aspecto específico del paciente que preocupe?",
      },
      {
        id: "out-5",
        label: "Previsión de eventos críticos — ENFERMERÍA: esterilidad confirmada (incl. indicadores), dudas de instrumental/equipo",
      },
      {
        id: "out-6",
        label: "¿Se ha administrado la profilaxis antibiótica en los últimos 60 minutos?",
        hint: "Sí / No procede",
      },
      {
        id: "out-7",
        label: "¿Pueden visualizarse las imágenes diagnósticas esenciales?",
        hint: "Sí / No procede",
      },
    ],
  },
  {
    id: "sign-out",
    title: "Salida",
    englishTerm: "Sign Out",
    timing: "Antes de que el paciente salga del quirófano",
    team: "Todo el equipo (enfermería lidera)",
    items: [
      {
        id: "so-1",
        label: "Enfermería confirma verbalmente con el equipo — el nombre del procedimiento registrado",
      },
      {
        id: "so-2",
        label: "Recuento de instrumentos, gasas y agujas correcto / no procede",
      },
      {
        id: "so-3",
        label: "La muestra está etiquetada (incl. nombre del paciente leído en voz alta)",
      },
      {
        id: "so-4",
        label: "¿Hay problemas de equipo que resolver?",
      },
      {
        id: "so-5",
        label: "Cirujano, anestesiólogo y enfermería revisan los aspectos clave de la recuperación y el manejo del paciente",
      },
    ],
  },
];

export const WHO_SOURCE =
  "Organización Mundial de la Salud (OMS/WHO). Lista de verificación de la seguridad quirúrgica (WHO Surgical Safety Checklist), 1.ª ed., 2009 — WHO Guidelines for Safe Surgery 2009.";

// ------------------------------------------------------------
// (2) Antibióticos profilácticos — intervalos de re-dosis
// ------------------------------------------------------------
export interface AntibioticRedose {
  id: string;
  name: string;
  /** Intervalo de re-dosis desde la dosis preoperatoria, en minutos. null = no requiere re-dosis intraoperatoria de rutina. */
  intervalMin: number | null;
  /** Etiqueta legible del intervalo (ej. "cada ~4 h"). */
  intervalLabel: string;
  /** Vida media de referencia (adulto, función renal normal). */
  halfLife: string;
  /** Nota clínica corta. */
  note: string;
}

// Intervalos de re-dosificación desde la dosis preoperatoria (adulto,
// función renal normal). Fuente: ASHP/IDSA/SIS/SHEA 2013 (Bratzler et
// al.) — se re-dosifica a ≈ 2 vidas medias. También se re-dosifica
// ante pérdida hemática importante. Ningún valor inventado.
export const ANTIBIOTICS: AntibioticRedose[] = [
  {
    id: "cefazolina",
    name: "Cefazolina",
    intervalMin: 240,
    intervalLabel: "cada ~4 h",
    halfLife: "1.2–2.2 h",
    note: "Re-dosis cada 4 h desde la dosis preoperatoria. También re-dosificar si la pérdida de sangre es importante.",
  },
  {
    id: "cefoxitina",
    name: "Cefoxitina",
    intervalMin: 120,
    intervalLabel: "cada ~2 h",
    halfLife: "0.7–1.1 h",
    note: "Vida media corta → re-dosis cada 2 h en cirugía prolongada.",
  },
  {
    id: "cefuroxima",
    name: "Cefuroxima",
    intervalMin: 240,
    intervalLabel: "cada ~4 h",
    halfLife: "1–2 h",
    note: "Re-dosis cada 4 h desde la dosis preoperatoria.",
  },
  {
    id: "clindamicina",
    name: "Clindamicina",
    intervalMin: 360,
    intervalLabel: "cada ~6 h",
    halfLife: "2–4 h",
    note: "Re-dosis cada 6 h desde la dosis preoperatoria.",
  },
  {
    id: "ampicilina-sulbactam",
    name: "Ampicilina-sulbactam",
    intervalMin: 120,
    intervalLabel: "cada ~2 h",
    halfLife: "0.8–1.3 h",
    note: "Re-dosis cada 2 h en cirugía prolongada.",
  },
  {
    id: "vancomicina",
    name: "Vancomicina",
    intervalMin: null,
    intervalLabel: "no requiere re-dosis intraop. de rutina",
    halfLife: "4–8 h",
    note: "Vida media larga: no se re-dosifica de rutina en el intraoperatorio para procedimientos de duración habitual.",
  },
  {
    id: "metronidazol",
    name: "Metronidazol",
    intervalMin: null,
    intervalLabel: "no requiere re-dosis intraop. de rutina",
    halfLife: "6–8 h",
    note: "Vida media larga: no se re-dosifica de rutina en el intraoperatorio.",
  },
  {
    id: "gentamicina",
    name: "Gentamicina",
    intervalMin: null,
    intervalLabel: "no requiere re-dosis intraop. de rutina",
    halfLife: "2–3 h (dosis única diaria por peso)",
    note: "Dosis única basada en peso: no se re-dosifica de rutina en el intraoperatorio.",
  },
  {
    id: "ciprofloxacino",
    name: "Ciprofloxacino",
    intervalMin: null,
    intervalLabel: "no requiere re-dosis intraop. de rutina",
    halfLife: "3–7 h",
    note: "Vida media larga: no se re-dosifica de rutina en el intraoperatorio.",
  },
];

export const ANTIBIOTIC_SOURCE =
  "Bratzler DW, et al. Clinical practice guidelines for antimicrobial prophylaxis in surgery. Am J Health-Syst Pharm 2013;70:195-283 (ASHP/IDSA/SIS/SHEA). Intervalos de re-dosificación desde la dosis preoperatoria (adulto, función renal normal). Alineado con SCIP.";
