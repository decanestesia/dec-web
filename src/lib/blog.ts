// src/lib/blog.ts
//
// Blog de DEC — datos + tipos. Contenido en bloques tipados (sin MDX ni deps),
// renderizados por src/app/blog/[slug]/page.tsx. Para añadir un artículo, agrega
// una entrada a POSTS. // el CMS más simple es un array que compila

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; variant: "info" | "warn" | "danger"; text: string }
  | { type: "code"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "quote"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string };

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  tags: string[];
  readTime: string;
  author: string;
  body: Block[];
}

export const POSTS: Post[] = [
  {
    slug: "el-del-banco-con-telaranas",
    title: "El del banco con telarañas: quién está detrás de DEC",
    excerpt:
      "Un anestesiólogo dominicano, unas cuantas guardias de más y la certeza de que «más o menos 2 cc» no es una dosis. Presentaciones — con retrato fiel incluido.",
    date: "2026-07-04",
    tags: ["Meta", "Sobre DEC"],
    readTime: "4 min",
    author: "Dr. Jophiel Espaillat",
    body: [
      { type: "p", text: "Toda herramienta clínica tiene a alguien detrás. Detrás de esta hay un anestesiólogo dominicano que ha pasado suficientes madrugadas calculando diluciones en el reverso de una hoja de anestesia como para concluir que eso merecía, cuando menos, una app. Este es él. El parecido es exacto." },
      {
        type: "image",
        src: "/blog/jophiel.png",
        alt: "Caricatura del Dr. Jophiel Espaillat sentado en un banco cubierto de telarañas, con las manos convertidas en huesos, bajo un cielo gris.",
        caption: "Dr. Jophiel Espaillat, esperando a que el cirujano diga «ya casi terminamos». Las telarañas son de la última vez que lo dijo. Las manos son un detalle del artista; también podrían ser un pronóstico.",
      },
      { type: "h2", text: "Quién" },
      { type: "p", text: "Jophiel Espaillat, anestesiólogo (República Dominicana). Miembro de la especialidad que mantiene vivo al paciente mientras el bisturí se lleva los aplausos y la foto. El anestesiólogo es el único médico al que le pagan por que no pase nada: cuando el caso sale perfecto, nadie recuerda su nombre; cuando sale mal, todos lo recuerdan a la perfección." },
      { type: "p", text: "Es un trabajo raro. Consiste en llevar a una persona hasta el borde exacto entre el sueño y la muerte, sostenerla ahí durante horas con la mano firme, y traerla de vuelta como si nada — para que se despierte quejándose de la sed. Se hace en penumbra, mirando curvas, con una precisión que el resto del quirófano da por sentada hasta el segundo en que deja de estar." },
      { type: "h2", text: "Por qué DEC" },
      { type: "p", text: "Porque «más o menos 2 cc» no es una dosis, es una plegaria. Porque a las 3 a. m., con una bomba de infusión, un paciente de 6 kg y un vasoactivo que no perdona, la memoria es un mal sitio para guardar un factor de dilución. DEC nació de la terquedad de querer calcular antes que adivinar: diluciones, dosis y cálculos con la fuente citada, para que el cerebro se dedique a decidir en lugar de a multiplicar." },
      { type: "callout", variant: "info", text: "Aquí termina el humor y empieza la letra pequeña que sí importa: DEC calcula; el médico decide, verifica y firma. Cada dosis, dilución y vía se confirman contra la fuente y contra el paciente antes de tocarlo. La app es una calculadora con buena memoria, no un anestesiólogo — ese eres tú, y la responsabilidad también." },
      { type: "quote", text: "«El cirujano opera al paciente. El anestesiólogo opera al tiempo, a la presión, al dolor y a la muerte — todo a la vez, y en silencio.»" },
      { type: "p", text: "Si DEC te ahorra un cálculo a las 3 a. m., cumplió su propósito. Si además te saca una media sonrisa mientras esperas en tu propio banco con telarañas, mejor. Nos vemos en el próximo caso." },
    ],
  },
  {
    slug: "firmas-eeg-dsa",
    title: "Leer el DSA: las firmas EEG de los anestésicos",
    excerpt:
      "El índice biespectral te da un número; el espectrograma de densidad espectral te dice qué está pasando. Cómo reconocer la firma EEG de propofol, sevoflurano, ketamina, dexmedetomidina, N₂O y opioides — y titular profundidad con los ojos.",
    date: "2026-07-04",
    tags: ["Monitorización", "EEG"],
    readTime: "9 min",
    author: "Dr. Jophiel Espaillat",
    body: [
      { type: "p", text: "El BIS te da un número entre 0 y 100 y te pide fe. El DSA (density spectral array, el espectrograma que muchos monitores ya dibujan) te da el crudo: qué frecuencias domina el cerebro de tu paciente en tiempo real. Cada anestésico tiene una firma reconocible. Aprender a leerla es dejar de titular a ciegas." },
      { type: "callout", variant: "info", text: "El DSA es tiempo (eje X) vs frecuencia (eje Y) con potencia en color (rojo = mucha, azul = poca). Es la misma señal que el BIS procesa — pero sin el algoritmo cerrado de por medio. Purdon & Brown lo popularizaron para uso clínico (Purdon et al., Anesthesiology 2015)." },
      { type: "h2", text: "Las firmas por fármaco" },
      {
        type: "table",
        headers: ["Fármaco", "Firma en el DSA", "Interpretación"],
        rows: [
          ["Propofol", "α frontal (8–12 Hz) 'anteriorizado' + δ (0.5–4 Hz) de fondo", "Profundidad adecuada = banda α frontal robusta y coherente"],
          ["Sevoflurano/isoflurano", "Patrón similar al propofol: α frontal + δ (potencia θ añadida)", "GABAérgicos comparten la firma α-δ; interpretable igual"],
          ["Ketamina", "β/γ de alta frecuencia (>25 Hz), pierde el α frontal", "El BIS puede SUBIR con ketamina — no es despertar"],
          ["Dexmedetomidina", "Husos de sueño (spindles, 9–15 Hz) + δ lento", "Imita el sueño NREM N2/N3; paciente despertable"],
          ["N₂O (óxido nitroso)", "Aumento de potencia en β/γ; puede borrar el α frontal", "Añadido a un GABAérgico distorsiona el patrón esperado"],
          ["Opioides (solos)", "EEG casi silente / poco efecto en la banda α a dosis clínicas", "No producen la firma hipnótica; no confundir con hipnosis"],
        ],
      },
      { type: "h2", text: "Burst suppression: la señal que no quieres ignorar" },
      { type: "p", text: "Cuando el trazo alterna estallidos de actividad con silencios planos (burst suppression), estás en un plano profundo — a veces más profundo de lo necesario. En el DSA se ve como columnas verticales intermitentes de potencia separadas por franjas oscuras. Asociado a delirio postoperatorio en poblaciones vulnerables. Si no buscas neuroprotección específica, bájale al hipnótico." },
      { type: "callout", variant: "warn", text: "El burst suppression NO es sinónimo de sobredosis, pero en el anciano frágil sin indicación de supresión (p. ej. no estás protegiendo cerebro en aneurisma) es una bandera para reducir profundidad. Menos anestésico, mismo objetivo." },
      { type: "h2", text: "Cómo lo usas para titular" },
      {
        type: "ul",
        items: [
          "Busca la banda α frontal robusta con propofol/halogenados: es tu confirmación visual de hipnosis, más informativa que un número aislado.",
          "El paciente anciano 'anterioriza' menos y a menor potencia — no persigas el mismo DSA que en un joven, o lo sobredosificarás.",
          "Si el BIS sube pero el paciente recibió ketamina, mira el DSA: la β rápida explica el número, no el despertar.",
          "Dexmedetomidina sola da husos, no la firma α-δ profunda — no esperes un BIS de anestesia general con dexmed en monoterapia.",
        ],
      },
      { type: "p", text: "La monitorización EEG procesada no reemplaza mirar el trazo. Un número te dice 'cuánto'; el espectrograma te dice 'qué'. Revisa la sección /eeg de DEC para las firmas ilustradas y el reconocimiento de patrones lado a lado." },
      { type: "callout", variant: "danger", text: "Ningún monitor de profundidad garantiza ausencia de recuerdo. Es una capa más, no un seguro. El bloqueo neuromuscular sin hipnosis confirmada sigue siendo la pesadilla — vigila SIEMPRE dosis de hipnótico, no solo el índice." },
    ],
  },
  {
    slug: "perls-resucitacion-perioperatoria",
    title: "PeRLS: por qué la resucitación en quirófano no es ACLS",
    excerpt:
      "El paro perioperatorio se presencia, casi siempre conoces la causa, y el paciente ya tiene vía aérea, accesos y monitorización. Aplicar ACLS estándar 'de calle' ignora todo eso. Los algoritmos PeRLS para las causas que sí ves en el pabellón.",
    date: "2026-07-03",
    tags: ["Resucitación", "Emergencias"],
    readTime: "10 min",
    author: "Dr. Jophiel Espaillat",
    body: [
      { type: "p", text: "El ACLS se diseñó para el paro no presenciado, sin causa conocida, sin accesos, sin vía aérea. En el quirófano tú tienes lo contrario: lo estás viendo pasar, sabes qué le inyectaste hace 90 segundos, y ya hay tubo, línea y monitor. Correr el algoritmo genérico desperdicia toda esa ventaja. De ahí PeRLS — Perioperative Resuscitation and Life Support (Moitra et al., Anesthesiology 2025)." },
      { type: "callout", variant: "info", text: "Premisa de PeRLS: el paro en pabellón es un evento presenciado, monitorizado, con causa frecuentemente identificable y tratable en la fuente. La conducta se organiza por CAUSA, no por ritmo del algoritmo universal." },
      { type: "h2", text: "Bradicardia / asistolia por reflejo vagal" },
      { type: "p", text: "Tracción peritoneal, reflejo oculocardíaco, insuflación laparoscópica, laringoscopia. Retira el estímulo PRIMERO. Atropina 0.5–1 mg IV; si no responde, epinefrina en dosis crecientes. No esperes al paro completo si ves una bradicardia profunda con estímulo identificable." },
      { type: "h2", text: "Anafilaxia intraoperatoria" },
      { type: "p", text: "Colapso cardiovascular + broncoespasmo + rash, con relajantes musculares, antibióticos o látex como sospechosos frecuentes. Epinefrina es el tratamiento, no un adjunto: bolos IV titulados (10–100 mcg) e infusión si es refractaria. Líquidos agresivos. Retira el agente causal. La triptasa sérica se toma después, no antes de tratar." },
      { type: "callout", variant: "danger", text: "En anafilaxia, la epinefrina es de PRIMERA línea, no un rescate tardío. Retrasarla por 'probar antihistamínico y esteroide primero' mata pacientes. Esos son adjuntos, no tratamiento." },
      { type: "h2", text: "LAST (toxicidad por anestésico local)" },
      { type: "p", text: "Convulsión o arritmia tras un bloqueo o infiltración. Emulsión lipídica 20% es específica (bolo 1.5 mL/kg de peso magro + infusión). Evita vasopresina, bloqueadores de canales de calcio, betabloqueadores y más anestésico local. Dosis de epinefrina reducidas (<1 mcg/kg). Tenemos un artículo dedicado a los primeros 5 minutos." },
      { type: "h2", text: "Hipertermia maligna" },
      { type: "p", text: "Hipercapnia inexplicada que sube, taquicardia, rigidez, hipertermia tardía. Suspende el halogenado y la succinilcolina, hiperventila con O₂ al 100% con flujos altos, dantroleno 2.5 mg/kg IV repetible. Trata la hiperpotasemia y la acidosis. Llama por más manos: es trabajo de equipo, no de un solista." },
      { type: "h2", text: "Situaciones que rompen el molde del ACLS" },
      {
        type: "ul",
        items: [
          "Paro traumático / hemorrágico: la prioridad es control de sangrado y volumen (hipotensión permisiva hasta el control quirúrgico), no ciclos de compresiones sobre un tanque vacío.",
          "Bloqueo espinal alto / total: hipotensión y bradicardia extremas + apnea. Vía aérea, epinefrina y volumen; suele ser reversible si soportas los minutos críticos.",
          "RCP en decúbito prono: NO pierdas tiempo volteando primero. Compresiones sobre la columna dorsal (T7–T10) con contrapresión esternal; desfibrila en posición A-P. Voltear solo si es factible sin retrasar.",
          "Embolia aérea o de CO₂: inunda el campo, posición en decúbito lateral izquierdo/Trendelenburg, aspira por catéter central si lo hay.",
        ],
      },
      { type: "callout", variant: "warn", text: "PeRLS no deroga el ACLS: lo adapta al entorno donde tienes más información y más herramientas que nadie. Trata la causa que estás viendo. El ritmo del monitor es un dato, no la orden." },
      { type: "p", text: "Ten el carro, el dantroleno y la emulsión lipídica localizados ANTES de la crisis. En el paro perioperatorio, el minuto que pierdes buscando el frasco es el minuto que no recuperas." },
    ],
  },
  {
    slug: "peso-ideal-ajustado-magro",
    title: "¿Qué peso uso para dosificar?",
    excerpt:
      "Peso real, ideal (IBW), ajustado (ABW) o magro (LBM) — usar el equivocado en el paciente obeso significa sobredosis o infradosis. La regla, fármaco por fármaco, en una tabla que puedes fijar en la máquina.",
    date: "2026-07-02",
    tags: ["Farmacología", "Dosificación"],
    readTime: "7 min",
    author: "Dr. Jophiel Espaillat",
    body: [
      { type: "p", text: "\"Pesa 140 kg\" no es una dosis, es el comienzo de una pregunta. El peso que metes en el cálculo cambia según la farmacocinética del fármaco. Usar peso real para todo en el obeso sobredosifica los lipofílicos; usar peso ideal para todo infradosifica en la inducción. Aquí está la regla por fármaco." },
      { type: "callout", variant: "info", text: "IBW (ideal, por talla y sexo) · ABW (ajustado = IBW + 0.4×[real−IBW]) · LBM (masa magra, excluye grasa) · TBW (real/total). El error clásico es dosificar propofol de mantenimiento por peso total en el obeso mórbido — acumulas y no despierta." },
      { type: "h2", text: "La tabla de referencia" },
      {
        type: "table",
        headers: ["Fármaco / variable", "Peso a usar", "Por qué"],
        rows: [
          ["Propofol — inducción", "Peso magro (LBM)", "Bolo por magro evita el pico hipotensor por sobredosis"],
          ["Propofol — mantenimiento", "Peso ajustado (ABW)", "Refleja el volumen de distribución aumentado sin acumular"],
          ["Succinilcolina", "Peso real (TBW)", "La pseudocolinesterasa escala con la masa total; infradosis = intubación fallida"],
          ["Rocuronio / no despolarizantes", "Peso ideal (IBW)", "Hidrofílicos; por peso real prolongas el bloqueo innecesariamente"],
          ["Opioides (fentanilo, remi)", "Peso magro (LBM)", "Remifentanilo por magro/IBW; por real da rigidez y bradicardia"],
          ["Volumen tidal (Vt)", "Peso ideal (IBW)", "El pulmón no engorda: 6–8 mL/kg de IBW, no de TBW"],
          ["Anestésicos locales (dosis máx)", "Peso real (con tope absoluto)", "Pero respeta el mg/kg máximo y el tope en mg del fármaco"],
        ],
      },
      { type: "callout", variant: "danger", text: "Succinilcolina por peso ideal en el obeso = dosis insuficiente = relajación incompleta en la vía aérea difícil que más temes. Va por peso REAL. Es la excepción que la gente olvida bajo presión." },
      { type: "h2", text: "Perlas para no equivocarte" },
      {
        type: "ul",
        items: [
          "Volumen tidal por peso IDEAL siempre — programar 500 mL 'porque pesa 120 kg' es barotrauma programado.",
          "Remifentanilo y propofol de mantenimiento por magro/ajustado: en el obeso, el peso total te lleva a la acumulación.",
          "El rocuronio por peso real prolonga el bloqueo; súmale que el monitor de TOF se vuelve indispensable en el obeso.",
          "El tope de anestésico local es doble: mg/kg Y un máximo absoluto en mg. En obesidad, el máximo absoluto suele mandar antes que el mg/kg.",
        ],
      },
      { type: "p", text: "La barra de paciente de DEC calcula IBW, ABW y LBM al vuelo desde talla, sexo y peso, y aplica el peso correcto a cada fármaco de la ficha. Metes tres datos una vez; el catálogo dosifica con el peso que corresponde. Menos aritmética mental, menos errores de columna equivocada." },
    ],
  },
  {
    slug: "last-emulsion-lipidica",
    title: "LAST: los primeros 5 minutos",
    excerpt:
      "Toxicidad sistémica por anestésico local — primero el sistema nervioso, luego el corazón. El reconocimiento, la dosis exacta de emulsión lipídica al 20%, y las cuatro cosas que NO debes hacer aunque el reflejo te lo pida.",
    date: "2026-07-01",
    tags: ["Emergencias", "Farmacología"],
    readTime: "6 min",
    author: "Dr. Jophiel Espaillat",
    body: [
      { type: "p", text: "El LAST (local anesthetic systemic toxicity) es de esas urgencias donde el tratamiento correcto es contraintuitivo y el tiempo es músculo cardíaco. Se presenta después de un bloqueo, una infiltración generosa o una inyección intravascular inadvertida. Reconocerlo tarde es la diferencia entre un susto y un paro refractario." },
      { type: "h2", text: "Reconocimiento: neuro primero, cardíaco después" },
      { type: "p", text: "El sistema nervioso avisa antes que el corazón: sabor metálico, acúfenos, parestesias peribucales, agitación, confusión — luego convulsión. La toxicidad cardíaca sigue: hipotensión, bradicardia, bloqueos, arritmias ventriculares y colapso. Ojo: con bupivacaína el colapso cardiovascular puede ser el PRIMER signo, sin pródromo neurológico." },
      { type: "callout", variant: "warn", text: "En una inyección intravascular masiva, el orden 'neuro luego cardíaco' se comprime o se invierte. No esperes el pródromo clásico para actuar si el paciente colapsa durante un bloqueo." },
      { type: "h2", text: "Emulsión lipídica al 20% — la dosis" },
      {
        type: "ol",
        items: [
          "Bolo: 1.5 mL/kg de peso magro en 1 minuto (~100 mL en un adulto de 70 kg).",
          "Infusión: 0.25 mL/kg/min inmediatamente después del bolo.",
          "Si persiste inestabilidad: repite el bolo 1–2 veces y/o duplica la infusión a 0.5 mL/kg/min.",
          "Continúa la infusión al menos 10 minutos tras recuperar estabilidad hemodinámica.",
          "Límite superior recomendado ~10–12 mL/kg en los primeros 30 minutos.",
        ],
      },
      { type: "callout", variant: "danger", text: "Lo que NO debes dar en LAST: vasopresina, betabloqueadores, bloqueadores de canales de calcio, y por supuesto MÁS anestésico local — nada de lidocaína como antiarrítmico (es anestésico local y empeora el cuadro). Si hay arritmia ventricular, la amiodarona sí es aceptable." },
      { type: "h2", text: "ACLS modificado para LAST" },
      {
        type: "ul",
        items: [
          "Epinefrina en dosis REDUCIDAS: <1 mcg/kg por bolo (no el 1 mg estándar de golpe) — dosis altas dificultan la reanimación lipídica.",
          "Vía aérea y oxigenación primero: la hipoxia y la acidosis potencian la toxicidad. Controla la convulsión con benzodiacepina (evita propofol en dosis grandes si hay inestabilidad cardíaca).",
          "Emulsión lipídica en paralelo a la RCP, no después de que 'falle todo lo demás'.",
          "Paro refractario prolongado: considera bypass cardiopulmonar/ECMO — el anestésico local se redistribuye y la recuperación puede llegar si sostienes la circulación.",
        ],
      },
      { type: "p", text: "Ten el kit de emulsión lipídica localizado en cada sitio donde hagas bloqueos, con la dosis pegada al frasco. En LAST, buscar la fórmula en el celular mientras alguien comprime es tiempo que no tienes. Guía basada en ASRA (Neal et al.)." },
    ],
  },
  {
    slug: "valoracion-preanestesica-scores",
    title: "Scores que sí cambian la conducta: RCRI, STOP-BANG, Apfel",
    excerpt:
      "Tres scores de valoración preanestésica que no son papeleo: predicen riesgo cardíaco, apnea del sueño y náusea postoperatoria — y cada uno tiene una conducta asociada. Factores, cortes e integración práctica.",
    date: "2026-06-30",
    tags: ["Valoración", "Preoperatorio"],
    readTime: "8 min",
    author: "Dr. Jophiel Espaillat",
    body: [
      { type: "p", text: "Un score que no cambia lo que haces es papeleo con pretensiones. Estos tres sí mueven la conducta: te dicen a quién optimizar, a quién vigilar distinto en recuperación y a quién profilaxis antes de que vomite. Los factores caben en la memoria; lo que importa es qué haces con el resultado." },
      { type: "h2", text: "RCRI — riesgo cardíaco (Lee et al., Circulation 1999)" },
      { type: "p", text: "El Revised Cardiac Risk Index estima eventos cardíacos mayores en cirugía no cardíaca. Seis factores, 1 punto cada uno:" },
      {
        type: "ul",
        items: [
          "Cirugía de alto riesgo (intraperitoneal, intratorácica, vascular suprainguinal).",
          "Cardiopatía isquémica (historia de IAM, angina, ondas Q, prueba de esfuerzo positiva).",
          "Insuficiencia cardíaca congestiva.",
          "Enfermedad cerebrovascular (ACV o AIT previo).",
          "Diabetes en tratamiento con insulina.",
          "Creatinina sérica > 2.0 mg/dL.",
        ],
      },
      { type: "callout", variant: "info", text: "Conducta: 0–1 factores = riesgo bajo, procede. ≥2 factores con baja capacidad funcional (<4 METs) es donde considerar biomarcadores (BNP/troponina), optimización médica o cambiar el plan. El RCRI no pide un cateterismo — pide pensar." },
      { type: "h2", text: "STOP-BANG — apnea obstructiva del sueño (Chung et al., Anesthesiology 2008)" },
      { type: "p", text: "Cribado de AOS, alto rendimiento por su simplicidad. Un punto por cada sí:" },
      {
        type: "table",
        headers: ["Letra", "Factor", "Letra", "Factor"],
        rows: [
          ["S — Snoring", "Ronquido fuerte", "B — BMI", "IMC > 35 kg/m²"],
          ["T — Tired", "Somnolencia diurna", "A — Age", "Edad > 50 años"],
          ["O — Observed", "Apneas observadas", "N — Neck", "Cuello > 40 cm"],
          ["P — Pressure", "Hipertensión", "G — Gender", "Sexo masculino"],
        ],
      },
      { type: "callout", variant: "warn", text: "Corte: ≥3 = riesgo intermedio-alto de AOS; ≥5 = alto riesgo. Conducta: titulación opioide conservadora, evitar sedación residual, monitorización postoperatoria prolongada con oximetría, y considerar CPAP. La AOS no diagnosticada es una causa evitable de desastre en recuperación." },
      { type: "h2", text: "Apfel — náusea y vómito postoperatorio (Apfel et al.)" },
      { type: "p", text: "Cuatro factores, 1 punto cada uno, y una escala de riesgo casi lineal:" },
      {
        type: "ul",
        items: [
          "Sexo femenino.",
          "No fumador.",
          "Historia de NVPO o cinetosis.",
          "Uso previsto de opioides postoperatorios.",
        ],
      },
      {
        type: "table",
        headers: ["Puntos Apfel", "Riesgo aproximado de NVPO", "Conducta"],
        rows: [
          ["0", "~10%", "Sin profilaxis rutinaria"],
          ["1", "~20%", "Un antiemético"],
          ["2", "~40%", "Dos agentes de clases distintas"],
          ["3", "~60%", "Multimodal + anestesia libre de opioides / TIVA"],
          ["4", "~80%", "Estrategia agresiva multimodal + dexametasona + TIVA con propofol"],
        ],
      },
      { type: "callout", variant: "info", text: "La clave del Apfel: combina agentes de MECANISMOS distintos (antagonista 5-HT3 + dexametasona + droperidol/haloperidol), no dos del mismo. Y considera TIVA con propofol, que es antiemético por sí misma." },
      { type: "p", text: "Ninguno de los tres reemplaza la evaluación clínica — la estratifican. Úsalos para justificar la conducta, no para sustituirla: el score te dice el 'cuánto riesgo'; tú decides el 'qué hago con él' según el paciente frente a ti." },
    ],
  },
  {
    slug: "vasopresores-infusion",
    title: "Guía rápida: vasopresores en infusión continua",
    excerpt:
      "Norepinefrina, vasopresina, fenilefrina y epinefrina — diluciones estándar, rangos de dosis y perlas clínicas para el manejo hemodinámico perioperatorio.",
    date: "2026-05-02",
    tags: ["Farmacología", "UCI"],
    readTime: "8 min",
    author: "Dr. Jophiel Espaillat",
    body: [
      { type: "p", text: "El vasopresor correcto, a la dilución correcta, titulado a un objetivo — no a una corazonada. Esta es una referencia de bolsillo para las cuatro aminas que más vas a colgar en el perioperatorio. No sustituye el juicio clínico ni la monitorización invasiva cuando está indicada." },
      { type: "callout", variant: "warn", text: "Las dosis son de literatura aceptada (Stoelting, Miller, UpToDate). Titula según respuesta hemodinámica, comorbilidades y monitorización. Verifica las presentaciones con tu farmacia local." },
      { type: "h2", text: "Diluciones y rangos estándar" },
      {
        type: "table",
        headers: ["Fármaco", "Dilución típica", "Rango de dosis", "Nota"],
        rows: [
          ["Norepinefrina", "4–16 mg / 250 mL", "0.01–0.5 mcg/kg/min", "Primera línea en shock vasodilatador y séptico"],
          ["Vasopresina", "20 U / 100 mL", "0.03 U/min (fija)", "NO se titula por peso; ahorra catecolaminas"],
          ["Fenilefrina", "10–20 mg / 250 mL", "0.1–2 mcg/kg/min · bolos 50–200 mcg", "α puro; útil con taquicardia o EA"],
          ["Epinefrina", "2–4 mg / 250 mL", "0.01–0.5 mcg/kg/min", "β1 a dosis bajas, α a dosis altas"],
        ],
      },
      { type: "h2", text: "Perlas clínicas" },
      {
        type: "ul",
        items: [
          "Norepinefrina por vía central de preferencia; por periférica, tolerable a corto plazo y baja concentración vigilando extravasación.",
          "Vasopresina a dosis fija (0.03 U/min) como segundo agente; no la subas titulando como una catecolamina.",
          "Fenilefrina puede bajar el gasto cardíaco por aumento de poscarga y bradicardia refleja — cuidado en disfunción de VI.",
          "La hipotensión que no responde a dosis crecientes: piensa en acidosis, hipocalcemia, insuficiencia suprarrenal o hipovolemia no resuelta.",
        ],
      },
      { type: "callout", variant: "danger", text: "Extravasación de vasopresor = urgencia. Fentolamina local es el antídoto clásico. No 'esperes a ver'." },
      { type: "p", text: "Para el cálculo bidireccional dosis ⇄ ritmo con la dilución exacta de tu ampolla, usa la calculadora de infusión de DEC — hace la aritmética para que tú vigiles al paciente." },
    ],
  },
  {
    slug: "bienvenida",
    title: "Bienvenidos a DEC",
    excerpt:
      "Por qué construí una herramienta de cálculo de dosis desde cero, y por qué las alternativas no me convencían.",
    date: "2026-04-18",
    tags: ["DEC", "Anuncio"],
    readTime: "3 min",
    author: "Dr. Jophiel Espaillat",
    body: [
      { type: "p", text: "DEC nació de una frustración concreta: en el quirófano necesito la dosis, la dilución y el ritmo — rápido, offline, sin anuncios y sin diez toques. Las apps que probé fallaban en al menos uno de esos ejes." },
      { type: "h2", text: "Los principios" },
      {
        type: "ol",
        items: [
          "La información de seguridad clínica es gratis y funciona sin señal. Siempre.",
          "Datos verificados por literatura aceptada, fármaco por fármaco. Nada de pattern-matching.",
          "Diseño afilado y minimal. Sin gradientes pastel genéricos de IA.",
          "Humor negro en la interfaz — nunca en el contenido clínico.",
        ],
      },
      { type: "p", text: "Este blog documenta las decisiones clínicas y técnicas detrás de DEC. Si algo te parece incorrecto, escríbeme: errores@decanestesia.com." },
      { type: "quote", text: "Porque \"más o menos 2 cc\" no es una dosis." },
    ],
  },
  {
    slug: "json-vs-core-data",
    title: "Por qué elegí JSON sobre Core Data para la base de fármacos",
    excerpt:
      "La decisión arquitectónica detrás de la base de datos de DEC: cuándo lo relacional es overkill y cuándo un archivo plano es exactamente lo que necesitas.",
    date: "2026-04-18",
    tags: ["Desarrollo", "iOS"],
    readTime: "5 min",
    author: "Dr. Jophiel Espaillat",
    body: [
      { type: "p", text: "El catálogo de DEC es de lectura casi pura: 494 fármacos que se consultan miles de veces y se editan por lotes desde un pipeline. Ese patrón no pide una base de datos relacional en el dispositivo — pide un snapshot embebido." },
      { type: "h2", text: "El razonamiento" },
      {
        type: "ul",
        items: [
          "Offline-first real: un JSON en el bundle funciona desde el primer segundo, sin migraciones ni red.",
          "El snapshot ES el backup: regenerable con un comando desde Supabase.",
          "Un solo archivo sirve a web e iOS — mismas filas crudas, mismo contrato.",
          "Core Data brilla con escrituras concurrentes y relaciones complejas del usuario; aquí sería complejidad sin retorno.",
        ],
      },
      { type: "code", text: "node scripts/generate-snapshot.mjs  →  drugs-full.json (494 fármacos + detalle)" },
      { type: "p", text: "La regla: elige la herramienta por el patrón de acceso, no por la moda. Para un catálogo clínico versionado, el archivo plano gana." },
      { type: "callout", variant: "info", text: "Dos pausas del plan free de Supabase tumbaron la app antes de esto. El snapshot embebido convirtió esa catástrofe en un no-evento." },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function allPosts(): Post[] {
  return [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
}
