'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Mic, CalendarCheck, Search, Zap, MousePointerClick } from 'lucide-react'

type Nodo = { id: string; x: number; y: number; label: string; sub: string }

const nodos: Nodo[] = [
  { id: 'v', x: 70, y: 210, label: 'Visitante', sub: 'web · móvil' },
  { id: 's', x: 235, y: 210, label: 'Sitio Next.js', sub: 'Vercel edge' },
  { id: 'chat', x: 410, y: 85, label: 'Kala Chat', sub: 'agente IA' },
  { id: 'voz', x: 410, y: 210, label: 'Kala Voz', sub: 'Retell AI' },
  { id: 'g', x: 410, y: 335, label: 'Google', sub: 'SEO técnico' },
  { id: 'n8n', x: 580, y: 85, label: 'n8n', sub: 'orquestador' },
  { id: 'wa', x: 580, y: 250, label: 'WhatsApp', sub: 'Business' },
  { id: 'cal', x: 580, y: 365, label: 'Cal.com', sub: 'agenda' },
]

const aristas: Record<string, string> = {
  vs: 'M 118 210 L 187 210',
  schat: 'M 283 200 C 330 170, 340 95, 362 88',
  chatn8n: 'M 458 85 L 532 85',
  svoz: 'M 283 210 L 362 210',
  sg: 'M 283 220 C 330 250, 340 325, 362 332',
  swa: 'M 283 214 C 380 240, 470 250, 532 250',
  wacal: 'M 580 274 L 580 341',
}

const funciones = [
  {
    id: 'chat',
    icono: MessageSquare,
    titulo: 'Kala, agente de IA en texto',
    texto: 'Responde dudas, califica al prospecto y lo lleva al diagnóstico. Conectada a n8n para registrar cada conversación.',
    aristas: ['vs', 'schat', 'chatn8n'],
    nodos: ['v', 's', 'chat', 'n8n'],
  },
  {
    id: 'voz',
    icono: Mic,
    titulo: 'Llamada de voz en vivo',
    texto: 'Desde el mismo widget, el visitante habla con Kala por voz en tiempo real. El SDK solo se descarga al abrir el chat.',
    aristas: ['vs', 'svoz'],
    nodos: ['v', 's', 'voz'],
  },
  {
    id: 'agenda',
    icono: CalendarCheck,
    titulo: 'WhatsApp + agenda automática',
    texto: 'El prospecto pasa a WhatsApp Business y agenda su Diagnóstico Comercial Gratuito sin intervención manual.',
    aristas: ['vs', 'swa', 'wacal'],
    nodos: ['v', 's', 'wa', 'cal'],
  },
  {
    id: 'seo',
    icono: Search,
    titulo: 'SEO técnico desde el código',
    texto: 'Metadatos, Open Graph, sitemap y robots generados por el propio framework para que Google te encuentre.',
    aristas: ['sg', 'vs'],
    nodos: ['g', 's', 'v'],
  },
  {
    id: 'perf',
    icono: Zap,
    titulo: 'Rendimiento y animación',
    texto: 'Renderizado en servidor, carga diferida y animaciones con aceleración por GPU. Rápido en cualquier dispositivo.',
    aristas: ['vs'],
    nodos: ['v', 's'],
  },
]

