import { describe, expect, it } from 'vitest';
import type {
  AdminUser,
  EmailPreview,
  EmailTemplate,
  Problem,
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

  it('état du site : sauvegarde de la nuit à 03:00 (Douala), HTTPS déduit des adresses, version de l’API', async () => {
    const { body } = await call<SystemStatus>('GET', '/v1/admin/system-status');
    // Adresses de test en `http://` : HTTPS inactif, comme l'API dans ce cas.
    expect(body).toMatchObject({ https: false, version: '0.1.0', emailProvider: 'localhost' });
    expect(new Date(body.lastBackupAt!).getUTCHours()).toBe(2);
  });

  it('erreurs au format de l’API : groupe inconnu, groupe différent de l’adresse, image inconnue', async () => {
    const unknown = await call<Problem>('PUT', '/v1/admin/settings/seo', { group: 'inconnu' });
    expect(unknown.status).toBe(422);
    expect(unknown.body).toMatchObject({
      type: 'https://api.mamboproxi.com/problems/validation-error',
      title: 'Certaines informations sont à corriger',
      errors: [{ path: 'group', message: 'Groupe de paramètres inconnu.' }],
    });
    const security = { group: 'securite', maintenanceMode: false, trustedDeviceDays: 30 };
    const mismatch = await call<Problem>('PUT', '/v1/admin/settings/rgpd', security);
    expect(mismatch.body.errors).toEqual([
      { path: 'group', code: 'group_mismatch', message: 'Le groupe envoyé ne correspond pas à l’adresse.' },
    ]);
    const { body: seo } = await call<Record<string, unknown>>('GET', '/v1/admin/settings/seo');
    const image = await call<Problem>('PUT', '/v1/admin/settings/seo', { ...seo, ogImageId: 'med_inconnue' });
    expect(image.status).toBe(422);
    expect(image.body.errors).toEqual([
      { path: 'ogImageId', code: 'unknown_media', message: 'Cette image n’existe pas dans la médiathèque.' },
    ]);
    const saved = await call<Record<string, unknown>>('PUT', '/v1/admin/settings/seo', {
      ...seo,
      ogImageId: 'med_equipe',
      interne: true,
    });
    expect(saved.body).toMatchObject({ ogImageId: 'med_equipe', ogImage: { id: 'med_equipe' } });
    expect(saved.body).not.toHaveProperty('interne');
    await call('PUT', '/v1/admin/settings/seo', { ...seo, ogImageId: null });
  });
});

describe('modèles d’e-mails simulés', () => {
  it('liste, aperçu non enregistré et e-mails indispensables', async () => {
    const { body } = await call<EmailTemplate[]>('GET', '/v1/admin/email-templates');
    expect(body).toHaveLength(21);
    // Ordre de l'énumération du contrat ; 5 modèles indispensables.
    expect(body.slice(0, 3).map((template) => template.key)).toEqual([
      'quote-ack',
      'team-new-request',
      'team-assignment',
    ]);
    expect(body.filter((template) => !template.canDisable).map((template) => template.key)).toEqual([
      'newsletter-confirm',
      'newsletter-campaign',
      'user-invite',
      'otp-code',
      'password-reset',
    ]);
    // Variables que l'API sait remplir : ni `{lien}` ni `{organisation}`.
    expect(body.find((template) => template.key === 'quote-ack')?.variables).toEqual([
      '{prénom}',
      '{nom}',
      '{référence}',
      '{service}',
      '{rubrique}',
      '{quartier}',
      '{ville}',
    ]);
    expect(body.flatMap((template) => template.variables ?? [])).not.toContain('{lien}');
    expect(body.flatMap((template) => template.variables ?? [])).not.toContain('{organisation}');

    const preview = await call<EmailPreview>('POST', '/v1/admin/email-templates/quote-ack/preview', {
      title: 'Bonjour {prénom}',
    });
    expect(preview.body.subject).toBe('Nous avons bien reçu votre demande MP-2026-0142');
    expect(preview.body.html).toContain('<h1>Bonjour Aurélie</h1>');

    const locked = await call<Problem>('PUT', '/v1/admin/email-templates/otp-code', { enabled: false });
    expect(locked.status).toBe(422);
    expect(locked.body.errors).toEqual([
      {
        path: 'enabled',
        code: 'cannot_disable',
        message: 'Cet e-mail est indispensable : il ne peut pas être désactivé.',
      },
    ]);
    const disabled = await call<EmailTemplate>('PUT', '/v1/admin/email-templates/survey-reminder', {
      enabled: false,
    });
    expect(disabled.body.enabled).toBe(false);
    // Test d'un modèle désactivé : 409 (il ne serait pas envoyé).
    const test = await call<Problem>('POST', '/v1/admin/email-templates/survey-reminder/test', {
      email: 'test@mamboproxi.com',
    });
    expect(test.status).toBe(409);
    expect(test.body.type).toBe('https://api.mamboproxi.com/problems/conflict');
    await call('PUT', '/v1/admin/email-templates/survey-reminder', { enabled: true });
    expect(
      (await call('POST', '/v1/admin/email-templates/survey-reminder/test', { email: 'test@mamboproxi.com' }))
        .status,
    ).toBe(202);
  });

  it('variable inconnue refusée (enregistrement et aperçu), une erreur par champ', async () => {
    const saved = await call<Problem>('PUT', '/v1/admin/email-templates/partner-request-received', {
      title: 'Merci {prénom}',
      paragraphs: ['', 'Votre structure {organisation} : {lien}'],
    });
    expect(saved.status).toBe(422);
    expect(saved.body.errors).toEqual([
      {
        path: 'paragraphs.0',
        code: 'unknown_variable',
        message:
          'Variable inconnue : {organisation}, {lien}. Variables disponibles : {prénom}, {nom}, {référence}.',
      },
    ]);
    const preview = await call<Problem>('POST', '/v1/admin/email-templates/password-reset/preview', {
      subject: 'Bonjour {prénom}',
    });
    expect(preview.status).toBe(422);
    expect(preview.body.errors?.[0]).toMatchObject({
      path: 'subject',
      message: 'Variable inconnue : {prénom}. Ce modèle n’utilise aucune variable.',
    });
    // Accents et majuscules indifférents.
    expect(
      (await call('POST', '/v1/admin/email-templates/quote-ack/preview', { title: 'Bonjour {Prenom}' }))
        .status,
    ).toBe(200);
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
