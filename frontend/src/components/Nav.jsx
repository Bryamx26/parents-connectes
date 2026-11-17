import Icon from './Icon.jsx';
import { Link } from '../lib/router.jsx';
import { useAuth } from '../lib/auth.jsx';

export default function Nav({ path }) {
  const { user } = useAuth();
  const links = [
    { to: '/', icon: 'home', label: 'Accueil' },
    { to: '/publications', icon: 'send', label: 'Publications' },
    { to: '/activites', icon: 'puzzle', label: 'Activités' },
    { to: '/quiz', icon: 'question', label: 'Quiz' },
    { to: '/a-propos', icon: 'info', label: 'À propos', wide: true },
    { to: '/connexion', icon: 'user', label: user ? 'Compte' : 'Connexion', match: ['/connexion', '/inscription'] },
  ];
  const current = (l) => (l.match ? l.match.includes(path) : l.to === '/' ? path === '/' : path.startsWith(l.to));
  return (
    <nav className="pc-nav" aria-label="Navigation principale">
      {links.map((l) => (
        <Link key={l.to} className={`pc-nav__link${l.wide ? ' pc-nav__link--wide' : ''}`} to={l.to} aria-current={current(l) ? 'page' : undefined}>
          <Icon name={l.icon} /> {l.label}
        </Link>
      ))}
    </nav>
  );
}
