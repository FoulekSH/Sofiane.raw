import prisma from "@/lib/prisma"
import Link from "next/link"

export default async function AdminDashboard() {
  const clientsCount = await prisma.client.count()
  const transfersCount = await prisma.transfer.count()
  const invoices = await prisma.invoice.findMany()
  const photosCount = await prisma.photo.count()
  
  const unreadMessages = await prisma.contactMessage.findMany({
    where: { status: "UNREAD" },
    orderBy: { createdAt: "desc" },
    take: 5
  })

  const recentTransfers = await prisma.transfer.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { client: true }
  })

  // Calculs financiers
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0)
  const totalPaid = invoices.filter(i => i.status === "PAID").reduce((acc, inv) => acc + inv.totalAmount, 0)
  const totalPending = invoices.filter(i => i.status === "TO_PAY" || i.status === "SENT").reduce((acc, inv) => acc + inv.totalAmount, 0)
  const totalOverdue = invoices.filter(i => i.status === "OVERDUE").reduce((acc, inv) => acc + inv.totalAmount, 0)

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h2 className="text-3xl font-light text-white italic">Tableau de bord</h2>
        <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Vue d'ensemble de votre activité</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-zinc-500 text-[9px] uppercase tracking-widest font-black mb-4">Portfolio</h3>
          <p className="text-4xl font-light text-white">{photosCount}</p>
          <p className="text-[10px] text-zinc-600 mt-2">Images publiques</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-zinc-500 text-[9px] uppercase tracking-widest font-black mb-4 text-green-500">Total Encaissé</h3>
          <p className="text-4xl font-light text-white">{totalPaid.toLocaleString()} €</p>
          <p className="text-[10px] text-zinc-600 mt-2">Factures réglées</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-zinc-500 text-[9px] uppercase tracking-widest font-black mb-4 text-amber-500">En attente</h3>
          <p className="text-4xl font-light text-white">{totalPending.toLocaleString()} €</p>
          <p className="text-[10px] text-zinc-600 mt-2">À percevoir</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl border-l-4 border-l-red-500">
          <h3 className="text-zinc-500 text-[9px] uppercase tracking-widest font-black mb-4 text-red-500">En retard</h3>
          <p className="text-4xl font-light text-white">{totalOverdue.toLocaleString()} €</p>
          <p className="text-[10px] text-zinc-600 mt-2 italic text-red-400">Action requise</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Derniers Messages */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center text-white font-bold">
            <h3 className="text-xs uppercase font-black tracking-widest">Inbox Récente ({unreadMessages.length})</h3>
            <Link href="/admin/messages" className="text-[9px] uppercase font-bold text-zinc-500 hover:text-white transition">Tout voir →</Link>
          </div>
          <div className="divide-y divide-zinc-800">
            {unreadMessages.length === 0 ? (
              <p className="p-10 text-center text-zinc-600 text-[10px] uppercase tracking-widest">Aucun message non lu</p>
            ) : (
              unreadMessages.map(m => (
                <Link key={m.id} href="/admin/messages" className="block p-6 hover:bg-zinc-800/50 transition">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-bold text-white uppercase">{m.name}</span>
                    <span className="text-[8px] text-zinc-600">{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">{m.subject}</p>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Etat des Factures */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center text-white font-bold">
            <h3 className="text-xs uppercase font-black tracking-widest">Suivi Facturation</h3>
            <Link href="/admin/invoices" className="text-[9px] uppercase font-bold text-zinc-500 hover:text-white transition">Gérer →</Link>
          </div>
          <div className="p-8 space-y-6">
             <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                   <span>Recouvrement</span>
                   <span className="text-white">{Math.round((totalPaid / (totalInvoiced || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-white h-full transition-all duration-1000" style={{ width: `${(totalPaid / (totalInvoiced || 1)) * 100}%` }}></div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                   <p className="text-[8px] uppercase font-black text-zinc-600 mb-1">Payé</p>
                   <p className="text-xl font-light text-green-500">{totalPaid.toLocaleString()} €</p>
                </div>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                   <p className="text-[8px] uppercase font-black text-zinc-600 mb-1">Dû</p>
                   <p className="text-xl font-light text-amber-500">{totalPending.toLocaleString()} €</p>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-12 text-center md:text-left relative overflow-hidden">
        <div className="max-w-2xl space-y-6 relative z-10">
           <h3 className="text-2xl font-light text-white italic">Système de Photographie de Prestige.</h3>
           <p className="text-zinc-400 leading-relaxed font-light text-sm uppercase tracking-widest">
             Gérez votre studio avec la précision du RAW. Votre activité est centralisée, sécurisée et performante.
           </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/5 to-transparent"></div>
      </div>
    </div>
  )
}
