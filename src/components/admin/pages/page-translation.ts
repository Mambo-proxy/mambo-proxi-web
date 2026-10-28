import { localizeHref, parseSitePath } from '@/i18n/href';
import type {
  AdminPage,
  PageDraftInput,
  PageSection,
  PageTranslationInput,
  PageTranslationStatus,
} from '@/lib/api/schema';
import type { FieldErrors } from './page-model';

/**
 * Version anglaise des pages (onglet « English » de l'éditeur) : mêmes règles que l'API (`PageTranslationInput`).
 * Seuls les textes se traduisent ; tout le reste (structure, images, liens, réglages d'affichage, `enabled`, ordre)
 * est celui de la section française de même `id`. Module sans React : partagé avec les gestionnaires simulés et
 * couvert par des tests unitaires.
 */

/** Champs chaîne qui ne sont pas des textes à traduire : toujours ceux du français (sous-arbre compris). */
export const NON_TEXT_KEYS: ReadonlySet<string> = new Set([
  'id',
  'type',
  'variant',
  'tone',
  'layout',
  'icon',
  'href',
  'illustration',
  'image',
  'imageId',
  'source',
  'categorySlug',
  'anchor',
  'kind',
  'key',
  'number',
  'adminLabel',
]);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Textes anglais posés sur la structure française, comme l'API : une chaîne française non vide est remplacée par la
 * chaîne anglaise de même chemin si elle est renseignée (sinon le français reste) ; listes élément par élément
 * (nombre et ordre du français) ; champs techniques, booléens et nombres du français.
 */
export function applyEnglishTexts(french: unknown, english: unknown, key?: string): unknown {
  return compose(french, english, key, false);
}

/**
 * Comme `applyEnglishTexts`, mais une saisie anglaise vide est gardée telle quelle : valeur affichée dans l'éditeur
 * (un champ vidé ne doit pas se remplir de nouveau avec le français pendant la saisie).
 */
export function alignToFrench(french: unknown, english: unknown, key?: string): unknown {
  return compose(french, english, key, true);
}

function compose(french: unknown, english: unknown, key: string | undefined, keepEmpty: boolean): unknown {
  if (key !== undefined && NON_TEXT_KEYS.has(key)) return french;
  if (typeof french === 'string') {
    if (french === '' || typeof english !== 'string') return french;
    return keepEmpty || english.trim() !== '' ? english : french;
  }
  if (Array.isArray(french)) {
    const list: unknown[] = Array.isArray(english) ? english : [];
    return french.map((item, index) => compose(item, list[index], undefined, keepEmpty));
  }
  if (isObject(french)) {
    const source = isObject(english) ? english : {};
    return Object.fromEntries(
      Object.entries(french).map(([field, value]) => [
        field,
        compose(value, source[field], field, keepEmpty),
      ]),
    );
  }
  return french;
}

// ───────────────────────────── Champs à traduire ─────────────────────────────

/** Ordre d'affichage des champs, proche de celui des éditeurs français. */
const KEY_ORDER = [
  'eyebrow',
  'title',
  'titleMobile',
  'subtitle',
  'lead',
  'leadMobile',
  'name',
  'role',
  'location',
  'question',
  'answer',
  'text',
  'textMobile',
  'updatedLabel',
  'label',
  'labelMobile',
  'valueText',
  'prefix',
  'suffix',
  'badge',
  'tag',
  'socialProof',
  'sticker',
  'paragraphs',
  'quote',
  'signature',
  'author',
  'html',
  'items',
  'itemsMobile',
  'chips',
  'members',
  'articles',
  'figures',
  'floatingCards',
  'anchors',
  'note',
  'primaryCta',
  'secondaryCta',
  'cta',
  'link',
  'visual',
  'visualSecondary',
  'alt',
];

const rank = (key: string) => {
  const index = KEY_ORDER.indexOf(key);
  return index === -1 ? KEY_ORDER.length : index;
};

const KEY_LABELS: Record<string, string> = {
  eyebrow: 'Surtitre',
  title: 'Titre',
  titleMobile: 'Titre en mobile',
  subtitle: 'Sous-titre',
  lead: 'Chapô',
  leadMobile: 'Chapô en mobile',
  name: 'Nom',
  role: 'Rôle',
  location: 'Ville',
  question: 'Question',
  answer: 'Réponse',
  text: 'Texte',
  textMobile: 'Texte en mobile',
  updatedLabel: 'Mention de mise à jour',
  label: 'Libellé',
  labelMobile: 'Libellé en mobile',
  valueText: 'Valeur',
  prefix: 'Préfixe',
  suffix: 'Suffixe',
  badge: 'Badge',
  tag: 'Étiquette',
  socialProof: 'Preuve sociale',
  sticker: 'Pastille',
  quote: 'Citation',
  signature: 'Signature',
  author: 'Auteur',
  html: 'Texte de l’article',
  note: 'Note',
  primaryCta: 'Bouton principal',
  secondaryCta: 'Bouton secondaire',
  cta: 'Bouton',
  link: 'Lien',
  visual: 'Visuel',
  visualSecondary: 'Visuel secondaire',
  alt: 'Texte alternatif',
};

