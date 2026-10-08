import { http } from 'msw';
import { problem } from '../problem';
import { adminCoreHandlers } from './admin-core';
import { adminRequestHandlers } from './admin-requests';
import { adminServiceHandlers } from './admin-services';
import { adminPageHandlers } from './admin-pages';
import { adminReviewHandlers } from './admin-reviews';
import { adminAppointmentHandlers } from './admin-appointments';
import { adminJobHandlers } from './admin-jobs';
import { adminPartnerHandlers } from './admin-partners';
import { adminTrainingHandlers } from './admin-trainings';
import { adminEventHandlers } from './admin-events';
import { adminContactHandlers } from './admin-contacts';
import { adminNewsletterHandlers } from './admin-newsletter';
import { adminSettingsHandlers } from './admin-settings';
import { adminMediaHandlers } from './admin-media';
import { appointmentHandlers } from './appointments';
import { authHandlers } from './auth';
import { catalogueHandlers } from './catalogue';
import { contractHandlers } from './contract';
import { eventHandlers } from './events';
import { formHandlers } from './forms';
import { jobHandlers } from './jobs';
import { newsletterHandlers } from './newsletter';
import { pageHandlers } from './pages';
import { reviewHandlers } from './reviews';
import { siteHandlers } from './site';
import { surveyHandlers } from './surveys';
import { trainingHandlers } from './trainings';
import { partnerHandlers } from './partners';

/**
 * Ordre de priorité : gestionnaires dédiés (filtres, pagination, validation), puis exemples du contrat,
 * puis une erreur explicite pour toute route de l'API qui ne serait pas simulée.
 */
export const handlers = [
  ...catalogueHandlers,
  ...siteHandlers,
  ...authHandlers,
  ...adminCoreHandlers,
  ...adminRequestHandlers,
  ...adminServiceHandlers,
  ...adminPageHandlers,
  ...adminReviewHandlers,
  ...adminAppointmentHandlers,
  ...adminJobHandlers,
  ...adminPartnerHandlers,
  ...adminTrainingHandlers,
  ...adminEventHandlers,
  ...adminContactHandlers,
  ...adminNewsletterHandlers,
  ...adminSettingsHandlers,
  ...adminMediaHandlers,
  ...appointmentHandlers,
  ...formHandlers,
  ...newsletterHandlers,
  ...partnerHandlers,
  ...eventHandlers,
  ...pageHandlers,
  ...trainingHandlers,
  ...jobHandlers,
  ...reviewHandlers,
  ...surveyHandlers,
  ...contractHandlers,
  http.all('*/v1/*', ({ request }) =>
    problem(501, `Route non simulée : ${request.method} ${new URL(request.url).pathname}.`),
  ),
];
