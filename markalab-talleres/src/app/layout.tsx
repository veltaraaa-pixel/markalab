import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';

// Las fuentes van dentro del repositorio (src/fonts, licencia OFL): la página
// no le pide nada a Google ni al compilar ni cuando alguien la abre.
// Archivo es variable en peso y en ancho; el ancho expandido da los titulares.
const archivo = localFont({
  src: '../fonts/Archivo-latin-wdth-wght.woff2',
  variable: '--font-archivo',
  weight: '100 900',
  display: 'swap',
  declarations: [{ prop: 'font-stretch', value: '62% 125%' }],
});
const jet = localFont({
  src: '../fonts/JetBrainsMono-latin-wght.woff2',
  variable: '--font-jet',
  weight: '100 800',
  display: 'swap',
});

const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.markalab.com.mx';

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: 'El taller que avisa solo · MarkaLab',
  description:
    'Estatus de servicio por WhatsApp, autorizaciones, agenda y recordatorios para talleres automotrices de alta gama. Conectado a tu ERP y CRM.',
  openGraph: {
    title: 'El taller que avisa solo',
    description: 'Cada auto reporta su estatus por WhatsApp. Tu asesor suelta el teléfono.',
    type: 'website',
    locale: 'es_MX',
    siteName: 'MarkaLab',
  },
  alternates: { canonical: '/talleres/' },
  authors: [{ name: 'MarkaLab', url: 'https://www.markalab.com.mx' }],
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#07090C',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const ga = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang="es-MX" className={`${archivo.variable} ${jet.variable}`}>
      <body>
        {children}
        {ga ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`,
              }}
            />
          </>
        ) : null}
      </body>
    </html>
  );
}
