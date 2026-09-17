import { NextRequest, NextResponse } from 'next/server'

/**
 * Puente entre el widget de chat y el workflow de n8n.
 *
 * El navegador nunca ve la URL del webhook ni el token: solo llama a /api/chat.
 * Aquí se valida el tamaño de la petición, se limita el ritmo por IP y se
 * reenvía al Master Workflow.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Vercel: requiere plan Pro. En Hobby el techo es 10 s.

const URL_N8N = process.env.N8N_CHAT_WEBHOOK_URL
const TOKEN_N8N = process.env.N8N_CHAT_TOKEN

const LIMITE_MENSAJE = 500
const LIMITE_HISTORIAL = 12
const VENTANA_MS = 60_000
const MAX_POR_VENTANA = 12
const MAX_POR_SESION = 60

const porIP = new Map<string, { conteo: number; reinicioEn: number }>()
const porSesion = new Map<string, number>()

function limpiar() {
  const ahora = Date.now()
  const vencidas: string[] = []
  porIP.forEach((valor, clave) => {
    if (valor.reinicioEn < ahora) vencidas.push(clave)
  })
  vencidas.forEach((clave) => porIP.delete(clave))
  if (porSesion.size > 5000) porSesion.clear()
}

function excedeRitmo(ip: string, sesion: string) {
  limpiar()
  const ahora = Date.now()

  const registro = porIP.get(ip)
  if (!registro || registro.reinicioEn < ahora) {
    porIP.set(ip, { conteo: 1, reinicioEn: ahora + VENTANA_MS })
  } else {
    registro.conteo += 1
    if (registro.conteo > MAX_POR_VENTANA) return 'ritmo'
  }

  const total = (porSesion.get(sesion) || 0) + 1
  porSesion.set(sesion, total)
  if (total > MAX_POR_SESION) return 'sesion'

  return null
}

function textoPlano(valor: unknown, largoMax: number) {
  if (typeof valor !== 'string') return ''
  return valor.replace(/\u0000/g, '').trim().slice(0, largoMax)
}

export async function POST(peticion: NextRequest) {
  if (!URL_N8N) {
    console.error('[chat] Falta la variable N8N_CHAT_WEBHOOK_URL')
    return NextResponse.json(
      { error: 'El asistente no está disponible en este momento.' },
      { status: 503 }
    )
  }

  let cuerpo: any
  try {
    cuerpo = await peticion.json()
  } catch {
    return NextResponse.json({ error: 'Petición inválida.' }, { status: 400 })
  }

  const sesion = textoPlano(cuerpo?.session_id, 64)
  const tokenCliente = textoPlano(cuerpo?.token, 80)
  const mensaje = textoPlano(cuerpo?.mensaje, LIMITE_MENSAJE)

  if (!sesion || !mensaje) {
    return NextResponse.json({ error: 'Petición incompleta.' }, { status: 400 })
  }

  const ip =
    peticion.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    peticion.headers.get('x-real-ip') ||
    'desconocida'

  const exceso = excedeRitmo(ip, sesion)
  if (exceso === 'ritmo') {
    return NextResponse.json(
      { error: 'Vas muy rápido. Espera un momento antes de escribir de nuevo.' },
      { status: 429 }
    )
  }
  if (exceso === 'sesion') {
    return NextResponse.json(
      {
        error:
          'Llegamos al límite de esta conversación. Escríbenos a comercial@markalab.com.mx y seguimos por ahí.',
      },
      { status: 429 }
    )
  }

  const historial = Array.isArray(cuerpo?.historial)
    ? cuerpo.historial
        .slice(-LIMITE_HISTORIAL)
        .map((m: any) => ({
          rol: m?.rol === 'user' ? 'user' : 'assistant',
          texto: textoPlano(m?.texto, LIMITE_MENSAJE),
        }))
        .filter((m: any) => m.texto)
    : []

  try {
    const controlador = new AbortController()
    const limite = setTimeout(() => controlador.abort(), 50_000)

    const respuesta = await fetch(URL_N8N, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(TOKEN_N8N ? { 'x-markalab-token': TOKEN_N8N } : {}),
      },
      body: JSON.stringify({
        session_id: sesion,
        mensaje,
        token: tokenCliente,
        historial,
        pagina: textoPlano(cuerpo?.pagina, 120),
        ip,
        user_agent: peticion.headers.get('user-agent')?.slice(0, 200) || '',
        enviado_en: new Date().toISOString(),
      }),
      signal: controlador.signal,
    })

    clearTimeout(limite)

    if (!respuesta.ok) {
      console.error('[chat] n8n respondió', respuesta.status)
      return NextResponse.json(
        { error: 'El asistente no pudo responder. Intenta de nuevo.' },
        { status: 502 }
      )
    }

    const datos = await respuesta.json()

    const mensajes: string[] = Array.isArray(datos?.mensajes)
      ? datos.mensajes.filter((t: unknown) => typeof t === 'string' && t.trim()).slice(0, 3)
      : typeof datos?.mensaje === 'string'
        ? [datos.mensaje]
        : []

    if (!mensajes.length) {
      return NextResponse.json(
        { error: 'El asistente no pudo responder. Intenta de nuevo.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ mensajes, rol: datos?.rol === 'cliente' ? 'cliente' : 'prospecto' })
  } catch (e) {
    const abortado = e instanceof DOMException && e.name === 'AbortError'
    console.error('[chat] Error al llamar a n8n:', e)
    return NextResponse.json(
      {
        error: abortado
          ? 'La respuesta tardó demasiado.'
          : 'No pudimos conectar con el asistente.',
      },
      { status: abortado ? 504 : 502 }
    )
  }
}
