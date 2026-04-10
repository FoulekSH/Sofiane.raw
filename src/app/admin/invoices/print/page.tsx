import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import PrintActions from "@/components/PrintActions"

const DEFAULT_PAYMENT_TERMS = "Virement Bancaire (RIB joint)\nIBAN: FR76 1234 5678 9012 3456 7890 123\nBIC: EXEMPLEXXXX"
const DEFAULT_FOOTER_NOTES = "Pénalités de retard applicables après l'échéance.\nPas d'escompte pour paiement anticipé.\nLa propriété des clichés est transférée après paiement complet."

export default async function PrintInvoicesPage({ searchParams }: { searchParams: Promise<{ ids: string }> }) {
  const { ids } = await searchParams
  
  if (!ids) return notFound()
  
  const idArray = ids.split(',')
  
  const invoices = await prisma.invoice.findMany({
    where: { id: { in: idArray } },
    include: { client: true }
  })

  if (invoices.length === 0) return notFound()

  return (
    <div className="invoice-body min-h-screen">
      <div className="print-area">
        {invoices.map((invoice, index) => {
          const items = JSON.parse(invoice.items as string)
          const subtotal = items.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0)
          const vatAmount = (subtotal * invoice.vatRate) / 100
          
          return (
            <div key={invoice.id} className="a4-page shadow-2xl">
              {/* Header */}
              <div className="header">
                <div className="brand">
                  <h1 className="text-black">SOFIANE <span className="italic font-light">RAW</span></h1>
                  <p className="subtitle">Photographie de Prestige</p>
                  <div className="my-info">
                    <p>51 RUE DE LA PHOTOGRAPHIE</p>
                    <p>75008 PARIS, FRANCE</p>
                    <p>SIRET: 123 456 789 00012</p>
                    <p>CONTACT@SOFIANE.RAW</p>
                  </div>
                </div>
                
                <div className="doc-info">
                  <h2 className="text-black font-bold">{invoice.type === 'QUOTE' ? 'DEVIS' : 'FACTURE'}</h2>
                  <div className="info-grid mt-4">
                    <p><span>N° DOCUMENT</span> <strong>{invoice.invoiceNum}</strong></p>
                    <p><span>DATE D'ÉMISSION</span> <strong>{new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</strong></p>
                    {invoice.dueDate && (
                      <p><span>DATE D'ÉCHÉANCE</span> <strong>{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</strong></p>
                    )}
                  </div>
                </div>
              </div>

              {/* Client & Content Wrapper */}
              <div className="main-content">
                <div className="client-section">
                  <p className="label">CLIENT</p>
                  <div className="client-details">
                     <h3>{invoice.client?.name}</h3>
                     {invoice.client?.company && <p className="company">{invoice.client.company}</p>}
                     <p className="address">{invoice.address || invoice.client?.address}</p>
                     {invoice.client?.email && <p className="email">{invoice.client.email}</p>}
                  </div>
                </div>

                {/* Table */}
                <div className="table-container">
                  <table className="invoice-table">
                    <thead>
                      <tr>
                        <th className="text-left">Désignation des prestations</th>
                        <th className="text-center">Qté</th>
                        <th className="text-right">Prix Unit. HT</th>
                        <th className="text-right">Montant HT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="font-medium">{item.description}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-right">{item.price.toLocaleString('fr-FR')} €</td>
                          <td className="text-right">{(item.quantity * item.price).toLocaleString('fr-FR')} €</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Section */}
                <div className="totals-section">
                  <div className="spacer"></div>
                  <div className="totals-box">
                     <div className="total-row">
                        <span>TOTAL HORS TAXES</span>
                        <span>{subtotal.toLocaleString('fr-FR')} €</span>
                     </div>
                     <div className="total-row">
                        <span>TVA ({invoice.vatRate}%)</span>
                        <span>{vatAmount.toLocaleString('fr-FR')} €</span>
                     </div>
                     <div className="total-row grand-total bg-black text-white px-4 py-3 mt-4">
                        <span className="font-bold">TOTAL TTC À PAYER</span>
                        <span className="font-bold text-xl">{invoice.totalAmount.toLocaleString('fr-FR')} €</span>
                     </div>
                  </div>
                </div>
              </div>

              {/* Footer Footer */}
              <div className="footer-area">
                <div className="footer-notes">
                  <div className="payment-info">
                    <p className="footer-label">Informations de Paiement</p>
                    <div className="footer-text whitespace-pre-line">
                      {invoice.paymentTerms || DEFAULT_PAYMENT_TERMS}
                    </div>
                  </div>
                  <div className="terms-info">
                    <p className="footer-label">Conditions Générales</p>
                    <div className="footer-text whitespace-pre-line">
                      {invoice.footerNotes || DEFAULT_FOOTER_NOTES}
                    </div>
                  </div>
                </div>
                <div className="bottom-bar text-center mt-10 pt-4 border-t border-zinc-100">
                   <p className="text-[7pt] text-zinc-400 uppercase tracking-widest">Sofiane Raw - Photographe Haute Couture - www.sofiane-raw.com</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <PrintActions />

      <style dangerouslySetInnerHTML={{ __html: `
        /* RESET & BASE */
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .invoice-body { background: #1a1a1a; font-family: 'Inter', 'Helvetica', sans-serif; padding: 60px 0; color: #1a1a1a; }
        
        /* PAGE A4 FIXE */
        .a4-page {
          background: white;
          width: 210mm;
          height: 297mm;
          margin: 0 auto 60px auto;
          padding: 25mm 20mm;
          position: relative;
          display: flex;
          flex-direction: column;
          color: #1a1a1a;
        }

        .header { display: flex; justify-content: space-between; margin-bottom: 25mm; align-items: flex-start; }
        .brand h1 { font-size: 26pt; letter-spacing: -1.5pt; font-weight: 900; line-height: 1; }
        .brand .italic { font-style: italic; font-weight: 300; }
        .brand .subtitle { font-size: 7.5pt; text-transform: uppercase; letter-spacing: 4.5pt; color: #71717a; margin-top: 8pt; font-weight: 600; }
        .my-info { font-size: 7.5pt; color: #71717a; margin-top: 20pt; line-height: 1.6; font-weight: 400; }
        
        .doc-info { text-align: right; }
        .doc-info h2 { font-size: 28pt; letter-spacing: 1pt; margin-bottom: 5pt; font-weight: 900; }
        .info-grid p { font-size: 7.5pt; color: #71717a; margin-bottom: 4pt; display: flex; justify-content: flex-end; gap: 15pt; }
        .info-grid p span { font-weight: 700; color: #a1a1aa; letter-spacing: 0.5pt; }
        .info-grid p strong { color: black; font-weight: 800; }

        .main-content { flex-grow: 1; }
        .client-section { margin-bottom: 20mm; border-left: 3pt solid black; padding-left: 20pt; }
        .client-section .label { font-size: 7pt; text-transform: uppercase; letter-spacing: 3pt; color: #a1a1aa; margin-bottom: 10pt; font-weight: 800; }
        .client-details h3 { font-size: 16pt; font-weight: 900; margin-bottom: 5pt; letter-spacing: -0.5pt; }
        .client-details p { font-size: 9pt; color: #3f3f46; line-height: 1.5; font-weight: 500; }
        .client-details .company { font-weight: 700; text-transform: uppercase; font-size: 8pt; color: black; margin-bottom: 3pt; }
        .client-details .address { white-space: pre-line; margin-top: 5pt; }

        .table-container { margin-bottom: 15mm; }
        .invoice-table { width: 100%; border-collapse: collapse; }
        .invoice-table th { border-bottom: 2pt solid black; padding: 15pt 10pt; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 2pt; font-weight: 800; color: black; }
        .invoice-table td { padding: 14pt 10pt; font-size: 9.5pt; border-bottom: 1px solid #f4f4f5; color: #1a1a1a; }
        .font-medium { font-weight: 600; }
        
        .text-left { text-align: left; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }

        .totals-section { display: flex; margin-top: 5mm; }
        .totals-section .spacer { flex-grow: 1; }
        .totals-section .totals-box { width: 90mm; }
        .total-row { display: flex; justify-content: space-between; padding: 8pt 10pt; font-size: 9pt; color: #71717a; font-weight: 600; }
        .grand-total { border-radius: 4pt; color: white !important; }
        .grand-total span { color: white; }

        .footer-area { margin-top: auto; }
        .footer-notes { display: flex; gap: 25mm; border-top: 1px solid #f4f4f5; padding-top: 15mm; }
        .footer-label { font-size: 7.5pt; font-weight: 900; text-transform: uppercase; margin-bottom: 10pt; color: black; letter-spacing: 1.5pt; }
        .footer-text { font-size: 7.5pt; color: #71717a; line-height: 1.7; font-weight: 500; }

        /* IMPRESSION */
        @media print {
          @page { size: A4; margin: 0; }
          .invoice-body { background: white; padding: 0; margin: 0; }
          .a4-page { margin: 0; box-shadow: none; border: none; width: 210mm; height: 297mm; padding: 25mm 20mm; }
          .print-area { width: 210mm; }
          .print\\:hidden { display: none !important; }
          header, footer, nav, aside { display: none !important; }
        }
      `}} />
    </div>
  )
}
