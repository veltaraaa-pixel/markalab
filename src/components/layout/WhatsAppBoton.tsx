'use client'

import { motion } from 'framer-motion'

// Número de WhatsApp de MarkaLab (formato internacional: 52 = México)
const NUMERO_WHATSAPP = '525611232604'
const MENSAJE = 'Hola MarkaLab, me gustaría recibir más información.'

export default function WhatsAppBoton() {
  const enlace = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(MENSAJE)}`

  return (
    <motion.a
      href={enlace}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/40 transition-shadow hover:shadow-xl hover:shadow-[#25D366]/50"
    >
      {/* Halo de pulso */}
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-40" />

      {/* Ícono oficial de WhatsApp */}
      <svg
        viewBox="0 0 32 32"
        className="relative h-8 w-8 fill-white"
        aria-hidden="true"
      >
        <path d="M16.003 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.257.593 4.463 1.72 6.404L3.2 28.8l6.55-1.717a12.74 12.74 0 0 0 6.253 1.63h.005c7.06 0 12.8-5.74 12.8-12.8s-5.744-12.713-12.805-12.713Zm0 23.316h-.004a10.6 10.6 0 0 1-5.4-1.48l-.387-.23-4.017 1.053 1.072-3.918-.252-.402a10.57 10.57 0 0 1-1.62-5.635c0-5.868 4.775-10.643 10.65-10.643 2.844 0 5.517 1.108 7.527 3.12a10.57 10.57 0 0 1 3.117 7.53c-.002 5.868-4.777 10.643-10.643 10.643Zm5.837-7.972c-.32-.16-1.893-.934-2.187-1.04-.293-.107-.507-.16-.72.16-.213.32-.826 1.04-1.013 1.253-.187.213-.373.24-.693.08-.32-.16-1.35-.498-2.573-1.587-.95-.848-1.592-1.895-1.779-2.215-.187-.32-.02-.492.14-.652.144-.143.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.734-.986-2.374-.26-.624-.523-.54-.72-.55l-.613-.01c-.213 0-.56.08-.853.4-.293.32-1.12 1.094-1.12 2.667 0 1.573 1.146 3.093 1.306 3.307.16.213 2.253 3.44 5.46 4.824.763.33 1.358.527 1.822.674.766.244 1.463.21 2.014.127.615-.092 1.893-.774 2.16-1.52.267-.747.267-1.387.187-1.52-.08-.133-.293-.213-.613-.373Z" />
      </svg>
    </motion.a>
  )
}
