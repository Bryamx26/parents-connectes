import Icon from './Icon.jsx';
import { Link } from '../lib/router.jsx';
import { useAuth } from '../lib/auth.jsx';

export default function Header() {
  const { user } = useAuth();
  return (
    <header className="pc-header">
      <Link className="pc-icon-btn" to="/" aria-label="Accueil"><Icon name="home" /></Link>
      <div className="pc-header__brand">
        <div className="pc-header__logo">Parents Connectés</div>
        <div className="pc-header__tagline">Des repères aujourd'hui pour un meilleur demain !</div>
      </div>
      <div className="pc-header__actions">
        <Link className="pc-icon-btn pc-header__narrow" to="/a-propos" aria-label="À propos"><Icon name="family" /></Link>
        <Link className="pc-icon-btn" to="/connexion" aria-label={user ? `Mon compte (${user.name})` : 'Se connecter'}>
          <Icon name="user" />
        </Link>
      </div>
    </header>
  );
}
