import { TZDate } from '@date-fns/tz';
import type {
  AdminAppointment,
  AppointmentFormat,
  Availability,
  AvailabilityConfig,
  ContactSummary,
} from '@/lib/api/schema';
import { adminRequests } from './admin-requests';

/** Fuseau de l'agence : toutes les heures simulées sont des heures de Douala. */
export const AGENCY_TIME_ZONE = 'Africa/Douala';

/**
 * Rendez-vous simulé. `subject` (objet affiché après le motif : « Chef privé », « Événement », « entretien ») n'existe
 * pas dans le contrat `AdminAppointment` : champ supplémentaire des mocks, lu de façon facultative par l'interface.
 */
export type MockAppointment = AdminAppointment & { subject?: string | null };

const MINUTE = 60_000;

/** Lundi 00:00 (heure de Douala) de la semaine contenant `now`. */
export function weekStart(now: Date = new Date()): TZDate {
  const zoned = new TZDate(now.getTime(), AGENCY_TIME_ZONE);
  const offset = (zoned.getDay() + 6) % 7;
  return new TZDate(zoned.getFullYear(), zoned.getMonth(), zoned.getDate() - offset, AGENCY_TIME_ZONE);
}

/** Instant ISO d'une heure de Douala, relative au lundi de la semaine en cours (`week` = décalage en semaines). */
function at(week: number, day: number, hour: number, minute = 0): string {
  const monday = weekStart();
  const date = new TZDate(
    monday.getFullYear(),
    monday.getMonth(),
    monday.getDate() + week * 7 + day,
    hour,
    minute,
    AGENCY_TIME_ZONE,
  );
  // `TZDate#toISOString` garde le décalage du fuseau : instant UTC (`Z`), comme l'API.
  return new Date(date.getTime()).toISOString();
}

const plus = (iso: string, minutes: number) =>
  new Date(new Date(iso).getTime() + minutes * MINUTE).toISOString();

/** Contact d'une demande simulée (mêmes identifiants que l'écran Demandes), par sa référence. */
function requestContact(reference: string): ContactSummary {
  const request = adminRequests.find((item) => item.reference === reference);
  if (!request) throw new Error(`Demande simulée introuvable\u00A0: ${reference}`);
  return request.contact;
}

const SAVEURS: ContactSummary = {
  id: 'ctc_saveurs_de_douala',
  fullName: 'Saveurs de Douala',
  initials: 'SD',
  email: 'contact@saveurs-dla.cm',
  phone: '+237699001122',
  country: 'CM',
  city: 'Douala',
  profile: 'PROFESSIONNEL',
};

const NDZANA: ContactSummary = {
  id: 'ctc_famille_ndzana',
  fullName: 'Famille Ndzana',
  initials: 'FN',
  email: 'famille.ndzana@email.com',
  phone: '+33698765432',
  country: 'FR',
  city: 'Lyon',
  profile: 'PARTICULIER',
};

const CANDIDATE: ContactSummary = {
  id: 'ctc_joel_nkoulou',
  fullName: 'Joël Nkoulou',
  initials: 'JN',
  email: 'joel.nkoulou@email.com',
  phone: '+237677445566',
  country: 'CM',
  city: 'Douala',
  profile: 'PARTICULIER',
};

const PAUL: ContactSummary = {
  id: 'ctc_paul_ekotto',
  fullName: 'Paul Ekotto',
  initials: 'PE',
  email: 'paul.ekotto@email.com',
  phone: '+33600112233',
  country: 'FR',
  city: 'Bordeaux',
  profile: 'PARTICULIER',
};

const IMMO: ContactSummary = {
  id: 'ctc_immo_bonapriso',
  fullName: 'Immo Bonapriso',
  initials: 'IB',
  email: 'contact@immo-bonapriso.cm',
  phone: '+237699334455',
  country: 'CM',
  city: 'Douala',
  profile: 'PROFESSIONNEL',
};

type Seed = Omit<MockAppointment, 'id' | 'endsAt' | 'createdAt' | 'reminderSentAt'> & {
  minutes: number;
  createdDaysBefore?: number;
};

