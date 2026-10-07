import type { ServiceDetail, ServiceSummary } from '@/lib/api/schema';
import catalogue from './catalogue-services.json';
import { services } from './catalogue';
import operations from './contract-examples.json';

/**
 * Fiches service simulées. « Chef privé » reprend l'exemple du contrat (maquette `62:4161`) ; les 18 autres
 * fiches n'ont pas de maquette : leur contenu est provisoire (`toComplete`), à remplacer par la cliente dans le
 * back-office. Il suit la structure du cahier §5.5 pour que chaque page soit complète.
 */
const chefPrive = operations.find((operation) => operation.operationId === 'getService')?.examples
  .chefPrive as ServiceDetail;

type DetailFields = Omit<ServiceDetail, keyof ServiceSummary>;

const CITIES: Record<string, string[]> = {
  experience: ['Douala', 'Yaoundé', 'Kribi'],
  immobilier: ['Douala', 'Yaoundé'],
  'services-de-proximite': ['Douala', 'Yaoundé'],
  'culture-evenementiel': ['Douala', 'Yaoundé', 'Kribi'],
};

const AUDIENCES: Record<string, string[]> = {
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
};

const STEPS: DetailFields['steps'] = [
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
];

const ADVANTAGES: DetailFields['advantages'] = [
  {
    icon: 'ShieldCheck',
    title: 'Des prestataires vérifiés',
    text: 'Sélectionnés, suivis et évalués après chaque prestation.',
  },
  { icon: 'Sparkles', title: 'Une prestation sur mesure', text: 'Pensée pour votre besoin et votre budget.' },
  { icon: 'Clock', title: 'Du temps pour vous', text: 'Nous nous occupons de l’organisation et du suivi.' },
  { icon: 'Users', title: 'Un interlocuteur unique', text: 'Joignable depuis la France comme au Cameroun.' },
];

function faq(name: string, cities: string[]): DetailFields['faq'] {
  return [
    {
      question: `Combien coûte le service « ${name} » ?`,
      answer:
        'Chaque demande est unique : le tarif dépend de votre besoin, de la durée et du lieu. Il vous est communiqué sur devis, gratuitement.',
    },
    {
      question: 'Dans quelles villes intervenez-vous ?',
      answer: `À ${cities.join(', ').replace(/, ([^,]*)$/, ' et $1')}. Pour une autre ville, écrivez-nous : nous étudions chaque demande.`,
    },
    {
      question: 'Puis-je faire ma demande depuis la France ?',
      answer:
        'Oui. Vous faites votre demande en ligne ou sur WhatsApp ; nous organisons tout sur place et vous tenons informé à chaque étape.',
    },
  ];
}

/** Trois services liés : ceux de la même rubrique d'abord, complétés par les autres rubriques. */
function relatedTo(service: ServiceSummary): ServiceSummary[] {
  const others = services.filter((item) => item.slug !== service.slug);
  return [
    ...others.filter((item) => item.category.slug === service.category.slug),
    ...others.filter((item) => item.category.slug !== service.category.slug),
  ].slice(0, 3);
}

function provisional(service: ServiceSummary): DetailFields {
  const category = catalogue.rubriques.find((item) => item.slug === service.category.slug);
  const cities = CITIES[service.category.slug] ?? ['Douala'];
  const categoryVisual = {
    illustration: (category?.illustration ??
      service.visual.illustration) as ServiceSummary['visual']['illustration'],
    image: null,
    alt: '',
  };
  return {
    tagline: `${service.summary} Vous nous confiez votre demande, nous nous occupons du reste.`,
    cities,
    audiences: AUDIENCES[service.category.slug] ?? [],
    steps: STEPS,
    advantages: ADVANTAGES,
    faq: faq(service.name, cities),
    quoteBullets: [
      'Gratuit et sans engagement',
      'Une prestation sur mesure',
      'Un seul interlocuteur du début à la fin',
    ],
    gallery: [service.visual, categoryVisual, service.visual],
    showWhatsapp: true,
    related: relatedTo(service),
    reviews: [],
    reviewsTitle: null,
    relatedTitle: 'Pour aller plus loin',
    cta: {
      title: 'Un projet, une question ?\nParlons-en.',
      text: `Votre devis « ${service.name} », gratuit et sans engagement, sous 24 h.`,
    },
    reviewSummary: null,
    seo: {
      title: `${service.name} au Cameroun`,
      description: service.summary,
      ogImageUrl: null,
      noindex: false,
    },
    toComplete: true,
    updatedAt: '2026-10-05T08:00:00.000Z',
  };
}

export const serviceDetails: Record<string, ServiceDetail> = Object.fromEntries(
  services.map((service) => [
    service.slug,
    service.slug === chefPrive.slug ? { ...service, ...chefPrive } : { ...service, ...provisional(service) },
  ]),
);
