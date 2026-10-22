import { ShieldCheck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Stars } from '@/components/ui/stars';
import type { Review } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatRating } from '@/lib/format/number';
import { frenchTypography } from '@/lib/format/typography';

/** Couleurs des avatars à initiales (maquette : `orange/200`, `orange/100`), en alternance. */
const AVATARS = ['bg-orange-200', 'bg-orange-100', 'bg-vert-100'];

const shortDate = {
  fr: new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Africa/Douala',
  }),
  en: new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Africa/Douala',
  }),
};

/**
 * Carte d'avis (Avis clients `68:7365`) : bordée, rayon 24, p 28 (22 en mobile, `68:7778`) ; étoiles 15 et date courte, texte
 * 16/26, mention « Avis vérifié après prestation », pied avec avatar à initiales, nom, ville et badge du service.
 */
export function ReviewCard({ review, index }: { review: Review; index: number }) {
  const t = useTranslations('reviews');
  const locale = useLocale() === 'en' ? 'en' : 'fr';
  return (
    <figure className="flex flex-col gap-4 rounded-3xl border border-border-default bg-neutral-0 p-[22px] xl:p-7">
      <div className="flex items-center justify-between gap-3">
        <Stars
          rating={review.rating}
          size={15}
          className="-my-px"
          label={t('rating', { rating: formatRating(review.rating, locale) })}
        />
        <time dateTime={review.date} className="text-caption text-text-muted">
          {shortDate[locale].format(new Date(review.date))}
        </time>
      </div>
      <blockquote className="font-ui text-[15px] leading-6 text-text-main xl:text-[16px] xl:leading-[26px]">
        {frenchTypography(review.text)}
      </blockquote>
      <figcaption className="flex items-center gap-3 border-t border-border-default pt-4">
        <span
          aria-hidden
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full font-ui text-[14px] leading-5 font-semibold text-text-main',
            AVATARS[index % AVATARS.length],
          )}
        >
          {review.initials}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-ui text-[14px] leading-5 font-semibold text-text-main">
            {review.authorName}
          </span>
          {review.city && <span className="text-caption text-text-muted">{review.city}</span>}
        </span>
        {review.service && (
          <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-[5px] font-ui text-[11px] leading-4 font-semibold tracking-[0.01em] text-orange-700">
            {frenchTypography(review.service.name)}
          </span>
        )}
      </figcaption>
      {review.verified && (
        <p className="flex items-center gap-1.5 font-ui text-[12px] leading-4 font-medium tracking-[0.01em] text-vert-700">
          <ShieldCheck aria-hidden size={14} />
          {t('verified')}
        </p>
      )}
    </figure>
  );
}
