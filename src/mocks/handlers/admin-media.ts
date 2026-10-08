import { http, HttpResponse } from 'msw';
import type { IllustrationScene, Media } from '@/lib/api/schema';
import { daysAgo, jsonBody, matches, mockId, paginate } from '../admin-utils';
import { problem } from '../problem';

const SCENES: { scene: IllustrationScene; alt: string; usage: string }[] = [
  { scene: 'chef', alt: 'Une cheffe prépare un plat en cuisine', usage: 'Service « Chef privé »' },
  {
    scene: 'marche',
    alt: 'Étal coloré d’un marché de Douala',
    usage: 'Service « Visites guidées de Douala »',
  },
  { scene: 'logement', alt: 'Façade d’un appartement meublé', usage: 'Service « Logement temporaire »' },
  {
    scene: 'voiture',
    alt: 'Voiture avec chauffeur devant l’agence',
    usage: 'Service « Location de voiture »',
  },
  {
    scene: 'evenement',
    alt: 'Salle décorée pour une réception',
    usage: 'Service « Services événementiels »',
  },
  { scene: 'colis', alt: 'Colis remis à un client', usage: 'Service « Réception de colis »' },
  { scene: 'equipe', alt: 'L’équipe MAMBO Proxi réunie', usage: 'Page « Qui sommes-nous »' },
  { scene: 'formation', alt: 'Atelier de formation en petit groupe', usage: 'Formations' },
];

function seed(): Media[] {
  return SCENES.map(({ scene, alt, usage }, index) => ({
    id: `med_${scene}`,
    url: `/illustrations/${scene}.svg`,
    width: 1600,
    height: 1067,
    alt,
    focalPoint: null,
    blurDataUrl: null,
    variants: [],
    fileName: `${scene}.svg`,
    mimeType: 'image/svg+xml',
    size: 18_000 + index * 2_300,
    status: 'READY',
    usages: [{ kind: 'service', label: usage, href: null }],
    createdAt: daysAgo(30 - index * 3),
  }));
}

/** Médiathèque simulée (partagée par les éditeurs : services, partenaires, formations, pages…). */
export const adminMedia: Media[] = seed();

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'] as const;

/** Dimensions d'une image envoyée (navigateur) ; valeurs par défaut sinon. */
async function dimensions(file: File): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap !== 'function' || file.type === 'image/svg+xml')
    return { width: 1600, height: 1067 };
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return { width: 1600, height: 1067 };
  }
}

export const adminMediaHandlers = [
  http.get('*/v1/admin/media', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const q = params.get('q');
    const list = adminMedia
      .filter((media) => matches(q, media.fileName, media.alt))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return HttpResponse.json(paginate(list, params, 24));
  }),

  http.post('*/v1/admin/media', async ({ request }) => {
    const form = await request.formData();
    const file = form.get('file');
    const alt = String(form.get('alt') ?? '').trim();
    if (!(file instanceof File)) return problem(422, 'Choisissez une image.');
    if (!ACCEPTED.includes(file.type as (typeof ACCEPTED)[number]))
      return problem(415, 'Format non accepté. Formats acceptés : JPG, PNG, WebP ou SVG.');
    if (file.size > 10 * 1024 * 1024) return problem(413, 'L’image dépasse 10 Mo.');
    if (!alt)
      return problem(422, 'Le texte alternatif est obligatoire.', [
        { path: 'alt', message: 'Décrivez l’image en quelques mots.' },
      ]);
    const { width, height } = await dimensions(file);
    const media: Media = {
      id: mockId('med'),
      url: URL.createObjectURL(file),
      width,
      height,
      alt,
      focalPoint: null,
      blurDataUrl: null,
      variants: [],
      fileName: file.name,
      mimeType: file.type as Media['mimeType'],
      size: file.size,
      status: 'READY',
      usages: [],
      createdAt: new Date().toISOString(),
    };
    adminMedia.unshift(media);
    return HttpResponse.json(media, { status: 201 });
  }),

  http.patch('*/v1/admin/media/:id', async ({ request, params }) => {
    const media = adminMedia.find((item) => item.id === params.id);
    if (!media) return problem(404, 'Ce média n’existe plus.');
    const body = await jsonBody<Partial<Pick<Media, 'alt' | 'focalPoint'>>>(request);
    if (body.alt !== undefined) media.alt = body.alt;
    if (body.focalPoint !== undefined) media.focalPoint = body.focalPoint;
    return HttpResponse.json(media);
  }),

  http.delete('*/v1/admin/media/:id', ({ params }) => {
    const index = adminMedia.findIndex((item) => item.id === params.id);
    if (index < 0) return problem(404, 'Ce média n’existe plus.');
    const media = adminMedia[index]!;
    if (media.usages.length)
      return problem(
        409,
        `Ce média est utilisé (${media.usages.map((usage) => usage.label).join(', ')}) : retirez-le d’abord.`,
      );
    adminMedia.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
