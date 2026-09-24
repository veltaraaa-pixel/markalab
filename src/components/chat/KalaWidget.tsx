'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

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
const TIEMPO_LIMITE = 45000

type Quien = 'kala' | 'persona' | 'error'
type Mensaje = { id: number; texto: string; quien: Quien }
type Turno = { rol: 'user' | 'assistant'; texto: string }

/* ------------------------------------------------------------------ */
/*  Avatar                                                             */
/* ------------------------------------------------------------------ */
function Kala({ detallada = false, ojosRef }: { detallada?: boolean; ojosRef?: React.RefObject<SVGGElement> }) {
  const id = detallada ? 'kalaClip' : 'kalaClipMini'
  return (
    <svg viewBox="0 0 200 200" className="block h-full w-full" aria-hidden="true">
      <circle cx="100" cy="100" r="96" fill="#1E2A4A" />
      <circle
        cx="100" cy="100" r="95"
        fill="none" stroke="#E8621A" strokeWidth="7" strokeLinecap="round"
        className={detallada ? 'kala-anillo' : ''}
      />
      <clipPath id={id}><circle cx="100" cy="100" r="92" /></clipPath>
      <g clipPath={`url(#${id})`} className={detallada ? 'kala-cara' : ''}>
        <path d="M40 120c0-45 26-76 60-76s60 31 60 76v96H40z" fill="#1E2A4A" />
        <ellipse cx="100" cy="124" rx="52" ry="63" fill="#F0EBE3" />
        <path d="M58 200c4-20 20-30 42-30s38 10 42 30z" fill="#F0EBE3" />
        <path d="M46 84c9-28 29-43 54-43s45 15 54 43v8H46z" fill="#1E2A4A" />
        {detallada && (
          <>
            <path d="M74 96q26-16 52 0" fill="none" stroke="#1E2A4A" strokeWidth="4" strokeLinecap="round" />
            <path d="M70 62q30-11 60 0" fill="none" stroke="#A8441A" strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="60" cy="86" rx="9" ry="7" fill="#B94F26" transform="rotate(-20 60 86)" />
            <ellipse cx="140" cy="86" rx="9" ry="7" fill="#B94F26" transform="rotate(20 140 86)" />
            <path d="M68 108q11-7 22-1" fill="none" stroke="#B9B3AA" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M110 107q11-6 22 1" fill="none" stroke="#B9B3AA" strokeWidth="2.6" strokeLinecap="round" />
          </>
        )}
        <g ref={ojosRef}>
          <g className={detallada ? 'kala-ojo' : ''}>
            <ellipse cx="76" cy="126" rx="16" ry="10" fill="#E8621A" />
            <circle cx="79" cy="126" r="5.6" fill="#1E2A4A" />
            {detallada && <circle cx="81" cy="123.6" r="1.9" fill="#fff" />}
          </g>
          <g className={detallada ? 'kala-ojo kala-ojo-der' : ''}>
            <ellipse cx="124" cy="126" rx="16" ry="10" fill="#E8621A" />
            <circle cx="127" cy="126" r="5.6" fill="#1E2A4A" />
            {detallada && <circle cx="129" cy="123.6" r="1.9" fill="#fff" />}
          </g>
        </g>
        <path d="M82 156q18 15 36 0" fill="none" stroke="#1E2A4A" strokeWidth="5.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}

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

  const hilo = useRef<HTMLDivElement>(null)
  const campo = useRef<HTMLTextAreaElement>(null)
  const boton = useRef<HTMLButtonElement>(null)
  const ojos = useRef<SVGGElement>(null)

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

  /* --- los ojos siguen el cursor --- */
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(pointer:fine)').matches) return

    const mover = (e: MouseEvent) => {
      if (abierto || !boton.current || !ojos.current) return
      const c = boton.current.getBoundingClientRect()
      const dx = e.clientX - (c.left + c.width / 2)
      const dy = e.clientY - (c.top + c.height / 2)
      const d = Math.hypot(dx, dy) || 1
      const t = (Math.min(d, 260) / 260) * 3.2
      ojos.current.style.transform =
        `translate(${(dx / d * t).toFixed(2)}px, ${(dy / d * t * 0.7).toFixed(2)}px)`
    }
    window.addEventListener('mousemove', mover, { passive: true })
    return () => window.removeEventListener('mousemove', mover)
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
      clearTimeout(reloj)
      if (r.status === 401) throw new Error('no_autorizado')
      if (!r.ok) throw new Error(`http_${r.status}`)

      const d = await r.json()
      setEscribiendo(false)
      if (d?.rol === 'cliente') setVerificada(true)

      const lista: string[] = Array.isArray(d?.mensajes) ? d.mensajes.filter(Boolean) : []
      if (lista.length) pintarSecuencia(lista)
      else agregar('Perdón, se me trabó la respuesta. ¿Me lo pides otra vez?', 'kala')
    } catch (e) {
      clearTimeout(reloj)
      setEscribiendo(false)
      agregar(
        (e as Error).message === 'no_autorizado'
          ? 'No pude verificar esta sesión. Recarga la página e inténtalo de nuevo.'
          : 'No pude conectar. Revisa tu conexión e inténtalo otra vez.',
        'error',
      )
    } finally {
      setOcupado(false)
      setTimeout(() => campo.current?.focus(), 60)
    }
  }, [borrador, ocupado, agregar, pintarSecuencia])

  const alternar = useCallback(() => {
    interactuo.current = true
    setAbierto((prev) => {
      const nuevo = !prev
      setMostrando(false); setPendiente(false)
      if (nuevo) {
        if (ojos.current) ojos.current.style.transform = ''
        if (!arrancado.current) {
          arrancado.current = true
          pintarSecuencia(SALUDO)
        }
        setTimeout(() => campo.current?.focus(), 320)
      } else {
        setTimeout(() => boton.current?.focus(), 60)
      }
      return nuevo
    })
  }, [pintarSecuencia])

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape' && abierto) alternar() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [abierto, alternar])

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
          <div className="h-10 w-10 shrink-0"><Kala /></div>
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

        <div
          ref={hilo} role="log" aria-live="polite" aria-relevant="additions"
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto bg-[#F0EBE3] p-5 [overscroll-behavior:contain]"
        >
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
            'relative h-[66px] w-[66px] shrink-0 rounded-full transition-transform duration-300',
            'hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-[#E8621A]',
            asomando ? 'kala-asomando' : '',
          ].join(' ')}
        >
          <span
            className={[
              'absolute right-0.5 top-0.5 z-10 h-[15px] w-[15px] rounded-full border-[2.5px] border-[#F0EBE3] bg-[#E8621A] transition-[opacity,transform] duration-300',
              pendiente && !abierto ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
            ].join(' ')}
            aria-hidden="true"
          />
          <span className="block h-full w-full drop-shadow-[0_8px_20px_rgba(30,42,74,0.28)]">
            <Kala detallada ojosRef={ojos} />
          </span>
        </button>
      </div>

      <style jsx global>{`
        .kala-anillo{
          stroke-dasharray:597; stroke-dashoffset:597;
          transform:rotate(-90deg); transform-origin:100px 100px;
          animation:kala-trazo .85s cubic-bezier(.4,0,.2,1) .15s forwards;
        }
        @keyframes kala-trazo{ to{ stroke-dashoffset:0 } }

        .kala-ojo{ transform-origin:center; transform-box:fill-box; animation:kala-blink 6.4s infinite }
        .kala-ojo-der{ animation-delay:.06s }
        @keyframes kala-blink{ 0%,92%,100%{transform:scaleY(1)} 94%,96%{transform:scaleY(.12)} }

        .kala-cara{ transform-origin:100px 150px }
        .kala-asomando .kala-cara{ animation:kala-asomar 1.5s cubic-bezier(.34,1.3,.5,1) }
        @keyframes kala-asomar{
          0%,100%{transform:rotate(0) translateY(0)}
          25%{transform:rotate(-7deg) translateY(-5px)}
          60%{transform:rotate(5deg) translateY(-2px)}
        }

        .kala-globo{ animation:kala-entra .3s cubic-bezier(.2,.9,.3,1) }
        @keyframes kala-entra{ from{opacity:0;transform:translateY(7px)} }

        .kala-pt{ animation:kala-pt 1.3s infinite }
        @keyframes kala-pt{
          0%,60%,100%{opacity:.3;transform:translateY(0)}
          30%{opacity:1;transform:translateY(-3px)}
        }

        .kala-saludo:hover .kala-x, .kala-x:focus-visible{ opacity:1 }

        @media (prefers-reduced-motion:reduce){
          .kala-anillo{ stroke-dashoffset:0; animation:none }
          .kala-ojo,.kala-cara,.kala-globo,.kala-pt{ animation:none }
        }
      `}</style>
    </>
  )
}
