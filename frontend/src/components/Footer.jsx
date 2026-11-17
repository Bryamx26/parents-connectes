import Icon from './Icon.jsx';
import { Link } from '../lib/router.jsx';

const LINKS = [
  ['/a-propos', 'À propos'],
  ['/mentions-legales', 'Mentions légales'],
  ['/confidentialite', 'Confidentialité'],
  ['/cookies', 'Cookies'],
  ['/cgu', "Conditions d'utilisation"],
];

export default function Footer() {
  return (
    <footer className="pc-footer pc-container">
      <span className="pc-footer__deco"><Icon name="leaf" size="lg" /></span>
      <span className="pc-footer__quote">
        Aujourd'hui, des choix équilibrés pour demain ! <span style={{ color: 'var(--pc-red-500)' }}><Icon name="heart" size="sm" /></span>
      </span>
      <Icon name="smile" />
      <span className="pc-footer__brand"><Icon name="family" /> Parents Connectés</span>
      <nav className="pc-footer__nav" aria-label="Informations sur le site">
        <ul className="pc-footer__links">
          {LINKS.map(([to, label]) => <li key={to}><Link to={to}>{label}</Link></li>)}
        </ul>
      </nav>
    </footer>
  );
}
