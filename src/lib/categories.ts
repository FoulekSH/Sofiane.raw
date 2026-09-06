// Source unique de vérité pour les catégories du portfolio.
//
// `slug`   : utilisé dans les URLs publiques (/portfolio/<slug>) et comme clé
//            dans la table CategoryConfig.
// `name`   : libellé affiché ET valeur stockée dans Photo.category
//            (une photo peut en cumuler plusieurs : "Mode / Éditorial, Sport").
// `aliases`: autres valeurs éventuelles rencontrées dans Photo.category.

export type Category = {
  slug: string
  name: string
  aliases?: string[]
}

export const CATEGORIES: Category[] = [
  { slug: "editorial", name: "Mode / Éditorial", aliases: ["editorial", "éditorial", "mode"] },
  { slug: "branding", name: "Branding / Content", aliases: ["branding", "content"] },
  { slug: "event", name: "Événementiel", aliases: ["evenementiel", "événementiel", "event"] },
  { slug: "sport", name: "Sport" },
  { slug: "portrait", name: "Portraits", aliases: ["portrait", "portraits"] },
  { slug: "auto", name: "Automobile", aliases: ["auto", "automobile"] },
]

export function resolveCategory(slugOrName: string): Category | undefined {
  const q = slugOrName.trim().toLowerCase()
  return CATEGORIES.find(
    (c) =>
      c.slug.toLowerCase() === q ||
      c.name.toLowerCase() === q ||
      (c.aliases || []).some((a) => a.toLowerCase() === q)
  )
}

// Toutes les chaînes à rechercher dans Photo.category (contains) pour une catégorie.
export function categoryNeedles(cat: Category): string[] {
  return [cat.name, cat.slug, ...(cat.aliases || [])]
}

// Est-ce qu'une valeur Photo.category (potentiellement multi-catégories)
// appartient à la catégorie donnée ?
export function photoInCategory(photoCategory: string | null | undefined, cat: Category): boolean {
  const parts = (photoCategory || "").split(",").map((p) => p.trim().toLowerCase())
  const wanted = new Set(categoryNeedles(cat).map((n) => n.toLowerCase()))
  return parts.some((p) => wanted.has(p))
}
