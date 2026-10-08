'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Briefcase,
  Calendar,
  ChevronRight,
  CircleCheck,
  ExternalLink,
  FileText,
  Globe,
  Handshake,
  Mail,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { useState } from 'react';
import { useAdmin } from '@/components/admin/shell/admin-context';
import { ActionMenu } from '@/components/admin/ui/action-menu';
import {
  AdminCard,
  CardTitle,
  CompactSegmented,
  ContactAvatar,
  RequestStatusBadge,
  locationLabel,
  shortName,
} from '@/components/admin/ui/admin-ui';
import { Skeleton } from '@/components/ui/skeleton';
import { data } from '@/lib/admin/query';
import { adminRoutes } from '@/lib/admin/routes';
import { browserApi } from '@/lib/api/browser';
import type { Dashboard, Kpi, RequestListItem } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { DEFAULT_TIME_ZONE, formatAgo, formatLongDate } from '@/lib/format/date';
import { formatNumber, formatRating } from '@/lib/format/number';
import { RequestsChart } from './requests-chart';

type Range = Dashboard['range'];

const RANGES: { value: Range; label: string }[] = [
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: '12m', label: '12 mois' },
];

/** Légendes des évolutions selon la période (maquette : 30 jours). */
const LEGENDS: Record<Range, { requests: string; completed: string; satisfaction: string; period: string }> =
  {
    '7d': {
      requests: 'vs semaine dernière',
      completed: 'cette semaine',
      satisfaction: 'sur 7 jours',
      period: '7 derniers jours',
    },
    '30d': {
      requests: 'vs semaine dernière',
      completed: 'ce mois-ci',
      satisfaction: 'sur 30 jours',
      period: '30 derniers jours',
    },
    '12m': {
      requests: 'vs année précédente',
      completed: 'sur 12 mois',
      satisfaction: 'sur 12 mois',
      period: '12 derniers mois',
    },
  };

const sign = (value: number) => (value > 0 ? '+' : value < 0 ? '−' : '');

/** Évolution d'un indicateur : écart absolu (« +4 », « +0,1 ») ou pourcentage (« +12 % »). */
function delta(kpi: Kpi, mode: 'absolute' | 'percent' | 'decimal'): { text: string; up: boolean } | null {
  if (kpi.value == null) return null;
  if (mode === 'percent') {
    if (kpi.deltaPercent == null) return null;
    const value = Math.round(kpi.deltaPercent);
    return { text: `${sign(value)}${Math.abs(value)}\u202F%`, up: value >= 0 };
  }
  if (kpi.previous == null) return null;
  const diff = kpi.value - kpi.previous;
  const text = mode === 'decimal' ? formatRating(Math.abs(diff)) : formatNumber(Math.abs(Math.round(diff)));
  return { text: `${sign(diff)}${text}`, up: diff >= 0 };
}

function KpiCard({
  label,
  mobileLabel,
  icon: Icon,
  value,
  change,
  legend,
}: {
  label: string;
  mobileLabel: string;
  icon: LucideIcon;
  value: string;
  change: { text: string; up: boolean } | null;
  legend?: string;
}) {
  const Trend = change?.up === false ? TrendingDown : TrendingUp;
  return (
    <AdminCard className="flex flex-col gap-1.5 p-3.5 md:gap-3 md:p-5">
      <div className="flex items-center justify-between gap-3 max-md:flex-row-reverse max-md:justify-end max-md:gap-1.5">
        <p className="font-ui text-[12px] leading-4 text-text-muted md:text-[13px] md:leading-5 md:font-medium">
          <span className="md:hidden">{mobileLabel}</span>
          <span className="max-md:hidden">{label}</span>
        </p>
        <span
          aria-hidden
          className="flex items-center justify-center text-icon-default md:size-8 md:rounded-[9px] md:bg-neutral-50"
        >
          <Icon className="size-3.5 md:size-4" />
        </span>
      </div>
      <p className="font-brand text-[24px] leading-[30px] font-semibold tracking-[-0.02em] text-text-main md:text-[32px] md:leading-[38px]">
        {value}
      </p>
      {change && (
        <p className="hidden items-center gap-2 font-ui text-[12px] leading-4 text-text-muted md:flex">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-[6px] px-1.5 py-0.5 font-semibold',
              change.up ? 'bg-vert-50 text-vert-700' : 'bg-orange-50 text-orange-700',
            )}
          >
            <Trend aria-hidden size={12} />
            {change.text}
          </span>
          {legend}
        </p>
      )}
    </AdminCard>
  );
}

