import { CircleAlert } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SurveyForm } from '@/components/forms/survey-form';
import { buttonVariants } from '@/components/ui/button';
import { Visual } from '@/components/ui/visual';
import { isProblem } from '@/lib/api/errors';
import { api, uncached } from '@/lib/api/server';
import { formatLongDate } from '@/lib/format/date';
import { frenchTypography } from '@/lib/format/typography';
import { routes } from '@/lib/routes';

export const metadata: Metadata = { title: 'Questionnaire de satisfaction' };

type Params = { params: Promise<{ token: string }> };

/** Carte du questionnaire (`82:9579`) : blanche, bordée, rayon 28, 720 px, p 48 (22 en mobile). */
const CARD =
  'flex w-full max-w-[720px] flex-col gap-6 self-start rounded-[28px] border border-border-default bg-neutral-0 p-[22px] md:gap-7 md:p-12';

/** État d'un lien inutilisable (invalide, expiré ou déjà utilisé) : message de l'API et retour au site. */
function Unavailable({ title, message }: { title: string; message: string }) {
  return (
    <div className={`${CARD} items-center text-center`}>
      <span aria-hidden className="flex size-14 items-center justify-center rounded-full bg-orange-50">
        <CircleAlert size={28} className="text-text-brand" />
      </span>
      <h1 className="font-brand text-[24px] leading-[30px] font-semibold text-text-main md:text-[32px] md:leading-10">
        {frenchTypography(title)}
      </h1>
      <p className="font-ui text-[16px] leading-6 text-text-muted">{frenchTypography(message)}</p>
      <div className="flex w-full flex-col gap-2.5 md:w-auto md:flex-row">
        <Link href={routes.contact} className={buttonVariants({ variant: 'outline' })}>
          Nous contacter
        </Link>
        <Link href={routes.home} className={buttonVariants()}>
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}

/**
 * Questionnaire de satisfaction (desktop `82:9565`, mobile `82:9706`), ouvert depuis le lien de l'e-mail envoyé
 * après la prestation. Jeton inconnu → « lien non valide » ; expiré ou déjà utilisé (410) → message de l'API.
 */
export default async function SurveyPage({ params }: Params) {
  const { token } = await params;
  const {
    data: survey,
    error,
    response,
  } = await api.GET('/v1/surveys/{token}', {
    params: { path: { token } },
    ...uncached,
  });

  if (!survey) {
    const detail = isProblem(error) ? error.detail : null;
    if (response.status === 410)
      return (
        <Unavailable title="Ce questionnaire n’est plus disponible" message={detail ?? 'Ce lien a expiré.'} />
      );
    return (
      <Unavailable
        title="Ce lien n’est pas valide"
        message={detail ?? 'Vérifiez le lien reçu par e-mail, ou contactez-nous.'}
      />
    );
  }

  const date = survey.serviceDate ? formatLongDate(survey.serviceDate) : null;
  return (
    <div className={CARD}>
      <div className="flex flex-col gap-2.5">
        <p className="font-ui text-[12px] leading-4 font-semibold tracking-[0.08em] text-text-brand uppercase">
          Questionnaire de satisfaction
        </p>
        <h1 className="font-brand text-[24px] leading-[30px] font-semibold tracking-[-0.01em] text-text-main md:text-[32px] md:leading-10">
          {frenchTypography('Comment s’est passée votre prestation ?')}
        </h1>
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-3.5">
        <Visual visual={survey.service.visual} sizes="48px" className="size-12 shrink-0 rounded-xl" />
        <div className="flex flex-col">
          <p className="font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-main">
            {[survey.service.name, date].filter(Boolean).join(' · ')}
          </p>
          <p className="text-caption text-text-muted">{`Demande ${survey.reference}`}</p>
        </div>
      </div>
      <SurveyForm token={token} questions={survey.questions} />
    </div>
  );
}
