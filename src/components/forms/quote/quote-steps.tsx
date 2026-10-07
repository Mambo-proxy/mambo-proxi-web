import { Check } from 'lucide-react';
import type { ReactNode, Ref } from 'react';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';

export type StepState = 'done' | 'active' | 'upcoming';

const STEP_LABELS = ['Service', 'Votre besoin', 'Coordonnées'] as const;

/**
 * Indicateur de progression (`70:8191`) : pastilles 28 (faite = vert + coche, active = orange, à venir = gris),
 * libellés Inter SemiBold 14/20, traits de 2 px (vert après une étape faite). En mobile, seul le libellé actif reste.
 */
export function QuoteProgress({ states }: { states: [StepState, StepState, StepState] }) {
  return (
    <ol aria-label="Progression de la demande" className="flex items-center gap-1.5 md:gap-3">
      {STEP_LABELS.map((label, index) => {
        const state = states[index]!;
        return (
          <li
            key={label}
            aria-current={state === 'active' ? 'step' : undefined}
            className={cn('flex items-center gap-1.5 md:gap-3', index < STEP_LABELS.length - 1 && 'flex-1')}
          >
            <span className="flex items-center gap-2.5">
              <span
                aria-hidden
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full font-ui text-[12px] leading-4 font-semibold',
                  state === 'done' && 'bg-vert-500 text-neutral-0',
                  state === 'active' && 'bg-brand-primary text-neutral-900',
                  state === 'upcoming' && 'bg-neutral-200 text-text-muted',
                )}
              >
                {state === 'done' ? <Check size={14} strokeWidth={3} /> : index + 1}
              </span>
              <span
                className={cn(
                  'font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] whitespace-nowrap',
                  state === 'upcoming' ? 'text-text-muted' : 'text-text-main',
                  state !== 'active' && 'max-md:sr-only',
                )}
              >
                {label}
                <span className="sr-only">
                  {state === 'done' ? ' (terminée)' : state === 'active' ? ' (en cours)' : ' (à venir)'}
                </span>
              </span>
            </span>
            {index < STEP_LABELS.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  'h-0.5 flex-1 rounded-full',
                  state === 'done' ? 'bg-vert-500' : 'bg-neutral-200',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

type StepCardProps = {
  number: 1 | 2 | 3;
  state: StepState;
  title: string;
  subtitle?: string;
  headingRef?: Ref<HTMLHeadingElement>;
  children: ReactNode;
};

/**
 * Carte d'étape (`70:8209`) : fond blanc, rayon 28, p 36 (20 en mobile), gap 20 ; active = bordure orange 2 px.
 * En-tête : pastille 36 (faite = vert + coche, sinon numéro blanc sur sombre), titre Poppins 21/28 (18/28), sous-titre.
 */
export function StepCard({ number, state, title, subtitle, headingRef, children }: StepCardProps) {
  return (
    <section
      aria-labelledby={`etape-${number}`}
      className={cn(
        'flex scroll-mt-[calc(var(--site-header-h,85px)+16px)] flex-col gap-5 rounded-[28px] border bg-neutral-0 p-5 md:p-9',
        state === 'active'
          ? 'border-brand-primary shadow-[inset_0_0_0_1px_var(--mp-color-brand-primary)]'
          : 'border-border-default',
      )}
    >
      <div className="flex items-center gap-3.5">
        <span
          aria-hidden
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full font-ui text-[16px] leading-6 font-semibold text-neutral-0',
            state === 'done' ? 'bg-vert-500' : 'bg-neutral-900',
          )}
        >
          {state === 'done' ? <Check size={18} strokeWidth={3} /> : number}
        </span>
        <div className="flex flex-col gap-0.5">
          <h2
            id={`etape-${number}`}
            ref={headingRef}
            tabIndex={-1}
            className="font-brand text-[18px] leading-7 font-semibold text-text-main outline-none md:text-[21px]"
          >
            <span className="sr-only">{`Étape ${number} sur 3 : `}</span>
            {frenchTypography(title)}
          </h2>
          {subtitle && (
            <p className="font-ui text-[14px] leading-5 text-text-muted">{frenchTypography(subtitle)}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}
