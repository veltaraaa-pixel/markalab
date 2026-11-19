# MarkaLab · Sitio web

Sitio de www.markalab.com.mx. Next.js 14 + Tailwind, publicado en Vercel.
Cada `git push` a `main` publica solo.

## Estructura

```
src/                     el sitio (lo único que compila Vercel)
  app/                   páginas y rutas de API
    page.tsx             inicio
    servicios/           nuestra-formula/  diagnostico/  contacto/
    soluciones-it/       landing de la campaña IT
    demo/                demo del Cold Caller (+ /demo/gracias)
    aviso-de-privacidad/
    api/
      chat/              puente de chat desde el servidor (respaldo; Kala llama directo a n8n)
      demo-cold-caller/  demo/agendar  demo/horarios  demo/verificar
      lead-talleres/     formulario de la landing de Talleres → n8n (W5)
    layout.tsx           Navbar, Footer, WhatsApp, Kala y Vercel Analytics
  components/            piezas de cada página (home, servicios, it, demo, chat, layout, ui…)
  data/                  textos y datos en JSON (contacto, servicios, fórmula, resultados)
  lib/                   utilidades
public/
  logo-markalab.png        logo para fondos claros
  logo-markalab-claro.png  logo para fondos oscuros
  kala/                    avatar de Kala: cabeza (icono) y cuerpo completo (chat abierto)
  talleres/                landing de Talleres YA COMPILADA (no se edita a mano)
landings/
  talleres/                código fuente de la landing de Talleres (proyecto aparte, Next 16)
```

## Páginas en línea

| Ruta | Qué es |
|---|---|
| `/` | Inicio |
| `/servicios`, `/nuestra-formula`, `/diagnostico`, `/contacto` | Sitio principal |
| `/soluciones-it` | Landing de campaña IT |
| `/talleres` | Landing de campaña Talleres (coche 3D) |
| `/demo` | Demo del Cold Caller |
| `/aviso-de-privacidad` | Aviso de privacidad |

## Variables de entorno

Todas están explicadas en `.env.example` (qué hace cada una y qué workflow de n8n usa).

- **Kala (chat):** `NEXT_PUBLIC_KALA_ENDPOINT` y `NEXT_PUBLIC_KALA_TOKEN` viven en `.env.production`,
  que SÍ se sube al repositorio: son públicas (viajan al navegador) y así Kala aparece en
  cualquier proyecto de Vercel.
- **Todo lo demás** (Retell, demo, Talleres) va en Vercel → Settings → Environment Variables.
- `.env.local` es solo para tu computadora y nunca se sube.

## Actualizar la landing de Talleres

1. `cd landings/talleres` → `npm install` → editar → `npm run build`.
2. Borrar `public/talleres/` y copiar ahí el contenido de `landings/talleres/out/`
   (sin `404`, `404.html` ni `_not-found`).
3. Commit y push.

## Analytics

Vercel Web Analytics: `<Analytics />` en `src/app/layout.tsx` y el script
`/_vercel/insights/script.js` dentro de la landing de Talleres. Se activa en
Vercel → proyecto → pestaña Analytics → Enable.

## Avatar de Kala

`src/components/chat/KalaAvatar.tsx` arma el avatar con las imágenes de `public/kala/`:
la **cabeza** es el icono flotante (chat cerrado) y el **cuerpo completo** aparece al abrir el chat
(junto al panel en escritorio, arriba de la conversación en celular). La cara dentro del visor sigue
el cursor, parpadea y las luces de las orejas pulsan. Las posiciones del visor y los ojos están en
porcentaje dentro del archivo: si cambias las imágenes, ajusta esos números. Estilos en
`src/app/globals.css` (bloque "Kala · avatar"). Respeta "reducir movimiento" del sistema.
