'use client'

import { motion } from 'framer-motion'
import { Target, Rocket, KeyRound, BrainCircuit, ShieldCheck, Headset } from 'lucide-react'
import { spotlight } from './ModulosIT'

const razones = [
  {
    icono: Target,
    titulo: 'Ingeniería con visión comercial',
    texto: 'Somos consultores de marketing y ventas que programan. Cada línea de código se justifica con un objetivo de negocio: más leads, más cierres, menos costo.',
    grande: true,
  },
  {
    icono: Rocket,
    titulo: 'Entregas por sprints',
    texto: 'Ves avances funcionales cada semana, no un PDF de promesas.',
  },
  {
    icono: KeyRound,
    titulo: 'Tu código, tus datos',
    texto: 'Repositorio, dominio y cuentas a tu nombre. Sin candados de proveedor.',
  },
  {
    icono: BrainCircuit,
    titulo: 'IA en producción, no en demo',
    grande: true,
    texto: 'Agentes de texto y voz que ya operan en nuestro propio sitio, conectados a procesos reales.',
  },
  {
    icono: ShieldCheck,
    titulo: 'Seguridad y privacidad',
    texto: 'Variables protegidas, accesos por rol y avisos de privacidad alineados a la ley mexicana.',
    grande: true,
  },
  {
    icono: Headset,
    titulo: 'Soporte cercano en CDMX',
    texto: 'Un equipo que habla tu idioma y entiende tu mercado. Acompañamiento después del lanzamiento.',
  },
]

export default function PorQueNosotros() {
  return (
    <section className="relative bg-[#0A1020] py-28 text-[#F0EBE3]">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="mb-5 inline-block rounded-full bg-[#E8621A]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#FF9A5C]">
            ¿Por qué MarkaLab?
          </span>
          <h2 className="text-4xl font-black leading-tight md:text-5xl">
            Una agencia de software te entrega código.
            <br />
            <span className="it-text-gradient">Nosotros te entregamos resultados.</span>
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {razones.map((r, i) => {
            const Icono = r.icono
            return (
              <motion.article
                key={r.titulo}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: (i % 3) * 0.08 }}
                whileHover={{ y: -6 }}
                onPointerMove={spotlight}
                className={`it-spotlight overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.01] p-8 ${r.grande ? 'md:col-span-2' : ''}`}
              >
                <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E8621A] to-[#C4511A] shadow-lg shadow-[#E8621A]/25">
                  <Icono size={22} />
                </span>
                <h3 className="mb-3 text-xl font-bold">{r.titulo}</h3>
                <p className="leading-relaxed text-[#F0EBE3]/60">{r.texto}</p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
