import { http, HttpResponse } from 'msw';
import type { AuditLogEntry, UserRef } from '@/lib/api/schema';
import { paginate } from '../admin-utils';
import { problem } from '../problem';
import { can } from '../permissions';
import { sessionUser } from '../session';

const MIREILLE: UserRef = { id: 'usr_mireille', name: 'Mireille Bell', initials: 'MB' };
const EQUIPE: UserRef = { id: 'usr_equipe', name: 'Équipe Douala', initials: 'ED' };

type Seed = {
  actor: UserRef | null;
  action: string;
  entity: string;
  entityId?: string;
  label: string;
  diff?: Record<string, unknown>;
};

/** Actions récurrentes du back-office, dans le vocabulaire des écrans (demandes, contenus, réglages). */
const SEEDS: Seed[] = [
  {
    actor: EQUIPE,
    action: 'request.status',
    entity: 'Demande',
    entityId: 'req_0142',
    label: 'A passé la demande MP-2026-0142 (Chef privé) en « Devis envoyé »',
    diff: { statut: ['Nouvelle', 'Devis envoyé'] },
  },
  {
    actor: MIREILLE,
    action: 'service.publish',
    entity: 'Service',
    entityId: 'svc_chef_prive',
    label: 'A publié le service « Chef privé »',
  },
  {
    actor: null,
    action: 'survey.send',
    entity: 'Avis',
    label: 'Questionnaire de satisfaction envoyé automatiquement (MP-2026-0131)',
  },
  {
    actor: EQUIPE,
    action: 'appointment.confirm',
    entity: 'Rendez-vous',
    label: 'A confirmé le rendez-vous d’Aurélie K. (jeudi 10 h)',
    diff: { statut: ['Demandé', 'Confirmé'] },
  },
  {
    actor: MIREILLE,
    action: 'review.publish',
    entity: 'Avis',
    label: 'A publié l’avis de Patrick E. (5 / 5)',
  },
  {
    actor: MIREILLE,
    action: 'page.update',
    entity: 'Page',
    entityId: 'page_qui_sommes_nous',
    label: 'A modifié la page « Qui sommes-nous »',
    diff: { sections: ['Équipe', 'Équipe (2 portraits ajoutés)'] },
  },
  {
    actor: EQUIPE,
    action: 'request.note',
    entity: 'Demande',
    entityId: 'req_0139',
    label: 'A ajouté une note interne à la demande MP-2026-0139',
  },
  {
    actor: MIREILLE,
    action: 'settings.update',
    entity: 'Paramètres',
    label: 'A modifié les coordonnées de l’agence',
    diff: { horaires: ['Lun – Sam · 8h – 19h', 'Lun – Sam · 8h – 20h'] },
  },
  {
    actor: null,
    action: 'backup.done',
    entity: 'Système',
    label: 'Sauvegarde automatique de la nuit (46 Mo)',
  },
  {
    actor: EQUIPE,
    action: 'application.status',
    entity: 'Candidature',
    label: 'A présélectionné la candidature de Brice N. (Assistant·e de vie)',
    diff: { statut: ['Reçue', 'Présélectionnée'] },
  },
  {
    actor: MIREILLE,
    action: 'campaign.schedule',
    entity: 'Newsletter',
    entityId: 'cmp_novembre',
    label: 'A programmé l’envoi « Novembre : sorties culturelles et nouveaux services »',
  },
  {
    actor: MIREILLE,
    action: 'partner.update',
    entity: 'Partenaire',
    label: 'A réordonné les logos des partenaires (Immobilier)',
  },
  {
    actor: EQUIPE,
    action: 'request.status',
    entity: 'Demande',
    entityId: 'req_0128',
    label: 'A passé la demande MP-2026-0128 (Entretien du logement) en « Prestation réalisée »',
    diff: { statut: ['En cours', 'Prestation réalisée'] },
  },
  {
    actor: MIREILLE,
    action: 'training.publish',
    entity: 'Formation',
    label: 'A publié la formation « Hygiène et sécurité à domicile »',
  },
  {
    actor: MIREILLE,
    action: 'user.login',
    entity: 'Utilisateur',
    label: 'S’est connectée (code vérifié)',
  },
  {
    actor: EQUIPE,
    action: 'user.login',
    entity: 'Utilisateur',
    label: 'S’est connectée (appareil de confiance)',
  },
  {
    actor: MIREILLE,
    action: 'media.upload',
    entity: 'Média',
    label: 'A ajouté l’image « Plage de Kribi »',
  },
  {
    actor: MIREILLE,
    action: 'magazine.publish',
    entity: 'Magazine',
    label: 'A publié l’édition n° 12 du magazine',
  },
];

/** Heures de la journée (heure de Douala) auxquelles les actions sont réparties. */
const HOURS = [8, 9, 10, 11, 14, 15, 16, 17, 18];
const IPS = ['102.244.18.7', '154.72.160.33', '41.202.219.71'];

function seed(): AuditLogEntry[] {
  const now = Date.now();
  return Array.from({ length: 72 }, (_, index) => {
    const template = SEEDS[(index * 7) % SEEDS.length]!;
    // ~1,6 entrée par jour sur 45 jours ; les plus récentes il y a quelques heures.
    const day = Math.floor(index / 1.6);
    const date = new Date(now - day * 86_400_000);
    date.setUTCHours(HOURS[index % HOURS.length]! - 1, (index * 13) % 60, 0, 0);
    const createdAt = Math.min(date.getTime(), now - (index + 1) * 600_000);
    return {
      id: `aud_${String(index + 1).padStart(3, '0')}`,
      actor: template.actor,
      action: template.action,
      entity: template.entity,
      entityId: template.entityId ?? null,
      label: template.label,
      diff: template.diff ?? null,
      ip: template.actor ? IPS[index % IPS.length]! : null,
      createdAt: new Date(createdAt).toISOString(),
    };
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const auditLog: AuditLogEntry[] = seed();

/** Back-office — Journal d'activité (`/v1/admin/audit-log`), permission `audit:read` (administrateurs). */
export const adminAuditHandlers = [
  http.get('*/v1/admin/audit-log', ({ request }) => {
    if (!can(sessionUser(request), 'audit:read'))
      return problem(403, 'Le journal d’activité est réservé aux administrateurs.');
    const params = new URL(request.url).searchParams;
    const actor = params.get('actor');
    const entity = params.get('entity');
    const from = params.get('from');
    const to = params.get('to');
    const list = auditLog.filter(
      (item) =>
        (!actor || item.actor?.id === actor) &&
        (!entity || item.entity === entity) &&
        (!from || item.createdAt >= from) &&
        (!to || item.createdAt <= to),
    );
    return HttpResponse.json(paginate(list, params, 25));
  }),
];