function seeds(): Seed[] {
  const base = {
    proposedStartsAt: null,
    location: null,
    videoLink: null,
    message: null,
    notes: null,
  };
  return [
    // Semaine en cours : les rendez-vous de la maquette (`93:11535`), du lundi au samedi.
    {
      ...base,
      reference: 'MP-2026-0142',
      contact: requestContact('MP-2026-0142'),
      reason: 'DEVIS',
      subject: 'Chef privé',
      format: 'TELEPHONE',
      startsAt: at(0, 0, 9),
      minutes: 60,
      status: 'CONFIRME',
      message: 'Je voudrais affiner le menu du dîner d’anniversaire avec vous.',
    },
    {
      ...base,
      reference: 'MP-2026-0140',
      contact: requestContact('MP-2026-0140'),
      reason: 'IMMOBILIER',
      format: 'AGENCE',
      location: 'Agence Douala',
      startsAt: at(0, 1, 10),
      minutes: 90,
      status: 'CONFIRME',
      notes: 'Apporter les trois dossiers de logements à Bonapriso.',
    },
    {
      ...base,
      reference: 'MP-2026-0139',
      contact: requestContact('MP-2026-0139'),
      reason: 'IMMOBILIER',
      format: 'VISIO',
      startsAt: at(0, 3, 14),
      minutes: 60,
      status: 'A_CONFIRMER',
      message: 'Je souhaite faire le point sur la gestion de mon appartement d’Akwa.',
      createdDaysBefore: 2,
    },
    {
      ...base,
      reference: 'MP-2026-0150',
      contact: SAVEURS,
      reason: 'PARTENARIAT',
      format: 'AGENCE',
      startsAt: at(0, 4, 9),
      minutes: 60,
      status: 'A_CONFIRMER',
      message: 'Présentation de notre activité de traiteur pour vos prestations Chef privé.',
      createdDaysBefore: 1,
    },
    {
      ...base,
      reference: 'MP-2026-0151',
      contact: CANDIDATE,
      reason: 'RECRUTEMENT',
      subject: 'entretien',
      format: 'VISIO',
      videoLink: 'https://meet.mamboproxi.com/entretien-nkoulou',
      startsAt: at(0, 4, 15),
      minutes: 60,
      status: 'CONFIRME',
    },
    {
      ...base,
      reference: 'MP-2026-0152',
      contact: NDZANA,
      reason: 'DEVIS',
      subject: 'Événement',
      format: 'TELEPHONE',
      startsAt: at(0, 5, 10),
      minutes: 60,
      status: 'A_CONFIRMER',
      message: 'Organisation d’un mariage traditionnel à Yaoundé en février.',
      createdDaysBefore: 1,
    },
    // Semaine précédente : rendez-vous passés.
    {
      ...base,
      reference: 'MP-2026-0153',
      contact: PAUL,
      reason: 'DEVIS',
      subject: 'Découverte du Cameroun',
      format: 'VISIO',
      videoLink: 'https://meet.mamboproxi.com/ekotto',
      startsAt: at(-1, 1, 11),
      minutes: 60,
      status: 'TERMINE',
      notes: 'Itinéraire Kribi – Limbé envoyé par e-mail.',
      createdDaysBefore: 6,
    },
    {
      ...base,
      reference: 'MP-2026-0154',
      contact: IMMO,
      reason: 'PARTENARIAT',
      format: 'AGENCE',
      location: 'Agence Douala',
      startsAt: at(-1, 3, 15),
      minutes: 60,
      status: 'TERMINE',
      createdDaysBefore: 8,
    },
    {
      ...base,
      reference: 'MP-2026-0138',
      contact: requestContact('MP-2026-0138'),
      reason: 'AUTRE',
      format: 'TELEPHONE',
      startsAt: at(-1, 4, 9, 30),
      minutes: 30,
      status: 'ANNULE',
      message: 'Question sur la réception de colis.',
      createdDaysBefore: 5,
    },
    // Semaines suivantes.
    {
      ...base,
      reference: 'MP-2026-0137',
      contact: requestContact('MP-2026-0137'),
      reason: 'DEVIS',
      subject: 'Portage de repas',
      format: 'TELEPHONE',
      startsAt: at(1, 1, 9),
      minutes: 60,
      status: 'CONFIRME',
    },
    {
      ...base,
      reference: 'MP-2026-0135',
      contact: requestContact('MP-2026-0135'),
      reason: 'DEVIS',
      subject: 'Services événementiels',
      format: 'VISIO',
      videoLink: 'https://meet.mamboproxi.com/bekolo',
      startsAt: at(1, 3, 16),
      minutes: 60,
      status: 'AUTRE_CRENEAU_PROPOSE',
      proposedStartsAt: at(1, 4, 11),
      message: 'Baptême de ma fille, environ 80 invités.',
    },
    {
      ...base,
      reference: 'MP-2026-0141',
      contact: requestContact('MP-2026-0141'),
      reason: 'DEVIS',
      subject: 'Découverte du Cameroun',
      format: 'VISIO',
      videoLink: 'https://meet.mamboproxi.com/essomba',
      startsAt: at(2, 2, 14),
      minutes: 60,
      status: 'CONFIRME',
    },
  ];
}

