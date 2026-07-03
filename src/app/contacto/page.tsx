import type { Metadata } from 'next'
import ContactoContenido from '@/components/contacto/ContactoContenido'

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Contáctanos en MarkaLab. Estamos en Jardines del Pedregal, CDMX. Llámanos al +52 56 1123 2604 o escríbenos a comercial@markalab.com.mx',
}

export default function ContactoPage() {
  return <ContactoContenido />
}
