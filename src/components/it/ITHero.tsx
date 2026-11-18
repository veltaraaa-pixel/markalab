'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowRight, Sparkles, Terminal } from 'lucide-react'
import { WHATSAPP_IT } from './data'

const palabras = ['vende 24/7', 'escala contigo', 'conecta todo', 'automatiza']

const lineasTerminal = [
  { t: '$ markalab init --cliente tu-empresa', c: '#E5E7EB' },
  { t: '✓ Diagnóstico comercial analizado', c: '#7FA8E8' },
  { t: '✓ Sitio Next.js desplegado en edge', c: '#7FA8E8' },
  { t: '✓ Agente IA conectado a WhatsApp', c: '#7FA8E8' },
  { t: '✓ CRM + agenda sincronizados (n8n)', c: '#7FA8E8' },
  { t: '→ Lead calificado enviado a ventas', c: '#FF9A5C' },
  { t: '● Sistema operando 24/7', c: '#4ADE80' },
]

/* Red de partículas que reacciona al cursor */
function RedParticulas() {
  const ref = useRef<HTMLCanvasElement>(null)
  const reducir = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0, raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const mouse = { x: -9999, y: -9999 }
    type P = { x: number; y: number; vx: number; vy: number; r: number }
    let puntos: P[] = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.min(90, Math.floor((w * h) / 16000))
      puntos = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
      }))
    }

    const dibujar = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of puntos) {
        if (!reducir) { p.x += p.vx; p.y += p.vy }
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
        const dx = p.x - mouse.x, dy = p.y - mouse.y
        const d = Math.hypot(dx, dy)
        if (d < 120 && d > 0) { p.x += (dx / d) * 0.8; p.y += (dy / d) * 0.8 }
      }
      for (let i = 0; i < puntos.length; i++) {
        for (let j = i + 1; j < puntos.length; j++) {
          const a = puntos[i], b = puntos[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 130) {
            ctx.strokeStyle = `rgba(127,168,232,${(1 - d / 130) * 0.25})`
            ctx.lineWidth = 0.7
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
          }
        }
        const a = puntos[i]
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y)
        if (dm < 180) {
          ctx.strokeStyle = `rgba(232,98,26,${(1 - dm / 180) * 0.55})`
          ctx.lineWidth = 0.9
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke()
        }
      }
      for (const p of puntos) {
        ctx.fillStyle = 'rgba(240,235,227,0.7)'
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
      }
      raf = requestAnimationFrame(dibujar)
    }

    const mover = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top
    }
    const salir = () => { mouse.x = -9999; mouse.y = -9999 }

    resize(); dibujar()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', mover)
    document.addEventListener('pointerleave', salir)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', mover)
      document.removeEventListener('pointerleave', salir)
    }
  }, [reducir])

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}

/* Terminal que escribe un "despliegue" */
function TerminalDeploy() {
  const [visibles, setVisibles] = useState(0)
  const [texto, setTexto] = useState('')

  useEffect(() => {
    if (visibles >= lineasTerminal.length) {
      const reinicio = setTimeout(() => { setVisibles(0); setTexto('') }, 4200)
      return () => clearTimeout(reinicio)
    }
    const linea = lineasTerminal[visibles].t
    if (texto.length < linea.length) {
      const id = setTimeout(() => setTexto(linea.slice(0, texto.length + 1)), visibles === 0 ? 38 : 14)
      return () => clearTimeout(id)
    }
    const sig = setTimeout(() => { setVisibles((v) => v + 1); setTexto('') }, 380)
    return () => clearTimeout(sig)
  }, [texto, visibles])

  return (
    <div className="it-border-anim shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
        <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
        <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
        <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        <span className="ml-3 flex items-center gap-1.5 text-xs text-white/40">
          <Terminal size={12} /> markalab — deploy
        </span>
      </div>
      <div className="min-h-[248px] px-5 py-5 font-mono text-[13px] leading-7">
        {lineasTerminal.slice(0, visibles).map((l) => (
          <div key={l.t} style={{ color: l.c }}>{l.t}</div>
        ))}
        {visibles < lineasTerminal.length && (
          <div style={{ color: lineasTerminal[visibles].c }}>
            {texto}
            <span className="it-caret ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-[#E8621A]" />
          </div>
        )}
      </div>
    </div>
  )
}

