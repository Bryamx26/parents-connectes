import Icon from './Icon.jsx';
import ApiImage from './ApiImage.jsx';
import { Link } from '../lib/router.jsx';
import { ageRange } from '../lib/format.js';

// Carte d'activité à gabarit fixe : mêmes dimensions quel que soit le contenu.
// Zones de hauteur fixe (image, titre 2 lignes, badges 1 ligne, résumé 3 lignes) ;
// le surplus est coupé, le manque laisse un blanc ; l'action principale est toujours en bas.
export default function ActivityCard({ item, onEdit, onDelete }) {
  const to = `/activites/${item.id}`;
  const summary = item.description.split('\n')[0]; // premier paragraphe (pas les crédits photo)
  return (
    <article className="pc-activity-card">
      <div className="pc-activity-card__media">
        {item.cover_image_id
          ? <ApiImage id={item.cover_image_id} alt={item.cover_alt ?? ''} fallback={<Icon name="puzzle" size="xl" />} />
          : <Icon name="puzzle" size="xl" />}
        {item.visibility === 'private' && <span className="pc-badge pc-badge--yellow pc-activity-card__private"><Icon name="user" /> Privé</span>}
      </div>
      <div className="pc-activity-card__body">
        <div className="pc-activity-card__top">
          <h3 className="pc-activity-card__title" title={item.title}>{item.title}</h3>
          {onEdit && (
            <div className="pc-activity-card__tools">
              <button className="pc-icon-btn" type="button" aria-label={`Modifier « ${item.title} »`} onClick={onEdit}><Icon name="sparkle" size="sm" /></button>
              <button className="pc-icon-btn" type="button" aria-label={`Supprimer « ${item.title} »`} onClick={onDelete}><Icon name="close" size="sm" /></button>
            </div>
          )}
        </div>
        <div className="pc-activity-card__badges">
          <span className="pc-badge pc-badge--green"><Icon name="baby" /> {ageRange(item.age_min_months, item.age_max_months)}</span>
          {item.duration_minutes && <span className="pc-badge"><Icon name="clock" /> {item.duration_minutes} min</span>}
        </div>
        <p className="pc-activity-card__summary">{summary}</p>
        <p className="pc-activity-card__author">Par {item.author_name}</p>
        <Link className="pc-btn pc-btn--soft pc-activity-card__cta" to={to} aria-label={`Voir l'activité « ${item.title} »`}>
          Voir l'activité <Icon name="chevron-right" size="sm" />
        </Link>
      </div>
    </article>
  );
}
