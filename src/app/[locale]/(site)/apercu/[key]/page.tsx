import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { PreviewBanner } from '@/components/site/preview-banner';
import { withLocale } from '@/i18n/request-locale';
import { getPage, previewState, setRequestPreview } from '@/lib/pages';
import { isPreviewablePageKey, type PreviewablePageKey } from '@/lib/preview-routes';
import HomePage, { generateMetadata as homeMetadata } from '../../page';
import AvisClientsPage, { generateMetadata as avisClientsMetadata } from '../../avis-clients/page';
import CguPage, { generateMetadata as cguMetadata } from '../../cgu/page';
import ConfidentialitePage, { generateMetadata as confidentialiteMetadata } from '../../confidentialite/page';
import CookiesPage, { generateMetadata as cookiesMetadata } from '../../cookies/page';
import FormationPage, { generateMetadata as formationMetadata } from '../../formation/page';
import MentionsLegalesPage, {
  generateMetadata as mentionsLegalesMetadata,
} from '../../mentions-legales/page';
import MissionPage, { generateMetadata as missionMetadata } from '../../mission/page';
import PartenairesPage, { generateMetadata as partenairesMetadata } from '../../partenaires/page';
import AboutPage, { generateMetadata as aboutMetadata } from '../../qui-sommes-nous/page';
import RecrutementPage, { generateMetadata as recrutementMetadata } from '../../recrutement/page';
import ServicesPage, { generateMetadata as servicesMetadata } from '../../services/page';
import SuiviMamboPage, { generateMetadata as suiviMamboMetadata } from '../../suivi-mambo/page';
import ZonesPage, { generateMetadata as zonesMetadata } from '../../zones-d-intervention/page';

type Query = Record<string, string | string[] | undefined>;
type Entry = {
  /** Composant de la page (les avis clients lisent aussi `searchParams` : page, filtre et tri). */
  Page: (props: { params: Promise<{ locale: string }>; searchParams: Promise<Query> }) => Promise<ReactNode>;
  metadata: (props: { params: Promise<{ locale: string }> }) => Promise<Metadata>;
};

/** Pages prérendues rendues ici, à la demande, avec le brouillon de leur page éditoriale. */
const PAGES: Record<PreviewablePageKey, Entry> = {
  accueil: { Page: HomePage, metadata: homeMetadata },
  services: { Page: ServicesPage, metadata: servicesMetadata },
  'zones-d-intervention': { Page: ZonesPage, metadata: zonesMetadata },
  'qui-sommes-nous': { Page: AboutPage, metadata: aboutMetadata },
  mission: { Page: MissionPage, metadata: missionMetadata },
  partenaires: { Page: PartenairesPage, metadata: partenairesMetadata },
  formation: { Page: FormationPage, metadata: formationMetadata },
  recrutement: { Page: RecrutementPage, metadata: recrutementMetadata },
  'avis-clients': { Page: AvisClientsPage, metadata: avisClientsMetadata },
  'suivi-mambo': { Page: SuiviMamboPage, metadata: suiviMamboMetadata },
  'mentions-legales': { Page: MentionsLegalesPage, metadata: mentionsLegalesMetadata },
  confidentialite: { Page: ConfidentialitePage, metadata: confidentialiteMetadata },
  cookies: { Page: CookiesPage, metadata: cookiesMetadata },
  cgu: { Page: CguPage, metadata: cguMetadata },
};

type Props = {
  params: Promise<{ locale: string; key: string }>;
  searchParams: Promise<Query & { preview?: string | string[] }>;
};

/** Page et jeton de la requête, le jeton enregistré pour les lectures de la page (`getPage`). */
async function resolve({ params, searchParams }: Props) {
  const [{ key }, query] = await Promise.all([params, searchParams]);
  const preview = typeof query.preview === 'string' && query.preview ? query.preview : undefined;
  if (!preview || !isPreviewablePageKey(key)) notFound();
  setRequestPreview(preview);
  return { key, preview, entry: PAGES[key] };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  await withLocale(props.params);
  const { entry } = await resolve(props);
  const metadata = await entry.metadata({ params: props.params });
  return { ...metadata, robots: { index: false, follow: false } };
}

/**
 * Aperçu d'un brouillon (bouton « Aperçu » du back-office) : le proxy réécrit `/qui-sommes-nous?preview=<jeton>` (ou
 * `/en/about-us?preview=…`) vers cette route, dynamique, qui rend la page habituelle avec le brouillon de l'API (lu
 * sans cache) sous un bandeau d'aperçu. Jeton expiré ou refusé : version publiée et bandeau « Lien d'aperçu
 * expiré ». Jamais indexée. Sans jeton : page introuvable.
 */
export default async function PreviewPage(props: Props) {
  await withLocale(props.params);
  const { key, preview, entry } = await resolve(props);
  const page = await getPage(key);
  const { Page } = entry;
  return (
    <>
      <PreviewBanner state={previewState(preview, page)} />
      <Page params={props.params} searchParams={props.searchParams} />
    </>
  );
}
