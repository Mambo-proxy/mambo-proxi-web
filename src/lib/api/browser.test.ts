// @vitest-environment jsdom
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { server } from '@/mocks/node';
import { browserApi } from './browser';

function captureCsrfHeader() {
  const seen: (string | null)[] = [];
  server.use(
    http.all('*/v1/admin/requests/:id/notes', ({ request }) => {
      seen.push(request.headers.get('X-CSRF-Token'));
      return HttpResponse.json({}, { status: 201 });
    }),
  );
  return seen;
}

describe('client API navigateur', () => {
  afterEach(() => {
    document.cookie = 'mp_csrf=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  it('recopie le cookie mp_csrf dans X-CSRF-Token pour les mutations', async () => {
    document.cookie = 'mp_csrf=jeton-123';
    const seen = captureCsrfHeader();
    await browserApi.POST('/v1/admin/requests/{id}/notes', {
      params: { path: { id: 'req_1' } },
      body: { body: 'Rappel client' } as never,
    });
    expect(seen).toEqual(['jeton-123']);
  });

  it("n'ajoute pas d'en-tête CSRF sans cookie", async () => {
    const seen = captureCsrfHeader();
    await browserApi.POST('/v1/admin/requests/{id}/notes', {
      params: { path: { id: 'req_1' } },
      body: { body: 'Rappel client' } as never,
    });
    expect(seen).toEqual([null]);
  });
});
