import type { Metadata } from 'next';
import { TokenAction } from '@/components/sections/system/token-action';

export const metadata: Metadata = { title: 'Confirmation de votre inscription', robots: { index: false } };

type SearchParams = { searchParams: Promise<{ token?: string }> };

/** Lien de l'e-mail de double opt-in : confirme l'inscription à la newsletter (`POST /v1/newsletter/confirm`). */
export default async function NewsletterConfirmationPage({ searchParams }: SearchParams) {
  const { token } = await searchParams;
  return <TokenAction kind="newsletter-confirm" token={token ?? null} />;
}
