import Image from 'next/image';
import { connection } from 'next/server';
import type { ReactNode } from 'react';
import { Visual } from '@/components/ui/visual';

/**
 * Écrans d'accès au back-office (Connexion `95:11689`) : panneau sombre 640 à gauche (logo blanc, illustration
 * « equipe », accroche) et formulaire centré dans une colonne de 400 à droite. En dessous de 1024 px, le panneau
 * disparaît et le logo passe au-dessus du formulaire.
 */
export default async function AdminAuthLayout({ children }: { children: ReactNode }) {
  // Rendu à chaque requête : la CSP du back-office porte un nonce propre à la requête.
  await connection();
  return (
    <div className="flex min-h-dvh bg-neutral-0">
      <aside className="hidden w-[640px] shrink-0 flex-col justify-between bg-neutral-900 p-14 lg:flex">
        <Image
          src="/brand/logo-horizontal-white.svg"
          alt="MAMBO Proxi"
          width={288}
          height={80}
          unoptimized
          priority
          className="h-[43px] w-auto self-start"
        />
        <Visual
          visual={{ illustration: 'equipe', image: null }}
          sizes="528px"
          priority
          className="aspect-[528/380] w-full rounded-[24px]"
        />
        <div className="flex flex-col gap-2.5">
          <p className="font-brand text-[30px] leading-[38px] font-semibold tracking-[-0.01em] text-neutral-0">
            Pilotez tout le site depuis un seul endroit.
          </p>
          <p className="font-ui text-[16px] leading-6 text-neutral-300">
            Demandes, services, contenus, avis et rendez-vous&nbsp;: votre agence, simplement.
          </p>
        </div>
      </aside>
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8">
        <Image
          src="/brand/logo-horizontal.svg"
          alt="MAMBO Proxi"
          width={288}
          height={80}
          unoptimized
          priority
          className="mb-10 h-10 w-auto lg:hidden"
        />
        <div className="w-full max-w-[400px]">{children}</div>
      </main>
    </div>
  );
}
