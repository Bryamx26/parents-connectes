import ActivityView from '../components/ActivityView.jsx';
import Icon from '../components/Icon.jsx';
import PublicationTile from '../components/PublicationTile.jsx';
import { Empty, Loading, LoadError } from '../components/States.jsx';
import { api } from '../lib/api.js';
import { useApi } from '../lib/useApi.js';
import { useAuth } from '../lib/auth.jsx';
import { useConfirm } from '../lib/confirm.jsx';
import { Link, navigate } from '../lib/router.jsx';

function LinkedPublications({ id }) {
  const list = useApi(`/publications?activity_id=${id}&limit=12`);
  return (
    <section className="pc-activity__linked" aria-labelledby="liees-titre">
      <h2 className="pc-activity__subtitle" id="liees-titre">Publications des parents</h2>
      {list.status === 'loading' && <Loading label="Chargement des publications liées" count={1} />}
      {list.status === 'error' && <LoadError onRetry={list.reload} />}
      {list.status === 'ready' && list.data.length === 0 && <Empty>Personne n'a encore raconté cette activité. Vous l'avez essayée ? Partagez votre expérience !</Empty>}
      {list.status === 'ready' && list.data.length > 0 && (
        <ul className="pc-grid">{list.data.map((p) => <PublicationTile key={p.id} item={p} />)}</ul>
      )}
    </section>
  );
}

export default function ActivityPage({ id }) {
  const { canEdit } = useAuth();
  const confirm = useConfirm();
  const activity = useApi(`/activities/${id}`);

  async function remove() {
    const ok = await confirm({ title: 'Supprimer cette activité ?', message: 'Ses étapes et toutes ses photos seront supprimées.', confirmLabel: 'Supprimer' });
    if (!ok) return;
    await api(`/activities/${id}`, { method: 'DELETE' });
    navigate('/activites');
  }

  if (activity.status === 'loading') return <Loading label="Chargement de l'activité" count={1} />;
  if (activity.status === 'error') {
    return activity.error.status === 404
      ? <Empty action={<Link className="pc-btn" to="/activites">Voir les activités</Link>}>Cette activité n'existe pas ou n'est pas visible.</Empty>
      : <LoadError onRetry={activity.reload} />;
  }

  const a = activity.data;
  return (
    <section className="pc-section" aria-labelledby="page-titre">
      <p className="pc-back"><Link to="/activites"><span className="pc-icon--flip"><Icon name="chevron-right" size="sm" /></span> Toutes les activités</Link></p>
      <ActivityView
        activity={a}
        actions={canEdit(a) && (
          <div className="pc-form__actions">
            <Link className="pc-btn pc-btn--soft" to={`/activites/${a.id}/modifier`}><Icon name="sparkle" size="sm" /> Modifier</Link>
            <button className="pc-btn pc-btn--soft" type="button" onClick={remove}><Icon name="close" size="sm" /> Supprimer</button>
          </div>
        )}
      >
        <LinkedPublications id={a.id} />
      </ActivityView>
    </section>
  );
}
