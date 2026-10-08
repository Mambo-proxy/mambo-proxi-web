'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { MessageSquareText, Pencil } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';
import { AdminCard, CardTitle } from '@/components/admin/ui/admin-ui';
import { EmptyState, FilterSelect, ListPagination, StatusTabs } from '@/components/admin/ui/filters';
import { topbarSecondaryClass } from '@/components/admin/shell/admin-page';
import { Skeleton } from '@/components/ui/skeleton';
import { data } from '@/lib/admin/query';
import { adminRoutes } from '@/lib/admin/routes';
import { browserApi } from '@/lib/api/browser';
import type { AdminSurveyQuestion, ReviewStatus } from '@/lib/api/schema';
import { useServiceOptions } from './add-review';
import { ReviewCard } from './review-card';
import { RatingDistribution, ReviewKpis } from './review-stats';
import { REVIEW_STATUS_LABELS, reviewsKey, reviewStatsKey, surveyQuestionsKey } from './review-ui';

const PAGE_SIZE = 10;
const STATUSES: ReviewStatus[] = ['A_VALIDER', 'PUBLIE', 'MASQUE'];

const EMPTY_TEXTS: Record<ReviewStatus, { title: string; text: string }> = {
  A_VALIDER: {
    title: 'Aucun avis à valider',
    text: 'Les nouveaux avis reçus après chaque prestation apparaîtront ici.',
  },
  PUBLIE: { title: 'Aucun avis publié', text: 'Aucun avis publié ne correspond à ce service.' },
  MASQUE: { title: 'Aucun avis masqué', text: 'Les avis masqués ou non publiables apparaîtront ici.' },
};

/** Filtres lus dans l'adresse (`?status=&service=&page=`) ; « À valider » par défaut. */
function useFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = params.get('status') as ReviewStatus | null;
  const filters = {
    status: raw && STATUSES.includes(raw) ? raw : ('A_VALIDER' as ReviewStatus),
    service: params.get('service') ?? '',
    page: Math.max(1, Number(params.get('page') ?? 1) || 1),
  };

  function update(changes: Partial<{ status: ReviewStatus; service: string; page: number }>) {
    const next = new URLSearchParams(params.toString());
    const set = (key: string, value: string | null) => (value ? next.set(key, value) : next.delete(key));
    if ('status' in changes) set('status', changes.status === 'A_VALIDER' ? null : (changes.status ?? null));
    if ('service' in changes) set('service', changes.service || null);
    if ('page' in changes) set('page', changes.page && changes.page > 1 ? String(changes.page) : null);
    // Un changement de filtre ramène à la première page.
    else next.delete('page');
    const query = next.toString();
    router.replace(`${pathname}${query ? `?${query}` : ''}` as Route, { scroll: false });
  }

  return { filters, update };
}

/** « Questionnaire de satisfaction » (`93:11304`) : questions actives numérotées, « Modifier les questions ». */
function SurveyCard({ questions }: { questions: AdminSurveyQuestion[] | undefined }) {
  const active = questions?.filter((question) => question.active);
  return (
    <AdminCard aria-labelledby="survey-card" className="flex flex-col gap-3 p-[22px]">
      <CardTitle
        id="survey-card"
        title="Questionnaire de satisfaction"
        subtitle="Envoyé automatiquement après chaque prestation"
      />
      {!active ? (
        <div aria-hidden className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-[38px] rounded-sm" />
          ))}
        </div>
      ) : (
        <ol className="flex flex-col">
          {active.map((question, index) => (
            <li
              key={question.id}
              className="flex items-center gap-2.5 border-b border-border-default py-2 font-ui text-[13px] leading-5 text-text-main"
            >
              <span
                aria-hidden
                className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[11px] leading-4 font-semibold"
              >
                {index + 1}
              </span>
              {question.label}
            </li>
          ))}
        </ol>
      )}
      <Link
        href={`${adminRoutes.reviews}/questionnaire` as Route}
        className={`${topbarSecondaryClass} self-start`}
      >
        <Pencil aria-hidden />
        Modifier les questions
      </Link>
    </AdminCard>
  );
}

