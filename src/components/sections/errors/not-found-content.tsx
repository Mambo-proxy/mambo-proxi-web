import type { Route } from 'next';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { routes } from '@/lib/routes';
import { ErrorPanel } from './error-panel';

/** Contenu de la page 404, partagé par les pages introuvables du site et les adresses inconnues. */
export function NotFoundContent() {
  return (
    <ErrorPanel
      eyebrow="Erreur 404"
      title="Oups, cette page a pris un autre chemin."
      text="Elle a peut-être été déplacée ou n’existe plus. Voici quelques pistes pour retrouver votre route."
      actions={
        <>
          <Link href={routes.home} className={buttonVariants()}>
            Retour à l’accueil
          </Link>
          <Link href={'/services' as Route} className={buttonVariants({ variant: 'outline' })}>
            Voir nos services
          </Link>
        </>
      }
    />
  );
}
