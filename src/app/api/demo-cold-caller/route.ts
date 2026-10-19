import { NextRequest, NextResponse } from 'next/server'
import { esInterno, esDesechable, nuevoCodigo, huella, MINUTOS_VIGENCIA } from '@/lib/demo-acceso'

/**
 * Captura del prospecto que quiere probar la demo del Cold Caller.
 *
 * Flujo: el visitante deja sus datos -> se avisa al equipo y se guarda en
 * Supabase -> se desbloquea el numero de la demo con una cookie -> el
 * visitante marca y conversa con el agente -> en la misma pagina de gracias
 * puede agendar su diagnostico.
 *
 * El navegador nunca ve la URL del webhook ni el token: solo llama aqui.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const URL_N8N = process.env.N8N_DEMO_WEBHOOK_URL
const URL_TOKEN = process.env.N8N_DEMO_TOKEN_URL
const TOKEN_N8N = process.env.N8N_DEMO_TOKEN

const VENTANA_MS = 10 * 60_000
const MAX_POR_VENTANA = 3

const porIP = new Map<string, { conteo: number; reinicioEn: number }>()

function limpiar() {
  const ahora = Date.now()
  const vencidas: string[] = []
  porIP.forEach((valor, clave) => {
    if (valor.reinicioEn < ahora) vencidas.push(clave)
  })
  vencidas.forEach((clave) => porIP.delete(clave))
}

function excedeRitmo(ip: string) {
  limpiar()
  const ahora = Date.now()
  const registro = porIP.get(ip)
  if (!registro || registro.reinicioEn < ahora) {
    porIP.set(ip, { conteo: 1, reinicioEn: ahora + VENTANA_MS })
    return false
  }
  registro.conteo += 1
  return registro.conteo > MAX_POR_VENTANA
}

function textoPlano(valor: unknown, largoMax: number) {
  if (typeof valor !== 'string') return ''
  return valor.replace(/\u0000/g, '').replace(/\s+/g, ' ').trim().slice(0, largoMax)
}

/** El telefono se guarda en E.164 porque es la llave con la que el agente
 *  reconoce a quien llama. Sin esto, la demo saluda a un desconocido. */
