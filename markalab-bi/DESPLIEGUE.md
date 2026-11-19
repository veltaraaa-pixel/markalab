# Montaje y despliegue

Este documento es el que se sigue de arriba abajo. Está escrito para que la
demostración y el primer cliente real sean **el mismo despliegue con otras
variables**, no dos proyectos distintos. Todo lo que cambia entre una cosa y la
otra está aislado en dos lugares: las variables de entorno y `lib/fuente.ts`.

---

## 0. Lo que hay que tener a la mano

| Qué | Dónde se consigue | Para qué |
| --- | --- | --- |
| Acceso a `github.com/veltaraaa-pixel` | Ya se tiene (es donde vive el sitio) | Alojar el repositorio |
| Acceso al proyecto de Vercel | Ya se tiene | Publicar |
| n8n en `tools.markalab.com.mx` | Migración de infraestructura | El copiloto |
| Credencial de n8n llamada **`Anthropic account`** | Ya existe (264 nodos la usan) | El modelo |
| Credencial de n8n llamada **`Supabase`** | Ya existe (497 nodos la usan) | La memoria |
| El subdominio decidido | Pendiente | La dirección de la demostración |

El nombre de las credenciales importa letra por letra. El respaldo de n8n guarda
el nombre de la credencial dentro del JSON pero **nunca la llave**: si el nombre
no coincide, los nodos quedan huérfanos al importar.

---

## 1. El repositorio

### 1.1 Crearlo

```bash
cd markalab-bi
git init
git add -A
git commit -m "MarkaLab BI v1.0 · plataforma, copiloto y memoria"
git branch -M main
git remote add origin git@github.com:veltaraaa-pixel/markalab-bi.git
git push -u origin main
```

Repositorio **privado**. Los datos son simulados y no hay secretos en el código,
pero la estructura comercial del canal y las fórmulas sí son trabajo de casa.

### 1.2 Las dos ramas y para qué sirve cada una

```
main   ->  lo que ve el cliente en el subdominio. Solo entra aquí lo probado.
trabajo ->  donde se desarrolla. Vercel le da su propia URL de vista previa.
```

```bash
git checkout -b trabajo
```

Cada empujón a `trabajo` genera una URL de vista previa distinta, con su propio
ambiente de variables. Esto resuelve el problema real de una demostración: se
puede enseñar un cambio sin tocar la dirección que el cliente ya tiene abierta.

Regla de la casa, la misma del sitio: **nunca se trabaja directamente sobre
`main` el día de una presentación.**

### 1.3 Lo que no entra al repositorio

Este repositorio contiene **solo lo que se despliega**: la aplicación. El flujo
de n8n y la migración de Supabase se quedan fuera a propósito, porque no se
publican con el sitio: se importan a mano, una sola vez, en otras dos
plataformas. Viven en la carpeta de la entrega del módulo, en `01_workflows/` y
`02_sql/`, junto con las guías.

`.gitignore` ya excluye `node_modules`, `.next`, `out` y cualquier `.env`. La
lección del sitio aplica igual aquí: si una variable vive solo en `.env.local`,
no llega a Vercel, porque GitHub Desktop no sube ese archivo. **Las variables se
cargan en el panel de Vercel, no en un archivo del repositorio.**

El paso 4 de `scripts/verificar.sh` comprueba justamente eso antes de cada
despliegue.

---

## 2. Vercel

### 2.1 Importar

