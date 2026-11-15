import { useEffect, useState } from 'react';
import { api } from './api.js';
import { useAuth } from './auth.jsx';

// Charge path et recharge quand l'utilisateur change (les contenus privés en dépendent). path null : rien à charger.
export function useApi(path) {
  const { user, ready } = useAuth();
  const [state, setState] = useState({ status: 'loading', data: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!ready) return undefined;
    if (!path) {
      setState({ status: 'ready', data: null });
      return undefined;
    }
    let alive = true;
    setState((s) => ({ status: 'loading', data: s.data }));
    api(path)
      .then((data) => alive && setState({ status: 'ready', data }))
      .catch((error) => alive && setState({ status: 'error', data: null, error }));
    return () => { alive = false; };
  }, [path, user?.id, ready, version]);

  return { ...state, reload: () => setVersion((v) => v + 1) };
}
