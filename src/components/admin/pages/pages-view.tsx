'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ChevronRight, CircleCheck, FileText, LayoutTemplate } from 'lucide-react';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { AdminCard } from '@/components/admin/ui/admin-ui';
import { EmptyState } from '@/components/admin/ui/filters';
import { AdminPage, topbarActionClass, topbarSecondaryClass } from '@/components/admin/shell/admin-page';
import { ReadOnlyNotice, useCan } from '@/components/admin/shell/permissions';
import { ButtonLink } from '@/components/ui/button';
import { Select } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { adminRoutes } from '@/lib/admin/routes';
import { browserApi } from '@/lib/api/browser';
import type { AdminPageSummary, PageKey } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatAgo } from '@/lib/format/date';
import { PageEditor, pageKey, pageListKey, useStorePage, type PageEditorHandle } from './page-editor';
import { CATEGORY_PAGES, CATEGORY_PAGES_AFTER } from './page-model';

const DEFAULT_PAGE = 'accueil';

type ListEntry = { key: string; title: string; path: string; meta: string | null; category: boolean };

/** Liste de la maquette : pages éditables de l'API, pages de rubrique insérées après « Nos services ». */
function listEntries(pages: AdminPageSummary[]): ListEntry[] {
  return pages.flatMap((page) => {
    const entry: ListEntry = {
      key: page.key,
      title: page.title,
      path: page.path,
      // Méta « Modifié hier » : modifications enregistrées, pas encore publiées.
      meta: page.hasDraft ? `Modifié ${formatAgo(page.updatedAt).toLowerCase()}` : null,
      category: false,
    };
    if (page.key !== CATEGORY_PAGES_AFTER) return [entry];
    return [entry, ...CATEGORY_PAGES.map((category) => ({ ...category, meta: null, category: true }))];
  });
}

/** Page et sections ouvertes lues dans l'adresse (`?page=accueil&section=hero,engagements`). */
function useSelection() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = params.get('page') ?? DEFAULT_PAGE;
  const sections = (params.get('section') ?? '').split(',').filter(Boolean);
  function update(changes: { page?: string; sections?: string[] }) {
    const next = new URLSearchParams(params.toString());
    if (changes.page !== undefined) {
      next.set('page', changes.page);
      next.delete('section');
    }
    if (changes.sections !== undefined) {
      if (changes.sections.length) next.set('section', changes.sections.join(','));
      else next.delete('section');
    }
    router.replace(`${pathname}?${next.toString()}` as Route, { scroll: false });
  }
  return { page, sections, update };
}

/**
 * Pages & textes (`92:10771`) : liste des pages du site (260 px) et sections de la page choisie ; publication,
 * aperçu et annulation du brouillon. Sous 1 280 px, la liste devient une liste déroulante au-dessus des sections.
 */
