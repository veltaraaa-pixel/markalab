'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useSpring, useTransform } from 'framer-motion'
import { ArrowRight, Calculator } from 'lucide-react'

function Numero({ valor, prefijo = '', sufijo = '' }: { valor: number; prefijo?: string; sufijo?: string }) {
  const s = useSpring(valor, { stiffness: 80, damping: 20 })
  const texto = useTransform(s, (v) => `${prefijo}${Math.round(v).toLocaleString('es-MX')}${sufijo}`)
  useEffect(() => { s.set(valor) }, [valor, s])
  return <motion.span>{texto}</motion.span>
}

function Control({
  etiqueta, valor, min, max, paso, sufijo, onChange,
}: { etiqueta: string; valor: number; min: number; max: number; paso: number; sufijo: string; onChange: (v: number) => void }) {
  const pct = ((valor - min) / (max - min)) * 100
  return (
    <label className="block">
      <span className="mb-3 flex items-baseline justify-between">
        <span className="text-sm text-[#F0EBE3]/70">{etiqueta}</span>
        <span className="font-mono text-lg font-bold text-[#F0EBE3]">
          {valor.toLocaleString('es-MX')} <span className="text-xs text-[#F0EBE3]/50">{sufijo}</span>
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={paso}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className="it-range w-full"
        style={{ background: `linear-gradient(90deg,#E8621A ${pct}%,rgba(255,255,255,0.12) ${pct}%)` }}
      />
    </label>
  )
}

export default function CalculadoraIT() {
  const [horas, setHoras] = useState(12)
  const [personas, setPersonas] = useState(4)
  const [costo, setCosto] = useState(250)
  const [nivel, setNivel] = useState(50)

  const horasMes = Math.round(horas * personas * 4.33 * (nivel / 100))
  const ahorroAnual = horasMes * 12 * costo
  const jornadas = Math.round(horasMes / 8)

  return (
    <section className="relative overflow-hidden bg-[#0A1020] py-28 text-[#F0EBE3]">
      <div className="absolute right-0 top-1/3 h-[480px] w-[480px] rounded-full bg-[#E8621A]/10 blur-[140px]" />
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#E8621A]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#FF9A5C]">
              <Calculator size={14} /> Calculadora de automatización
            </span>
            <h2 className="mb-5 text-4xl font-black leading-tight md:text-5xl">
              ¿Cuánto le cuesta a tu empresa <span className="it-text-gradient">no automatizar?</span>
            </h2>
            <p className="mb-10 text-lg text-[#F0EBE3]/60">
              Captura de datos, seguimiento de prospectos, agendar citas, responder las mismas
              preguntas… Mueve los controles y estima el tiempo que podrías recuperar.
            </p>

            <div className="space-y-8 rounded-3xl border border-white/10 bg-white/[0.03] p-7">
              <Control etiqueta="Horas semanales en tareas repetitivas (por persona)" valor={horas} min={2} max={40} paso={1} sufijo="h" onChange={setHoras} />
              <Control etiqueta="Personas en el equipo comercial / operativo" valor={personas} min={1} max={50} paso={1} sufijo="personas" onChange={setPersonas} />
              <Control etiqueta="Costo promedio por hora" valor={costo} min={80} max={1000} paso={10} sufijo="MXN" onChange={setCosto} />
              <Control etiqueta="Porcentaje automatizable estimado" valor={nivel} min={20} max={80} paso={5} sufijo="%" onChange={setNivel} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="it-border-anim p-8 md:p-10"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">Horas recuperadas al mes</p>
            <p className="mb-8 text-6xl font-black text-[#F0EBE3] md:text-7xl">
              <Numero valor={horasMes} sufijo=" h" />
            </p>

            <div className="mb-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/[0.04] p-5">
                <p className="mb-1 text-xs text-white/45">Equivale a</p>
                <p className="text-2xl font-black text-[#9DBDF0]"><Numero valor={jornadas} sufijo=" jornadas" /></p>
                <p className="text-xs text-white/40">de 8 h cada mes</p>
              </div>
              <div className="rounded-2xl bg-white/[0.04] p-5">
                <p className="mb-1 text-xs text-white/45">Valor anual estimado</p>
                <p className="text-2xl font-black text-[#FF9A5C]"><Numero valor={ahorroAnual} prefijo="$" /></p>
                <p className="text-xs text-white/40">MXN en tiempo liberado</p>
              </div>
            </div>

            <div className="mb-8 h-3 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#E8621A] to-[#7FA8E8]"
                animate={{ width: `${nivel}%` }}
                transition={{ type: 'spring', stiffness: 90, damping: 20 }}
              />
            </div>

            <Link href="/diagnostico" className="group btn-naranja w-full justify-center px-8 py-4 text-base">
              Quiero mi plan de automatización
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="mt-4 text-center text-xs text-white/35">
              Estimación ilustrativa. En el diagnóstico calculamos el impacto real con tus datos.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
