import type { Metadata } from 'next';
import { SetPasswordForm } from '@/components/admin/auth/password-forms';

export const metadata: Metadata = { title: 'Activation du compte' };

type SearchParams = { searchParams: Promise<{ token?: string }> };

/** Lien de l'e-mail d'invitation au back-office (`POST /v1/auth/accept-invite`). */
export default async function AcceptInvitePage({ searchParams }: SearchParams) {
  const { token } = await searchParams;
  return <SetPasswordForm mode="invite" token={token ?? null} />;
}
