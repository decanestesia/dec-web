// ============================================================
// DEC — "Búsqueda por situación" · datos tipados
//
// Un buscador tipo "¿qué hago si…?" para el quirófano. Cada situación
// resume los PASOS INMEDIATOS de la guía/algoritmo/protocolo YA
// EXISTENTE en el repo y ENLAZA a esa referencia ampliada + a las
// fichas de fármaco (/farmacos/[slug]).
//
// EXACTITUD CLÍNICA (regla DEC): ninguna dosis inventada. Cada dosis
// proviene de una fuente ya presente en el repositorio:
//   · /app/codigo/CodigoClient.tsx  (dosis de crisis por peso, clon de
//     EmergencyDrugData.swift — AHA 2020, ASRA, MHAUS, BJA/AAGBI)
//   · /app/guias/*                  (guías con dosis citadas Vancouver)
//   · /app/algoritmos/*             (vía aérea, hipotensión, PeRLS)
//   · public/drugs.json             (catálogo, para los slugs de ficha)
// El campo `fuente` de cada situación nombra la referencia interna.
// Los pasos son un RESUMEN FIEL, no el texto largo (ese vive en la guía).
// ============================================================

export interface SituationDrug {
  /** Nombre mostrado del fármaco. */
  nombre: string;
  /** Dosis textual — copiada de la guía/protocolo/catálogo de origen. */
  dosis: string;
  /** slug de la ficha en /farmacos/[slug]. Omitir si no hay ficha. */
  slug?: string;
}

export type SituationCategory =
  | "cardiovascular"
  | "via-aerea"
  | "respiratorio"
  | "neuro"
  | "alergia-toxicidad"
  | "obstetricia"
  | "metabolico"
  | "postoperatorio";

export interface Situation {
  id: string;
  /** Título mostrado ("¿qué hago si…?"). */
  titulo: string;
  /** Sinónimos y términos de búsqueda (coloquiales, siglas, inglés). */
  sinonimos: string[];
  categoria: SituationCategory;
  /** Frase corta bajo el título. */
  resumen: string;
  /** Pasos inmediatos — resumen fiel de la guía de origen. */
  pasos: string[];
  /** Fármacos de primera línea con dosis de la fuente citada. */
  farmacos: SituationDrug[];
  /** Ruta interna a la guía/algoritmo/protocolo ampliado. */
  guiaHref?: string;
  /** Etiqueta corta del destino ("guía", "algoritmo", "protocolo"). */
  guiaLabel?: string;
  /** Referencia interna de la que se tomaron pasos y dosis. */
  fuente: string;
}

export const CATEGORY_LABEL: Record<SituationCategory, string> = {
  cardiovascular: "cardiovascular",
  "via-aerea": "vía aérea",
  respiratorio: "respiratorio",
  neuro: "neuro",
  "alergia-toxicidad": "alergia / toxicidad",
  obstetricia: "obstetricia",
  metabolico: "metabólico",
  postoperatorio: "postoperatorio",
};

export const CATEGORY_ACCENT: Record<SituationCategory, string> = {
  cardiovascular: "var(--red)",
  "via-aerea": "var(--cyan)",
  respiratorio: "var(--cyan)",
  neuro: "var(--accent)",
  "alergia-toxicidad": "var(--amber)",
  obstetricia: "var(--amber)",
  metabolico: "var(--accent)",
  postoperatorio: "var(--text-2)",
};

