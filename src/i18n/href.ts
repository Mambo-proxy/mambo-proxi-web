import { defaultLocale, isLocale, routing, type Locale } from './routing';

type Pattern = { key: string; regex: RegExp; params: string[] };

/** Convertit un modèle d'adresse (`/recrutement/[slug]`) en expression régulière et liste ses paramètres. */
function compile(template: string): Omit<Pattern, 'key'> {
  const params: string[] = [];
  const source = template
    .split('/')
    .map((part) => {
      const param = /^\[(.+)\]$/.exec(part);
      if (!param) return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      params.push(param[1] ?? '');
      return '([^/]+)';
    })
    .join('/');
  return { regex: new RegExp(`^${source}/?$`), params };
}

function localizedTemplate(key: string, locale: Locale): string {
  const value = routing.pathnames[key as keyof typeof routing.pathnames];
  return typeof value === 'string' ? value : value[locale];
}

/** Adresses fixes avant les modèles (`/questionnaire/merci` avant `/questionnaire/[token]`). */
const byParams = (a: Pattern, b: Pattern) => a.params.length - b.params.length;

const internalPatterns: Pattern[] = Object.keys(routing.pathnames)
  .map((key) => ({ key, ...compile(key) }))
  .sort(byParams);

const localizedPatterns = Object.fromEntries(
  routing.locales.map((locale) => [
    locale,
    Object.keys(routing.pathnames)
      .map((key) => ({ key, ...compile(localizedTemplate(key, locale)) }))
      .sort(byParams),
  ]),
) as Record<Locale, Pattern[]>;

function fill(template: string, params: Record<string, string>): string {
  return template.replace(/\[([^\]]+)\]/g, (_, name: string) => params[name] ?? '');
}

function matchPattern(path: string, patterns: Pattern[]) {
  for (const pattern of patterns) {
    const match = pattern.regex.exec(path);
    if (match) {
      const params = Object.fromEntries(pattern.params.map((name, index) => [name, match[index + 1] ?? '']));
      return { key: pattern.key, params };
    }
  }
  return null;
}

/** Adresses hors du site public : back-office, routes techniques, fichiers. */
function isOutsideSite(path: string): boolean {
  return (
    path === '/admin' ||
    path.startsWith('/admin/') ||
    path.startsWith('/api/') ||
    path.startsWith('/dev/') ||
    /\.[a-z0-9]+$/i.test(path)
  );
}

function withPrefix(path: string, locale: Locale): string {
  if (locale === defaultLocale) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

/**
 * Adresse interne du site (en français, telle que dans le contenu et l'API : `/qui-sommes-nous#equipe`) → adresse
 * dans la langue demandée (`/en/about-us#equipe`). Les liens externes, `mailto:`, `tel:` et le back-office sont
 * renvoyés tels quels.
 */
export function localizeHref(href: string, locale: Locale): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const [, path = '/', rest = ''] = /^([^?#]*)(.*)$/.exec(href) ?? [];
  if (isOutsideSite(path)) return href;
  const match = matchPattern(path || '/', internalPatterns);
  const localized = match ? fill(localizedTemplate(match.key, locale), match.params) : path || '/';
  return `${withPrefix(localized, locale)}${rest}`;
}

/**
 * Adresse affichée (`/en/careers/chef-de-cuisine`) → langue et adresse interne (`/recrutement/chef-de-cuisine`),
 * pour comparer avec les liens du contenu (onglet actif, sélecteur de langue).
 */
export function parseSitePath(pathname: string): { locale: Locale; internal: string } {
  const [, first = ''] = pathname.split('/');
  const locale = isLocale(first) ? first : defaultLocale;
  let path = isLocale(first) ? pathname.slice(first.length + 1) || '/' : pathname;
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  const match = matchPattern(path, localizedPatterns[locale]);
  return { locale, internal: match ? fill(match.key, match.params) : path };
}
