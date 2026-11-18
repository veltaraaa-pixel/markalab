import { stack } from './data'

function Fila({ items, reversa }: { items: string[]; reversa?: boolean }) {
  const doble = [...items, ...items]
  return (
    <div className="flex overflow-hidden">
      <ul className={`${reversa ? 'it-marquee-rev' : 'it-marquee'} flex shrink-0 gap-4 pr-4`}>
        {doble.map((t, i) => (
          <li
            key={`${t}-${i}`}
            aria-hidden={i >= items.length}
            className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 font-mono text-sm text-[#F0EBE3]/70 transition-colors hover:border-[#E8621A]/60 hover:text-[#F0EBE3]"
          >
            <span className="mr-2 text-[#E8621A]">▹</span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function StackMarquee() {
  const mitad = Math.ceil(stack.length / 2)
  return (
    <section aria-label="Tecnologías con las que trabajamos" className="relative bg-[#0A1020] py-14">
      <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.3em] text-[#F0EBE3]/40">
        Stack moderno · probado en producción
      </p>
      <div className="it-marquee-wrap relative space-y-4 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <Fila items={stack.slice(0, mitad)} />
        <Fila items={stack.slice(mitad)} reversa />
      </div>
    </section>
  )
}
