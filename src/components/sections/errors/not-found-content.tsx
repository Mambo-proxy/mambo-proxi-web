import type { Route } from 'next';
import { useTranslations } from 'next-intl';
import { SiteLink as Link } from '@/i18n/site-link';
import { buttonVariants } from '@/components/ui/button';
import { routes } from '@/lib/routes';
import { ErrorPanel } from './error-panel';

/** Contenu de la page 404, partagé par les pages introuvables du site et les adresses inconnues. */
export function NotFoundContent() {
  const t = useTranslations('errors');
  return (
    <ErrorPanel
      eyebrow={t('notFound.eyebrow')}
      title={t('notFound.title')}
      text={t('notFound.text')}
      photo="/photos/page404.png"
      actions={
        <>
          <Link href={routes.home} className={buttonVariants()}>
            {t('home')}
          </Link>
          <Link href={'/services' as Route} className={buttonVariants({ variant: 'outline' })}>
            {t('notFound.services')}
          </Link>
        </>
      }
    />
  );
}
