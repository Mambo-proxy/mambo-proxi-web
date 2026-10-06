import type { SVGProps } from 'react';

/**
 * Icônes des réseaux sociaux, au style trait de lucide (24 px, trait 2, extrémités arrondies) :
 * lucide ne fournit plus les logos de marques (docs/02 §8).
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 24, children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </Base>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </Base>
  );
}

export function LinkedinIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </Base>
  );
}

export function TiktokIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M16 3a5 5 0 0 0 5 5" />
      <path d="M16 3v12a5 5 0 1 1-5-5" />
    </Base>
  );
}

export function WhatsappIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </Base>
  );
}

export const SOCIAL_ICONS = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  linkedin: LinkedinIcon,
  tiktok: TiktokIcon,
  whatsapp: WhatsappIcon,
} as const;

export const SOCIAL_LABELS: Record<keyof typeof SOCIAL_ICONS, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
};
