'use client';

import { Quote } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { frenchTypography } from '@/lib/format/typography';
import { routes } from '@/lib/routes';
import { RegistrationForm, type Profile } from './registration-form';

type RegistrationLayoutProps = {
  initialProfile: Profile;
  categories: { slug: string; name: string }[];
  /** Textes de la page dans sa langue (le formulaire et le panneau lisent `forms.registration`). */
  labels: { home: string; breadcrumb: string; title: string };
};

/**
 * Gabarit ouvert sur le profil de l'adresse (`?profil=professionnel`). La page étant prérendue, l'adresse
 * n'est lue que dans le navigateur : à placer sous `<Suspense>`, avec en repli `RegistrationLayout` sur
 * « Particulier » (même rendu que sans paramètre).
 */
export function RegistrationLayoutFromUrl(props: Omit<RegistrationLayoutProps, 'initialProfile'>) {
  const profil = useSearchParams().get('profil');
  return (
    <RegistrationLayout
      {...props}
      initialProfile={profil === 'professionnel' ? 'PROFESSIONNEL' : 'PARTICULIER'}
    />
  );
}

/**
 * Gabarit de l'inscription : panneau photo collant à gauche en desktop (600 × 980 : photo `inscrire`, voile sombre
 * vers le bas, logo blanc, citation), absent en mobile ; contenu à droite (pt 64, px 88, colonne de 664).
 */
export function RegistrationLayout({ initialProfile, categories, labels }: RegistrationLayoutProps) {
  const t = useTranslations('forms.registration');
  const [profile, setProfile] = useState<Profile>(initialProfile);
  return (
    <div className="bg-neutral-50 xl:grid xl:grid-cols-[600px_minmax(0,1fr)]">
      <div className="relative hidden h-[980px] self-start overflow-hidden xl:sticky xl:top-[var(--site-header-h,121px)] xl:block">
        {/* Panneau masqué en mobile : pas de préchargement (il téléchargerait la photo pour rien), chargement différé
            (une image masquée n'est pas demandée) et priorité haute dès qu'elle est affichée en desktop. */}
        <Image
          src="/photos/inscrire.png"
          alt=""
          fill
          sizes="600px"
          fetchPriority="high"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgb(28_26_23/0)_35%,rgb(28_26_23/0.85)_100%)]"
        />
        <Image
          src="/brand/logo-horizontal-white.svg"
          alt=""
          width={159}
          height={44}
          unoptimized
          className="absolute top-14 left-14 h-[43.5px] w-auto"
        />
        <figure className="absolute bottom-14 left-14 flex w-[488px] flex-col gap-4 text-neutral-0">
          <Quote aria-hidden size={36} className="text-orange-300" />
          <blockquote className="font-brand text-[28px] leading-[38px] font-medium">
            {/* Citation propre à chaque profil sur la même photo (maquettes `70:10665` et `70:11241`), guillemets
                compris dans le texte (« » en français, “ ” en anglais). */}
            {frenchTypography(t(`panels.${profile}.quote`))}
          </blockquote>
          <figcaption className="font-ui text-[14px] leading-5 font-medium tracking-[0.005em]">
            {t(`panels.${profile}.author`)}
          </figcaption>
        </figure>
      </div>
      <div className="mx-auto flex w-full max-w-[704px] flex-col gap-6 px-5 pt-6 pb-14 md:pt-10 xl:max-w-full xl:px-[88px] xl:pt-16 xl:pb-20">
        <Breadcrumb items={[{ label: labels.home, href: routes.home }, { label: labels.breadcrumb }]} />
        <h1 className="font-brand text-[30px] leading-9 font-semibold tracking-[-0.025em] text-text-main md:text-[44px] md:leading-[52px]">
          {labels.title}
        </h1>
        <RegistrationForm
          initialProfile={initialProfile}
          categories={categories}
          onProfileChange={setProfile}
        />
      </div>
    </div>
  );
}
