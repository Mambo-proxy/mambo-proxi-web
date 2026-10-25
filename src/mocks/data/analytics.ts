import type { AnalyticsAction, AnalyticsActionCount, AnalyticsSummary } from '@/lib/api/schema';

/**
 * Mesure d'audience simulée : données de démonstration calculées pour chaque jour (déterministes, avec une légère
 * progression et des creux le week-end), auxquelles s'ajoutent les événements reçus pendant la session par
 * `POST /v1/analytics/events`. Le magasin du navigateur et celui de Node (rendu serveur, tests) sont distincts ;
 * dans le navigateur, il est recopié dans `sessionStorage` pour survivre au passage du site au back-office
 * (chargement complet de la page).
 */

export type StoredEvent = {
  type: 'page_view' | 'action';
  action: AnalyticsAction | null;
  path: string;
  lang: 'fr' | 'en';
  occurredAt: string;
  visitorId: string | null;
};

/** Lot reçu, tel que vérifié par les tests de bout en bout (consentement, identifiant, événements). */
export type StoredBatch = {
  consent: boolean;
  visitorId: string | null;
  events: { type: StoredEvent['type']; action: AnalyticsAction | null; path: string }[];
};

export const MOCK_ANALYTICS_STORAGE_KEY = 'mp-mock-analytics';
const MAX_STORED = 500;

type Store = { events: StoredEvent[]; batches: StoredBatch[] };

const memory: Store = { events: [], batches: [] };

function browserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

function load(): Store {
  const storage = browserStorage();
  if (!storage) return memory;
  try {
    const raw = storage.getItem(MOCK_ANALYTICS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Store>) : null;
    return { events: parsed?.events ?? [], batches: parsed?.batches ?? [] };
  } catch {
    return { events: [], batches: [] };
  }
}