export function PagesView() {
  const selection = useSelection();
  const editor = useRef<PageEditorHandle>(null);
  const [version, setVersion] = useState(0);
  const storePage = useStorePage();
  // Sans `content:write` (responsable) : pages consultées, ni brouillon ni publication.
  const canWrite = useCan()('content:write');

  const list = useQuery({
    queryKey: pageListKey,
    queryFn: () => data(browserApi.GET('/v1/admin/pages')),
  });
  const entries = list.data ? listEntries(list.data) : [];
  const category = CATEGORY_PAGES.find((entry) => entry.key === selection.page);
  const current = entries.find((entry) => entry.key === selection.page);

  const page = useQuery({
    queryKey: pageKey(selection.page),
    queryFn: () =>
      data(browserApi.GET('/v1/admin/pages/{key}', { params: { path: { key: selection.page as PageKey } } })),
    enabled: !category,
    // Le brouillon en cours d'édition ne doit pas être remplacé par un rechargement en arrière-plan.
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const publish = useMutation({
    mutationFn: (key: PageKey) =>
      data(browserApi.POST('/v1/admin/pages/{key}/publish', { params: { path: { key } } })),
    onSuccess: (published) => {
      storePage(published);
      toast.success(`Page « ${published.title} » publiée : le site affiche la nouvelle version.`);
    },
  });

  async function onPublish() {
    const handle = editor.current;
    if (!handle || !page.data) return;
    if (!handle.validate()) {
      toast.error('Corrigez les champs signalés avant de publier.');
      return;
    }
    if (!(await handle.flush())) {
      toast.error('Le brouillon n’a pas pu être enregistré : réessayez dans un instant.');
      return;
    }
    const latest = await page.refetch();
    if (!latest.data?.hasDraft) {
      toast.info('Aucune modification à publier : la page est à jour.');
      return;
    }
    publish.mutate(latest.data.key);
  }

  async function selectPage(key: string) {
    if (key === selection.page) return;
    // Modifications en attente enregistrées avant de changer de page.
    await editor.current?.flush();
    selection.update({ page: key });
  }

  const publicPath = current?.path ?? category?.path ?? '/';

  return (
    <AdminPage
      title="Pages & textes"
      breadcrumb={
        <span className="flex items-center gap-1.5">
          Contenus du site <ChevronRight aria-hidden size={12} /> Pages & textes
        </span>
      }
      actions={
        <>
          <a href={publicPath} target="_blank" rel="noopener noreferrer" className={topbarSecondaryClass}>
            <ArrowUpRight aria-hidden />
            Voir la page
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
          {!category && canWrite && (
            <button
              type="button"
              onClick={() => void onPublish()}
              disabled={publish.isPending || !page.data}
              aria-busy={publish.isPending || undefined}
              className={cn(topbarActionClass, 'disabled:opacity-60')}
            >
              <CircleCheck aria-hidden />
              {publish.isPending ? 'Publication…' : 'Publier les modifications'}
            </button>
          )}
        </>
      }
    >
      <ReadOnlyNotice permission="content:write" className="mb-5" />
      <div className="grid items-start gap-5 xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-6">
        <PageList
          entries={entries}
          loading={!list.data}
          error={list.isError && !list.data}
          onRetry={() => void list.refetch()}
          selected={selection.page}
          onSelect={(key) => void selectPage(key)}
        />

        <div className="flex min-w-0 flex-col gap-3.5">
          {category ? (
            <AdminCard>
              <EmptyState
                icon={<LayoutTemplate size={24} />}
                title={`Page « ${category.title} »`}
                text="Cette page est composée automatiquement à partir de la rubrique et de ses services : textes, visuels et ordre se modifient dans l’écran Services."
                action={
                  <ButtonLink href={adminRoutes.services} variant="outline" size="sm">
                    Modifier dans Services
                  </ButtonLink>
                }
              />
            </AdminCard>
          ) : page.isError && !page.data ? (
            <AdminCard role="alert" className="flex flex-col items-start gap-3 p-6">
              <p className="font-ui text-[15px] leading-6">Impossible de charger cette page.</p>
              <button type="button" onClick={() => void page.refetch()} className={topbarSecondaryClass}>
                Réessayer
              </button>
            </AdminCard>
          ) : !page.data ? (
            <div aria-hidden className="flex flex-col gap-3.5">
              <Skeleton className="h-12 w-64 rounded-md" />
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : (
            <PageEditor
              key={`${page.data.key}-${version}`}
              ref={editor}
              page={page.data}
              openSections={selection.sections}
              onOpenSections={(sections) => selection.update({ sections })}
              onReset={() => setVersion((value) => value + 1)}
              readOnly={!canWrite}
            />
          )}
        </div>
      </div>
    </AdminPage>
  );
}

/**
 * Liste « Pages du site » (`92:10927`) : carte blanche, padding 12, écart 2 ; élément padding 9/10, rayon 9,
 * icône 16, Inter Medium 14 `neutral/700` ; actif fond `orange/50`, Inter SemiBold, icône orange ; méta Inter 11.
 */
function PageList({
  entries,
  loading,
  error,
  onRetry,
  selected,
  onSelect,
}: {
  entries: ListEntry[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <>
      {/* Sous 1 280 px : liste déroulante. */}
      <div className="xl:hidden">
        <label
          htmlFor="page-select"
          className="mb-2 block font-ui text-[14px] leading-5 font-semibold text-text-main"
        >
          Page à modifier
        </label>
        <Select
          id="page-select"
          value={selected}
          onChange={(event) => onSelect(event.target.value)}
          disabled={loading}
        >
          {loading && <option value={selected}>Chargement…</option>}
          {entries.map((entry) => (
            <option key={entry.key} value={entry.key}>
              {entry.title}
              {entry.meta ? ` · ${entry.meta}` : ''}
            </option>
          ))}
        </Select>
      </div>

      <nav
        aria-labelledby="pages-list-title"
        className="hidden flex-col gap-0.5 rounded-lg border border-border-default bg-neutral-0 p-3 xl:flex"
      >
        <h2
          id="pages-list-title"
          className="px-2.5 pt-1.5 pb-2 font-ui text-[11px] leading-4 font-semibold tracking-[0.01em] text-text-muted uppercase"
        >
          Pages du site
        </h2>
        {error ? (
          <div role="alert" className="flex flex-col items-start gap-2 p-2.5">
            <p className="font-ui text-[14px] leading-5">Impossible de charger les pages.</p>
            <button type="button" onClick={onRetry} className={topbarSecondaryClass}>
              Réessayer
            </button>
          </div>
        ) : loading ? (
          <div aria-hidden className="flex flex-col gap-1">
            {Array.from({ length: 12 }, (_, index) => (
              <Skeleton key={index} className="h-[38px] rounded-[9px]" />
            ))}
          </div>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {entries.map((entry) => {
              const active = entry.key === selected;
              return (
                <li key={entry.key}>
                  <a
                    href={`?page=${entry.key}`}
                    aria-current={active ? 'page' : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      onSelect(entry.key);
                    }}
                    className={cn(
                      'flex items-center gap-2.5 rounded-[9px] px-2.5 py-[9px] font-ui text-[14px] leading-5 transition-colors',
                      active
                        ? 'bg-orange-50 font-semibold text-text-main'
                        : 'font-medium text-neutral-700 hover:bg-neutral-50 hover:text-text-main',
                    )}
                  >
                    <FileText
                      aria-hidden
                      size={16}
                      className={cn('shrink-0', active ? 'text-brand-primary' : 'text-icon-default')}
                    />
                    <span className="min-w-0 flex-1 truncate">{entry.title}</span>
                    {entry.meta && (
                      <span className="shrink-0 font-ui text-[11px] leading-4 font-normal text-text-muted">
                        {entry.meta}
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </>
  );
}
