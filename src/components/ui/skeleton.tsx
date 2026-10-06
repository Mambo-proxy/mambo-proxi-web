import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/** Bloc de chargement aux dimensions du contenu attendu. */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return <div aria-hidden className={cn('animate-pulse rounded-md bg-neutral-100', className)} {...props} />;
}
