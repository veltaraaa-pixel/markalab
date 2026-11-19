'use client'

/* ------------------------------------------------------------------ */
/*  Avatar de Kala                                                     */
/*                                                                     */
/*  Dos poses: la cabeza (icono flotante, encabezado, modo voz) y el   */
/*  cuerpo completo (cuando el chat está abierto).                     */
/*                                                                     */
/*  Capas:                                                             */
/*   1. la imagen completa (casco)                                     */
/*   2. dentro del visor, la misma imagen desplazada unos px: es la    */
/*      cara que "voltea" hacia el cursor                              */
/*   3. párpados que parpadean y el reflejo del cristal                */
/*                                                                     */
/*  El movimiento se controla con dos variables CSS en el contenedor:  */
/*  --kx y --ky (de -1 a 1). KalaWidget las escribe al mover el mouse. */
/*  Todo es transform/opacity: corre en GPU y no provoca reflow.       */
/*  Los estilos viven en src/app/globals.css (bloque "Kala").          */
/* ------------------------------------------------------------------ */

type Caja = { x: number; y: number; w: number; h: number }
type Pose = {
  src: string
  ancho: number
  alto: number
  // visor en % de la imagen: centro y radios
  visor: { cx: number; cy: number; rx: number; ry: number }
  ojos: Caja[]
  luces: Caja[]
  amplitud: number   // % que se desplaza la cara
  giro: number       // grados que se inclina la figura
}

const CABEZA: Pose = {
  src: '/kala/kala-cabeza.webp',
  ancho: 574,
  alto: 432,
  visor: { cx: 50.1, cy: 55.6, rx: 34.1, ry: 32.4 },
  ojos: [
    { x: 31.0, y: 51.4, w: 14.6, h: 17.1 },
    { x: 56.1, y: 51.4, w: 13.2, h: 17.1 },
  ],
  luces: [
    { x: 0, y: 42, w: 4.5, h: 34 },
    { x: 95.5, y: 42, w: 4.5, h: 34 },
  ],
  amplitud: 2.4,
  giro: 5,
}

const CUERPO: Pose = {
  src: '/kala/kala-cuerpo.webp',
  ancho: 563,
  alto: 572,
  visor: { cx: 43.2, cy: 21.3, rx: 16.0, ry: 12.2 },
  ojos: [
    { x: 34.3, y: 20.1, w: 8.0, h: 6.5 },
    { x: 46.9, y: 20.1, w: 6.7, h: 6.5 },
  ],
  luces: [{ x: 14.5, y: 15, w: 3.5, h: 13 }],
  amplitud: 1.1,
  giro: 2,
}

export default function Kala({
  detallada = false,
  cuerpo = false,
  ojosRef,
  className = '',
  prioridad = false,
}: {
  /** con parpadeo, luces y reflejo animados */
  detallada?: boolean
  /** cuerpo completo en lugar de la cabeza */
  cuerpo?: boolean
  /** contenedor donde KalaWidget escribe --kx / --ky */
  ojosRef?: React.RefObject<HTMLDivElement>
  className?: string
  prioridad?: boolean
  /** compatibilidad con la versión SVG anterior; ya no se usa */
  idClip?: string
}) {
  const p = cuerpo ? CUERPO : CABEZA
  const { cx, cy, rx, ry } = p.visor

  return (
    <div
      ref={ojosRef}
      aria-hidden="true"
      className={`kala-fig relative ${detallada ? 'kala-viva' : ''} ${className}`}
      style={{
        aspectRatio: `${p.ancho} / ${p.alto}`,
        ['--kamp' as string]: `${p.amplitud}%`,
        ['--kgiro' as string]: `${p.giro}deg`,
        ['--korigen' as string]: `${cx}% ${cy}%`,
      } as React.CSSProperties}
    >
      <div className="kala-giro absolute inset-0">
        {/* 1. casco completo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.src} alt="" draggable={false}
          width={p.ancho} height={p.alto}
          decoding="async" loading={prioridad ? 'eager' : 'lazy'}
          className="absolute inset-0 h-full w-full select-none"
        />

        {/* luces de las orejas */}
        {detallada && p.luces.map((l, i) => (
          <span
            key={i}
            className="kala-luz absolute"
            style={{ left: `${l.x}%`, top: `${l.y}%`, width: `${l.w}%`, height: `${l.h}%` }}
          />
        ))}

        {/* 2. visor: la cara que voltea */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `ellipse(${rx}% ${ry}% at ${cx}% ${cy}%)` }}
        >
          <div className="kala-mirada absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.src} alt="" draggable={false}
              width={p.ancho} height={p.alto}
              decoding="async" loading={prioridad ? 'eager' : 'lazy'}
              className="absolute inset-0 h-full w-full select-none"
            />
            {/* 3. párpados */}
            {detallada && p.ojos.map((o, i) => (
              <span
                key={i}
                className="kala-parpado absolute"
                style={{
                  left: `${o.x}%`, top: `${o.y}%`, width: `${o.w}%`, height: `${o.h}%`,
                  animationDelay: i ? '.04s' : undefined,
                }}
              />
            ))}
          </div>
          {/* reflejo del cristal: se mueve al revés que la cara */}
          {detallada && (
            <span
              className="kala-reflejo absolute inset-0"
              style={{
                background: `radial-gradient(${rx * 0.55}% ${ry * 0.4}% at ${cx - rx * 0.42}% ${cy - ry * 0.58}%, rgba(255,255,255,.22), transparent 70%)`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
