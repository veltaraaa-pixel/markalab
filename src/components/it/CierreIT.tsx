'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Plus, Mail } from 'lucide-react'
import { WHATSAPP_IT } from './data'

const preguntas = [
  {
    p: '¿Puedo contratar un solo módulo?',
    r: 'Sí. Cada módulo funciona de forma independiente. Muchos clientes inician con un sitio o un chatbot y después conectan agenda, CRM y automatizaciones.',
  },
  {
    p: '¿Se integra con los sistemas que ya uso?',
    r: 'En la mayoría de los casos sí. Trabajamos con APIs, webhooks y n8n para conectar CRM, ERP, hojas de cálculo, WhatsApp, correo y pasarelas de pago.',
  },
  {
    p: '¿De quién es el código y la información?',
    r: 'Tuyos. El repositorio, el dominio y las cuentas de servicios quedan a nombre de tu empresa. No hay candados de proveedor.',
  },
  {
    p: '¿Cuánto tarda un proyecto?',
    r: 'Depende del alcance. Lo definimos en el diagnóstico con un cronograma por sprints para que veas avances funcionales desde las primeras semanas.',
  },
  {
    p: '¿Qué pasa después del lanzamiento?',
    r: 'Ofrecemos planes de soporte, monitoreo y mejora continua. Medimos con datos reales y ajustamos para que el sistema siga generando resultados.',
  },
]

export default function CierreIT() {
  const [abierta, setAbierta] = useState<number | null>(0)

  return (
    <>
      {/* FAQ */}
      <section className="bg-[#0F1830] py-28 text-[#F0EBE3]">
        <div className="container mx-auto grid max-w-6xl gap-12 px-4 md:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="mb-5 inline-block rounded-full bg-[#4A7CC7]/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#9DBDF0]">
              Preguntas frecuentes
            </span>
            <h2 className="mb-5 text-4xl font-black leading-tight">Resolvemos tus dudas antes de empezar</h2>
            <p className="text-[#F0EBE3]/60">
              ¿Tienes otra pregunta? Escríbele a Kala en la esquina inferior derecha o mándanos un WhatsApp.
            </p>
          </div>
          <div className="divide-y divide-white/10 rounded-3xl border border-white/10 bg-white/[0.02]">
            {preguntas.map((q, i) => {
              const on = abierta === i
              return (
                <div key={q.p}>
                  <button
                    onClick={() => setAbierta(on ? null : i)}
                    aria-expanded={on}
                    className="flex w-full items-center justify-between gap-6 px-7 py-6 text-left font-semibold transition-colors hover:text-[#FF9A5C]"
                  >
                    {q.p}
                    <motion.span animate={{ rotate: on ? 45 : 0 }} className={`shrink-0 ${on ? 'text-[#E8621A]' : 'text-white/40'}`}>
                      <Plus size={20} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="px-7 pb-6 text-[#F0EBE3]/60">{q.r}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative overflow-hidden bg-[#0A1020] py-28 text-[#F0EBE3]">
        <div className="it-grid-bg absolute inset-0" />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-[#E8621A]/30 to-[#4A7CC7]/30 blur-[120px]"
          animate={{ scale: [1, 1.12, 1], rotate: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="container relative mx-auto max-w-4xl px-4 text-center md:px-6"
        >
          <h2 className="mb-6 text-4xl font-black leading-tight md:text-6xl">
            Tu próximo sistema comercial
            <br />
            <span className="it-text-gradient">empieza con una conversación.</span>
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-[#F0EBE3]/65">
            Agenda tu diagnóstico IT sin costo. Analizamos tu operación y te entregamos una
            hoja de ruta tecnológica priorizada por impacto en ventas.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/diagnostico" className="group btn-naranja px-9 py-4 text-base shadow-xl shadow-[#E8621A]/30">
              Agenda tu diagnóstico IT
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={WHATSAPP_IT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#25D366]/50 px-9 py-4 text-base font-semibold text-[#25D366] transition-all hover:bg-[#25D366] hover:text-white"
            >
              Cotizar por WhatsApp
            </a>
          </div>
          <a href="mailto:marketing@markalab.com.mx" className="mt-8 inline-flex items-center gap-2 text-sm text-white/45 transition-colors hover:text-[#FF9A5C]">
            <Mail size={14} /> marketing@markalab.com.mx
          </a>
        </motion.div>
      </section>
    </>
  )
}
