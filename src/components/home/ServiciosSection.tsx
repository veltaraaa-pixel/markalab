'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Settings, Magnet, TrendingUp, Heart, ArrowRight } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'

const servicios = [
  {
    numero: '01',
    titulo: 'Set-up Inicial',
    descripcion: 'Analizamos tu negocio, mercado y competencia para construir las bases de tu sistema comercial con 10 entregables clave.',
    icono: Settings,
    color: '#1E2A4A',
    bgColor: '#1E2A4A',
    href: '/servicios#setup-inicial',
    items: ['Análisis de Mercado', 'Buyer Persona', 'Identidad Corporativa', 'Sales Deck'],
  },
  {
    numero: '02',
    titulo: 'Atracción',
    descripcion: 'Activamos los canales correctos para llevar prospectos calificados a tu negocio con más de 20 canales disponibles.',
    icono: Magnet,
    color: '#E8621A',
    bgColor: '#E8621A',
    href: '/servicios#atraccion',
    items: ['RRSS & Mailing', 'SEO & ADS/SEM', 'Cold Caller Bot', 'Influencer Marketing'],
  },
  {
    numero: '03',
    titulo: 'Conversión',
    descripcion: 'Implementamos herramientas de IA que convierten visitantes y prospectos en clientes con mayor eficiencia.',
    icono: TrendingUp,
    color: '#4A7CC7',
    bgColor: '#4A7CC7',
    href: '/servicios#conversion',
    items: ['Chatbot Multicanal', 'Asistente 24/7', 'Smart Promos', 'Agenda y Reservas'],
  },
  {
    numero: '04',
    titulo: 'Fidelización',
    descripcion: 'Garantizamos relaciones duraderas con tus clientes mediante estrategias de retención y experiencia post-venta.',
    icono: Heart,
    color: '#1E2A4A',
    bgColor: '#1E2A4A',
    href: '/servicios#fidelizacion',
    items: ['Servicio Post Venta', 'Estrategia de Reseñas', 'Suscripciones', 'Membresías'],
  },
]

export default function ServiciosSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <SectionTitle
            etiqueta="Nuestros Servicios"
            titulo="Un sistema completo para hacer crecer tu negocio"
            subtitulo="De la estrategia inicial hasta la fidelización, cubrimos todo el ciclo comercial."
          />
          <Link href="/servicios" className="btn-outline shrink-0">
            Ver todos los servicios <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicios.map((servicio, i) => {
            const Icono = servicio.icono
            return (
              <motion.div
                key={servicio.titulo}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative bg-[#F0EBE3] rounded-2xl p-6 cursor-pointer overflow-hidden"
              >
                {/* Fondo hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(135deg, ${servicio.bgColor}08, ${servicio.bgColor}15)` }}
                />

                {/* Número decorativo */}
                <span className="absolute top-4 right-4 text-6xl font-black text-[#1E2A4A]/5 leading-none">
                  {servicio.numero}
                </span>

                {/* Icono */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: servicio.bgColor }}
                >
                  <Icono size={22} className="text-white" />
                </div>

                <h3 className="text-xl font-bold text-[#1E2A4A] mb-3">{servicio.titulo}</h3>
                <p className="text-[#1E2A4A]/60 text-sm leading-relaxed mb-5">
                  {servicio.descripcion}
                </p>

                {/* Items */}
                <ul className="space-y-1.5 mb-6">
                  {servicio.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-[#1E2A4A]/70">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: servicio.bgColor }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href={servicio.href}
                  className="flex items-center gap-1 text-sm font-semibold transition-colors"
                  style={{ color: servicio.bgColor }}
                >
                  Ver detalles <ArrowRight size={14} />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
