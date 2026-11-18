'use client'

import { useState } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Check, ChevronRight } from 'lucide-react'
import { frentes } from './data'

export function spotlight(e: React.PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

export default function ModulosIT() {
  const [frenteId, setFrenteId] = useState(frentes[0].id)
  const frente = frentes.find((f) => f.id === frenteId)!
  const [moduloId, setModuloId] = useState(frente.modulos[0].id)
  const modulo = frente.modulos.find((m) => m.id === moduloId) ?? frente.modulos[0]

  const elegirFrente = (id: string) => {
    const f = frentes.find((x) => x.id === id)!
    setFrenteId(id)
    setModuloId(f.modulos[0].id)
  }

  return (
    <section id="modulos" className="relative scroll-mt-20 overflow-hidden bg-[#0A1020] py-28 text-[#F0EBE3]">
      <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#E8621A]/50 to-transparent" />
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <span className="mb-5 inline-block rounded-full bg-[#E8621A]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#FF9A5C]">
            Portafolio IT
          </span>
          <h2 className="mb-5 text-4xl font-black leading-tight md:text-5xl">
            16 módulos. 5 frentes. <span className="it-text-gradient">Un solo sistema.</span>
          </h2>
          <p className="text-lg text-[#F0EBE3]/60">
            Elige un frente y explora cada módulo. Se contratan por separado o como
            un ecosistema conectado que crece contigo.
          </p>
        </motion.div>

        {/* Pestañas de frentes */}
        <LayoutGroup>
          <div role="tablist" aria-label="Frentes tecnológicos" className="mx-auto mb-10 flex max-w-5xl gap-2 overflow-x-auto pb-2 md:flex-wrap md:justify-center">
            {frentes.map((f) => {
              const activo = f.id === frenteId
              const Icono = f.icono
              return (
                <button
                  key={f.id}
                  role="tab"
                  aria-selected={activo}
                  onClick={() => elegirFrente(f.id)}
                  className={`relative flex shrink-0 items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
                    activo ? 'text-white' : 'text-[#F0EBE3]/60 hover:text-[#F0EBE3]'
                  }`}
                >
                  {activo && (
                    <motion.span
                      layoutId="tab-activa"
                      className="absolute inset-0 -z-0 rounded-full bg-gradient-to-r from-[#E8621A] to-[#C4511A] shadow-lg shadow-[#E8621A]/30"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <Icono size={16} className="relative" />
                  <span className="relative">{f.titulo}</span>
                </button>
              )
            })}
          </div>
        </LayoutGroup>

        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Lista de módulos */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {frente.modulos.map((m, i) => {
                const activo = m.id === modulo.id
                return (
                  <motion.button
                    key={m.id}
                    layout
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                    onClick={() => setModuloId(m.id)}
                    onPointerMove={spotlight}
                    className={`it-spotlight group flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all ${
                      activo
                        ? 'border-[#E8621A]/60 bg-[#E8621A]/[0.08]'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                    }`}
                  >
                    <span className={`font-mono text-xs ${activo ? 'text-[#FF9A5C]' : 'text-white/35'}`}>{m.id}</span>
                    <span className="flex-1">
                      <span className="block font-bold">{m.nombre}</span>
                      <span className="mt-0.5 line-clamp-1 block text-sm text-[#F0EBE3]/50">{m.resumen}</span>
                    </span>
                    <ChevronRight
                      size={18}
                      className={`shrink-0 transition-transform ${activo ? 'translate-x-1 text-[#E8621A]' : 'text-white/30 group-hover:translate-x-1'}`}
                    />
                  </motion.button>
                )
              })}
            </AnimatePresence>
            <p className="px-2 pt-2 text-sm text-[#F0EBE3]/45">{frente.bajada}</p>
          </div>

          {/* Detalle */}
          <div className="it-border-anim min-h-[420px] p-8 md:p-10" onPointerMove={spotlight}>
            <AnimatePresence mode="wait">
              <motion.div
                key={modulo.id}
                initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
                transition={{ duration: 0.35 }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-[#FF9A5C]">
                    módulo/{modulo.id.toLowerCase()}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-[#4ADE80]">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4ADE80] opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4ADE80]" />
                    </span>
                    Disponible
                  </span>
                </div>
                <h3 className="mb-4 text-3xl font-black leading-tight">{modulo.nombre}</h3>
                <p className="mb-8 text-[#F0EBE3]/70">{modulo.resumen}</p>

                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Incluye</p>
                <ul className="mb-8 grid gap-3 sm:grid-cols-2">
                  {modulo.incluye.map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.07 }}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8621A]">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {item}
                    </motion.li>
                  ))}
                </ul>

                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Stack</p>
                <div className="flex flex-wrap gap-2">
                  {modulo.stack.map((t) => (
                    <span key={t} className="rounded-lg border border-[#4A7CC7]/30 bg-[#4A7CC7]/10 px-3 py-1.5 font-mono text-xs text-[#9DBDF0]">
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
