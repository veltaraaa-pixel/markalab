import type { Metadata } from 'next'
import HeroSeccion from '@/components/ui/HeroSeccion'
import SetupInicial from '@/components/servicios/SetupInicial'
import Atraccion from '@/components/servicios/Atraccion'
import Conversion from '@/components/servicios/Conversion'
import Fidelizacion from '@/components/servicios/Fidelizacion'

export const metadata: Metadata = {
  title: 'Servicios',
  description:
    'Conoce todos nuestros servicios de marketing y ventas: Set-up Inicial, Atracción con +23 canales, Conversión con herramientas de IA y Fidelización a largo plazo.',
}

export default function ServiciosPage() {
  return (
    <>
      <HeroSeccion
        etiqueta="Nuestros Servicios"
        titulo="Soluciones comerciales integrales para hacer crecer tu negocio"
        subtitulo="Cubrimos todo el ciclo comercial: desde la estrategia inicial hasta la retención de clientes, con tecnología de punta e implementación ágil."
        fondoOscuro
      />
      <SetupInicial />
      <Atraccion />
      <Conversion />
      <Fidelizacion />
    </>
  )
}
