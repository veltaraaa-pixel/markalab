import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { huella } from '@/lib/demo-acceso'

/**
 * Verifica el código que llegó al correo del prospecto.
 *
 * El código no se guarda en ningún lado: el sitio lo convierte en huella y
 * n8n compara esa huella contra la que guardó al enviarlo. Si coincide, el
 * token se marca como usado y se abren las cookies de la demo.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 20

const URL_N8N = process.env.N8N_DEMO_TOKEN_URL
const TOKEN_N8N = process.env.N8N_DEMO_TOKEN

export async function POST(peticion: NextRequest) {
  const galletas = cookies()
  const sesion = galletas.get('ml_demo_pend')?.value
  if (!sesion) {
    return NextResponse.json(
      { error: 'Tu solicitud ya venció. Vuelve a dejar tus datos.' },
      { status: 403 }
    )
  }

  let cuerpo: unknown
  try {
    cuerpo = await peticion.json()
  } catch {
    return NextResponse.json({ error: 'Petición inválida.' }, { status: 400 })
  }

  const codigo = String((cuerpo as Record<string, unknown>)?.codigo ?? '')
    .replace(/\D/g, '')
    .slice(0, 6)

  if (codigo.length !== 6) {
    return NextResponse.json({ error: 'El código son seis dígitos.' }, { status: 400 })
  }

  if (!URL_N8N) {
    console.error('[demo] Falta N8N_DEMO_TOKEN_URL')
    return NextResponse.json({ error: 'No pudimos verificar ahora. Intenta en un momento.' }, { status: 502 })
  }

  let r: Record<string, unknown>
  try {
    const controlador = new AbortController()
    const limite = setTimeout(() => controlador.abort(), 12_000)
    const respuesta = await fetch(URL_N8N, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(TOKEN_N8N ? { 'x-markalab-token': TOKEN_N8N } : {}),
      },
      body: JSON.stringify({ accion: 'verificar', sesion, token_hash: huella(codigo, sesion) }),
      signal: controlador.signal,
    })
    clearTimeout(limite)
    r = await respuesta.json()
  } catch (e) {
    console.error('[demo] Error al verificar el código:', e)
    return NextResponse.json({ error: 'No pudimos conectar. Intenta otra vez.' }, { status: 502 })
  }

  if (!r?.ok) {
    return NextResponse.json(
      { error: String(r?.motivo || 'El código no es válido.') },
      { status: 400 }
    )
  }

  // Código correcto: se abren las cookies de la demo y se cierra la pendiente
  const respuesta = NextResponse.json({ ok: true })
  const seguro = process.env.NODE_ENV === 'production'
  const base = { sameSite: 'lax' as const, secure: seguro, path: '/', maxAge: 60 * 60 * 3 }

  respuesta.cookies.set('ml_demo', sesion, { ...base, httpOnly: true })
  const publica = { ...base, httpOnly: false }
  respuesta.cookies.set('ml_demo_id', sesion, publica)
  respuesta.cookies.set('ml_demo_nombre',
    encodeURIComponent(String(r.nombre || '').split(' ')[0]), publica)
  respuesta.cookies.set('ml_demo_empresa', encodeURIComponent(String(r.empresa || '')), publica)
  respuesta.cookies.set('ml_demo_nota', encodeURIComponent(String(r.nota || '').slice(0, 300)), publica)
  respuesta.cookies.set('ml_demo_pend', '', { ...base, httpOnly: true, maxAge: 0 })

  return respuesta
}
