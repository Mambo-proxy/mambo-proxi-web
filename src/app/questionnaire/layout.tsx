import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Logo } from '@/components/brand/logo';

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Gabarit du questionnaire de satisfaction (`82:9565`) : page autonome ouverte depuis l'e-mail, sans en-tête, pied de
 * page ni WhatsApp flottant — une barre blanche avec le logo centré, puis le contenu sur fond `neutral/50`.
 */
export default function SurveyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-neutral-50">
      <header className="flex justify-center border-b border-border-default bg-neutral-0 px-5 py-[18px]">
        <Logo className="h-[33px] w-auto md:h-10" priority />
      </header>
      <main id="contenu" className="flex flex-1 justify-center px-4 pt-7 pb-12 md:pt-14 md:pb-24">
        {children}
      </main>
    </div>
  );
}
