import { NextRequest, NextResponse } from 'next/server'

/**
 * Qué horarios ya están tomados en una fecha.
 *
 * Lee las citas de Supabase a través de n8n, igual que todo lo demás: el
 * navegador nunca ve la llave de la base. Si n8n no contesta, se devuelve
 * la lista vacía y se permite agendar: perder una cita por un fallo de red
 * es peor que un empalme, que al menos el equipo puede reacomodar.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const URL_N8N = process.env.N8N_DEMO_HORARIOS_URL
const TOKEN_N8N = process.env.N8N_DEMO_TOKEN

export async function GET(peticion: NextRequest) {
  const fecha = peticion.nextUrl.searchParams.get('fecha') || ''

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return NextResponse.json({ error: 'Fecha inválida.' }, { status: 400 })
  }

  if (!URL_N8N) {
    console.error('[demo] Falta N8N_DEMO_HORARIOS_URL')
    return NextResponse.json({ ocupados: [] })
  }

  try {
    const controlador = new AbortController()
    const limite = setTimeout(() => controlador.abort(), 8000)
    const respuesta = await fetch(`${URL_N8N}?fecha=${encodeURIComponent(fecha)}`, {
      headers: TOKEN_N8N ? { 'x-markalab-token': TOKEN_N8N } : {},
      signal: controlador.signal,
      cache: 'no-store',
    })
    clearTimeout(limite)
    if (!respuesta.ok) throw new Error('n8n respondió ' + respuesta.status)
    const cuerpo = await respuesta.json()
    const ocupados = Array.isArray(cuerpo?.ocupados) ? cuerpo.ocupados : []
    return NextResponse.json({ ocupados })
  } catch (e) {
    console.error('[demo] No se pudieron leer los horarios ocupados:', e)
    return NextResponse.json({ ocupados: [] })
  }
}
