import { Reveal } from '@/components/ui/reveal';
import { Visual } from '@/components/ui/visual';
import type { TeamSection } from '@/lib/api/schema';
import { SectionHeading } from '../section-heading';
import { SectionShell } from './section-shell';

/**
 * Notre équipe (`63:4919`) : en-tête (820), 4 portraits 313 × 360 rayon 24 (2 × 2, 169 × 200 en mobile),
 * nom Inter SemiBold 17/24, rôle et lieu 14/20 séparés par un point médian.
 */
export function TeamGrid({ section }: { section: TeamSection }) {
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
      <ul className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-5">
        {section.members.map((member, index) => (
          <Reveal as="li" key={`${member.name}-${index}`} delay={index * 70} className="flex flex-col gap-3">
            <Visual
              visual={member.visual}
              sizes="(min-width: 1280px) 313px, 50vw"
              className="h-[200px] rounded-3xl md:h-[300px] xl:h-[360px]"
            />
            <span className="flex flex-col gap-3">
              <span className="font-ui text-[16px] leading-6 font-semibold text-text-main xl:text-[17px]">
                {member.name}
              </span>
              <span className="font-ui text-[14px] leading-5 text-text-muted">
                {[member.role, member.location].filter(Boolean).join(' · ')}
              </span>
            </span>
          </Reveal>
        ))}
      </ul>
    </SectionShell>
  );
}
