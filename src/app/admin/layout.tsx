import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row text-white">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900 border-r border-zinc-800 flex-shrink-0">
        <div className="p-6">
          <Link href="/admin">
            <h2 className="text-2xl tracking-widest font-light text-center md:text-left hover:text-zinc-300 transition cursor-pointer">
              S <span className="font-bold">RAW</span>
            </h2>
          </Link>
        </div>
        <nav className="mt-6 flex flex-col space-y-2 px-4">
          <Link href="/admin" className="px-4 py-3 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition">
            Tableau de bord
          </Link>
          <Link href="/admin/transfers" className="px-4 py-3 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition">
            Transferts (WeTransfer)
          </Link>
          <Link href="/admin/clients" className="px-4 py-3 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition">
            Clients
          </Link>
          <Link href="/admin/invoices" className="px-4 py-3 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition">
            Factures & Devis
          </Link>
          <Link href="/admin/portfolio" className="px-4 py-3 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition">
            Portfolio Public
          </Link>
          <Link href="/" className="px-4 py-3 rounded text-zinc-500 hover:text-zinc-300 mt-8 block">
            ← Voir le site
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-zinc-800">
          <h1 className="text-3xl font-light text-white">Administration</h1>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400 text-sm hidden md:inline-block">Connecté en tant que {session?.user?.email}</span>
            <form action="/api/auth/signout" method="POST">
              <button className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 transition text-sm">
                Déconnexion
              </button>
            </form>
          </div>
        </header>
        
        {children}
      </main>
    </div>
  )
}