function save(store: Store) {
  store.events.splice(0, Math.max(0, store.events.length - MAX_STORED));
  store.batches.splice(0, Math.max(0, store.batches.length - MAX_STORED));
  const storage = browserStorage();
  if (!storage) return;
  try {
    storage.setItem(MOCK_ANALYTICS_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Stockage plein ou indisponible : la session simulée reste en mémoire.
  }
}

/** Enregistre un lot accepté. */
export function recordAnalyticsBatch(batch: StoredBatch, events: StoredEvent[]) {
  const store = load();
  store.batches.push(batch);
  store.events.push(...events);
  save(store);
}

/** Événements reçus pendant la session. */
export function sessionAnalyticsEvents(): StoredEvent[] {
  return load().events;
}

/** Vide le magasin (tests). */
export function resetAnalyticsStore() {
  memory.events = [];
  memory.batches = [];
  browserStorage()?.removeItem(MOCK_ANALYTICS_STORAGE_KEY);
}

// ─────────────────────────── Données de démonstration ───────────────────────────

export const ANALYTICS_ACTION_LABELS: Record<AnalyticsAction, string> = {
  whatsapp: 'WhatsApp',
  quote: 'Devis',
  call: 'Appel',
  participate: '«\u00A0Je participe\u00A0»',
  newsletter: 'Inscription newsletter',
  email: 'E-mail',
  appointment: 'Rendez-vous',
  sign_up: 'Inscription',
  contact: 'Message de contact',
  application: 'Candidature',
  partner: 'Demande de partenariat',
  training: 'Demande de formation',
};

/** Part de chaque action dans les clics (exemple du contrat sur 30 jours). */
const ACTION_SHARES: [AnalyticsAction, number][] = [
  ['whatsapp', 0.346],
  ['quote', 0.272],
  ['call', 0.111],
  ['participate', 0.078],
  ['newsletter', 0.068],
  ['email', 0.043],
  ['appointment', 0.039],
  ['sign_up', 0.023],
  ['contact', 0.02],
  ['application', 0],
  ['partner', 0],
  ['training', 0],
];

/** Pages les plus vues : part des pages vues, des visiteurs et des actions (exemple du contrat). */
const PAGES: { path: string; title: string; views: number; visitors: number; actions: number }[] = [
  { path: '/', title: 'Accueil', views: 0.312, visitors: 0.646, actions: 0.311 },
  {
    path: '/services/experience/chef-prive',
    title: 'Chef privé',
    views: 0.11,
    visitors: 0.267,
    actions: 0.152,
  },
  {
    path: '/services/services-a-domicile',
    title: 'Services à domicile',
    views: 0.086,
    visitors: 0.216,
    actions: 0.084,
  },
  {
    path: '/zones-d-intervention',
    title: 'Zones d’intervention',
    views: 0.07,
    visitors: 0.199,
    actions: 0.058,
  },
  { path: '/devis', title: 'Demande de devis', views: 0.066, visitors: 0.183, actions: 0.128 },
  {
    path: '/services/immobilier/recherche-logement',
    title: 'Recherche de logement',
    views: 0.054,
    visitors: 0.139,
    actions: 0.068,
  },
  { path: '/magazine', title: 'Magazine', views: 0.048, visitors: 0.133, actions: 0.037 },
  { path: '/recrutement', title: 'Recrutement', views: 0.039, visitors: 0.108, actions: 0 },
  { path: '/contact', title: 'Contact', views: 0.035, visitors: 0.101, actions: 0.117 },
  { path: '/qui-sommes-nous', title: 'Qui sommes-nous', views: 0.031, visitors: 0.091, actions: 0.019 },
];

/** Détail des actions des pages qui en génèrent le plus (parts des actions de la page). */
const PAGE_ACTIONS: Record<string, [AnalyticsAction, number][]> = {
  '/': [
    ['whatsapp', 0.384],
    ['quote', 0.272],
    ['participate', 0.172],
    ['call', 0.099],
    ['newsletter', 0.073],
  ],
  '/services/experience/chef-prive': [
    ['quote', 0.514],
    ['whatsapp', 0.405],
    ['call', 0.081],
  ],
  '/devis': [['quote', 1]],
  '/contact': [
    ['whatsapp', 0.351],
    ['email', 0.263],
    ['call', 0.211],
    ['contact', 0.175],
  ],
  '/services/services-a-domicile': [
    ['quote', 0.537],
    ['whatsapp', 0.463],
  ],
};

const TITLES: Record<string, string> = Object.fromEntries(PAGES.map((page) => [page.path, page.title]));

const DAY = 86_400_000;
const PERIOD_DAYS: Record<AnalyticsSummary['period'], number> = { '7d': 7, '30d': 30, '90d': 90 };
const EN_SHARE = 0.17;

/** Valeur pseudo-aléatoire stable dans [0, 1) pour une date (`2026-10-24`). */
function noise(date: string): number {
  let hash = 2166136261;
  for (const char of date) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return ((hash >>> 0) % 1000) / 1000;
}

/** Pages vues, visiteurs et actions simulés d'un jour (toutes langues). */
function demoDay(date: string) {
  const day = new Date(`${date}T12:00:00Z`);
  const weekday = day.getUTCDay();
  // Progression d'environ 15 % par trimestre, creux le samedi et le dimanche.
  const trend = 1 + ((day.getTime() - Date.UTC(2026, 0, 1)) / DAY) * 0.0016;
  const weekly = weekday === 0 ? 0.74 : weekday === 6 ? 0.82 : 1;
  const pageViews = Math.round(185 * trend * weekly * (0.88 + noise(date) * 0.24));
  return {
    pageViews,
    visitors: Math.round(pageViews / (3.55 + noise(`${date}v`) * 0.4)),
    actions: Math.round(pageViews * (0.058 + noise(`${date}a`) * 0.014)),
  };
}

const isoDate = (time: number) => new Date(time).toISOString().slice(0, 10);

const deltaPercent = (value: number, previous: number) =>
  previous > 0 ? Math.round(((value - previous) / previous) * 1000) / 10 : null;

const kpi = (value: number, previous: number) => ({
  value,
  previous,
  deltaPercent: deltaPercent(value, previous),
  unit: null,
});

/**
 * Statistiques de la période : jours entiers jusqu'à aujourd'hui inclus (l'API s'arrête à hier ; les mocks incluent
 * le jour en cours pour afficher aussitôt les événements de la session), comparées à la période précédente.
 */
export function buildAnalyticsSummary(
  period: AnalyticsSummary['period'],
  lang: 'fr' | 'en' | null,
  now = Date.now(),
): AnalyticsSummary {
  const days = PERIOD_DAYS[period];
  const today = isoDate(now);
  const share = lang === 'en' ? EN_SHARE : lang === 'fr' ? 1 - EN_SHARE : 1;
  const dates = Array.from({ length: days }, (_, index) => isoDate(now - (days - 1 - index) * DAY));
  const previousDates = Array.from({ length: days }, (_, index) =>
    isoDate(now - (2 * days - 1 - index) * DAY),
  );
  const from = dates[0] ?? today;

  const session = sessionAnalyticsEvents().filter(
    (event) => event.occurredAt.slice(0, 10) >= from && (!lang || event.lang === lang),
  );
  const sessionOn = (date: string) => session.filter((event) => event.occurredAt.slice(0, 10) === date);

  const series = dates.map((date) => {
    const demo = demoDay(date);
    // Journée en cours : seulement les heures déjà écoulées (valeurs stables d'un appel à l'autre dans l'heure).
    const elapsed = date === today ? Math.floor((now % DAY) / 3_600_000) / 24 : 1;
    const events = sessionOn(date);
    return {
      date,
      pageViews:
        Math.round(demo.pageViews * share * elapsed) +
        events.filter((event) => event.type === 'page_view').length,
      visitors:
        Math.round(demo.visitors * share * elapsed) +
        new Set(events.flatMap((event) => (event.visitorId ? [event.visitorId] : []))).size,
      actions:
        Math.round(demo.actions * share * elapsed) + events.filter((event) => event.type === 'action').length,
    };
  });
  const previous = previousDates.map((date) => demoDay(date));
  const sum = (
    rows: { pageViews: number; visitors: number; actions: number }[],
    key: 'pageViews' | 'visitors' | 'actions',
  ) => rows.reduce((total, row) => total + row[key], 0);

  const pageViews = sum(series, 'pageViews');
  const actions = sum(series, 'actions');
  // Visiteurs uniques de la période : moins que la somme des visiteurs de chaque jour (visites répétées).
  const visitors = Math.round(sum(series, 'visitors') * 0.9);
  const previousPageViews = Math.round(sum(previous, 'pageViews') * share);
  const previousActions = Math.round(sum(previous, 'actions') * share);
  const previousVisitors = Math.round(sum(previous, 'visitors') * share * 0.9);

  const demoActions = actions - session.filter((event) => event.type === 'action').length;
  const sessionActions = (action: AnalyticsAction) =>
    session.filter((event) => event.action === action).length;
  // Tri stable : à égalité, l'ordre du contrat.
  const actionCounts: AnalyticsActionCount[] = ACTION_SHARES.map(([action, ratio]) => {
    const count = Math.round(demoActions * ratio) + sessionActions(action);
    const before = Math.round(previousActions * ratio);
    return {
      action,
      label: ANALYTICS_ACTION_LABELS[action],
      count,
      previous: before,
      deltaPercent: deltaPercent(count, before),
    };
  }).sort((a, b) => b.count - a.count);

  // Pages : démonstration, plus les pages de la session absentes de la liste.
  const sessionPaths = [...new Set(session.map((event) => event.path))];
  const demoPageViews = pageViews - session.filter((event) => event.type === 'page_view').length;
  const pages = [
    ...PAGES,
    ...sessionPaths
      .filter((path) => !(path in TITLES))
      .map((path) => ({ path, title: path, views: 0, visitors: 0, actions: 0 })),
  ].map((page) => {
    const events = session.filter((event) => event.path === page.path);
    return {
      path: page.path,
      title: page.title,
      pageViews:
        Math.round(demoPageViews * page.views) + events.filter((event) => event.type === 'page_view').length,
      visitors:
        Math.round(visitors * page.visitors) +
        new Set(events.flatMap((event) => (event.visitorId ? [event.visitorId] : []))).size,
      actions:
        Math.round(demoActions * page.actions) + events.filter((event) => event.type === 'action').length,
    };
  });
  const topPages = [...pages].sort((a, b) => b.pageViews - a.pageViews).slice(0, 10);

  const actionsByPage = pages
    .map((page) => {
      const template = PAGE_ACTIONS[page.path] ?? [];
      const demoTotal = Math.round(
        demoActions * (PAGES.find((item) => item.path === page.path)?.actions ?? 0),
      );
      const byAction = new Map<AnalyticsAction, number>(
        template.map(([action, ratio]) => [action, Math.round(demoTotal * ratio)]),
      );
      for (const event of session)
        if (event.path === page.path && event.action)
          byAction.set(event.action, (byAction.get(event.action) ?? 0) + 1);
      const rows = [...byAction]
        .filter(([, count]) => count > 0)
        .map(([action, count]) => ({ action, label: ANALYTICS_ACTION_LABELS[action], count }))
        .sort((a, b) => b.count - a.count);
      return {
        path: page.path,
        title: page.title,
        total: rows.reduce((total, row) => total + row.count, 0),
        byAction: rows,
      };
    })
    .filter((page) => page.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const fr = lang === 'en' ? 0 : lang === 'fr' ? pageViews : Math.round(pageViews * (1 - EN_SHARE));
  const en = pageViews - fr;
  const percent = (value: number) => (pageViews ? Math.round((value / pageViews) * 1000) / 10 : 0);

  return {
    period,
    from,
    to: today,
    generatedAt: new Date(now).toISOString(),
    totals: {
      visitors: kpi(visitors, previousVisitors),
      pageViews: kpi(pageViews, previousPageViews),
      actions: kpi(actions, previousActions),
      consentRate: pageViews ? Math.round((58 + noise(`${from}${period}`) * 8) * 10) / 10 : null,
    },
    actions: actionCounts,
    series,
    topPages,
    actionsByPage,
    languages: [
      { lang: 'fr', pageViews: fr, percent: percent(fr) },
      { lang: 'en', pageViews: en, percent: percent(en) },
    ],
  };
}