En [vercel.com/new](https://vercel.com/new), importar `markalab-bi`. Vercel
detecta Next.js solo; no hay nada que cambiar en la configuración de compilación.

### 2.2 El subdominio

**Project → Settings → Domains**, agregar `bi.markalab.com.mx` (o el que se
decida). Vercel da un registro para crear en el DNS:

| Tipo | Nombre | Valor | TTL |
| --- | --- | --- | --- |
| CNAME | `bi` | el que muestra Vercel en esa pantalla | Auto |

Tres cosas que ahorran una hora:

- El **Nombre** es solo el subdominio (`bi`), no el dominio completo.
- Si el dominio está en Cloudflare, la nube va **gris** (DNS only). El proxy de
  Cloudflare sobre Vercel rompe la emisión del certificado.
- La propagación tarda de un minuto a una hora. El certificado lo emite Vercel
  solo en cuanto el registro resuelve.

### 2.3 Las variables

**Project → Settings → Environment Variables**. Se cargan las mismas claves en
*Production* y en *Preview*, con valores distintos si hace falta:

| Variable | Demostración | Cliente real |
| --- | --- | --- |
| `N8N_WEBHOOK_URL` | `https://tools.markalab.com.mx/webhook/ml-bi/copiloto` | la misma |
| `N8N_APRENDER_URL` | vacía (se deriva sola) | vacía |
| `N8N_WEBHOOK_TOKEN` | el que se defina | el mismo |
| `COPILOTO_TIMEOUT_MS` | `4000` | `4000` |
| `APRENDER_TIMEOUT_MS` | `2500` | `2500` |
| `BI_CLIENTE_ID` | `0` | el id del cliente en `markalab.clientes` |
| `NEXT_PUBLIC_BI_FUENTE` | `sintetica` | `api` |

**Que no apunte a n8n Cloud.** La nube se apaga en cuanto termine la migración y
el webhook se muere con ella. Si por lo que sea hoy solo existe la nube, la
plataforma sigue funcionando: contesta con su motor de reglas y lo declara en
pantalla. Pero frente a directivos conviene que la capa de modelo esté viva.

---

## 3. El copiloto en n8n

### 3.1 Importar

1. **Workflows → Import from File**, cargar `01_workflows/ML-BI_Copiloto_v1-0.json`
   de la carpeta de la entrega, no de este repositorio.
2. Abrir **`[ML-BI] Claude Sonnet 4.5`** y asignar la credencial `Anthropic account`.
3. Abrir los tres nodos de Supabase y asignar la credencial `Supabase`.
4. Abrir **`[ML-BI] Avisar a Sistemas`** y asignar `Gmail account`.
5. **Settings → Error Workflow**: elegir este mismo workflow. Sin eso el Error
   Trigger no dispara nunca.
6. Activar el workflow.
7. Copiar la **Production URL** del nodo `[ML-BI] Webhook - Copiloto` y pegarla
   en `N8N_WEBHOOK_URL` en Vercel. Volver a desplegar.

### 3.2 La base

Correr `02_sql/014_ML-BI_Memoria_copiloto_v1-0.sql`, de la carpeta de la
entrega, en el editor SQL de Supabase.
La migración es idempotente y trae su propio bloque de verificación comentado al
final. Copiar también el archivo a `INFRAESTRUCTURA/SQL/`, que es donde vive la
historia de la base.

Si Supabase no está listo el día de la demostración, no pasa nada: los tres
nodos llevan `onError: continueRegularOutput`, así que la consulta responde
igual y la memoria simplemente llega vacía.

### 3.3 Variable de n8n

En n8n, **Settings → Variables**, crear `AVISOS_CORREO` con el correo que debe
recibir los avisos de falla. Sin ella el aviso se manda a un destinatario
marcado como `REEMPLAZAR` y el nodo de Gmail falla sin consecuencias.

---

## 4. Antes de cada despliegue

```bash
bash scripts/verificar.sh
```

Cuatro pasos: tipos, compilación, integridad de los workflows de n8n y ausencia
de secretos en el repositorio. Si esto pasa, el despliegue pasa.

---

## 5. El ensayo, el día anterior

Esto no es opcional cuando la sala son directivos.

1. Abrir el subdominio desde una red que no sea la de la oficina (el celular en
   datos sirve).
2. Recorrer las ocho pantallas y confirmar que el mapa dibuja las banderas.
3. En **Copiloto**, hacer una pregunta y mirar la etiqueta: debe decir
   *Modelo vía n8n* y un número de milisegundos por debajo de 4000.
4. Marcar una recomendación como *No aplica aquí* y confirmar que dice
   *Aprendido*. Volver a preguntar y confirmar que no la repite.
5. Apagar el workflow en n8n a propósito y preguntar otra vez. Debe contestar el
   motor de reglas en menos de cuatro segundos y decirlo en pantalla.
   **Volver a encenderlo.**
6. Exportar a Excel desde **Detalle por tienda** y abrir el archivo.

El punto 5 es el que vale: deja comprobado, frente a uno mismo, que la
demostración no depende de que una red ajena se porte bien.

---

## 6. De la demostración a producción

Esta es la razón por la que todo lo anterior está dividido así. Para conectar un
cliente real, el trabajo es:

1. **Datos.** Implementar la fuente `api` en `lib/fuente.ts`. Es una sola
   función que devuelve un `Dataset` con la forma que declara `engine.ts`. Las
   fórmulas, las reglas del copiloto y las ocho pantallas no se tocan.
2. **Variables.** `NEXT_PUBLIC_BI_FUENTE=api` y `BI_CLIENTE_ID=<el del cliente>`.
3. **Memoria.** Nada. La tabla ya separa por `cliente_id`; cada marca aprende por
   su lado desde el primer día.
4. **Workflow.** Nada. El mismo workflow sirve para todos los clientes: el
   `cliente_id` viaja en la petición.

Lo que sigue sin resolver, y conviene decirlo en voz alta antes de prometerlo:
de dónde salen los datos reales de sell-out. Ese es el verdadero proyecto de
implementación —archivo semanal de cada cadena, portal de proveedores, o un
levantamiento en piso— y no lo resuelve el código. La plataforma está lista para
recibirlos el día que existan.
