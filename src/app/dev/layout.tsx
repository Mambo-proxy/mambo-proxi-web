import type { ReactNode } from 'react';
import { RootDocument } from '@/components/root-document';

/** Pages internes de contrôle (hors production). */
export default function DevLayout({ children }: { children: ReactNode }) {
  return <RootDocument lang="fr">{children}</RootDocument>;
}
