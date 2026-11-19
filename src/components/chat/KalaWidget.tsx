'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Kala from './KalaAvatar'
import KalaVoz, { prepararVoz, vozDisponible } from './KalaVoz'
import dynamic from 'next/dynamic'
import type { WebCallSession } from 'retell-client-js-sdk'
import type { TurnoVoz } from './KalaRetell'

// El SDK de Retell pesa ~540 KB: solo se descarga cuando alguien abre el chat,
// no en cada pagina del sitio.
const KalaRetell = dynamic(() => import('./KalaRetell'), { ssr: false })
const cargarRetell = () => import('./KalaRetell')
const RETELL_CONFIGURADO = !!process.env.NEXT_PUBLIC_RETELL_PUBLIC_KEY && !!process.env.NEXT_PUBLIC_RETELL_AGENT_ID

/* ------------------------------------------------------------------ */
/*  Configuración                                                      */
/*  Sin NEXT_PUBLIC_KALA_ENDPOINT el widget no se monta: preferimos    */
/*  que no aparezca a que aparezca roto.                               */
/* ------------------------------------------------------------------ */
const ENDPOINT = process.env.NEXT_PUBLIC_KALA_ENDPOINT || ''
const TOKEN_SITIO = process.env.NEXT_PUBLIC_KALA_TOKEN || ''

const SALUDO = [
  'Hola, soy Kala, del equipo de MarkaLab.',
  'Si tienes cualquier duda mientras navegas, escríbeme. Y si quieres, te ayudo a ver qué le serviría a tu negocio.',
]

const ESPERA_SALUDO = 2200
const ESPERA_RECORDATORIO = 22000
// Un turno que genera y envia la propuesta tarda cerca de un minuto. Cortar antes
// hace que la persona vea un error aunque todo haya salido bien en el servidor.
const TIEMPO_LIMITE = 120000
// Si pasa de esto, Kala avisa que sigue trabajando para que no parezca colgada.
const AVISO_ESPERA = 9000

type Quien = 'kala' | 'persona' | 'error'
type Mensaje = { id: number; texto: string; quien: Quien }
type Turno = { rol: 'user' | 'assistant'; texto: string }

