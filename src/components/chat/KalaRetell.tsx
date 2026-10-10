'use client'

import { useEffect, useRef, useState } from 'react'
import { RetellClient } from 'retell-client-js-sdk'
import type { WebCallSession, LiveCallUtterance, SessionHooks } from 'retell-client-js-sdk'
import Kala from './KalaAvatar'

/* ------------------------------------------------------------------ */
/*  Modo voz de Kala con Retell                                        */
/*  Retell escucha, piensa y habla en flujo continuo, como una llamada.*/
/*  Las decisiones de negocio siguen en n8n: Retell las pide como      */
/*  funciones al webhook kala-retell.                                  */
/* ------------------------------------------------------------------ */

const PUBLIC_KEY = process.env.NEXT_PUBLIC_RETELL_PUBLIC_KEY || ''
const AGENT_ID = process.env.NEXT_PUBLIC_RETELL_AGENT_ID || ''

export function retellDisponible() {
  if (typeof window === 'undefined') return false
  return !!PUBLIC_KEY && !!AGENT_ID && !!navigator.mediaDevices?.getUserMedia
}

export type TurnoVoz = { rol: 'user' | 'agent'; texto: string }

/* Los eventos de la llamada llegan a este puente; el componente se conecta a
   él cuando se monta. Así no se pierde ningún evento que llegue antes. */
type Puente = {
  estado?: (s: string) => void
  transcript?: (t: LiveCallUtterance[]) => void
  habla?: (si: boolean) => void
  audio?: (m: Float32Array) => void
  fin?: () => void
  error?: (e: Error) => void
}
const puente: Puente = {}

let cliente: RetellClient | null = null

/* Se llama DENTRO del toque al micrófono: los navegadores solo permiten
   abrir el micrófono y reproducir audio a partir de una acción del usuario. */
export function abrirLlamada(sesion: string, token: string): WebCallSession {
  if (!cliente) cliente = new RetellClient({ key: PUBLIC_KEY })
  const ahora = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
  const hooks: SessionHooks = {
    onStatus: (s) => puente.estado?.(s),
    onTranscript: (t) => puente.transcript?.(t),
    onAgentStartTalking: () => puente.habla?.(true),
    onAgentStopTalking: () => puente.habla?.(false),
    onAudio: (m) => puente.audio?.(m),
    onEnd: () => puente.fin?.(),
    onError: (e) => puente.error?.(e),
  }
  return cliente.createWebCall({
    agent_id: AGENT_ID,
    // metadata solo la lee n8n; el modelo no la ve. Ahí viaja el token del cliente.
    metadata: { session_id: sesion, token, pagina: window.location.pathname },
    // estas sí las ve el modelo: nada sensible
    retell_llm_dynamic_variables: { pagina: window.location.pathname, fecha_hora: ahora },
    transcript: true,
    audio: { emitRawAudioSamples: true },
    hooks,
  })
}

/* ------------------------------------------------------------------ */
type Estado = 'conectando' | 'escuchando' | 'hablando' | 'error'

type Props = {
  llamada: WebCallSession
  alTerminar: (turnos: TurnoVoz[]) => void
}

