'use client';

import { usePathname } from 'next/navigation';
import { ViewTransition, type ReactNode } from 'react';
import { PAGE_TRANSITION } from '@/i18n/site-link';

/**
 * Transition entre les pages du site (API View Transitions, via le `<ViewTransition>` de React intégré aux navigations
 * de l'App Router) : à chaque changement d'adresse (hors paramètres de recherche et ancres), l'ancienne page s'efface et
 * la nouvelle apparaît en glissant légèrement (`site-page-exit` / `site-page-enter` dans web.css).
 * Seules les navigations portant le type `PAGE_TRANSITION` (liens du site, `useSiteRouter().push`) s'animent ; les
 * mises à jour internes à une page (filtres, tri) n'animent rien. Le premier affichage n'est jamais concerné : la page
 * rendue côté serveur s'affiche telle quelle. Navigateurs sans l'API : changement de page immédiat.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition
      key={pathname}
      enter={{ [PAGE_TRANSITION]: 'site-page-enter', default: 'none' }}
      exit={{ [PAGE_TRANSITION]: 'site-page-exit', default: 'none' }}
      default="none"
    >
      <div>{children}</div>
    </ViewTransition>
  );
}
