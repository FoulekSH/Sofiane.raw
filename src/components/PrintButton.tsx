"use client"

import { useParams } from "next/navigation"

export default function PrintButton() {
  const params = useParams()
  const id = params.id as string

  const handlePrint = () => {
    // Redirige vers la page de template A4 optimisée
    window.open(`/admin/invoices/print?ids=${id}`, '_blank')
  }

  return (
    <button 
      onClick={handlePrint} 
      className="print:hidden px-8 py-3 bg-black text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-zinc-800 transition shadow-lg"
    >
      Générer le PDF (Template A4)
    </button>
  )
}
