import type { Metadata } from 'next';
import { LegalPage, legalMetadata } from '@/components/sections/legal/legal-page';

export function generateMetadata(): Promise<Metadata> {
  return legalMetadata('cgu');
}

export default function Page() {
  return <LegalPage pageKey="cgu" />;
}
