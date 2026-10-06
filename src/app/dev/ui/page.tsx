import { ArrowRight, User } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AccentText } from '@/components/ui/accent-text';
import { Accordion } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Stars } from '@/components/ui/stars';
import { Visual } from '@/components/ui/visual';
import { InteractiveDemos } from './demos';

export const metadata: Metadata = { title: 'Composants', robots: { index: false, follow: false } };

/** Page interne de contrôle des composants : absente du site de production (hors build sur mocks). */
const enabled = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_API_MOCKING === 'enabled';

const SCENES = ['accueil', 'chef', 'voiture', 'culture', 'equipe'] as const;

export default function UiPage() {
  if (!enabled) notFound();
  return (
    <main className="container-site flex flex-col gap-16 section-y">
      <header className="flex flex-col gap-4">
        <p className="text-web-eyebrow">Design system</p>
        <h1 className="text-web-hero">
          <AccentText text="Mambo, ce n'est pas qu'un service. ==C'est une expérience pensée pour vous.==" />
        </h1>
        <p className="max-w-[720px] text-web-lead text-text-muted">
          Composants du site et du back-office, construits sur les tokens du design system.
        </p>
      </header>

      <section className="flex flex-col gap-6">
        <h2 className="text-web-section">
          <AccentText text="Styles de texte ==web==" />
        </h2>
        <p className="text-web-stat">
          19 <span className="text-text-brand">services</span>
        </p>
        <Breadcrumb
          items={[{ label: 'Accueil', href: '/' }, { label: 'Nos services' }, { label: 'Chef privé' }]}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="mp-text-h3">Boutons</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button>Devis gratuit</Button>
          <Button variant="outline">En savoir plus</Button>
          <Button variant="dark">
            Demander un devis gratuit <ArrowRight aria-hidden />
          </Button>
          <ButtonLink variant="whatsapp" href="https://wa.me/237600000000">
            Écrire sur WhatsApp
          </ButtonLink>
          <Button loading>Envoi en cours</Button>
          <Button disabled>Désactivé</Button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="outline" shape="pill" size="sm">
            <User aria-hidden /> S&apos;inscrire
          </Button>
          <Button shape="pill" size="sm">
            Devis gratuit
          </Button>
          <Button variant="ghost">Annuler</Button>
          <Button variant="danger">Supprimer</Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="mp-text-h3">Badges, étoiles, pagination</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="orange">Nouvelle</Badge>
          <Badge tone="dark">En cours</Badge>
          <Badge tone="green">Prestation réalisée</Badge>
          <Badge tone="light">Clôturée</Badge>
          <Badge tone="gray">Brouillon</Badge>
          <Badge tone="red">Refusée</Badge>
          <Stars rating={4.8} size={18} />
        </div>
        <Pagination page={1} totalPages={12} hrefFor={() => '/dev/ui'} />
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <h2 className="mp-text-h3 md:col-span-2 xl:col-span-3">Cartes, visuels, chargement</h2>
        {SCENES.map((scene) => (
          <Card key={scene} padding="none" className="overflow-hidden">
            <Visual
              visual={{ illustration: scene, image: null, alt: '' }}
              sizes="(min-width: 1280px) 400px, 100vw"
              className="aspect-[4/3]"
            />
            <p className="p-5 font-ui text-[15px] font-semibold">Scène « {scene} »</p>
          </Card>
        ))}
        <Card className="flex flex-col gap-3">
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </Card>
      </section>

      <section className="flex max-w-[760px] flex-col gap-4">
        <h2 className="mp-text-h3">Accordéon</h2>
        <Accordion
          name="faq-demo"
          items={[
            {
              question: 'Le devis est-il gratuit ?',
              answer: 'Oui, le devis est gratuit et sans engagement : réponse sous 24 h.',
            },
            {
              question: 'Dans quelles villes intervenez-vous ?',
              answer: 'Douala, Yaoundé et Kribi ; autres villes sur demande.',
            },
          ]}
        />
      </section>

      <InteractiveDemos />
    </main>
  );
}
