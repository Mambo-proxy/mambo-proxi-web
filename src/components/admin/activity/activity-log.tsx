'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, History, ShieldAlert, Sparkles } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { StatusPill } from '@/components/admin/editor/editor-ui';
import { useAdminUsers } from '@/components/admin/settings/settings-queries';
import { useCan } from '@/components/admin/shell/permissions';
import { AdminPage } from '@/components/admin/shell/admin-page';
import { Avatar } from '@/components/admin/shell/sidebar';
import { AdminCard } from '@/components/admin/ui/admin-ui';
import { EmptyState, FilterSelect, ListPagination } from '@/components/admin/ui/filters';
import { Skeleton } from '@/components/ui/skeleton';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import type { AuditLogEntry } from '@/lib/api/schema';
import { formatClock, formatWeekdayDate } from '@/lib/format/date';
import { activityDay, diffLines, PERIODS, periodStart, type Period } from './activity-model';

/** Taille de page par défaut de l'API (`GET /v1/admin/audit-log`). */
const PAGE_SIZE = 20;

/**
 * Types de contenus du journal (filtre « Tous les contenus ») : `entity` est le nom technique enregistré par l'API
 * (`Request`, `Service`…), affiché avec un libellé français.
 */
const ENTITY_LABELS: Record<string, string> = {
  Appointment: 'Rendez-vous',
  Availability: 'Disponibilités',
  Campaign: 'Newsletter',
  Category: 'Rubrique',
  Contact: 'Contact',
  EmailTemplate: 'Modèle d’e-mail',
  Event: 'Événement',
  JobApplication: 'Candidature',
  JobOffer: 'Offre d’emploi',
  MagazineArticle: 'Article du magazine',
  MagazineEdition: 'Magazine',
  Media: 'Média',
  Page: 'Page',
  Partner: 'Partenaire',
  Request: 'Demande',
  Review: 'Avis',
  Service: 'Service',
  Setting: 'Paramètres',
  Subscriber: 'Inscrit',
  SurveyQuestion: 'Questionnaire',
  System: 'Système',
  Training: 'Formation',
  User: 'Utilisateur',
  Zone: 'Zone d’intervention',
};

const ENTITIES = Object.keys(ENTITY_LABELS).sort((a, b) =>
  (ENTITY_LABELS[a] ?? a).localeCompare(ENTITY_LABELS[b] ?? b, 'fr'),
);

/** Libellé d'un type de contenu ; nom technique tel quel s'il est inconnu. */
function entityLabel(entity: string): string {
  return ENTITY_LABELS[entity] ?? entity;
}

/** Filtres et page dans l'adresse (`?actor=&entity=&periode=&page=`), sans requête au serveur. */
function useActivityParams() {
  const params = useSearchParams();
  const period = (PERIODS.find((item) => item.value === params.get('periode'))?.value ?? '30j') as Period;
  const state = {
    actor: params.get('actor') ?? '',
    entity: params.get('entity') ?? '',
    period,
    page: Math.max(1, Number(params.get('page')) || 1),
  };
  function set(next: Partial<Record<'actor' | 'entity' | 'periode', string>> & { page?: number }) {
    const search = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(next)) {
      if (!value || (key === 'page' && value === 1) || (key === 'periode' && value === '30j'))
        search.delete(key);
      else search.set(key, String(value));
    }
    // Un nouveau filtre ramène à la première page.
    if (next.page === undefined) search.delete('page');
    const query = search.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
  }
  return { ...state, set };
}

/**
 * Journal d'activité (non maquetté, administrateurs) : qui a fait quoi et quand, par jour ; filtres par utilisateur,
 * type de contenu et période ; détail des modifications (avant → après) et adresse IP.
 */
