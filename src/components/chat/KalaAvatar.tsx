'use client'

/* ------------------------------------------------------------------ */
/*  Avatar                                                             */
/* ------------------------------------------------------------------ */
export default function Kala({ detallada = false, ojosRef, idClip }: {
  detallada?: boolean
  ojosRef?: React.RefObject<SVGGElement>
  // cada instancia en pantalla necesita su propio id de recorte
  idClip?: string
}) {
  const id = idClip || (detallada ? 'kalaClip' : 'kalaClipMini')
  return (
    <svg viewBox="0 0 200 200" className="block h-full w-full" aria-hidden="true">
      <circle cx="100" cy="100" r="96" fill="#1E2A4A" />
      <circle
        cx="100" cy="100" r="95"
        fill="none" stroke="#E8621A" strokeWidth="7" strokeLinecap="round"
        className={detallada ? 'kala-anillo' : ''}
      />
      <clipPath id={id}><circle cx="100" cy="100" r="92" /></clipPath>
      <g clipPath={`url(#${id})`} className={detallada ? 'kala-cara' : ''}>
        <path d="M40 120c0-45 26-76 60-76s60 31 60 76v96H40z" fill="#1E2A4A" />
        <ellipse cx="100" cy="124" rx="52" ry="63" fill="#F0EBE3" />
        <path d="M58 200c4-20 20-30 42-30s38 10 42 30z" fill="#F0EBE3" />
        <path d="M46 84c9-28 29-43 54-43s45 15 54 43v8H46z" fill="#1E2A4A" />
        {detallada && (
          <>
            <path d="M74 96q26-16 52 0" fill="none" stroke="#1E2A4A" strokeWidth="4" strokeLinecap="round" />
            <path d="M70 62q30-11 60 0" fill="none" stroke="#A8441A" strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="60" cy="86" rx="9" ry="7" fill="#B94F26" transform="rotate(-20 60 86)" />
            <ellipse cx="140" cy="86" rx="9" ry="7" fill="#B94F26" transform="rotate(20 140 86)" />
            <path d="M68 108q11-7 22-1" fill="none" stroke="#B9B3AA" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M110 107q11-6 22 1" fill="none" stroke="#B9B3AA" strokeWidth="2.6" strokeLinecap="round" />
          </>
        )}
        <g ref={ojosRef}>
          <g className={detallada ? 'kala-ojo' : ''}>
            <ellipse cx="76" cy="126" rx="16" ry="10" fill="#E8621A" />
            <circle cx="79" cy="126" r="5.6" fill="#1E2A4A" />
            {detallada && <circle cx="81" cy="123.6" r="1.9" fill="#fff" />}
          </g>
          <g className={detallada ? 'kala-ojo kala-ojo-der' : ''}>
            <ellipse cx="124" cy="126" rx="16" ry="10" fill="#E8621A" />
            <circle cx="127" cy="126" r="5.6" fill="#1E2A4A" />
            {detallada && <circle cx="129" cy="123.6" r="1.9" fill="#fff" />}
          </g>
        </g>
        <path d="M82 156q18 15 36 0" fill="none" stroke="#1E2A4A" strokeWidth="5.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}

