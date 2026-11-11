import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import { postArt } from '../illustrations.js';

function when(date) {
  const days = Math.floor((Date.now() - new Date(date)) / 864e5);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  return `Il y a ${days} jours`;
}

function Post({ post }) {
  const [liked, setLiked] = useState(false);
  const art = postArt[post.icon];
  return (
    <article className="pc-post">
      <div className="pc-post__author">
        <span className="pc-avatar"><Icon name="family" size="sm" /></span>
        <div>
          <div className="pc-post__name">Parents Connectés</div>
          <div className="pc-post__meta">{when(post.createdAt)} · {post.ageRange}</div>
        </div>
        <button className="pc-icon-btn" type="button" aria-label="Plus d'options"><Icon name="more" /></button>
      </div>
      {art ? (
        <div className={`pc-post__media pc-post__media--${post.theme}`}>
          <img src={art.src} alt={art.alt} width="320" height="200" loading="lazy" />
        </div>
      ) : (
        <div className={`pc-post__media pc-post__media--illus pc-post__media--${post.theme}`}>
          <Icon name={post.icon} size="xl" />
        </div>
      )}
      <h3 className={`pc-pill-title pc-pill-title--${post.theme}`}>{post.title}</h3>
      <p className="pc-post__text">{post.body}</p>
      <div className="pc-post__actions">
        <button
          className={liked ? 'pc-action pc-action--liked' : 'pc-action'}
          type="button" aria-pressed={liked} onClick={() => setLiked(!liked)}
        >
          <Icon name="heart" /> J'aime
        </button>
        <button className="pc-action" type="button"><Icon name="comment" /> Commenter</button>
        <button className="pc-action pc-action--end" type="button" aria-label="Partager ou enregistrer"><Icon name="more" /></button>
      </div>
    </article>
  );
}

export default function Feed() {
  const [state, setState] = useState({ status: 'loading', posts: [] });

  function load() {
    setState({ status: 'loading', posts: [] });
    fetch('/api/posts')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((posts) => setState({ status: 'ready', posts }))
      .catch(() => setState({ status: 'error', posts: [] }));
  }

  useEffect(load, []);

  return (
    <section className="pc-section" aria-labelledby="fil-titre">
      <div className="pc-section__head">
        <Icon name="send" size="lg" />
        <h2 className="pc-section__title" id="fil-titre">Fil d'actualités</h2>
        <span className="pc-section__aside">Des idées, des conseils, pour le quotidien !</span>
      </div>

      {state.status === 'loading' && (
        <div className="pc-feed" aria-busy="true" aria-label="Chargement des publications">
          <div className="pc-skeleton" /><div className="pc-skeleton" /><div className="pc-skeleton" />
        </div>
      )}

      {state.status === 'error' && (
        <div className="pc-feed-message" role="alert">
          <p>Le fil n'a pas pu se charger. Vérifiez votre connexion puis réessayez.</p>
          <button className="pc-btn pc-btn--soft" type="button" onClick={load}>Réessayer</button>
        </div>
      )}

      {state.status === 'ready' && state.posts.length === 0 && (
        <div className="pc-feed-message">
          <p>Pas encore de publication. Revenez bientôt, de nouvelles idées arrivent !</p>
        </div>
      )}

      {state.status === 'ready' && state.posts.length > 0 && (
        <div className="pc-feed">
          {state.posts.map((post) => <Post key={post.id} post={post} />)}
        </div>
      )}
    </section>
  );
}
