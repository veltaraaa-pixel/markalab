import type { Metadata } from 'next'
import HeroSeccion from '@/components/ui/HeroSeccion'
import FormulaDetallada from '@/components/formula/FormulaDetallada'

export const metadata: Metadata = {
  title: 'Nuestra Fórmula',
  description:
    'Conoce el proceso de 4 pasos de MarkaLab: Diagnóstico Comercial, Diseño del Sistema, Implementación y Optimización para transformar tu negocio comercialmente.',
}

export default function NuestraFormulaPage() {
  return (
    <>
      <HeroSeccion
        etiqueta="Nuestra Fórmula"
        titulo="El proceso que transforma negocios"
        subtitulo="4 pasos probados que combinan inteligencia artificial, experiencia comercial y ejecución ágil para generar resultados reales y sostenibles."
        fondoOscuro
      />
      <FormulaDetallada />
    </>
  )
}