/* ------------------------------------------------------------------ */
/*  Widget                                                             */
/* ------------------------------------------------------------------ */
export default function KalaWidget() {
  const [abierto, setAbierto] = useState(false)
  const [mostrando, setMostrando] = useState(false)
  const [asomando, setAsomando] = useState(false)
  const [pendiente, setPendiente] = useState(false)
  const [saludoTexto, setSaludoTexto] = useState('¡Hola! Soy Kala 👋')
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [escribiendo, setEscribiendo] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [borrador, setBorrador] = useState('')
  const [verificada, setVerificada] = useState(false)
  const [vozActiva, setVozActiva] = useState(false)
  const [conVoz, setConVoz] = useState(false)
  const [llamada, setLlamada] = useState<WebCallSession | null>(null)
  const usaRetell = useRef(false)
  const moduloRetell = useRef<Awaited<ReturnType<typeof cargarRetell>> | null>(null)

  // el boton de microfono solo existe si el navegador puede grabar y hay endpoint de voz
  // Retell si esta configurado; si no, el modo voz por n8n; si ninguno, sin microfono
  useEffect(() => {
    usaRetell.current = RETELL_CONFIGURADO && !!navigator.mediaDevices?.getUserMedia
    setConVoz(usaRetell.current || vozDisponible())
  }, [])
  const [esperaLarga, setEsperaLarga] = useState(false)

  const hilo = useRef<HTMLDivElement>(null)
  const campo = useRef<HTMLTextAreaElement>(null)
  const boton = useRef<HTMLButtonElement>(null)
  const ojos = useRef<HTMLDivElement>(null)      // cabeza (chat cerrado)
  const cuerpo = useRef<HTMLDivElement>(null)    // cuerpo completo (chat abierto)

  const historial = useRef<Turno[]>([])
  const interactuo = useRef(false)
  const descartado = useRef(false)
  const arrancado = useRef(false)
  const contador = useRef(0)
  const sesion = useRef('')
  const tokenCliente = useRef('')

  /* --- sesión y token del cliente --- */
  useEffect(() => {
    const leer = (k: string) => { try { return sessionStorage.getItem(k) } catch { return null } }
    const guardar = (k: string, v: string) => { try { sessionStorage.setItem(k, v) } catch {} }

    let s = leer('kala_sesion')
    if (!s) {
      s = `web_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      guardar('kala_sesion', s)
    }
    sesion.current = s

    try {
      const t = new URLSearchParams(window.location.search).get('t')
      if (t) { tokenCliente.current = t; guardar('kala_token', t) }
      else { tokenCliente.current = leer('kala_token') || '' }
    } catch {}
  }, [])

  /* --- saludo y recordatorio único --- */
  useEffect(() => {
    const a = setTimeout(() => {
      if (!descartado.current && !abierto) setMostrando(true)
    }, ESPERA_SALUDO)

    const b = setTimeout(() => {
      if (interactuo.current || descartado.current) return
      setAsomando(true); setPendiente(true)
      setSaludoTexto('¿Te ayudo a ver por dónde empezar?')
      setMostrando(true)
      setTimeout(() => setAsomando(false), 1600)
    }, ESPERA_RECORDATORIO)

    return () => { clearTimeout(a); clearTimeout(b) }
    // se arma una sola vez a propósito
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* --- Kala sigue el cursor ---
     Cerrado: la cabeza. Abierto: el cuerpo completo (escritorio).
     Se escriben --kx / --ky (-1..1) y el CSS hace el resto. */
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(pointer:fine)').matches) return

    let cuadro = 0
    let ultimo: MouseEvent | null = null
    const fijar = (fig: HTMLDivElement | null, x: number, y: number) => {
      if (!fig) return
      fig.style.setProperty('--kx', x.toFixed(3))
      fig.style.setProperty('--ky', y.toFixed(3))
    }
    const pintar = () => {
      cuadro = 0
      const e = ultimo
      const fig = abierto ? cuerpo.current : ojos.current
      if (!e || !fig) return
      const c = fig.getBoundingClientRect()
      if (!c.width) return
      // punto de referencia: el centro del visor
      const dx = e.clientX - (c.left + c.width * (abierto ? 0.43 : 0.5))
      const dy = e.clientY - (c.top + c.height * (abierto ? 0.21 : 0.56))
      const d = Math.hypot(dx, dy) || 1
      const t = Math.min(d, 340) / 340
      fijar(fig, (dx / d) * t, (dy / d) * t)
    }
    const mover = (e: MouseEvent) => {
      ultimo = e
      if (!cuadro) cuadro = requestAnimationFrame(pintar)
    }
    const salir = () => { fijar(ojos.current, 0, 0); fijar(cuerpo.current, 0, 0) }

    window.addEventListener('mousemove', mover, { passive: true })
    document.documentElement.addEventListener('mouseleave', salir)
    return () => {
      cancelAnimationFrame(cuadro)
      window.removeEventListener('mousemove', mover)
      document.documentElement.removeEventListener('mouseleave', salir)
    }
  }, [abierto])

  useEffect(() => {
    if (hilo.current) hilo.current.scrollTop = hilo.current.scrollHeight
  }, [mensajes, escribiendo])

  const agregar = useCallback((texto: string, quien: Quien) => {
    contador.current += 1
    const id = contador.current
    setMensajes((m) => [...m, { id, texto, quien }])
  }, [])

  /* Los globos salen escalonados: de golpe se leen como un muro de texto. */
  const pintarSecuencia = useCallback((lista: string[]) => {
    const quieto = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    lista.forEach((texto, i) => {
      setTimeout(() => {
        if (i > 0) setEscribiendo(false)
        agregar(texto, 'kala')
        historial.current.push({ rol: 'assistant', texto })
        if (i + 1 < lista.length) setEscribiendo(true)
      }, quieto ? i * 40 : i * 640)
    })
  }, [agregar])

  /* --- envío --- */
  const enviar = useCallback(async () => {
    const texto = borrador.trim()
    if (!texto || ocupado) return

    agregar(texto, 'persona')
    historial.current.push({ rol: 'user', texto })
    setBorrador('')
    if (campo.current) campo.current.style.height = 'auto'
    setOcupado(true); setEscribiendo(true)

    const corte = new AbortController()
    const reloj = setTimeout(() => corte.abort(), TIEMPO_LIMITE)
    const avisoEspera = setTimeout(() => setEsperaLarga(true), AVISO_ESPERA)

    try {
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-markalab-token': TOKEN_SITIO },
        body: JSON.stringify({
          session_id: sesion.current,
          mensaje: texto,
          token: tokenCliente.current,
          pagina: window.location.pathname,
          historial: historial.current.slice(-12),
        }),
        signal: corte.signal,
      })
      clearTimeout(reloj); clearTimeout(avisoEspera); setEsperaLarga(false)
      if (r.status === 401) throw new Error('no_autorizado')
      if (!r.ok) throw new Error(`http_${r.status}`)

      const d = await r.json()
      setEscribiendo(false)
      if (d?.rol === 'cliente') setVerificada(true)

      const lista: string[] = Array.isArray(d?.mensajes) ? d.mensajes.filter(Boolean) : []
      if (lista.length) pintarSecuencia(lista)
      else agregar('Perdón, se me trabó la respuesta. ¿Me lo pides otra vez?', 'kala')
    } catch (e) {
      clearTimeout(reloj); clearTimeout(avisoEspera); setEsperaLarga(false)
      setEscribiendo(false)
      const err = e as Error
      agregar(
        err.message === 'no_autorizado'
          ? 'No pude verificar esta sesión. Recarga la página e inténtalo de nuevo.'
          : err.name === 'AbortError'
            // Se agoto el tiempo, pero el servidor pudo haber terminado. No decir
            // que fallo algo que probablemente si ocurrio.
            ? 'Esto se está tardando más de lo normal. Si te iba a mandar algo por correo, revisa tu bandeja en unos minutos; si no te llega, escríbeme de nuevo.'
            : 'No pude conectar. Revisa tu conexión e inténtalo otra vez.',
        err.name === 'AbortError' ? 'kala' : 'error',
      )
    } finally {
      setOcupado(false)
      setTimeout(() => campo.current?.focus(), 60)
    }
  }, [borrador, ocupado, agregar, pintarSecuencia])

  /* --- modo voz --- */
  useEffect(() => {
    if (abierto && usaRetell.current && !moduloRetell.current) {
      cargarRetell().then((m) => { moduloRetell.current = m }).catch(() => {})
    }
  }, [abierto])

  const alPersonaVoz = useCallback((texto: string) => {
    agregar(texto, 'persona'); historial.current.push({ rol: 'user', texto })
  }, [agregar])

  const alKalaVoz = useCallback((mensajes: string[], rol?: string) => {
    for (const m of mensajes) { agregar(m, 'kala'); historial.current.push({ rol: 'assistant', texto: m }) }
    if (rol === 'cliente') setVerificada(true)
  }, [agregar])

  const activarVoz = useCallback(() => {
    interactuo.current = true
    if (usaRetell.current) {
      // la llamada se abre dentro del toque: asi el navegador permite microfono y audio.
      // El modulo ya se precargo al abrir el chat; si aun no llega, se espera.
      const abrir = (m: Awaited<ReturnType<typeof cargarRetell>>) => {
        try { setLlamada(m.abrirLlamada(sesion.current, tokenCliente.current)) }
        catch { agregar('No pude abrir la llamada. Seguimos por escrito.', 'error') }
      }
      if (moduloRetell.current) abrir(moduloRetell.current)
      else cargarRetell().then((m) => { moduloRetell.current = m; abrir(m) })
        .catch(() => agregar('No pude abrir la llamada. Seguimos por escrito.', 'error'))
      return
    }
    prepararVoz()
    setVozActiva(true)
  }, [agregar])

  // Al colgar, lo que se habló queda escrito en el chat y en el historial
  const terminarLlamada = useCallback((turnos: TurnoVoz[]) => {
    for (const t of turnos) {
      if (!t.texto.trim()) continue
      agregar(t.texto, t.rol === 'user' ? 'persona' : 'kala')
      historial.current.push({ rol: t.rol === 'user' ? 'user' : 'assistant', texto: t.texto })
    }
    setLlamada(null)
    setTimeout(() => campo.current?.focus(), 60)
  }, [agregar])

  const alternar = useCallback(() => {
    interactuo.current = true
    setAbierto((prev) => {
      const nuevo = !prev
      setMostrando(false); setPendiente(false)
      if (nuevo) {
        ojos.current?.style.setProperty('--kx', '0')
        ojos.current?.style.setProperty('--ky', '0')
        if (!arrancado.current) {
          arrancado.current = true
          pintarSecuencia(SALUDO)
        }
        setTimeout(() => campo.current?.focus(), 320)
      } else {
        setVozActiva(false)
        setLlamada((l) => { l?.end().catch(() => {}); return null })
        setTimeout(() => boton.current?.focus(), 60)
      }
      return nuevo
    })
  }, [pintarSecuencia])

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (vozActiva) { setVozActiva(false); return }
      if (llamada) { llamada.end().catch(() => {}); return }
      if (abierto) alternar()
    }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [abierto, alternar, vozActiva, llamada])

  if (!ENDPOINT) return null

  return (
    <>
      {/* ---------- panel ---------- */}
      <div
        role="dialog"
        aria-labelledby="kala-titulo"
        className={[
          'fixed z-[60] flex flex-col overflow-hidden bg-white font-sans',
          'right-6 bottom-[6.5rem] w-[min(23.5rem,calc(100vw-3rem))] h-[min(33rem,calc(100vh-11rem))]',
          'rounded-[20px] shadow-[0_24px_60px_rgba(30,42,74,0.28)]',
          'origin-bottom-right transition-[opacity,transform] duration-300 ease-out',
          'max-[520px]:inset-x-0 max-[520px]:bottom-0 max-[520px]:h-[100dvh] max-[520px]:w-full max-[520px]:rounded-none',
          abierto ? 'pointer-events-auto opacity-100 translate-y-0 scale-100'
                  : 'pointer-events-none opacity-0 translate-y-4 scale-[0.97]',
        ].join(' ')}
      >
        <div className="flex shrink-0 items-center gap-3 bg-[#1E2A4A] px-5 py-4 pt-[calc(1rem+env(safe-area-inset-top,0px))]">
          <Kala className="w-12 shrink-0" />
          <div className="min-w-0">
            <h2 id="kala-titulo" className="m-0 text-base font-bold tracking-tight text-white">Kala</h2>
            <p className="m-0 mt-0.5 flex items-center gap-1.5 text-xs text-white/60">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#37D67A]" />
              {verificada ? 'Sesión verificada' : 'Asistente de MarkaLab'}
            </p>
          </div>
          <button
            type="button" onClick={alternar} aria-label="Cerrar el chat"
            className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-white/10 text-xl leading-none text-white transition-colors hover:bg-white/20"
          >×</button>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={hilo} role="log" aria-live="polite" aria-relevant="additions"
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto bg-[#F0EBE3] p-5 [overscroll-behavior:contain]"
        >
          {/* en pantallas chicas el cuerpo completo vive dentro del chat */}
          <div className="kala-flota-lenta mx-auto mb-1 w-28 shrink-0 lg:hidden [@media(max-height:600px)]:w-20">
            <Kala cuerpo detallada />
          </div>
          {mensajes.map((m) => (
            <div
              key={m.id}
              className={[
                'kala-globo max-w-[86%] rounded-2xl px-4 py-3 text-[0.93rem] leading-relaxed [overflow-wrap:anywhere]',
                m.quien === 'persona'
                  ? 'self-end rounded-br-md bg-[#1E2A4A] text-white'
                  : m.quien === 'error'
                    ? 'self-start rounded-bl-md bg-[#FDECE6] text-[#9B3412]'
                    : 'self-start rounded-bl-md bg-white text-[#1E2A4A] shadow-[0_1px_3px_rgba(30,42,74,0.07)]',
              ].join(' ')}
            >
              {m.texto}
            </div>
          ))}

          {escribiendo && (
            <div
              className="flex items-center gap-1 self-start rounded-2xl rounded-bl-md bg-white px-4 py-3.5 shadow-[0_1px_3px_rgba(30,42,74,0.07)]"
              aria-label="Kala está escribiendo"
            >
              <i className="kala-pt h-1.5 w-1.5 rounded-full bg-[#9FA8B8]" />
              <i className="kala-pt h-1.5 w-1.5 rounded-full bg-[#9FA8B8]" style={{ animationDelay: '.18s' }} />
              <i className="kala-pt h-1.5 w-1.5 rounded-full bg-[#9FA8B8]" style={{ animationDelay: '.36s' }} />
            </div>
          )}

          {escribiendo && esperaLarga && (
            <p className="kala-globo -mt-1 self-start px-1 text-xs text-[#1E2A4A]/55">
              Sigo trabajando en esto, dame un momento…
            </p>
          )}
        </div>

        <div className="shrink-0 border-t border-[#E4DED4] bg-white px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
          <div className="flex items-end gap-2">
            <label className="sr-only" htmlFor="kala-campo">Escribe tu mensaje</label>
            <textarea
              id="kala-campo" ref={campo} rows={1} maxLength={500} disabled={ocupado}
              placeholder="Escribe tu mensaje" value={borrador}
              onChange={(e) => {
                setBorrador(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = `${Math.min(e.target.scrollHeight, 104)}px`
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() }
              }}
              className="max-h-[6.5rem] flex-1 resize-none rounded-[22px] border-[1.5px] border-[#E4DED4] px-4 py-2.5 text-[0.93rem] leading-snug text-[#1E2A4A] outline-none transition-colors placeholder:text-[#A8A29A] focus:border-[#E8621A] disabled:opacity-60"
            />
            {conVoz && (
              <button
                type="button" onClick={activarVoz} disabled={ocupado || !!llamada}
                aria-label="Hablar con Kala por voz"
                title="Hablar con Kala"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-[1.5px] border-[#E4DED4] text-[#1E2A4A] transition-[colors,transform] hover:border-[#E8621A] hover:text-[#E8621A] active:scale-95 disabled:opacity-35"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden="true">
                  <rect x="9" y="2" width="6" height="12" rx="3" />
                  <path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" />
                </svg>
              </button>
            )}
            <button
              type="button" onClick={enviar} disabled={ocupado || !borrador.trim()}
              aria-label="Enviar mensaje"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#E8621A] text-white transition-[opacity,transform] active:scale-95 disabled:cursor-default disabled:opacity-35"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
                <path d="M2.5 21 23 12 2.5 3 2.5 10l14 2-14 2z" />
              </svg>
            </button>
          </div>
          <p className="mt-2 px-1 text-center text-[0.7rem] leading-snug text-[#9A948C]">
            Al continuar aceptas que usemos tus datos para contactarte.{' '}
            <a href="/aviso-de-privacidad" className="underline hover:text-[#E8621A]">Aviso de privacidad</a>
          </p>
        </div>

        {llamada && <KalaRetell llamada={llamada} alTerminar={terminarLlamada} />}

        {vozActiva && (
          <KalaVoz
            sesion={sesion.current}
            token={tokenCliente.current}
            obtenerHistorial={() => historial.current}
            alPersona={alPersonaVoz}
            alKala={alKalaVoz}
            alTerminar={() => { setVozActiva(false); setTimeout(() => campo.current?.focus(), 60) }}
          />
        )}
        </div>
      </div>

      {/* ---------- Kala de cuerpo completo (escritorio, chat abierto) ---------- */}
      <div
        aria-hidden="true"
        className={[
          'pointer-events-none fixed bottom-[6.5rem] right-[25.25rem] z-[59] hidden w-[16.5rem] lg:block',
          '[@media(max-height:640px)]:!hidden',
          'transition-[opacity,transform] ease-out',
          abierto ? 'translate-x-0 scale-100 opacity-100 delay-150 duration-500'
                  : 'translate-x-8 scale-95 opacity-0 duration-200',
        ].join(' ')}
        style={{ transformOrigin: '100% 100%' }}
      >
        <div className="kala-flota-lenta">
          <Kala cuerpo detallada ojosRef={cuerpo} />
        </div>
        <div className="kala-sombra mx-auto -mt-1 h-3 w-1/2 rounded-[50%] bg-[#1E2A4A]/25 blur-md" />
      </div>

      {/* ---------- botón ---------- */}
      <div
        className={[
          'fixed bottom-6 right-6 z-[60] flex items-center gap-2.5',
          abierto ? 'max-[520px]:hidden' : '',
        ].join(' ')}
      >
        <div
          onClick={alternar}
          className={[
            'kala-saludo relative max-w-[min(60vw,17rem)] cursor-pointer truncate rounded-full bg-[#1E2A4A] px-4 py-2.5',
            'text-[0.94rem] font-semibold text-white shadow-[0_10px_28px_rgba(30,42,74,0.22)]',
            'origin-right transition-[opacity,transform] duration-[420ms] ease-out',
            mostrando && !abierto
              ? 'pointer-events-auto opacity-100 translate-x-0 scale-100'
              : 'pointer-events-none opacity-0 translate-x-3.5 scale-95',
          ].join(' ')}
        >
          <button
            type="button" aria-label="Ocultar saludo"
            onClick={(e) => { e.stopPropagation(); descartado.current = true; interactuo.current = true; setMostrando(false) }}
            className="kala-x absolute -left-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-white text-[13px] leading-none text-[#1E2A4A] opacity-0 shadow-md transition-opacity"
          >×</button>
          {saludoTexto}
        </div>

        <button
          ref={boton} type="button" onClick={alternar}
          aria-expanded={abierto}
          aria-label={abierto ? 'Cerrar el chat con Kala' : 'Abrir el chat con Kala'}
          className={[
            'relative h-[68px] w-[86px] shrink-0 rounded-2xl transition-transform duration-300',
            'hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-[#E8621A]',
            asomando ? 'kala-asomando' : '',
          ].join(' ')}
        >
          <span
            className={[
              'absolute right-1 top-0 z-10 h-[15px] w-[15px] rounded-full border-[2.5px] border-[#F0EBE3] bg-[#E8621A] transition-[opacity,transform] duration-300',
              pendiente && !abierto ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
            ].join(' ')}
            aria-hidden="true"
          />
          {/* chat cerrado: la cabeza de Kala */}
          <span
            className={[
              'absolute inset-0 flex items-end transition-[opacity,transform] duration-300 ease-out',
              abierto ? 'pointer-events-none scale-50 opacity-0' : 'scale-100 opacity-100',
            ].join(' ')}
          >
            <span className="kala-flota block w-full drop-shadow-[0_10px_16px_rgba(30,42,74,0.35)]">
              <Kala detallada prioridad ojosRef={ojos} />
            </span>
          </span>
          {/* chat abierto: cerrar */}
          <span
            aria-hidden="true"
            className={[
              'absolute bottom-0.5 right-0.5 grid h-14 w-14 place-items-center rounded-full bg-[#1E2A4A] text-white',
              'shadow-[0_10px_26px_rgba(30,42,74,0.3)] transition-[opacity,transform] duration-300 ease-out',
              abierto ? 'rotate-0 scale-100 opacity-100' : 'pointer-events-none -rotate-90 scale-50 opacity-0',
            ].join(' ')}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>
      </div>

      <style jsx global>{`
        .kala-globo{ animation:kala-entra .3s cubic-bezier(.2,.9,.3,1) }
        @keyframes kala-entra{ from{opacity:0;transform:translateY(7px)} }

        .kala-pt{ animation:kala-pt 1.3s infinite }
        @keyframes kala-pt{
          0%,60%,100%{opacity:.3;transform:translateY(0)}
          30%{opacity:1;transform:translateY(-3px)}
        }

        .kala-saludo:hover .kala-x, .kala-x:focus-visible{ opacity:1 }

        @media (prefers-reduced-motion:reduce){
          .kala-globo,.kala-pt{ animation:none }
        }
      `}</style>
    </>
  )
}