function build(seed: Seed, index: number): MockAppointment {
  const { minutes, createdDaysBefore = 3, ...rest } = seed;
  const createdAt = new Date(
    new Date(seed.startsAt).getTime() - createdDaysBefore * 24 * 60 * MINUTE - (index + 1) * 37 * MINUTE,
  ).toISOString();
  return {
    ...rest,
    id: `apt_${seed.reference.slice(-4)}`,
    endsAt: plus(seed.startsAt, minutes),
    createdAt: new Date(Math.min(new Date(createdAt).getTime(), Date.now() - 60 * MINUTE)).toISOString(),
    reminderSentAt:
      seed.status === 'CONFIRME' && new Date(seed.startsAt).getTime() < Date.now()
        ? plus(seed.startsAt, -15 * 60)
        : null,
  };
}

/** Rendez-vous simulés (état modifiable pendant la session). */
export const adminAppointments: MockAppointment[] = seeds().map(build);

/** Nombre de rendez-vous « À confirmer » (compteur de la barre latérale et du tableau de bord). */
export function appointmentsToConfirm(): number {
  return adminAppointments.filter((item) => item.status === 'A_CONFIRMER').length;
}

/** Prochain jour (`MM-DD`) à venir à partir d'aujourd'hui, au format `yyyy-MM-dd`. */
function nextDate(monthDay: string): string {
  const now = new TZDate(Date.now(), AGENCY_TIME_ZONE);
  const year = now.getFullYear();
  const today = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const candidate = `${year}-${monthDay}`;
  return candidate >= today ? candidate : `${year + 1}-${monthDay}`;
}

const ALL_FORMATS: AppointmentFormat[] = ['AGENCE', 'TELEPHONE', 'VISIO'];

/**
 * Disponibilités (partagées avec le formulaire de rendez-vous du site, `GET /v1/appointments/availability`) :
 * du lundi au vendredi 08:00 – 12:00 et 13:00 – 17:00, le samedi 09:00 – 13:00 (téléphone et visio), créneaux
 * d'une heure, délai de 24 h, réservation jusqu'à 60 jours ; fermetures de Noël et du 1er janvier.
 */
function defaultConfig(): AvailabilityConfig {
  const weekdays = [1, 2, 3, 4, 5].flatMap((weekday) => [
    {
      id: `rul_${weekday}_am`,
      weekday,
      startTime: '08:00',
      endTime: '12:00',
      slotMinutes: 60,
      formats: ALL_FORMATS,
    },
    {
      id: `rul_${weekday}_pm`,
      weekday,
      startTime: '13:00',
      endTime: '17:00',
      slotMinutes: 60,
      formats: ALL_FORMATS,
    },
  ]);
  return {
    rules: [
      ...weekdays,
      {
        id: 'rul_6_am',
        weekday: 6,
        startTime: '09:00',
        endTime: '13:00',
        slotMinutes: 60,
        formats: ['TELEPHONE', 'VISIO'],
      },
    ],
    exceptions: [
      {
        id: 'exc_noel',
        date: nextDate('12-25'),
        closed: true,
        startTime: null,
        endTime: null,
        label: 'Noël',
      },
      {
        id: 'exc_nouvel_an',
        date: nextDate('01-01'),
        closed: true,
        startTime: null,
        endTime: null,
        label: 'Jour de l’an',
      },
    ],
    minNoticeHours: 24,
    maxAdvanceDays: 60,
    agencyAddress: 'Agence Douala',
    defaultVideoLink: null,
  };
}

