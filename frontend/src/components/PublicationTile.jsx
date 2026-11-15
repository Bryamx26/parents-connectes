import Icon from './Icon.jsx';
import ApiImage from './ApiImage.jsx';
import { Link } from '../lib/router.jsx';

const THEMES = ['pink', 'sky', 'yellow', 'green', 'lavender'];

// Vignette carrée : photo de couverture recadrée, ou titre sur pastel quand il n'y a pas de photo.
// Le titre apparaît au survol et au focus clavier ; il reste toujours le nom accessible du lien.
export default function PublicationTile({ item }) {
  const theme = THEMES[item.id % THEMES.length];
  return (
    <li>
      <Link className={`pc-tile pc-tile--${theme}`} to={`/publications/${item.id}`} state={{ fromGrid: true }}>
        {item.cover_image_id ? (
          <>
            <ApiImage id={item.cover_image_id} alt="" fallback={<span className="pc-tile__text">{item.title}</span>} />
            <span className="pc-tile__overlay">{item.title}</span>
          </>
        ) : (
          <span className="pc-tile__text">{item.title}</span>
        )}
        {item.visibility === 'private' && <span className="pc-tile__badge" aria-label="Privé"><Icon name="user" size="sm" /></span>}
      </Link>
    </li>
  );
}

export function TileSkeletons({ count = 6 }) {
  return Array.from({ length: count }, (_, i) => <li key={`s${i}`} className="pc-tile pc-tile--skeleton" aria-hidden="true" />);
}
