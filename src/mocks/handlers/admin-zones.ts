import { http, HttpResponse } from 'msw';
import type { AdminZone, ZoneFields } from '@/lib/api/schema';
import { validatePoint, validateZoneArea } from '@/lib/geo/zones';
import { serviceAreas as areas, serviceAreasEn as areasEn } from '../data/zones';
import { jsonBody, mockId, normalize, slugify, uniqueSlug } from '../admin-utils';
import { nothingSent, reorderInputErrors, tooLong, tooMany } from '../content-rules';
import { problem, validationProblem, type FieldErrors } from '../problem';
import {
  mockTextStatus,
  saveMockTranslation,
  unknownReviewedFields,
  type MockTextTranslation,
} from '../text-translations';

/**
 * Délais, tarifs indicatifs et demandes de la maquette « BO — Zones d'intervention » (`267:2047`). L'API compte les
 * demandes des 12 derniers mois dont la ville commence par un quartier de la zone ; les demandes simulées ne
 * couvrent pas une année, les chiffres de la maquette sont donc gardés.
 */
const DETAILS: Record<string, Pick<AdminZone, 'delay' | 'fee' | 'requestsCount'>> = {
  'zone-1': { delay: '30–45 min', fee: { amount: 1500, currency: 'XAF', from: false }, requestsCount: 41 },
  'zone-2': { delay: '40–60 min', fee: { amount: 2000, currency: 'XAF', from: false }, requestsCount: 22 },
  'zone-3': { delay: '45–75 min', fee: { amount: 2500, currency: 'XAF', from: false }, requestsCount: 11 },
  'zone-speciale': { delay: null, fee: { amount: 3500, currency: 'XAF', from: true }, requestsCount: 3 },
};

/** Zones du back-office, initialisées depuis l'exemple public du contrat (mêmes quartiers, coordonnées et contours). */
export const adminZones: AdminZone[] = areas.zones.map((zone, index) => {
  const en = areasEn.zones.find((item) => item.key === zone.key);
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
    area: zone.area ?? null,
    sortOrder: index,
    updatedAt: areas.updatedAt ?? '2026-10-18T08:00:00.000Z',
    translationStatus: { en: { state: 'UP_TO_DATE', missingFields: [], outdatedFields: [] } },
  };
});

/**
 * Suivi de la version anglaise (`translationStatus`, `reviewedFields`) : nom, description et réponse ; texte français
 * traduit par champ, à la place de l'empreinte de l'API (traductions de départ sans suivi : à jour).
 */
const ZONE_TEXT_RULES = { paths: ['name', 'description', 'result'] };
const zoneSources = new Map<string, Record<string, string>>();

const frenchTexts = (zone: Pick<AdminZone, 'name' | 'description' | 'result'>) => ({
  name: zone.name,
  description: zone.description,
  result: zone.result,
});

const englishTexts = (zone: Pick<AdminZone, 'nameEn' | 'descriptionEn' | 'resultEn'>) => ({
  name: zone.nameEn,
  description: zone.descriptionEn,
  result: zone.resultEn,
});

function translationOf(zone: AdminZone): MockTextTranslation {
  return { en: englishTexts(zone), sources: zoneSources.get(zone.id) ?? {} };
}

/** Statut recalculé (réponse) ; `previous` : zone avant modification (`null` à la création). */
function trackTranslation(zone: AdminZone, previous: AdminZone | null, reviewed: readonly string[]) {
  const saved = saveMockTranslation({
    french: frenchTexts(zone),
    previousFrench: previous === null ? {} : frenchTexts(previous),
    before: previous === null ? { en: null, sources: {} } : translationOf(previous),
    english: englishTexts(zone),
    reviewed,
    rules: ZONE_TEXT_RULES,
  });
  zoneSources.set(zone.id, saved.sources);
  zone.translationStatus = { en: mockTextStatus(frenchTexts(zone), saved, ZONE_TEXT_RULES) };
}

for (const zone of adminZones)
  zone.translationStatus = { en: mockTextStatus(frenchTexts(zone), translationOf(zone), ZONE_TEXT_RULES) };

