# Versiones · Landing Talleres

## v2.5 · 17 de noviembre de 2026

- Vercel Web Analytics: script `/_vercel/insights/script.js` en `layout.tsx` (mide visitas a /talleres).

## v2.4 · 11 de noviembre de 2026

- Coche cambiado por el **render nuevo** (PORCHE_UP/Porsche_GT4RS.glb): conserva sus materiales
  de alta calidad (interior de piel, fibra de carbono con relieve, barniz, discos de freno con
  textura). Sigue en **amarillo**.
- Se quitaron letreros, "GT4", tapas de rin, placas y la marca del costado de las llantas.
- El vidrio con "transmisión" se cambió por transparencia normal: se ve igual en la escena y
  cuesta la mitad de trabajo a la tarjeta gráfica.
- **Sin abolladuras**: la carrocería, cristales, faros y calaveras conservan su malla y sus
  normales originales (no se simplifican) y la compresión guarda las normales a 12 bits. Solo se
  aligeran piezas de detalle (rejillas, interior, rines) con un error máximo de medio milímetro.
- Rines sin el efecto "anisotrópico" (sin tangentes, three.js lo pintaba blanco quemado) y
  micas de faros con reflejo bajo, para que no parezcan encendidos.
- Escritorio: `car.glb` 11 MB (de 93 MB), texturas 1024. Celular: `car-lite.glb` 6.6 MB.

## v2.3 · 10 de noviembre de 2026

- Sin el crédito del modelo 3D en el pie.

- **Más fluida en celular**: en pantallas táctiles el scroll se lee en cada cuadro (no por
  eventos, que llegan a saltos); el texto se desplaza menos y sus revelados son más cortos y
  con GPU; la barra de direcciones ya no provoca volver a medir la página; el coche usa una
  versión ligera (`public/models/car-lite.glb`, 1.2 MB, ~175 mil vértices) y menos resolución.
- **Coche amarillo** por defecto (el gris oscuro sale de la paleta) y **menos reflejos**: luces
  del estudio más bajas, pintura sólida con barniz suave.
- **Entrada nueva**: el coche llega desde el fondo de la bahía con los faros encendidos; al
  quedar al frente destella dos veces y los apaga. Después los faros quedan apagados en todas
  las etapas (solo destellan al autorizar).

## v2.2 · 10 de noviembre de 2026

- Coche cambiado al modelo que eligió MarkaLab en CGTrader (autor: goldenobjects, licencia
  Royalty Free, uso comercial permitido): deportivo de motor central, coupé. Sin letreros,
  emblemas, tapas de rin ni placas. Crédito en el pie.
- `Car.tsx`: las piezas se reconocen por prefijo de nombre (`shell_`, `seat_`, `cabin_`,
  `wheelN_spin_`, `wheelN_fix_`). La pintura usa material físico con barniz.

## v2.1 · 10 de noviembre de 2026

- Coche cambiado a un superdeportivo real (modelo base de vicent091036, Sketchfab), **sin
  ninguna marca**: se quitaron escudos, emblemas, tapas de rin, centro del volante y letreros.
  Ver `public/models/LICENCIA-car.txt`. `Car.tsx` ahora lee las piezas de la tabla `PARTS`.
- Pie y datos legales sin RFC; domicilio: Jardines de la Montaña, Tlalpan, C.P. 14210, CDMX.

## v2.0 · 10 de noviembre de 2026

- (Sustituido en v2.1) **Coche nuevo: modelo 3D real** en lugar del generado con código. `public/models/car.glb`
  (3.3 MB, comprimido con meshopt y texturas WebP). Basado en "Car Concept" de Eric Chadwick /
  Darmstadt Graphics Group, licencia CC BY 4.0; el crédito sale en el pie de la página y en
  `public/models/LICENCIA-car.txt`. Se le quitaron la placa y los logotipos de Khronos.
- Mismas funciones que la v1: entrada a la bahía, elevador, radiografía con anillo de escaneo,
  vista explotada (carrocería arriba, puertas hacia afuera, asientos, ruedas separadas), cambio de
  pintura, giro arrastrando, cambio de luces (ahora también direccionales) y salida.
- `Car.tsx` reescrito: carga el modelo con `useGLTF`, lo orienta, lo escala a 4.84 m y lo separa en
  grupos por nombre de pieza. `carGeometry.ts` ya no existe.
- **Sin parpadeo**: el resplandor (Bloom) solo toma las luces del coche y ya no los reflejos del
  cofre; las luces del estudio bajaron de intensidad; el ajuste automático de calidad cambia una
  sola vez en lugar de ir y venir.

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
- Pie con el responsable: Oscar Fernando Esperón Vallejo, bajo la marca MarkaLab, y su domicilio (apoya la verificación del negocio en Meta).
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
