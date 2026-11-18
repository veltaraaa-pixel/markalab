'use client'

import { motion } from 'framer-motion'
import SectionTitle from '@/components/ui/SectionTitle'

const categorias: Record<string, string> = {
  Digital: '#4A7CC7',
  Tecnología: '#E8621A',
  Presencial: '#1E2A4A',
  Tradicional: '#6B7280',
  Institucional: '#8B5CF6',
}

const canales = [
  { nombre: 'RRSS', categoria: 'Digital' },
  { nombre: 'Mailing', categoria: 'Digital' },
  { nombre: 'SEO Local', categoria: 'Digital' },
  { nombre: 'E-Commerce', categoria: 'Digital' },
  { nombre: 'Influencer Marketing', categoria: 'Digital' },
  { nombre: 'Market Places', categoria: 'Digital' },
  { nombre: 'ADS / SEM', categoria: 'Digital' },
  { nombre: 'Sitio Web SEO', categoria: 'Digital' },
  { nombre: 'Podcast', categoria: 'Digital' },
  { nombre: 'Blog', categoria: 'Digital' },
  { nombre: 'Funnel de Ventas', categoria: 'Digital' },
  { nombre: 'Apps Ads', categoria: 'Digital' },
  { nombre: 'Plataformas Especializadas', categoria: 'Digital' },
  { nombre: 'ATL', categoria: 'Tradicional' },
  { nombre: 'BTL', categoria: 'Tradicional' },
  { nombre: 'Distribuidores', categoria: 'Tradicional' },
  { nombre: 'Eventos', categoria: 'Presencial' },
  { nombre: 'Ferias', categoria: 'Presencial' },
  { nombre: 'Congresos', categoria: 'Presencial' },
  { nombre: 'Punto de Venta', categoria: 'Presencial' },
  { nombre: 'Cold Caller Bot Outbound', categoria: 'Tecnología' },
  { nombre: 'Scraper', categoria: 'Tecnología' },
  { nombre: 'Licitaciones', categoria: 'Institucional' },
]

export default function Atraccion() {
  const categoriasUnicas = Array.from(new Set(canales.map((c) => c.categoria)))

  return (
    <section id="atraccion" className="py-24 bg-white scroll-mt-20">
      <div className="container mx-auto px-4 md:px-6">

        {/* Encabezado */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#E8621A] rounded-2xl p-8 text-white order-2 lg:order-1"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="text-white font-black text-lg">+23</span>
              </div>
              <div>
                <p className="text-2xl font-black">Canales Disponibles</p>
                <p className="text-white/80 text-sm">Digitales, físicos y tecnológicos</p>
              </div>
            </div>
            <p className="text-white/85 leading-relaxed">
              Juntos definimos qué soluciones de nuestro portafolio se requieren
              para lograr sus objetivos. Activamos los canales correctos
              para atraer prospectos calificados con intención real de compra.
            </p>
          </motion.div>

          <SectionTitle
            etiqueta="Servicio 02"
            titulo="Atracción"
            subtitulo="Activamos más de 23 canales digitales, presenciales y tecnológicos para llevar prospectos calificados a tu negocio."
            className="order-1 lg:order-2"
          />
        </div>

        {/* Leyenda de categorías */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categoriasUnicas.map((cat) => (
            <span
              key={cat}
              className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full text-white"
              style={{ background: categorias[cat] }}
            >
              <span className="w-1.5 h-1.5 bg-white/50 rounded-full" />
              {cat}
            </span>
          ))}
        </div>

        {/* Grid de canales */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {canales.map((canal, i) => (
            <motion.div
              key={canal.nombre}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="relative rounded-xl p-3 text-center cursor-default transition-all duration-200 overflow-hidden group"
              style={{
                background: categorias[canal.categoria] + '10',
                border: `1.5px solid ${categorias[canal.categoria]}25`,
              }}
            >
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"
                style={{ background: categorias[canal.categoria] + '18' }}
              />
              <span
                className="text-xs font-semibold relative z-10"
                style={{ color: categorias[canal.categoria] }}
              >
                {canal.nombre}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