export const availabilityState: { config: AvailabilityConfig } = { config: defaultConfig() };

const WEEKDAY_NAMES = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

/** Statuts qui occupent un créneau (un rendez-vous annulé ou terminé le libère). */
const BLOCKING = new Set<AdminAppointment['status']>(['A_CONFIRMER', 'CONFIRME', 'AUTRE_CRENEAU_PROPOSE']);

function minutesOf(time: string): number {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Jours et créneaux libres (`Availability`) entre deux dates `yyyy-MM-dd` incluses : règles hebdomadaires, fermetures
 * exceptionnelles, rendez-vous qui occupent déjà un créneau, délai de prévenance et horizon de réservation.
 */
export function computeAvailability(
  config: AvailabilityConfig,
  appointments: AdminAppointment[],
  from: string,
  to: string,
  options: { format?: AppointmentFormat | null; now?: number } = {},
): Availability {
  const now = options.now ?? Date.now();
  const days: Availability['days'] = [];
  const busy = appointments
    .filter((item) => BLOCKING.has(item.status))
    .map((item) => {
      const start = new Date(item.proposedStartsAt ?? item.startsAt).getTime();
      const length = new Date(item.endsAt).getTime() - new Date(item.startsAt).getTime();
      return [start, start + length] as const;
    });
  const horizon = now + config.maxAdvanceDays * 24 * 60 * MINUTE;
  const [fromYear = 0, fromMonth = 1, fromDay = 1] = from.split('-').map(Number);
  for (let offset = 0; offset < 400; offset++) {
    const date = new TZDate(fromYear, fromMonth - 1, fromDay + offset, AGENCY_TIME_ZONE);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    if (key > to) break;
    const weekday = ((date.getDay() + 6) % 7) + 1;
    const exception = config.exceptions.find((item) => item.date === key);
    if (exception?.closed) {
      days.push({ date: key, available: false, closedReason: exception.label || 'Fermé', slots: [] });
      continue;
    }
    let rules = config.rules.filter((rule) => rule.weekday === weekday);
    if (exception?.startTime && exception.endTime) {
      // Horaires exceptionnels : une seule plage, mêmes durée et formats que la première règle du jour.
      const model = rules[0] ?? config.rules[0];
      rules = model ? [{ ...model, startTime: exception.startTime, endTime: exception.endTime }] : [];
    }
    if (!rules.length) {
      days.push({
        date: key,
        available: false,
        closedReason: `Fermé le ${WEEKDAY_NAMES[weekday - 1]}`,
        slots: [],
      });
      continue;
    }
    let taken = false;
    const slots = rules
      .flatMap((rule) => {
        const result: Availability['days'][number]['slots'] = [];
        const end = minutesOf(rule.endTime);
        for (
          let start = minutesOf(rule.startTime);
          start + rule.slotMinutes <= end;
          start += rule.slotMinutes
        ) {
          const startsAt = new TZDate(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            Math.floor(start / 60),
            start % 60,
            AGENCY_TIME_ZONE,
          );
          const begin = startsAt.getTime();
          const finish = begin + rule.slotMinutes * MINUTE;
          if (begin - now < config.minNoticeHours * 60 * MINUTE || begin > horizon) continue;
          if (busy.some(([busyStart, busyEnd]) => begin < busyEnd && finish > busyStart)) {
            taken = true;
            continue;
          }
          if (options.format && !rule.formats.includes(options.format)) continue;
          result.push({
            startsAt: new Date(begin).toISOString(),
            endsAt: new Date(finish).toISOString(),
            formats: rule.formats,
          });
        }
        return result;
      })
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    days.push({
      date: key,
      available: slots.length > 0,
      closedReason: slots.length ? null : exception?.label || (taken ? 'Complet' : null),
      slots,
    });
  }
  return { timezone: 'Africa/Douala', timezoneLabel: 'Heure de Douala (UTC+1)', days };
}
