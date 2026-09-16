import type { MetadataRoute } from "next"
import prisma from "@/lib/prisma"
import { CATEGORIES } from "@/lib/categories"

const SITE_URL = "https://sofiane.raw.evasion-studio.fr"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categoryConfigs = await prisma.categoryConfig.findMany({ select: { slug: true, updatedAt: true } })
  const knownSlugs = new Set(CATEGORIES.map((c) => c.slug))
  categoryConfigs.forEach((c) => knownSlugs.add(c.slug))

  const categoryEntries: MetadataRoute.Sitemap = Array.from(knownSlugs).map((slug) => {
    const config = categoryConfigs.find((c) => c.slug === slug)
    return {
      url: `${SITE_URL}/portfolio/${slug}`,
      lastModified: config?.updatedAt ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }
  })

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/tarifs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...categoryEntries,
  ]
}
