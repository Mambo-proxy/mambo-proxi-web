import type { ServiceSummary } from '@/lib/api/schema';

type Text = { fr: string; en: string };
type Illustration = ServiceSummary['visual']['illustration'];

export type ServiceSeed = {
  slug: string;
  name: Text;
  shortName?: Text;
  summary: Text;
  icon: string;
  illustration: Illustration;
  photo?: { url: string; width: number; height: number };
  kind?: ServiceSummary['kind'];
  featuredOnHome?: boolean;
};

/**
 * Catalogue des nouvelles maquettes (page « Nos services » `58:828`, accueil `251:25576`, fiche `253:25267`) : 5 rubriques, 26 services,
 * textes français relevés mot pour mot, traductions anglaises rédigées pour le site.
 */
export const catalogueSeed: Record<string, ServiceSeed[]> = {
  'services-a-domicile': [
    {
      slug: 'maison-essentiel',
      kind: 'formula',
      name: { fr: 'Maison Essentiel', en: 'Home Essential' },
      summary: { fr: 'Entretien du logement · 2 h.', en: 'Home cleaning · 2 hours.' },
      icon: 'Utensils',
      illustration: 'logement',
      photo: { url: '/photos/formule-maison.png', width: 1280, height: 960 },
    },
    {
      slug: 'maison-auto',
      kind: 'formula',
      name: { fr: 'Maison + Auto', en: 'Home + Car' },
      summary: {
        fr: 'Entretien du logement et nettoyage du véhicule · 3 h.',
        en: 'Home cleaning and car cleaning · 3 hours.',
      },
      icon: 'ShoppingCart',
      illustration: 'voiture',
      photo: { url: '/photos/formule-maison-auto.png', width: 1536, height: 1024 },
    },
    {
      slug: 'maison-linge',
      kind: 'formula',
      name: { fr: 'Maison + Linge', en: 'Home + Laundry' },
      summary: {
        fr: 'Entretien du logement et collecte du linge · 2 h + collecte. Pressing facturé séparément.',
        en: 'Home cleaning and laundry pick-up · 2 hours + pick-up. Dry cleaning charged separately.',
      },
      icon: 'Package',
      illustration: 'logement',
      photo: { url: '/photos/formule-maison-linge.png', width: 1536, height: 1024 },
    },
    {
      slug: 'maison-auto-linge',
      kind: 'formula',
      name: { fr: 'Maison + Auto + Linge', en: 'Home + Car + Laundry' },
      summary: {
        fr: 'Entretien du logement, nettoyage du véhicule et collecte du linge · 3 h + collecte. Pressing facturé séparément.',
        en: 'Home cleaning, car cleaning and laundry pick-up · 3 hours + pick-up. Dry cleaning charged separately.',
      },
      icon: 'Package',
      illustration: 'voiture',
      photo: { url: '/photos/formule-maison-auto-linge.png', width: 1536, height: 1024 },
    },
    // Services à la carte : présentés sous les formules (fiche « Entretien du logement » `253:25267`).
    {
      slug: 'entretien-du-logement',
      name: { fr: 'Entretien du logement', en: 'Home cleaning' },
      summary: {
        fr: 'Ménage, cuisine et salle de bain, sols et surfaces, ponctuellement ou chaque semaine.',
        en: 'Cleaning, kitchen and bathroom, floors and surfaces, as a one-off or every week.',
      },
      icon: 'Sparkles',
      illustration: 'logement',
      photo: { url: '/photos/fiche-entretien.png', width: 860, height: 480 },
    },
    {
      slug: 'nettoyage-automobile',
      name: { fr: 'Nettoyage automobile', en: 'Car cleaning' },
      summary: { fr: 'Votre véhicule nettoyé à domicile.', en: 'Your vehicle cleaned at home.' },
      icon: 'Car',
      illustration: 'voiture',
      photo: { url: '/photos/formule-maison-auto.png', width: 1536, height: 1024 },
    },
  ],
  experience: [
    {
      slug: 'location-voiture',
      featuredOnHome: true,
      name: { fr: 'Location de voiture', en: 'Car rental' },
      summary: {
        fr: 'Véhicules récents, avec ou sans chauffeur, pour vos trajets et vos séjours.',
        en: 'Recent vehicles, with or without a driver, for your trips and stays.',
      },
      icon: 'Car',
      illustration: 'voiture',
      photo: { url: '/photos/offre-citadine.png', width: 470, height: 325 },
    },
    {
      slug: 'photographe',
      name: { fr: 'Photographe', en: 'Photographer' },
      summary: {
        fr: 'Portraits, événements, reportages : vos moments immortalisés.',
        en: 'Portraits, events, reports: your moments captured.',
      },
      icon: 'Camera',
      illustration: 'photo',
      photo: { url: '/photos/offre-photographe.png', width: 380, height: 340 },
    },
    {
      slug: 'chef-prive',
      featuredOnHome: true,
      name: { fr: 'Chef privé', en: 'Private chef' },
      summary: {
        fr: 'Un chef à domicile pour vos dîners, réceptions et grandes occasions.',
        en: 'A chef at your home for your dinners, receptions and special occasions.',
      },
      icon: 'ChefHat',
      illustration: 'chef',
      photo: { url: '/photos/chef-2.png', width: 1536, height: 1024 },
    },
    {
      slug: 'massage-bien-etre',
      name: { fr: 'Massage bien-être', en: 'Wellness massage' },
      summary: {
        fr: 'Des praticiens qualifiés, chez vous ou sur votre lieu de séjour.',
        en: 'Qualified practitioners, at your home or where you are staying.',
      },
      icon: 'Flower2',
      illustration: 'massage',
      photo: { url: '/photos/offre-massage.png', width: 435, height: 470 },
    },
    {
      slug: 'services-evenementiels',
      name: { fr: 'Services événementiels', en: 'Event services' },
      summary: {
        fr: 'Décoration, traiteur, animation : des prestataires pour vos événements privés.',
        en: 'Decoration, catering, entertainment: providers for your private events.',
      },
      icon: 'PartyPopper',
      illustration: 'evenement',
      photo: { url: '/photos/offre-buffet-reception.png', width: 1536, height: 1024 },
    },
  ],
  immobilier: [
    {
      slug: 'achat-vente-biens',
      name: { fr: 'Achat et vente de biens immobiliers', en: 'Buying and selling property' },
      summary: {
        fr: 'Maisons, appartements, villas, immeubles : nous vous accompagnons pour acheter ou vendre.',
        en: 'Houses, apartments, villas, buildings: we help you buy or sell.',
      },
      icon: 'Wrench',
      illustration: 'logement',
    },
    {
      slug: 'recherche-logement',
      name: { fr: 'Recherche de logement', en: 'Home search' },
      summary: {
        fr: 'Nous trouvons le bien qui correspond à vos critères et à votre budget.',
        en: 'We find the property that matches your criteria and your budget.',
      },
      icon: 'Search',
      illustration: 'logement',
    },
    {
      slug: 'location-sous-location-colocation',
      name: { fr: 'Location, sous-location et colocation', en: 'Rental, subletting and flatsharing' },
      summary: {
        fr: 'Des solutions souples, avec des contrats clairs et un suivi.',
        en: 'Flexible solutions, with clear contracts and follow-up.',
      },
      icon: 'Key',
      illustration: 'logement',
    },
    {
      slug: 'logement-adapte-meuble',
      name: { fr: 'Logement adapté et appartement meublé', en: 'Adapted housing and furnished apartments' },
      shortName: { fr: 'Logement adapté et appartement meublé', en: 'Adapted and furnished housing' },
      summary: {
        fr: 'Logements thérapeutiques ou adaptés, et meublés prêts à vivre.',
        en: 'Therapeutic or adapted homes, and furnished apartments ready to move into.',
      },
      icon: 'HouseHeart',
      illustration: 'logement',
    },
    {
      slug: 'gestion-locative',
      name: { fr: 'Gestion locative', en: 'Property management' },
      summary: {
        fr: 'Nous gérons votre bien à Douala, du locataire à l’entretien.',
        en: 'We manage your property in Douala, from tenants to maintenance.',
      },
      icon: 'Building',
      illustration: 'equipe',
    },
    {
      slug: 'accompagnement-installation',
      name: { fr: "Accompagnement à l'installation", en: 'Help settling in' },
      summary: {
        fr: 'Démarches, abonnements, ameublement : on vous aide à vous installer.',
        en: 'Paperwork, subscriptions, furnishing: we help you settle in.',
      },
      icon: 'House',
      illustration: 'accueil',
    },
    {
      slug: 'logement-temporaire',
      name: { fr: 'Solutions de logement temporaire', en: 'Temporary housing solutions' },
      summary: {
        fr: 'Un logement pour quelques jours ou quelques mois, prêt à votre arrivée.',
        en: 'A home for a few days or a few months, ready when you arrive.',
      },
      icon: 'Clock',
      illustration: 'logement',
    },
  ],
  'services-de-proximite': [
    {
      slug: 'portage-livraison-repas',
      name: { fr: 'Portage et livraison de repas', en: 'Meal delivery' },
      summary: {
        fr: 'Des repas livrés au domicile de la personne accompagnée.',
        en: 'Meals delivered to the home of the person you support.',
      },
      icon: 'Utensils',
      illustration: 'livraison',
    },
    {
      slug: 'livraison-courses-commandes',
      name: { fr: 'Livraison de courses et de commandes', en: 'Grocery and order delivery' },
      summary: {
        fr: 'Vos courses et achats effectués, puis livrés au bénéficiaire.',
        en: 'Your groceries and purchases made, then delivered to the recipient.',
      },
      icon: 'ShoppingCart',
      illustration: 'livraison',
    },
    {
      slug: 'collecte-livraison-colis-courrier',
      name: {
        fr: 'Collecte et livraison de colis et de courrier',
        en: 'Parcel and mail collection and delivery',
      },
      summary: {
        fr: 'Collecte chez l’expéditeur et livraison à l’adresse du destinataire.',
        en: "Collection from the sender and delivery to the recipient's address.",
      },
      icon: 'Package',
      illustration: 'colis',
    },
    {
      slug: 'pressing-laverie',
      name: { fr: 'Pressing et laverie', en: 'Dry cleaning and laundry' },
      summary: {
        fr: 'Lavage automatique, repassage, petite couture, collecte et retour du linge à domicile.',
        en: 'Machine washing, ironing, minor alterations, laundry pick-up and return at home.',
      },
      icon: 'Package',
      illustration: 'livraison',
    },
  ],
  'culture-evenementiel': [
    {
      slug: 'decouverte-cameroun',
      name: { fr: 'Découverte du Cameroun', en: 'Discover Cameroon' },
      summary: {
        fr: 'Circuits et visites pour découvrir le pays autrement.',
        en: 'Tours and visits to discover the country differently.',
      },
      icon: 'Compass',
      illustration: 'culture',
    },
    {
      slug: 'activites-culturelles-loisirs-sorties',
      name: {
        fr: 'Activités culturelles, loisirs et sorties',
        en: 'Cultural activities, leisure and outings',
      },
      summary: {
        fr: "Concerts, expositions, sorties : l'agenda culturel à portée de main.",
        en: 'Concerts, exhibitions, outings: the cultural calendar at your fingertips.',
      },
      icon: 'Sparkles',
      illustration: 'culture',
    },
    {
      slug: 'organisation-activites-evenements',
      name: { fr: "Organisation d'activités et d'événements", en: 'Organising activities and events' },
      summary: {
        fr: 'Des sorties et des événements conçus et organisés par Mambo.',
        en: 'Outings and events designed and organised by Mambo.',
      },
      icon: 'CalendarCheck',
      illustration: 'evenement',
    },
    {
      slug: 'decouverte-integration-locale',
      name: { fr: 'Découverte et intégration locale', en: 'Discovery and local integration' },
      summary: {
        fr: 'Repères, rencontres et conseils pour vous sentir chez vous.',
        en: 'Landmarks, meetings and advice to help you feel at home.',
      },
      icon: 'Globe',
      illustration: 'culture',
    },
  ],
};
