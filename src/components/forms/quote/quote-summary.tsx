import { Check, X } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Visual } from '@/components/ui/visual';
import type { ServiceSummary } from '@/lib/api/schema';
import { frenchTypography } from '@/lib/format/typography';

const GUARANTEES = ['Devis gratuit et sans engagement', 'Réponse sous 24 h', 'Tarif communiqué sur devis'];

type QuoteSummaryProps = {
  service: ServiceSummary | null;
  onClear: () => void;
  whatsappHref: string | null;
};

/**
 * Récapitulatif (`70:8325`) : carte « Votre demande » (p 28, rayon 24) avec le service choisi (vignette 56, ✕ pour
 * changer) et 3 garanties ; carte sombre « Une question avant de remplir ? » + WhatsApp (p 24).
 */
export function QuoteSummary({ service, onClear, whatsappHref }: QuoteSummaryProps) {
  return (
    <>
      <div className="flex flex-col gap-4 rounded-3xl border border-border-default bg-neutral-0 p-5 md:p-7">
        <h2 className="font-ui text-[16px] leading-6 font-semibold text-text-main">Votre demande</h2>
        {service ? (
          <div className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-3">
            <Visual visual={service.visual} sizes="56px" className="size-14 shrink-0 rounded-xl" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-ui text-[15px] leading-6 font-semibold text-text-main">
                {frenchTypography(service.name)}
              </span>
              <span className="text-caption text-text-muted">{service.category.name}</span>
            </span>
            <button
              type="button"
              onClick={onClear}
              aria-label={`Changer de service (${service.name})`}
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-icon-default hover:bg-neutral-100 hover:text-text-main"
            >
              <X aria-hidden size={18} />
            </button>
          </div>
        ) : (
          <p className="rounded-2xl bg-neutral-50 p-3 font-ui text-[14px] leading-5 text-text-muted">
            Aucun service choisi pour l’instant.
          </p>
        )}
        <ul className="flex flex-col gap-4">
          {GUARANTEES.map((guarantee) => (
            <li
              key={guarantee}
              className="flex items-center gap-2.5 font-ui text-[14px] leading-5 text-text-main"
            >
              <span
                aria-hidden
                className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-vert-50"
              >
                <Check size={14} strokeWidth={2.5} className="text-vert-700" />
              </span>
              {frenchTypography(guarantee)}
            </li>
          ))}
        </ul>
      </div>
      {whatsappHref && (
        <div className="flex flex-col gap-3 rounded-3xl bg-neutral-900 p-5 md:p-6">
          <p className="font-ui text-[15px] leading-6 font-semibold text-neutral-0">
            {frenchTypography('Une question avant de remplir ?')}
          </p>
          <p className="font-ui text-[14px] leading-5 text-neutral-300">
            Échangez directement avec un conseiller.
          </p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: 'whatsapp',
              fullWidth: true,
              className: 'focus-visible:focus-ring-inverse',
            })}
          >
            Écrire sur WhatsApp
          </a>
        </div>
      )}
    </>
  );
}
