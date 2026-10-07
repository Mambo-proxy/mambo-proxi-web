import type { Page, Visual } from '@/lib/api/schema';

/**
 * Pages éditoriales simulées, relevées dans les maquettes (qa/inventory/site). Elles complètent les exemples du contrat
 * (accueil, services) et servent de référence pour les données d'amorçage de l'API.
 */
const visual = (illustration: Visual['illustration']): Visual => ({ illustration, image: null, alt: '' });

const UPDATED_AT = '2026-10-05T08:00:00.000Z';

const quiSommesNous: Page = {
  key: 'qui-sommes-nous',
  title: 'Qui sommes-nous ?',
  updatedAt: UPDATED_AT,
  isPreview: false,
  seo: {
    title: 'Qui sommes-nous ? Une agence entre la France et le Cameroun',
    description:
      'MAMBO Proxi, agence de coordination multiservices : immobilier, services de proximité, expérience, culture et événementiel, entre la France et le Cameroun.',
    ogImageUrl: null,
    noindex: false,
  },
  sections: [
    {
      id: 'hero',
      type: 'hero',
      enabled: true,
      variant: 'page',
      eyebrow: 'Qui sommes-nous ?',
      title: 'Une agence qui relie ==la France et le Cameroun.==',
      lead: 'MAMBO Proxi est une agence de coordination multiservices. Nous accompagnons les personnes, les familles et les organisations dans l’immobilier, les services de proximité, l’expérience, la culture et l’événementiel.',
      visual: visual('equipe'),
      showWhatsapp: false,
      anchors: [
        { label: 'Présentation', href: '#presentation', external: false },
        { label: 'Notre équipe', href: '#notre-equipe', external: false },
        { label: 'Nos valeurs', href: '#nos-valeurs', external: false },
        { label: 'Pourquoi Mambo Proxi ?', href: '#pourquoi-mambo', external: false },
      ],
    },
    {
      id: 'presentation',
      type: 'textMedia',
      reverse: false,
      enabled: true,
      anchor: 'presentation',
      tone: 'light',
      eyebrow: 'Présentation',
      title: 'Mambo, ce n’est pas qu’un service. C’est une expérience pensée pour vous.',
      paragraphs: [
        'Né du constat qu’il est difficile d’organiser sa vie au Cameroun à distance, ou d’y trouver des prestataires fiables, MAMBO Proxi réunit en un seul lieu des services essentiels et des expériences de qualité.',
        'Notre rôle : comprendre votre besoin, trouver la bonne solution, coordonner les prestataires et vous tenir informé à chaque étape. En France comme au Cameroun, vous avez un seul interlocuteur.',
      ],
      chips: ['Vie', 'Expérience', 'Culture', 'Transmission'],
      visual: null,
      quote: null,
      signature: null,
    },
    {
      id: 'fondatrice',
      type: 'textMedia',
      reverse: false,
      enabled: true,
      tone: 'muted',
      eyebrow: 'Le parcours de la fondatrice',
      title: null,
      quote:
        'J’ai voulu créer le service dont chaque famille entre la France et le Cameroun a besoin : quelqu’un de confiance, sur place, qui s’occupe de tout comme pour les siens.',
      paragraphs: [
        'Fondatrice de MAMBO Proxi, Mireille Bell a fait de la proximité le cœur de son engagement : relier deux pays qu’elle connaît intimement et accompagner chacun avec attention et exigence.',
      ],
      signature: 'Mireille Bell — Fondatrice et directrice',
      visual: visual('portrait'),
      chips: [],
    },
    {
      id: 'equipe',
      type: 'team',
      enabled: true,
      anchor: 'notre-equipe',
      tone: 'light',
      eyebrow: 'Notre équipe',
      title: 'Des visages derrière chaque service',
      lead: 'Une équipe présente en France et au Cameroun, joignable et à l’écoute.',
      members: [
        { name: 'Prénom Nom', role: 'Coordination', location: 'Douala', visual: visual('portrait') },
        { name: 'Prénom Nom', role: 'Relation clients', location: 'France', visual: visual('portrait') },
        { name: 'Prénom Nom', role: 'Immobilier', location: 'Yaoundé', visual: visual('portrait') },
        { name: 'Prénom Nom', role: 'Partenariats', location: 'Douala', visual: visual('portrait') },
      ],
    },
    {
      id: 'valeurs',
      type: 'cardGrid',
      enabled: true,
      anchor: 'nos-valeurs',
      tone: 'dark',
      layout: 'cards',
      columns: 4,
      eyebrow: 'Nos valeurs',
      title: 'Ce qui nous guide, chaque jour.',
      items: [
        {
          icon: 'Users',
          title: 'Proximité',
          text: 'Être présents, accessibles et attentifs, ici et là-bas.',
        },
        {
          icon: 'ShieldCheck',
          title: 'Confiance',
          text: 'Des prestataires vérifiés, des engagements tenus.',
        },
        { icon: 'Sparkles', title: 'Exigence', text: 'Le même niveau de qualité, quel que soit le service.' },
        {
          icon: 'GraduationCap',
          title: 'Transmission',
          text: 'Partager la culture, les savoir-faire et les bonnes pratiques.',
        },
      ],
    },
    {
      id: 'pourquoi',
      type: 'featureList',
      enabled: true,
      anchor: 'pourquoi-mambo',
      tone: 'light',
      eyebrow: 'Pourquoi Mambo Proxi ?',
      title: 'Trois engagements, une seule promesse.',
      items: [
        {
          icon: 'Users',
          number: '01',
          title: 'Une équipe à vos côtés',
          text: 'Un interlocuteur unique qui vous accompagne pas à pas.',
        },
        {
          icon: 'ShieldCheck',
          number: '02',
          title: 'Des solutions concrètes et durables',
          text: 'Des prestataires vérifiés, suivis et évalués.',
        },
        {
          icon: 'Globe',
          number: '03',
          title: 'Un pont entre la France et le Cameroun',
          text: 'Préparez depuis la France, nous agissons sur place.',
        },
      ],
      figures: [
        { key: 'projects', value: 150, prefix: '', suffix: '+', decimals: 0, label: 'projets accompagnés' },
        { key: 'partners', value: 40, prefix: '', suffix: '+', decimals: 0, label: 'partenaires engagés' },
        { key: 'countries', value: 2, prefix: '', decimals: 0, label: 'pays couverts' },
        { key: 'services', value: 19, prefix: '', decimals: 0, label: 'services' },
      ],
      visual: null,
    },
    {
      id: 'cta',
      type: 'ctaBand',
      enabled: true,
      title: 'Faisons\nconnaissance.',
      text: 'Une question, un projet ? Échangeons par téléphone, WhatsApp ou lors d’un rendez-vous.',
      primaryCta: { label: 'Demander un devis gratuit', href: '/devis', external: false },
      showWhatsapp: true,
    },
  ],
};

