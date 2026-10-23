import type {
  AdminCategory,
  AdminService,
  Completeness,
  FaqItem,
  IconTextItem,
  IllustrationScene,
  MediaImage,
  ServicePatch,
  StepItem,
} from '@/lib/api/schema';

/** Champs éditables d'un service (l'API reçoit `categoryId` et les identifiants de médias). */
export type ServiceDraft = {
  name: string;
  categoryId: string;
  tagline: string;
  summary: string;
  slug: string;
  illustration: IllustrationScene;
  coverImage: MediaImage | null;
  gallery: MediaImage[];
  audiences: string[];
  steps: StepItem[];
  advantages: IconTextItem[];
  faq: FaqItem[];
  relatedServiceIds: string[];
  featuredReviewIds: string[];
  showInMenu: boolean;
  featuredOnHome: boolean;
  showWhatsapp: boolean;
  seoTitle: string;
  seoDescription: string;
};

/** Service de l'API → brouillon de l'éditeur ; `null` : nouveau service (champs vides). */
export function toDraft(service: AdminService | null, categories: AdminCategory[]): ServiceDraft {
  if (!service) {
    return {
      name: '',
      categoryId: categories[0]?.id ?? '',
      tagline: '',
      summary: '',
      slug: '',
      illustration: 'accueil',
      coverImage: null,
      gallery: [],
      audiences: [],
      steps: [],
      advantages: [],
      faq: [],
      relatedServiceIds: [],
      featuredReviewIds: [],
      showInMenu: false,
      featuredOnHome: false,
      showWhatsapp: true,
      seoTitle: '',
      seoDescription: '',
    };
  }
  const categoryId = categories.find((item) => item.slug === service.category.slug)?.id ?? '';
  return {
    name: service.name,
    categoryId,
    tagline: service.tagline,
    summary: service.summary,
    slug: service.slug,
    illustration: service.illustration,
    coverImage: service.coverImage ?? null,
    gallery: [],
    audiences: service.audiences,
    steps: service.steps,
    advantages: service.advantages,
    faq: service.faq,
    relatedServiceIds: service.relatedServiceIds,
    featuredReviewIds: service.featuredReviewIds,
    showInMenu: service.showInMenu,
    featuredOnHome: service.featuredOnHome ?? false,
    showWhatsapp: service.showWhatsapp,
    seoTitle: service.seoTitle ?? '',
    seoDescription: service.seoDescription ?? '',
  };
}

/** Adresse publique du service, préfixée par le domaine (affichage seul, comme `91:11000`). */
export function publicPath(draft: ServiceDraft, categories: AdminCategory[]): string {
  const category = categories.find((item) => item.id === draft.categoryId);
  const slug = draft.slug || 'adresse-du-service';
  return `/services/${category?.slug ?? 'rubrique'}/${slug}`;
}

/** Complétude locale (mêmes 7 critères que l'API), mise à jour à chaque saisie. */
export function draftCompleteness(draft: ServiceDraft): Completeness {
  const criteria: Completeness['criteria'] = [
    {
      key: 'general',
      label: 'Informations générales',
      done: Boolean(draft.name.trim() && draft.tagline.trim()),
    },
    { key: 'audiences', label: 'Public', done: draft.audiences.length > 0 },
    { key: 'steps', label: 'Étapes', done: draft.steps.length > 0 },
    { key: 'advantages', label: 'Avantages', done: draft.advantages.length > 0 },
    { key: 'faq', label: 'Questions fréquentes', done: draft.faq.length > 0 },
    { key: 'related', label: 'Services liés', done: draft.relatedServiceIds.length > 0 },
    {
      key: 'coverImage',
      label: 'Photo principale en haute définition',
      done: (draft.coverImage?.width ?? 0) >= 1600,
    },
  ];
  const done = criteria.filter((criterion) => criterion.done).length;
  return { percent: Math.round((done / criteria.length) * 100), criteria };
}

/** Corps envoyé à l'API (création et enregistrement automatique). */
export function toPayload(draft: ServiceDraft): ServicePatch {
  return {
    name: draft.name.trim(),
    categoryId: draft.categoryId || undefined,
    tagline: draft.tagline.trim(),
    summary: draft.summary,
    slug: draft.slug || undefined,
    illustration: draft.illustration,
    coverImageId: draft.coverImage?.id ?? null,
    galleryImageIds: draft.gallery.map((image) => image.id),
    audiences: draft.audiences,
    steps: draft.steps,
    advantages: draft.advantages,
    faq: draft.faq,
    relatedServiceIds: draft.relatedServiceIds,
    featuredReviewIds: draft.featuredReviewIds,
    showInMenu: draft.showInMenu,
    featuredOnHome: draft.featuredOnHome,
    showWhatsapp: draft.showWhatsapp,
    seoTitle: draft.seoTitle || null,
    seoDescription: draft.seoDescription || null,
  } as unknown as ServicePatch;
}
