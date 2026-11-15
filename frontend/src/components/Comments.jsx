import { useState } from 'react';
import Icon from './Icon.jsx';
import { LoadError } from './States.jsx';
import { api } from '../lib/api.js';
import { useApi } from '../lib/useApi.js';
import { useAuth } from '../lib/auth.jsx';
import { Link } from '../lib/router.jsx';
import { when } from '../lib/format.js';

// Commentaires sous une publication : liste du plus ancien au plus récent, puis le champ pour écrire.
export default function Comments({ publicationId }) {
  const { user, canEdit } = useAuth();
  const comments = useApi(`/publications/${publicationId}/comments`);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const list = comments.data ?? [];

  async function send(e) {
    e.preventDefault();
    if (!content.trim()) return setError('Écrivez quelques mots avant d’envoyer.');
    setSending(true);
    setError(null);
    try {
      await api(`/publications/${publicationId}/comments`, { method: 'POST', body: { content } });
      setContent('');
      comments.reload();
    } catch (err) {
      setError(err.fields?.content || err.message);
    } finally {
      setSending(false);
    }
  }

  async function remove(id) {
    try {
      await api(`/comments/${id}`, { method: 'DELETE' });
      comments.reload();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="pc-comments" aria-labelledby={`commentaires-${publicationId}`}>
      <h3 className="pc-comments__title" id={`commentaires-${publicationId}`}>
        <Icon name="comment" size="sm" /> Commentaires{list.length > 0 && ` (${list.length})`}
      </h3>

      {comments.status === 'error' && <LoadError onRetry={comments.reload}>Les commentaires n'ont pas pu se charger.</LoadError>}
      {comments.status === 'loading' && !comments.data && <div className="pc-skeleton pc-comments__skeleton" aria-busy="true" aria-label="Chargement des commentaires" />}
      {comments.status === 'ready' && list.length === 0 && <p className="pc-comments__empty">Pas encore de commentaire : laissez le premier mot doux.</p>}

      {list.length > 0 && (
        <ul className="pc-comments__list">
          {list.map((c) => (
            <li key={c.id} className="pc-comment">
              <div className="pc-comment__head">
                <span className="pc-post__name">{c.author_name}</span>
                <time className="pc-post__meta" dateTime={c.created_at}>{when(c.created_at)}</time>
                {canEdit(c) && (
                  <button className="pc-action pc-action--end" type="button" onClick={() => remove(c.id)}
                    aria-label={`Supprimer le commentaire de ${c.author_name}`}><Icon name="close" size="sm" /></button>
                )}
              </div>
              <p className="pc-text pc-comment__text">{c.content}</p>
            </li>
          ))}
        </ul>
      )}

      {user ? (
        <form className="pc-comments__form" onSubmit={send} noValidate>
          <label className="pc-field__label" htmlFor={`commentaire-${publicationId}`}>Votre commentaire</label>
          <div className="pc-comments__row">
            <textarea id={`commentaire-${publicationId}`} className="pc-input pc-comments__input" rows={2} maxLength={2000}
              value={content} onChange={(e) => setContent(e.target.value)} aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? `commentaire-${publicationId}-error` : undefined} />
            <button className="pc-btn" type="submit" disabled={sending} aria-label="Envoyer le commentaire">
              <Icon name="send" size="sm" />
            </button>
          </div>
          {error && <p className="pc-field__error" id={`commentaire-${publicationId}-error`} role="alert"><Icon name="close" size="sm" /> {error}</p>}
        </form>
      ) : (
        <p className="pc-comments__empty">
          <Link to={`/connexion?retour=/publications/${publicationId}`}>Connectez-vous</Link> pour laisser un commentaire.
        </p>
      )}
    </section>
  );
}
