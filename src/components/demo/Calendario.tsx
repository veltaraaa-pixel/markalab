'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Calendario propio                                                  */
/*  Sin Cal.com: los horarios salen de una ventana fija (L-V, 9 a 17)  */
/*  y se descartan los que ya están ocupados en Supabase.              */
/*  Todo se calcula en hora de Ciudad de México, no en la del visitante*/
/* ------------------------------------------------------------------ */

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

/** Fecha de hoy en CDMX, como YYYY-MM-DD, sin importar dónde esté el visitante */
function hoyCDMX() {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
  return f // en-CA ya entrega YYYY-MM-DD
}

function aISO(anio: number, mes: number, dia: number) {
  return `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

type Props = {
  valor: { fecha: string; hora: string } | null
  alElegir: (v: { fecha: string; hora: string }) => void
}

export default function Calendario({ valor, alElegir }: Props) {
  const hoy = useMemo(() => hoyCDMX(), [])
  const [anio, setAnio] = useState(() => Number(hoy.slice(0, 4)))
  const [mes, setMes] = useState(() => Number(hoy.slice(5, 7)) - 1)
  const [fecha, setFecha] = useState<string>(valor?.fecha || '')
  const [ocupados, setOcupados] = useState<string[]>([])
  const [cargando, setCargando] = useState(false)

  const primerDia = new Date(anio, mes, 1).getDay()
  const diasDelMes = new Date(anio, mes + 1, 0).getDate()

  // No se deja retroceder antes del mes en curso
  const mesMinimo = anio === Number(hoy.slice(0, 4)) && mes === Number(hoy.slice(5, 7)) - 1

  const mover = (paso: number) => {
    let m = mes + paso, a = anio
    if (m < 0) { m = 11; a-- }
    if (m > 11) { m = 0; a++ }
    setAnio(a); setMes(m)
  }

  const habil = (iso: string) => {
    const d = new Date(iso + 'T12:00:00').getDay()
    return d >= 1 && d <= 5          // lunes a viernes
  }

  const seleccionable = (iso: string) => iso >= hoy && habil(iso)

  // Al elegir día, se preguntan los horarios libres
  useEffect(() => {
    if (!fecha) { setOcupados([]); return }
    let vivo = true
    setCargando(true)
    fetch(`/api/demo/horarios?fecha=${fecha}`)
      .then((r) => r.json())
      .then((d) => { if (vivo) setOcupados(Array.isArray(d.ocupados) ? d.ocupados : []) })
      .catch(() => { if (vivo) setOcupados([]) })
      .finally(() => { if (vivo) setCargando(false) })
    return () => { vivo = false }
  }, [fecha])

  const HORARIOS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '16:00', '16:30', '17:00',
  ]

  const celdas: (number | null)[] = [
    ...Array(primerDia).fill(null),
    ...Array.from({ length: diasDelMes }, (_, i) => i + 1),
  ]

  return (
    <div className="grid gap-7 lg:grid-cols-[1fr_200px]">
      {/* Calendario */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button" onClick={() => mover(-1)} disabled={mesMinimo}
            aria-label="Mes anterior"
            className="grid h-8 w-8 place-items-center rounded-full text-azul-oscuro/60 transition-colors hover:bg-azul-oscuro/5 disabled:opacity-25"
          >
            <ChevronLeft size={18} />
          </button>
          <p className="text-sm font-bold text-azul-oscuro">
            {MESES[mes]} {anio}
          </p>
          <button
            type="button" onClick={() => mover(1)} aria-label="Mes siguiente"
            className="grid h-8 w-8 place-items-center rounded-full text-azul-oscuro/60 transition-colors hover:bg-azul-oscuro/5"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {DIAS.map((d) => (
            <span key={d} className="py-1 text-center text-[11px] font-medium text-azul-oscuro/40">
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {celdas.map((dia, i) => {
            if (dia === null) return <span key={`v${i}`} />
            const iso = aISO(anio, mes, dia)
            const puede = seleccionable(iso)
            const elegido = fecha === iso
            return (
              <button
                key={iso}
                type="button"
                disabled={!puede}
                onClick={() => setFecha(iso)}
                className={cn(
                  'aspect-square rounded-full text-sm transition-all',
                  elegido && 'bg-naranja font-bold text-white',
                  !elegido && puede && 'text-azul-oscuro hover:bg-naranja/10',
                  !puede && 'cursor-default text-azul-oscuro/20'
                )}
              >
                {dia}
              </button>
            )
          })}
        </div>

        <p className="mt-4 text-xs text-azul-oscuro/45">
          Horario de Ciudad de México. Lunes a viernes.
        </p>
      </div>

      {/* Horarios */}
      <div>
        <p className="mb-3 text-sm font-bold text-azul-oscuro">
          {fecha ? 'Horarios disponibles' : 'Elige un día'}
        </p>

        {!fecha && (
          <p className="text-xs leading-relaxed text-azul-oscuro/45">
            Selecciona una fecha en el calendario y aquí aparecen las horas libres.
          </p>
        )}

        {fecha && cargando && (
          <p className="flex items-center gap-2 text-xs text-azul-oscuro/50">
            <Loader2 size={14} className="animate-spin" /> Consultando…
          </p>
        )}

        {fecha && !cargando && (
          <div className="grid max-h-[22rem] grid-cols-2 gap-2 overflow-y-auto pr-1 lg:grid-cols-1">
            {HORARIOS.map((h) => {
              const tomado = ocupados.includes(h)
              const elegido = valor?.fecha === fecha && valor?.hora === h
              return (
                <button
                  key={h}
                  type="button"
                  disabled={tomado}
                  onClick={() => alElegir({ fecha, hora: h })}
                  className={cn(
                    'rounded-xl border px-3 py-2.5 text-sm transition-all',
                    elegido && 'border-naranja bg-naranja font-semibold text-white',
                    !elegido && !tomado && 'border-azul-oscuro/12 text-azul-oscuro hover:border-naranja hover:text-naranja',
                    tomado && 'cursor-default border-transparent bg-azul-oscuro/5 text-azul-oscuro/25 line-through'
                  )}
                >
                  {h}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
