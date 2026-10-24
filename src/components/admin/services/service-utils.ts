import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import type {
  AdminCategory,
  CategoryRef,
  PublishStatus,
  ServiceFields,
  ServicePatch,
} from '@/lib/api/schema';

/** Clés de cache TanStack Query du domaine. */
export const servicesKey = ['admin-services'] as const;
export const categoriesKey = ['admin-categories'] as const;
export const serviceKey = (id: string) => ['admin-service', id] as const;

/**
 * Rubrique telle que décrite par le contrat : la génération des types perd les champs `required` ajoutés par
 * `allOf` (`name`, `slug`, `status` deviennent facultatifs dans `AdminCategory`).
 */
export type Category = AdminCategory & { name: string; slug: string; status: PublishStatus };

export const fetchCategories = () => data(browserApi.GET('/v1/admin/categories')) as Promise<Category[]>;

/**
 * Corps d'écriture d'un service : `ServiceInput` / `ServicePatch` sont générés comme `ServiceFields &
 * Record<string, never>` (l'`allOf` avec `required` / `minProperties` est mal traduit), d'où la conversion.
 */
export const serviceBody = (fields: ServiceFields) => fields as ServicePatch;

/** Libellés courts des rubriques dans les onglets et le tableau (maquette : « Proximité »). */
const SHORT_CATEGORY: Record<string, string> = { 'services-de-proximite': 'Proximité' };

/** Onglets seulement (maquette refondue : « À domicile », mais « Services à domicile » dans le tableau). */
const SHORT_TAB: Record<string, string> = { 'services-a-domicile': 'À domicile' };

export function categoryLabel(
  category: Pick<CategoryRef, 'slug' | 'name'>,
  context: 'tab' | 'cell' = 'cell',
): string {
  return (
    (context === 'tab' ? SHORT_TAB[category.slug] : undefined) ??
    SHORT_CATEGORY[category.slug] ??
    category.name
  );
}

/** Suffixe du titre pour Google proposé par défaut (« Visites guidées de Douala | MAMBO Proxi »). */
export const SEO_TITLE_SUFFIX = ' | MAMBO Proxi';

export const TAGLINE_MAX = 120;
export const SUMMARY_MAX = 240;
export const SEO_TITLE_MAX = 60;
export const SEO_DESCRIPTION_MAX = 160;

export function defaultSeoTitle(name: string): string {
  return name.trim() ? `${name.trim()}${SEO_TITLE_SUFFIX}`.slice(0, SEO_TITLE_MAX) : '';
}

/** Adresse de page à partir d'un nom (« Visites guidées de Douala » → `visites-guidees-de-douala`). */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

/**
 * Valeur suivante d'un champ dérivé (adresse, titre et description SEO) : il suit sa source tant qu'il n'a pas été
 * modifié à la main, c'est-à-dire tant qu'il est vide ou égal à la valeur calculée à partir de l'ancienne source.
 */
export function follow(current: string, previousDerived: string, nextDerived: string): string {
  return !current.trim() || current === previousDerived ? nextDerived : current;
}

/**
 * Nouvel ordre complet d'une rubrique après un déplacement dans une partie de la liste (page affichée) :
 * les éléments de `before` sont remplacés, à leur place, par ceux de `after`.
 */
export function spliceOrder<T extends { id: string }>(full: T[], before: T[], after: T[]): T[] {
  const start = full.findIndex((item) => item.id === before[0]?.id);
  if (start < 0) return full;
  const next = [...full];
  next.splice(start, before.length, ...after);
  return next;
}

/** Suites consécutives d'éléments d'une même rubrique (une liste réordonnable par suite). */
export function runsByCategory<T extends { category: { slug: string } }>(items: T[]): T[][] {
  const runs: T[][] = [];
  for (const item of items) {
    const last = runs.at(-1);
    if (last && last[0]!.category.slug === item.category.slug) last.push(item);
    else runs.push([item]);
  }
  return runs;
}
