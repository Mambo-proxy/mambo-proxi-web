import type { HttpHandler } from 'msw';

/** Back-office — Paramètres, modèles d’e-mails, utilisateurs, journal (`/v1/admin/settings*`, `/v1/admin/email-templates*`, `/v1/admin/users*`, `/v1/admin/audit-log`, `/v1/admin/system-status`). */
export const adminSettingsHandlers: HttpHandler[] = [];
