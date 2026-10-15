'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Unlock } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Lo que se pregunta antes de desbloquear el número.                 */
/*  Teléfono es obligatorio y no por capricho: es la llave con la que  */
/*  el agente reconoce a quien llama y lo saluda por su nombre.        */
/* ------------------------------------------------------------------ */

const esquema = z.object({
  nombre: z.string().min(2, 'Dinos cómo te llamas'),
  empresa: z.string().min(2, 'El nombre de tu empresa'),
  correo: z.string().email('Ingresa un correo válido'),
  telefono: z
    .string()
    .min(10, 'Ingresa un teléfono a 10 dígitos')
    .regex(/^[\d\s()+-]+$/, 'Solo números'),
  nota: z.string().max(600).optional().or(z.literal('')),  // "Nota" del diagrama, opcional
  acepta: z.literal(true, {
    errorMap: () => ({ message: 'Necesitamos tu consentimiento para continuar' }),
  }),
  sitioWeb: z.string().max(0).optional(), // trampa para bots, siempre vacía
})

export type DatosDemo = z.infer<typeof esquema>

type Props = {
  alEnviar: (datos: DatosDemo) => Promise<void>
  error: string
  enviando: boolean
}

const CAMPO =
  'w-full px-4 py-3 rounded-xl border border-azul-oscuro/10 bg-white text-azul-oscuro text-sm placeholder:text-azul-oscuro/35 focus:outline-none focus:ring-2 focus:ring-naranja/40 focus:border-naranja transition-all'

export default function DemoFormulario({ alEnviar, error, enviando }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosDemo>({ resolver: zodResolver(esquema), mode: 'onBlur' })

  const Error = ({ campo }: { campo: keyof DatosDemo }) =>
    errors[campo] ? (
      <p className="mt-1.5 text-xs text-naranja-dark">{errors[campo]?.message as string}</p>
    ) : null

  return (
    <form
      onSubmit={handleSubmit(alEnviar)}
      className="relative rounded-3xl bg-white p-6 shadow-xl shadow-azul-oscuro/5 md:p-8"
    >
      <div className="mb-6">
        <span className="mb-3 inline-block rounded-full bg-naranja/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-naranja">
          Desbloquea la demo
        </span>
        <h2 className="text-2xl font-black leading-tight text-azul-oscuro md:text-3xl">
          Déjanos tus datos y hablamos
        </h2>
        <p className="mt-2 text-sm text-azul-oscuro/60">
          En cuanto los recibamos se desbloquea la demo. Kala, nuestra asistente, te va a preguntar
          cómo trabaja tu empresa y después se pone en ese papel para que lo escuches.
        </p>
      </div>

      {/* Trampa para bots: invisible y fuera del orden de tabulación */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="sitioWeb">Sitio web</label>
        <input id="sitioWeb" type="text" tabIndex={-1} autoComplete="off" {...register('sitioWeb')} />
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-azul-oscuro">Nombre</label>
            <input className={CAMPO} placeholder="Jonathan Pérez" {...register('nombre')} />
            <Error campo="nombre" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-azul-oscuro">Empresa</label>
            <input className={CAMPO} placeholder="Refacciones del Valle" {...register('empresa')} />
            <Error campo="empresa" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-azul-oscuro">Correo</label>
            <input className={CAMPO} type="email" placeholder="tu@empresa.com" {...register('correo')} />
            <Error campo="correo" />
          </div>
        </div>

        <div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-azul-oscuro">Teléfono</label>
            <input className={CAMPO} type="tel" placeholder="55 1234 5678" {...register('telefono')} />
            <p className="mt-1.5 text-xs text-azul-oscuro/45">
              Para darte seguimiento. La demo es por aquí, no te vamos a marcar sin avisar.
            </p>
            <Error campo="telefono" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-azul-oscuro">
            Nota: cuéntanos de tu negocio
          </label>
          <textarea
            rows={3}
            className={cn(CAMPO, 'resize-none')}
            placeholder="Vendemos mantenimiento preventivo para flotillas. Quiero ver cómo sonaría un agente que agende citas con empresas de 5 a 50 unidades."
            {...register('nota')}
          />
          <p className="mt-1.5 text-xs text-azul-oscuro/45">
            Opcional, pero ayuda: si nos dices qué quieres que haga el agente, la demo arranca más rápido.
          </p>
          <Error campo="nota" />
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-crema p-4">
          <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-naranja" {...register('acepta')} />
          <span className="text-xs leading-relaxed text-azul-oscuro/70">
            Acepto que MarkaLab use estos datos para contactarme y entiendo que la llamada de la
            demostración se sostiene con un agente de inteligencia artificial y queda grabada con
            fines de demostración y mejora del servicio. Consulta el{' '}
            <a href="/aviso-de-privacidad" className="font-medium text-naranja hover:underline">
              aviso de privacidad
            </a>
            .
          </span>
        </label>
        <Error campo="acepta" />

        {error && (
          <p className="rounded-xl bg-naranja/10 px-4 py-3 text-sm text-naranja-dark">{error}</p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-naranja px-6 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-naranja-dark disabled:translate-y-0 disabled:opacity-60"
        >
          {enviando ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Desbloqueando…
            </>
          ) : (
            <>
              <Unlock size={18} /> Empezar la demo
            </>
          )}
        </button>

        <p className="text-center text-xs text-azul-oscuro/40">
          Sin costo y sin compromiso. Dura entre cinco y siete minutos, y necesitas micrófono.
        </p>
      </div>
    </form>
  )
}
