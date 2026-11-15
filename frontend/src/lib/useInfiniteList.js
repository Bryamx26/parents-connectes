import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';
import { useAuth } from './auth.jsx';

// Liste paginée par l'API (page, limit), chargée page après page.
// Repart de zéro quand la requête ou l'utilisateur change ; ignore les doublons.
export function useInfiniteList(path, query, limit = 24) {
  const { user, ready } = useAuth();
  const [state, setState] = useState({ items: [], page: 0, done: false, status: 'idle', error: null });
  const stateRef = useRef(state);
  stateRef.current = state;
  const busy = useRef(false);
  const generation = useRef(0); // change à chaque reset : les réponses d'une ancienne requête sont ignorées

  const loadMore = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    const gen = generation.current;
    setState((s) => ({ ...s, status: 'loading', error: null }));
    try {
      const page = (stateRef.current.page || 0) + 1;
      const rows = await api(`${path}?${query}&limit=${limit}&page=${page}`);
      if (gen !== generation.current) return;
      setState((s) => {
        const known = new Set(s.items.map((i) => i.id));
        return { items: [...s.items, ...rows.filter((r) => !known.has(r.id))], page, done: rows.length < limit, status: 'ready', error: null };
      });
    } catch (error) {
      if (gen === generation.current) setState((s) => ({ ...s, status: 'error', error }));
    } finally {
      if (gen === generation.current) busy.current = false;
    }
  }, [path, query, limit]);

  const reset = useCallback(() => {
    generation.current += 1;
    busy.current = false;
    stateRef.current = { items: [], page: 0, done: false, status: 'idle', error: null };
    setState(stateRef.current);
    loadMore();
  }, [loadMore]);

  useEffect(() => {
    if (ready) reset();
  }, [ready, user?.id, reset]);

  return { ...state, loadMore, reset };
}
