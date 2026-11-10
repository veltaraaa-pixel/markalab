'use client';
/**
 * Stage.tsx · v1.0
 *
 * Una etapa de la orden: sección alta con el contenido fijo en pantalla.
 * El contenido entra y sale con un fundido ligado al scroll (no a un reloj),
 * así que nunca queda a medias: si el visitante se detiene, se detiene.
 *
 * La primera vez que la etapa aparece, sus titulares se revelan línea por
 * línea (GSAP SplitText) y el resto sube en cascada.
 */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { scroller } from '@/lib/scroll';
import { STAGES } from '@/lib/content';
import { useShop } from '@/lib/store';

gsap.registerPlugin(SplitText);

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

type Props = {
  i: number;
  /** Alto de la sección en pantallas. Más alto = más tiempo en reposo. */
  len: number;
  className?: string;
  children: React.ReactNode;
};

export function Stage({ i, len, className = '', children }: Props) {
  const inner = useRef<HTMLDivElement>(null);
  const revealed = useRef(false);

  // Fundido de entrada y salida, calculado a partir de la etapa continua.
  useEffect(() => {
    const el = inner.current!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const update = (s: number) => {
      const d = s - i; // -1 … 0 entrando, 0 en reposo, 0 … 1 saliendo
      const vh = scroller.layout.vh;
      let o = 1;
      let y = 0;
      if (d < 0) {
        o = smooth(-0.42, -0.04, d);
        y = reduce ? 0 : d * vh * 0.62;
      } else if (d > 0) {
        o = 1 - smooth(0.04, 0.4, d);
        y = reduce ? 0 : d * vh * 0.62;
      }
      el.style.opacity = o.toFixed(3);
      el.style.transform = `translate3d(0,${y.toFixed(1)}px,0)`;
      el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
      if (o > 0.05 && !revealed.current && useShop.getState().open) reveal();
    };
    const reveal = () => {
      revealed.current = true;
      if (reduce) return;
      const ctx = gsap.context(() => {
        el.querySelectorAll<HTMLElement>('[data-split]').forEach((h) => {
          SplitText.create(h, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, { yPercent: 115, duration: 1.1, ease: 'expo.out', stagger: 0.09 }),
          });
        });
        gsap.from(el.querySelectorAll('[data-rise]'), {
          y: 26,
          autoAlpha: 0,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.07,
          delay: 0.18,
          clearProps: 'transform,opacity,visibility',
        });
      }, el);
      return ctx;
    };
    scroller.listeners.push(update);
    update(i === 0 ? 0 : -1);
    return () => {
      scroller.listeners = scroller.listeners.filter((f) => f !== update);
    };
  }, [i]);

  return (
    <section
      id={STAGES[i].id}
      data-stage={i}
      className="stage"
      style={{ height: `${len * 100}svh` }}
      aria-label={`${STAGES[i].n} ${STAGES[i].name}`}
    >
      <div className="stage-pin">
        <div ref={inner} className={`stage-in ${className}`}>
          {children}
        </div>
      </div>
    </section>
  );
}