export default function KalaRetell({ llamada, alTerminar }: Props) {
  const [estado, setEstado] = useState<Estado>('conectando')
  const [subtitulo, setSubtitulo] = useState('')
  const [aviso, setAviso] = useState('')
  const [silenciado, setSilenciado] = useState(false)

  const anillo = useRef<HTMLDivElement>(null)
  const turnos = useRef<TurnoVoz[]>([])
  const cerrado = useRef(false)
  const hablaPorEvento = useRef(false)
  const nivelSuave = useRef(0)

  const terminar = () => {
    if (cerrado.current) return
    cerrado.current = true
    alTerminar(turnos.current)
  }

  useEffect(() => {
    puente.estado = (s) => {
      if (s === 'live') setEstado('escuchando')
      if (s === 'ended') terminar()
    }
    puente.transcript = (t) => {
      const habladas = t.filter((u): u is LiveCallUtterance & { role: 'agent' | 'user'; content: string } =>
        (u.role === 'agent' || u.role === 'user') && typeof (u as { content?: unknown }).content === 'string')
      turnos.current = habladas.map((u) => ({ rol: u.role, texto: u.content }))
      const ultimo = habladas[habladas.length - 1]
      if (ultimo) setSubtitulo(ultimo.content)
    }
    puente.habla = (si) => {
      hablaPorEvento.current = true
      setEstado(si ? 'hablando' : 'escuchando')
    }
    puente.audio = (muestras) => {
      // el audio que llega es la voz de Kala: anima el anillo y, si el SDK no
      // avisa cuándo habla, se deduce del volumen
      let s = 0
      for (let i = 0; i < muestras.length; i++) s += muestras[i] * muestras[i]
      const rms = Math.sqrt(s / Math.max(muestras.length, 1))
      nivelSuave.current = nivelSuave.current * 0.7 + Math.min(rms * 6, 1) * 0.3
      anillo.current?.style.setProperty('--nivel', nivelSuave.current.toFixed(3))
      if (!hablaPorEvento.current) setEstado(nivelSuave.current > 0.08 ? 'hablando' : 'escuchando')
    }
    puente.fin = () => terminar()
    puente.error = (e) => {
      const m = String(e?.message || '').toLowerCase()
      setEstado('error')
      setAviso(m.includes('permission') || m.includes('notallowed')
        ? 'Necesito permiso para usar tu micrófono. Puedes darlo desde el candado de la barra de direcciones.'
        : 'No pude conectar la llamada. Seguimos por escrito.')
      setTimeout(terminar, 2600)
    }
    // si la llamada ya estaba en vivo antes de conectar el puente
    if (llamada.status === 'live') setEstado('escuchando')
    if (llamada.status === 'ended') terminar()

    return () => {
      Object.keys(puente).forEach((k) => { delete (puente as Record<string, unknown>)[k] })
      if (llamada.status !== 'ended') llamada.end().catch(() => {})
    }
    // una sola vez por llamada
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const alternarSilencio = () => {
    if (silenciado) llamada.unmute(); else llamada.mute()
    setSilenciado(!silenciado)
  }

  const colgar = () => { llamada.end().catch(() => {}); terminar() }

  const TEXTO: Record<Estado, string> = {
    conectando: 'Conectando…',
    escuchando: silenciado ? 'Micrófono en silencio' : 'Te escucho…',
    hablando: 'Kala está hablando',
    error: '',
  }

  return (
    <div
      onClick={() => { llamada.startAudioPlayback().catch(() => {}) }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-between bg-[#1E2A4A] px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-8 text-white"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-white/45">Llamada con Kala</p>

      <div className="flex flex-col items-center">
        <div ref={anillo} className={`kala-rt-anillo kala-rt-${estado} relative grid h-44 w-44 place-items-center rounded-full`}>
          <div className="h-36 w-36"><Kala detallada idClip="kalaClipRetell" /></div>
        </div>
        <p className="mt-6 min-h-[1.5rem] text-base font-semibold" aria-live="polite">{aviso || TEXTO[estado]}</p>
        <p className="mt-2 line-clamp-3 min-h-[3.75rem] max-w-[18rem] text-center text-sm text-white/60">{subtitulo}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button" onClick={alternarSilencio} disabled={estado === 'conectando' || estado === 'error'}
          aria-label={silenciado ? 'Activar micrófono' : 'Silenciar micrófono'}
          className="grid h-11 w-11 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0M12 17v4" />
            {silenciado && <path d="M3 3l18 18" />}
          </svg>
        </button>
        <button
          type="button" onClick={colgar}
          className="flex items-center gap-2 rounded-full bg-[#E8621A] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[#C4511A]"
        >
          Terminar
        </button>
      </div>

      <style jsx global>{`
        .kala-rt-anillo{ --nivel:0; }
        .kala-rt-anillo::before{
          content:""; position:absolute; inset:-6px; border-radius:9999px;
          border:3px solid #E8621A; opacity:.9;
          transform:scale(calc(1 + var(--nivel) * .25)); transition:transform .08s linear;
        }
        .kala-rt-conectando::before{ border-style:dashed; animation:kala-rt-giro 1.6s linear infinite; }
        .kala-rt-escuchando::before{ animation:kala-rt-respira 2.4s ease-in-out infinite; }
        .kala-rt-error::before{ opacity:.35; }
        @keyframes kala-rt-giro{ to{ transform:rotate(360deg) } }
        @keyframes kala-rt-respira{ 0%,100%{ transform:scale(1) } 50%{ transform:scale(1.04) } }
        @media (prefers-reduced-motion:reduce){ .kala-rt-anillo::before{ animation:none !important; } }
      `}</style>
    </div>
  )
}
