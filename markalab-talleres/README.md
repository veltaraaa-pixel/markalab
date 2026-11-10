# Landing Talleres · MarkaLab

Landing de la campaña para talleres automotrices de alta gama. **Versión 1.1.**

La página es una orden de servicio. Un coche en 3D entra a la bahía y, conforme
el visitante baja, pasa por las seis etapas de un taller: recepción,
diagnóstico, autorización, intervención, calidad y entrega. En cada etapa hay
poco texto y una cosa que hacer.

| Etapa | Qué hace el coche | Qué hace el visitante |
|---|---|---|
| 01 Recepción | Entra a la bahía con las luces encendidas | Lee el titular |
| 02 Diagnóstico | Sube al elevador y se ve por dentro; un anillo lo escanea | Mueve el deslizador y ve cuántas horas se le van en llamadas |
| 03 Autorización | Espera arriba, de perfil | Recibe un auto en el simulador de WhatsApp y **autoriza** el trabajo |
| 04 Intervención | Se desarma en seis piezas | Toca cada pieza: es una de las seis soluciones |
| 05 Calidad | Se arma de nuevo | Lo gira arrastrando y le cambia el color |
| 06 Entrega | Al enviar el formulario, hace cambio de luces y se va | Deja sus datos |

---

## Con qué está hecha

| Herramienta | Para qué se usa aquí |
|---|---|
| **Next.js 16** (App Router) + **React 19** + **TypeScript** | La página, y la ruta `/api/lead` que recibe el formulario |
| **Tailwind CSS 4** | Todo el estilo; la paleta vive en `src/app/globals.css` |
| **three.js** + **React Three Fiber** + **drei** | El coche, la bahía y la cámara |
| **postprocessing** | El resplandor de las luces (solo en escritorio) |
| **GSAP** (ScrollTrigger, SplitText) | Titulares que se revelan por línea, contadores, botones magnéticos, telón de carga |
| **Lenis** | Scroll suave |
| **Motion** | El simulador de WhatsApp y las transiciones del formulario |
| **Zustand** | El estado que comparten la página y la escena 3D |

El coche **no es un modelo descargado**: se genera con código
(`src/components/scene/carGeometry.ts`). El repositorio no carga archivos 3D
pesados ni depende de la licencia de un tercero.

---

## 1 · Ponerla a andar en su computadora

Hace falta **Node.js 20 o más nuevo**. Para saber si ya lo tiene, abra una
terminal (en Windows: tecla Windows, escriba `cmd`, Enter) y escriba:

```
node -v
```

Si responde `v20…` o mayor, siga. Si no, instálelo desde https://nodejs.org
(el botón que dice LTS) y vuelva a abrir la terminal.

> **Importante: no trabaje dentro de OneDrive.** Al instalar, se crea una
> carpeta `node_modules` con decenas de miles de archivos, y OneDrive intenta
> sincronizarlos todos. Copie esta carpeta a un lugar fuera de OneDrive, por
> ejemplo `C:\dev\markalab-talleres`, y trabaje ahí.

Dentro de la carpeta del proyecto:

```
npm install
copy .env.example .env.local
npm run dev
```

(En Mac o Linux, `cp` en lugar de `copy`.)

Abra http://localhost:3000. Mientras `.env.local` conserve el valor
`REEMPLAZAR`, el formulario funciona en modo de prueba: muestra el mensaje de
éxito y escribe el lead en la terminal, sin mandar nada a n8n.

---

## 2 · Conectar el formulario a n8n

El formulario entrega cada lead al workflow **ML-Cold Mailing · W5 Entrada
desde la landing**, el mismo que usa la landing de IT.

1. Abra `.env.local` con el Bloc de notas.
2. En `N8N_WEBHOOK_URL` cambie `REEMPLAZAR` por el secreto del webhook: es el
   mismo valor de `?k=` que se configuró en SmartLead
   (`smartlead_webhook_secret` en la tabla `cm_config`).
3. Guarde y reinicie `npm run dev`.

Qué pasa con cada lead:

- Entra a `markalab.prospectos` con fuente `demo_web` y **no** a la secuencia
  en frío.
- A Óscar le llega el aviso por correo con los datos.
- En `cm_eventos` queda el evento `alta_desde_landing` con
  `origen: landing_talleres`, que es como se distingue de los leads de la
  landing de IT.

El secreto nunca llega al navegador: la página manda los datos a `/api/lead`
y es el servidor quien llama a n8n.

---

## 3 · Subirla a GitHub

1. Entre a https://github.com/new.
2. Nombre del repositorio: `markalab-talleres`. Márquelo **Private**. No
   active ninguna de las casillas de abajo (README, .gitignore, licencia): el
   proyecto ya los trae.
3. Clic en **Create repository**. GitHub le muestra una dirección que termina
   en `.git`; cópiela.
4. En la terminal, dentro de la carpeta del proyecto:

```
git init
git add .
git commit -m "Landing talleres v1.0"
git branch -M main
git remote add origin PEGUE_AQUI_LA_DIRECCION.git
git push -u origin main
```

`.env.local` y `node_modules` no se suben: están en `.gitignore`. Así el
secreto del webhook no queda en GitHub.

---

## 4 · Publicarla

### En Vercel (lo más corto)

