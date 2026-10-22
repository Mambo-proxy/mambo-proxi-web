import { Clock } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { AccentText } from '@/components/ui/accent-text';
import type { HeroSection } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { NotifyForm } from './notify-form';

/** Demandes factices de l'aperçu « Mes demandes » (`83:9536`) : textes (`suivi.preview`), couleurs et avancement. */
const PREVIEW = [
  { title: 'chef', tone: 'done', progress: 1 },
  { title: 'housing', tone: 'active', progress: 0.6 },
  { title: 'parcels', tone: 'new', progress: 0.2 },
] as const;

const BADGES = {
  done: 'bg-vert-50 text-vert-700',
  active: 'bg-orange-50 text-orange-700',
  new: 'bg-neutral-100 text-text-main',
};

/**
 * Héros de Suivi Mambo (`83:9519`) : badge « Bientôt disponible », titre dont « Suivi Mambo » est en orange, chapô,
 * « Me prévenir » ; à droite, aperçu illustratif de l'espace client (carte 520, ombre `elevation/3`).
 */
export async function SuiviHero({ section }: { section: HeroSection }) {
  const t = await getTranslations('suivi');
  return (
    <section className="bg-neutral-50">
      <div className="container-site grid items-center gap-6 pt-6 pb-12 xl:grid-cols-[minmax(0,1fr)_520px] xl:gap-16 xl:pt-16 xl:pb-24">
        <div className="flex flex-col gap-5">
          {section.badge && (
            <p className="inline-flex items-center gap-2 self-start rounded-full bg-orange-50 px-3 py-1.5 font-ui text-[13px] leading-4 font-semibold tracking-[0.01em] text-orange-700">
              <Clock aria-hidden size={14} />
              {section.badge.text}
            </p>
          )}
          {section.title && (
            <h1 className="font-brand text-[30px] leading-9 font-semibold tracking-[-0.025em] text-text-main md:text-[44px] md:leading-[50px] xl:text-[52px] xl:leading-[58px]">
              <AccentText text={section.title} />
            </h1>
          )}
          {section.lead && <p className="text-web-lead text-text-muted">{frenchTypography(section.lead)}</p>}
          <NotifyForm />
        </div>
        <div
          aria-hidden
          className="flex flex-col gap-3 rounded-[28px] border border-border-default bg-neutral-0 p-4 shadow-3 xl:p-6"
        >
          <p className="font-ui text-[16px] leading-6 font-semibold text-text-main">{t('previewTitle')}</p>
          {PREVIEW.map((item) => (
            <div key={item.title} className="flex flex-col gap-2.5 rounded-2xl bg-neutral-50 p-4">
              <div className="flex items-center justify-between gap-1.5">
                <span className="font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-main">
                  {t(`preview.${item.title}`)}
                </span>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-1 font-ui text-[12px] leading-4 font-semibold',
                    BADGES[item.tone],
                  )}
                >
                  {t(`preview.${item.tone}`)}
                </span>
              </div>
              <span className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <span
                  className={cn(
                    'block h-full rounded-full',
                    item.tone === 'done' ? 'bg-vert-500' : 'bg-brand-primary',
                  )}
                  style={{ width: `${item.progress * 100}%` }}
                />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
