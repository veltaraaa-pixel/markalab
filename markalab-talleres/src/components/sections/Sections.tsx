'use client';
/**
 * Sections.tsx · v1.0
 *
 * Las seis etapas de la orden de servicio. Cada una es poco texto y una cosa
 * que hacer: mover un deslizador, contestar un WhatsApp, tocar una pieza,
 * girar el coche, dejar los datos.
 *
 * El texto no está aquí: está en lib/content.ts.
 */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { AnimatePresence, motion } from 'motion/react';
import { Stage } from '@/components/ui/Stage';
import { Magnetic } from '@/components/ui/Magnetic';
import { PhoneDemo } from './PhoneDemo';
import { LeadForm } from './LeadForm';
import { BRAND, DEMO, HERO, LEAD, LEAK, RESULTS, SOLUTIONS, SOLUTIONS_HEAD, STAGES } from '@/lib/content';
import { goToStage } from '@/lib/scroll';
import { useShop } from '@/lib/store';

// Dónde se acomoda el bloque de texto. En móvil siempre abajo; el coche arriba.
const LEFT = 'items-end justify-start px-5 pb-8 sm:px-8 lg:items-center lg:px-[7vw] lg:pb-0';
const RIGHT = 'items-end justify-start px-5 pb-8 sm:px-8 lg:items-center lg:justify-end lg:pb-0 lg:pl-0 lg:pr-[10vw]';

function Tag({ i }: { i: number }) {
  return (
    <p data-rise className="label mb-4 flex items-center gap-3 text-amber-hot">
      <span className="h-px w-8 bg-amber" />
      {STAGES[i].n} · {STAGES[i].name}
    </p>
  );
}

/** Número que rueda hasta su valor cada vez que cambia. */
function Roll({ value, className }: { value: number; className?: string }) {
  const el = useRef<HTMLSpanElement>(null);
  const cur = useRef({ v: value });
  useEffect(() => {
    const t = gsap.to(cur.current, {
      v: value,
      duration: 0.7,
      ease: 'power3.out',
      onUpdate: () => {
        if (el.current) el.current.textContent = String(Math.round(cur.current.v));
      },
    });
    return () => {
      t.kill();
    };
  }, [value]);
  return (
    <span ref={el} className={className}>
      {Math.round(value)}
    </span>
  );
}

