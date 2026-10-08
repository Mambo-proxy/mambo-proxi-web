import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

const bodySchema = z.object({
  tags: z.array(z.string().min(1).max(256)).min(1).max(100),
});

/** Comparaison en temps constant du secret partagé avec l'API (`REVALIDATE_SECRET`). */
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return false;
  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  const expected = Buffer.from(secret);
  const received = Buffer.from(provided);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function problem(status: number, title: string, detail: string) {
  return NextResponse.json(
    { type: 'about:blank', title, status, detail },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  );
}

/**
 * Revalidation à la demande (docs/05 §3.4) : appelée par l'API à chaque publication depuis le back-office, avec les
 * étiquettes concernées (`settings`, `navigation`, `page:accueil`, `service:chef-prive`…). Les données sont
 * invalidées immédiatement : la visite suivante affiche la version publiée.
 * `Authorization: Bearer <REVALIDATE_SECRET>`, corps `{ "tags": [...] }`.
 */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request))
    return problem(401, 'Non autorisé', 'Secret de revalidation absent ou invalide.');
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(422, 'Requête invalide', 'Le corps attendu est { "tags": [ … ] }.');

  const tags = [...new Set(parsed.data.tags)];
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ revalidated: tags, now: new Date().toISOString() });
}
