/**
 * /api/lead-talleres · v1.2 (antes /api/lead del proyecto de talleres)
 *
 * Recibe el formulario de la landing y lo reenvía al webhook de n8n
 * (ML-Cold Mailing · W5 Entrada desde la landing).
 *
 * Por qué existe en vez de llamar a n8n desde el navegador:
 *   - El webhook lleva un secreto (?k=). Aquí vive en una variable de entorno
 *     del servidor; en el navegador cualquiera lo leería.
 *   - Se valida y se limita antes de que nada llegue a la base: la landing es
 *     pública y ya se vio (auditoría v1.1) que por ahí entra basura.
 *
 * W5 espera: name, company, email, phone, note, origen, agendo.
 */
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Freno simple por IP: 5 envíos por minuto. Vive en memoria, así que en un
// despliegue con varias instancias es por instancia; alcanza para frenar a un
// bot torpe, no sustituye a un WAF.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 5;
}

const clean = (v: unknown, max: number) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);

export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();
  if (limited(ip)) return NextResponse.json({ ok: false, error: 'rate' }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'json' }, { status: 400 });
  }

  // Campo trampa lleno = bot. Se responde ok para no darle pistas.
  if (clean(body.website, 200)) return NextResponse.json({ ok: true });

  const lead = {
    name: clean(body.name, 120),
    company: clean(body.company, 160),
    email: clean(body.email, 200).toLowerCase(),
    phone: clean(body.phone, 30),
  };
  const valid =
    lead.name.length >= 2 &&
    lead.company.length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email) &&
    lead.phone.replace(/\D/g, '').length >= 10;
  if (!valid) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 422 });

  const url = process.env.N8N_WEBHOOK_URL;
  if (!url || /REEMPLAZAR/.test(url)) {
    // Sin webhook configurado. En desarrollo se deja pasar para poder probar
    // la página; en producción es un error que conviene ver.
    if (process.env.NODE_ENV !== 'production') {
      console.info('[lead] N8N_WEBHOOK_URL sin configurar. Lead de prueba:', lead);
      return NextResponse.json({ ok: true, simulated: true });
    }
    console.error('[lead] Falta N8N_WEBHOOK_URL: el lead no se guardó.', { company: lead.company });
    return NextResponse.json({ ok: false, error: 'config' }, { status: 503 });
  }

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...lead,
        note: 'Pidió diagnóstico desde la landing de talleres.',
        origen: 'landing_talleres',
        agendo: false,
      }),
      signal: AbortSignal.timeout(9000),
    });
    if (!r.ok) throw new Error(`n8n respondió ${r.status}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[lead] No se pudo entregar a n8n:', e);
    return NextResponse.json({ ok: false, error: 'upstream' }, { status: 502 });
  }
}
