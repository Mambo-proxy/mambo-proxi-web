import type { Route } from 'next';
import { useTranslations } from 'next-intl';
import { SiteLink as Link } from '@/i18n/site-link';
import { buttonVariants } from '@/components/ui/button';

/**
 * Barre d'action fixe en bas d'écran, mobile uniquement (`62:5193`) : fond blanc, bordure haute, pt 12 / pb 24, px 16,
 * « Devis gratuit » + « WhatsApp » à parts égales. Elle remplace le bouton WhatsApp flottant ; le pied de page
 * garde une marge basse pour ne pas être recouvert (voir `[data-action-bar]` dans web.css).
 */
export function ServiceActionBar({
  serviceName,
  quoteHref,
  whatsappHref,
}: {
  serviceName: string;
  quoteHref: Route;
  whatsappHref: string | null;
}) {
  const t = useTranslations('service.actionBar');
  return (
    <div
      data-action-bar
      className="fixed inset-x-0 bottom-0 z-30 flex gap-2.5 border-t border-border-default bg-neutral-0 px-4 pt-3 pb-[max(24px,env(safe-area-inset-bottom))] md:hidden"
    >
      <Link href={quoteHref} className={buttonVariants({ className: 'flex-1' })}>
        {t('quote')}
        <span className="sr-only"> {t('quoteFor', { name: serviceName })}</span>
      </Link>
      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: 'whatsapp', className: 'flex-1' })}
        >
          {t('whatsapp')}
          <span className="sr-only"> {t('newTab')}</span>
        </a>
      )}
    </div>
  );
}
