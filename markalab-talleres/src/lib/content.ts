/**
 * content.ts · v1.0
 *
 * Todo el texto y los datos de la landing viven aquí. Para cambiar un titular,
 * una cifra o un paso del simulador no hace falta tocar ningún componente.
 */

export const STAGES = [
  { id: 'recepcion', n: '01', name: 'Recepción' },
  { id: 'diagnostico', n: '02', name: 'Diagnóstico' },
  { id: 'autorizacion', n: '03', name: 'Autorización' },
  { id: 'intervencion', n: '04', name: 'Intervención' },
  { id: 'calidad', n: '05', name: 'Calidad' },
  { id: 'entrega', n: '06', name: 'Entrega' },
] as const;

export const HERO = {
  title: ['El taller', 'que avisa solo.'],
  sub: 'Cada auto reporta su estatus por WhatsApp. Tu asesor suelta el teléfono.',
  cta: 'Diagnóstico gratuito',
  ghost: 'Verlo funcionar',
};

/** Supuestos del calculador. Vienen de los correos de la campaña. */
export const LEAK = {
  title: '¿Cuánto se te va en llamadas?',
  callsPerCar: 2.4,
  minutesPerCall: 4,
  min: 40,
  max: 400,
  step: 10,
  initial: 120,
};

export const DEMO = {
  title: ['Tu cliente lo ve.', 'Y autoriza.'],
  hint: 'Recibe un auto y mira qué le llega.',
  cars: [
    { n: 'Cayenne', m: 'Porsche Cayenne', odo: '28,440' },
    { n: 'X5', m: 'BMW X5', odo: '41,205' },
    { n: 'GLE', m: 'Mercedes-Benz GLE', odo: '19,870' },
    { n: 'Q7', m: 'Audi Q7', odo: '33,615' },
  ],
  /** {M} = modelo, {KM} = odómetro. `ask` pausa el flujo hasta que el cliente responde. */
  steps: [
    { k: 'Recepción', t: '08:41', msg: 'Recibimos tu {M}. Orden 4217, {KM} km. Te atiende Luis.' },
    { k: 'Diagnóstico', t: '09:20', msg: 'Ya está en bahía 4. Terminando la inspección.' },
    { k: 'Autorización', t: '10:05', msg: 'Balatas delanteras al 15 %. Cambio: $4,800. ¿Autorizas?', ask: true },
    { k: 'Refacciones', t: '10:31', msg: 'Autorizado. La pieza está en almacén.' },
    { k: 'Taller', t: '12:48', msg: 'Trabajo terminado. Pasa a calidad.' },
    { k: 'Calidad', t: '13:20', msg: 'Prueba de carretera hecha. Todo en orden.' },
    { k: 'Lavado', t: '14:02', msg: 'En lavado y detallado.' },
    { k: 'Entrega', t: '14:40', msg: 'Tu {M} está listo. Te esperamos hasta las 19:00.' },
  ],
};

/** `part` dice a qué pieza del coche se ancla cada punto en la vista explotada. */
export const SOLUTIONS = [
  { n: '01', part: 'faros', name: 'Estatus por WhatsApp', line: 'El cliente se entera en cada etapa, sin marcar.' },
  { n: '02', part: 'asiento', name: 'Agenda de citas', line: 'Elige horario solo. Menos huecos, menos ausencias.' },
  { n: '03', part: 'freno', name: 'Cotización y autorización', line: 'Se cotiza y se autoriza en el mismo chat, con registro.' },
  { n: '04', part: 'motor', name: 'Recordatorio de servicio', line: 'Sabe a qué auto le toca y lo busca solo.' },
  { n: '05', part: 'carroceria', name: 'Encuesta y reseñas', line: 'Pide la opinión al entregar y la lleva a Google.' },
  { n: '06', part: 'antena', name: 'Asistente telefónico 24/7', line: 'Contesta a cualquier hora y resuelve.' },
] as const;

export const SOLUTIONS_HEAD = {
  title: ['Seis piezas.', 'Un solo sistema.'],
  foot: 'Conectado a tu ERP y a tu CRM.',
};

export const RESULTS = {
  title: 'La primera semana.',
  items: [
    { v: -70, suffix: '%', label: 'llamadas de estatus' },
    { v: 0, suffix: '', label: 'errores de estatus' },
    { v: 2, prefix: '+', suffix: ' h', label: 'por asesor, al día' },
  ],
  paints: [
    { name: 'Grafito', hex: '#262C35' },
    { name: 'Blanco', hex: '#D9DEE4' },
    { name: 'Rojo', hex: '#8E1420' },
    { name: 'Azul', hex: '#10305E' },
  ],
  hint: 'Arrástralo para girarlo',
};

export const LEAD = {
  title: ['30 minutos.', 'Sin costo.'],
  sub: 'Vemos dónde se va el tiempo en tu taller.',
  submit: 'Agendar diagnóstico',
  legal: 'Tus datos se usan solo para este diagnóstico.',
  /** Enlace al aviso de privacidad. Vacío = no se muestra el enlace. */
  privacyUrl: 'https://www.markalab.com.mx/aviso-de-privacidad',
  done: 'Óscar te escribe hoy mismo.',
  contact: 'oscar.esperon@markalab.com.mx',
};

/** Datos de contacto y enlaces del sitio principal (www.markalab.com.mx). */
export const BRAND = {
  site: 'https://www.markalab.com.mx',
  privacyUrl: 'https://www.markalab.com.mx/aviso-de-privacidad',
  email: 'marketing@markalab.com.mx',
  phone: '+52 56 1123 2604',
  whatsapp: `https://wa.me/525611232604?text=${encodeURIComponent('Hola MarkaLab, vengo de la página de Talleres y quiero agendar mi diagnóstico.')}`,
  legal: 'MarkaLab · Oscar Fernando Esperón Vallejo · RFC EEVO641226NY2',
  address: 'Jardines del Pedregal, CDMX',
};
