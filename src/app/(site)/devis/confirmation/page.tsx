import { Check } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { routes } from '@/lib/routes';
import { getSiteSettings } from '@/lib/site-data';
import { whatsappUrl } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Demande envoyée',
  robots: { index: false },
};

/** Référence d'une demande : `MP-AAAA-NNNN`. */
const REFERENCE = /^MP-\d{4}-\d{4,6}$/;

type SearchParams = { searchParams: Promise<{ ref?: string }> };

/**
 * Confirmation du devis (desktop `70:8799`, mobile `70:9036`) : icône de succès animée, titre, accusé de réception,
 * référence, « Suivre sur WhatsApp » (message pré-rempli avec la référence) et « Retour à l’accueil ».
 * Sans référence valide, retour au formulaire.
 */
export default async function QuoteConfirmationPage({ searchParams }: SearchParams) {
  const { ref } = await searchParams;
  if (!ref || !REFERENCE.test(ref)) redirect(routes.devis);
  const settings = await getSiteSettings();
  const whatsappHref = settings.whatsapp.enabled
    ? whatsappUrl(settings.whatsapp.number, settings.whatsapp.message, `Référence de ma demande : ${ref}`)
    : null;

  return (
    <section className="bg-neutral-50">
      <div className="container-site flex flex-col items-center gap-6 pt-14 pb-16 text-center xl:pt-28 xl:pb-32">
        <span
          aria-hidden
          className="flex size-[88px] animate-[success-pop_600ms_var(--mp-easing-emphasized)_both] items-center justify-center rounded-full bg-vert-100 motion-reduce:animate-none"
        >
          <span className="flex size-[60px] items-center justify-center rounded-full bg-vert-500 text-neutral-0">
            <Check
              size={30}
              strokeWidth={3}
              className="animate-[check-draw_400ms_ease-out_350ms_forwards] [stroke-dasharray:24] [stroke-dashoffset:24] motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]"
            />
          </span>
        </span>
        <h1 className="max-w-[760px] font-brand text-[28px] leading-[34px] font-semibold tracking-[-0.025em] text-text-main xl:text-[44px] xl:leading-[52px]">
          {frenchTypography('Merci, votre demande est bien envoyée !')}
        </h1>
        <p className="max-w-[640px] font-ui text-[16px] leading-[25px] text-text-muted xl:text-[18px] xl:leading-[29px]">
          {frenchTypography(
            'Un accusé de réception vient de vous être envoyé par e-mail. Un conseiller MAMBO Proxi vous répond sous 24 h avec votre devis personnalisé.',
          )}
        </p>
        <p className="inline-flex items-center gap-2.5 rounded-full border border-border-default bg-neutral-0 px-[18px] py-2.5 font-ui text-[14px] leading-5">
          <span className="text-text-muted">Référence de votre demande</span>
          <span className="font-semibold tracking-[0.005em] text-text-main">{ref}</span>
        </p>
        <div className="flex w-full flex-col gap-2.5 md:w-auto md:flex-row">
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'whatsapp' })}
            >
              Suivre sur WhatsApp
            </a>
          )}
          <Link href={routes.home} className={cn(buttonVariants({ variant: 'outline' }))}>
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
