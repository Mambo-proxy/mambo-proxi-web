import { ArrowRight } from 'lucide-react';
import type { Route } from 'next';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { SiteLink as Link } from '@/i18n/site-link';
import type { ReactNode } from 'react';
import { frenchTypography } from '@/lib/format/typography';
import { routes } from '@/lib/routes';
import { CarScene } from './car-scene';

/** Liens utiles sous les actions (maquette 404 : Devis gratuit, Contact, Avis clients), dans `errors.links`. */
const USEFUL_LINKS: ReadonlyArray<{ key: 'quote' | 'contact' | 'reviews'; href: Route }> = [
  { key: 'quote', href: routes.devis },
  { key: 'contact', href: routes.contact },
  { key: 'reviews', href: '/avis-clients' as Route },
];

type ErrorPanelProps = {
  eyebrow: string;
  title: string;
  text: string;
  /** Boutons (404 : accueil et services ; 500 : réessayer). */
  actions: ReactNode;
  showLinks?: boolean;
  /** Photo de la maquette (404 : `page404`) ; sans photo, scène « voiture » animée (500, maintenance). */
  photo?: string;
};

/**
 * Gabarit des pages d'erreur (404 `83:9961`, mobile `83:10230`) : fond `neutral/50`, photo ou scène « voiture »
 * animée (560 × 420, rayon 32 ; 350 × 260 au-dessus du texte en mobile), sur-titre, titre 52/58, texte 19/30, actions
 * et liens utiles. Repris pour l'erreur 500 et la maintenance.
 */
export function ErrorPanel({ eyebrow, title, text, actions, showLinks = true, photo }: ErrorPanelProps) {
  const t = useTranslations('errors');
  return (
    <section className="bg-neutral-50">
      <div className="container-site grid items-center gap-6 pt-10 pb-16 xl:grid-cols-[560px_minmax(0,1fr)] xl:gap-[72px] xl:pt-24 xl:pb-32">
        <div className="relative h-[260px] overflow-hidden rounded-3xl md:h-[360px] xl:h-[420px] xl:rounded-[32px]">
          {photo ? (
            <Image
              src={photo}
              alt=""
              fill
              preload
              fetchPriority="high"
              sizes="(min-width: 1280px) 560px, 92vw"
              className="object-cover"
            />
          ) : (
            <CarScene className="size-full" />
          )}
        </div>
        <div className="flex flex-col gap-[18px]">
          <p className="text-web-eyebrow">{eyebrow}</p>
          <h1 className="font-brand text-[30px] leading-9 font-semibold tracking-[-0.025em] text-text-main md:text-[44px] md:leading-[50px] xl:text-[52px] xl:leading-[58px]">
            {frenchTypography(title)}
          </h1>
          <p className="font-ui text-[16px] leading-[25px] text-text-muted xl:text-[19px] xl:leading-[30px]">
            {frenchTypography(text)}
          </p>
          <div className="flex flex-col gap-2.5 md:flex-row">{actions}</div>
          {showLinks && (
            <ul className="flex flex-wrap gap-4">
              {USEFUL_LINKS.map((link) => (
                <li key={link.href} className="flex">
                  <Link
                    href={link.href}
                    className="group/link inline-flex items-center gap-1.5 rounded-xs font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-main"
                  >
                    {t(`links.${link.key}`)}
                    <ArrowRight
                      aria-hidden
                      size={16}
                      className="transition-transform duration-200 group-hover/link:translate-x-[3px]"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
