import type { Metadata } from 'next'
import ContactoContenido from '@/components/contacto/ContactoContenido'

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Contáctanos en MarkaLab. Estamos en Jardines del Pedregal, CDMX. Llámanos al +52 55 8100 1579 o escríbenos a comercial@markalab.com.mx',
}

export default function ContactoPage() {
  return <ContactoContenido />
}
