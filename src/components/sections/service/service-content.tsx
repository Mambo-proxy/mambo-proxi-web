import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { Accordion } from '@/components/ui/accordion';
import { Icon } from '@/components/ui/icon';
import { Reveal } from '@/components/ui/reveal';
import type { ServiceDetail } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';

/** Titre des blocs de contenu : Poppins SemiBold h2 32/40 -1 % (24/30 en mobile). */
function BlockTitle({ children }: { children: string }) {
  return (
    <h2 className="font-brand text-[24px] leading-[30px] font-semibold tracking-[-0.01em] text-text-main md:text-[28px] md:leading-9 xl:text-[32px] xl:leading-10">
      {frenchTypography(children)}
    </h2>
  );
}

/** Bloc de la colonne principale : section pleine largeur en mobile (py 44), simple bloc en desktop. */
function Block({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-[18px] py-11 xl:col-start-1 xl:gap-6 xl:py-0', className)}>
      <BlockTitle>{title}</BlockTitle>
      {children}
    </div>
  );
}

type ServiceContentProps = {
  service: ServiceDetail;
  /** Carte devis et encart rendez-vous : colonne latérale collante en desktop, après « À qui… » en mobile. */
  aside: ReactNode;
};

/**
 * Contenu de la fiche (`62:4333`) : colonne principale (848, blocs espacés de 72) et colonne latérale collante (400),
 * py 80. En mobile, chaque bloc devient une section (py 44) et « Les avantages » passe sur fond `neutral/50`.
 */
export function ServiceContent({ service, aside }: ServiceContentProps) {
  return (
    <section className="bg-neutral-0 xl:py-20">
      <div className="container-site grid xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-x-16 xl:gap-y-[72px]">
        {service.audiences.length > 0 && (
          <Block title="À qui s’adresse ce service ?">
            <ul className="grid gap-3 md:grid-cols-2 xl:max-w-[764px]">
              {service.audiences.map((audience) => (
                <li
                  key={audience}
                  className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-4 font-ui text-[15px] leading-[22px] text-text-main"
                >
                  <span
                    aria-hidden
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-orange-100"
                  >
                    <Check size={16} className="text-text-brand" />
                  </span>
                  {frenchTypography(audience)}
                </li>
              ))}
            </ul>
          </Block>
        )}

        <aside
          aria-label="Demande de devis"
          className="pb-11 xl:col-start-2 xl:row-span-4 xl:row-start-1 xl:pb-0"
        >
          <div className="flex flex-col gap-4 xl:sticky xl:top-[calc(var(--site-header-h,85px)+24px)]">
            {aside}
          </div>
        </aside>

        {service.steps.length > 0 && (
          <Block title="Ce que Mambo fait concrètement">
            <ol>
              {service.steps.map((step, index) => {
                const last = index === service.steps.length - 1;
                return (
                  <li key={step.title} className="relative flex gap-[18px]">
                    <span
                      className={cn(
                        'relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full font-ui text-[15px] leading-6 font-semibold',
                        last ? 'bg-brand-primary text-neutral-900' : 'bg-neutral-900 text-neutral-0',
                      )}
                    >
                      {index + 1}
                    </span>
                    {!last && (
                      <span
                        aria-hidden
                        className="absolute top-9 bottom-0 left-[17px] w-0.5 bg-border-default"
                      />
                    )}
                    <span className="flex flex-col gap-1 pt-1.5 pb-7">
                      <span className="font-ui text-[17px] leading-6 font-semibold text-text-main">
                        {frenchTypography(step.title)}
                      </span>
                      <span className="font-ui text-[15px] leading-6 text-text-muted">
                        {frenchTypography(step.text)}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </Block>
        )}

        {service.advantages.length > 0 && (
          <Block
            title="Les avantages pour vous"
            className="bleed-x bg-neutral-50 xl:mx-0 xl:bg-transparent xl:px-0"
          >
            <ul className="grid gap-4 md:grid-cols-2 xl:max-w-[768px]">
              {service.advantages.map((advantage, index) => (
                <Reveal
                  as="li"
                  key={advantage.title}
                  delay={index * 70}
                  className="flex flex-col gap-3 rounded-[20px] bg-neutral-0 p-6 xl:bg-neutral-50"
                >
                  <span
                    aria-hidden
                    className="flex size-11 items-center justify-center rounded-[13px] bg-orange-50"
                  >
                    {advantage.icon && <Icon name={advantage.icon} size={20} className="text-text-brand" />}
                  </span>
                  <span className="font-ui text-[17px] leading-6 font-semibold text-text-main">
                    {frenchTypography(advantage.title)}
                  </span>
                  <span className="font-ui text-[15px] leading-[22px] text-text-muted">
                    {frenchTypography(advantage.text)}
                  </span>
                </Reveal>
              ))}
            </ul>
          </Block>
        )}

        {service.faq.length > 0 && (
          <Block title="Questions fréquentes" className="gap-2.5 xl:gap-3">
            <Accordion
              name="faq-service"
              roomy
              className="border-t-0"
              items={service.faq.map((item, index) => ({ ...item, open: index === 0 }))}
            />
          </Block>
        )}
      </div>
    </section>
  );
}
