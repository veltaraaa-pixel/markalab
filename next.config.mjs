/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compresión automática de respuestas
  compress: true,

  // Headers de seguridad para producción
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },

  images: {
    // Formatos modernos para mejor compresión
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },

  // Elimina el header "x-powered-by: Next.js"
  poweredByHeader: false,
}

export default nextConfig
