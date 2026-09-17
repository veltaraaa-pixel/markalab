'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Phone, Mail } from 'lucide-react'
import ContactoFormulario from '@/components/contacto/ContactoFormulario'

export default function CtaSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Lado izquierdo: CTA */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs font-bold tracking-widest uppercase bg-[#E8621A]/10 text-[#E8621A] px-3 py-1 rounded-full mb-6">
              Empieza hoy
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#1E2A4A] leading-tight mb-6">
              ¿Listo para hacer crecer tu{' '}
              <span className="text-[#E8621A]">negocio?</span>
            </h2>
            <p className="text-[#1E2A4A]/60 text-lg leading-relaxed mb-8">
              Agenda un diagnóstico comercial gratuito y descubre exactamente
              qué estrategias necesita tu empresa para generar más leads,
              convertir más clientes y crecer de forma sostenida.
            </p>

            <div className="space-y-4 mb-10">
              {[
                'Diagnóstico personalizado sin costo',
                'Resultados desde las primeras semanas',
                'Estrategia basada en tu mercado específico',
                'Soporte continuo de expertos en marketing y ventas',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="w-5 h-5 bg-[#E8621A] rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-[#1E2A4A]/80 text-sm">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/diagnostico" className="btn-naranja text-base px-8 py-4">
                Agenda tu diagnóstico <ArrowRight size={18} />
              </Link>
              <a href="tel:+525611232604" className="btn-outline text-base px-8 py-4">
                <Phone size={16} />
               56 1123 2604
              </a>
            </div>

            {/* Datos de contacto rápidos */}
            <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
              <a href="tel:+525611232604" className="flex items-center gap-2 text-sm text-[#1E2A4A]/60 hover:text-[#E8621A] transition-colors">
                <Phone size={14} />
                +52 56 1123 2604
              </a>
              <a href="mailto:comercial@markalab.com.mx" className="flex items-center gap-2 text-sm text-[#1E2A4A]/60 hover:text-[#E8621A] transition-colors">
                <Mail size={14} />
                comercial@markalab.com.mx
              </a>
            </div>
          </motion.div>

          {/* Lado derecho: Formulario */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ContactoFormulario compact />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
