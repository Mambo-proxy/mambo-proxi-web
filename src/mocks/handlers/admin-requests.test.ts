import { describe, expect, it } from 'vitest';
import type { RequestDetail, RequestListItem } from '@/lib/api/schema';
import { doualaDay } from '../assignments';
import { csvCell, toCsv } from '../csv';
import { resolveMockRequest } from '../resolve';
import { MOCK_COOKIE_HEADER } from '../session';

const API = 'http://localhost:4000';
const ADMIN = 'usr_mireille';
const AGENT = 'usr_paul';

async function call(method: string, path: string, user = ADMIN) {
  return resolveMockRequest(
    new Request(`${API}${path}`, { method, headers: { [MOCK_COOKIE_HEADER]: `mp_at=${user}` } }),
  );
}

async function json<T>(path: string, user = ADMIN) {
  const response = await call('GET', path, user);
  return { status: response.status, body: (await response.json()) as T };
}

type Page = { data: RequestListItem[]; meta: { total: number; totalPages: number } };

describe('format CSV des exports (identique à l’API)', () => {
  it('neutralise les formules, sauf nombres et numéros de téléphone', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"');
    expect(csvCell('@SUM(A1)')).toBe('"\'@SUM(A1)"');
    expect(csvCell('-cmd')).toBe('"\'-cmd"');
    expect(csvCell('\tx')).toBe('"\'\tx"');
    expect(csvCell('+237699123456')).toBe('"+237699123456"');
    expect(csvCell('-12')).toBe('"-12"');
    expect(csvCell(3)).toBe('"3"');
    expect(csvCell(null)).toBe('""');
  });

  it('BOM UTF-8, séparateur « ; », lignes CRLF', () => {
    expect(toCsv(['A', 'B'], [['1', null]])).toBe(`${String.fromCharCode(0xfeff)}"A";"B"\r\n"1";""`);
  });
});

describe('demandes du back-office simulées', () => {
  it('export CSV : libellés des types et statuts, nom de fichier daté (Douala), BOM', async () => {
    const response = await call('GET', '/v1/admin/requests/export.csv?type=DEVIS');
    expect(response.headers.get('content-disposition')).toBe(
      `attachment; filename="demandes-${doualaDay(Date.now())}.csv"`,
    );
    expect(response.headers.get('cache-control')).toBe('no-store');
    const bytes = new Uint8Array(await response.clone().arrayBuffer());
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    const lines = (await response.text()).split('\r\n');
    expect(lines[0]).toBe(
      '"Référence";"Type";"Statut";"Client";"E-mail";"Téléphone";"Ville";"Pays";"Service";"Assignée à";"Échéance";"Reçue le"',
    );
    expect(lines[1]).toMatch(/^"MP-2026-\d{4}";"Devis";"(Nouvelle|En cours|Prestation réalisée|Clôturée)";/);
    expect(lines[1]).toContain('"+237699123456"');
  });

  it('tri `sort` du contrat ; champ non autorisé : 400', async () => {
    const byReference = await json<Page>('/v1/admin/requests?sort=reference&pageSize=3');
    expect(byReference.body.data.map((item) => item.reference)).toEqual([
      'MP-2026-0085',
      'MP-2026-0086',
      'MP-2026-0087',
    ]);
    const byDefault = await json<Page>('/v1/admin/requests?pageSize=100');
    const dates = byDefault.body.data.map((item) => item.createdAt);
    expect(dates).toEqual([...dates].sort().reverse());
    const byStatus = await json<Page>('/v1/admin/requests?sort=-status&pageSize=1');
    expect(byStatus.body.data[0]?.status).toBe('CLOTUREE');
    expect((await call('GET', '/v1/admin/requests?sort=-contact')).status).toBe(400);
  });

  it('lien WhatsApp pré-rempli avec la référence, comme l’exemple du contrat', async () => {
    const { body } = await json<RequestDetail>('/v1/admin/requests/req_0142');
    expect(body.whatsappUrl).toBe(
      'https://wa.me/237699123456?text=Bonjour%20Aur%C3%A9lie%2C%20c%27est%20Mambo%20Proxi%20au%20sujet%20de%20votre%20demande%20MP-2026-0142.',
    );
  });

  it('chargé de clientèle : ses demandes seulement, 403 sur quelqu’un d’autre, 404 hors périmètre', async () => {
    const own = await json<Page>('/v1/admin/requests?pageSize=100', AGENT);
    expect(own.body.data.length).toBeGreaterThan(0);
    expect(own.body.data.every((item) => item.assignedTo?.id === AGENT)).toBe(true);
    expect((await call('GET', '/v1/admin/requests?assignee=usr_carine', AGENT)).status).toBe(403);
    expect((await call('GET', '/v1/admin/requests/req_0142', AGENT)).status).toBe(404);
  });
});
