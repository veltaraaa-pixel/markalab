'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bot, Star, CreditCard, ArrowRight } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'

const pilares = [
  {
    nombre: 'Bot de crecimiento del cliente',
    descripcion: 'Automatización inteligente que acompaña al cliente después del cierre, impulsa la recompra y potencia el crecimiento de la relación comercial a largo plazo.',
    icono: Bot,
    color: '#E8621A',
    bg: 'bg-[#E8621A]',
  },
  {
    nombre: 'Estrategia de Reseñas',
    descripcion: 'Plan sistemático para generar reseñas positivas, gestionar la reputación digital y convertir clientes satisfechos en promotores activos.',
    icono: Star,
    color: '#4A7CC7',
    bg: 'bg-[#4A7CC7]',
  },
  {
    nombre: 'Suscripciones y Membresías',
    descripcion: 'Modelos de recurrencia que generan ingresos predecibles, fortalecen la lealtad del cliente y crean comunidades alrededor de tu marca.',
    icono: CreditCard,
    color: '#1E2A4A',
    bg: 'bg-[#1E2A4A]',
  },
]

export default function Fidelizacion() {
  return (
    <section id="fidelizacion" className="py-24 bg-white scroll-mt-20">
      <div className="container mx-auto px-4 md:px-6">

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Texto */}
          <div>
            <SectionTitle
              etiqueta="Servicio 04"
              titulo="Fidelización"
              subtitulo="En base a diferentes mecanismos, garantizamos la relación con sus socios de negocio a largo plazo y convertimos clientes en promotores de tu marca."
            />

            <div className="mt-10 space-y-5">
              {pilares.map((pilar, i) => {
                const Icono = pilar.icono
                return (
                  <motion.div
                    key={pilar.nombre}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    className="flex gap-4 p-5 rounded-2xl bg-[#F0EBE3] group hover:shadow-md transition-shadow"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: pilar.color }}
                    >
                      <Icono size={22} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1E2A4A] mb-1">{pilar.nombre}</h3>
                      <p className="text-[#1E2A4A]/60 text-sm leading-relaxed">{pilar.descripcion}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/diagnostico" className="btn-naranja">
                Agenda tu diagnóstico <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>

          {/* Diagrama circular */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              {/* Anillo exterior */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(#E8621A 0deg 120deg, #4A7CC7 120deg 240deg, #1E2A4A 240deg 360deg)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              />

              {/* Anillo interior blanco */}
              <div className="absolute inset-6 rounded-full bg-white flex items-center justify-center">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-0.5 mb-1">
                    <span className="text-xl font-black text-[#1E2A4A]">Marka</span>
                    <span className="text-xl font-black text-[#E8621A]">Lab</span>
                    <span className="w-2 h-2 bg-[#E8621A] rounded-full ml-0.5" />
                  </div>
                  <p className="text-[9px] text-[#1E2A4A]/40 tracking-widest uppercase">
                    Fidelización
                  </p>
                </div>
              </div>

            </div>

            {/* Leyenda */}
            <div className="absolute -bottom-8 flex gap-4 flex-wrap justify-center">
              {pilares.map((p) => (
                <div key={p.nombre} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                  <span className="text-[#1E2A4A]/70">{p.nombre}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
