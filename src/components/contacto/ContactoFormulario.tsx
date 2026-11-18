'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const esquema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresa un correo válido'),
  telefono: z.string().min(10, 'Ingresa un teléfono válido').optional().or(z.literal('')),
  mensaje: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
})

type FormData = z.infer<typeof esquema>

interface ContactoFormularioProps {
  compact?: boolean
}

export default function ContactoFormulario({ compact = false }: ContactoFormularioProps) {
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
    // Handler preparado para EmailJS o similar
    // Ejemplo: await emailjs.send(serviceId, templateId, data, publicKey)
    await new Promise((res) => setTimeout(res, 1500))
    console.log('Formulario enviado:', data)
    setEnviando(false)
    setEnviado(true)
    reset()
  }

  const campoClase = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[#1E2A4A] text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8621A]/40 focus:border-[#E8621A] transition-all'

  return (
    <div className={cn('bg-[#F0EBE3] rounded-2xl p-6 md:p-8', compact ? 'shadow-lg' : '')}>
      <AnimatePresence mode="wait">
        {enviado ? (
          <motion.div
            key="exito"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            >
              <CheckCircle size={56} className="text-[#E8621A] mb-4" />
            </motion.div>
            <h3 className="text-xl font-bold text-[#1E2A4A] mb-2">¡Mensaje enviado!</h3>
            <p className="text-[#1E2A4A]/60 text-sm mb-6">
              Nos pondremos en contacto contigo en las próximas 24 horas hábiles.
            </p>
            <button
              onClick={() => setEnviado(false)}
              className="text-sm text-[#E8621A] font-medium hover:underline"
            >
              Enviar otro mensaje
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="formulario"
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {!compact && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#1E2A4A] mb-1">Escríbenos</h3>
                <p className="text-[#1E2A4A]/60 text-sm">Te respondemos en menos de 24 horas.</p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <input
                  {...register('nombre')}
                  placeholder="Tu nombre *"
                  className={campoClase}
                />
                {errors.nombre && (
                  <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>
                )}
              </div>
              <div>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="Tu correo *"
                  className={campoClase}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <input
                {...register('telefono')}
                type="tel"
                placeholder="Teléfono (opcional)"
                className={campoClase}
              />
              {errors.telefono && (
                <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>
              )}
            </div>

            <div>
              <textarea
                {...register('mensaje')}
                rows={4}
                placeholder="¿En qué podemos ayudarte? *"
                className={cn(campoClase, 'resize-none')}
              />
              {errors.mensaje && (
                <p className="text-red-500 text-xs mt-1">{errors.mensaje.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="btn-naranja w-full justify-center py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {enviando ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Enviar mensaje
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
