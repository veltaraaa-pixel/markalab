'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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

// Rutas cuyo hero tiene fondo azul oscuro: ahí el nav debe ir en color crema
const rutasHeroOscuro = ['/servicios', '/nuestra-formula', '/diagnostico', '/contacto']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const pathname = usePathname()

  // Texto claro (crema) solo cuando el hero oscuro está visible (aún sin scroll).
  // Al hacer scroll el fondo del nav se vuelve blanco, entonces vuelve a azul oscuro.
  const textoClaro = rutasHeroOscuro.includes(pathname) && !scrolled

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
        <Link href="/" className="flex items-center group">
          <Image
            src="/logo-markalab.jpg"
            alt="MarkaLab"
            width={150}
            height={55}
            className="h-12 w-auto"
            priority
          />
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
                    : textoClaro
                    ? 'text-[#F0EBE3] hover:text-[#E8621A] hover:bg-white/10'
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
            href="tel:+525611232604"
            className={cn(
              'flex items-center gap-2 text-sm transition-colors hover:text-[#E8621A]',
              textoClaro ? 'text-[#F0EBE3]/80' : 'text-[#1E2A4A]/70'
            )}
          >
            <Phone size={14} />
            <span>56 1123 2604</span>
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
          className={cn(
            'md:hidden p-2 rounded-lg transition-colors hover:bg-[#E8621A]/10',
            textoClaro ? 'text-[#F0EBE3]' : 'text-[#1E2A4A]'
          )}
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
