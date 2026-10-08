'use client';

import Link from 'next/link';
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
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorPanel
      eyebrow="Erreur 500"
      title="Un imprévu sur la route."
      text="Une erreur est survenue de notre côté. Réessayez dans quelques instants ; si le problème continue, contactez-nous."
      actions={
        <>
          <Button onClick={() => reset()}>Réessayer</Button>
          <Link href={routes.home} className={buttonVariants({ variant: 'outline' })}>
            Retour à l’accueil
          </Link>
        </>
      }
    />
  );
}
