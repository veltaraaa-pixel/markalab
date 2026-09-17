'use client'

import { motion } from 'framer-motion'
import { BarChart2, Target, Zap, Users, Palette, Globe, Mic2, BrainCircuit, Briefcase, Camera } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'

const entregables = [
  { numero: '01', nombre: 'Análisis de Mercado', descripcion: 'Estudio profundo del mercado objetivo, tendencias y oportunidades de negocio.', icono: BarChart2, color: '#4A7CC7' },
  { numero: '02', nombre: 'Análisis de Competencia', descripcion: 'Mapeo de competidores directos e indirectos, fortalezas y brechas del mercado.', icono: Target, color: '#E8621A' },
  { numero: '03', nombre: 'Hook Diferenciador', descripcion: 'Propuesta de valor única que posiciona tu marca sobre la competencia.', icono: Zap, color: '#1E2A4A' },
  { numero: '04', nombre: 'Definir Buyer Persona', descripcion: 'Perfil detallado de tu cliente ideal para enfocar todos los esfuerzos comerciales.', icono: Users, color: '#4A7CC7' },
  { numero: '05', nombre: 'Identidad Corporativa', descripcion: 'Desarrollo de la imagen visual y verbal que representa tu empresa.', icono: Palette, color: '#E8621A' },
  { numero: '06', nombre: 'Sitio Web Básico', descripcion: 'Presencia digital profesional orientada a conversión y captación de leads.', icono: Globe, color: '#1E2A4A' },
  { numero: '07', nombre: 'Brand Voice', descripcion: 'Definición del tono, estilo y voz de comunicación de tu marca.', icono: Mic2, color: '#4A7CC7' },
  { numero: '08', nombre: 'Diagnóstico Comercial AI', descripcion: 'Análisis inteligente de tu proceso comercial con recomendaciones accionables.', icono: BrainCircuit, color: '#E8621A' },
  { numero: '09', nombre: 'Sales Deck', descripcion: 'Presentación comercial de alto impacto para cerrar más negocios.', icono: Briefcase, color: '#1E2A4A' },
  { numero: '10', nombre: 'Levantamiento de Contenido', descripcion: 'Producción y catalogación de materiales visuales y textuales de tu marca.', icono: Camera, color: '#4A7CC7' },
]

export default function SetupInicial() {
  return (
    <section id="setup-inicial" className="py-24 bg-[#F0EBE3] scroll-mt-20">
      <div className="container mx-auto px-4 md:px-6">

        {/* Encabezado */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <SectionTitle
            etiqueta="Servicio 01"
            titulo="Set-up Inicial"
            subtitulo="Queremos conocerlos, saber a dónde quieren llegar, qué productos y servicios venden; así elaboramos las estrategias base para su sistema comercial."
          />
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#1E2A4A] rounded-2xl p-8 text-white"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#E8621A] flex items-center justify-center">
                <span className="text-white font-black text-lg">10</span>
              </div>
              <div>
                <p className="text-2xl font-black">10 Entregables</p>
                <p className="text-white/60 text-sm">Clave para arrancar</p>
              </div>
            </div>
            <p className="text-white/70 leading-relaxed">
              El Set-up Inicial establece los cimientos de tu sistema comercial.
              Analizamos tu negocio, mercado y competencia para construir una
              estrategia sólida y diferenciada antes de activar cualquier canal.
            </p>
          </motion.div>
        </div>

        {/* Grid de entregables */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {entregables.map((item, i) => {
            const Icono = item.icono
            return (
              <motion.div
                key={item.numero}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
                className="bg-white rounded-2xl p-5 group transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: item.color + '15' }}
                  >
                    <Icono size={18} style={{ color: item.color }} />
                  </div>
                  <span className="text-3xl font-black text-[#1E2A4A]/8">{item.numero}</span>
                </div>
                <h3 className="font-bold text-[#1E2A4A] text-sm mb-2">{item.nombre}</h3>
                <p className="text-[#1E2A4A]/55 text-xs leading-relaxed">{item.descripcion}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
