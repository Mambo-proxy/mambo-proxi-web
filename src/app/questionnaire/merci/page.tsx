import { Check } from 'lucide-react';
import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { frenchTypography } from '@/lib/format/typography';
import { routes } from '@/lib/routes';

export const metadata: Metadata = { title: 'Merci pour votre avis' };

/**
 * Remerciement après le questionnaire (desktop `82:9847`, mobile `82:9873`) : pastille de succès animée (80/54/28),
 * titre, texte, « Découvrir nos services » et « Retour à l’accueil ».
 */
export default function SurveyThanksPage() {
  return (
    <div className="flex w-full max-w-[720px] flex-col items-center gap-6 self-start rounded-[28px] border border-border-default bg-neutral-0 p-[22px] text-center md:gap-7 md:p-12">
      <span
        aria-hidden
        className="flex size-20 animate-[success-pop_600ms_var(--mp-easing-emphasized)_both] items-center justify-center rounded-full bg-vert-100 motion-reduce:animate-none"
      >
        <span className="flex size-[54px] items-center justify-center rounded-full bg-vert-500 text-neutral-0">
          <Check
            size={28}
            strokeWidth={3}
            className="animate-[check-draw_400ms_ease-out_350ms_forwards] [stroke-dasharray:24] [stroke-dashoffset:24] motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]"
          />
        </span>
      </span>
      <h1 className="font-brand text-[28px] leading-[34px] font-semibold tracking-[-0.025em] text-text-main md:text-[40px] md:leading-[48px]">
        {frenchTypography('Merci pour votre avis !')}
      </h1>
      <p className="font-ui text-[16px] leading-6 text-text-muted md:text-[18px] md:leading-[29px]">
        {frenchTypography(
          'Vos réponses nous aident à améliorer chaque prestation. Si vous l’avez accepté, votre avis pourra être publié sur le site après validation.',
        )}
      </p>
      <div className="flex w-full flex-col gap-2.5 md:w-auto md:flex-row">
        <Link href={'/services' as Route} className={buttonVariants()}>
          Découvrir nos services
        </Link>
        <Link href={routes.home} className={buttonVariants({ variant: 'outline' })}>
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
