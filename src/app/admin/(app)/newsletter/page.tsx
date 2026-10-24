import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import { Suspense } from 'react';
import { NewsletterHeaderActions, NewsletterView } from '@/components/admin/newsletter/newsletter-view';
import { AdminPage } from '@/components/admin/shell/admin-page';

export const metadata: Metadata = { title: 'Newsletter' };

/** Newsletter (`94:11838`) : indicateurs, envois, compositeur (aperçu, test, programmation), export des inscrits. */
export default function NewsletterPage() {
  return (
    <AdminPage
      title="Newsletter"
      breadcrumb={
        <span className="flex items-center gap-1.5">
          Relations <ChevronRight aria-hidden size={12} /> Newsletter
        </span>
      }
      actions={
        <Suspense>
          <NewsletterHeaderActions />
        </Suspense>
      }
    >
      <Suspense>
        <NewsletterView />
      </Suspense>
    </AdminPage>
  );
}
