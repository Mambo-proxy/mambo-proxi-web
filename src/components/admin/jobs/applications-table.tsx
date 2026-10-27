'use client';

import { Download } from 'lucide-react';
import { ContactAvatar, locationLabel } from '@/components/admin/ui/admin-ui';
import type { AdminApplication } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatPhone } from '@/lib/phone';
import { ApplicationStatusBadge } from './badges';
import { cvLabel, receivedLabel } from './labels';
import { useCv } from './use-cv';

/** « Douala · +237 6 … » (maquette : téléphone tronqué) ; ville seule si pas de téléphone. */
function contactLine(application: AdminApplication) {
  const { city, country, phone } = application.contact;
  const place = locationLabel(city, country);
  return phone ? `${place} · ${formatPhone(phone)}` : place;
}

/** Bouton « CV.pdf » (`93:22046`) : bordure `border/strong`, rayon 10, icône de téléchargement. */
function CvButton({ application, compact }: { application: AdminApplication; compact?: boolean }) {
  const cv = useCv();
  const pending = cv.isPending && cv.variables?.id === application.id;
  return (
    <button
      type="button"
      onClick={() => cv.mutate({ id: application.id, mode: 'download' })}
      disabled={pending}
      aria-label={`Télécharger le CV de ${application.contact.fullName} (${application.cv.fileName})`}
      className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-[10px] border border-border-strong bg-neutral-0 font-ui font-semibold text-text-main hover:bg-neutral-50 disabled:opacity-60',
        compact ? 'h-9 px-3 text-[13px] leading-5' : 'h-[42px] px-[14px] text-[15px] leading-5',
      )}
    >
      <Download aria-hidden size={compact ? 14 : 16} />
      {cvLabel(application.cv.fileName)}
    </button>
  );
}

const jobTitle = (application: AdminApplication) => application.jobTitle ?? 'Candidature spontanée';

/**
 * Candidatures (« Dernières candidatures » `93:22046` et onglet Candidatures) : tableau en desktop, cartes en mobile.
 * Le nom ouvre le détail.
 */
export function ApplicationsTable({
  applications,
  caption,
  onOpen,
}: {
  applications: AdminApplication[];
  caption: string;
  onOpen: (id: string) => void;
}) {
  return (
    <>
      <ul className="divide-y divide-border-default xl:hidden">
        {applications.map((application) => (
          <li key={application.id} className="flex flex-col gap-3 p-4">
            <div className="flex items-start gap-3">
              <ContactAvatar name={application.contact.fullName} initials={application.contact.initials} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => onOpen(application.id)}
                  className="self-start rounded-xs text-left font-ui text-[14px] leading-5 font-semibold text-text-main hover:underline"
                >
                  {application.contact.fullName}
                </button>
                <span className="font-ui text-[12px] leading-4 text-text-muted">
                  {jobTitle(application)} · {receivedLabel(application.createdAt)}
                </span>
              </div>
              <ApplicationStatusBadge status={application.status} />
            </div>
            <div className="flex items-center justify-between gap-3 pl-11">
              <span className="min-w-0 truncate font-ui text-[13px] leading-5 text-text-muted">
                {contactLine(application)}
              </span>
              <CvButton application={application} compact />
            </div>
          </li>
        ))}
      </ul>

      <table className="hidden w-full table-fixed border-collapse font-ui text-[14px] leading-5 text-text-main xl:table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border-default bg-neutral-50 text-left text-[12px] leading-4 text-text-muted">
            <th scope="col" className="py-3 pl-5 font-semibold">
              Candidat·e
            </th>
            <th scope="col" className="w-[256px] py-3 pl-4 font-semibold">
              Poste visé
            </th>
            <th scope="col" className="w-[116px] py-3 pl-4 font-semibold">
              Reçue
            </th>
            <th scope="col" className="w-[136px] py-3 pl-4 font-semibold">
              CV
            </th>
            <th scope="col" className="w-[130px] py-3 pr-5 pl-4 font-semibold">
              Statut
            </th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr
              key={application.id}
              className="border-b border-border-default last:border-b-0 hover:bg-neutral-50"
            >
              <td className="max-w-0 py-3.5 pl-5">
                <div className="flex items-center gap-3">
                  <ContactAvatar
                    name={application.contact.fullName}
                    initials={application.contact.initials}
                  />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => onOpen(application.id)}
                      className="self-start truncate rounded-xs text-left font-semibold hover:underline"
                    >
                      {application.contact.fullName}
                    </button>
                    <span className="truncate text-[12px] leading-4 text-text-muted">
                      {contactLine(application)}
                    </span>
                  </div>
                </div>
              </td>
              <td className="max-w-0 truncate py-3.5 pl-4">{jobTitle(application)}</td>
              <td className="py-3.5 pl-4 whitespace-nowrap">{receivedLabel(application.createdAt)}</td>
              <td className="py-3.5 pl-4">
                <CvButton application={application} />
              </td>
              <td className="py-3.5 pr-5 pl-4">
                <ApplicationStatusBadge status={application.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
