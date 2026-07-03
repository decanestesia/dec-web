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
  | { type: "quote"; text: string };

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
