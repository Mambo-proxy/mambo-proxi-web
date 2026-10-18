import type { Metadata } from 'next';
import { LegalPage, legalMetadata } from '@/components/sections/legal/legal-page';

export function generateMetadata(): Promise<Metadata> {
  return legalMetadata('cookies');
}

export default function Page() {
  return <LegalPage pageKey="cookies" />;
}
