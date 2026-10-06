import type { ReactNode } from 'react';

/**
 * Texte dont la maquette mobile (< 768 px) propose une version raccourcie (champs `…Mobile` du contrat).
 * Sans version mobile, le texte principal est affiché partout.
 */
export function ResponsiveText({ desktop, mobile }: { desktop: ReactNode; mobile?: ReactNode | null }) {
  if (mobile === null || mobile === undefined || mobile === desktop) return <>{desktop}</>;
  return (
    <>
      <span className="md:hidden">{mobile}</span>
      <span className="max-md:hidden">{desktop}</span>
    </>
  );
}
