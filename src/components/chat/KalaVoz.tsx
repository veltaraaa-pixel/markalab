'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Kala from './KalaAvatar'

/* ------------------------------------------------------------------ */
/*  Modo voz de Kala                                                   */
/*  Conversación continua, como el modo voz de ChatGPT: escucha,       */
/*  detecta cuándo terminaste de hablar, contesta en voz alta y vuelve */
/*  a escuchar. Si te quedas callado, pregunta si siguen; si tampoco   */
/*  respondes, se despide y apaga la voz.                              */
/* ------------------------------------------------------------------ */

const ENDPOINT_VOZ = process.env.NEXT_PUBLIC_KALA_VOZ_ENDPOINT || ''
const TOKEN_SITIO = process.env.NEXT_PUBLIC_KALA_TOKEN || ''

const SILENCIO_FIN = 1100        // silencio que cierra una frase
const MIN_VOZ = 350              // voz mínima para que cuente como frase y no como ruido
const MAX_FRASE = 30000          // una frase no dura más que esto
const INACTIVIDAD = 12000        // sin hablar → Kala pregunta si siguen
const ESPERA_RESPUESTA = 8000    // tras preguntar, sin respuesta → se despide
const ESPERA_FRASE = 3000        // si la respuesta tarda más, Kala dice una frase a la medida
const TIEMPO_LIMITE = 120000

type Estado = 'iniciando' | 'escuchando' | 'procesando' | 'hablando' | 'error'
export type Turno = { rol: 'user' | 'assistant'; texto: string }

/* ---------- Audio compartido ---------- */
// Safari y Chrome en celular solo dejan reproducir audio y abrir el micrófono si
// se arranca dentro del toque del usuario. prepararVoz() se llama en ese toque.
let ctxGlobal: AudioContext | null = null
let audioGlobal: HTMLAudioElement | null = null
const SILENCIO_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='

export function prepararVoz() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!ctxGlobal) ctxGlobal = new AC()
    ctxGlobal.resume().catch(() => {})
    if (!audioGlobal) audioGlobal = new Audio()
    audioGlobal.src = SILENCIO_WAV
    audioGlobal.play().catch(() => {})
  } catch {}
}

export function vozDisponible() {
  if (typeof window === 'undefined' || !ENDPOINT_VOZ) return false
  return !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined'
}

function formatoGrabacion() {
  const opciones = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
  return opciones.find((m) => MediaRecorder.isTypeSupported?.(m)) || ''
}

const aBase64 = (blob: Blob) =>
  new Promise<string>((ok, mal) => {
    const r = new FileReader()
    r.onload = () => ok(String(r.result).split(',')[1] || '')
    r.onerror = mal
    r.readAsDataURL(blob)
  })

/* ------------------------------------------------------------------ */
type Props = {
  sesion: string
  token: string
  obtenerHistorial: () => Turno[]
  alPersona: (texto: string) => void
  alKala: (mensajes: string[], rol?: string) => void
  alTerminar: () => void
}

