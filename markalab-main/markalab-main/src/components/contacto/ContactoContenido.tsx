'use client'

import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Globe, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import ContactoFormulario from './ContactoFormulario'
import contactoData from '@/data/contacto.json'

const datosContacto = [
  {
    icono: Phone,
    titulo: 'Teléfono',
    valor: contactoData.telefono,
    href: contactoData.telefonoHref,
    color: '#E8621A',
  },
  {
    icono: Mail,
    titulo: 'Correo',
    valor: contactoData.email,
    href: contactoData.emailHref,
    color: '#4A7CC7',
  },
  {
    icono: MapPin,
    titulo: 'Ubicación',
    valor: contactoData.direccion,
    href: '#mapa',
    color: '#1E2A4A',
  },
  {
    icono: Globe,
    titulo: 'Sitio Web',
    valor: contactoData.sitioWeb,
    href: '/contacto#formulario',
    color: '#E8621A',
  },
  {
    icono: Clock,
    titulo: 'Horario',
    valor: 'Lun – Vie: 9:00 – 18:00',
    href: null,
    color: '#4A7CC7',
  },
]

export default function ContactoContenido() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-36 pb-20 bg-[#1E2A4A] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#E8621A]/8 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#4A7CC7]/10 -translate-x-1/3 translate-y-1/3" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.span
            className="inline-block text-xs font-bold tracking-widest uppercase bg-white/10 text-white/70 px-3 py-1 rounded-full mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Hablemos de tu proyecto
          </motion.span>
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Contáctanos
          </motion.h1>
          <motion.p
            className="text-white/70 text-lg max-w-xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Estamos listos para conocer tu proyecto y ayudarte a crecer.
            Escríbenos o llámanos directamente.
          </motion.p>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-16 bg-[#F0EBE3]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12">

            {/* Datos de contacto */}
            <div>
              <motion.h2
                className="text-2xl font-black text-[#1E2A4A] mb-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                Información de contacto
              </motion.h2>

              <div className="space-y-4 mb-10">
                {datosContacto.map((dato, i) => {
                  const Icono = dato.icono
                  const contenido = (
                    <motion.div
                      key={dato.titulo}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      className="flex items-center gap-4 bg-white rounded-2xl p-5 group hover:shadow-md transition-shadow"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: dato.color }}
                      >
                        <Icono size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1E2A4A]/40 uppercase tracking-wide mb-0.5">
                          {dato.titulo}
                        </p>
                        <p className={`text-[#1E2A4A] font-medium ${dato.href ? 'group-hover:text-[#E8621A] transition-colors' : ''}`}>
                          {dato.valor}
                        </p>
                      </div>
                      {dato.href && (
                        <ArrowRight size={16} className="ml-auto text-[#1E2A4A]/20 group-hover:text-[#E8621A] transition-colors" />
                      )}
                    </motion.div>
                  )

                  if (dato.href) {
                    return (
                      <a key={dato.titulo} href={dato.href}>
                        {contenido}
                      </a>
                    )
                  }
                  return contenido
                })}
              </div>

              {/* Mapa placeholder */}
              <motion.div
                id="mapa"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-[#1E2A4A] rounded-2xl overflow-hidden h-56 relative flex items-center justify-center scroll-mt-24"
              >
                <div className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(255,255,255,0.1) 24px, rgba(255,255,255,0.1) 25px), repeating-linear-gradient(90deg, transparent, transparent 24px, rgba(255,255,255,0.1) 24px, rgba(255,255,255,0.1) 25px)`,
                  }}
                />
                <div className="text-center text-white relative z-10">
                  <div className="w-10 h-10 bg-[#E8621A] rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin size={20} />
                  </div>
                  <p className="font-bold">Jardines del Pedregal</p>
                  <p className="text-white/60 text-sm">Ciudad de México, México</p>
                </div>
              </motion.div>

              {/* Diagnóstico CTA */}
              <motion.div
                className="mt-6 bg-[#E8621A] rounded-2xl p-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="font-bold text-lg mb-2">¿Prefieres una sesión?</h3>
                <p className="text-white/80 text-sm mb-4">
                  Agenda tu diagnóstico comercial gratuito y hablemos directamente sobre tu negocio.
                </p>
                <Link href="/diagnostico" className="inline-flex items-center gap-2 bg-white text-[#E8621A] font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#F0EBE3] transition-colors">
                  Agenda el diagnóstico <ArrowRight size={14} />
                </Link>
              </motion.div>
            </div>

            {/* Formulario */}
            <motion.div
              id="formulario"
              className="scroll-mt-28"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-2xl font-black text-[#1E2A4A] mb-8">Envíanos un mensaje</h2>
              <ContactoFormulario />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
