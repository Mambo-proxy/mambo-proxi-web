import { MapPin } from 'lucide-react';
import { EventRegistrationDialog } from '@/components/forms/event-registration-dialog';
import { AccentText } from '@/components/ui/accent-text';
import { Visual } from '@/components/ui/visual';
import type { CategoryHighlight, Event } from '@/lib/api/schema';
import { DEFAULT_TIME_ZONE } from '@/lib/format/date';
import { frenchTypography } from '@/lib/format/typography';
import { AgendaList } from './agenda-list';

function dateParts(iso: string) {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', timeZone: DEFAULT_TIME_ZONE }).format(date);
  const month = new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: DEFAULT_TIME_ZONE }).format(
    date,
  );
  const long = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    timeZone: DEFAULT_TIME_ZONE,
  }).format(date);
  return { day, month: month.toUpperCase(), long };
}

/**
 * Carte événement (Culture `61:5921`) : visuel 200 (170 en mobile) avec pastille date blanche (jour Poppins 20/24,
 * mois en capitales orange), étiquette verte, titre, lieu, « Je participe » et mention « Places limitées ».
 */
function EventCard({ event }: { event: Event }) {
  const date = dateParts(event.startsAt);
  const location = [event.city, event.place].filter(Boolean).join(' · ');
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border-default bg-neutral-0">
      <div className="relative">
        <Visual
          visual={event.visual}
          sizes="(min-width: 1280px) 424px, 100vw"
          className="h-[170px] md:h-[200px]"
        />
        <p className="absolute top-4 left-4 flex h-14 w-[54px] flex-col items-center justify-center rounded-[10px] bg-neutral-0">
          <span className="sr-only">{date.long}</span>
          <span aria-hidden className="font-brand text-[20px] leading-6 font-semibold text-text-main">
            {date.day}
          </span>
          <span aria-hidden className="font-ui text-[11px] leading-4 font-semibold text-text-brand">
            {date.month}
          </span>
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
        <span className="self-start rounded-full bg-vert-50 px-2.5 py-1 font-ui text-[12px] leading-4 font-semibold text-vert-700">
          {frenchTypography(event.tag)}
        </span>
        <h3 className="font-brand text-[19px] leading-[26px] font-semibold text-text-main">
          {frenchTypography(event.title)}
        </h3>
        <p className="flex items-center gap-1.5 font-ui text-[14px] leading-5 text-text-muted">
          <MapPin aria-hidden size={16} className="shrink-0 text-icon-default" />
          {frenchTypography(location)}
        </p>
        <div className="mt-auto flex items-center justify-between pt-1">
          <EventRegistrationDialog event={event} />
          {event.limited && (
            <span className="font-ui text-[12px] leading-4 text-text-muted">Places limitées</span>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * Agenda Mambo (Culture & événementiel) : en-tête avec lien « Voir tout l’agenda » (sous le titre en mobile),
 * 3 prochains événements ; le lien affiche les suivants dans la même section (ancre `#agenda`).
 */
export function Agenda({ highlight, events }: { highlight: CategoryHighlight; events: Event[] }) {
  if (events.length === 0) return null;
  return (
    <section id="agenda" className="scroll-mt-(--site-header-h,0px) bg-neutral-0 py-14 xl:py-24">
      <div className="container-site flex flex-col gap-7 xl:gap-12">
        <AgendaList
          moreLabel={highlight.link?.label ?? 'Voir tout l’agenda'}
          heading={
            <div className="flex flex-col gap-4">
              {highlight.eyebrow && <p className="text-web-eyebrow">{frenchTypography(highlight.eyebrow)}</p>}
              <h2 className="text-web-section text-text-main">
                <AccentText text={highlight.title} />
              </h2>
            </div>
          }
          cards={events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        />
      </div>
    </section>
  );
}
