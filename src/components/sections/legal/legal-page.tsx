import { ChevronRight, FileText } from 'lucide-react';
import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import type { HeroSection, PageKey, RichTextSection } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { getPage, pageMetadata } from '@/lib/pages';
import { routes } from '@/lib/routes';
import { CookieSettingsButton } from './cookie-settings-button';

export type LegalKey = Extract<PageKey, 'mentions-legales' | 'confidentialite' | 'cookies' | 'cgu'>;

/** Sommaire commun : libellé complet (desktop) et court (onglets mobiles). */
const LEGAL_PAGES: ReadonlyArray<{ key: LegalKey; label: string; short: string }> = [
  { key: 'mentions-legales', label: 'Mentions légales', short: 'Mentions légales' },
  { key: 'confidentialite', label: 'Politique de confidentialité', short: 'Confidentialité' },
  { key: 'cookies', label: 'Gestion des cookies', short: 'Cookies' },
  { key: 'cgu', label: 'Conditions générales', short: 'CGU' },
];

export function legalMetadata(key: LegalKey): Promise<Metadata> {
  return pageMetadata(key, `/${key}`);
}

/**
 * Pages légales (desktop `71:9645`, mobile `71:9918`) : en-tête (titre, « Dernière mise à jour »), sommaire collant à
 * gauche (onglets horizontaux en mobile), article en sections numérotées. Le contenu riche est saisi dans le
 * back-office et assaini côté API (balises autorisées : p, h2–h4, strong, em, a, ul, ol, li, br, blockquote).
 */
export async function LegalPage({ pageKey }: { pageKey: LegalKey }) {
  const page = await getPage(pageKey);
  if (!page) notFound();
  const hero = page.sections.find((section): section is HeroSection => section.type === 'hero');
  const content = page.sections.find((section): section is RichTextSection => section.type === 'richText');
  const title = hero?.title ?? page.title;

  return (
    <>
      <section className="bg-neutral-50">
        <div className="container-site flex flex-col gap-3.5 pt-5 pb-8 xl:py-12">
          <Breadcrumb items={[{ label: 'Accueil', href: routes.home }, { label: title }]} />
          <h1 className="font-brand text-[32px] leading-[38px] font-semibold tracking-[-0.025em] text-text-main md:text-[44px] md:leading-[50px] xl:text-[52px] xl:leading-[58px]">
            {frenchTypography(title)}
          </h1>
          {hero?.updatedLabel && (
            <p className="font-ui text-[14px] leading-5 text-text-muted">
              {frenchTypography(hero.updatedLabel)}
            </p>
          )}
        </div>
      </section>
      <div className="bg-neutral-0">
        <div className="container-site grid items-start gap-6 pt-6 pb-14 xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-20 xl:pt-16 xl:pb-28">
          <nav
            aria-label="Pages légales"
            className="xl:sticky xl:top-[calc(var(--site-header-h,121px)+24px)]"
          >
            <ul className="flex [scrollbar-width:none] gap-1 overflow-x-auto rounded-[20px] bg-neutral-50 p-1.5 xl:flex-col xl:p-3 [&::-webkit-scrollbar]:hidden">
              {LEGAL_PAGES.map((item) => {
                const active = item.key === pageKey;
                return (
                  <li key={item.key} className="flex-1 xl:flex-none">
                    <Link
                      href={`/${item.key}` as Route}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center justify-center gap-2 rounded-[14px] px-2.5 py-2 font-ui text-[12px] leading-5 tracking-[0.005em] whitespace-nowrap xl:justify-start xl:px-4 xl:py-3 xl:text-[14px]',
                        active
                          ? 'bg-neutral-0 font-semibold text-text-main shadow-1'
                          : 'font-medium text-text-muted hover:text-text-main',
                      )}
                    >
                      {active ? (
                        <FileText
                          aria-hidden
                          size={16}
                          className="hidden shrink-0 text-text-brand xl:block"
                        />
                      ) : (
                        <ChevronRight aria-hidden size={16} className="hidden shrink-0 xl:block" />
                      )}
                      <span className="xl:hidden">{item.short}</span>
                      <span className="hidden xl:inline">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <article className="flex min-w-0 flex-col gap-9">
            {content?.articles.map((article, index) => (
              <section key={article.title} className="flex flex-col gap-3">
                <h2 className="font-brand text-[24px] leading-8 font-semibold text-text-main">
                  {frenchTypography(`${index + 1}. ${article.title}`)}
                </h2>
                <div
                  className="flex flex-col gap-3 font-ui text-[16px] leading-[25px] text-text-muted xl:text-[17px] xl:leading-[29px] [&_a]:font-medium [&_a]:text-text-brand [&_a]:underline [&_a]:underline-offset-2 [&_h3]:font-semibold [&_h3]:text-text-main [&_li]:list-disc [&_strong]:text-text-main [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1 [&_ul]:pl-5"
                  // HTML assaini par l'API (contrat `Html`) : seules des balises de mise en forme sont acceptées.
                  dangerouslySetInnerHTML={{ __html: article.html }}
                />
              </section>
            ))}
            {pageKey === 'cookies' && <CookieSettingsButton />}
          </article>
        </div>
      </div>
    </>
  );
}
