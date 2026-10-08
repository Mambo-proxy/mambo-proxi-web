import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

// Contrôles indépendants de la largeur d'écran : une seule largeur suffit.
test.beforeEach(({}, testInfo) => test.skip(testInfo.project.name !== 'desktop-1440'));

/** Blocs JSON-LD de la page, à plat (`@graph` déplié). */
async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.flatMap((text) => {
    const data = JSON.parse(text) as Record<string, unknown>;
    return (data['@graph'] as Record<string, unknown>[] | undefined) ?? [data];
  });
}

const types = (things: Record<string, unknown>[]) => things.map((thing) => thing['@type']);

test.describe('référencement', () => {
  test('accueil : titre, canonical, Open Graph, organisation et site', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MAMBO Proxi/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /^http:\/\/localhost:3100\/?$/,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /opengraph-image/);
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'fr_FR');
    const things = await jsonLd(page);
    expect(types(things)).toEqual(expect.arrayContaining(['LocalBusiness', 'WebSite']));
    const business = things.find((thing) => thing['@type'] === 'LocalBusiness');
    expect(business?.aggregateRating).toMatchObject({ '@type': 'AggregateRating', bestRating: 5 });
  });

  test('fiche service : Service, FAQ et fil d’Ariane', async ({ page }) => {
    await page.goto('/services/experience/chef-prive');
    await expect(page).toHaveTitle(/Chef privé.*\| MAMBO Proxi|MAMBO Proxi/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/services\/experience\/chef-prive$/,
    );
    const things = await jsonLd(page);
    expect(types(things)).toEqual(expect.arrayContaining(['Service', 'FAQPage', 'BreadcrumbList']));
    const breadcrumb = things.find((thing) => thing['@type'] === 'BreadcrumbList') as {
      itemListElement: { name: string; item?: string }[];
    };
    expect(breadcrumb.itemListElement.at(-1)).toEqual(expect.objectContaining({ name: 'Chef privé' }));
    expect(breadcrumb.itemListElement[0]?.item).toMatch(/^https?:\/\//);
  });

  test('offre d’emploi : JobPosting', async ({ page }) => {
    await page.goto('/recrutement/coordinateur-rice-de-services');
    const job = (await jsonLd(page)).find((thing) => thing['@type'] === 'JobPosting');
    expect(job).toMatchObject({ title: 'Coordinateur·rice de services', employmentType: 'FULL_TIME' });
  });

  test('robots.txt bloque tout hors production, pages marquées noindex', async ({ page, request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toMatch(/Disallow: \/\s*$/m);
    await page.goto('/contact');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('sitemap.xml : pages, rubriques, services et offres', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBe(true);
    const xml = await response.text();
    for (const path of [
      '/services/experience',
      '/services/experience/chef-prive',
      '/recrutement/',
      '/contact',
    ])
      expect(xml).toContain(path);
    expect(xml.match(/<url>/g)?.length).toBeGreaterThan(40);
  });

  test('image de partage générée', async ({ request }) => {
    const response = await request.get('/opengraph-image');
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toBe('image/png');
  });
});

test.describe('en-têtes et routes techniques', () => {
  test('site public : CSP sans nonce et en-têtes de sécurité', async ({ request }) => {
    const headers = (await request.get('/')).headers();
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  test('/health répond sans dépendre de l’API', async ({ request }) => {
    const response = await request.get('/health');
    expect(await response.json()).toMatchObject({ status: 'ok' });
  });

  test('/api/revalidate refuse une requête sans secret', async ({ request }) => {
    const response = await request.post('/api/revalidate', { data: { tags: ['settings'] } });
    expect(response.status()).toBe(401);
  });

  test('/admin sans session : redirection vers la connexion', async ({ request }) => {
    const response = await request.get('/admin/demandes', { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers()['location']).toContain('/admin/connexion?suite=%2Fadmin%2Fdemandes');
  });
});
