'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SectionTitleProps {
  etiqueta?: string
  titulo: string
  subtitulo?: string
  centrado?: boolean
  claro?: boolean
  className?: string
}

export default function SectionTitle({
  etiqueta,
  titulo,
  subtitulo,
  centrado = false,
  claro = false,
  className,
}: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(centrado ? 'text-center' : '', className)}
    >
      {etiqueta && (
        <span className={cn(
          'inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full',
          claro
            ? 'bg-white/20 text-white'
            : 'bg-[#E8621A]/10 text-[#E8621A]'
        )}>
          {etiqueta}
        </span>
      )}
      <h2 className={cn(
        'text-4xl md:text-5xl font-black leading-tight mb-4',
        claro ? 'text-white' : 'text-[#1E2A4A]'
      )}>
        {titulo}
      </h2>
      {subtitulo && (
        <p className={cn(
          'text-lg leading-relaxed',
          centrado ? 'mx-auto' : '',
          claro ? 'text-white/70 max-w-2xl' : 'text-[#1E2A4A]/60 max-w-2xl'
        )}>
          {subtitulo}
        </p>
      )}
    </motion.div>
  )
}
