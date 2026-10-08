import type { Metadata } from 'next';
import { LoginForm } from '@/components/admin/auth/login-form';
import { safeNextPath } from '@/lib/admin/routes';

export const metadata: Metadata = { title: 'Connexion' };

type SearchParams = { searchParams: Promise<{ suite?: string }> };

/** Connexion au back-office (`95:11689`) ; `?suite=` ramène à la page demandée après connexion. */
export default async function LoginPage({ searchParams }: SearchParams) {
  const { suite } = await searchParams;
  return <LoginForm next={safeNextPath(suite)} />;
}
