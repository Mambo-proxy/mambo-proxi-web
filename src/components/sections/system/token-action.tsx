'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { browserApi } from '@/lib/api/browser';
import { errorMessage, toApiError } from '@/lib/api/errors';
import { routes } from '@/lib/routes';
import { StatusCard } from './status-card';

type Kind = 'newsletter-confirm' | 'newsletter-unsubscribe' | 'appointment-accept';

type Copy = {
  /** Écran avant l'action (actions sur clic uniquement). */
  ask?: { title: string; text: string; button: string };
  pending: string;
  success: string;
  failure: string;
};

const COPY: Record<Kind, Copy> = {
  'newsletter-confirm': {
    pending: 'Confirmation de votre inscription…',
    success: 'Inscription confirmée',
    failure: 'Confirmation impossible',
  },
  'newsletter-unsubscribe': {
    ask: {
      title: 'Se désinscrire de la lettre Mambo',
      text: 'Vous ne recevrez plus nos nouveautés, sorties culturelles et conseils. Vous pourrez vous réinscrire à tout moment.',
      button: 'Confirmer ma désinscription',
    },
    pending: 'Désinscription en cours…',
    success: 'Désinscription effectuée',
    failure: 'Désinscription impossible',
  },
  'appointment-accept': {
    ask: {
      title: 'Confirmer le créneau proposé',
      text: 'L’agence vous a proposé un nouveau créneau pour votre rendez-vous. Confirmez-le pour recevoir l’invitation.',
      button: 'Confirmer ce rendez-vous',
    },
    pending: 'Confirmation du rendez-vous…',
    success: 'Rendez-vous confirmé',
    failure: 'Confirmation impossible',
  },
};

type State = { step: 'ask' | 'pending' } | { step: 'done' | 'failed'; message: string };

async function send(kind: Kind, token: string, reference: string | null) {
  if (kind === 'newsletter-confirm') return browserApi.POST('/v1/newsletter/confirm', { body: { token } });
  if (kind === 'newsletter-unsubscribe')
    return browserApi.POST('/v1/newsletter/unsubscribe', { body: { token } });
  return browserApi.POST('/v1/appointments/{reference}/accept-proposal', {
    params: { path: { reference: reference ?? '' } },
    body: { token },
  });
}

/**
 * Action d'un lien d'e-mail (jeton) : la confirmation d'inscription s'exécute à l'ouverture ; la désinscription et
 * l'acceptation d'un créneau attendent un clic, pour qu'un logiciel qui suit les liens ne les déclenche pas.
 */
export function TokenAction({
  kind,
  token,
  reference = null,
  extra,
}: {
  kind: Kind;
  token: string | null;
  reference?: string | null;
  /** Action complémentaire après un échec (ex. « Prendre un autre rendez-vous »). */
  extra?: ReactNode;
}) {
  const copy = COPY[kind];
  const [state, setState] = useState<State>({ step: copy.ask ? 'ask' : 'pending' });
  const started = useRef(false);

  async function run() {
    if (!token) {
      setState({ step: 'failed', message: 'Ce lien est incomplet. Vérifiez le lien reçu par e-mail.' });
      return;
    }
    setState({ step: 'pending' });
    try {
      const { data, error, response } = await send(kind, token, reference);
      if (!response.ok || !data) throw toApiError(error, response);
      setState({ step: 'done', message: data.message });
    } catch (caught) {
      setState({ step: 'failed', message: errorMessage(caught) });
    }
  }

  useEffect(() => {
    if (copy.ask || started.current) return;
    started.current = true;
    void run();
    // Une seule fois, à l'ouverture du lien.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const home = (
    <Link href={routes.home} className={buttonVariants({ variant: 'outline' })}>
      Retour à l’accueil
    </Link>
  );

  if (state.step === 'ask' && copy.ask)
    return (
      <StatusCard tone="info" title={copy.ask.title} text={copy.ask.text}>
        <Button onClick={() => void run()}>{copy.ask.button}</Button>
        {home}
      </StatusCard>
    );
  if (state.step === 'pending') return <StatusCard tone="pending" title={copy.pending} />;
  if (state.step === 'done')
    return (
      <StatusCard tone="success" title={copy.success} text={state.message}>
        <Link href={'/services' as Route} className={buttonVariants()}>
          Découvrir nos services
        </Link>
        {home}
      </StatusCard>
    );
  return (
    <StatusCard tone="error" title={copy.failure} text={'message' in state ? state.message : null}>
      {extra}
      {home}
    </StatusCard>
  );
}
