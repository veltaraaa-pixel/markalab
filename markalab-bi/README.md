# MarkaLab BI

Plataforma de inteligencia comercial y planeación integrada para marcas que venden a través de canal departamental. Construida como demostración ejecutiva sobre la estructura real del canal mexicano: Liverpool, El Palacio de Hierro, Sears y Sanborns, 90 sucursales en 42 ciudades de 26 estados, 10 colecciones y 31 modelos.

**Los datos son simulados.** No corresponden a cifras de ninguna empresa ni de ninguna cadena. El generador es determinista: la misma semilla produce siempre las mismas cifras, así que nadie ve números distintos entre dos aperturas de la demostración.

---

## Levantar en local

```bash
npm install
npm run dev          # http://localhost:3000
```

Para probar la versión de producción:

```bash
npm run build && npm start
```

No necesita base de datos, ni API, ni ninguna variable de entorno para funcionar completa.

---

El montaje completo —repositorio, ramas, Vercel, DNS, n8n, base y el ensayo del día anterior— está en **`DESPLIEGUE.md`**. Lo que sigue es el resumen.

## Publicar en un subdominio

### 1. Subir el repositorio

```bash
git init && git add -A && git commit -m "MarkaLab BI"
git remote add origin git@github.com:<tu-org>/markalab-bi.git
git push -u origin main
```

### 2. Importar en Vercel

