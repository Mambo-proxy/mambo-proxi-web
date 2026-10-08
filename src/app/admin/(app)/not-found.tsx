import { Compass } from 'lucide-react';
import type { Metadata } from 'next';
import { AdminPage } from '@/components/admin/shell/admin-page';
import { AdminCard } from '@/components/admin/ui/admin-ui';
import { EmptyState } from '@/components/admin/ui/filters';
import { ButtonLink } from '@/components/ui/button';
import { adminRoutes } from '@/lib/admin/routes';

export const metadata: Metadata = { title: 'Page introuvable' };

/**
 * 404 du back-office (non maquettée) : dans la coque, carte d'état vide comme les listes, retour au tableau de bord.
 * Aussi affichée quand un contenu n'existe plus (`notFound()` d'un éditeur).
 */
export default function AdminNotFound() {
  return (
    <AdminPage title="Page introuvable">
      <AdminCard>
        <EmptyState
          icon={<Compass size={24} />}
          title="Cette page n’existe pas ou plus"
          text="L’adresse est peut-être erronée, ou le contenu a été supprimé. Utilisez le menu ou revenez au tableau de bord."
          action={
            <ButtonLink href={adminRoutes.dashboard} size="sm" variant="dark" className="mt-2">
              Retour au tableau de bord
            </ButtonLink>
          }
        />
      </AdminCard>
    </AdminPage>
  );
}
