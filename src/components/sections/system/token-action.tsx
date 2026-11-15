'use client';

import type { Route } from 'next';
import { useTranslations } from 'next-intl';
import { SiteLink as Link } from '@/i18n/site-link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { browserApi } from '@/lib/api/browser';
import { errorMessage, toApiError } from '@/lib/api/errors';
import { routes } from '@/lib/routes';
import { StatusCard } from './status-card';

type Kind = 'newsletter-confirm' | 'newsletter-unsubscribe' | 'appointment-accept';

/** Textes de chaque action : `system.tokenAction.<clé>`. */
const COPY_KEY = {
  'newsletter-confirm': 'newsletterConfirm',
  'newsletter-unsubscribe': 'newsletterUnsubscribe',
  'appointment-accept': 'appointmentAccept',
} as const;

/** Actions sur clic uniquement : écran de demande avant l'action. */
const ASK_KEY: Partial<Record<Kind, 'newsletterUnsubscribe' | 'appointmentAccept'>> = {
  'newsletter-unsubscribe': 'newsletterUnsubscribe',
  'appointment-accept': 'appointmentAccept',
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
  const t = useTranslations('system.tokenAction');
  const common = useTranslations('forms.common');
  const key = COPY_KEY[kind];
  const askKey = ASK_KEY[kind];
  const [state, setState] = useState<State>({ step: askKey ? 'ask' : 'pending' });
  const started = useRef(false);

  async function run() {
    if (!token) {
      setState({ step: 'failed', message: t('incompleteLink') });
      return;
    }
    setState({ step: 'pending' });
    try {
      const { data, error, response } = await send(kind, token, reference);
      if (!response.ok || !data) throw toApiError(error, response);
      setState({ step: 'done', message: data.message });
    } catch (caught) {
      setState({ step: 'failed', message: errorMessage(caught, common('unexpectedError')) });
    }
  }

  useEffect(() => {
    if (askKey || started.current) return;
    started.current = true;
    void run();
    // Une seule fois, à l'ouverture du lien.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const home = (
    <Link href={routes.home} className={buttonVariants({ variant: 'outline' })}>
      {t('home')}
    </Link>
  );

  if (state.step === 'ask' && askKey)
    return (
      <StatusCard tone="info" title={t(`${askKey}.askTitle`)} text={t(`${askKey}.askText`)}>
        <Button onClick={() => void run()}>{t(`${askKey}.askButton`)}</Button>
        {home}
      </StatusCard>
    );
  if (state.step === 'pending') return <StatusCard tone="pending" title={t(`${key}.pending`)} />;
  if (state.step === 'done')
    return (
      <StatusCard tone="success" title={t(`${key}.success`)} text={state.message}>
        <Link href={'/services' as Route} className={buttonVariants()}>
          {t('discoverServices')}
        </Link>
        {home}
      </StatusCard>
    );
  return (
    <StatusCard tone="error" title={t(`${key}.failure`)} text={'message' in state ? state.message : null}>
      {extra}
      {home}
    </StatusCard>
  );
}
