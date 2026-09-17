import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.markalab.com.mx'

export default function sitemap(): MetadataRoute.Sitemap {
  const rutas = ['', '/servicios', '/nuestra-formula', '/diagnostico', '/contacto']

  return rutas.map((ruta) => ({
    url: `${siteUrl}${ruta}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: ruta === '' ? 1 : 0.8,
  }))
}
