import { http, HttpResponse } from 'msw';
import type { AdminZone, ServiceAreas, ZoneFields } from '@/lib/api/schema';
import operations from '../data/contract-examples.json';
import { jsonBody, mockId, slugify } from '../admin-utils';
import { problem } from '../problem';

const examples = operations.find((operation) => operation.operationId === 'getServiceAreas')?.examples;
const areas = examples?.default as ServiceAreas;
const areasEn = examples?.en as ServiceAreas | undefined;

/** Délais, tarifs indicatifs et demandes de la maquette « BO — Zones d'intervention » (`267:2047`). */
const DETAILS: Record<string, Pick<AdminZone, 'delay' | 'fee' | 'requestsCount'>> = {
  'zone-1': { delay: '30–45 min', fee: { amount: 1500, currency: 'XAF', from: false }, requestsCount: 41 },
  'zone-2': { delay: '40–60 min', fee: { amount: 2000, currency: 'XAF', from: false }, requestsCount: 22 },
  'zone-3': { delay: '45–75 min', fee: { amount: 2500, currency: 'XAF', from: false }, requestsCount: 11 },
  'zone-speciale': { delay: null, fee: { amount: 3500, currency: 'XAF', from: true }, requestsCount: 3 },
};

/** Zones du back-office, initialisées depuis l'exemple public du contrat (mêmes quartiers que le site). */
export const adminZones: AdminZone[] = areas.zones.map((zone, index) => {
  const en = areasEn?.zones.find((item) => item.key === zone.key);
  return {
    id: `zon_${zone.key.replace(/^zone-/, '')}`,
    key: zone.key,
    name: zone.name,
    nameEn: en?.name ?? null,
    tone: zone.tone,
    description: zone.description,
    descriptionEn: en?.description ?? null,
    result: zone.result,
    resultEn: en?.result ?? null,
    delay: null,
    fee: null,
    requestsCount: 0,
    ...DETAILS[zone.key],
    active: true,
    quarters: zone.quarters,
    sortOrder: index,
    updatedAt: areas.updatedAt ?? '2026-10-18T08:00:00.000Z',
  };
});

const sorted = () => [...adminZones].sort((a, b) => a.sortOrder - b.sortOrder);

/** Un quartier n'appartient qu'à une zone : ceux repris par `zone` sont retirés des autres. */
function claimQuarters(zone: AdminZone) {
  const names = new Set(zone.quarters.map((quarter) => quarter.name.toLowerCase()));
  for (const other of adminZones)
    if (other !== zone)
      other.quarters = other.quarters.filter((quarter) => !names.has(quarter.name.toLowerCase()));
}

function validate(body: ZoneFields) {
  if (body.name !== undefined && !body.name.trim())
    return problem(422, 'Le nom de la zone est obligatoire.', [
      { path: 'name', message: 'Saisissez le nom de la zone.' },
    ]);
  const names = (body.quarters ?? []).map((quarter) => quarter.name.trim().toLowerCase());
  if (names.some((name) => !name))
    return problem(422, 'Chaque quartier doit avoir un nom.', [
      { path: 'quarters', message: 'Nommez chaque quartier.' },
    ]);
  if (new Set(names).size !== names.length)
    return problem(422, 'Un quartier figure deux fois dans la zone.', [
      { path: 'quarters', message: 'Chaque quartier ne peut figurer qu’une fois.' },
    ]);
  if (body.fee && (!Number.isInteger(body.fee.amount) || body.fee.amount < 0))
    return problem(422, 'Tarif indicatif invalide.', [
      { path: 'fee', message: 'Saisissez un montant en FCFA.' },
    ]);
  return null;
}

export const adminZoneHandlers = [
  http.get('*/v1/admin/zones', () => HttpResponse.json({ zones: sorted(), showFees: false })),

  http.post('*/v1/admin/zones', async ({ request }) => {
    const body = await jsonBody<ZoneFields>(request);
    const error = validate({ ...body, name: body.name ?? '' });
    if (error) return error;
    const name = body.name!.trim();
    const zone: AdminZone = {
      id: mockId('zon'),
      key: slugify(name),
      name,
      nameEn: body.nameEn ?? null,
      tone: body.tone ?? 'zone3',
      description: body.description ?? '',
      descriptionEn: body.descriptionEn ?? null,
      result: body.result ?? 'Intervention possible. Conditions confirmées sur devis.',
      resultEn: body.resultEn ?? null,
      delay: body.delay ?? null,
      fee: body.fee ?? null,
      active: body.active ?? false,
      quarters: body.quarters ?? [],
      requestsCount: 0,
      sortOrder: Math.max(-1, ...adminZones.map((item) => item.sortOrder)) + 1,
      updatedAt: new Date().toISOString(),
    };
    adminZones.push(zone);
    claimQuarters(zone);
    return HttpResponse.json(zone, { status: 201 });
  }),

  http.patch('*/v1/admin/zones/reorder', async ({ request }) => {
    const { ids = [] } = await jsonBody<{ ids?: string[] }>(request);
    ids.forEach((id, index) => {
      const zone = adminZones.find((item) => item.id === id);
      if (zone) zone.sortOrder = index;
    });
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch('*/v1/admin/zones/:id', async ({ request, params }) => {
    const zone = adminZones.find((item) => item.id === params.id);
    if (!zone) return problem(404, 'Cette zone n’existe plus.');
    const body = await jsonBody<ZoneFields>(request);
    const error = validate(body);
    if (error) return error;
    Object.assign(zone, Object.fromEntries(Object.entries(body).filter(([, value]) => value !== undefined)), {
      name: body.name?.trim() ?? zone.name,
      updatedAt: new Date().toISOString(),
    });
    if (body.quarters) claimQuarters(zone);
    return HttpResponse.json(zone);
  }),

  http.delete('*/v1/admin/zones/:id', ({ params }) => {
    const index = adminZones.findIndex((item) => item.id === params.id);
    if (index < 0) return problem(404, 'Cette zone n’existe plus.');
    if (adminZones[index]!.quarters.length)
      return problem(409, 'Déplacez ou retirez d’abord les quartiers de cette zone.');
    adminZones.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
