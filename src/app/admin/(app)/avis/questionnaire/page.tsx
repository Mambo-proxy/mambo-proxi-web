import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { SurveyEditor } from '@/components/admin/reviews/survey-editor';
import { AdminPage } from '@/components/admin/shell/admin-page';
import { adminRoutes } from '@/lib/admin/routes';

export const metadata: Metadata = { title: 'Questionnaire de satisfaction' };

/** Questions du questionnaire de satisfaction (« Modifier les questions » de `93:11304`, non maquetté). */
export default function SurveyQuestionsPage() {
  return (
    <AdminPage
      title="Questionnaire de satisfaction"
      breadcrumb={
        <span className="flex items-center gap-1.5">
          Contenus du site <ChevronRight aria-hidden size={12} />
          <Link
            href={adminRoutes.reviews}
            className="rounded-xs underline underline-offset-2 hover:text-text-main"
          >
            Avis clients
          </Link>
          <ChevronRight aria-hidden size={12} /> Questionnaire
        </span>
      }
    >
      <SurveyEditor />
    </AdminPage>
  );
}
