'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, ArrowUpRight, ChevronRight, CircleCheck, Eye, Globe } from 'lucide-react';
import { notFound } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChipSelect } from '@/components/admin/editor/chip-select';
import {
  charCountHelp,
  CompletenessCard,
  EditorLayout,
  EditorSection,
  PublishStatusBadge,
  SavedNote,
  SideCard,
} from '@/components/admin/editor/editor-ui';
import { RepeatableList, SubInput } from '@/components/admin/editor/repeatable-list';
import { useAutosave } from '@/components/admin/editor/use-autosave';
import { AdminPage, topbarActionClass, topbarSecondaryClass } from '@/components/admin/shell/admin-page';
import { AdminCard } from '@/components/admin/ui/admin-ui';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toaster';
import { Visual } from '@/components/ui/visual';
import { adminRoutes } from '@/lib/admin/routes';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { AdminService, MediaImage, PublishStatus } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { siteUrl } from '@/lib/seo/site';
import { serviceCompleteness } from './completeness';
import { RelatedPickerDialog } from './related-picker';
import { MAX_REVIEWS, ReviewChipLabel, ReviewPickerDialog, usePublishedReviews } from './review-picker';
import { openServicePreview } from './service-actions';
import {
  emptyForm,
  formFromService,
  formToFields,
  requiredErrors,
  withName,
  withTagline,
  type ServiceForm,
} from './service-form';
import {
  categoriesKey,
  fetchCategories,
  serviceBody,
  type Category,
  SEO_DESCRIPTION_MAX,
  SEO_TITLE_MAX,
  serviceKey,
  servicesKey,
  slugify,
  SUMMARY_MAX,
  TAGLINE_MAX,
} from './service-utils';
import { VisualsField } from './visuals-field';

const MAX_RELATED = 6;
const SITE_HOST = siteUrl.replace(/^https?:\/\//, '');

/** Fil d'Ariane « Contenus du site › Services › … ». */
function Breadcrumb({ current }: { current: string }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      Contenus du site <ChevronRight aria-hidden size={12} className="shrink-0" /> Services{' '}
      <ChevronRight aria-hidden size={12} className="shrink-0" /> <span className="truncate">{current}</span>
    </span>
  );
}

/** Bouton de la barre supérieure ou de la carte Publication, avec état d'attente. */
function ActionButton({
  primary,
  pending,
  icon,
  className,
  children,
  onClick,
}: {
  primary?: boolean;
  pending?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-busy={pending || undefined}
      className={cn(
        primary ? topbarActionClass : topbarSecondaryClass,
        'justify-center disabled:opacity-60',
        className,
      )}
    >
      {pending ? <Spinner /> : icon}
      {children}
    </button>
  );
}

/** Aperçu de la carte du service (`91:11146`) : visuel 150 px, titre, accroche, « Voir le service ». */
function CardPreview({ form, cover }: { form: ServiceForm; cover: MediaImage | null }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border-default">
      <Visual
        visual={{ illustration: form.illustration, image: cover, alt: '' }}
        sizes="300px"
        className="h-[150px] w-full bg-orange-100!"
      />
      <div className="flex flex-col gap-1.5 p-3.5">
        <p className="font-ui text-[15px] leading-6 font-semibold text-text-main">
          {form.name.trim() || 'Nom du service'}
        </p>
        <p className="font-ui text-[12px] leading-4 text-text-muted">
          {form.tagline.trim() || 'La phrase d’accroche s’affichera ici.'}
        </p>
        <span className="flex items-center gap-1.5 font-ui text-[14px] leading-5 font-semibold text-text-brand">
          Voir le service <ArrowRight aria-hidden size={16} />
        </span>
      </div>
    </div>
  );
}

