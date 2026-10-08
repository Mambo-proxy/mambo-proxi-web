import type {
  AdminCategory,
  AdminService,
  FaqItem,
  IconTextItem,
  IllustrationScene,
  ServiceFields,
  StepItem,
} from '@/lib/api/schema';
import { SEO_DESCRIPTION_MAX, defaultSeoTitle, follow, slugify } from './service-utils';

/** Valeurs du formulaire de l'éditeur de service (`91:10755`). */
export type ServiceForm = {
  name: string;
  categoryId: string;
  tagline: string;
  summary: string;
  slug: string;
  illustration: IllustrationScene;
  coverImageId: string | null;
  galleryImageIds: string[];
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

/** Nouveau service : interrupteurs de la maquette (menu et WhatsApp activés, accueil désactivé). */
export function emptyForm(): ServiceForm {
  return {
    name: '',
    categoryId: '',
    tagline: '',
    summary: '',
    slug: '',
    illustration: 'accueil',
    coverImageId: null,
    galleryImageIds: [],
    audiences: [''],
    steps: [{ title: '', text: '' }],
    advantages: [{ icon: null, title: '', text: '' }],
    faq: [],
    relatedServiceIds: [],
    featuredReviewIds: [],
    showInMenu: true,
    featuredOnHome: false,
    showWhatsapp: true,
    seoTitle: '',
    seoDescription: '',
  };
}

export function formFromService(service: AdminService, categories: AdminCategory[]): ServiceForm {
  return {
    name: service.name,
    categoryId: categories.find((category) => category.slug === service.category.slug)?.id ?? '',
    tagline: service.tagline,
    summary: service.summary,
    slug: service.slug,
    illustration: service.illustration,
    coverImageId: service.coverImage?.id ?? null,
    galleryImageIds: service.galleryImageIds,
    audiences: service.audiences,
    steps: service.steps,
    advantages: service.advantages,
    faq: service.faq,
    relatedServiceIds: service.relatedServiceIds,
    featuredReviewIds: service.featuredReviewIds,
    showInMenu: service.showInMenu,
    featuredOnHome: service.featuredOnHome ?? false,
    showWhatsapp: service.showWhatsapp,
    seoTitle: service.seoTitle ?? defaultSeoTitle(service.name),
    seoDescription: service.seoDescription ?? '',
  };
}

const filled = (value: string) => value.trim().length > 0;

/**
 * Corps envoyé à l'API (création ou PATCH complet) : éléments de liste vides retirés, textes facultatifs vides
 * envoyés à `null`.
 */
export function formToFields(form: ServiceForm): ServiceFields {
  return {
    name: form.name.trim(),
    ...(form.categoryId ? { categoryId: form.categoryId } : {}),
    tagline: form.tagline.trim(),
    summary: form.summary.trim(),
    ...(form.slug ? { slug: slugify(form.slug) } : {}),
    illustration: form.illustration,
    coverImageId: form.coverImageId,
    galleryImageIds: form.galleryImageIds,
    audiences: form.audiences.map((item) => item.trim()).filter(filled),
    steps: form.steps.filter((step) => filled(step.title) || filled(step.text)),
    advantages: form.advantages.filter((item) => filled(item.title) || filled(item.text)),
    faq: form.faq.filter((item) => filled(item.question) || filled(item.answer)),
    relatedServiceIds: form.relatedServiceIds,
    featuredReviewIds: form.featuredReviewIds,
    showInMenu: form.showInMenu,
    featuredOnHome: form.featuredOnHome,
    showWhatsapp: form.showWhatsapp,
    seoTitle: form.seoTitle.trim() || null,
    seoDescription: form.seoDescription.trim() || null,
  };
}

/**
 * Saisie du nom : l'adresse (tant que le service n'a jamais été publié) et le titre pour Google suivent le nom
 * s'ils n'ont pas été modifiés à la main (« Visites guidées de Douala | MAMBO Proxi »).
 */
export function withName(form: ServiceForm, name: string, slugLocked: boolean): ServiceForm {
  return {
    ...form,
    name,
    slug: slugLocked ? form.slug : follow(form.slug, slugify(form.name), slugify(name)),
    seoTitle: follow(form.seoTitle, defaultSeoTitle(form.name), defaultSeoTitle(name)),
  };
}

/** Saisie de l'accroche : la description pour Google la reprend tant qu'elle n'a pas été modifiée. */
export function withTagline(form: ServiceForm, tagline: string): ServiceForm {
  return {
    ...form,
    tagline,
    seoDescription: follow(
      form.seoDescription,
      form.tagline.slice(0, SEO_DESCRIPTION_MAX),
      tagline.slice(0, SEO_DESCRIPTION_MAX),
    ),
  };
}

/** Champs exigés par l'API pour créer (et publier) un service. */
export function requiredErrors(form: ServiceForm): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!filled(form.name)) errors.name = 'Indiquez le nom du service.';
  else if (form.name.trim().length < 2) errors.name = 'Le nom doit compter au moins 2 caractères.';
  if (!form.categoryId) errors.categoryId = 'Choisissez une rubrique.';
  if (!filled(form.tagline)) errors.tagline = 'Écrivez une phrase d’accroche.';
  return errors;
}
