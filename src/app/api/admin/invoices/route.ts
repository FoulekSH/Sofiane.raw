import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get("clientId")
  const search = searchParams.get("search")

  const where: any = {}
  if (clientId) where.clientId = clientId
  if (search) where.invoiceNum = { contains: search }

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { client: true }
  })
  return NextResponse.json(invoices)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  try {
    const { clientId, type, invoiceNum, issueDate, dueDate, address, vatRate, vatAmount, totalAmount, status, items, paymentTerms, footerNotes } = await req.json()
    
    const invoice = await prisma.invoice.create({
      data: {
        clientId,
        type: type || "INVOICE",
        invoiceNum,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        address,
        vatRate: vatRate || 20.0,
        vatAmount: vatAmount || 0.0,
        totalAmount,
        status: status || "DRAFT",
        items: JSON.stringify(items),
        paymentTerms,
        footerNotes
      }
    })

    return NextResponse.json(invoice)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: "Erreur creation facture: " + error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  try {
    const { id, status } = await req.json()
    const updated = await prisma.invoice.update({
      where: { id },
      data: { status }
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Erreur mise à jour statut" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 })

  try {
    await prisma.invoice.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
