'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MailCheck, Loader2, ArrowRight, RotateCcw } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Verificación del correo                                            */
/*  El código llegó al correo del prospecto. Sin él no se abre la      */
/*  demo: así nos aseguramos de que el correo sea real.                */
/* ------------------------------------------------------------------ */

type Props = {
  correo: string
  minutos: number
  alVerificar: () => void
  alVolver: () => void
}

export default function VerificarCodigo({ correo, minutos, alVerificar, alVolver }: Props) {
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [restante, setRestante] = useState(minutos * 60)
  const campo = useRef<HTMLInputElement>(null)

  useEffect(() => { campo.current?.focus() }, [])

  useEffect(() => {
    if (restante <= 0) return
    const t = setInterval(() => setRestante((r) => r - 1), 1000)
    return () => clearInterval(t)
  }, [restante])

  const mm = String(Math.floor(Math.max(restante, 0) / 60)).padStart(2, '0')
  const ss = String(Math.max(restante, 0) % 60).padStart(2, '0')

  const verificar = async (valor?: string) => {
    const c = (valor ?? codigo).replace(/\D/g, '')
    if (c.length !== 6) { setError('El código son seis dígitos.'); return }
    setError('')
    setEnviando(true)
    try {
      const r = await fetch('/api/demo/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: c }),
      })
      const cuerpo = await r.json()
      if (!r.ok) { setError(cuerpo?.error || 'El código no es válido.'); return }
      alVerificar()
    } catch {
      setError('No pudimos conectar. Intenta otra vez.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-white p-6 text-center shadow-xl shadow-azul-oscuro/5 md:p-9"
    >
      <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-naranja/10">
        <MailCheck size={30} className="text-naranja" />
      </div>

      <h2 className="text-2xl font-black leading-tight text-azul-oscuro md:text-3xl">
        Revisa tu correo
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-azul-oscuro/60">
        Te mandamos un código de seis dígitos a <strong className="text-azul-oscuro">{correo}</strong>.
        Escríbelo aquí para entrar a la demostración.
      </p>

      <input
        ref={campo}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={codigo}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 6)
          setCodigo(v)
          setError('')
          if (v.length === 6) verificar(v)   // se envía solo al completarlo
        }}
        placeholder="______"
        aria-label="Código de seis dígitos"
        className="mx-auto mt-8 block w-full max-w-xs rounded-2xl border-2 border-azul-oscuro/10 bg-crema px-4 py-4 text-center font-mono text-3xl tracking-[0.4em] text-azul-oscuro placeholder:text-azul-oscuro/20 focus:border-naranja focus:outline-none focus:ring-2 focus:ring-naranja/30"
      />

      {error && <p className="mt-4 text-sm text-naranja-dark">{error}</p>}

      <p className="mt-4 text-xs text-azul-oscuro/45">
        {restante > 0
          ? <>Vence en <span className="font-semibold text-azul-oscuro/70">{mm}:{ss}</span> y sirve una sola vez.</>
          : 'El código ya venció. Pide uno nuevo.'}
      </p>

      <button
        type="button"
        onClick={() => verificar()}
        disabled={enviando || codigo.length !== 6}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-naranja px-6 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-naranja-dark disabled:translate-y-0 disabled:opacity-40"
      >
        {enviando ? (
          <><Loader2 size={18} className="animate-spin" /> Verificando…</>
        ) : (
          <>Entrar a la demo <ArrowRight size={18} /></>
        )}
      </button>

      <button
        type="button" onClick={alVolver} disabled={enviando}
        className="mx-auto mt-4 inline-flex items-center gap-1.5 text-xs text-azul-oscuro/50 transition-colors hover:text-naranja disabled:opacity-40"
      >
        <RotateCcw size={13} /> Usar otro correo
      </button>

      <p className="mt-6 text-xs leading-relaxed text-azul-oscuro/40">
        ¿No llegó? Revisa la carpeta de no deseados. Si tampoco está ahí, escríbenos a
        comercial@markalab.com.mx.
      </p>
    </motion.div>
  )
}
