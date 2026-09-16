import prisma from "@/lib/prisma"
import Gallery from "@/components/Gallery"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"
import { resolveCategory, categoryNeedles, categoryMatches } from "@/lib/categories"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const cat = resolveCategory(slug)
  const config = await prisma.categoryConfig.findUnique({ where: { slug: cat?.slug || slug } })
  const name = config?.name || cat?.name || slug

  return {
    title: `${name} | Sofiane Raw`,
    description: `Découvrez la série ${name} par Sofiane, photographe portrait, mode et événementiel.`,
    openGraph: config?.coverImage
      ? { images: [{ url: `/api/photos/${config.coverImage}` }] }
      : undefined,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params

    const cat = resolveCategory(slug)

    // Trouver la config de la catégorie (clé = slug canonique si connu)
    const config = await prisma.categoryConfig.findUnique({
      where: { slug: cat?.slug || slug }
    })

    const allPhotos = await prisma.photo.findMany({
      where: { isPublic: true },
      orderBy: { order: 'asc' }
    })

    const photos = allPhotos.filter((photo) => {
      if (!cat && !config) return false

      if (cat) return categoryMatches(photo.category, cat)

      if (config?.name) {
        const configNeedles = Array.from(
          new Set([config.name, ...(categoryNeedles({ slug: slug, name: config.name }))].filter(Boolean))
        )
        return configNeedles.some((needle) => 
          categoryMatches(photo.category, { slug: slug, name: needle })
        )
      }

      return false
    })

    if (photos.length === 0 && !config && !cat) {
      notFound()
    }

    return (
      <main className="min-h-screen bg-zinc-950 text-white pb-20">
        {/* Image d'entête personnalisable (admin > Catégories) */}
        {config?.coverImage && (
          <div className="relative w-full h-[45vh] md:h-[60vh] overflow-hidden">
            <Image
              src={`/api/photos/${config.coverImage}`}
              alt={config?.name || cat?.name || slug}
              fill
              priority
              sizes="100vw"
              className="object-cover md:grayscale pointer-events-none select-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950/60 pointer-events-none"></div>
          </div>
        )}

        <div className={`max-w-7xl mx-auto space-y-12 px-4 md:px-12 ${config?.coverImage ? '-mt-32 relative z-10' : 'pt-32'}`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-900 pb-12">
            <div className="space-y-4 relative z-50">
              <Link
                href="/"
                className="relative z-50 inline-flex items-center gap-2 -ml-2 px-2 py-2 text-[10px] uppercase tracking-[0.4em] text-zinc-400 hover:text-white transition pointer-events-auto"
              >
                <ArrowLeft size={12} strokeWidth={2.5} />
                Retour
              </Link>
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase italic leading-none">
                {config?.name || cat?.name || slug}
              </h1>
            </div>
            <div className="max-w-sm">
              <p className="text-zinc-500 text-sm leading-relaxed uppercase tracking-widest font-light">
                Explorez la série {config?.name || cat?.name || slug}. Chaque image raconte une histoire unique capturée avec précision et passion.
              </p>
            </div>
          </div>

          <Gallery photos={photos.map(p => p.filename)} />

          {/* CTA — cette catégorie n'avait jusqu'ici aucun lien vers le formulaire */}
          <div className="border-t border-zinc-900 pt-16 pb-8 text-center space-y-6">
             <p className="text-zinc-400 text-sm uppercase tracking-widest">
                Cette série vous inspire ? Parlons de votre projet.
             </p>
             <Link
                href="/#contact"
                className="inline-block group relative px-14 py-5 overflow-hidden bg-white rounded-full transition-all duration-500 hover:bg-zinc-200 hover:scale-105"
             >
                <span className="relative z-10 text-black text-xs font-black uppercase tracking-[0.4em]">
                   Réserver une séance
                </span>
             </Link>
          </div>
        </div>
      </main>
    )
  } catch (error) {
    console.error("Error rendering Category page:", error)
    notFound()
  }
}
