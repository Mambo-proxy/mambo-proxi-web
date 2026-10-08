'use client';

import { useEffect, useRef, useState } from 'react';

type AutosaveOptions<T> = {
  /** Valeur courante du formulaire (comparée par sérialisation JSON). */
  value: T;
  /** Enregistrement (PATCH du brouillon) ; une seule requête à la fois. */
  save: (value: T) => Promise<unknown>;
  /** Désactivé tant que le contenu n'existe pas encore côté API (création) ou pendant la publication. */
  enabled?: boolean;
  /** Délai d'inactivité avant l'enregistrement (défaut : 1,5 s). */
  delay?: number;
  /** Date du dernier enregistrement connu (`updatedAt` de l'API). */
  initialSavedAt?: string | null;
};

/**
 * Sauvegarde automatique d'un éditeur (« Dernière sauvegarde automatique il y a 1 min ») : enregistre la valeur
 * après une pause de saisie, sans requêtes concurrentes, et prévient avant de quitter la page avec des
 * modifications non enregistrées.
 */
export function useAutosave<T>({
  value,
  save,
  enabled = true,
  delay = 1500,
  initialSavedAt = null,
}: AutosaveOptions<T>) {
  const serialized = JSON.stringify(value);
  const [saved, setSaved] = useState(serialized);
  const saving = useRef(false);
  const latest = useRef({ value, serialized, save, saved: serialized });
  const [state, setState] = useState<{ savedAt: string | null; pending: boolean; error: boolean }>({
    savedAt: initialSavedAt,
    pending: false,
    error: false,
  });

  useEffect(() => {
    latest.current = { value, serialized, save, saved };
  });

  const dirty = serialized !== saved;

  async function flush(): Promise<boolean> {
    const { value: current, serialized: snapshot, save: run, saved: lastSaved } = latest.current;
    if (saving.current || snapshot === lastSaved) return snapshot === lastSaved;
    saving.current = true;
    setState((previous) => ({ ...previous, pending: true }));
    try {
      await run(current);
      setSaved(snapshot);
      setState({ savedAt: new Date().toISOString(), pending: false, error: false });
      return true;
    } catch {
      setState((previous) => ({ ...previous, pending: false, error: true }));
      return false;
    } finally {
      saving.current = false;
    }
  }

  useEffect(() => {
    if (!enabled || !dirty) return;
    const timer = window.setTimeout(() => void flush(), delay);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized, enabled, delay]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  return {
    ...state,
    dirty,
    /** Enregistre immédiatement (bouton « Enregistrer », avant publication). */
    flush,
    /** Valeur enregistrée côté API à l'initialisation ou après un rechargement. */
    markSaved: (next: T, savedAt?: string) => {
      setSaved(JSON.stringify(next));
      if (savedAt) setState({ savedAt, pending: false, error: false });
    },
  };
}
