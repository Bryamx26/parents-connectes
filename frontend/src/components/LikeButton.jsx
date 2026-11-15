import { useState } from 'react';
import Icon from './Icon.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { Link } from '../lib/router.jsx';

// J'aime d'une publication : le cœur se remplit tout de suite, puis l'API confirme le compte.
export default function LikeButton({ publication }) {
  const { user } = useAuth();
  const [state, setState] = useState({ liked: !!publication.liked, count: publication.like_count ?? 0 });
  const [busy, setBusy] = useState(false);
  const label = `J'aime${state.count ? ` · ${state.count}` : ''}`;

  if (!user) {
    return (
      <Link className="pc-action" to={`/connexion?retour=/publications/${publication.id}`} aria-label={`${label}, connectez-vous pour aimer`}>
        <Icon name="heart" /> {label}
      </Link>
    );
  }

  async function toggle() {
    const liked = !state.liked;
    const before = state;
    setState({ liked, count: state.count + (liked ? 1 : -1) });
    setBusy(true);
    try {
      const res = await api(`/publications/${publication.id}/like`, { method: liked ? 'PUT' : 'DELETE' });
      setState({ liked: res.liked, count: res.like_count });
    } catch {
      setState(before);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className={state.liked ? 'pc-action pc-action--liked' : 'pc-action'} type="button"
      aria-pressed={state.liked} disabled={busy} onClick={toggle}>
      <Icon name="heart" /> {label}
    </button>
  );
}
