'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Send, X, MessageSquare, RotateCcw } from 'lucide-react'

/* ------------------------------------------------------------------ *
 * Tipos y constantes
 * ------------------------------------------------------------------ */

type Autor = 'agente' | 'persona'

interface Mensaje {
  id: string
  autor: Autor
  texto: string
}

const SUGERENCIAS_CLIENTE = [
  '¿Cómo va mi proyecto?',
  '¿Qué entregables tengo listos?',
  '¿Qué falta de mi parte?',
]

const CLAVE_SESION = 'markalab_chat_sesion'
const CLAVE_TOKEN = 'markalab_chat_token'
const CLAVE_HISTORIAL = 'markalab_chat_historial'
const LIMITE_CARACTERES = 500
const MENSAJES_DE_CONTEXTO = 12

const SALUDO =
  'Hola, soy el asistente de MarkaLab. Puedo explicarte qué hacemos, entender tu reto comercial y agendarte un diagnóstico sin costo. ¿Qué vendes y qué te está frenando hoy?'

const SALUDO_CLIENTE =
  'Hola, soy el asistente de MarkaLab. Puedo decirte cómo va tu proyecto, enviarte tus entregables o registrar una solicitud de cambio. ¿Qué necesitas?'

const SUGERENCIAS = [
  '¿Qué servicios ofrecen?',
  'Necesito más clientes',
  'Quiero agendar un diagnóstico',
]

