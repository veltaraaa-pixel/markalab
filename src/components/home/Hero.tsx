'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'

const formasFlotantes = [
  { size: 280, top: '-80px', right: '-80px', opacity: 0.15, delay: 0, color: '#E8621A' },
  { size: 160, bottom: '20%', left: '5%', opacity: 0.10, delay: 1.5, color: '#4A7CC7' },
  { size: 80, top: '30%', right: '15%', opacity: 0.20, delay: 0.8, color: '#E8621A' },
  { size: 50, bottom: '30%', right: '30%', opacity: 0.15, delay: 2, color: '#1E2A4A' },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-[#F0EBE3] flex items-center overflow-hidden">

      {/* Formas geométricas flotantes */}
      {formasFlotantes.map((forma, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: forma.size,
            height: forma.size,
            top: forma.top,
            bottom: forma.bottom,
            left: forma.left,
            right: forma.right,
            background: forma.color,
            opacity: forma.opacity,
          }}
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 6 + i * 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: forma.delay,
          }}
        />
      ))}

      {/* Forma decorativa esquina superior izquierda */}
      <motion.div
        className="absolute top-0 left-0 w-48 h-48 pointer-events-none"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="w-full h-full rounded-br-full bg-[#1E2A4A]/8" />
      </motion.div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Contenido principal */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="inline-block text-xs font-bold tracking-widest uppercase bg-[#E8621A]/10 text-[#E8621A] px-3 py-1 rounded-full mb-6">
                Marketing and Sales Consulting
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-black text-[#1E2A4A] leading-[1.05] mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Transforma tu
              {' '}
              <span className="text-[#E8621A]">negocio</span>
              {' '}
              con estrategia comercial real
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-[#1E2A4A]/65 leading-relaxed mb-10 max-w-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              Diseñamos e implementamos sistemas de marketing y ventas
              impulsados por inteligencia artificial que generan leads de
              calidad, aceleran conversiones y fidelizan clientes a largo plazo.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Link href="/diagnostico" className="btn-naranja text-base px-8 py-4">
                Agenda tu diagnóstico gratuito
                <ArrowRight size={18} />
              </Link>
              <Link href="/servicios" className="btn-outline text-base px-8 py-4">
                Ver servicios
              </Link>
            </motion.div>

            {/* Stats rápidas */}
            <motion.div
              className="grid grid-cols-3 gap-6 mt-14 pt-10 border-t border-[#1E2A4A]/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {[
                { valor: '+3x', label: 'Más leads' },
                { valor: '-40%', label: 'Costo de adquisición' },
                { valor: '100%', label: 'Orientados a resultados' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl md:text-3xl font-black text-[#E8621A]">{stat.valor}</p>
                  <p className="text-xs text-[#1E2A4A]/60 leading-tight mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Visual derecho */}
          <motion.div
            className="relative hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Círculo de fondo grande */}
            <div className="w-[480px] h-[480px] rounded-full bg-[#1E2A4A] flex items-center justify-center relative">

              {/* Círculo naranja */}
              <motion.div
                className="absolute top-6 right-8 w-28 h-28 rounded-full bg-[#E8621A]"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Anillo azul medio */}
              <motion.div
                className="absolute bottom-16 left-10 w-20 h-20 rounded-full border-4 border-[#4A7CC7]"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />

              {/* Contenido del círculo */}
              <div className="text-center text-white z-10 px-12">
                <div className="text-6xl font-black text-[#E8621A] mb-2">4</div>
                <div className="text-xl font-bold mb-1">Servicios</div>
                <div className="text-sm text-white/60 mb-8">Integrados en un sistema</div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {['Set-up Inicial', 'Atracción', 'Conversión', 'Fidelización'].map((s, i) => (
                    <motion.div
                      key={s}
                      className="bg-white/10 rounded-xl px-3 py-2 text-white/90 font-medium"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.15 }}
                    >
                      {s}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#1E2A4A]/40"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown size={28} />
      </motion.div>
    </section>
  )
}
