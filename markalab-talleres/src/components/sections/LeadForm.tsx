'use client';
/**
 * LeadForm.tsx · v1.0
 *
 * El formulario. No habla con n8n directamente: manda los datos a /api/lead,
 * que es quien conoce la URL del webhook y su secreto. Así el secreto nunca
 * viaja al navegador.
 *
 * Al enviarse, el coche hace cambio de luces y sale de la bahía.
 */
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Magnetic } from '@/components/ui/Magnetic';
import { LEAD } from '@/lib/content';
import { useShop } from '@/lib/store';

type State = 'idle' | 'sending' | 'done' | 'error';
type Errors = Partial<Record<'name' | 'company' | 'phone' | 'email', boolean>>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function LeadForm() {
  const [state, setState] = useState<State>('idle');
  const [errors, setErrors] = useState<Errors>({});
  const [name, setName] = useState('');
  const set = useShop((s) => s.set);
  const blink = useShop((s) => s.blink);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {
      name: String(f.get('name') || '').trim(),
      company: String(f.get('company') || '').trim(),
      phone: String(f.get('phone') || '').trim(),
      email: String(f.get('email') || '').trim(),
      // Campo trampa: las personas no lo ven, los bots lo llenan.
      website: String(f.get('website') || ''),
    };
    const err: Errors = {
      name: data.name.length < 2,
      company: data.company.length < 2,
      phone: data.phone.replace(/\D/g, '').length < 10,
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email),
    };
    setErrors(err);
    if (Object.values(err).some(Boolean)) return;

    setState('sending');
    try {
      const r = await fetch('/api/lead-talleres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error(String(r.status));
      setName(data.name.split(' ')[0]);
      setState('done');
      blink();
      window.setTimeout(() => set({ sent: true }), 900);
      window.gtag?.('event', 'generate_lead', { form: 'landing_talleres' });
    } catch {
      setState('error');
    }
  }

  const field = (id: keyof Errors, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <label className="field">
      <input name={id} placeholder=" " aria-invalid={errors[id] || undefined} {...props} />
      <span>{label}</span>
    </label>
  );

  return (
    <AnimatePresence mode="wait" initial={false}>
      {state === 'done' ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-ok/40 bg-ink/70 p-6 backdrop-blur-md"
          role="status"
        >
          <motion.svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
            <motion.circle
              cx="22"
              cy="22"
              r="20"
              stroke="#2FB184"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7 }}
            />
            <motion.path
              d="M13 22.5l6 6 12-13"
              stroke="#2FB184"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, delay: 0.5 }}
            />
          </motion.svg>
          <p className="display mt-4 text-[30px]">Listo{name ? `, ${name}` : ''}.</p>
          <p className="mt-2 text-muted">{LEAD.done}</p>
          <p className="label mt-4 text-dim normal-case tracking-normal">{LEAD.contact}</p>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0, y: -10 }} className="grid gap-2.5">
          <div className="grid gap-2.5 sm:grid-cols-2">
            {field('name', 'Nombre', { autoComplete: 'name', required: true })}
            {field('company', 'Taller', { autoComplete: 'organization', required: true })}
            {field('phone', 'WhatsApp', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', required: true })}
            {field('email', 'Correo', { type: 'email', inputMode: 'email', autoComplete: 'email', required: true })}
          </div>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Magnetic type="submit" arrow disabled={state === 'sending'}>
              {state === 'sending' ? 'Enviando…' : LEAD.submit}
            </Magnetic>
            <p className="text-[12.5px] text-muted/80" role={state === 'error' ? 'alert' : undefined}>
              {state === 'error' ? (
                <span className="text-[#F0867B]">No se pudo enviar. Escríbenos a {LEAD.contact}</span>
              ) : Object.values(errors).some(Boolean) ? (
                <span className="text-[#F0867B]">Revisa los campos marcados.</span>
              ) : (
                <>
                  {LEAD.legal}
                  {LEAD.privacyUrl && (
                    <>
                      {' '}
                      <a href={LEAD.privacyUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-fg">
                        Aviso de privacidad
                      </a>
                    </>
                  )}
                </>
              )}
            </p>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
