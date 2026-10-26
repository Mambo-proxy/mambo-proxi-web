'use client';

import { useMutation } from '@tanstack/react-query';
import { MapPin, X } from 'lucide-react';
import { useCallback, useMemo, useState, type ChangeEvent } from 'react';
import {
  CompactField,
  CompactInput,
  compactButtonClass,
  compactInputClass,
  LanguageSwitch,
  type EditingLanguage,
} from '@/components/admin/magazine/magazine-ui';
import { TONES } from '@/components/sections/zones/zone-tones';
import { ReadOnlyFieldset } from '@/components/admin/shell/permissions';
import { ZonesLeafletMap, type MapZone } from '@/components/sections/zones/zones-leaflet';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { AdminZone, GeoPoint, ZoneArea, ZoneFields, ZoneQuarter, ZoneTone } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { isInCameroon, parseCoordinate, parseZoneArea } from '@/lib/geo/zones';
import { ADMIN_MAP_LABELS, areaSummary, pointLabel } from './zone-labels';

/** Fichier GeoJSON importé : 2 Mo au plus (5 000 points tiennent largement). */
const MAX_GEOJSON_BYTES = 2 * 1024 * 1024;

export const TONE_LABELS: Record<ZoneTone, string> = {
  zone1: 'Vert (zone 1)',
  zone2: 'Orange (zone 2)',
  zone3: 'Noir (zone 3)',
  special: 'Gris (zone spéciale)',
};

type Draft = {
  name: string;
  nameEn: string;
  tone: ZoneTone;
  description: string;
  descriptionEn: string;
  result: string;
  resultEn: string;
  delay: string;
  fee: string;
  feeFrom: boolean;
  active: boolean;
  quarters: ZoneQuarter[];
  area: ZoneArea | null;
};

function draftOf(zone: AdminZone | null): Draft {
  return {
    name: zone?.name ?? '',
    nameEn: zone?.nameEn ?? '',
    tone: zone?.tone ?? 'zone3',
    description: zone?.description ?? '',
    descriptionEn: zone?.descriptionEn ?? '',
    result: zone?.result ?? '',
    resultEn: zone?.resultEn ?? '',
    delay: zone?.delay ?? '',
    fee: zone?.fee ? String(zone.fee.amount) : '',
    feeFrom: zone?.fee?.from ?? false,
    active: zone?.active ?? true,
    quarters: zone?.quarters ?? [],
    area: zone?.area ?? null,
  };
}

/** Texte des champs latitude / longitude d'un quartier. */
function coordinateText(quarter: ZoneQuarter | undefined) {
  return {
    lat: quarter?.coordinates ? String(quarter.coordinates.lat) : '',
    lng: quarter?.coordinates ? String(quarter.coordinates.lng) : '',
  };
}

/** Message d'erreur de l'API sur les coordonnées d'un quartier (`quarters.2.coordinates`), avec son nom. */
function coordinateError(errors: Record<string, string>, quarters: ZoneQuarter[]) {
  const entry = Object.entries(errors).find(([path]) => /^quarters\.\d+\.coordinates/.test(path));
  if (!entry) return null;
  const name = quarters[Number(entry[0].split('.')[1])]?.name;
  return name ? `${name} : ${entry[1]}` : entry[1];
}

/**
 * Zone d'intervention (non maquetté, même langage que les éditeurs du back-office) : nom, couleur, textes du site
 * en français et en anglais, délai moyen, tarif indicatif (masqué sur le site), quartiers et leur position (clic
 * sur la carte ou latitude / longitude), contour GeoJSON collé ou importé (contrôlé avant l'envoi).
 */
