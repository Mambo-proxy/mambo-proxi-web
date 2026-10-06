import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Indicateur de chargement (décoratif : le libellé du bouton ou `aria-busy` porte l'information). */
export function Spinner({ className, size = 18 }: { className?: string; size?: number }) {
  return <LoaderCircle aria-hidden size={size} className={cn('shrink-0 animate-spin', className)} />;
}
