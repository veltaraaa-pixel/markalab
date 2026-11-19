'use client';
/**
 * Preloader.tsx · v1.0
 * El telón. Cuenta hasta 100 mientras carga la escena y se levanta cuando el
 * coche ya está pintado. Si WebGL tarda o no existe, se levanta igual: nadie
 * se queda mirando un contador.
 */
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useShop } from '@/lib/store';

export function Preloader() {
  const ready = useShop((s) => s.ready);
  const webgl = useShop((s) => s.webgl);
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const val = useRef({ v: 0 });
  const tween = useRef<gsap.core.Tween | null>(null);

  const paint = () => {
    const v = Math.round(val.current.v);
    if (num.current) num.current.textContent = String(v).padStart(3, '0');
    if (bar.current) bar.current.style.transform = `scaleX(${val.current.v / 100})`;
  };

  // Avance "de espera": sube rápido y se va frenando antes del 90.
  useEffect(() => {
    tween.current = gsap.to(val.current, { v: 88, duration: 5, ease: 'power2.out', onUpdate: paint });
    const safety = window.setTimeout(() => useShop.getState().set({ ready: true }), 7000);
    return () => {
      tween.current?.kill();
      window.clearTimeout(safety);
    };
  }, []);

  useEffect(() => {
    if (!ready && webgl) return;
    tween.current?.kill();
    const tl = gsap.timeline({
      onComplete: () => setGone(true),
    });
    tl.to(val.current, { v: 100, duration: 0.5, ease: 'power2.out', onUpdate: paint })
      .add(() => useShop.getState().set({ open: true }), '+=0.05')
      .to(root.current, { yPercent: -100, duration: 1.05, ease: 'expo.inOut' });
    return () => {
      tl.kill();
    };
  }, [ready, webgl]);

  if (gone) return null;
  return (
    <div ref={root} className="fixed inset-0 z-[60] flex flex-col justify-between bg-ink p-6 sm:p-10" role="status" aria-label="Cargando">
      <div className="label flex items-center justify-between text-dim">
        <span>MarkaLab · Talleres</span>
        <span>Orden 4217</span>
      </div>
      <div>
        <span ref={num} className="display tnum block text-[clamp(96px,22vw,300px)] text-fg">
          000
        </span>
        <div className="mt-6 h-[3px] w-full overflow-hidden bg-line">
          <div ref={bar} className="hazard h-full w-full origin-left bg-amber" style={{ transform: 'scaleX(0)' }} />
        </div>
        <p className="label mt-4 text-dim">Abriendo la bahía 04</p>
      </div>
    </div>
  );
}
