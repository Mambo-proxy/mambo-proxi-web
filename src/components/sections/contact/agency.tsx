import { ArrowUpRight, Clock, MapPin, Package } from 'lucide-react';
import type { SiteSettings } from '@/lib/api/schema';
import { COUNTRIES } from '@/lib/countries';
import { frenchTypography } from '@/lib/format/typography';
import { SectionHeading } from '../section-heading';

/**
 * Plan stylisé de la maquette (`69:8023`) : fond `neutral/100`, routes blanches, zones vertes, repère orange avec halo.
 * Image décorative, sans service tiers ni cookie, en attendant l'adresse définitive (docs/03, Contact).
 */
function AgencyMap() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1312 460"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
    >
      <rect width="1312" height="460" fill="var(--mp-color-neutral-100)" />
      <path
        d="M0 330 C 260 322 480 300 690 274 C 900 248 1120 214 1312 200 L1312 460 L0 460 Z"
        fill="var(--mp-color-vert-50)"
      />
      <rect x="980" y="40" width="220" height="120" rx="16" fill="var(--mp-color-vert-50)" />
      <g stroke="var(--mp-color-neutral-0)" strokeWidth="14" fill="none" strokeLinecap="square">
        <path d="M0 120 L1312 58" />
        <path d="M0 245 L700 268 L1312 326" />
        <path d="M120 0 L178 460" />
        <path d="M300 0 L425 460" />
        <path d="M820 0 L705 460" />
        <path d="M1042 0 L1118 460" />
      </g>
      <path
        d="M655 0 C 640 120 600 220 560 300"
        stroke="var(--mp-color-neutral-0)"
        strokeWidth="8"
        fill="none"
      />
      <circle cx="620" cy="210" r="48" fill="var(--mp-color-orange-200)" opacity="0.7" />
      <path
        d="M620 166 c-14 0 -24 10 -24 23 c0 17 24 39 24 39 s24 -22 24 -39 c0 -13 -10 -23 -24 -23 z"
        fill="var(--mp-color-brand-primary)"
        stroke="var(--mp-color-neutral-0)"
        strokeWidth="3"
      />
      <circle cx="620" cy="189" r="7" fill="var(--mp-color-neutral-0)" />
    </svg>
  );
}

/**
 * « Notre agence » (`69:8019`) : titre, plan (1312 × 460, rayon 32 ; 300 de haut en mobile) et carte adresse
 * (360, ombre forte) en haut à gauche — en bas, pleine largeur moins 16 px, en mobile.
 */
export function Agency({ settings }: { settings: SiteSettings }) {
  const { agency, contact } = settings;
  const country = COUNTRIES.find((item) => item.code === agency.country)?.name ?? agency.country;
  const address = [agency.addressLines.join(', '), `${agency.city}, ${country}`].filter(Boolean).join(' · ');
  const rows = [
    { icon: MapPin, text: address },
    { icon: Clock, text: contact.hoursLabel },
    ...(agency.parcelReceptionNote ? [{ icon: Package, text: 'Réception des colis et courriers' }] : []),
  ];
  return (
    <section className="bg-neutral-50 py-14 xl:py-24">
      <div className="container-site flex flex-col gap-7 xl:gap-12">
        <SectionHeading eyebrow="Notre agence" title="Venez nous rencontrer" />
        <div className="relative h-[300px] overflow-hidden rounded-[24px] md:h-[400px] xl:h-[460px] xl:rounded-[32px]">
          <AgencyMap />
          <address className="absolute inset-x-4 bottom-4 flex flex-col gap-3 rounded-[20px] bg-neutral-0 p-4 not-italic shadow-3 md:inset-x-auto md:top-10 md:bottom-auto md:left-10 md:w-[360px] md:p-6">
            <p className="font-ui text-[16px] leading-6 font-semibold text-text-main">{agency.name}</p>
            <ul className="flex flex-col gap-3">
              {rows.map(({ icon: RowIcon, text }) => (
                <li
                  key={text}
                  className="flex items-start gap-2 font-ui text-[14px] leading-5 text-text-muted"
                >
                  <RowIcon aria-hidden size={16} className="mt-0.5 shrink-0 text-text-brand" />
                  {frenchTypography(text)}
                </li>
              ))}
            </ul>
            {agency.mapsUrl && (
              <a
                href={agency.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/route inline-flex items-center gap-1.5 self-start rounded-xs font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-main"
              >
                Itinéraire
                <span className="sr-only"> (nouvel onglet)</span>
                <ArrowUpRight
                  aria-hidden
                  size={16}
                  className="transition-transform duration-200 group-hover/route:translate-x-0.5 group-hover/route:-translate-y-0.5"
                />
              </a>
            )}
          </address>
        </div>
      </div>
    </section>
  );
}
