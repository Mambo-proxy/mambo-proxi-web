'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, ChevronRight, CircleCheck, Eye, ExternalLink, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AdminPage, topbarSecondaryClass } from '@/components/admin/shell/admin-page';
import {
  CompletenessCard,
  EditorLayout,
  PublishStatusBadge,
  SavedNote,
  SideCard,
} from '@/components/admin/editor/editor-ui';
import { useAutosave } from '@/components/admin/editor/use-autosave';
import { mediaListKey, toMediaImage } from '@/components/admin/editor/media-picker';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import { Visual } from '@/components/ui/visual';
import { data } from '@/lib/admin/query';
import { adminRoutes } from '@/lib/admin/routes';
import { browserApi } from '@/lib/api/browser';
import { errorMessage } from '@/lib/api/errors';
import type {
  AdminCategory,
  AdminReview,
  AdminService,
  AdminServiceListItem,
  MediaImage,
  PublishStatus,
} from '@/lib/api/schema';
import {
  AdvantagesSection,
  AudiencesSection,
  FaqSection,
  GeneralSection,
  RelationsSection,
  SeoSection,
  StepsSection,
  type SectionProps,
} from './service-editor-sections';
import { draftCompleteness, toDraft, toPayload, type ServiceDraft } from './service-editor-model';
import { categoriesKey, servicesKey } from './service-ui';

/**
 * Éditeur de service (`91:10598`) : charge le service, ses rubriques, les services liés, les avis publiés et les
 * visuels de la médiathèque, puis monte le formulaire avec son état initial.
 */
export function ServiceEditor({ id }: { id?: string }) {
  const detail = useQuery({
    queryKey: [...servicesKey, 'detail', id],
    queryFn: () => data(browserApi.GET('/v1/admin/services/{id}', { params: { path: { id: id! } } })),
    enabled: Boolean(id),
    retry: false,
  });
  const categoriesQuery = useQuery({
    queryKey: categoriesKey,
    queryFn: () => data(browserApi.GET('/v1/admin/categories')),
    staleTime: Infinity,
  });
  const servicesQuery = useQuery({
    queryKey: [...servicesKey, 'all'],
    queryFn: () =>
      data(browserApi.GET('/v1/admin/services', { params: { query: { pageSize: 100 } as never } })),
    staleTime: 30_000,
  });
  const reviewsQuery = useQuery({
    queryKey: ['admin-reviews', 'published'],
    queryFn: () =>
      data(browserApi.GET('/v1/admin/reviews', { params: { query: { status: 'PUBLIE', pageSize: 50 } } })),
    staleTime: 60_000,
  });
  const galleryIds = detail.data?.galleryImageIds ?? [];
  const mediaQuery = useQuery({
    queryKey: [...mediaListKey, 'gallery'],
    queryFn: () => data(browserApi.GET('/v1/admin/media', { params: { query: { pageSize: 100 } as never } })),
    enabled: galleryIds.length > 0,
    staleTime: 60_000,
  });
  const galleryImages = galleryIds
    .map((mediaId) => mediaQuery.data?.data.find((media) => media.id === mediaId))
    .filter((media): media is NonNullable<typeof media> => Boolean(media))
    .map(toMediaImage);
  const title = id ? 'Modifier le service' : 'Nouveau service';
  const categories = categoriesQuery.data;

  if (id && detail.isError) {
    return (
      <AdminPage title={title}>
        <div
          role="alert"
          className="flex flex-col items-start gap-3 rounded-lg border border-border-default bg-neutral-0 p-6"
        >
          <p className="font-ui text-[15px] leading-6">Ce service n’existe pas ou a été supprimé.</p>
          <Link href={adminRoutes.services} className={topbarSecondaryClass}>
            Retour aux services
          </Link>
        </div>
      </AdminPage>
    );
  }

  const ready = Boolean(categories && (!id || (detail.data && (galleryIds.length === 0 || mediaQuery.data))));
  if (!ready || !categories) {
    return (
      <AdminPage title={title}>
        <div className="flex flex-col gap-5" aria-hidden>
          <Skeleton className="h-[360px] rounded-lg" />
          <Skeleton className="h-[220px] rounded-lg" />
          <Skeleton className="h-[280px] rounded-lg" />
        </div>
      </AdminPage>
    );
  }

  return (
    <ServiceEditorForm
      key={id ?? 'new'}
      service={detail.data ?? null}
      categories={categories}
      services={servicesQuery.data?.data ?? []}
      reviews={reviewsQuery.data?.data ?? []}
      galleryImages={galleryImages}
    />
  );
}

