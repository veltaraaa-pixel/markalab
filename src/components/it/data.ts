import {
  Globe,
  Bot,
  Workflow,
  Database,
  Smartphone,
  type LucideIcon,
} from 'lucide-react'

export type ModuloIT = {
  id: string
  nombre: string
  resumen: string
  incluye: string[]
  stack: string[]
}

export type FrenteIT = {
  id: string
  titulo: string
  bajada: string
  icono: LucideIcon
  color: string
  modulos: ModuloIT[]
}

// Módulos de MarkaLab con componente 100% tecnológico, agrupados en 5 frentes.
export const frentes: FrenteIT[] = [
  {
    id: 'web',
    titulo: 'Web & E-Commerce',
    bajada: 'Sitios rápidos, indexables y construidos para convertir.',
    icono: Globe,
    color: '#E8621A',
    modulos: [
      {
        id: 'IT-01',
        nombre: 'Sitio Web de Alto Rendimiento',
        resumen:
          'Sitio a la medida con Next.js, diseño responsivo y arquitectura pensada para captar leads desde el primer día.',
        incluye: ['Core Web Vitals en verde', 'Formularios validados conectados a tu CRM', 'Panel de contenido editable', 'Hosting en edge con SSL'],
        stack: ['Next.js', 'React', 'Tailwind', 'Vercel'],
      },
      {
        id: 'IT-02',
        nombre: 'Sitio Web SEO + SEO Local',
        resumen:
          'SEO técnico desde el código: metadatos, sitemap, datos estructurados y Google Business Profile optimizado.',
        incluye: ['Schema.org y Open Graph', 'Sitemap y robots dinámicos', 'Optimización de Google Business', 'Reporte de posicionamiento'],
        stack: ['Next.js', 'Search Console', 'Schema.org'],
      },
      {
        id: 'IT-03',
        nombre: 'E-Commerce',
        resumen:
          'Tienda en línea con catálogo, pasarela de pago para México y LATAM, inventario e integración logística.',
        incluye: ['Pasarelas Stripe / Mercado Pago', 'Carrito y checkout optimizados', 'Inventario sincronizado', 'Recuperación de carritos abandonados'],
        stack: ['Next.js', 'Supabase', 'Stripe', 'Mercado Pago'],
      },
    ],
  },
  {
    id: 'ia',
    titulo: 'IA Conversacional',
    bajada: 'Agentes de texto y voz que atienden, califican y agendan 24/7.',
    icono: Bot,
    color: '#7FA8E8',
    modulos: [
      {
        id: 'IT-04',
        nombre: 'Chatbot de Atención con IA',
        resumen:
          'Asistente entrenado con la información de tu negocio que responde, califica prospectos y escala a un humano cuando hace falta.',
        incluye: ['Base de conocimiento propia', 'Calificación automática de leads', 'Escalado a humano con contexto', 'Voz de marca configurada'],
        stack: ['LLM', 'n8n', 'Webhooks'],
      },
      {
        id: 'IT-05',
        nombre: 'Chatbot Multicanal',
        resumen:
          'Un solo cerebro conversacional en WhatsApp, sitio web, Instagram y Messenger, con historial unificado.',
        incluye: ['WhatsApp Business API', 'Widget web', 'Instagram y Messenger', 'Bandeja unificada'],
        stack: ['WhatsApp API', 'Meta Graph', 'n8n'],
      },
      {
        id: 'IT-06',
        nombre: 'Asistente Telefónico 24/7',
        resumen:
          'Agente de voz que contesta llamadas entrantes, resuelve dudas, toma datos y agenda citas a cualquier hora.',
        incluye: ['Voz natural en español', 'Agenda en tiempo real', 'Transcripción y resumen de llamadas', 'Transferencia a tu equipo'],
        stack: ['Retell AI', 'Telefonía IP', 'Cal.com'],
      },
      {
        id: 'IT-07',
        nombre: 'Cold Caller Bot Outbound',
        resumen:
          'Campañas de llamadas salientes con IA para reactivar bases, confirmar citas o prospectar, cumpliendo la regulación vigente.',
        incluye: ['Guiones dinámicos', 'Detección de interés', 'Registro en CRM', 'Validación contra listas de exclusión'],
        stack: ['Retell AI', 'n8n', 'CRM'],
      },
    ],
  },
  {
    id: 'auto',
    titulo: 'Automatización & Integraciones',
    bajada: 'Tus sistemas conectados: cero captura doble, cero leads perdidos.',
    icono: Workflow,
    color: '#E8621A',
    modulos: [
      {
        id: 'IT-08',
        nombre: 'Agenda y Reservas Automatizadas',
        resumen:
          'El cliente agenda solo; el sistema confirma, recuerda y reprograma por WhatsApp y correo.',
        incluye: ['Calendario sincronizado', 'Recordatorios automáticos', 'Pagos o anticipos opcionales', 'Reducción de inasistencias'],
        stack: ['Cal.com', 'WhatsApp API', 'Google Calendar'],
      },
      {
        id: 'IT-09',
        nombre: 'Funnels y Email Automatizado',
        resumen:
          'Secuencias que nutren prospectos según su comportamiento, con tracking de punta a punta.',
        incluye: ['Landing pages de campaña', 'Secuencias de correo', 'Tracking y píxeles', 'Pruebas A/B'],
        stack: ['n8n', 'Resend', 'GA4'],
      },
      {
        id: 'IT-10',
        nombre: 'Smart Promos',
        resumen:
          'Promociones que se activan solas según el comportamiento del usuario: el mensaje correcto en el momento correcto.',
        incluye: ['Disparadores por evento', 'Segmentación dinámica', 'Cupones únicos', 'Medición de redención'],
        stack: ['n8n', 'Supabase', 'WhatsApp API'],
      },
    ],
  },
  {
    id: 'datos',
    titulo: 'Datos & Inteligencia',
    bajada: 'Información accionable para decidir con números, no con intuición.',
    icono: Database,
    color: '#7FA8E8',
    modulos: [
      {
        id: 'IT-11',
        nombre: 'Scraper y Base de Datos de Prospectos',
        resumen:
          'Extracción y limpieza de datos públicos para construir bases de prospectos segmentadas, con revisión legal previa.',
        incluye: ['Extracción programada', 'Limpieza y deduplicado', 'Enriquecimiento de datos', 'Exportación a CRM'],
        stack: ['Python', 'PostgreSQL', 'n8n'],
      },
      {
        id: 'IT-12',
        nombre: 'Diagnóstico Comercial con IA',
        resumen:
          'Análisis de tu proceso comercial con IA para detectar fugas en el embudo y priorizar dónde invertir.',
        incluye: ['Auditoría del embudo', 'Benchmark del sector', 'Hoja de ruta priorizada', 'Indicadores de seguimiento'],
        stack: ['LLM', 'Python', 'Dashboards'],
      },
      {
        id: 'IT-13',
        nombre: 'Dashboards Comerciales',
        resumen:
          'Tableros en tiempo real de leads, conversiones y ventas conectados a tus fuentes de datos.',
        incluye: ['KPIs en tiempo real', 'Alertas automáticas', 'Acceso por roles', 'Reportes programados'],
        stack: ['Supabase', 'Chart.js', 'SQL'],
      },
    ],
  },
  {
    id: 'apps',
    titulo: 'Apps & Plataformas',
    bajada: 'Software a la medida para operar, vender y retener.',
    icono: Smartphone,
    color: '#E8621A',
    modulos: [
      {
        id: 'IT-14',
        nombre: 'Desarrollo de Apps iOS / Android',
        resumen:
          'Aplicaciones móviles y web a la medida, desde el MVP hasta su publicación en tiendas.',
        incluye: ['Diseño UX/UI', 'Backend y API propios', 'Publicación en App Store y Google Play', 'Releases por sprints'],
        stack: ['React Native', 'Node.js', 'Supabase'],
      },
      {
        id: 'IT-15',
        nombre: 'Suscripciones y Membresías',
        resumen:
          'Plataforma de cobro recurrente con portal de miembros, niveles de acceso y control de bajas.',
        incluye: ['Cobro recurrente', 'Portal de miembros', 'Niveles y beneficios', 'Métricas de retención'],
        stack: ['Stripe Billing', 'Next.js', 'Supabase'],
      },
      {
        id: 'IT-16',
        nombre: 'Marketplaces y Plataformas',
        resumen:
          'Integración de tu catálogo con marketplaces y plataformas especializadas, con inventario centralizado.',
        incluye: ['Publicación multicanal', 'Sincronización de stock', 'Pedidos centralizados', 'Reportes por canal'],
        stack: ['APIs de marketplaces', 'n8n', 'SQL'],
      },
    ],
  },
]

export const stack = [
  'Next.js', 'React', 'TypeScript', 'Node.js', 'Python', 'Tailwind CSS', 'Framer Motion',
  'Supabase', 'PostgreSQL', 'MySQL', 'n8n', 'OpenAI', 'Retell AI', 'WhatsApp Business API',
  'Cal.com', 'Vercel', 'Stripe', 'Mercado Pago', 'React Native', 'Google Cloud', 'GA4', 'Zod',
]

export const WHATSAPP_IT = `https://wa.me/525611232604?text=${encodeURIComponent(
  'Hola MarkaLab, vengo de la página de Soluciones IT y quiero cotizar un proyecto.'
)}`