/** Erreurs de validation d'une liste (`steps.1.title` …), affichées sous la section concernée. */
function ListErrors({ errors, prefix }: { errors: Record<string, string>; prefix: string }) {
  const messages = Object.entries(errors)
    .filter(([path, message]) => message && (path === prefix || path.startsWith(`${prefix}.`)))
    .map(([, message]) => message);
  if (!messages.length) return null;
  return (
    <ul role="alert" className="flex flex-col gap-1 font-ui text-[13px] leading-4 text-feedback-error">
      {messages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}

type EditorFormProps = {
  initial: AdminService | null;
  categories: Category[];
};

/**
 * Formulaire de l'éditeur (`91:10755`) : 7 sections numérotées, colonne Publication / Aperçu de la carte /
 * Complétude. Un nouveau service est créé (brouillon) dès que le nom, la rubrique et l'accroche sont saisis, ou au
 * premier « Enregistrer » ; ensuite chaque modification est enregistrée automatiquement (PATCH).
 */
function EditorForm({ initial, categories }: EditorFormProps) {
  const client = useQueryClient();
  const [form, setForm] = useState<ServiceForm>(() =>
    initial ? formFromService(initial, categories) : emptyForm(),
  );
  const [serviceId, setServiceId] = useState(initial?.id ?? null);
  const idRef = useRef(serviceId);
  const version = useRef(initial?.version ?? null);
  const creating = useRef<Promise<string | null> | null>(null);
  const [status, setStatus] = useState<PublishStatus>(initial?.status ?? 'DRAFT');
  const [everPublished, setEverPublished] = useState(!!initial?.publishedAt);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<'save' | 'publish' | 'unpublish' | 'preview' | null>(null);
  const [reviewPicker, setReviewPicker] = useState(false);
  const [relatedPicker, setRelatedPicker] = useState(false);
  /** Images choisies pendant la session (médiathèque ou envoi). */
  const [picked, setPicked] = useState<Record<string, MediaImage>>(() =>
    initial?.coverImage ? { [initial.coverImage.id]: initial.coverImage } : {},
  );

  // Visuels de galerie : le contrat ne renvoie que leurs identifiants, retrouvés dans la médiathèque.
  const unresolved = [form.coverImageId, ...form.galleryImageIds].some((id) => id && !picked[id]);
  const library = useQuery({
    queryKey: ['media', 'service-gallery'],
    queryFn: () => data(browserApi.GET('/v1/admin/media', { params: { query: { pageSize: 100 } } })),
    enabled: unresolved,
  });
  const media = useMemo(
    () => ({ ...Object.fromEntries((library.data?.data ?? []).map((item) => [item.id, item])), ...picked }),
    [library.data, picked],
  );

  const services = useQuery({
    queryKey: [...servicesKey, { category: undefined }],
    queryFn: () => data(browserApi.GET('/v1/admin/services', { params: { query: {} } })),
  });
  const reviews = usePublishedReviews(form.featuredReviewIds.length > 0);

  const categorySlug = categories.find((category) => category.id === form.categoryId)?.slug ?? null;
  const cover = form.coverImageId ? (media[form.coverImageId] ?? null) : null;
  const completeness = serviceCompleteness({ ...form, cover });

  /** Services liés proposés : sélection initiale d'abord, puis l'ordre du catalogue (ordre stable). */
  const initialRelated = useRef(form.relatedServiceIds);
  const relatedOptions = useMemo(() => {
    const others = (services.data?.data ?? []).filter((service) => service.id !== serviceId);
    const first = initialRelated.current
      .map((id) => others.find((service) => service.id === id))
      .filter((service) => !!service);
    return [...first, ...others.filter((service) => !initialRelated.current.includes(service.id))].map(
      (service) => ({ value: service.id, label: service.name }),
    );
  }, [services.data, serviceId]);

  const reviewOptions = form.featuredReviewIds.map((id) => {
    const review = reviews.data?.data.find((item) => item.id === id);
    return { value: id, label: review ? <ReviewChipLabel review={review} /> : 'Avis publié' };
  });

  function update(changes: Partial<ServiceForm>) {
    setForm((current) => ({ ...current, ...changes }));
    const keys = Object.keys(changes);
    if (keys.some((key) => errors[key]))
      setErrors((current) =>
        Object.fromEntries(Object.entries(current).filter(([key]) => !keys.includes(key))),
      );
  }

  function store(service: AdminService) {
    version.current = service.version;
    setStatus(service.status);
    if (service.publishedAt) setEverPublished(true);
    client.setQueryData(serviceKey(service.id), service);
    void client.invalidateQueries({ queryKey: servicesKey });
  }

  function showErrors(error: unknown) {
    if (error instanceof ApiError && Object.keys(error.fieldErrors).length) {
      setErrors(error.fieldErrors);
      focusFirstError();
    }
  }

  function focusFirstError() {
    window.requestAnimationFrame(() =>
      document.querySelector<HTMLElement>('main [aria-invalid="true"]')?.focus(),
    );
  }

  /** Enregistrement automatique ou manuel d'un service existant. */
  async function patch(value: ServiceForm) {
    const id = idRef.current;
    if (!id) return;
    try {
      const saved = await data(
        browserApi.PATCH('/v1/admin/services/{id}', {
          params: { path: { id }, header: version.current ? { 'If-Match': version.current } : {} },
          body: serviceBody(formToFields(value)),
        }),
      );
      store(saved);
      setErrors({});
    } catch (error) {
      showErrors(error);
      if (error instanceof ApiError && error.status !== 422) toast.error(errorMessage(error));
      throw error;
    }
  }

  const autosave = useAutosave({
    value: form,
    save: patch,
    enabled: !!serviceId && busy === null,
    initialSavedAt: initial?.updatedAt ?? null,
  });

  /** Création du brouillon (une seule à la fois) ; l'adresse devient celle du service sans recharger l'éditeur. */
  function ensureCreated(silent: boolean): Promise<string | null> {
    if (idRef.current) return Promise.resolve(idRef.current);
    if (creating.current) return creating.current;
    const value = form;
    creating.current = (async () => {
      try {
        const created = await data(
          browserApi.POST('/v1/admin/services', {
            body: serviceBody({
              ...formToFields(value),
              name: value.name.trim(),
              categoryId: value.categoryId,
              tagline: value.tagline.trim(),
            }),
          }),
        );
        idRef.current = created.id;
        setServiceId(created.id);
        store(created);
        autosave.markSaved(value, created.updatedAt);
        setForm((current) => (current.slug ? current : { ...current, slug: created.slug }));
        window.history.replaceState(null, '', `${adminRoutes.services}/${created.id}`);
        setErrors({});
        return created.id;
      } catch (error) {
        showErrors(error);
        if (!silent) toast.error(errorMessage(error));
        return null;
      } finally {
        creating.current = null;
      }
    })();
    return creating.current;
  }

  // Création automatique dès que les trois champs exigés par l'API sont remplis (après une pause de saisie).
  const canCreate = Object.keys(requiredErrors(form)).length === 0;
  useEffect(() => {
    if (serviceId || !canCreate || busy) return;
    const timer = window.setTimeout(() => void ensureCreated(true), 1500);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, canCreate, busy, form.name, form.categoryId, form.tagline]);

  /** Champs exigés manquants : messages sous les champs et focus sur le premier. */
  function checkRequired(): boolean {
    const missing = requiredErrors(form);
    if (Object.keys(missing).length === 0) return true;
    setErrors((current) => ({ ...current, ...missing }));
    focusFirstError();
    return false;
  }

  async function save() {
    if (!checkRequired()) return;
    setBusy('save');
    try {
      if (!idRef.current) {
        if (await ensureCreated(false)) toast.success('Brouillon enregistré.');
        return;
      }
      if (await autosave.flush()) toast.success('Modifications enregistrées.');
    } finally {
      setBusy(null);
    }
  }

  async function publish() {
    if (!checkRequired()) {
      toast.error('Complétez les champs obligatoires avant de publier.');
      return;
    }
    setBusy('publish');
    try {
      const id = await ensureCreated(false);
      if (!id || !(await autosave.flush())) return;
      const published = await data(
        browserApi.POST('/v1/admin/services/{id}/publish', { params: { path: { id } } }),
      );
      store(published);
      toast.success(`« ${published.name} » est publié.`);
    } catch (error) {
      showErrors(error);
      toast.error(errorMessage(error));
    } finally {
      setBusy(null);
    }
  }

  async function unpublish() {
    const id = idRef.current;
    if (!id) return;
    setBusy('unpublish');
    try {
      if (!(await autosave.flush())) return;
      const draft = await data(
        browserApi.POST('/v1/admin/services/{id}/unpublish', { params: { path: { id } } }),
      );
      store(draft);
      toast.success(`« ${draft.name} » est repassé en brouillon.`);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(null);
    }
  }

  async function preview() {
    // Onglet ouvert pendant le clic (sinon bloqué par le navigateur), dirigé vers l'aperçu une fois prêt.
    const tab = window.open('', '_blank');
    if (!checkRequired()) {
      tab?.close();
      toast.error('Renseignez le nom, la rubrique et la phrase d’accroche pour prévisualiser la page.');
      return;
    }
    setBusy('preview');
    try {
      const id = await ensureCreated(false);
      if (!id || !(await autosave.flush())) {
        tab?.close();
        return;
      }
      await openServicePreview(id, tab);
    } finally {
      setBusy(null);
    }
  }

  const published = status === 'PUBLISHED';
  const title = initial ? form.name.trim() || 'Service sans nom' : 'Nouveau service';
  const relatedError = errors.relatedServiceIds;

  return (
    <AdminPage
      title={title}
      breadcrumb={<Breadcrumb current={title} />}
      actions={
        <>
          <ActionButton
            icon={<Eye aria-hidden />}
            pending={busy === 'preview'}
            onClick={() => void preview()}
          >
            Aperçu
          </ActionButton>
          {published ? (
            <ActionButton
              primary
              icon={<CircleCheck aria-hidden />}
              pending={busy === 'save'}
              onClick={() => void save()}
            >
              Enregistrer
            </ActionButton>
          ) : (
            <ActionButton
              primary
              icon={<CircleCheck aria-hidden />}
              pending={busy === 'publish'}
              onClick={() => void publish()}
            >
              Publier
            </ActionButton>
          )}
        </>
      }
    >
      <EditorLayout
        aside={
          <>
            <SideCard title="Publication">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-ui text-[14px] leading-5 text-text-muted">Statut</span>
                  <PublishStatusBadge status={status} />
                </div>
                {(
                  [
                    ['showInMenu', 'Afficher dans le menu'],
                    ['featuredOnHome', 'Mettre en avant sur l’accueil'],
                    ['showWhatsapp', 'Bouton WhatsApp sur la page'],
                  ] as const
                ).map(([key, label]) => (
                  <Switch
                    key={key}
                    id={`service-${key}`}
                    label={label}
                    checked={form[key]}
                    onChange={(event) => update({ [key]: event.currentTarget.checked })}
                    className="w-full flex-row-reverse justify-between"
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ActionButton pending={busy === 'save'} onClick={() => void save()}>
                  Enregistrer
                </ActionButton>
                {published ? (
                  <ActionButton pending={busy === 'unpublish'} onClick={() => void unpublish()}>
                    Dépublier
                  </ActionButton>
                ) : (
                  <ActionButton primary pending={busy === 'publish'} onClick={() => void publish()}>
                    Publier
                  </ActionButton>
                )}
              </div>
              <SavedNote
                savedAt={serviceId ? autosave.savedAt : null}
                saving={autosave.pending}
                error={autosave.error}
              />
            </SideCard>

            <SideCard
              title="Aperçu de la carte"
              action={
                <button
                  type="button"
                  onClick={() => void preview()}
                  className="flex items-center gap-1 rounded-xs font-ui text-[14px] leading-5 font-semibold text-text-brand hover:underline"
                >
                  Ouvrir <ArrowUpRight aria-hidden size={16} />
                  <span className="sr-only"> l’aperçu de la page (nouvel onglet)</span>
                </button>
              }
              className="gap-3"
            >
              <CardPreview form={form} cover={cover} />
            </SideCard>

            <CompletenessCard criteria={completeness.criteria} />
          </>
        }
      >
        <EditorSection
          number={1}
          title="Informations générales"
          subtitle="Ce qui apparaît en haut de la page et sur la carte du service."
        >
          <div className="grid gap-[18px] md:grid-cols-2">
            <Field label="Nom du service" required error={errors.name || null}>
              {(control) => (
                <Input
                  {...control}
                  value={form.name}
                  maxLength={120}
                  onChange={(event) => {
                    setForm((current) => withName(current, event.target.value, everPublished));
                    if (errors.name) setErrors((current) => ({ ...current, name: '' }));
                  }}
                />
              )}
            </Field>
            <Field label="Rubrique" required error={errors.categoryId || null}>
              {(control) => (
                <Select
                  {...control}
                  value={form.categoryId}
                  onChange={(event) => update({ categoryId: event.target.value })}
                >
                  <option value="">Choisir une rubrique</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
          <Field
            label="Phrase d’accroche"
            required
            error={errors.tagline || null}
            help={charCountHelp(form.tagline, TAGLINE_MAX, 'Une phrase courte, affichée sous le titre.')}
          >
            {(control) => (
              <Input
                {...control}
                value={form.tagline}
                maxLength={TAGLINE_MAX}
                onChange={(event) => {
                  setForm((current) => withTagline(current, event.target.value));
                  if (errors.tagline) setErrors((current) => ({ ...current, tagline: '' }));
                }}
              />
            )}
          </Field>
          <Field label="Description courte (cartes et résultats)" error={errors.summary || null}>
            {(control) => (
              <Input
                {...control}
                value={form.summary}
                maxLength={SUMMARY_MAX}
                onChange={(event) => update({ summary: event.target.value })}
              />
            )}
          </Field>
          <VisualsField
            value={{ coverImageId: form.coverImageId, galleryImageIds: form.galleryImageIds }}
            onChange={(visuals) => update(visuals)}
            illustration={form.illustration}
            media={media}
            onMedia={(image) => setPicked((current) => ({ ...current, [image.id]: image }))}
            error={errors.galleryImageIds || errors.coverImageId || null}
          />
        </EditorSection>

        <EditorSection
          number={2}
          title={frenchTypography('À qui s’adresse ce service ?')}
          subtitle="Une ligne par public. Affiché sous forme de liste cochée."
        >
          <RepeatableList
            value={form.audiences}
            onChange={(audiences) => update({ audiences })}
            createItem={() => ''}
            addLabel="Ajouter un public"
            itemName="public"
            max={12}
            renderFields={(item, change, index) => (
              <SubInput
                aria-label={`Public ${index + 1}`}
                value={item}
                maxLength={200}
                onChange={(event) => change(event.target.value)}
              />
            )}
          />
          <ListErrors errors={errors} prefix="audiences" />
        </EditorSection>

        <EditorSection
          number={3}
          title="Ce que Mambo fait concrètement"
          subtitle="Les étapes du service, dans l’ordre."
        >
          <RepeatableList
            value={form.steps}
            onChange={(steps) => update({ steps })}
            createItem={() => ({ title: '', text: '' })}
            addLabel="Ajouter une étape"
            itemName="étape"
            max={10}
            renderFields={(item, change, index) => (
              <>
                <SubInput
                  aria-label={`Titre de l’étape ${index + 1}`}
                  value={item.title}
                  maxLength={120}
                  aria-invalid={errors[`steps.${index}.title`] ? true : undefined}
                  onChange={(event) => change({ ...item, title: event.target.value })}
                />
                <SubInput
                  aria-label={`Texte de l’étape ${index + 1}`}
                  value={item.text}
                  maxLength={600}
                  onChange={(event) => change({ ...item, text: event.target.value })}
                />
              </>
            )}
          />
          <ListErrors errors={errors} prefix="steps" />
        </EditorSection>

        <EditorSection number={4} title="Les avantages pour le bénéficiaire">
          <RepeatableList
            value={form.advantages}
            onChange={(advantages) => update({ advantages })}
            createItem={() => ({ icon: null, title: '', text: '' })}
            addLabel="Ajouter un avantage"
            itemName="avantage"
            max={8}
            renderFields={(item, change, index) => (
              <>
                <SubInput
                  aria-label={`Titre de l’avantage ${index + 1}`}
                  value={item.title}
                  maxLength={120}
                  onChange={(event) => change({ ...item, title: event.target.value })}
                />
                <SubInput
                  aria-label={`Texte de l’avantage ${index + 1}`}
                  value={item.text}
                  maxLength={600}
                  onChange={(event) => change({ ...item, text: event.target.value })}
                />
              </>
            )}
          />
          <ListErrors errors={errors} prefix="advantages" />
        </EditorSection>

        <EditorSection number={5} title="Questions fréquentes" subtitle="Facultatif.">
          <RepeatableList
            value={form.faq}
            onChange={(faq) => update({ faq })}
            createItem={() => ({ question: '', answer: '' })}
            addLabel="Ajouter une question"
            itemName="question"
            max={20}
            renderFields={(item, change, index) => (
              <>
                <SubInput
                  aria-label={`Question ${index + 1}`}
                  value={item.question}
                  maxLength={200}
                  onChange={(event) => change({ ...item, question: event.target.value })}
                />
                <SubInput
                  aria-label={`Réponse ${index + 1}`}
                  value={item.answer}
                  maxLength={2000}
                  onChange={(event) => change({ ...item, answer: event.target.value })}
                />
              </>
            )}
          />
          <ListErrors errors={errors} prefix="faq" />
        </EditorSection>

        <EditorSection
          number={6}
          title="Services liés et témoignages"
          subtitle="Affichés en bas de la page du service."
        >
          {services.isPending ? (
            <Skeleton className="h-20 rounded-md" />
          ) : (
            <ChipSelect
              label="Services liés"
              options={relatedOptions}
              value={form.relatedServiceIds}
              onChange={(relatedServiceIds) => {
                if (relatedServiceIds.length > MAX_RELATED) {
                  setErrors((current) => ({
                    ...current,
                    relatedServiceIds: `${MAX_RELATED} services liés au maximum : retirez-en un pour en ajouter un autre.`,
                  }));
                  return;
                }
                update({ relatedServiceIds });
              }}
              addLabel="Ajouter un service lié"
              onAdd={() => {
                if (form.relatedServiceIds.length >= MAX_RELATED)
                  toast.error(
                    `${MAX_RELATED} services liés au maximum : retirez-en un pour en ajouter un autre.`,
                  );
                else setRelatedPicker(true);
              }}
            />
          )}
          <RelatedPickerDialog
            open={relatedPicker}
            onClose={() => setRelatedPicker(false)}
            services={(services.data?.data ?? []).filter((service) => service.id !== serviceId)}
            selected={form.relatedServiceIds}
            max={MAX_RELATED}
            onConfirm={(ids) => {
              update({ relatedServiceIds: [...form.relatedServiceIds, ...ids].slice(0, MAX_RELATED) });
              setRelatedPicker(false);
            }}
          />
          {relatedError && (
            <p role="alert" className="-mt-2 font-ui text-[13px] leading-4 text-feedback-error">
              {relatedError}
            </p>
          )}
          <ChipSelect
            label="Témoignages affichés"
            options={reviewOptions}
            value={form.featuredReviewIds}
            onChange={(featuredReviewIds) => update({ featuredReviewIds })}
            addLabel="Choisir un avis publié"
            onAdd={() => {
              if (form.featuredReviewIds.length >= MAX_REVIEWS)
                toast.error(
                  `${MAX_REVIEWS} témoignages au maximum : retirez-en un pour en ajouter un autre.`,
                );
              else setReviewPicker(true);
            }}
          />
          <ReviewPickerDialog
            open={reviewPicker}
            onClose={() => setReviewPicker(false)}
            selected={form.featuredReviewIds}
            onConfirm={(ids) => {
              update({ featuredReviewIds: [...form.featuredReviewIds, ...ids].slice(0, MAX_REVIEWS) });
              setReviewPicker(false);
            }}
          />
        </EditorSection>

        <EditorSection
          number={7}
          title="Référencement (SEO)"
          subtitle="Rempli automatiquement, modifiable si besoin."
        >
          <Field
            label={
              <>
                Adresse de la page
                <span className="sr-only">
                  {' '}
                  (fin de l’adresse, après {SITE_HOST}/services/{categorySlug ?? ''}/)
                </span>
              </>
            }
            error={errors.slug || null}
            help={
              everPublished ? 'Changer l’adresse d’une page publiée casse les liens existants.' : undefined
            }
          >
            {(control) => (
              <div className="flex items-center gap-2.5 rounded-md border border-border-strong bg-neutral-0 px-4 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary focus-within:ring-inset has-aria-invalid:border-feedback-error">
                <Globe aria-hidden size={18} className="shrink-0 text-icon-default" />
                <span
                  aria-hidden
                  className="min-w-0 shrink truncate font-ui text-[16px] leading-6 whitespace-nowrap text-text-main max-sm:max-w-[45%]"
                >
                  {SITE_HOST}/services/{categorySlug ?? '…'}/
                </span>
                <input
                  {...control}
                  value={form.slug}
                  maxLength={80}
                  onChange={(event) => update({ slug: event.target.value })}
                  onBlur={() => update({ slug: slugify(form.slug) })}
                  className="-ml-2.5 min-w-[80px] flex-1 bg-transparent py-3.5 font-ui text-[16px] leading-6 text-text-main outline-none"
                />
              </div>
            )}
          </Field>
          <Field
            label="Titre pour Google"
            error={errors.seoTitle || null}
            help={charCountHelp(form.seoTitle, SEO_TITLE_MAX)}
          >
            {(control) => (
              <Input
                {...control}
                value={form.seoTitle}
                maxLength={SEO_TITLE_MAX}
                onChange={(event) => update({ seoTitle: event.target.value })}
              />
            )}
          </Field>
          <Field
            label="Description pour Google"
            error={errors.seoDescription || null}
            help={charCountHelp(form.seoDescription, SEO_DESCRIPTION_MAX)}
          >
            {(control) => (
              <Textarea
                {...control}
                rows={2}
                className="min-h-[76px]"
                value={form.seoDescription}
                maxLength={SEO_DESCRIPTION_MAX}
                onChange={(event) => update({ seoDescription: event.target.value })}
              />
            )}
          </Field>
        </EditorSection>
      </EditorLayout>
    </AdminPage>
  );
}

function EditorSkeleton({ title }: { title: string }) {
  return (
    <AdminPage title={title} breadcrumb={<Breadcrumb current={title} />}>
      <EditorLayout aside={<Skeleton className="h-[260px] rounded-lg" />}>
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-[320px] rounded-lg" />
        ))}
      </EditorLayout>
    </AdminPage>
  );
}

/**
 * Éditeur de service : création (`/admin/services/nouveau`, « Ajouter un service » `91:10598`) ou modification
 * (`/admin/services/[id]`). Service inconnu : page 404 de la coque.
 */
export function ServiceEditor({ id }: { id: string | null }) {
  const categories = useQuery({
    queryKey: categoriesKey,
    queryFn: fetchCategories,
  });
  const service = useQuery({
    queryKey: serviceKey(id ?? 'nouveau'),
    queryFn: () => data(browserApi.GET('/v1/admin/services/{id}', { params: { path: { id: id! } } })),
    enabled: !!id,
    // Données de l'éditeur figées à l'ouverture : la sauvegarde automatique fait foi ensuite.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  if (service.error instanceof ApiError && service.error.status === 404) notFound();

  const error = categories.error ?? service.error;
  if (error)
    return (
      <AdminPage title="Service" breadcrumb={<Breadcrumb current="Service" />}>
        <AdminCard role="alert" className="flex flex-col items-start gap-3 p-6">
          <p className="font-ui text-[15px] leading-6">{errorMessage(error)}</p>
          <button
            type="button"
            onClick={() => {
              void categories.refetch();
              if (id) void service.refetch();
            }}
            className={topbarSecondaryClass}
          >
            Réessayer
          </button>
        </AdminCard>
      </AdminPage>
    );

  if (!categories.data || (id && !service.data))
    return <EditorSkeleton title={id ? 'Service' : 'Nouveau service'} />;

  return <EditorForm key={id ?? 'nouveau'} initial={service.data ?? null} categories={categories.data} />;
}
