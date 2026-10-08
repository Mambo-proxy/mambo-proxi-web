import type { Metadata } from 'next';
import Link from 'next/link';
import { TokenAction } from '@/components/sections/system/token-action';
import { buttonVariants } from '@/components/ui/button';
import { routes } from '@/lib/routes';

export const metadata: Metadata = { title: 'Confirmer votre rendez-vous', robots: { index: false } };

type SearchParams = { searchParams: Promise<{ ref?: string; token?: string }> };

/**
 * Lien de l'e-mail « nouveau créneau proposé » : le client accepte le créneau
 * (`POST /v1/appointments/{reference}/accept-proposal`) ; en cas d'échec, il peut en choisir un autre.
 */
export default async function AcceptAppointmentPage({ searchParams }: SearchParams) {
  const { ref, token } = await searchParams;
  return (
    <TokenAction
      kind="appointment-accept"
      token={ref && token ? token : null}
      reference={ref ?? null}
      extra={
        <Link href={routes.rendezVous} className={buttonVariants()}>
          Choisir un autre créneau
        </Link>
      }
    />
  );
}
