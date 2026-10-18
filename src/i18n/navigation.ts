import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/** Liens et navigation du site public : préfixe de langue et adresses traduites ajoutés automatiquement. */
export const { Link, redirect, permanentRedirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