1. https://vercel.com/new → elija el repositorio `markalab-talleres`.
2. Antes de dar **Deploy**, abra **Environment Variables** y agregue:
   - `N8N_WEBHOOK_URL` → la URL completa con su `?k=`
   - `NEXT_PUBLIC_SITE_URL` → el dominio final
   - `NEXT_PUBLIC_GA_ID` → el ID de Google Analytics, si se va a medir
3. **Deploy**. En un par de minutos da una dirección `…vercel.app`.
4. Para el dominio propio: **Settings → Domains**. Lo natural es un
   subdominio, por ejemplo `talleres.markalab.com.mx`.

A partir de ahí, cada `git push` publica solo.

### En servidor propio (Dokploy)

Es una aplicación Node normal:

```
npm ci
npm run build
npm start
```

Escucha en el puerto 3000 (o el que diga la variable `PORT`). Las mismas tres
variables de entorno se cargan en el panel de Dokploy.

---

## 5 · Cambiar cosas

| Quiero cambiar… | Archivo |
|---|---|
| Un titular, una cifra, un paso del simulador, las seis soluciones | `src/lib/content.ts` |
| Correo, teléfono, WhatsApp, razón legal, enlaces al sitio principal | `src/lib/content.ts`, bloque `BRAND` |
| Dónde se para la cámara en cada etapa, cuánto sube el elevador | `src/lib/stages.ts` |
| La silueta del coche | `src/components/scene/carGeometry.ts` (las curvas `deck`, `roofC`, `base`) |
| Colores y tipografía | `src/app/globals.css`, bloque `@theme` |
| Los colores de pintura que se pueden elegir | `src/lib/content.ts`, `RESULTS.paints` |
| Qué se manda a n8n | `src/app/api/lead/route.ts` |

Ningún texto está escrito dentro de los componentes.

---

## 6 · Cómo está armada

```
src/
  app/
    layout.tsx          fuentes, metadatos, Google Analytics opcional
    page.tsx            la página
    globals.css         paleta, tipografía y estilos de pieza
    api/lead/route.ts   recibe el formulario y lo entrega a n8n
  components/
    Experience.tsx      raíz: scroll, capas, carga de la escena
    scene/              todo lo que es WebGL
      Scene.tsx           lienzo, cámara, iluminación, efectos
      Car.tsx             el coche y sus estados
      carGeometry.ts      la forma del coche, generada con código
      Bay.tsx             piso, marcas, elevador
    sections/           las seis etapas
      Sections.tsx
      PhoneDemo.tsx       simulador de WhatsApp
      LeadForm.tsx        formulario
    ui/                 barra, riel de etapas, telón, botón, etiquetas
  lib/
    content.ts          textos y datos
    stages.ts           coreografía: un cuadro clave por etapa
    scroll.ts           convierte el scroll en "etapa de la orden"
    store.ts            estado compartido entre página y escena
    anchors.ts          une las etiquetas HTML con piezas del coche
  fonts/                Archivo y JetBrains Mono (licencia OFL, incluida)
```

**La idea central.** El scroll no dispara animaciones grabadas. Se traduce a
un número, la *etapa* (0 a 5, con decimales en las transiciones), y en cada
cuadro la escena coloca cámara y piezas según ese número. Por eso el coche
responde igual hacia adelante que hacia atrás, y nunca queda a medio camino.

---

## 7 · Lo que ya trae resuelto

- **Móvil primero.** En pantallas angostas el coche va arriba y el texto
  abajo; no se usa el piso reflejante ni el resplandor, que son lo más caro.
- **Carga.** three.js se descarga aparte: el texto y el botón principal no lo
  esperan.
- **Equipos lentos.** Si el equipo no sostiene el ritmo, la escena baja sola
  la resolución y apaga los efectos.
- **Sin WebGL.** La página funciona completa, con un fondo en lugar del coche.
- **Movimiento reducido.** Si el sistema del visitante lo pide, se apagan el
  scroll suave y los revelados.
- **Buscadores.** El texto sale en el HTML del servidor; no depende de que
  corra JavaScript.
- **Formulario.** Validación en navegador y en servidor, campo trampa contra
  bots, límite de cinco envíos por minuto por IP.
- **Fuentes.** Van dentro del repositorio; no se pide nada a Google.
- **Dependencias.** `npm audit --omit=dev` reporta cero vulnerabilidades en lo
  que se publica. Las herramientas de desarrollo (el revisor de código) traen
  ocho avisos de nivel moderado que no llegan al sitio.

---

## 8 · Antes de publicar

- [ ] Poner el secreto real en `N8N_WEBHOOK_URL` y enviar un formulario de
      prueba; confirmar que llega el correo a Óscar.
- [ ] Confirmar las tres cifras de la etapa de Calidad (−70 %, 0, +2 h) en
      `content.ts`. Son las de la versión anterior de la landing; conviene que
      salgan de un caso real o que se presenten como estimación.
- [x] Enlace del aviso de privacidad en `LEAD.privacyUrl` (`content.ts`). Listo en v1.1.
- [ ] Cargar `NEXT_PUBLIC_GA_ID` si se va a medir la campaña.
- [ ] Probarla en un teléfono real, no solo en la vista móvil del navegador.

---

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en http://localhost:3000 |
| `npm run build` | Compila para producción |
| `npm start` | Sirve lo compilado |
| `npm run lint` | Revisa el código |
| `npm run typecheck` | Revisa los tipos |

El historial de versiones está en [VERSIONES.md](./VERSIONES.md).
