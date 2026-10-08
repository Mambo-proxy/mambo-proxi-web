'use client';

import { ArrowRight, Clock, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import type { DynamicSection, Training, TrainingCategory } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { SectionHeading } from '../section-heading';
import { SectionShell } from '../content/section-shell';

type Filter = TrainingCategory | 'TOUTES';

/** Événement envoyé au formulaire quand une formation est demandée depuis le catalogue. */
export const TRAINING_REQUEST_EVENT = 'mambo:demande-formation';

function isCategory(value: string | null, trainings: Training[]): value is TrainingCategory {
  return trainings.some((training) => training.category === value);
}

/**
 * Catalogue (Formation `66:6354`) : filtres (Toutes + catégories, `?categorie=` dans l'adresse), cartes 3 colonnes
 * (1 en mobile) alignées en haut : pastille `vert/50`, badge de catégorie, titre Poppins 20/28, durée et format · lieu,
 * séparateur, « Demander cette formation → » qui présélectionne la formation dans le formulaire.
 */
export function TrainingsCatalog({
  section,
  trainings,
  initialFilter,
}: {
  section: DynamicSection;
  trainings: Training[];
  initialFilter: string | null;
}) {
  const [filter, setFilter] = useState<Filter>(
    isCategory(initialFilter, trainings) ? initialFilter : 'TOUTES',
  );
  const categories = [
    ...new Map(trainings.map((training) => [training.category, training.categoryLabel])).entries(),
  ];
  const visible =
    filter === 'TOUTES' ? trainings : trainings.filter((training) => training.category === filter);

  function choose(next: Filter) {
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
      />
      <div role="group" aria-label="Filtrer les formations" className="flex flex-wrap gap-2">
        <Chip selected={filter === 'TOUTES'} onClick={() => choose('TOUTES')}>
          Toutes
        </Chip>
        {categories.map(([category, label]) => (
          <Chip key={category} selected={filter === category} onClick={() => choose(category)}>
            {label}
          </Chip>
        ))}
      </div>
      <ul aria-live="polite" className="grid items-start gap-3 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
        {visible.map((training) => (
          <li
            key={training.slug}
            className="flex flex-col gap-3.5 rounded-3xl border border-border-default bg-neutral-0 p-5 xl:p-7"
          >
            <div className="flex items-start justify-between gap-3">
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
            <h3 className="font-brand text-[20px] leading-7 font-semibold text-text-main">
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
              Demander cette formation
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