export function ZoneDialog({
  open,
  onClose,
  zone,
  onSaved,
  readOnly = false,
}: {
  open: boolean;
  onClose: () => void;
  /** Zone modifiée ; `null` pour en créer une. */
  zone: AdminZone | null;
  onSaved: () => void;
  /** Sans `content:write` : fiche consultée (champs figés, carte sans saisie, sans enregistrement). */
  readOnly?: boolean;
}) {
  const [draft, setDraft] = useState(() => draftOf(zone));
  const [language, setLanguage] = useState<EditingLanguage>('fr');
  const [quarter, setQuarter] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [wasOpen, setWasOpen] = useState(open);
  // Quartier dont la position est en cours de saisie, et texte des champs latitude / longitude.
  const [placing, setPlacing] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
  const [areaText, setAreaText] = useState('');

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      const next = draftOf(zone);
      setDraft(next);
      setLanguage('fr');
      setQuarter('');
      setErrors({});
      const first = next.quarters.find((item) => item.coordinates) ?? next.quarters[0];
      setPlacing(first?.name ?? null);
      setCoordinates(coordinateText(first));
      setAreaText(next.area ? JSON.stringify(next.area) : '');
    }
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  /** Position d'un quartier (`null` : retiré de la carte). */
  const setQuarterPoint = useCallback((name: string, point: GeoPoint | null) => {
    setDraft((current) => ({
      ...current,
      quarters: current.quarters.map((item) => (item.name === name ? { ...item, coordinates: point } : item)),
    }));
  }, []);

  const choosePlacing = useCallback(
    (name: string) => {
      setPlacing(name);
      setCoordinates(coordinateText(draft.quarters.find((item) => item.name === name)));
      setErrors((current) => ({ ...current, coordinates: '' }));
    },
    [draft.quarters],
  );

  // Clic sur la carte : position du quartier choisi.
  const pick = useCallback(
    (point: GeoPoint) => {
      if (!placing) {
        toast.error('Choisissez d’abord le quartier à placer.');
        return;
      }
      setQuarterPoint(placing, point);
      setCoordinates({ lat: String(point.lat), lng: String(point.lng) });
      setErrors((current) => ({ ...current, coordinates: '' }));
    },
    [placing, setQuarterPoint],
  );

  function typeCoordinate(axis: 'lat' | 'lng', text: string) {
    const next = { ...coordinates, [axis]: text };
    setCoordinates(next);
    if (!placing) return;
    if (!next.lat.trim() && !next.lng.trim()) {
      setQuarterPoint(placing, null);
      setErrors((current) => ({ ...current, coordinates: '' }));
      return;
    }
    const lat = parseCoordinate(next.lat);
    const lng = parseCoordinate(next.lng);
    if (lat === null || lng === null) {
      setErrors((current) => ({
        ...current,
        coordinates: 'Saisissez la latitude et la longitude en degrés décimaux (ex. 4.0565 et 9.732).',
      }));
      return;
    }
    if (!isInCameroon({ lat, lng })) {
      setErrors((current) => ({
        ...current,
        coordinates:
          'Ce point est hors du Cameroun : vérifiez la latitude (environ 4 à Douala) et la longitude (environ 9,7).',
      }));
      return;
    }
    setQuarterPoint(placing, { lat, lng });
    setErrors((current) => ({ ...current, coordinates: '' }));
  }

  /** Contour collé ou importé : contrôlé (règles de l'API) puis appliqué ; texte vide : contour supprimé. */
  function applyArea(text = areaText) {
    if (!text.trim()) {
      set('area', null);
      setErrors((current) => ({ ...current, area: '' }));
      return;
    }
    const result = parseZoneArea(text);
    if ('error' in result) {
      setErrors((current) => ({ ...current, area: result.error }));
      return;
    }
    set('area', result.area);
    setAreaText(JSON.stringify(result.area));
    setErrors((current) => ({ ...current, area: '' }));
    toast.success(`Contour appliqué : ${areaSummary(result.area)}.`);
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_GEOJSON_BYTES) {
      setErrors((current) => ({ ...current, area: 'Fichier trop volumineux (2 Mo au plus).' }));
      return;
    }
    const text = await file.text();
    setAreaText(text);
    applyArea(text);
  }

  // Aperçu de la zone en cours de saisie (contour et quartiers placés).
  const previewZones = useMemo<MapZone[]>(
    () => [
      {
        key: zone?.key ?? 'nouvelle-zone',
        name: draft.name || 'Nouvelle zone',
        tone: draft.tone,
        quarters: draft.quarters,
        area: draft.area,
      },
    ],
    [zone?.key, draft.name, draft.tone, draft.quarters, draft.area],
  );
  const placingQuarter = draft.quarters.find((item) => item.name === placing);
  const apiCoordinateError = coordinateError(errors, draft.quarters);
  const areaError =
    errors.area || Object.entries(errors).find(([path]) => path.startsWith('area.'))?.[1] || null;

  function addQuarter() {
    const name = quarter.trim();
    if (!name) return;
    if (draft.quarters.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      setErrors({ quarters: 'Ce quartier figure déjà dans la zone.' });
      return;
    }
    set('quarters', [
      ...draft.quarters,
      { name, isBase: false, labelOnSmallMap: false, coordinates: null, position: null },
    ]);
    setQuarter('');
    setErrors({});
    // Le quartier ajouté est prêt à être placé sur la carte.
    setPlacing(name);
    setCoordinates({ lat: '', lng: '' });
  }

  const save = useMutation({
    mutationFn: () => {
      const body: ZoneFields = {
        name: draft.name.trim(),
        nameEn: draft.nameEn.trim() || null,
        tone: draft.tone,
        description: draft.description.trim(),
        descriptionEn: draft.descriptionEn.trim() || null,
        result: draft.result.trim(),
        resultEn: draft.resultEn.trim() || null,
        delay: draft.delay.trim() || null,
        fee: draft.fee ? { amount: Number(draft.fee), currency: 'XAF', from: draft.feeFrom } : null,
        active: draft.active,
        quarters: draft.quarters,
        area: draft.area,
      };
      // Schémas `allOf` du contrat générés avec `Record<string, never>` : le corps est typé par `ZoneFields`.
      return zone
        ? data(
            browserApi.PATCH('/v1/admin/zones/{id}', {
              params: { path: { id: zone.id } },
              body: body as never,
            }),
          )
        : data(browserApi.POST('/v1/admin/zones', { body: body as never }));
    },
    onSuccess: () => {
      toast.success(zone ? 'Zone enregistrée.' : 'Zone ajoutée.');
      onSaved();
      onClose();
    },
    onError: (error) => {
      if (error instanceof ApiError) setErrors(error.fieldErrors);
      toast.error(errorMessage(error));
    },
  });

  function submit() {
    const next: Record<string, string> = {};
    if (!draft.name.trim()) next.name = 'Saisissez le nom de la zone.';
    if (draft.fee && !/^\d+$/.test(draft.fee)) next.fee = 'Saisissez un montant en FCFA, sans espace.';
    if (errors.coordinates) next.coordinates = errors.coordinates;
    if (errors.area) next.area = errors.area;
    setErrors(next);
    if (Object.keys(next).length) {
      setLanguage('fr');
      return;
    }
    save.mutate();
  }

  const en = language === 'en';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={zone ? (readOnly ? zone.name : `Modifier « ${zone.name} »`) : 'Nouvelle zone'}
      description="Les textes s’affichent sur la carte, dans la recherche de quartier et dans les formulaires du site."
      maxWidth={680}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {readOnly ? 'Fermer' : 'Annuler'}
          </Button>
          {!readOnly && (
            <Button size="sm" loading={save.isPending} onClick={submit}>
              {zone ? 'Enregistrer' : 'Ajouter la zone'}
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <LanguageSwitch
          value={language}
          onChange={setLanguage}
          labels={{ fr: 'Français', en: draft.nameEn.trim() ? 'English · traduit' : 'English · à traduire' }}
        />
        {/* Lecture seule : langue au choix, champs figés, boutons d'ajout et de retrait masqués. */}
        <ReadOnlyFieldset readOnly={readOnly}>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
            <CompactField label={en ? 'Nom (anglais)' : 'Nom'} error={en ? null : errors.name}>
              {(control) => (
                <CompactInput
                  {...control}
                  key={language}
                  lang={language}
                  value={en ? draft.nameEn : draft.name}
                  placeholder={en ? draft.name : 'Zone 4 — Périphérie'}
                  maxLength={60}
                  onChange={(event) => set(en ? 'nameEn' : 'name', event.target.value)}
                />
              )}
            </CompactField>
            <CompactField label="Couleur sur la carte">
              {(control) => (
                <select
                  {...control}
                  value={draft.tone}
                  onChange={(event) => set('tone', event.target.value as ZoneTone)}
                  className={compactInputClass}
                >
                  {(Object.keys(TONE_LABELS) as ZoneTone[]).map((tone) => (
                    <option key={tone} value={tone}>
                      {TONE_LABELS[tone]}
                    </option>
                  ))}
                </select>
              )}
            </CompactField>
          </div>
          <CompactField
            label={en ? 'Description (anglais)' : 'Description'}
            help="Une phrase, sous le nom de la zone."
          >
            {(control) => (
              <CompactInput
                {...control}
                key={language}
                lang={language}
                value={en ? draft.descriptionEn : draft.description}
                placeholder={en ? draft.description : 'Autour de la base de Cité SIC.'}
                maxLength={160}
                onChange={(event) => set(en ? 'descriptionEn' : 'description', event.target.value)}
              />
            )}
          </CompactField>
          <CompactField
            label={en ? 'Réponse à la recherche (anglais)' : 'Réponse à la recherche'}
            help="Affichée quand un visiteur cherche un quartier de la zone."
          >
            {(control) => (
              <textarea
                {...control}
                key={language}
                lang={language}
                rows={2}
                value={en ? draft.resultEn : draft.result}
                placeholder={en ? draft.result : undefined}
                maxLength={240}
                onChange={(event) => set(en ? 'resultEn' : 'result', event.target.value)}
                className={cn(compactInputClass, 'resize-y')}
              />
            )}
          </CompactField>
          <div className="grid gap-4 sm:grid-cols-2">
            <CompactField label="Délai moyen" help="Ex. « 30–45 min » ; vide : « Sur devis ».">
              {(control) => (
                <CompactInput
                  {...control}
                  value={draft.delay}
                  maxLength={30}
                  onChange={(event) => set('delay', event.target.value)}
                />
              )}
            </CompactField>
            <CompactField
              label="Tarif indicatif (FCFA)"
              help="Masqué sur le site : les prix sont donnés sur devis."
              error={errors.fee}
            >
              {(control) => (
                <CompactInput
                  {...control}
                  inputMode="numeric"
                  value={draft.fee}
                  onChange={(event) => set('fee', event.target.value.replace(/\D/g, ''))}
                />
              )}
            </CompactField>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <label className="inline-flex cursor-pointer items-center gap-2 font-ui text-[14px] leading-5 text-text-main">
              <input
                type="checkbox"
                checked={draft.feeFrom}
                onChange={(event) => set('feeFrom', event.target.checked)}
                className="size-4 accent-brand-primary"
              />
              Montant minimal (« Dès … »)
            </label>
            <Switch
              label="Zone active sur le site"
              checked={draft.active}
              onChange={(event) => set('active', event.target.checked)}
            />
          </div>
          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-1.5 font-ui text-[13px] leading-4 font-medium text-neutral-700">
              Quartiers ({draft.quarters.length})
            </legend>
            {draft.quarters.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {draft.quarters.map((item) => (
                  <li
                    key={item.name}
                    className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 py-1 pr-1 pl-3 font-ui text-[13px] leading-4 text-text-main"
                  >
                    <span aria-hidden className={cn('size-2 rounded-full', TONES[draft.tone].dot)} />
                    {/* Choisir le quartier à placer sur la carte. */}
                    <button
                      type="button"
                      aria-pressed={placing === item.name}
                      title="Placer sur la carte"
                      onClick={() => choosePlacing(item.name)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full hover:underline',
                        placing === item.name && 'font-semibold underline',
                      )}
                    >
                      {item.name}
                      {item.isBase && <span className="font-normal text-text-muted">(base)</span>}
                      {item.coordinates ? (
                        <>
                          <MapPin aria-hidden size={12} className="text-icon-default" />
                          <span className="sr-only">(placé sur la carte)</span>
                        </>
                      ) : (
                        <span className="sr-only">(non placé)</span>
                      )}
                    </button>
                    {!readOnly && (
                      <button
                        type="button"
                        aria-label={`Retirer ${item.name}`}
                        onClick={() => {
                          set(
                            'quarters',
                            draft.quarters.filter((other) => other !== item),
                          );
                          if (placing === item.name) setPlacing(null);
                        }}
                        className="flex size-6 items-center justify-center rounded-full text-icon-default hover:bg-neutral-200 hover:text-text-main"
                      >
                        <X aria-hidden size={14} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {!readOnly && (
              <div className="flex gap-2.5">
                <CompactInput
                  aria-label="Ajouter un quartier"
                  placeholder="Nom du quartier"
                  value={quarter}
                  aria-invalid={errors.quarters ? true : undefined}
                  onChange={(event) => setQuarter(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return;
                    event.preventDefault();
                    addQuarter();
                  }}
                />
                <button type="button" className={cn(compactButtonClass, 'shrink-0')} onClick={addQuarter}>
                  Ajouter
                </button>
              </div>
            )}
            {readOnly ? null : errors.quarters ? (
              <p role="alert" className="font-ui text-[13px] leading-4 text-feedback-error">
                {errors.quarters}
              </p>
            ) : (
              <p className="font-ui text-[12px] leading-4 text-text-muted">
                Un quartier ajouté ici est retiré de son ancienne zone. Les nouveaux quartiers apparaissent
                dans la recherche et les formulaires ; choisissez un quartier pour le placer sur la carte.
              </p>
            )}
          </fieldset>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1.5 font-ui text-[13px] leading-4 font-medium text-neutral-700">
              {placingQuarter ? `Position de ${placingQuarter.name}` : 'Position des quartiers'}
            </legend>
            {placingQuarter ? (
              <div className="grid items-start gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <CompactField label="Latitude" help="Degrés décimaux, ex. 4.0565">
                  {(control) => (
                    <CompactInput
                      {...control}
                      aria-invalid={errors.coordinates ? true : undefined}
                      inputMode="decimal"
                      value={coordinates.lat}
                      onChange={(event) => typeCoordinate('lat', event.target.value)}
                    />
                  )}
                </CompactField>
                <CompactField label="Longitude" help="Degrés décimaux, ex. 9.732">
                  {(control) => (
                    <CompactInput
                      {...control}
                      aria-invalid={errors.coordinates ? true : undefined}
                      inputMode="decimal"
                      value={coordinates.lng}
                      onChange={(event) => typeCoordinate('lng', event.target.value)}
                    />
                  )}
                </CompactField>
                {!readOnly && (
                  <button
                    type="button"
                    disabled={!placingQuarter.coordinates}
                    className={cn(compactButtonClass, 'sm:mt-[21px]')}
                    onClick={() => {
                      setQuarterPoint(placingQuarter.name, null);
                      setCoordinates({ lat: '', lng: '' });
                      setErrors((current) => ({ ...current, coordinates: '' }));
                    }}
                  >
                    Retirer de la carte
                  </button>
                )}
              </div>
            ) : (
              <p className="font-ui text-[12px] leading-4 text-text-muted">
                Ajoutez ou choisissez un quartier ci-dessus pour le placer.
              </p>
            )}
            {(errors.coordinates || apiCoordinateError) && (
              <p role="alert" className="font-ui text-[13px] leading-4 text-feedback-error">
                {errors.coordinates || apiCoordinateError}
              </p>
            )}
            <p aria-live="polite" className="font-ui text-[12px] leading-4 text-text-muted">
              {placingQuarter?.coordinates
                ? `${placingQuarter.name} : ${pointLabel(placingQuarter.coordinates)}.${readOnly ? '' : ' Cliquez ailleurs sur la carte pour le déplacer.'}`
                : readOnly
                  ? 'Quartier non placé sur la carte.'
                  : 'Cliquez sur la carte pour placer le quartier choisi.'}
            </p>
            {/* Montée à l'ouverture seulement (le dialogue reste dans la page fermé) : cadrage sur la zone ouverte. */}
            {open && (
              <ZonesLeafletMap
                key={zone?.id ?? 'nouvelle-zone'}
                zones={previewZones}
                labels={ADMIN_MAP_LABELS}
                selected={placing}
                onPick={readOnly ? undefined : pick}
                onMarkerClick={choosePlacing}
                className="xl:w-full"
              />
            )}
          </fieldset>
          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-1.5 font-ui text-[13px] leading-4 font-medium text-neutral-700">
              Contour de la zone
            </legend>
            <p className="font-ui text-[13px] leading-4 text-text-main">
              {draft.area
                ? `Contour enregistré : ${areaSummary(draft.area)}.`
                : 'Aucun contour : seuls les quartiers placés apparaissent sur la carte.'}
            </p>
            <CompactField
              label="GeoJSON du contour"
              help="Polygon, MultiPolygon, Feature ou FeatureCollection (geojson.io, uMap, QGIS), en [longitude, latitude]."
              error={areaError}
            >
              {(control) => (
                <textarea
                  {...control}
                  rows={3}
                  spellCheck={false}
                  value={areaText}
                  placeholder='{"type": "Polygon", "coordinates": [[[9.715, 4.07], …]]}'
                  onChange={(event) => setAreaText(event.target.value)}
                  className={cn(compactInputClass, 'resize-y font-mono text-[12px] leading-4')}
                />
              )}
            </CompactField>
            {!readOnly && (
              <div className="flex flex-wrap gap-2.5">
                <button type="button" className={compactButtonClass} onClick={() => applyArea()}>
                  Appliquer le contour
                </button>
                <label className={cn(compactButtonClass, 'cursor-pointer focus-within:focus-ring')}>
                  Importer un fichier
                  <input
                    type="file"
                    accept=".geojson,.json,application/geo+json,application/json"
                    onChange={importFile}
                    className="sr-only"
                  />
                </label>
                {draft.area && (
                  <button
                    type="button"
                    className={compactButtonClass}
                    onClick={() => {
                      set('area', null);
                      setAreaText('');
                      setErrors((current) => ({ ...current, area: '' }));
                    }}
                  >
                    Supprimer le contour
                  </button>
                )}
              </div>
            )}
          </fieldset>
        </ReadOnlyFieldset>
      </div>
    </Modal>
  );
}
