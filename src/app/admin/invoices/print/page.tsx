import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import PrintActions from "@/components/PrintActions"

export default async function PrintInvoicesPage({ searchParams }: { searchParams: Promise<{ ids: string }> }) {
  const { ids } = await searchParams
  
  if (!ids) return notFound()
  
  const idArray = ids.split(',')
  
  const invoices = await prisma.invoice.findMany({
    where: { id: { in: idArray } },
    include: { client: true }
  })

  const settingsRaw = await prisma.settings.findUnique({ where: { key: "invoice_defaults" } })
  const settings = settingsRaw ? JSON.parse(settingsRaw.value) : {
    companyName: "SOFIANE RAW",
    serviceTagline: "Photographie de Prestige",
    website: "www.sofiane-raw.com",
    email: "contact@sofiane.raw",
    phone: "",
    address: "51 RUE DE LA PHOTOGRAPHIE, 75008 PARIS",
    siret: "123 456 789 00012",
    bankHolder: "SOFIANE RAW",
    iban: "FR76 1234 5678 9012 3456 7890 123",
    bic: "EXEMPLEXXXX",
    defaultPaymentTerms: "Virement Bancaire (RIB joint)",
    defaultFooterNotes: "Pénalités de retard applicables après l'échéance."
  }

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
                  <h1 className="text-black uppercase tracking-widest">{settings.companyName || "SOFIANE RAW"}</h1>
                  <p className="subtitle">{settings.serviceTagline || "Photographie de Prestige"}</p>
                  <div className="my-info mt-8 space-y-1">
                    {settings.website && <p>{settings.website}</p>}
                    {settings.email && <p>{settings.email}</p>}
                    {settings.phone && <p>{settings.phone}</p>}
                  </div>
                </div>
                
                <div className="doc-info">
                  <h2 className="text-black font-bold">{invoice.type === 'QUOTE' ? 'DEVIS' : 'FACTURE'} {invoice.invoiceNum}</h2>
                  <div className="info-grid mt-4">
                    <p className="justify-end gap-4">
                      <span className="text-[7pt]">56, Rue Philippe Dartis, 95210 Saint-Gratien</span>
                    </p>
                    <p><span>DATE D'ÉMISSION</span> <strong>{new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</strong></p>
                    {invoice.dueDate && (
                      <p><span>DATE D'ÉCHÉANCE</span> <strong>{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</strong></p>
                    )}
                  </div>
                </div>
              </div>

              {/* Client & Content Wrapper */}
              <div className="main-content">
                <div className="client-section flex justify-between items-start">
                  <div>
                    <p className="label">FACTURÉ À</p>
                    <div className="client-details">
                       <h3>{invoice.client?.name}</h3>
                       <p className="address">{invoice.address || invoice.client?.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="label">SIRET CLIENT</p>
                    <p className="text-sm font-bold">{invoice.client?.siret || "N/A"}</p>
                  </div>
                </div>

                {/* Table */}
                <div className="table-container mt-10">
                  <table className="invoice-table">
                    <thead>
                      <tr>
                        <th className="text-left py-4">SERVICE</th>
                        <th className="text-center py-4">QTÉ</th>
                        <th className="text-right py-4">PRIX</th>
                        <th className="text-right py-4">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-6">
                            <div className="font-bold uppercase text-[9pt]">{item.description}</div>
                            <div className="text-[7pt] text-zinc-400 mt-1 uppercase">FEVRIER 2025</div>
                          </td>
                          <td className="text-center font-light">{item.quantity}</td>
                          <td className="text-right font-light">{item.price.toLocaleString('fr-FR')}€</td>
                          <td className="text-right font-light">{(item.quantity * item.price).toLocaleString('fr-FR')}€</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Section */}
                <div className="totals-section mt-10">
                  <div className="spacer"></div>
                  <div className="totals-box border-t-2 border-black pt-4">
                     <div className="flex justify-between items-center px-4">
                        <span className="text-[10pt] font-bold uppercase tracking-widest">TOTAL</span>
                        <span className="text-[14pt] font-black">{invoice.totalAmount.toLocaleString('fr-FR')}€</span>
                     </div>
                  </div>
                </div>
              </div>

              {/* Footer Footer */}
              <div className="footer-area mt-20">
                <div className="flex justify-between items-end border-t border-zinc-100 pt-10">
                  <div className="bank-info space-y-1">
                    <p className="text-[8pt] font-bold uppercase tracking-widest mb-3">RIB = {settings.bankHolder || settings.companyName}</p>
                    <p className="text-[8pt] text-zinc-500">IBAN : {settings.iban}</p>
                    <p className="text-[8pt] text-zinc-500">BIC : {settings.bic}</p>
                  </div>
                  <div className="company-seal text-right">
                    <h4 className="text-xl font-black tracking-tighter">{settings.companyName}</h4>
                  </div>
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
