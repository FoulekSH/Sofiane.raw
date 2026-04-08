import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const { id } = params

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true }
  })

  if (!invoice) notFound()

  const items = JSON.parse(invoice.items as string)

  return (
    <div className="bg-white text-black min-h-screen p-8 md:p-20 font-serif">
      {/* Header Facture */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-20 gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter">SOFIANE <span className="font-light italic">RAW</span></h1>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Photographie de Prestige</p>
          <div className="text-[10px] text-zinc-400 space-y-1 pt-4 font-sans">
             <p>51 RUE DE LA PHOTOGRAPHIE</p>
             <p>75008 PARIS, FRANCE</p>
             <p>SIRET: 123 456 789 00012</p>
             <p>CONTACT@SOFIANE.RAW</p>
          </div>
        </div>
        
        <div className="text-right space-y-1 font-sans">
          <h2 className="text-2xl font-bold mb-4 uppercase tracking-widest">Facture</h2>
          <p className="text-sm text-zinc-600 uppercase tracking-widest font-bold">Document: <span className="text-black">{invoice.invoiceNum}</span></p>
          <p className="text-sm text-zinc-600 uppercase tracking-widest font-bold">Date: <span className="text-black">{new Date(invoice.issueDate).toLocaleDateString()}</span></p>
          {invoice.dueDate && (
            <p className="text-sm text-zinc-600 uppercase tracking-widest font-bold">Échéance: <span className="text-black">{new Date(invoice.dueDate).toLocaleDateString()}</span></p>
          )}
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-20 font-sans">
        <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 mb-4 font-bold">Facturé à</p>
        <div className="space-y-1">
           <h3 className="text-xl font-bold">{invoice.client?.name}</h3>
           {invoice.client?.company && <p className="text-zinc-600">{invoice.client.company}</p>}
           {invoice.client?.email && <p className="text-zinc-600">{invoice.client.email}</p>}
           {invoice.client?.phone && <p className="text-zinc-600">{invoice.client.phone}</p>}
        </div>
      </div>

      {/* Table Items */}
      <table className="w-full text-left border-collapse mb-20 font-sans">
        <thead>
          <tr className="border-y-2 border-black text-[10px] uppercase tracking-[0.3em] font-bold">
            <th className="py-6 px-4">Description</th>
            <th className="py-6 px-4 text-center">Quantité</th>
            <th className="py-6 px-4 text-right">Prix Unitaire</th>
            <th className="py-6 px-4 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {items.map((item: any, idx: number) => (
            <tr key={idx}>
              <td className="py-6 px-4 text-sm">{item.description}</td>
              <td className="py-6 px-4 text-center text-sm">{item.quantity}</td>
              <td className="py-6 px-4 text-right text-sm">{item.price.toLocaleString()} €</td>
              <td className="py-6 px-4 text-right text-sm font-bold">{(item.quantity * item.price).toLocaleString()} €</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
           <tr className="border-t-2 border-black">
              <td colSpan={3} className="py-8 px-4 text-right font-bold uppercase tracking-widest text-sm">Total Net à Payer</td>
              <td className="py-8 px-4 text-right font-bold text-2xl">{invoice.totalAmount.toLocaleString()} €</td>
           </tr>
        </tfoot>
      </table>

      {/* Footer / Notes */}
      <div className="mt-auto pt-20 border-t border-zinc-100 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-[10px] text-zinc-400 uppercase tracking-widest leading-relaxed">
           <div>
              <p className="font-bold text-black mb-4">Informations de Paiement</p>
              <p>Virement Bancaire (RIB joint)</p>
              <p>IBAN: FR76 1234 5678 9012 3456 7890 123</p>
              <p>BIC: EXEMPLEXXXX</p>
           </div>
           <div>
              <p className="font-bold text-black mb-4">Conditions Générales</p>
              <p>Pénalités de retard applicables après l'échéance.</p>
              <p>Pas d'escompte pour paiement anticipé.</p>
              <p>La propriété des clichés est transférée après paiement complet.</p>
           </div>
        </div>
        
        <div className="mt-20 text-center">
           <button 
             onClick={() => window.print()} 
             className="print:hidden px-8 py-3 bg-black text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-zinc-800 transition"
           >
             Imprimer cette facture
           </button>
        </div>
      </div>
      
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { padding: 0; margin: 0; }
          .print\\:hidden { display: none !important; }
          @page { margin: 2cm; }
        }
      `}} />
    </div>
  )
}
