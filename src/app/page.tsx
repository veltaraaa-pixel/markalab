import type { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import ServiciosSection from '@/components/home/ServiciosSection'
import FormulaSection from '@/components/home/FormulaSection'
import ResultadosSection from '@/components/home/ResultadosSection'
import CtaSection from '@/components/home/CtaSection'

export const metadata: Metadata = {
  title: 'MarkaLab | Marketing and Sales Consulting | CDMX',
  description:
    'Consultora de Marketing y Ventas en México. Generamos leads calificados, aceleramos conversiones y fidelizamos clientes con estrategias impulsadas por inteligencia artificial.',
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServiciosSection />
      <FormulaSection />
      <ResultadosSection />
      <CtaSection />
    </>
  )
}
