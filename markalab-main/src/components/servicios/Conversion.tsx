'use client'

import { motion } from 'framer-motion'
import { Handshake, PhoneCall, Bot, MessageSquare, Star, Calendar, GraduationCap, Smartphone } from 'lucide-react'
import SectionTitle from '@/components/ui/SectionTitle'

const herramientas = [
  {
    nombre: 'Recursos Comerciales',
    descripcion: 'Materiales y procesos que empoderan a tu equipo de ventas para cerrar más negocios.',
    icono: Handshake,
    nivel: 1,
    color: '#1E2A4A',
  },
  {
    nombre: 'Asistente Telefónico 24/7 Inbound',
    descripcion: 'Atención automatizada para capturar leads en cualquier horario.',
    icono: PhoneCall,
    nivel: 1,
    color: '#1E2A4A',
  },
  {
    nombre: 'Chatbot Atención a Clientes',
    descripcion: 'Respuesta inmediata a dudas frecuentes y calificación de prospectos.',
    icono: Bot,
    nivel: 2,
    color: '#E8621A',
  },
  {
    nombre: 'Chatbot Multicanal',
    descripcion: 'Presencia unificada en WhatsApp, web, Instagram y más plataformas.',
    icono: MessageSquare,
    nivel: 2,
    color: '#E8621A',
  },
  {
    nombre: 'Smart Promos',
    descripcion: 'Promociones inteligentes activadas por comportamiento del usuario.',
    icono: Star,
    nivel: 3,
    color: '#4A7CC7',
  },
  {
    nombre: 'Agenda y Reservas',
    descripcion: 'Sistema de citas automatizado para reducir fricción en el proceso de venta.',
    icono: Calendar,
    nivel: 3,
    color: '#4A7CC7',
  },
  {
    nombre: 'Capacitaciones Comerciales',
    descripcion: 'Formación especializada para maximizar el desempeño de tu equipo de ventas.',
    icono: GraduationCap,
    nivel: 4,
    color: '#6B7280',
  },
  {
    nombre: 'Desarrollo de Apps',
    descripcion: 'Soluciones digitales a medida para optimizar tu proceso comercial.',
    icono: Smartphone,
    nivel: 4,
    color: '#6B7280',
  },
]

const nivelesInfo: Record<number, { paddingX: string; label: string }> = {
  1: { paddingX: 'px-0',    label: 'Tope del funnel' },
  2: { paddingX: 'px-6',    label: 'Calificación' },
  3: { paddingX: 'px-12',   label: 'Conversión' },
  4: { paddingX: 'px-16',   label: 'Cierre' },
}

export default function Conversion() {
  const niveles = [1, 2, 3, 4]

  return (
    <section id="conversion" className="py-24 bg-[#F0EBE3] scroll-mt-20">
      <div className="container mx-auto px-4 md:px-6">

        <div className="text-center mb-16">
          <SectionTitle
            etiqueta="Servicio 03"
            titulo="Conversión y Herramientas"
            subtitulo="Recomendamos las herramientas correctas que nos darán ese retorno de inversión: leads, oportunidades, funnel y pipeline."
            centrado
          />
        </div>

        {/* Funnel visual */}
        <div className="max-w-2xl mx-auto">
          {niveles.map((nivel) => {
            const herramienta = herramientas.filter((h) => h.nivel === nivel)
            const info = nivelesInfo[nivel]

            return (
              <motion.div
                key={nivel}
                initial={{ opacity: 0, scaleX: 0.8 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: (nivel - 1) * 0.15 }}
                className={`w-full ${info.paddingX} mb-4`}
              >
                <div
                  className="rounded-2xl p-5 text-white"
                  style={{ background: herramienta[0]?.color || '#1E2A4A' }}
                >
                  <p className="text-[10px] font-bold tracking-widest uppercase text-white/60 text-center mb-3">
                    {info.label}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {herramienta.map((h) => {
                      const Icono = h.icono
                      return (
                        <div key={h.nombre} className="flex items-start gap-2">
                          <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                            <Icono size={14} className="text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white leading-tight">{h.nombre}</p>
                            <p className="text-[10px] text-white/65 leading-tight mt-0.5 hidden sm:block">{h.descripcion}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )
          })}

          {/* Logo al final del funnel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mx-auto w-fit bg-white rounded-2xl px-8 py-4 flex flex-col items-center shadow-lg"
          >
            <div className="flex items-center gap-1 mb-1">
              <span className="text-lg font-black text-[#1E2A4A]">Marka</span>
              <span className="text-lg font-black text-[#E8621A]">Lab</span>
              <span className="w-2 h-2 bg-[#E8621A] rounded-full" />
            </div>
            <p className="text-[9px] text-[#1E2A4A]/50 tracking-widest uppercase">
              Marketing and Sales
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
