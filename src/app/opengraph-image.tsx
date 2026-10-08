import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/seo/site';

export const alt = `${SITE_NAME} — vos services, au plus près de vous, en France et au Cameroun`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const root = process.cwd();
const tokens = await readFile(join(root, 'src/styles/tokens.css'), 'utf8');

/** Valeur d'un token de couleur (`--mp-color-<nom>`) : l'image ne peut pas lire les variables CSS. */
function token(name: string): string {
  const value = new RegExp(`--mp-color-${name}:\\s*(#[0-9A-Fa-f]{6})`).exec(tokens)?.[1];
  if (!value) throw new Error(`Token de couleur introuvable : ${name}`);
  return value;
}

const svg = async (path: string) =>
  `data:image/svg+xml;base64,${(await readFile(join(root, 'public', path))).toString('base64')}`;
const logo = await svg('brand/logo-horizontal.svg');
const illustration = await svg('illustrations/accueil.svg');

/**
 * Image de partage par défaut (Open Graph, 1200 × 630) : logo validé, accroche et illustration de l'accueil, sur le
 * fond `orange/50`. Remplacée par l'image choisie dans le back-office quand elle existe.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: token('orange-50'),
        padding: '0 0 0 72px',
        gap: 48,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36, width: 560 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- image générée, pas de next/image */}
        <img src={logo} alt="" height={92} style={{ objectFit: 'contain', objectPosition: 'left' }} />
        <div
          style={{
            display: 'flex',
            fontSize: 60,
            lineHeight: 1.1,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: token('neutral-900'),
          }}
        >
          Vos services, au plus près de vous.
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: token('orange-700') }}>
          France · Cameroun — devis gratuit
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flex: 1,
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: token('orange-100'),
          borderRadius: '48px 0 0 48px',
          overflow: 'hidden',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- image générée, pas de next/image */}
        <img src={illustration} alt="" width={540} height={540} style={{ objectFit: 'contain' }} />
      </div>
    </div>,
    size,
  );
}
