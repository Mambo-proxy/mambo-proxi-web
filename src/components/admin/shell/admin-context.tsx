'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { CurrentUser } from '@/lib/api/schema';

type AdminContextValue = {
  user: CurrentUser;
  /** Palette de recherche ⌘K. */
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminContextProvider({ user, children }: { user: CurrentUser; children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <AdminContext.Provider value={{ user, searchOpen, setSearchOpen }}>{children}</AdminContext.Provider>
  );
}

/** Utilisateur connecté et état partagé de la coque du back-office. */
export function useAdmin(): AdminContextValue {
  const value = useContext(AdminContext);
  if (!value) throw new Error('useAdmin doit être utilisé dans la coque du back-office.');
  return value;
}
