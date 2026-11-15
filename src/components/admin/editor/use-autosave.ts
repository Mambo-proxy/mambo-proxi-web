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
  // Dernière valeur enregistrée, lue sans attendre le rendu suivant (enchaînement de deux enregistrements).
  const savedRef = useRef(serialized);
  // Enregistrement en cours : un appel concurrent l'attend puis enregistre la valeur la plus récente.
  const inflight = useRef<Promise<boolean> | null>(null);
  const latest = useRef({ value, serialized, save });
  const [state, setState] = useState<{ savedAt: string | null; pending: boolean; error: boolean }>({
    savedAt: initialSavedAt,
    pending: false,
    error: false,
  });

  useEffect(() => {
    latest.current = { value, serialized, save };
  });

  const dirty = serialized !== saved;

  function markAsSaved(snapshot: string) {
    savedRef.current = snapshot;
    setSaved(snapshot);
  }

  async function run(): Promise<boolean> {
    const { value: current, serialized: snapshot, save: persist } = latest.current;
    if (snapshot === savedRef.current) return true;
    setState((previous) => ({ ...previous, pending: true }));
    try {
      await persist(current);
      markAsSaved(snapshot);
      setState({ savedAt: new Date().toISOString(), pending: false, error: false });
      return true;
    } catch {
      setState((previous) => ({ ...previous, pending: false, error: true }));
      return false;
    }
  }

  /**
   * Enregistre la valeur courante. Si un enregistrement est en cours, l'attend puis enregistre ce qui a été saisi
   * entre-temps : `true` seulement quand la valeur courante est enregistrée.
   */
  async function flush(): Promise<boolean> {
    while (inflight.current) await inflight.current;
    const promise = run();
    inflight.current = promise;
    try {
      return await promise;
    } finally {
      inflight.current = null;
    }
  }

  // `saved` dans les dépendances : une saisie faite pendant un enregistrement relance le minuteur à sa fin.
  useEffect(() => {
    if (!enabled || !dirty) return;
    const timer = window.setTimeout(() => void flush(), delay);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized, saved, enabled, delay]);

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
      markAsSaved(JSON.stringify(next));
      if (savedAt) setState({ savedAt, pending: false, error: false });
    },
  };
}
