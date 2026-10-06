import { CtaBand } from '@/components/site/cta-band';
import { getSiteSettings } from '@/lib/site-data';
import { whatsappUrl } from '@/lib/whatsapp';

/** Accueil provisoire : remplacé par la page maquettée (Phase 1.3). */
export default async function HomePage() {
  const settings = await getSiteSettings();
  return (
    <>
      <section className="container-site flex min-h-[60vh] flex-col gap-4 section-y">
        <p className="text-web-eyebrow">MAMBO Proxi</p>
        <h1 className="text-web-hero">Site en cours d&apos;intégration.</h1>
      </section>
      <CtaBand
        title={['Un projet, une question ?', 'Parlons-en.']}
        text="Devis gratuit et sans engagement, réponse sous 24 h. Ou écrivez-nous directement sur WhatsApp."
        whatsappHref={
          settings.whatsapp.enabled ? whatsappUrl(settings.whatsapp.number, settings.whatsapp.message) : null
        }
      />
    </>
  );
}
