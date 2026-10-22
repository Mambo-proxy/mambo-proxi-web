import { ArrowLeft, Banknote, Briefcase, Calendar, Check, Clock, MapPin } from 'lucide-react';
import type { Metadata, Route } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { ShareButtons } from '@/components/sections/jobs/share-buttons';
import { JsonLd } from '@/components/seo/json-ld';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { buttonVariants } from '@/components/ui/button';
import { SiteLink as Link } from '@/i18n/site-link';
import { unwrap, unwrapOrNull } from '@/lib/api/result';
import { api, cached } from '@/lib/api/server';
import { cacheTags } from '@/lib/api/tags';
import { formatDate } from '@/lib/format/date';
import { formatSalary } from '@/lib/format/number';
import { frenchTypography } from '@/lib/format/typography';
import { routes } from '@/lib/routes';
import { jobPostingJsonLd } from '@/lib/seo/json-ld';
import { seoMetadata } from '@/lib/seo/metadata';

type Params = { params: Promise<{ slug: string }> };

function getJob(slug: string) {
  return unwrapOrNull(
    api.GET('/v1/jobs/{slug}', {
      params: { path: { slug } },
      ...cached([cacheTags.job(slug), cacheTags.jobs]),
    }),
  );
}

export async function generateStaticParams() {
  const jobs = await unwrap(api.GET('/v1/jobs', cached([cacheTags.jobs])));
  return jobs.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return {};
  return seoMetadata({
    title: `${job.title} · ${job.city}`,
    description: job.summary,
    path: `/recrutement/${job.slug}`,
  });
}

/** Bloc de contenu de l'offre : titre Poppins 26/32 (21/32 en mobile, `82:9361`). */
function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-brand text-[21px] leading-8 font-semibold text-text-main xl:text-[26px]">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Liste à puces cochées (pastille 24 `orange/50`, coche 14 orange, texte 17/26, 15/26 en mobile). */
function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 font-ui text-[15px] leading-[26px] text-text-main xl:text-[17px]"
        >
          <span
            aria-hidden
            className="mt-px flex size-6 shrink-0 items-center justify-center rounded-full bg-orange-50"
          >
            <Check size={14} strokeWidth={2.5} className="text-text-brand" />
          </span>
          {frenchTypography(item)}
        </li>
      ))}
    </ul>
  );
}

/**
 * Offre d'emploi (desktop `82:8945`, mobile `82:9299`) : en-tête (secteurs ou lieu, rémunération, horaires, contrat,
 * prise de poste, publication ; une information par ligne en mobile), contenu de l'offre, carte « Intéressé·e ? ».
 */
export default async function JobPage({ params }: Params) {
  const { slug } = await params;
  const [job, t, tj, tr, locale] = await Promise.all([
    getJob(slug),
    getTranslations('job'),
    getTranslations('jobs'),
    getTranslations('rubrique'),
    getLocale(),
  ]);
  if (!job) notFound();
  const lang = locale === 'en' ? 'en' : 'fr';
  const contract = [job.contractType, job.workingTime].filter(Boolean).join(' · ');
  const meta = [
    {
      icon: MapPin,
      text: job.sectors.length
        ? t('sectors', { sectors: job.sectors.join(', ') })
        : (job.locationLabel ?? job.city),
    },
    ...(job.salary
      ? [{ icon: Banknote, text: t('salary', { salary: formatSalary(job.salary, lang) }) }]
      : []),
    ...(job.schedule ? [{ icon: Clock, text: job.schedule }] : []),
    { icon: Briefcase, text: contract },
    ...(job.startDate ? [{ icon: Clock, text: t('start', { date: job.startDate }) }] : []),
    { icon: Calendar, text: t('published', { date: formatDate(job.publishedAt, undefined, lang) }) },
  ];
  const applyHref = `/recrutement?poste=${job.slug}#candidature` as Route;

  return (
    <>
      <JsonLd data={jobPostingJsonLd(job)} />
      <section className="bg-neutral-50">
        <div className="container-site flex flex-col gap-[18px] pt-5 pb-8 xl:pt-12 xl:pb-14">
          <Breadcrumb
            items={[
              { label: tr('home'), href: routes.home },
              { label: t('careers'), href: '/recrutement' as Route },
              { label: job.title },
            ]}
          />
          <ul className="flex flex-wrap gap-2">
            {job.isNew && (
              <li className="rounded-full border border-border-default bg-vert-50 px-3 py-[5px] font-ui text-[13px] leading-4 font-semibold tracking-[0.01em] text-vert-700">
                {tj('new')}
              </li>
            )}
            <li className="rounded-full border border-border-default bg-neutral-0 px-3 py-[5px] font-ui text-[13px] leading-4 font-semibold tracking-[0.01em] text-text-main">
              {job.contractType}
            </li>
          </ul>
          <h1 className="font-brand text-[30px] leading-9 font-semibold tracking-[-0.025em] text-text-main md:text-[44px] md:leading-[50px] xl:text-[52px] xl:leading-[58px]">
            {frenchTypography(job.title)}
          </h1>
          {/* Écarts de 24 ; en mobile, textes 14/24 espacés de 12 (une information par ligne : `82:9335`). */}
          <ul className="flex flex-wrap gap-3 font-ui text-[14px] leading-6 text-text-muted md:gap-6 md:text-[16px]">
            {meta.map(({ icon: MetaIcon, text }) => (
              <li key={text} className="inline-flex items-center gap-2">
                <MetaIcon aria-hidden size={18} className="shrink-0" />
                {frenchTypography(text)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="bg-neutral-0">
        <div className="container-site grid items-start gap-8 pt-8 pb-12 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-16 xl:pt-16 xl:pb-24">
          <div className="flex flex-col gap-8 xl:gap-12">
            {job.description && (
              <Block title={t('position')}>
                <p className="font-ui text-[16px] leading-[25px] text-text-muted xl:text-[18px] xl:leading-[30px]">
                  {frenchTypography(job.description)}
                </p>
              </Block>
            )}
            {job.missions.length > 0 && (
              <Block title={t('missions')}>
                <CheckList items={job.missions} />
              </Block>
            )}
            {job.profile.length > 0 && (
              <Block title={t('profile')}>
                <CheckList items={job.profile} />
              </Block>
            )}
            {job.benefits.length > 0 && (
              <Block title={t('benefits')}>
                <CheckList items={job.benefits} />
              </Block>
            )}
          </div>
          <aside aria-label={t('apply')} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3.5 rounded-3xl border border-border-default bg-neutral-0 p-7 shadow-2">
              <h2 className="font-brand text-[20px] leading-7 font-semibold text-text-main">
                {frenchTypography(t('interested'))}
              </h2>
              <p className="font-ui text-[14px] leading-5 text-text-muted">
                {frenchTypography(t('interestedText'))}
              </p>
              <Link href={applyHref} className={buttonVariants({ fullWidth: true })}>
                {t('applyCta')}
              </Link>
              <ShareButtons title={job.title} />
            </div>
            <Link
              href={'/recrutement#offres' as Route}
              className="inline-flex items-center gap-1.5 self-start rounded-xs font-ui text-[14px] leading-5 font-semibold tracking-[0.005em] text-text-main"
            >
              {t('allJobs')}
              <ArrowLeft aria-hidden size={16} />
            </Link>
          </aside>
        </div>
      </div>
    </>
  );
}
