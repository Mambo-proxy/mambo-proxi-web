'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { ImageField } from '@/components/admin/editor/media-picker';
import { RichTextEditor } from '@/components/admin/editor/rich-text-editor';
import { ReadOnlyFieldset } from '@/components/admin/shell/permissions';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/components/ui/toaster';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { AdminMagazineArticle, MagazineArticleFields, MediaImage } from '@/lib/api/schema';
import {
  CompactField,
  CompactInput,
  compactInputClass,
  LanguageSwitch,
  useRefreshMagazine,
  type EditingLanguage,
} from './magazine-ui';

type Draft = {
  title: string;
  titleEn: string;
  theme: string;
  themeEn: string;
  body: string;
  bodyEn: string;
  image: MediaImage | null;
  editionId: string;
};

function draftOf(article: AdminMagazineArticle | null, editionId: string | null): Draft {
  return {
    title: article?.title ?? '',
    titleEn: article?.titleEn ?? '',
    theme: article?.theme ?? '',
    themeEn: article?.themeEn ?? '',
    body: article?.body ?? '',
    bodyEn: article?.bodyEn ?? '',
    image: article?.image ?? null,
    editionId: article?.edition?.id ?? editionId ?? '',
  };
}

type ArticleDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Article modifié ; `null` pour en créer un. */
  article: AdminMagazineArticle | null;
  /** Édition d'un nouvel article (écran d'édition) ; le choix est proposé si `editions` est fourni. */
  editionId?: string | null;
  editions?: { id: string; name: string }[];
  /** Langue ouverte à l'affichage (« Voir les contenus à traduire » ouvre l'anglais). */
  initialLanguage?: EditingLanguage;
  onSaved?: (article: AdminMagazineArticle) => void;
  /** Sans `content:write` : article consulté (champs figés, sans enregistrement). */
  readOnly?: boolean;
};

/**
 * Article du magazine (non maquetté, même langage que l'éditeur d'édition) : titre, thème et texte en français et
 * en anglais, photo, édition.
 */
export function ArticleDialog({
  open,
  onClose,
  article,
  editionId = null,
  editions,
  initialLanguage = 'fr',
  onSaved,
  readOnly = false,
}: ArticleDialogProps) {
  const [draft, setDraft] = useState(() => draftOf(article, editionId));
  const [language, setLanguage] = useState<EditingLanguage>(initialLanguage);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [wasOpen, setWasOpen] = useState(open);
  const refresh = useRefreshMagazine();

  // Réinitialisation à chaque ouverture.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDraft(draftOf(article, editionId));
      setLanguage(initialLanguage);
      setErrors({});
    }
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const save = useMutation({
    mutationFn: () => {
      const body: MagazineArticleFields = {
        title: draft.title.trim(),
        titleEn: draft.titleEn.trim() || null,
        theme: draft.theme.trim(),
        themeEn: draft.themeEn.trim() || null,
        body: draft.body || null,
        bodyEn: draft.bodyEn || null,
        imageId: draft.image?.id ?? null,
        ...(editions || !article ? { editionId: draft.editionId || null } : {}),
      };
      // Schémas `allOf` du contrat générés avec `Record<string, never>` : le corps est typé par `MagazineArticleFields`.
      return article
        ? data(
            browserApi.PATCH('/v1/admin/magazine/articles/{id}', {
              params: { path: { id: article.id } },
              body: body as never,
            }),
          )
        : data(browserApi.POST('/v1/admin/magazine/articles', { body: body as never }));
    },
    onSuccess: (saved) => {
      toast.success(article ? 'Article enregistré.' : 'Article ajouté.');
      refresh();
      onSaved?.(saved);
      onClose();
    },
    onError: (error) => {
      if (error instanceof ApiError && error.fieldErrors) setErrors(error.fieldErrors);
      toast.error(errorMessage(error));
    },
  });

  function submit() {
    const next: Record<string, string> = {};
    if (!draft.title.trim()) next.title = 'Saisissez le titre.';
    if (!draft.theme.trim()) next.theme = 'Saisissez le thème.';
    setErrors(next);
    if (Object.keys(next).length) {
      setLanguage('fr');
      return;
    }
    save.mutate();
  }

  const en = language === 'en';
  const translated = Boolean(draft.titleEn.trim() && draft.bodyEn);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={readOnly ? 'Article' : article ? 'Modifier l’article' : 'Nouvel article'}
      description="Le titre et le texte anglais sont publiés sur le site anglais ; sans eux, l’article y est signalé « à traduire »."
      maxWidth={720}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {readOnly ? 'Fermer' : 'Annuler'}
          </Button>
          {!readOnly && (
            <Button size="sm" loading={save.isPending} onClick={submit}>
              {article ? 'Enregistrer' : 'Ajouter l’article'}
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <LanguageSwitch
          value={language}
          onChange={setLanguage}
          labels={{ fr: 'Français', en: translated ? 'English · traduit' : 'English · à traduire' }}
        />
        {/* Le choix de la langue reste possible en lecture seule : seuls les champs sont figés. */}
        <ReadOnlyFieldset readOnly={readOnly}>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
            <CompactField label={en ? 'Titre (anglais)' : 'Titre'} error={en ? null : errors.title}>
              {(control) => (
                <CompactInput
                  {...control}
                  key={language}
                  lang={language}
                  value={en ? draft.titleEn : draft.title}
                  onChange={(event) => set(en ? 'titleEn' : 'title', event.target.value)}
                  maxLength={160}
                />
              )}
            </CompactField>
            <CompactField label={en ? 'Thème (anglais)' : 'Thème'} error={en ? null : errors.theme}>
              {(control) => (
                <CompactInput
                  {...control}
                  key={language}
                  lang={language}
                  value={en ? draft.themeEn : draft.theme}
                  onChange={(event) => set(en ? 'themeEn' : 'theme', event.target.value)}
                  placeholder={en ? draft.theme : 'Santé et nutrition'}
                  maxLength={60}
                />
              )}
            </CompactField>
          </div>
          {editions && (
            <CompactField label="Édition">
              {(control) => (
                <select
                  {...control}
                  value={draft.editionId}
                  onChange={(event) => set('editionId', event.target.value)}
                  className={compactInputClass}
                >
                  <option value="">Sans édition</option>
                  {editions.map((edition) => (
                    <option key={edition.id} value={edition.id}>
                      {edition.name}
                    </option>
                  ))}
                </select>
              )}
            </CompactField>
          )}
          <ImageField
            label="Photo"
            value={draft.image}
            onChange={(image) => set('image', image)}
            help="JPG ou PNG · 1 600 px conseillé · texte alternatif obligatoire"
          />
          <RichTextEditor
            key={language}
            label={en ? 'Texte (anglais)' : 'Texte'}
            value={en ? draft.bodyEn : draft.body}
            onChange={(value) => set(en ? 'bodyEn' : 'body', value)}
            minHeight={200}
          />
        </ReadOnlyFieldset>
      </div>
    </Modal>
  );
}
