import type { Route } from 'next';
import type { ReactNode } from 'react';
import { CtaBand } from '@/components/site/cta-band';
import type { BreadcrumbItem } from '@/components/ui/breadcrumb';
import type { KeyFigure, Page, PageSection } from '@/lib/api/schema';
import { PageHero } from '../page-hero';
import { CardGrid } from './card-grid';
import { DarkBand } from './dark-band';
import { FeatureCards } from './feature-cards';
import { MethodRail } from './method-rail';
import { QuoteBand } from './quote-band';
import { StepsPanel } from './steps-panel';
import { TeamGrid } from './team-grid';
import { TextMedia } from './text-media';

type PageSectionsProps = {
  page: Page;
  breadcrumb: BreadcrumbItem[];
  whatsappHref: string | null;
  keyFigures: KeyFigure[];
  /** Hauteur du visuel du héros (Qui sommes-nous 460, Mission 440). */
  heroVisualClassName?: string;
  /** Sections propres à une page (formulaires, listes dynamiques), rendues à la place du type générique. */
  renderSection?: (section: PageSection) => ReactNode | undefined;
};

/**
 * Pages éditoriales (Qui sommes-nous, Mission…) : chaque section publiée est rendue selon son type, dans l'ordre
 * défini dans le back-office. Un type sans rendu prévu sur ces pages est ignoré.
 */
export function PageSections({
  page,
  breadcrumb,
  whatsappHref,
  keyFigures,
  heroVisualClassName,
  renderSection,
}: PageSectionsProps) {
  return page.sections.map((section) => {
    if (!section.enabled) return null;
    const custom = renderSection?.(section);
    if (custom !== undefined) return custom;
    switch (section.type) {
      case 'hero':
        return (
          <PageHero
            key={section.id}
            section={section}
            breadcrumb={breadcrumb}
            whatsappHref={whatsappHref}
            visualClassName={heroVisualClassName}
          />
        );
      case 'textMedia':
        return <TextMedia key={section.id} section={section} />;
      case 'team':
        return <TeamGrid key={section.id} section={section} />;
      case 'cardGrid':
        return <CardGrid key={section.id} section={section} />;
      case 'featureList':
        return <FeatureCards key={section.id} section={section} keyFigures={keyFigures} />;
      case 'steps':
        if (section.layout === 'timeline') return <StepsPanel key={section.id} section={section} />;
        return <MethodRail key={section.id} section={section} />;
      case 'quote':
        return <QuoteBand key={section.id} section={section} />;
      case 'ctaBand':
        if (section.tone === 'dark') return <DarkBand key={section.id} section={section} />;
        return (
          <CtaBand
            key={section.id}
            title={section.title ?? ''}
            text={section.text ?? ''}
            textMobile={section.textMobile}
            href={(section.primaryCta?.href ?? '/devis') as Route}
            ctaLabel={section.primaryCta?.label}
            whatsappHref={section.showWhatsapp ? whatsappHref : null}
          />
        );
      default:
        return null;
    }
  });
}
