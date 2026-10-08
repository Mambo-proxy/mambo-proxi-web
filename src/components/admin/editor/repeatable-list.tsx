'use client';

import { Trash2 } from 'lucide-react';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { AddItemButton } from './editor-ui';
import { DragHandle, SortableItem, SortableList } from './sortable';

type RepeatableListProps<T> = {
  value: T[];
  onChange: (value: T[]) => void;
  /** Nouvel élément ajouté par le bouton (« Ajouter une étape »). */
  createItem: () => T;
  addLabel: string;
  /** Nom d'un élément pour les libellés accessibles (« étape 2 », « public 1 »). */
  itemName: string;
  /** Résumé lu par les lecteurs d'écran lors d'un déplacement. */
  getLabel?: (item: T, index: number) => string;
  max?: number;
  renderFields: (item: T, update: (next: T) => void, index: number) => ReactNode;
};

/**
 * Liste répétable d'un éditeur (`91:10853` publics, étapes, avantages, questions) : éléments fond `neutral/50`,
 * rayon 12, padding 14, écart 12, poignée, sous-champs, bouton supprimer 32 px ; bouton d'ajout pointillé.
 * Les éléments n'ont pas d'identifiant côté API : une clé stable est attribuée à chacun pour la session.
 */
export function RepeatableList<T>({
  value,
  onChange,
  createItem,
  addLabel,
  itemName,
  getLabel,
  max,
  renderFields,
}: RepeatableListProps<T>) {
  const [keys, setKeys] = useState<string[]>(() => value.map(newKey));
  // Valeur remplacée de l'extérieur (chargement, annulation) : clés ajustées au nombre d'éléments.
  if (keys.length !== value.length) {
    setKeys(value.map((_, index) => keys[index] ?? newKey()));
  }
  const entries = value.map((item, index) => ({ item, key: keys[index] ?? `pending-${index}`, index }));
  const label = (item: T, index: number) => getLabel?.(item, index) || `${itemName} ${index + 1}`;

  return (
    <div className="flex flex-col gap-3">
      {entries.length > 0 && (
        <SortableList
          items={entries}
          getId={(entry) => entry.key}
          getLabel={(entry) => label(entry.item, entry.index)}
          onReorder={(next) => {
            setKeys(next.map((entry) => entry.key));
            onChange(next.map((entry) => entry.item));
          }}
          className="flex flex-col gap-3"
          renderItem={(entry, index) => (
            <SortableItem
              key={entry.key}
              id={entry.key}
              className="flex items-start gap-2 rounded-md bg-neutral-50 p-3.5"
            >
              <DragHandle label={label(entry.item, index)} className="-ml-1" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                {renderFields(
                  entry.item,
                  (next) => onChange(value.map((current, position) => (position === index ? next : current))),
                  index,
                )}
              </div>
              <button
                type="button"
                aria-label={`Supprimer ${label(entry.item, index)}`}
                onClick={() => {
                  setKeys(keys.filter((_, position) => position !== index));
                  onChange(value.filter((_, position) => position !== index));
                }}
                className="flex size-8 shrink-0 items-center justify-center rounded-sm text-icon-default hover:bg-neutral-100 hover:text-text-main"
              >
                <Trash2 aria-hidden size={16} />
              </button>
            </SortableItem>
          )}
        />
      )}
      <AddItemButton
        disabled={max !== undefined && value.length >= max}
        onClick={() => {
          setKeys([...keys, newKey()]);
          onChange([...value, createItem()]);
        }}
      >
        {addLabel}
      </AddItemButton>
    </div>
  );
}

let sequence = 0;
const newKey = () => `item-${sequence++}`;

/** Sous-champ d'un élément répétable : fond blanc, bordure `border/default`, rayon 8, padding 10/12, Inter 14. */
export function SubInput({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'w-full rounded-sm border border-border-default bg-neutral-0 px-3 py-2.5 font-ui text-[14px] leading-5 text-text-main',
        'placeholder:text-text-muted focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none focus:ring-inset',
        'aria-invalid:border-feedback-error',
        className,
      )}
      {...props}
    />
  );
}

export function SubTextarea({ className, rows = 2, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      rows={rows}
      className={cn(
        'w-full resize-y rounded-sm border border-border-default bg-neutral-0 px-3 py-2.5 font-ui text-[14px] leading-5 text-text-main',
        'placeholder:text-text-muted focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none focus:ring-inset',
        className,
      )}
      {...props}
    />
  );
}
