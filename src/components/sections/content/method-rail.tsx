import { Fragment } from 'react';
import { Icon } from '@/components/ui/icon';
import { Reveal } from '@/components/ui/reveal';
import type { StepsSection } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { SectionHeading } from '../section-heading';
import { SectionShell } from './section-shell';

/**
 * Méthode de coordination (Mission `64:5451`) : rail de pastilles 44 reliées par des traits de 2 px (la dernière en
 * orange), puis une carte par étape (`neutral/50`, rayon 22, p 24 ; pastille 44 blanche, titre 17/24, texte 14/21).
 * En mobile, le rail disparaît : le numéro passe dans le titre et les cartes s'empilent (icône à gauche).
 */
export function MethodRail({ section }: { section: StepsSection }) {
  const last = section.items.length - 1;
  return (
    <SectionShell section={section} innerClassName="flex flex-col gap-7 xl:gap-12">
      <SectionHeading
        eyebrow={section.eyebrow}
        title={section.title}
        titleMobile={section.titleMobile}
        lead={section.lead}
        leadMobile={section.leadMobile}
        className="xl:max-w-[820px]"
      />
      <div className="flex flex-col gap-6 xl:gap-12">
        <div aria-hidden className="hidden items-center md:flex">
          {section.items.map((item, index) => (
            <Fragment key={item.title}>
              <span
                className={cn(
                  'flex size-11 shrink-0 items-center justify-center rounded-full font-ui text-[16px] leading-6 font-semibold',
                  index === last ? 'bg-brand-primary text-neutral-900' : 'bg-neutral-900 text-neutral-0',
                )}
              >
                {index + 1}
              </span>
              {index < last && <span className="h-0.5 flex-1 bg-border-strong" />}
            </Fragment>
          ))}
        </div>
        <ol
          className={cn(
            'grid gap-3 md:gap-4',
            section.items.length === 5 ? 'md:grid-cols-5' : 'md:grid-cols-4',
          )}
        >
          {section.items.map((item, index) => (
            <Reveal
              as="li"
              key={item.title}
              delay={index * 70}
              className="flex gap-3.5 rounded-[22px] bg-neutral-50 p-[18px] md:flex-col md:p-4 xl:p-6"
            >
              {item.icon && (
                <span
                  aria-hidden
                  className="flex size-11 shrink-0 items-center justify-center rounded-[13px] bg-neutral-0"
                >
                  <Icon name={item.icon} size={20} className="text-text-brand" />
                </span>
              )}
              <span className="flex flex-col gap-1">
                <h3 className="font-ui text-[17px] leading-6 font-semibold text-text-main">
                  <span className="md:sr-only">{`${index + 1}. `}</span>
                  {frenchTypography(item.title)}
                </h3>
                {item.text && (
                  <p className="font-ui text-[14px] leading-[21px] text-text-muted">
                    {frenchTypography(item.text)}
                  </p>
                )}
              </span>
            </Reveal>
          ))}
        </ol>
      </div>
    </SectionShell>
  );
}
