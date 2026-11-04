'use client'

import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'

const pasos = [
  { n: '01', titulo: 'Diagnóstico', texto: 'Entendemos tu proceso comercial, tus sistemas actuales y dónde se pierden oportunidades.', tiempo: 'Sesión gratuita' },
  { n: '02', titulo: 'Arquitectura', texto: 'Definimos módulos, integraciones y métricas de éxito. Recibes alcance y cronograma claros.', tiempo: 'Semana 1' },
  { n: '03', titulo: 'Construcción por sprints', texto: 'Desarrollo iterativo con demos funcionales para que valides cada avance.', tiempo: 'Semanas 2 en adelante' },
  { n: '04', titulo: 'QA y lanzamiento', texto: 'Pruebas de rendimiento, seguridad y flujo completo antes de salir a producción.', tiempo: 'Puesta en marcha' },
  { n: '05', titulo: 'Operación y mejora continua', texto: 'Monitoreo, ajustes con datos reales y nuevos módulos conforme creces.', tiempo: 'Siempre' },
]

export default function ProcesoIT() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const progreso = useSpring(scrollYProgress, { stiffness: 90, damping: 25 })

  return (
    <section className="relative bg-[#0F1830] py-28 text-[#F0EBE3]">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="mb-5 inline-block rounded-full bg-[#4A7CC7]/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#9DBDF0]">
            Cómo trabajamos
          </span>
          <h2 className="text-4xl font-black leading-tight md:text-5xl">
            De la idea a producción, <span className="it-text-gradient">sin sorpresas.</span>
          </h2>
        </motion.div>

        <div ref={ref} className="relative mx-auto max-w-4xl">
          {/* Línea base y progreso */}
          <div className="absolute bottom-0 left-6 top-0 w-px bg-white/10 md:left-1/2" />
          <motion.div
            style={{ scaleY: progreso }}
            className="absolute bottom-0 left-6 top-0 w-px origin-top bg-gradient-to-b from-[#E8621A] to-[#7FA8E8] md:left-1/2"
          />

          <ol className="space-y-14">
            {pasos.map((p, i) => {
              const derecha = i % 2 === 1
              return (
                <li key={p.n} className="relative grid items-center md:grid-cols-2 md:gap-16">
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: '-40% 0px' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    className="absolute left-6 top-6 z-10 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-[#E8621A] ring-8 ring-[#E8621A]/15 md:left-1/2 md:top-1/2 md:-translate-y-1/2"
                  />
                  <motion.div
                    initial={{ opacity: 0, x: derecha ? 40 : -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className={`ml-16 rounded-2xl border border-white/10 bg-white/[0.03] p-7 md:ml-0 ${derecha ? 'md:col-start-2' : 'md:text-right'}`}
                  >
                    <p className="mb-2 font-mono text-xs text-[#FF9A5C]">
                      {p.n} · {p.tiempo}
                    </p>
                    <h3 className="mb-2 text-2xl font-bold">{p.titulo}</h3>
                    <p className="text-[#F0EBE3]/60">{p.texto}</p>
                  </motion.div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