function aE164(crudo: string) {
  const soloDigitos = String(crudo || '').replace(/[^\d+]/g, '')
  if (!soloDigitos) return ''
  if (soloDigitos.startsWith('+')) return soloDigitos
  const d = soloDigitos.replace(/^0+/, '')
  if (d.length === 10) return '+52' + d
  if (d.startsWith('52') && d.length >= 12) return '+' + d
  if (d.startsWith('1') && d.length === 11) return '+' + d
  return '+52' + d
}

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(peticion: NextRequest) {
  let cuerpo: unknown
  try {
    cuerpo = await peticion.json()
  } catch {
    return NextResponse.json({ error: 'Petición inválida.' }, { status: 400 })
  }

  const d = (cuerpo ?? {}) as Record<string, unknown>

  // Trampa para bots: campo invisible. Si viene lleno, se responde como si
  // todo hubiera salido bien y no se hace nada.
  if (textoPlano(d.sitioWeb, 200)) {
    return NextResponse.json({ ok: true, leadGuardado: true, sesion: 'ignorada' })
  }

  const datos = {
    nombre: textoPlano(d.nombre, 80),
    empresa: textoPlano(d.empresa, 100),
    correo: textoPlano(d.correo, 120).toLowerCase(),
    telefono: aE164(textoPlano(d.telefono, 25)),
    nota: textoPlano(d.nota, 600),
  }

  const faltan = (['nombre', 'empresa', 'correo', 'telefono'] as const).filter((campo) => !datos[campo])
  if (faltan.length) {
    return NextResponse.json({ error: 'Faltan datos por llenar.', campos: faltan }, { status: 400 })
  }
  if (!CORREO.test(datos.correo)) {
    return NextResponse.json({ error: 'El correo no parece válido.' }, { status: 400 })
  }
  if (datos.telefono.replace(/\D/g, '').length < 10) {
    return NextResponse.json({ error: 'El teléfono no parece válido.' }, { status: 400 })
  }
  if (d.acepta !== true) {
    return NextResponse.json(
      { error: 'Necesitamos tu consentimiento para continuar.' },
      { status: 400 }
    )
  }

  const ip =
    peticion.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    peticion.headers.get('x-real-ip') ||
    'desconocida'

  const directo = esInterno(datos.correo)

  // El límite por IP está para que nadie queme minutos de voz ni correos.
  // El equipo no es esa amenaza y necesita poder probar cuantas veces quiera.
  if (!directo && excedeRitmo(ip)) {
    return NextResponse.json(
      {
        error:
          'Ya probaste la demo hace poco. Si quieres verla otra vez, espera unos minutos o escríbenos a comercial@markalab.com.mx.',
      },
      { status: 429 }
    )
  }

  const sesion = `demo_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

  const payload = {
    evento: 'demo_cold_caller',
    sesion,
    acceso: directo ? 'directo' : 'por_token',
    ...datos,
    ip,
    pagina: textoPlano(d.pagina, 120) || '/demo',
    user_agent: peticion.headers.get('user-agent')?.slice(0, 200) || '',
    referer: peticion.headers.get('referer')?.slice(0, 200) || '',
    enviado_en: new Date().toISOString(),
  }

  // Un reintento. Si n8n esta caido, el visitante igual recibe el numero,
  // pero queda avisado en los logs. Perder el lead en silencio seria peor.
  let leadGuardado = false
  if (!URL_N8N) {
    console.error('[demo] Falta la variable N8N_DEMO_WEBHOOK_URL')
  } else {
    for (let intento = 1; intento <= 2 && !leadGuardado; intento++) {
      try {
        const controlador = new AbortController()
        const limite = setTimeout(() => controlador.abort(), 12_000)
        const respuestaN8N = await fetch(URL_N8N, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(TOKEN_N8N ? { 'x-markalab-token': TOKEN_N8N } : {}),
          },
          body: JSON.stringify(payload),
          signal: controlador.signal,
        })
        clearTimeout(limite)
        if (respuestaN8N.ok) leadGuardado = true
        else console.error('[demo] n8n respondió', respuestaN8N.status, 'intento', intento)
      } catch (e) {
        console.error('[demo] Error al avisar a n8n, intento', intento, e)
      }
    }
  }

  if (!leadGuardado) {
    console.error('[demo] LEAD SIN GUARDAR, recupéralo de este log:', JSON.stringify(payload))
  }

  const seguro = process.env.NODE_ENV === 'production'
  const base = { sameSite: 'lax' as const, secure: seguro, path: '/', maxAge: 60 * 60 * 3 }

  // --- Alguien de la casa: entra sin verificar ---
  if (directo) {
    const respuesta = NextResponse.json({ ok: true, leadGuardado, sesion, acceso: 'directo' })
    respuesta.cookies.set('ml_demo', sesion, { ...base, httpOnly: true })
    const publica = { ...base, httpOnly: false }
    respuesta.cookies.set('ml_demo_id', sesion, publica)
    respuesta.cookies.set('ml_demo_nombre', encodeURIComponent(datos.nombre.split(' ')[0]), publica)
    respuesta.cookies.set('ml_demo_empresa', encodeURIComponent(datos.empresa), publica)
    respuesta.cookies.set('ml_demo_nota', encodeURIComponent(datos.nota.slice(0, 300)), publica)
    return respuesta
  }

  // --- Alguien de fuera: se le manda un código al correo ---
  if (!URL_TOKEN) {
    console.error('[demo] Falta N8N_DEMO_TOKEN_URL')
    return NextResponse.json(
      { error: 'No pudimos enviarte el código. Escríbenos a comercial@markalab.com.mx.' },
      { status: 502 }
    )
  }

  const codigo = nuevoCodigo()
  try {
    const controlador = new AbortController()
    const limite = setTimeout(() => controlador.abort(), 12_000)
    const r = await fetch(URL_TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(TOKEN_N8N ? { 'x-markalab-token': TOKEN_N8N } : {}),
      },
      body: JSON.stringify({
        accion: 'crear', sesion, codigo,
        token_hash: huella(codigo, sesion),
        minutos: MINUTOS_VIGENCIA, ip, ...datos,
      }),
      signal: controlador.signal,
    })
    clearTimeout(limite)
    if (!r.ok) throw new Error('n8n respondió ' + r.status)
  } catch (e) {
    console.error('[demo] No se pudo enviar el código:', e)
    return NextResponse.json(
      { error: 'No pudimos enviarte el código. Intenta de nuevo en un momento.' },
      { status: 502 }
    )
  }

  const respuesta = NextResponse.json({
    ok: true, leadGuardado, sesion, acceso: 'por_token',
    correo: datos.correo, minutos: MINUTOS_VIGENCIA,
  })
  // Esta cookie solo dice "hay una verificación en curso": no abre la demo
  respuesta.cookies.set('ml_demo_pend', sesion, {
    ...base, httpOnly: true, maxAge: 60 * (MINUTOS_VIGENCIA + 5),
  })
  return respuesta
}
