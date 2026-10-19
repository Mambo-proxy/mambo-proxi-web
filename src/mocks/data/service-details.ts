import type { ServiceDetail, ServiceSummary } from '@/lib/api/schema';
import catalogue from './catalogue-services.json';
import { getServices, type Lang } from './catalogue';
import operations from './contract-examples.json';

/**
 * Fiches service simulées, en français et en anglais (`?lang=en`). « Chef privé » et « Entretien du logement »
 * reprennent les exemples du contrat (maquettes `62:4161` et `253:25267`) ; les autres fiches n'ont pas de maquette :
 * leur contenu est provisoire (`toComplete`), à remplacer par la cliente dans le back-office. Il suit la structure
 * du cahier §5.5 pour que chaque page soit complète.
 */
const examples = operations.find((operation) => operation.operationId === 'getService')?.examples as Record<
  string,
  ServiceDetail
>;

const detailed: Record<string, Record<Lang, ServiceDetail>> = {
  'chef-prive': { fr: examples.chefPrive!, en: examples.chefPriveEn! },
  'entretien-du-logement': { fr: examples.entretienDuLogement!, en: examples.entretienDuLogementEn! },
};

/**
 * Services des maquettes absents des listes (la rubrique « Services à domicile » ne présente que ses formules) :
 * leur fiche existe, reliée depuis les services liés.
 */
const unlisted: Record<Lang, ServiceSummary[]> = {
  fr: [
    {
      id: 'svc_nettoyage_automobile',
      slug: 'nettoyage-automobile',
      name: 'Nettoyage automobile',
      shortName: null,
      summary: 'Votre véhicule nettoyé à domicile.',
      icon: 'Car',
      visual: examples.entretienDuLogement!.related[1]!.visual,
      category: { slug: 'services-a-domicile', name: 'Services à domicile' },
      href: '/services/services-a-domicile/nettoyage-automobile',
      featuredOnHome: false,
      kind: 'service',
    },
  ],
  en: [
    {
      id: 'svc_nettoyage_automobile',
      slug: 'nettoyage-automobile',
      name: 'Car cleaning',
      shortName: null,
      summary: 'Your vehicle cleaned at home.',
      icon: 'Car',
      visual: examples.entretienDuLogement!.related[1]!.visual,
      category: { slug: 'services-a-domicile', name: 'Home services' },
      href: '/services/services-a-domicile/nettoyage-automobile',
      featuredOnHome: false,
      kind: 'service',
    },
  ],
};

type DetailFields = Omit<ServiceDetail, keyof ServiceSummary>;
type Localized<T> = Record<Lang, T>;

const CITIES: Record<string, string[]> = {
  'services-a-domicile': ['Douala'],
  experience: ['Douala', 'Yaoundé', 'Kribi'],
  immobilier: ['Douala', 'Yaoundé'],
  'services-de-proximite': ['Douala', 'Yaoundé'],
  'culture-evenementiel': ['Douala', 'Yaoundé', 'Kribi'],
};

const AUDIENCES: Localized<Record<string, string[]>> = {
  fr: {
    'services-a-domicile': [
      'Aux actifs et aux familles qui manquent de temps',
      'Aux proches de personnes âgées ou isolées',
      'Aux propriétaires de locations saisonnières',
      'Aux familles en séjour à Douala',
    ],
    experience: [
      'Aux particuliers qui veulent se faire plaisir',
      'Aux familles de la diaspora en séjour au pays',
      'Aux organisateurs d’événements privés',
      'Aux entreprises qui reçoivent clients ou équipes',
    ],
    immobilier: [
      'Aux familles de la diaspora qui préparent leur retour',
      'Aux étudiants et jeunes actifs',
      'Aux expatriés et professionnels en mission',
      'Aux propriétaires qui vivent loin de leur bien',
    ],
    'services-de-proximite': [
      'Aux personnes âgées et à leurs proches',
      'Aux familles de la diaspora qui veillent sur un parent',
      'Aux personnes en convalescence ou à mobilité réduite',
      'Aux actifs qui manquent de temps',
    ],
    'culture-evenementiel': [
      'Aux visiteurs qui découvrent le Cameroun',
      'Aux familles de la diaspora en séjour au pays',
      'Aux groupes, associations et comités d’entreprise',
      'Aux nouveaux arrivants qui veulent s’intégrer',
    ],
  },
  en: {
    'services-a-domicile': [
      'Busy professionals and families short on time',
      'Relatives of elderly or isolated people',
      'Owners of holiday lets',
      'Families staying in Douala',
    ],
    experience: [
      'Individuals who want to treat themselves',
      'Diaspora families visiting home',
      'Organisers of private events',
      'Companies hosting clients or teams',
    ],
    immobilier: [
      'Diaspora families preparing their return',
      'Students and young professionals',
      'Expatriates and professionals on assignment',
      'Owners who live far from their property',
    ],
    'services-de-proximite': [
      'Elderly people and their relatives',
      'Diaspora families looking after a parent',
      'People recovering or with reduced mobility',
      'Busy professionals short on time',
    ],
    'culture-evenementiel': [
      'Visitors discovering Cameroon',
      'Diaspora families visiting home',
      'Groups, associations and works councils',
      'Newcomers who want to settle in',
    ],
  },
};