/**
 * Option « Afficher les tarifs » : l'API la lit dans le paramètre `zones` (seed : `false`). Le contrat n'a pas de
 * groupe de paramètres pour la modifier ; la valeur du seed est donc gardée.
 */
const SHOW_FEES = false;

const sorted = () => [...adminZones].sort((a, b) => a.sortOrder - b.sortOrder || a.key.localeCompare(b.key));

const TONES = ['zone1', 'zone2', 'zone3', 'special'];

/** Champs `ZoneFields` du contrat (les autres propriétés envoyées sont ignorées, comme dans l'API). */
const FIELDS = [
  'name',
  'nameEn',
  'tone',
  'description',
  'descriptionEn',
  'result',
  'resultEn',
  'delay',
  'fee',
  'active',
  'quarters',
  'area',
] as const;

/** Un quartier n'appartient qu'à une zone : ceux repris par `zone` sont retirés des autres. */
function claimQuarters(zone: AdminZone) {
  const names = new Set(zone.quarters.map((quarter) => normalize(quarter.name.trim())));
  for (const other of adminZones)
    if (other !== zone)
      other.quarters = other.quarters.filter((quarter) => !names.has(normalize(quarter.name.trim())));
}

/** Schéma `ZoneInput` (création : nom et couleur exigés) ou `ZonePatch` de l'API : toutes les erreurs du corps. */
function validate(body: ZoneFields, create: boolean): FieldErrors {
  const errors: FieldErrors = create ? [] : nothingSent(body);
  if (create || body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim())
      errors.push({ path: 'name', code: 'required', message: 'Saisissez le nom de la zone.' });
    else tooLong(errors, 'name', body.name, 60);
  }
  if ((create || body.tone !== undefined) && !TONES.includes(body.tone as string))
    errors.push({ path: 'tone', code: 'invalid_choice', message: 'Choisissez la couleur de la zone.' });
  tooLong(errors, 'nameEn', body.nameEn, 60);
  tooLong(errors, 'description', body.description, 160);
  tooLong(errors, 'descriptionEn', body.descriptionEn, 160);
  tooLong(errors, 'result', body.result, 240);
  tooLong(errors, 'resultEn', body.resultEn, 240);
  tooLong(errors, 'delay', body.delay, 30);
  if (body.fee && (!Number.isInteger(body.fee.amount) || body.fee.amount < 0))
    errors.push({ path: 'fee.amount', code: 'invalid_type', message: 'Saisissez un montant en FCFA.' });
  const quarters = body.quarters ?? [];
  tooMany(errors, 'quarters', body.quarters, 80);
  const seen = new Set<string>();
  quarters.forEach((quarter, index) => {
    const name = typeof quarter.name === 'string' ? quarter.name.trim() : '';
    if (!name)
      errors.push({ path: `quarters.${index}.name`, code: 'required', message: 'Nommez chaque quartier.' });
    else tooLong(errors, `quarters.${index}.name`, name, 80);
    const key = normalize(name).replace(/\s+/g, ' ');
    if (name && seen.has(key))
      errors.push({
        path: `quarters.${index}.name`,
        code: 'invalid',
        message: 'Chaque quartier ne peut figurer qu’une fois.',
      });
    seen.add(key);
    // Coordonnées en WGS84, dans l'emprise du Cameroun (chemin du point fautif).
    const issue =
      quarter.coordinates != null && validatePoint(quarter.coordinates, `quarters.${index}.coordinates`);
    if (issue) errors.push({ ...issue, code: 'invalid' });
  });
  const areaIssue = body.area != null && validateZoneArea(body.area);
  if (areaIssue) errors.push({ ...areaIssue, code: 'invalid' });
  return errors;
}

