import Icon from './Icon.jsx';
import ApiImage from './ApiImage.jsx';
import { when } from '../lib/format.js';
import { Link } from '../lib/router.jsx';

// Carte d'une publication ou d'une activité (.pc-post).
// theme : pastel du titre ; icon : affichée si la photo ne charge pas ; art : illustration du site (fil d'accueil).
export default function ContentCard({ item, theme, icon, art, to, children, footer }) {
  // Pas de photo : pas de grand aplat, la carte reste courte (lecture rapide sur téléphone).
  let media = null;
  if (item.cover_image_id) {
    media = (
      <div className={`pc-post__media pc-post__media--illus pc-post__media--${theme}`}>
        <ApiImage id={item.cover_image_id} alt={item.cover_alt} fallback={<Icon name={icon} size="xl" />} />
      </div>
    );
  } else if (art) {
    media = (
      <div className={`pc-post__media pc-post__media--${theme}`}>
        <img src={art.src} alt={art.alt} width="320" height="200" loading="lazy" />
      </div>
    );
  }

  return (
    <article className="pc-post">
      <div className="pc-post__author">
        <span className="pc-avatar"><Icon name="family" size="sm" /></span>
        <div>
          <div className="pc-post__name">{item.author_name}</div>
          <div className="pc-post__meta">{when(item.created_at)}</div>
        </div>
        {item.visibility === 'private' && (
          <span className="pc-badge pc-badge--yellow"><Icon name="user" /> Privé</span>
        )}
      </div>
      {media}
      <h3 className={`pc-pill-title pc-pill-title--${theme}`}>{to ? <Link className="pc-pill-title__link" to={to}>{item.title}</Link> : item.title}</h3>
      {children}
      {footer && <div className="pc-post__actions">{footer}</div>}
    </article>
  );
}
