import { http, HttpResponse } from 'msw';
import type { IllustrationScene, Media } from '@/lib/api/schema';
import { daysAgo, jsonBody, matches, mockId, paginate } from '../admin-utils';
import { services } from '../data/catalogue';
import { problem } from '../problem';

/** Illustrations livrées avec le site (exportées des maquettes) et leur texte alternatif. */
const SCENES: { scene: IllustrationScene; alt: string }[] = [
  { scene: 'accueil', alt: 'Accueil chaleureux à l’agence de Douala' },
  { scene: 'chef', alt: 'Une cheffe prépare un plat en cuisine' },
  { scene: 'colis', alt: 'Colis remis à un client' },
  { scene: 'courses', alt: 'Sacs de courses posés sur une table' },
  { scene: 'culture', alt: 'Visite d’une exposition d’art' },
  { scene: 'equipe', alt: 'L’équipe MAMBO Proxi réunie' },
  { scene: 'evenement', alt: 'Salle décorée pour une réception' },
  { scene: 'formation', alt: 'Atelier de formation en petit groupe' },
  { scene: 'livraison', alt: 'Livreur à scooter dans une rue de Douala' },
  { scene: 'logement', alt: 'Salon lumineux d’un appartement entretenu' },
  { scene: 'marche', alt: 'Étal coloré d’un marché de Douala' },
  { scene: 'massage', alt: 'Séance de massage à domicile' },
  { scene: 'photo', alt: 'Photographe pendant une séance en extérieur' },
  { scene: 'portrait', alt: 'Portrait souriant d’une cliente' },
  { scene: 'voiture', alt: 'Voiture avec chauffeur devant l’agence' },
];

/** Pages qui affichent une illustration en dehors des fiches service. */
const PAGE_USAGES: Partial<Record<IllustrationScene, Media['usages']>> = {
  equipe: [{ kind: 'page', label: 'Page « Qui sommes-nous »', href: '/admin/pages' }],
  formation: [{ kind: 'page', label: 'Page « Formations »', href: '/admin/formations' }],
};

/** Usages d'une illustration : fiches du catalogue actuel qui l'affichent, puis pages. */
function usagesOf(scene: IllustrationScene): Media['usages'] {
  return [
    ...services
      .filter((service) => service.visual.illustration === scene)
      .map((service) => ({
        kind: 'service',
        label: `Service « ${service.shortName ?? service.name} »`,
        href: '/admin/services',
      })),
    ...(PAGE_USAGES[scene] ?? []),
  ];
}

function seed(): Media[] {
  return SCENES.map(({ scene, alt }, index) => ({
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
    usages: usagesOf(scene),
    createdAt: daysAgo(45 - index * 3),
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
    if (body.alt !== undefined && !body.alt?.trim())
      return problem(422, 'Le texte alternatif est obligatoire.', [
        { path: 'alt', message: 'Décrivez l’image en quelques mots.' },
      ]);
    if (body.alt !== undefined) media.alt = body.alt!.trim();
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
