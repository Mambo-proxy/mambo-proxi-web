'use client';

import { ArrowRight, Search, SearchX, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { SiteLink as Link } from '@/i18n/site-link';
import { chipVariants } from '@/components/ui/chip';
import { Spinner } from '@/components/ui/spinner';
import type { SearchResult } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';
import { routes } from '@/lib/routes';
import { MAX_QUERY_LENGTH, searchPageHref } from './search-href';
import { Highlight, ResultThumb } from './search-result';
import { useOpenResult, useSearchResults } from './use-search-results';

/** Résultats par type dans le panneau (la page de résultats en affiche davantage). */
const PANEL_LIMIT = 3;

type Option = { key: string; href: string; result: SearchResult | null };

type SearchDialogProps = { open: boolean; onClose: () => void };

/**
 * Panneau de recherche globale (non maquetté, même langage que les modales : fond blanc, rayon 28, `elevation/4`) :
 * `<dialog>` natif modal (page inerte, `Échap` ferme, focus rendu au bouton d'origine), plein écran en mobile, centré
 * en haut de l'écran à partir de 768 px.
 * Champ en combobox ARIA (`aria-activedescendant`) : suggestions dès 2 caractères (200 ms après la dernière frappe),
 * groupées par type avec les passages trouvés surlignés. Clavier : `↓` / `↑` parcourent les résultats puis
 * « Voir tous les résultats », `Entrée` ouvre le résultat choisi (ou la page de résultats si aucun n'est choisi),
 * `Échap` ferme. Chargé à la demande (`SiteSearchDialog`).
 */
export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const t = useTranslations('search');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const baseId = useId();
  const listboxId = `${baseId}-resultats`;
  const optionId = (key: string) => `${baseId}-${key}`;
  const [query, setQuery] = useState('');
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const { term, status, data } = useSearchResults(query, { limit: PANEL_LIMIT });
  const openResult = useOpenResult();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
      inputRef.current?.select();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const groups = status === 'idle' ? [] : (data?.groups ?? []);
  const options: Option[] = [
    ...groups.flatMap((group) =>
      group.items.map((result) => ({ key: `${result.type}-${result.id}`, href: result.href, result })),
    ),
    ...(groups.length > 0 ? [{ key: 'tous', href: searchPageHref(term), result: null }] : []),
  ];
  const activeIndex = options.findIndex((option) => option.key === activeKey);
  const active = activeIndex >= 0 ? options[activeIndex] : undefined;

  // Résultat choisi au clavier gardé visible dans la liste.
  useEffect(() => {
    if (activeKey) document.getElementById(`${baseId}-${activeKey}`)?.scrollIntoView({ block: 'nearest' });
  }, [activeKey, baseId]);

  function choose(option: Option) {
    onClose();
    openResult(option.href);
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      // Fermeture directe : sans cela, `Échap` viderait d'abord le champ de recherche (comportement de Chrome).
      event.preventDefault();
      onClose();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (options.length === 0) return;
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      const from = activeIndex === -1 ? (step === 1 ? -1 : options.length) : activeIndex;
      setActiveKey(options[(from + step + options.length) % options.length]?.key ?? null);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (active) choose(active);
      else if (status !== 'idle') choose({ key: 'tous', href: searchPageHref(term), result: null });
    }
  }

  function change(value: string) {
    setQuery(value);
    setActiveKey(null);
  }

  const expanded = options.length > 0;
  const announce =
    status === 'success' && data
      ? data.total === 0
        ? frenchTypography(t('noResultsTitle', { query: term }))
        : t('resultsCount', { count: data.total })
      : status === 'error'
        ? t('error')
        : '';

  return (
    <dialog
      ref={dialogRef}
      data-site-search
      aria-labelledby={`${baseId}-titre`}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Clic sur le voile (en dehors du panneau) : fermeture.
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        'm-0 h-dvh max-h-dvh w-full max-w-full overflow-visible bg-transparent p-0 text-text-main',
        'md:mx-auto md:mt-[10vh] md:h-auto md:max-h-[80vh] md:max-w-[680px]',
        'backdrop:bg-surface-overlay',
        'transition-[opacity,translate,display,overlay] transition-discrete duration-200 ease-standard',
        'not-open:-translate-y-3 not-open:opacity-0 starting:open:-translate-y-3 starting:open:opacity-0',
        'backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-200',
        'not-open:backdrop:opacity-0 starting:open:backdrop:opacity-0',
        'motion-reduce:transition-none motion-reduce:backdrop:transition-none',
      )}
    >
      <div className="flex h-full max-h-[inherit] flex-col overflow-hidden bg-neutral-0 shadow-4 md:rounded-[28px]">
        <h2 id={`${baseId}-titre`} className="sr-only">
          {t('dialogTitle')}
        </h2>
        <form
          role="search"
          onSubmit={(event) => event.preventDefault()}
          className="flex items-center gap-3 border-b border-border-default px-4 py-3 focus-within:border-neutral-900 md:px-6 md:py-4"
        >
          <Search aria-hidden size={22} className="shrink-0 text-icon-default" />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-label={t('label')}
            aria-expanded={expanded}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={active ? optionId(active.key) : undefined}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            maxLength={MAX_QUERY_LENGTH}
            placeholder={t('placeholder')}
            value={query}
            onChange={(event) => change(event.target.value)}
            onKeyDown={onInputKeyDown}
            className="h-11 min-w-0 flex-1 bg-transparent font-ui text-[17px] leading-6 text-text-main outline-none placeholder:text-text-muted [&::-webkit-search-cancel-button]:hidden"
          />
          {status === 'loading' && <Spinner className="text-icon-default" />}
          {query && (
            <button
              type="button"
              onClick={() => {
                change('');
                inputRef.current?.focus();
              }}
              aria-label={t('clear')}
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-icon-default hover:bg-neutral-100"
            >
              <X aria-hidden size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-default text-icon-default hover:bg-neutral-100"
          >
            <X aria-hidden size={20} />
          </button>
        </form>

        <p role="status" className="sr-only">
          {announce}
        </p>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2 md:px-3">
          <div
            id={listboxId}
            role="listbox"
            aria-label={t('resultsLabel')}
            aria-busy={status === 'loading' || undefined}
            className={cn(!expanded && 'hidden')}
          >
            {groups.map((group) => (
              <div
                key={group.type}
                role="group"
                aria-labelledby={optionId(`groupe-${group.type}`)}
                className="pb-1"
              >
                <div
                  role="presentation"
                  id={optionId(`groupe-${group.type}`)}
                  className="flex items-baseline gap-2 px-3 pt-3 pb-1.5 font-ui text-[12px] leading-4 font-semibold tracking-[0.06em] text-text-muted uppercase"
                >
                  {frenchTypography(group.label)}
                  <span className="font-medium tracking-normal normal-case">{group.total}</span>
                </div>
                {group.items.map((result) => {
                  const key = `${result.type}-${result.id}`;
                  const selected = key === active?.key;
                  return (
                    <div
                      key={key}
                      id={optionId(key)}
                      role="option"
                      aria-selected={selected}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseMove={() => !selected && setActiveKey(key)}
                      onClick={() => choose({ key, href: result.href, result })}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-[14px] px-3 py-2.5 transition-colors',
                        selected ? 'bg-neutral-100' : 'hover:bg-neutral-50',
                      )}
                    >
                      <ResultThumb result={result} />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-ui text-[15px] leading-[22px] font-semibold text-text-main">
                          <Highlight text={result.title} ranges={result.titleHighlights} />
                        </span>
                        <span className="truncate font-ui text-[13px] leading-5 text-text-muted">
                          {result.context && <>{frenchTypography(result.context)} · </>}
                          <Highlight text={result.excerpt} ranges={result.highlights} />
                        </span>
                      </span>
                      <ArrowRight
                        aria-hidden
                        size={18}
                        className={cn(
                          'shrink-0 text-text-brand transition-opacity',
                          selected ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
            {groups.length > 0 && (
              <div
                id={optionId('tous')}
                role="option"
                aria-selected={active?.key === 'tous'}
                onMouseDown={(event) => event.preventDefault()}
                onMouseMove={() => active?.key !== 'tous' && setActiveKey('tous')}
                onClick={() => choose({ key: 'tous', href: searchPageHref(term), result: null })}
                className={cn(
                  'mt-1 flex cursor-pointer items-center justify-between gap-3 rounded-[14px] border-t border-border-default px-3 py-3 font-ui text-[14px] leading-5 font-semibold text-text-brand',
                  active?.key === 'tous' ? 'bg-neutral-100' : 'hover:bg-neutral-50',
                )}
              >
                {frenchTypography(t('seeAll', { query: term }))}
                <ArrowRight aria-hidden size={16} className="shrink-0" />
              </div>
            )}
          </div>

          {!expanded && (
            <SearchState
              status={status}
              term={term}
              empty={status === 'success' && data?.total === 0}
              onTry={(value) => {
                change(value);
                inputRef.current?.focus();
              }}
              onContact={onClose}
            />
          )}
        </div>

        <div
          aria-hidden
          className="hidden items-center gap-5 border-t border-border-default px-6 py-3 font-ui text-[12px] leading-4 text-text-muted md:flex"
        >
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            {t('keysNavigate')}
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>{t('keyEnter')}</Kbd>
            {t('keysOpen')}
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>{t('keyEscape')}</Kbd>
            {t('keysClose')}
          </span>
        </div>
      </div>
    </dialog>
  );
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-[6px] border border-border-default bg-neutral-50 px-1 font-ui text-[11px] leading-4 font-semibold text-text-main">
      {children}
    </kbd>
  );
}

type SearchStateProps = {
  status: ReturnType<typeof useSearchResults>['status'];
  term: string;
  empty: boolean;
  onTry: (value: string) => void;
  onContact: () => void;
};

/** États sans liste : invitation (moins de 2 caractères), chargement, erreur, aucun résultat. */
function SearchState({ status, term, empty, onTry, onContact }: SearchStateProps) {
  const t = useTranslations('search');
  if (status === 'loading')
    return (
      <p className="flex items-center gap-2 px-4 py-8 font-ui text-[14px] leading-5 text-text-muted">
        <Spinner />
        {t('loading')}
      </p>
    );
  if (status === 'error')
    return (
      <p className="px-4 py-8 font-ui text-[14px] leading-5 text-feedback-error">
        {frenchTypography(t('error'))}
      </p>
    );
  if (empty)
    return (
      <div className="flex flex-col items-start gap-3 px-4 py-8">
        <span
          aria-hidden
          className="flex size-11 items-center justify-center rounded-[13px] bg-orange-50 text-text-brand"
        >
          <SearchX size={20} />
        </span>
        <p className="font-ui text-[16px] leading-6 font-semibold text-text-main">
          {frenchTypography(t('noResultsTitle', { query: term }))}
        </p>
        <p className="font-ui text-[14px] leading-[21px] text-text-muted">
          {frenchTypography(t('noResultsText'))}
        </p>
        <Link
          href={routes.contact}
          onClick={onContact}
          className="group/cta inline-flex items-center gap-1.5 rounded-xs font-ui text-[14px] leading-5 font-semibold text-text-brand"
        >
          {t('contact')}
          <ArrowRight
            aria-hidden
            size={16}
            className="transition-transform duration-200 group-hover/cta:translate-x-[3px]"
          />
        </Link>
      </div>
    );
  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <div className="flex flex-col gap-1">
        <p className="font-ui text-[16px] leading-6 font-semibold text-text-main">
          {frenchTypography(t('emptyTitle'))}
        </p>
        <p className="font-ui text-[14px] leading-[21px] text-text-muted">
          {frenchTypography(t('emptyText'))}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-ui text-[13px] leading-5 text-text-muted">
          {frenchTypography(t('tryLabel'))}
        </span>
        {(['try1', 'try2', 'try3'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onTry(t(key))}
            className={cn(chipVariants(), 'py-1.5')}
          >
            {t(key)}
          </button>
        ))}
      </div>
    </div>
  );
}
