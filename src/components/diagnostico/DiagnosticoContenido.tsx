'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, CheckCircle, Loader2, BrainCircuit, Clock, Users, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import contactoData from '@/data/contacto.json'

const esquema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  empresa: z.string().min(2, 'El nombre de la empresa es requerido'),
  email: z.string().email('Ingresa un correo válido'),
  telefono: z.string().min(10, 'Ingresa un teléfono válido'),
  queVendes: z.string().min(5, 'Cuéntanos qué vendes (mínimo 5 caracteres)'),
  retoPrincipal: z.string().min(1, 'Selecciona tu principal reto comercial'),
  mensaje: z.string().optional(),
})

type FormData = z.infer<typeof esquema>

const beneficios = [
  { icono: BrainCircuit, texto: 'Análisis con IA de tu negocio', color: '#E8621A' },
  { icono: Clock, texto: 'Sesión de 45 minutos sin costo', color: '#4A7CC7' },
  { icono: Users, texto: 'Identificación de tu buyer persona', color: '#1E2A4A' },
  { icono: TrendingUp, texto: 'Plan de acción personalizado', color: '#E8621A' },
]

export default function DiagnosticoContenido() {
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(esquema) })

  const onSubmit = async (data: FormData) => {
    setEnviando(true)
    // Handler preparado para EmailJS
    // const { NEXT_PUBLIC_EMAILJS_SERVICE_ID, NEXT_PUBLIC_EMAILJS_TEMPLATE_DIAGNOSTICO_ID, NEXT_PUBLIC_EMAILJS_PUBLIC_KEY } = process.env
    // await emailjs.send(NEXT_PUBLIC_EMAILJS_SERVICE_ID, NEXT_PUBLIC_EMAILJS_TEMPLATE_DIAGNOSTICO_ID, data, NEXT_PUBLIC_EMAILJS_PUBLIC_KEY)
    await new Promise((res) => setTimeout(res, 1800))
    console.log('Diagnóstico solicitado:', data)
    setEnviando(false)
    setEnviado(true)
    reset()
  }

  const inputClase = (error?: boolean) => cn(
    'w-full px-4 py-3 rounded-xl border bg-white text-[#1E2A4A] text-sm placeholder:text-gray-400',
    'focus:outline-none focus:ring-2 transition-all',
    error
      ? 'border-red-400 focus:ring-red-300'
      : 'border-gray-200 focus:ring-[#E8621A]/40 focus:border-[#E8621A]'
  )

  return (
    <>
      {/* Hero */}
      <section className="relative pt-36 pb-16 bg-[#1E2A4A] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#E8621A]/10 translate-x-1/3 -translate-y-1/3" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs font-bold tracking-widest uppercase bg-[#E8621A]/20 text-[#E8621A] px-3 py-1 rounded-full mb-6">
              Completamente Gratuito
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Agenda tu{' '}
              <span className="text-[#E8621A]">Diagnóstico</span>
              {' '}Comercial
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Analizamos tu negocio, mercado, proceso de ventas e identificamos
              tu buyer persona con inteligencia artificial. Sin costo, sin compromiso.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-16 bg-[#F0EBE3]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">

            {/* Lado izquierdo: Beneficios */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl font-black text-[#1E2A4A] mb-3">
                ¿Qué incluye el diagnóstico?
              </h2>
              <p className="text-[#1E2A4A]/60 mb-8 leading-relaxed">
                En una sesión de 45 minutos, nuestro equipo analiza tu negocio con
                herramientas de IA y te entrega un plan de acción concreto para acelerar
                tu crecimiento comercial.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {beneficios.map((b, i) => {
                  const Icono = b.icono
                  return (
                    <motion.div
                      key={b.texto}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="bg-white rounded-2xl p-4 flex flex-col gap-3"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: b.color }}
                      >
                        <Icono size={18} className="text-white" />
                      </div>
                      <p className="text-sm font-semibold text-[#1E2A4A]">{b.texto}</p>
                    </motion.div>
                  )
                })}
              </div>

              {/* Proceso */}
              <div className="bg-[#1E2A4A] rounded-2xl p-6 text-white">
                <h3 className="font-bold mb-4">¿Cómo funciona?</h3>
                <ol className="space-y-3">
                  {[
                    'Llenas el formulario con información básica de tu negocio',
                    'Nuestro equipo te contacta en menos de 24 horas',
                    'Agendamos la sesión de diagnóstico por videollamada',
                    'Recibes tu plan de acción personalizado',
                  ].map((paso, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#E8621A] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-white/70 text-sm">{paso}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>

            {/* Lado derecho: Formulario */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {enviado ? (
                  <motion.div
                    key="exito"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white rounded-2xl p-10 text-center shadow-lg"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    >
                      <CheckCircle size={64} className="text-[#E8621A] mx-auto mb-5" />
                    </motion.div>
                    <h3 className="text-2xl font-black text-[#1E2A4A] mb-3">
                      ¡Solicitud enviada con éxito!
                    </h3>
                    <p className="text-[#1E2A4A]/60 mb-2">
                      Nuestro equipo revisará tu información y se pondrá en contacto
                      contigo en menos de <strong>24 horas hábiles</strong>.
                    </p>
                    <p className="text-[#1E2A4A]/60 mb-8 text-sm">
                      Mientras tanto, puedes conocer más sobre nuestros servicios.
                    </p>
                    <button
                      onClick={() => setEnviado(false)}
                      className="text-sm text-[#E8621A] font-medium hover:underline"
                    >
                      Enviar otra solicitud
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="formulario"
                    className="bg-white rounded-2xl p-6 md:p-8 shadow-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <h3 className="text-xl font-bold text-[#1E2A4A] mb-1">
                      Cuéntanos sobre tu negocio
                    </h3>
                    <p className="text-[#1E2A4A]/50 text-sm mb-6">
                      Toda la información es confidencial.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-[#1E2A4A]/60 mb-1 block">
                            Nombre *
                          </label>
                          <input
                            {...register('nombre')}
                            placeholder="Tu nombre completo"
                            className={inputClase(!!errors.nombre)}
                          />
                          {errors.nombre && (
                            <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-[#1E2A4A]/60 mb-1 block">
                            Empresa *
                          </label>
                          <input
                            {...register('empresa')}
                            placeholder="Nombre de tu empresa"
                            className={inputClase(!!errors.empresa)}
                          />
                          {errors.empresa && (
                            <p className="text-red-500 text-xs mt-1">{errors.empresa.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-[#1E2A4A]/60 mb-1 block">
                            Correo *
                          </label>
                          <input
                            {...register('email')}
                            type="email"
                            placeholder="tu@empresa.com"
                            className={inputClase(!!errors.email)}
                          />
                          {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-[#1E2A4A]/60 mb-1 block">
                            Teléfono *
                          </label>
                          <input
                            {...register('telefono')}
                            type="tel"
                            placeholder="+52 55 0000 0000"
                            className={inputClase(!!errors.telefono)}
                          />
                          {errors.telefono && (
                            <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#1E2A4A]/60 mb-1 block">
                          ¿Qué vendes? *
                        </label>
                        <input
                          {...register('queVendes')}
                          placeholder="Ej: Software de gestión para restaurantes, ropa deportiva, servicios de logística..."
                          className={inputClase(!!errors.queVendes)}
                        />
                        {errors.queVendes && (
                          <p className="text-red-500 text-xs mt-1">{errors.queVendes.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#1E2A4A]/60 mb-1 block">
                          ¿Cuál es tu principal reto comercial? *
                        </label>
                        <select
                          {...register('retoPrincipal')}
                          className={cn(inputClase(!!errors.retoPrincipal), 'cursor-pointer')}
                          defaultValue=""
                        >
                          <option value="" disabled>Selecciona tu principal reto</option>
                          {contactoData.retosComerciales.map((reto) => (
                            <option key={reto} value={reto}>{reto}</option>
                          ))}
                        </select>
                        {errors.retoPrincipal && (
                          <p className="text-red-500 text-xs mt-1">{errors.retoPrincipal.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#1E2A4A]/60 mb-1 block">
                          Mensaje adicional (opcional)
                        </label>
                        <textarea
                          {...register('mensaje')}
                          rows={3}
                          placeholder="Cuéntanos más sobre tu situación actual, metas o cualquier detalle relevante..."
                          className={cn(inputClase(), 'resize-none')}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={enviando}
                        className="btn-naranja w-full justify-center py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {enviando ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Enviando solicitud...
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            Solicitar Diagnóstico Gratuito
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs text-[#1E2A4A]/40">
                        Al enviar aceptas que te contactemos para agendar la sesión.
                        Nunca compartimos tu información.
                      </p>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
