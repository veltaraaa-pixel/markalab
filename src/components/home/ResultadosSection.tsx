'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Users, TrendingUp, Zap, BarChart3, DollarSign } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'

const metricas = [
  {
    prefijo: '+',
    valor: 3,
    sufijo: 'x',
    titulo: 'Clientes Potenciales',
    descripcion: 'Leads con intención real de compra que entran a tu proceso comercial.',
    icono: Users,
    color: '#E8621A',
  },
  {
    prefijo: '+',
    valor: 250,
    sufijo: '%',
    titulo: 'Oportunidades de Venta',
    descripcion: 'Incrementamos el volumen y calidad del pipeline comercial.',
    icono: TrendingUp,
    color: '#FFFFFF',
  },
  {
    prefijo: '',
    valor: 80,
    sufijo: '%',
    titulo: 'Procesos más Eficientes',
    descripcion: 'Reducimos fricción en seguimiento y cierre de clientes.',
    icono: Zap,
    color: '#E8621A',
  },
  {
    prefijo: '',
    valor: 100,
    sufijo: '%',
    titulo: 'Crecimiento Constante',
    descripcion: 'Creamos sistemas que generan resultados sostenibles en el tiempo.',
    icono: BarChart3,
    color: '#FFFFFF',
  },
  {
    prefijo: '-',
    valor: 40,
    sufijo: '%',
    titulo: 'Costo de Adquisición',
    descripcion: 'Optimizamos inversión comercial para mejorar el retorno (ROI).',
    icono: DollarSign,
    color: '#E8621A',
  },
]

function ContadorAnimado({ valor, prefijo, sufijo }: { valor: number; prefijo: string; sufijo: string }) {
  const [conteo, setConteo] = useState(0)
  const ref = useRef(null)
  const enVista = useInView(ref, { once: true })

  useEffect(() => {
    if (!enVista) return
    const duracion = 1800
    const pasos = 60
    const incremento = valor / pasos
    let actual = 0
    const timer = setInterval(() => {
      actual += incremento
      if (actual >= valor) {
        setConteo(valor)
        clearInterval(timer)
      } else {
        setConteo(Math.floor(actual))
      }
    }, duracion / pasos)
    return () => clearInterval(timer)
  }, [enVista, valor])

  return (
    <span ref={ref}>
      {prefijo}{conteo}{sufijo}
    </span>
  )
}

export default function ResultadosSection() {
  return (
    <section className="py-24 bg-[#1E2A4A] relative overflow-hidden">
      {/* Decoraciones */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#E8621A]/8 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#4A7CC7]/10 -translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <SectionTitle
            etiqueta="Resultados"
            titulo="Resultados que entregamos"
            subtitulo="Métricas reales que impactan directamente en el crecimiento y rentabilidad de tu negocio."
            centrado
            claro
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {metricas.map((metrica, i) => {
            const Icono = metrica.icono
            return (
              <motion.div
                key={metrica.titulo}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center group hover:bg-white/10 transition-colors duration-300"
              >
                {/* Icono */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: metrica.color === '#E8621A' ? '#E8621A' : 'rgba(255,255,255,0.15)' }}
                >
                  <Icono size={18} className="text-white" />
                </div>

                {/* Contador */}
                <div className="text-4xl font-black text-white mb-2">
                  <ContadorAnimado
                    valor={metrica.valor}
                    prefijo={metrica.prefijo}
                    sufijo={metrica.sufijo}
                  />
                </div>

                <h3 className="font-bold text-white text-sm mb-2">{metrica.titulo}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{metrica.descripcion}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
