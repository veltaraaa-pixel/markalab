import Link from 'next/link'
import { Phone, Mail, MapPin, Globe, Instagram, Facebook, Linkedin, Youtube } from 'lucide-react'

const enlaces = [
  { href: '/', label: 'Inicio' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/nuestra-formula', label: 'Nuestra Fórmula' },
  { href: '/diagnostico', label: 'Diagnóstico' },
  { href: '/contacto', label: 'Contacto' },
]

const servicios = [
  { href: '/servicios#setup-inicial', label: 'Set-up Inicial' },
  { href: '/servicios#atraccion', label: 'Atracción' },
  { href: '/servicios#conversion', label: 'Conversión' },
  { href: '/servicios#fidelizacion', label: 'Fidelización' },
]

export default function Footer() {
  return (
    <footer className="bg-[#1E2A4A] text-white">
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Columna 1: Logo y descripción */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-1 mb-4">
              <span className="text-2xl font-black text-white">Marka</span>
              <span className="text-2xl font-black text-[#E8621A]">Lab</span>
              <span className="ml-0.5 w-3 h-3 bg-[#E8621A] rounded-full inline-block" />
            </Link>
            <p className="text-xs font-medium tracking-widest text-white/50 uppercase mb-4">
              Marketing and Sales Consulting
            </p>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Transformamos negocios a través de estrategias comerciales inteligentes,
              tecnología de punta e implementación ágil orientada a resultados.
            </p>
            {/* Redes sociales */}
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Instagram" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#E8621A] transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" aria-label="Facebook" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#E8621A] transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" aria-label="LinkedIn" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#E8621A] transition-colors">
                <Linkedin size={16} />
              </a>
              <a href="#" aria-label="YouTube" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#E8621A] transition-colors">
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Columna 2: Navegación */}
          <div>
            <h3 className="font-bold text-sm tracking-widest uppercase text-white/50 mb-5">Navegación</h3>
            <ul className="space-y-3">
              {enlaces.map((e) => (
                <li key={e.href}>
                  <Link href={e.href} className="text-white/70 hover:text-[#E8621A] transition-colors text-sm">
                    {e.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Servicios */}
          <div>
            <h3 className="font-bold text-sm tracking-widest uppercase text-white/50 mb-5">Servicios</h3>
            <ul className="space-y-3">
              {servicios.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="text-white/70 hover:text-[#E8621A] transition-colors text-sm">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h3 className="font-bold text-sm tracking-widest uppercase text-white/50 mb-5">Contacto</h3>
            <ul className="space-y-4">
              <li>
                <a href="tel:+525581001579" className="flex items-start gap-3 text-white/70 hover:text-[#E8621A] transition-colors text-sm group">
                  <Phone size={16} className="mt-0.5 shrink-0 group-hover:text-[#E8621A]" />
                  +52 55 8100 1579
                </a>
              </li>
              <li>
                <a href="mailto:comercial@markalab.com.mx" className="flex items-start gap-3 text-white/70 hover:text-[#E8621A] transition-colors text-sm group">
                  <Mail size={16} className="mt-0.5 shrink-0 group-hover:text-[#E8621A]" />
                  comercial@markalab.com.mx
                </a>
              </li>
              <li>
                <span className="flex items-start gap-3 text-white/70 text-sm">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  Jardines del Pedregal, CDMX
                </span>
              </li>
              <li>
                <a href="https://www.markalab.com.mx" className="flex items-start gap-3 text-white/70 hover:text-[#E8621A] transition-colors text-sm group">
                  <Globe size={16} className="mt-0.5 shrink-0 group-hover:text-[#E8621A]" />
                  www.markalab.com.mx
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea divisoria y copyright */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © 2026 MarkaLab. Todos los derechos reservados.
          </p>
          <Link
            href="/diagnostico"
            className="text-sm bg-[#E8621A] text-white px-5 py-2 rounded-full hover:bg-[#C4511A] transition-colors"
          >
            Agenda tu diagnóstico gratuito →
          </Link>
        </div>
      </div>
    </footer>
  )
}
