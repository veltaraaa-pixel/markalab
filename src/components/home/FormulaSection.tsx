'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Settings, Rocket, BarChart3, ArrowRight } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'

const pasos = [
  {
    numero: '01',
    titulo: 'Diagnóstico Comercial',
    descripcion: 'Mediante la IA, analizamos los cuellos de botella, fortalezas, oportunidades y urgencias que tu negocio necesita.',
    icono: Search,
    color: '#E8621A',
  },
  {
    numero: '02',
    titulo: 'Diseño del Sistema',
    descripcion: 'Creamos una estructura de adquisición personalizada, orientada a tu mercado objetivo con soluciones probadas.',
    icono: Settings,
    color: '#1E2A4A',
  },
  {
    numero: '03',
    titulo: 'Implementación',
    descripcion: 'Activamos canales, automatizaciones y estrategias comerciales basadas en IA, orientadas a generar LEADS.',
    icono: Rocket,
    color: '#4A7CC7',
  },
  {
    numero: '04',
    titulo: 'Optimización',
    descripcion: 'Medimos resultados, presentamos reportes y hacemos adaptaciones rápidas para mantener el crecimiento.',
    icono: BarChart3,
    color: '#E8621A',
  },
]

export default function FormulaSection() {
  return (
    <section className="py-24 bg-[#F0EBE3] relative overflow-hidden">
      {/* Decoración */}
      <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-[#E8621A]/5 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute left-0 bottom-0 w-48 h-48 rounded-full bg-[#1E2A4A]/5 -translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <SectionTitle
            etiqueta="Nuestra Fórmula"
            titulo="4 pasos para transformar tu negocio"
            subtitulo="Un proceso probado que combina inteligencia artificial, experiencia comercial y ejecución ágil para generar resultados reales."
            centrado
          />
        </div>

        {/* Timeline desktop */}
        <div className="relative">
          {/* Línea conectora */}
          <motion.div
            className="absolute top-16 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-[#E8621A] via-[#4A7CC7] to-[#E8621A] hidden lg:block"
            initial={{ scaleX: 0, originX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pasos.map((paso, i) => {
              const Icono = paso.icono
              return (
                <motion.div
                  key={paso.titulo}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Icono con número */}
                  <motion.div
                    className="relative w-32 h-32 rounded-full flex items-center justify-center mb-6 bg-white shadow-lg z-10"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className="w-24 h-24 rounded-full flex flex-col items-center justify-center"
                      style={{ background: paso.color }}
                    >
                      <Icono size={28} className="text-white mb-1" />
                      <span className="text-white/70 text-xs font-bold">{paso.numero}</span>
                    </div>
                  </motion.div>

                  {/* Barra de progreso */}
                  <motion.div
                    className="w-12 h-1 rounded-full mb-5"
                    style={{ background: paso.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: 48 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 + 0.3 }}
                  />

                  <h3 className="text-lg font-bold text-[#1E2A4A] mb-3">{paso.titulo}</h3>
                  <p className="text-[#1E2A4A]/60 text-sm leading-relaxed">{paso.descripcion}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link href="/nuestra-formula" className="btn-naranja text-base px-8 py-4">
            Conoce nuestra fórmula completa <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
