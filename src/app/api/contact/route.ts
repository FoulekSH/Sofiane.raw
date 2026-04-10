import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 })
    }

    // Protection anti-spam basique : vérification du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 })
    }

    const newMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject: subject || "Demande de contact",
        message,
        status: "UNREAD"
      }
    })

    return NextResponse.json({ success: true, message: "Message envoyé avec succès" })
  } catch (error) {
    console.error("Contact API error:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de l'envoi" }, { status: 500 })
  }
}
