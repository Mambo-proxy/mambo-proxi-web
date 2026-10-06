import { CalendarCheck, FileText } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { WhatsappIcon } from '@/components/brand/social-icons';
import { Icon } from '@/components/ui/icon';
import { Reveal } from '@/components/ui/reveal';
import type { StepsSection } from '@/lib/api/schema';
import { frenchTypography } from '@/lib/format/typography';
import { routes } from '@/lib/routes';
import { ResponsiveText } from '../responsive-text';
import { SectionHeading } from '../section-heading';

type Channel = NonNullable<StepsSection['channels']>[number];

/**
 * « Comment ça marche » (Figma `50:357`, mobile `54:606`) : 3 cartes (rayon 28, p 32) avec icône 24 dans un carré
 * orange pâle, numéro 56 px `orange/200` ; en mobile, cartes horizontales (rayon 20) et textes raccourcis.
 * Ligne « Au choix : » + canaux (desktop uniquement).
 */
export function StepsCards({
  section,
  whatsappHref,
}: {
  section: StepsSection;
  whatsappHref: string | null;
}) {
  const channelHref = (channel: Channel): string | null =>
    ({
      form: routes.devis,
      whatsapp: whatsappHref,
      appointment: routes.rendezVous,
      phone: null,
      email: null,
    })[channel.kind];
  return (
    <section className="bg-neutral-50 py-16 xl:py-28">
      <div className="container-site flex flex-col gap-6 xl:gap-14">
        <SectionHeading
          align="center"
          eyebrow={section.eyebrow}
          title={section.title}
          titleMobile={section.titleMobile}
          lead={section.lead}
          leadMobile={section.leadMobile}
        />
        <ol className="grid gap-3 md:grid-cols-3 md:gap-6">
          {section.items.map((item, index) => (
            <Reveal
              as="li"
              key={item.title}
              delay={index * 70}
              className="flex items-center gap-4 rounded-[20px] border border-border-default bg-neutral-0 p-5 md:flex-col md:items-stretch md:gap-5 md:rounded-[28px] md:p-8"
            >
              <div className="flex shrink-0 items-start justify-between md:w-full">
                <span className="flex size-12 items-center justify-center rounded-[14px] bg-orange-50 text-text-brand md:size-[52px] md:rounded-2xl">
                  {item.icon && <Icon name={item.icon} className="size-[22px] md:size-6" />}
                </span>
                <span
                  aria-hidden
                  className="hidden font-brand text-[56px] leading-[56px] font-semibold tracking-[-0.02em] text-orange-200 md:block"
                >
                  {item.number}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1 md:gap-5">
                <h3 className="font-ui text-[16px] leading-6 font-semibold text-text-main md:font-brand md:text-[22px] md:leading-[30px]">
                  <span className="sr-only">Étape {item.number} : </span>
                  {frenchTypography(item.title)}
                </h3>
                {item.text && (
                  <p className="font-ui text-[14px] leading-5 text-text-muted md:text-[16px] md:leading-[26px]">
                    <ResponsiveText
                      desktop={frenchTypography(item.text)}
                      mobile={item.textMobile ? frenchTypography(item.textMobile) : null}
                    />
                  </p>
                )}
              </div>
              <span
                aria-hidden
                className="font-brand text-[28px] leading-8 font-semibold text-orange-200 md:hidden"
              >
                {item.number}
              </span>
            </Reveal>
          ))}
        </ol>
        {section.channels && section.channels.length > 0 && (
          <div className="hidden flex-wrap items-center justify-center gap-3 md:flex">
            {section.channelsLabel && (
              <span className="font-ui text-[14px] leading-5 text-text-muted">
                {frenchTypography(section.channelsLabel)}
              </span>
            )}
            {section.channels.map((channel) => {
              const href = channelHref(channel);
              if (!href) return null;
              const content = (
                <>
                  {channel.kind === 'whatsapp' ? (
                    <WhatsappIcon size={16} className="text-whatsapp-hover" />
                  ) : channel.kind === 'appointment' ? (
                    <CalendarCheck aria-hidden size={16} />
                  ) : (
                    <FileText aria-hidden size={16} />
                  )}
                  {channel.label}
                </>
              );
              const className =
                'inline-flex items-center gap-2 rounded-full border border-border-default bg-neutral-0 px-3.5 py-2 font-ui text-[14px] leading-5 font-medium text-text-main transition-colors hover:bg-neutral-100';
              return href.startsWith('https:') ? (
                <a
                  key={channel.kind}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {content}
                </a>
              ) : (
                <Link key={channel.kind} href={href as Route} className={className}>
                  {content}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