export default function CasoPropio() {
  const [activa, setActiva] = useState(0)
  const [auto, setAuto] = useState(true)
  const f = funciones[activa]

  useEffect(() => {
    if (!auto) return
    const id = setInterval(() => setActiva((a) => (a + 1) % funciones.length), 4500)
    return () => clearInterval(id)
  }, [auto])

  return (
    <section className="relative overflow-hidden bg-[#0F1830] py-28 text-[#F0EBE3]">
      <div className="it-grid-bg absolute inset-0 opacity-60" />
      <div className="container relative mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-3xl"
        >
          <span className="mb-5 inline-block rounded-full bg-[#4A7CC7]/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#9DBDF0]">
            Caso de estudio · markalab.com.mx
          </span>
          <h2 className="mb-5 text-4xl font-black leading-tight md:text-5xl">
            La mejor prueba es <span className="it-text-gradient">esta misma página.</span>
          </h2>
          <p className="text-lg text-[#F0EBE3]/60">
            Nuestro sitio es un sistema comercial vivo: lo construimos con el mismo stack
            y los mismos módulos que implementamos para ti. Toca cada función y mira cómo
            fluye la información.
          </p>
        </motion.div>

        <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Funciones */}
          <div className="space-y-3" onPointerEnter={() => setAuto(false)}>
            {funciones.map((fn, i) => {
              const Icono = fn.icono
              const on = i === activa
              return (
                <button
                  key={fn.id}
                  onClick={() => { setActiva(i); setAuto(false) }}
                  className={`relative w-full overflow-hidden rounded-2xl border p-5 text-left transition-all ${
                    on ? 'border-[#E8621A]/50 bg-white/[0.06]' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${on ? 'bg-[#E8621A] text-white' : 'bg-white/5 text-[#F0EBE3]/60'}`}>
                      <Icono size={20} />
                    </span>
                    <span className="font-bold">{fn.titulo}</span>
                  </div>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden pl-[60px] text-sm text-[#F0EBE3]/60"
                      >
                        <span className="block pt-2">{fn.texto}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                  {on && auto && (
                    <motion.span
                      key={`bar-${activa}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 4.5, ease: 'linear' }}
                      className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-[#E8621A]"
                    />
                  )}
                </button>
              )
            })}
            <p className="flex items-center gap-2 px-2 pt-2 text-xs text-[#F0EBE3]/40">
              <MousePointerClick size={14} /> Prueba a Kala ahora mismo: está en la esquina inferior derecha.
            </p>
          </div>

          {/* Diagrama de arquitectura */}
          <div className="relative rounded-3xl border border-white/10 bg-[#0A1020]/80 p-4 shadow-2xl shadow-black/40 backdrop-blur md:p-6">
            <div className="mb-3 flex items-center justify-between px-2 font-mono text-[11px] text-white/40">
              <span>arquitectura/markalab.com.mx</span>
              <span className="text-[#4ADE80]">● en producción</span>
            </div>
            <svg viewBox="0 0 650 420" className="h-auto w-full" role="img" aria-label={`Flujo de datos: ${f.titulo}`}>
              <defs>
                <linearGradient id="it-edge" gradientUnits="userSpaceOnUse" x1="60" y1="0" x2="600" y2="0">
                  <stop offset="0%" stopColor="#E8621A" />
                  <stop offset="100%" stopColor="#7FA8E8" />
                </linearGradient>
                <filter id="it-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {Object.entries(aristas).map(([id, d]) => {
                const on = f.aristas.includes(id)
                return (
                  <g key={id}>
                    <path d={d} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2} strokeDasharray="4 6" />
                    {on && (
                      <>
                        <motion.path
                          key={`${id}-${activa}`}
                          d={d}
                          fill="none"
                          stroke="url(#it-edge)"
                          strokeWidth={2.5}
                          filter="url(#it-glow)"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.7, ease: 'easeInOut' }}
                        />
                        <circle r={4} fill="#FF9A5C" filter="url(#it-glow)">
                          <animateMotion dur="1.6s" repeatCount="indefinite" path={d} />
                        </circle>
                      </>
                    )}
                  </g>
                )
              })}

              {nodos.map((n) => {
                const on = f.nodos.includes(n.id)
                return (
                  <g key={n.id} transform={`translate(${n.x} ${n.y})`}>
                    <motion.rect
                      x={-48}
                      y={-24}
                      width={96}
                      height={48}
                      rx={12}
                      animate={{
                        fill: on ? 'rgba(232,98,26,0.16)' : 'rgba(255,255,255,0.03)',
                        stroke: on ? '#E8621A' : 'rgba(255,255,255,0.14)',
                      }}
                      transition={{ duration: 0.4 }}
                      strokeWidth={1.5}
                    />
                    <text textAnchor="middle" y={-2} fontSize={13} fontWeight={700} fill={on ? '#FFFFFF' : 'rgba(240,235,227,0.55)'}>
                      {n.label}
                    </text>
                    <text textAnchor="middle" y={14} fontSize={10} fontFamily="ui-monospace, monospace" fill={on ? '#FF9A5C' : 'rgba(240,235,227,0.3)'}>
                      {n.sub}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
