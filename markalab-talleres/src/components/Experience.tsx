'use client';
/**
 * Experience.tsx · v1.0
 *
 * La raíz del lado del navegador. Arma tres capas, de atrás hacia adelante:
 *
 *   1. Scene      el lienzo WebGL fijo, con el coche
 *   2. Hotspots   las etiquetas HTML que flotan sobre el coche
 *   3. <main>     las seis etapas, que hacen scroll por encima
 *
 * y conecta el scroll (Lenis + GSAP ScrollTrigger) con la etapa de la orden.
 */
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Header, StageRail } from '@/components/ui/Chrome';
import { Hotspots } from '@/components/ui/Hotspots';
import { Preloader } from '@/components/ui/Preloader';
import { Autorizacion, Calidad, Diagnostico, Entrega, Hero, Soluciones } from '@/components/sections/Sections';
import { measure, onScroll, scroller } from '@/lib/scroll';
import { live, useShop } from '@/lib/store';

gsap.registerPlugin(ScrollTrigger);

// three.js no se carga hasta que el navegador lo pide: el texto no lo espera.
const Scene = dynamic(() => import('@/components/scene/Scene'), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function Experience() {
  const webgl = useShop((s) => s.webgl);
  const open = useShop((s) => s.open);

  useEffect(() => {
    if (!hasWebGL()) useShop.getState().set({ webgl: false, ready: true });

    measure();
    // Si la página se abre ya avanzada (recarga a media orden), el coche no
    // hace su entrada: ya está en la bahía.
    if (window.scrollY > window.innerHeight * 0.5) live.skipIntro = true;
    onScroll(window.scrollY);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lenis: Lenis | null = null;
    let tick: ((t: number) => void) | null = null;
    const native = () => onScroll(window.scrollY);

    if (reduce) {
      window.addEventListener('scroll', native, { passive: true });
    } else {
      lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
      scroller.lenis = lenis;
      lenis.on('scroll', ({ scroll }: { scroll: number }) => {
        onScroll(scroll);
        ScrollTrigger.update();
      });
      tick = (t: number) => lenis!.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    const resize = () => {
      measure();
      onScroll(window.scrollY);
    };
    window.addEventListener('resize', resize);
    // Las fuentes cambian alturas al terminar de cargar.
    document.fonts?.ready.then(resize);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', native);
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      scroller.lenis = null;
    };
  }, []);

  // Con el telón abajo no hay scroll; al levantarse, se revela la etapa actual.
  useEffect(() => {
    if (open) {
      scroller.lenis?.start();
      onScroll(window.scrollY);
    } else {
      scroller.lenis?.stop();
    }
  }, [open]);

  return (
    <>
      {webgl ? <Scene /> : <div className="scene-fallback" aria-hidden="true" />}
      <Hotspots />
      <Header />
      <StageRail />
      <main>
        <Hero />
        <Diagnostico />
        <Autorizacion />
        <Soluciones />
        <Calidad />
        <Entrega />
      </main>
      <Preloader />
    </>
  );
}
