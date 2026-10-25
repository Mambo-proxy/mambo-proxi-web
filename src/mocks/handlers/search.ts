import { http, HttpResponse } from 'msw';
import type {
  Page,
  SearchGroup,
  SearchResult,
  SearchResultType,
  SearchResults,
  TextRange,
} from '@/lib/api/schema';
import { getCategories, getServices, langOf, normalize, type Lang } from '../data/catalogue';
import { magazineArticles, magazineEditions } from '../data/admin-magazine';
import { pages, pagesEn } from '../data/pages';
import { problem } from '../problem';
import { jobs, jobsEn } from './jobs';
import { publicTrainings } from './trainings';

/** Ordre des groupes par défaut (contrat : services, rubriques, pages, articles, offres d'emploi, formations). */
export const SEARCH_TYPES: SearchResultType[] = ['service', 'category', 'page', 'article', 'job', 'training'];

const LABELS: Record<Lang, Record<SearchResultType, string>> = {
  fr: {
    service: 'Services',
    category: 'Rubriques',
    page: 'Pages',
    article: 'Magazine',
    job: "Offres d'emploi",
    training: 'Formations',
  },
  en: {
    service: 'Services',
    category: 'Categories',
    page: 'Pages',
    article: 'Magazine',
    job: 'Jobs',
    training: 'Training',
  },
};

const DEFAULT_LIMIT = 5;
const EXCERPT_MAX = 240;
/** Contexte conservé avant le premier passage trouvé quand l'extrait est coupé. */
const EXCERPT_LEAD = 60;

/** Contenu indexé : un résultat sans ses plages, et les textes où chercher (dans l'ordre de l'extrait). */
type SearchDocument = Omit<SearchResult, 'excerpt' | 'titleHighlights' | 'highlights'> & { fields: string[] };

