'use client';

import { Briefcase, Clock, MapPin, Search } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import type { DynamicSection, JobOfferSummary } from '@/lib/api/schema';
import { formatPublishedAgo } from '@/lib/format/date';
import { frenchTypography } from '@/lib/format/typography';
import { SectionShell } from '../content/section-shell';

/** Contrats proposés comme filtres, dans cet ordre, s'ils figurent dans les offres publiées. */
const CONTRACTS = ['CDI', 'CDD', 'Freelance', 'Stage', 'Alternance'];

type Filter = { kind: 'city' | 'contract'; value: string } | null;

/** Recherche insensible à la casse et aux accents. */
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

/** Lieu de base d'une offre (« France · télétravail » → « France »). */
const baseCity = (city: string) => city.split(' · ')[0] ?? city;

/**
 * « Nos offres » (Recrutement `67:6874`) : nombre de postes ouverts en titre, recherche (pilule 360 à droite, pleine
 * largeur sous le titre en mobile), filtres lieu et contrat, liste d'offres (titre, badge « Nouveau », lieu, contrat,
 * ancienneté, « Voir l’offre »), note de bas de liste.
 */
export function JobsList({
  section,
  jobs,
  now,
}: {
  section: DynamicSection;
  jobs: JobOfferSummary[];
  /** Instant du rendu serveur, pour une ancienneté identique au serveur et au navigateur. */
  now: string;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>(null);
  const cities = [...new Set(jobs.map((job) => baseCity(job.city)))].sort((a, b) =>
    a === 'France' ? 1 : b === 'France' ? -1 : a.localeCompare(b, 'fr'),
  );
  const contracts = CONTRACTS.filter((contract) => jobs.some((job) => job.contractType.startsWith(contract)));
  const search = normalize(query.trim());
  const visible = jobs.filter(
    (job) =>
      (!filter ||
        (filter.kind === 'city'
          ? baseCity(job.city) === filter.value
          : job.contractType.startsWith(filter.value))) &&
      (!search || normalize(`${job.title} ${job.summary} ${job.city}`).includes(search)),
  );
  const count = jobs.length;
  const isSelected = (kind: 'city' | 'contract', value: string) =>
    filter?.kind === kind && filter.value === value;

  return (
    <SectionShell section={section} innerClassName="flex flex-col gap-7 xl:gap-12">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-col gap-4 xl:max-w-[820px]">
          {section.eyebrow && <p className="text-web-eyebrow">{frenchTypography(section.eyebrow)}</p>}
          <h2 className="text-web-section text-text-main">
            {count > 1 ? `${count} postes ouverts` : count === 1 ? '1 poste ouvert' : 'Aucun poste ouvert'}
          </h2>
        </div>
        <label className="relative block xl:w-[360px]">
          <span className="sr-only">Rechercher un poste</span>
          <Search
            aria-hidden
            size={18}
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-icon-default"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un poste"
            className="w-full rounded-full border border-border-strong bg-neutral-0 py-3 pr-4 pl-11 font-ui text-[16px] leading-6 text-text-main placeholder:text-text-subtle focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none"
          />
        </label>
      </div>
      <div role="group" aria-label="Filtrer les offres" className="flex flex-wrap gap-2">
        <Chip selected={filter === null} onClick={() => setFilter(null)}>
          Tous
        </Chip>
        {cities.map((city) => (
          <Chip
            key={city}
            selected={isSelected('city', city)}
            onClick={() => setFilter({ kind: 'city', value: city })}
          >
            {city}
          </Chip>
        ))}
        {contracts.map((contract) => (
          <Chip
            key={contract}
            selected={isSelected('contract', contract)}
            onClick={() => setFilter({ kind: 'contract', value: contract })}
          >
            {contract}
          </Chip>
        ))}
      </div>
      <ul aria-live="polite" className="flex flex-col gap-3">
        {visible.map((job) => (
          <li
            key={job.slug}
            className="flex flex-col gap-4 rounded-[22px] border border-border-default bg-neutral-0 p-5 md:flex-row md:items-center md:gap-6 xl:p-7"
          >
            <div className="flex flex-1 flex-col gap-2">
              <h3 className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-brand text-[20px] leading-7 font-semibold text-text-main">
                {frenchTypography(job.title)}
                {job.isNew && (
                  <span className="rounded-full bg-vert-50 px-[9px] py-[3px] font-ui text-[12px] leading-4 font-semibold tracking-[0.01em] text-vert-700">
                    Nouveau
                  </span>
                )}
              </h3>
              <p className="flex flex-wrap gap-x-4 gap-y-1 font-ui text-[14px] leading-5 text-text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin aria-hidden size={16} />
                  {job.city}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase aria-hidden size={16} />
                  {job.contractType}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock aria-hidden size={16} />
                  {`Publiée ${formatPublishedAgo(job.publishedAt, now)}`}
                </span>
              </p>
            </div>
            <Link
              href={`/recrutement/${job.slug}` as Route}
              className={buttonVariants({ variant: 'outline', className: 'max-md:w-full' })}
            >
              Voir l’offre
              <span className="sr-only"> : {job.title}</span>
            </Link>
          </li>
        ))}
        {visible.length === 0 && (
          <li className="rounded-[22px] border border-dashed border-border-strong p-7 text-center font-ui text-[15px] leading-6 text-text-muted">
            Aucune offre ne correspond à votre recherche. Vous pouvez envoyer une candidature spontanée.
          </li>
        )}
      </ul>
      {section.note && <p className="text-caption text-text-muted">{frenchTypography(section.note)}</p>}
    </SectionShell>
  );
}
