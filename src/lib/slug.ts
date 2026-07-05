// src/lib/slug.ts
//
// Slugify compartido cliente/servidor. Vive fuera de blog-actions.ts porque
// ese módulo es "use server" (solo puede exportar server actions async).

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita acentos (combining marks)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
