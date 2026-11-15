import { useState } from 'react';
import Modal from './Modal.jsx';
import Carousel from './Carousel.jsx';
import Icon from './Icon.jsx';
import PublicationForm from './PublicationForm.jsx';
import LikeButton from './LikeButton.jsx';
import Comments from './Comments.jsx';
import { Loading, LoadError } from './States.jsx';
import { api } from '../lib/api.js';
import { useApi } from '../lib/useApi.js';
import { useAuth } from '../lib/auth.jsx';
import { useConfirm } from '../lib/confirm.jsx';
import { Link } from '../lib/router.jsx';
import { when } from '../lib/format.js';

// Détail d'une publication (URL /publications/:id) : carrousel à gauche (en haut sur mobile), texte à droite.
export default function PublicationModal({ id, onClose, onChanged }) {
  const { canEdit } = useAuth();
  const confirm = useConfirm();
  const publication = useApi(`/publications/${id}`);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);

  async function remove() {
    const ok = await confirm({ title: 'Supprimer cette publication ?', message: 'Ses photos seront supprimées aussi.', confirmLabel: 'Supprimer' });
    if (!ok) return;
    try {
      await api(`/publications/${id}`, { method: 'DELETE' });
      onChanged();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }

  let body;
  if (publication.status === 'loading' && !publication.data) body = <Loading label="Chargement de la publication" count={1} />;
  else if (publication.status === 'error') {
    body = publication.error.status === 404
      ? <LoadError>Cette publication n'existe pas ou n'est pas visible.</LoadError>
      : <LoadError onRetry={publication.reload} />;
  } else if (editing) {
    body = (
      <PublicationForm item={publication.data} onCancel={() => setEditing(false)}
        onSaved={() => { setEditing(false); publication.reload(); onChanged(); }} />
    );
  } else {
    const p = publication.data;
    body = (
      <article className={`pc-publication ${p.images.length ? '' : 'pc-publication--text'}`}>
        {p.images.length > 0 && (
          <div className="pc-publication__media"><Carousel images={p.images} label={`Photos de « ${p.title} »`} /></div>
        )}
        <div className="pc-publication__info">
          <div className="pc-post__author">
            <span className="pc-avatar"><Icon name="family" size="sm" /></span>
            <div>
              <div className="pc-post__name">{p.author_name}</div>
              <div className="pc-post__meta"><time dateTime={p.created_at}>{when(p.created_at)}</time></div>
            </div>
            {p.visibility === 'private' && <span className="pc-badge pc-badge--yellow"><Icon name="user" /> Privé</span>}
          </div>
          <h2 className="pc-publication__title" id="publication-titre">{p.title}</h2>
          <p className="pc-text">{p.content}</p>
          {p.activity && (
            <p className="pc-publication__activity">
              <Icon name="puzzle" size="sm" /> Activité : <Link to={`/activites/${p.activity.id}`}>{p.activity.title}</Link>
            </p>
          )}
          {error && <p className="pc-alert" role="alert"><Icon name="question" /> {error}</p>}
          <div className="pc-post__actions">
            <LikeButton publication={p} />
            {canEdit(p) && (
              <>
                <button className="pc-action" type="button" onClick={() => setEditing(true)}><Icon name="sparkle" /> Modifier</button>
                <button className="pc-action pc-action--end" type="button" onClick={remove}><Icon name="close" /> Supprimer</button>
              </>
            )}
          </div>
          <Comments publicationId={p.id} />
        </div>
      </article>
    );
  }

  return (
    <Modal onClose={onClose} labelledBy={editing ? 'publication-form-titre' : 'publication-titre'}>
      {body}
    </Modal>
  );
}
