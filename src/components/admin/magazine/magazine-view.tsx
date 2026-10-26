'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { BookOpen, Eye, FileText, Pencil, Plus, Trash2, Upload, Undo2 } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/admin/editor/editor-ui';
import { MediaThumb } from '@/components/admin/editor/media-picker';
import { topbarActionClass } from '@/components/admin/shell/admin-page';
import { ReadOnlyNotice, useCan } from '@/components/admin/shell/permissions';
import { ActionMenu } from '@/components/admin/ui/action-menu';
import { AdminCard } from '@/components/admin/ui/admin-ui';
import { EmptyState, StatusTabs } from '@/components/admin/ui/filters';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { magazineEditionRoute } from '@/lib/admin/routes';
import { browserApi } from '@/lib/api/browser';
import { errorMessage } from '@/lib/api/errors';
import type {
  AdminMagazineArticle,
  AdminMagazineEditionSummary,
  MagazineCampaignStats,
} from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatAgo } from '@/lib/format/date';
import { formatNumber } from '@/lib/format/number';
import { ArticleDialog } from './article-dialog';
import {
  ArticleLanguages,
  editionName,
  EditionStatusBadge,
  editionSubline,
  magazineArticlesKey,
  magazineKey,
  useRefreshMagazine,
} from './magazine-ui';

type Tab = 'editions' | 'articles';

/** Onglet lu dans l'adresse (`?onglet=articles`) ; « Éditions » par défaut. */
function useTab() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab: Tab = params.get('onglet') === 'articles' ? 'articles' : 'editions';
  function setTab(next: Tab) {
    const query = new URLSearchParams(params.toString());
    if (next === 'articles') query.set('onglet', 'articles');
    else query.delete('onglet');
    const search = query.toString();
    router.replace(`${pathname}${search ? `?${search}` : ''}` as Route, { scroll: false });
  }
  return [tab, setTab] as const;
}

/** Ouvre l'aperçu d'une édition sur le site (jeton de 30 min) dans un nouvel onglet. */
export function usePreviewEdition() {
  return useMutation({
    mutationFn: (id: string) =>
      data(browserApi.GET('/v1/admin/magazine/editions/{id}/preview-token', { params: { path: { id } } })),
    onSuccess: (preview) => window.open(preview.url, '_blank', 'noopener'),
    onError: (error) => toast.error(errorMessage(error)),
  });
}

/**
 * Bouton « Nouvelle édition » de la barre supérieure (`267:1611`) : crée un brouillon et l'ouvre. Absent sans
 * `content:write`.
 */
export function NewEditionButton() {
  const canWrite = useCan()('content:write');
  const router = useRouter();
  const create = useMutation({
    mutationFn: () =>
      data(browserApi.POST('/v1/admin/magazine/editions', { body: { title: 'Nouvelle édition' } as never })),
    onSuccess: (edition) => router.push(magazineEditionRoute(edition.id)),
    onError: (error) => toast.error(errorMessage(error)),
  });
  if (!canWrite) return null;
  return (
    <button
      type="button"
      onClick={() => create.mutate()}
      disabled={create.isPending}
      className={cn(topbarActionClass, 'disabled:opacity-60')}
    >
      <Plus aria-hidden />
      Nouvelle édition
    </button>
  );
}

