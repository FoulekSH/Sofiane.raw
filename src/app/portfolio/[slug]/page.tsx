import prisma from "@/lib/prisma"
import Gallery from "@/components/Gallery"
import { notFound } from "next/navigation"
import Link from "next/link"
import { resolveCategory, categoryNeedles } from "@/lib/categories"

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params

    const cat = resolveCategory(slug)

    // Trouver la config de la catégorie (clé = slug canonique si connu)
    const config = await prisma.categoryConfig.findUnique({
      where: { slug: cat?.slug || slug }
    })

    // Toutes les valeurs possibles à chercher dans Photo.category
    const needles = Array.from(
      new Set([slug, config?.name, ...(cat ? categoryNeedles(cat) : [])].filter(Boolean) as string[])
    )

    // Récupérer les photos de cette catégorie
    const photos = await prisma.photo.findMany({
      where: {
        isPublic: true,
        OR: needles.map((n) => ({ category: { contains: n } }))
      },
      orderBy: { order: 'asc' }
    })

    if (photos.length === 0 && !config && !cat) {
      notFound()
    }

    return (
      <main className="min-h-screen bg-zinc-950 text-white pb-20">
        {/* Image d'entête personnalisable (admin > Catégories) */}
        {config?.coverImage && (
          <div className="relative w-full h-[45vh] md:h-[60vh] overflow-hidden">
            <img
              src={`/api/photos/${config.coverImage}`}
              alt={config?.name || cat?.name || slug}
              className="w-full h-full object-cover md:grayscale pointer-events-none select-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950/60"></div>
          </div>
        )}

        <div className={`max-w-7xl mx-auto space-y-12 px-4 md:px-12 ${config?.coverImage ? '-mt-32 relative z-10' : 'pt-32'}`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-900 pb-12">
            <div className="space-y-4 relative z-50">
              <Link href="/" className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 hover:text-white transition">← Retour</Link>
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
        </div>
      </main>
    )
  } catch (error) {
    console.error("Error rendering Category page:", error)
    notFound()
  }
}
