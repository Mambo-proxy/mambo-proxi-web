import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const revalidateTag = vi.fn();
vi.mock('next/cache', () => ({ revalidateTag: (...args: unknown[]) => revalidateTag(...args) }));

const { POST } = await import('./route');

function call(body: unknown, secret?: string) {
  return POST(
    new NextRequest('http://localhost:3000/api/revalidate', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(secret ? { authorization: `Bearer ${secret}` } : {}),
      },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => vi.stubEnv('REVALIDATE_SECRET', 'secret-de-test'));
afterEach(() => vi.unstubAllEnvs());

describe('POST /api/revalidate', () => {
  it('refuse une requête sans le bon secret', async () => {
    expect((await call({ tags: ['settings'] })).status).toBe(401);
    expect((await call({ tags: ['settings'] }, 'mauvais-secret')).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('refuse un corps invalide', async () => {
    expect((await call({ tags: [] }, 'secret-de-test')).status).toBe(422);
  });

  it('invalide immédiatement chaque étiquette, sans doublon', async () => {
    const response = await call({ tags: ['settings', 'service:chef-prive', 'settings'] }, 'secret-de-test');
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ revalidated: ['settings', 'service:chef-prive'] });
    expect(revalidateTag).toHaveBeenCalledTimes(2);
    expect(revalidateTag).toHaveBeenCalledWith('service:chef-prive', { expire: 0 });
  });
});
