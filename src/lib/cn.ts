import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * `tailwind-merge` configuré avec les noms du thème (tokens + styles web) : sans cela,
 * `text-body-md` (taille) et `text-text-main` (couleur) seraient vus comme deux couleurs en conflit.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'display',
        'h1',
        'h2',
        'h3',
        'h4',
        'overline',
        'body-lg',
        'body-md',
        'body-sm',
        'label-md',
        'label-sm',
        'caption',
      ],
      spacing: ['none', '3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
      shadow: ['0', '1', '2', '3', '4', 'brand', 'whatsapp'],
    },
    classGroups: {
      'font-size': [
        'text-web-hero',
        'text-web-section',
        'text-web-lead',
        'text-web-eyebrow',
        'text-web-stat',
      ],
    },
  },
});

/** Assemble des classes conditionnelles et résout les conflits Tailwind (la dernière l'emporte). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
