import type { NextConfig } from 'next';

/**
 * v1.2 · La landing se publica DENTRO del sitio principal en
 * www.markalab.com.mx/talleres.
 *
 * `npm run build` genera la carpeta `out/` (HTML, JS y CSS estáticos). Esa
 * carpeta se copia a `public/talleres/` del sitio principal (markalab). El
 * formulario envía a `/api/lead-talleres`, que vive en el sitio principal.
 */
const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/talleres',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  // three y sus acompañantes se publican como ESM; transpilarlos evita
  // sorpresas con navegadores viejos y con el empaquetado del servidor.
  transpilePackages: ['three'],
};

export default nextConfig;
