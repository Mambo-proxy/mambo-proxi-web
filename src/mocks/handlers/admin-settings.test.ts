import { describe, expect, it } from 'vitest';
import type {
  AdminUser,
  EmailPreview,
  EmailTemplate,
  SettingsCoordonnees,
  SystemStatus,
} from '@/lib/api/schema';
import { resolveMockRequest } from '../resolve';
import { MOCK_COOKIE_HEADER } from '../session';

const API = 'http://localhost:4000';

async function call<T>(method: string, path: string, body?: unknown, user = 'usr_mireille') {
  const response = await resolveMockRequest(
    new Request(`${API}${path}`, {
      method,
      headers: { [MOCK_COOKIE_HEADER]: `mp_at=${user}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }),
  );
  const text = await response.text();
  return { status: response.status, body: (text ? JSON.parse(text) : null) as T };
}

describe('paramètres du back-office simulés', () => {
  it('coordonnées de la maquette, enregistrement et contrôles', async () => {
    const { body } = await call<SettingsCoordonnees>('GET', '/v1/admin/settings/coordonnees');
    expect(body).toMatchObject({ phoneCameroon: '+237600000000', email: 'contact@mamboproxi.com' });

    const invalid = await call<{ errors: { path: string }[] }>('PUT', '/v1/admin/settings/coordonnees', {
      ...body,
      phoneCameroon: '06 00',
      email: 'contact',
    });
    expect(invalid.status).toBe(422);
    expect(invalid.body.errors.map((error) => error.path)).toEqual(['phoneCameroon', 'email']);

    const saved = await call<SettingsCoordonnees>('PUT', '/v1/admin/settings/coordonnees', {
      ...body,
      hoursLabel: 'Lun – Sam · 8h – 19h',
    });
    expect(saved.status).toBe(200);
    expect((await call<SettingsCoordonnees>('GET', '/v1/admin/settings/coordonnees')).body.hoursLabel).toBe(
      'Lun – Sam · 8h – 19h',
    );
  });

  it('groupes analytics et securite réservés aux administrateurs', async () => {
    const security = { group: 'securite', maintenanceMode: false, trustedDeviceDays: 30 };
    expect((await call('PUT', '/v1/admin/settings/securite', security, 'usr_equipe')).status).toBe(403);
    // Responsable : paramètres en lecture seule.
    expect((await call('GET', '/v1/admin/settings/securite', undefined, 'usr_carine')).status).toBe(200);
    expect((await call('PUT', '/v1/admin/settings/securite', security, 'usr_carine')).status).toBe(403);
    expect((await call('PUT', '/v1/admin/settings/securite', security)).status).toBe(200);
  });

  it('sauvegarde de la nuit à 03:00 (Douala)', async () => {
    const { body } = await call<SystemStatus>('GET', '/v1/admin/system-status');
    expect(body.https).toBe(true);
    expect(new Date(body.lastBackupAt!).getUTCHours()).toBe(2);
  });
});

describe('modèles d’e-mails simulés', () => {
  it('liste, aperçu non enregistré et e-mails indispensables', async () => {
    const { body } = await call<EmailTemplate[]>('GET', '/v1/admin/email-templates');
    expect(body).toHaveLength(21);

    const preview = await call<EmailPreview>('POST', '/v1/admin/email-templates/quote-ack/preview', {
      title: 'Bonjour {prénom}',
    });
    expect(preview.body.subject).toBe('Nous avons bien reçu votre demande MP-2026-0142');
    expect(preview.body.html).toContain('<h1>Bonjour Aurélie</h1>');

    expect((await call('PUT', '/v1/admin/email-templates/otp-code', { enabled: false })).status).toBe(422);
    const disabled = await call<EmailTemplate>('PUT', '/v1/admin/email-templates/survey-reminder', {
      enabled: false,
    });
    expect(disabled.body.enabled).toBe(false);
    await call('PUT', '/v1/admin/email-templates/survey-reminder', { enabled: true });
  });
});

describe('utilisateurs simulés', () => {
  it('invitation, doublon et dernier administrateur', async () => {
    const { body: users } = await call<AdminUser[]>('GET', '/v1/admin/users');
    expect(users.map((user) => user.name)).toEqual([
      'Mireille Bell',
      'Équipe Douala',
      'Carine Eboa',
      'Paul Ngando',
      'Grace Nkongo',
    ]);
    expect(users.map((user) => user.role)).toEqual(['ADMIN', 'EDITOR', 'MANAGER', 'AGENT', 'WRITER']);
    expect((await call('GET', '/v1/admin/users', undefined, 'usr_equipe')).status).toBe(403);

    const invited = await call<AdminUser>('POST', '/v1/admin/users/invite', {
      email: 'Paul.Eto@mamboproxi.com',
      name: 'Paul Eto',
      role: 'EDITOR',
    });
    expect(invited.status).toBe(201);
    expect(invited.body).toMatchObject({
      email: 'paul.eto@mamboproxi.com',
      initials: 'PE',
      status: 'INVITE',
    });
    const duplicate = await call('POST', '/v1/admin/users/invite', {
      email: 'paul.eto@mamboproxi.com',
      name: 'Paul',
      role: 'EDITOR',
    });
    expect(duplicate.status).toBe(409);
    const unknownRole = await call<{ errors: { path: string }[] }>('POST', '/v1/admin/users/invite', {
      email: 'nouveau@mamboproxi.com',
      name: 'Nouveau',
      role: 'SUPERVISEUR',
    });
    expect(unknownRole.status).toBe(422);
    expect(unknownRole.body.errors.map((error) => error.path)).toEqual(['role']);
    const agent = await call<AdminUser>('POST', '/v1/admin/users/invite', {
      email: 'agent@mamboproxi.com',
      name: 'Agent Test',
      role: 'AGENT',
    });
    expect(agent.body).toMatchObject({ role: 'AGENT', lastActiveAt: null });
    expect((await call('DELETE', `/v1/admin/users/${agent.body.id}`)).status).toBe(204);

    expect((await call('PATCH', '/v1/admin/users/usr_mireille', { role: 'EDITOR' })).status).toBe(409);
    expect((await call('DELETE', '/v1/admin/users/usr_mireille')).status).toBe(409);
    expect((await call('DELETE', `/v1/admin/users/${invited.body.id}`)).status).toBe(204);
  });
});
