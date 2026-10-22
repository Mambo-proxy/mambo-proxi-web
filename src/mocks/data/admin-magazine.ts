import type { AdminMagazineArticle, MediaImage } from '@/lib/api/schema';
import { daysAgo } from '../admin-utils';

/** Photo du site servie comme média (`public/photos/`). */
function photo(name: string, width: number, height: number, alt = ''): MediaImage {
  return { id: `photo-${name}`, url: `/photos/${name}.png`, width, height, alt, variants: [] };
}

export const MAGAZINE_PHOTOS = {
  hero: photo(
    'magazine-hero',
    1280,
    960,
    'Une lectrice feuillette le magazine Mambo Proxi sur une terrasse, devant un petit-déjeuner de fruits.',
  ),
  courses: photo('prox-courses', 1536, 1024, 'Panier de courses livré à domicile.'),
  immo: photo('immo-hero', 1280, 960, 'Immeuble résidentiel à Douala.'),
  culture: photo('culture-hero', 1280, 960, 'Fête de quartier en musique.'),
  bienManger: photo('magazine-bien-manger', 420, 285, 'Plats camerounais colorés sur une table.'),
  massage: photo('offre-massage', 435, 470, 'Massage relaxant à domicile.'),
  terrain: photo('immo-achat', 1536, 1024, 'Visite d’un terrain avec un conseiller.'),
  entraide: photo('prox-repas', 1280, 960, 'Repas partagé en famille.'),
  kribi: photo('culture-decouverte', 1536, 1024, 'Plage de Kribi.'),
  logementSain: photo('formule-maison', 1280, 960, 'Salon lumineux et rangé.'),
  marche: photo('prox-courses', 1536, 1024, 'Étal de produits frais.'),
  repas: photo('prox-repas', 1280, 960, 'Repas équilibré.'),
  location: photo('immo-location', 1536, 1024, 'Appartement à louer.'),
  meuble: photo('immo-meuble', 1536, 1024, 'Appartement meublé.'),
  artisans: photo('culture-artisans', 1536, 1024, 'Artisans au travail.'),
} as const;

export type MagazineEditionRecord = {
  id: string;
  number: number | null;
  title: string;
  titleEn: string | null;
  subtitle: string | null;
  subtitleEn: string | null;
  themes: string | null;
  cover: MediaImage | null;
  editorial: string | null;
  editorialEn: string | null;
  signature: string | null;
  signatureEn: string | null;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  publishAt: string | null;
  readers: number | null;
  newsletterScheduledAt: string | null;
  newsletterSentAt: string | null;
  updatedAt: string;
};

export type MagazineArticleRecord = Omit<AdminMagazineArticle, 'languages' | 'edition'> & {
  editionId: string | null;
  sortOrder: number;
};

const EDITO_N1 = [
  'Chers lecteurs, chères lectrices,',
  'Ce premier numéro de Mambo Proxi est bien plus qu’un magazine : c’est une histoire de vie que je partage avec vous.',
  'Pendant 26 ans, mon chemin a été marqué par de nombreux apprentissages, des défis relevés et des expériences qui m’ont façonnée…',
];

const EDITO_N1_EN = [
  'Dear readers,',
  'This first issue of Mambo Proxi is much more than a magazine: it is a life story that I am sharing with you.',
  'For 26 years, my path has been shaped by many lessons, challenges overcome and experiences that made me who I am…',
];

const html = (paragraphs: string[]) => paragraphs.map((text) => `<p>${text}</p>`).join('');

/** Éditions de la maquette « BO — Magazine » (`267:1511`). */
export const magazineEditions: MagazineEditionRecord[] = [
  {
    id: 'mag_n1',
    number: 1,
    title: 'Ensemble vers un bien-être global',
    titleEn: 'Together towards overall well-being',
    subtitle: 'Édition spéciale',
    subtitleEn: 'Special issue',
    themes: 'Bien-être global',
    cover: MAGAZINE_PHOTOS.hero,
    editorial: html(EDITO_N1),
    editorialEn: html(EDITO_N1_EN),
    signature: 'Mireille Bell, fondatrice de Mambo Proxi',
    signatureEn: 'Mireille Bell, founder of Mambo Proxi',
    status: 'PUBLISHED',
    publishAt: '2026-10-02T08:00:00.000Z',
    readers: 1248,
    newsletterScheduledAt: '2026-10-06T08:00:00.000Z',
    newsletterSentAt: null,
    updatedAt: daysAgo(3),
  },
  {
    id: 'mag_n2',
    number: 2,
    title: 'Bien manger au quotidien',
    titleEn: 'Eating well every day',
    subtitle: null,
    subtitleEn: null,
    themes: 'Santé et nutrition',
    cover: MAGAZINE_PHOTOS.courses,
    editorial: html([
      'Chers lecteurs, chères lectrices,',
      'Ce deuxième numéro est consacré à notre assiette.',
    ]),
    editorialEn: html(['Dear readers,', 'This second issue is all about what is on our plates.']),
    signature: 'Mireille Bell, fondatrice de Mambo Proxi',
    signatureEn: 'Mireille Bell, founder of Mambo Proxi',
    status: 'SCHEDULED',
    publishAt: '2026-11-06T08:00:00.000Z',
    readers: null,
    newsletterScheduledAt: null,
    newsletterSentAt: null,
    updatedAt: daysAgo(5),
  },
  {
    id: 'mag_n3',
    number: 3,
    title: 'Se loger à Douala',
    titleEn: null,
    subtitle: null,
    subtitleEn: null,
    themes: 'Immobilier',
    cover: MAGAZINE_PHOTOS.immo,
    editorial: null,
    editorialEn: null,
    signature: 'Mireille Bell, fondatrice de Mambo Proxi',
    signatureEn: null,
    status: 'DRAFT',
    publishAt: null,
    readers: null,
    newsletterScheduledAt: null,
    newsletterSentAt: null,
    updatedAt: daysAgo(1, 2),
  },
  {
    id: 'mag_hs1',
    number: null,
    title: 'Solidarité et culture',
    titleEn: null,
    subtitle: null,
    subtitleEn: null,
    themes: 'Solidarité',
    cover: MAGAZINE_PHOTOS.culture,
    editorial: null,
    editorialEn: null,
    signature: null,
    signatureEn: null,
    status: 'DRAFT',
    publishAt: null,
    readers: null,
    newsletterScheduledAt: null,
    newsletterSentAt: null,
    updatedAt: daysAgo(22),
  },
];