/* ------------------------------------------------------------ 01 Recepción */
export function Hero() {
  return (
    <Stage i={0} len={1.6} className={LEFT}>
      <div className="copy max-w-[760px]">
        <p data-rise className="label mb-5 flex items-center gap-3 text-amber-hot">
          <span className="h-px w-8 bg-amber" />
          Orden 4217 · Bahía 04
        </p>
        <h1 data-split className="display text-[clamp(44px,5.7vw,96px)]">
          {HERO.title[0]}
          <br />
          {HERO.title[1]}
        </h1>
        <p data-rise className="mt-6 max-w-[30ch] text-[17px] leading-snug text-muted sm:text-[19px]">
          {HERO.sub}
        </p>
        <div data-rise className="mt-7 flex flex-wrap gap-3">
          <Magnetic arrow onClick={() => goToStage(5)}>
            {HERO.cta}
          </Magnetic>
          <Magnetic variant="ghost" onClick={() => goToStage(2)}>
            {HERO.ghost}
          </Magnetic>
        </div>
      </div>
      <div data-rise className="label absolute bottom-8 right-8 hidden items-center gap-3 text-dim lg:flex" aria-hidden="true">
        Desliza
        <span className="relative block h-10 w-px overflow-hidden bg-line">
          <motion.span
            className="absolute inset-x-0 top-0 h-4 bg-amber"
            animate={{ y: [-16, 40] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
      </div>
    </Stage>
  );
}

/* ---------------------------------------------------------- 02 Diagnóstico */
export function Diagnostico() {
  const autos = useShop((s) => s.autos);
  const set = useShop((s) => s.set);
  const hours = (autos * LEAK.callsPerCar * LEAK.minutesPerCall) / 60;
  const fill = ((autos - LEAK.min) / (LEAK.max - LEAK.min)) * 100;
  return (
    <Stage i={1} len={1.7} className={RIGHT}>
      <div className="copy w-full max-w-[440px]">
        <Tag i={1} />
        <h2 data-split className="display text-[clamp(30px,3.2vw,48px)]">
          {LEAK.title}
        </h2>
        <div data-rise className="mt-7 flex items-end gap-4">
          <Roll value={hours} className="display tnum text-[clamp(96px,11.5vw,176px)] !leading-[0.78] text-amber" />
          <span className="pb-1 text-[17px] leading-tight text-muted">
            horas
            <br />
            al mes
          </span>
        </div>
        <div data-rise className="mt-8">
          <div className="label mb-1 flex items-baseline justify-between text-muted">
            <label htmlFor="autos">Autos al mes</label>
            <span className="tnum text-[15px] tracking-normal text-fg">{autos}</span>
          </div>
          <input
            id="autos"
            type="range"
            className="range"
            min={LEAK.min}
            max={LEAK.max}
            step={LEAK.step}
            value={autos}
            style={{ '--fill': `${fill}%` } as React.CSSProperties}
            onChange={(e) => set({ autos: Number(e.target.value) })}
          />
          <p className="label mt-2 text-muted">
            {LEAK.callsPerCar} llamadas × {LEAK.minutesPerCall} min por auto
          </p>
        </div>
      </div>
    </Stage>
  );
}

/* --------------------------------------------------------- 03 Autorización */
export function Autorizacion() {
  return (
    <Stage i={2} len={2} className={RIGHT}>
      <div className="copy w-full max-w-[350px]">
        <Tag i={2} />
        <h2 data-split className="display mb-5 text-[clamp(28px,2.55vw,38px)]">
          {DEMO.title[0]}
          <br />
          {DEMO.title[1]}
        </h2>
        <div data-rise>
          <PhoneDemo />
        </div>
      </div>
    </Stage>
  );
}

/* --------------------------------------------------------- 04 Intervención */
export function Soluciones() {
  const active = useShop((s) => s.stage === 3);
  const solution = useShop((s) => s.solution);
  const set = useShop((s) => s.set);
  const touched = useRef(false);

  // Mientras nadie toque nada, las piezas se van presentando solas.
  useEffect(() => {
    if (!active) {
      touched.current = false;
      set({ solution: null });
      return;
    }
    let i = 0;
    const first = window.setTimeout(() => !touched.current && set({ solution: 0 }), 900);
    const t = window.setInterval(() => {
      if (touched.current) return;
      i = (i + 1) % SOLUTIONS.length;
      set({ solution: i });
    }, 2800);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(t);
    };
  }, [active, set]);

  const pick = (i: number) => {
    touched.current = true;
    set({ solution: i });
  };

  return (
    <Stage i={3} len={2} className={LEFT}>
      <div className="copy w-full max-w-[470px]">
        <Tag i={3} />
        <h2 data-split className="display text-[clamp(30px,3.05vw,46px)]">
          {SOLUTIONS_HEAD.title[0]}
          <br />
          {SOLUTIONS_HEAD.title[1]}
        </h2>
        <ul data-rise className="mt-6 border-t border-line/70">
          {SOLUTIONS.map((sol, i) => {
            const on = solution === i;
            return (
              <li key={sol.n} className="border-b border-line/70">
                <button
                  type="button"
                  onClick={() => pick(i)}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && pick(i)}
                  aria-expanded={on}
                  className="relative flex w-full items-baseline gap-4 py-2 text-left sm:py-2.5 cursor-pointer"
                >
                  <span className={`label tnum transition-colors duration-300 ${on ? 'text-amber-hot' : 'text-dim'}`}>{sol.n}</span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[16.5px] font-semibold tracking-[-0.01em] transition-colors duration-300 ${on ? 'text-fg' : 'text-muted'}`}>
                      {sol.name}
                    </span>
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.span
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          className="block overflow-hidden text-[14px] leading-snug text-muted"
                        >
                          <span className="block pt-1">{sol.line}</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                  {on && <motion.span layoutId="sol-bar" className="absolute -left-3 top-2.5 bottom-2.5 w-[2px] bg-amber" />}
                </button>
              </li>
            );
          })}
        </ul>
        <p data-rise className="label mt-5 flex items-center gap-2.5 text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-ok" />
          {SOLUTIONS_HEAD.foot}
        </p>
      </div>
    </Stage>
  );
}

/* -------------------------------------------------------------- 05 Calidad */
export function Calidad() {
  const active = useShop((s) => s.stage === 4);
  const paint = useShop((s) => s.paint);
  const set = useShop((s) => s.set);
  const nums = useRef<(HTMLSpanElement | null)[]>([]);
  const played = useRef(false);

  useEffect(() => {
    if (!active || played.current) return;
    played.current = true;
    RESULTS.items.forEach((it, i) => {
      const o = { v: 0 };
      gsap.to(o, {
        v: it.v,
        duration: 1.6,
        delay: 0.25 + i * 0.15,
        ease: 'power3.out',
        onUpdate: () => {
          const el = nums.current[i];
          if (el) el.textContent = String(Math.round(o.v)).replace('-', '−');
        },
      });
    });
  }, [active]);

  return (
    <Stage i={4} len={1.7} className="items-end justify-center px-5 pb-8 sm:px-8 lg:pb-12">
      <div className="copy w-full max-w-[1040px]">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
          <div>
            <Tag i={4} />
            <h2 data-split className="display text-[clamp(28px,3.3vw,48px)]">
              {RESULTS.title}
            </h2>
          </div>
          <div data-rise className="flex items-center gap-4">
            <span className="label hidden text-dim sm:inline">{RESULTS.hint}</span>
            <div className="flex gap-2" role="group" aria-label="Color de pintura">
              {RESULTS.paints.map((p, i) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => set({ paint: i })}
                  aria-label={p.name}
                  aria-pressed={paint === i}
                  className={`h-8 w-8 rounded-full border-2 transition-transform duration-300 cursor-pointer ${paint === i ? 'scale-110 border-amber' : 'border-line hover:scale-105'}`}
                  style={{ background: p.hex }}
                />
              ))}
            </div>
          </div>
        </div>
        <dl data-rise className="mt-6 grid grid-cols-3 border-t border-line/70">
          {RESULTS.items.map((it, i) => (
            <div key={it.label} className={`pt-4 sm:pt-5 ${i ? 'border-l border-line/70 pl-4 sm:pl-8' : ''}`}>
              <dd className="display tnum text-[clamp(40px,7.2vw,104px)] text-fg">
                {'prefix' in it && it.prefix}
                <span
                  ref={(el) => {
                    nums.current[i] = el;
                  }}
                >
                  0
                </span>
                <span className="text-amber">{it.suffix}</span>
              </dd>
              <dt className="mt-2 text-[13px] leading-tight text-muted sm:text-[15px]">{it.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </Stage>
  );
}

/* -------------------------------------------------------------- 06 Entrega */
export function Entrega() {
  return (
    <Stage i={5} len={1.35} className={RIGHT}>
      <div className="copy w-full max-w-[470px]">
        <Tag i={5} />
        <h2 data-split className="display text-[clamp(38px,5vw,76px)]">
          {LEAD.title[0]}
          <br />
          <span className="text-amber">{LEAD.title[1]}</span>
        </h2>
        <p data-rise className="mt-4 mb-6 text-[17px] text-muted">
          {LEAD.sub}
        </p>
        <div data-rise>
          <LeadForm />
        </div>
        <div data-rise className="mt-7 flex flex-wrap gap-x-5 gap-y-2 border-t border-line/60 pt-5 text-[13px] text-muted">
          <a href={BRAND.whatsapp} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-amber-hot">
            WhatsApp {BRAND.phone}
          </a>
          <a href={`mailto:${BRAND.email}`} className="transition-colors hover:text-amber-hot">
            {BRAND.email}
          </a>
          <a href={BRAND.site} className="transition-colors hover:text-amber-hot">
            markalab.com.mx
          </a>
        </div>
      </div>
      <p className="label absolute bottom-4 left-5 right-5 hidden text-dim normal-case tracking-normal sm:left-8 lg:block">
        © 2026 {BRAND.legal} · {BRAND.address} ·{' '}
        <a href={BRAND.privacyUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-fg">
          Aviso de privacidad
        </a>
      </p>
    </Stage>
  );
}
