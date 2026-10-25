'use client';

import { ArrowRight, Clock, MapPin } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { useStaggerIn } from '@/components/ui/use-stagger-in';
import type { DynamicSection, Training, TrainingCategory } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { scrollToTarget, useHashTarget } from '@/lib/use-hash-target';
import { SectionHeading } from '../section-heading';
import { SectionShell } from '../content/section-shell';

type Filter = TrainingCategory | 'TOUTES';

/** Événement envoyé au formulaire quand une formation est demandée depuis le catalogue. */
export const TRAINING_REQUEST_EVENT = 'mambo:demande-formation';

function isCategory(value: string | null, trainings: Training[]): value is TrainingCategory {
  return trainings.some((training) => training.category === value);
}

type TrainingsCatalogProps = { section: DynamicSection; trainings: Training[]; initialFilter: string | null };

/**
 * `TrainingsCatalog` filtré par l'adresse (`?categorie=`). La page étant prérendue, l'adresse n'est lue que
 * dans le navigateur : à placer sous `<Suspense>`, avec en repli `TrainingsCatalog` sur « Toutes » (même
 * rendu que sans paramètre).
 */
export function TrainingsCatalogFromUrl(props: Omit<TrainingsCatalogProps, 'initialFilter'>) {
  return <TrainingsCatalog {...props} initialFilter={useSearchParams().get('categorie')} />;
}

/**
 * Catalogue (Formation `66:6354`) : filtres (Toutes + catégories, `?categorie=` dans l'adresse), cartes 3 colonnes
 * (1 en mobile) alignées en haut : pastille `vert/50`, badge de catégorie centré, titre Poppins 20/28 (17/28 en
 * mobile), durée et format · lieu, séparateur, « Demander cette formation → » qui présélectionne la formation dans le
 * formulaire. Changement de filtre : les cartes réapparaissent en cascade.
 * Chaque carte porte l'ancre de sa formation (`/formation#hygiene-securite-cuisine`, résultats de la recherche) : la
 * carte visée est mise en évidence et, si le filtre la masquait, le catalogue repasse sur « Toutes » (jusqu'au
 * prochain choix de filtre).
 */
export function TrainingsCatalog({ section, trainings, initialFilter }: TrainingsCatalogProps) {
  const t = useTranslations('trainings');
  const [filter, setFilter] = useState<Filter>(
    isCategory(initialFilter, trainings) ? initialFilter : 'TOUTES',
  );
  const hash = useHashTarget();
  const targeted = trainings.find((training) => training.slug === hash) ?? null;
  // Ancre déjà « rendue » au filtre choisi par la personne : le filtre n'est plus forcé sur « Toutes ».
  const [released, setReleased] = useState<string | null>(null);
  const masked =
    targeted !== null && targeted.slug !== released && filter !== 'TOUTES' && targeted.category !== filter;
  const shown: Filter = masked ? 'TOUTES' : filter;
  const listRef = useStaggerIn<HTMLUListElement>(shown);
  const categories = [
    ...new Map(trainings.map((training) => [training.category, training.categoryLabel])).entries(),
  ];
  const visible =
    shown === 'TOUTES' ? trainings : trainings.filter((training) => training.category === shown);

  // Carte visée affichée après coup (filtre levé, hydratation) : le navigateur n'a pas pu y défiler.
  const targetedSlug = targeted?.slug ?? null;
  useEffect(() => {
    if (!targetedSlug) return;
    const frame = requestAnimationFrame(() => scrollToTarget(document.getElementById(targetedSlug)));
    return () => cancelAnimationFrame(frame);
  }, [targetedSlug]);

  function choose(next: Filter) {
    setReleased(targetedSlug);
    setFilter(next);
    const url = new URL(window.location.href);
    if (next === 'TOUTES') url.searchParams.delete('categorie');
    else url.searchParams.set('categorie', next);
    window.history.replaceState(null, '', url);
  }

  // Liens « Voir les formations » des offres : filtre appliqué sans recharger la page.
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href*="#catalogue"]');
      if (!link) return;
      const url = new URL(link.href);
      if (url.pathname !== window.location.pathname) return;
      const category = url.searchParams.get('categorie');
      if (!isCategory(category, trainings)) return;
      event.preventDefault();
      choose(category);
      document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  });

  function request(training: Training) {
    window.dispatchEvent(new CustomEvent(TRAINING_REQUEST_EVENT, { detail: training.slug }));
  }

  return (
    <SectionShell section={section} innerClassName="flex flex-col gap-7 xl:gap-12">
      <SectionHeading
        eyebrow={section.eyebrow}
        title={section.title}
        titleMobile={section.titleMobile}
        lead={section.lead}
        leadMobile={section.leadMobile}
        // En-tête mobile (`66:6805`) : écarts de 12.
        className="gap-3 md:gap-4"
      />
      <div role="group" aria-label={t('filter')} className="flex flex-wrap gap-2">
        <Chip selected={shown === 'TOUTES'} onClick={() => choose('TOUTES')}>
          {t('all')}
        </Chip>
        {categories.map(([category, label]) => (
          <Chip key={category} selected={shown === category} onClick={() => choose(category)}>
            {label}
          </Chip>
        ))}
      </div>
      <ul
        ref={listRef}
        aria-live="polite"
        className="grid items-start gap-3 md:grid-cols-2 md:gap-5 xl:grid-cols-3"
      >
        {visible.map((training) => (
          <li
            key={training.slug}
            id={training.slug}
            data-targeted={training.slug === targetedSlug || undefined}
            // Mise en évidence douce de la carte visée par l'ancre (`:target` au chargement, attribut ensuite).
            className="flex card-lift scroll-mt-[calc(var(--site-header-h,0px)+16px)] flex-col gap-3.5 rounded-3xl border border-border-default bg-neutral-0 p-5 target:border-orange-400 target:bg-orange-50 data-targeted:border-orange-400 data-targeted:bg-orange-50 xl:p-7"
          >
            <div className="flex items-center justify-between gap-3">
              <span
                aria-hidden
                className="flex size-11 items-center justify-center rounded-[13px] bg-vert-50"
              >
                <Icon name={training.icon} size={20} className="text-vert-700" />
              </span>
              <span
                className={cn(
                  'rounded-full px-2.5 py-1 font-ui text-[12px] leading-4 font-semibold tracking-[0.01em]',
                  training.category === 'PROFESSIONNELS'
                    ? 'bg-neutral-100 text-text-main'
                    : 'bg-orange-50 text-orange-700',
                )}
              >
                {training.categoryLabel}
              </span>
            </div>
            <h3 className="font-brand text-[17px] leading-7 font-semibold text-text-main xl:text-[20px]">
              {frenchTypography(training.title)}
            </h3>
            <p className="flex flex-wrap gap-x-4 gap-y-1 font-ui text-[13px] leading-5 text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Clock aria-hidden size={16} />
                {frenchTypography(training.duration)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin aria-hidden size={16} />
                {[training.format, training.location].filter(Boolean).join(' · ')}
              </span>
            </p>
            <a
              href="#demande-formation"
              onClick={() => request(training)}
              className="group/cta inline-flex items-center gap-1.5 self-stretch rounded-xs border-t border-border-default pt-3.5 font-ui text-[14px] leading-5 font-semibold text-text-brand"
            >
              {t('request')}
              <span className="sr-only"> : {training.title}</span>
              <ArrowRight
                aria-hidden
                size={16}
                className="transition-transform duration-200 group-hover/cta:translate-x-[3px]"
              />
            </a>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