type ArticleSeed = [
  title: string,
  titleEn: string | null,
  theme: string,
  themeEn: string | null,
  image: MediaImage,
];

const SEEDS: Record<string, ArticleSeed[]> = {
  // Maquette « Éditer une édition » (`269:2065`) : 4 articles sur 6 traduits.
  mag_n1: [
    [
      'Bien manger au quotidien sans se ruiner',
      'Eating well every day without breaking the bank',
      'Santé et nutrition',
      'Health and nutrition',
      MAGAZINE_PHOTOS.bienManger,
    ],
    [
      'Prendre soin de soi : rituels bien-être',
      'Taking care of yourself: well-being rituals',
      'Beauté et bien-être',
      'Beauty and well-being',
      MAGAZINE_PHOTOS.massage,
    ],
    [
      'Acheter un terrain à Douala : les étapes',
      'Buying land in Douala: the steps',
      'Immobilier',
      'Real estate',
      MAGAZINE_PHOTOS.terrain,
    ],
    [
      'L’entraide, une richesse camerounaise',
      'Mutual aid, a Cameroonian treasure',
      'Solidarité',
      'Solidarity',
      MAGAZINE_PHOTOS.entraide,
    ],
    ['Kribi, la nature à deux heures de Douala', null, 'Culture', null, MAGAZINE_PHOTOS.kribi],
    ['Un logement sain, une famille en forme', null, 'Bien-être', null, MAGAZINE_PHOTOS.logementSain],
  ],
  mag_n2: [
    [
      'Le marché, premier allié de la cuisine maison',
      'The market, home cooking’s best friend',
      'Santé et nutrition',
      'Health and nutrition',
      MAGAZINE_PHOTOS.marche,
    ],
    [
      'Cinq plats du terroir revisités',
      'Five local dishes, revisited',
      'Santé et nutrition',
      'Health and nutrition',
      MAGAZINE_PHOTOS.bienManger,
    ],
    [
      'Bien s’hydrater sous la chaleur',
      'Staying hydrated in the heat',
      'Santé et nutrition',
      'Health and nutrition',
      MAGAZINE_PHOTOS.repas,
    ],
    [
      'Repas des aînés : nos conseils',
      'Meals for older relatives: our advice',
      'Solidarité',
      'Solidarity',
      MAGAZINE_PHOTOS.entraide,
    ],
    [
      'Cuisiner pour toute la semaine',
      'Cooking for the whole week',
      'Santé et nutrition',
      'Health and nutrition',
      MAGAZINE_PHOTOS.courses,
    ],
  ],
  mag_n3: [
    ['Louer à Douala depuis l’étranger', null, 'Immobilier', null, MAGAZINE_PHOTOS.location],
    ['Meublé ou vide : bien choisir', null, 'Immobilier', null, MAGAZINE_PHOTOS.meuble],
    ['Bonapriso, Akwa, Makèpè : quel quartier ?', null, 'Immobilier', null, MAGAZINE_PHOTOS.immo],
    ['Faire suivre un chantier à distance', null, 'Immobilier', null, MAGAZINE_PHOTOS.terrain],
  ],
  mag_hs1: [
    ['Les tontines, une épargne solidaire', null, 'Solidarité', null, MAGAZINE_PHOTOS.entraide],
    ['Artisans de Douala : portraits', null, 'Culture', null, MAGAZINE_PHOTOS.artisans],
    ['Fêtes de quartier : le programme', null, 'Culture', null, MAGAZINE_PHOTOS.culture],
  ],
};

let articleSequence = 0;

export const magazineArticles: MagazineArticleRecord[] = Object.entries(SEEDS).flatMap(([editionId, seeds]) =>
  seeds.map(([title, titleEn, theme, themeEn, image], index) => ({
    id: `art_${++articleSequence}`,
    title,
    titleEn,
    theme,
    themeEn,
    excerpt: null,
    excerptEn: null,
    body: `<p>${title}.</p>`,
    bodyEn: titleEn ? `<p>${titleEn}.</p>` : null,
    image,
    editionId,
    sortOrder: index,
    updatedAt: daysAgo(10 + articleSequence),
  })),
);

/** Statistiques de la dernière campagne (`267:1916`). */
export const lastMagazineCampaign = {
  editionId: 'mag_n1',
  editionLabel: 'Édition n° 1',
  sent: 1248,
  openRate: 62,
  openRateDelta: 8,
  clicks: 318,
  newSubscribers: 56,
};

/** Inscrits confirmés par langue (`269:2144`). */
export const magazineSubscribers = { fr: 1012, en: 236 };
