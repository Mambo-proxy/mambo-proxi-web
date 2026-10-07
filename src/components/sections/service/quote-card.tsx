import { ArrowRight, CalendarCheck, Check, Smartphone } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { routes } from '@/lib/routes';

type QuoteCardProps = {
  bullets: string[];
  quoteHref: Route;
  whatsappHref: string | null;
  phone: { href: string; display: string } | null;
};

/**
 * Carte devis (`62:4456`) : fond blanc bordé, rayon 24, p 28 (20 en mobile) ; « Tarif communiqué sur devis »,
 * titre Poppins 20/28, 3 garanties (pastille 22 `vert/50`, coche 14), boutons pleine largeur, ligne téléphone 13/16.
 * Aucun prix n'est affiché (cahier §5.5).
 */
export function QuoteCard({ bullets, quoteHref, whatsappHref, phone }: QuoteCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border-default bg-neutral-0 p-5 shadow-1 xl:w-[338px] xl:p-7">
      <p className="font-ui text-[14px] leading-5 font-medium text-text-muted">Tarif communiqué sur devis</p>
      <h2 className="font-brand text-[20px] leading-7 font-semibold text-text-main">
        {frenchTypography('Recevez votre devis gratuit sous 24 h')}
      </h2>
      {bullets.length > 0 && (
        <ul className="flex flex-col gap-4">
          {bullets.map((bullet) => (
            <li
              key={bullet}
              className="flex items-center gap-2.5 font-ui text-[14px] leading-5 text-text-main"
            >
              <span
                aria-hidden
                className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-vert-50"
              >
                <Check size={14} strokeWidth={2.5} className="text-vert-700" />
              </span>
              {frenchTypography(bullet)}
            </li>
          ))}
        </ul>
      )}
      <Link href={quoteHref} className={buttonVariants({ fullWidth: true })}>
        Demander un devis gratuit
      </Link>
      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: 'whatsapp', fullWidth: true })}
        >
          Écrire sur WhatsApp
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone.href}`}
          className="inline-flex items-center justify-center gap-1.5 self-center rounded-xs font-ui text-[13px] leading-4 text-text-muted hover:text-text-main"
        >
          <Smartphone aria-hidden size={14} />
          <span>{`ou appelez le ${phone.display}`}</span>
        </a>
      )}
    </div>
  );
}

/** Encart « Préférez un rendez-vous ? » (`62:4483`) : fond `neutral/50`, rayon 20, p 20 ; absent en mobile. */
export function AppointmentCard({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 rounded-[20px] bg-neutral-50 p-5', className)}>
      <span
        aria-hidden
        className="flex size-11 shrink-0 items-center justify-center rounded-[13px] bg-neutral-0"
      >
        <CalendarCheck size={20} className="text-text-main" />
      </span>
      <div className="flex flex-col">
        <p className="font-ui text-[15px] leading-6 font-semibold text-text-main">
          {frenchTypography('Préférez un rendez-vous ?')}
        </p>
        <Link
          href={routes.rendezVous}
          className="group/rdv inline-flex items-center gap-1.5 self-start rounded-xs font-ui text-[14px] leading-5 font-semibold text-text-brand"
        >
          Prendre rendez-vous
          <ArrowRight
            aria-hidden
            size={16}
            className="transition-transform duration-200 group-hover/rdv:translate-x-[3px]"
          />
        </Link>
      </div>
    </div>
  );
}