/** Nom d'un élément de liste (« Carte 3 », « Paragraphe 1 »), selon la liste et le type de section. */
function itemNoun(list: string, sectionType: PageSection['type']): string {
  switch (list) {
    case 'items':
      return (
        (
          {
            marquee: 'Mention',
            steps: 'Étape',
            cardGrid: 'Carte',
            faq: 'Question',
            statsGrid: 'Chiffre',
          } as Partial<Record<PageSection['type'], string>>
        )[sectionType] ?? 'Élément'
      );
    case 'itemsMobile':
      return 'Mention mobile';
    case 'paragraphs':
      return 'Paragraphe';
    case 'chips':
      return 'Mot-clé';
    case 'members':
      return 'Membre';
    case 'articles':
      return 'Article';
    case 'figures':
      return 'Chiffre';
    case 'floatingCards':
      return 'Carte flottante';
    case 'anchors':
      return 'Lien de navigation';
    default:
      return 'Élément';
  }
}

const MULTILINE = new Set(['lead', 'leadMobile', 'text', 'answer', 'quote', 'note', 'paragraphs']);
const ACCENT = new Set(['title', 'titleMobile']);

export type TranslatableField = {
  /** Chemin dans la section (`items.2.cta.label`). */
  path: string;
  /** Libellé du champ (« Bouton · Libellé »), sans le nom de l'élément de liste. */
  label: string;
  /** Élément de liste qui regroupe le champ (« Carte 3 »), `null` pour un champ de la section. */
  group: string | null;
  /** Texte français actuel (référence de la traduction). */
  french: string;
  multiline: boolean;
  /** Texte mis en forme (`html` des articles). */
  rich: boolean;
  /** Texte mis en avant avec `==…==`. */
  accent: boolean;
};

/**
 * Textes d'une section française à traduire, dans l'ordre de l'éditeur : toutes les chaînes non vides, à toute
 * profondeur, sauf les champs techniques (`NON_TEXT_KEYS`) — exactement ce que l'API reprend de l'anglais.
 */
export function translatableFields(section: PageSection): TranslatableField[] {
  const fields: TranslatableField[] = [];
  const walk = (value: unknown, segments: string[], labels: string[], group: string | null) => {
    const key = segments.at(-1);
    if (key !== undefined && NON_TEXT_KEYS.has(key)) return;
    if (typeof value === 'string') {
      if (value.trim() === '') return;
      const named = segments.findLast((segment) => !/^\d+$/.test(segment)) ?? '';
      fields.push({
        path: segments.join('.'),
        label: labels.join(' · ') || 'Texte',
        group,
        french: value,
        multiline: MULTILINE.has(named),
        rich: named === 'html',
        accent: ACCENT.has(named),
      });
    } else if (Array.isArray(value)) {
      const noun = itemNoun(key ?? '', section.type);
      value.forEach((item, index) => {
        const name = `${noun} ${index + 1}`;
        // Élément d'une liste de la section : regroupé sous son nom ; liste plus profonde : nom dans le libellé.
        if (segments.length === 1 && typeof item !== 'string')
          walk(item, [...segments, String(index)], [], name);
        else walk(item, [...segments, String(index)], [...labels, name], group);
      });
    } else if (isObject(value)) {
      Object.keys(value)
        .sort((a, b) => rank(a) - rank(b))
        .forEach((field) =>
          walk(value[field], [...segments, field], [...labels, KEY_LABELS[field] ?? field], group),
        );
    }
  };
  walk(section, [], [], null);
  return fields;
}

export const hasTexts = (section: PageSection) => translatableFields(section).length > 0;

/** Valeur d'un chemin (`items.2.title`). */
export function getAt(value: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (Array.isArray(current)) return current[Number(segment)];
    return isObject(current) ? current[segment] : undefined;
  }, value);
}

/** Copie avec la valeur remplacée au chemin donné (le chemin doit exister). */
export function setAt<T>(value: T, path: string, next: unknown): T {
  const [head = '', ...rest] = path.split('.');
  const child = rest.length === 0 ? next : setAt(getAt(value, head), rest.join('.'), next);
  if (Array.isArray(value)) return value.map((item, index) => (index === Number(head) ? child : item)) as T;
  return { ...(value as object), [head]: child } as T;
}

// ───────────────────────────── Brouillon anglais ─────────────────────────────

export type EnglishDraft = {
  title: string | null;
  seo: { title: string | null; description: string | null };
  /** Sections traduites, par `id` de section française. */
  sections: Record<string, PageSection>;
};

