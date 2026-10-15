import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import GraciasContenido from '@/components/demo/GraciasContenido'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Gracias · tu demo está lista',
  robots: { index: false, follow: false }, // página privada tras dejar los datos
}

function cookieLegible(valor: string | undefined, largoMax: number) {
  if (!valor) return ''
  try { return decodeURIComponent(valor).slice(0, largoMax) } catch { return '' }
}

export default function GraciasPage() {
  const galletas = cookies()

  // Sin la cookie de la sesión no hay demo: regresa a dejar sus datos.
  if (!galletas.get('ml_demo')?.value) redirect('/demo')

  return (
    <GraciasContenido
      nombre={cookieLegible(galletas.get('ml_demo_nombre')?.value, 40)}
      empresa={cookieLegible(galletas.get('ml_demo_empresa')?.value, 60)}
    />
  )
}
