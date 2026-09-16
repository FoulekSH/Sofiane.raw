import prisma from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, Check } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tarifs | Sofiane Raw",
  description: "Prestations et tarifs de Sofiane, photographe portrait, mode et événementiel.",
}

export const revalidate = 60

export default async function TarifsPage() {
  const plans = await prisma.pricingPlan.findMany({
    where: { isPublic: true },
    orderBy: { order: "asc" }
  })

  return (
    <main className="min-h-screen bg-zinc-950 text-white pt-40 pb-32 px-4 md:px-12">
      <div className="max-w-6xl mx-auto space-y-20">
        <div className="space-y-4">
          <Link href="/" className="relative z-50 inline-flex items-center gap-2 -ml-2 px-2 py-2 text-[10px] uppercase tracking-[0.4em] text-zinc-400 hover:text-white transition">
            <ArrowLeft size={12} strokeWidth={2.5} />
            Retour
          </Link>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase italic leading-none">Tarifs.</h1>
          <p className="text-zinc-400 text-sm leading-relaxed uppercase tracking-widest font-light max-w-lg pt-2">
            Chaque projet est unique — voici une base pour vous situer. Un devis précis est établi après échange sur vos besoins.
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-32 space-y-6">
            <p className="text-zinc-600 uppercase tracking-widest text-sm">Grille tarifaire en cours de préparation.</p>
            <Link
              href="/#contact"
              className="inline-block bg-white text-black px-10 py-4 rounded-full text-xs font-black uppercase tracking-[0.3em] hover:bg-zinc-200 transition"
            >
              Demander un devis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const features: string[] = (() => {
                try { return JSON.parse(plan.features) } catch { return [] }
              })()

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl p-10 space-y-8 border transition ${
                    plan.highlighted
                      ? "border-amber-200/40 bg-gradient-to-b from-zinc-900 to-zinc-950 shadow-2xl shadow-amber-500/5 md:-translate-y-4"
                      : "border-zinc-800 bg-zinc-950"
                  }`}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-200 to-yellow-600 text-black text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
                      Le plus demandé
                    </span>
                  )}

                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold uppercase tracking-widest">{plan.name}</h2>
                    {plan.tagline && <p className="text-zinc-500 text-sm leading-relaxed">{plan.tagline}</p>}
                  </div>

                  <div className="text-3xl font-light italic font-serif text-white">{plan.price}</div>

                  <ul className="space-y-4 flex-grow">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                        <Check size={14} className="text-amber-200 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/?plan=${encodeURIComponent(plan.name)}#contact`}
                    className={`text-center px-6 py-4 rounded-full text-xs font-black uppercase tracking-[0.3em] transition ${
                      plan.highlighted
                        ? "bg-white text-black hover:bg-zinc-200"
                        : "border border-zinc-700 text-white hover:bg-zinc-900"
                    }`}
                  >
                    Réserver
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
