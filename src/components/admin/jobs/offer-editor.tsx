'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, Briefcase, ChevronRight, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import {
  charCountHelp,
  ConfirmDialog,
  EditorLayout,
  EditorSection,
  PublishStatusBadge,
  SideCard,
} from '@/components/admin/editor/editor-ui';
import { RepeatableList, SubInput } from '@/components/admin/editor/repeatable-list';
import { AdminPage, topbarActionClass, topbarSecondaryClass } from '@/components/admin/shell/admin-page';
import { EmptyState } from '@/components/admin/ui/filters';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import { adminRoutes } from '@/lib/admin/routes';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { JobSalary, PublishStatus } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { CONTRACT_TYPES, COUNTRIES, offerMeta, type JobOffer } from './labels';
import { offerEditorHref, offerSiteHref } from './offers-table';
import { jobKey, jobsKey, useOfferActions } from './use-offer-actions';

/** Identifiant d'adresse de la création (`/admin/recrutement/offres/nouvelle`). */
export const NEW_OFFER = 'nouvelle';

const PERIODS: { value: JobSalary['period']; label: string }[] = [
  { value: 'MONTH', label: 'par mois' },
  { value: 'HOUR', label: 'de l’heure' },
  { value: 'DAY', label: 'par jour' },
  { value: 'WEEK', label: 'par semaine' },
  { value: 'YEAR', label: 'par an' },
];

type Draft = {
  title: string;
  slug: string;
  contractType: string;
  city: string;
  country: string;
  locationLabel: string;
  sectors: string;
  startDate: string;
  workingTime: string;
  schedule: string;
  salaryMin: string;
  salaryMax: string;
  salaryPeriod: JobSalary['period'];
  summary: string;
  missions: string[];
  profile: string[];
  benefits: string[];
  /** Date de fin de publication (AAAA-MM-JJ), vide = sans échéance. */
  expiresAt: string;
};

function draftOf(offer: JobOffer | null): Draft {
  return {
    title: offer?.title ?? '',
    slug: offer?.slug ?? '',
    contractType: offer?.contractType ?? '',
    city: offer?.city ?? 'Douala',
    country: offer?.country ?? 'CM',
    locationLabel: offer?.locationLabel ?? '',
    sectors: (offer?.sectors ?? []).join(', '),
    startDate: offer?.startDate ?? '',
    workingTime: offer?.workingTime ?? '',
    schedule: offer?.schedule ?? '',
    salaryMin: offer?.salary ? String(offer.salary.min) : '',
    salaryMax: offer?.salary?.max ? String(offer.salary.max) : '',
    salaryPeriod: offer?.salary?.period ?? 'MONTH',
    summary: offer?.summary ?? '',
    missions: offer?.missions ?? [],
    profile: offer?.profile ?? [],
    benefits: offer?.benefits ?? [],
    expiresAt: offer?.expiresAt ? offer.expiresAt.slice(0, 10) : '',
  };
}

const orNull = (value: string) => value.trim() || null;
const amount = (value: string) => Number(value.replace(/\D/g, ''));

/** Corps envoyé à l'API (création ou modification complète). */
function bodyOf(draft: Draft) {
  const min = amount(draft.salaryMin);
  return {
    title: draft.title.trim(),
    ...(draft.slug.trim() ? { slug: draft.slug.trim() } : {}),
    contractType: draft.contractType.trim(),
    city: draft.city.trim(),
    country: draft.country,
    locationLabel: orNull(draft.locationLabel),
    sectors: draft.sectors
      .split(',')
      .map((sector) => sector.trim())
      .filter(Boolean),
    startDate: orNull(draft.startDate),
    workingTime: orNull(draft.workingTime),
    schedule: orNull(draft.schedule),
    salary: min
      ? {
          min,
          max: amount(draft.salaryMax) || null,
          currency: 'XAF' as const,
          period: draft.salaryPeriod,
        }
      : null,
    summary: draft.summary.trim(),
    missions: draft.missions,
    profile: draft.profile,
    benefits: draft.benefits,
    expiresAt: draft.expiresAt ? new Date(`${draft.expiresAt}T23:59:59`).toISOString() : null,
  };
}

