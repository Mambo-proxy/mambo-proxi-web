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
  | 'offerSections'
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

type Offer = NonNullable<CategoryDetail['offerSections']>[number]['items'][number];

function offer(
  fields: Pick<Offer, 'id' | 'title' | 'text' | 'actionLabel' | 'serviceSlug'> &
    Partial<Pick<Offer, 'titleMobile' | 'textMobile' | 'actionLabelMobile'>> & { visual: Offer['visual'] },
): Offer {
  return {
    titleMobile: null,
    textMobile: null,
    actionLabelMobile: null,
    icon: null,
    action: 'QUOTE',
    ...fields,
  };
}

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
    groups: [
      { title: 'Les services à la carte', serviceSlugs: ['entretien-du-logement', 'nettoyage-automobile'] },
    ],
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
    heroVisual: photo('chef', 'exp-hero', 1280, 960),
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
        text: 'Vous arrivez à Douala : tout est prêt à votre arrivée.',
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
    offerSections: [
      {
        eyebrow: 'Location de voiture',
        title: 'Nos véhicules, avec ou sans chauffeur.',
        titleMobile: null,
        lead: 'Faites défiler les véhicules disponibles, puis réservez sur devis.',
        leadMobile: 'Faites défiler, puis réservez sur devis.',
        items: [
          offer({
            id: 'off_citadine',
            title: 'Citadine confort',
            text: 'Citadine · 4 places · climatisation · trajets en ville',
            textMobile: 'Citadine · 4 places · climatisation',
            actionLabel: 'Réservation sur devis',
            actionLabelMobile: 'Réserver',
            serviceSlug: 'location-voiture',
            visual: photo('voiture', 'offre-citadine', 470, 325),
          }),
          offer({
            id: 'off_berline',
            title: 'Berline avec chauffeur',
            text: 'Berline · 4 places · chauffeur professionnel · transferts',
            textMobile: 'Berline · 4 places · chauffeur pro',
            actionLabel: 'Réservation sur devis',
            actionLabelMobile: 'Réserver',
            serviceSlug: 'location-voiture',
            visual: photo('voiture', 'offre-berline', 1536, 1024),
          }),
          offer({
            id: 'off_suv',
            title: 'SUV 7 places',
            text: 'SUV · 7 places · grand coffre · longs trajets et familles',
            textMobile: 'SUV · 7 places · longs trajets',
            actionLabel: 'Réservation sur devis',
            actionLabelMobile: 'Réserver',
            serviceSlug: 'location-voiture',
            visual: photo('voiture', 'offre-suv', 1536, 1024),
          }),
          offer({
            id: 'off_minibus',
            title: 'Minibus 15 places',
            text: 'Minibus · 15 places · mariages, groupes, aéroport',
            textMobile: 'Minibus · mariages, groupes, aéroport',
            actionLabel: 'Réservation sur devis',
            actionLabelMobile: 'Réserver',
            serviceSlug: 'location-voiture',
            visual: photo('voiture', 'offre-minibus', 1536, 1024),
          }),
        ],
      },
      {
        eyebrow: 'Nos prestataires',
        title: 'Photographes, chefs, praticiens : choisissez le vôtre.',
        titleMobile: 'Photographes, chefs, praticiens.',
        lead: 'Chaque prestataire est sélectionné et suivi par l’agence.',
        leadMobile: 'Choisissez votre prestataire.',
        items: [
          offer({
            id: 'off_photographe',
            title: 'Photographe — portraits et couples',
            titleMobile: 'Photographe — portraits',
            text: 'Séance en studio ou en extérieur · retouches incluses',
            textMobile: 'Studio ou extérieur · retouches',
            actionLabel: 'Demander un devis',
            actionLabelMobile: 'Devis',
            serviceSlug: 'photographe',
            visual: photo('photo', 'offre-photographe', 380, 340),
          }),
          offer({
            id: 'off_chef_camerounais',
            title: 'Chef privé — cuisine camerounaise',
            titleMobile: 'Chef — cuisine camerounaise',
            text: 'Dîners, buffets et réceptions · menus sur mesure',
            textMobile: 'Dîners, buffets, réceptions',
            actionLabel: 'Demander un devis',
            actionLabelMobile: 'Devis',
            serviceSlug: 'chef-prive',
            visual: photo('chef', 'chef-2', 1536, 1024),
          }),
          offer({
            id: 'off_chef_fusion',
            title: 'Chef privé — cuisine fusion',
            titleMobile: 'Chef — cuisine fusion',
            text: 'Dîner gastronomique à domicile · 2 à 12 convives',
            textMobile: 'Dîner gastronomique à domicile',
            actionLabel: 'Demander un devis',
            actionLabelMobile: 'Devis',
            serviceSlug: 'chef-prive',
            visual: photo('chef', 'offre-chef-aicha', 1536, 864),
          }),
          offer({
            id: 'off_massage',
            title: 'Massage bien-être à domicile',
            titleMobile: 'Massage à domicile',
            text: 'Massage relaxant · 60 ou 90 min · chez vous',
            textMobile: 'Relaxant · 60 ou 90 min',
            actionLabel: 'Demander un devis',
            actionLabelMobile: 'Devis',
            serviceSlug: 'massage-bien-etre',
            visual: photo('massage', 'offre-massage', 435, 470),
          }),
          offer({
            id: 'off_reception',
            title: 'Réception privée',
            text: 'Décoration, traiteur et service pour vos événements',
            textMobile: 'Décoration, traiteur, service',
            actionLabel: 'Demander un devis',
            actionLabelMobile: 'Devis',
            serviceSlug: 'services-evenementiels',
            visual: photo('evenement', 'offre-buffet-reception', 1536, 1024),
          }),
        ],
      },
    ],
    processTitle: 'Nous nous occupons de tout, du premier message au suivi.',
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
    testimonialVisual: photo('chef', 'offre-tete-a-tete', 1280, 960),
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
      "Acheter, vendre, louer ou confier votre bien : une équipe présente sur place s'occupe de tout, même pendant votre absence.",
    heroVisual: photo('logement', 'immo-hero', 1280, 960),
    audiencesTitle: 'Locataires, propriétaires et familles.',
    audiences: [
      {
        icon: 'Key',
        title: 'Vous cherchez un logement',
        text: 'Pour un séjour, une installation durable ou un besoin spécifique.',
      },
      {
        icon: 'Building',
        title: 'Vous êtes propriétaire ou investisseur',
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
      {
        title: 'Vous êtes propriétaire ou investisseur',
        serviceSlugs: ['gestion-locative', 'achat-vente-biens'],
      },
    ],
    highlight: null,
    offerSections: [
      {
        eyebrow: 'Biens disponibles',
        title: 'Logements et terrains sélectionnés par l’agence.',
        titleMobile: 'Logements et terrains sélectionnés.',
        lead: 'Faites défiler les biens, puis demandez une visite ou un devis.',
        leadMobile: 'Demandez une visite ou un devis.',
        items: [
          offer({
            id: 'off_bonapriso',
            title: 'Appartement 3 pièces — Bonapriso',
            text: 'Location · 3 pièces · 95 m² · balcon',
            textMobile: 'Location · 95 m² · balcon',
            actionLabel: 'Demander un devis',
            actionLabelMobile: 'Devis',
            serviceSlug: 'location-sous-location-colocation',
            visual: photo('logement', 'immo-hero', 1280, 960),
          }),
          offer({
            id: 'off_bonamoussadi',
            title: 'Appartement meublé — Bonamoussadi',
            titleMobile: 'Meublé — Bonamoussadi',
            text: 'Location meublée · 2 chambres · prêt à vivre',
            textMobile: 'Location meublée · 2 chambres',
            actionLabel: 'Demander un devis',
            actionLabelMobile: 'Devis',
            serviceSlug: 'logement-adapte-meuble',
            visual: photo('logement', 'immo-meuble', 1536, 1024),
          }),
          offer({
            id: 'off_makepe',
            title: 'Villa 5 pièces — Makèpè',
            text: 'Vente · 5 pièces · jardin · garage',
            textMobile: 'Vente · jardin · garage',
            actionLabel: 'Demander un devis',
            actionLabelMobile: 'Devis',
            serviceSlug: 'achat-vente-biens',
            visual: photo('logement', 'immo-achat', 1536, 1024),
          }),
          offer({
            id: 'off_akwa',
            title: 'Studio meublé — Akwa',
            text: 'Courte durée · 1 pièce · idéal séjour',
            textMobile: 'Courte durée · idéal séjour',
            actionLabel: 'Demander un devis',
            actionLabelMobile: 'Devis',
            serviceSlug: 'logement-temporaire',
            visual: photo('logement', 'immo-temporaire', 1536, 1024),
          }),
          offer({
            id: 'off_lendi',
            title: 'Terrain 500 m² — Lendi',
            text: 'Vente · terrain viabilisé · titre foncier',
            textMobile: 'Vente · titre foncier',
            actionLabel: 'Demander un devis',
            actionLabelMobile: 'Devis',
            serviceSlug: 'achat-vente-biens',
            visual: photo('logement', 'offre-terrain', 1536, 1024),
          }),
          offer({
            id: 'off_bonanjo',
            title: 'Appartement vue Wouri — Bonanjo',
            titleMobile: 'Vue Wouri — Bonanjo',
            text: 'Location · 4 pièces · 130 m² · vue dégagée',
            textMobile: 'Location · 4 pièces · 130 m²',
            actionLabel: 'Demander un devis',
            actionLabelMobile: 'Devis',
            serviceSlug: 'location-sous-location-colocation',
            visual: photo('logement', 'immo-recherche', 1536, 1024),
          }),
        ],
      },
    ],
    processTitle: 'Nous nous occupons de tout, du premier message au suivi.',
    processSteps: PROCESS_STEPS,
    testimonial: review({
      id: 'rev_serge',
      authorName: 'Serge M.',
      initials: 'SM',
      city: 'Kotto',
      text: 'Mambo gère mon appartement à Bonapriso. Comptes rendus réguliers, locataires suivis : je suis enfin serein.',
      service: {
        slug: 'gestion-locative',
        name: 'Gestion locative',
        categorySlug: 'immobilier',
        categoryName: 'Immobilier',
      },
      date: '2026-08-30T10:00:00.000Z',
    }),
    testimonialVisual: photo('portrait', 'temoin-immo', 1280, 960),
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
        'Achat et vente, recherche de logement, location, logement temporaire et gestion locative : une équipe sur place à Douala, même pendant votre absence.',
      ogImageUrl: null,
      noindex: false,
    },
  },
  'services-de-proximite': {
    eyebrow: 'Services de proximité',
    heroTitle: 'Votre quotidien simplifié, ==chez vous.==',
    heroLead:
      'Repas livrés, courses faites, colis réceptionnés : nous prenons en charge les tâches du quotidien pour vous et pour vos proches.',
    heroVisual: photo(
      'livraison',
      'prox-hero',
      1280,
      960,
      'Un livreur Mambo Proxi remet des sacs de courses à une cliente devant chez elle.',
    ),
    audiencesTitle: 'Pour les résidents et les familles de Douala.',
    audiences: [
      {
        icon: 'Users',
        title: 'Résidents et familles locales',
        text: 'Gagnez du temps sur les tâches de tous les jours.',
      },
      {
        icon: 'HouseHeart',
        title: 'Proches accompagnés',
        text: 'Vous êtes loin : nous veillons sur vos proches à Douala.',
      },
      {
        icon: 'Package',
        title: 'Envois dans tout Douala',
        text: 'Vos colis et courriers reçus à l’agence, en toute sécurité.',
      },
    ],
    servicesTitle: '4 services pour souffler au quotidien.',
    servicesLead: 'Zones desservies communiquées lors du devis.',
    groups: [],
    highlight: {
      kind: 'PARCEL_RECEPTION',
      eyebrow: 'Collecte et livraison de colis et de courrier',
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
    offerSections: [
      {
        eyebrow: 'Nos formules',
        title: 'Plusieurs options pour chaque besoin.',
        titleMobile: null,
        lead: 'Faites défiler les formules, puis demandez votre devis.',
        leadMobile: 'Faites défiler, puis demandez votre devis.',
        items: [
          offer({
            id: 'off_repas_semaine',
            title: 'Portage de repas — semaine',
            text: 'Repas du midi livrés du lundi au vendredi',
            textMobile: 'Repas du midi, lundi au vendredi',
            actionLabel: 'Demander un devis',
            actionLabelMobile: 'Devis',
            serviceSlug: 'portage-livraison-repas',
            visual: photo('livraison', 'prox-repas', 1280, 960),
          }),
          offer({
            id: 'off_courses_semaine',
            title: 'Courses de la semaine',
            text: 'Liste envoyée sur WhatsApp · livraison le jour même',
            textMobile: 'Liste sur WhatsApp · livrée le jour même',
            actionLabel: 'Demander un devis',
            actionLabelMobile: 'Devis',
            serviceSlug: 'livraison-courses-commandes',
            visual: photo('courses', 'prox-courses', 1536, 1024),
          }),
          offer({
            id: 'off_colis_express',
            title: 'Colis et courrier — express',
            titleMobile: 'Colis express',
            text: 'Collecte et livraison dans la journée à Douala',
            textMobile: 'Collecte et livraison dans la journée',
            actionLabel: 'Demander un devis',
            actionLabelMobile: 'Devis',
            serviceSlug: 'collecte-livraison-colis-courrier',
            visual: photo('colis', 'prox-colis', 1536, 1024),
          }),
          offer({
            id: 'off_pressing',
            title: 'Pressing et laverie',
            text: 'Collecte, lavage, repassage · retour sous 48 h',
            textMobile: 'Collecte, lavage, repassage · 48 h',
            actionLabel: 'Demander un devis',
            actionLabelMobile: 'Devis',
            serviceSlug: 'pressing-laverie',
            visual: photo('livraison', 'prox-laverie', 1536, 1024),
          }),
          offer({
            id: 'off_scooter',
            title: 'Livraison à scooter',
            text: 'Petits envois urgents · 30 à 60 min selon la zone',
            textMobile: 'Envois urgents · 30 à 60 min',
            actionLabel: 'Demander un devis',
            actionLabelMobile: 'Devis',
            serviceSlug: 'collecte-livraison-colis-courrier',
            visual: photo('livraison', 'prox-scooter', 1280, 960),
          }),
        ],
      },
    ],
    processTitle: 'Nous nous occupons de tout, du premier message au suivi.',
    processSteps: PROCESS_STEPS,
    testimonial: review({
      id: 'rev_clarisse',
      authorName: 'Clarisse N.',
      initials: 'CN',
      city: 'Akwa',
      text: 'Ma mère reçoit ses repas chaque midi et ses courses le samedi. Je suis rassurée et toujours informée.',
      service: {
        slug: 'portage-livraison-repas',
        name: 'Portage de repas',
        categorySlug: 'services-de-proximite',
        categoryName: 'Services de proximité',
      },
      date: '2026-09-20T10:00:00.000Z',
    }),
    testimonialVisual: photo('livraison', 'prox-repas', 1280, 960),
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
    groups: [
      { title: 'Individual services', serviceSlugs: ['entretien-du-logement', 'nettoyage-automobile'] },
    ],
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
  experience: {
    eyebrow: 'Experience',
    heroTitle: 'Tailor-made moments, ==designed for you.==',
    heroLead:
      'Car rental, private chef, massage, photographer, events: we book trusted providers for you in Cameroon.',
    heroVisual: photo('chef', 'exp-hero', 1280, 960),
    audiencesTitle: 'For individuals, families and hosts.',
    audiences: [
      {
        icon: 'User',
        title: 'Individuals',
        text: 'You want to treat yourself or make a stay easier, without searching for hours.',
      },
      {
        icon: 'Users',
        title: 'Families visiting',
        text: 'You arrive in Douala: everything is ready when you get there.',
      },
      {
        icon: 'PartyPopper',
        title: 'Organisers',
        text: 'Birthday, wedding, reception: reliable providers for your private event.',
      },
    ],
    servicesTitle: '5 services to make the most of every moment.',
    servicesLead: 'Every service comes with a free, personalised quote.',
    groups: [],
    highlight: null,
    offerSections: [
      {
        eyebrow: 'Car rental',
        title: 'Our vehicles, with or without a driver.',
        titleMobile: null,
        lead: 'Scroll through the available vehicles, then book on quotation.',
        leadMobile: 'Scroll through, then book on quotation.',
        items: [
          offer({
            id: 'off_citadine',
            title: 'Comfort city car',
            text: 'City car · 4 seats · air conditioning · city trips',
            textMobile: 'City car · 4 seats · air conditioning',
            actionLabel: 'Book on quotation',
            actionLabelMobile: 'Book',
            serviceSlug: 'location-voiture',
            visual: photo('voiture', 'offre-citadine', 470, 325),
          }),
          offer({
            id: 'off_berline',
            title: 'Sedan with driver',
            text: 'Sedan · 4 seats · professional driver · transfers',
            textMobile: 'Sedan · 4 seats · pro driver',
            actionLabel: 'Book on quotation',
            actionLabelMobile: 'Book',
            serviceSlug: 'location-voiture',
            visual: photo('voiture', 'offre-berline', 1536, 1024),
          }),
          offer({
            id: 'off_suv',
            title: '7-seater SUV',
            text: 'SUV · 7 seats · large boot · long trips and families',
            textMobile: 'SUV · 7 seats · long trips',
            actionLabel: 'Book on quotation',
            actionLabelMobile: 'Book',
            serviceSlug: 'location-voiture',
            visual: photo('voiture', 'offre-suv', 1536, 1024),
          }),
          offer({
            id: 'off_minibus',
            title: '15-seater minibus',
            text: 'Minibus · 15 seats · weddings, groups, airport',
            textMobile: 'Minibus · weddings, groups, airport',
            actionLabel: 'Book on quotation',
            actionLabelMobile: 'Book',
            serviceSlug: 'location-voiture',
            visual: photo('voiture', 'offre-minibus', 1536, 1024),
          }),
        ],
      },
      {
        eyebrow: 'Our providers',
        title: 'Photographers, chefs, practitioners: choose yours.',
        titleMobile: 'Photographers, chefs, practitioners.',
        lead: 'Every provider is selected and followed up by the agency.',
        leadMobile: 'Choose your provider.',
        items: [
          offer({
            id: 'off_photographe',
            title: 'Photographer — portraits and couples',
            titleMobile: 'Photographer — portraits',
            text: 'Studio or outdoor session · retouching included',
            textMobile: 'Studio or outdoor · retouching',
            actionLabel: 'Ask for a quote',
            actionLabelMobile: 'Quote',
            serviceSlug: 'photographe',
            visual: photo('photo', 'offre-photographe', 380, 340),
          }),
          offer({
            id: 'off_chef_camerounais',
            title: 'Private chef — Cameroonian cuisine',
            titleMobile: 'Chef — Cameroonian cuisine',
            text: 'Dinners, buffets and receptions · tailor-made menus',
            textMobile: 'Dinners, buffets, receptions',
            actionLabel: 'Ask for a quote',
            actionLabelMobile: 'Quote',
            serviceSlug: 'chef-prive',
            visual: photo('chef', 'chef-2', 1536, 1024),
          }),
          offer({
            id: 'off_chef_fusion',
            title: 'Private chef — fusion cuisine',
            titleMobile: 'Chef — fusion cuisine',
            text: 'Gourmet dinner at home · 2 to 12 guests',
            textMobile: 'Gourmet dinner at home',
            actionLabel: 'Ask for a quote',
            actionLabelMobile: 'Quote',
            serviceSlug: 'chef-prive',
            visual: photo('chef', 'offre-chef-aicha', 1536, 864),
          }),
          offer({
            id: 'off_massage',
            title: 'Wellness massage at home',
            titleMobile: 'Massage at home',
            text: 'Relaxing massage · 60 or 90 min · at your place',
            textMobile: 'Relaxing · 60 or 90 min',
            actionLabel: 'Ask for a quote',
            actionLabelMobile: 'Quote',
            serviceSlug: 'massage-bien-etre',
            visual: photo('massage', 'offre-massage', 435, 470),
          }),
          offer({
            id: 'off_reception',
            title: 'Private reception',
            text: 'Decoration, catering and service for your events',
            textMobile: 'Decoration, catering, service',
            actionLabel: 'Ask for a quote',
            actionLabelMobile: 'Quote',
            serviceSlug: 'services-evenementiels',
            visual: photo('evenement', 'offre-buffet-reception', 1536, 1024),
          }),
        ],
      },
    ],
    processTitle: 'We take care of everything, from the first message to the follow-up.',
    processSteps: [
      { title: 'Your request', text: 'Form, WhatsApp or appointment.' },
      { title: 'Tailor-made quote', text: 'A clear proposal within 24 hours.' },
      { title: 'Service', text: 'A selected provider, constant follow-up.' },
      { title: 'Your feedback', text: 'A short questionnaire after every service.' },
    ],
    testimonial: review({
      id: 'rev_jean_marc',
      authorName: 'Jean-Marc T.',
      initials: 'JT',
      city: 'Yaoundé',
      text: "Le chef privé a régalé nos invités pour l'anniversaire de ma mère. Service impeccable, équipe aux petits soins du début à la fin.",
      service: {
        slug: 'chef-prive',
        name: 'Private chef',
        categorySlug: 'experience',
        categoryName: 'Experience',
      },
      date: '2026-09-12T10:00:00.000Z',
    }),
    testimonialVisual: photo('chef', 'offre-tete-a-tete', 1280, 960),
    quoteFields: [
      { name: 'eventDate', label: 'Preferred date', type: 'date', required: false, width: 'half' },
      { name: 'city', label: 'City', type: 'city', required: false, options: CITIES, width: 'half' },
      {
        name: 'guests',
        label: 'Number of people',
        type: 'number',
        required: false,
        min: 1,
        max: 500,
        width: 'half',
      },
      {
        name: 'occasion',
        label: 'Type of occasion',
        type: 'select',
        required: false,
        options: ['Birthday', 'Wedding', 'Dinner with friends', 'Family stay', 'Corporate event', 'Other'],
        width: 'half',
      },
    ],
    cta: {
      title: 'Fancy a tailor-made\nmoment?',
      text: 'Tell us what you have in mind: we send you a free quote within 24 hours.',
    },
    seo: {
      title: 'Experience: private chef, car rental, photographer in Cameroon',
      description:
        'Trusted providers booked for you in Cameroon: car rental, private chef, massage, photographer, events.',
      ogImageUrl: null,
      noindex: false,
    },
  },
  immobilier: {
    eyebrow: 'Real estate',
    heroTitle: 'Finding a home in Cameroon, ==with peace of mind.==',
    heroLead:
      'Buy, sell, rent or entrust your property: a team on the ground takes care of everything, even while you are away.',
    heroVisual: photo('logement', 'immo-hero', 1280, 960),
    audiencesTitle: 'Tenants, owners and families.',
    audiences: [
      {
        icon: 'Key',
        title: 'You are looking for a home',
        text: 'For a stay, a long-term move or a specific need.',
      },
      {
        icon: 'Building',
        title: 'You are an owner or investor',
        text: 'Your property is managed, maintained and let with full transparency.',
      },
      {
        icon: 'HouseHeart',
        title: 'You are helping a loved one',
        text: 'Adapted or furnished housing, settling in: we prepare everything.',
      },
    ],
    servicesTitle: '7 services for every step of your housing.',
    servicesLead: null,
    groups: [
      {
        title: 'You are looking for a home',
        serviceSlugs: [
          'recherche-logement',
          'location-sous-location-colocation',
          'logement-adapte-meuble',
          'logement-temporaire',
          'accompagnement-installation',
        ],
      },
      { title: 'You are an owner or investor', serviceSlugs: ['gestion-locative', 'achat-vente-biens'] },
    ],
    highlight: null,
    offerSections: [
      {
        eyebrow: 'Available properties',
        title: 'Homes and plots selected by the agency.',
        titleMobile: 'Homes and plots, selected.',
        lead: 'Scroll through the properties, then ask for a visit or a quote.',
        leadMobile: 'Ask for a visit or a quote.',
        items: [
          offer({
            id: 'off_bonapriso',
            title: '3-room apartment — Bonapriso',
            text: 'Rental · 3 rooms · 95 m² · balcony',
            textMobile: 'Rental · 95 m² · balcony',
            actionLabel: 'Ask for a quote',
            actionLabelMobile: 'Quote',
            serviceSlug: 'location-sous-location-colocation',
            visual: photo('logement', 'immo-hero', 1280, 960),
          }),
          offer({
            id: 'off_bonamoussadi',
            title: 'Furnished apartment — Bonamoussadi',
            titleMobile: 'Furnished — Bonamoussadi',
            text: 'Furnished rental · 2 bedrooms · ready to move in',
            textMobile: 'Furnished rental · 2 bedrooms',
            actionLabel: 'Ask for a quote',
            actionLabelMobile: 'Quote',
            serviceSlug: 'logement-adapte-meuble',
            visual: photo('logement', 'immo-meuble', 1536, 1024),
          }),
          offer({
            id: 'off_makepe',
            title: '5-room villa — Makèpè',
            text: 'Sale · 5 rooms · garden · garage',
            textMobile: 'Sale · garden · garage',
            actionLabel: 'Ask for a quote',
            actionLabelMobile: 'Quote',
            serviceSlug: 'achat-vente-biens',
            visual: photo('logement', 'immo-achat', 1536, 1024),
          }),
          offer({
            id: 'off_akwa',
            title: 'Furnished studio — Akwa',
            text: 'Short stay · 1 room · ideal for a visit',
            textMobile: 'Short stay · ideal for a visit',
            actionLabel: 'Ask for a quote',
            actionLabelMobile: 'Quote',
            serviceSlug: 'logement-temporaire',
            visual: photo('logement', 'immo-temporaire', 1536, 1024),
          }),
          offer({
            id: 'off_lendi',
            title: '500 m² plot — Lendi',
            text: 'Sale · serviced plot · land title',
            textMobile: 'Sale · land title',
            actionLabel: 'Ask for a quote',
            actionLabelMobile: 'Quote',
            serviceSlug: 'achat-vente-biens',
            visual: photo('logement', 'offre-terrain', 1536, 1024),
          }),
          offer({
            id: 'off_bonanjo',
            title: 'Wouri view apartment — Bonanjo',
            titleMobile: 'Wouri view — Bonanjo',
            text: 'Rental · 4 rooms · 130 m² · open view',
            textMobile: 'Rental · 4 rooms · 130 m²',
            actionLabel: 'Ask for a quote',
            actionLabelMobile: 'Quote',
            serviceSlug: 'location-sous-location-colocation',
            visual: photo('logement', 'immo-recherche', 1536, 1024),
          }),
        ],
      },
    ],
    processTitle: 'We take care of everything, from the first message to the follow-up.',
    processSteps: [
      { title: 'Your request', text: 'Form, WhatsApp or appointment.' },
      { title: 'Tailor-made quote', text: 'A clear proposal within 24 hours.' },
      { title: 'Service', text: 'A selected provider, constant follow-up.' },
      { title: 'Your feedback', text: 'A short questionnaire after every service.' },
    ],
    testimonial: review({
      id: 'rev_serge',
      authorName: 'Serge M.',
      initials: 'SM',
      city: 'Kotto',
      text: 'Mambo gère mon appartement à Bonapriso. Comptes rendus réguliers, locataires suivis : je suis enfin serein.',
      service: {
        slug: 'gestion-locative',
        name: 'Property management',
        categorySlug: 'immobilier',
        categoryName: 'Real estate',
      },
      date: '2026-08-30T10:00:00.000Z',
    }),
    testimonialVisual: photo('portrait', 'temoin-immo', 1280, 960),
    quoteFields: [
      {
        name: 'propertyType',
        label: 'Type of property',
        type: 'select',
        required: false,
        options: ['Room', 'Studio', 'Apartment', 'House', 'Business premises', 'Other'],
        width: 'half',
      },
      { name: 'city', label: 'City', type: 'city', required: false, options: CITIES, width: 'half' },
      {
        name: 'budget',
        label: 'Indicative budget',
        type: 'text',
        required: false,
        placeholder: 'E.g. 250,000 FCFA per month',
        helpText: 'Optional: it helps us target the search.',
        width: 'half',
      },
      { name: 'arrivalDate', label: 'Arrival date', type: 'date', required: false, width: 'half' },
      {
        name: 'duration',
        label: 'Duration',
        type: 'select',
        required: false,
        options: ['Less than a month', '1 to 6 months', '6 to 12 months', 'More than a year', 'Not sure yet'],
        width: 'half',
      },
    ],
    cta: {
      title: 'A home to find\nor to entrust?',
      text: 'Tell us about your property project: free quote and reply within 24 hours.',
    },
    seo: {
      title: 'Real estate: buying, renting and property management in Cameroon',
      description:
        'Buying and selling, home search, rentals, temporary housing and property management: a team on the ground in Douala, even while you are away.',
      ogImageUrl: null,
      noindex: false,
    },
  },
  'services-de-proximite': {
    eyebrow: 'Local services',
    heroTitle: 'Your daily life made easier, ==at home.==',
    heroLead:
      'Meals delivered, shopping done, parcels received: we take care of everyday tasks for you and your loved ones.',
    heroVisual: photo(
      'livraison',
      'prox-hero',
      1280,
      960,
      'A Mambo Proxi delivery person hands bags of groceries to a customer outside her home.',
    ),
    audiencesTitle: 'For residents and families in Douala.',
    audiences: [
      {
        icon: 'Users',
        title: 'Local residents and families',
        text: 'Save time on everyday tasks.',
      },
      {
        icon: 'HouseHeart',
        title: 'Loved ones supported',
        text: 'You are far away: we look after your loved ones in Douala.',
      },
      {
        icon: 'Package',
        title: 'Deliveries across Douala',
        text: 'Your parcels and mail received at the agency, safely.',
      },
    ],
    servicesTitle: '4 services to ease your daily life.',
    servicesLead: 'Areas served are confirmed with your quote.',
    groups: [],
    highlight: {
      kind: 'PARCEL_RECEPTION',
      eyebrow: 'Parcel and mail collection and delivery',
      title: 'Your parcels arrive at the agency, we take care of the rest.',
      text: null,
      steps: [
        {
          icon: 'Package',
          title: '1. Reception',
          text: 'The agency receives the parcel or mail sent from abroad.',
        },
        {
          icon: 'Smartphone',
          title: '2. We let you know',
          text: 'We contact the recipient by phone or WhatsApp.',
        },
        {
          icon: 'MapPin',
          title: '3. Pick-up or delivery',
          text: 'Pick-up at the agency or home delivery, as you prefer.',
        },
      ],
      note: 'Parcel tracking is handled directly with the agency.',
      link: null,
    },
    offerSections: [
      {
        eyebrow: 'Our packages',
        title: 'Several options for every need.',
        titleMobile: null,
        lead: 'Scroll through the packages, then ask for your quote.',
        leadMobile: 'Scroll, then ask for your quote.',
        items: [
          offer({
            id: 'off_repas_semaine',
            title: 'Meal delivery — weekdays',
            text: 'Lunch delivered Monday to Friday',
            textMobile: 'Lunch, Monday to Friday',
            actionLabel: 'Ask for a quote',
            actionLabelMobile: 'Quote',
            serviceSlug: 'portage-livraison-repas',
            visual: photo('livraison', 'prox-repas', 1280, 960),
          }),
          offer({
            id: 'off_courses_semaine',
            title: 'Weekly groceries',
            text: 'List sent on WhatsApp · same-day delivery',
            textMobile: 'List on WhatsApp · same-day delivery',
            actionLabel: 'Ask for a quote',
            actionLabelMobile: 'Quote',
            serviceSlug: 'livraison-courses-commandes',
            visual: photo('courses', 'prox-courses', 1536, 1024),
          }),
          offer({
            id: 'off_colis_express',
            title: 'Parcels and mail — express',
            titleMobile: 'Express parcels',
            text: 'Same-day collection and delivery in Douala',
            textMobile: 'Same-day collection and delivery',
            actionLabel: 'Ask for a quote',
            actionLabelMobile: 'Quote',
            serviceSlug: 'collecte-livraison-colis-courrier',
            visual: photo('colis', 'prox-colis', 1536, 1024),
          }),
          offer({
            id: 'off_pressing',
            title: 'Dry cleaning and laundry',
            text: 'Pick-up, washing, ironing · back within 48 hours',
            textMobile: 'Pick-up, washing, ironing · 48 hours',
            actionLabel: 'Ask for a quote',
            actionLabelMobile: 'Quote',
            serviceSlug: 'pressing-laverie',
            visual: photo('livraison', 'prox-laverie', 1536, 1024),
          }),
          offer({
            id: 'off_scooter',
            title: 'Scooter delivery',
            text: 'Small urgent deliveries · 30 to 60 min depending on the area',
            textMobile: 'Urgent deliveries · 30 to 60 min',
            actionLabel: 'Ask for a quote',
            actionLabelMobile: 'Quote',
            serviceSlug: 'collecte-livraison-colis-courrier',
            visual: photo('livraison', 'prox-scooter', 1280, 960),
          }),
        ],
      },
    ],
    processTitle: 'We take care of everything, from the first message to the follow-up.',
    processSteps: [
      { title: 'Your request', text: 'Form, WhatsApp or appointment.' },
      { title: 'Tailor-made quote', text: 'A clear proposal within 24 hours.' },
      { title: 'Service', text: 'A selected provider, constant follow-up.' },
      { title: 'Your feedback', text: 'A short questionnaire after every service.' },
    ],
    testimonial: review({
      id: 'rev_clarisse',
      authorName: 'Clarisse N.',
      initials: 'CN',
      city: 'Akwa',
      text: 'Ma mère reçoit ses repas chaque midi et ses courses le samedi. Je suis rassurée et toujours informée.',
      service: {
        slug: 'portage-livraison-repas',
        name: 'Meal delivery',
        categorySlug: 'services-de-proximite',
        categoryName: 'Local services',
      },
      date: '2026-09-20T10:00:00.000Z',
    }),
    testimonialVisual: photo('livraison', 'prox-repas', 1280, 960),
    quoteFields: [
      { name: 'city', label: 'City', type: 'city', required: false, options: CITIES, width: 'half' },
      {
        name: 'frequency',
        label: 'Frequency',
        type: 'select',
        required: false,
        options: ['Just once', 'Every week', 'Several times a week', 'Every month'],
        width: 'half',
      },
      {
        name: 'address',
        label: 'Address or neighbourhood',
        type: 'text',
        required: false,
        placeholder: 'E.g. Bonapriso, Douala',
        width: 'full',
      },
    ],
    cta: {
      title: 'Need a hand\nwith daily life?',
      text: 'Meals, groceries or parcels: describe your need, we reply within 24 hours.',
    },
    seo: {
      title: 'Local services in Douala: meals, groceries, parcels and laundry',
      description:
        'Meal delivery, grocery delivery, parcel and mail collection, dry cleaning and laundry: we look after your loved ones in Douala.',
      ogImageUrl: null,
      noindex: false,
    },
  },
};

/** Autres rubriques proposées en bas de page (maquettes) ; par défaut, les rubriques suivantes, trois au plus. */
export const otherCategorySlugs: Record<string, string[]> = {
  'services-a-domicile': ['experience', 'immobilier', 'culture-evenementiel'],
  experience: ['immobilier', 'services-de-proximite', 'culture-evenementiel'],
  immobilier: ['experience', 'services-de-proximite', 'culture-evenementiel'],
  'services-de-proximite': ['experience', 'immobilier', 'culture-evenementiel'],
};
