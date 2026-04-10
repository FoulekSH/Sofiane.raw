import prisma from "@/lib/prisma"
import Gallery from "@/components/Gallery"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Trouver la config de la catégorie
  const config = await prisma.categoryConfig.findUnique({
    where: { slug }
  })

  // Récupérer les photos de cette catégorie
  const photos = await prisma.photo.findMany({
    where: {
      isPublic: true,
      OR: [
        { category: { equals: slug } },
        { category: { equals: config?.name || slug } }
      ]
    },
    orderBy: { order: 'asc' }
  })

  if (photos.length === 0 && !config) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white pt-32 pb-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-900 pb-12">
          <div className="space-y-4 relative z-50">
            <Link href="/" className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 hover:text-white transition">← Retour</Link>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase italic leading-none">
              {config?.name || slug}
            </h1>
          </div>
          <div className="max-w-sm">
            <p className="text-zinc-500 text-sm leading-relaxed uppercase tracking-widest font-light">
              Explorez la série {config?.name || slug}. Chaque image raconte une histoire unique capturée avec précision et passion.
            </p>
          </div>
        </div>

        <Gallery photos={photos.map(p => p.filename)} />
      </div>
    </main>
  )
}
