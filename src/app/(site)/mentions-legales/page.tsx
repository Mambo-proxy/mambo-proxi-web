import type { Metadata } from 'next';
import { LegalPage, legalMetadata } from '@/components/sections/legal/legal-page';

export function generateMetadata(): Promise<Metadata> {
  return legalMetadata('mentions-legales');
}

export default function Page() {
  return <LegalPage pageKey="mentions-legales" />;
}
