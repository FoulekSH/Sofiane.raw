import { Star } from "lucide-react"

type ReviewItem = {
  id: string
  authorName: string
  rating: number
  text: string
  source: string | null
}

export default function ReviewsCarousel({ reviews }: { reviews: ReviewItem[] }) {
  // Pas d'avis ajoutés en admin : on n'affiche rien plutôt qu'un bandeau vide.
  if (reviews.length === 0) return null

  const track = reviews.length > 2 ? [...reviews, ...reviews] : reviews

  return (
    <div className="pt-4 space-y-6">
      <p className="text-zinc-500 text-[9px] uppercase tracking-[0.5em] font-bold text-center">Ils en parlent</p>

      <div className="relative -mx-4 md:-mx-8">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 md:w-24 bg-gradient-to-r from-zinc-950 to-transparent z-10"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 md:w-24 bg-gradient-to-l from-zinc-950 to-transparent z-10"></div>

        <div className={`flex gap-4 px-4 md:px-8 ${reviews.length > 2 ? "w-max animate-marquee" : "flex-wrap justify-center"}`}>
          {track.map((review, i) => (
            <div
              key={`${review.id}-${i}`}
              className="w-[280px] flex-shrink-0 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4 text-left"
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    size={12}
                    className={s < review.rating ? "text-amber-200" : "text-zinc-700"}
                    fill={s < review.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed line-clamp-4">« {review.text} »</p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-white text-xs font-bold uppercase tracking-widest">{review.authorName}</span>
                {review.source && (
                  <span className="text-zinc-600 text-[9px] uppercase tracking-widest">via {review.source}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
