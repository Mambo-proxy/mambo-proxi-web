import type { CategoryDetail, Review } from '@/lib/api/schema';

/**
 * Contenu des pages rubrique (maquettes `249:24507`, `60:1491`, `61:2156`, `61:3356`, `61:5620`).
 * Champs propres à la page détail ; le résumé, les services et les autres rubriques sont assemblés par le gestionnaire.
 * Sert aussi de référence pour les données d'amorçage de l'API.
 */
type DetailFields = Pick<
  CategoryDetail,
  | 'eyebrow'
  | 'heroTitle'
  | 'heroLead'
  | 'heroVisual'
  | 'audiencesTitle'
  | 'audiences'
  | 'servicesTitle'
  | 'servicesLead'
  | 'groups'
  | 'highlight'
  | 'processEyebrow'
  | 'processTitle'
  | 'processSteps'
  | 'testimonial'
  | 'testimonialVisual'
  | 'quoteFields'
  | 'cta'
  | 'seo'
>;

/** Villes proposées dans les champs « Ville » du devis. */
const CITIES = ['Douala', 'Yaoundé', 'Kribi', 'Autre'];

const PROCESS_STEPS: DetailFields['processSteps'] = [
  { title: 'Votre demande', text: 'Formulaire, WhatsApp ou rendez-vous.' },
  { title: 'Devis sur mesure', text: 'Une proposition claire sous 24 h.' },
  { title: 'Intervention', text: 'Un prestataire sélectionné, un suivi constant.' },
  { title: 'Votre avis', text: 'Un court questionnaire après chaque prestation.' },
];

const visual = (illustration: CategoryDetail['visual']['illustration']) => ({
  illustration,
  image: null,
  alt: '',
});

/** Photo des maquettes (`public/photos/`), avec l'illustration de repli. */
const photo = (
  illustration: CategoryDetail['visual']['illustration'],
  file: string,
  width: number,
  height: number,
  alt = '',
) => ({
  illustration,
  image: { id: `photo-${file}`, url: `/photos/${file}.png`, width, height, variants: [] },
  alt,
});

function review(fields: Omit<Review, 'rating' | 'verified' | 'featured' | 'reply'>): Review {
  return { rating: 5, verified: true, featured: false, reply: null, ...fields };
}