export function ActivityLog() {
  const can = useCan();
  // Journal : permission `audit:read` (administrateurs) ; filtre par utilisateur : `users:manage`.
  const isAdmin = can('audit:read');
  const { actor, entity, period, page, set } = useActivityParams();
  const users = useAdminUsers(isAdmin && can('users:manage'));
  // Début de période au début d'une journée : clé de requête stable pendant toute la journée.
  const from = periodStart(period);
  const log = useQuery({
    queryKey: ['audit-log', actor, entity, from, page],
    queryFn: () =>
      data(
        browserApi.GET('/v1/admin/audit-log', {
          params: {
            query: {
              actor: actor || undefined,
              entity: entity || undefined,
              from,
              page,
              pageSize: PAGE_SIZE,
            },
          },
        }),
      ),
    enabled: isAdmin,
    placeholderData: keepPreviousData,
  });
  const entries = log.data?.data;
  const meta = log.data?.meta;

  return (
    <AdminPage
      title="Journal d’activité"
      breadcrumb={
        <span className="flex items-center gap-1.5">
          Réglages <ChevronRight aria-hidden size={12} /> Journal d’activité
        </span>
      }
    >
      {!isAdmin ? (
        <AdminCard className="p-6">
          <EmptyState
            icon={<ShieldAlert size={24} />}
            title="Réservé aux administrateurs"
            text="Demandez à un administrateur de consulter le journal d’activité."
          />
        </AdminCard>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center">
            <FilterSelect
              label="Utilisateur"
              value={actor}
              onChange={(event) => set({ actor: event.target.value })}
              className="sm:w-[220px]"
            >
              <option value="">Tous les utilisateurs</option>
              {users.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Type de contenu"
              value={entity}
              onChange={(event) => set({ entity: event.target.value })}
              className="sm:w-[200px]"
            >
              <option value="">Tous les contenus</option>
              {ENTITIES.map((item) => (
                <option key={item} value={item}>
                  {entityLabel(item)}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Période"
              value={period}
              onChange={(event) => set({ periode: event.target.value })}
              className="sm:w-[180px]"
            >
              {PERIODS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </FilterSelect>
          </div>
          <AdminCard className="overflow-hidden">
            {log.isError && !entries ? (
              <div className="p-6">
                <EmptyState
                  icon={<History size={24} />}
                  title="Journal indisponible"
                  text="Le chargement a échoué."
                />
              </div>
            ) : !entries ? (
              <div className="flex flex-col gap-3 p-5">
                {Array.from({ length: 8 }, (_, index) => (
                  <Skeleton key={index} className="h-12 w-full rounded-sm" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={<History size={24} />}
                  title="Aucune activité"
                  text="Rien ne correspond à ces filtres sur la période."
                />
              </div>
            ) : (
              <>
                <EntriesByDay entries={entries} />
                {meta && (
                  <ListPagination
                    page={meta.page}
                    pageSize={meta.pageSize}
                    total={meta.total}
                    totalPages={meta.totalPages}
                    noun="actions"
                    onPage={(next) => set({ page: next })}
                  />
                )}
              </>
            )}
          </AdminCard>
        </div>
      )}
    </AdminPage>
  );
}

function EntriesByDay({ entries }: { entries: AuditLogEntry[] }) {
  const days: { key: string; label: string; items: AuditLogEntry[] }[] = [];
  for (const entry of entries) {
    const key = formatWeekdayDate(entry.createdAt);
    const last = days.at(-1);
    if (last?.key === key) last.items.push(entry);
    else days.push({ key, label: activityDay(entry.createdAt), items: [entry] });
  }
  return (
    <div className="flex flex-col">
      {days.map((day) => (
        <section key={day.key} aria-label={day.label}>
          <h2 className="border-b border-border-default bg-neutral-50 px-5 py-2 font-ui text-[12px] leading-4 font-semibold tracking-[0.01em] text-text-muted first-letter:uppercase">
            {day.label}
          </h2>
          <ul>
            {day.items.map((entry) => (
              <EntryRow key={entry.id} entry={entry} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function EntryRow({ entry }: { entry: AuditLogEntry }) {
  const [open, setOpen] = useState(false);
  const lines = diffLines(entry.diff);
  const hasDetails = lines.length > 0 || Boolean(entry.ip);
  const detailsId = `details-${entry.id}`;
  return (
    <li className="border-b border-border-default px-5 py-3 last:border-b-0">
      <div className="flex items-start gap-3">
        <span className="w-11 shrink-0 pt-2 font-ui text-[12px] leading-4 text-text-muted tabular-nums">
          {formatClock(entry.createdAt)}
        </span>
        {entry.actor ? (
          <Avatar initials={entry.actor.initials} size={32} />
        ) : (
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-icon-default"
          >
            <Sparkles size={14} />
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="font-ui text-[14px] leading-5 text-text-main">
            <span className="font-semibold">{entry.actor?.name ?? 'Automatique'}</span> · {entry.label}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone="neutral">{entityLabel(entry.entity)}</StatusPill>
            {hasDetails && (
              <button
                type="button"
                aria-expanded={open}
                aria-controls={detailsId}
                onClick={() => setOpen(!open)}
                className="inline-flex items-center gap-1 font-ui text-[12px] leading-4 font-semibold text-text-muted hover:text-text-main"
              >
                Détails
                <ChevronDown aria-hidden size={14} className={open ? 'rotate-180' : undefined} />
              </button>
            )}
          </div>
          {open && (
            <dl
              id={detailsId}
              className="mt-1 flex flex-col gap-1 rounded-sm bg-neutral-50 p-3 font-ui text-[12px] leading-4 text-text-main"
            >
              {lines.map((line) => (
                <div key={line.field} className="flex flex-wrap gap-x-1.5">
                  <dt className="font-semibold first-letter:uppercase">{line.field} :</dt>
                  <dd>{line.change}</dd>
                </div>
              ))}
              {entry.ip && (
                <div className="flex gap-x-1.5 text-text-muted">
                  <dt>Adresse IP :</dt>
                  <dd className="tabular-nums">{entry.ip}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </div>
    </li>
  );
}