export default function KalaVoz({ sesion, token, obtenerHistorial, alPersona, alKala, alTerminar }: Props) {
  const [estado, setEstado] = useState<Estado>('iniciando')
  const [ultimo, setUltimo] = useState('')
  const [aviso, setAviso] = useState('')

  const anillo = useRef<HTMLDivElement>(null)
  const r = useRef({
    estado: 'iniciando' as Estado,
    stream: null as MediaStream | null,
    fuente: null as MediaStreamAudioSourceNode | null,
    analizador: null as AnalyserNode | null,
    grabadora: null as MediaRecorder | null,
    trozos: [] as Blob[],
    descartar: false,
    reloj: 0 as unknown as ReturnType<typeof setInterval>,
    umbral: 0.02,
    calibracion: [] as number[],
    hablo: false, inicioVoz: 0, ultimaVoz: 0, inicioEscucha: 0,
    preguntado: false,
    interrupcion: 0,
    frases: {} as Record<string, string>,
    peticion: null as AbortController | null,
    errores: 0,
    vivo: true,
  })

  const fijar = (e: Estado) => { r.current.estado = e; setEstado(e) }

  /* ---------- reproducir audio ---------- */
  const reproducir = useCallback((b64: string, despues: () => void) => {
    const a = audioGlobal
    if (!a || !r.current.vivo) return despues()
    fijar('hablando')
    r.current.interrupcion = 0
    a.onended = () => { if (r.current.vivo) despues() }
    a.onerror = () => { if (r.current.vivo) despues() }
    a.src = 'data:audio/mpeg;base64,' + b64
    a.play().catch(() => { if (r.current.vivo) despues() })
  }, [])

  const decir = useCallback((id: string, despues: () => void) => {
    const b64 = r.current.frases[id]
    if (b64) reproducir(b64, despues)
    else despues()
  }, [reproducir])

  /* ---------- escuchar ---------- */
  const escuchar = useCallback(() => {
    const s = r.current
    if (!s.vivo || !s.stream) return
    s.trozos = []; s.descartar = false
    s.hablo = false; s.inicioVoz = 0; s.ultimaVoz = 0
    s.inicioEscucha = performance.now()
    try {
      const mime = formatoGrabacion()
      const g = new MediaRecorder(s.stream, mime ? { mimeType: mime } : undefined)
      g.ondataavailable = (e) => { if (e.data.size) s.trozos.push(e.data) }
      g.onstop = () => {
        if (s.descartar || !s.vivo) return
        const blob = new Blob(s.trozos, { type: g.mimeType || mime || 'audio/webm' })
        enviarRef.current(blob)
      }
      g.start(250)
      s.grabadora = g
      fijar('escuchando')
    } catch {
      fijar('error'); setAviso('No pude usar el micrófono en este navegador.')
    }
  }, [])

  const detenerGrabacion = (descartar: boolean) => {
    const g = r.current.grabadora
    r.current.descartar = descartar
    if (g && g.state !== 'inactive') g.stop()
    r.current.grabadora = null
  }

  /* ---------- enviar un turno ---------- */
  const llamar = (cuerpo: Record<string, unknown>, senal: AbortSignal) =>
    fetch(ENDPOINT_VOZ, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-markalab-token': TOKEN_SITIO },
      body: JSON.stringify(cuerpo),
      signal: senal,
    }).then((x) => { if (!x.ok) throw new Error('http_' + x.status); return x.json() })

  const enviarRef = useRef<(b: Blob) => void>(() => {})
  enviarRef.current = async (blob: Blob) => {
    const s = r.current
    s.preguntado = false
    fijar('procesando')
    setAviso('')
    const t0 = performance.now()        // Kala empieza a "armar" en cuanto terminaste de hablar

    const corte = new AbortController()
    s.peticion = corte
    const limite = setTimeout(() => corte.abort(), TIEMPO_LIMITE)
    const fin = () => clearTimeout(limite)

    try {
      // 1. Lo que dijiste, ya limpio: correos en minúsculas y sin acentos
      const tr = await llamar({ accion: 'transcribir', audio: await aBase64(blob), mime: blob.type }, corte.signal)
      if (!s.vivo) return fin()
      const texto = String(tr.texto || '').trim()
      if (tr.vacio || !texto) { fin(); escuchar(); return }

      setUltimo(texto)
      alPersona(texto)

      // 2. En paralelo: la respuesta, y una frase de espera hecha con lo que dijiste
      const corteEspera = new AbortController()
      let respuesta: { mensajes?: string[]; rol?: string; audio?: string | null } | null = null
      let audioEspera: string | null = null
      let esperaSonando = false
      let tocaEspera = false

      const tocarEspera = () => {
        if (respuesta || !audioEspera || esperaSonando || !s.vivo) return
        const a = audioGlobal
        if (!a) return
        esperaSonando = true
        const alAcabar = () => { esperaSonando = false; if (respuesta) entregar() }
        a.onended = alAcabar
        a.onerror = alAcabar
        a.src = 'data:audio/mpeg;base64,' + audioEspera
        a.play().catch(() => { esperaSonando = false })
      }

      const entregar = () => {
        if (!s.vivo || !respuesta) return
        if (esperaSonando) return            // termina su frase y luego contesta; cortarla suena feo
        fin()
        s.errores = 0
        const mensajes = Array.isArray(respuesta.mensajes) ? respuesta.mensajes : []
        alKala(mensajes, respuesta.rol)
        if (respuesta.audio) reproducir(respuesta.audio, escuchar)
        else escuchar()
      }

      llamar({ accion: 'espera', texto }, corteEspera.signal)
        .then((d) => { audioEspera = d?.audio || null; if (tocaEspera) tocarEspera() })
        .catch(() => {})

      const reloj = setTimeout(() => { tocaEspera = true; tocarEspera() },
                               Math.max(0, ESPERA_FRASE - (performance.now() - t0)))

      const d = await llamar({
        accion: 'responder', session_id: sesion, token, texto,
        pagina: window.location.pathname,
        historial: obtenerHistorial().slice(-12),
      }, corte.signal)

      clearTimeout(reloj)
      corteEspera.abort()                  // si la frase de espera no llegó a tiempo, ya no hace falta
      if (!s.vivo) return fin()
      respuesta = d
      entregar()
    } catch (e) {
      fin()
      if (!s.vivo) return
      s.errores += 1
      if (s.errores >= 2) {
        setAviso('Se me está complicando la conexión. Seguimos por escrito.')
        setTimeout(alTerminar, 2200)
        fijar('error')
      } else {
        setAviso((e as Error).name === 'AbortError'
          ? 'Se tardó demasiado. Inténtalo otra vez.'
          : 'No te escuché bien, ¿me lo repites?')
        escuchar()
      }
    }
  }

  /* ---------- arranque ---------- */
  useEffect(() => {
    const s = r.current
    s.vivo = true

    // frases fijas en la voz de Kala, se piden una vez
    const frasesListas = fetch(ENDPOINT_VOZ, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-markalab-token': TOKEN_SITIO },
      body: JSON.stringify({ accion: 'frases' }),
    }).then((x) => x.json()).then((d) => { if (d?.frases) s.frases = d.frases }).catch(() => {})

    ;(async () => {
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        })
      } catch {
        fijar('error')
        setAviso('Necesito permiso para usar tu micrófono. Puedes darlo desde el candado de la barra de direcciones.')
        return
      }

      try {
        if (!s.vivo) { stream.getTracks().forEach((t) => t.stop()); return }
        s.stream = stream
        if (!ctxGlobal) prepararVoz()
        const ctx = ctxGlobal!
        await ctx.resume().catch(() => {})
        s.analizador = ctx.createAnalyser()
        s.analizador.fftSize = 1024
        s.fuente = ctx.createMediaStreamSource(stream)
        s.fuente.connect(s.analizador)

        const datos = new Float32Array(s.analizador.fftSize)
        const t0 = performance.now()

        s.reloj = setInterval(() => {
          if (!s.analizador) return
          s.analizador.getFloatTimeDomainData(datos)
          let suma = 0
          for (let i = 0; i < datos.length; i++) suma += datos[i] * datos[i]
          const rms = Math.sqrt(suma / datos.length)
          const ahora = performance.now()

          // el anillo respira con el volumen de quien habla
          if (anillo.current) {
            const nivel = s.estado === 'escuchando' ? Math.min(rms / (s.umbral * 4), 1) : 0
            anillo.current.style.setProperty('--nivel', nivel.toFixed(3))
          }

          // los primeros 600 ms miden el ruido del lugar
          if (ahora - t0 < 600) { s.calibracion.push(rms); return }
          if (s.calibracion.length) {
            const piso = s.calibracion.reduce((a, b) => a + b, 0) / s.calibracion.length
            s.umbral = Math.min(Math.max(piso * 3, 0.012), 0.08)
            s.calibracion = []
          }

          if (s.estado === 'escuchando') {
            if (rms > s.umbral) {
              if (!s.hablo) {
                if (!s.inicioVoz) s.inicioVoz = ahora
                if (ahora - s.inicioVoz > MIN_VOZ) s.hablo = true
              }
              s.ultimaVoz = ahora
            } else if (!s.hablo) {
              s.inicioVoz = 0
            }

            if (s.hablo && (ahora - s.ultimaVoz > SILENCIO_FIN || ahora - s.inicioEscucha > MAX_FRASE)) {
              detenerGrabacion(false)
              return
            }

            const espera = s.preguntado ? ESPERA_RESPUESTA : INACTIVIDAD
            if (!s.hablo && ahora - s.inicioEscucha > espera) {
              detenerGrabacion(true)
              if (!s.preguntado) {
                s.preguntado = true
                decir('seguimos', escuchar)
              } else {
                decir('despedida', alTerminar)
                fijar('hablando')
              }
            }
          } else if (s.estado === 'hablando') {
            // interrumpir a Kala hablando encima, como en una plática real
            if (rms > s.umbral * 3) {
              if (!s.interrupcion) s.interrupcion = ahora
              if (ahora - s.interrupcion > 400 && !s.preguntado) {
                audioGlobal?.pause()
                escuchar()
              }
            } else s.interrupcion = 0
          }
        }, 50)

        // saludo en su voz; se espera a las frases como mucho 2.5 s para no dejarlo en silencio
        await Promise.race([frasesListas, new Promise((ok) => setTimeout(ok, 2500))])
        if (s.vivo) decir('hola', escuchar)
      } catch {
        fijar('error')
        setAviso('Este navegador no me deja usar el audio. Prueba con Chrome o Safari actualizados.')
      }
    })()

    return () => {
      s.vivo = false
      clearInterval(s.reloj)
      s.peticion?.abort()
      detenerGrabacion(true)
      s.fuente?.disconnect()
      s.stream?.getTracks().forEach((t) => t.stop())
      if (audioGlobal) { audioGlobal.onended = null; audioGlobal.pause() }
    }
    // se arma una sola vez por activación
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const TEXTO: Record<Estado, string> = {
    iniciando: 'Preparando el micrófono…',
    escuchando: 'Te escucho…',
    procesando: 'Pensando…',
    hablando: 'Kala está hablando',
    error: '',
  }

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-between bg-[#1E2A4A] px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-8 text-white">
      <p className="text-xs uppercase tracking-[0.2em] text-white/45">Modo voz</p>

      <div className="flex flex-col items-center">
        <div
          ref={anillo}
          className={`kala-voz-anillo kala-voz-${estado} relative grid h-44 w-44 place-items-center rounded-full`}
        >
          <div className="h-36 w-36"><Kala detallada idClip="kalaClipVoz" /></div>
        </div>
        <p className="mt-6 min-h-[1.5rem] text-base font-semibold" aria-live="polite">
          {aviso || TEXTO[estado]}
        </p>
        <p className="mt-2 line-clamp-2 min-h-[2.5rem] max-w-[17rem] text-center text-sm text-white/55">
          {ultimo && estado !== 'escuchando' ? `“${ultimo}”` : ''}
        </p>
      </div>

      <button
        type="button"
        onClick={alTerminar}
        className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/20"
        aria-label="Salir del modo voz"
      >
        <span className="text-lg leading-none">×</span> Terminar
      </button>

      <style jsx global>{`
        .kala-voz-anillo{ --nivel:0; }
        .kala-voz-anillo::before{
          content:""; position:absolute; inset:-6px; border-radius:9999px;
          border:3px solid #E8621A; opacity:.9;
          transform:scale(calc(1 + var(--nivel) * .22));
          transition:transform .08s linear;
        }
        .kala-voz-procesando::before{
          border-style:dashed; animation:kala-voz-giro 1.6s linear infinite;
        }
        .kala-voz-hablando::before{ animation:kala-voz-pulso 1.1s ease-in-out infinite; }
        .kala-voz-iniciando::before, .kala-voz-error::before{ opacity:.35; }
        @keyframes kala-voz-giro{ to{ transform:rotate(360deg) } }
        @keyframes kala-voz-pulso{ 0%,100%{ transform:scale(1) } 50%{ transform:scale(1.09) } }
        @media (prefers-reduced-motion:reduce){
          .kala-voz-anillo::before{ animation:none !important; transform:none !important; }
        }
      `}</style>
    </div>
  )
}
