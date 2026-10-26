'use client';

import { useMutation } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/admin/editor/editor-ui';
import { ImageField } from '@/components/admin/editor/media-picker';
import { CompactField, CompactInput, compactInputClass } from '@/components/admin/magazine/magazine-ui';
import { ReadOnlyFieldset } from '@/components/admin/shell/permissions';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { AdminPartner, MediaImage, PartnerCategory, PartnerFields } from '@/lib/api/schema';

export const PARTNER_CATEGORY_LABELS: Record<PartnerCategory, string> = {
  EXPERIENCE: 'Prestataires Expérience',
  IMMOBILIER: 'Immobilier',
  ENTREPRISES: 'Entreprises & prestataires',
};

type Draft = {
  name: string;
  category: PartnerCategory;
  logo: MediaImage | null;
  url: string;
  visible: boolean;
};

function draftOf(partner: AdminPartner | null, category: PartnerCategory | null): Draft {
  return {
    name: partner?.name ?? '',
    category: partner?.category ?? category ?? 'EXPERIENCE',
    logo: partner?.logo ?? null,
    url: partner?.url ?? '',
    visible: partner?.visible ?? true,
  };
}

/**
 * Partenaire (non maquetté, même langage que la modale des zones) : nom, catégorie, logo (médiathèque, PNG ou SVG
 * sur fond transparent), lien vers son site et affichage sur le site. La suppression est confirmée.
 */
export function PartnerDialog({
  open,
  onClose,
  partner,
  defaultCategory = null,
  onSaved,
  readOnly = false,
}: {
  open: boolean;
  onClose: () => void;
  /** Partenaire modifié ; `null` pour en ajouter un. */
  partner: AdminPartner | null;
  /** Catégorie proposée à l'ajout (filtre en cours). */
  defaultCategory?: PartnerCategory | null;
  onSaved: () => void;
  /** Sans `content:write` : fiche consultée (champs figés, ni enregistrement ni suppression). */
  readOnly?: boolean;
}) {
  const [draft, setDraft] = useState(() => draftOf(partner, defaultCategory));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDraft(draftOf(partner, defaultCategory));
      setErrors({});
    }
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const save = useMutation({
    mutationFn: () => {
      const body: PartnerFields = {
        name: draft.name.trim(),
        category: draft.category,
        logoImageId: draft.logo?.id ?? null,
        url: draft.url.trim() || null,
        visible: draft.visible,
      };
      // Schémas `allOf` du contrat générés avec `Record<string, never>` : le corps est typé par `PartnerFields`.
      return partner
        ? data(
            browserApi.PATCH('/v1/admin/partners/{id}', {
              params: { path: { id: partner.id } },
              body: body as never,
            }),
          )
        : data(browserApi.POST('/v1/admin/partners', { body: body as never }));
    },
    onSuccess: () => {
      toast.success(partner ? 'Partenaire enregistré.' : 'Partenaire ajouté.');
      onSaved();
      onClose();
    },
    onError: (error) => {
      if (error instanceof ApiError) setErrors(error.fieldErrors);
      toast.error(errorMessage(error));
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      data(browserApi.DELETE('/v1/admin/partners/{id}', { params: { path: { id } } })),
    onSuccess: () => {
      setDeleting(false);
      toast.success('Partenaire supprimé.');
      onSaved();
      onClose();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  function submit() {
    const next: Record<string, string> = {};
    if (!draft.name.trim()) next.name = 'Saisissez le nom du partenaire.';
    if (draft.url.trim() && !/^https?:\/\/\S+\.\S+/.test(draft.url.trim()))
      next.url = 'Saisissez une adresse commençant par https://.';
    setErrors(next);
    if (Object.keys(next).length) return;
    save.mutate();
  }

  return (
    <>
      <Modal
        // La confirmation de suppression s'ouvre par-dessus (fermer la modale déclencherait `onClose`).
        open={open}
        onClose={onClose}
        title={partner ? (readOnly ? partner.name : `Modifier « ${partner.name} »`) : 'Ajouter un partenaire'}
        description="Le logo s’affiche sur la page Partenaires et sur l’accueil du site, dans la catégorie choisie."
        maxWidth={600}
        footer={
          <div className="flex flex-wrap items-center gap-2">
            {partner && !readOnly && (
              <Button variant="ghost" size="sm" onClick={() => setDeleting(true)} className="mr-auto">
                <Trash2 aria-hidden />
                Supprimer
              </Button>
            )}
            <div className="ml-auto flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                {readOnly ? 'Fermer' : 'Annuler'}
              </Button>
              {!readOnly && (
                <Button size="sm" loading={save.isPending} onClick={submit}>
                  {partner ? 'Enregistrer' : 'Ajouter le partenaire'}
                </Button>
              )}
            </div>
          </div>
        }
      >
        <ReadOnlyFieldset readOnly={readOnly}>
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
              <CompactField label="Nom" error={errors.name}>
                {(control) => (
                  <CompactInput
                    {...control}
                    value={draft.name}
                    placeholder="Saveurs de Douala"
                    maxLength={120}
                    onChange={(event) => set('name', event.target.value)}
                  />
                )}
              </CompactField>
              <CompactField label="Catégorie" error={errors.category}>
                {(control) => (
                  <select
                    {...control}
                    value={draft.category}
                    onChange={(event) => set('category', event.target.value as PartnerCategory)}
                    className={compactInputClass}
                  >
                    {(Object.keys(PARTNER_CATEGORY_LABELS) as PartnerCategory[]).map((category) => (
                      <option key={category} value={category}>
                        {PARTNER_CATEGORY_LABELS[category]}
                      </option>
                    ))}
                  </select>
                )}
              </CompactField>
            </div>
            <ImageField
              label="Logo"
              value={draft.logo}
              onChange={(image) => set('logo', image)}
              help="PNG ou SVG, fond transparent"
              aspectClassName="aspect-[2/1]"
              contain
            />
            <CompactField
              label="Site du partenaire"
              help="Facultatif : le logo renvoie vers ce site."
              error={errors.url}
            >
              {(control) => (
                <CompactInput
                  {...control}
                  type="url"
                  inputMode="url"
                  value={draft.url}
                  placeholder="https://"
                  onChange={(event) => set('url', event.target.value)}
                />
              )}
            </CompactField>
            <Switch
              label="Logo affiché sur le site"
              checked={draft.visible}
              onChange={(event) => set('visible', event.target.checked)}
            />
          </div>
        </ReadOnlyFieldset>
      </Modal>
      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={() => partner && remove.mutate(partner.id)}
        title={`Supprimer « ${partner?.name ?? ''} » ?`}
        description="Le logo disparaît du site et du back-office."
        confirmLabel="Supprimer le partenaire"
        destructive
        pending={remove.isPending}
      />
    </>
  );
}
