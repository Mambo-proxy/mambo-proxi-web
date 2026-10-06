import { Fragment } from 'react';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';

type AccentTextProps = {
  /** Texte au format `AccentText` du contrat : la partie entre `==…==` est mise en avant. */
  text: string;
  /** Classe de la partie mise en avant (par défaut : orange texte `#AD5300`, même graisse). */
  accentClassName?: string;
};

/** Découpe `Un titre ==mis en avant==` en segments `{ text, accent }`. */
export function parseAccentText(text: string): { text: string; accent: boolean }[] {
  return text
    .split(/(==[^=]+==)/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith('==') && part.endsWith('==') && part.length > 4
        ? { text: part.slice(2, -2), accent: true }
        : { text: part, accent: false },
    );
}

/** Affiche un texte avec ses mots mis en avant et la typographie française (insécables). */
export function AccentText({ text, accentClassName }: AccentTextProps) {
  return parseAccentText(text).map((segment, index) =>
    segment.accent ? (
      <span key={index} className={cn('text-text-brand', accentClassName)}>
        {frenchTypography(segment.text)}
      </span>
    ) : (
      <Fragment key={index}>{frenchTypography(segment.text)}</Fragment>
    ),
  );
}
