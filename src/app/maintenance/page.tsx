import { Mail } from 'lucide-react';
import type { Metadata } from 'next';
import { Logo } from '@/components/brand/logo';
import { WhatsappIcon } from '@/components/brand/social-icons';
import { ErrorPanel } from '@/components/sections/errors/error-panel';
import { buttonVariants } from '@/components/ui/button';
import { getSiteSettings } from '@/lib/site-data';
import { whatsappUrl } from '@/lib/whatsapp';

export const metadata: Metadata = { title: 'Maintenance en cours', robots: { index: false } };

/** Coordonnées des Paramètres si l'API répond, sinon l'adresse de contact par défaut. */
async function contactLinks() {
  try {
    const settings = await getSiteSettings();
    return {
      email: settings.contact.email,
      whatsapp: settings.whatsapp.enabled
        ? whatsappUrl(settings.whatsapp.number, settings.whatsapp.message)
        : null,
    };
  } catch {
    return { email: 'contact@mamboproxi.com', whatsapp: null };
  }
}

/**
 * Page de maintenance (non maquettée, gabarit de la 404) : affichée pendant une mise à jour ; elle ne dépend pas de
 * l'API pour s'afficher et laisse joindre l'agence par e-mail ou WhatsApp.
 */
export default async function MaintenancePage() {
  const { email, whatsapp } = await contactLinks();
  return (
    <div className="flex min-h-dvh flex-col bg-neutral-50">
      <header className="flex justify-center border-b border-border-default bg-neutral-0 px-5 py-[18px]">
        <Logo className="h-[33px] w-auto md:h-10" priority />
      </header>
      <main id="contenu" className="flex-1">
        <ErrorPanel
          eyebrow="Maintenance"
          title="Le site fait une courte pause."
          text="Nous effectuons une mise à jour pour mieux vous servir. Revenez dans quelques instants ; en cas d’urgence, écrivez-nous."
          showLinks={false}
          actions={
            <>
              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: 'whatsapp' })}
                >
                  <WhatsappIcon size={18} />
                  Écrire sur WhatsApp
                </a>
              )}
              <a href={`mailto:${email}`} className={buttonVariants({ variant: 'outline' })}>
                <Mail aria-hidden />
                {email}
              </a>
            </>
          }
        />
      </main>
    </div>
  );
}
