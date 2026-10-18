'use client';

import { ChevronRight, Minus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useId, useState } from 'react';
import { ConfirmDialog } from '@/components/admin/editor/editor-ui';
import { DragHandle, SortableItem } from '@/components/admin/editor/sortable';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { adminRoutes } from '@/lib/admin/routes';
import type { PageSection } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { sectionDescription, sectionLabel } from './page-model';
import { AdvancedFields, SectionEditor } from './section-editors';

/** Bouton d'ouverture d'une section (identifiant utilisé pour y replacer le focus). */
export const sectionToggleId = (id: string) => `section-${id}-toggle`;

const headerTitle = 'font-ui text-[15px] leading-6 font-semibold text-text-main';
const headerText = 'font-ui text-[12px] leading-4 text-text-muted';

/**
 * Carte de section (`92:11042`) : repliée — fond blanc, bordure `border/default`, rayon 16, padding 18, poignée,
 * nom (Inter SemiBold 15/24), description (Inter 12 `text/muted`), interrupteur de visibilité, chevron ;
 * dépliée — bordure 2 px `brand/primary`, icône « moins », éditeur de la section (écart 16).
 * Toute la ligne d'en-tête ouvre ou referme la section (bouton étendu), sauf la poignée et l'interrupteur.
 */
export function SectionCard({
  section,
  path,
  open,
  hasErrors,
  onToggle,
  onChange,
  onRemove,
}: {
  section: PageSection;
  path: string;
  open: boolean;
  hasErrors: boolean;
  onToggle: () => void;
  onChange: (next: PageSection) => void;
  onRemove: () => void;
}) {
  const id = useId();
  const [confirming, setConfirming] = useState(false);
  const label = sectionLabel(section);
  return (
    <SortableItem
      id={section.id}
      className={cn(
        'rounded-lg bg-neutral-0',
        open ? 'border-2 border-brand-primary p-[17px]' : 'border border-border-default p-[18px]',
      )}
    >
      <div className="relative flex items-center gap-3">
        <span className="relative z-10 -mx-[7px] flex">
          <DragHandle label={`la section « ${label} »`} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className={headerTitle}>
            <button
              type="button"
              id={sectionToggleId(section.id)}
              aria-expanded={open}
              aria-controls={`${id}-content`}
              aria-describedby={`${id}-description`}
              onClick={onToggle}
              className={cn(
                'rounded-xs text-left after:absolute after:inset-0 after:rounded-md after:content-[""]',
                'focus-visible:outline-none focus-visible:after:focus-ring',
              )}
            >
              {label}
              {hasErrors && <span className="sr-only"> (champs à corriger)</span>}
            </button>
          </h3>
          <p id={`${id}-description`} className={cn(headerText, 'truncate')}>
            {sectionDescription(section)}
            {!section.enabled && ' · masquée sur le site'}
          </p>
        </div>
        {hasErrors && (
          <span aria-hidden className="relative z-10 size-2 shrink-0 rounded-full bg-feedback-error" />
        )}
        <span className="relative z-10 flex">
          <Switch
            id={`${id}-visible`}
            hideLabel
            label={`Afficher la section « ${label} » sur le site`}
            checked={section.enabled}
            onChange={(event) => onChange({ ...section, enabled: event.target.checked })}
          />
        </span>
        <span aria-hidden className="ml-1 flex text-icon-default">
          {open ? <Minus size={18} /> : <ChevronRight size={18} />}
        </span>
      </div>
      {open && (
        <div id={`${id}-content`} className="mt-4 flex flex-col gap-4">
          <SectionEditor section={section} onChange={onChange} path={path} />
          {section.type !== 'hero' || section.variant !== 'legal' ? (
            <AdvancedFields section={section} onChange={onChange} path={path} />
          ) : null}
          {section.type !== 'dynamic' && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
                <Trash2 aria-hidden />
                Supprimer la section
              </Button>
            </div>
          )}
          <ConfirmDialog
            open={confirming}
            onClose={() => setConfirming(false)}
            onConfirm={() => {
              setConfirming(false);
              onRemove();
            }}
            title={`Supprimer la section « ${label} » ?`}
            description="Elle sera retirée du brouillon. Tant que la page n’est pas publiée, « Annuler les modifications » la rétablit."
            confirmLabel="Supprimer la section"
            destructive
          />
        </div>
      )}
    </SortableItem>
  );
}

/**
 * « Bandeau supérieur » de l'accueil (maquette `92:11042`) : téléphones, e-mail et réseaux repris des Paramètres.
 * Ce n'est pas une section de page dans le contrat : la carte renvoie vers les Paramètres.
 */
export function TopBarCard() {
  return (
    <div className="relative flex items-center gap-3 rounded-lg border border-border-default bg-neutral-0 p-[18px]">
      <span aria-hidden className="w-[18px] shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className={headerTitle}>
          <Link
            href={adminRoutes.settings}
            className="rounded-xs after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:outline-none focus-visible:after:focus-ring"
          >
            Bandeau supérieur
            <span className="sr-only"> : modifier dans les Paramètres</span>
          </Link>
        </h3>
        <p className={cn(headerText, 'truncate')}>Téléphones, e-mail et réseaux · repris des Paramètres</p>
      </div>
      <ChevronRight aria-hidden size={18} className="ml-1 shrink-0 text-icon-default" />
    </div>
  );
}