export default function ITHero() {
  const [indice, setIndice] = useState(0)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 20 })
  const sy = useSpring(my, { stiffness: 60, damping: 20 })
  const rotX = useTransform(sy, [-0.5, 0.5], [8, -8])
  const rotY = useTransform(sx, [-0.5, 0.5], [-10, 10])

  useEffect(() => {
    const id = setInterval(() => setIndice((i) => (i + 1) % palabras.length), 2600)
    return () => clearInterval(id)
  }, [])

  return (
    <section
      className="relative isolate flex min-h-screen items-center overflow-hidden bg-[#0A1020] text-[#F0EBE3]"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set((e.clientX - r.left) / r.width - 0.5)
        my.set((e.clientY - r.top) / r.height - 0.5)
      }}
    >
      {/* Fondos */}
      <div className="it-grid-bg absolute inset-0 -z-10" />
      <div className="absolute -left-40 -top-40 -z-10 h-[520px] w-[520px] rounded-full bg-[#E8621A]/25 blur-[140px]" />
      <div className="absolute -bottom-40 right-0 -z-10 h-[560px] w-[560px] rounded-full bg-[#4A7CC7]/25 blur-[150px]" />
      <div className="absolute inset-0 -z-10 opacity-80"><RedParticulas /></div>

      <div className="container relative mx-auto grid items-center gap-14 px-4 pb-20 pt-32 md:px-6 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF9A5C] backdrop-blur"
          >
            <Sparkles size={14} /> MarkaLab · Soluciones IT
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mb-6 text-[2.6rem] font-black leading-[1.04] tracking-tight sm:text-5xl md:text-6xl xl:text-7xl"
          >
            Tecnología que
            <br />
            <span className="relative block h-[1.15em] w-full overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={palabras[indice]}
                  initial={{ y: '100%', opacity: 0, filter: 'blur(8px)' }}
                  animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: '-100%', opacity: 0, filter: 'blur(8px)' }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="it-text-gradient absolute left-0 top-0 whitespace-nowrap"
                >
                  {palabras[indice]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mb-10 max-w-xl text-lg leading-relaxed text-[#F0EBE3]/70 md:text-xl"
          >
            Desarrollo web, agentes de IA, automatización e integraciones diseñados
            por consultores comerciales. No solo construimos software:
            construimos <strong className="text-[#F0EBE3]">sistemas que generan ventas</strong>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Link href="/diagnostico" className="group btn-naranja px-8 py-4 text-base shadow-lg shadow-[#E8621A]/30">
              Agenda tu diagnóstico IT
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#modulos" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-[#F0EBE3] transition-all hover:border-[#E8621A] hover:bg-white/5">
              Explorar módulos
            </a>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8"
          >
            {[
              { v: '16', l: 'Módulos IT listos para implementar' },
              { v: '24/7', l: 'Agentes y automatizaciones operando' },
              { v: '100%', l: 'Código y datos son tuyos' },
            ].map((s) => (
              <div key={s.l}>
                <dt className="sr-only">{s.l}</dt>
                <dd className="text-3xl font-black text-[#E8621A]">{s.v}</dd>
                <dd className="mt-1 text-xs leading-snug text-[#F0EBE3]/55">{s.l}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1200 }}
          className="relative hidden md:block"
        >
          <TerminalDeploy />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-8 -left-8 rounded-2xl border border-white/10 bg-[#0F1830]/90 px-5 py-4 shadow-xl backdrop-blur"
          >
            <p className="text-[11px] uppercase tracking-widest text-white/40">Atención automatizada</p>
            <p className="text-2xl font-black text-[#4ADE80]">24 / 7 / 365</p>
          </motion.div>
          <motion.a
            href={WHATSAPP_IT}
            target="_blank"
            rel="noopener noreferrer"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute -right-6 -top-8 rounded-2xl border border-white/10 bg-[#0F1830]/90 px-5 py-4 shadow-xl backdrop-blur transition-colors hover:border-[#25D366]"
          >
            <p className="text-[11px] uppercase tracking-widest text-white/40">Cotiza por WhatsApp</p>
            <p className="text-sm font-bold text-[#25D366]">Respuesta inmediata →</p>
          </motion.a>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#0A1020]" />
    </section>
  )
}
