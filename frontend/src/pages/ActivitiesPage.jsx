import { useState } from 'react';
import ActivityCard from '../components/ActivityCard.jsx';
import Icon from '../components/Icon.jsx';
import { Chip } from '../components/Chip.jsx';
import { Empty, LoadError } from '../components/States.jsx';
import { api } from '../lib/api.js';
import { useApi } from '../lib/useApi.js';
import { useAuth } from '../lib/auth.jsx';
import { useConfirm } from '../lib/confirm.jsx';
import { Link, navigate } from '../lib/router.jsx';
import { AGE_BANDS } from '../lib/format.js';

export default function ActivitiesPage() {
  const { user, canEdit } = useAuth();
  const confirm = useConfirm();
  const [band, setBand] = useState(null);
  const [mine, setMine] = useState(false);
  const [error, setError] = useState(null);
  const params = new URLSearchParams({ limit: '50', sort: 'age_min_months', order: 'asc' }); // shortcut: 50 activités, pagination si le catalogue grossit
  if (band) { params.set('age_min', band.min); params.set('age_max', band.max); }
  if (mine && user) params.set('mine', 'true');
  const list = useApi(`/activities?${params}`);

  async function remove(item) {
    const ok = await confirm({ title: `Supprimer « ${item.title} » ?`, message: 'Ses étapes et toutes ses photos seront supprimées.', confirmLabel: 'Supprimer' });
    if (!ok) return;
    try {
      await api(`/activities/${item.id}`, { method: 'DELETE' });
      list.reload();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="pc-section" aria-labelledby="page-titre">
      <div className="pc-section__head pc-section__head--green">
        <Icon name="puzzle" size="lg" />
        <h1 className="pc-section__title" id="page-titre">Activités</h1>
        <span className="pc-section__aside">Jouer ensemble, sans écran</span>
      </div>
      <p className="pc-section__lead">Des idées simples et des tutoriels pas à pas, classés par âge.</p>

      <div className="pc-toolbar">
        <div className="pc-chips" role="group" aria-label="Filtrer par âge">
          <Chip pressed={!band} onClick={() => setBand(null)}>Tous les âges</Chip>
          {AGE_BANDS.map((b) => <Chip key={b.label} pressed={band?.label === b.label} onClick={() => setBand(b)}>{b.label}</Chip>)}
          {user && <Chip pressed={mine} onClick={() => setMine(!mine)}>Mes activités</Chip>}
        </div>
        {user ? (
          <Link className="pc-btn pc-btn--pill" to="/activites/nouvelle"><Icon name="send" size="sm" /> Nouvelle activité</Link>
        ) : (
          <Link className="pc-btn pc-btn--pill" to="/connexion?retour=/activites"><Icon name="user" size="sm" /> Se connecter pour partager</Link>
        )}
      </div>
      {error && <p className="pc-alert" role="alert"><Icon name="question" /> {error}</p>}

      <div className="pc-section__list">
        {list.status === 'loading' && !list.data && (
          <div className="pc-activity-grid" aria-busy="true" aria-label="Chargement des activités">
            {[0, 1, 2].map((i) => <div key={i} className="pc-activity-card pc-activity-card--skeleton" />)}
          </div>
        )}
        {list.status === 'error' && <LoadError onRetry={list.reload} />}
        {list.data?.length === 0 && (
          <Empty>{band ? `Pas encore d'activité pour ${band.label}. Essayez une autre tranche d'âge, ou proposez la vôtre !` : "Pas encore d'activité. Proposez la première !"}</Empty>
        )}
        {list.data?.length > 0 && (
          <div className="pc-activity-grid" aria-busy={list.status === 'loading'}>
            {list.data.map((item) => (
              <ActivityCard key={item.id} item={item}
                onEdit={canEdit(item) ? () => navigate(`/activites/${item.id}/modifier`) : undefined}
                onDelete={() => remove(item)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
