import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import AuthProvider from "@/components/AuthProvider"
import FloatingCTA from "@/components/FloatingCTA"
import AnalyticsBeacon from "@/components/AnalyticsBeacon"
import SiteNav from "@/components/SiteNav"

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
})

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
})

const SITE_URL = "https://sofiane.raw.evasion-studio.fr"
const SITE_TITLE = "Sofiane Raw | Photographe Portrait, Mode & Événementiel"
const SITE_DESCRIPTION = "Portfolio de Sofiane, photographe spécialisé en portrait, mode, événementiel et automobile. Réservez une séance : expérience visuelle immersive, résultats haut de gamme."
const DEFAULT_OG_IMAGE = "/api/photos/1788372699331_A7409178.jpg"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Sofiane Raw",
  },
  description: SITE_DESCRIPTION,
  keywords: ["photographe", "portrait", "mode", "éditorial", "événementiel", "automobile", "Paris"],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Sofiane Raw",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 1600 }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
}

import type { Viewport } from "next"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

import Script from "next/script"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-zinc-950 text-zinc-50 antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "Sofiane Raw",
              description: SITE_DESCRIPTION,
              url: SITE_URL,
              image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
              areaServed: "Paris, France",
              sameAs: [
                "https://www.instagram.com/sofiane.raw/",
                "https://www.tiktok.com/@sofiane.raw",
                "https://www.linkedin.com/in/sofiane-belhou/",
              ],
            }),
          }}
        />
        <AuthProvider>{children}</AuthProvider>
        <SiteNav />
        <FloatingCTA />
        <AnalyticsBeacon />
        <Script 
          src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js" 
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}
