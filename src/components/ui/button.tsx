import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import type { Route } from 'next';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './spinner';

/**
 * Bouton (docs/02 §5, Figma `4:50`) : padding 12/24, rayon 12, gap 8, Inter SemiBold 16/24 → 48 px.
 * La bordure 1,5 px de la variante Outline s'ajoute à la hauteur (51 px), comme dans les maquettes.
 */
export const buttonVariants = cva(
  [
    'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 font-ui font-semibold whitespace-nowrap select-none',
    'transition-[background-color,border-color,color,transform] duration-150 ease-standard active:scale-[0.98]',
    'disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40',
    '[&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-brand-primary text-text-on-primary hover:bg-brand-primary-hover active:bg-brand-primary-pressed',
        outline: 'border-[1.5px] border-border-strong bg-transparent text-text-main hover:bg-neutral-100',
        dark: 'bg-neutral-900 text-neutral-0 hover:bg-neutral-800 focus-visible:focus-ring-inverse',
        whatsapp: 'bg-whatsapp text-neutral-900 hover:bg-whatsapp-hover',
        ghost: 'bg-transparent text-text-main hover:bg-neutral-100',
        danger: 'bg-feedback-error text-neutral-0 hover:opacity-90',
      },
      size: {
        sm: 'px-4 py-2.5 text-[14px] leading-5 tracking-[0.005em] [&_svg]:size-4',
        md: 'px-6 py-3 text-[16px] leading-6 [&_svg]:size-[18px]',
        lg: 'px-6 py-3.5 text-[16px] leading-6 [&_svg]:size-[18px]',
      },
      shape: {
        rounded: 'rounded-md',
        pill: 'rounded-full',
      },
      fullWidth: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md', shape: 'rounded' },
  },
);

type ButtonStyleProps = VariantProps<typeof buttonVariants>;

type ButtonProps = ComponentProps<'button'> &
  ButtonStyleProps & {
    /** Affiche un indicateur de chargement en conservant le libellé ; le bouton est désactivé. */
    loading?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  shape,
  fullWidth,
  loading = false,
  disabled,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, shape, fullWidth }), className)}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

type ExternalHref = `https://${string}` | `mailto:${string}` | `tel:${string}`;

type ButtonLinkProps = Omit<ComponentProps<'a'>, 'href'> &
  ButtonStyleProps & {
    href: Route | ExternalHref;
    children: ReactNode;
  };

/** Lien présenté comme un bouton : `next/link` pour les pages du site, `<a>` pour les liens externes. */
export function ButtonLink({ className, variant, size, shape, fullWidth, href, ...props }: ButtonLinkProps) {
  const classes = cn(buttonVariants({ variant, size, shape, fullWidth }), className);
  if (/^(https:|mailto:|tel:)/.test(href)) {
    const external = href.startsWith('https:');
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...props}
      />
    );
  }
  return <Link href={href as Route} className={classes} {...props} />;
}