/** Offre d'emploi (création ou modification) : chargement, puis formulaire. */
export function OfferEditor({ id }: { id: string }) {
  const creating = id === NEW_OFFER;
  const offer = useQuery({
    queryKey: jobKey(id),
    queryFn: () =>
      data(browserApi.GET('/v1/admin/jobs/{id}', { params: { path: { id } } })) as Promise<JobOffer>,
    enabled: !creating,
  });
  if (creating) return <OfferForm offer={null} />;
  if (offer.isError && offer.error instanceof ApiError && offer.error.status === 404)
    return (
      <AdminPage title="Offre introuvable" breadcrumb={<Breadcrumb current="Offre" />}>
        <EmptyState
          icon={<Briefcase size={24} />}
          title="Cette offre n’existe plus"
          text="Elle a peut-être été supprimée. Ses candidatures restent consultables dans Recrutement."
          action={
            <Link href={adminRoutes.jobs} className={topbarSecondaryClass}>
              Retour au recrutement
            </Link>
          }
        />
      </AdminPage>
    );
  if (!offer.data)
    return (
      <AdminPage title="Offre" breadcrumb={<Breadcrumb current="Offre" />}>
        <div aria-busy className="grid gap-6 xl:grid-cols-[minmax(0,748px)_340px]">
          <Skeleton className="h-[520px] rounded-lg" />
          <Skeleton className="h-[220px] rounded-lg" />
        </div>
      </AdminPage>
    );
  return <OfferForm key={offer.data.id} offer={offer.data} />;
}

function Breadcrumb({ current }: { current: string }) {
  return (
    <span className="flex items-center gap-1.5">
      Contenus du site <ChevronRight aria-hidden size={12} />
      <Link href={adminRoutes.jobs} className="hover:underline">
        Recrutement
      </Link>
      <ChevronRight aria-hidden size={12} />
      <span className="truncate">{current}</span>
    </span>
  );
}

