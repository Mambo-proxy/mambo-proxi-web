import { Plus } from 'lucide-react';
import Link from 'next/link';
import { topbarActionClass } from '@/components/admin/shell/admin-page';
import { adminRoutes } from '@/lib/admin/routes';

/** Bouton « Ajouter un service » de la barre supérieure (`88:10568`). */
export function AddServiceButton() {
  return (
    <Link href={adminRoutes.newService} className={topbarActionClass}>
      <Plus aria-hidden />
      Ajouter un service
    </Link>
  );
}
