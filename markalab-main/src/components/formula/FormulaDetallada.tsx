'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Search, Settings, Rocket, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react'
import formulaData from '@/data/formula.json'

const iconos = [Search, Settings, Rocket, BarChart3]
const coloresFondo = ['bg-[#E8621A]', 'bg-[#1E2A4A]', 'bg-[#4A7CC7]', 'bg-[#E8621A]']

export default function FormulaDetallada() {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: contenedorRef,
    offset: ['start end', 'end start'],
  })
  const alturaLinea = useTransform(scrollYProgress, [0, 0.9], ['0%', '100%'])

  return (
    <section className="py-24 bg-[#F0EBE3]" ref={contenedorRef}>
      <div className="container mx-auto px-4 md:px-6">

        <div className="grid lg:grid-cols-[1fr_3fr] gap-16 items-start">

          {/* Sidebar fijo con línea de progreso */}
          <div className="hidden lg:block sticky top-32">
            <div className="relative pl-8">
              {/* Línea de fondo */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#1E2A4A]/15 rounded-full" />
              {/* Línea de progreso */}
              <motion.div
                className="absolute left-0 top-0 w-0.5 bg-[#E8621A] rounded-full origin-top"
                style={{ height: alturaLinea }}
              />

              <div className="space-y-8">
                {formulaData.pasos.map((paso, i) => (
                  <motion.div
                    key={paso.numero}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="group"
                  >
                    <a href={`#paso-${paso.numero}`} className="flex items-center gap-3">
                      <span
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-black shrink-0 transition-colors"
                        style={{ borderColor: paso.color, background: 'transparent' }}
                      >
                        {paso.numero}
                      </span>
                      <span className="text-sm font-medium text-[#1E2A4A]/60 group-hover:text-[#1E2A4A] transition-colors">
                        {paso.titulo}
                      </span>
                    </a>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Pasos detallados */}
          <div className="space-y-20">
            {formulaData.pasos.map((paso, i) => {
              const Icono = iconos[i]
              const colorFondo = coloresFondo[i]

              return (
                <motion.div
                  key={paso.numero}
                  id={`paso-${paso.numero}`}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6 }}
                  className="scroll-mt-24"
                >
                  {/* Header del paso */}
                  <div className="flex items-start gap-6 mb-8">
                    <motion.div
                      className={`w-16 h-16 rounded-2xl ${colorFondo} flex items-center justify-center shrink-0`}
                      whileHover={{ scale: 1.08, rotate: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icono size={28} className="text-white" />
                    </motion.div>
                    <div>
                      <span className="text-xs font-bold tracking-widest uppercase text-[#E8621A]/70 mb-1 block">
                        Paso {String(paso.numero).padStart(2, '0')}
                      </span>
                      <h2 className="text-3xl md:text-4xl font-black text-[#1E2A4A]">
                        {paso.titulo}
                      </h2>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 ml-0 md:ml-22">
                    {/* Descripción */}
                    <div>
                      <p className="text-lg text-[#1E2A4A]/70 leading-relaxed mb-6">
                        {paso.descripcion}
                      </p>
                      <p className="text-sm text-[#1E2A4A]/50 italic">
                        {paso.subtitulo}
                      </p>
                    </div>

                    {/* Puntos clave */}
                    <div
                      className="rounded-2xl p-6"
                      style={{ background: paso.color + '08', borderLeft: `3px solid ${paso.color}` }}
                    >
                      <h3 className="font-bold text-[#1E2A4A] mb-4 text-sm uppercase tracking-wide">
                        Qué incluye
                      </h3>
                      <ul className="space-y-3">
                        {paso.puntos.map((punto) => (
                          <li key={punto} className="flex items-start gap-3">
                            <CheckCircle2
                              size={16}
                              className="shrink-0 mt-0.5"
                              style={{ color: paso.color }}
                            />
                            <span className="text-sm text-[#1E2A4A]/70">{punto}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Divisor entre pasos */}
                  {i < formulaData.pasos.length - 1 && (
                    <div className="mt-12 flex items-center gap-4">
                      <div className="flex-1 h-px bg-[#1E2A4A]/10" />
                      <div className="w-8 h-8 rounded-full bg-[#E8621A]/10 flex items-center justify-center">
                        <ArrowRight size={14} className="text-[#E8621A] rotate-90" />
                      </div>
                      <div className="flex-1 h-px bg-[#1E2A4A]/10" />
                    </div>
                  )}
                </motion.div>
              )
            })}

            {/* CTA final */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[#1E2A4A] rounded-2xl p-8 text-center text-white"
            >
              <h3 className="text-2xl font-black mb-3">¿Listo para empezar?</h3>
              <p className="text-white/70 mb-6">
                El primer paso es el Diagnóstico Comercial gratuito. Agendamos una sesión y
                analizamos tu negocio con IA para encontrar tus mayores oportunidades.
              </p>
              <Link href="/diagnostico" className="btn-naranja text-base px-8 py-4">
                Agendar Diagnóstico Gratuito <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
