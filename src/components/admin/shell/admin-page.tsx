import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { NotificationsButton } from './notifications';
import { SearchTrigger } from './search-palette';

type AdminPageProps = {
  title: string;
  /** Fil d'Ariane (caption) au-dessus du titre, ex. « Services › Nouveau service ». */
  breadcrumb?: ReactNode;
  /** Actions principales de l'écran (ex. « + Nouveau service »). */
  actions?: ReactNode;
  /** Titre masqué en mobile quand l'écran affiche déjà son propre titre (tableau de bord : « Bonjour … »). */
  hideMobileTitle?: boolean;
  /** Contenu sans marges (écrans en colonnes pleine hauteur : demandes, pages & textes). */
  flush?: boolean;
  children: ReactNode;
};

/**
 * Écran du back-office : barre supérieure (`85:10359` : blanc, bordure basse, padding 16/32, titre Poppins
 * SemiBold 24/32, recherche, notifications, actions) puis contenu sur fond `neutral/50`, marges 32 px (16 en mobile).
 * En mobile, la barre supérieure est celle de la coque ; le titre passe en tête du contenu.
 */
export function AdminPage({ title, breadcrumb, actions, hideMobileTitle, flush, children }: AdminPageProps) {
  return (
    <>
      <header className="sticky top-0 z-20 hidden min-h-[75px] items-center justify-between gap-6 border-b border-border-default bg-neutral-0 px-8 py-4 md:flex">
        <div className="flex min-w-0 flex-col gap-0.5">
          {breadcrumb && <div className="font-ui text-[12px] leading-4 text-text-muted">{breadcrumb}</div>}
          <h1 className="truncate font-brand text-[24px] leading-8 font-semibold text-text-main">{title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="hidden lg:block">
            <SearchTrigger />
          </span>
          <NotificationsButton />
          {actions}
        </div>
      </header>
      <div className={cn('flex flex-col gap-4 px-4 pt-[18px] md:hidden', hideMobileTitle && 'sr-only')}>
        {breadcrumb && <div className="font-ui text-[12px] leading-4 text-text-muted">{breadcrumb}</div>}
        <h1 className="font-brand text-[22px] leading-8 font-semibold text-text-main">{title}</h1>
        {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
      </div>
      <div className={cn('flex-1', !flush && 'px-4 pt-[18px] pb-[100px] md:p-8')}>{children}</div>
    </>
  );
}

/** Bouton d'action de la barre supérieure (`85:10374`) : orange, rayon 10, padding 10/14, icône 16, Inter SemiBold 14. */
export const topbarActionClass =
  'inline-flex items-center gap-2 rounded-[10px] bg-brand-primary px-3.5 py-2.5 font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-on-primary transition-colors hover:bg-brand-primary-hover [&_svg]:size-4';
