import type { Metadata } from 'next'
import ITHero from '@/components/it/ITHero'
import StackMarquee from '@/components/it/StackMarquee'
import ModulosIT from '@/components/it/ModulosIT'
import CasoPropio from '@/components/it/CasoPropio'
import PorQueNosotros from '@/components/it/PorQueNosotros'
import ProcesoIT from '@/components/it/ProcesoIT'
import CalculadoraIT from '@/components/it/CalculadoraIT'
import CierreIT from '@/components/it/CierreIT'

export const metadata: Metadata = {
  title: 'Soluciones IT: Desarrollo Web, IA y Automatización',
  description:
    'Desarrollo web con Next.js, chatbots y agentes de voz con IA, automatización con n8n, integraciones, apps y e-commerce. Tecnología diseñada por consultores comerciales en CDMX.',
  keywords: [
    'desarrollo web CDMX',
    'chatbot con IA México',
    'agente de voz IA',
    'automatización n8n',
    'desarrollo de apps México',
    'integraciones CRM',
    'e-commerce México',
    'MarkaLab IT',
  ],
  alternates: { canonical: '/soluciones-it' },
  openGraph: {
    title: 'MarkaLab · Soluciones IT',
    description: 'Tecnología que vende: web, IA conversacional, automatización y apps, construidas con visión comercial.',
    url: '/soluciones-it',
  },
}

export default function SolucionesITPage() {
  return (
    <div className="bg-[#0A1020]">
      <ITHero />
      <StackMarquee />
      <ModulosIT />
      <CasoPropio />
      <PorQueNosotros />
      <ProcesoIT />
      <CalculadoraIT />
      <CierreIT />
    </div>
  )
}