const STEPS: Localized<DetailFields['steps']> = {
  fr: [
    {
      title: 'Échange sur votre besoin',
      text: 'Par formulaire, WhatsApp ou rendez-vous, depuis la France ou le Cameroun.',
    },
    { title: 'Proposition et devis', text: 'Une proposition claire et détaillée, gratuite, sous 24 h.' },
    {
      title: 'Organisation sur place',
      text: 'Nous sélectionnons le bon prestataire et préparons chaque détail.',
    },
    { title: 'Suivi de la prestation', text: 'Un interlocuteur unique vous informe à chaque étape.' },
    { title: 'Votre avis', text: 'Un court questionnaire pour nous aider à progresser.' },
  ],
  en: [
    {
      title: 'A chat about your needs',
      text: 'By form, WhatsApp or appointment, from France or Cameroon.',
    },
    { title: 'Proposal and quote', text: 'A clear, detailed proposal, free, within 24 hours.' },
    { title: 'Organisation on site', text: 'We select the right provider and prepare every detail.' },
    { title: 'Service follow-up', text: 'A single point of contact keeps you informed at every step.' },
    { title: 'Your feedback', text: 'A short questionnaire to help us improve.' },
  ],
};

const ADVANTAGES: Localized<DetailFields['advantages']> = {
  fr: [
    {
      icon: 'ShieldCheck',
      title: 'Des prestataires vérifiés',
      text: 'Sélectionnés, suivis et évalués après chaque prestation.',
    },
    {
      icon: 'Sparkles',
      title: 'Une prestation sur mesure',
      text: 'Pensée pour votre besoin et votre budget.',
    },
    { icon: 'Clock', title: 'Du temps pour vous', text: 'Nous nous occupons de l’organisation et du suivi.' },
    { icon: 'Users', title: 'Un interlocuteur unique', text: 'Joignable par téléphone, WhatsApp et e-mail.' },
  ],
  en: [
    {
      icon: 'ShieldCheck',
      title: 'Vetted providers',
      text: 'Selected, followed up and rated after every service.',
    },
    { icon: 'Sparkles', title: 'A tailor-made service', text: 'Designed for your needs and your budget.' },
    { icon: 'Clock', title: 'Time for yourself', text: 'We take care of the organisation and follow-up.' },
    { icon: 'Users', title: 'A single point of contact', text: 'Reachable by phone, WhatsApp and email.' },
  ],
};

function listCities(cities: string[], lang: Lang): string {
  return cities.join(', ').replace(/, ([^,]*)$/, lang === 'en' ? ' and $1' : ' et $1');
}

