import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { SiteLink as Link } from '@/i18n/site-link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { routes } from '@/lib/routes';
import { ResponsiveText } from '@/components/sections/responsive-text';
import { frenchTypography } from '@/lib/format/typography';
import { useTranslations } from 'next-intl';

type CtaBandProps = {
  /**
   * Titre au format `AccentText` du contrat, lignes séparées par un saut de ligne
   * (maquette : « Un projet, une question ? » / « Parlons-en. »). Les deux lignes restent sombres sur le dégradé.
   */
  title: string;
  text: string;
  /** Texte raccourci en mobile (contrat : `textMobile`). */
  textMobile?: string | null;
  /** Lien du bouton principal (devis pré-rempli selon la page). */
  href?: string;
  ctaLabel?: string;
  whatsappHref?: string | null;
  /**
   * Second bouton (vert), à la place de WhatsApp (Magazine : « Lire en anglais »). Adresse utilisée telle quelle,
   * sans conversion de langue : elle peut mener à l'autre langue du site.
   */
  secondary?: { label: string; href: string } | null;
  /** Ancre de la section (pastilles du héros). */
  id?: string;
  className?: string;
};

/**
 * Bandeau d'appel à l'action (Figma desktop `56:2092`, mobile `56:2132`) : carte `gradient/energie`
 * rayon 40 (28 en mobile), p 72 (28), titre 52/58 (30/36), texte 19/30 (16/24), bouton Dark + WhatsApp,
 * symbole du logo en filigrane blanc (22 %, 20 % en mobile). Le dégradé ondule lentement (12 s).
 */
export function CtaBand({
  title,
  text,
  textMobile,
  href = routes.devis,
  ctaLabel,
  whatsappHref,
  secondary,
  id,
  className,
}: CtaBandProps) {
  const t = useTranslations('site');
  const primaryClassName = cn(
    buttonVariants({ variant: 'dark', size: 'lg' }),
    'group/cta max-md:w-full max-md:px-5',
  );
  const primaryContent = (
    <>
      {frenchTypography(ctaLabel ?? t('cta.quote'))}
      <ArrowRight
        aria-hidden
        className="transition-transform duration-200 group-hover/cta:translate-x-[3px] max-md:hidden"
      />
    </>
  );
  return (
    <section
      id={id}
      className={cn('container-site scroll-mt-(--site-header-h,0px) pb-14 xl:pb-28', className)}
    >
      <div className="relative animate-[cta-wave_12s_ease-in-out_infinite] overflow-hidden rounded-[28px] bg-gradient-energie bg-[length:200%_200%] p-7 motion-reduce:animate-none xl:rounded-[40px] xl:p-[72px]">
        <Image
          src="/brand/logo-symbol-white.svg"
          alt=""
          width={120}
          height={92}
          unoptimized
          loading="eager"
          className="pointer-events-none absolute -top-4 -right-5 h-[146px] w-[192px] opacity-20 xl:-top-5 xl:-right-10 xl:h-[292px] xl:w-[384px] xl:opacity-[0.22]"
        />
        <div className="relative flex flex-col gap-4 xl:max-w-[700px] xl:gap-5">
          <h2 className="font-brand text-[30px] leading-9 font-semibold tracking-[-0.015em] text-neutral-900 xl:text-[52px] xl:leading-[58px] xl:tracking-[-0.02em]">
            {title.split('\n').map((line, index) => (
              <span key={index} className="block">
                {frenchTypography(line.replaceAll('==', ''))}
              </span>
            ))}
          </h2>
          <p className="font-ui text-[16px] leading-6 text-neutral-900 xl:text-[19px] xl:leading-[30px]">
            <ResponsiveText
              desktop={frenchTypography(text)}
              mobile={textMobile ? frenchTypography(textMobile) : null}
            />
          </p>
          <div className="mt-1 flex flex-col gap-3 md:flex-row md:flex-wrap xl:mt-0">
            {/* Une ancre de la page (« #lettre-mambo ») reste un lien simple, sans conversion de langue. */}
            {href.startsWith('#') ? (
              <a href={href} className={primaryClassName}>
                {primaryContent}
              </a>
            ) : (
              <Link href={href} className={primaryClassName}>
                {primaryContent}
              </Link>
            )}
            {secondary && (
              <a
                href={secondary.href}
                className={cn(buttonVariants({ variant: 'whatsapp' }), 'max-md:w-full')}
              >
                {frenchTypography(secondary.label)}
              </a>
            )}
            {whatsappHref && !secondary && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: 'whatsapp' }), 'max-md:w-full')}
              >
                {t('header.whatsapp')}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
