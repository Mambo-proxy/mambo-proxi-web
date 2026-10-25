'use client';

import { ArrowRight, Search, SearchX } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { SiteLink as Link, useSiteRouter } from '@/i18n/site-link';
import { buttonVariants } from '@/components/ui/button';
import { chipVariants } from '@/components/ui/chip';
import { Input } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import type { SearchGroup } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { routes } from '@/lib/routes';
import { MAX_QUERY_LENGTH, searchPageHref } from './search-href';
import { Highlight, ResultThumb } from './search-result';
import { useSearchResults } from './use-search-results';

/** Résultats par type sur la page (maximum de l'API). */
const PAGE_LIMIT = 20;

type SearchPageProps = { query: string; breadcrumb: ReactNode };

/**
 * `SearchPage` lisant le texte recherché dans l'adresse (`?q=`). La page étant prérendue, l'adresse n'est lue que
 * dans le navigateur : à placer sous `<Suspense>`, avec en repli `SearchPage` sans texte (même rendu que `/recherche`).
 */
export function SearchPageFromUrl(props: Omit<SearchPageProps, 'query'>) {
  return <SearchPage {...props} query={useSearchParams().get('q') ?? ''} />;
}

/**
 * Page de résultats de la recherche globale (non maquettée, langage des pages Contact et Formation) : en-tête
 * `neutral/50` avec fil d'Ariane, titre et champ de recherche, puis un bloc par type (titre et nombre de résultats),
 * cartes 2 colonnes à partir de 768 px avec vignette, titre et extrait surlignés. Nouvelle recherche : l'adresse
 * est remplacée (`?q=`), sans nouvelle entrée d'historique.
 */
export function SearchPage({ query, breadcrumb }: SearchPageProps) {
  const t = useTranslations('search');
  const router = useSiteRouter();
  const inputId = useId();
  const [value, setValue] = useState(query);
  // Texte de l'adresse modifié (Précédent/Suivant, nouvelle recherche) : le champ le reprend.
  const [shownQuery, setShownQuery] = useState(query);
  if (query !== shownQuery) {
    setShownQuery(query);
    setValue(query);
  }
  const { term, status, data } = useSearchResults(query, { limit: PAGE_LIMIT, delay: 0 });
  const count =
    status === 'success' && data && data.total > 0 ? t('resultsCount', { count: data.total }) : '';

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.replace(searchPageHref(value), { scroll: false });
  }

  return (
    <>
      <section className="bg-neutral-50">
        <div className="container-site flex flex-col gap-5 pt-5 pb-10 md:pb-14 xl:gap-8 xl:pt-12 xl:pb-16">
          {breadcrumb}
          <div className="flex flex-col gap-4 xl:max-w-[820px]">
            <p className="text-web-eyebrow">{t('eyebrow')}</p>
            <h1 className="font-brand text-[34px] leading-10 font-semibold tracking-[-0.025em] break-words text-text-main md:text-[44px] md:leading-[50px] xl:text-[56px] xl:leading-[62px]">
              {frenchTypography(term ? t('pageTitleQuery', { query: term }) : t('pageTitle'))}
            </h1>
          </div>
          <form
            role="search"
            onSubmit={submit}
            className="flex flex-col gap-2.5 md:max-w-[680px] md:flex-row"
          >
            <label htmlFor={inputId} className="sr-only">
              {t('label')}
            </label>
            <div className="min-w-0 flex-1">
              <Input
                id={inputId}
                icon={Search}
                type="search"
                name="q"
                enterKeyHint="search"
                autoComplete="off"
                maxLength={MAX_QUERY_LENGTH}
                placeholder={t('placeholder')}
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
            </div>
            <button type="submit" className={buttonVariants({ size: 'lg' })}>
              {t('submit')}
            </button>
          </form>
        </div>
      </section>

      <section className="bg-neutral-0 py-10 md:py-14 xl:py-20">
        <div
          className="container-site flex flex-col gap-10 xl:gap-14"
          aria-busy={status === 'loading' || undefined}
        >
          {/* Région annoncée toujours présente (masquée visuellement quand elle est vide) : nombre de résultats. */}
          <p
            role="status"
            className={cn('font-ui text-[14px] leading-5 text-text-muted', !count && 'sr-only')}
          >
            {count}
          </p>
          {status === 'loading' && !data && (
            <p className="flex items-center gap-2 font-ui text-[15px] leading-6 text-text-muted">
              <Spinner />
              {t('loading')}
            </p>
          )}
          {status === 'error' && (
            <p className="font-ui text-[15px] leading-6 text-feedback-error">
              {frenchTypography(t('error'))}
            </p>
          )}
          {status === 'idle' && <Invitation />}
          {status !== 'idle' && data?.total === 0 && status !== 'error' && <NoResults term={term} />}
          {status !== 'idle' &&
            status !== 'error' &&
            data?.groups.map((group) => <ResultGroup key={group.type} group={group} />)}
        </div>
      </section>
    </>
  );
}