function faq(name: string, cities: string[], lang: Lang): DetailFields['faq'] {
  if (lang === 'en')
    return [
      {
        question: `How much does “${name}” cost?`,
        answer:
          'Every request is unique: the price depends on your needs, the duration and the place. It is given to you in a free quote.',
      },
      {
        question: 'Which cities do you cover?',
        answer: `${listCities(cities, lang)}. For another city, write to us: we look at every request.`,
      },
      {
        question: 'Can I book for a relative?',
        answer:
          'Yes. You make the request online or on WhatsApp; we organise everything on site and keep you informed at every step.',
      },
    ];
  return [
    {
      question: `Combien coûte le service « ${name} » ?`,
      answer:
        'Chaque demande est unique : le tarif dépend de votre besoin, de la durée et du lieu. Il vous est communiqué sur devis, gratuitement.',
    },
    {
      question: 'Dans quelles villes intervenez-vous ?',
      answer: `À ${listCities(cities, lang)}. Pour une autre ville, écrivez-nous : nous étudions chaque demande.`,
    },
    {
      question: 'Puis-je réserver pour un proche ?',
      answer:
        'Oui. Vous faites votre demande en ligne ou sur WhatsApp ; nous organisons tout sur place et vous tenons informé à chaque étape.',
    },
  ];
}

/** Trois services liés : ceux de la même rubrique d'abord (hors formules), complétés par les autres rubriques. */
function relatedTo(service: ServiceSummary, all: ServiceSummary[]): ServiceSummary[] {
  const others = all.filter((item) => item.slug !== service.slug && item.kind !== 'formula');
  return [
    ...others.filter((item) => item.category.slug === service.category.slug),
    ...others.filter((item) => item.category.slug !== service.category.slug),
  ].slice(0, 3);
}

function provisional(service: ServiceSummary, all: ServiceSummary[], lang: Lang): DetailFields {
  const category = catalogue.rubriques.find((item) => item.slug === service.category.slug);
  const cities = CITIES[service.category.slug] ?? ['Douala'];
  const categoryVisual = {
    illustration: (category?.illustration ??
      service.visual.illustration) as ServiceSummary['visual']['illustration'],
    image: null,
    alt: '',
  };
  const en = lang === 'en';
  return {
    tagline: en
      ? `${service.summary} You entrust us with your request, we take care of the rest.`
      : `${service.summary} Vous nous confiez votre demande, nous nous occupons du reste.`,
    cities,
    offers: null,
    audiences: AUDIENCES[lang][service.category.slug] ?? [],
    steps: STEPS[lang],
    advantages: ADVANTAGES[lang],
    faq: faq(service.name, cities, lang),
    quoteBullets: en
      ? ['Free and with no obligation', 'A tailor-made service', 'One point of contact from start to finish']
      : [
          'Gratuit et sans engagement',
          'Une prestation sur mesure',
          'Un seul interlocuteur du début à la fin',
        ],
    gallery: [service.visual, categoryVisual, service.visual],
    showWhatsapp: true,
    related: relatedTo(service, all),
    reviews: [],
    reviewsTitle: null,
    relatedTitle: en ? 'Going further' : 'Pour aller plus loin',
    cta: en
      ? {
          title: 'A project, a question?\nLet’s talk.',
          text: `Your “${service.name}” quote, free and with no obligation, within 24 hours.`,
        }
      : {
          title: 'Un projet, une question ?\nParlons-en.',
          text: `Votre devis « ${service.name} », gratuit et sans engagement, sous 24 h.`,
        },
    reviewSummary: null,
    seo: {
      title: en ? `${service.name} in Cameroon` : `${service.name} au Cameroun`,
      description: service.summary,
      ogImageUrl: null,
      noindex: false,
    },
    toComplete: true,
    updatedAt: '2026-10-05T08:00:00.000Z',
  };
}

function buildDetails(lang: Lang): Record<string, ServiceDetail> {
  const all = [...getServices(lang), ...unlisted[lang]];
  const fiches = all.filter((service) => service.kind !== 'formula');
  return {
    ...Object.fromEntries(
      fiches.map((service) => [
        service.slug,
        detailed[service.slug]?.[lang] ?? { ...service, ...provisional(service, all, lang) },
      ]),
    ),
    ...Object.fromEntries(Object.entries(detailed).map(([slug, details]) => [slug, details[lang]])),
  };
}

/** Fiches par langue ; une formule n'a pas de fiche (sa carte mène à la prise de rendez-vous). */
export const serviceDetails: Record<Lang, Record<string, ServiceDetail>> = {
  fr: buildDetails('fr'),
  en: buildDetails('en'),
};
