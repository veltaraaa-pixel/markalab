import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Agendar la cita del diagnóstico.
 *
 * Solo puede agendar quien ya dejó sus datos: la cookie de la demo es el
 * permiso. Los datos van a n8n, que avisa al equipo, manda la confirmación
 * al prospecto y guarda la cita en Supabase.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const URL_N8N = process.env.N8N_DEMO_CITA_URL
const TOKEN_N8N = process.env.N8N_DEMO_TOKEN

function textoPlano(valor: unknown, largoMax: number) {
  if (typeof valor !== 'string') return ''
  return valor.replace(/\u0000/g, '').replace(/\s+/g, ' ').trim().slice(0, largoMax)
}

export async function POST(peticion: NextRequest) {
  const galletas = cookies()
  const sesion = galletas.get('ml_demo')?.value
  if (!sesion) {
    return NextResponse.json(
      { error: 'Primero déjanos tus datos para poder agendar.' },
      { status: 403 }
    )
  }

  let cuerpo: unknown
  try {
    cuerpo = await peticion.json()
  } catch {
    return NextResponse.json({ error: 'Petición inválida.' }, { status: 400 })
  }

  const d = (cuerpo ?? {}) as Record<string, unknown>
  const fecha = textoPlano(d.fecha, 10)
  const hora = textoPlano(d.hora, 5)
  const nota = textoPlano(d.nota, 400)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^\d{2}:\d{2}$/.test(hora)) {
    return NextResponse.json({ error: 'Elige una fecha y una hora.' }, { status: 400 })
  }

  // No se deja agendar en el pasado, en hora de Ciudad de México
  const hoyCDMX = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
  if (fecha < hoyCDMX) {
    return NextResponse.json({ error: 'Esa fecha ya pasó.' }, { status: 400 })
  }

  if (!URL_N8N) {
    console.error('[demo] Falta N8N_DEMO_CITA_URL')
    return NextResponse.json(
      { error: 'No pudimos agendar en este momento. Escríbenos a comercial@markalab.com.mx.' },
      { status: 502 }
    )
  }

  const payload = {
    evento: 'demo_cita',
    sesion,
    fecha,
    hora,
    nota,
    // CDMX es UTC-6 todo el año desde 2022: ya no hay horario de verano
    fecha_iso: `${fecha}T${hora}:00-06:00`,
    agendado_en: new Date().toISOString(),
  }

  try {
    const controlador = new AbortController()
    const limite = setTimeout(() => controlador.abort(), 15000)
    const respuesta = await fetch(URL_N8N, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(TOKEN_N8N ? { 'x-markalab-token': TOKEN_N8N } : {}),
      },
      body: JSON.stringify(payload),
      signal: controlador.signal,
    })
    clearTimeout(limite)

    if (!respuesta.ok) throw new Error('n8n respondió ' + respuesta.status)
    const r = await respuesta.json().catch(() => ({}))

    if (r?.ocupado) {
      return NextResponse.json(
        { error: 'Alguien acaba de tomar ese horario. Elige otro, por favor.' },
        { status: 409 }
      )
    }
    return NextResponse.json({ ok: true, fecha, hora })
  } catch (e) {
    console.error('[demo] CITA SIN GUARDAR, recupérala de este log:', JSON.stringify(payload), e)
    return NextResponse.json(
      { error: 'No pudimos confirmar la cita. Escríbenos a comercial@markalab.com.mx y la apartamos.' },
      { status: 502 }
    )
  }
}
