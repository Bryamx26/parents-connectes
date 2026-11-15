import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';
import PublicationTile, { TileSkeletons } from '../components/PublicationTile.jsx';
import PublicationModal from '../components/PublicationModal.jsx';
import PublicationForm from '../components/PublicationForm.jsx';
import { Chip } from '../components/Chip.jsx';
import { Empty, LoadError } from '../components/States.jsx';
import { useAuth } from '../lib/auth.jsx';
import { useInfiniteList } from '../lib/useInfiniteList.js';
import { Link, navigate } from '../lib/router.jsx';

// Grille de publications ; /publications/:id ouvre le modal par-dessus la grille.
export default function PublicationsPage({ openId }) {
  const { user } = useAuth();
  const [mine, setMine] = useState(false);
  const [creating, setCreating] = useState(false);
  const list = useInfiniteList('/publications', mine && user ? 'mine=true' : 'sort=created_at');
  const sentinel = useRef(null);
  const { loadMore, done, status } = list;

  // Charge la page suivante à l'approche du bas de la grille.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || done || status !== 'ready') return undefined;
    const observer = new IntersectionObserver((entries) => entries[0].isIntersecting && loadMore(), { rootMargin: '400px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, done, status]);

  // Fermer le modal : « retour » s'il a été ouvert depuis la grille, sinon remplacer l'URL (lien partagé).
  function closeModal() {
    if (window.history.state?.fromGrid) window.history.back();
    else navigate('/publications', { replace: true });
  }

  const empty = status === 'ready' && list.items.length === 0;
  return (
    <section className="pc-section" aria-labelledby="page-titre">
      <div className="pc-section__head pc-section__head--pink">
        <Icon name="send" size="lg" />
        <h1 className="pc-section__title" id="page-titre">Publications</h1>
        <span className="pc-section__aside">Les idées des parents</span>
      </div>
      <p className="pc-section__lead">Des moments partagés et des astuces du quotidien, écrits par des parents comme vous.</p>

      <div className="pc-toolbar">
        {user && (
          <div className="pc-chips">
            <Chip pressed={!mine} onClick={() => setMine(false)}>Toutes</Chip>
            <Chip pressed={mine} onClick={() => setMine(true)}>Mes publications</Chip>
          </div>
        )}
        {user ? (
          <button className="pc-btn pc-btn--pill" type="button" onClick={() => setCreating(true)}><Icon name="send" size="sm" /> Nouvelle publication</button>
        ) : (
          <Link className="pc-btn pc-btn--pill" to="/connexion?retour=/publications"><Icon name="user" size="sm" /> Se connecter pour partager</Link>
        )}
      </div>

      {empty && (
        <Empty>{mine ? "Vous n'avez encore rien publié. Partagez un moment quand vous le souhaitez." : 'Pas encore de publication. Revenez bientôt !'}</Empty>
      )}
      {!empty && (
        <ul className="pc-grid" aria-label="Publications" aria-busy={status === 'loading'}>
          {list.items.map((item) => <PublicationTile key={item.id} item={item} />)}
          {status === 'loading' && <TileSkeletons count={list.items.length ? 3 : 9} />}
        </ul>
      )}
      {status === 'error' && <LoadError onRetry={loadMore} />}
      <div ref={sentinel} className="pc-grid__end">
        {status === 'ready' && !done && <button className="pc-btn pc-btn--soft" type="button" onClick={loadMore}>Voir plus</button>}
        {done && list.items.length > 0 && <p className="pc-hand">Vous avez tout vu, à bientôt !</p>}
      </div>

      {openId && <PublicationModal key={openId} id={openId} onClose={closeModal} onChanged={list.reset} />}
      {creating && (
        <Modal onClose={() => setCreating(false)} labelledBy="publication-form-titre">
          <PublicationForm onCancel={() => setCreating(false)}
            onSaved={(id) => { setCreating(false); list.reset(); navigate(`/publications/${id}`, { state: { fromGrid: true } }); }} />
        </Modal>
      )}
    </section>
  );
}
