import prisma from "@/lib/prisma"

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

export default async function AnalyticsPage() {
  const since7 = daysAgo(7)
  const since30 = daysAgo(30)
  const since14 = daysAgo(14)

  const [views7, views30, allDevices, recentViews, topPathsRaw] = await Promise.all([
    prisma.pageView.count({ where: { createdAt: { gte: since7 } } }),
    prisma.pageView.count({ where: { createdAt: { gte: since30 } } }),
    prisma.pageView.findMany({ where: { createdAt: { gte: since30 } }, select: { device: true } }),
    prisma.pageView.findMany({ where: { createdAt: { gte: since14 } }, select: { path: true, createdAt: true } }),
    prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: since30 } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 8
    })
  ])

  const mobileCount = allDevices.filter(d => d.device === "mobile").length
  const devicePct = allDevices.length > 0 ? Math.round((mobileCount / allDevices.length) * 100) : 0

  // Répartition par jour sur les 14 derniers jours (mini-graphe en barres)
  const dayBuckets: { label: string; count: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const day = daysAgo(i)
    const next = daysAgo(i - 1)
    const count = recentViews.filter(v => v.createdAt >= day && v.createdAt < next).length
    dayBuckets.push({ label: day.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), count })
  }
  const maxDay = Math.max(1, ...dayBuckets.map(d => d.count))
  const maxTopPath = Math.max(1, ...topPathsRaw.map(p => p._count.path))

  const totalAllTime = await prisma.pageView.count()

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h2 className="text-3xl font-light text-white italic">Statistiques</h2>
        <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">
          Fréquentation du site public — suivi maison, sans cookie ni service tiers
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-zinc-500 text-[9px] uppercase tracking-widest font-black mb-4">7 derniers jours</h3>
          <p className="text-4xl font-light text-white">{views7}</p>
          <p className="text-[10px] text-zinc-600 mt-2">Pages vues</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-zinc-500 text-[9px] uppercase tracking-widest font-black mb-4">30 derniers jours</h3>
          <p className="text-4xl font-light text-white">{views30}</p>
          <p className="text-[10px] text-zinc-600 mt-2">Pages vues</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-zinc-500 text-[9px] uppercase tracking-widest font-black mb-4">Mobile</h3>
          <p className="text-4xl font-light text-white">{devicePct}%</p>
          <p className="text-[10px] text-zinc-600 mt-2">{mobileCount} sur {allDevices.length || 0} (30j)</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-zinc-500 text-[9px] uppercase tracking-widest font-black mb-4">Depuis le début</h3>
          <p className="text-4xl font-light text-white">{totalAllTime}</p>
          <p className="text-[10px] text-zinc-600 mt-2">Pages vues au total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
          <h3 className="text-xs uppercase font-black tracking-widest text-white">Visites — 14 derniers jours</h3>
          <div className="flex items-end gap-1.5 h-32">
            {dayBuckets.map((d, i) => (
              <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-2 group relative">
                <div
                  className="w-full bg-amber-200/80 group-hover:bg-amber-200 rounded-t-sm transition-colors"
                  style={{ height: `${Math.max(4, (d.count / maxDay) * 100)}%` }}
                  title={`${d.label} : ${d.count}`}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[8px] text-zinc-600 uppercase tracking-widest">
            <span>{dayBuckets[0]?.label}</span>
            <span>{dayBuckets[dayBuckets.length - 1]?.label}</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-5">
          <h3 className="text-xs uppercase font-black tracking-widest text-white">Pages les plus vues (30j)</h3>
          {topPathsRaw.length === 0 ? (
            <p className="text-zinc-600 text-[10px] uppercase tracking-widest">Pas encore de données.</p>
          ) : (
            <div className="space-y-3">
              {topPathsRaw.map((p) => (
                <div key={p.path} className="space-y-1">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest">
                    <span className="text-zinc-300 truncate max-w-[70%]">{p.path === "/" ? "Accueil" : p.path}</span>
                    <span className="text-zinc-500">{p._count.path}</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-200/80 h-full" style={{ width: `${(p._count.path / maxTopPath) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {views30 === 0 && (
        <p className="text-zinc-700 text-[10px] uppercase tracking-widest">
          Aucune donnée pour l'instant — revenez après quelques visites sur le site.
        </p>
      )}
    </div>
  )
}