/** Magazine (`267:1511`) : onglets « Éditions » / « Articles », tableau des éditions, dernière campagne. */
export function MagazineView() {
  const [tab, setTab] = useTab();
  const overview = useQuery({
    queryKey: magazineKey,
    queryFn: () => data(browserApi.GET('/v1/admin/magazine')),
  });

  return (
    <div className="flex flex-col gap-6">
      <ReadOnlyNotice permission="content:write" />
      <StatusTabs
        label="Contenus du magazine"
        tabs={[
          { value: 'editions', label: 'Éditions', count: overview.data?.editions.length },
          { value: 'articles', label: 'Articles', count: overview.data?.articlesCount },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'editions' ? (
        <>
          <EditionsTable editions={overview.data?.editions} error={overview.isError && !overview.data} />
          {overview.data?.lastCampaign && <CampaignStats stats={overview.data.lastCampaign} />}
        </>
      ) : (
        <ArticlesList editions={overview.data?.editions ?? []} />
      )}
    </div>
  );
}

/** Colonnes du tableau (`267:1625`) : Édition, Thèmes 150, Articles 90, Langues 160, Lecteurs 90, Statut 110, actions 110. */
const COLUMNS =
  'grid items-center gap-4 px-5 grid-cols-[minmax(0,1fr)_90px_110px_110px] lg:max-[1399px]:grid-cols-[minmax(0,1fr)_90px_120px_110px_110px] min-[1400px]:grid-cols-[minmax(0,1fr)_150px_90px_160px_90px_110px_110px]';

const headerCell = 'font-ui text-[12px] leading-4 font-semibold tracking-[0.01em] text-text-muted';
const bodyCell = 'font-ui text-[14px] leading-5 text-text-main';

function EditionsTable({
  editions,
  error,
}: {
  editions: AdminMagazineEditionSummary[] | undefined;
  error: boolean;
}) {
  const canWrite = useCan()('content:write');
  return (
    <AdminCard aria-label="Éditions du magazine" className="overflow-hidden">
      <div role="table" aria-label="Éditions du magazine">
        <div role="rowgroup" className="hidden md:block">
          <div role="row" className={cn(COLUMNS, 'border-b border-border-default bg-neutral-50 py-3')}>
            <span role="columnheader" className={headerCell}>
              Édition
            </span>
            <span role="columnheader" className={cn(headerCell, 'hidden min-[1400px]:block')}>
              Thèmes
            </span>
            <span role="columnheader" className={headerCell}>
              Articles
            </span>
            <span role="columnheader" className={cn(headerCell, 'hidden lg:block')}>
              Langues
            </span>
            <span role="columnheader" className={cn(headerCell, 'hidden min-[1400px]:block')}>
              Lecteurs
            </span>
            <span role="columnheader" className={headerCell}>
              Statut
            </span>
            <span role="columnheader" className="sr-only">
              Actions
            </span>
          </div>
        </div>
        <div role="rowgroup">
          {error ? (
            <div className="p-6">
              <EmptyState
                icon={<BookOpen size={24} />}
                title="Éditions indisponibles"
                text="Le chargement a échoué. Réessayez dans un instant."
              />
            </div>
          ) : !editions ? (
            Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="border-b border-border-default px-5 py-3.5 last:border-b-0">
                <Skeleton className="h-[38px] w-full rounded-sm" />
              </div>
            ))
          ) : editions.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<BookOpen size={24} />}
                title="Aucune édition"
                text={
                  canWrite
                    ? 'Créez la première édition du magazine avec « Nouvelle édition ».'
                    : 'Les éditions du magazine apparaîtront ici.'
                }
              />
            </div>
          ) : (
            editions.map((edition) => <EditionRow key={edition.id} edition={edition} canWrite={canWrite} />)
          )}
        </div>
      </div>
    </AdminCard>
  );
}

