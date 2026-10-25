'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Chip } from '@/components/ui/chip';
import type { DynamicSection, Partner, PartnerCategory } from '@/lib/api/schema';
import { SectionHeading } from '../section-heading';
import { SectionShell } from '../content/section-shell';

type Filter = PartnerCategory | 'TOUS';

const CATEGORIES: PartnerCategory[] = ['EXPERIENCE', 'IMMOBILIER', 'ENTREPRISES'];

type PartnersGridProps = { section: DynamicSection; partners: Partner[]; initialFilter: Filter };

/**
 * `PartnersGrid` filtré par l'adresse (`?categorie=`). La page étant prérendue, l'adresse n'est lue que dans
 * le navigateur : à placer sous `<Suspense>`, avec en repli `PartnersGrid` sur « Tous » (même rendu que sans
 * paramètre).
 */
export function PartnersGridFromUrl(props: Omit<PartnersGridProps, 'initialFilter'>) {
  const categorie = useSearchParams().get('categorie');
  return (
    <PartnersGrid
      {...props}
      initialFilter={CATEGORIES.find((category) => category === categorie) ?? 'TOUS'}
    />
  );
}

/**
 * « Nos partenaires » (`65:5841`) : filtres (Tous + catégories, `?categorie=` dans l'adresse), grille de logos
 * 4 colonnes (2 en mobile, 6 premiers seulement) ; tuile `neutral/50` rayon 20 avec logo ou nom et badge de catégorie.
 */
export function PartnersGrid({ section, partners, initialFilter }: PartnersGridProps) {
  // Badge de catégorie : libellé court de la maquette (« Expérience », « Immobilier », « Entreprise »).
  const t = useTranslations('partners');
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const categories = [
    ...new Map(partners.map((partner) => [partner.category, partner.categoryLabel])).entries(),
  ];
  const visible = filter === 'TOUS' ? partners : partners.filter((partner) => partner.category === filter);

  function choose(next: Filter) {
    setFilter(next);
    const url = new URL(window.location.href);
    if (next === 'TOUS') url.searchParams.delete('categorie');
    else url.searchParams.set('categorie', next);
    window.history.replaceState(null, '', url);
  }

  return (
    <SectionShell section={section} innerClassName="flex flex-col gap-7 xl:gap-12">
      <SectionHeading
        eyebrow={section.eyebrow}
        title={section.title}
        titleMobile={section.titleMobile}
        // En-tête mobile (`65:6256`) : écart de 12.
        className="gap-3 md:gap-4"
      />
      <div role="group" aria-label={t('filter')} className="flex flex-wrap gap-2">
        <Chip selected={filter === 'TOUS'} onClick={() => choose('TOUS')}>
          {t('all')}
        </Chip>
        {categories.map(([category, label]) => (
          <Chip key={category} selected={filter === category} onClick={() => choose(category)}>
            {label}
          </Chip>
        ))}
      </div>
      <ul
        aria-live="polite"
        className="grid grid-cols-2 gap-2.5 md:gap-4 xl:grid-cols-4 max-md:[&>li:nth-child(n+7)]:hidden"
      >
        {visible.map((partner) => {
          const content = (
            <>
              {partner.logo ? (
                <Image
                  src={partner.logo.url}
                  alt={partner.logo.alt ?? partner.name}
                  width={partner.logo.width ?? 160}
                  height={partner.logo.height ?? 48}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <span className="font-ui text-[14px] leading-5 font-semibold text-text-muted">
                  {partner.name}
                </span>
              )}
              <span className="rounded-full bg-neutral-0 px-[9px] py-[3px] font-ui text-[11px] leading-4 tracking-[0.01em] text-text-muted">
                {t(`badges.${partner.category}`)}
              </span>
            </>
          );
          return (
            <li key={partner.id}>
              {partner.url ? (
                <a
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-[100px] flex-col items-center justify-center gap-2.5 rounded-[20px] bg-neutral-50 px-3 py-6 text-center hover:bg-neutral-100"
                >
                  {content}
                  <span className="sr-only"> (nouvel onglet)</span>
                </a>
              ) : (
                <div className="flex h-[100px] flex-col items-center justify-center gap-2.5 rounded-[20px] bg-neutral-50 px-3 py-6 text-center">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}
