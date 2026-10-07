import type { Route } from 'next';
import Link from 'next/link';
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/breadcrumb';
import { buttonVariants } from '@/components/ui/button';
import { Visual } from '@/components/ui/visual';
import type { ServiceDetail } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';

type ServiceHeroProps = {
  service: ServiceDetail;
  breadcrumb: BreadcrumbItem[];
  quoteHref: Route;
  whatsappHref: string | null;
};

const tag =
  'rounded-full border border-border-default px-3 py-1.5 font-ui text-[13px] leading-4 font-semibold tracking-[0.01em]';

/**
 * Héros de la fiche service (`62:4272`) : fond `neutral/50`, fil d'Ariane, étiquettes rubrique et villes,
 * titre Poppins 64/68 (36/42 en mobile), accroche 20/32 (bloc 780) ; boutons Devis + WhatsApp alignés à droite
 * (absents en mobile, portés par la barre d'action) ; galerie 860 + 2 × 436 × 232, rayon 28 (350 × 220 en mobile).
 */
export function ServiceHero({ service, breadcrumb, quoteHref, whatsappHref }: ServiceHeroProps) {
  const [main, ...side] = service.gallery.length > 0 ? service.gallery : [service.visual];
  return (
    <section className="bg-neutral-50">
      <div className="container-site flex flex-col gap-5 pt-5 pb-8 md:pb-12 xl:gap-8 xl:pt-10 xl:pb-14">
        <Breadcrumb items={breadcrumb} />
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between xl:gap-10">
          <div className="flex flex-col xl:max-w-[780px]">
            <ul className="flex flex-wrap gap-2">
              <li className={cn(tag, 'bg-orange-50 text-orange-700')}>{service.category.name}</li>
              {service.cities.length > 0 && (
                <li className={cn(tag, 'bg-neutral-0 text-text-muted')}>{service.cities.join(' · ')}</li>
              )}
            </ul>
            <h1 className="mt-4 font-brand text-[36px] leading-[42px] font-semibold tracking-[-0.025em] text-text-main md:text-[52px] md:leading-[58px] xl:mt-5 xl:text-[64px] xl:leading-[68px]">
              {frenchTypography(service.name)}
            </h1>
            <p className="mt-4 font-ui text-[16px] leading-[25px] text-text-muted md:text-[18px] md:leading-7 xl:mt-3 xl:text-[20px] xl:leading-8">
              {frenchTypography(service.tagline)}
            </p>
          </div>
          <div className="flex gap-2.5 max-md:hidden xl:shrink-0">
            <Link href={quoteHref} className={buttonVariants()}>
              Demander un devis gratuit
            </Link>
            {service.showWhatsapp && whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: 'whatsapp' })}
              >
                Écrire sur WhatsApp
              </a>
            )}
          </div>
        </div>
        <div className="flex h-[220px] gap-2 md:h-[360px] xl:h-[480px] xl:gap-4">
          <Visual
            visual={main!}
            priority
            sizes="(min-width: 1280px) 860px, 70vw"
            className="flex-1 rounded-[20px] xl:rounded-[28px]"
          />
          {side.length > 0 && (
            <div className="flex w-[100px] shrink-0 flex-col gap-2 md:w-[30%] xl:w-[436px] xl:gap-4">
              {side.map((visual, index) => (
                <Visual
                  key={index}
                  visual={visual}
                  sizes="(min-width: 1280px) 436px, 30vw"
                  className="flex-1 rounded-2xl xl:rounded-[28px]"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
