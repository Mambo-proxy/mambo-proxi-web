import { http, HttpResponse } from 'msw';
import type { Campaign, CampaignFields, CampaignSegment, NewsletterStats } from '@/lib/api/schema';
import { csvResponse, daysAgo, jsonBody, mockId } from '../admin-utils';
import { problem } from '../problem';

/** Inscrits confirmés par segment (maquette « BO — Newsletter » : 1 248 inscrits). */
const SEGMENTS: { segment: CampaignSegment; label: string; count: number }[] = [
  { segment: { kind: 'ALL' }, label: 'Tous les inscrits', count: 1248 },
  { segment: { kind: 'CAMEROUN' }, label: 'Cameroun', count: 1094 },
  { segment: { kind: 'FRANCE' }, label: 'France', count: 112 },
  { segment: { kind: 'PROFESSIONNELS' }, label: 'Professionnels', count: 156 },
];

const segmentOf = (segment: CampaignSegment | undefined) =>
  SEGMENTS.find((item) => item.segment.kind === (segment?.kind ?? 'ALL')) ?? SEGMENTS[0]!;

/** Heure de Douala (UTC+1) → ISO. */
const douala = (date: string, hour: number, minute = 0) =>
  new Date(
    `${date}T${String(hour - 1).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`,
  ).toISOString();

function campaign(fields: Partial<Campaign> & Pick<Campaign, 'id' | 'subject' | 'status'>): Campaign {
  const segment = fields.segment ?? { kind: 'ALL' };
  return {
    preheader: null,
    html: '<p>Bonjour {prénom},</p>',
    segment,
    segmentLabel: segmentOf(segment).label,
    scheduledAt: null,
    sentAt: null,
    recipients: 0,
    opens: null,
    clicks: null,
    unsubscribes: 0,
    createdAt: daysAgo(30),
    ...fields,
    updatedAt: fields.updatedAt ?? fields.sentAt ?? fields.createdAt ?? daysAgo(30),
  };
}

/** Les 4 envois de la maquette (`94:11702`), du plus récent au plus ancien. */
export const adminCampaigns: Campaign[] = [
  campaign({
    id: 'cmp_novembre',
    subject: 'Novembre : sorties culturelles et nouveaux services',
    status: 'PROGRAMMEE',
    html: '<p>Bonjour {prénom},</p><p>Ce mois-ci, découvrez nos nouvelles sorties culturelles à Douala et Kribi, et notre nouveau service de visites guidées…</p>',
    scheduledAt: douala('2026-11-02', 9),
    recipients: 1248,
    createdAt: daysAgo(3),
  }),
  campaign({
    id: 'cmp_octobre',
    subject: 'Octobre : préparer son installation au Cameroun',
    status: 'ENVOYEE',
    html: '<p>Bonjour {prénom},</p><p>Vous préparez votre arrivée à Douala ? Logement, démarches, premiers jours : notre atelier en ligne vous accompagne.</p>',
    sentAt: douala('2026-10-05', 9),
    recipients: 1192,
    opens: 548,
    clicks: 107,
    unsubscribes: 5,
    createdAt: douala('2026-10-01', 10),
  }),
  campaign({
    id: 'cmp_septembre',
    subject: 'Septembre : la rentrée avec Mambo',
    status: 'ENVOYEE',
    html: '<p>Bonjour {prénom},</p><p>Nouvelle saison, nouveaux services : entretien du logement, pressing, courses livrées dans tout Douala.</p>',
    sentAt: douala('2026-09-07', 9),
    recipients: 1130,
    opens: 475,
    clicks: 90,
    unsubscribes: 4,
    createdAt: douala('2026-09-02', 10),
  }),
  campaign({
    id: 'cmp_brouillon',
    subject: 'Brouillon sans titre',
    status: 'BROUILLON',
    html: '',
    createdAt: daysAgo(1),
  }),
];

