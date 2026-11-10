# Versiones · Landing Talleres

## v1.2 · 10 de noviembre de 2026

Se publica dentro del sitio principal, en www.markalab.com.mx/talleres.

- `next.config.ts`: `output: 'export'`, `basePath: '/talleres'`. `npm run build` genera `out/`, que se copia a `public/talleres/` del repositorio `markalab`.
- La ruta `/api/lead` se movió al sitio principal como `/api/lead-talleres` (misma lógica). El formulario apunta ahí.
- `N8N_WEBHOOK_URL` ahora se configura en el proyecto de Vercel del sitio principal.
- Ya no hace falta un proyecto propio en Vercel ni el subdominio talleres.markalab.com.mx.

## v1.1 · 10 de noviembre de 2026

Configurada con los datos del sitio principal (www.markalab.com.mx).

- Aviso de privacidad enlazado en el formulario y en el pie (`LEAD.privacyUrl`, `BRAND.privacyUrl`).
- Nuevo bloque `BRAND` en `content.ts`: sitio, correo marketing@markalab.com.mx, teléfono, WhatsApp con mensaje de la campaña, domicilio y razón legal.
- Pie con razón legal: MarkaLab · Oscar Fernando Esperón Vallejo · RFC EEVO641226NY2 (apoya la verificación del negocio en Meta).
- Contacto directo bajo el formulario: WhatsApp, correo de marketing y enlace a markalab.com.mx.
- Logo oficial transparente (versión clara) en la barra superior: `public/logo-markalab-claro.png`.
- Dominio por defecto `https://talleres.markalab.com.mx` y URL canónica.

## v1.0 · 10 de noviembre de 2026

Primera versión como proyecto. Sustituye a los dos prototipos anteriores, que
eran una sola página HTML con el coche dibujado en SVG.

### Qué cambia respecto a los prototipos

| | Prototipos (HTML + SVG) | v1.0 |
|---|---|---|
| Coche | Dibujo plano de perfil, una sola vista | Modelo 3D generado con código; la cámara lo rodea |
| Reacción al scroll | Capas que se encienden y se apagan | Cámara, elevador, radiografía y despiece interpolados cuadro a cuadro |
| Interacción con el coche | Ninguna | Se gira arrastrando, se le cambia el color, sus piezas se tocan |
| Texto | Seis secciones con párrafos | Un titular y una acción por etapa |
| Tecnología | HTML, CSS y JavaScript a mano | Next.js 16, Tailwind 4, three.js / React Three Fiber, GSAP, Lenis, Motion |
| Formulario | Sin conexión | Conectado a n8n (W5) a través de `/api/lead` |
| Entrega | Vista previa | Repositorio listo para GitHub y despliegue |

### Qué incluye

- Seis etapas con coreografía 3D ligada al scroll (`lib/stages.ts`).
- Coche procedural: carrocería, cúpula de cristal, faldón, cortes de puerta,
  rines, frenos, luces y chasis interior (`scene/carGeometry.ts`, `scene/Car.tsx`).
- Elevador de tijera, piso reflejante, marcas de bahía (`scene/Bay.tsx`).
- Calculador de horas perdidas; su valor acelera el anillo de escaneo.
- Simulador de WhatsApp de ocho etapas con pausa en la autorización; al
  autorizar, el coche hace cambio de luces.
- Vista explotada con seis puntos enlazados a la lista de soluciones; la cámara
  se asoma a la pieza elegida.
- Formulario con validación doble, campo trampa y límite por IP; al enviarse,
  el coche sale de la bahía.
- Telón de carga, riel de etapas, barra de avance.
- Respaldo sin WebGL, modo de movimiento reducido, ajuste automático de calidad.

### Verificado en esta versión

- `npm run lint` y `npm run typecheck` sin observaciones.
- `npm run build` correcto sobre Next.js 16.
- Instalación limpia desde el zip (`npm ci`) seguida de compilación, sin errores.
- `npm audit --omit=dev`: cero vulnerabilidades en dependencias de producción.
- Recorrido completo en escritorio (1280 y 1440 px) y móvil (390 px), sin
  errores de consola.
- Formulario contra un webhook simulado: llega `name`, `company`, `email`,
  `phone`, `note`, `origen: landing_talleres`, `agendo: false`, con el `?k=`.
- Rechazos: datos inválidos (422), JSON roto (400), campo trampa lleno (se
  descarta sin llamar a n8n).

### No verificado

- Rendimiento en teléfonos reales. Las pruebas se hicieron en un navegador sin
  tarjeta gráfica, que es más lento que cualquier teléfono actual pero no
  equivale a probarlo en uno.
- Entrega real a n8n: se probó contra un webhook simulado, no contra W5.

### Pendiente

- Imagen para compartir en redes (Open Graph).
- La campaña de talleres necesita su propio enlace en los correos. Hoy
  `landing_url` en `cm_config` es un solo valor para todo el cliente 0 y lo usa
  la campaña de IT.
