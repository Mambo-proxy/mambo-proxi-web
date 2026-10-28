import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import type { PreviewState } from '@/lib/pages';

/**
 * Bandeau d'aperçu du back-office, en tête du contenu : brouillon affiché (« Aperçu du brouillon — non publié »), ou
 * lien expiré / refusé (version publiée affichée). `children` remplace le texte du brouillon (édition du Magazine).
 */
export async function PreviewBanner({ state, children }: { state: PreviewState; children?: ReactNode }) {
  if (!state) return null;
  const t = await getTranslations('draftPreview');
  return (
    <p
      role="status"
      className="bg-orange-50 px-4 py-2.5 text-center font-ui text-[14px] leading-5 font-medium text-text-brand"
    >
      {state === 'draft' ? (children ?? t('draft')) : t('expired')}
    </p>
  );
}