export const categoryDetails: Record<string, DetailFields> = {
  'services-a-domicile': {
    eyebrow: 'Services à domicile',
    heroTitle: 'Plus de temps pour l’essentiel.',
    heroLead:
      'Une intervenante Mambo Proxi se déplace chez vous selon la formule choisie : entretien du logement, nettoyage du véhicule, collecte du linge.',
    heroVisual: photo(
      'logement',
      'sad-hero',
      1280,
      960,
      'Une intervenante Mambo Proxi arrive chez une cliente avec son matériel.',
    ),
    audiencesTitle: 'Pour les particuliers et les professionnels, à Douala et environs.',
    audiences: [
      {
        icon: 'Users',
        title: 'Actifs et familles',
        text: 'Un logement entretenu sans y consacrer vos soirées.',
      },
      {
        icon: 'HouseHeart',
        title: 'Propriétaires et locations',
        text: 'Ménage entre deux locations saisonnières ou après travaux.',
      },
      {
        icon: 'Package',
        title: 'Proches accompagnés',
        text: 'Vous êtes loin : nous entretenons le domicile de vos proches.',
      },
    ],
    servicesTitle: '4 formules pour un quotidien plus serein.',
    servicesLead:
      'Tarifs indicatifs sur devis, ajustés selon la surface, l’état du logement et les options. Le pressing est facturé séparément.',
    groups: [],
    highlight: {
      kind: 'STEPS_BAND',
      eyebrow: 'Des intervenantes de confiance',
      title: 'Sélectionnées, formées et suivies à chaque intervention.',
      steps: [
        {
          icon: 'Package',
          title: '1. Une sélection rigoureuse',
          text: 'Références vérifiées, tests théoriques et pratiques avant toute intervention.',
        },
        {
          icon: 'Smartphone',
          title: '2. Un suivi qualité',
          text: 'Une personne dédiée accompagne les intervenantes ; retour terrain après chaque prestation.',
        },
        {
          icon: 'MapPin',
          title: '3. Une réponse rapide',
          text: 'Par téléphone ou WhatsApp, pour vos demandes, renseignements et réservations.',
        },
      ],
      note: 'Évaluation à domicile possible : un conseiller se déplace pour définir la formule adaptée.',
    },
    processEyebrow: 'Comment ça marche ?',
    processTitle: 'Un service simple, du choix de la formule à la validation.',
    processSteps: [
      { title: 'Choix de la formule', text: 'Sur le site, par téléphone ou WhatsApp.' },
      { title: 'Créneau confirmé', text: 'L’agence confirme la date, l’heure et le montant.' },
      { title: 'Intervention à domicile', text: 'Entretien, véhicule et collecte du linge si demandée.' },
      {
        title: 'Règlement et validation',
        text: 'Règlement auprès de l’agence (Mobile Money accepté), puis votre avis.',
      },
    ],
    testimonial: review({
      id: 'rev_aicha',
      authorName: 'Aïcha M.',
      initials: 'AM',
      city: 'Bonamoussadi',
      text: 'L’intervenante vient chaque semaine, mon linge revient repassé le lendemain. Je réserve sur WhatsApp, c’est simple et fiable.',
      service: {
        slug: 'maison-linge',
        name: 'Maison + Linge',
        categorySlug: 'services-a-domicile',
        categoryName: 'Services à domicile',
      },
      date: '2026-10-02T10:00:00.000Z',
    }),
    testimonialVisual: photo('logement', 'temoin-sad', 1280, 960),
    quoteFields: [
      { name: 'eventDate', label: 'Date souhaitée', type: 'date', required: false, width: 'half' },
      { name: 'city', label: 'Ville', type: 'city', required: false, options: CITIES, width: 'half' },
    ],
    cta: {
      title: 'Besoin d’un coup de main\nà la maison ?',
      text: 'Choisissez votre formule : nous confirmons votre créneau sous 24 h.',
    },
    seo: {
      title: 'Services à domicile à Douala : entretien du logement, véhicule, linge',
      description:
        'Une intervenante Mambo Proxi chez vous, selon la formule choisie : entretien du logement, nettoyage du véhicule, collecte du linge. Devis gratuit.',
      ogImageUrl: null,
      noindex: false,
    },
  },
  experience: {
    eyebrow: 'Expérience',
    heroTitle: 'Des moments sur mesure, ==pensés pour vous.==',
    heroLead:
      'Location de voiture, chef privé, massage, photographe, événementiel : nous réservons pour vous des prestataires de confiance, au Cameroun.',
    heroVisual: visual('chef'),
    audiencesTitle: 'Pour les particuliers, les familles et ceux qui reçoivent.',
    audiences: [
      {
        icon: 'User',
        title: 'Particuliers',
        text: 'Vous voulez vous faire plaisir ou simplifier un séjour, sans chercher pendant des heures.',
      },
      {
        icon: 'Users',
        title: 'Familles en séjour',
        text: 'Vous rentrez au pays en vacances : tout est prêt à votre arrivée.',
      },
      {
        icon: 'PartyPopper',
        title: 'Organisateurs',
        text: 'Anniversaire, mariage, réception : des prestataires fiables pour votre événement privé.',
      },
    ],
    servicesTitle: '5 services pour vivre chaque moment pleinement.',
    servicesLead: 'Chaque prestation fait l’objet d’un devis gratuit et personnalisé.',
    groups: [],
    highlight: null,
    processTitle: 'Nous coordonnons tout, du premier message au suivi.',
    processSteps: PROCESS_STEPS,
    testimonial: review({
      id: 'rev_jean_marc',
      authorName: 'Jean-Marc T.',
      initials: 'JT',
      city: 'Yaoundé',
      text: "Le chef privé a régalé nos invités pour l'anniversaire de ma mère. Service impeccable, équipe aux petits soins du début à la fin.",
      service: {
        slug: 'chef-prive',
        name: 'Chef privé',
        categorySlug: 'experience',
        categoryName: 'Expérience',
      },
      date: '2026-09-12T10:00:00.000Z',
    }),
    testimonialVisual: visual('equipe'),
    quoteFields: [
      { name: 'eventDate', label: 'Date souhaitée', type: 'date', required: false, width: 'half' },
      { name: 'city', label: 'Ville', type: 'city', required: false, options: CITIES, width: 'half' },
      {
        name: 'guests',
        label: 'Nombre de personnes',
        type: 'number',
        required: false,
        min: 1,
        max: 500,
        width: 'half',
      },
      {
        name: 'occasion',
        label: 'Type d’occasion',
        type: 'select',
        required: false,
        options: [
          'Anniversaire',
          'Mariage',
          'Dîner entre amis',
          'Séjour en famille',
          'Événement d’entreprise',
          'Autre',
        ],
        width: 'half',
      },
    ],
    cta: {
      title: 'Envie d’un moment\nsur mesure ?',
      text: 'Dites-nous ce que vous imaginez : nous vous proposons un devis gratuit sous 24 h.',
    },
    seo: {
      title: 'Expérience : chef privé, location de voiture, photographe au Cameroun',
      description:
        'Des prestataires de confiance réservés pour vous au Cameroun : location de voiture, chef privé, massage, photographe, événementiel.',
      ogImageUrl: null,
      noindex: false,
    },
  },
  immobilier: {
    eyebrow: 'Immobilier',
    heroTitle: 'Se loger au Cameroun, ==en toute sérénité.==',
    heroLead:
      "Que vous cherchiez un logement ou que vous souhaitiez confier votre bien, une équipe présente sur place s'occupe de tout, même pendant que vous êtes en France.",
    heroVisual: visual('logement'),
    audiencesTitle: 'Locataires, propriétaires et familles.',
    audiences: [
      {
        icon: 'Key',
        title: 'Vous cherchez un logement',
        text: 'Pour un séjour, une installation durable ou un besoin spécifique.',
      },
      {
        icon: 'Building',
        title: 'Vous êtes propriétaire',
        text: 'Votre bien est géré, entretenu et loué en toute transparence.',
      },
      {
        icon: 'HouseHeart',
        title: 'Vous accompagnez un proche',
        text: 'Logement adapté, meublé, installation : nous préparons tout.',
      },
    ],
    servicesTitle: '7 services pour chaque étape de votre logement.',
    servicesLead: null,
    groups: [
      {
        title: 'Vous cherchez un logement',
        serviceSlugs: [
          'recherche-logement',
          'location-sous-location-colocation',
          'logement-adapte-meuble',
          'logement-temporaire',
          'accompagnement-installation',
        ],
      },
      { title: 'Vous êtes propriétaire', serviceSlugs: ['gestion-locative', 'entretien-logements'] },
    ],
    highlight: null,
    processTitle: 'Nous coordonnons tout, du premier message au suivi.',
    processSteps: PROCESS_STEPS,
    testimonial: review({
      id: 'rev_sandrine',
      authorName: 'Sandrine M.',
      initials: 'SM',
      city: 'Lyon',
      text: 'Je vis en France et Mambo gère mon appartement à Bonapriso. Comptes rendus réguliers, locataires suivis : je suis enfin serein.',
      service: {
        slug: 'gestion-locative',
        name: 'Gestion locative',
        categorySlug: 'immobilier',
        categoryName: 'Immobilier',
      },
      date: '2026-08-30T10:00:00.000Z',
    }),
    testimonialVisual: visual('equipe'),
    quoteFields: [
      {
        name: 'propertyType',
        label: 'Type de bien',
        type: 'select',
        required: false,
        options: ['Chambre', 'Studio', 'Appartement', 'Maison', 'Local professionnel', 'Autre'],
        width: 'half',
      },
      { name: 'city', label: 'Ville', type: 'city', required: false, options: CITIES, width: 'half' },
      {
        name: 'budget',
        label: 'Budget indicatif',
        type: 'text',
        required: false,
        placeholder: 'Ex. 250 000 FCFA par mois',
        helpText: 'Facultatif : il nous aide à cibler les recherches.',
        width: 'half',
      },
      { name: 'arrivalDate', label: 'Date d’arrivée', type: 'date', required: false, width: 'half' },
      {
        name: 'duration',
        label: 'Durée',
        type: 'select',
        required: false,
        options: ['Moins d’un mois', '1 à 6 mois', '6 à 12 mois', 'Plus d’un an', 'Je ne sais pas encore'],
        width: 'half',
      },
    ],
    cta: {
      title: 'Un logement à trouver\nou à confier ?',
      text: 'Expliquez-nous votre projet immobilier : devis gratuit et réponse sous 24 h.',
    },
    seo: {
      title: 'Immobilier : recherche de logement et gestion locative au Cameroun',
      description:
        'Recherche de logement, location, logement temporaire, gestion locative et entretien : une équipe sur place au Cameroun, même depuis la France.',
      ogImageUrl: null,
      noindex: false,
    },
  },
  'services-de-proximite': {
    eyebrow: 'Services de proximité',
    heroTitle: 'Votre quotidien simplifié, ==chez vous.==',
    heroLead:
      'Repas livrés, courses faites, colis réceptionnés : nous prenons en charge les tâches du quotidien pour vous et pour vos proches.',
    heroVisual: visual('livraison'),
    audiencesTitle: 'Pour les résidents et les familles, ici comme à distance.',
    audiences: [
      {
        icon: 'Users',
        title: 'Résidents et familles locales',
        text: 'Gagnez du temps sur les tâches de tous les jours.',
      },
      {
        icon: 'HouseHeart',
        title: 'Proches accompagnés',
        text: 'Vous êtes en France : nous veillons sur vos parents au Cameroun.',
      },
      {
        icon: 'Package',
        title: 'Envois depuis l’étranger',
        text: 'Vos colis et courriers reçus à l’agence, en toute sécurité.',
      },
    ],
    servicesTitle: '3 services pour souffler au quotidien.',
    servicesLead: 'Zones desservies communiquées lors du devis.',
    groups: [],
    highlight: {
      kind: 'PARCEL_RECEPTION',
      eyebrow: 'Réception de colis et de courrier',
      title: "Vos envois arrivent à l'agence, nous nous occupons du reste.",
      text: null,
      steps: [
        {
          icon: 'Package',
          title: '1. Réception',
          text: 'L’agence reçoit le colis ou le courrier envoyé depuis l’extérieur.',
        },
        {
          icon: 'Smartphone',
          title: '2. On vous prévient',
          text: 'Nous contactons le destinataire par téléphone ou WhatsApp.',
        },
        {
          icon: 'MapPin',
          title: '3. Retrait ou livraison',
          text: 'Retrait à l’agence ou livraison à domicile, selon votre choix.',
        },
      ],
      note: 'Le suivi des colis se fait directement avec l’agence.',
      link: null,
    },
    processTitle: 'Nous coordonnons tout, du premier message au suivi.',
    processSteps: PROCESS_STEPS,
    testimonial: review({
      id: 'rev_clarisse',
      authorName: 'Clarisse N.',
      initials: 'CN',
      city: 'Paris',
      text: 'Ma mère reçoit ses repas chaque midi et ses courses le samedi. Depuis Paris, je suis rassurée et toujours informée.',
      service: {
        slug: 'portage-livraison-repas',
        name: 'Portage de repas',
        categorySlug: 'services-de-proximite',
        categoryName: 'Services de proximité',
      },
      date: '2026-09-20T10:00:00.000Z',
    }),
    testimonialVisual: visual('equipe'),
    quoteFields: [
      { name: 'city', label: 'Ville', type: 'city', required: false, options: CITIES, width: 'half' },
      {
        name: 'frequency',
        label: 'Fréquence',
        type: 'select',
        required: false,
        options: ['Une seule fois', 'Chaque semaine', 'Plusieurs fois par semaine', 'Chaque mois'],
        width: 'half',
      },
      {
        name: 'address',
        label: 'Adresse ou quartier',
        type: 'text',
        required: false,
        placeholder: 'Ex. Bonapriso, Douala',
        width: 'full',
      },
    ],
    cta: {
      title: 'Besoin d’un coup de main\nau quotidien ?',
      text: 'Repas, courses ou colis : décrivez votre besoin, nous vous répondons sous 24 h.',
    },
    seo: {
      title: 'Services de proximité : repas, courses et colis au Cameroun',
      description:
        'Portage de repas, livraison de courses, réception de colis et de courrier : nous veillons sur vos proches au Cameroun.',
      ogImageUrl: null,
      noindex: false,
    },
  },
  'culture-evenementiel': {
    eyebrow: 'Culture & événementiel',
    heroTitle: 'Vivre le Cameroun, ==de l’intérieur.==',
    heroLead:
      "Découvertes, sorties culturelles, événements organisés par Mambo et accompagnement à l'intégration : pour découvrir le pays ou s'y sentir chez soi.",
    heroVisual: visual('culture'),
    audiencesTitle: 'Pour les curieux, les nouveaux arrivants et la diaspora.',
    audiences: [
      {
        icon: 'Plane',
        title: 'Visiteurs et diaspora',
        text: 'Vous venez quelques semaines : profitez du pays sans rien organiser.',
      },
      {
        icon: 'MapPin',
        title: 'Nouveaux arrivants',
        text: 'Vous vous installez : repères, rencontres et bonnes adresses.',
      },
      {
        icon: 'Users',
        title: 'Groupes et entreprises',
        text: 'Sorties, activités et événements sur mesure pour vos équipes.',
      },
    ],
    servicesTitle: '4 façons de découvrir et de vivre le pays.',
    servicesLead: null,
    groups: [],
    highlight: {
      kind: 'AGENDA',
      eyebrow: 'Agenda Mambo',
      title: 'Prochaines sorties et événements',
      text: null,
      steps: [],
      note: null,
      link: { label: 'Voir tout l’agenda', href: '/services/culture-evenementiel#agenda', external: false },
    },
    processTitle: 'Nous coordonnons tout, du premier message au suivi.',
    processSteps: PROCESS_STEPS,
    testimonial: review({
      id: 'rev_patrick',
      authorName: 'Patrick E.',
      initials: 'PE',
      city: 'Marseille',
      text: 'La journée découverte à Kribi était parfaite : guide passionné, repas local, tout était organisé. Mes enfants en parlent encore.',
      service: {
        slug: 'decouverte-cameroun',
        name: 'Découverte du Cameroun',
        categorySlug: 'culture-evenementiel',
        categoryName: 'Culture & événementiel',
      },
      date: '2026-09-05T10:00:00.000Z',
    }),
    testimonialVisual: visual('equipe'),
    quoteFields: [
      { name: 'eventDate', label: 'Date souhaitée', type: 'date', required: false, width: 'half' },
      {
        name: 'participants',
        label: 'Nombre de participants',
        type: 'number',
        required: false,
        min: 1,
        max: 200,
        width: 'half',
      },
    ],
    cta: {
      title: 'Envie de sortir,\nde découvrir ?',
      text: 'Rejoignez une sortie Mambo ou demandez une activité sur mesure.',
    },
    seo: {
      title: 'Culture & événementiel : découvrir et vivre le Cameroun',
      description:
        'Découverte du Cameroun, sorties culturelles, événements Mambo et intégration locale : le pays vu de l’intérieur.',
      ogImageUrl: null,
      noindex: false,
    },
  },
};

