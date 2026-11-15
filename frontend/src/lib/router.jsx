import { useSyncExternalStore } from 'react';

// Routeur minimal (History API) : quelques pages, pas besoin d'une bibliothèque.
// Un « bloqueur » (éditeur avec modifications non enregistrées) peut retenir une navigation.
let current = window.location.pathname + window.location.search;
let blocker = null; // (poursuivre) => void : demande confirmation puis appelle poursuivre()

const emit = () => window.dispatchEvent(new Event('pc-navigate'));

// Bouton retour/avant : l'URL a déjà changé ; si un bloqueur est actif, on la remet et on demande.
window.addEventListener('popstate', () => {
  const target = window.location.pathname + window.location.search;
  if (blocker && target !== current) {
    window.history.pushState(null, '', current);
    blocker(() => {
      blocker = null;
      go(target, {});
    });
    return;
  }
  current = target;
  emit();
});

function go(to, { replace = false, state = null } = {}) {
  // Ouvrir ou fermer le modal d'une publication ne doit pas faire remonter la grille.
  const keepScroll = to.startsWith('/publications') && current.startsWith('/publications');
  window.history[replace ? 'replaceState' : 'pushState'](state, '', to);
  current = to;
  emit();
  if (!keepScroll) window.scrollTo(0, 0);
}

export function navigate(to, options) {
  if (blocker) blocker(() => { blocker = null; go(to, options); });
  else go(to, options);
}

export function setBlocker(fn) {
  blocker = fn;
}

const subscribe = (cb) => {
  window.addEventListener('pc-navigate', cb);
  return () => window.removeEventListener('pc-navigate', cb);
};

export function useLocation() {
  const href = useSyncExternalStore(subscribe, () => current);
  const url = new URL(href, window.location.origin);
  return { path: url.pathname, params: url.searchParams };
}

// Retour après connexion : uniquement un chemin interne (pas de redirection ouverte).
export const safeReturn = (value) => (value && value.startsWith('/') && !value.startsWith('//') ? value : null);

// state : passé à history (ex. { fromGrid: true } pour qu'un modal sache qu'il peut faire « retour »).
export function Link({ to, state, replace, onClick, ...props }) {
  return (
    <a
      href={to}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(to, { state, replace });
      }}
    />
  );
}