/** Brouillon anglais de l'éditeur, à partir de `translations.en` renvoyé par l'API. */
export function englishDraftOf(page: Pick<AdminPage, 'translations'>): EnglishDraft {
  const english = page.translations.en;
  return {
    title: english?.title ?? null,
    seo: { title: english?.seo.title ?? null, description: english?.seo.description ?? null },
    sections: Object.fromEntries((english?.sections ?? []).map((section) => [section.id, section])),
  };
}

/** Section anglaise traduite correspondant à la section française (même `id` et même type), sinon `undefined`. */
export function englishFor(french: PageSection, draft: EnglishDraft): PageSection | undefined {
  const english = draft.sections[french.id];
  return english && english.type === french.type ? english : undefined;
}

/**
 * Section affichée dans l'onglet anglais : structure française et textes anglais saisis ; une section sans
 * traduction est pré-remplie avec les textes français (à traduire).
 */
export function englishView(french: PageSection, draft: EnglishDraft): PageSection {
  const english = englishFor(french, draft);
  return english ? (alignToFrench(french, english) as PageSection) : french;
}

/** Saisie d'un texte anglais : la section devient traduite (pré-remplie depuis le français si besoin). */
export function editEnglish(
  draft: EnglishDraft,
  french: PageSection,
  path: string,
  value: string,
): EnglishDraft {
  const section = setAt(englishView(french, draft), path, value);
  return { ...draft, sections: { ...draft.sections, [french.id]: section } };
}

/**
 * `translations.en` envoyé avec le brouillon : sections françaises traduites, dans l'ordre du français, recomposées
 * sur la section française actuelle (mêmes `id`, `type` et champs non textuels) ; les sections jamais traduites ne
 * sont pas envoyées (le site affiche le français). Titre et SEO (`title`, `description`) anglais.
 *
 * `reviewed` : sections « marquées comme revues » (`reviewedSectionIds`) — l'API leur donne l'empreinte des textes
 * français actuels sans que leurs textes anglais changent ; elles sont toujours envoyées.
 */
export function buildEnglishInput(
  french: PageSection[],
  draft: EnglishDraft,
  frenchSeo: PageDraftInput['seo'],
  reviewed: readonly string[] = [],
): PageTranslationInput {
  const blank = (value: string | null) => (value?.trim() ? value : null);
  const input: PageTranslationInput = {
    title: blank(draft.title),
    seo: {
      noindex: frenchSeo?.noindex ?? false,
      title: blank(draft.seo.title),
      description: blank(draft.seo.description),
    },
    sections: french.flatMap((section) => {
      const english = englishFor(section, draft) ?? (reviewed.includes(section.id) ? section : undefined);
      return english ? [alignToFrench(section, english) as PageSection] : [];
    }),
  };
  return reviewed.length > 0 ? { ...input, reviewedSectionIds: [...reviewed] } : input;
}

/** Envoi sans les sections marquées revues : ce qui reste du brouillon une fois l'empreinte mise à jour. */
export function withoutReview(input: PageDraftInput): PageDraftInput {
  const english = input.translations?.en;
  if (english?.reviewedSectionIds === undefined) return input;
  const rest = { ...english };
  delete rest.reviewedSectionIds;
  return { ...input, translations: { ...input.translations, en: rest } };
}

// ───────────────────────────── Erreurs ─────────────────────────────

/** Préfixe des erreurs de l'onglet anglais dans le contexte des erreurs (`en.sections.3.title`, `en.title`). */
export const EN_PREFIX = 'en';

/**
 * Erreurs d'une réponse 422 réparties entre les deux onglets : `translations.en.sections.N.champ` (N = rang dans
 * les sections anglaises envoyées) devient `en.sections.<rang de la section française>.champ` ;
 * `translations.en.reviewedSectionIds.N` devient `en.sections.<rang>.reviewed` (carte de la section marquée revue) ;
 * `translations.en.title` et `translations.en.seo.*` deviennent `en.title` et `en.seo.*`.
 */
