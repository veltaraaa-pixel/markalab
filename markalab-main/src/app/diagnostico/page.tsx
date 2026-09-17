import type { Metadata } from 'next'
import DiagnosticoContenido from '@/components/diagnostico/DiagnosticoContenido'

export const metadata: Metadata = {
  title: 'Diagnóstico Comercial Gratuito',
  description:
    'Agenda tu diagnóstico comercial gratuito con MarkaLab. Analizamos tu negocio, mercado y proceso de ventas con inteligencia artificial para identificar tus mayores oportunidades de crecimiento.',
}

export default function DiagnosticoPage() {
  return <DiagnosticoContenido />
}