const mission: Page = {
  key: 'mission',
  title: 'Mission',
  updatedAt: UPDATED_AT,
  isPreview: false,
  seo: {
    title: 'Notre mission : simplifier la vie, rapprocher les distances',
    description:
      'Notre mission, notre vision, nos engagements et la méthode qui nous permet de coordonner chaque service entre la France et le Cameroun.',
    ogImageUrl: null,
    noindex: false,
  },
  sections: [
    {
      id: 'hero',
      type: 'hero',
      enabled: true,
      variant: 'page',
      eyebrow: 'Notre mission',
      title: 'Simplifier la vie, ==rapprocher les distances.==',
      lead: 'Notre mission, notre vision, nos engagements et la méthode qui nous permet de coordonner chaque service avec rigueur.',
      visual: visual('accueil'),
      showWhatsapp: false,
      anchors: [
        { label: 'Notre mission', href: '#mission', external: false },
        { label: 'Notre vision', href: '#vision', external: false },
        { label: 'Nos engagements', href: '#engagements', external: false },
        { label: 'Notre méthode', href: '#methode', external: false },
      ],
    },
    {
      id: 'mission-vision',
      type: 'cardGrid',
      enabled: true,
      tone: 'light',
      layout: 'compact',
      columns: 2,
      items: [
        {
          icon: 'ShieldCheck',
          title: 'Notre mission',
          tone: 'orange',
          text: 'Accompagner les personnes, les familles et les organisations entre la France et le Cameroun, en leur offrant des solutions fiables, humaines et coordonnées pour se loger, se simplifier le quotidien et vivre des expériences de qualité.',
        },
        {
          icon: 'Compass',
          title: 'Notre vision',
          tone: 'dark',
          text: 'Devenir la référence de la coordination de services entre la France et le Cameroun : un lieu unique où chacun trouve un interlocuteur de confiance, quel que soit son besoin.',
        },
      ],
    },
    {
      id: 'engagements',
      type: 'cardGrid',
      enabled: true,
      anchor: 'engagements',
      tone: 'muted',
      layout: 'numbered',
      columns: 2,
      eyebrow: 'Nos engagements',
      title: 'Ce que nous vous promettons, à chaque demande.',
      items: [
        {
          number: '01',
          title: 'Écoute',
          text: 'Comprendre votre besoin réel avant de proposer une solution.',
        },
        {
          number: '02',
          title: 'Transparence',
          text: 'Un devis clair, sans frais cachés, avant toute prestation.',
        },
        { number: '03', title: 'Fiabilité', text: 'Des prestataires vérifiés, suivis et évalués.' },
        { number: '04', title: 'Réactivité', text: 'Une réponse sous 24 h, un suivi à chaque étape.' },
        {
          number: '05',
          title: 'Confidentialité',
          text: 'Vos informations protégées et utilisées avec votre accord.',
        },
        {
          number: '06',
          title: 'Amélioration continue',
          text: 'Votre avis après chaque prestation pour progresser.',
        },
      ],
    },
    {
      id: 'methode',
      type: 'steps',
      enabled: true,
      anchor: 'methode',
      tone: 'light',
      layout: 'rail',
      eyebrow: 'Notre méthode de coordination',
      title: 'Cinq étapes, un seul interlocuteur.',
      lead: 'De votre premier message jusqu’à votre avis, chaque demande suit le même parcours.',
      items: [
        {
          icon: 'FileText',
          title: 'Écoute',
          text: 'Vous nous décrivez votre besoin par formulaire, WhatsApp ou rendez-vous.',
        },
        {
          icon: 'Search',
          title: 'Analyse',
          text: 'Nous identifions la solution et les prestataires les plus adaptés.',
        },
        {
          icon: 'Mail',
          title: 'Proposition',
          text: 'Vous recevez un devis clair et personnalisé sous 24 h.',
        },
        {
          icon: 'Users',
          title: 'Coordination',
          text: 'Nous organisons et supervisons l’intervention des prestataires.',
        },
        {
          icon: 'Sparkles',
          title: 'Suivi et évaluation',
          text: 'Un questionnaire de satisfaction clôture chaque prestation.',
        },
      ],
    },
    {
      id: 'citation',
      type: 'quote',
      enabled: true,
      tone: 'green',
      text: 'Mambo, ce n’est pas qu’un service. C’est une expérience pensée pour vous.',
      author: 'La signature de MAMBO Proxi',
      visual: visual('culture'),
    },
    {
      id: 'cta',
      type: 'ctaBand',
      enabled: true,
      title: 'Une demande\nà nous confier ?',
      text: 'Nous l’étudions avec soin et vous répondons sous 24 h.',
      primaryCta: { label: 'Demander un devis gratuit', href: '/devis', external: false },
      showWhatsapp: true,
    },
  ],
};

export const pages: Partial<Record<Page['key'], Page>> = {
  'qui-sommes-nous': quiSommesNous,
  mission,
};
