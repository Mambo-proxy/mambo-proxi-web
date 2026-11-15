import { Check } from 'lucide-react';
import type { Metadata, Route } from 'next';
import { getTranslations } from 'next-intl/server';
import { SiteLink as Link } from '@/i18n/site-link';
import { buttonVariants } from '@/components/ui/button';
import { frenchTypography } from '@/lib/format/typography';
import { routes } from '@/lib/routes';
import { withLocale, type LocaleParams } from '@/i18n/request-locale';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  await withLocale(params);
  const t = await getTranslations('forms.survey.thanks');
  return { title: t('metaTitle') };
}

/**
 * Remerciement après le questionnaire (desktop `82:9847`, mobile `82:9873`) : pastille de succès animée (80/54/28),
 * titre, texte, « Découvrir nos services » et « Retour à l’accueil ».
 */
export default async function SurveyThanksPage({ params }: LocaleParams) {
  await withLocale(params);
  const [t, page] = await Promise.all([
    getTranslations('forms.survey.thanks'),
    getTranslations('forms.survey.page'),
  ]);
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
        {frenchTypography(t('title'))}
      </h1>
      <p className="font-ui text-[16px] leading-6 text-text-muted md:text-[18px] md:leading-[29px]">
        {frenchTypography(t('text'))}
      </p>
      <div className="flex w-full flex-col gap-2.5 md:w-auto md:flex-row">
        <Link href={'/services' as Route} className={buttonVariants()}>
          {t('services')}
        </Link>
        <Link href={routes.home} className={buttonVariants({ variant: 'outline' })}>
          {page('home')}
        </Link>
      </div>
    </div>
  );
}