function stats(): NewsletterStats {
  const sent = adminCampaigns
    .filter((item) => item.status === 'ENVOYEE' && item.recipients > 0)
    .sort((a, b) => (b.sentAt ?? '').localeCompare(a.sentAt ?? ''));
  const rate = (value: number | null | undefined, total: number) =>
    value == null || !total ? null : Math.round((value / total) * 1000) / 10;
  const [last, previous] = sent;
  const lastOpen = last ? rate(last.opens, last.recipients) : null;
  const previousOpen = previous ? rate(previous.opens, previous.recipients) : null;
  const recipients = sent.reduce((total, item) => total + item.recipients, 0);
  return {
    subscribers: SEGMENTS[0]!.count,
    newThisMonth: 56,
    campaignsSent: sent.length,
    averageOpenRate: lastOpen,
    averageClickRate: last ? rate(last.clicks, last.recipients) : null,
    unsubscribeRate: rate(
      sent.reduce((total, item) => total + item.unsubscribes, 0),
      recipients,
    ),
    lastOpenRateDelta: lastOpen != null && previousOpen != null ? Math.round(lastOpen - previousOpen) : null,
  };
}

const rank = (item: Campaign) => (item.status === 'PROGRAMMEE' ? 0 : item.status === 'BROUILLON' ? 2 : 1);

function find(id: unknown) {
  return adminCampaigns.find((item) => item.id === id) ?? null;
}

const editable = (item: Campaign) => item.status === 'BROUILLON' || item.status === 'PROGRAMMEE';

function apply(item: Campaign, body: CampaignFields) {
  if (body.subject !== undefined) item.subject = body.subject.trim() || 'Brouillon sans titre';
  if (body.preheader !== undefined) item.preheader = body.preheader;
  if (body.html !== undefined) item.html = body.html;
  if (body.segment !== undefined) {
    item.segment = body.segment;
    item.segmentLabel = segmentOf(body.segment).label;
  }
  if (item.status === 'PROGRAMMEE') item.recipients = segmentOf(item.segment).count;
  item.updatedAt = new Date().toISOString();
}