function OfferForm({ offer }: { offer: JobOffer | null }) {
  const router = useRouter();
  const client = useQueryClient();
  const { setStatus, remove } = useOfferActions();
  const [draft, setDraft] = useState(() => draftOf(offer));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState(false);
  const formId = useId();
  const focusError = useRef(false);
  // Erreurs reçues : focus sur le premier champ en erreur, une fois le formulaire mis à jour.
  useEffect(() => {
    if (!focusError.current) return;
    focusError.current = false;
    document.querySelector<HTMLElement>(`[id="${formId}"] [aria-invalid="true"]`)?.focus();
  }, [errors, formId]);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const error = (path: string) => errors[path] ?? null;

  const save = useMutation({
    mutationFn: async (status?: PublishStatus) => {
      const body = { ...bodyOf(draft), ...(status ? { status } : {}) };
      return (
        offer
          ? data(
              browserApi.PATCH('/v1/admin/jobs/{id}', {
                params: { path: { id: offer.id } },
                body: body as never,
              }),
            )
          : data(browserApi.POST('/v1/admin/jobs', { body: body as never }))
      ) as Promise<JobOffer>;
    },
    onSuccess: (saved, status) => {
      setErrors({});
      client.setQueryData(jobKey(saved.id), saved);
      void client.invalidateQueries({ queryKey: jobsKey });
      toast.success(
        status === 'PUBLISHED'
          ? `« ${saved.title} » est publiée sur le site.`
          : offer
            ? 'Modifications enregistrées.'
            : 'Brouillon enregistré.',
      );
      if (!offer) router.replace(offerEditorHref(saved.id));
    },
    onError: (failure) => {
      if (failure instanceof ApiError && Object.keys(failure.fieldErrors).length) {
        setErrors(failure.fieldErrors);
        toast.error('Certains champs sont à corriger.');
        focusError.current = true;
      } else toast.error(errorMessage(failure));
    },
  });

  const heading = offer ? offer.title : 'Nouvelle offre';
  const published = offer?.status === 'PUBLISHED';

  return (
    <AdminPage
      title={heading}
      breadcrumb={<Breadcrumb current={heading} />}
      actions={
        <>
          {published && offer && (
            <a
              href={offerSiteHref(offer.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className={topbarSecondaryClass}
            >
              <ArrowUpRight aria-hidden />
              Voir l’offre
            </a>
          )}
          <button
            type="button"
            onClick={() => save.mutate(undefined)}
            disabled={save.isPending}
            className={cn(topbarActionClass, 'disabled:opacity-60')}
          >
            <Save aria-hidden />
            Enregistrer
          </button>
        </>
      }
    >
      <div id={formId}>
        <EditorLayout
          aside={
            <SideCard title="Publication" action={<PublishStatusBadge status={offer?.status ?? 'DRAFT'} />}>
              <p className="font-ui text-[13px] leading-5 text-text-muted">
                {offer ? offerMeta(offer) : 'Non publiée'}
                {offer
                  ? ` · ${offer.applicationsCount} candidature${offer.applicationsCount > 1 ? 's' : ''}`
                  : ''}
              </p>
              <Field
                label="Fin de publication"
                help="Facultatif : l’offre est retirée du site à cette date."
                error={error('expiresAt')}
              >
                {(control) => (
                  <Input
                    {...control}
                    type="date"
                    value={draft.expiresAt}
                    onChange={(event) => set('expiresAt', event.target.value)}
                  />
                )}
              </Field>
              <Field
                label="Adresse de la page"
                help={`/recrutement/${draft.slug || '…'} · générée à partir de l’intitulé si vide.`}
                error={error('slug')}
              >
                {(control) => (
                  <Input
                    {...control}
                    value={draft.slug}
                    maxLength={80}
                    onChange={(event) => set('slug', event.target.value)}
                  />
                )}
              </Field>
              <div className="flex flex-col gap-2">
                {published ? (
                  <Button
                    variant="outline"
                    onClick={() => offer && setStatus.mutate({ id: offer.id, status: 'DRAFT' })}
                    disabled={setStatus.isPending}
                  >
                    Dépublier
                  </Button>
                ) : (
                  <Button onClick={() => save.mutate('PUBLISHED')} disabled={save.isPending}>
                    Publier l’offre
                  </Button>
                )}
                {offer && (
                  <button
                    type="button"
                    onClick={() => setDeleting(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-sm py-2 font-ui text-[14px] leading-5 font-semibold text-feedback-error hover:underline"
                  >
                    <Trash2 aria-hidden size={16} />
                    Supprimer l’offre
                  </button>
                )}
              </div>
            </SideCard>
          }
        >
          <EditorSection
            number={1}
            title="Le poste"
            subtitle="Intitulé, contrat et lieu, affichés en tête de l’offre"
          >
            <Field
              label="Intitulé du poste"
              required
              error={error('title')}
              help={charCountHelp(draft.title, 120)}
            >
              {(control) => (
                <Input
                  {...control}
                  value={draft.title}
                  maxLength={120}
                  placeholder="Coordinateur·rice de services"
                  onChange={(event) => set('title', event.target.value)}
                />
              )}
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Type de contrat" required error={error('contractType')}>
                {(control) => (
                  <>
                    <Input
                      {...control}
                      list={`${formId}-contracts`}
                      value={draft.contractType}
                      maxLength={40}
                      onChange={(event) => set('contractType', event.target.value)}
                    />
                    <datalist id={`${formId}-contracts`}>
                      {CONTRACT_TYPES.map((type) => (
                        <option key={type} value={type} />
                      ))}
                    </datalist>
                  </>
                )}
              </Field>
              <Field label="Démarrage" error={error('startDate')}>
                {(control) => (
                  <Input
                    {...control}
                    value={draft.startDate}
                    maxLength={60}
                    placeholder="janvier 2027"
                    onChange={(event) => set('startDate', event.target.value)}
                  />
                )}
              </Field>
              <Field label="Lieu" required error={error('city')} help="Affiché dans la liste des offres.">
                {(control) => (
                  <Input
                    {...control}
                    value={draft.city}
                    maxLength={80}
                    onChange={(event) => set('city', event.target.value)}
                  />
                )}
              </Field>
              <Field label="Pays" required error={error('country')}>
                {(control) => (
                  <Select
                    {...control}
                    value={draft.country}
                    onChange={(event) => set('country', event.target.value)}
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field
                label="Lieu détaillé"
                error={error('locationLabel')}
                help="Page de l’offre, ex. « Douala, Cameroun »."
              >
                {(control) => (
                  <Input
                    {...control}
                    value={draft.locationLabel}
                    maxLength={120}
                    onChange={(event) => set('locationLabel', event.target.value)}
                  />
                )}
              </Field>
              <Field
                label="Secteurs"
                error={error('sectors')}
                help="Quartiers séparés par des virgules ; remplacent le lieu sur la page."
              >
                {(control) => (
                  <Input
                    {...control}
                    value={draft.sectors}
                    placeholder="Bonamoussadi, Makèpè"
                    onChange={(event) => set('sectors', event.target.value)}
                  />
                )}
              </Field>
              <Field label="Temps de travail" error={error('workingTime')}>
                {(control) => (
                  <Input
                    {...control}
                    value={draft.workingTime}
                    maxLength={60}
                    placeholder="temps plein"
                    onChange={(event) => set('workingTime', event.target.value)}
                  />
                )}
              </Field>
              <Field label="Horaires" error={error('schedule')}>
                {(control) => (
                  <Input
                    {...control}
                    value={draft.schedule}
                    maxLength={120}
                    placeholder="8 h par jour · 5 jours par semaine"
                    onChange={(event) => set('schedule', event.target.value)}
                  />
                )}
              </Field>
            </div>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 font-ui text-[14px] leading-5 font-semibold text-text-main">
                Rémunération (FCFA)
              </legend>
              <div className="grid gap-3 sm:grid-cols-3">
                <SubInput
                  aria-label="Montant minimum"
                  inputMode="numeric"
                  placeholder="90 000"
                  value={draft.salaryMin}
                  onChange={(event) => set('salaryMin', event.target.value)}
                />
                <SubInput
                  aria-label="Montant maximum"
                  aria-invalid={error('salary.max') ? true : undefined}
                  inputMode="numeric"
                  placeholder="120 000 (facultatif)"
                  value={draft.salaryMax}
                  onChange={(event) => set('salaryMax', event.target.value)}
                />
                <select
                  aria-label="Période"
                  value={draft.salaryPeriod}
                  onChange={(event) => set('salaryPeriod', event.target.value as JobSalary['period'])}
                  className="rounded-sm border border-border-default bg-neutral-0 px-3 py-2.5 font-ui text-[14px] leading-5 text-text-main"
                >
                  {PERIODS.map((period) => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="font-ui text-[12px] leading-4 text-text-muted">
                {error('salary.max') ?? 'Facultatif : sans montant, la rémunération n’est pas affichée.'}
              </p>
            </fieldset>
          </EditorSection>

          <EditorSection number={2} title="Présentation" subtitle="Texte affiché sous « Le poste »">
            <Field
              label="Présentation du poste"
              required
              error={error('summary')}
              help={charCountHelp(draft.summary, 1000)}
            >
              {(control) => (
                <Textarea
                  {...control}
                  rows={5}
                  value={draft.summary}
                  maxLength={1000}
                  onChange={(event) => set('summary', event.target.value)}
                />
              )}
            </Field>
          </EditorSection>

          <ListSection
            number={3}
            title="Missions"
            subtitle="Au moins une mission pour publier l’offre"
            itemName="mission"
            addLabel="Ajouter une mission"
            value={draft.missions}
            onChange={(value) => set('missions', value)}
            errors={errors}
            path="missions"
          />
          <ListSection
            number={4}
            title="Profil recherché"
            itemName="critère"
            addLabel="Ajouter un critère"
            value={draft.profile}
            onChange={(value) => set('profile', value)}
            errors={errors}
            path="profile"
          />
          <ListSection
            number={5}
            title="Ce que nous offrons"
            itemName="avantage"
            addLabel="Ajouter un avantage"
            value={draft.benefits}
            onChange={(value) => set('benefits', value)}
            errors={errors}
            path="benefits"
          />
        </EditorLayout>
      </div>

      {offer && (
        <ConfirmDialog
          open={deleting}
          onClose={() => setDeleting(false)}
          onConfirm={() =>
            remove.mutate(offer.id, {
              onSuccess: () => {
                setDeleting(false);
                router.push(adminRoutes.jobs);
              },
            })
          }
          title="Supprimer cette offre ?"
          description={`« ${offer.title} » sera retirée du site et du back-office. Les candidatures reçues sont conservées. Cette action est irréversible.`}
          confirmLabel="Supprimer l’offre"
          destructive
          pending={remove.isPending}
        />
      )}
    </AdminPage>
  );
}

/** Liste de lignes (missions, profil, avantages) : 20 au plus, 300 caractères chacune. */
function ListSection({
  number,
  title,
  subtitle,
  itemName,
  addLabel,
  value,
  onChange,
  errors,
  path,
}: {
  number: number;
  title: string;
  subtitle?: string;
  itemName: string;
  addLabel: string;
  value: string[];
  onChange: (value: string[]) => void;
  errors: Record<string, string>;
  path: string;
}) {
  return (
    <EditorSection number={number} title={title} subtitle={subtitle}>
      {errors[path] && (
        <p role="alert" className="font-ui text-[13px] leading-5 text-feedback-error">
          {errors[path]}
        </p>
      )}
      <RepeatableList
        value={value}
        onChange={onChange}
        createItem={() => ''}
        addLabel={addLabel}
        itemName={itemName}
        getLabel={(item) => (item.trim() ? `« ${item.trim()} »` : '')}
        max={20}
        renderFields={(item, update, index) => (
          <>
            <SubInput
              aria-label={`${itemName.charAt(0).toUpperCase()}${itemName.slice(1)} ${index + 1}`}
              aria-invalid={errors[`${path}.${index}`] ? true : undefined}
              value={item}
              maxLength={300}
              onChange={(event) => update(event.target.value)}
            />
            {errors[`${path}.${index}`] && (
              <p className="font-ui text-[12px] leading-4 text-feedback-error">
                {errors[`${path}.${index}`]}
              </p>
            )}
          </>
        )}
      />
    </EditorSection>
  );
}
