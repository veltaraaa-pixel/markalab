'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HeroSeccionProps {
  etiqueta?: string
  titulo: string
  subtitulo?: string
  fondoOscuro?: boolean
  fondoNaranja?: boolean
}

export default function HeroSeccion({
  etiqueta,
  titulo,
  subtitulo,
  fondoOscuro = false,
  fondoNaranja = false,
}: HeroSeccionProps) {
  const bgClass = fondoNaranja
    ? 'bg-[#E8621A]'
    : fondoOscuro
    ? 'bg-[#1E2A4A]'
    : 'bg-[#F0EBE3]'

  const esOscuro = fondoOscuro || fondoNaranja

  return (
    <section className={cn('relative pt-36 pb-20 overflow-hidden', bgClass)}>
      {/* Círculos decorativos */}
      <div className={cn(
        'absolute top-0 right-0 w-80 h-80 rounded-full translate-x-1/3 -translate-y-1/3',
        esOscuro ? 'bg-white/5' : 'bg-[#1E2A4A]/5'
      )} />
      <div className={cn(
        'absolute bottom-0 left-0 w-48 h-48 rounded-full -translate-x-1/3 translate-y-1/3',
        esOscuro ? 'bg-white/5' : 'bg-[#E8621A]/8'
      )} />

      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
        {etiqueta && (
          <motion.span
            className={cn(
              'inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-6',
              esOscuro ? 'bg-white/15 text-white/80' : 'bg-[#E8621A]/10 text-[#E8621A]'
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {etiqueta}
          </motion.span>
        )}

        <motion.h1
          className={cn(
            'text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 max-w-4xl mx-auto',
            esOscuro ? 'text-white' : 'text-[#1E2A4A]'
          )}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {titulo}
        </motion.h1>

        {subtitulo && (
          <motion.p
            className={cn(
              'text-lg leading-relaxed max-w-2xl mx-auto',
              esOscuro ? 'text-white/70' : 'text-[#1E2A4A]/60'
            )}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {subtitulo}
          </motion.p>
        )}
      </div>
    </section>
  )
}
