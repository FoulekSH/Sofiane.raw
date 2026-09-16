import type { MetadataRoute } from "next"

const SITE_URL = "https://sofiane.raw.evasion-studio.fr"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/login", "/dl"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