En [vercel.com/new](https://vercel.com/new), importa el repositorio. Vercel detecta Next.js solo; no hay que cambiar nada de la configuración de build.

### 3. Conectar el subdominio

En **Project → Settings → Domains**, agrega el subdominio, por ejemplo `bi.markalab.com.mx`. Vercel te dará un registro para crear en el DNS de tu dominio:

| Tipo  | Nombre | Valor                   | TTL  |
| ----- | ------ | ----------------------- | ---- |
| CNAME | `bi`   | `cname.vercel-dns.com.` | Auto |

El valor exacto lo muestra Vercel en esa pantalla: **cópialo de ahí, no de esta tabla**, porque cambia según la cuenta.

Notas que ahorran una hora de depuración:

- El **Nombre** es solo el subdominio (`bi`), no el dominio completo. Algunos paneles de DNS sí piden el completo; depende del proveedor.
- Si `markalab.com.mx` está en Cloudflare, pon la nube **gris** (DNS only), no naranja. El proxy de Cloudflare sobre Vercel rompe la emisión del certificado.
- La propagación tarda de un minuto a una hora. El certificado HTTPS lo emite Vercel solo, en cuanto el registro resuelve.

### 4. Variables de entorno (opcional)

En **Project → Settings → Environment Variables**, para Production:

| Variable              | Valor                                     |
| --------------------- | ----------------------------------------- |
| `N8N_WEBHOOK_URL`       | Production URL del nodo `[ML-BI] Webhook - Copiloto` |
| `N8N_APRENDER_URL`      | Vacía: se deriva sola de la anterior                 |
| `N8N_WEBHOOK_TOKEN`     | Token, si proteges los webhooks                      |
| `COPILOTO_TIMEOUT_MS`   | `4000`                                               |
| `APRENDER_TIMEOUT_MS`   | `2500`                                               |
| `BI_CLIENTE_ID`         | `0` en la demostración                               |
| `NEXT_PUBLIC_BI_FUENTE` | `sintetica` en la demostración, `api` con un cliente |

Sin estas variables la plataforma funciona completa: el copiloto responde con su motor de reglas y lo declara en pantalla.

---

## El copiloto

Dos capas, y el orden importa.

**1. Motor de reglas** (`lib/copiloto.ts`). Determinista, explicable y siempre disponible. Nueve reglas que leen el corte y producen hallazgos con su impacto en pesos. Cada hallazgo declara la regla que lo disparó y los números que la cumplieron: en la pantalla se puede abrir y ver la regla literal.

**2. Modelo de lenguaje vía n8n** (`app/api/copiloto/route.ts`). Redacta, prioriza y contesta preguntas abiertas **sobre los hallazgos que la capa 1 ya calculó**. No inventa cifras porque no las calcula: las recibe.

### La red de seguridad

El navegador nunca llama a n8n directamente; llama a `/api/copiloto`, y ese endpoint llama a n8n. Así la URL del webhook y su credencial viven solo en el servidor.

Si n8n no responde en `COPILOTO_TIMEOUT_MS`, devuelve un error, o no está configurado, el endpoint responde `{ fuente: "local" }` y la página contesta con su motor de reglas. La pantalla declara cuál de las dos contestó y en cuántos milisegundos.

Las cuatro rutas están probadas:

| Situación             | Resultado                               |
| --------------------- | --------------------------------------- |
| n8n responde          | `fuente: "n8n"`, ~20 ms en local         |
| n8n devuelve 500      | `fuente: "local"`, motivo `n8n-error`    |
| n8n tarda 9 s         | `fuente: "local"` a los 4 s exactos      |
| Sin variable          | `fuente: "local"`, motivo `sin-configurar` |

### Tres capas, no dos

**3. Memoria** (migración 014 y la rama de aprendizaje del workflow). Cada vez que el equipo marca una recomendación como útil, la descarta o registra una decisión, eso se destila en una lección de una línea y se guarda en Supabase. En la siguiente consulta esa lección entra al prompt bajo el título *lo que ya aprendiste de este equipo*. Es lo que vuelve autodidacta al copiloto.

La destilación **no pasa por el modelo**, a propósito. Una memoria que se puede leer renglón por renglón se discute en una junta; una que nadie puede auditar, se cree o no se cree. Cada lección queda escrita con las palabras del propio equipo y con la fecha en que las dijo.

Un rechazo pesa más que un acierto: repetirle a un director algo que ya descartó cuesta más credibilidad de la que gana un buen hallazgo.

### Instalar el flujo

Los pasos completos están en `DESPLIEGUE.md`, sección 3. En corto:

1. **Workflows → Import from File**, cargar `01_workflows/ML-BI_Copiloto_v1-0.json` de la carpeta de la entrega.
2. Asignar las credenciales existentes: `Anthropic account`, `Supabase` y `Gmail account`. Los nombres van letra por letra — el respaldo de n8n guarda el nombre, nunca la llave.
3. **Settings → Error Workflow**: elegir este mismo workflow.
4. Correr `02_sql/014_ML-BI_Memoria_copiloto_v1-0.sql` en Supabase.
5. Activar, copiar la Production URL del nodo `[ML-BI] Webhook - Copiloto` y pegarla en `N8N_WEBHOOK_URL`.

El flujo trae su propio respaldo: si el modelo falla, el nodo **Respaldo** devuelve texto vacío a propósito, que la plataforma interpreta como «sin modelo». Nunca se devuelve un error al navegador. Las tres escrituras a Supabase llevan `onError: continueRegularOutput`, así que una base caída tampoco tumba la respuesta.

---

## Qué hay en cada pantalla

| Pantalla                 | Qué resuelve                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| **Resumen**              | Salud del canal en una pantalla: sell-in contra sell-out, cobertura por cadena, qué atender         |
| **Mapa de alertas**      | Semáforo por estado sobre el mapa real, con una bandera por sucursal con alerta                     |
| **Qué atender**          | Las decisiones de la semana en orden: trasladar, no embarcar, resurtir, liquidar                    |
| **Detalle por tienda**   | El detalle crudo a nivel tienda × modelo, filtrable y ordenable                                     |
| **Escenarios**           | Supuestos editables que se propagan por el modelo hasta EBITDA                                      |
| **Estado de resultados** | P&L proyectado por trimestre, contra el plan comprometido                                           |
| **Copiloto**             | Hallazgos priorizados, explicables y accionables, con bitácora de decisiones                        |
| **Salud del dato**       | Qué porcentaje del negocio es visible y cómo se calcula cada métrica                                |

---

## La jerarquía de filtros

La barra superior filtra en cinco dimensiones, más el umbral:

```
Estado  ->  Ciudad  ->  (sucursal)
Cadena
Colección  ->  Modelo (SKU)
```

Las listas se encadenan: elegir un estado deja solo sus ciudades, y elegir una colección deja solo sus referencias. Cambiar el padre limpia al hijo, así nunca queda una combinación imposible como Jalisco + Cancún. El botón **Quitar filtros** muestra cuántos hay puestos.

**Colección y modelo no son lo mismo.** Tsuyosa es la colección; `CTZ-TS1525 · Tsuyosa Acero Azul 40mm` es el modelo. Las alertas, los traslados y el resurtido se calculan siempre al nivel de modelo, porque es el nivel al que se embarca: un quiebre de `CTZ-TS1525` no se cubre con un `CTZ-TS1402`, aunque sean la misma colección. Los indicadores se pueden leer agregados en cualquiera de los tres niveles de la jerarquía de producto: segmento, colección, modelo.

## Las fórmulas

Están declaradas en el código y se pueden discutir renglón por renglón. La pantalla **Salud del dato** las muestra todas.

```
desplazamiento semanal = Σ sell-out últimas 8 semanas ÷ 8
semanas de cobertura   = existencia ÷ desplazamiento semanal
piezas sobre umbral    = existencia − (desplazamiento × umbral)
capital inmovilizado   = piezas sobre umbral × costo unitario
venta perdida semanal  = desplazamiento × precio de lista      (solo si existencia = 0)
resurtido sugerido     = stock objetivo − existencia − tránsito
impacto en pesos       = capital inmovilizado + venta perdida × 4
```

Propagación del modelo de planeación (`lib/plan.ts`):

```
unidades = base × crecimiento × efecto precio × servicio × mercadotecnia × anaquel
ingreso  = unidades × precio neto
costo    = unidades × costo unitario
margen   = ingreso − costo
EBITDA   = margen − gasto operativo − costo financiero del inventario
```

---

## Decisiones de diseño que conviene conocer

**Las banderas no llevan los logos de las cadenas.** Liverpool, El Palacio de Hierro, Sears y Sanborns son marcas registradas de terceros. Las banderas usan monogramas de diseño propio (`LIV`, `PDH`, `SEA`, `SAN`) en el color de casa de cada cadena. Se leen igual de rápido y no hay riesgo de marca. El componente está en `components/ui.tsx` si algún día se cuenta con assets autorizados.

**Los traslados exigen el mismo SKU y la misma cadena.** Una pieza ya embarcada es inventario del retailer que la compró; no se mueve de Liverpool a Sears. Entre cadenas distintas no hay traslado, hay renegociación de embarque. Y el modelo tiene que coincidir: el cliente que pidió el Acero Azul no se lleva el Acero Verde.

**Una tienda que no reporta sell-out no tiene cobertura calculable.** Sin denominador no hay cálculo. Esas sucursales muestran existencia pero aparecen *Sin dato* en vez de aparecer en verde, y se excluyen del excedente y de los traslados.

**El estado del mapa no es el promedio de sus tiendas.** Un estado con la mitad del surtido saturado y la otra mitad en quiebre promedia «sano». Por eso el color se decide por dónde está el dinero (capital parado contra venta perdida), no por la cobertura promedio.

**Los números se formatean a mano, no con `toLocaleString`.** Node y el navegador no siempre traen los mismos datos de localización, y la diferencia rompe la hidratación de React.

---

## Estructura

```
app/            Pantallas (App Router) y el endpoint /api/copiloto
components/     Shell, gráficas, mapa y componentes de interfaz
lib/
  catalog.ts    Cadenas, colecciones, modelos, estados, ciudades y sucursales
  engine.ts     Generador determinista, cálculo y agregaciones
  plan.ts       Escenarios, supuestos y propagación hasta EBITDA
  copiloto.ts   Motor de reglas y contexto que se envía al modelo
  geo.ts        Geometría de los 32 estados (generado, no editar a mano)
  store.tsx     Estado global: filtros, escenario activo, bitácora
  fuente.ts     La costura entre la demostración y un cliente real
scripts/        verificar.sh: una sola orden antes de cada despliegue
```

La geometría de `lib/geo.ts` viene de fronteras públicas de los estados mexicanos, simplificadas con Douglas-Peucker y proyectadas con una cónica conforme de Lambert, que es la proyección estándar para México.

---

## Lo que no está en este repositorio

El flujo de n8n del copiloto y la migración de Supabase **no viven aquí a propósito**. No se despliegan con el sitio: se importan a mano, una sola vez, en plataformas distintas. Tenerlos en el repositorio sugeriría que se publican con cada empuje, y no es así.

Viven en la carpeta de la entrega del módulo, junto con las guías:

```
Workflows/MkL/ML-BI/v1.0/
  01_workflows/ML-BI_Copiloto_v1-0.json          el copiloto, para importar en n8n
  02_sql/014_ML-BI_Memoria_copiloto_v1-0.sql     la memoria, para correr en Supabase
  03_guias/ML-BI_Guia_Instalacion_v1-0.pdf       el montaje, paso por paso
```

Esa misma convención es la del resto de los módulos de MarkaLab: el historial de migraciones vive en `INFRAESTRUCTURA/SQL`, porque la base es una sola y la comparten todos.

---

Construido por MarkaLab.
