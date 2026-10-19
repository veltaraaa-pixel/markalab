'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { PhoneCall, MessageSquareQuote, Repeat2 } from 'lucide-react'
import AnimatedSection from '@/components/ui/AnimatedSection'
import DemoFormulario, { type DatosDemo } from './DemoFormulario'
import VerificarCodigo from './VerificarCodigo'

/* ------------------------------------------------------------------ */
/*  Demo del Cold Caller · captura                                     */
/*  El visitante deja sus datos, el equipo recibe el aviso y el número */
/*  de la demo se desbloquea en /demo/gracias.                         */
/* ------------------------------------------------------------------ */

const PASOS = [
  {
    icono: PhoneCall,
    titulo: 'Nos dejas tus datos',
    texto: 'Cuatro campos. Con eso Kala sabe a quién le habla y de qué empresa es.',
  },
  {
    icono: MessageSquareQuote,
    titulo: 'Kala te entrevista',
    texto:
      'Te pregunta a qué se dedica tu negocio y qué quieres que haga el agente: vender, cobrar, agendar, dar seguimiento.',
  },
  {
    icono: Repeat2,
    titulo: 'Se pone en ese papel',
    texto:
      'Ahí mismo te lo demuestra. Ponle las trabas que quieras: que está caro, que no tienes tiempo, que ya tienes proveedor.',
  },
]

export default function DemoContenido() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  // Cuando el correo no es del equipo, hay un paso intermedio de verificación
  const [pendiente, setPendiente] = useState<{ correo: string; minutos: number } | null>(null)

  const enviar = async (formulario: DatosDemo) => {
    setError('')
    setEnviando(true)
    try {
      const respuesta = await fetch('/api/demo-cold-caller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formulario, pagina: '/demo' }),
      })
      const cuerpo = await respuesta.json()
      if (!respuesta.ok) {
        setError(cuerpo?.error || 'No pudimos abrir la demo. Intenta de nuevo.')
        return
      }
      if (cuerpo.acceso === 'por_token') {
        setPendiente({ correo: cuerpo.correo, minutos: cuerpo.minutos || 15 })
        return
      }
      router.push('/demo/gracias')
    } catch {
      setError('No pudimos conectar. Revisa tu internet e intenta otra vez.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-crema pb-10 pt-36">
        <div className="pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full bg-naranja/10" />
        <div className="pointer-events-none absolute right-40 top-56 h-48 w-48 rounded-full bg-naranja/10" />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="mb-5 inline-block rounded-full bg-naranja/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-naranja">
              Demo en vivo
            </span>
            <h1 className="text-4xl font-black leading-[1.05] text-azul-oscuro md:text-6xl">
              Escucha a un agente
              <br />
              <span className="text-naranja">trabajando para tu empresa</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-azul-oscuro/65">
              No es un video ni una grabación. Déjanos tus datos y habla con Kala, nuestra
              asistente. Te va a preguntar cómo funciona tu negocio y qué necesitas, y ahí mismo se
              pone en ese papel para que escuches cómo sonaría con tus clientes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="bg-crema pb-4">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-5 md:grid-cols-3">
            {PASOS.map((paso, i) => (
              <AnimatedSection key={paso.titulo} delay={i * 0.1}>
                <div className="h-full rounded-2xl bg-white/70 p-6">
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-naranja/10">
                    <paso.icono size={20} className="text-naranja" />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-azul-oscuro">{paso.titulo}</h3>
                  <p className="text-sm leading-relaxed text-azul-oscuro/60">{paso.texto}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Formulario */}
      <section id="desbloquear" className="bg-crema py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-2xl">
            {pendiente ? (
              <VerificarCodigo
                correo={pendiente.correo}
                minutos={pendiente.minutos}
                alVerificar={() => router.push('/demo/gracias')}
                alVolver={() => { setPendiente(null); setError('') }}
              />
            ) : (
              <DemoFormulario alEnviar={enviar} error={error} enviando={enviando} />
            )}
          </div>
        </div>
      </section>

      {/* Qué hay detrás */}
      <section className="bg-azul-oscuro py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-5 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/80">
              Qué hay detrás
            </span>
            <h2 className="mb-5 text-3xl font-black leading-tight text-white md:text-4xl">
              La demo dura seis minutos. El sistema trabaja todo el mes.
            </h2>
            <p className="mb-10 text-white/60">
              Lo que vas a escuchar es una muestra de cinco minutos. Instalado en tu empresa, el
              agente sale a llamar solo dentro del horario que definas, respeta a quien pide no ser
              contactado, reintenta a quien no contestó y entrega cada lunes el reporte de qué pasó
              en cada llamada.
            </p>
            <div className="grid gap-4 text-left sm:grid-cols-3">
              {[
                ['Base de prospectos', 'Se arma y se valida número por número antes de marcar.'],
                ['Agenda conectada', 'La cita cae directo en el calendario de quien la va a atender.'],
                ['Reporte semanal', 'Llamadas, decisores alcanzados, citas y las objeciones del mes.'],
              ].map(([titulo, texto]) => (
                <div key={titulo} className="rounded-xl bg-white/5 p-5">
                  <h3 className="mb-1.5 text-sm font-bold text-white">{titulo}</h3>
                  <p className="text-sm leading-relaxed text-white/55">{texto}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
