'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

const enlaces = [
  { href: '/', label: 'Inicio' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/nuestra-formula', label: 'Nuestra Fórmula' },
  { href: '/diagnostico', label: 'Diagnóstico' },
  { href: '/contacto', label: 'Contacto' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const manejarScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', manejarScroll)
    return () => window.removeEventListener('scroll', manejarScroll)
  }, [])

  useEffect(() => {
    setMenuAbierto(false)
  }, [pathname])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-md py-3'
          : 'bg-transparent py-5'
      )}
    >
      <nav className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 group">
          <span className="text-2xl font-black text-[#1E2A4A] tracking-tight">
            Marka
          </span>
          <span className="text-2xl font-black text-[#E8621A] tracking-tight">
            Lab
          </span>
          <span className="ml-0.5 w-3 h-3 bg-[#E8621A] rounded-full inline-block group-hover:scale-125 transition-transform duration-300" />
        </Link>

        {/* Links escritorio */}
        <ul className="hidden md:flex items-center gap-1">
          {enlaces.map((enlace) => (
            <li key={enlace.href}>
              <Link
                href={enlace.href}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  pathname === enlace.href
                    ? 'text-[#E8621A] font-semibold'
                    : 'text-[#1E2A4A] hover:text-[#E8621A] hover:bg-[#E8621A]/5'
                )}
              >
                {enlace.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA escritorio */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="tel:+525581001579"
            className="flex items-center gap-2 text-sm text-[#1E2A4A]/70 hover:text-[#E8621A] transition-colors"
          >
            <Phone size={14} />
            <span>55 8100 1579</span>
          </a>
          <Link
            href="/diagnostico"
            className="btn-naranja text-sm"
          >
            Agenda una llamada
          </Link>
        </div>

        {/* Botón hamburguesa */}
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="md:hidden p-2 rounded-lg text-[#1E2A4A] hover:bg-[#E8621A]/10 transition-colors"
          aria-label="Menú"
        >
          {menuAbierto ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Menú móvil */}
      <AnimatePresence>
        {menuAbierto && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-lg overflow-hidden"
          >
            <ul className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {enlaces.map((enlace) => (
                <li key={enlace.href}>
                  <Link
                    href={enlace.href}
                    className={cn(
                      'block px-4 py-3 rounded-xl text-base font-medium transition-all',
                      pathname === enlace.href
                        ? 'bg-[#E8621A]/10 text-[#E8621A] font-semibold'
                        : 'text-[#1E2A4A] hover:bg-[#F0EBE3]'
                    )}
                  >
                    {enlace.label}
                  </Link>
                </li>
              ))}
              <li className="pt-3">
                <Link
                  href="/diagnostico"
                  className="btn-naranja w-full justify-center"
                >
                  Agenda una llamada
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