/**
 * Avis clients (`93:10935`) : indicateurs, onglets À valider / Publiés / Masqués avec compteurs, filtre par service,
 * cartes d'avis paginées (10 par page) et colonne latérale (questionnaire, répartition des notes). L'adresse
 * reflète l'onglet, le service et la page.
 */
export function ReviewsView() {
  const { filters, update } = useFilters();
  const listRef = useRef<HTMLElement>(null);
  const services = useServiceOptions();

  const stats = useQuery({
    queryKey: reviewStatsKey,
    queryFn: () => data(browserApi.GET('/v1/admin/reviews/stats')),
  });
  const questions = useQuery({
    queryKey: surveyQuestionsKey,
    queryFn: () => data(browserApi.GET('/v1/admin/survey-questions')),
  });
  const query = {
    status: filters.status,
    service: filters.service || undefined,
    page: filters.page,
    pageSize: PAGE_SIZE,
  };
  const list = useQuery({
    queryKey: [...reviewsKey, query],
    queryFn: () => data(browserApi.GET('/v1/admin/reviews', { params: { query } })),
    placeholderData: keepPreviousData,
  });
  const counts = list.data?.counts;
  const categories = [...new Set((services.data ?? []).map((service) => service.category.name))];

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ReviewKpis stats={stats.data} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusTabs
          label="Statut des avis"
          tabs={STATUSES.map((value) => ({
            value,
            label: REVIEW_STATUS_LABELS[value],
            count: counts?.[value],
          }))}
          value={filters.status}
          onChange={(status) => update({ status })}
        />
        <FilterSelect
          label="Service"
          value={filters.service}
          onChange={(event) => update({ service: event.target.value })}
          className="w-full sm:w-auto"
        >
          <option value="">Tous les services</option>
          {categories.map((category) => (
            <optgroup key={category} label={category}>
              {services.data
                ?.filter((service) => service.category.name === category)
                .map((service) => (
                  <option key={service.slug} value={service.slug}>
                    {service.shortName ?? service.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </FilterSelect>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px] wide:grid-cols-[minmax(0,752px)_340px]">
        <section
          ref={listRef}
          tabIndex={-1}
          aria-label={`Avis ${REVIEW_STATUS_LABELS[filters.status].toLowerCase()}`}
          aria-busy={list.isFetching}
          className="flex min-w-0 flex-col gap-3.5 outline-none"
        >
          {list.isError && !list.data ? (
            <AdminCard role="alert" className="flex flex-col items-start gap-3 p-6">
              <p className="font-ui text-[15px] leading-6">Impossible de charger les avis.</p>
              <button type="button" onClick={() => void list.refetch()} className={topbarSecondaryClass}>
                Réessayer
              </button>
            </AdminCard>
          ) : !list.data ? (
            Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} aria-hidden className="h-[240px] rounded-lg" />
            ))
          ) : list.data.data.length === 0 ? (
            <AdminCard>
              <EmptyState icon={<MessageSquareText size={24} />} {...EMPTY_TEXTS[filters.status]} />
            </AdminCard>
          ) : (
            <>
              {list.data.data.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onRemoved={() => listRef.current?.focus({ preventScroll: true })}
                />
              ))}
              {list.data.meta.totalPages > 1 && (
                <AdminCard className="overflow-hidden [&>div]:border-t-0">
                  <ListPagination
                    page={list.data.meta.page}
                    pageSize={list.data.meta.pageSize}
                    total={list.data.meta.total}
                    totalPages={list.data.meta.totalPages}
                    noun="avis"
                    onPage={(page) => {
                      update({ page });
                      listRef.current?.focus();
                    }}
                  />
                </AdminCard>
              )}
            </>
          )}
        </section>

        <aside aria-label="Questionnaire et répartition des notes" className="flex flex-col gap-4">
          <SurveyCard questions={questions.data} />
          {stats.data ? (
            <RatingDistribution stats={stats.data} />
          ) : (
            <Skeleton aria-hidden className="h-[216px] rounded-lg" />
          )}
        </aside>
      </div>
    </div>
  );
}