/**
 * Pages rubrique en anglais (`?lang=en`) ; une rubrique non encore traduite est servie en français, comme le fait l'API.
 */
export const categoryDetailsEn: Partial<Record<string, DetailFields>> = {
  'services-a-domicile': {
    eyebrow: 'Home services',
    heroTitle: 'More time for what matters.',
    heroLead:
      'A Mambo Proxi housekeeper comes to your home with the package you choose: home cleaning, car cleaning, laundry pick-up.',
    heroVisual: photo(
      'logement',
      'sad-hero',
      1280,
      960,
      'A Mambo Proxi housekeeper arrives at a client’s home with her equipment.',
    ),
    audiencesTitle: 'For individuals and professionals, in Douala and the surrounding area.',
    audiences: [
      {
        icon: 'Users',
        title: 'Working people and families',
        text: 'A well-kept home without spending your evenings on it.',
      },
      {
        icon: 'HouseHeart',
        title: 'Owners and rentals',
        text: 'Cleaning between two holiday lets or after building work.',
      },
      {
        icon: 'Package',
        title: 'Loved ones looked after',
        text: 'You live far away: we look after your loved ones’ home.',
      },
    ],
    servicesTitle: '4 packages for a more relaxed daily life.',
    servicesLead:
      'Indicative rates on quotation, adjusted to the surface area, the condition of the home and the options. Dry cleaning is charged separately.',
    groups: [],
    highlight: {
      kind: 'STEPS_BAND',
      eyebrow: 'Trusted housekeepers',
      title: 'Selected, trained and supervised on every visit.',
      steps: [
        {
          icon: 'Package',
          title: '1. Careful selection',
          text: 'Checked references, written and practical tests before any visit.',
        },
        {
          icon: 'Smartphone',
          title: '2. Quality follow-up',
          text: 'A dedicated person supports the housekeepers, with field feedback after every visit.',
        },
        {
          icon: 'MapPin',
          title: '3. A quick reply',
          text: 'By phone or WhatsApp, for your requests, questions and bookings.',
        },
      ],
      note: 'Home assessment available: an adviser visits you to find the right package.',
    },
    processEyebrow: 'How does it work?',
    processTitle: 'A simple service, from choosing your package to sign-off.',
    processSteps: [
      { title: 'Choose your package', text: 'On the website, by phone or WhatsApp.' },
      { title: 'Slot confirmed', text: 'The agency confirms the date, time and amount.' },
      { title: 'Visit at your home', text: 'Cleaning, car and laundry pick-up if requested.' },
      {
        title: 'Payment and feedback',
        text: 'Payment at the agency (Mobile Money accepted), then your review.',
      },
    ],
    testimonial: review({
      id: 'rev_aicha',
      authorName: 'Aïcha M.',
      initials: 'AM',
      city: 'Bonamoussadi',
      text: 'L’intervenante vient chaque semaine, mon linge revient repassé le lendemain. Je réserve sur WhatsApp, c’est simple et fiable.',
      service: {
        slug: 'maison-linge',
        name: 'Home + Laundry',
        categorySlug: 'services-a-domicile',
        categoryName: 'Home services',
      },
      date: '2026-10-02T10:00:00.000Z',
    }),
    testimonialVisual: photo('logement', 'temoin-sad', 1280, 960),
    quoteFields: [
      { name: 'eventDate', label: 'Preferred date', type: 'date', required: false, width: 'half' },
      { name: 'city', label: 'City', type: 'city', required: false, options: CITIES, width: 'half' },
    ],
    cta: {
      title: 'Need a hand\nat home?',
      text: 'Choose your package: we confirm your slot within 24 hours.',
    },
    seo: {
      title: 'Home services in Douala: home cleaning, car, laundry',
      description:
        'A Mambo Proxi housekeeper at your home, with the package you choose: home cleaning, car cleaning, laundry pick-up. Free quote.',
      ogImageUrl: null,
      noindex: false,
    },
  },
};

/** Autres rubriques proposées en bas de page (maquettes) ; par défaut, les rubriques suivantes, trois au plus. */
export const otherCategorySlugs: Record<string, string[]> = {
  'services-a-domicile': ['experience', 'immobilier', 'culture-evenementiel'],
};
