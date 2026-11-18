import type { Metadata } from 'next'
import DemoContenido from '@/components/demo/DemoContenido'

export const metadata: Metadata = {
  title: 'Demo en vivo · agente de voz con inteligencia artificial',
  description:
    'Habla con Kala, nuestra asistente. Te pregunta cómo funciona tu negocio y se pone en el papel que necesites: vender, cobrar, agendar. Escucha cómo sonaría trabajando para tu empresa.',
  alternates: { canonical: '/demo' },
  openGraph: {
    title: 'Escucha a un agente trabajando para tu empresa',
    description:
      'Demo en vivo del Cold Caller de MarkaLab. Sin costo y sin compromiso: Kala se adapta a tu giro y te lo demuestra.',
    url: '/demo',
    type: 'website',
  },
}

export default function DemoPage() {
  return <DemoContenido />
}
