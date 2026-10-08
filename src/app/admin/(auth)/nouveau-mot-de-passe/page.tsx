import type { Metadata } from 'next';
import { SetPasswordForm } from '@/components/admin/auth/password-forms';

export const metadata: Metadata = { title: 'Nouveau mot de passe' };

type SearchParams = { searchParams: Promise<{ token?: string }> };

/** Lien de l'e-mail de réinitialisation (`POST /v1/auth/reset-password`). */
export default async function ResetPasswordPage({ searchParams }: SearchParams) {
  const { token } = await searchParams;
  return <SetPasswordForm mode="reset" token={token ?? null} />;
}
