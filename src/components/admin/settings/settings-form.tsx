'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type {
  SettingsAnalytics,
  SettingsCoordonnees,
  SettingsEmails,
  SettingsReseaux,
  SettingsRgpd,
  SettingsSecurite,
  SettingsSeo,
  SettingsWhatsapp,
} from '@/lib/api/schema';

/** Groupes de paramètres modifiés par l'écran (enregistrés ensemble par « Enregistrer »). */
export type GroupValues = {
  coordonnees: SettingsCoordonnees;
  whatsapp: SettingsWhatsapp;
  reseaux: SettingsReseaux;
  emails: SettingsEmails;
  seo: SettingsSeo;
  analytics: SettingsAnalytics;
  rgpd: SettingsRgpd;
  securite: SettingsSecurite;
};

export type EditableGroup = keyof GroupValues;

export const settingsKey = (group: EditableGroup) => ['settings', group] as const;

type FormValue = {
  drafts: Partial<GroupValues>;
  errors: Record<string, string>;
  update: <G extends EditableGroup>(group: G, patch: Partial<GroupValues[G]>) => void;
};

const FormContext = createContext<FormValue | null>(null);

/**
 * Brouillons des groupes de paramètres : chaque onglet modifie une copie locale, « Enregistrer » envoie les groupes
 * modifiés (`PUT /v1/admin/settings/{group}`) et répartit les erreurs par champ (`<groupe>.<chemin>`).
 */
export function useSettingsDrafts() {
  const client = useQueryClient();
  const [drafts, setDrafts] = useState<Partial<GroupValues>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const dirty = Object.keys(drafts).length > 0;

  const update = useCallback(
    <G extends EditableGroup>(group: G, patch: Partial<GroupValues[G]>) => {
      setDrafts((previous) => {
        const base = previous[group] ?? client.getQueryData<GroupValues[G]>(settingsKey(group));
        return base ? { ...previous, [group]: { ...base, ...patch } } : previous;
      });
      setErrors((previous) => {
        const prefixes = Object.keys(patch).map((key) => `${group}.${key}`);
        const next = Object.fromEntries(
          Object.entries(previous).filter(([path]) => !prefixes.some((prefix) => path.startsWith(prefix))),
        );
        return Object.keys(next).length === Object.keys(previous).length ? previous : next;
      });
    },
    [client],
  );

  // Modifications non enregistrées : le navigateur demande confirmation avant de quitter la page.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  async function save() {
    const entries = Object.entries(drafts) as [EditableGroup, GroupValues[EditableGroup]][];
    if (!entries.length) {
      toast.info('Aucune modification à enregistrer.');
      return;
    }
    setSaving(true);
    const results = await Promise.allSettled(
      entries.map(([group, value]) =>
        data(browserApi.PUT('/v1/admin/settings/{group}', { params: { path: { group } }, body: value })),
      ),
    );
    setSaving(false);
    const failed: Record<string, string> = {};
    let firstError: unknown = null;
    const saved: EditableGroup[] = [];
    results.forEach((result, index) => {
      const group = entries[index]![0];
      if (result.status === 'fulfilled') {
        client.setQueryData(settingsKey(group), result.value);
        saved.push(group);
        return;
      }
      firstError ??= result.reason;
      if (result.reason instanceof ApiError)
        for (const [path, message] of Object.entries(result.reason.fieldErrors))
          failed[`${group}.${path}`] = message;
    });
    setDrafts((previous) =>
      Object.fromEntries(
        Object.entries(previous).filter(([group]) => !saved.includes(group as EditableGroup)),
      ),
    );
    setErrors(failed);
    if (firstError) toast.error(errorMessage(firstError));
    else toast.success('Paramètres enregistrés : le site est mis à jour.');
  }

  const form = useMemo<FormValue>(() => ({ drafts, errors, update }), [drafts, errors, update]);
  return { form, dirty, saving, save };
}

export function SettingsFormProvider({ form, children }: { form: FormValue; children: ReactNode }) {
  return <FormContext.Provider value={form}>{children}</FormContext.Provider>;
}

/** Valeur d'un groupe (brouillon, sinon valeur enregistrée), modification et erreurs de ses champs. */
export function useSettingsGroup<G extends EditableGroup>(group: G) {
  const form = useContext(FormContext);
  if (!form) throw new Error('useSettingsGroup : SettingsFormProvider manquant.');
  const query = useQuery({
    queryKey: settingsKey(group),
    queryFn: () =>
      data(browserApi.GET('/v1/admin/settings/{group}', { params: { path: { group } } })) as Promise<
        GroupValues[G]
      >,
  });
  const value = (form.drafts[group] as GroupValues[G] | undefined) ?? query.data;
  return {
    value,
    isError: query.isError && !query.data,
    update: (patch: Partial<GroupValues[G]>) => form.update(group, patch),
    error: (path: string) => form.errors[`${group}.${path}`] ?? null,
  };
}