/** Texte brut : balises HTML, marques d'accent (`==titre==`) et retours à la ligne retirés. */
function plain(value: string | null | undefined): string {
  return (value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replaceAll('==', '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Clé de comparaison d'un caractère : sans accent, en minuscules, apostrophes et ligatures unifiées. */
function foldChar(char: string): string {
  return normalize(char).replace(/[’‘]/g, "'").replace('œ', 'oe').replace('æ', 'ae');
}

/**
 * Texte « replié » (insensible à la casse et aux accents) et, pour chaque caractère replié, sa position dans le texte
 * d'origine : les plages trouvées dans le texte replié sont reportées sur le texte affiché (positions UTF-16).
 */
function fold(text: string): { value: string; origin: number[] } {
  let value = '';
  const origin: number[] = [];
  for (let index = 0; index < text.length; index += 1) {
    const folded = foldChar(text.charAt(index));
    value += folded;
    for (let k = 0; k < folded.length; k += 1) origin.push(index);
  }
  return { value, origin };
}

/** Mots cherchés : repliés, sans ponctuation, pluriel simple retiré (« chefs » trouve « chef »). */
export function searchTerms(query: string): string[] {
  const words = fold(query)
    .value.split(/[\s,;:!?.()"«»/]+/)
    .filter(Boolean);
  const meaningful = words.filter((word) => word.length >= 2);
  const stems = (meaningful.length > 0 ? meaningful : words).map((word) =>
    word.length > 3 && /[sx]$/.test(word) ? word.slice(0, -1) : word,
  );
  return [...new Set(stems)];
}

/** Plages de `text` correspondant aux mots cherchés, triées et fusionnées. */
export function highlightRanges(text: string, terms: string[]): TextRange[] {
  if (!text) return [];
  const { value, origin } = fold(text);
  const found: TextRange[] = [];
  for (const term of terms) {
    let from = value.indexOf(term);
    while (from !== -1) {
      found.push({ start: origin[from] ?? 0, end: (origin[from + term.length - 1] ?? 0) + 1 });
      from = value.indexOf(term, from + term.length);
    }
  }
  found.sort((a, b) => a.start - b.start || a.end - b.end);
  return found.reduce<TextRange[]>((merged, range) => {
    const last = merged.at(-1);
    if (last && range.start <= last.end) last.end = Math.max(last.end, range.end);
    else merged.push({ ...range });
    return merged;
  }, []);
}

/** Extrait d'au plus 240 caractères, commençant peu avant `at`, coupé entre deux mots (« … » de part et d'autre). */
function around(text: string, at: number): string {
  if (text.length <= EXCERPT_MAX) return text;
  let start = Math.max(0, at - EXCERPT_LEAD);
  if (start > 0) {
    const space = text.indexOf(' ', start);
    if (space !== -1 && space < at) start = space + 1;
  }
  const prefix = start > 0 ? '… ' : '';
  let end = Math.min(text.length, start + EXCERPT_MAX - prefix.length - 2);
  if (end < text.length) {
    const space = text.lastIndexOf(' ', end);
    if (space > start) end = space;
  }
  return `${prefix}${text.slice(start, end)}${end < text.length ? ' …' : ''}`;
}

/** Extrait centré sur le premier passage trouvé dans les textes du contenu (le premier texte à défaut). */
function excerptOf(fields: string[], terms: string[]): string {
  const texts = fields.map(plain).filter(Boolean);
  for (const text of texts) {
    const first = highlightRanges(text, terms)[0];
    if (first) return around(text, first.start);
  }
  return around(texts[0] ?? '', 0);
}

/** Pertinence : mots trouvés dans le titre (en tête de mot surtout), puis le contexte, puis les textes. */
function score(document: SearchDocument, terms: string[]): number {
  const title = fold(document.title).value;
  const context = fold(document.context ?? '').value;
  const body = fold(document.fields.map(plain).join(' ')).value;
  let total = 0;
  for (const term of terms) {
    if (!title.includes(term) && !context.includes(term) && !body.includes(term)) return 0;
    if (title.startsWith(term) || title.includes(` ${term}`)) total += 12;
    else if (title.includes(term)) total += 8;
    if (context.includes(term)) total += 3;
    if (body.includes(term)) total += 1;
  }
  return total;
}

// ─── Contenus indexés ─────────────────────────────────────────────────────────

/** Clés de section ignorées : réglages, adresses, visuels et liens (leurs libellés ne décrivent pas la page). */
const SKIPPED_KEYS = new Set([
  'id',
  'type',
  'enabled',
  'anchor',
  'tone',
  'variant',
  'layout',
  'columns',
  'source',
  'href',
  'url',
  'external',
  'icon',
  'illustration',
  'image',
  'visual',
  'visualMobile',
  'alt',
  'anchors',
  'cta',
  'primaryCta',
  'secondaryCta',
  'link',
  'showWhatsapp',
  'reverse',
  'categorySlug',
  'key',
  'prefix',
  'suffix',
  'tint',
  'updatedLabel',
]);

function collectText(value: unknown, out: string[]) {
  if (typeof value === 'string') {
    const text = plain(value);
    if (text) out.push(text);
  } else if (Array.isArray(value)) {
    for (const item of value) collectText(item, out);
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) if (!SKIPPED_KEYS.has(key)) collectText(item, out);
  }
}

/** Pages à formulaire (textes de l'interface, pas de page éditoriale dans les données simulées). */
const FORM_PAGES: Record<Lang, { key: string; title: string; text: string }[]> = {
  fr: [
    {
      key: 'contact',
      title: 'Contact',
      text: 'Par téléphone, WhatsApp, e-mail ou lors d’un rendez-vous à l’agence de Douala : choisissez ce qui vous convient, nous vous répondons rapidement.',
    },
    {
      key: 'devis',
      title: 'Devis gratuit',
      text: 'Votre devis gratuit en 3 minutes : sans engagement, réponse personnalisée sous 24 h, par e-mail ou WhatsApp.',
    },
    {
      key: 'inscription',
      title: 'S’inscrire',
      text: 'Enregistrez vos informations une fois pour des demandes plus rapides, ou rejoignez notre réseau de partenaires à Douala.',
    },
  ],
  en: [
    {
      key: 'contact',
      title: 'Contact',
      text: 'By phone, WhatsApp, email or at an appointment at our Douala agency: choose what suits you, we reply quickly.',
    },
    {
      key: 'devis',
      title: 'Free quote',
      text: 'Your free quote in 3 minutes: no commitment, a personalised reply within 24 hours by email or WhatsApp.',
    },
    {
      key: 'inscription',
      title: 'Sign up',
      text: 'Save your details once for faster requests, or join our network of partners in Douala.',
    },
  ],
};

const idOf = (prefix: string, key: string) => `${prefix}_${key.replaceAll('-', '_')}`;

function serviceDocuments(lang: Lang): SearchDocument[] {
  // Les formules n'ont pas de fiche (elles renvoient à leur rubrique) : seuls les services sont proposés.
  return getServices(lang)
    .filter((service) => service.kind !== 'formula')
    .map((service): SearchDocument => ({
      type: 'service',
      id: service.id,
      key: service.slug,
      title: service.name,
      context: service.category.name,
      href: service.href,
      visual: service.visual,
      icon: null,
      fields: [service.summary],
    }));
}

function categoryDocuments(lang: Lang): SearchDocument[] {
  return getCategories(lang).map((category): SearchDocument => {
    const count = category.serviceCount;
    const unit = count === 1 ? 'service' : 'services';
    return {
      type: 'category',
      id: category.id,
      key: category.slug,
      title: category.name,
      context: `${lang === 'en' ? 'Category' : 'Rubrique'} · ${count} ${unit}`,
      href: category.href,
      visual: category.visual,
      icon: category.icon,
      fields: [
        category.description,
        category.tagline,
        (category.homeCard?.chips ?? []).join(', '),
        (category.services ?? []).map((service) => service.name).join(', '),
      ],
    };
  });
}

function pageDocuments(lang: Lang): SearchDocument[] {
  const editorial = Object.values(pages)
    .filter((page): page is Page => !!page)
    .map((french): SearchDocument => {
      // Page non traduite : cherchée et renvoyée en français, comme le fait l'API.
      const page = (lang === 'en' ? pagesEn[french.key] : undefined) ?? french;
      const texts: string[] = [];
      collectText(page.sections, texts);
      return {
        type: 'page',
        id: idOf('page', page.key),
        key: page.key,
        title: plain(page.title),
        context: null,
        href: `/${page.key}`,
        visual: null,
        icon: null,
        fields: [page.seo?.description ?? '', ...texts],
      };
    });
  const forms = FORM_PAGES[lang].map((page): SearchDocument => ({
    type: 'page',
    id: idOf('page', page.key),
    key: page.key,
    title: page.title,
    context: null,
    href: `/${page.key}`,
    visual: null,
    icon: null,
    fields: [page.text],
  }));
  return [...editorial, ...forms];
}

function articleDocuments(lang: Lang): SearchDocument[] {
  const published = new Set(
    magazineEditions.filter((edition) => edition.status === 'PUBLISHED').map((edition) => edition.id),
  );
  return magazineArticles
    .filter((article) => article.editionId && published.has(article.editionId))
    .map((article): SearchDocument => {
      // Article non traduit : renvoyé en français.
      const english = lang === 'en' && !!article.titleEn;
      return {
        type: 'article',
        id: article.id,
        key: null,
        title: english ? (article.titleEn ?? article.title) : article.title,
        context: (lang === 'en' ? article.themeEn : null) ?? article.theme,
        href: `/magazine#article-${article.id}`,
        visual: article.image ? { illustration: 'marche', image: article.image, alt: '' } : null,
        icon: null,
        fields: english
          ? [article.excerptEn ?? '', article.bodyEn ?? '']
          : [article.excerpt ?? '', article.body ?? ''],
      };
    });
}

function jobDocuments(lang: Lang): SearchDocument[] {
  return (lang === 'en' ? jobsEn : jobs).map((job): SearchDocument => ({
    type: 'job',
    id: job.id,
    key: job.slug,
    title: job.title,
    context: `${job.contractType} · ${job.city}`,
    href: `/recrutement/${job.slug}`,
    visual: null,
    icon: null,
    fields: [job.summary, job.description ?? '', ...job.missions, ...job.profile],
  }));
}

function trainingDocuments(lang: Lang): SearchDocument[] {
  return publicTrainings(lang).map((training): SearchDocument => ({
    type: 'training',
    id: training.id,
    key: training.slug,
    title: training.title,
    context: `${training.categoryLabel} · ${training.duration}`,
    href: `/formation#${training.slug}`,
    visual: null,
    icon: training.icon,
    fields: [
      [training.audienceLabel, training.format, training.location].filter(Boolean).join(' · '),
      training.description ?? '',
    ],
  }));
}

const DOCUMENTS: Record<SearchResultType, (lang: Lang) => SearchDocument[]> = {
  service: serviceDocuments,
  category: categoryDocuments,
  page: pageDocuments,
  article: articleDocuments,
  job: jobDocuments,
  training: trainingDocuments,
};

/** Recherche dans les données simulées : groupes non vides dans l'ordre de `types`, `limit` résultats par groupe. */
export function searchSite(
  query: string,
  lang: Lang,
  types: SearchResultType[],
  limit: number,
): SearchResults {
  const terms = searchTerms(query);
  const groups: SearchGroup[] = [];
  for (const type of types) {
    const matches = DOCUMENTS[type](lang)
      .map((document, index) => ({ document, index, score: score(document, terms) }))
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index);
    if (matches.length === 0) continue;
    groups.push({
      type,
      label: LABELS[lang][type],
      total: matches.length,
      items: matches.slice(0, limit).map(({ document: { fields, ...result } }) => {
        const excerpt = excerptOf(fields, terms);
        return {
          ...result,
          excerpt,
          titleHighlights: highlightRanges(result.title, terms),
          highlights: highlightRanges(excerpt, terms),
        };
      }),
    });
  }
  return { query, lang, total: groups.reduce((sum, group) => sum + group.total, 0), groups };
}

/**
 * `GET /v1/search` : recherche réelle dans les données de démonstration (catalogue, pages, Magazine, offres,
 * formations), en français ou en anglais (`?lang=en`), insensible à la casse et aux accents ; 400 si le texte fait
 * moins de 2 caractères (ou plus de 120), si un type est inconnu ou si la limite sort de 1 à 20.
 */
export const searchHandlers = [
  http.get('*/v1/search', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const query = (params.get('q') ?? '').trim().replace(/\s+/g, ' ');
    if (query.length < 2) return problem(400, 'Saisissez au moins 2 caractères pour lancer la recherche.');
    if (query.length > 120) return problem(400, 'La recherche ne doit pas dépasser 120 caractères.');

    // `types=service,article` (contrat) ou `types=service&types=article` : les deux formes sont acceptées.
    const requested = params
      .getAll('types')
      .flatMap((value) => value.split(','))
      .map((value) => value.trim())
      .filter(Boolean);
    const unknown = requested.find((value) => !SEARCH_TYPES.includes(value as SearchResultType));
    if (unknown) return problem(400, `Type de résultat inconnu : ${unknown}.`);
    const types = requested.length > 0 ? [...new Set(requested as SearchResultType[])] : SEARCH_TYPES;

    const rawLimit = params.get('limit');
    const limit = rawLimit === null || rawLimit === '' ? DEFAULT_LIMIT : Number(rawLimit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 20)
      return problem(400, 'Le nombre de résultats par type doit être compris entre 1 et 20.');

    return HttpResponse.json(searchSite(query, langOf(request), types, limit));
  }),
];
