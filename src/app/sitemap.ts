import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.markalab.com.mx'

export default function sitemap(): MetadataRoute.Sitemap {
  const rutas = ['', '/servicios', '/nuestra-formula', '/diagnostico', '/contacto', '/aviso-de-privacidad']

  return rutas.map((ruta) => ({
    url: `${siteUrl}${ruta}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: ruta === '' ? 1 : ruta === '/aviso-de-privacidad' ? 0.3 : 0.8,
  }))
}
