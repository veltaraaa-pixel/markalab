'use client';
/**
 * Magnetic.tsx · v1.0
 * Botón que se deja atraer por el puntero. Solo con mouse; en táctil es un
 * botón normal.
 */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'solid' | 'ghost'; arrow?: boolean };

export function Magnetic({ variant = 'solid', arrow = false, className = '', children, ...rest }: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current!;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, []);

  const base =
    'group relative inline-flex h-13 items-center justify-center gap-2.5 rounded-full px-6 text-[15px] font-semibold tracking-[-0.01em] transition-colors duration-300 cursor-pointer disabled:cursor-wait disabled:opacity-70';
  const look =
    variant === 'solid'
      ? 'bg-amber text-[#0b0b0b] hover:bg-amber-hot shadow-[0_10px_40px_-12px_rgba(232,98,26,0.8)]'
      : 'border border-line bg-ink/50 text-fg backdrop-blur-md hover:border-fg/50';
  return (
    <button ref={ref} className={`${base} ${look} ${className}`} {...rest}>
      <span>{children}</span>
      {arrow && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
