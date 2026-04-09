"use client"

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="print:hidden px-8 py-3 bg-black text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-zinc-800 transition"
    >
      Imprimer cette facture
    </button>
  )
}
