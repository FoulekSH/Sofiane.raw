import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function DownloadPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const transfer = await prisma.transfer.findUnique({
    where: { token },
    include: { client: true }
  })

  if (!transfer) {
    notFound()
  }

  const isExpired = new Date(transfer.expiresAt) < new Date()

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-white">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-light tracking-widest">SOFIANE <span className="font-bold">RAW</span></h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest">Partage de fichiers sécurisé</p>
        </div>

        {isExpired ? (
          <div className="py-12 space-y-4">
            <div className="text-red-500 text-5xl">⚠</div>
            <h2 className="text-xl font-medium">Lien expiré</h2>
            <p className="text-zinc-400">Ce lien de téléchargement n'est plus valide. Veuillez contacter le photographe pour un nouveau lien.</p>
          </div>
        ) : (
          <>
            <div className="py-6 border-y border-zinc-800 space-y-4">
              <div className="text-zinc-400 text-sm uppercase">Fichier prêt pour :</div>
              <div className="text-2xl font-light">{transfer.client?.name || "Client"}</div>
              
              <div className="bg-zinc-950 p-6 rounded-lg border border-zinc-800 mt-6 inline-block w-full">
                 <p className="text-lg font-medium truncate mb-1">{transfer.originalName}</p>
                 <p className="text-zinc-500 text-sm">{(transfer.size / (1024 * 1024)).toFixed(2)} Mo • Expire le {new Date(transfer.expiresAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-4">
              <a 
                href={`/api/transfers/download/${token}`}
                className="block w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-zinc-200 transition duration-300 transform hover:scale-[1.02]"
              >
                TÉLÉCHARGER LE FICHIER
              </a>
              <p className="text-zinc-500 text-xs">Le téléchargement commencera instantanément.</p>
            </div>
          </>
        )}

        <div className="pt-8 text-zinc-600 text-xs border-t border-zinc-800">
          © {new Date().getFullYear()} Sofiane Raw • Tous droits réservés
        </div>
      </div>
    </div>
  )
}
