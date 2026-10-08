import { Check, CircleAlert, LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';

export type StatusTone = 'success' | 'error' | 'pending' | 'info';

/**
 * Carte de statut des pages système (gabarit de « Merci », questionnaire `82:9847`) : carte blanche centrée 720,
 * pastille (succès vert animée, erreur ou information orange, attente), titre Poppins 40/48 (28/34), texte 18/29,
 * actions. Le statut est annoncé aux lecteurs d'écran.
 */
export function StatusCard({
  tone,
  title,
  text,
  children,
}: {
  tone: StatusTone;
  title: string;
  text?: string | null;
  children?: ReactNode;
}) {
  return (
    <section className="bg-neutral-50 px-4 pt-7 pb-14 md:pt-14 md:pb-24">
      <div
        role={tone === 'error' ? 'alert' : 'status'}
        className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-6 rounded-[28px] border border-border-default bg-neutral-0 p-[22px] text-center md:gap-7 md:p-12"
      >
        <span
          aria-hidden
          className={cn(
            'flex size-20 items-center justify-center rounded-full',
            tone === 'success' &&
              'animate-[success-pop_600ms_var(--mp-easing-emphasized)_both] bg-vert-100 motion-reduce:animate-none',
            (tone === 'error' || tone === 'info') && 'bg-orange-50',
            tone === 'pending' && 'bg-neutral-100',
          )}
        >
          {tone === 'success' && (
            <span className="flex size-[54px] items-center justify-center rounded-full bg-vert-500 text-neutral-0">
              <Check
                size={28}
                strokeWidth={3}
                className="animate-[check-draw_400ms_ease-out_350ms_forwards] [stroke-dasharray:24] [stroke-dashoffset:24] motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]"
              />
            </span>
          )}
          {(tone === 'error' || tone === 'info') && <CircleAlert size={32} className="text-text-brand" />}
          {tone === 'pending' && (
            <LoaderCircle size={32} className="animate-spin text-text-muted motion-reduce:animate-none" />
          )}
        </span>
        <h1 className="font-brand text-[28px] leading-[34px] font-semibold tracking-[-0.025em] text-text-main md:text-[40px] md:leading-[48px]">
          {frenchTypography(title)}
        </h1>
        {text && (
          <p className="font-ui text-[16px] leading-6 text-text-muted md:text-[18px] md:leading-[29px]">
            {frenchTypography(text)}
          </p>
        )}
        {children && (
          <div className="flex w-full flex-col gap-2.5 md:w-auto md:flex-row md:justify-center">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
