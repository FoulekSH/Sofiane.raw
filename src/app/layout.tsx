import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import AuthProvider from "@/components/AuthProvider"

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
})

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: "SOFIANE RAW | PHOTOGRAPHE HAUTE COUTURE",
  description: "Portfolio de Sofiane, photographe spécialisé en portrait, mode et événements. Expérience visuelle immersive.",
}

import Script from "next/script"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="dark">
      <head>
        <Script 
          src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js" 
          strategy="lazyOnload"
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-zinc-950 text-zinc-50 antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
