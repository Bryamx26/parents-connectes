import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // ready : on sait si une session existe (évite d'afficher « Connexion » une fraction de seconde)
  const [state, setState] = useState({ user: null, ready: !getToken() });

  useEffect(() => {
    if (getToken()) {
      api('/auth/me')
        .then((user) => setState({ user, ready: true }))
        .catch(() => setState({ user: null, ready: true }));
    }
    const expired = () => setState({ user: null, ready: true });
    window.addEventListener('pc-session-expired', expired);
    return () => window.removeEventListener('pc-session-expired', expired);
  }, []);

  const value = {
    ...state,
    signIn({ token, user }) {
      setToken(token);
      setState({ user, ready: true });
    },
    signOut() {
      setToken(null);
      setState({ user: null, ready: true });
    },
    canEdit: (item) => !!state.user && (state.user.role === 'admin' || state.user.id === item.user_id),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