function ResultGroup({ group }: { group: SearchGroup }) {
  const t = useTranslations('search');
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4 xl:gap-5">
      <h2
        id={headingId}
        className="flex items-baseline gap-2.5 font-brand text-[22px] leading-[30px] font-semibold text-text-main xl:text-[26px] xl:leading-[34px]"
      >
        {frenchTypography(group.label)}
        <span className="font-ui text-[14px] leading-5 font-medium text-text-muted">{group.total}</span>
      </h2>
      <ul className="grid gap-3 md:grid-cols-2 md:gap-4">
        {group.items.map((result) => (
          <li key={`${result.type}-${result.id}`}>
            <Link
              href={result.href}
              className="flex h-full card-lift items-start gap-4 rounded-[22px] border border-border-default bg-neutral-0 p-4 md:p-5"
            >
              <ResultThumb result={result} className="size-14 rounded-[14px]" />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-ui text-[16px] leading-6 font-semibold break-words text-text-main">
                  <Highlight text={result.title} ranges={result.titleHighlights} />
                </span>
                {result.context && (
                  <span className="font-ui text-[13px] leading-5 font-medium text-text-muted">
                    {frenchTypography(result.context)}
                  </span>
                )}
                <span className="line-clamp-2 font-ui text-[14px] leading-[21px] break-words text-text-muted">
                  <Highlight text={result.excerpt} ranges={result.highlights} />
                </span>
              </span>
              <ArrowRight aria-hidden size={18} className="mt-0.5 shrink-0 text-text-brand" />
            </Link>
          </li>
        ))}
      </ul>
      {group.total > group.items.length && (
        <p className="font-ui text-[13px] leading-5 text-text-muted">
          {t('groupMore', { shown: group.items.length, total: group.total })}
        </p>
      )}
    </section>
  );
}

/** Sans texte recherché : invitation et exemples de recherche. */
function Invitation() {
  const t = useTranslations('search');
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-brand text-[22px] leading-[30px] font-semibold text-text-main">
          {frenchTypography(t('emptyTitle'))}
        </h2>
        <p className="font-ui text-[15px] leading-6 text-text-muted">{frenchTypography(t('emptyText'))}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-ui text-[14px] leading-5 text-text-muted">
          {frenchTypography(t('tryLabel'))}
        </span>
        {(['try1', 'try2', 'try3'] as const).map((key) => (
          <Link key={key} href={searchPageHref(t(key))} transitionTypes={[]} className={chipVariants()}>
            {t(key)}
          </Link>
        ))}
      </div>
    </div>
  );
}

function NoResults({ term }: { term: string }) {
  const t = useTranslations('search');
  return (
    <div className="flex flex-col items-start gap-3">
      <span
        aria-hidden
        className="flex size-12 items-center justify-center rounded-[14px] bg-orange-50 text-text-brand"
      >
        <SearchX size={22} />
      </span>
      <h2 className="font-brand text-[22px] leading-[30px] font-semibold break-words text-text-main">
        {frenchTypography(t('noResultsTitle', { query: term }))}
      </h2>
      <p className="max-w-[640px] font-ui text-[15px] leading-6 text-text-muted">
        {frenchTypography(t('noResultsText'))}
      </p>
      <Link href={routes.contact} className={buttonVariants({ variant: 'outline' })}>
        {t('contact')}
      </Link>
    </div>
  );
}
