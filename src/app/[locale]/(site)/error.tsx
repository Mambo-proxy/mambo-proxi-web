'use client';

import { useTranslations } from 'next-intl';
import { SiteLink as Link } from '@/i18n/site-link';
import { useEffect } from 'react';
import { ErrorPanel } from '@/components/sections/errors/error-panel';
import { Button, buttonVariants } from '@/components/ui/button';
import { routes } from '@/lib/routes';

/** Erreur inattendue (500) : gabarit de la page 404, message adapté, « Réessayer » et retour à l'accueil. */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorPanel
      eyebrow={t('error.eyebrow')}
      title={t('error.title')}
      text={t('error.text')}
      actions={
        <>
          <Button onClick={() => reset()}>{t('error.retry')}</Button>
          <Link href={routes.home} className={buttonVariants({ variant: 'outline' })}>
            {t('home')}
          </Link>
        </>
      }
    />
  );
}
