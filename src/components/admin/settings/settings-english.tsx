'use client';

import { Languages } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  LanguageTabs,
  languagePanelId,
  languageTabId,
  TextTranslationField,
  type EditorLanguage,
} from '@/components/admin/pages/translation-editor';
import { useCan } from '@/components/admin/shell/permissions';
import { Skeleton } from '@/components/ui/skeleton';
import { fieldTranslationState, translationBadge } from '@/lib/admin/translation';
import { SettingsCard } from './settings-fields';
import { useSettingsGroup, type EditableGroup } from './settings-form';
import {
  combinedState,
  editEnglishText,
  englishText,
  localSettingsStatus,
  markReviewed,
  settingsTextFields,
  type GroupTranslations,
  type TextGroup,
} from './settings-translation';

type EditableTextGroup = TextGroup & EditableGroup;

/** Groupe modifiable qui a des textes : valeur, version anglaise et statut pendant l'édition. */
function useEnglishGroup(group: EditableTextGroup) {
  const { value, saved, update, error } = useSettingsGroup(group);
  const translations = (value as { translations?: GroupTranslations } | undefined)?.translations;
  const status =
    value === undefined
      ? undefined
      : localSettingsStatus(group, value, translations, saved as Parameters<typeof localSettingsStatus>[3]);
  return {
    value,
    translations,
    status,
    error,
    // `translations` du groupe (forme `SettingsTranslations` du contrat, propre à chaque groupe).
    setTranslations: (next: GroupTranslations) => update({ translations: next } as never),
  };
}

/**
 * Onglets « Français | English » d'un onglet de Paramètres : badge d'après les groupes affichés (« À traduire »,
 * « À revoir »). Le panneau anglais ne propose que les textes ; le reste est repris du français.
 */
export function SettingsLanguageTabs({
  id,
  groups,
  lang,
  onChange,
  french,
}: {
  id: string;
  /** Groupes de l'onglet (un ou deux, liste fixe pour un onglet donné). */
  groups: readonly [EditableTextGroup] | readonly [EditableTextGroup, EditableTextGroup];
  lang: EditorLanguage;
  onChange: (lang: EditorLanguage) => void;
  french: ReactNode;
}) {
  const first = useEnglishGroup(groups[0]).status;
  const second = useEnglishGroup(groups[1] ?? groups[0]).status;
  const badge =
    first === undefined || second === undefined ? null : translationBadge(combinedState([first, second]));
  return (
    <div className="flex flex-col gap-5">
      <LanguageTabs idPrefix={id} value={lang} onChange={onChange} badge={badge} />
      <div role="tabpanel" id={languagePanelId(lang, id)} aria-labelledby={languageTabId(lang, id)}>
        {lang === 'fr' ? (
          french
        ) : (
          <div className="flex max-w-[752px] flex-col gap-5">
            {groups.map((group) => (
              <EnglishGroupCard key={group} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const CARD_TITLES: Record<EditableTextGroup, string> = {
  coordonnees: 'Coordonnées de l’agence',
  whatsapp: 'Bouton WhatsApp',
  seo: 'Référencement',
};

/** Carte anglaise d'un groupe : un champ par texte français, texte français en référence, « Marquer comme revu ». */
function EnglishGroupCard({ group }: { group: EditableTextGroup }) {
  const canWrite = useCan()('settings:write', 'settings:admin');
  const { value, translations, status, error, setTranslations } = useEnglishGroup(group);
  const fields = value === undefined ? [] : settingsTextFields(group, value);
  return (
    <SettingsCard
      title={CARD_TITLES[group]}
      subtitle="Version anglaise : vide, le texte français est repris. Numéros, adresses et liens : ceux du français."
    >
      {value === undefined ? (
        <Skeleton className="h-[160px] w-full rounded-md" />
      ) : fields.length === 0 ? (
        <p className="flex items-start gap-2 font-ui text-[14px] leading-5 text-text-muted">
          <Languages aria-hidden size={16} className="mt-0.5 shrink-0" />
          Aucun texte à traduire pour l’instant.
        </p>
      ) : (
        fields.map((field) => (
          <TextTranslationField
            key={field.path}
            label={field.label}
            french={field.french}
            value={englishText(translations, field.path)}
            error={error(`translations.en.${field.path}`)}
            multiline={field.multiline}
            maxLength={field.maxLength}
            state={fieldTranslationState(field.path, status)}
            onMarkReviewed={
              canWrite ? () => setTranslations(markReviewed(translations, field.path)) : undefined
            }
            onChange={(next) => setTranslations(editEnglishText(translations, field.path, next))}
          />
        ))
      )}
    </SettingsCard>
  );
}
