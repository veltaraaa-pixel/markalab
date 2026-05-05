import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.markalab.com.mx'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MarkaLab | Marketing and Sales Consulting | CDMX',
    template: '%s | MarkaLab',
  },
  description:
    'Consultora de Marketing y Ventas en CDMX. Diseñamos e implementamos sistemas comerciales con IA que generan leads, aceleran conversiones y fidelizan clientes. Jardines del Pedregal.',
  keywords: [
    'consultoría marketing México',
    'ventas CDMX',
    'marketing digital México',
    'generación de leads',
    'automatización ventas',
    'MarkaLab',
    'consultoría comercial',
    'Jardines del Pedregal',
  ],
  authors: [{ name: 'MarkaLab' }],
  creator: 'MarkaLab',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: siteUrl,
    siteName: 'MarkaLab',
    title: 'MarkaLab | Marketing and Sales Consulting',
    description:
      'Transformamos negocios con estrategia comercial inteligente. Set-up Inicial, Atracción, Conversión y Fidelización impulsados por IA.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MarkaLab - Marketing and Sales Consulting',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MarkaLab | Marketing and Sales Consulting',
    description: 'Transformamos negocios con estrategia comercial inteligente.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
