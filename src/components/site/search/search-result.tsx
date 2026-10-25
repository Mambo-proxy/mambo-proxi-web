import {
  Briefcase,
  FileText,
  GraduationCap,
  LayoutGrid,
  Newspaper,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/icon';
import { Visual } from '@/components/ui/visual';
import type { SearchResult, SearchResultType, TextRange } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';

const TYPE_ICONS: Record<SearchResultType, LucideIcon> = {
  service: Sparkles,
  category: LayoutGrid,
  page: FileText,
  article: Newspaper,
  job: Briefcase,
  training: GraduationCap,
};

/**
 * Texte avec les passages trouvés surlignés (`<mark>` fond `orange/100`). Les plages de l'API sont des positions
 * UTF-16 : la typographie française n'est appliquée que si elle ne change pas la longueur du texte.
 */
export function Highlight({ text, ranges }: { text: string; ranges: TextRange[] }) {
  const typographic = frenchTypography(text);
  const display = typographic.length === text.length ? typographic : text;
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const { start, end } of [...ranges].sort((a, b) => a.start - b.start)) {
    if (start < cursor || start >= display.length || end <= start) continue;
    if (start > cursor) parts.push(display.slice(cursor, start));
    parts.push(
      <mark key={start} className="rounded-[3px] bg-orange-100 text-text-main">
        {display.slice(start, end)}
      </mark>,
    );
    cursor = Math.min(end, display.length);
  }
  if (cursor < display.length) parts.push(display.slice(cursor));
  return <>{parts}</>;
}

/** Vignette décorative d'un résultat : photo, sinon icône du contenu, sinon icône du type. */
export function ResultThumb({ result, className }: { result: SearchResult; className?: string }) {
  const TypeIcon = TYPE_ICONS[result.type];
  return (
    <span
      aria-hidden
      className={cn(
        'relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-neutral-100 text-neutral-700',
        className,
      )}
    >
      {result.visual ? (
        <Visual visual={{ ...result.visual, alt: '' }} sizes="64px" className="absolute inset-0" />
      ) : result.icon ? (
        <Icon name={result.icon} size={20} />
      ) : (
        <TypeIcon size={20} />
      )}
    </span>
  );
}