export function splitDraftErrors(
  errors: FieldErrors,
  input: PageDraftInput,
): { french: FieldErrors; english: FieldErrors } {
  const french: FieldErrors = {};
  const english: FieldErrors = {};
  const sent = input.translations?.en?.sections ?? [];
  const reviewed = input.translations?.en?.reviewedSectionIds ?? [];
  for (const [path, message] of Object.entries(errors)) {
    if (!path.startsWith('translations.en')) {
      french[path] = message;
      continue;
    }
    const review = /^translations\.en\.reviewedSectionIds\.(\d+)$/.exec(path);
    if (review) {
      const id = reviewed[Number(review[1])];
      const index = input.sections.findIndex((section) => section.id === id);
      english[index === -1 ? EN_PREFIX : `${EN_PREFIX}.sections.${index}.reviewed`] = message;
      continue;
    }
    const match = /^translations\.en\.sections\.(\d+)(?:\.(.*))?$/.exec(path);
    if (match) {
      const id = sent[Number(match[1])]?.id;
      const index = input.sections.findIndex((section) => section.id === id);
      const rest = match[2];
      // `id` / `type` : erreur de la section elle-même (correspondance avec le français).
      const field = rest === undefined || rest === 'id' || rest === 'type' ? '' : `.${rest}`;
      english[index === -1 ? EN_PREFIX : `${EN_PREFIX}.sections.${index}${field}`] = message;
    } else {
      const rest = path.slice('translations.en'.length);
      english[`${EN_PREFIX}${rest}`] = message;
    }
  }
  return { french, english };
}

/** Index des sections de l'onglet anglais concernées par des erreurs (`en.sections.3.title` → 3). */
export function englishSectionsWithErrors(errors: FieldErrors): number[] {
  const indexes = new Set<number>();
  for (const path of Object.keys(errors)) {
    const match = /^en\.sections\.(\d+)/.exec(path);
    if (match) indexes.add(Number(match[1]));
  }
  return [...indexes].sort((a, b) => a - b);
}

/** Erreurs de l'onglet anglais hors sections (titre, SEO, envoi refusé). */
export const englishPageErrors = (errors: FieldErrors) =>
  Object.entries(errors).filter(([path]) => path === EN_PREFIX || /^en\.(title|seo)/.test(path));

// ───────────────────────────── État de la traduction ─────────────────────────────

export type SectionTranslationState = 'missing' | 'outdated' | null;

export type LocalTranslationStatus = PageTranslationStatus;

/**
 * État de la traduction pendant l'édition : sections à traduire d'après le brouillon local (une section saisie en
 * anglais n'est plus « à traduire », une section ajoutée en français l'est), sections à revoir d'après l'API sauf
 * celles retouchées en anglais depuis le chargement (l'API les remet à jour à l'enregistrement).
 */
export function localTranslationStatus(
  french: PageSection[],
  draft: EnglishDraft,
  server: PageTranslationStatus,
  touched: ReadonlySet<string> = new Set(),
): LocalTranslationStatus {
  const withTexts = french.filter(hasTexts);
  const missingSectionIds = withTexts
    .filter((section) => !englishFor(section, draft))
    .map((section) => section.id);
  const outdatedSectionIds = withTexts
    .filter(
      (section) =>
        englishFor(section, draft) &&
        server.outdatedSectionIds.includes(section.id) &&
        !touched.has(section.id),
    )
    .map((section) => section.id);
  const state =
    missingSectionIds.length > 0 ? 'MISSING' : outdatedSectionIds.length > 0 ? 'OUTDATED' : 'UP_TO_DATE';
  return { state, missingSectionIds, outdatedSectionIds };
}

export function sectionTranslationState(id: string, status: PageTranslationStatus): SectionTranslationState {
  if (status.missingSectionIds.includes(id)) return 'missing';
  if (status.outdatedSectionIds.includes(id)) return 'outdated';
  return null;
}

/** Badge de l'onglet « English » : « À traduire », « À revoir », ou rien si la version anglaise est à jour. */
export function translationBadge(status: Pick<PageTranslationStatus, 'state'>): string | null {
  if (status.state === 'MISSING') return 'À traduire';
  if (status.state === 'OUTDATED') return 'À revoir';
  return null;
}

const count = (value: number, noun: string) => `${value}\u00A0${noun}${value > 1 ? 's' : ''}`;

/** Avertissement avant publication si la version anglaise n'est pas à jour ; `null` sinon. */
export function publishWarning(status: PageTranslationStatus): string | null {
  if (status.state === 'UP_TO_DATE') return null;
  const parts = [
    status.missingSectionIds.length > 0 && `${count(status.missingSectionIds.length, 'section')} à traduire`,
    status.outdatedSectionIds.length > 0 && `${count(status.outdatedSectionIds.length, 'section')} à revoir`,
  ].filter(Boolean);
  const detail = parts.length > 0 ? `${parts.join(', ')}` : 'aucune section traduite';
  return `La version anglaise n’est pas à jour\u00A0: ${detail}. Publier quand même\u00A0?`;
}

// ───────────────────────────── Aperçu ─────────────────────────────

/**
 * Aperçu du brouillon anglais : même jeton, adresse anglaise de la page (`/qui-sommes-nous?preview=…` →
 * `/en/about-us?preview=…`) ; le site y lit la page avec `lang=en`.
 */
export function englishPreviewUrl(url: string): string {
  const parsed = new URL(url);
  const { internal } = parseSitePath(parsed.pathname);
  parsed.pathname = localizeHref(internal, 'en');
  return parsed.toString();
}
