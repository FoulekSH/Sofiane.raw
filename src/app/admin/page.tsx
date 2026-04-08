import prisma from "@/lib/prisma"

export default async function AdminDashboard() {
  const clientsCount = await prisma.client.count()
  const transfersCount = await prisma.transfer.count()
  const invoicesCount = await prisma.invoice.count()

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h2 className="text-3xl font-light text-white italic">Tableau de bord</h2>
        <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Vue d'ensemble de votre activité</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card Clients */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl hover:border-zinc-700 transition duration-500">
          <h3 className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-6">Total Clients</h3>
          <p className="text-6xl font-light text-white">{clientsCount}</p>
          <div className="h-1 w-12 bg-zinc-800 mt-8"></div>
        </div>

        {/* Card Transferts */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl hover:border-zinc-700 transition duration-500">
          <h3 className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-6">Transferts Actifs</h3>
          <p className="text-6xl font-light text-white">{transfersCount}</p>
          <div className="h-1 w-12 bg-zinc-800 mt-8"></div>
        </div>

        {/* Card Factures */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl hover:border-zinc-700 transition duration-500">
          <h3 className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-6">Factures Édités</h3>
          <p className="text-6xl font-light text-white">{invoicesCount}</p>
          <div className="h-1 w-12 bg-zinc-800 mt-8"></div>
        </div>
      </div>
      
      <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-12 text-center md:text-left">
        <div className="max-w-2xl space-y-6">
           <h3 className="text-2xl font-light text-white italic">Bienvenue, Sofiane.</h3>
           <p className="text-zinc-400 leading-relaxed font-light">
             Votre écosystème est prêt. Partagez vos œuvres avec le module WeTransfer, gérez vos relations clients et éditez des documents de facturation qui reflètent votre niveau d'exigence.
           </p>
           <div className="pt-6">
              <div className="inline-flex items-center gap-4 text-xs text-zinc-500 uppercase tracking-widest">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 Système Opérationnel
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
