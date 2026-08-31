import nodemailer from "nodemailer"
import prisma from "@/lib/prisma"

export async function getAdminContactEmail() {
  try {
    const setting = await prisma.settings.findUnique({
      where: { key: "invoice_defaults" },
    })

    if (setting) {
      const parsed = JSON.parse(setting.value)
      if (parsed?.email && typeof parsed.email === "string") {
        return parsed.email.trim()
      }
    }
  } catch {
    // No saved admin email yet, use env fallback below.
  }

  return (process.env.CONTACT_EMAIL || process.env.SMTP_USER || "contact@sofiane.raw").trim()
}

export async function sendContactNotification({
  name,
  email,
  subject,
  message,
}: {
  name: string
  email: string
  subject?: string
  message: string
}) {
  const smtpHost = process.env.SMTP_HOST
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  const hasPlaceholderConfig =
    !smtpHost ||
    !smtpUser ||
    !smtpPass ||
    smtpHost.includes("example") ||
    smtpUser.includes("example") ||
    smtpPass.includes("CHANGE_ME") ||
    smtpPass.includes("your-") ||
    smtpPass.includes("replace")

  if (hasPlaceholderConfig) {
    console.warn("SMTP not configured. Contact email notification was skipped.")
    return { sent: false, reason: "missing-smtp-config" }
  }

  const adminEmail = await getAdminContactEmail()
  const transport = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  const mailSubject = subject?.trim() || "Nouvelle demande de contact"

  await transport.sendMail({
    from: process.env.SMTP_FROM || smtpUser,
    to: adminEmail,
    replyTo: email,
    subject: `[Sofiane.raw] ${mailSubject}`,
    text: [
      `Nom: ${name}`,
      `Email: ${email}`,
      `Objet: ${mailSubject}`,
      "",
      "Message:",
      message,
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.7;">
        <h2 style="margin: 0 0 16px; font-size: 20px;">Nouvelle demande de contact</h2>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Objet :</strong> ${mailSubject}</p>
        <div style="margin-top: 20px; padding: 16px; background: #f3f4f6; border-radius: 8px;">
          <strong>Message :</strong>
          <div style="margin-top: 10px; white-space: pre-wrap;">${message.replace(/\n/g, "<br />")}</div>
        </div>
      </div>
    `,
  })

  return { sent: true, to: adminEmail }
}