function CategoryBars({ data: rows, period }: { data: Dashboard['byCategory']; period: string }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const leader = [...rows].sort((a, b) => b.count - a.count)[0];
  return (
    <AdminCard aria-labelledby="by-category" className="flex flex-col gap-[18px] self-start p-6">
      <CardTitle id="by-category" title="Demandes par rubrique" subtitle={period} />
      <ul className="flex flex-col gap-[18px]">
        {rows.map((row) => (
          <li key={row.slug} className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between font-ui text-[14px] leading-5 text-text-main">
              <span>{row.name}</span>
              <span className="font-semibold">{formatNumber(row.count)}</span>
            </div>
            <span aria-hidden className="h-2 overflow-hidden rounded-full bg-neutral-100">
              <span
                className="block h-full rounded-full bg-brand-primary"
                style={{ width: `${(row.count / max) * 100}%` }}
              />
            </span>
          </li>
        ))}
      </ul>
      {leader && (
        <p className="font-ui text-[12px] leading-4 text-text-muted">
          {formatNumber(total)} demandes au total · {leader.name} en tête
        </p>
      )}
    </AdminCard>
  );
}

const requestHref = (request: RequestListItem) => `${adminRoutes.requests}?id=${request.id}` as Route;

function LatestRequests({ requests }: { requests: RequestListItem[] }) {
  return (
    <section aria-labelledby="latest-requests" className="flex min-w-0 flex-col gap-3 md:gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2
          id="latest-requests"
          className="font-ui text-[15px] leading-6 font-semibold text-text-main md:text-[16px]"
        >
          Dernières demandes
        </h2>
        <Link
          href={adminRoutes.requests}
          className="inline-flex items-center gap-1.5 rounded-xs font-ui text-[14px] leading-5 font-semibold text-text-brand hover:underline"
        >
          Tout voir
          <ArrowRight aria-hidden size={16} />
        </Link>
      </div>

      {/* Mobile : cartes (`95:11797`). */}
      <ul className="flex flex-col gap-2.5 md:hidden">
        {requests.slice(0, 3).map((request) => (
          <li key={request.id}>
            <Link
              href={requestHref(request)}
              className="flex items-center gap-3 rounded-lg border border-border-default bg-neutral-0 p-3.5"
            >
              <ContactAvatar name={request.contact.fullName} initials={request.contact.initials} size={38} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-ui text-[14px] leading-5 font-semibold text-text-main">
                  {shortName(request.contact.fullName)}
                </span>
                <span className="truncate font-ui text-[12px] leading-4 text-text-muted">
                  {request.subject ?? request.service?.name} · {formatAgo(request.createdAt)}
                </span>
              </span>
              <RequestStatusBadge status={request.status} />
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop : tableau (`85:10528`). */}
      <AdminCard className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[600px] border-collapse font-ui text-[14px] leading-5 text-text-main">
          <thead>
            <tr className="border-b border-border-default bg-neutral-50 text-left text-[12px] leading-4 font-semibold text-text-muted">
              <th scope="col" className="py-3 pl-5 font-semibold">
                Client
              </th>
              <th scope="col" className="w-[190px] py-3 pl-4 font-semibold">
                Service
              </th>
              <th scope="col" className="w-[90px] py-3 pl-4 font-semibold">
                Reçue
              </th>
              <th scope="col" className="w-[150px] py-3 pl-4 font-semibold">
                Statut
              </th>
              <th scope="col" className="w-[68px] py-3 pr-5">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr
                key={request.id}
                className="border-b border-border-default last:border-b-0 hover:bg-neutral-50"
              >
                <td className="py-3.5 pl-5">
                  <Link href={requestHref(request)} className="flex items-center gap-3 rounded-xs">
                    <ContactAvatar name={request.contact.fullName} initials={request.contact.initials} />
                    <span className="flex min-w-0 flex-col">
                      <span className="font-semibold">{shortName(request.contact.fullName)}</span>
                      <span className="text-[12px] leading-4 text-text-muted">
                        {locationLabel(request.contact.city, request.contact.country)}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="py-3.5 pl-4">{request.subject ?? request.service?.name ?? '—'}</td>
                <td className="py-3.5 pl-4 whitespace-nowrap">{formatAgo(request.createdAt)}</td>
                <td className="py-3.5 pl-4">
                  <RequestStatusBadge status={request.status} />
                </td>
                <td className="py-3.5 pr-5">
                  <div className="flex justify-end">
                    <ActionMenu
                      label={`Actions pour la demande ${request.reference}`}
                      items={[
                        { label: 'Ouvrir la demande', icon: ExternalLink, href: requestHref(request) },
                        { label: 'Écrire au client', icon: Mail, href: `mailto:${request.contact.email}` },
                      ]}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminCard>
    </section>
  );
}

type TodoItem = {
  label: string;
  mobileLabel?: string;
  icon: LucideIcon;
  count: number;
  href: Route;
  tint: boolean;
};

function Todo({ todo }: { todo: Dashboard['todo'] }) {
  const items: (TodoItem & { mobile: boolean })[] = [
    {
      label: 'Avis clients à valider',
      mobileLabel: 'Avis à valider',
      icon: Star,
      count: todo.reviewsToValidate,
      href: adminRoutes.reviews,
      tint: true,
      mobile: true,
    },
    {
      label: 'Candidatures non lues',
      icon: Briefcase,
      count: todo.unreadApplications,
      href: adminRoutes.jobs,
      tint: false,
      mobile: true,
    },
    {
      label: 'Rendez-vous à confirmer',
      icon: Calendar,
      count: todo.appointmentsToConfirm,
      href: adminRoutes.appointments,
      tint: true,
      mobile: true,
    },
    {
      label: todo.partnershipRequests > 1 ? 'Demandes de partenariat' : 'Demande de partenariat',
      icon: Handshake,
      count: todo.partnershipRequests,
      href: `${adminRoutes.partners}?onglet=demandes` as Route,
      tint: false,
      mobile: false,
    },
    {
      label: 'Nouveaux inscrits',
      icon: Users,
      count: todo.newRegistrations,
      href: adminRoutes.contacts,
      tint: false,
      mobile: false,
    },
  ];
  const pending = items.filter((item) => item.count > 0);
  return (
    <AdminCard aria-labelledby="todo" className="flex flex-col gap-1 self-start p-3.5 md:gap-1.5 md:p-6">
      <div className="max-md:hidden">
        <CardTitle
          id="todo"
          title="À faire aujourd’hui"
          subtitle={
            pending.length
              ? `${pending.length} action${pending.length > 1 ? 's' : ''} en attente`
              : 'Rien en attente, bravo !'
          }
        />
      </div>
      <h2 className="font-ui text-[15px] leading-6 font-semibold text-text-main md:hidden">
        À faire aujourd’hui
      </h2>
      <ul className="flex flex-col">
        {pending.map((item) => {
          const Icon = item.icon;
          return (
            // Maquette mobile : les rendez-vous passent avant les candidatures.
            <li
              key={item.label}
              className={cn(
                !item.mobile && 'max-md:hidden',
                item.href === adminRoutes.jobs && 'max-md:order-1',
              )}
            >
              <Link
                href={item.href}
                className="flex items-center gap-3 border-b border-border-default py-2.5 font-ui text-[14px] leading-5 text-text-main hover:bg-neutral-50 md:px-1 md:py-3"
              >
                <span
                  aria-hidden
                  className={cn(
                    'hidden size-9 shrink-0 items-center justify-center rounded-[10px] text-icon-default md:flex',
                    item.tint ? 'bg-orange-50' : 'bg-neutral-100',
                  )}
                >
                  <Icon size={16} />
                </span>
                <span className="flex-1">
                  <span className="md:hidden">{item.mobileLabel ?? item.label}</span>
                  <span className="max-md:hidden">{item.label}</span>
                </span>
                <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[12px] leading-4 font-semibold text-neutral-0 md:px-[9px]">
                  {item.count}
                </span>
                <ChevronRight aria-hidden size={16} className="text-icon-default" />
              </Link>
            </li>
          );
        })}
      </ul>
    </AdminCard>
  );
}

function SecondaryCard({
  icon: Icon,
  label,
  value,
  legend,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  legend: string;
}) {
  return (
    <AdminCard className="flex flex-col gap-2 p-5">
      <p className="flex items-center gap-2 font-ui text-[13px] leading-5 font-medium text-text-muted">
        <Icon aria-hidden size={16} />
        {label}
      </p>
      <p className="font-brand text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-text-main">
        {value}
      </p>
      <p className="font-ui text-[12px] leading-4 text-text-muted">{legend}</p>
    </AdminCard>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-2.5 md:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[104px] rounded-lg md:h-[156px]" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[696fr_400fr]">
        <Skeleton className="h-[362px] rounded-lg max-md:hidden" />
        <Skeleton className="h-[342px] rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Tableau de bord (desktop `85:10235`, mobile `95:11777`) : accueil, période, 4 indicateurs, demandes reçues par
 * semaine, demandes par rubrique, dernières demandes, « À faire aujourd’hui », questionnaires, newsletter, visites.
 */
export function DashboardView() {
  const { user } = useAdmin();
  const [range, setRange] = useState<Range>('30d');
  const query = useQuery({
    queryKey: ['dashboard', range],
    queryFn: () => data(browserApi.GET('/v1/admin/dashboard', { params: { query: { range } } })),
    placeholderData: (previous) => previous,
  });
  const dashboard = query.data;
  const legend = LEGENDS[range];
  const today = formatLongDate(new Date(), DEFAULT_TIME_ZONE);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-brand text-[22px] leading-8 font-semibold tracking-[-0.01em] text-text-main md:text-[28px] md:leading-9">
            Bonjour {user.firstName ?? user.name.split(' ')[0]}
          </h2>
          <p className="hidden font-ui text-[16px] leading-6 text-text-muted md:block">
            {today.charAt(0).toUpperCase() + today.slice(1)} · voici ce qui se passe sur Mambo Proxi.
          </p>
        </div>
        <CompactSegmented
          label="Période"
          value={range}
          options={RANGES}
          onChange={setRange}
          className="max-md:hidden"
        />
      </div>

      {query.isError && !dashboard ? (
        <AdminCard role="alert" className="flex flex-col items-start gap-3 p-6">
          <p className="font-ui text-[15px] leading-6 text-text-main">
            Impossible de charger le tableau de bord pour le moment.
          </p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="rounded-[10px] border border-border-strong px-3.5 py-2.5 font-ui text-[14px] leading-5 font-semibold"
          >
            Réessayer
          </button>
        </AdminCard>
      ) : !dashboard ? (
        <DashboardSkeleton />
      ) : (
        <div aria-busy={query.isFetching} className="flex flex-col gap-4 md:gap-6">
          <div className="grid grid-cols-2 gap-2.5 md:gap-4 lg:grid-cols-4">
            <KpiCard
              label="Nouvelles demandes"
              mobileLabel="Nouvelles demandes"
              icon={FileText}
              value={formatNumber(dashboard.kpis.newRequests.value ?? 0)}
              change={delta(dashboard.kpis.newRequests, 'absolute')}
              legend={legend.requests}
            />
            <KpiCard
              label="Devis en cours"
              mobileLabel="Devis en cours"
              icon={Mail}
              value={formatNumber(dashboard.kpis.quotesInProgress.value ?? 0)}
              change={null}
            />
            <KpiCard
              label="Prestations réalisées"
              mobileLabel="Réalisées (mois)"
              icon={CircleCheck}
              value={formatNumber(dashboard.kpis.servicesCompleted.value ?? 0)}
              change={delta(dashboard.kpis.servicesCompleted, 'percent')}
              legend={legend.completed}
            />
            <KpiCard
              label="Satisfaction moyenne"
              mobileLabel="Satisfaction"
              icon={Star}
              value={
                dashboard.kpis.satisfaction.value == null
                  ? '—'
                  : `${formatRating(dashboard.kpis.satisfaction.value)} / 5`
              }
              change={delta(dashboard.kpis.satisfaction, 'decimal')}
              legend={legend.satisfaction}
            />
          </div>

          <div className="grid gap-4 max-md:hidden xl:grid-cols-[696fr_400fr]">
            <RequestsChart series={dashboard.requestsSeries} range={range} />
            <CategoryBars data={dashboard.byCategory} period={legend.period} />
          </div>

          <div className="flex flex-col gap-4 md:grid md:items-start xl:grid-cols-[696fr_400fr]">
            <div className="max-md:order-2 md:contents">
              <LatestRequests requests={dashboard.latestRequests} />
            </div>
            <div className="max-md:order-1 md:contents">
              <Todo todo={dashboard.todo} />
            </div>
          </div>

          <div className="grid gap-4 max-md:hidden lg:grid-cols-3">
            <SecondaryCard
              icon={FileText}
              label="Questionnaires de satisfaction"
              value={`${formatNumber(Math.round(dashboard.surveys.responseRate))}\u202F%`}
              legend={`taux de réponse · ${formatNumber(dashboard.surveys.answered)} réponses ${range === '12m' ? 'sur 12 mois' : 'ce mois'}`}
            />
            <SecondaryCard
              icon={Mail}
              label="Newsletter"
              value={formatNumber(dashboard.newsletter.subscribers)}
              legend={`inscrits · +${formatNumber(dashboard.newsletter.newThisPeriod)} ${range === '12m' ? 'sur 12 mois' : 'ce mois'}`}
            />
            <SecondaryCard
              icon={Globe}
              label="Visites du site"
              value={dashboard.visits ? formatNumber(dashboard.visits.total) : '—'}
              legend={
                dashboard.visits
                  ? `${range === '7d' ? 'sur 7 jours' : range === '12m' ? 'sur 12 mois' : 'sur 30 jours'} · source Google Analytics`
                  : 'Google Analytics non configuré (Paramètres › Référencement)'
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
