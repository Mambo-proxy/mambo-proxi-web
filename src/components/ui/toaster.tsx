'use client';

import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import { Toaster as SonnerToaster } from 'sonner';

export { toast } from 'sonner';

/**
 * Notifications éphémères (non maquettées) : carte blanche rayon 16, bordure `border/default`,
 * `elevation/3`, Inter 14/20 ; icône verte (succès) ou rouge (erreur). Annoncées aux lecteurs d'écran.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      closeButton={false}
      icons={{
        success: <CircleCheck aria-hidden size={18} className="text-vert-600" />,
        error: <CircleAlert aria-hidden size={18} className="text-feedback-error" />,
        info: <Info aria-hidden size={18} className="text-icon-default" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex w-full items-start gap-3 rounded-lg border border-border-default bg-neutral-0 px-4 py-3.5 font-ui text-[14px] leading-5 text-text-main shadow-3 md:w-[380px]',
          title: 'font-semibold',
          description: 'text-text-muted',
          icon: 'mt-px',
        },
      }}
    />
  );
}
