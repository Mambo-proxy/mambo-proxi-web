'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { AdminServiceListItem } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { categoryLabel } from './service-utils';

/**
 * Sélecteur « + Ajouter un service lié » (non maquetté, même langage que le choix des témoignages) : services des
 * autres lignes, groupés par rubrique, sélection multiple dans la limite autorisée.
 */
export function RelatedPickerDialog({
  open,
  onClose,
  services,
  selected,
  max,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  /** Services proposés (le service modifié en est exclu). */
  services: Pick<AdminServiceListItem, 'id' | 'name' | 'category'>[];
  /** Services déjà liés. */
  selected: string[];
  max: number;
  onConfirm: (ids: string[]) => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setPicked([]);
  }
  const room = max - selected.length;
  const groups = new Map<string, typeof services>();
  for (const service of services.filter((item) => !selected.includes(item.id))) {
    const label = categoryLabel(service.category);
    groups.set(label, [...(groups.get(label) ?? []), service]);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ajouter un service lié"
      description={
        room > 0
          ? `Les services liés s’affichent en bas de la page du service (${max} au plus).`
          : `${max} services sont déjà liés : retirez-en un pour en ajouter un autre.`
      }
      maxWidth={640}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button size="sm" disabled={picked.length === 0} onClick={() => onConfirm(picked)}>
            {picked.length > 1 ? `Ajouter ${picked.length} services` : 'Ajouter le service'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {[...groups].map(([label, items]) => (
          <fieldset key={label} className="flex flex-col gap-2">
            <legend className="mb-2 font-ui text-[13px] leading-4 font-semibold text-text-muted">
              {label}
            </legend>
            <div className="flex flex-wrap gap-2">
              {items.map((service) => {
                const active = picked.includes(service.id);
                const disabled = !active && picked.length >= room;
                return (
                  <button
                    key={service.id}
                    type="button"
                    aria-pressed={active}
                    disabled={disabled}
                    onClick={() =>
                      setPicked((current) =>
                        active ? current.filter((id) => id !== service.id) : [...current, service.id],
                      )
                    }
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-ui text-[13px] leading-4 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                      active
                        ? 'border-neutral-900 bg-neutral-900 text-neutral-0'
                        : 'border-border-strong bg-neutral-0 text-text-main hover:bg-neutral-50',
                    )}
                  >
                    {active && <Check aria-hidden size={14} />}
                    {service.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </Modal>
  );
}