/** Champs du contrat seulement, textes facultatifs vides à `null` (`nullableText`), noms coupés. */
function fieldsOf(body: ZoneFields): Partial<AdminZone> {
  const fields = Object.fromEntries(
    FIELDS.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]),
  ) as Partial<AdminZone>;
  if (typeof fields.name === 'string') fields.name = fields.name.trim();
  for (const key of ['nameEn', 'descriptionEn', 'resultEn', 'delay'] as const) {
    const value = fields[key];
    if (typeof value === 'string') fields[key] = value.trim() === '' ? null : value.trim();
  }
  if (fields.fee) fields.fee = { amount: fields.fee.amount, currency: 'XAF', from: fields.fee.from };
  if (fields.quarters)
    fields.quarters = fields.quarters.map((quarter) => ({ ...quarter, name: quarter.name.trim() }));
  return fields;
}

export const adminZoneHandlers = [
  http.get('*/v1/admin/zones', () => HttpResponse.json({ zones: sorted(), showFees: SHOW_FEES })),

  http.post('*/v1/admin/zones', async ({ request }) => {
    const body = await jsonBody<ZoneFields>(request);
    const errors = validate(body, true);
    if (errors.length) return validationProblem(errors);
    const fields = fieldsOf(body);
    const name = fields.name!;
    // Clé tirée du nom à la création (`-2`, `-3`… si elle est prise), jamais changée ensuite.
    const key = uniqueSlug(
      slugify(name) || 'zone',
      (candidate) => adminZones.some((zone) => zone.key === candidate),
      'zone',
    );
    const zone: AdminZone = {
      id: mockId('zon'),
      key,
      nameEn: null,
      description: '',
      descriptionEn: null,
      result: 'Intervention possible. Conditions confirmées sur devis.',
      resultEn: null,
      delay: null,
      fee: null,
      quarters: [],
      area: null,
      ...fields,
      name,
      tone: body.tone!,
      active: body.active ?? false,
      requestsCount: 0,
      sortOrder: Math.max(-1, ...adminZones.map((item) => item.sortOrder)) + 1,
      updatedAt: new Date().toISOString(),
      translationStatus: { en: { state: 'UP_TO_DATE', missingFields: [], outdatedFields: [] } },
    };
    const reviewErrors = unknownReviewedFields(
      frenchTexts(zone),
      englishTexts(zone),
      body.reviewedFields ?? [],
      ZONE_TEXT_RULES,
      'reviewedFields',
    );
    if (reviewErrors.length) return validationProblem(reviewErrors);
    trackTranslation(zone, null, body.reviewedFields ?? []);
    adminZones.push(zone);
    claimQuarters(zone);
    return HttpResponse.json(zone, { status: 201 });
  }),

  // Ordre de la légende, de la liste et de la recherche du site : zones connues, sans doublon (rang de 0 à n-1).
  http.patch('*/v1/admin/zones/reorder', async ({ request }) => {
    const { ids } = await jsonBody<{ ids?: string[] }>(request);
    const inputErrors = reorderInputErrors(ids);
    if (inputErrors.length) return validationProblem(inputErrors);
    if (ids!.some((id) => !adminZones.some((zone) => zone.id === id)))
      return validationProblem(
        [{ path: 'ids', code: 'invalid_order', message: 'Zones inconnues.' }],
        'L’ordre envoyé ne correspond pas aux zones.',
      );
    ids!.forEach((id, index) => {
      adminZones.find((zone) => zone.id === id)!.sortOrder = index;
    });
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch('*/v1/admin/zones/:id', async ({ request, params }) => {
    const body = await jsonBody<ZoneFields>(request);
    const errors = validate(body, false);
    if (errors.length) return validationProblem(errors);
    const zone = adminZones.find((item) => item.id === params.id);
    if (!zone) return problem(404, 'Cette zone n’existe plus.');
    const previous = { ...zone };
    const next = { ...zone, ...fieldsOf(body) };
    const reviewErrors = unknownReviewedFields(
      frenchTexts(next),
      englishTexts(next),
      body.reviewedFields ?? [],
      ZONE_TEXT_RULES,
      'reviewedFields',
    );
    if (reviewErrors.length) return validationProblem(reviewErrors);
    Object.assign(zone, fieldsOf(body), { updatedAt: new Date().toISOString() });
    trackTranslation(zone, previous, body.reviewedFields ?? []);
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