// ============================================================
// SITUACIONES — cada una enlaza a contenido ya existente en el repo.
// Dosis: solo las que ya aparecen en la guía/protocolo/catálogo citado.
// ============================================================
export const SITUATIONS: Situation[] = [
  // ---------------------------------------------------------- cardiovascular
  {
    id: "hipotension",
    titulo: "Hipotensión intraoperatoria",
    sinonimos: ["hipotension", "presion baja", "TA baja", "PAM baja", "vasoplejia", "hipotension intraoperatoria", "shock", "hypotension"],
    categoria: "cardiovascular",
    resumen: "Diferencial rápido por causa + vasopresor dirigido según frecuencia.",
    pasos: [
      "Confirma la cifra (manguito/línea, artefacto) y avisa; O₂, revisa profundidad anestésica y sangrado.",
      "Diferencial: precarga (hipovolemia/sangrado/compresión cava), poscarga (vasoplejia, neuroaxial, anafilaxia), bomba (isquemia, arritmia), obstructivo (neumotórax, taponamiento, TEP).",
      "Fluidos si precarga baja; corrige la causa (aligerar anestésico, Trendelenburg, liberar compresión).",
      "Vasopresor dirigido por la frecuencia (ver fármacos). Si vasoplejia sostenida, noradrenalina de 1.ª línea.",
    ],
    farmacos: [
      { nombre: "Fenilefrina (taquicárdico)", dosis: "bolo 50-100 mcg IV", slug: "fenilefrina" },
      { nombre: "Efedrina (bradicárdico)", dosis: "bolo 5-10 mg IV", slug: "efedrina" },
      { nombre: "Noradrenalina (vasoplejia/sostenida)", dosis: "infusión 0.05-0.5 mcg/kg/min", slug: "noradrenalina" },
      { nombre: "Vasopresina (refractaria)", dosis: "bolo 1-2 U IV / infusión", slug: "vasopresina" },
    ],
    guiaHref: "/algoritmos/hipotension-intraoperatoria",
    guiaLabel: "algoritmo",
    fuente: "DEC · algoritmo /algoritmos/hipotension-intraoperatoria (diferencial y vasopresor dirigido).",
  },
  {
    id: "bradicardia",
    titulo: "Bradicardia intraoperatoria",
    sinonimos: ["bradicardia", "frecuencia baja", "FC baja", "asistolia inminente", "reflejo vagal", "bradycardia", "bloqueo AV"],
    categoria: "cardiovascular",
    resumen: "Retirar el estímulo vagal, atropina; marcapasos/adrenalina si inestable.",
    pasos: [
      "Retira el estímulo desencadenante (tracción peritoneal/ocular, laringoscopia, neumoperitoneo) y avisa al cirujano.",
      "Asegura O₂/ventilación (la hipoxia da bradicardia) y descarta fármacos (dexmedetomidina, remifentanilo, neostigmina sin antimuscarínico).",
      "Atropina si sintomática o inestable.",
      "Si no responde / inestable: adrenalina, marcapasos transcutáneo, y trata la causa.",
    ],
    farmacos: [
      { nombre: "Atropina", dosis: "0.5-1 mg IV c/3-5 min (peds 0.02 mg/kg, mín 0.1 mg)", slug: "atropina" },
      { nombre: "Adrenalina", dosis: "bolo 10-100 mcg IV titulado si refractaria", slug: "adrenalina" },
      { nombre: "Glicopirrolato (alternativa)", dosis: "0.2-0.4 mg IV", slug: "glicopirrolato" },
    ],
    guiaHref: "/algoritmos/perls",
    guiaLabel: "algoritmo",
    fuente: "DEC · /algoritmos/perls (PeRLS ASA 2025, rama bradicardia) + catálogo (atropina/adrenalina).",
  },
  {
    id: "taquicardia-supraventricular",
    titulo: "Taquicardia supraventricular (TSV)",
    sinonimos: ["TSV", "taquicardia supraventricular", "AVNRT", "AVRT", "taquicardia paroxistica", "complejo estrecho", "adenosina", "SVT"],
    categoria: "cardiovascular",
    resumen: "Complejo estrecho regular ~150-250: vagales → adenosina; cardioversión si inestable.",
    pasos: [
      "Confirma: regular, estrecho (<120 ms), ~150-250, P no visibles o retrógradas. Descarta taquicardia sinusal (esa se trata por la causa).",
      "Estable: maniobras vagales (Valsalva, Valsalva modificada con elevación de piernas).",
      "Si persiste: adenosina en push rápido con flush; avisa al paciente (disnea/opresión transitoria breves).",
      "Inestable (hipotensión, isquemia, shock): cardioversión sincronizada.",
    ],
    farmacos: [
      { nombre: "Adenosina", dosis: "6 mg IV push rápido → 12 mg si no revierte (puede repetir 12 mg)", slug: "adenosina" },
      { nombre: "Diltiazem (alternativa)", dosis: "0.25 mg/kg IV en 2 min, luego infusión", slug: "diltiazem" },
      { nombre: "Cardioversión sincronizada", dosis: "estrecho regular 50-100 J bifásico" },
    ],
    guiaHref: "/guias/arritmias",
    guiaLabel: "guía",
    fuente: "DEC · /guias/arritmias (ACLS 2020, taquicardia de complejo estrecho).",
  },
  {
    id: "fibrilacion-auricular",
    titulo: "Fibrilación auricular con respuesta rápida",
    sinonimos: ["fibrilacion auricular", "FA", "AFib", "respuesta ventricular rapida", "RVR", "flutter", "irregular", "control de frecuencia"],
    categoria: "cardiovascular",
    resumen: "Irregularmente irregular: control de frecuencia; cardioversión si inestable.",
    pasos: [
      "Confirma: irregularmente irregular, sin P organizadas. Corrige K/Mg y factores (catecolaminas, volumen, inflamación).",
      "Estable: control de frecuencia con diltiazem o betabloqueante; amiodarona si disfunción de VI.",
      "Considera control de ritmo/anticoagulación según duración (>48 h ↑ riesgo embólico) y CHA₂DS₂-VASc.",
      "Inestable: cardioversión sincronizada. WPW + FA: NO bloqueadores del nodo AV → procainamida o cardioversión.",
    ],
    farmacos: [
      { nombre: "Diltiazem", dosis: "0.25 mg/kg IV en 2 min, luego infusión", slug: "diltiazem" },
      { nombre: "Amiodarona (si disfunción VI)", dosis: "150 mg IV en 10 min", slug: "amiodarona" },
      { nombre: "Cardioversión sincronizada", dosis: "FA 120-200 J bifásico" },
    ],
    guiaHref: "/guias/arritmias",
    guiaLabel: "guía",
    fuente: "DEC · /guias/arritmias (ACLS 2020; January 2019 AF guideline).",
  },
  {
    id: "taquicardia-ventricular",
    titulo: "Taquicardia de complejo ancho / TV con pulso",
    sinonimos: ["taquicardia ventricular", "TV", "VT", "complejo ancho", "torsades", "amiodarona", "taquicardia de complejo ancho", "wide complex"],
    categoria: "cardiovascular",
    resumen: "Ancho = TV hasta demostrar lo contrario: amiodarona; cardioversión/desfibrilar según pulso y morfología.",
    pasos: [
      "Toda taquicardia de complejo ancho es TV hasta que se demuestre lo contrario: ante la duda, trátala como TV.",
      "TV monomorfa estable con pulso: amiodarona IV. Inestable con pulso: cardioversión sincronizada 100 J.",
      "TV polimorfa/torsades: magnesio 1-2 g IV, corrige K/Mg/Ca, retira fármacos que prolongan el QT.",
      "Sin pulso: algoritmo de paro — desfibrilar (la polimorfa NO se sincroniza).",
    ],
    farmacos: [
      { nombre: "Amiodarona", dosis: "150 mg IV en 10 min (repetir si recurre); infusión 1 mg/min ×6 h → 0.5 mg/min", slug: "amiodarona" },
      { nombre: "Sulfato de magnesio (torsades)", dosis: "1-2 g IV en 15 min" },
      { nombre: "Cardioversión / desfibrilación", dosis: "sincronizada 100 J (con pulso) · desfibrilar 120-200 J (sin pulso/polimorfa)" },
    ],
    guiaHref: "/guias/arritmias",
    guiaLabel: "guía",
    fuente: "DEC · /guias/arritmias (ACLS 2020, taquicardia de complejo ancho).",
  },
  {
    id: "isquemia-miocardica",
    titulo: "Isquemia miocárdica perioperatoria",
    sinonimos: ["isquemia", "infarto", "IAM", "MINS", "troponina", "cambios ST", "SCA", "myocardial ischemia", "angina"],
    categoria: "cardiovascular",
    resumen: "Optimizar aporte/demanda de O₂ miocárdico; troponina y ECG.",
    pasos: [
      "Reconoce: nuevos cambios ST/T, arritmia, hipotensión inexplicada; solicita ECG de 12 derivaciones y troponina seriada.",
      "Optimiza el balance aporte↔demanda: trata anemia/hipoxia/hipotensión, controla taquicardia y HTA, mantén normotermia.",
      "Analgesia adecuada; considera nitroglicerina si HTA/isquemia con TA que lo permita.",
      "Continúa aspirina si estaba indicada; consulta cardiología; distingue IAM tipo 1 (placa) de tipo 2 / MINS (desbalance).",
    ],
    farmacos: [
      { nombre: "Nitroglicerina", dosis: "infusión titulada (isquemia con TA conservada)", slug: "nitroglicerina" },
      { nombre: "Esmolol (control de FC)", dosis: "titular para frenar taquicardia", slug: "esmolol" },
      { nombre: "Fenilefrina (mantener PAD)", dosis: "bolo/infusión para presión de perfusión coronaria", slug: "fenilefrina" },
    ],
    guiaHref: "/guias/isquemia-miocardica-perioperatoria",
    guiaLabel: "guía",
    fuente: "DEC · guía /guias/isquemia-miocardica-perioperatoria (MINS/IAM tipo 2, aporte/demanda).",
  },
  {
    id: "crisis-hipertensiva",
    titulo: "Crisis hipertensiva / feocromocitoma",
    sinonimos: ["crisis hipertensiva", "hipertension", "presion alta", "feocromocitoma", "emergencia hipertensiva", "hypertension", "HTA severa"],
    categoria: "cardiovascular",
    resumen: "Vasodilatador de acción corta y titulable; alfa antes de beta.",
    pasos: [
      "Descarta causa tratable (dolor, ligereza anestésica, hipercapnia, vejiga llena, manipulación de feocromocitoma).",
      "Profundiza la anestesia/analgesia primero si es la causa.",
      "Baja la TA con agente titulable de acción corta; evita caídas bruscas.",
      "En feocromocitoma: fentolamina/agente alfa PRIMERO; el betabloqueo solo tras el bloqueo alfa (riesgo de crisis por α sin oposición).",
    ],
    farmacos: [
      { nombre: "Fentolamina (feocromocitoma)", dosis: "bolo 1-5 mg IV, repetir", slug: "fentolamina" },
      { nombre: "Clevidipino", dosis: "infusión titulada", slug: "clevidipino" },
      { nombre: "Labetalol (solo tras bloqueo alfa)", dosis: "bolo 5-20 mg IV titulado", slug: "labetalol" },
      { nombre: "Nitroglicerina", dosis: "infusión titulada", slug: "nitroglicerina" },
    ],
    guiaHref: "/guias/feocromocitoma-crisis-htn",
    guiaLabel: "guía",
    fuente: "DEC · guía /guias/feocromocitoma-crisis-htn (alfa antes de beta, fentolamina).",
  },
  {
    id: "paro-perioperatorio",
    titulo: "Paro cardíaco perioperatorio",
    sinonimos: ["paro", "parada", "PCR", "codigo azul", "asistolia", "FV", "TVsp", "AESP", "cardiac arrest", "ACLS", "resucitacion"],
    categoria: "cardiovascular",
    resumen: "RCP de alta calidad, ritmo, adrenalina precoz; barre Hs y Ts del quirófano.",
    pasos: [
      "Sin pulso = paro: RCP de alta calidad YA (100-120/min, 5-6 cm, fracción de compresión >60%, relevo c/2 min).",
      "FiO₂ 1.0, cierra volátiles, verifica capnografía; el cirujano detiene/controla la causa.",
      "Ritmo: desfibrilable (FV/TVsp) → descarga 200 J → RCP; no desfibrilable (AESP/asistolia) → RCP + adrenalina precoz.",
      "Hs y Ts + causas de quirófano: anafilaxia, HM, LAST, embolia gaseosa, hemorragia, bloqueo neuroaxial alto, auto-PEEP.",
    ],
    farmacos: [
      { nombre: "Adrenalina", dosis: "1 mg IV c/3-5 min (peds 0.01 mg/kg)", slug: "adrenalina" },
      { nombre: "Amiodarona (FV/TVsp)", dosis: "300 mg IV, 2.ª dosis 150 mg", slug: "amiodarona" },
    ],
    guiaHref: "/guias/paro-perioperatorio",
    guiaLabel: "guía",
    fuente: "DEC · guía /guias/paro-perioperatorio + protocolo /codigo (AHA 2020, Moitra 2018).",
  },

  // ---------------------------------------------------------- vía aérea / respiratorio
  {
    id: "laringoespasmo",
    titulo: "Laringoespasmo",
    sinonimos: ["laringoespasmo", "laringo", "cierre de cuerdas", "estridor", "laryngospasm", "espasmo de laringe", "Larson"],
    categoria: "via-aerea",
    resumen: "Retirar estímulo, O₂ 100% con presión positiva, maniobra de Larson, profundizar; succinilcolina si persiste.",
    pasos: [
      "Retira el estímulo (secreciones, laringoscopia, extubación en plano ligero); pide ayuda.",
      "O₂ 100% con mascarilla y presión positiva continua (CPAP), abrir vía aérea (tracción mandibular).",
      "Maniobra de Larson: presión firme en la 'muesca del laringoespasmo' (entre mastoides, cóndilo y rama mandibular) + subluxación mandibular.",
      "Profundiza la anestesia (propofol); si persiste con desaturación, succinilcolina para romper el espasmo.",
    ],
    farmacos: [
      { nombre: "Propofol (profundizar)", dosis: "bolo 0.5-1 mg/kg IV", slug: "propofol" },
      { nombre: "Succinilcolina (persistente)", dosis: "IV; también IM si no hay acceso IV", slug: "succinilcolina" },
    ],
    guiaHref: "/guias/broncoespasmo-laringoespasmo",
    guiaLabel: "guía",
    fuente: "DEC · guía /guias/broncoespasmo-laringoespasmo (Larson 1998, DAS 2015).",
  },
  {
    id: "broncoespasmo",
    titulo: "Broncoespasmo",
    sinonimos: ["broncoespasmo", "sibilancias", "asma", "presion de via aerea alta", "bronchospasm", "wheezing", "espasmo bronquial"],
    categoria: "respiratorio",
    resumen: "O₂ 100%, profundizar, broncodilatador; adrenalina IV si severo; magnesio y corticoide.",
    pasos: [
      "O₂ 100%; descarta causas mecánicas (tubo acodado/mucoso, endobronquial, neumotórax) y anafilaxia.",
      "Profundiza con volátil (broncodilatador) o propofol/ketamina; manejo ventilatorio con espiración prolongada para evitar auto-PEEP.",
      "Broncodilatador inhalado (salbutamol) por el circuito; si severo o refractario, adrenalina IV.",
      "Sulfato de magnesio y corticoide como coadyuvantes.",
    ],
    farmacos: [
      { nombre: "Salbutamol inhalado", dosis: "por el circuito del ventilador", slug: "salbutamol" },
      { nombre: "Adrenalina IV (severo)", dosis: "bolo titulado 10-100 mcg IV", slug: "adrenalina" },
      { nombre: "Sulfato de magnesio", dosis: "2 g IV", slug: "sulfato-de-magnesio" },
      { nombre: "Hidrocortisona", dosis: "200 mg IV (coadyuvante)", slug: "hidrocortisona" },
    ],
    guiaHref: "/guias/broncoespasmo-laringoespasmo",
    guiaLabel: "guía",
    fuente: "DEC · guía /guias/broncoespasmo-laringoespasmo (Dewachter 2011, GINA 2023) + protocolo Mg 2 g de /codigo.",
  },
  {
    id: "desaturacion",
    titulo: "Desaturación / hipoxemia",
    sinonimos: ["desaturacion", "hipoxia", "hipoxemia", "SpO2 baja", "cianosis", "desaturation", "baja saturacion", "oxigeno bajo"],
    categoria: "respiratorio",
    resumen: "FiO₂ 1.0 y abordaje sistemático de la causa; descarta intubación esofágica/endobronquial.",
    pasos: [
      "FiO₂ 1.0 y confirma que el pulsioxímetro no da artefacto (curva, perfusión).",
      "Verifica ventilación: ausculta, capnografía, presiones; descarta desconexión, obstrucción, intubación esofágica o endobronquial.",
      "Descarta broncoespasmo, laringoespasmo, edema pulmonar, neumotórax, aspiración, atelectasia, embolia.",
      "Optimiza reclutamiento/PEEP; si no revierte, escala al algoritmo de la causa (anafilaxia, broncoespasmo, VAE, aspiración).",
    ],
    farmacos: [
      { nombre: "Salbutamol (si broncoespasmo)", dosis: "inhalado por el circuito", slug: "salbutamol" },
      { nombre: "Adrenalina (si anafilaxia/severo)", dosis: "bolo titulado IV", slug: "adrenalina" },
    ],
    guiaHref: "/algoritmos",
    guiaLabel: "algoritmos",
    fuente: "DEC · algoritmos de vía aérea /algoritmos + guías de causa (broncoespasmo, aspiración, VAE).",
  },
  {
    id: "cico",
    titulo: "No intubo, no ventilo (CICO)",
    sinonimos: ["cico", "cannot intubate cannot oxygenate", "via aerea fallida", "no ventilo", "efona", "cricotiroidotomia", "vortex", "airway failure"],
    categoria: "via-aerea",
    resumen: "Declara CICO, agota supraglótico/mascarilla, y accede al cuello (eFONA scalpel-bougie-tube).",
    pasos: [
      "Declara la emergencia CICO en voz alta y pide el carro de vía aérea difícil y ayuda experta.",
      "Optimiza y agota las 3 líneas de vida (Vortex): mascarilla facial, dispositivo supraglótico, tubo endotraqueal — un intento óptimo de cada una.",
      "Si sigue sin oxigenar: acceso quirúrgico frontal del cuello sin demora — eFONA scalpel-bougie-tube (cricotiroidotomía).",
      "Confirma con capnografía; ventila y planifica el manejo definitivo.",
    ],
    farmacos: [],
    guiaHref: "/algoritmos/cico-efona",
    guiaLabel: "algoritmo",
    fuente: "DEC · algoritmos /algoritmos/cico-efona y /algoritmos/vortex (DAS 2015 / Vortex).",
  },
  {
    id: "aspiracion",
    titulo: "Aspiración pulmonar (Mendelson)",
    sinonimos: ["aspiracion", "broncoaspiracion", "mendelson", "contenido gastrico", "aspiration", "regurgitacion"],
    categoria: "respiratorio",
    resumen: "Posición, aspirar la vía aérea, asegurar con TET y O₂; sin lavado ni antibiótico de rutina.",
    pasos: [
      "Posición en Trendelenburg lateral si es posible y aspira la orofaringe.",
      "Asegura la vía aérea con tubo endotraqueal; aspira por el tubo ANTES de ventilar a presión positiva si hay material.",
      "O₂ 100%, soporte ventilatorio con PEEP; broncoscopia solo si hay material sólido obstructivo.",
      "NO hacer lavado broncoalveolar ni dar antibiótico/corticoide de rutina; observa y trata según evolución.",
    ],
    farmacos: [
      { nombre: "Salbutamol (si broncoespasmo)", dosis: "inhalado por el circuito", slug: "salbutamol" },
    ],
    guiaHref: "/guias/aspiracion-mendelson",
    guiaLabel: "guía",
    fuente: "DEC · guía /guias/aspiracion-mendelson (sin lavado ni ATB de rutina).",
  },

  // ---------------------------------------------------------- alergia / toxicidad
  {
    id: "anafilaxia",
    titulo: "Anafilaxia perioperatoria",
    sinonimos: ["anafilaxia", "reaccion alergica", "alergia", "shock anafilactico", "anaphylaxis", "reaccion a farmaco", "urticaria colapso"],
    categoria: "alergia-toxicidad",
    resumen: "Adrenalina titulada, retirar desencadenante, fluidos agresivos; triptasa seriada.",
    pasos: [
      "Reconoce (hipotensión, broncoespasmo/↑presión de vía aérea, desaturación, colapso) y declara «sospecha de anafilaxia»; pide ayuda.",
      "Detén el desencadenante (BNM, antibiótico, coloide, clorhexidina, látex) y da FiO₂ 100%.",
      "Adrenalina titulada por grado + fluidos en bolo; piernas elevadas.",
      "Escala: infusión de adrenalina si bolos repetidos; hidrocortisona, antihistamínico, salbutamol; glucagón si β-bloqueo. Triptasa seriada.",
    ],
    farmacos: [
      { nombre: "Adrenalina IV (titulada)", dosis: "grado II 10-20 mcg, III 50-100 mcg, repetir; paro 1 mg", slug: "adrenalina" },
      { nombre: "Adrenalina IM (sin acceso IV)", dosis: "0.5 mg IM (0.01 mg/kg, máx 0.5), c/5 min", slug: "adrenalina" },
      { nombre: "Hidrocortisona (adyuvante)", dosis: "200 mg IV", slug: "hidrocortisona" },
      { nombre: "Difenhidramina (adyuvante)", dosis: "antihistamínico IV", slug: "difenhidramina" },
    ],
    guiaHref: "/guias/anafilaxia",
    guiaLabel: "guía",
    fuente: "DEC · guía /guias/anafilaxia + protocolo /codigo (AAGBI/BSACI 2021, NAP6).",
  },
  {
    id: "last",
    titulo: "Toxicidad por anestésico local (LAST)",
    sinonimos: ["LAST", "toxicidad anestesico local", "intoxicacion bupivacaina", "toxicidad sistemica", "local anesthetic toxicity", "convulsion anestesico", "colapso tras bloqueo"],
    categoria: "alergia-toxicidad",
    resumen: "Detener la inyección, vía aérea, benzodiacepina para convulsiones, emulsión lipídica 20%.",
    pasos: [
      "Detén la inyección del anestésico local YA; pide ayuda y el kit de emulsión lipídica; declara LAST.",
      "Vía aérea: O₂ 100%, ventila; prevén/trata hipoxia, hipercapnia y acidosis (empeoran la toxicidad).",
      "Convulsiones: benzodiacepina (midazolam); evita dosis altas de propofol si hay inestabilidad CV.",
      "Emulsión lipídica 20%: bolo → infusión (ver fármacos). Si hay paro: ACLS con adrenalina en dosis reducidas, evitar vasopresina/BCC/β-bloq y más anestésico local.",
    ],
    farmacos: [
      { nombre: "Emulsión lipídica 20%", dosis: "bolo 1.5 mL/kg en 2-3 min → 0.25 mL/kg/min; máx ≈ 12 mL/kg", slug: "emulsion-lipidica-20" },
      { nombre: "Midazolam (convulsiones)", dosis: "titular IV", slug: "midazolam" },
      { nombre: "Adrenalina (si paro)", dosis: "bolos reducidos ≤ 1 mcg/kg", slug: "adrenalina" },
    ],
    guiaHref: "/calculadoras/anestesicos-locales",
    guiaLabel: "protocolo",
    fuente: "DEC · protocolo LAST de /codigo (Neal JM, ASRA LAST Checklist 2020).",
  },
  {
    id: "hipertermia-maligna",
    titulo: "Hipertermia maligna",
    sinonimos: ["hipertermia maligna", "HM", "MH", "dantroleno", "hipercapnia inexplicada", "rigidez maseterina", "malignant hyperthermia", "MHAUS"],
    categoria: "alergia-toxicidad",
    resumen: "Suspender gatillo, dantroleno, enfriar, corregir; llamar a la línea MHAUS.",
    pasos: [
      "Suspende volátiles y succinilcolina; hiperventila con O₂ 100% a alto flujo; pide ayuda y el carro de HM.",
      "Dantroleno en bolo, repetir hasta control (a menudo >10 mg/kg total); moviliza personal para reconstituir con agua estéril.",
      "Enfriamiento activo si T > 39 °C; suspende al llegar a ≈ 38 °C.",
      "Corrige acidosis (bicarbonato), hiperkalemia (Ca²⁺, insulina-glucosa, salbutamol), arritmias (evitar BCC). Diuresis/CK/gases seriados. Llama a MHAUS; UCI ≥ 24 h.",
    ],
    farmacos: [
      { nombre: "Dantroleno", dosis: "2.5 mg/kg IV, repetir c/5 min hasta control", slug: "dantroleno" },
      { nombre: "Cloruro de calcio (hiperK)", dosis: "10 mg/kg IV (vía central)", slug: "cloruro-de-calcio-10" },
    ],
    guiaHref: "/guias/hipertermia-maligna",
    guiaLabel: "guía",
    fuente: "DEC · guía /guias/hipertermia-maligna + protocolo /codigo (MHAUS, Glahn 2010).",
  },
  {
    id: "metahemoglobinemia",
    titulo: "Metahemoglobinemia",
    sinonimos: ["metahemoglobinemia", "cianosis refractaria", "SpO2 fija 85", "azul de metileno", "methemoglobinemia", "prilocaina benzocaina cianosis"],
    categoria: "alergia-toxicidad",
    resumen: "Cianosis y SpO₂ que no responde a O₂; azul de metileno (cuidado con G6PD/IMAO).",
    pasos: [
      "Sospecha ante cianosis con SpO₂ fija (~85%) que no sube con O₂ y gap de saturación; confirma con cooximetría (MetHb).",
      "Retira el agente causal (benzocaína/prilocaína tópica, dapsona, nitritos).",
      "O₂ 100%; azul de metileno como antídoto en casos sintomáticos/severos.",
      "Precaución: en déficit de G6PD el azul de metileno es inefectivo/peligroso; evítalo con IMAO (riesgo serotoninérgico) — considera alternativas.",
    ],
    farmacos: [
      { nombre: "Azul de metileno", dosis: "1-2 mg/kg IV", slug: "azul-de-metileno" },
    ],
    guiaHref: "/guias/metahemoglobinemia",
    guiaLabel: "guía",
    fuente: "DEC · guía /guias/metahemoglobinemia (azul de metileno 1-2 mg/kg, trampas G6PD/IMAO).",
  },

  // ---------------------------------------------------------- neuro
  {
    id: "status-epilepticus",
    titulo: "Status epilepticus / convulsión",
    sinonimos: ["status epilepticus", "convulsion", "crisis convulsiva", "epilepsia", "seizure", "convulsiones prolongadas", "estado epileptico"],
    categoria: "neuro",
    resumen: "Benzodiacepina primero → antiepiléptico → infusión anestésica con EEG.",
    pasos: [
      "ABC, O₂, glucemia capilar; protege la vía aérea; cronometra la crisis.",
      "1.ª línea: benzodiacepina (ver dosis). Repite una vez si persiste.",
      "2.ª línea si no cede: antiepiléptico IV (levetiracetam, fosfenitoína o valproato).",
      "Refractario: infusión anestésica (midazolam / propofol / pentobarbital) + EEG continuo; UCI.",
    ],
    farmacos: [
      { nombre: "Midazolam", dosis: "IV; 0.2 mg/kg IM si no hay acceso IV", slug: "midazolam" },
      { nombre: "Levetiracetam (2.ª línea)", dosis: "60 mg/kg IV", slug: "levetiracetam" },
      { nombre: "Propofol (refractario)", dosis: "infusión anestésica con EEG", slug: "propofol" },
    ],
    guiaHref: "/guias/status-epilepticus",
    guiaLabel: "guía",
    fuente: "DEC · guía /guias/status-epilepticus (benzo → levetiracetam 60 mg/kg / fosfenitoína 20 mg PE/kg → infusión).",
  },
  {
    id: "despertar-intraoperatorio",
    titulo: "Despertar intraoperatorio (awareness)",
    sinonimos: ["despertar intraoperatorio", "awareness", "consciencia intraoperatoria", "recuerdo intraoperatorio", "paciente despierto", "profundidad anestesica"],
    categoria: "neuro",
    resumen: "Profundizar de inmediato, amnésico, y verificar el suministro de anestésico.",
    pasos: [
      "Sospecha ante signos de ligereza (movimiento, taquicardia/HTA, lagrimeo, sudoración) sobre todo si hay relajante neuromuscular que enmascara.",
      "Profundiza YA la anestesia (bolo de hipnótico + subir volátil/TIVA) y administra un amnésico.",
      "Verifica el suministro: vaporizador vacío, línea de TIVA desconectada/infiltrada, bomba parada, circuito.",
      "Documenta; visita postoperatoria y apoyo si hubo recuerdo (riesgo de TEPT); considera monitor de profundidad en el futuro.",
    ],
    farmacos: [
      { nombre: "Propofol (profundizar)", dosis: "bolo de rescate + ajustar TIVA/volátil", slug: "propofol" },
      { nombre: "Midazolam (amnésico)", dosis: "bolo IV", slug: "midazolam" },
    ],
    fuente: "DEC · catálogo (propofol/midazolam) + práctica establecida (verificar suministro anestésico; sin dosis nuevas).",
  },
  {
    id: "delirio-emergencia",
    titulo: "Delirio de emergencia / agitación al despertar",
    sinonimos: ["delirio de emergencia", "agitacion al despertar", "emergence delirium", "delirium", "PAED", "agitacion postoperatoria", "confusion despertar"],
    categoria: "neuro",
    resumen: "Descartar causa orgánica primero; medida farmacológica suave si hay riesgo.",
    pasos: [
      "Descarta y trata causas tratables PRIMERO: hipoxia, hipercapnia, hipotensión, hipoglucemia, dolor, globo vesical, hipotermia.",
      "Medidas no farmacológicas: entorno tranquilo, presencia de familiar (pediátrico), seguridad para evitar autolesión.",
      "Si persiste con riesgo, dosis baja de dexmedetomidina o propofol.",
      "Evalúa con CAM-ICU (adulto) / PAED (pediátrico); prevención en pacientes de riesgo.",
    ],
    farmacos: [
      { nombre: "Dexmedetomidina", dosis: "0.5 µg/kg IV", slug: "dexmedetomidina" },
      { nombre: "Propofol", dosis: "0.5-1 mg/kg IV", slug: "propofol" },
    ],
    guiaHref: "/guias/delirium-emergencia",
    guiaLabel: "guía",
    fuente: "DEC · guía /guias/delirium-emergencia (dexmedetomidina 0.5 µg/kg o propofol 0.5-1 mg/kg; CAM-ICU/PAED).",
  },
  {
    id: "sindrome-serotoninergico",
    titulo: "Síndrome serotoninérgico / NMS",
    sinonimos: ["sindrome serotoninergico", "serotoninergico", "NMS", "sindrome neuroleptico maligno", "clonus", "rigidez", "hipertermia farmacos", "ciproheptadina"],
    categoria: "neuro",
    resumen: "Retirar el desencadenante, soporte y enfriar; distinguir clonus (SS) de rigidez (NMS).",
    pasos: [
      "Retira el agente causal (ISRS, IMAO, tramadol, meperidina, linezolid, azul de metileno; en NMS: neurolépticos / retirada de dopaminérgico).",
      "Soporte: O₂, fluidos, enfriamiento activo, benzodiacepinas para agitación/rigidez.",
      "Distingue: SS con clonus/hiperreflexia/mioclonías (inicio en horas); NMS con rigidez 'en tubo de plomo'/hiporreflexia (inicio en días).",
      "SS grave: ciproheptadina (antagonista 5-HT). NMS grave: dantroleno / bromocriptina. UCI.",
    ],
    farmacos: [
      { nombre: "Midazolam (agitación/rigidez)", dosis: "titular IV", slug: "midazolam" },
      { nombre: "Dantroleno (NMS grave)", dosis: "IV", slug: "dantroleno" },
    ],
    guiaHref: "/guias/serotoninergico-nms",
    guiaLabel: "guía",
    fuente: "DEC · guía /guias/serotoninergico-nms (clonus vs rigidez, ciproheptadina, dantroleno).",
  },

  // ---------------------------------------------------------- obstetricia
  {
    id: "hemorragia-postparto",
    titulo: "Hemorragia postparto (HPP)",
    sinonimos: ["hemorragia postparto", "HPP", "sangrado obstetrico", "atonia uterina", "postpartum hemorrhage", "4 T", "utero blando"],
    categoria: "obstetricia",
    resumen: "Las 4 T, uterotónicos escalonados, ácido tranexámico, transfusión masiva.",
    pasos: [
      "Pide ayuda, activa protocolo de HPP; 2 vías gruesas, fluidos, cruza sangre, monitoriza; masaje uterino bimanual.",
      "Diferencial 4 T: Tono (atonía, la más frecuente), Trauma (desgarros), Tejido (retención placentaria), Trombina (coagulopatía).",
      "Uterotónicos escalonados: oxitocina → ergot → prostaglandina (carboprost); ácido tranexámico precoz.",
      "Transfusión masiva si persiste; medidas quirúrgicas/tamponamiento/embolización según causa.",
    ],
    farmacos: [
      { nombre: "Oxitocina", dosis: "bolo lento + infusión (1.ª línea)", slug: "oxitocina" },
      { nombre: "Metilergonovina", dosis: "0.2 mg IM (evitar en HTA)", slug: "metilergonovina" },
      { nombre: "Carboprost", dosis: "250 mcg IM (evitar en asma)", slug: "carboprost" },
      { nombre: "Ácido tranexámico", dosis: "1 g IV", slug: "acido-tranexamico" },
    ],
    guiaHref: "/guias/hemorragia-postparto",
    guiaLabel: "guía",
    fuente: "DEC · guía /guias/hemorragia-postparto (4 T, uterotónicos, TXA, transfusión masiva).",
  },
  {
    id: "eclampsia",
    titulo: "Preeclampsia grave / eclampsia",
    sinonimos: ["eclampsia", "preeclampsia", "convulsion embarazo", "HTA embarazo", "sulfato de magnesio", "preeclampsia grave", "eclampsia convulsion"],
    categoria: "obstetricia",
    resumen: "Sulfato de magnesio para la convulsión/neuroprotección y control de la HTA severa.",
    pasos: [
      "Protege a la madre (vía aérea, decúbito lateral izquierdo, O₂) durante la convulsión; pide ayuda obstétrica.",
      "Sulfato de magnesio: dosis de carga IV seguida de infusión (prevención/tratamiento de la convulsión); vigila reflejos, diuresis y frecuencia respiratoria (toxicidad).",
      "Controla la HTA severa con antihipertensivo (labetalol) hasta rango objetivo, sin caídas bruscas.",
      "Planifica el parto (tratamiento definitivo); si toxicidad por Mg: gluconato de calcio.",
    ],
    farmacos: [
      { nombre: "Sulfato de magnesio", dosis: "carga 4-6 g IV + infusión", slug: "sulfato-de-magnesio" },
      { nombre: "Labetalol (HTA severa)", dosis: "bolo 5-20 mg IV titulado", slug: "labetalol" },
      { nombre: "Gluconato de calcio (toxicidad Mg)", dosis: "antídoto IV", slug: "gluconato-de-calcio-10" },
    ],
    guiaHref: "/guias/preeclampsia-eclampsia",
    guiaLabel: "guía",
    fuente: "DEC · guía /guias/preeclampsia-eclampsia + protocolo /codigo (Mg carga 4-6 g).",
  },
  {
    id: "espinal-alta",
    titulo: "Bloqueo espinal alto / total",
    sinonimos: ["espinal alta", "bloqueo espinal alto", "espinal total", "raquianestesia total", "high spinal", "bloqueo total", "apnea tras raqui"],
    categoria: "obstetricia",
    resumen: "Soporte ventilatorio y hemodinámico; el bloqueo cede solo con el tiempo.",
    pasos: [
      "Reconoce: hipotensión y bradicardia progresivas, disnea, debilidad de manos/brazos, dificultad para hablar, apnea, pérdida de consciencia.",
      "Vía aérea: O₂ 100%, ventila; intuba si apnea o pérdida de protección de la vía aérea.",
      "Soporte hemodinámico: fluidos, vasopresores; atropina para la bradicardia.",
      "Mantén el soporte hasta que el bloqueo regrese; tranquiliza a la paciente si está consciente.",
    ],
    farmacos: [
      { nombre: "Fenilefrina / efedrina", dosis: "vasopresor según frecuencia", slug: "fenilefrina" },
      { nombre: "Atropina (bradicardia)", dosis: "0.5-1 mg IV", slug: "atropina" },
      { nombre: "Adrenalina (colapso)", dosis: "bolo titulado IV", slug: "adrenalina" },
    ],
    guiaHref: "/guias/espinal-alta-total",
    guiaLabel: "guía",
    fuente: "DEC · guía /guias/espinal-alta-total (soporte ventilatorio, vasopresores).",
  },

  // ---------------------------------------------------------- postoperatorio / metabólico
  {
    id: "nvpo",
    titulo: "Náusea y vómito postoperatorios (NVPO)",
    sinonimos: ["NVPO", "nausea", "vomito", "PONV", "nausea postoperatoria", "vomito postoperatorio", "profilaxis nausea"],
    categoria: "postoperatorio",
    resumen: "Profilaxis multimodal según riesgo (Apfel); rescate con una CLASE distinta a la profilaxis.",
    pasos: [
      "Estratifica el riesgo (Apfel: mujer, no fumador, historia de NVPO/cinetosis, opioides postoperatorios).",
      "Profilaxis multimodal según número de factores; combina fármacos de clases distintas y usa técnicas ahorradoras de opioides.",
      "Rescate: usa una CLASE farmacológica distinta a la de la profilaxis (repetir la misma en <6 h no aporta).",
      "Corrige factores contribuyentes (hipotensión, dolor, deshidratación).",
    ],
    farmacos: [
      { nombre: "Ondansetrón", dosis: "4 mg IV profilaxis / 1 mg IV rescate", slug: "ondansetron" },
      { nombre: "Dexametasona", dosis: "4-8 mg IV al inicio", slug: "dexametasona" },
      { nombre: "Droperidol", dosis: "0.625-1.25 mg IV", slug: "droperidol" },
    ],
    guiaHref: "/guias/nvpo-manejo",
    guiaLabel: "guía",
    fuente: "DEC · guía /guias/nvpo-manejo (consenso SAMBA, Gan 2020; dosis exactas de la guía).",
  },
  {
    id: "hiperkalemia",
    titulo: "Hiperkalemia aguda",
    sinonimos: ["hiperkalemia", "potasio alto", "hyperkalemia", "K alto", "ondas T picudas", "hiperpotasemia", "arritmia por potasio"],
    categoria: "metabolico",
    resumen: "Estabilizar la membrana con calcio, desplazar el K al intracelular y eliminarlo.",
    pasos: [
      "Sospecha con cambios ECG (T picudas, QRS ancho, ondas sinusoidales); confirma y retira aportes de K.",
      "Estabiliza la membrana miocárdica: calcio IV (no baja el K, protege el corazón).",
      "Desplaza K al intracelular: insulina + glucosa, salbutamol, bicarbonato si acidosis.",
      "Elimina K: diuréticos, resinas, diálisis según causa/severidad.",
    ],
    farmacos: [
      { nombre: "Cloruro de calcio (estabiliza)", dosis: "10 mg/kg IV (vía central)", slug: "cloruro-de-calcio-10" },
      { nombre: "Gluconato de calcio (alternativa)", dosis: "IV por vía periférica", slug: "gluconato-de-calcio-10" },
      { nombre: "Salbutamol (desplaza K)", dosis: "inhalado / nebulizado", slug: "salbutamol" },
    ],
    guiaHref: "/guias/hipertermia-maligna",
    guiaLabel: "referencia",
    fuente: "DEC · manejo de hiperkalemia del protocolo /codigo (Ca²⁺, insulina-glucosa, salbutamol) + guía HM.",
  },
];

// ============================================================
// Búsqueda — substring normalizado sobre título + sinónimos + categoría.
// ============================================================
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function searchSituations(query: string): Situation[] {
  const q = normalize(query.trim());
  if (!q) return SITUATIONS;
  // Cada palabra del query debe aparecer en el "haystack" de la situación.
  const terms = q.split(/\s+/).filter(Boolean);
  return SITUATIONS.filter((s) => {
    const haystack = normalize(
      [s.titulo, s.resumen, s.sinonimos.join(" "), CATEGORY_LABEL[s.categoria]].join(" ")
    );
    return terms.every((t) => haystack.includes(t));
  });
}
