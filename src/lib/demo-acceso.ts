import { createHash } from 'crypto'

/**
 * Quién entra directo y quién tiene que verificar su correo.
 *
 * La demo abre el micrófono y consume minutos de voz que se pagan, así que
 * el correo tiene que ser real. Los del equipo se saltan el paso.
 */

const INTERNOS = [
  'oscar.esperon@markalab.com.mx',
  'sistemas@markalab.com.mx',
  'comercial@markalab.com.mx',
]

/** Dominios que nunca van a recibir el código, así que no tiene caso mandarlo */
const DESECHABLES = [
  'mailinator.com', 'tempmail.com', 'temp-mail.org', 'guerrillamail.com',
  '10minutemail.com', 'yopmail.com', 'trashmail.com', 'sharklasers.com',
  'maildrop.cc', 'getnada.com', 'dispostable.com', 'fakeinbox.com',
]

export function esInterno(correo: string) {
  return INTERNOS.includes(correo.trim().toLowerCase())
}

export function esDesechable(correo: string) {
  const dominio = correo.trim().toLowerCase().split('@')[1] || ''
  return DESECHABLES.some((d) => dominio === d || dominio.endsWith('.' + d))
}

/** Seis dígitos, sin ceros a la izquierda para que se dicte fácil */
export function nuevoCodigo() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

/**
 * La huella del código. Solo esto viaja a n8n y se guarda en Supabase:
 * el código en claro existe nada más en el correo del prospecto.
 */
export function huella(codigo: string, sesion: string) {
  const sal = process.env.N8N_DEMO_TOKEN || 'markalab'
  return createHash('sha256').update(`${sal}:${sesion}:${codigo.trim()}`).digest('hex')
}

export const MINUTOS_VIGENCIA = 15
