'use client';

import { ArrowRight, Check, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { SiteLink as Link, useSiteRouter } from '@/i18n/site-link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { cn } from '@/lib/cn';

export type FinderService = { slug: string; name: string; href: string };
export type FinderCategory = { slug: string; name: string; href: string; services: FinderService[] };

type Option = FinderService & { category: FinderCategory };

/** Recherche insensible aux accents, à la casse et à la ponctuation (« Déco » trouve « decouverte »). */
function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[-’'&+,]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

/**
 * « Trouver mon service » (accueil, sous le héros ; écran non maquetté, dans le langage des cartes du site) :
 * puces des rubriques, puis un seul champ à saisie libre dont les suggestions sont groupées par rubrique
 * (combobox ARIA, modèle de la recherche de quartier), puis « C'est parti ».
 *
 * Action principale : la fiche du service choisi (ou la page de la rubrique si seule une rubrique est choisie) —
 * on y découvre le service avant de s'engager. Action secondaire : « Demander un devis », avec le service
 * (`/devis?service=`) ou la rubrique (`/devis?rubrique=`) présélectionnés. Les données viennent du méga-menu déjà
 * chargé côté serveur : aucun appel réseau ici.
 */
export function ServiceFinder({ categories }: { categories: FinderCategory[] }) {
  const t = useTranslations('home.finder');
  const router = useSiteRouter();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Option | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [missing, setMissing] = useState(false);

  const category = categories.find((item) => item.slug === categorySlug) ?? null;

  // Suggestions : services de la rubrique choisie (ou de toutes), filtrés par la saisie (nom du service ou de la
  // rubrique) ; tant que le champ affiche le service choisi, toute la liste reste proposée.
  const groups = useMemo(() => {
    const needle = selected && query === selected.name ? '' : normalize(query);
    return (category ? [category] : categories)
      .map((item) => ({
        category: item,
        options: item.services
          .filter(
            (service) =>
              !needle || normalize(service.name).includes(needle) || normalize(item.name).includes(needle),
          )
          .map((service): Option => ({ ...service, category: item })),
      }))
      .filter((group) => group.options.length > 0);
  }, [categories, category, query, selected]);
  const options = useMemo(() => groups.flatMap((group) => group.options), [groups]);

  const listId = `${id}-suggestions`;
  const optionId = (index: number) => `${listId}-${index}`;
  const showList = open && options.length > 0;
  // Aucune suggestion : message dans le flux (il ne recouvre pas les boutons), même champ quitté.
  const noMatch = options.length === 0 && query.trim() !== '';

  // Option active toujours visible dans la liste déroulante.
  useEffect(() => {
    if (showList) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, showList, listId]);

  function choose(option: Option) {
    setSelected(option);
    setQuery(option.name);
    setOpen(false);
    setMissing(false);
  }

  function chooseCategory(slug: string | null) {
    setCategorySlug(slug);
    setActive(0);
    setMissing(false);
    // Un service d'une autre rubrique ne reste pas sélectionné.
    if (slug && selected && selected.category.slug !== slug) {
      setSelected(null);
      setQuery('');
    }
  }

  function launch(event: FormEvent) {
    event.preventDefault();
    const destination = selected?.href ?? category?.href;
    if (destination) {
      router.push(destination);
      return;
    }
    setMissing(true);
    inputRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!options.length) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      if (!showList) {
        setOpen(true);
        setActive(step === 1 ? 0 : options.length - 1);
        return;
      }
      setActive((index) => (index + step + options.length) % options.length);
    } else if (event.key === 'Home' && showList) {
      event.preventDefault();
      setActive(0);
    } else if (event.key === 'End' && showList) {
      event.preventDefault();
      setActive(options.length - 1);
    } else if (event.key === 'Enter' && showList) {
      // Liste ouverte : Entrée choisit la suggestion active ; liste fermée : Entrée lance (envoi du formulaire).
      event.preventDefault();
      const option = options[active];
      if (option) choose(option);
    } else if (event.key === 'Escape') {
      if (showList) setOpen(false);
      else {
        setQuery('');
        setSelected(null);
      }
    }
  }

  const quoteHref = selected
    ? `/devis?service=${selected.slug}`
    : category
      ? `/devis?rubrique=${category.slug}`
      : '/devis';
  let index = -1;

  return (
    <section aria-labelledby={`${id}-titre`} className="bg-neutral-50 pb-12 xl:pb-20">
      <div className="container-site">
        <form
          role="search"
          aria-labelledby={`${id}-titre`}
          onSubmit={launch}
          className="flex min-w-0 flex-col gap-5 rounded-[28px] border border-border-default bg-neutral-0 p-5 shadow-3 md:gap-6 md:p-7 xl:p-8"
        >
          <div className="flex flex-col gap-1.5">
            <h2
              id={`${id}-titre`}
              className="font-brand text-[24px] leading-[30px] font-semibold tracking-[-0.01em] text-text-main md:text-[28px] md:leading-9"
            >
              {t('title')}
            </h2>
            <p className="font-ui text-[15px] leading-6 text-text-muted md:text-[16px]">{t('lead')}</p>
          </div>

          {/* Rubriques : défilement horizontal en mobile (dans le bloc, jamais la page), sur plusieurs lignes ensuite. */}
          <div
            role="group"
            aria-label={t('categories')}
            className="-mx-5 flex [scrollbar-width:none] gap-2 overflow-x-auto px-5 py-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
          >
            <Chip selected={!category} onClick={() => chooseCategory(null)}>
              {t('allCategories')}
            </Chip>
            {categories.map((item) => (
              <Chip
                key={item.slug}
                selected={item.slug === categorySlug}
                onClick={() => chooseCategory(item.slug === categorySlug ? null : item.slug)}
              >
                {item.name}
              </Chip>
            ))}
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="relative flex min-w-0 flex-1 flex-col gap-2">
              <label
                htmlFor={`${id}-champ`}
                className="font-ui text-[14px] leading-5 font-semibold text-text-main"
              >
                {t('serviceLabel')}
              </label>
              <div className="flex items-center gap-2.5 rounded-md border border-border-strong bg-neutral-0 px-4 py-3.5 leading-[18px] focus-within:focus-ring">
                <Search aria-hidden size={18} className="shrink-0 text-icon-default" />
                <input
                  ref={inputRef}
                  id={`${id}-champ`}
                  type="text"
                  role="combobox"
                  aria-expanded={showList}
                  aria-controls={listId}
                  aria-autocomplete="list"
                  aria-activedescendant={showList ? optionId(active) : undefined}
                  aria-invalid={missing || undefined}
                  aria-describedby={missing ? `${id}-erreur` : undefined}
                  autoComplete="off"
                  enterKeyHint="go"
                  placeholder={t('placeholder')}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSelected(null);
                    setActive(0);
                    setOpen(true);
                    setMissing(false);
                  }}
                  onFocus={() => setOpen(true)}
                  onClick={() => setOpen(true)}
                  onKeyDown={onKeyDown}
                  onBlur={() => setOpen(false)}
                  className="min-w-0 flex-1 bg-transparent font-ui text-[15px] leading-[18px] text-text-main outline-none placeholder:text-text-muted"
                />
              </div>
              <div
                id={listId}
                role="listbox"
                aria-label={t('suggestions')}
                hidden={!showList}
                className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-[320px] overflow-y-auto overscroll-contain rounded-md border border-border-default bg-neutral-0 p-1.5 shadow-3"
              >
                {showList &&
                  groups.map((group) => (
                    <div
                      key={group.category.slug}
                      role="group"
                      aria-labelledby={`${listId}-${group.category.slug}`}
                      className="flex flex-col gap-0.5 py-1"
                    >
                      <div
                        id={`${listId}-${group.category.slug}`}
                        role="presentation"
                        className="px-3 pt-1 pb-0.5 font-ui text-[12px] leading-4 font-semibold tracking-[0.04em] text-text-muted uppercase"
                      >
                        {group.category.name}
                      </div>
                      {group.options.map((option) => {
                        index += 1;
                        const current = index;
                        const isSelected = selected?.slug === option.slug;
                        return (
                          <div
                            key={option.slug}
                            id={optionId(current)}
                            role="option"
                            aria-selected={isSelected}
                            onPointerDown={(event) => {
                              // Garde le focus dans le champ : la liste ne se ferme pas avant le choix.
                              event.preventDefault();
                              choose(option);
                            }}
                            onPointerMove={() => setActive(current)}
                            className={cn(
                              'flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2.5 font-ui text-[14px] leading-5 text-text-main',
                              current === active && 'bg-neutral-100',
                            )}
                          >
                            <span className="min-w-0 flex-1">{option.name}</span>
                            {isSelected && (
                              <Check aria-hidden size={16} className="shrink-0 text-text-brand" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
              </div>
            </div>
            <Button type="submit" className="group/cta max-md:w-full">
              {t('launch')}
              <ArrowRight
                aria-hidden
                className="transition-transform duration-200 group-hover/cta:translate-x-[3px]"
              />
            </Button>
            <Link
              href={quoteHref}
              className={cn(buttonVariants({ variant: 'outline' }), 'bg-neutral-0 max-md:w-full')}
            >
              {t('quote')}
            </Link>
          </div>
          {noMatch && (
            <p className="flex flex-wrap gap-x-2 gap-y-1 font-ui text-[14px] leading-5 text-text-main">
              <span className="min-w-0 break-words">{t('noMatch', { query: query.trim() })}</span>
              <Link href="/services" className="font-semibold text-text-brand underline underline-offset-2">
                {t('browseAll')}
              </Link>
            </p>
          )}

          <p role="status" className="sr-only">
            {open ? t('results', { count: options.length }) : ''}
          </p>
          {missing && (
            <p
              id={`${id}-erreur`}
              role="alert"
              className="-mt-2 font-ui text-[14px] leading-5 text-feedback-error"
            >
              {t('missing')}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
