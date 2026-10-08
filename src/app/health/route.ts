import { NextResponse } from 'next/server';
import packageJson from '../../../package.json';

export const dynamic = 'force-dynamic';

/** Sonde de disponibilité du site (supervision, `HEALTHCHECK` Docker) : ne dépend pas de l'API. */
export function GET() {
  return NextResponse.json(
    { status: 'ok', version: packageJson.version, time: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
