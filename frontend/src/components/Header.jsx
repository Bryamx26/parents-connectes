import Icon from './Icon.jsx';
import { Link } from '../lib/router.jsx';

// Accueil et compte sont dans la barre de navigation : l'en-tête ne garde que le logo (lien vers l'accueil)
// et, en mobile seulement, À propos (la barre basse est limitée à 5 liens).
export default function Header() {
  return (
    <header className="pc-header">
      <Link className="pc-header__brand" to="/">
        <span className="pc-header__logo">Parents Connectés</span>
        <span className="pc-header__tagline">Des repères aujourd'hui pour un meilleur demain !</span>
      </Link>
      <div className="pc-header__actions">
        <Link className="pc-icon-btn pc-header__narrow" to="/a-propos" aria-label="À propos"><Icon name="info" /></Link>
      </div>
    </header>
  );
}