function nuevoId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function nuevaSesion() {
  return `web_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

/* ------------------------------------------------------------------ *
 * Componente
 * ------------------------------------------------------------------ */

export default function ChatAgente() {
  const sinMovimiento = useReducedMotion()

  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [borrador, setBorrador] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [noLeidos, setNoLeidos] = useState(false)

  const sesionRef = useRef<string>('')
  const tokenRef = useRef<string>('')
  const [esCliente, setEsCliente] = useState(false)
  const finRef = useRef<HTMLDivElement>(null)
  const campoRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  /* -------- Sesión e historial persistidos en la pestaña -------- */

  useEffect(() => {
    let sesion = sessionStorage.getItem(CLAVE_SESION)
    if (!sesion) {
      sesion = nuevaSesion()
      sessionStorage.setItem(CLAVE_SESION, sesion)
    }
    sesionRef.current = sesion

    // Enlace privado del cliente: markalab.com.mx/?t=TOKEN
    // Se guarda en la pestaña y se limpia de la URL para que no quede en el historial
    const params = new URLSearchParams(window.location.search)
    const tokenUrl = params.get('t') || params.get('token')
    if (tokenUrl && tokenUrl.length >= 16) {
      sessionStorage.setItem(CLAVE_TOKEN, tokenUrl)
      params.delete('t')
      params.delete('token')
      const limpia = window.location.pathname + (params.toString() ? `?${params}` : '')
      window.history.replaceState({}, '', limpia)
    }
    tokenRef.current = sessionStorage.getItem(CLAVE_TOKEN) || ''

    const guardado = sessionStorage.getItem(CLAVE_HISTORIAL)
    if (guardado) {
      try {
        const previos = JSON.parse(guardado) as Mensaje[]
        if (Array.isArray(previos) && previos.length) {
          setMensajes(previos)
          return
        }
      } catch {
        sessionStorage.removeItem(CLAVE_HISTORIAL)
      }
    }
    const conToken = !!tokenRef.current
    setMensajes([
      {
        id: nuevoId(),
        autor: 'agente',
        texto: conToken ? SALUDO_CLIENTE : SALUDO,
      },
    ])
  }, [])

  useEffect(() => {
    if (mensajes.length) {
      sessionStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(mensajes.slice(-40)))
    }
  }, [mensajes])

  /* -------- Scroll, foco y tecla Escape -------- */

  useEffect(() => {
    if (abierto) finRef.current?.scrollIntoView({ behavior: sinMovimiento ? 'auto' : 'smooth' })
  }, [mensajes, escribiendo, abierto, sinMovimiento])

  useEffect(() => {
    if (abierto) {
      setNoLeidos(false)
      const t = setTimeout(() => campoRef.current?.focus(), 250)
      return () => clearTimeout(t)
    }
  }, [abierto])

  useEffect(() => {
    if (!abierto) return
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [abierto])

  /* -------- Envío -------- */

  const enviar = useCallback(
    async (textoCrudo: string) => {
      const texto = textoCrudo.trim().slice(0, LIMITE_CARACTERES)
      if (!texto || escribiendo) return

      setError(null)
      setBorrador('')

      const propio: Mensaje = { id: nuevoId(), autor: 'persona', texto }
      const conElPropio = [...mensajes, propio]
      setMensajes(conElPropio)
      setEscribiendo(true)

      const contexto = conElPropio.slice(-MENSAJES_DE_CONTEXTO).map((m) => ({
        rol: m.autor === 'persona' ? 'user' : 'assistant',
        texto: m.texto,
      }))

      try {
        const controlador = new AbortController()
        const limite = setTimeout(() => controlador.abort(), 45000)

        const respuesta = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sesionRef.current,
            mensaje: texto,
            historial: contexto,
            token: tokenRef.current || undefined,
            pagina: window.location.pathname,
          }),
          signal: controlador.signal,
        })

        clearTimeout(limite)

        if (!respuesta.ok) {
          const cuerpo = await respuesta.json().catch(() => ({}))
          throw new Error(cuerpo?.error || 'fallo')
        }

        const datos = await respuesta.json()
        if (datos?.rol === 'cliente') setEsCliente(true)
        const globos: string[] = Array.isArray(datos?.mensajes) ? datos.mensajes : []

        if (!globos.length) throw new Error('vacio')

        for (let i = 0; i < globos.length; i++) {
          if (i > 0) await new Promise((r) => setTimeout(r, 700))
          setMensajes((previos) => [
            ...previos,
            { id: nuevoId(), autor: 'agente', texto: globos[i] },
          ])
        }

        if (!abierto) setNoLeidos(true)
      } catch (e) {
        const abortado = e instanceof DOMException && e.name === 'AbortError'
        setError(
          abortado
            ? 'La respuesta tardó demasiado. Escríbenos a comercial@markalab.com.mx y te contactamos hoy mismo.'
            : 'No pude conectar con el asistente. Intenta de nuevo o escríbenos a comercial@markalab.com.mx.'
        )
      } finally {
        setEscribiendo(false)
      }
    },
    [mensajes, escribiendo, abierto]
  )

  const reiniciar = () => {
    sessionStorage.removeItem(CLAVE_HISTORIAL)
    // El token se conserva: reiniciar la charla no debe desautenticar al cliente
    sesionRef.current = nuevaSesion()
    sessionStorage.setItem(CLAVE_SESION, sesionRef.current)
    setMensajes([{
      id: nuevoId(), autor: 'agente',
      texto: tokenRef.current ? SALUDO_CLIENTE : SALUDO,
    }])
    setError(null)
  }

  const mostrarSugerencias = mensajes.length <= 1 && !escribiendo

  /* ------------------------------------------------------------------ *
   * Render
   * ------------------------------------------------------------------ */

  return (
    <>
      {/* Lanzador */}
      <motion.button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label={abierto ? 'Cerrar el asistente de MarkaLab' : 'Abrir el asistente de MarkaLab'}
        aria-expanded={abierto}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          sinMovimiento
            ? { duration: 0 }
            : { delay: 1.2, type: 'spring', stiffness: 260, damping: 20 }
        }
        whileHover={sinMovimiento ? undefined : { scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#E8621A] text-white shadow-lg shadow-[#E8621A]/40 outline-none transition-shadow hover:shadow-xl hover:shadow-[#E8621A]/50 focus-visible:ring-4 focus-visible:ring-[#1E2A4A]/30"
      >
        <AnimatePresence mode="wait" initial={false}>
          {abierto ? (
            <motion.span
              key="cerrar"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6" strokeWidth={2.4} />
            </motion.span>
          ) : (
            <motion.span
              key="abrir"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageSquare className="h-6 w-6" strokeWidth={2.2} />
            </motion.span>
          )}
        </AnimatePresence>

        {noLeidos && !abierto && (
          <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-[#F0EBE3] bg-[#4A7CC7]" />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {abierto && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label="Asistente de MarkaLab"
            initial={sinMovimiento ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={sinMovimiento ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 top-0 z-[59] flex flex-col overflow-hidden bg-[#F0EBE3] sm:inset-auto sm:bottom-24 sm:right-6 sm:top-auto sm:h-[600px] sm:max-h-[calc(100vh-8rem)] sm:w-[400px] sm:rounded-3xl sm:shadow-2xl sm:shadow-[#1E2A4A]/25"
          >
            {/* Encabezado */}
            <header className="relative shrink-0 bg-[#1E2A4A] px-5 pb-5 pt-5 sm:pt-6">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[#E8621A]/15"
              />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-bold leading-tight text-white">
                    Asistente de MarkaLab
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-white/60">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
                    {esCliente ? 'Sesión verificada' : 'Responde al momento'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={reiniciar}
                    aria-label="Empezar una conversación nueva"
                    className="rounded-full p-2 text-white/50 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAbierto(false)}
                    aria-label="Cerrar el asistente"
                    className="rounded-full p-2 text-white/50 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/50 sm:hidden"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </header>

            {/* Conversación */}
            <div className="flex-1 overflow-y-auto px-4 py-5">
              <div className="flex flex-col gap-3">
                {mensajes.map((m) => (
                  <Globo key={m.id} autor={m.autor} texto={m.texto} sinMovimiento={!!sinMovimiento} />
                ))}

                {escribiendo && <Puntos />}

                {error && (
                  <p className="mx-auto max-w-[90%] rounded-xl bg-[#E8621A]/10 px-3 py-2 text-center text-xs leading-relaxed text-[#1E2A4A]">
                    {error}
                  </p>
                )}

                {mostrarSugerencias && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(tokenRef.current ? SUGERENCIAS_CLIENTE : SUGERENCIAS).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => enviar(s)}
                        className="rounded-full border border-[#1E2A4A]/15 bg-white px-3 py-1.5 text-xs font-medium text-[#1E2A4A] outline-none transition-colors hover:border-[#E8621A] hover:text-[#E8621A] focus-visible:ring-2 focus-visible:ring-[#E8621A]/40"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={finRef} />
              </div>
            </div>

            {/* Redacción */}
            <div className="shrink-0 border-t border-[#1E2A4A]/10 bg-white px-4 pb-4 pt-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={campoRef}
                  rows={1}
                  value={borrador}
                  maxLength={LIMITE_CARACTERES}
                  onChange={(e) => {
                    setBorrador(e.target.value)
                    e.target.style.height = 'auto'
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 110)}px`
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      enviar(borrador)
                    }
                  }}
                  placeholder="Escribe tu mensaje"
                  aria-label="Escribe tu mensaje"
                  className="max-h-[110px] flex-1 resize-none rounded-2xl border border-[#1E2A4A]/15 bg-[#F0EBE3]/60 px-4 py-2.5 text-sm text-[#1E2A4A] outline-none transition-colors placeholder:text-[#1E2A4A]/40 focus:border-[#E8621A] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => enviar(borrador)}
                  disabled={!borrador.trim() || escribiendo}
                  aria-label="Enviar mensaje"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8621A] text-white outline-none transition-all hover:bg-[#C4511A] focus-visible:ring-4 focus-visible:ring-[#E8621A]/30 disabled:cursor-not-allowed disabled:bg-[#1E2A4A]/20"
                >
                  <Send className="h-4 w-4" strokeWidth={2.4} />
                </button>
              </div>

              <p className="mt-2.5 text-center text-[11px] leading-snug text-[#1E2A4A]/45">
                Al continuar aceptas que usemos tus datos para contactarte.{' '}
                <a
                  href="/aviso-de-privacidad"
                  className="underline decoration-[#1E2A4A]/25 underline-offset-2 hover:text-[#E8621A]"
                >
                  Aviso de privacidad
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ------------------------------------------------------------------ *
 * Subcomponentes
 * ------------------------------------------------------------------ */

function Globo({
  autor,
  texto,
  sinMovimiento,
}: {
  autor: Autor
  texto: string
  sinMovimiento: boolean
}) {
  const esPersona = autor === 'persona'

  return (
    <motion.div
      initial={sinMovimiento ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={esPersona ? 'flex justify-end' : 'flex justify-start'}
    >
      <div
        className={
          esPersona
            ? 'max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-[#1E2A4A] px-4 py-2.5 text-sm leading-relaxed text-white'
            : 'max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-bl-md border border-[#1E2A4A]/8 bg-white px-4 py-2.5 text-sm leading-relaxed text-[#1E2A4A]'
        }
      >
        {texto}
      </div>
    </motion.div>
  )
}

function Puntos() {
  return (
    <div className="flex justify-start" aria-live="polite" aria-label="El asistente está escribiendo">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-[#1E2A4A]/8 bg-white px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-[#E8621A]"
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>
    </div>
  )
}