/** Ligne d'une édition ; sans `content:write` : aperçu et consultation seulement. */
function EditionRow({ edition, canWrite }: { edition: AdminMagazineEditionSummary; canWrite: boolean }) {
  const refresh = useRefreshMagazine();
  const preview = usePreviewEdition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const name = editionName(edition);
  const href = magazineEditionRoute(edition.id);
  const languages = edition.languages.map((language) => language.toUpperCase()).join(' · ');

  const status = useMutation({
    mutationFn: (action: 'publish' | 'unpublish') =>
      data(
        action === 'publish'
          ? browserApi.POST('/v1/admin/magazine/editions/{id}/publish', {
              params: { path: { id: edition.id } },
              body: { publishAt: null },
            })
          : browserApi.POST('/v1/admin/magazine/editions/{id}/unpublish', {
              params: { path: { id: edition.id } },
            }),
      ),
    onSuccess: (updated) => {
      toast.success(updated.status === 'PUBLISHED' ? 'Édition publiée.' : 'Édition repassée en brouillon.');
      refresh();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: () =>
      data(browserApi.DELETE('/v1/admin/magazine/editions/{id}', { params: { path: { id: edition.id } } })),
    onSuccess: () => {
      setConfirmDelete(false);
      toast.success('Édition supprimée ; ses articles restent disponibles.');
      refresh();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const iconButton =
    'flex size-8 items-center justify-center rounded-sm text-icon-default transition-colors hover:bg-neutral-100 hover:text-text-main';

  return (
    <div
      role="row"
      className={cn(
        COLUMNS,
        'border-b border-border-default py-3.5 last:border-b-0 max-md:flex max-md:flex-wrap max-md:gap-x-3 max-md:gap-y-2.5',
      )}
    >
      <div role="cell" className="flex min-w-0 items-center gap-2.5 max-md:w-full">
        {edition.cover ? (
          <MediaThumb
            image={{ ...edition.cover, alt: '' }}
            className="h-[38px] w-[52px] shrink-0 rounded-[6px]"
            sizes="52px"
          />
        ) : (
          <span aria-hidden className="h-[38px] w-[52px] shrink-0 rounded-[6px] bg-neutral-100" />
        )}
        <div className="flex min-w-0 flex-col gap-0.5">
          <Link
            href={href}
            className="font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-main hover:underline"
          >
            {name}
          </Link>
          <span className="font-ui text-[12px] leading-4 tracking-[0.01em] text-text-muted">
            {editionSubline(edition)}
          </span>
        </div>
      </div>
      <span role="cell" className={cn(bodyCell, 'hidden min-[1400px]:block')}>
        {edition.themes ?? '—'}
      </span>
      <span role="cell" className={cn(bodyCell, 'max-md:text-[13px] max-md:text-text-muted')}>
        <span className="md:hidden">Articles : </span>
        {edition.articlesCount}
      </span>
      <span role="cell" className={cn(bodyCell, 'hidden lg:block')}>
        {languages}
      </span>
      <span role="cell" className={cn(bodyCell, 'hidden min-[1400px]:block')}>
        {edition.readers === null ? '—' : formatNumber(edition.readers)}
      </span>
      <span role="cell" className="max-md:order-first max-md:hidden">
        <EditionStatusBadge status={edition.status} />
      </span>
      <div role="cell" className="flex items-center justify-end gap-2.5 max-md:ml-auto">
        <span className="md:hidden">
          <EditionStatusBadge status={edition.status} />
        </span>
        <button
          type="button"
          aria-label={`Aperçu de ${name}`}
          title="Aperçu"
          className={iconButton}
          onClick={() => preview.mutate(edition.id)}
        >
          <Eye aria-hidden size={16} />
        </button>
        <Link
          href={href}
          aria-label={`${canWrite ? 'Modifier' : 'Consulter'} ${name}`}
          title={canWrite ? 'Modifier' : 'Consulter'}
          className={iconButton}
        >
          <Pencil aria-hidden size={16} />
        </Link>
        {canWrite && (
          <ActionMenu
            label={`Actions pour ${name}`}
            items={[
              edition.status === 'PUBLISHED' || edition.status === 'SCHEDULED'
                ? { label: 'Repasser en brouillon', icon: Undo2, onSelect: () => status.mutate('unpublish') }
                : { label: 'Publier maintenant', icon: Upload, onSelect: () => status.mutate('publish') },
              {
                label: 'Supprimer',
                icon: Trash2,
                danger: true,
                disabled: edition.status === 'PUBLISHED',
                onSelect: () => setConfirmDelete(true),
              },
            ]}
          />
        )}
      </div>
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
        title={`Supprimer « ${name} » ?`}
        description="Ses articles ne sont pas supprimés : ils restent disponibles dans l’onglet « Articles »."
        confirmLabel="Supprimer l’édition"
        destructive
        pending={remove.isPending}
      />
    </div>
  );
}

/** « Dernière campagne · Édition n° 1 » (`267:1915`) et ses 4 indicateurs (`267:1916`). */
function CampaignStats({ stats }: { stats: MagazineCampaignStats }) {
  const items = [
    { label: 'Envoyés', value: formatNumber(stats.sent), note: 'inscrits confirmés, FR et EN' },
    {
      label: 'Taux d’ouverture',
      value: stats.openRate === null ? '—' : `${formatNumber(Math.round(stats.openRate))}\u00A0%`,
      note:
        stats.openRateDelta === null
          ? 'mesure désactivée'
          : `${stats.openRateDelta >= 0 ? '+' : '−'}${formatNumber(Math.abs(stats.openRateDelta))}\u00A0pts vs moyenne`,
    },
    {
      label: 'Clics vers le site',
      value: stats.clicks === null ? '—' : formatNumber(stats.clicks),
      note: 'édito et articles',
    },
    {
      label: 'Nouveaux inscrits',
      value: `+${formatNumber(stats.newSubscribers)}`,
      note: 'depuis la publication',
    },
  ];
  return (
    <section aria-labelledby="magazine-campaign" className="flex flex-col gap-6">
      <h2
        id="magazine-campaign"
        className="font-brand text-[20px] leading-[30px] font-semibold text-text-main"
      >
        Dernière campagne · {stats.editionLabel}
      </h2>
      <dl className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex min-w-0 flex-col gap-1.5 rounded-[14px] border border-border-default bg-neutral-0 p-4 md:p-5"
          >
            <dt className="font-ui text-[13px] leading-4 font-medium text-text-muted">{item.label}</dt>
            <dd className="font-brand text-[26px] leading-[39px] font-semibold text-text-main">
              {item.value}
            </dd>
            <dd className="font-ui text-[13px] leading-4 text-text-muted">{item.note}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Onglet « Articles » (non maquetté) : tous les articles, leur édition et leurs langues. */
function ArticlesList({ editions }: { editions: AdminMagazineEditionSummary[] }) {
  const refresh = useRefreshMagazine();
  const canWrite = useCan()('content:write');
  const [editing, setEditing] = useState<AdminMagazineArticle | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<AdminMagazineArticle | null>(null);
  const articles = useQuery({
    queryKey: magazineArticlesKey,
    queryFn: () => data(browserApi.GET('/v1/admin/magazine/articles')),
  });
  const editionOptions = editions.map((edition) => ({ id: edition.id, name: editionName(edition) }));

  const remove = useMutation({
    mutationFn: (id: string) =>
      data(browserApi.DELETE('/v1/admin/magazine/articles/{id}', { params: { path: { id } } })),
    onSuccess: () => {
      setDeleting(null);
      toast.success('Article supprimé.');
      refresh();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <div className="flex flex-col gap-4">
      {canWrite && (
        <div className="flex justify-end">
          <button type="button" className={topbarActionClass} onClick={() => setCreating(true)}>
            <Plus aria-hidden />
            Nouvel article
          </button>
        </div>
      )}
      <AdminCard aria-label="Articles du magazine" className="overflow-hidden">
        {articles.isError && !articles.data ? (
          <div className="p-6">
            <EmptyState
              icon={<FileText size={24} />}
              title="Articles indisponibles"
              text="Le chargement a échoué."
            />
          </div>
        ) : !articles.data ? (
          Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="border-b border-border-default px-5 py-3.5 last:border-b-0">
              <Skeleton className="h-10 w-full rounded-sm" />
            </div>
          ))
        ) : articles.data.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<FileText size={24} />}
              title="Aucun article"
              text={
                canWrite
                  ? 'Ajoutez un premier article au magazine.'
                  : 'Les articles du magazine apparaîtront ici.'
              }
            />
          </div>
        ) : (
          <ul>
            {articles.data.map((article) => (
              <li
                key={article.id}
                className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b border-border-default px-5 py-3.5 last:border-b-0"
              >
                {article.image ? (
                  <MediaThumb
                    image={{ ...article.image, alt: '' }}
                    className="h-10 w-14 shrink-0 rounded-sm"
                    sizes="56px"
                  />
                ) : (
                  <span aria-hidden className="h-10 w-14 shrink-0 rounded-sm bg-neutral-100" />
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => setEditing(article)}
                    className="text-left font-ui text-[14px] leading-5 font-semibold text-text-main hover:underline"
                  >
                    {article.title}
                  </button>
                  <span className="font-ui text-[13px] leading-4 text-text-muted">
                    {article.theme} · {article.edition?.label ?? 'Sans édition'} · modifié{' '}
                    {formatAgo(article.updatedAt).toLowerCase()}
                  </span>
                </div>
                <ArticleLanguages article={article} />
                {canWrite && (
                  <ActionMenu
                    label={`Actions pour l’article « ${article.title} »`}
                    items={[
                      { label: 'Modifier', icon: Pencil, onSelect: () => setEditing(article) },
                      {
                        label: 'Supprimer',
                        icon: Trash2,
                        danger: true,
                        onSelect: () => setDeleting(article),
                      },
                    ]}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
      <ArticleDialog
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        article={editing}
        editions={editionOptions}
        readOnly={!canWrite}
      />
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        title={`Supprimer l’article « ${deleting?.title ?? ''} » ?`}
        description="L’article est retiré de son édition et du site. Cette action est définitive."
        confirmLabel="Supprimer l’article"
        destructive
        pending={remove.isPending}
      />
    </div>
  );
}
