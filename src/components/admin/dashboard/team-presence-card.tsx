'use client';

import { useQuery } from '@tanstack/react-query';
import { ROLE_LABELS } from '@/components/admin/shell/nav';
import { AdminCard, CardTitle, ContactAvatar } from '@/components/admin/ui/admin-ui';
import { Skeleton } from '@/components/ui/skeleton';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import type { Role, TeamMemberPresence } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatAgo, formatStamp } from '@/lib/format/date';

/** Rafraîchissement conseillé par le contrat (`GET /v1/admin/users/presence`). */
const REFRESH_MS = 60_000;

const roleLabel = (role: Role) => (ROLE_LABELS as Partial<Record<Role, string>>)[role] ?? role;

function Member({ member }: { member: TeamMemberPresence }) {
  return (
    <li className="flex items-center gap-3 border-b border-border-default py-3 last:border-b-0">
      <span className="relative shrink-0">
        <ContactAvatar name={member.user.name} initials={member.user.initials} size={38} />
        {/* Pastille de présence : verte si connecté, grise sinon (état aussi donné en texte). */}
        <span
          aria-hidden
          className={cn(
            'absolute right-0 bottom-0 size-3 rounded-full ring-2 ring-neutral-0',
            member.online ? 'bg-vert-500' : 'bg-neutral-300',
          )}
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-ui text-[14px] leading-5 font-semibold text-text-main">
          {member.user.name}
        </span>
        <span className="truncate font-ui text-[12px] leading-4 text-text-muted">
          {roleLabel(member.role)}
          {member.lastLoginAt && <> · Connexion {formatStamp(member.lastLoginAt)}</>}
        </span>
      </span>
      {member.online ? (
        <span className="shrink-0 rounded-[6px] bg-vert-50 px-2 py-0.5 font-ui text-[12px] leading-4 font-semibold text-vert-700">
          En ligne
        </span>
      ) : (
        <span className="shrink-0 text-right font-ui text-[12px] leading-4 text-text-muted">
          <span className="sr-only">Hors ligne, dernière activité : </span>
          {member.lastActiveAt ? formatAgo(member.lastActiveAt) : 'Jamais connecté·e'}
        </span>
      )}
    </li>
  );
}

/**
 * « Équipe connectée » (permission `team:read`) : membres connectés maintenant (pastille verte, « En ligne ») puis
 * les autres par dernière activité, avec la dernière connexion ; actualisé toutes les minutes. Écran non maquetté,
 * dans le style des cartes du tableau de bord.
 */
export function TeamPresenceCard() {
  const query = useQuery({
    queryKey: ['team-presence'],
    queryFn: () => data(browserApi.GET('/v1/admin/users/presence')),
    refetchInterval: REFRESH_MS,
  });
  const presence = query.data;

  return (
    <AdminCard aria-labelledby="team-presence" className="flex flex-col gap-2 self-start p-5 md:p-6">
      <CardTitle
        id="team-presence"
        title="Équipe connectée"
        subtitle={
          presence
            ? presence.onlineCount === 0
              ? 'Personne n’est connecté en ce moment'
              : `${presence.onlineCount} membre${presence.onlineCount > 1 ? 's' : ''} connecté${presence.onlineCount > 1 ? 's' : ''} maintenant`
            : undefined
        }
      />
      {query.isError && !presence ? (
        <p role="alert" className="font-ui text-[14px] leading-5 text-text-muted">
          Impossible d’afficher l’équipe pour le moment.
        </p>
      ) : !presence ? (
        <div aria-hidden className="flex flex-col gap-3 pt-2">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-[38px] rounded-md" />
          ))}
        </div>
      ) : (
        <ul aria-label="Membres de l’équipe" className="flex flex-col">
          {presence.data.map((member) => (
            <Member key={member.user.id} member={member} />
          ))}
        </ul>
      )}
    </AdminCard>
  );
}
