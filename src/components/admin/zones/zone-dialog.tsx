'use client';

import { useMutation } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useState } from 'react';
import {
  CompactField,
  CompactInput,
  compactButtonClass,
  compactInputClass,
  LanguageSwitch,
  type EditingLanguage,
} from '@/components/admin/magazine/magazine-ui';
import { TONES } from '@/components/sections/zones/zone-tones';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { AdminZone, ZoneFields, ZoneQuarter, ZoneTone } from '@/lib/api/schema';
import { cn } from '@/lib/cn';

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
  };
}

/**
 * Zone d'intervention (non maquetté, même langage que les éditeurs du back-office) : nom, couleur, textes du site
 * en français et en anglais, délai moyen, tarif indicatif (masqué sur le site), quartiers.
 */
export function ZoneDialog({
  open,
  onClose,
  zone,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  /** Zone modifiée ; `null` pour en créer une. */
  zone: AdminZone | null;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState(() => draftOf(zone));
  const [language, setLanguage] = useState<EditingLanguage>('fr');
  const [quarter, setQuarter] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDraft(draftOf(zone));
      setLanguage('fr');
      setQuarter('');
      setErrors({});
    }
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  function addQuarter() {
    const name = quarter.trim();
    if (!name) return;
    if (draft.quarters.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      setErrors({ quarters: 'Ce quartier figure déjà dans la zone.' });
      return;
    }
    set('quarters', [...draft.quarters, { name, isBase: false, labelOnSmallMap: false, position: null }]);
    setQuarter('');
    setErrors({});
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
      title={zone ? `Modifier « ${zone.name} »` : 'Nouvelle zone'}
      description="Les textes s’affichent sur la carte, dans la recherche de quartier et dans les formulaires du site."
      maxWidth={680}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button size="sm" loading={save.isPending} onClick={submit}>
            {zone ? 'Enregistrer' : 'Ajouter la zone'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <LanguageSwitch
          value={language}
          onChange={setLanguage}
          labels={{ fr: 'Français', en: draft.nameEn.trim() ? 'English · traduit' : 'English · à traduire' }}
        />
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
                  {item.name}
                  {item.isBase && <span className="text-text-muted">(base)</span>}
                  <button
                    type="button"
                    aria-label={`Retirer ${item.name}`}
                    onClick={() =>
                      set(
                        'quarters',
                        draft.quarters.filter((other) => other !== item),
                      )
                    }
                    className="flex size-6 items-center justify-center rounded-full text-icon-default hover:bg-neutral-200 hover:text-text-main"
                  >
                    <X aria-hidden size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
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
          {errors.quarters ? (
            <p role="alert" className="font-ui text-[13px] leading-4 text-feedback-error">
              {errors.quarters}
            </p>
          ) : (
            <p className="font-ui text-[12px] leading-4 text-text-muted">
              Un quartier ajouté ici est retiré de son ancienne zone. Les nouveaux quartiers apparaissent dans
              la recherche et les formulaires ; leur position sur la carte est réglée à l’import des contours.
            </p>
          )}
        </fieldset>
      </div>
    </Modal>
  );
}
