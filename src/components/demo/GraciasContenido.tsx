'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { WebCallSession } from 'retell-client-js-sdk'
import { motion } from 'framer-motion'
import {
  Check, Mic, ArrowRight, Mail, CalendarDays, BarChart3,
  Video, Users, ShieldCheck, CircleCheck, Loader2, PartyPopper,
} from 'lucide-react'
import type { TurnoVoz } from '@/components/chat/KalaRetell'
import Calendario from './Calendario'

// El SDK de Retell pesa: se carga aparte y solo en el navegador.
const KalaRetell = dynamic(() => import('@/components/chat/KalaRetell'), { ssr: false })
const cargarRetell = () => import('@/components/chat/KalaRetell')

/* ------------------------------------------------------------------ */
/*  Página de gracias                                                  */
/*  Dos cosas pasan aquí: la demo con Kala, y el agendado del          */
/*  diagnóstico con nuestro propio calendario.                         */
/* ------------------------------------------------------------------ */

type Props = { nombre: string; empresa: string }

const SIGUIENTE = [
  { icono: Mail, titulo: 'Te contactaremos', texto: 'Un especialista se pondrá en contacto contigo en las próximas 24 horas.' },
  { icono: CalendarDays, titulo: 'Agendaremos', texto: 'Coordinaremos una llamada para conocer más sobre tu negocio.' },
  { icono: BarChart3, titulo: 'Te mostraremos', texto: 'Una propuesta personalizada y cómo podemos ayudarte a generar más ventas.' },
]

const DETALLES = [
  { icono: Video, titulo: 'Google Meet', texto: 'La liga se envía después de agendar.' },
  { icono: Users, titulo: 'Con un especialista de MarkaLab', texto: 'Revisa tu negocio, tus objetivos y cómo podemos ayudarte.' },
  { icono: ShieldCheck, titulo: 'Sin compromiso', texto: 'Es una llamada cien por ciento gratuita y sin obligación.' },
]

const EN_LA_LLAMADA = [
  'Entender tu negocio y objetivos',
  'Identificar oportunidades de crecimiento',
  'Mostrarte una propuesta personalizada',
]

function leerCookie(nombre: string) {
  if (typeof document === 'undefined') return ''
  const m = document.cookie.match(new RegExp('(^| )' + nombre + '=([^;]+)'))
  try { return m ? decodeURIComponent(m[2]) : '' } catch { return '' }
}

