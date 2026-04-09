"use client"

export default function PrintActions() {
  return (
    <div className="fixed bottom-8 right-8 print:hidden flex gap-4">
      <button 
        onClick={() => window.close()} 
        className="px-6 py-2 bg-zinc-200 text-black rounded-full text-xs uppercase tracking-widest font-bold hover:bg-zinc-300 transition"
      >
        Fermer
      </button>
      <button 
        onClick={() => window.print()} 
        className="px-8 py-3 bg-black text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-zinc-800 transition shadow-xl"
      >
        Imprimer / Enregistrer PDF
      </button>
    </div>
  )
}