/** Formulaire de l'éditeur : état local, sauvegarde automatique, publication et aperçu. */
function ServiceEditorForm({
  service,
  categories,
  services,
  reviews,
  galleryImages,
}: {
  service: AdminService | null;
  categories: AdminCategory[];
  services: AdminServiceListItem[];
  reviews: AdminReview[];
  galleryImages: MediaImage[];
}) {
  const id = service?.id;
  const router = useRouter();
  const client = useQueryClient();
  const [draft, setDraft] = useState<ServiceDraft>(() => ({
    ...toDraft(service, categories),
    gallery: galleryImages,
  }));
  const [status, setStatus] = useState<PublishStatus>(service?.status ?? 'DRAFT');
  const [publishedAt, setPublishedAt] = useState<string | null>(service?.publishedAt ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [manualPending, setManualPending] = useState(false);

  const canSave = Boolean(draft.name.trim() && draft.tagline.trim() && draft.categoryId);

  const autosave = useAutosave<ServiceDraft>({
    value: draft,
    enabled: Boolean(id && canSave),
    initialSavedAt: service?.updatedAt ?? null,
    save: async (value) => {
      const updated = await data(
        browserApi.PATCH('/v1/admin/services/{id}', {
          params: { path: { id: id! } },
          body: toPayload(value),
        }),
      );
      setStatus(updated.status);
      setPublishedAt(updated.publishedAt ?? null);
      return updated;
    },
  });

  function update(changes: Partial<ServiceDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
    const touched = Object.keys(changes);
    if (touched.some((key) => errors[key])) {
      setErrors((current) => {
        const next = { ...current };
        for (const key of touched) delete next[key];
        return next;
      });
    }
  }

  function validate(value: ServiceDraft): boolean {
    const next: Record<string, string> = {};
    if (!value.name.trim()) next.name = 'Indiquez le nom du service.';
    if (!value.categoryId) next.categoryId = 'Choisissez une rubrique.';
    if (!value.tagline.trim()) next.tagline = 'Écrivez une phrase d’accroche.';
    if (value.tagline.length > 120) next.tagline = '120 caractères au maximum.';
    if (value.seoTitle.length > 60) next.seoTitle = '60 caractères au maximum.';
    if (value.seoDescription.length > 160) next.seoDescription = '160 caractères au maximum.';
    setErrors(next);
    if (Object.keys(next).length > 0) {
      document.getElementById('service-form')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      return false;
    }
    return true;
  }

  async function create(publish: boolean) {
    if (!validate(draft)) return;
    setManualPending(true);
    try {
      let created: AdminService = await data(
        browserApi.POST('/v1/admin/services', { body: toPayload(draft) }),
      );
      if (publish) {
        created = await data(
          browserApi.POST('/v1/admin/services/{id}/publish', { params: { path: { id: created.id } } }),
        );
      }
      toast.success(publish ? `« ${created.name} » est publié.` : `« ${created.name} » a été enregistré.`);
      void client.invalidateQueries({ queryKey: servicesKey });
      router.replace(`${adminRoutes.services}/${created.id}` as never);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setManualPending(false);
    }
  }

  async function save() {
    if (!validate(draft)) return;
    if (!id) return create(false);
    setManualPending(true);
    const saved = await autosave.flush();
    setManualPending(false);
    if (saved) toast.success('Modifications enregistrées.');
    else toast.error('Les modifications n’ont pas pu être enregistrées.');
  }

  async function togglePublication() {
    if (!id) return create(true);
    if (!validate(draft)) return;
    setManualPending(true);
    try {
      const saved = await autosave.flush();
      if (!saved) throw new Error('save');
      const updated: AdminService =
        status === 'PUBLISHED'
          ? await data(browserApi.POST('/v1/admin/services/{id}/unpublish', { params: { path: { id } } }))
          : await data(browserApi.POST('/v1/admin/services/{id}/publish', { params: { path: { id } } }));
      setStatus(updated.status);
      setPublishedAt(updated.publishedAt ?? null);
      toast.success(
        updated.status === 'PUBLISHED'
          ? `« ${updated.name} » est en ligne.`
          : `« ${updated.name} » repasse en brouillon.`,
      );
      void client.invalidateQueries({ queryKey: servicesKey });
    } catch (error) {
      if (!(error instanceof Error && error.message === 'save')) toast.error(errorMessage(error));
    } finally {
      setManualPending(false);
    }
  }

  async function preview() {
    if (!id) return;
    try {
      const token = await data(
        browserApi.GET('/v1/admin/services/{id}/preview-token', { params: { path: { id } } }),
      );
      window.open(token.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  const completeness = draftCompleteness(draft);
  const title = id ? 'Modifier le service' : 'Nouveau service';
  const sectionProps: SectionProps = { draft, update, categories, services, reviews, errors };

  return (
    <AdminPage
      title={title}
      breadcrumb={
        <span className="flex items-center gap-1.5">
          Contenus du site <ChevronRight aria-hidden size={12} />
          <Link href={adminRoutes.services} className="hover:text-text-main">
            Services
          </Link>
          <ChevronRight aria-hidden size={12} /> {title}
        </span>
      }
      actions={
        <>
          <button
            type="button"
            onClick={() => void preview()}
            disabled={!id}
            className={topbarSecondaryClass}
          >
            <Eye aria-hidden />
            Aperçu
          </button>
          <button
            type="button"
            onClick={() => void togglePublication()}
            disabled={manualPending || autosave.pending || !canSave}
            className="inline-flex items-center gap-2 rounded-[10px] bg-brand-primary px-3.5 py-2.5 font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-on-primary hover:bg-brand-primary-hover disabled:opacity-60 [&_svg]:size-4"
          >
            {status === 'PUBLISHED' ? <Undo2 aria-hidden /> : <CircleCheck aria-hidden />}
            {status === 'PUBLISHED' ? 'Dépublier' : 'Publier'}
          </button>
        </>
      }
    >
      <div id="service-form" className="scroll-mt-24">
        <EditorLayout
          aside={
            <ServiceAside
              draft={draft}
              completeness={completeness}
              status={status}
              publishedAt={publishedAt}
              pending={manualPending}
              autosave={autosave}
              onSave={() => void save()}
              onPublish={() => void togglePublication()}
              onPreview={() => void preview()}
              update={update}
            />
          }
        >
          <GeneralSection {...sectionProps} />
          <AudiencesSection {...sectionProps} />
          <StepsSection {...sectionProps} />
          <AdvantagesSection {...sectionProps} />
          <FaqSection {...sectionProps} />
          <RelationsSection {...sectionProps} />
          <SeoSection {...sectionProps} />
        </EditorLayout>
      </div>
    </AdminPage>
  );
}

type AsideProps = {
  draft: ServiceDraft;
  completeness: { percent: number; criteria: { key: string; label: string; done: boolean }[] };
  status: PublishStatus;
  publishedAt: string | null;
  pending: boolean;
  autosave: { savedAt: string | null; pending: boolean; error: boolean; dirty: boolean };
  onSave: () => void;
  onPublish: () => void;
  onPreview: () => void;
  update: (changes: Partial<ServiceDraft>) => void;
};

/** Colonne latérale (`91:11111`) : Publication, Aperçu de la carte, Complétude. */
function ServiceAside({
  draft,
  completeness,
  status,
  publishedAt,
  pending,
  autosave,
  onSave,
  onPublish,
  onPreview,
  update,
}: AsideProps) {
  return (
    <>
      <SideCard
        title="Publication"
        action={
          <span className="flex items-center gap-2">
            <span className="font-ui text-[12px] leading-4 text-text-muted">Statut</span>
            <PublishStatusBadge status={status} />
          </span>
        }
      >
        <div className="flex flex-col gap-3">
          <Switch
            id="show-in-menu"
            label="Afficher dans le menu"
            checked={draft.showInMenu}
            onChange={(event) => update({ showInMenu: event.target.checked })}
          />
          <Switch
            id="featured-on-home"
            label="Mettre en avant sur l’accueil"
            checked={draft.featuredOnHome}
            onChange={(event) => update({ featuredOnHome: event.target.checked })}
          />
          <Switch
            id="show-whatsapp"
            label="Bouton WhatsApp sur la page"
            checked={draft.showWhatsapp}
            onChange={(event) => update({ showWhatsapp: event.target.checked })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={onSave} loading={pending && !autosave.pending}>
            Enregistrer
          </Button>
          <Button size="sm" onClick={onPublish} loading={pending}>
            {status === 'PUBLISHED' ? 'Dépublier' : 'Publier'}
          </Button>
        </div>
        {publishedAt && status === 'PUBLISHED' && (
          <p className="font-ui text-[12px] leading-4 text-text-muted">
            En ligne depuis le {new Date(publishedAt).toLocaleDateString('fr-FR')}.
          </p>
        )}
        <SavedNote savedAt={autosave.savedAt} saving={autosave.pending} error={autosave.error} />
      </SideCard>

      <SideCard
        title="Aperçu de la carte"
        action={
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-1 font-ui text-[14px] leading-5 font-semibold text-text-brand hover:underline"
          >
            Ouvrir <ExternalLink aria-hidden size={14} />
          </button>
        }
      >
        <article className="flex flex-col overflow-hidden rounded-md border border-border-default">
          <Visual
            visual={{ illustration: draft.illustration, image: draft.coverImage, alt: '' }}
            sizes="300px"
            className="h-[150px] w-full"
          />
          <div className="flex flex-col gap-1.5 p-3.5">
            <h3 className="font-ui text-[15px] leading-6 font-semibold text-text-main">
              {draft.name || 'Nom du service'}
            </h3>
            <p className="line-clamp-2 font-ui text-[12px] leading-4 text-text-muted">
              {draft.tagline || 'La phrase d’accroche apparaîtra ici.'}
            </p>
            <button
              type="button"
              onClick={onPreview}
              className="mt-1 inline-flex items-center gap-1 self-start font-ui text-[14px] leading-5 font-semibold text-text-brand hover:underline"
            >
              Voir le service <ArrowRight aria-hidden size={14} />
            </button>
          </div>
        </article>
      </SideCard>

      <CompletenessCard criteria={completeness.criteria} />
    </>
  );
}
