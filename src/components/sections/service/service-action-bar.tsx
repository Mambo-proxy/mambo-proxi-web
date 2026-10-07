import type { Route } from 'next';
import Link from 'next/link';
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
  return (
    <div
      data-action-bar
      className="fixed inset-x-0 bottom-0 z-30 flex gap-2.5 border-t border-border-default bg-neutral-0 px-4 pt-3 pb-[max(24px,env(safe-area-inset-bottom))] md:hidden"
    >
      <Link href={quoteHref} className={buttonVariants({ className: 'flex-1' })}>
        Devis gratuit
        <span className="sr-only"> pour {serviceName}</span>
      </Link>
      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: 'whatsapp', className: 'flex-1' })}
        >
          WhatsApp
          <span className="sr-only"> (nouvel onglet)</span>
        </a>
      )}
    </div>
  );
}