/** Rendu de l'e-mail (gabarit simplifié de l'API : en-tête, corps, pied avec lien de désinscription). */
function render(item: Campaign) {
  const body = (item.html || '<p>Bonjour {prénom},</p>').replaceAll('{prénom}', 'Aurélie');
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${item.subject}</title><style>body{margin:0;background:#f6f4f1;font-family:Inter,Arial,sans-serif;color:#1d1b19}main{max-width:600px;margin:0 auto;background:#fff;padding:32px}header{font-weight:700;color:#f57c00;font-size:20px;margin-bottom:24px}img{max-width:100%;border-radius:12px}a[data-button]{display:inline-block;background:#f57c00;color:#1d1b19;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600}footer{max-width:600px;margin:0 auto;padding:16px 32px;font-size:12px;color:#6b6560}</style></head><body><main><header>Mambo Proxi</header>${body}</main><footer>Vous recevez cet e-mail car vous êtes inscrit·e à la newsletter de Mambo Proxi. <a href="#">Se désinscrire</a></footer></body></html>`;
  const text = body
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return { subject: item.subject, html, text };
}

/** Back-office — Newsletter (`/v1/admin/campaigns*`, `/v1/admin/subscribers*`). */
export const adminNewsletterHandlers = [
  http.get('*/v1/admin/campaigns', () =>
    HttpResponse.json({
      data: [...adminCampaigns].sort(
        (a, b) =>
          // Programmés et brouillons en tête, puis envois du plus récent au plus ancien (ordre de la maquette).
          rank(a) - rank(b) || (b.sentAt ?? b.updatedAt ?? '').localeCompare(a.sentAt ?? a.updatedAt ?? ''),
      ),
      stats: stats(),
    }),
  ),

  http.get('*/v1/admin/campaigns/segments', () => HttpResponse.json(SEGMENTS)),

  http.post('*/v1/admin/campaigns', async ({ request }) => {
    const body = await jsonBody<CampaignFields>(request);
    const item = campaign({
      id: mockId('cmp'),
      subject: 'Brouillon sans titre',
      status: 'BROUILLON',
      html: '',
    });
    item.createdAt = new Date().toISOString();
    apply(item, body);
    adminCampaigns.unshift(item);
    return HttpResponse.json(item, { status: 201 });
  }),

  http.get('*/v1/admin/campaigns/:id/preview', ({ params }) => {
    const item = find(params.id);
    if (!item) return problem(404, 'Cet envoi n’existe plus.');
    return HttpResponse.json(render(item));
  }),

  http.post('*/v1/admin/campaigns/:id/test', async ({ request, params }) => {
    const item = find(params.id);
    if (!item) return problem(404, 'Cet envoi n’existe plus.');
    const { email } = await jsonBody<{ email?: string }>(request);
    if (!email || !/^\S+@\S+\.\S+$/.test(email))
      return problem(422, 'Adresse e-mail invalide.', [
        { path: 'email', message: 'Saisissez une adresse e-mail valide.' },
      ]);
    return HttpResponse.json({ message: `E-mail de test envoyé à ${email}.` }, { status: 202 });
  }),

  http.post('*/v1/admin/campaigns/:id/schedule', async ({ request, params }) => {
    const item = find(params.id);
    if (!item) return problem(404, 'Cet envoi n’existe plus.');
    if (!editable(item)) return problem(409, 'Cet envoi est déjà parti.');
    const { scheduledAt } = await jsonBody<{ scheduledAt?: string }>(request);
    if (!scheduledAt || Number.isNaN(Date.parse(scheduledAt)) || Date.parse(scheduledAt) <= Date.now())
      return problem(422, 'Choisissez une date d’envoi à venir.', [
        { path: 'scheduledAt', message: 'Choisissez une date et une heure à venir.' },
      ]);
    if (
      !item.subject?.trim() ||
      item.subject === 'Brouillon sans titre' ||
      !(item.html ?? '').replace(/<[^>]+>/g, '').trim()
    )
      return problem(422, 'Renseignez l’objet et le contenu avant de programmer l’envoi.');
    item.status = 'PROGRAMMEE';
    item.scheduledAt = scheduledAt;
    item.recipients = segmentOf(item.segment).count;
    return HttpResponse.json(item);
  }),

  http.post('*/v1/admin/campaigns/:id/cancel', ({ params }) => {
    const item = find(params.id);
    if (!item) return problem(404, 'Cet envoi n’existe plus.');
    if (item.status !== 'PROGRAMMEE') return problem(409, 'Cet envoi n’est pas programmé.');
    item.status = 'BROUILLON';
    item.scheduledAt = null;
    item.recipients = 0;
    return HttpResponse.json(item);
  }),

  http.post('*/v1/admin/campaigns/:id/send-now', ({ params }) => {
    const item = find(params.id);
    if (!item) return problem(404, 'Cet envoi n’existe plus.');
    if (!editable(item)) return problem(409, 'Cet envoi est déjà parti.');
    item.status = 'EN_COURS_ENVOI';
    item.recipients = segmentOf(item.segment).count;
    item.scheduledAt = null;
    return HttpResponse.json(item, { status: 202 });
  }),

  http.get('*/v1/admin/campaigns/:id', ({ params }) => {
    const item = find(params.id);
    return item ? HttpResponse.json(item) : problem(404, 'Cet envoi n’existe plus.');
  }),

  http.patch('*/v1/admin/campaigns/:id', async ({ request, params }) => {
    const item = find(params.id);
    if (!item) return problem(404, 'Cet envoi n’existe plus.');
    if (!editable(item)) return problem(409, 'Cet envoi est déjà parti : il ne peut plus être modifié.');
    apply(item, await jsonBody<CampaignFields>(request));
    return HttpResponse.json(item);
  }),

  http.delete('*/v1/admin/campaigns/:id', ({ params }) => {
    const index = adminCampaigns.findIndex((item) => item.id === params.id);
    if (index < 0) return problem(404, 'Cet envoi n’existe plus.');
    if (adminCampaigns[index]!.status !== 'BROUILLON')
      return problem(409, 'Seul un brouillon peut être supprimé.');
    adminCampaigns.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/v1/admin/subscribers/export.csv', () =>
    csvResponse(
      `inscrits-newsletter-${new Date().toISOString().slice(0, 10)}.csv`,
      ['E-mail', 'Nom', 'Pays', 'Statut', 'Inscrit le'],
      Array.from({ length: SEGMENTS[0]!.count }, (_, index) => [
        `inscrit.${index + 1}@email.com`,
        '',
        index % 11 === 0 ? 'FR' : 'CM',
        'Abonné',
        daysAgo(index % 700).slice(0, 10),
      ]),
    ),
  ),
];
