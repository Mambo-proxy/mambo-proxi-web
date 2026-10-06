import { Minus, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { frenchTypography } from '@/lib/format/typography';

export type AccordionItem = { question: string; answer: ReactNode };

type AccordionProps = {
  items: AccordionItem[];
  /** Nom partagé : un seul élément ouvert à la fois (comportement natif de `<details name>`). */
  name?: string;
  className?: string;
};

/**
 * Accordéon FAQ (fiche service) : élément bordure basse `border/default`, py 20 ;
 * question Inter SemiBold 16/24 + icône 20 (`plus` fermé, `minus` ouvert) ; réponse Inter 15/24 `text/muted`.
 * Basé sur `<details>` : clavier, lecteurs d'écran et recherche dans la page natifs, sans JavaScript.
 */
export function Accordion({ items, name, className }: AccordionProps) {
  return (
    <div className={cn('border-t border-border-default', className)}>
      {items.map((item) => (
        <details key={item.question} name={name} className="group border-b border-border-default">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-ui text-[16px] leading-6 font-semibold text-text-main [&::-webkit-details-marker]:hidden">
            {frenchTypography(item.question)}
            <Plus aria-hidden size={20} className="shrink-0 text-icon-default group-open:hidden" />
            <Minus aria-hidden size={20} className="hidden shrink-0 text-icon-default group-open:block" />
          </summary>
          <div className="pb-5 font-ui text-[15px] leading-6 text-text-muted">
            {typeof item.answer === 'string' ? frenchTypography(item.answer) : item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