export default function GraciasContenido({ nombre, empresa }: Props) {
  const [llamada, setLlamada] = useState<WebCallSession | null>(null)
  const [yaHablo, setYaHablo] = useState(false)
  const [errorLlamada, setErrorLlamada] = useState('')
  const [preparando, setPreparando] = useState(false)
  const moduloRetell = useRef<Awaited<ReturnType<typeof cargarRetell>> | null>(null)

  const [elegido, setElegido] = useState<{ fecha: string; hora: string } | null>(null)
  const [agendando, setAgendando] = useState(false)
  const [errorCita, setErrorCita] = useState('')
  const [confirmada, setConfirmada] = useState<{ fecha: string; hora: string } | null>(null)

  useEffect(() => {
    cargarRetell().then((m) => { moduloRetell.current = m }).catch(() => {})
  }, [])

  const hablar = async () => {
    setErrorLlamada('')
    setPreparando(true)
    try {
      const retell = moduloRetell.current ?? (await cargarRetell().catch(() => null))
      if (retell) moduloRetell.current = retell

      if (!retell || !retell.demoDisponible()) {
        setErrorLlamada(
          'La demo necesita micrófono y un navegador reciente. Escríbenos a comercial@markalab.com.mx y lo vemos por teléfono.'
        )
        return
      }

      const sesionVoz = retell.abrirLlamadaDemo(leerCookie('ml_demo_id') || 'demo', {
        name: nombre,
        business: empresa,
        nota: leerCookie('ml_demo_nota'),
      })
      setLlamada(sesionVoz)
    } catch {
      setErrorLlamada(
        'No pude abrir el micrófono. Permite el acceso desde el candado de la barra de direcciones e intenta de nuevo.'
      )
    } finally {
      setPreparando(false)
    }
  }

  const terminarLlamada = (turnos: TurnoVoz[], motivo?: string) => {
    setLlamada(null)
    if (motivo) {
      // Se cayó: no la damos por escuchada ni bajamos al calendario
      setErrorLlamada(motivo)
      return
    }
    setYaHablo(true)
    // Solo bajamos al calendario si de verdad conversó
    if (turnos.length > 1) {
      setTimeout(() => {
        document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 400)
    }
  }

  const agendar = async () => {
    if (!elegido) return
    setErrorCita('')
    setAgendando(true)
    try {
      const r = await fetch('/api/demo/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...elegido, nota: leerCookie('ml_demo_nota') }),
      })
      const cuerpo = await r.json()
      if (!r.ok) { setErrorCita(cuerpo?.error || 'No pudimos agendar. Intenta de nuevo.'); return }
      setConfirmada(elegido)
    } catch {
      setErrorCita('No pudimos conectar. Revisa tu internet e intenta otra vez.')
    } finally {
      setAgendando(false)
    }
  }

  const fechaLegible = (f: string) =>
    new Date(f + 'T12:00:00').toLocaleDateString('es-MX', {
      weekday: 'long', day: 'numeric', month: 'long',
    })

  return (
    <>
      {/* Gracias + la demo */}
      <section className="relative overflow-hidden bg-crema pb-16 pt-36">
        <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-naranja/10" />
        <div className="pointer-events-none absolute -left-24 top-72 h-64 w-64 rounded-full bg-azul-medio/10" />

        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="mx-auto mb-7 grid h-20 w-20 place-items-center rounded-full bg-naranja/15">
              <Check size={38} strokeWidth={3} className="text-naranja" />
            </div>
            <h1 className="text-4xl font-black leading-[1.08] text-azul-oscuro md:text-5xl">
              ¡Gracias{nombre ? `, ${nombre}` : ''}
              <br />
              <span className="text-naranja">por tu interés!</span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-azul-oscuro/60">
              Hemos recibido tus datos correctamente. Muy pronto uno de nuestros especialistas se
              pondrá en contacto contigo.
            </p>
          </motion.div>

          {/* Tarjeta de la demo */}
          <motion.div
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mx-auto mt-12 max-w-2xl rounded-3xl bg-naranja/10 p-7 md:p-10"
          >
            {!llamada && (
              <div className="text-center">
                <span className="mb-4 inline-block rounded-full bg-naranja/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-naranja-dark">
                  Mientras tanto
                </span>

                <h2 className="text-2xl font-black text-azul-oscuro md:text-3xl">
                  {yaHablo ? '¿Qué te pareció?' : 'Prueba nuestra demo en vivo'}
                </h2>

                <p className="mx-auto mt-4 max-w-lg leading-relaxed text-azul-oscuro/65">
                  {yaHablo ? (
                    <>
                      Eso mismo es lo que instalamos dentro de {empresa || 'tu empresa'}, pero
                      trabajando todos los días y con tu base de prospectos. Si quieres ver cómo se
                      vería en tu operación, aparta tu diagnóstico aquí abajo.
                    </>
                  ) : (
                    <>
                      Habla con Kala, nuestra asistente. Te va a preguntar cómo funciona tu negocio y
                      qué necesitas que haga un agente de voz: vender, cobrar, agendar, dar
                      seguimiento. Con eso se pone en ese papel y te lo demuestra en vivo.
                    </>
                  )}
                </p>

                {errorLlamada && (
                  <p className="mx-auto mt-5 max-w-md rounded-xl bg-white/70 px-4 py-3 text-sm text-naranja-dark">
                    {errorLlamada}
                  </p>
                )}

                <button
                  type="button" onClick={hablar} disabled={preparando}
                  className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full bg-naranja px-8 py-4 text-lg font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-naranja-dark disabled:translate-y-0 disabled:opacity-60"
                >
                  {preparando ? (
                    <><Loader2 size={20} className="animate-spin" /> Preparando…</>
                  ) : (
                    <><Mic size={20} /> {yaHablo ? 'Probar otra vez' : 'Hablar con Kala'} <ArrowRight size={20} /></>
                  )}
                </button>

                <p className="mt-4 text-xs leading-relaxed text-azul-oscuro/45">
                  Es por el navegador: vas a necesitar permitir el micrófono. La conversación se
                  graba con fines de demostración y puedes terminarla cuando quieras.
                </p>
              </div>
            )}

            {llamada && (
              <div className="relative h-[32rem] overflow-hidden rounded-2xl">
                <KalaRetell
                  llamada={llamada}
                  alTerminar={terminarLlamada}
                  titulo="Demo · Cold Caller"
                  nombreAgente="Kala"
                />
              </div>
            )}
          </motion.div>

          {/* Qué sigue */}
          <div className="mx-auto mt-16 max-w-3xl">
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px flex-1 bg-azul-oscuro/10" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-azul-oscuro/45">
                ¿Qué sigue?
              </span>
              <span className="h-px flex-1 bg-azul-oscuro/10" />
            </div>
            <div className="grid gap-7 sm:grid-cols-3">
              {SIGUIENTE.map((paso, i) => (
                <div key={paso.titulo} className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-naranja/10">
                    <paso.icono size={18} className="text-naranja" />
                  </span>
                  <div>
                    <p className="text-lg font-black leading-none text-naranja">{i + 1}.</p>
                    <h3 className="mb-1 mt-1 text-sm font-bold text-azul-oscuro">{paso.titulo}</h3>
                    <p className="text-xs leading-relaxed text-azul-oscuro/55">{paso.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Agendar */}
      <section id="agendar" className="relative overflow-hidden bg-crema pb-24 pt-4">
        <div className="pointer-events-none absolute -right-28 bottom-20 h-80 w-80 rounded-full bg-naranja/10" />

        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-5xl">
            <span className="mb-5 inline-block rounded-full bg-naranja/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-naranja">
              Agenda tu llamada
            </span>
            <h2 className="text-4xl font-black leading-[1.05] text-azul-oscuro md:text-5xl">
              Hablemos sobre
              <br />
              <span className="text-naranja">tu negocio</span>
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-azul-oscuro/60">
              Agenda una llamada con uno de nuestros especialistas y descubre cómo podemos ayudarte
              a generar más clientes con inteligencia artificial.
            </p>

            <div className="mt-10 grid gap-8 rounded-3xl bg-white p-6 shadow-xl shadow-azul-oscuro/5 md:p-8 lg:grid-cols-[300px_1fr]">
              {/* Columna izquierda */}
              <div className="lg:border-r lg:border-azul-oscuro/10 lg:pr-8">
                <div className="mb-6 flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-naranja/10">
                    <CalendarDays size={20} className="text-naranja" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold leading-tight text-azul-oscuro">
                      Llamada de diagnóstico
                    </h3>
                    <p className="text-sm text-azul-oscuro/50">30 minutos</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {DETALLES.map((d) => (
                    <div key={d.titulo} className="flex gap-3">
                      <d.icono size={18} className="mt-0.5 shrink-0 text-azul-oscuro/35" />
                      <div>
                        <p className="text-sm font-bold text-azul-oscuro">{d.titulo}</p>
                        <p className="text-xs leading-relaxed text-azul-oscuro/55">{d.texto}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 border-t border-azul-oscuro/10 pt-6">
                  <h4 className="mb-4 text-sm font-bold text-azul-oscuro">Qué veremos en la llamada:</h4>
                  <ul className="space-y-3">
                    {EN_LA_LLAMADA.map((t) => (
                      <li key={t} className="flex items-start gap-2.5">
                        <CircleCheck size={17} className="mt-0.5 shrink-0 text-naranja" />
                        <span className="text-sm leading-snug text-azul-oscuro/70">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Calendario o confirmación */}
              <div>
                {confirmada ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex h-full min-h-[22rem] flex-col items-center justify-center text-center"
                  >
                    <PartyPopper size={44} className="mb-4 text-naranja" />
                    <h3 className="mb-2 text-xl font-bold text-azul-oscuro">Cita confirmada</h3>
                    <p className="mb-1 text-lg font-semibold capitalize text-naranja">
                      {fechaLegible(confirmada.fecha)}
                    </p>
                    <p className="mb-5 text-2xl font-black text-azul-oscuro">{confirmada.hora} h</p>
                    <p className="max-w-xs text-sm leading-relaxed text-azul-oscuro/55">
                      Te acabamos de mandar la confirmación por correo, con la liga de Google Meet.
                      Nos vemos.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <Calendario valor={elegido} alElegir={setElegido} />

                    {errorCita && (
                      <p className="mt-5 rounded-xl bg-naranja/10 px-4 py-3 text-sm text-naranja-dark">
                        {errorCita}
                      </p>
                    )}

                    {elegido && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                        <p className="mb-3 text-sm text-azul-oscuro/70">
                          Tu cita quedaría el{' '}
                          <strong className="capitalize text-azul-oscuro">{fechaLegible(elegido.fecha)}</strong> a
                          las <strong className="text-azul-oscuro">{elegido.hora}</strong>, hora de Ciudad de México.
                        </p>
                        <button
                          type="button" onClick={agendar} disabled={agendando}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-naranja px-6 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-naranja-dark disabled:translate-y-0 disabled:opacity-60"
                        >
                          {agendando ? (
                            <><Loader2 size={18} className="animate-spin" /> Confirmando…</>
                          ) : (
                            <>Confirmar mi cita <ArrowRight size={18} /></>
                          )}
                        </button>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-azul-oscuro/40">
              ¿Prefieres escribirnos? comercial@markalab.com.mx
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
